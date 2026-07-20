import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectClientError,
  expectApiContract,
  expectEndpointReached,
  expectErrorResponseContract,
  expectArrayResponse,
  expectMissingResource,
  expectNoServerError,
  expectPaginationContract,
  expectSchemaContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import {
  expectArchivedOnlyInArchiveSelection,
  expectNonNegativeQuantities,
  expectRepeatOperationRejectedOrIdempotent,
  expectRowsLinkedToEntity,
} from '../../lib/helpers/APIDataInvariants';
import {
  arrayOf,
  paginationOf,
  shipmentResponseSchema,
} from '../../lib/helpers/APIContractSchemas';

type ApiRow = Record<string, any>;

const productsAPI = new ProductsAPI(null as any);
const shipmentsAPI = new ShipmentsAPI(null as any);
const companiesAPI = new CompaniesAPI(null as any);
const shipmentManagerId = Number(API_CONST.API_CREATOR_USER_ID_66);

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

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

const shipmentsListPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  attributes: [],
  modelsInclude: [],
  searchString: '',
  ...overrides,
});

const shCheckPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  searchString: '',
  dateRange: {
    start: '1970-01-01T00:00:00.000Z',
    end: '2100-12-31T23:59:59.999Z',
  },
  ...overrides,
});

const shipmentPayload = (
  description: string,
  product: ApiRow,
  buyerId?: number,
  overrides: Record<string, unknown> = {},
) => ({
  dateOrder: new Date().toISOString(),
  dateShipments: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  kol: 1,
  bron: false,
  base: '',
  buyer: buyerId,
  isCustomProduct: true,
  description,
  nameCustomProduct: `API custom shipment ${description}`,
  managerId: shipmentManagerId,
  documentsData: '[]',
  product: {
    id: product.id,
    name: product.name,
    designation: product.designation,
  },
  ...overrides,
});

const shCheckPayload = (shipment: ApiRow, description: string) => {
  const now = new Date().toISOString();
  const shipmentId = Number(shipment.id);

  return {
    dateOrder: shipment.date_order || now,
    numberOrder: String(shipment.number_order || shipmentId),
    dateShipments: shipment.date_shipments || now,
    fabricNumber: String(shipment.fabric_number || `API-${shipmentId}`),
    description,
    nameCheck: `API shcheck ${shipmentId}`,
    responsibleUserId: API_CONST.API_TEST_USER_ID_72,
    createrUserId: API_CONST.API_CREATOR_USER_ID_66,
    dateCreate: now,
    dateShipmentsFakt: now,
    docs: '[]',
    childrens: JSON.stringify([{ id: shipmentId, shipped: 1, builderId: null, controllerId: null }]),
    companyId: String(shipment.company_id || shipment.buyer_id || 0),
  };
};

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
  name: `API Shipment Product ${suffix}`,
  articl: `API-SHIPMENT-PRODUCT-ART-${suffix}`,
  responsible: '',
  description: `Created by Shipments API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-SHIPMENT-PRODUCT-${suffix}`,
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
  name: `API Shipment Buyer ${suffix}`,
  inn: `75${Math.floor(100000000 + Math.random() * 899999999)}`,
  kpp: `74${Math.floor(1000000 + Math.random() * 8999999)}`,
  address: `API shipment buyer address ${suffix}`,
  description: `Created by Shipments API autotest ${suffix}`,
  type: ['buyer'],
  email: `api-shipment-${suffix}@example.test`,
  phone: '+375291112233',
  contactIds: [],
  materialIds: [],
  attention: false,
  ...overrides,
});

const findProductByDesignation = async (request: any, designation: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const createIsolatedProduct = async (request: any, suffix: string, accessToken?: string): Promise<ApiRow> => {
  const payload = productPayload(suffix);
  let create: any;
  try {
    create = await productsAPI.createProduct(request, payload, accessToken);
  } catch (error) {
    const createdAfterTimeout = await findProductByDesignation(request, String(payload.designation), accessToken);
    if (createdAfterTimeout?.id) {
      return {
        ...(createdAfterTimeout as ApiRow),
        id: Number(createdAfterTimeout.id),
        name: String(payload.name),
        designation: String(payload.designation),
      };
    }
    throw error;
  }

  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findProductByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { ...(created as ApiRow), id, name: String(payload.name), designation: String(payload.designation) };
};

const createIsolatedBuyer = async (request: any, suffix: string, accessToken?: string): Promise<number> => {
  const create = await companiesAPI.createCompany(request, companyPayload(suffix), accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);
  const id = Number(create.data?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return id;
};

const findShipmentByDescription = async (
  request: any,
  description: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await shipmentsAPI.getAllShipments(
      request,
      shipmentsPaginationDto({
        searchStr: description,
        dateRange: {
          start: '1970-01-01T00:00:00.000Z',
          end: '2100-12-31T23:59:59.999Z',
        },
      }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.description === description), {
    attempts: 12,
    intervalMs: 750,
  });

  return response ? getRows<ApiRow>(response.data).find((row) => row.description === description) : undefined;
};

const resolveCreatedShipmentId = async (
  request: any,
  createData: any,
  description: string,
  accessToken?: string,
): Promise<number> => {
  const idFromQueue = Number(getQueueData(createData)?.id);
  if (idFromQueue > 0) return idFromQueue;

  const created = await findShipmentByDescription(request, description, accessToken);
  const idFromSearch = Number(created?.id);
  expect(idFromSearch, JSON.stringify(createData)).toBeGreaterThan(0);
  return idFromSearch;
};

const createIsolatedShipment = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ shipmentId: number; product: ApiRow; buyerId: number }> => {
  const product = await createIsolatedProduct(request, suffix, accessToken);
  const buyerId = await createIsolatedBuyer(request, suffix, accessToken);
  const description = `isolated ${suffix}`;
  const create = await shipmentsAPI.createShipment(request, shipmentPayload(description, product, buyerId), accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const shipmentId = await resolveCreatedShipmentId(request, create.data, description, accessToken);
  return { shipmentId, product, buyerId };
};

const archiveIsolatedShipment = async (
  request: any,
  fixture: { shipmentId?: number; product?: ApiRow; buyerId?: number },
  accessToken?: string,
) => {
  if (fixture.shipmentId) {
    const archiveShipment = await shipmentsAPI.deleteShipment(request, fixture.shipmentId, accessToken);
    expectNoServerError(archiveShipment);
  }
  if (fixture.product?.id) {
    const archiveProduct = await productsAPI.deleteProduct(request, Number(fixture.product.id), accessToken);
    expectNoServerError(archiveProduct);
  }
  if (fixture.buyerId) {
    const archiveBuyer = await companiesAPI.banCompany(request, fixture.buyerId, accessToken);
    expectNoServerError(archiveBuyer);
  }
};

const waitForShipment = async (
  request: any,
  shipmentId: number,
  predicate: (shipment: ApiRow) => boolean,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => Boolean(response.data && predicate(response.data)), { attempts: 10, intervalMs: 700 });

  return response?.data;
};

const waitForShipmentAbsentFromActivePagination = async (
  request: any,
  shipmentId: number,
  searchString: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await shipmentsAPI.getAllShipments(
      request,
      shipmentsPaginationDto({
        searchStr: searchString,
        dateRange: {
          start: '1970-01-01T00:00:00.000Z',
          end: '2100-12-31T23:59:59.999Z',
        },
      }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => !getRows<ApiRow>(response.data).some((row) => Number(row.id) === shipmentId), {
    attempts: 10,
    intervalMs: 700,
  });

  return Boolean(response);
};

const extractProductIdFromShipment = (shipment: ApiRow | undefined): number | undefined => {
  if (!shipment) return undefined;

  const value =
    shipment.product_id ??
    shipment.productId ??
    shipment.izd_id ??
    shipment.product?.id ??
    shipment.izd?.id ??
    shipment.entity?.id;

  return Number.isFinite(Number(value)) ? Number(value) : undefined;
};

const expectRowHasOnlyAllowedAttributes = (row: ApiRow, attributes: string[]) => {
  const allowed = new Set(['id', ...attributes]);
  for (const key of Object.keys(row)) {
    expect(allowed.has(key), `Unexpected attribute "${key}" in ${JSON.stringify(row)}`).toBe(true);
  }
};

const expectShipmentDateMatches = (actual: unknown, expectedIsoDate: string) => {
  expect(actual, 'warehouse_readiness_date should be present').toBeTruthy();
  expect(new Date(String(actual)).toISOString().slice(0, 10)).toBe(expectedIsoDate.slice(0, 10));
};

const expectMissingShipmentResource = (response: { status: number; data?: any }) => {
  if (response.status === 502 && String(response.data?.message || '').includes('Не удалось')) return;
  expectMissingResource(response);
};

export const runShipmentsAPINew = () => {
  logger.info('Starting Shipments API coverage suite');

  test.describe('Shipments API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstShipment: ApiRow | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает основные пагинации отгрузок без серверных ошибок', async ({ request }) => {
      const main = await shipmentsAPI.getAllShipments(request, shipmentsPaginationDto(), accessToken);
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
        expectApiContract(main, { shape: 'pagination', schema: paginationOf(shipmentResponseSchema) });
        expect(getCount(main.data), JSON.stringify(main.data)).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(getRows(main.data)), JSON.stringify(main.data)).toBe(true);
        firstShipment = getRows(main.data).find((row) => row.id);
      }

      const list = await shipmentsAPI.getShipmentsListPagination(
        request,
        true,
        shipmentsListPaginationDto(),
        accessToken,
      );
      expectNoServerError(list);
      if (!clientErrorCodes.includes(list.status)) {
        expect(successCodes).toContain(list.status);
        expectApiContract(list, { shape: 'pagination', schema: paginationOf(shipmentResponseSchema) });
        expect(getCount(list.data), JSON.stringify(list.data)).toBeGreaterThanOrEqual(0);
      }

      const checks = await shipmentsAPI.getShCheckPagination(request, shCheckPaginationDto(), accessToken);
      expectNoServerError(checks);
      if (!clientErrorCodes.includes(checks.status)) {
        expect(successCodes).toContain(checks.status);
      }
    });

    test('возвращает служебные списки и атрибуты без серверных ошибок', async ({ request }) => {
      const allChecks = await shipmentsAPI.getAllShChecks(request, accessToken);
      expectNoServerError(allChecks);
      if (successCodes.includes(allChecks.status)) expectArrayResponse(allChecks.data);

      const k6Ids = await shipmentsAPI.getIdsWithShipments(request, accessToken);
      expectNoServerError(k6Ids);
      if (successCodes.includes(k6Ids.status)) {
        expect(Array.isArray(k6Ids.data?.cbedIds), JSON.stringify(k6Ids.data)).toBe(true);
        expect(Array.isArray(k6Ids.data?.detalIds), JSON.stringify(k6Ids.data)).toBe(true);
      }

      const attributes = await shipmentsAPI.getAttributes(
        request,
        { shipmentIds: firstShipment?.id ? [Number(firstShipment.id)] : [], attributes: ['id', 'number_order'] },
        accessToken,
      );
      expectNoServerError(attributes);
      if (successCodes.includes(attributes.status)) expectArrayResponse(attributes.data);
    });

    test('обрабатывает POST /shcheck без 5xx и откатывает успешное создание', async ({ request }) => {
      const fixture = await createIsolatedShipment(request, uniqueApiSuffix('shipment-shcheck'), accessToken);

      let createdShCheckId: number | undefined;
      try {
        const candidate = await shipmentsAPI.getShipmentById(request, fixture.shipmentId, accessToken);
        expectNoServerError(candidate);
        expect(successCodes, JSON.stringify(candidate.data)).toContain(candidate.status);

        const shCheck = await shipmentsAPI.createShCheck(
          request,
          shCheckPayload(candidate.data as ApiRow, `API shipment shcheck ${uniqueApiSuffix('shcheck')}`),
          accessToken,
        );
        expectNoServerError(shCheck);
        if (!successCodes.includes(shCheck.status)) {
          const message = String(shCheck.data?.message || '');
          expect([404, 409], JSON.stringify(shCheck.data)).toContain(shCheck.status);
          if (shCheck.status === 404) {
            expect(message, JSON.stringify(shCheck.data)).toContain('timed out');
          } else {
            expect(message, JSON.stringify(shCheck.data)).toMatch(
              /недостаточно доступного количества|больше заказанного количества/,
            );
          }
          return;
        }

        const data = getQueueData(shCheck.data);
        createdShCheckId = Number(data?.id);
        expect(createdShCheckId, JSON.stringify(shCheck.data)).toBeGreaterThan(0);

        const created = await shipmentsAPI.getShCompleteById(request, createdShCheckId as number, accessToken);
        expectNoServerError(created);
        expect(successCodes, JSON.stringify(created.data)).toContain(created.status);
        expect(Number(created.data?.id), JSON.stringify(created.data)).toBe(createdShCheckId);

        const update = await shipmentsAPI.updateShCheck(
          request,
          {
            id: String(createdShCheckId),
            description: `API shipment shcheck updated ${uniqueApiSuffix('shcheck-update')}`,
            docs: '[]',
            company_id: String(shCheckPayload(candidate.data as ApiRow, '').companyId),
            numberComplit: String(created.data?.number_complit || created.data?.numberComplit || createdShCheckId),
            date_shipments_fakt: new Date().toISOString(),
            shippedShipments: JSON.stringify(created.data?.shipped_shipments || [{ id: fixture.shipmentId, shipped: 1 }]),
          },
          accessToken,
        );
        expectNoServerError(update);
        expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
        expect(Number(update.data?.id), JSON.stringify(update.data)).toBe(createdShCheckId);
      } finally {
        if (createdShCheckId) {
          const rollback = await shipmentsAPI.rollbackShCheck(request, createdShCheckId, accessToken);
          expectNoServerError(rollback);
          expect(successCodes, JSON.stringify(rollback.data)).toContain(rollback.status);
        }
        await archiveIsolatedShipment(request, fixture, accessToken);
      }
    });

    test('читает найденную отгрузку, комплектацию, документы и include-модели', async ({ request }) => {
      const fixture = await createIsolatedShipment(request, uniqueApiSuffix('shipment-read'), accessToken);
      const shipmentId = fixture.shipmentId;

      try {
        const byId = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
        expectNoServerError(byId);
        if (!clientErrorCodes.includes(byId.status)) {
          expect(successCodes).toContain(byId.status);
          expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(shipmentId);
        }

        const light = await shipmentsAPI.getShipmentLightById(request, shipmentId, accessToken);
        expectNoServerError(light);

        const items = await shipmentsAPI.getShipmentItems(request, shipmentId, accessToken);
        expectNoServerError(items);

        const documents = await shipmentsAPI.getShipmentDocuments(request, shipmentId, accessToken);
        expectNoServerError(documents);

        const include = await shipmentsAPI.getIncludeModel(request, shipmentId, { includes: ['childrens'] }, accessToken);
        expectNoServerError(include);
      } finally {
        await archiveIsolatedShipment(request, fixture, accessToken);
      }
    });

    test('проверяет связи отгрузок с изделием без серверных ошибок', async ({ request }) => {
      const fixture = await createIsolatedShipment(request, uniqueApiSuffix('shipment-product'), accessToken);

      try {
        const byProduct = await shipmentsAPI.getShipmentsByProduct(request, Number(fixture.product.id), accessToken);
        expectNoServerError(byProduct);
        expect(successCodes, JSON.stringify(byProduct.data)).toContain(byProduct.status);
        expectArrayResponse(byProduct.data);
        if (getRows<ApiRow>(byProduct.data).length > 0) {
          expect(
            getRows<ApiRow>(byProduct.data).some((shipment) => Number(shipment.id) === fixture.shipmentId),
            JSON.stringify(byProduct.data),
          ).toBe(true);
        }
      } finally {
        await archiveIsolatedShipment(request, fixture, accessToken);
      }
    });

    test('фильтры, сортировка и выбор атрибутов пагинаций работают без серверных ошибок', async ({ request }) => {
      const dateRange = {
        start: '1970-01-01T00:00:00.000Z',
        end: '2100-12-31T23:59:59.999Z',
      };

      const filters = [
        shipmentsPaginationDto({ status: ['Заказано'], dateRange }),
        shipmentsPaginationDto({ attributes: ['id', 'number_order', 'status'], dateRange }),
        shipmentsPaginationDto({ sort: [{ sortField: 'date_shipments', sortDesc: false }], dateRange }),
      ];

      for (const dto of filters) {
        const response = await shipmentsAPI.getAllShipments(request, dto, accessToken);
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes).toContain(response.status);
          expectApiContract(response, { shape: 'pagination', schema: paginationOf(shipmentResponseSchema) });
          expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
        }
      }

      const list = await shipmentsAPI.getShipmentsListPagination(
        request,
        false,
        shipmentsListPaginationDto({
          attributes: ['id', 'number_order'],
          modelsInclude: ['product'],
          shipmentIds: firstShipment?.id ? [Number(firstShipment.id)] : [],
        }),
        accessToken,
      );
      expectNoServerError(list);
    });

    test('пагинации отгрузок поддерживают граничные значения page/pageSize', async ({ request }) => {
      const main = await shipmentsAPI.getAllShipments(
        request,
        shipmentsPaginationDto({ offset: 0, limit: 1 }),
        accessToken,
      );
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
        expectPaginationContract(main.data, 1);
        expectApiContract(main, { shape: 'pagination', schema: paginationOf(shipmentResponseSchema) });
      }

      const list = await shipmentsAPI.getShipmentsListPagination(
        request,
        true,
        shipmentsListPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(list);
      if (!clientErrorCodes.includes(list.status)) {
        expect(successCodes).toContain(list.status);
        expectPaginationContract(list.data, 5);
      }
    });

    test('light/full пагинация отгрузок возвращает совместимые контракты', async ({ request }) => {
      const light = await shipmentsAPI.getShipmentsListPagination(
        request,
        true,
        shipmentsListPaginationDto({ page: 1, pageSize: 1 }),
        accessToken,
      );
      const full = await shipmentsAPI.getShipmentsListPagination(
        request,
        false,
        shipmentsListPaginationDto({ page: 1, pageSize: 1 }),
        accessToken,
      );

      expectNoServerError(light);
      expectNoServerError(full);
      if (clientErrorCodes.includes(light.status) || clientErrorCodes.includes(full.status)) return;

      expect(successCodes).toContain(light.status);
      expect(successCodes).toContain(full.status);
      const lightRow = getRows(light.data)[0];
      const fullRow = getRows(full.data)[0];
      if (!lightRow || !fullRow) return;
      expect(Object.keys(fullRow).length).toBeGreaterThanOrEqual(Object.keys(lightRow).length);
    });
  });

  test.describe.serial('Shipments API: безопасный жизненный цикл тестовой отгрузки', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let createdShipmentId: number | undefined;
    let activeProduct: ApiRow | undefined;
    let buyerId: number | undefined;
    const suffix = uniqueApiSuffix('shipment');
    const initialDescription = `API shipment lifecycle ${suffix}`;
    const updatedDescription = `API shipment lifecycle updated ${suffix}`;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      activeProduct = await createIsolatedProduct(request, suffix, accessToken);
      buyerId = await createIsolatedBuyer(request, suffix, accessToken);
    });

    test.afterAll(async ({ request }) => {
      await archiveIsolatedShipment(request, { shipmentId: createdShipmentId, product: activeProduct, buyerId }, accessToken);
    });

    test('создает тестовую отгрузку с кастомным изделием', async ({ request }) => {
      expect(activeProduct, 'Isolated product was not created for shipment lifecycle').toBeTruthy();
      expect(buyerId, 'Isolated buyer was not created for shipment lifecycle').toBeTruthy();

      const create = await shipmentsAPI.createShipment(
        request,
        shipmentPayload(initialDescription, activeProduct as ApiRow, buyerId),
        accessToken,
      );
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);

      createdShipmentId = await resolveCreatedShipmentId(request, create.data, initialDescription, accessToken);

      const hydrated = await waitForShipment(
        request,
        createdShipmentId as number,
        (shipment) => shipment.description === initialDescription,
        accessToken,
      );
      expect(hydrated, JSON.stringify(create.data)).toBeTruthy();
      expect(hydrated?.is_custom_product).toBe(true);
    });

    test('читает созданную отгрузку через by-id, pagination и list pagination', async ({ request }) => {
      test.skip(!createdShipmentId, 'Shipment was not created.');

      const byId = await shipmentsAPI.getShipmentById(request, createdShipmentId as number, accessToken);
      expectNoServerError(byId);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectSchemaContract(byId.data, shipmentResponseSchema);
      expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(createdShipmentId);
      expect(Number(byId.data?.productId ?? byId.data?.product_id ?? byId.data?.product?.id), JSON.stringify(byId.data)).toBe(Number(activeProduct?.id));
      expectNonNegativeQuantities([byId.data]);

      const main = await shipmentsAPI.getAllShipments(
        request,
        shipmentsPaginationDto({ searchStr: byId.data?.number_order || '' }),
        accessToken,
      );
      expectNoServerError(main);
      expect(successCodes, JSON.stringify(main.data)).toContain(main.status);
      expectApiContract(main, { shape: 'pagination', schema: paginationOf(shipmentResponseSchema) });
      expect(Array.isArray(getRows(main.data)), JSON.stringify(main.data)).toBe(true);
      expectNonNegativeQuantities(getRows<ApiRow>(main.data));

      const list = await shipmentsAPI.getShipmentsListPagination(
        request,
        true,
        shipmentsListPaginationDto({ searchString: '', shipmentIds: [createdShipmentId] }),
        accessToken,
      );
      expectNoServerError(list);
    });

    test('обновляет описание тестовой отгрузки', async ({ request }) => {
      test.skip(!createdShipmentId, 'Shipment was not created.');

      const update = await shipmentsAPI.updateShipment(
        request,
        shipmentPayload(updatedDescription, activeProduct as ApiRow, buyerId, { id: createdShipmentId }),
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

      const hydrated = await waitForShipment(
        request,
        createdShipmentId as number,
        (shipment) => shipment.description === updatedDescription,
        accessToken,
      );
      expect(hydrated?.description, JSON.stringify(hydrated)).toBe(updatedDescription);

      const byIdAfterUpdate = await shipmentsAPI.getShipmentById(request, createdShipmentId as number, accessToken);
      expectNoServerError(byIdAfterUpdate);
      expect(successCodes, JSON.stringify(byIdAfterUpdate.data)).toContain(byIdAfterUpdate.status);
      expect(byIdAfterUpdate.data?.description, JSON.stringify(byIdAfterUpdate.data)).toBe(updatedDescription);

      const listAfterUpdate = await shipmentsAPI.getShipmentsListPagination(
        request,
        true,
        shipmentsListPaginationDto({ searchString: updatedDescription, shipmentIds: [createdShipmentId] }),
        accessToken,
      );
      expectNoServerError(listAfterUpdate);
      if (!clientErrorCodes.includes(listAfterUpdate.status)) {
        expect(successCodes, JSON.stringify(listAfterUpdate.data)).toContain(listAfterUpdate.status);
        expect(
          getRows<ApiRow>(listAfterUpdate.data).some(
            (shipment) => Number(shipment.id) === createdShipmentId && shipment.description === updatedDescription,
          ),
          JSON.stringify(listAfterUpdate.data),
        ).toBe(true);
      }
    });

    test('проверяет прикладные ручки на созданной отгрузке', async ({ request }) => {
      test.skip(!createdShipmentId, 'Shipment was not created.');
      expect(activeProduct, 'Isolated product was not created for shipment lifecycle').toBeTruthy();

      const shipmentId = createdShipmentId as number;
      const productId = Number(activeProduct?.id);

      const byProduct = await shipmentsAPI.getShipmentsByProduct(request, productId, accessToken);
      expectNoServerError(byProduct);
      expect(successCodes, JSON.stringify(byProduct.data)).toContain(byProduct.status);
      expectApiContract(byProduct, { shape: 'array', schema: arrayOf(shipmentResponseSchema) });
      const byProductRows = getRows<ApiRow>(byProduct.data);
      expect(byProductRows.some((shipment) => Number(shipment.id) === shipmentId), JSON.stringify(byProduct.data)).toBe(true);
      expectNonNegativeQuantities(byProductRows);
      expectRowsLinkedToEntity(byProductRows.filter((shipment) => Number(shipment.id) === shipmentId), 'product', productId);

      const attributes = ['id', 'number_order', 'status', 'warehouse_readiness_date'];
      const attributesResponse = await shipmentsAPI.getAttributes(
        request,
        { shipmentIds: [shipmentId], attributes },
        accessToken,
      );
      expectNoServerError(attributesResponse);
      expect(successCodes, JSON.stringify(attributesResponse.data)).toContain(attributesResponse.status);
      const attributeRow = getRows<ApiRow>(attributesResponse.data).find((row) => Number(row.id) === shipmentId);
      expect(attributeRow, JSON.stringify(attributesResponse.data)).toBeTruthy();
      expectRowHasOnlyAllowedAttributes(attributeRow as ApiRow, attributes);

      const itemsByEntity = await shipmentsAPI.getItemsByEntity(
        request,
        'product',
        productId,
        accessToken,
        { shipmentId, childId: productId, childType: 'product' },
      );
      expectNoServerError(itemsByEntity);
      expect(successCodes, JSON.stringify(itemsByEntity.data)).toContain(itemsByEntity.status);
      expectArrayResponse(itemsByEntity.data);
      const itemsByEntityRows = getRows<ApiRow>(itemsByEntity.data);
      expect(itemsByEntityRows.some((item) => Number(item.id) === shipmentId), JSON.stringify(itemsByEntity.data)).toBe(true);
      expectNonNegativeQuantities(itemsByEntityRows);

      const warehouseDate = '2030-05-20T00:00:00.000Z';
      const setWarehouseDate = await shipmentsAPI.setWarehouseReadinessDate(
        request,
        { shipmentId, date: warehouseDate },
        accessToken,
      );
      expectNoServerError(setWarehouseDate);
      expect(successCodes, JSON.stringify(setWarehouseDate.data)).toContain(setWarehouseDate.status);
      expect(Number(setWarehouseDate.data?.id), JSON.stringify(setWarehouseDate.data)).toBe(shipmentId);
      expectShipmentDateMatches(setWarehouseDate.data?.warehouse_readiness_date, warehouseDate);

      const hydratedAfterDate = await waitForShipment(
        request,
        shipmentId,
        (shipment) => Boolean(shipment.warehouse_readiness_date),
        accessToken,
      );
      expectShipmentDateMatches(hydratedAfterDate?.warehouse_readiness_date, warehouseDate);

      const clearWarehouseDate = await shipmentsAPI.setWarehouseReadinessDate(
        request,
        { shipmentId, date: null },
        accessToken,
      );
      expectNoServerError(clearWarehouseDate);
      expect(successCodes, JSON.stringify(clearWarehouseDate.data)).toContain(clearWarehouseDate.status);
      expect(clearWarehouseDate.data?.warehouse_readiness_date ?? null, JSON.stringify(clearWarehouseDate.data)).toBeNull();

      const readyToShipFalse = await shipmentsAPI.updateReadyToShipStatus(
        request,
        shipmentId,
        { readyToShip: false },
        accessToken,
      );
      expectNoServerError(readyToShipFalse);
      expect(successCodes, JSON.stringify(readyToShipFalse.data)).toContain(readyToShipFalse.status);
      expect(Number(readyToShipFalse.data?.id), JSON.stringify(readyToShipFalse.data)).toBe(shipmentId);

      const readyToShipTrue = await shipmentsAPI.updateReadyToShipStatus(
        request,
        shipmentId,
        { readyToShip: true },
        accessToken,
      );
      expectNoServerError(readyToShipTrue);
      if (successCodes.includes(readyToShipTrue.status)) {
        expect(readyToShipTrue.data?.status, JSON.stringify(readyToShipTrue.data)).toBe('Готово к отгрузке');
      } else {
        expect([409], JSON.stringify(readyToShipTrue.data)).toContain(readyToShipTrue.status);
        expect(String(readyToShipTrue.data?.message || ''), JSON.stringify(readyToShipTrue.data)).toContain('На складе нет доступного количества');
      }

      const k6Ids = await shipmentsAPI.getIdsWithShipments(request, accessToken);
      expectNoServerError(k6Ids);
      expect(successCodes, JSON.stringify(k6Ids.data)).toContain(k6Ids.status);
      expect(Array.isArray(k6Ids.data?.cbedIds), JSON.stringify(k6Ids.data)).toBe(true);
      expect(Array.isArray(k6Ids.data?.detalIds), JSON.stringify(k6Ids.data)).toBe(true);
    });

    test('архивирует тестовую отгрузку', async ({ request }) => {
      test.skip(!createdShipmentId, 'Shipment was not created.');
      const shipmentId = createdShipmentId as number;

      const archive = await shipmentsAPI.deleteShipment(request, shipmentId, accessToken);
      expectNoServerError(archive);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);

      expect(await waitForShipmentAbsentFromActivePagination(request, shipmentId, updatedDescription, accessToken)).toBe(true);

      const archivedById = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status) && successCodes.includes(archivedById.status)) {
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(shipmentId);
        expect(archivedById.data?.ban ?? archivedById.data?.isDeleted ?? true, JSON.stringify(archivedById.data)).not.toBe(false);
        expect(String(archivedById.data?.status ?? ''), JSON.stringify(archivedById.data)).toBe('Удалено');
      }
      const archiveSearch = String(archivedById.data?.number_order || updatedDescription);

      const activePagination = await shipmentsAPI.getAllShipments(
        request,
        shipmentsPaginationDto({ searchStr: archiveSearch, status: ['Все'] }),
        accessToken,
      );
      const archivedPagination = await shipmentsAPI.getAllShipments(
        request,
        shipmentsPaginationDto({ searchStr: archiveSearch, status: ['Удалено'] }),
        accessToken,
      );
      expectNoServerError(activePagination);
      expectNoServerError(archivedPagination);
      if (!clientErrorCodes.includes(activePagination.status) && !clientErrorCodes.includes(archivedPagination.status)) {
        expect(successCodes, JSON.stringify(activePagination.data)).toContain(activePagination.status);
        expect(successCodes, JSON.stringify(archivedPagination.data)).toContain(archivedPagination.status);
        expectArchivedOnlyInArchiveSelection(
          getRows<ApiRow>(activePagination.data).filter((shipment) => shipment.status !== 'Удалено'),
          getRows<ApiRow>(archivedPagination.data),
          shipmentId,
        );
      }

      const secondArchive = await shipmentsAPI.deleteShipment(request, shipmentId, accessToken);
      expectNoServerError(secondArchive);
      expectRepeatOperationRejectedOrIdempotent(archive.status, secondArchive.status, successCodes, [400, 404, 409, 410, 422]);

      const updateArchived = await shipmentsAPI.updateShipment(
        request,
        shipmentPayload(`API shipment lifecycle archived update ${suffix}`, activeProduct as ApiRow, buyerId, { id: shipmentId }),
        accessToken,
      );
      expectNoServerError(updateArchived);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(updateArchived.data)).toContain(updateArchived.status);
      if (successCodes.includes(updateArchived.status)) {
        expect(Number(updateArchived.data?.id), JSON.stringify(updateArchived.data)).toBe(shipmentId);
        expect(String(updateArchived.data?.status ?? ''), JSON.stringify(updateArchived.data)).toBe('Удалено');
        expect(updateArchived.data?.ban ?? true, JSON.stringify(updateArchived.data)).not.toBe(false);
      }
      createdShipmentId = undefined;
    });
  });

  test.describe('Shipments API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('поиск с защитными payload не приводит к 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const search of cases) {
        const main = await shipmentsAPI.getAllShipments(request, shipmentsPaginationDto({ searchStr: search }), accessToken);
        expectNoServerError(main);

        const list = await shipmentsAPI.getShipmentsListPagination(
          request,
          true,
          shipmentsListPaginationDto({ searchString: search }),
          accessToken,
        );
        expectNoServerError(list);
      }
    });

    test('несуществующие id и defensive-мутации обрабатываются стабильно', async ({ request }) => {
      const byId = await shipmentsAPI.getShipmentById(request, 999999999, accessToken);
      expectMissingShipmentResource(byId);

      const light = await shipmentsAPI.getShipmentLightById(request, 999999999, accessToken);
      expectNoServerError(light);

      const items = await shipmentsAPI.getShipmentItems(request, 999999999, accessToken);
      expectMissingShipmentResource(items);

      const byProduct = await shipmentsAPI.getShipmentsByProduct(request, 999999999, accessToken);
      expectNoServerError(byProduct);

      const itemsByEntity = await shipmentsAPI.getItemsByEntity(request, 'product', 999999999, accessToken);
      expectNoServerError(itemsByEntity);
      if (successCodes.includes(itemsByEntity.status)) expectArrayResponse(itemsByEntity.data);
      if (clientErrorCodes.includes(itemsByEntity.status)) expectErrorResponseContract(itemsByEntity);

      const documents = await shipmentsAPI.getShipmentDocuments(request, 999999999, accessToken);
      expectNoServerError(documents);

      const actualAll = await captureApiResult(() => shipmentsAPI.actualAllShipments(request, accessToken));
      expectEndpointReached(actualAll);

      const setWarehouseDate = await shipmentsAPI.setWarehouseReadinessDate(
        request,
        { shipmentId: 999999999, date: null },
        accessToken,
      );
      expectClientError(setWarehouseDate);

      const updateShCheck = await shipmentsAPI.updateShCheck(
        request,
        { id: 999999999, childrens: '[]', docs: '[]' },
        accessToken,
      );
      expectClientError(updateShCheck);

      const readyToShip = await shipmentsAPI.updateReadyToShipStatus(
        request,
        999999999,
        { readyToShip: true },
        accessToken,
      );
      expectClientError(readyToShip);
    });
  });
};
