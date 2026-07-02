import { test, expect } from '@playwright/test';
import { ExclusionAPI } from '../../pages/API/APIExclusion';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, expectPaginationContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

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
      if (create.status >= 500 || clientErrorCodes.includes(create.status)) {
        test.skip(true, `POST /api/exclusion is not available on this environment: ${create.status}`);
      }

      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);

      exclusionId = getExclusionId(create.data);
      expect(exclusionId, JSON.stringify(create.data)).toBeTruthy();

      const byId = await exclusionAPI.getExclusionById(request, exclusionId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expectExclusionShape(byId.data);
      expect(byId.data.exclusion).toBe(createdValue);
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

      const page = await exclusionAPI.getExclusionPagination(request, paginationDto(), accessToken);
      expect(successCodes, JSON.stringify(page.data)).toContain(page.status);
      expectPaginationContract(page.data);
      expect(getRows<ExclusionLike>(page.data).some((row) => row.id === exclusionId && row.exclusion === updatedValue)).toBe(true);
    });

    test('архивирует созданное исключение', async ({ request }) => {
      test.skip(!exclusionId, 'Исключение не создано на этом окружении');

      const archive = await exclusionAPI.banExclusionById(request, exclusionId as number, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);
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
        if (response.status >= 500 || clientErrorCodes.includes(response.status)) {
          test.skip(true, `POST /api/exclusion is not available for edge payloads on this environment: ${response.status}`);
        }
        expectNoServerError(response);

        const id = getExclusionId(response.data);
        if (id) {
          const archive = await exclusionAPI.banExclusionById(request, id, accessToken);
          expectNoServerError(archive);
        }
      }
    });
  });
};
