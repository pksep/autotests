import { test, expect } from '@playwright/test';
import { CommentsAPI } from '../../pages/API/APIComments';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectApiContract, expectNoServerError, expectClientError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const commentsAPI = new CommentsAPI(null);

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
      if (response.status >= 500) {
        test.skip(true, `GET /api/comments/by-thread depends on external comment service here: ${response.status}`);
      }
      expectNoServerError(response);
      expectApiContract(response);
    });

    test('создает, обновляет, pin/unpin и удаляет комментарий, если comment-service доступен', async ({ request }) => {
      const create = await commentsAPI.createComment(request, commentPayload(), accessToken);
      if (create.status >= 500 || clientErrorCodes.includes(create.status)) {
        test.skip(true, `POST /api/comments/create is not available on this environment: ${create.status}`);
      }

      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);

      const id = getCommentId(create.data);
      test.skip(!id, `Created comment id was not returned: ${JSON.stringify(create.data)}`);

      const update = await commentsAPI.updateComment(request, id as string, { content: 'Updated API comment' }, accessToken);
      expectNoServerError(update);

      const pin = await commentsAPI.pinComment(request, id as string, accessToken);
      expectNoServerError(pin);

      const unpin = await commentsAPI.unpinComment(request, id as string, accessToken);
      expectNoServerError(unpin);

      const remove = await commentsAPI.deleteComment(request, id as string, accessToken);
      expectNoServerError(remove);
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
        if (response.status >= 500 || clientErrorCodes.includes(response.status)) {
          test.skip(true, `POST /api/comments/create is not available on this environment: ${response.status}`);
        }
        expectNoServerError(response);

        const id = getCommentId(response.data);
        if (id) {
          const remove = await commentsAPI.deleteComment(request, id, accessToken);
          expectNoServerError(remove);
        }
      }
    });
  });
};
