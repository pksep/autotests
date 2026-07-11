import { APIRequestContext, expect, test } from '@playwright/test';
import { ENV } from '../../config';
import {
  expectNoServerError,
  expectUnauthorizedOrForbidden,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

type HealthMethod = 'GET' | 'POST';

type HealthProbe = {
  owner: string;
  title: string;
  method: HealthMethod;
  path: string;
  data?: Record<string, unknown>;
  allowClientError?: boolean;
};

type DataProbe = HealthProbe & {
  minRows?: number;
  minCount?: number;
};

type ApiResult = {
  status: number;
  data: unknown;
  headers: Record<string, string>;
};

const pageDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  pageSize: 5,
  searchString: '',
  ...overrides,
});

const actionsDto = (overrides: Record<string, unknown> = {}) => ({
  relativeActionType: 'assembly_kit',
  typeObject: null,
  offset: 0,
  searchString: '',
  ...overrides,
});

const archiveDto = () => pageDto();
const cbedDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  listCbed: '[]',
  isSortedByAttention: false,
  isSortedByDate: false,
  isSortedByOperations: false,
  isSortedByOwn: false,
  isDiscontinued: false,
  idsToIgnore: [],
  enableIsDiscontinuedView: false,
  ...overrides,
});
const materialDto = () => ({
  page: 0,
  instans: 1,
  searchString: '',
  typeMaterialId: null,
  subtypeMaterialId: null,
  filterByAttention: false,
  filterByTime: true,
});
const userDto = () => ({
  light: true,
  ban: false,
  searchSring: '',
  page: 1,
  ids: [],
});

const API_HEALTH_PROBES: HealthProbe[] = [
  { owner: 'LoginPage', title: 'auth token check', method: 'POST', path: 'api/auth/check', data: {} },
  { owner: 'ActionsPage', title: 'actions list', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto() },
  { owner: 'ArchivePage', title: 'archive products', method: 'POST', path: 'api/product/archive/', data: archiveDto() },
  { owner: 'AssemplyPage', title: 'assembly production list', method: 'POST', path: 'api/assemble/pagination', data: pageDto(), allowClientError: true },
  { owner: 'AssemplyWarehousePage', title: 'actual assembly warehouse orders', method: 'GET', path: 'api/assemble/complects' },
  { owner: 'CompleteSetsPage', title: 'complect kits list', method: 'POST', path: 'api/assemble/complectkit/getall/', data: pageDto(), allowClientError: true },
  { owner: 'CompletingAssembliesToPlanPage', title: 'assembly plan list', method: 'POST', path: 'api/assemble/asstoplan', data: pageDto({ workingType: 'assembly' }), allowClientError: true },
  { owner: 'CompletingProductsToPlanPage', title: 'production plan list', method: 'POST', path: 'api/production-task/by-plan', data: pageDto({ workingType: 'product' }), allowClientError: true },
  { owner: 'CreatePartsPage', title: 'material type list for part creation', method: 'GET', path: 'api/material/type-material' },
  { owner: 'CuttingOfCirclePage', title: 'metalworking operation list', method: 'POST', path: 'api/metaloworking/pagination/operations', data: pageDto(), allowClientError: true },
  { owner: 'LoadingTaskPage', title: 'stock orders pagination', method: 'POST', path: 'api/stock-order/pagination', data: pageDto() },
  { owner: 'LogisticsWarehouseProductionOfficePage', title: 'warehouse flags', method: 'GET', path: 'api/sclad/flags' },
  { owner: 'MaterialDeficitPage', title: 'material deficits', method: 'POST', path: 'api/deficits/materials', data: pageDto(), allowClientError: true },
  { owner: 'MaterialsDatabasePage', title: 'materials pagination', method: 'POST', path: 'api/material/material/pagination', data: materialDto() },
  { owner: 'MaterialShortageForPlanPage', title: 'detail deficit by production task', method: 'POST', path: 'api/production-task/detal/deficit', data: pageDto(), allowClientError: true },
  { owner: 'MaterialShortageForPlanPageCbed', title: 'assembly deficit by production task', method: 'POST', path: 'api/production-task/detal/deficit', data: pageDto({ type: 'cbed' }), allowClientError: true },
  { owner: 'MaterialStockPage', title: 'material stock remains', method: 'GET', path: 'api/sclad/remains/material' },
  { owner: 'MetalworkingPage', title: 'metalworking production list', method: 'POST', path: 'api/metaloworking/pagination', data: pageDto(), allowClientError: true },
  { owner: 'MetalworkingWarehousePage', title: 'metalworking coming list', method: 'POST', path: 'api/metaloworking/coming/pagination', data: pageDto() },
  { owner: 'MovementIzdCbDPage', title: 'movement-object history', method: 'POST', path: 'api/movement-object/history', data: pageDto(), allowClientError: true },
  { owner: 'OnlineScoreboardPage', title: 'online board list', method: 'POST', path: 'api/online-board/list', data: pageDto(), allowClientError: true },
  { owner: 'OrderedFromSuppliersPage', title: 'providers list', method: 'GET', path: 'api/provider' },
  { owner: 'OrderStatuPage', title: 'stock order statuses', method: 'GET', path: 'api/stock-order/all/false' },
  { owner: 'OverallAverageConsumptionPage', title: 'expenditure filters', method: 'POST', path: 'api/expenditure/by-params', data: pageDto(), allowClientError: true },
  { owner: 'PartsDatabasePage', title: 'details pagination', method: 'POST', path: 'api/detal/pagination', data: pageDto() },
  { owner: 'ProductionPage', title: 'production task count', method: 'GET', path: 'api/production-task/count' },
  { owner: 'ProductionTasksPage', title: 'production task list', method: 'POST', path: 'api/production-task/list', data: pageDto() },
  { owner: 'RevisionPage', title: 'warehouse flags for revision area', method: 'GET', path: 'api/sclad/flags' },
  { owner: 'SheetCuttingPage', title: 'metalworking pagination', method: 'POST', path: 'api/metaloworking/pagination', data: pageDto({ workingType: 'sheet' }), allowClientError: true },
  { owner: 'ShelvingPage', title: 'racks pagination', method: 'POST', path: 'api/rack/pagination', data: pageDto() },
  { owner: 'ShippedOrderOverviewPage', title: 'shipment checks', method: 'POST', path: 'api/shipments/shcheck/pagination', data: pageDto(), allowClientError: true },
  { owner: 'ShortageAssembliesPage', title: 'assembly shortage table', method: 'GET', path: 'api/deficits/table_deficit' },
  { owner: 'ShortagePartsPage', title: 'parts shortage table', method: 'GET', path: 'api/deficits/table_deficit' },
  { owner: 'ShortageProductPage', title: 'product shortage table', method: 'GET', path: 'api/deficits/table_deficit' },
  { owner: 'StockPage', title: 'warehouse stock remains', method: 'GET', path: 'api/sclad/remains/product' },
  { owner: 'StockReceiptFromSupplierAndProductionPage', title: 'waybill last', method: 'GET', path: 'api/waybill/last' },
  { owner: 'UsersPage', title: 'users pagination', method: 'POST', path: 'api/users/pagination/all', data: userDto() },
  { owner: 'WarehouseExpensesPage', title: 'warehouse expenditure', method: 'POST', path: 'api/expenditure/by-params', data: pageDto(), allowClientError: true },
  { owner: 'WarehouseTaskForShipmentPage', title: 'shipments pagination', method: 'POST', path: 'api/shipments/pagination', data: pageDto(), allowClientError: true },
  { owner: 'WasteStoragePage', title: 'warehouse remains for waste', method: 'POST', path: 'api/sclad/remains', data: pageDto({ type: 'waste' }), allowClientError: true },
];

const MODAL_HEALTH_PROBES: HealthProbe[] = [
  { owner: 'HistoryActionModal', title: 'history actions', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto({ relativeActionType: 'history' }), allowClientError: true },
  { owner: 'CompactHistoryActionModal', title: 'compact history actions', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto({ relativeActionType: 'history' }), allowClientError: true },
  { owner: 'UserInfoModal', title: 'user info', method: 'POST', path: 'api/users/one', data: { id: 1 }, allowClientError: true },
  { owner: 'InstrumentInformationModal', title: 'instrument information', method: 'POST', path: 'api/instrument/instrument/pagination', data: pageDto() },
  { owner: 'EquipmentFilterModal', title: 'equipment picker', method: 'POST', path: 'api/equipment/pagination/equipment', data: pageDto() },
  { owner: 'ToolFilterModal', title: 'tool picker', method: 'POST', path: 'api/instrument/instrument/pagination', data: pageDto() },
  { owner: 'AddOperationModal', title: 'operation type picker', method: 'GET', path: 'api/operation/typeoperation/true' },
  { owner: 'TechProcessModal', title: 'tech process lookup', method: 'GET', path: 'api/tech-process/1', allowClientError: true },
  { owner: 'ShortInformationModal', title: 'short information detail lookup', method: 'POST', path: 'api/detal/one', data: { id: 1, attributes: [], includes: [] }, allowClientError: true },
  { owner: 'ArchiveConfirmModal', title: 'archive confirmation dependency', method: 'POST', path: 'api/product/archive/', data: archiveDto() },
  { owner: 'UnsavedChangesConfirmModal', title: 'unsaved confirmation dependency', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto(), allowClientError: true },
];

const PAGE_TABLE_DATA_PROBES: DataProbe[] = [
  { owner: 'ActionsPage', title: 'actions table has rows', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto(), minRows: 1 },
  { owner: 'ArchivePage', title: 'product archive table source has rows', method: 'POST', path: 'api/product/archive/', data: archiveDto(), minRows: 1 },
  { owner: 'AssemplyWarehousePage', title: 'actual assembly warehouse orders has rows', method: 'GET', path: 'api/assemble/complects', minRows: 1 },
  { owner: 'LoadingTaskPage', title: 'stock orders table has rows', method: 'POST', path: 'api/stock-order/pagination', data: pageDto(), minRows: 1 },
  { owner: 'MaterialsDatabasePage', title: 'materials table has rows', method: 'POST', path: 'api/material/material/pagination', data: materialDto(), minRows: 1 },
  { owner: 'MetalworkingWarehousePage', title: 'metalworking warehouse table has rows', method: 'POST', path: 'api/metaloworking/coming/pagination', data: pageDto(), minRows: 1 },
  { owner: 'OrderedFromSuppliersPage', title: 'providers list has rows', method: 'GET', path: 'api/provider', minRows: 1 },
  { owner: 'OrderStatuPage', title: 'active stock orders list has rows', method: 'GET', path: 'api/stock-order/all/false', minRows: 1 },
  { owner: 'PartsDatabasePage', title: 'details table has rows', method: 'POST', path: 'api/detal/pagination', data: pageDto(), minRows: 1 },
  { owner: 'PartsDatabasePage', title: 'cbed table has rows', method: 'POST', path: 'api/cbed/pagination', data: cbedDto(), minRows: 1 },
  { owner: 'PartsDatabasePage', title: 'products table has rows', method: 'POST', path: 'api/product/pagination', data: pageDto(), minRows: 1 },
  { owner: 'ProductionPage', title: 'production task counter is positive', method: 'GET', path: 'api/production-task/count', minCount: 1 },
  { owner: 'ProductionTasksPage', title: 'production task list has rows', method: 'POST', path: 'api/production-task/list', data: pageDto(), minRows: 1 },
  { owner: 'ShelvingPage', title: 'racks table has rows', method: 'POST', path: 'api/rack/pagination', data: pageDto(), minRows: 1 },
  { owner: 'ShortageProductPage', title: 'deficit table has rows', method: 'GET', path: 'api/deficits/table_deficit', minRows: 1 },
  { owner: 'StockPage', title: 'warehouse product remains has rows', method: 'GET', path: 'api/sclad/remains/product', minRows: 1 },
  { owner: 'UsersPage', title: 'users table has rows', method: 'POST', path: 'api/users/pagination/all', data: userDto(), minRows: 1 },
];

const MODAL_TABLE_DATA_PROBES: DataProbe[] = [
  { owner: 'HistoryActionModal', title: 'history actions source has rows', method: 'POST', path: 'api/actions/get-by-params', data: actionsDto(), minRows: 1 },
  { owner: 'InstrumentInformationModal', title: 'instrument table has rows', method: 'POST', path: 'api/instrument/instrument/pagination', data: pageDto(), minRows: 1 },
  { owner: 'EquipmentFilterModal', title: 'equipment picker table has rows', method: 'POST', path: 'api/equipment/pagination/equipment', data: pageDto(), minRows: 1 },
  { owner: 'ToolFilterModal', title: 'tool picker table has rows', method: 'POST', path: 'api/instrument/instrument/pagination', data: pageDto(), minRows: 1 },
  { owner: 'AddOperationModal', title: 'operation type picker has rows', method: 'GET', path: 'api/operation/typeoperation/true', minRows: 1 },
];

const parseBody = async (response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<unknown> => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const headersFor = (accessToken: string, json: boolean) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${accessToken}`,
  Cookie: `access_token=${accessToken}; refresh_token=${accessToken}`,
  compress: 'no-compress',
});

const runProbe = async (request: APIRequestContext, probe: HealthProbe, accessToken: string): Promise<ApiResult> => {
  const url = ENV.API_BASE_URL + probe.path;
  const data = probe.path === 'api/auth/check' ? { token: accessToken } : probe.data;
  const options = {
    headers: headersFor(accessToken, probe.method === 'POST'),
    ...(data === undefined ? {} : { data }),
    timeout: 30000,
  };

  const response = probe.method === 'GET' ? await request.get(url, options) : await request.post(url, options);

  return {
    status: response.status(),
    data: await parseBody(response),
    headers: response.headers(),
  };
};

const expectHealthy = (response: ApiResult, probe: HealthProbe) => {
  expectNoServerError(response);

  if (!probe.allowClientError) {
    expect(successCodes, `${probe.owner}: ${probe.title}\n${JSON.stringify(response.data)}`).toContain(response.status);
  }
};

const expectDataPresent = (response: ApiResult, probe: DataProbe) => {
  expectHealthy(response, probe);

  const rows = getRows(response.data);
  const count = getCount(response.data);
  const expectedRows = probe.minRows ?? 0;
  const expectedCount = probe.minCount ?? expectedRows;
  const context = `${probe.owner}: ${probe.title}\n${JSON.stringify(response.data)}`;

  if (probe.minRows !== undefined) {
    expect(rows.length, context).toBeGreaterThanOrEqual(expectedRows);
  }

  if (probe.minCount !== undefined) {
    if (count !== undefined) {
      expect(count, context).toBeGreaterThanOrEqual(expectedCount);
    } else {
      const numericValue = typeof response.data === 'number' ? response.data : Number(response.data);
      expect(numericValue, context).toBeGreaterThanOrEqual(expectedCount);
    }
  }
};

const registerHealthTests = (groupTitle: string, probes: HealthProbe[], getAccessToken: () => string) => {
  test.describe(groupTitle, () => {
    for (const probe of probes) {
      test(`${probe.owner}: ${probe.title}`, async ({ request }) => {
        const response = await runProbe(request, probe, getAccessToken());
        expectHealthy(response, probe);
      });
    }
  });
};

const registerDataTests = (groupTitle: string, probes: DataProbe[], getAccessToken: () => string) => {
  test.describe(groupTitle, () => {
    for (const probe of probes) {
      test(`${probe.owner}: ${probe.title}`, async ({ request }) => {
        const response = await runProbe(request, probe, getAccessToken());
        expectDataPresent(response, probe);
      });
    }
  });
};

export const runHealthChecksAPINew = () => {
  logger.info('Starting API health checks for UI pages and modal windows');

  test.describe('API health checks: страницы и модальные окна', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    registerHealthTests('Страницы', API_HEALTH_PROBES, () => accessToken);
    registerHealthTests('Модальные окна', MODAL_HEALTH_PROBES, () => accessToken);
    registerDataTests('Данные таблиц страниц', PAGE_TABLE_DATA_PROBES, () => accessToken);
    registerDataTests('Данные таблиц модальных окон', MODAL_TABLE_DATA_PROBES, () => accessToken);

    test('defensive-сценарий: auth check отклоняет невалидный токен', async ({ request }) => {
      const response = await request.post(ENV.API_BASE_URL + 'api/auth/check', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid.jwt.token',
          compress: 'no-compress',
        },
        data: { token: 'invalid.jwt.token' },
      });

      const result = {
        status: response.status(),
        data: await parseBody(response),
        headers: response.headers(),
      };

      expectUnauthorizedOrForbidden(result);
    });
  });
};
