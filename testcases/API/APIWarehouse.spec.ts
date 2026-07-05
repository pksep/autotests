import { test, expect } from '@playwright/test';
import { WarehouseAPI } from '../../pages/API/APIWarehouse';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectClientError,
  expectEndpointReached,
  expectNoServerError,
  expectPaginationContract,
  expectSortedDescendingByKnownDate,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const warehouseAPI = new WarehouseAPI(null as any);

const entityTypes = ['product', 'cbed', 'detal', 'material'] as const;
type WarehouseEntityType = (typeof entityTypes)[number];

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
      accessToken = await getAuthToken(request);
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

    test('пагинация остатков поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await warehouseAPI.getWarehouseRemains(
        request,
        remainsDto('product', { page: 0, pageSize: 1 }),
        accessToken,
      );
      expectNoServerError(firstPage);
      if (!clientErrorCodes.includes(firstPage.status)) {
        expect(successCodes).toContain(firstPage.status);
        expectPaginationContract(firstPage.data, 1);
      }

      const farPage = await warehouseAPI.getWarehouseRemains(
        request,
        remainsDto('product', { page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
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
          expectSortedDescendingByKnownDate(getRows(response.data));
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
      accessToken = await getAuthToken(request);
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
      expectClientError(remains);

      const revision = await warehouseAPI.getRevisionHistory(request, revisionDto('invalid-type'), accessToken);
      expectClientError(revision);

      const byParents = await warehouseAPI.getNeedsByParents(request, 'detal', 999999999, accessToken);
      expectNoServerError(byParents);

      const byParent = await warehouseAPI.getNeedsByParent(
        request,
        { id: 999999999, type: 'detal', parentId: 999999999, parentType: 'product' },
        accessToken,
      );
      expectNoServerError(byParent);

      const complitAssembly = await captureApiResult(() => warehouseAPI.complitAssembly(request, 999999999, 'product', accessToken));
      expectEndpointReached(complitAssembly);

      const resetInSets = await captureApiResult(() => warehouseAPI.resetInSets(request, accessToken));
      expectEndpointReached(resetInSets);
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

      expectClientError(response);
    });

    test('отрицательные и дробные остатки для несуществующего объекта отклоняются без 5xx', async ({ request }) => {
      for (const remains of [-1, 0.5, Number.MAX_SAFE_INTEGER]) {
        const response = await warehouseAPI.updateWarehouseItem(
          request,
          {
            id: 999999999,
            entityId: 999999999,
            entityType: 'product',
            remains,
          },
          accessToken,
        );

        expectClientError(response);
      }
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

      expectClientError(response);
    });
  });
};
