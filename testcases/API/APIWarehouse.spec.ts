import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { WarehouseAPI } from '../../pages/API/APIWarehouse';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const authAPI = new AuthAPI();
const warehouseAPI = new WarehouseAPI(null as any);

const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;

const entityTypes = ['product', 'cbed', 'detal', 'material'] as const;
type WarehouseEntityType = (typeof entityTypes)[number];

const extractAccessToken = (data: any): string | undefined => {
  if (!data || typeof data === 'string') return undefined;
  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

const getRows = (data: unknown): ApiRow[] => {
  if (Array.isArray(data)) return data as ApiRow[];
  if (data && typeof data === 'object' && Array.isArray((data as any).rows)) return (data as any).rows;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

const getCount = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const value = (data as any).count ?? (data as any).total;
  return typeof value === 'number' ? value : undefined;
};

const getEntityId = (row: ApiRow | undefined): number | undefined => {
  if (!row) return undefined;
  const value =
    row.entity_id ??
    row.entityId ??
    row.object_id ??
    row.objectId ??
    row.izd_id ??
    row.izdId ??
    row.id;

  return Number.isFinite(Number(value)) ? Number(value) : undefined;
};

const expectNoServerError = (response: ApiResult) => {
  expect(serverErrorCodes, JSON.stringify(response.data)).not.toContain(response.status);
};

const expectNotSuccessful = (response: ApiResult) => {
  expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
  expectNoServerError(response);
};

const remainsDto = (entityType: WarehouseEntityType | string, overrides: Record<string, unknown> = {}) => ({
  page: 0,
  entityId: null,
  searchString: '',
  entityType,
  ...overrides,
});

const revisionDto = (entityType: WarehouseEntityType | string, overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  entityType,
  ...overrides,
});

const findFirstRemain = async (
  request: any,
  accessToken?: string,
): Promise<{ type: WarehouseEntityType; row: ApiRow; id: number } | undefined> => {
  for (const type of entityTypes) {
    const response = await warehouseAPI.getWarehouseRemains(request, remainsDto(type), accessToken);
    expectNoServerError(response);

    const row = getRows(response.data).find((item) => getEntityId(item));
    const id = getEntityId(row);
    if (row && id) return { type, row, id };
  }

  return undefined;
};

export const runWarehouseAPINew = () => {
  logger.info('Starting Warehouse/Sclad API coverage suite');

  test.describe('Warehouse API: остатки, ревизии и потребности', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstRemain: { type: WarehouseEntityType; row: ApiRow; id: number } | undefined;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL,
      );

      expect(loginResponse.status).toBe(201);
      accessToken = extractAccessToken(loginResponse.data);
      expect(accessToken).toBeTruthy();

      firstRemain = await findFirstRemain(request, accessToken);
    });

    test('возвращает остатки по типам сущностей без серверных ошибок', async ({ request }) => {
      for (const type of entityTypes) {
        const response = await warehouseAPI.getRemainsByEntityType(request, type, accessToken);
        expectNoServerError(response);

        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
        }
      }
    });

    test('возвращает пагинацию остатков со стабильной структурой', async ({ request }) => {
      for (const type of entityTypes) {
        const response = await warehouseAPI.getWarehouseRemains(request, remainsDto(type), accessToken);
        expectNoServerError(response);

        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
        }
      }
    });

    test('пагинация остатков поддерживает пустой поиск', async ({ request }) => {
      const response = await warehouseAPI.getWarehouseRemains(
        request,
        remainsDto('product', { searchString: 'api-sclad-no-match-999999999' }),
        accessToken,
      );

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
        expect(getRows(response.data)).toEqual([]);
      }
    });

    test('возвращает историю ревизий без серверных ошибок', async ({ request }) => {
      for (const type of entityTypes) {
        const response = await warehouseAPI.getRevisionHistory(request, revisionDto(type), accessToken);
        expectNoServerError(response);

        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
        }
      }
    });

    test('возвращает флаги дефицитов без серверных ошибок', async ({ request }) => {
      const response = await warehouseAPI.getDeficitFlags(request, accessToken);

      expect(response.status).toBe(200);
      expectNoServerError(response);
      expect(response.data, JSON.stringify(response.data)).toBeTruthy();
      expect(typeof response.data, JSON.stringify(response.data)).toBe('object');
    });

    test('проверяет потребности по найденному складскому объекту', async ({ request }) => {
      test.skip(!firstRemain, 'No warehouse remains are available for needs checks on this environment.');

      const needsByParents = await warehouseAPI.getNeedsByParents(
        request,
        firstRemain!.type,
        firstRemain!.id,
        accessToken,
      );
      expectNoServerError(needsByParents);
      if (!clientErrorCodes.includes(needsByParents.status)) {
        expect(successCodes).toContain(needsByParents.status);
      }

      const byParent = await warehouseAPI.getNeedsByParent(
        request,
        {
          id: firstRemain!.id,
          type: firstRemain!.type,
          parentId: firstRemain!.id,
          parentType: firstRemain!.type,
        },
        accessToken,
      );
      expectNoServerError(byParent);
    });
  });

  test.describe('Warehouse API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL,
      );

      expect(loginResponse.status).toBe(201);
      accessToken = extractAccessToken(loginResponse.data);
      expect(accessToken).toBeTruthy();
    });

    test('защитные searchString payload не приводят к 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const remains = await warehouseAPI.getWarehouseRemains(
          request,
          remainsDto('product', { searchString }),
          accessToken,
        );
        expectNoServerError(remains);

        const revisions = await warehouseAPI.getRevisionHistory(
          request,
          revisionDto('product', { searchString }),
          accessToken,
        );
        expectNoServerError(revisions);
      }
    });

    test('невалидные типы и id обрабатываются без серверных ошибок', async ({ request }) => {
      const remains = await warehouseAPI.getWarehouseRemains(request, remainsDto('invalid-type'), accessToken);
      expectNotSuccessful(remains);

      const revision = await warehouseAPI.getRevisionHistory(request, revisionDto('invalid-type'), accessToken);
      expectNotSuccessful(revision);

      const byParents = await warehouseAPI.getNeedsByParents(request, 'detal', 999999999, accessToken);
      expectNoServerError(byParents);

      const byParent = await warehouseAPI.getNeedsByParent(
        request,
        { id: 999999999, type: 'detal', parentId: 999999999, parentType: 'product' },
        accessToken,
      );
      expectNoServerError(byParent);
    });

    test('невалидная ревизия остатков отклоняется без серверных ошибок', async ({ request }) => {
      const response = await warehouseAPI.updateWarehouseItem(
        request,
        {
          id: 999999999,
          entityId: 999999999,
          entityType: 'invalid-type',
          remains: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
        },
        accessToken,
      );

      expectNotSuccessful(response);
    });

    test('запросы без авторизации не дают успешную мутацию', async ({ request }) => {
      const response = await warehouseAPI.updateWarehouseItem(
        request,
        {
          id: 999999999,
          entityId: 999999999,
          entityType: 'product',
          remains: 1,
        },
      );

      expectNotSuccessful(response);
    });
  });
};
