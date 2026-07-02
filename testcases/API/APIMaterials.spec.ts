import { test, expect } from '@playwright/test';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectClientError, expectNoServerError, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type MaterialLike = Record<string, any>;

const materialsAPI = new MaterialsAPI(null as any);

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

const materialProviderPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeId: null,
  subTypeId: null,
  providerId: null,
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
  const response = await eventually(async () => {
    const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).some((row) => row.name === name));

  return response ? getRows(response.data).find((row) => row.name === name) : undefined;
};

const waitForMaterialInActiveSearch = async (
  request: any,
  name: string,
  materialId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ searchString: name }), accessToken);
    expect(response.status).toBe(201);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === materialId) === expectedPresent);

  return Boolean(response);
};

const waitForMaterialInArchive = async (
  request: any,
  name: string,
  materialId: number,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getArchivedMaterials(request, { searchString: name }, accessToken);
    expect(response.status).toBe(201);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === materialId));

  return Boolean(response);
};

const createIsolatedMaterial = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ materialId: number; materialName: string; typeId: number; subtypeId: number }> => {
  const typeName = `API Type Material ${suffix}`;
  const subtypeName = `API Subtype Material ${suffix}`;

  const typeResponse = await materialsAPI.createTypeMaterial(
    request,
    { name: typeName, characteristics: typeCharacteristics(), instance_type: 1 },
    accessToken,
  );
  expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
  expectNoServerError(typeResponse);
  const typeId = Number(typeResponse.data?.id);
  expect(typeId, JSON.stringify(typeResponse.data)).toBeGreaterThan(0);

  const subtypeResponse = await materialsAPI.createSubtypeMaterial(
    request,
    {
      name: subtypeName,
      density: 8,
      id: null,
      instance_type: 1,
      parentMaterialIds: [typeId],
    },
    accessToken,
  );
  expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
  expectNoServerError(subtypeResponse);
  const subtypeId = Number(subtypeResponse.data?.id);
  expect(subtypeId, JSON.stringify(subtypeResponse.data)).toBeGreaterThan(0);

  const payload = materialPayload(suffix, typeId, subtypeId);
  const materialName = String(payload.name);
  const createMaterial = await materialsAPI.createAndUpdateMaterial(request, payload, accessToken);
  expect(successCodes, JSON.stringify(createMaterial.data)).toContain(createMaterial.status);
  expectNoServerError(createMaterial);

  const material = await findMaterialByName(request, materialName, accessToken);
  expect(material, `Material ${materialName} was not found after create`).toBeTruthy();
  const materialId = Number(createMaterial.data?.id ?? material?.id);
  expect(materialId, JSON.stringify(createMaterial.data)).toBeGreaterThan(0);

  return { materialId, materialName, typeId, subtypeId };
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
      accessToken = await getAuthToken(request);
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
      const suffix = uniqueApiSuffix('material');
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

      const duplicateName = await materialsAPI.checkNameExisting(request, { name: createdName }, accessToken);
      expect(duplicateName.status).toBe(201);
      expect(Number(duplicateName.data), JSON.stringify(duplicateName.data)).toBeGreaterThanOrEqual(1);
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

      const typeById = await materialsAPI.getOneTypeMaterial(request, createdTypeId as number, accessToken);
      expectNoServerError(typeById);
      if (!clientErrorCodes.includes(typeById.status)) {
        expect(successCodes).toContain(typeById.status);
        expect(Number(typeById.data?.id), JSON.stringify(typeById.data)).toBe(createdTypeId);
      }

      const subtypeById = await materialsAPI.getSubtypeMaterialById(request, createdSubtypeId as number, accessToken);
      expectNoServerError(subtypeById);
      if (!clientErrorCodes.includes(subtypeById.status)) {
        expect(successCodes).toContain(subtypeById.status);
        expect(Number(subtypeById.data?.id), JSON.stringify(subtypeById.data)).toBe(createdSubtypeId);
      }

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

      const createdAlias = await materialsAPI.createMaterialAlias(
        request,
        {
          material_id: createdMaterialId as number,
          alias: `API Material Extra Alias ${uniqueApiSuffix('material-alias')}`,
          default: false,
        },
        accessToken,
      );
      expectNoServerError(createdAlias);

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

      expect(
        await waitForMaterialInActiveSearch(request, activeMaterialName, materialId, false, accessToken),
      ).toBe(true);

      expect(await waitForMaterialInArchive(request, activeMaterialName, materialId, accessToken)).toBe(true);

      const secondArchiveResponse = await materialsAPI.banMaterial(request, materialId, accessToken);
      expectNoServerError(secondArchiveResponse);
      createdMaterialId = undefined;
    });
  });

  test.describe('Materials API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу материалов с изолированным материалом без серверных ошибок', async ({ request }) => {
      let fixture: Awaited<ReturnType<typeof createIsolatedMaterial>> | undefined;
      try {
        fixture = await createIsolatedMaterial(request, uniqueApiSuffix('material-page'), accessToken);

        const response = await materialsAPI.getMaterialsPagination(
          request,
          materialPaginationDto({ searchString: fixture.materialName }),
          accessToken,
        );

        expect(response.status).toBe(201);
        expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(1);

        const row = getRows(response.data).find((item) => item.id === fixture?.materialId);
        expect(row, JSON.stringify(response.data)).toBeTruthy();
        expectMaterialShape(row as MaterialLike);
        expect(row?.ban, JSON.stringify(row)).not.toBe(true);
      } finally {
        if (fixture?.materialId) {
          const archiveMaterial = await materialsAPI.banMaterial(request, fixture.materialId, accessToken);
          expectNoServerError(archiveMaterial);
        }
        if (fixture?.subtypeId) {
          const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, fixture.subtypeId, accessToken);
          expectNoServerError(archiveSubtype);
        }
        if (fixture?.typeId) {
          const archiveType = await materialsAPI.removeTypeMaterial(request, fixture.typeId, accessToken);
          expectNoServerError(archiveType);
        }
      }
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

    test('пагинация материалов поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);

      const farPage = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('пагинация типов и подтипов материалов не отвечает 5xx на базовые фильтры', async ({ request }) => {
      const typePagination = await materialsAPI.getTypeMaterialsPagination(request, materialPaginationDto(), accessToken);
      expectNoServerError(typePagination);

      const subtypePagination = await materialsAPI.getSubtypeMaterialsPagination(request, materialPaginationDto(), accessToken);
      expectNoServerError(subtypePagination);
    });

    test('provider-пагинации материалов, типов и подтипов не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const materialsProvider = await materialsAPI.getMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(materialsProvider);

      const typesProvider = await materialsAPI.getTypeMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(typesProvider);

      const subtypesProvider = await materialsAPI.getSubtypeMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(subtypesProvider);
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

      const allDeficit = await materialsAPI.getAllMaterialDeficit(request, accessToken);
      expectNoServerError(allDeficit);

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

      expectClientError(response);
    });

    test('чтение несуществующего id не приводит к серверным ошибкам', async ({ request }) => {
      const byId = await materialsAPI.getMaterialById(request, 999999999, true, accessToken);
      expectNoServerError(byId);
    });

    test('мутации материала без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await materialsAPI.createAndUpdateMaterial(
        request,
        {
          name: `API Material NoAuth ${uniqueApiSuffix('material')}`,
          rootParentId: 1,
          subtypeMaterialId: 1,
          units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
          characteristics: materialCharacteristics(),
          material_aliases: [],
          companyIds: '[]',
          file_base: '[]',
        },
      );
      expectClientError(createResponse);

      const deleteResponse = await materialsAPI.banMaterial(request, 999999999);
      expectClientError(deleteResponse);
    });
  });
};
