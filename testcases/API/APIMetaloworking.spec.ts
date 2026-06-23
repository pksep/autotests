import { test, expect } from '@playwright/test';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { MetaloworkingAPI } from '../../pages/API/APIMetaloworking';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const detailsAPI = new DetailsAPI(null);
const metaloworkingAPI = new MetaloworkingAPI(null);

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

const findActiveDetailId = async (request: any, accessToken?: string): Promise<number | undefined> => {
  const response = await detailsAPI.getPaginationDetails(
    request,
    detailPaginationDto(),
    API_CONST.API_TEST_TABEL,
    accessToken,
  );
  expectNoServerError(response);

  const detail = getRows(response.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  return detail ? Number(detail.id) : undefined;
};

export const runMetaloworkingAPINew = () => {
  logger.info('Starting Metaloworking API coverage suite');

  test.describe('Metaloworking API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstMetaloworking: ApiRow | undefined;
    let activeDetailId: number | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      activeDetailId = await findActiveDetailId(request, accessToken);
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

    test('читает металлообработку по id и light endpoint, если в базе есть активная МО', async ({ request }) => {
      if (!firstMetaloworking) {
        const response = await metaloworkingAPI.getPagination(request, metaloworkingPaginationDto(), accessToken);
        expectNoServerError(response);
        firstMetaloworking = getRows(response.data).find((row) => row.id);
      }

      test.skip(!firstMetaloworking, 'No active metaloworking rows are available on this environment.');
      const metaloworkingId = Number(firstMetaloworking!.id);

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
    });

    test('проверяет связь металлообработки с деталью без серверных ошибок', async ({ request }) => {
      test.skip(!activeDetailId, 'No active detail is available for metaloworking relation checks.');

      const byDetail = await metaloworkingAPI.getByDetalLight(request, activeDetailId as number, accessToken);
      expectNoServerError(byDetail);
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
      expectNotSuccessful(invalidCreate);

      const invalidUpdate = await metaloworkingAPI.update(
        request,
        { id: 999999999, numberOrder: '', myKolvo: 0, description: '', detalId: 999999999 },
        accessToken,
      );
      expectNoServerError(invalidUpdate);

    });
  });
};
