import { test, expect } from '@playwright/test';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { StockOrderAPI } from '../../pages/API/APIStockOrder';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type DetailLike = Record<string, any>;
type StockOrderLike = Record<string, any>;
type StockOrderItemLike = Record<string, any>;

const detailsAPI = new DetailsAPI(null);
const stockOrderAPI = new StockOrderAPI(null);
const testUserId = API_CONST.API_TEST_TABEL;

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

const detailPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  listCbed: [],
  listDetal: [],
  isSortedByAttention: false,
  isSortedByDate: false,
  isSortedByOwn: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
  isSortedByOperations: false,
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

const expectedStockOrderType = (entityType: string) => (entityType === 'detal' ? 'metall' : entityType);

const detailPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Stock Detail ${suffix}`,
  designation: `API-STOCK-DETAIL-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `Created for Stock Order API autotest ${suffix}`,
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

const findDetailByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<DetailLike | undefined> => {
  const response = await eventually(async () => {
    const response = await detailsAPI.getPaginationDetails(request, detailPaginationDto({ searchString: designation }), testUserId, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<DetailLike>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const createIsolatedDetail = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ id: number; designation: string }> => {
  const payload = detailPayload(suffix);
  const designation = String(payload.designation);

  const createResponse = await detailsAPI.createDetail(request, payload, testUserId, accessToken);
  expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
  expectNoServerError(createResponse);

  const createData = getQueueData(createResponse.data);
  const created = await findDetailByDesignation(request, designation, accessToken);
  const detailId = Number(createData?.id ?? created?.id);

  expect(detailId, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
  expect(created, `Detail ${designation} was not found after create`).toBeTruthy();
  expect(created?.name).toBe(payload.name);
  expect(created?.ban).not.toBe(true);

  return { id: detailId, designation };
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

const waitForStockOrderById = async (
  request: any,
  stockOrderId: number,
  predicate: (stockOrder: StockOrderLike) => boolean,
  accessToken?: string,
): Promise<StockOrderLike | undefined> => {
  const response = await eventually(async () => {
    const response = await stockOrderAPI.getOne(request, { id: stockOrderId, itemsSearchString: '', light: false }, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => successCodes.includes(response.status) && response.data && predicate(response.data), { attempts: 10, intervalMs: 700 });

  return response?.data;
};

const waitForArchivedStockOrder = async (
  request: any,
  stockOrderId: number,
  accessToken?: string,
): Promise<StockOrderLike | undefined> => {
  const response = await eventually(async () => {
    const response = await stockOrderAPI.getOne(request, { id: stockOrderId, itemsSearchString: '', light: false }, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => successCodes.includes(response.status) && response.data?.id === stockOrderId && response.data?.ban === true, { attempts: 10, intervalMs: 700 });

  return response?.data;
};

const expectRowsContainId = (rows: StockOrderLike[], id: number, context: unknown) => {
  expect(rows.some((row) => Number(row.id) === id), JSON.stringify(context)).toBe(true);
};

const expectRowsContainStockOrderId = (rows: StockOrderLike[], stockOrderId: number, context: unknown) => {
  expect(
    rows.some((row) => Number(row.stock_order?.id ?? row.stockOrder?.id ?? row.stock_order_id ?? row.stockOrderId ?? row.id) === stockOrderId),
    JSON.stringify(context),
  ).toBe(true);
};

const getStockOrderItemEntityId = (item: StockOrderItemLike, entityType: string): number => {
  const value =
    item.object_id ??
    item.objectId ??
    (entityType === 'detal' ? item.detal_id : undefined) ??
    (entityType === 'product' ? item.product_id : undefined) ??
    (entityType === 'cbed' ? item.cbed_id : undefined);

  return Number(value);
};

export const runStockOrderAPINew = () => {
  logger.info('Starting Stock Order API coverage suite');

  test.describe.serial('Stock Order API: жизненный цикл заказа склада', () => {
    test.describe.configure({ timeout: 150000 });

    let accessToken: string | undefined;
    let createdStockOrderId: number | undefined;
    let createdStockOrderItemId: number | undefined;
    let createdDetailId: number | undefined;
    let createdDetailDesignation: string | undefined;
    let entity: { id: number; type: 'detal' } | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      const detail = await createIsolatedDetail(request, uniqueApiSuffix('stock-detail'), accessToken);
      createdDetailId = detail.id;
      createdDetailDesignation = detail.designation;
      entity = { id: detail.id, type: 'detal' };
    });

    test.afterAll(async ({ request }) => {
      if (createdStockOrderId) {
        const archiveResponse = await stockOrderAPI.ban(request, createdStockOrderId, accessToken);
        expectNoServerError(archiveResponse);
      }

      if (createdDetailId) {
        const archiveDetailResponse = await detailsAPI.deleteDetail(request, String(createdDetailId), testUserId, accessToken);
        expectNoServerError(archiveDetailResponse);
      }
    });

    test('создает заказ склада для доступной производственной сущности', async ({ request }) => {
      expect(entity, 'Isolated detail was not created for Stock Order suite').toBeTruthy();

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
      expect(createData.type ?? createData.type_object ?? createData.typeObject, JSON.stringify(createData)).toBe(expectedStockOrderType(entity!.type));
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
      expect(byId.data.description).toContain('Created by API autotest');

      const items = await waitForStockOrderItems(request, createdStockOrderId as number, accessToken);
      expect(items.length, `No stock order items were created for order ${createdStockOrderId}`).toBeGreaterThan(0);
      expectStockOrderItemShape(items[0]);
      createdStockOrderItemId = Number(items[0].id);
      expect(getStockOrderItemEntityId(items[0], entity!.type), JSON.stringify(items[0])).toBe(entity!.id);

      const pagination = await stockOrderAPI.getPagination(
        request,
        stockOrderPaginationDto({ searchString: byId.data.number_order }),
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expectRowsContainId(getRows(pagination.data), createdStockOrderId as number, pagination.data);

      const byObject = await stockOrderAPI.getByObject(request, entity!.id, entity!.type, accessToken);
      expectNoServerError(byObject);
      if (!clientErrorCodes.includes(byObject.status)) {
        expect(successCodes).toContain(byObject.status);
        expect(Array.isArray(byObject.data), JSON.stringify(byObject.data)).toBe(true);
        expectRowsContainStockOrderId(getRows(byObject.data), createdStockOrderId as number, byObject.data);
      }

      const byEntity = await stockOrderAPI.getItemsByEntity(request, entity!.type, entity!.id, accessToken);
      expectNoServerError(byEntity);
      if (!clientErrorCodes.includes(byEntity.status)) {
        expect(successCodes).toContain(byEntity.status);
        expect(Array.isArray(byEntity.data), JSON.stringify(byEntity.data)).toBe(true);
        expectRowsContainId(getRows(byEntity.data), createdStockOrderItemId as number, byEntity.data);
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

      const persistedOrder = await waitForStockOrderById(
        request,
        createdStockOrderId as number,
        (stockOrder) => stockOrder.description === 'Updated by API autotest',
        accessToken,
      );
      expect(persistedOrder, `Updated stock order ${createdStockOrderId} was not persisted`).toBeTruthy();
      expect(persistedOrder?.id).toBe(createdStockOrderId);

      const items = await waitForStockOrderItems(request, createdStockOrderId as number, accessToken);
      expect(items.length, `No stock order items were found for order ${createdStockOrderId}`).toBeGreaterThan(0);

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

      const updatedItemResponse = await stockOrderAPI.getItem(request, createdStockOrderItemId, accessToken);
      expectNoServerError(updatedItemResponse);
      if (!clientErrorCodes.includes(updatedItemResponse.status)) {
        expect(successCodes).toContain(updatedItemResponse.status);
        expect(updatedItemResponse.data?.id, JSON.stringify(updatedItemResponse.data)).toBe(createdStockOrderItemId);
        expect(updatedItemResponse.data?.description, JSON.stringify(updatedItemResponse.data)).toBe('Updated item by API autotest');
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
        if (!clientErrorCodes.includes(dateResponse.status)) {
          expect(successCodes).toContain(dateResponse.status);
        }
      }
    });

    test('архивирует заказ склада и проверяет архивную выдачу', async ({ request }) => {
      test.skip(!createdStockOrderId, 'Stock Order was not created.');
      const stockOrderId = createdStockOrderId as number;
      const beforeArchive = await stockOrderAPI.getOne(
        request,
        { id: stockOrderId, itemsSearchString: '', light: false },
        accessToken,
      );
      expectNoServerError(beforeArchive);
      expect(successCodes, JSON.stringify(beforeArchive.data)).toContain(beforeArchive.status);
      const stockOrderNumber = beforeArchive.data?.number_order;
      expect(stockOrderNumber, JSON.stringify(beforeArchive.data)).toBeTruthy();

      const archiveResponse = await stockOrderAPI.ban(request, stockOrderId, accessToken);
      expect(successCodes, JSON.stringify(archiveResponse.data)).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const archived = await waitForArchivedStockOrder(request, stockOrderId, accessToken);
      expect(archived, `Archived stock order ${stockOrderId} did not become ban=true on direct read`).toBeTruthy();
      expect(archived?.ban, JSON.stringify(archived)).toBe(true);

      const activeSearch = await stockOrderAPI.getPaginationByArchive(
        request,
        false,
        stockOrderArchivePaginationDto({ searchString: stockOrderNumber }),
        accessToken,
      );
      expectNoServerError(activeSearch);
      if (!clientErrorCodes.includes(activeSearch.status)) {
        expect(successCodes).toContain(activeSearch.status);
        expect(getRows(activeSearch.data).some((row) => row.id === stockOrderId), JSON.stringify(activeSearch.data)).toBe(false);
      }

      if (entity) {
        const byEntity = await stockOrderAPI.getItemsByEntity(request, entity.type, entity.id, accessToken);
        expectNoServerError(byEntity);
      }

      createdStockOrderId = undefined;
      createdStockOrderItemId = undefined;
      if (createdDetailDesignation) {
        const archiveDetailResponse = await detailsAPI.deleteDetail(request, String(entity!.id), testUserId, accessToken);
        expectNoServerError(archiveDetailResponse);
        createdDetailId = undefined;
      }
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
