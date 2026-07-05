import { test, expect } from '@playwright/test';
import { DeficitsAPI } from '../../pages/API/APIDeficits';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { API_CONST } from '../../lib/Constants/APIConstants';
import {
  captureApiResult,
  clientErrorCodes,
  expectNoServerError,
  expectClientError,
  expectEndpointReached,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const deficitsAPI = new DeficitsAPI(null);
const materialsAPI = new MaterialsAPI(null as any);
const shipmentsAPI = new ShipmentsAPI(null as any);
const productsAPI = new ProductsAPI(null as any);
const companiesAPI = new CompaniesAPI(null);
const shipmentManagerId = Number(API_CONST.API_CREATOR_USER_ID_66);

type ApiRow = Record<string, any>;

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

const shipmentsPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  offset: 0,
  status: [],
  dateRange: null,
  companyId: null,
  searchStr: '',
  attributes: [],
  sort: [],
  ...overrides,
});

const productPaginationDto = (overrides: Record<string, unknown> = {}) => ({
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

const productPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  name: `API Deficit Product ${suffix}`,
  articl: `API-DEFICIT-PRODUCT-ART-${suffix}`,
  responsible: '',
  description: `Created by Deficits API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-DEFICIT-PRODUCT-${suffix}`,
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

const companyPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  name: `API Deficit Buyer ${suffix}`,
  inn: `76${Math.floor(100000000 + Math.random() * 899999999)}`,
  kpp: `77${Math.floor(1000000 + Math.random() * 8999999)}`,
  address: `API deficit buyer address ${suffix}`,
  description: `Created by Deficits API autotest ${suffix}`,
  type: ['buyer'],
  email: `api-deficit-${suffix}@example.test`,
  phone: '+375291112233',
  contactIds: [],
  materialIds: [],
  attention: false,
  ...overrides,
});

const shipmentPayload = (
  suffix: string,
  product: ApiRow,
  buyerId: number,
  overrides: Record<string, unknown> = {},
) => ({
  dateOrder: new Date().toISOString(),
  dateShipments: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  kol: 1,
  bron: false,
  base: '',
  buyer: buyerId,
  isCustomProduct: true,
  description: `API deficit shipment ${suffix}`,
  nameCustomProduct: `API custom deficit shipment ${suffix}`,
  managerId: shipmentManagerId,
  documentsData: '[]',
  product: {
    id: product.id,
    name: product.name,
    designation: product.designation,
  },
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

const materialPayload = (
  suffix: string,
  rootParentId: number,
  subtypeMaterialId: number,
  overrides: Record<string, unknown> = {},
) => ({
  id: undefined,
  name: `API Deficit Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created by Deficits API autotest ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Deficit Material Alias ${suffix}`, default: true }],
  ...overrides,
});

const expectDeficitTableShape = (row: ApiRow) => {
  expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
  expect(Number(row.minRemainder), JSON.stringify(row)).not.toBeNaN();
  expect(Number(row.recommendedRemainder), JSON.stringify(row)).not.toBeNaN();
};

const expectMaterialDeficitRowShape = (row: ApiRow) => {
  expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
  expect(row.name, JSON.stringify(row)).toBeTruthy();

  for (const key of ['quantity', 'deficit', 'deficit_by_sclad', 'min_remaining', 'recommended_remaining']) {
    if (row[key] !== undefined && row[key] !== null) {
      expect(Number(row[key]), `${key}: ${JSON.stringify(row)}`).not.toBeNaN();
    }
  }
};

const expectMaterialParentsContract = (data: unknown) => {
  const rows = getRows<ApiRow>(data);
  expect(Array.isArray(rows), JSON.stringify(data)).toBe(true);

  const provider = rows.find((row) => row.type === 'provider');
  if (provider) {
    expect(Number(provider.count), JSON.stringify(provider)).not.toBeNaN();
  }

  for (const row of rows.filter((item) => item.type !== 'provider')) {
    expect(row.type, JSON.stringify(row)).toBeTruthy();
    if (row.id !== undefined) expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
  }
};

const expectMaterialShipmentsContract = (data: unknown) => {
  const rows = getRows<ApiRow>(data);
  expect(Array.isArray(rows), JSON.stringify(data)).toBe(true);

  for (const row of rows) {
    expect(row.type, JSON.stringify(row)).toBeTruthy();
    if (row.id !== undefined) expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
    if (row.shipments !== undefined) expect(Array.isArray(row.shipments), JSON.stringify(row)).toBe(true);
  }
};

const findMaterialByName = async (
  request: any,
  name: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(
    async () => {
      const response = await materialsAPI.getMaterialsPagination(
        request,
        materialPaginationDto({ searchString: name }),
        accessToken,
      );
      expectNoServerError(response);
      return response;
    },
    (response) => getRows<ApiRow>(response.data).some((row) => row.name === name),
    { attempts: 8, intervalMs: 500 },
  );

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const findProductByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const createIsolatedProduct = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<ApiRow & { id: number; designation: string }> => {
  const payload = productPayload(suffix);
  const create = await productsAPI.createProduct(request, payload, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findProductByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  expect(created, `Product ${payload.designation} was not found after create`).toBeTruthy();

  return { ...(created as ApiRow), id, designation: String(payload.designation), name: String(payload.name) };
};

const createIsolatedBuyer = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<number> => {
  const create = await companiesAPI.createCompany(request, companyPayload(suffix), accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);
  const id = Number(create.data?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return id;
};

const createIsolatedShipment = async (
  request: any,
  accessToken?: string,
): Promise<{ shipmentId: number; productId: number; buyerId: number }> => {
  const suffix = uniqueApiSuffix('deficit-shipment');
  const product = await createIsolatedProduct(request, suffix, accessToken);
  const buyerId = await createIsolatedBuyer(request, suffix, accessToken);

  const create = await shipmentsAPI.createShipment(request, shipmentPayload(suffix, product, buyerId), accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const shipmentId = Number(getQueueData(create.data)?.id);
  expect(shipmentId, JSON.stringify(create.data)).toBeGreaterThan(0);

  return { shipmentId, productId: product.id, buyerId };
};

const archiveIsolatedShipment = async (
  request: any,
  fixture: { shipmentId?: number; productId?: number; buyerId?: number },
  accessToken?: string,
) => {
  if (fixture.shipmentId) {
    const archiveShipment = await shipmentsAPI.deleteShipment(request, fixture.shipmentId, accessToken);
    expectNoServerError(archiveShipment);
  }
  if (fixture.productId) {
    const archiveProduct = await productsAPI.deleteProduct(request, fixture.productId, accessToken);
    expectNoServerError(archiveProduct);
  }
  if (fixture.buyerId) {
    const archiveBuyer = await companiesAPI.banCompany(request, fixture.buyerId, accessToken);
    expectNoServerError(archiveBuyer);
  }
};

const createIsolatedMaterial = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ typeId: number; subtypeId: number; materialId: number; materialName: string }> => {
  const typeResponse = await materialsAPI.createTypeMaterial(
    request,
    { name: `API Deficit Type Material ${suffix}`, characteristics: typeCharacteristics(), instance_type: 1 },
    accessToken,
  );
  expectNoServerError(typeResponse);
  expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
  const typeId = Number(typeResponse.data.id);
  expect(typeId, JSON.stringify(typeResponse.data)).toBeGreaterThan(0);

  const subtypeResponse = await materialsAPI.createSubtypeMaterial(
    request,
    {
      name: `API Deficit Subtype Material ${suffix}`,
      density: 8,
      id: null,
      instance_type: 1,
      parentMaterialIds: [typeId],
    },
    accessToken,
  );
  expectNoServerError(subtypeResponse);
  expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
  const subtypeId = Number(subtypeResponse.data.id);
  expect(subtypeId, JSON.stringify(subtypeResponse.data)).toBeGreaterThan(0);

  const payload = materialPayload(suffix, typeId, subtypeId);
  const materialName = String(payload.name);
  const createMaterial = await materialsAPI.createAndUpdateMaterial(request, payload, accessToken);
  expectNoServerError(createMaterial);
  expect(successCodes, JSON.stringify(createMaterial.data)).toContain(createMaterial.status);

  const created = await findMaterialByName(request, materialName, accessToken);
  expect(created, `Материал ${materialName} не найден после создания`).toBeTruthy();
  const materialId = Number(createMaterial.data?.id ?? created!.id);
  expect(materialId, JSON.stringify(createMaterial.data)).toBeGreaterThan(0);

  return { typeId, subtypeId, materialId, materialName };
};

const archiveIsolatedMaterial = async (
  request: any,
  material: { typeId?: number; subtypeId?: number; materialId?: number },
  accessToken?: string,
) => {
  if (material.materialId) {
    const archiveMaterial = await materialsAPI.banMaterial(request, material.materialId, accessToken);
    expectNoServerError(archiveMaterial);
  }

  if (material.subtypeId) {
    const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, material.subtypeId, accessToken);
    expectNoServerError(archiveSubtype);
  }

  if (material.typeId) {
    const archiveType = await materialsAPI.removeTypeMaterial(request, material.typeId, accessToken);
    expectNoServerError(archiveType);
  }
};

export const runDeficitsAPINew = () => {
  logger.info('Starting Deficits API coverage suite');

  test.describe('Deficits API: таблицы и материалы', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает таблицу дефицитов и дефициты материалов', async ({ request }) => {
      const table = await deficitsAPI.getDeficitTable(request, accessToken);
      expectNoServerError(table);
      if (!clientErrorCodes.includes(table.status)) {
        expect(successCodes, JSON.stringify(table.data)).toContain(table.status);
        for (const row of getRows<ApiRow>(table.data)) {
          expectDeficitTableShape(row);
        }
      }

      for (const working of ['metall', 'assemble', '', 'unknown-working-type']) {
        const materials = await deficitsAPI.getMaterialDeficits(request, { working }, accessToken);
        expectNoServerError(materials);
        if (!clientErrorCodes.includes(materials.status)) {
          expect(successCodes, JSON.stringify(materials.data)).toContain(materials.status);
          expect(Array.isArray(getRows(materials.data)), JSON.stringify(materials.data)).toBe(true);
          for (const row of getRows<ApiRow>(materials.data)) {
            expectMaterialDeficitRowShape(row);
          }
        }
      }
    });

    test('обновляет и восстанавливает строку таблицы дефицитов', async ({ request }) => {
      const table = await deficitsAPI.getDeficitTable(request, accessToken);
      expectNoServerError(table);
      test.skip(clientErrorCodes.includes(table.status), 'Deficit table недоступна.');

      const row = getRows<ApiRow>(table.data).find((item) => item.id);
      test.skip(!row, 'В таблице дефицитов нет строк для безопасного update/restore.');

      const id = Number(row!.id);
      const originalMin = Number(row!.minRemainder);
      const originalRecommended = Number(row!.recommendedRemainder);
      const nextMin = originalMin + 1;
      const nextRecommended = Math.max(nextMin, originalRecommended + 1);

      try {
        const update = await deficitsAPI.updateDeficitTable(
          request,
          { id, minRemainder: nextMin, recommendedRemainder: nextRecommended },
          accessToken,
        );
        expectNoServerError(update);
        expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

        const updatedTable = await deficitsAPI.getDeficitTable(request, accessToken);
        expectNoServerError(updatedTable);
        const updatedRow = getRows<ApiRow>(updatedTable.data).find((item) => Number(item.id) === id);
        expect(updatedRow, JSON.stringify(updatedTable.data)).toBeTruthy();
        expect(Number(updatedRow!.minRemainder), JSON.stringify(updatedRow)).toBe(nextMin);
        expect(Number(updatedRow!.recommendedRemainder), JSON.stringify(updatedRow)).toBe(nextRecommended);
      } finally {
        const restore = await deficitsAPI.updateDeficitTable(
          request,
          { id, minRemainder: originalMin, recommendedRemainder: originalRecommended },
          accessToken,
        );
        expectNoServerError(restore);
      }
    });

    test('читает принадлежность и отгрузки по изолированному материалу', async ({ request }) => {
      const material = await createIsolatedMaterial(request, uniqueApiSuffix('deficit-relations'), accessToken);

      try {
        const parents = await deficitsAPI.getMaterialParents(request, material.materialId, accessToken);
        expectNoServerError(parents);
        if (!clientErrorCodes.includes(parents.status)) {
          expectMaterialParentsContract(parents.data);
        }

        const shipments = await deficitsAPI.getMaterialShipmentAttractions(request, material.materialId, accessToken);
        expectNoServerError(shipments);
        if (!clientErrorCodes.includes(shipments.status)) {
          expectMaterialShipmentsContract(shipments.data);
        }
      } finally {
        await archiveIsolatedMaterial(request, material, accessToken);
      }
    });

    test('невалидное обновление таблицы дефицитов не считается успешным', async ({ request }) => {
      const invalidUpdate = await deficitsAPI.updateDeficitTable(
        request,
        { id: 'bad-id', minRemainder: 'bad', recommendedRemainder: null },
        accessToken,
      );
      expectClientError(invalidUpdate);
    });

    test('maintenance-пересчет дефицитов достигает endpoint', async ({ request }) => {
      const response = await captureApiResult(() => deficitsAPI.updateAllDeficits(request, accessToken));
      expectEndpointReached(response);
    });

    test('materials/shipments/:id/:type возвращает данные без серверной ошибки', async ({ request }) => {
      const shipment = await createIsolatedShipment(request, accessToken);

      try {
        const response = await deficitsAPI.getMaterialForShipment(request, shipment.shipmentId, 'cbed', accessToken);
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
          expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
        }
      } finally {
        await archiveIsolatedShipment(request, shipment, accessToken);
      }
    });
  });

  test.describe.serial('Deficits API: тестовый материал и архив', () => {
    test.describe.configure({ timeout: 150000 });

    let accessToken: string;
    let createdTypeId: number | undefined;
    let createdSubtypeId: number | undefined;
    let createdMaterialId: number | undefined;
    let createdMaterialName = '';

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

    test('создает материал и проверяет пустые deficit-связи нового материала', async ({ request }) => {
      const material = await createIsolatedMaterial(request, uniqueApiSuffix('deficit-material'), accessToken);
      createdTypeId = material.typeId;
      createdSubtypeId = material.subtypeId;
      createdMaterialId = material.materialId;
      createdMaterialName = material.materialName;

      const parents = await deficitsAPI.getMaterialParents(request, createdMaterialId, accessToken);
      expectNoServerError(parents);
      expectMaterialParentsContract(parents.data);
      const parentRows = getRows<ApiRow>(parents.data).filter((row) => row.type !== 'provider');
      expect(parentRows, JSON.stringify(parents.data)).toHaveLength(0);

      const shipments = await deficitsAPI.getMaterialShipmentAttractions(request, createdMaterialId, accessToken);
      expectNoServerError(shipments);
      expectMaterialShipmentsContract(shipments.data);
      expect(getRows(shipments.data), JSON.stringify(shipments.data)).toHaveLength(0);

      for (const working of ['metall', 'assemble']) {
        const materialDeficits = await deficitsAPI.getMaterialDeficits(request, { working }, accessToken);
        expectNoServerError(materialDeficits);
        expect(
          getRows<ApiRow>(materialDeficits.data).some((row) => Number(row.id) === createdMaterialId),
          JSON.stringify(materialDeficits.data),
        ).toBe(false);
      }
    });

    test('архивирует материал и проверяет, что active deficit-чтение остается стабильным', async ({ request }) => {
      expect(createdMaterialId).toBeTruthy();
      const materialId = createdMaterialId as number;

      const archive = await materialsAPI.banMaterial(request, materialId, accessToken);
      expectNoServerError(archive);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);

      const activeSearch = await eventually(
        async () => {
          const response = await materialsAPI.getMaterialsPagination(
            request,
            materialPaginationDto({ searchString: createdMaterialName }),
            accessToken,
          );
          expectNoServerError(response);
          return response;
        },
        (response) => !getRows<ApiRow>(response.data).some((row) => Number(row.id) === materialId),
        { attempts: 8, intervalMs: 500 },
      );
      expect(activeSearch, `Материал ${materialId} остался в активной выдаче`).toBeTruthy();

      for (const working of ['metall', 'assemble']) {
        const materialDeficits = await deficitsAPI.getMaterialDeficits(request, { working }, accessToken);
        expectNoServerError(materialDeficits);
        expect(
          getRows<ApiRow>(materialDeficits.data).some((row) => Number(row.id) === materialId),
          JSON.stringify(materialDeficits.data),
        ).toBe(false);
      }

      createdMaterialId = undefined;
    });
  });
};
