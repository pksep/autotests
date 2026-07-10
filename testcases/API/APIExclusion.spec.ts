import { test, expect } from '@playwright/test';
import { ExclusionAPI } from '../../pages/API/APIExclusion';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, expectPaginationContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ExclusionLike = Record<string, any>;

const exclusionAPI = new ExclusionAPI(null);

const paginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  entityType: 'product',
  ...overrides,
});

const exclusionPayload = (suffix = uniqueApiSuffix('exclusion'), overrides: Record<string, unknown> = {}) => ({
  exclusion: `API-EXCLUSION-${suffix}`,
  exclusionType: 'article',
  entityType: 'product',
  ...overrides,
});

const getExclusionId = (data: any): number | undefined => {
  const value = data?.id ?? data?.exclusion_id ?? data?.exclusionId;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : undefined;
};

const expectExclusionShape = (data: ExclusionLike) => {
  expect(data).toBeTruthy();
  expect(typeof data.id, JSON.stringify(data)).toBe('number');
  expect(data.exclusion, JSON.stringify(data)).toBeTruthy();
  expect(data.exclusionType, JSON.stringify(data)).toBeTruthy();
  expect(data.entityType, JSON.stringify(data)).toBeTruthy();
};

const findExclusionInPagination = async (
  request: any,
  exclusionId: number,
  exclusion: string,
  accessToken?: string,
): Promise<ExclusionLike | undefined> => {
  const response = await eventually(async () => {
    const page = await exclusionAPI.getExclusionPagination(
      request,
      paginationDto({ searchString: exclusion }),
      accessToken,
    );
    expectNoServerError(page);
    return page;
  }, (page) => getRows<ExclusionLike>(page.data).some((row) => row.id === exclusionId && row.exclusion === exclusion));

  return response ? getRows<ExclusionLike>(response.data).find((row) => row.id === exclusionId) : undefined;
};

const waitForExclusionAbsentFromPagination = async (
  request: any,
  exclusionId: number,
  exclusion: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const page = await exclusionAPI.getExclusionPagination(
      request,
      paginationDto({ searchString: exclusion }),
      accessToken,
    );
    expectNoServerError(page);
    return page;
  }, (page) => !getRows<ExclusionLike>(page.data).some((row) => row.id === exclusionId));

  return Boolean(response);
};

export const runExclusionAPINew = () => {
  logger.info('Starting Exclusion API coverage suite');

  test.describe.serial('Exclusion API: жизненный цикл исключения', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;
    let exclusionId: number | undefined;
    let createdValue = '';
    let updatedValue = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (exclusionId) {
        const archive = await exclusionAPI.banExclusionById(request, exclusionId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('создает исключение и читает его по id', async ({ request }) => {
      const suffix = uniqueApiSuffix('exclusion');
      createdValue = `API-EXCLUSION-${suffix}`;
      updatedValue = `API-EXCLUSION-UPDATED-${suffix}`;

      const create = await exclusionAPI.createExclusion(request, exclusionPayload(suffix), accessToken);
      expectNoServerError(create);
      if (clientErrorCodes.includes(create.status)) {
        test.skip(true, `POST /api/exclusion is not available on this environment: ${create.status}`);
      }

      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);

      exclusionId = getExclusionId(create.data);
      expect(exclusionId, JSON.stringify(create.data)).toBeTruthy();

      const byId = await exclusionAPI.getExclusionById(request, exclusionId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expectExclusionShape(byId.data);
      expect(byId.data.exclusion).toBe(createdValue);

      const createdInPage = await findExclusionInPagination(request, exclusionId as number, createdValue, accessToken);
      expect(createdInPage, `Exclusion ${createdValue} was not found in pagination after create`).toBeTruthy();
      expect(createdInPage?.id).toBe(exclusionId);
    });

    test('обновляет исключение и видит его в пагинации', async ({ request }) => {
      test.skip(!exclusionId, 'Исключение не создано на этом окружении');

      const update = await exclusionAPI.updateExclusion(
        request,
        exclusionId as number,
        { exclusion: updatedValue, exclusionType: 'article' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);

      const updatedInPage = await findExclusionInPagination(request, exclusionId as number, updatedValue, accessToken);
      expect(updatedInPage, `Exclusion ${updatedValue} was not found in pagination after update`).toBeTruthy();
      expect(updatedInPage?.id).toBe(exclusionId);

      const byId = await exclusionAPI.getExclusionById(request, exclusionId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expect(byId.data?.exclusion, JSON.stringify(byId.data)).toBe(updatedValue);
    });

    test('архивирует созданное исключение и проверяет отсутствие в активной выдаче', async ({ request }) => {
      test.skip(!exclusionId, 'Исключение не создано на этом окружении');
      const currentExclusionId = exclusionId as number;

      const archive = await exclusionAPI.banExclusionById(request, currentExclusionId, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);
      expect(archive.data?.ban, JSON.stringify(archive.data)).toBe(true);

      expect(await waitForExclusionAbsentFromPagination(request, currentExclusionId, updatedValue, accessToken)).toBe(true);

      const byId = await exclusionAPI.getExclusionById(request, currentExclusionId, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
        expect(byId.data?.ban, JSON.stringify(byId.data)).toBe(true);
      }

      exclusionId = undefined;
    });
  });

  test.describe('Exclusion API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу исключений со стабильной структурой', async ({ request }) => {
      const response = await exclusionAPI.getExclusionPagination(request, paginationDto(), accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectPaginationContract(response.data);
      }
    });

    test('обрабатывает неизвестный id без 5xx', async ({ request }) => {
      const response = await exclusionAPI.getExclusionById(request, 999999999, accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      }
    });

    test('невалидные payload и no-auth не проходят успешно', async ({ request }) => {
      const invalidCreate = await exclusionAPI.createExclusion(
        request,
        exclusionPayload(uniqueApiSuffix('invalid'), { exclusion: '', exclusionType: 'unknown', entityType: 'unknown' }),
        accessToken,
      );
      expectClientError(invalidCreate);

      const noAuth = await exclusionAPI.createExclusion(request, exclusionPayload(uniqueApiSuffix('noauth')));
      expectClientError(noAuth);
    });

    test('защитные строки в exclusion не приводят к 5xx, если endpoint доступен', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const exclusion of cases) {
        const response = await exclusionAPI.createExclusion(
          request,
          exclusionPayload(uniqueApiSuffix('edge'), { exclusion }),
          accessToken,
        );
        expectNoServerError(response);
        if (clientErrorCodes.includes(response.status)) {
          test.skip(true, `POST /api/exclusion is not available for edge payloads on this environment: ${response.status}`);
        }

        const id = getExclusionId(response.data);
        if (id) {
          const archive = await exclusionAPI.banExclusionById(request, id, accessToken);
          expectNoServerError(archive);
        }
      }
    });
  });
};
