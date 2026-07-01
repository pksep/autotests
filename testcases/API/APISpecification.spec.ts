import { test, expect } from '@playwright/test';
import { SpecificationsAPI } from '../../pages/API/APISpecifications';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { CBEDAPI } from '../../pages/API/APICBED';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const specificationsAPI = new SpecificationsAPI(null);
const productsAPI = new ProductsAPI(null as any);
const cbedAPI = new CBEDAPI(null);
const detailsAPI = new DetailsAPI(null);
const materialsAPI = new MaterialsAPI(null as any);

type ApiRow = Record<string, any>;

const asyncCreateLookupOptions = {
  attempts: 45,
  intervalMs: 1000,
};

const attributesDto = (overrides: Record<string, unknown> = {}) => ({
  cbedIds: [],
  detalIds: [],
  materialIds: [],
  attributes: ['id', 'name', 'ban'],
  ...overrides,
});

const productPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  pageSize: 10,
  modelInclude: [],
  isBan: false,
  ...overrides,
});

const cbedPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  isSortedByOwn: false,
  isSortedByOperations: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
  ...overrides,
});

const detailPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  isSortedByOwn: false,
  isSortedByOperations: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
  ...overrides,
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

const productPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  name: `API Specification Product ${suffix}`,
  articl: `API-SPEC-PRODUCT-ART-${suffix}`,
  responsible: '',
  description: `Created by Specification API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-SPEC-PRODUCT-${suffix}`,
  listDetal: [],
  listPokDet: [],
  materialList: [],
  listCbed: [],
  techProcessID: 'null',
  fileBase: [],
  attention: false,
  is_custom: 'false',
  discontinued: false,
  ...overrides,
});

const cbedPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: 'null',
  characteristic: [{ name: 'Масса сборки', ez: 'кг', znach: 0 }],
  name: `API Specification CBED ${suffix}`,
  designation: `API-SPEC-CBED-${suffix}`,
  responsible: '0',
  description: `Created by Specification API autotest ${suffix}`,
  parametrs: [{ ez: 'ч', name: 'Норма времени на сборку', znach: 0 }],
  listDetal: [],
  listCbed: [],
  listPokDet: [],
  materialList: [],
  fileBase: '[]',
  attention: 'false',
  docs: null,
  discontinued: 'false',
  ...overrides,
});

const detailPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Specification Detail ${suffix}`,
  designation: `API-SPEC-DETAIL-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `Created by Specification API autotest ${suffix}`,
  parametrs: {
    preTime: { ez: 'ч', znach: 0 },
    helperTime: { ez: 'ч', znach: 0 },
    mainTime: { ez: 'ч', znach: 0 },
  },
  attention: false,
  workpiece_characterization: { mass: 0, trash: 0 },
  materialList: [],
  mat_zag: null,
  mat_zag_zam: null,
  docs: null,
  fileBase: [],
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
  name: `API Specification Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created by Specification API autotest ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Specification Material Alias ${suffix}`, default: true }],
});

const expectSpecificationAttributesContract = (data: unknown, attributes: string[]) => {
  expect(data, JSON.stringify(data)).toBeTruthy();
  const stack = [data];
  const rows: ApiRow[] = [];

  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    if (Array.isArray(item)) {
      stack.push(...item);
      continue;
    }
    const row = item as ApiRow;
    if (Number.isFinite(Number(row.id))) rows.push(row);
    for (const value of Object.values(row)) {
      if (value && typeof value === 'object') stack.push(value);
    }
  }

  for (const row of rows) {
    for (const attribute of attributes) {
      if (attribute in row) expect(row[attribute], `${attribute}: ${JSON.stringify(row)}`).not.toBeUndefined();
    }
  }
};

const expectChildrenContract = (data: unknown) => {
  expect(data, JSON.stringify(data)).toBeTruthy();
  const objectData = data as ApiRow;
  for (const key of ['listCbed', 'listDetal', 'materialList', 'listPokDet']) {
    if (objectData[key] !== undefined && objectData[key] !== null) {
      expect(Array.isArray(objectData[key]), `${key}: ${JSON.stringify(data)}`).toBe(true);
    }
  }
};

const findFirst = <T extends ApiRow>(data: unknown): T | undefined => getRows<T>(data).find((row) => row.id && row.ban !== true);

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const findProductByDesignation = async (request: any, designation: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true), asyncCreateLookupOptions);

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const findCbedByDesignation = async (request: any, designation: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await cbedAPI.getCBEDPagination(
      request,
      cbedPaginationDto({ searchString: designation }),
      API_CONST.API_TEST_USER_ID,
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true), asyncCreateLookupOptions);

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const findDetailByDesignation = async (request: any, designation: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await detailsAPI.getPaginationDetails(
      request,
      detailPaginationDto({ searchString: designation }),
      API_CONST.API_TEST_USER_ID,
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true), asyncCreateLookupOptions);

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const findMaterialByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name && row.ban !== true), asyncCreateLookupOptions);

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name && row.ban !== true) : undefined;
};

const createProduct = async (request: any, suffix: string, accessToken?: string) => {
  const payload = productPayload(suffix);
  const create = await productsAPI.createProduct(request, payload, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findProductByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { id, designation: String(payload.designation) };
};

const createCbed = async (request: any, suffix: string, accessToken?: string) => {
  const payload = cbedPayload(suffix);
  const create = await cbedAPI.createCBED(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findCbedByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { id, designation: String(payload.designation) };
};

const createDetail = async (request: any, suffix: string, accessToken?: string) => {
  const payload = detailPayload(suffix);
  const create = await detailsAPI.createDetail(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findDetailByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { id, designation: String(payload.designation) };
};

const createMaterial = async (request: any, suffix: string, accessToken?: string) => {
  const type = await materialsAPI.createTypeMaterial(
    request,
    { name: `API Specification Material Type ${suffix}`, characteristics: typeCharacteristics(), instance_type: 1 },
    accessToken,
  );
  expect(successCodes, JSON.stringify(type.data)).toContain(type.status);
  expectNoServerError(type);
  const typeId = Number(type.data?.id);
  expect(typeId, JSON.stringify(type.data)).toBeGreaterThan(0);

  const subtype = await materialsAPI.createSubtypeMaterial(
    request,
    { name: `API Specification Material Subtype ${suffix}`, density: 8, id: null, instance_type: 1, parentMaterialIds: [typeId] },
    accessToken,
  );
  expect(successCodes, JSON.stringify(subtype.data)).toContain(subtype.status);
  expectNoServerError(subtype);
  const subtypeId = Number(subtype.data?.id);
  expect(subtypeId, JSON.stringify(subtype.data)).toBeGreaterThan(0);

  const payload = materialPayload(suffix, typeId, subtypeId);
  const create = await materialsAPI.createAndUpdateMaterial(request, payload, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findMaterialByName(request, payload.name, accessToken);
  const id = Number(create.data?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { id, name: payload.name, typeId, subtypeId };
};

const cleanupSpecificationFixtures = async (
  request: any,
  fixtures: {
    productId?: number;
    cbedId?: number;
    detailId?: number;
    materialId?: number;
    materialSubtypeId?: number;
    materialTypeId?: number;
  },
  accessToken?: string,
) => {
  if (fixtures.productId) {
    const archive = await productsAPI.deleteProduct(request, fixtures.productId, accessToken);
    expectNoServerError(archive);
  }
  if (fixtures.cbedId) {
    const archive = await cbedAPI.banCBED(request, fixtures.cbedId, API_CONST.API_TEST_USER_ID, accessToken);
    expectNoServerError(archive);
  }
  if (fixtures.detailId) {
    const archive = await detailsAPI.deleteDetail(request, String(fixtures.detailId), API_CONST.API_TEST_USER_ID, accessToken);
    expectNoServerError(archive);
  }
  if (fixtures.materialId) {
    const archive = await materialsAPI.banMaterial(request, fixtures.materialId, accessToken);
    expectNoServerError(archive);
  }
  if (fixtures.materialSubtypeId) {
    const archive = await materialsAPI.removeSubtypeMaterial(request, fixtures.materialSubtypeId, accessToken);
    expectNoServerError(archive);
  }
  if (fixtures.materialTypeId) {
    const archive = await materialsAPI.removeTypeMaterial(request, fixtures.materialTypeId, accessToken);
    expectNoServerError(archive);
  }
};

export const runSpecificationAPINew = () => {
  logger.info('Starting Specification API coverage suite');

  test.describe('Specification API: атрибуты и дети первого уровня', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('получает атрибуты спецификации по пустому набору ids', async ({ request }) => {
      const response = await specificationsAPI.getAttributesFromIds(request, attributesDto(), accessToken);

      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      expect(response.data, JSON.stringify(response.data)).toBeTruthy();
    });

    test('получает attributes по реальным cbed/detail/material ids и выбранным полям', async ({ request }) => {
      const suffix = uniqueApiSuffix('spec-attrs');
      const cbed = await createCbed(request, `${suffix}-cbed`, accessToken);
      const detail = await createDetail(request, `${suffix}-detail`, accessToken);
      const material = await createMaterial(request, `${suffix}-material`, accessToken);

      try {
        const attributes = ['id', 'name', 'designation', 'ban'];
        const response = await specificationsAPI.getAttributesFromIds(
          request,
          attributesDto({
            cbedIds: [cbed.id],
            detalIds: [detail.id],
            materialIds: [material.id],
            attributes,
          }),
          accessToken,
        );

        expectNoServerError(response);
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectSpecificationAttributesContract(response.data, ['id', 'name']);
      } finally {
        await cleanupSpecificationFixtures(
          request,
          {
            cbedId: cbed.id,
            detailId: detail.id,
            materialId: material.id,
            materialSubtypeId: material.subtypeId,
            materialTypeId: material.typeId,
          },
          accessToken,
        );
      }
    });

    test('mixed attributes-запрос возвращает стабильный контракт', async ({ request }) => {
      const detail = await createDetail(request, uniqueApiSuffix('spec-mixed-detail'), accessToken);

      try {
        const response = await specificationsAPI.getAttributesFromIds(
          request,
          attributesDto({
            detalIds: [detail.id],
            attributes: ['id', 'name'],
          }),
          accessToken,
        );
        expectNoServerError(response);
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectSpecificationAttributesContract(response.data, ['id']);
      } finally {
        await cleanupSpecificationFixtures(request, { detailId: detail.id }, accessToken);
      }
    });

    test('получает детей первого уровня для существующего изделия, если оно есть', async ({ request }) => {
      const product = await createProduct(request, uniqueApiSuffix('spec-product-children'), accessToken);

      try {
        const children = await specificationsAPI.getFirstLevelChildren(
          request,
          { itemId: product.id, itemType: 'product' },
          accessToken,
        );
        expectNoServerError(children);
        if (!clientErrorCodes.includes(children.status)) {
          expect(successCodes, JSON.stringify(children.data)).toContain(children.status);
          expectChildrenContract(children.data);
        }
      } finally {
        await cleanupSpecificationFixtures(request, { productId: product.id }, accessToken);
      }
    });

    test('получает детей первого уровня для cbed и detal, если сущности есть', async ({ request }) => {
      const suffix = uniqueApiSuffix('spec-children');
      const cbed = await createCbed(request, `${suffix}-cbed`, accessToken);
      const detail = await createDetail(request, `${suffix}-detail`, accessToken);

      try {
        for (const current of [
          { itemId: cbed.id, itemType: 'cbed' },
          { itemId: detail.id, itemType: 'detal' },
        ]) {
          const response = await specificationsAPI.getFirstLevelChildren(
            request,
            current,
            accessToken,
          );
          expectNoServerError(response);
          if (!clientErrorCodes.includes(response.status)) {
            expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
            expectChildrenContract(response.data);
          }
        }
      } finally {
        await cleanupSpecificationFixtures(request, { cbedId: cbed.id, detailId: detail.id }, accessToken);
      }
    });

    test('негативные first-level-children сценарии не приводят к 5xx', async ({ request }) => {
      for (const dto of [
        { itemId: 999999999, itemType: 'product' },
        { itemId: 1, itemType: 'bad-type' },
        {},
      ]) {
        const response = await specificationsAPI.getFirstLevelChildren(request, dto, accessToken);
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        }
      }
    });

    test('запускает пересчет времени для существующих product/cbed/detal, если они есть', async ({ request }) => {
      const suffix = uniqueApiSuffix('spec-time');
      const product = await createProduct(request, `${suffix}-product`, accessToken);
      const cbed = await createCbed(request, `${suffix}-cbed`, accessToken);
      const detail = await createDetail(request, `${suffix}-detail`, accessToken);

      try {
        for (const current of [
          { id: product.id, type: 'product' },
          { id: cbed.id, type: 'cbed' },
          { id: detail.id, type: 'detal' },
        ]) {
          const response = await specificationsAPI.calculateProductionTime(request, current.type, current.id, accessToken);
          expectNoServerError(response);
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        }
      } finally {
        await cleanupSpecificationFixtures(
          request,
          { productId: product.id, cbedId: cbed.id, detailId: detail.id },
          accessToken,
        );
      }
    });

    test('запускает пересчет времени и обрабатывает невалидные dto без 5xx', async ({ request }) => {
      const calculate = await specificationsAPI.calculateProductionTime(request, 'product', 999999999, accessToken);
      expectNoServerError(calculate);

      const invalidAttributes = await specificationsAPI.createSpecification(
        request,
        { cbedIds: 'bad', detalIds: null, materialIds: {}, attributes: 'id' },
        accessToken,
      );
      expectNotSuccessful(invalidAttributes);
    });

    test('known invalid specification dto остаются regression-тестами', async ({ request }) => {
      test.fail(true, 'first-level-children с itemId строкой на dev возвращает 500 вместо клиентской ошибки.');
      const response = await specificationsAPI.getFirstLevelChildren(
        request,
        { itemId: 'bad-id', itemType: 'product' },
        accessToken,
      );
      expectNotSuccessful(response);
    });
  });
};
