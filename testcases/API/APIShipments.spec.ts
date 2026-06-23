import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const authAPI = new AuthAPI();
const productsAPI = new ProductsAPI(null as any);
const shipmentsAPI = new ShipmentsAPI(null as any);

const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;

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

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const expectNoServerError = (response: ApiResult) => {
  expect(serverErrorCodes, JSON.stringify(response.data)).not.toContain(response.status);
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

const shipmentPayload = (description: string, product: ApiRow, overrides: Record<string, unknown> = {}) => ({
  data: JSON.stringify({
    date_order: new Date().toISOString(),
    date_shipments: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    kol: 1,
    bron: false,
    base: '',
    buyer: null,
    is_custom_product: true,
    description,
    name_custom_product: `API custom shipment ${description}`,
    documentsData: '[]',
    product: {
      id: product.id,
      name: product.name,
      designation: product.designation,
    },
    ...overrides,
  }),
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

const findProductId = async (request: any, accessToken?: string): Promise<number | undefined> => {
  const response = await productsAPI.getAllProducts(request, productPaginationDto(), accessToken);
  expectNoServerError(response);

  const product = getRows(response.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  return product ? Number(product.id) : undefined;
};

const findActiveProduct = async (request: any, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await productsAPI.getAllProducts(request, productPaginationDto(), accessToken);
  expectNoServerError(response);

  return getRows(response.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
};

const waitForShipment = async (
  request: any,
  shipmentId: number,
  predicate: (shipment: ApiRow) => boolean,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const response = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
    expectNoServerError(response);

    if (response.data && predicate(response.data)) return response.data;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return undefined;
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

export const runShipmentsAPINew = () => {
  logger.info('Starting Shipments API coverage suite');

  test.describe('Shipments API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstShipment: ApiRow | undefined;
    let productId: number | undefined;

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

      productId = await findProductId(request, accessToken);
    });

    test('возвращает основные пагинации отгрузок без серверных ошибок', async ({ request }) => {
      const main = await shipmentsAPI.getAllShipments(request, shipmentsPaginationDto(), accessToken);
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
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

      const k6Ids = await shipmentsAPI.getIdsWithShipments(request, accessToken);
      expectNoServerError(k6Ids);

      const attributes = await shipmentsAPI.getAttributes(
        request,
        { shipmentIds: firstShipment?.id ? [Number(firstShipment.id)] : [], attributes: ['id', 'number_order'] },
        accessToken,
      );
      expectNoServerError(attributes);
    });

    test('читает найденную отгрузку, комплектацию, документы и include-модели', async ({ request }) => {
      if (!firstShipment) {
        const main = await shipmentsAPI.getAllShipments(request, shipmentsPaginationDto(), accessToken);
        expectNoServerError(main);
        firstShipment = getRows(main.data).find((row) => row.id);
      }

      test.skip(!firstShipment, 'No shipment rows are available on this environment.');
      const shipmentId = Number(firstShipment!.id);

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
    });

    test('проверяет связи отгрузок с изделием без серверных ошибок', async ({ request }) => {
      const shipmentProductId = extractProductIdFromShipment(firstShipment);
      const entityId = shipmentProductId ?? productId;

      test.skip(!entityId, 'No product is available for shipment relation checks.');

      const byProduct = await shipmentsAPI.getShipmentsByProduct(request, entityId as number, accessToken);
      expectNoServerError(byProduct);
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
  });

  test.describe.serial('Shipments API: безопасный жизненный цикл тестовой отгрузки', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let createdShipmentId: number | undefined;
    let activeProduct: ApiRow | undefined;
    const suffix = `${Date.now()}`;
    const initialDescription = `API shipment lifecycle ${suffix}`;
    const updatedDescription = `API shipment lifecycle updated ${suffix}`;

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

      activeProduct = await findActiveProduct(request, accessToken);
    });

    test.afterAll(async ({ request }) => {
      if (!createdShipmentId) return;

      const archive = await shipmentsAPI.deleteShipment(request, createdShipmentId, accessToken);
      expectNoServerError(archive);
    });

    test('создает тестовую отгрузку с кастомным изделием', async ({ request }) => {
      test.skip(!activeProduct, 'No active product is available for shipment lifecycle checks.');

      const create = await shipmentsAPI.createShipment(
        request,
        shipmentPayload(initialDescription, activeProduct as ApiRow),
        accessToken,
      );
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);

      const data = getQueueData(create.data);
      createdShipmentId = Number(data?.id);
      expect(createdShipmentId, JSON.stringify(create.data)).toBeGreaterThan(0);

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
      expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(createdShipmentId);

      const main = await shipmentsAPI.getAllShipments(
        request,
        shipmentsPaginationDto({ searchStr: byId.data?.number_order || '' }),
        accessToken,
      );
      expectNoServerError(main);
      expect(successCodes, JSON.stringify(main.data)).toContain(main.status);
      expect(Array.isArray(getRows(main.data)), JSON.stringify(main.data)).toBe(true);

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
        shipmentPayload(updatedDescription, activeProduct as ApiRow, { id: createdShipmentId }),
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
    });

    test('архивирует тестовую отгрузку', async ({ request }) => {
      test.skip(!createdShipmentId, 'Shipment was not created.');

      const archive = await shipmentsAPI.deleteShipment(request, createdShipmentId as number, accessToken);
      expectNoServerError(archive);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      createdShipmentId = undefined;
    });
  });

  test.describe('Shipments API: defensive-сценарии', () => {
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
      expect(byId.status, JSON.stringify(byId.data)).toBeGreaterThanOrEqual(400);

      const light = await shipmentsAPI.getShipmentLightById(request, 999999999, accessToken);
      expectNoServerError(light);

      const items = await shipmentsAPI.getShipmentItems(request, 999999999, accessToken);
      expect(items.status, JSON.stringify(items.data)).toBeGreaterThanOrEqual(400);

      const byProduct = await shipmentsAPI.getShipmentsByProduct(request, 999999999, accessToken);
      expectNoServerError(byProduct);

      const documents = await shipmentsAPI.getShipmentDocuments(request, 999999999, accessToken);
      expectNoServerError(documents);

      const setWarehouseDate = await shipmentsAPI.setWarehouseReadinessDate(
        request,
        { shipmentItemId: 999999999, date: null },
        accessToken,
      );
      expectNoServerError(setWarehouseDate);
    });
  });
};
