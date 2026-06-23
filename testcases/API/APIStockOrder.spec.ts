import { test, expect } from '@playwright/test';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { StockOrderAPI } from '../../pages/API/APIStockOrder';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type StockOrderLike = Record<string, any>;
type StockOrderItemLike = Record<string, any>;

const detailsAPI = new DetailsAPI(null);
const productsAPI = new ProductsAPI(null as any);
const stockOrderAPI = new StockOrderAPI(null);

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const expectStockOrderShape = (stockOrder: StockOrderLike) => {
  expect(stockOrder).toBeTruthy();
  expect(typeof stockOrder.id, JSON.stringify(stockOrder)).toBe('number');
  expect(stockOrder.number_order, JSON.stringify(stockOrder)).toBeTruthy();
};

const expectStockOrderItemShape = (item: StockOrderItemLike) => {
  expect(item).toBeTruthy();
  expect(typeof item.id, JSON.stringify(item)).toBe('number');
  expect(item.stock_order_id ?? item.stockOrderId, JSON.stringify(item)).toBeTruthy();
};

const stockOrderPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  typeFilter: 1,
  searchString: '',
  modelsInclude: '[]',
  dateRange: null,
  status: [],
  ...overrides,
});

const stockOrderArchivePaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  searchString: '',
  modelsInclude: '[]',
  dateRange: null,
  status: [],
  ...overrides,
});

const stockOrderToWayPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  dateRange: null,
  type: null,
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

const stockOrderPayload = (entityType: string, entityId: number, suffix: string) => ({
  workersComplect: [
    {
      my_kolvo: 1,
      shipments_kolvo: 0,
      object_id: entityId,
      warehouseReadinessDate: null,
    },
  ],
  workersData: {
    date_order: new Date().toISOString(),
    number_order: `API-STOCK-${suffix}`,
    description: `Created by API autotest ${suffix}`,
    type: entityType,
  },
});

const findActiveEntity = async (
  request: any,
  accessToken?: string,
): Promise<{ id: number; type: 'product' | 'detal' } | undefined> => {
  const products = await productsAPI.getAllProducts(request, productPaginationDto(), accessToken);
  expectNoServerError(products);

  const product = getRows(products.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  if (product) return { id: Number(product.id), type: 'product' };

  const details = await detailsAPI.getPaginationDetails(request, detailPaginationDto(), API_CONST.API_TEST_TABEL, accessToken);
  expectNoServerError(details);

  const detail = getRows(details.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  if (detail) return { id: Number(detail.id), type: 'detal' };

  return undefined;
};

const waitForStockOrderItems = async (
  request: any,
  stockOrderId: number,
  accessToken?: string,
): Promise<StockOrderItemLike[]> => {
  const response = await eventually(async () => {
    const response = await stockOrderAPI.getItemsByStockOrder(request, stockOrderId, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).length > 0, { attempts: 10, intervalMs: 700 });

  return response ? getRows(response.data) : [];
};

export const runStockOrderAPINew = () => {
  logger.info('Starting Stock Order API coverage suite');

  test.describe.serial('Stock Order API: жизненный цикл заказа склада', () => {
    test.describe.configure({ timeout: 150000 });

    let accessToken: string | undefined;
    let createdStockOrderId: number | undefined;
    let createdStockOrderItemId: number | undefined;
    let entity: { id: number; type: 'product' | 'detal' } | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      entity = await findActiveEntity(request, accessToken);
    });

    test.afterAll(async ({ request }) => {
      if (!createdStockOrderId) return;

      const archiveResponse = await stockOrderAPI.ban(request, createdStockOrderId, accessToken);
      expectNoServerError(archiveResponse);
    });

    test('создает заказ склада для доступной производственной сущности', async ({ request }) => {
      test.skip(!entity, 'No active product or detail is available for Stock Order create on this environment.');

      const suffix = uniqueApiSuffix('stock');
      const createResponse = await stockOrderAPI.create(
        request,
        stockOrderPayload(entity!.type, entity!.id, suffix),
        accessToken,
      );

      expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      const createData = getQueueData(createResponse.data);
      createdStockOrderId = Number(createData?.id);
      expect(createdStockOrderId, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
      expectStockOrderShape(createData);
      expect(createData.description).toBe(`Created by API autotest ${suffix}`);
      expect(createData.ban).toBe(false);
    });

    test('читает созданный заказ через one, pagination и связи с сущностью', async ({ request }) => {
      test.skip(!createdStockOrderId || !entity, 'Stock Order was not created.');

      const byId = await stockOrderAPI.getOne(
        request,
        { id: createdStockOrderId, itemsSearchString: '', light: false },
        accessToken,
      );
      expect(byId.status).toBe(200);
      expectStockOrderShape(byId.data);
      expect(byId.data.id).toBe(createdStockOrderId);

      const items = await waitForStockOrderItems(request, createdStockOrderId as number, accessToken);
      if (items.length > 0) {
        expectStockOrderItemShape(items[0]);
      }

      const pagination = await stockOrderAPI.getPagination(
        request,
        stockOrderPaginationDto({ searchString: byId.data.number_order }),
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdStockOrderId)).toBe(true);

      const byObject = await stockOrderAPI.getByObject(request, entity!.id, entity!.type, accessToken);
      expectNoServerError(byObject);
      if (!clientErrorCodes.includes(byObject.status)) {
        expect(successCodes).toContain(byObject.status);
        expect(Array.isArray(byObject.data), JSON.stringify(byObject.data)).toBe(true);
      }

      const byEntity = await stockOrderAPI.getItemsByEntity(request, entity!.type, entity!.id, accessToken);
      expectNoServerError(byEntity);
      if (!clientErrorCodes.includes(byEntity.status)) {
        expect(successCodes).toContain(byEntity.status);
        expect(Array.isArray(byEntity.data), JSON.stringify(byEntity.data)).toBe(true);
      }
    });

    test('обновляет заказ и позицию заказа склада без серверных ошибок', async ({ request }) => {
      test.skip(!createdStockOrderId, 'Stock Order was not created.');

      const updateResponse = await stockOrderAPI.update(
        request,
        createdStockOrderId as number,
        { description: 'Updated by API autotest' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateResponse.data)).toContain(updateResponse.status);
      expectNoServerError(updateResponse);
      expect(updateResponse.data?.id).toBe(createdStockOrderId);
      expect(updateResponse.data?.description).toBe('Updated by API autotest');

      const items = await waitForStockOrderItems(request, createdStockOrderId as number, accessToken);
      if (items.length === 0) return;

      createdStockOrderItemId = Number(items[0].id);
      expectStockOrderItemShape(items[0]);

      const itemResponse = await stockOrderAPI.getItem(request, createdStockOrderItemId, accessToken);
      expectNoServerError(itemResponse);
      if (!clientErrorCodes.includes(itemResponse.status)) {
        expect(successCodes).toContain(itemResponse.status);
        expect(itemResponse.data?.id, JSON.stringify(itemResponse.data)).toBe(createdStockOrderItemId);
      }

      const updateItemResponse = await stockOrderAPI.updateItem(
        request,
        {
          id: createdStockOrderItemId,
          description: 'Updated item by API autotest',
          countShipments: Number(items[0].count_shipments || 1),
        },
        accessToken,
      );
      expectNoServerError(updateItemResponse);
      if (!clientErrorCodes.includes(updateItemResponse.status)) {
        expect(successCodes).toContain(updateItemResponse.status);
        expect(updateItemResponse.data?.id).toBe(createdStockOrderItemId);
      }

      const readinessResponse = await stockOrderAPI.setWarehouseReadinessDate(
        request,
        {
          stockOrderItemId: createdStockOrderItemId,
          date: null,
        },
        accessToken,
      );
      expectNoServerError(readinessResponse);

      for (const date of [
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ]) {
        const dateResponse = await stockOrderAPI.setWarehouseReadinessDate(
          request,
          {
            stockOrderItemId: createdStockOrderItemId,
            date,
          },
          accessToken,
        );
        expectNoServerError(dateResponse);
      }
    });

    test('архивирует заказ склада и проверяет архивную выдачу', async ({ request }) => {
      test.skip(!createdStockOrderId, 'Stock Order was not created.');
      const stockOrderId = createdStockOrderId as number;

      if (createdStockOrderItemId) {
        const archiveItemResponse = await stockOrderAPI.banItem(request, createdStockOrderItemId, accessToken);
        expectNoServerError(archiveItemResponse);
      }

      const archiveResponse = await stockOrderAPI.ban(request, stockOrderId, accessToken);
      expect(successCodes, JSON.stringify(archiveResponse.data)).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const archived = await stockOrderAPI.getPaginationByArchive(
        request,
        true,
        stockOrderArchivePaginationDto({ stockOrderIds: [stockOrderId] }),
        accessToken,
      );
      expectNoServerError(archived);
      if (!clientErrorCodes.includes(archived.status)) {
        expect(successCodes).toContain(archived.status);
        expect(getRows(archived.data).some((row) => row.id === stockOrderId)).toBe(true);
      }

      if (entity) {
        const byEntity = await stockOrderAPI.getItemsByEntity(request, entity.type, entity.id, accessToken);
        expectNoServerError(byEntity);
      }

      createdStockOrderId = undefined;
      createdStockOrderItemId = undefined;
    });
  });

  test.describe('Stock Order API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает count, all и основные пагинации без серверных ошибок', async ({ request }) => {
      const count = await stockOrderAPI.getCount(request, accessToken);
      expect(count.status).toBe(200);
      expect(typeof Number(count.data), JSON.stringify(count.data)).toBe('number');

      const allActive = await stockOrderAPI.getAll(request, false, accessToken);
      expectNoServerError(allActive);
      if (!clientErrorCodes.includes(allActive.status)) {
        expect(successCodes).toContain(allActive.status);
        expect(Array.isArray(allActive.data), JSON.stringify(allActive.data)).toBe(true);
      }

      const mainPagination = await stockOrderAPI.getPagination(request, stockOrderPaginationDto(), accessToken);
      expect(mainPagination.status).toBe(201);
      expect(getCount(mainPagination.data), JSON.stringify(mainPagination.data)).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(getRows(mainPagination.data)), JSON.stringify(mainPagination.data)).toBe(true);

      const archivePagination = await stockOrderAPI.getPaginationByArchive(
        request,
        false,
        stockOrderArchivePaginationDto(),
        accessToken,
      );
      expect(archivePagination.status).toBe(201);
      expect(getCount(archivePagination.data), JSON.stringify(archivePagination.data)).toBeGreaterThanOrEqual(0);

      const orderPagination = await stockOrderAPI.getOrderPagination(request, stockOrderToWayPaginationDto(), accessToken);
      expect(orderPagination.status).toBe(201);
      expect(getCount(orderPagination.data), JSON.stringify(orderPagination.data)).toBeGreaterThanOrEqual(0);
    });

    test('пагинация поддерживает пустой результат со стабильной структурой', async ({ request }) => {
      const response = await stockOrderAPI.getPagination(
        request,
        stockOrderPaginationDto({ searchString: 'api-stock-order-no-match-999999999' }),
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
    });

    test('пагинации заказов склада поддерживают граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await stockOrderAPI.getPagination(
        request,
        stockOrderPaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);

      const farPage = await stockOrderAPI.getPagination(
        request,
        stockOrderPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('защитные searchString payload не приводят к серверным ошибкам', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await stockOrderAPI.getPagination(request, stockOrderPaginationDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });

    test('создание заказа отклоняет невалидный payload без серверных ошибок', async ({ request }) => {
      const response = await stockOrderAPI.create(
        request,
        {
          workersData: { date_order: '', number_order: '', description: '', type: 'detal' },
          workersComplect: [],
        },
        accessToken,
      );

      expectNotSuccessful(response);
    });

    test('операции с несуществующими id не приводят к серверным ошибкам', async ({ request }) => {
      const byStockOrder = await stockOrderAPI.getItemsByStockOrder(request, 999999999, accessToken);
      expectNoServerError(byStockOrder);

      const byObject = await stockOrderAPI.getByObject(request, 999999999, 'product', accessToken);
      expectNoServerError(byObject);

      const byEntity = await stockOrderAPI.getItemsByEntity(request, 'product', 999999999, accessToken);
      expectNoServerError(byEntity);

      const updateResponse = await stockOrderAPI.update(
        request,
        999999999,
        { description: 'nonexistent stock order' },
        accessToken,
      );
      expectNotSuccessful(updateResponse);
    });

    test('мутации заказа склада без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await stockOrderAPI.create(
        request,
        {
          workersData: { date_order: new Date().toISOString(), number_order: `NOAUTH-${uniqueApiSuffix('stock')}`, type: 'detal' },
          workersComplect: [{ my_kolvo: 1, shipments_kolvo: 0, object_id: 999999999 }],
        },
      );
      expectNotSuccessful(createResponse);

      const archiveResponse = await stockOrderAPI.ban(request, 999999999);
      expectNotSuccessful(archiveResponse);
    });
  });
};
