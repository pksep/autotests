import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { CBEDAPI } from '../../pages/API/APICBED';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data?: any;
};

type CbedLike = Record<string, any>;

const authAPI = new AuthAPI();
const cbedAPI = new CBEDAPI(null);

const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;
const testUserId = API_CONST.API_TEST_TABEL;

const extractAccessToken = (data: any): string | undefined => {
  if (!data || typeof data === 'string') return undefined;
  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

const getRows = (data: unknown): CbedLike[] => {
  if (Array.isArray(data)) return data as CbedLike[];
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

const expectNotSuccessful = (response: ApiResult) => {
  expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
  expectNoServerError(response);
};

const expectCbedShape = (cbed: CbedLike) => {
  expect(cbed).toBeTruthy();
  expect(typeof cbed.id, JSON.stringify(cbed)).toBe('number');
  expect(cbed.name ?? cbed.designation, JSON.stringify(cbed)).toBeTruthy();
};

const cbedPaginationDto = (overrides: Record<string, unknown> = {}) => ({
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

const remainsDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  relativeData: {
    parentType: null,
    parentId: null,
  },
  ...overrides,
});

const deficitDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  statusWorking: 'Все',
  cbedIds: [],
  shipmentIds: [],
  searchString: '',
  ...overrides,
});

const cbedPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: 'null',
  characteristic: [{ name: 'Масса сборки', ez: 'кг', znach: 0 }],
  name: `API CBED ${suffix}`,
  designation: `API-CBED-${suffix}`,
  responsible: '0',
  description: `Created by API autotest ${suffix}`,
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

const findCbedByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<CbedLike | undefined> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await cbedAPI.getCBEDPagination(request, cbedPaginationDto({ searchString: designation }), testUserId, accessToken);
    expectNoServerError(response);

    const cbed = getRows(response.data).find((row) => row.designation === designation);
    if (cbed) return cbed;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return undefined;
};

export const runCBEDAPINew = () => {
  logger.info('Starting CBED API coverage suite');

  test.describe.serial('CBED API: жизненный цикл сборочной единицы', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let createdCbedId: number | undefined;
    let createdDesignation: string;
    let updatedDesignation: string;
    let createdPayload: Record<string, unknown>;
    let updatedPayload: Record<string, unknown>;

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

      const suffix = `${Date.now()}`;
      createdPayload = cbedPayload(suffix);
      updatedPayload = cbedPayload(`${suffix}-UPD`, {
        description: `Updated by API autotest ${suffix}`,
        attention: 'true',
      });
      createdDesignation = String(createdPayload.designation);
      updatedDesignation = String(updatedPayload.designation);
    });

    test.afterAll(async ({ request }) => {
      if (!createdCbedId) return;

      const archiveResponse = await cbedAPI.banCBED(request, createdCbedId, testUserId, accessToken);
      expectNoServerError(archiveResponse);
    });

    test('создает сборочную единицу с уникальным обозначением', async ({ request }) => {
      const uniqueBefore = await cbedAPI.checkDesignation(request, { designation: createdDesignation }, accessToken);

      expect(uniqueBefore.status).toBe(201);
      expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);

      const createResponse = await cbedAPI.createCBED(request, createdPayload, testUserId, accessToken);
      expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      const createData = getQueueData(createResponse.data);
      if (createData?.id) createdCbedId = Number(createData.id);

      const created = await findCbedByDesignation(request, createdDesignation, accessToken);
      expect(created, `CBED ${createdDesignation} was not found after create`).toBeTruthy();
      expectCbedShape(created as CbedLike);

      createdCbedId = createdCbedId || Number(created?.id);
      expect(created?.name).toBe(createdPayload.name);
      expect(created?.ban).toBe(false);
    });

    test('читает созданную сборочную единицу по id, спецификации и пагинации', async ({ request }) => {
      expect(createdCbedId).toBeTruthy();

      const byId = await cbedAPI.getOneCBEDById(
        request,
        { id: createdCbedId, modelsInclude: [], attributes: [] },
        accessToken,
      );
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectCbedShape(byId.data);
      expect(byId.data.designation).toBe(createdDesignation);

      const specification = await cbedAPI.getOneCBEDSpecification(request, createdCbedId as number, false, accessToken);
      expectNoServerError(specification);

      const pagination = await cbedAPI.getCBEDPagination(
        request,
        cbedPaginationDto({ searchString: createdDesignation }),
        testUserId,
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdCbedId)).toBe(true);
    });

    test('обновляет сборочную единицу и проверяет новые значения', async ({ request }) => {
      expect(createdCbedId).toBeTruthy();

      const updateResponse = await cbedAPI.updateCBED(
        request,
        { ...updatedPayload, id: createdCbedId },
        testUserId,
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateResponse.data)).toContain(updateResponse.status);
      expectNoServerError(updateResponse);

      const updated = await findCbedByDesignation(request, updatedDesignation, accessToken);
      expect(updated, `CBED ${updatedDesignation} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(createdCbedId);
      expect(updated?.name).toBe(updatedPayload.name);
      expect(updated?.attention).toBe(true);
    });

    test('возвращает include, принадлежность, graph и техпроцесс без серверных ошибок', async ({ request }) => {
      expect(createdCbedId).toBeTruthy();

      const includeResponse = await cbedAPI.getCBEDInclude(request, createdCbedId as number, { includes: ['documents'] }, accessToken);
      expectNoServerError(includeResponse);
      if (!clientErrorCodes.includes(includeResponse.status)) {
        expect(successCodes).toContain(includeResponse.status);
        expect(includeResponse.data?.id, JSON.stringify(includeResponse.data)).toBe(createdCbedId);
      }

      const belongs = await cbedAPI.getOneCBEDBelongs(request, createdCbedId as number, accessToken);
      expectNoServerError(belongs);

      const graph = await cbedAPI.getCBEDGraphChildren(request, { cbedId: createdCbedId }, accessToken);
      expectNoServerError(graph);

      const techProcess = await cbedAPI.getTechByCBEDId(request, createdCbedId as number, accessToken);
      expectNoServerError(techProcess);
    });

    test('архивирует сборочную единицу и проверяет архивную выдачу', async ({ request }) => {
      expect(createdCbedId).toBeTruthy();

      const archiveResponse = await cbedAPI.banCBED(request, createdCbedId as number, testUserId, accessToken);
      expect(successCodes).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const archiveSearch = await cbedAPI.getArchivedCBED(request, { searchString: updatedDesignation }, accessToken);
      expect(archiveSearch.status).toBe(201);
      expect(getRows(archiveSearch.data).some((row) => row.id === createdCbedId && row.ban === true)).toBe(true);

      createdCbedId = undefined;
    });
  });

  test.describe('CBED API: контракты чтения и defensive-сценарии', () => {
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

    test('пагинация сборочных единиц возвращает count и rows', async ({ request }) => {
      const response = await cbedAPI.getCBEDPagination(request, cbedPaginationDto(), testUserId, accessToken);

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
    });

    test('пагинация поддерживает пустой результат со стабильной структурой', async ({ request }) => {
      const response = await cbedAPI.getCBEDPagination(
        request,
        cbedPaginationDto({ searchString: 'api-cbed-no-match-999999999' }),
        testUserId,
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
    });

    test('эндпоинты остатков, дефицитов, операций и отгрузок не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const remains = await cbedAPI.getCBEDRemains(request, remainsDto(), accessToken);
      expectNoServerError(remains);

      const deficits = await cbedAPI.getCBEDDeficits(request, deficitDto(), accessToken);
      expectNoServerError(deficits);

      const operations = await cbedAPI.getOperationInclude(request, cbedPaginationDto({ isSortedByOperations: true }), accessToken);
      expectNoServerError(operations);

      const shipments = await cbedAPI.getCBEDShipmentsAndOrders(request, Number(API_CONST.API_TEST_CBED_ID), accessToken);
      expectNoServerError(shipments);
    });

    test('проверка уникальности обозначения обрабатывает защитные payload без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const designation of cases) {
        const response = await cbedAPI.checkDesignation(request, { designation }, accessToken);
        expectNoServerError(response);
      }
    });

    test('создание сборочной единицы отклоняет невалидный payload без серверных ошибок', async ({ request }) => {
      const response = await cbedAPI.createCBED(
        request,
        {
          name: '',
          designation: '',
          characteristic: [],
          parametrs: [],
          listDetal: [],
          listCbed: [],
          fileBase: [],
        },
        testUserId,
        accessToken,
      );

      expectNotSuccessful(response);
    });

    test('операции с несуществующим id не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await cbedAPI.getOneCBEDById(request, { id: 999999999, modelsInclude: [], attributes: [] }, accessToken);
      expectNoServerError(byId);

      const deleteResponse = await cbedAPI.banCBED(request, 999999999, testUserId, accessToken);
      expectNotSuccessful(deleteResponse);
    });
  });
};
