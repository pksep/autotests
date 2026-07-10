import { test, expect } from '@playwright/test';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectClientError,
  expectErrorResponseContract,
  expectArrayResponse,
  expectNoServerError,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
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
  expect(typeof material.name, JSON.stringify(material)).toBe('string');
  const typeValue =
    material.rootParentId ??
    material.typeMaterialsId ??
    material.typeMaterialId ??
    material.type_material_id ??
    material.typeMaterial ??
    material.type_material ??
    material.rootParent;
  expect(typeValue, JSON.stringify(material)).toBeDefined();
  const subtypeValue =
    material.subtypeMaterialId ??
    material.subtype_material_id ??
    material.subtypeMaterial ??
    material.subtype_material;
  expect(subtypeValue, JSON.stringify(material)).toBeDefined();
  if ('rootParentId' in material && material.rootParentId !== null) {
    expect(typeof material.rootParentId, JSON.stringify(material)).toBe('number');
  }
  if ('subtypeMaterialId' in material && material.subtypeMaterialId !== null) {
    expect(typeof material.subtypeMaterialId, JSON.stringify(material)).toBe('number');
  }
  if ('ban' in material) {
    expect(typeof material.ban, JSON.stringify(material)).toBe('boolean');
  }
};

const expectTypeMaterialShape = (typeMaterial: MaterialLike) => {
  expect(typeMaterial).toBeTruthy();
  expect(typeof typeMaterial.id, JSON.stringify(typeMaterial)).toBe('number');
  expect(typeMaterial.name, JSON.stringify(typeMaterial)).toBeTruthy();
  expect(typeof typeMaterial.name, JSON.stringify(typeMaterial)).toBe('string');
  if ('characteristics' in typeMaterial && typeMaterial.characteristics !== null) {
    expect(typeof typeMaterial.characteristics, JSON.stringify(typeMaterial)).toBe('object');
  }
  if ('instance_type' in typeMaterial && typeMaterial.instance_type !== null) {
    expect(['number', 'string'], JSON.stringify(typeMaterial)).toContain(typeof typeMaterial.instance_type);
  }
};

const expectSubtypeMaterialShape = (subtypeMaterial: MaterialLike) => {
  expect(subtypeMaterial).toBeTruthy();
  expect(typeof subtypeMaterial.id, JSON.stringify(subtypeMaterial)).toBe('number');
  expect(subtypeMaterial.name, JSON.stringify(subtypeMaterial)).toBeTruthy();
  expect(typeof subtypeMaterial.name, JSON.stringify(subtypeMaterial)).toBe('string');
  if ('density' in subtypeMaterial && subtypeMaterial.density !== null) {
    expect(['number', 'string'], JSON.stringify(subtypeMaterial)).toContain(typeof subtypeMaterial.density);
  }
  if ('parentMaterialIds' in subtypeMaterial && subtypeMaterial.parentMaterialIds !== null) {
    expect(Array.isArray(subtypeMaterial.parentMaterialIds), JSON.stringify(subtypeMaterial)).toBe(true);
  }
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

const waitForTypeMaterialInActiveSearch = async (
  request: any,
  name: string,
  typeId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getTypeMaterialsPagination(
      request,
      materialPaginationDto({ searchString: name }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<MaterialLike>(response.data).some((row) => row.id === typeId) === expectedPresent);

  return Boolean(response);
};

const waitForSubtypeMaterialInActiveSearch = async (
  request: any,
  name: string,
  subtypeId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getSubtypeMaterialsPagination(
      request,
      materialPaginationDto({ searchString: name }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<MaterialLike>(response.data).some((row) => row.id === subtypeId) === expectedPresent);

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
    let createdTypeName: string;
    let createdSubtypeName: string;
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
      createdTypeName = typeName;
      createdSubtypeName = subtypeName;

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
      expectTypeMaterialShape(typeResponse.data);
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
      expectSubtypeMaterialShape(subtypeResponse.data);
      createdSubtypeId = Number(subtypeResponse.data.id);
      expect(await waitForTypeMaterialInActiveSearch(request, createdTypeName, createdTypeId, true, accessToken)).toBe(true);
      expect(await waitForSubtypeMaterialInActiveSearch(request, createdSubtypeName, createdSubtypeId, true, accessToken)).toBe(true);

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
      expectPaginationContract(pagination.data);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdMaterialId)).toBe(true);

      const aliasSearch = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ searchString: `API Material Alias ${createdName.replace('API Material ', '')}` }),
        accessToken,
      );
      expect(aliasSearch.status).toBe(201);
      expectPaginationContract(aliasSearch.data);
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
        expectTypeMaterialShape(typeById.data);
      }

      const subtypeById = await materialsAPI.getSubtypeMaterialById(request, createdSubtypeId as number, accessToken);
      expectNoServerError(subtypeById);
      if (!clientErrorCodes.includes(subtypeById.status)) {
        expect(successCodes).toContain(subtypeById.status);
        expect(Number(subtypeById.data?.id), JSON.stringify(subtypeById.data)).toBe(createdSubtypeId);
        expectSubtypeMaterialShape(subtypeById.data);
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
        expectArrayResponse(aliases.data);
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

      const archivedById = await materialsAPI.getMaterialById(request, materialId, true, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status)) {
        expect(successCodes, JSON.stringify(archivedById.data)).toContain(archivedById.status);
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(materialId);
        expect(archivedById.data?.ban, JSON.stringify(archivedById.data)).toBe(true);
      }

      const secondArchiveResponse = await materialsAPI.banMaterial(request, materialId, accessToken);
      expectNoServerError(secondArchiveResponse);
      createdMaterialId = undefined;
    });

    test('архивирует подтип и тип материала и проверяет отсутствие в активной выдаче', async ({ request }) => {
      expect(createdSubtypeId).toBeTruthy();
      expect(createdTypeId).toBeTruthy();

      const subtypeId = createdSubtypeId as number;
      const typeId = createdTypeId as number;

      const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, subtypeId, accessToken);
      expectNoServerError(archiveSubtype);
      expect(successCodes, JSON.stringify(archiveSubtype.data)).toContain(archiveSubtype.status);
      expect(await waitForSubtypeMaterialInActiveSearch(request, createdSubtypeName, subtypeId, false, accessToken)).toBe(true);
      createdSubtypeId = undefined;

      const archiveType = await materialsAPI.removeTypeMaterial(request, typeId, accessToken);
      expectNoServerError(archiveType);
      expect(successCodes, JSON.stringify(archiveType.data)).toContain(archiveType.status);
      expect(await waitForTypeMaterialInActiveSearch(request, createdTypeName, typeId, false, accessToken)).toBe(true);
      createdTypeId = undefined;
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
        expectPaginationContract(response.data);
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
      expectPaginationContract(response.data);
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
      if (!clientErrorCodes.includes(typePagination.status)) {
        expect(successCodes).toContain(typePagination.status);
        expectPaginationContract(typePagination.data);
        const typeRow = getRows(typePagination.data)[0];
        if (typeRow) expectTypeMaterialShape(typeRow);
      }

      const subtypePagination = await materialsAPI.getSubtypeMaterialsPagination(request, materialPaginationDto(), accessToken);
      expectNoServerError(subtypePagination);
      if (!clientErrorCodes.includes(subtypePagination.status)) {
        expect(successCodes).toContain(subtypePagination.status);
        expectPaginationContract(subtypePagination.data);
        const subtypeRow = getRows(subtypePagination.data)[0];
        if (subtypeRow) expectSubtypeMaterialShape(subtypeRow);
      }
    });

    test('provider-пагинации материалов, типов и подтипов не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const materialsProvider = await materialsAPI.getMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(materialsProvider);
      if (!clientErrorCodes.includes(materialsProvider.status)) {
        expect(successCodes).toContain(materialsProvider.status);
        expectPaginationContract(materialsProvider.data);
        const materialRow = getRows(materialsProvider.data)[0];
        if (materialRow) expectMaterialShape(materialRow);
      }

      const typesProvider = await materialsAPI.getTypeMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(typesProvider);
      if (!clientErrorCodes.includes(typesProvider.status)) {
        expect(successCodes).toContain(typesProvider.status);
        expectPaginationContract(typesProvider.data);
        const typeRow = getRows(typesProvider.data)[0];
        if (typeRow) expectTypeMaterialShape(typeRow);
      }

      const subtypesProvider = await materialsAPI.getSubtypeMaterialsProviderPagination(request, materialProviderPaginationDto(), accessToken);
      expectNoServerError(subtypesProvider);
      if (!clientErrorCodes.includes(subtypesProvider.status)) {
        expect(successCodes).toContain(subtypesProvider.status);
        expectPaginationContract(subtypesProvider.data);
        const subtypeRow = getRows(subtypesProvider.data)[0];
        if (subtypeRow) expectSubtypeMaterialShape(subtypeRow);
      }
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
      if (!clientErrorCodes.includes(deficits.status)) {
        expect(successCodes).toContain(deficits.status);
        expectPaginationContract(deficits.data);
      }

      const allDeficit = await materialsAPI.getAllMaterialDeficit(request, accessToken);
      expectNoServerError(allDeficit);
      if (!clientErrorCodes.includes(allDeficit.status)) {
        expect(successCodes).toContain(allDeficit.status);
        expectArrayResponse(allDeficit.data);
      }

      const subtypes = await materialsAPI.getAllSubtypeMaterial(request, API_CONST.API_TEST_SUBTYPE_INSTANS, accessToken);
      expectNoServerError(subtypes);
      if (!clientErrorCodes.includes(subtypes.status)) {
        expect(successCodes).toContain(subtypes.status);
        expectArrayResponse(subtypes.data);
        const subtypeRow = subtypes.data[0];
        if (subtypeRow) expectSubtypeMaterialShape(subtypeRow);
      }

      const materialTypes = await materialsAPI.actualMaterialLists(request, accessToken);
      expect(materialTypes.status).toBe(200);
      expectArrayResponse(materialTypes.data);
      const typeRow = materialTypes.data[0];
      if (typeRow) expectTypeMaterialShape(typeRow);
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

      const attachFile = await materialsAPI.attachFileToMaterial(request, 999999999, 999999999, accessToken);
      expectNoServerError(attachFile);
      if (clientErrorCodes.includes(attachFile.status)) expectErrorResponseContract(attachFile);

      const relatives = await materialsAPI.getRelativesProductionTask(request, 999999999, accessToken);
      expectNoServerError(relatives);
      if (successCodes.includes(relatives.status)) expectArrayResponse(relatives.data);
      if (clientErrorCodes.includes(relatives.status)) expectErrorResponseContract(relatives);
    });

    test('невалидное обновление типа и подтипа материала возвращает error contract', async ({ request }) => {
      const subtype = await materialsAPI.updateSubtypeMaterial(request, { id: 999999999, name: '' }, accessToken);
      expectClientError(subtype);
      expectErrorResponseContract(subtype);

      const type = await materialsAPI.updateTypeMaterial(request, { id: 999999999, name: '' }, accessToken);
      expectClientError(type);
      expectErrorResponseContract(type);
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
