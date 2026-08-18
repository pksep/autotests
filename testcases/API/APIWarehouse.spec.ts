import { test, expect } from '@playwright/test';
import { WarehouseAPI } from '../../pages/API/APIWarehouse';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectApiContract,
  expectClientError,
  expectEndpointReached,
  expectNoServerError,
  expectPaginationContract,
  expectSortedDescendingByKnownDate,
  getCount,
  getRows,
  serverErrorCodes,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { expectNonNegativeQuantities } from '../../lib/helpers/APIDataInvariants';
import {
  arrayOf,
  paginationOf,
  warehouseRemainResponseSchema,
} from '../../lib/helpers/APIContractSchemas';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const warehouseAPI = new WarehouseAPI(null as any);
const materialsAPI = new MaterialsAPI(null as any);

const hasNoServerError = (response: ApiResult) => !serverErrorCodes.includes(response.status);

const entityTypes = ['product', 'cbed', 'detal', 'material'] as const;
type WarehouseEntityType = (typeof entityTypes)[number];

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

const typeCharacteristics = () => ({
  length: { edizmId: 6, znach: null, shortName: 'mm' },
  width: { edizmId: 6, znach: null, shortName: 'mm' },
  height: { edizmId: 6, znach: null, shortName: 'mm' },
  wallThickness: { edizmId: 6, znach: null, shortName: 'mm' },
  outsideDiameter: { edizmId: 6, znach: null, shortName: 'mm' },
  thickness: { edizmId: 6, znach: null, shortName: 'mm' },
  areaCrossSectional: { edizmId: 8, znach: null, shortName: 'm2' },
});

const materialCharacteristics = () => ({
  density: { used: true, znach: 8, edizmId: 9, shortName: 'kg/m3' },
  length: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  width: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  height: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  wallThickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  outsideDiameter: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  thickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  areaCrossSectional: { used: false, znach: 0, edizmId: 8, shortName: 'm2' },
});

const materialPayload = (suffix: string, rootParentId: number, subtypeMaterialId: number) => ({
  id: undefined,
  name: `API Warehouse Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created by Warehouse API autotest ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Warehouse Material Alias ${suffix}`, default: true }],
});

const waitForWarehouseRemains = async (
  request: any,
  dto: Record<string, unknown>,
  accessToken?: string,
): Promise<ApiResult> => {
  let lastResponse: ApiResult | undefined;
  let lastError: Error | undefined;

  const response = await eventually(async () => {
    try {
      lastResponse = await warehouseAPI.getWarehouseRemains(request, dto, accessToken);
      lastError = undefined;
      return lastResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      return { status: 0, data: { message: lastError.message } };
    }
  }, (response) => response.status > 0 && hasNoServerError(response), { attempts: 10, intervalMs: 700 });

  if (response) return response;
  if (lastResponse) return lastResponse;
  throw lastError ?? new Error(`Warehouse remains did not return a response for dto: ${JSON.stringify(dto)}`);
};

const findMaterialByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getMaterialsPagination(
      request,
      { page: 0, instans: 1, searchString: name, typeMaterialId: null, subtypeMaterialId: null, filterByAttention: false, filterByTime: true },
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

const createMaterialRemainFixture = async (request: any, accessToken?: string) => {
  const suffix = uniqueApiSuffix('warehouse');
  const typeResponse = await materialsAPI.createTypeMaterial(
    request,
    { name: `API Warehouse Type Material ${suffix}`, characteristics: typeCharacteristics(), instance_type: 1 },
    accessToken,
  );
  expectNoServerError(typeResponse);
  expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
  const typeId = Number(typeResponse.data?.id);
  expect(typeId, JSON.stringify(typeResponse.data)).toBeGreaterThan(0);

  const subtypeResponse = await materialsAPI.createSubtypeMaterial(
    request,
    { name: `API Warehouse Subtype Material ${suffix}`, density: 8, id: null, instance_type: 1, parentMaterialIds: [typeId] },
    accessToken,
  );
  expectNoServerError(subtypeResponse);
  expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
  const subtypeId = Number(subtypeResponse.data?.id);
  expect(subtypeId, JSON.stringify(subtypeResponse.data)).toBeGreaterThan(0);

  const payload = materialPayload(suffix, typeId, subtypeId);
  const createMaterial = await materialsAPI.createAndUpdateMaterial(request, payload, accessToken);
  expectNoServerError(createMaterial);
  expect(successCodes, JSON.stringify(createMaterial.data)).toContain(createMaterial.status);

  const material = await findMaterialByName(request, payload.name, accessToken);
  expect(material, `Material ${payload.name} was not found after create`).toBeTruthy();
  const materialId = Number(createMaterial.data?.id ?? material!.id);
  expect(materialId, JSON.stringify(createMaterial.data)).toBeGreaterThan(0);

  const revision = await warehouseAPI.updateWarehouseItem(
    request,
    { entityId: materialId, entityType: 'material', quantity: 1, userId: Number(API_CONST.API_TEST_USER_ID) },
    accessToken,
  );
  expectNoServerError(revision);
  expect(successCodes, JSON.stringify(revision.data)).toContain(revision.status);

  return { typeId, subtypeId, materialId, materialName: payload.name };
};

export const runWarehouseAPINew = () => {
  logger.info('Starting Warehouse/Sclad API coverage suite');

  test.describe('Warehouse API: остатки, ревизии и потребности', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstRemain: { type: WarehouseEntityType; row: ApiRow; id: number } | undefined;
    let materialFixture: { typeId?: number; subtypeId?: number; materialId?: number } = {};

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      materialFixture = await createMaterialRemainFixture(request, accessToken);
      firstRemain = { type: 'material', row: { id: materialFixture.materialId }, id: materialFixture.materialId as number };
    });

    test.afterAll(async ({ request }) => {
      if (materialFixture.materialId) {
        const archiveMaterial = await materialsAPI.banMaterial(request, materialFixture.materialId, accessToken);
        expectNoServerError(archiveMaterial);
      }
      if (materialFixture.subtypeId) {
        const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, materialFixture.subtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }
      if (materialFixture.typeId) {
        const archiveType = await materialsAPI.removeTypeMaterial(request, materialFixture.typeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('возвращает остатки по типам сущностей без серверных ошибок', async ({ request }) => {
      for (const type of entityTypes) {
        const response = await warehouseAPI.getRemainsByEntityType(request, type, accessToken);
        expectNoServerError(response);

        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expectApiContract(response, { shape: 'array', schema: arrayOf(warehouseRemainResponseSchema) });
          expectNonNegativeQuantities(getRows<ApiRow>(response.data));
        }
      }
    });

    test('возвращает пагинацию остатков со стабильной структурой', async ({ request }) => {
      for (const type of entityTypes) {
        const response = await waitForWarehouseRemains(request, remainsDto(type), accessToken);
        expectNoServerError(response);

        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expectApiContract(response, { shape: 'pagination', schema: paginationOf(warehouseRemainResponseSchema) });
          expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
          expectNonNegativeQuantities(getRows<ApiRow>(response.data));
        }
      }
    });

    test('пагинация остатков поддерживает пустой поиск', async ({ request }) => {
      const response = await waitForWarehouseRemains(
        request,
        remainsDto('product', { searchString: 'api-sclad-no-match-999999999' }),
        accessToken,
      );

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expectApiContract(response, { shape: 'pagination', schema: paginationOf(warehouseRemainResponseSchema) });
        expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
        expect(getRows(response.data)).toEqual([]);
      }
    });

    test('пагинация остатков поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await waitForWarehouseRemains(
        request,
        remainsDto('product', { page: 0, pageSize: 1 }),
        accessToken,
      );
      expectNoServerError(firstPage);
      if (!clientErrorCodes.includes(firstPage.status)) {
        expect(successCodes).toContain(firstPage.status);
        expectApiContract(firstPage, { shape: 'pagination', schema: paginationOf(warehouseRemainResponseSchema) });
        expectPaginationContract(firstPage.data, 1);
        expectNonNegativeQuantities(getRows<ApiRow>(firstPage.data));
      }

      const farPage = await waitForWarehouseRemains(
        request,
        remainsDto('product', { page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
        expectNonNegativeQuantities(getRows<ApiRow>(farPage.data));
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
      const needsByParents = await warehouseAPI.getNeedsByParents(
        request,
        firstRemain!.type,
        firstRemain!.id,
        accessToken,
      );
      expectNoServerError(needsByParents);
      if (!clientErrorCodes.includes(needsByParents.status)) {
        expect(successCodes).toContain(needsByParents.status);
        expectNonNegativeQuantities(getRows<ApiRow>(needsByParents.data));
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
        const remains = await waitForWarehouseRemains(
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
