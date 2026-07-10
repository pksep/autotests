import { test, expect } from '@playwright/test';
import { CBEDAPI } from '../../pages/API/APICBED';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectApiContract,
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

type CbedLike = Record<string, any>;

const cbedAPI = new CBEDAPI(null);

const testUserId = API_CONST.API_TEST_TABEL;

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
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
  const response = await eventually(async () => {
    const response = await cbedAPI.getCBEDPagination(request, cbedPaginationDto({ searchString: designation }), testUserId, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).some((row) => row.designation === designation));

  return response ? getRows(response.data).find((row) => row.designation === designation) : undefined;
};

const waitForArchivedCbed = async (
  request: any,
  cbedId: number,
  designation: string,
  accessToken?: string,
): Promise<CbedLike | undefined> => {
  const response = await eventually(async () => {
    const response = await cbedAPI.getArchivedCBED(request, { searchString: designation }, accessToken);
    expect(response.status).toBe(201);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === cbedId && row.ban === true), { attempts: 12, intervalMs: 700 });

  return response ? getRows(response.data).find((row) => row.id === cbedId && row.ban === true) : undefined;
};

const waitForCbedInActiveSearch = async (
  request: any,
  cbedId: number,
  designation: string,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await cbedAPI.getCBEDPagination(
      request,
      cbedPaginationDto({ searchString: designation }),
      testUserId,
      accessToken,
    );
    expect(response.status).toBe(201);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === cbedId) === expectedPresent, { attempts: 12, intervalMs: 700 });

  return Boolean(response);
};

const createIsolatedCbed = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ id: number; designation: string; payload: Record<string, unknown> }> => {
  const payload = cbedPayload(suffix);
  const designation = String(payload.designation);

  const createResponse = await cbedAPI.createCBED(request, payload, testUserId, accessToken);
  expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
  expectNoServerError(createResponse);

  const createData = getQueueData(createResponse.data);
  const created = await findCbedByDesignation(request, designation, accessToken);
  const id = Number(createData?.id ?? created?.id);

  expect(id, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
  expect(created, `CBED ${designation} was not found after create`).toBeTruthy();
  expect(created?.ban, JSON.stringify(created)).toBe(false);

  return { id, designation, payload };
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
      accessToken = await getAuthToken(request);
      const suffix = uniqueApiSuffix('cbed');
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

      const relatives = await cbedAPI.getRelativesProductionTask(request, createdCbedId as number, accessToken);
      expectNoServerError(relatives);
    });

    test('архивирует сборочную единицу и проверяет архивную выдачу', async ({ request }) => {
      expect(createdCbedId).toBeTruthy();

      const archiveResponse = await cbedAPI.banCBED(request, createdCbedId as number, testUserId, accessToken);
      expect(successCodes).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const archived = await waitForArchivedCbed(request, createdCbedId as number, updatedDesignation, accessToken);
      expect(archived, `CBED ${updatedDesignation} was not found in archive after ban`).toBeTruthy();
      expect(await waitForCbedInActiveSearch(request, createdCbedId as number, updatedDesignation, false, accessToken)).toBe(true);

      const secondArchiveResponse = await cbedAPI.banCBED(request, createdCbedId as number, testUserId, accessToken);
      expectNoServerError(secondArchiveResponse);

      createdCbedId = undefined;
    });
  });

  test.describe('CBED API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
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

    test('пагинация сборочных единиц поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await cbedAPI.getCBEDPagination(
        request,
        cbedPaginationDto({ page: 0, pageSize: 1 }),
        testUserId,
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);

      const farPage = await cbedAPI.getCBEDPagination(
        request,
        cbedPaginationDto({ page: 999999, pageSize: 5 }),
        testUserId,
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('include сборочной единицы обрабатывает пустой и неизвестный include без 5xx', async ({ request }) => {
      const cbed = await createIsolatedCbed(request, uniqueApiSuffix('cbed-include'), accessToken);

      try {
        for (const includes of [[], ['unknownInclude']]) {
          const response = await cbedAPI.getCBEDInclude(request, cbed.id, { includes }, accessToken);
          expectNoServerError(response);
        }
      } finally {
        const archive = await cbedAPI.banCBED(request, cbed.id, testUserId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('эндпоинты остатков, дефицитов, операций и отгрузок не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const remains = await cbedAPI.getCBEDRemains(request, remainsDto(), accessToken);
      expectNoServerError(remains);

      const deficits = await cbedAPI.getCBEDDeficits(request, deficitDto(), accessToken);
      expectNoServerError(deficits);

      const operations = await cbedAPI.getOperationInclude(request, cbedPaginationDto({ isSortedByOperations: true }), accessToken);
      expectNoServerError(operations);
      if (!clientErrorCodes.includes(operations.status)) {
        expect(successCodes).toContain(operations.status);
        expect(operations.data, JSON.stringify(operations.data)).toBeTruthy();
      }

      const cbed = await createIsolatedCbed(request, uniqueApiSuffix('cbed-shipments'), accessToken);
      try {
        const shipments = await cbedAPI.getCBEDShipmentsAndOrders(request, cbed.id, accessToken);
        expectApiContract(shipments);
      } finally {
        const archive = await cbedAPI.banCBED(request, cbed.id, testUserId, accessToken);
        expectNoServerError(archive);
      }
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

      expectClientError(response);
    });

    test('операции с несуществующим id не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await cbedAPI.getOneCBEDById(request, { id: 999999999, modelsInclude: [], attributes: [] }, accessToken);
      expectNoServerError(byId);

      const drafts = await captureApiResult(() => cbedAPI.getDrafts(request, 999999999, accessToken));
      expectEndpointReached(drafts);

      const actualAvatar = await captureApiResult(() => cbedAPI.actualAvatar(request, accessToken));
      expectEndpointReached(actualAvatar);

      const deleteResponse = await cbedAPI.banCBED(request, 999999999, testUserId, accessToken);
      expectClientError(deleteResponse);
    });

    test('мутации сборочной единицы без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await cbedAPI.createCBED(
        request,
        cbedPayload(`NOAUTH-${uniqueApiSuffix('cbed')}`),
        testUserId,
      );
      expectClientError(createResponse);

      const deleteResponse = await cbedAPI.banCBED(request, 999999999, testUserId);
      expectClientError(deleteResponse);
    });
  });
};
