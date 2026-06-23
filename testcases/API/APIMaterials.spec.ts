import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data?: any;
};

type MaterialLike = Record<string, any>;

const authAPI = new AuthAPI();
const materialsAPI = new MaterialsAPI(null as any);

const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;

const extractAccessToken = (data: any): string | undefined => {
  if (!data || typeof data === 'string') return undefined;
  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

const getRows = (data: unknown): MaterialLike[] => {
  if (Array.isArray(data)) return data as MaterialLike[];
  if (data && typeof data === 'object' && Array.isArray((data as any).rows)) return (data as any).rows;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

const getCount = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const value = (data as any).count ?? (data as any).total;
  return typeof value === 'number' ? value : undefined;
};

const expectNoServerError = (response: ApiResult) => {
  expect(serverErrorCodes, JSON.stringify(response.data)).not.toContain(response.status);
};

const expectNotSuccessful = (response: ApiResult) => {
  expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
  expectNoServerError(response);
};

const expectMaterialShape = (material: MaterialLike) => {
  expect(material).toBeTruthy();
  expect(typeof material.id, JSON.stringify(material)).toBe('number');
  expect(material.name, JSON.stringify(material)).toBeTruthy();
};

const typeCharacteristics = () => ({
  length: { edizmId: 6, znach: null, shortName: 'mm' },
  width: { edizmId: 6, znach: null, shortName: 'mm' },
  height: { edizmId: 6, znach: null, shortName: 'mm' },
  wallThickness: { edizmId: 6, znach: null, shortName: 'mm' },
  outsideDiameter: { edizmId: 6, znach: null, shortName: 'mm' },
  thickness: { edizmId: 6, znach: null, shortName: 'mm' },
  areaCrossSectional: { edizmId: 8, znach: null, shortName: 'm2' },
});

const materialCharacteristics = (density = 8) => ({
  density: { used: true, znach: density, edizmId: 9, shortName: 'kg/m3' },
  length: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  width: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  height: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  wallThickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  outsideDiameter: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  thickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  areaCrossSectional: { used: false, znach: 0, edizmId: 8, shortName: 'm2' },
});

const materialPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  instans: 1,
  searchString: '',
  typeMaterialId: null,
  subtypeMaterialId: null,
  filterByAttention: false,
  filterByTime: true,
  ...overrides,
});

const materialPayload = (
  suffix: string,
  rootParentId: number,
  subtypeMaterialId: number,
  overrides: Record<string, unknown> = {},
) => ({
  id: undefined,
  name: `API Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created by API autotest ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Material Alias ${suffix}`, default: true }],
  ...overrides,
});

const findMaterialByName = async (
  request: any,
  name: string,
  accessToken?: string,
): Promise<MaterialLike | undefined> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);

    const material = getRows(response.data).find((row) => row.name === name);
    if (material) return material;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return undefined;
};

const waitForMaterialInActiveSearch = async (
  request: any,
  name: string,
  materialId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ searchString: name }), accessToken);
    expect(response.status).toBe(201);

    const isPresent = getRows(response.data).some((row) => row.id === materialId);
    if (isPresent === expectedPresent) return true;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
};

const waitForMaterialInArchive = async (
  request: any,
  name: string,
  materialId: number,
  accessToken?: string,
): Promise<boolean> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await materialsAPI.getArchivedMaterials(request, { searchString: name }, accessToken);
    expect(response.status).toBe(201);

    if (getRows(response.data).some((row) => row.id === materialId)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
};

export const runMaterialsAPINew = () => {
  logger.info('Starting Materials API coverage suite');

  test.describe.serial('Materials API: жизненный цикл материала', () => {
    test.describe.configure({ timeout: 150000 });

    let accessToken: string | undefined;
    let createdTypeId: number | undefined;
    let createdSubtypeId: number | undefined;
    let createdMaterialId: number | undefined;
    let createdName: string;
    let updatedName: string;
    let activeMaterialName: string;
    let createdPayload: Record<string, unknown>;
    let updatedPayload: Record<string, unknown>;

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

    test.afterAll(async ({ request }) => {
      if (createdMaterialId) {
        const archiveMaterial = await materialsAPI.banMaterial(request, createdMaterialId, accessToken);
        expectNoServerError(archiveMaterial);
      }

      if (createdSubtypeId) {
        const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, createdSubtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }

      if (createdTypeId) {
        const archiveType = await materialsAPI.removeTypeMaterial(request, createdTypeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('создает тип и подтип материала для изолированного тестового материала', async ({ request }) => {
      const suffix = `${Date.now()}`;
      const typeName = `API Type Material ${suffix}`;
      const subtypeName = `API Subtype Material ${suffix}`;

      const typeUnique = await materialsAPI.checkNameUnique(request, { type: 'TYPE', name: typeName }, accessToken);
      expect(typeUnique.status).toBe(201);
      expect(Number(typeUnique.data), JSON.stringify(typeUnique.data)).toBe(0);

      const typeResponse = await materialsAPI.createTypeMaterial(
        request,
        { name: typeName, characteristics: typeCharacteristics(), instance_type: 1 },
        accessToken,
      );
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      expectMaterialShape(typeResponse.data);
      createdTypeId = Number(typeResponse.data.id);

      const subtypeResponse = await materialsAPI.createSubtypeMaterial(
        request,
        {
          name: subtypeName,
          density: 8,
          id: null,
          instance_type: 1,
          parentMaterialIds: [createdTypeId],
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      expectMaterialShape(subtypeResponse.data);
      createdSubtypeId = Number(subtypeResponse.data.id);

      createdPayload = materialPayload(suffix, createdTypeId, createdSubtypeId);
      updatedPayload = materialPayload(`${suffix}-UPD`, createdTypeId, createdSubtypeId, {
        description: `Updated by API autotest ${suffix}`,
        attention: true,
        material_aliases: [{ alias: `API Material Alias ${suffix}-UPD`, default: true }],
        characteristics: materialCharacteristics(7.9),
      });
      createdName = String(createdPayload.name);
      updatedName = String(updatedPayload.name);
      activeMaterialName = createdName;
    });

    test('создает материал с уникальным именем и алиасом', async ({ request }) => {
      expect(createdTypeId).toBeTruthy();
      expect(createdSubtypeId).toBeTruthy();

      const uniqueBefore = await materialsAPI.checkNameExisting(request, { name: createdName }, accessToken);
      expect(uniqueBefore.status).toBe(201);
      expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);

      const createResponse = await materialsAPI.createAndUpdateMaterial(request, createdPayload, accessToken);
      expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      if (createResponse.data?.id) createdMaterialId = Number(createResponse.data.id);

      const created = await findMaterialByName(request, createdName, accessToken);
      expect(created, `Material ${createdName} was not found after create`).toBeTruthy();
      expectMaterialShape(created as MaterialLike);

      createdMaterialId = createdMaterialId || Number(created?.id);
      expect(created?.name).toBe(createdName);
      expect(created?.ban).toBe(false);
    });

    test('читает созданный материал через пагинацию и поиск по алиасу', async ({ request }) => {
      expect(createdMaterialId).toBeTruthy();

      const pagination = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ searchString: createdName }),
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdMaterialId)).toBe(true);

      const aliasSearch = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ searchString: `API Material Alias ${createdName.replace('API Material ', '')}` }),
        accessToken,
      );
      expect(aliasSearch.status).toBe(201);
      expect(getRows(aliasSearch.data).some((row) => row.id === createdMaterialId)).toBe(true);
    });

    test('обрабатывает обновление материала без серверных ошибок', async ({ request }) => {
      expect(createdMaterialId).toBeTruthy();

      const updateResponse = await materialsAPI.createAndUpdateMaterial(
        request,
        { ...updatedPayload, id: createdMaterialId },
        accessToken,
      );
      expectNoServerError(updateResponse);

      if (clientErrorCodes.includes(updateResponse.status)) {
        expect(successCodes, JSON.stringify(updateResponse.data)).not.toContain(updateResponse.status);
        activeMaterialName = createdName;
        return;
      }

      expect(successCodes, JSON.stringify(updateResponse.data)).toContain(updateResponse.status);

      const updated = await findMaterialByName(request, updatedName, accessToken);
      expect(updated, `Material ${updatedName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(createdMaterialId);
      expect(updated?.name).toBe(updatedName);
      expect(updated?.attention).toBe(true);
      activeMaterialName = updatedName;
    });

    test('возвращает include, aliases, отгрузки и ограничения без серверных ошибок', async ({ request }) => {
      expect(createdMaterialId).toBeTruthy();

      const includeResponse = await materialsAPI.getIncludeForMaterial(request, {
        id: createdMaterialId,
        includes: ['documents', 'companies'],
      }, accessToken);
      expectNoServerError(includeResponse);
      if (!clientErrorCodes.includes(includeResponse.status)) {
        expect(successCodes).toContain(includeResponse.status);
        expect(includeResponse.data?.id, JSON.stringify(includeResponse.data)).toBe(createdMaterialId);
      }

      const aliases = await materialsAPI.getMaterialAliases(request, createdMaterialId as number, accessToken);
      expectNoServerError(aliases);
      if (!clientErrorCodes.includes(aliases.status)) {
        expect(successCodes).toContain(aliases.status);
        expect(Array.isArray(aliases.data), JSON.stringify(aliases.data)).toBe(true);
      }

      const shipments = await materialsAPI.getMaterialShipmentsAndOrders(request, createdMaterialId as number, accessToken);
      expectNoServerError(shipments);

      const unitRestrictions = await materialsAPI.getMeasurementUnitRestrictionsInfo(request, createdMaterialId as number, accessToken);
      expectNoServerError(unitRestrictions);

      const coefficientRestrictions = await materialsAPI.getMeasurementCoefficientRestrictionsInfo(request, createdMaterialId as number, accessToken);
      expectNoServerError(coefficientRestrictions);
    });

    test('архивирует материал и проверяет архивную выдачу', async ({ request }) => {
      expect(createdMaterialId).toBeTruthy();
      const materialId = createdMaterialId as number;

      const archiveResponse = await materialsAPI.banMaterial(request, materialId, accessToken);
      expect(successCodes).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);
      createdMaterialId = undefined;

      expect(
        await waitForMaterialInActiveSearch(request, activeMaterialName, materialId, false, accessToken),
      ).toBe(true);

      expect(await waitForMaterialInArchive(request, activeMaterialName, materialId, accessToken)).toBe(true);
    });
  });

  test.describe('Materials API: контракты чтения и defensive-сценарии', () => {
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

    test('возвращает страницу материалов без серверных ошибок', async ({ request }) => {
      const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto(), accessToken);

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);

      const rows = getRows(response.data);
      test.skip(rows.length === 0, 'No active materials are available on this environment.');
      expectMaterialShape(rows[0]);
      expect(rows[0].ban, JSON.stringify(rows[0])).not.toBe(true);
    });

    test('пагинация поддерживает пустой результат со стабильной структурой', async ({ request }) => {
      const response = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ searchString: 'api-material-no-match-999999999' }),
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
    });

    test('пагинация типов и подтипов материалов не отвечает 5xx на базовые фильтры', async ({ request }) => {
      const typePagination = await materialsAPI.getTypeMaterialsPagination(request, materialPaginationDto(), accessToken);
      expectNoServerError(typePagination);

      const subtypePagination = await materialsAPI.getSubtypeMaterialsPagination(request, materialPaginationDto(), accessToken);
      expectNoServerError(subtypePagination);
    });

    test('дефициты и справочники подтипов не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const deficits = await materialsAPI.getMaterialDeficits(
        request,
        {
          page: 0,
          statusWorking: 'Все',
          materialIds: [],
          shipmentIds: [],
          searchString: '',
        },
        accessToken,
      );
      expectNoServerError(deficits);

      const subtypes = await materialsAPI.getAllSubtypeMaterial(request, API_CONST.API_TEST_SUBTYPE_INSTANS, accessToken);
      expectNoServerError(subtypes);
    });

    test('проверка уникальности имен обрабатывает защитные payload без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const name of cases) {
        const response = await materialsAPI.checkNameUnique(request, { type: 'TYPE', name }, accessToken);
        expectNoServerError(response);
      }
    });

    test('создание материала отклоняет невалидный payload без серверных ошибок', async ({ request }) => {
      const response = await materialsAPI.createAndUpdateMaterial(
        request,
        {
          name: '',
          description: '',
          units_measurement: [],
          characteristics: {},
          material_aliases: [],
          companyIds: '[]',
          file_base: '[]',
        },
        accessToken,
      );

      expectNotSuccessful(response);
    });

    test('чтение несуществующего id не приводит к серверным ошибкам', async ({ request }) => {
      const byId = await materialsAPI.getMaterialById(request, 999999999, true, accessToken);
      expectNoServerError(byId);
    });
  });
};
