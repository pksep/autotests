import { test, expect } from '@playwright/test';
import { CommentsAPI } from '../../pages/API/APIComments';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectApiContract, expectNoServerError, expectClientError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const commentsAPI = new CommentsAPI(null);

type CommentLike = Record<string, any>;

const commentPayload = (overrides: Record<string, unknown> = {}) => ({
  content: `API comment ${uniqueApiSuffix('comment')}`,
  entityType: 'cbed',
  entityId: 999999999,
  documents: [],
  ...overrides,
});

const getCommentId = (data: any): string | undefined => {
  const value = data?.id ?? data?._id ?? data?.comment_id ?? data?.commentId;
  return value ? String(value) : undefined;
};

const collectComments = (data: unknown): CommentLike[] => {
  const rows = getRows<CommentLike>(data);
  const stack = rows.length ? [...rows] : data && typeof data === 'object' ? [data as CommentLike] : [];
  const result: CommentLike[] = [];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    if (getCommentId(current)) result.push(current);

    for (const key of ['replies', 'children', 'comments', 'data', 'rows']) {
      const child = current[key];
      if (Array.isArray(child)) {
        stack.push(...child.filter((item): item is CommentLike => Boolean(item && typeof item === 'object')));
      } else if (child && typeof child === 'object') {
        stack.push(child as CommentLike);
      }
    }
  }

  return result;
};

const findCommentById = (data: unknown, id: string): CommentLike | undefined =>
  collectComments(data).find((comment) => getCommentId(comment) === id);

const expectCommentContent = (comment: CommentLike | undefined, content: string, context: unknown) => {
  expect(comment, JSON.stringify(context)).toBeTruthy();
  expect(comment?.content, JSON.stringify(comment)).toBe(content);
};

export const runCommentsAPINew = () => {
  logger.info('Starting Comments API coverage suite');

  test.describe('Comments API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает комментарии по entity без серверных ошибок', async ({ request }) => {
      const response = await commentsAPI.getByEntity(request, 'cbed', 999999999, 0, 5, accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
      }
    });

    test('обрабатывает неизвестный thread без падения suite', async ({ request }) => {
      const response = await commentsAPI.getByThread(request, `api-thread-${uniqueApiSuffix('missing')}`, accessToken);
      expectNoServerError(response);
      expectApiContract(response);
    });

    test('создает комментарий, проверяет чтение, update, pin/unpin и удаление', async ({ request }) => {
      const suffix = uniqueApiSuffix('comment-flow');
      const entityId = Number(String(Date.now()).slice(-9));
      const content = `API comment lifecycle ${suffix}`;
      const updatedContent = `API comment lifecycle updated ${suffix}`;
      let id: string | undefined;
      let deleted = false;

      try {
        const create = await commentsAPI.createComment(
          request,
          commentPayload({ content, entityId }),
          accessToken,
        );
        expectNoServerError(create);
        if (clientErrorCodes.includes(create.status)) {
          test.skip(true, `POST /api/comments/create is not available on this environment: ${create.status}`);
        }

        expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
        id = getCommentId(create.data);
        test.skip(!id, `Created comment id was not returned: ${JSON.stringify(create.data)}`);
        expectCommentContent(create.data, content, create.data);

        const createdInEntity = await eventually(async () => {
          const response = await commentsAPI.getByEntity(request, 'cbed', entityId, 0, 10, accessToken);
          expectNoServerError(response);
          return response;
        }, (response) => Boolean(findCommentById(response.data, id as string)));
        expectCommentContent(findCommentById(createdInEntity?.data, id as string), content, createdInEntity?.data);

        const threadId = String(create.data?.thread_id ?? create.data?.threadId ?? '');
        if (threadId) {
          const createdInThread = await commentsAPI.getByThread(request, threadId, accessToken);
          expectNoServerError(createdInThread);
          if (!clientErrorCodes.includes(createdInThread.status)) {
            expect(successCodes, JSON.stringify(createdInThread.data)).toContain(createdInThread.status);
            expectCommentContent(findCommentById(createdInThread.data, id as string), content, createdInThread.data);
          }
        }

        const update = await commentsAPI.updateComment(request, id as string, { content: updatedContent }, accessToken);
        expectNoServerError(update);
        expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
        expectCommentContent(update.data, updatedContent, update.data);

        const updatedInEntity = await eventually(async () => {
          const response = await commentsAPI.getByEntity(request, 'cbed', entityId, 0, 10, accessToken);
          expectNoServerError(response);
          return response;
        }, (response) => findCommentById(response.data, id as string)?.content === updatedContent);
        expectCommentContent(findCommentById(updatedInEntity?.data, id as string), updatedContent, updatedInEntity?.data);

        const pin = await commentsAPI.pinComment(request, id as string, accessToken);
        expectNoServerError(pin);
        expect(successCodes, JSON.stringify(pin.data)).toContain(pin.status);
        expect(pin.data?.is_pinned ?? pin.data?.isPinned, JSON.stringify(pin.data)).toBe(true);

        const unpin = await commentsAPI.unpinComment(request, id as string, accessToken);
        expectNoServerError(unpin);
        expect(successCodes, JSON.stringify(unpin.data)).toContain(unpin.status);
        expect(unpin.data?.is_pinned ?? unpin.data?.isPinned, JSON.stringify(unpin.data)).toBe(false);

        const remove = await commentsAPI.deleteComment(request, id as string, accessToken);
        expectNoServerError(remove);
        expect(successCodes, JSON.stringify(remove.data)).toContain(remove.status);
        deleted = true;

        const afterDelete = await eventually(async () => {
          const response = await commentsAPI.getByEntity(request, 'cbed', entityId, 0, 10, accessToken);
          expectNoServerError(response);
          return response;
        }, (response) => !findCommentById(response.data, id as string));
        expect(findCommentById(afterDelete?.data, id as string), JSON.stringify(afterDelete?.data)).toBeUndefined();
      } finally {
        if (id && !deleted) {
          const cleanup = await commentsAPI.deleteComment(request, id, accessToken);
          expectNoServerError(cleanup);
        }
      }
    });

    test('мутации без авторизации не проходят успешно', async ({ request }) => {
      const create = await commentsAPI.createComment(request, commentPayload());
      expectClientError(create);
    });

    test('защитные payload не приводят к 5xx, если endpoint доступен', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const content of cases) {
        const response = await commentsAPI.createComment(request, commentPayload({ content }), accessToken);
        expectNoServerError(response);
        if (clientErrorCodes.includes(response.status)) {
          test.skip(true, `POST /api/comments/create is not available on this environment: ${response.status}`);
        }

        const id = getCommentId(response.data);
        if (id) {
          const remove = await commentsAPI.deleteComment(request, id, accessToken);
          expectNoServerError(remove);
        }
      }
    });
  });
};
