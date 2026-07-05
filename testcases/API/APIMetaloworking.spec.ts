import { test, expect } from '@playwright/test';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { MetaloworkingAPI } from '../../pages/API/APIMetaloworking';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectClientError,
  expectEndpointReached,
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

type ApiRow = Record<string, any>;

const detailsAPI = new DetailsAPI(null);
const metaloworkingAPI = new MetaloworkingAPI(null);
const testUserId = API_CONST.API_TEST_TABEL;

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const byParents = (overrides: Record<string, unknown> = {}) => ({
  productIds: [],
  cbedIds: [],
  detalIds: [],
  ...overrides,
});

const byOrder = () => ({
  orderId: null,
  customer: null,
});

const metaloworkingPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  responsibleUserId: null,
  metalloworkingID: null,
  searchString: '',
  isBan: false,
  childrenByProductionTaskIds: [],
  byParents: byParents(),
  byOrder: byOrder(),
  isDiscontinued: false,
  sort: [],
  ...overrides,
});

const metaloworkingOperationPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  operationId: null,
  searchString: '',
  status: 'all',
  byParents: byParents(),
  byOrder: byOrder(),
  sort: [],
  ...overrides,
});

const metaloworkingComingDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  filters: 'all',
  parentData: {
    parentType: null,
    parentId: null,
  },
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

const detailPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Metaloworking Detail ${suffix}`,
  designation: `API-METALOWORKING-DETAIL-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `Created by Metaloworking API autotest ${suffix}`,
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
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await detailsAPI.getPaginationDetails(
      request,
      detailPaginationDto({ searchString: designation }),
      testUserId,
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const createIsolatedDetail = async (request: any, suffix: string, accessToken?: string): Promise<ApiRow> => {
  const payload = detailPayload(suffix);
  const create = await detailsAPI.createDetail(request, payload, testUserId, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findDetailByDesignation(request, String(payload.designation), accessToken);
  const id = Number(getQueueData(create.data)?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { ...(created as ApiRow), id, designation: String(payload.designation), name: String(payload.name) };
};

const metaloworkingPayload = (suffix: string, detailId: number, overrides: Record<string, unknown> = {}) => ({
  numberOrder: `API-METAL-${suffix}`,
  myKolvo: 1,
  description: `API metaloworking ${suffix}`,
  detalId: detailId,
  actionSendlerId: Number(API_CONST.API_TEST_TABEL),
  ...overrides,
});

const findMetaloworkingByDetail = async (
  request: any,
  detailId: number,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await metaloworkingAPI.getPagination(
      request,
      metaloworkingPaginationDto({ byParents: byParents({ detalIds: [detailId] }) }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => Number(row.detal_id ?? row.detalId) === detailId));

  return response
    ? getRows<ApiRow>(response.data).find((row) => Number(row.detal_id ?? row.detalId) === detailId)
    : undefined;
};

const createIsolatedMetaloworking = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ detail: ApiRow; metaloworkingId: number }> => {
  const detail = await createIsolatedDetail(request, suffix, accessToken);
  const create = await metaloworkingAPI.create(request, metaloworkingPayload(suffix, Number(detail.id)), accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findMetaloworkingByDetail(request, Number(detail.id), accessToken);
  const metaloworkingId = Number(create.data?.id ?? created?.id);
  expect(metaloworkingId, JSON.stringify(create.data)).toBeGreaterThan(0);
  return { detail, metaloworkingId };
};

const archiveIsolatedMetaloworking = async (
  request: any,
  fixture: { detail?: ApiRow; metaloworkingId?: number },
  accessToken?: string,
) => {
  if (fixture.metaloworkingId) {
    const archiveMetaloworking = await metaloworkingAPI.delete(request, fixture.metaloworkingId, accessToken);
    expectNoServerError(archiveMetaloworking);
  }
  if (fixture.detail?.id) {
    const archiveDetail = await detailsAPI.deleteDetail(request, String(fixture.detail.id), testUserId, accessToken);
    expectNoServerError(archiveDetail);
  }
};

export const runMetaloworkingAPINew = () => {
  logger.info('Starting Metaloworking API coverage suite');

  test.describe('Metaloworking API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstMetaloworking: ApiRow | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает основную страницу металлообработки без серверных ошибок', async ({ request }) => {
      const response = await metaloworkingAPI.getPagination(request, metaloworkingPaginationDto(), accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
        firstMetaloworking = getRows(response.data).find((row) => row.id);
      }
    });

    test('возвращает приход и операции металлообработки без серверных ошибок', async ({ request }) => {
      const coming = await metaloworkingAPI.getComingPagination(request, metaloworkingComingDto(), accessToken);
      expectNoServerError(coming);

      const operations = await metaloworkingAPI.getOperationPagination(
        request,
        metaloworkingOperationPaginationDto(),
        accessToken,
      );
      expectNoServerError(operations);

      const complectation = await metaloworkingAPI.getComplectationOperationPagination(
        request,
        metaloworkingOperationPaginationDto(),
        accessToken,
      );
      expectNoServerError(complectation);
    });

    test('пагинации металлообработки поддерживают граничные значения page/pageSize', async ({ request }) => {
      const main = await metaloworkingAPI.getPagination(
        request,
        metaloworkingPaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
        expectPaginationContract(main.data, 1);
      }

      const operations = await metaloworkingAPI.getOperationPagination(
        request,
        metaloworkingOperationPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(operations);
      if (!clientErrorCodes.includes(operations.status)) {
        expect(successCodes).toContain(operations.status);
        expectPaginationContract(operations.data, 5);
      }
    });

    test('пагинации прихода и операций поддерживают пустой поиск', async ({ request }) => {
      const noMatch = 'api-metaloworking-no-match-999999999';
      const coming = await metaloworkingAPI.getComingPagination(
        request,
        metaloworkingComingDto({ searchString: noMatch }),
        accessToken,
      );
      expectNoServerError(coming);
      if (!clientErrorCodes.includes(coming.status)) {
        expect(successCodes).toContain(coming.status);
        expectPaginationContract(coming.data);
      }

      const operations = await metaloworkingAPI.getOperationPagination(
        request,
        metaloworkingOperationPaginationDto({ searchString: noMatch }),
        accessToken,
      );
      expectNoServerError(operations);
      if (!clientErrorCodes.includes(operations.status)) {
        expect(successCodes).toContain(operations.status);
        expectPaginationContract(operations.data);
      }
    });

    test('читает изолированную металлообработку по id и light endpoint', async ({ request }) => {
      const fixture = await createIsolatedMetaloworking(request, uniqueApiSuffix('metal-read'), accessToken);
      const metaloworkingId = fixture.metaloworkingId;

      try {
        const byId = await metaloworkingAPI.getById(request, metaloworkingId, accessToken);
        expectNoServerError(byId);
        if (!clientErrorCodes.includes(byId.status)) {
          expect(successCodes).toContain(byId.status);
          expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(metaloworkingId);
        }

        const light = await metaloworkingAPI.getByIdLight(request, metaloworkingId, accessToken);
        expectNoServerError(light);
        if (!clientErrorCodes.includes(light.status)) {
          expect(successCodes).toContain(light.status);
          expect(Number(light.data?.id), JSON.stringify(light.data)).toBe(metaloworkingId);
        }

        if (!clientErrorCodes.includes(byId.status) && !clientErrorCodes.includes(light.status)) {
          expect(Object.keys(byId.data || {}).length).toBeGreaterThanOrEqual(Object.keys(light.data || {}).length);
        }
      } finally {
        await archiveIsolatedMetaloworking(request, fixture, accessToken);
      }
    });

    test('проверяет связь изолированной металлообработки с деталью без серверных ошибок', async ({ request }) => {
      const fixture = await createIsolatedMetaloworking(request, uniqueApiSuffix('metal-detail'), accessToken);

      try {
        const byDetail = await metaloworkingAPI.getByDetalLight(request, Number(fixture.detail.id), accessToken);
        expectNoServerError(byDetail);
      } finally {
        await archiveIsolatedMetaloworking(request, fixture, accessToken);
      }
    });
  });

  test.describe('Metaloworking API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('поиск с защитными searchString payload не приводит к 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await metaloworkingAPI.getPagination(
          request,
          metaloworkingPaginationDto({ searchString }),
          accessToken,
        );
        expectNoServerError(response);
      }
    });

    test('несуществующие id и невалидные мутации не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await metaloworkingAPI.getById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const byDetail = await metaloworkingAPI.getByDetalLight(request, 999999999, accessToken);
      expectNoServerError(byDetail);

      const invalidCreate = await metaloworkingAPI.create(
        request,
        { numberOrder: '', myKolvo: 0, description: '', detalId: null },
        accessToken,
      );
      expectClientError(invalidCreate);

      const invalidUpdate = await metaloworkingAPI.update(
        request,
        { id: 999999999, numberOrder: '', myKolvo: 0, description: '', detalId: 999999999 },
        accessToken,
      );
      expectNoServerError(invalidUpdate);

      const comback = await metaloworkingAPI.comback(request, 999999999, accessToken);
      expectNoServerError(comback);

      const shapeBid = await captureApiResult(() => metaloworkingAPI.createShapeBid(request, [], accessToken));
      expectEndpointReached(shapeBid);
    });
  });
};
