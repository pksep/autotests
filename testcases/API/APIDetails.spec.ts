import { test, expect } from '@playwright/test';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectClientError, expectNoServerError, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type DetailLike = Record<string, any>;

const detailsAPI = new DetailsAPI(null);

const testUserId = API_CONST.API_TEST_TABEL;

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const expectDetailShape = (detail: DetailLike) => {
  expect(detail).toBeTruthy();
  expect(typeof detail.id, JSON.stringify(detail)).toBe('number');
  expect(detail.name ?? detail.designation, JSON.stringify(detail)).toBeTruthy();
};

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
  detalIds: [],
  shipmentIds: [],
  searchString: '',
  ...overrides,
});

const detailPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Detail ${suffix}`,
  designation: `API-DETAIL-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `Created by API autotest ${suffix}`,
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
  }, (response) => getRows(response.data).some((row) => row.designation === designation));

  return response ? getRows(response.data).find((row) => row.designation === designation) : undefined;
};

const waitForDetailInArchive = async (
  request: any,
  designation: string,
  detailId: number,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await detailsAPI.getArchivedDetails(request, designation, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === detailId && row.ban === true));

  return Boolean(response);
};

const createIsolatedDetail = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ id: number; designation: string; payload: Record<string, unknown> }> => {
  const payload = detailPayload(suffix);
  const designation = String(payload.designation);

  const createResponse = await detailsAPI.createDetail(request, payload, testUserId, accessToken);
  expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
  expectNoServerError(createResponse);

  const createData = getQueueData(createResponse.data);
  const created = await findDetailByDesignation(request, designation, accessToken);
  const id = Number(createData?.id ?? created?.id);

  expect(id, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
  expect(created, `Detail ${designation} was not found after create`).toBeTruthy();
  expect(created?.ban, JSON.stringify(created)).toBe(false);

  return { id, designation, payload };
};

export const runDetailsAPINew = () => {
  logger.info('Starting Details API coverage suite');

  test.describe.serial('Details API: жизненный цикл детали', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let createdDetailId: number | undefined;
    let createdDesignation: string;
    let updatedDesignation: string;
    let createdPayload: Record<string, unknown>;
    let updatedPayload: Record<string, unknown>;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      const suffix = uniqueApiSuffix('detail');
      createdPayload = detailPayload(suffix);
      updatedPayload = detailPayload(`${suffix}-UPD`, {
        description: `Updated by API autotest ${suffix}`,
        attention: true,
      });
      createdDesignation = String(createdPayload.designation);
      updatedDesignation = String(updatedPayload.designation);
    });

    test.afterAll(async ({ request }) => {
      if (!createdDetailId) return;

      const archiveResponse = await detailsAPI.deleteDetail(request, String(createdDetailId), testUserId, accessToken);
      expectNoServerError(archiveResponse);
    });

    test('создает деталь с уникальным обозначением', async ({ request }) => {
      const uniqueBefore = await detailsAPI.checkDesignation(request, { designation: createdDesignation }, accessToken);

      expect(uniqueBefore.status).toBe(201);
      expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);

      const createResponse = await detailsAPI.createDetail(request, createdPayload, testUserId, accessToken);
      expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      const createData = getQueueData(createResponse.data);
      if (createData?.id) createdDetailId = Number(createData.id);

      const created = await findDetailByDesignation(request, createdDesignation, accessToken);
      expect(created, `Detail ${createdDesignation} was not found after create`).toBeTruthy();
      expectDetailShape(created as DetailLike);

      createdDetailId = createdDetailId || Number(created?.id);
      expect(created?.name).toBe(createdPayload.name);
      expect(created?.ban).toBe(false);
    });

    test('читает созданную деталь по id и пагинации', async ({ request }) => {
      expect(createdDetailId).toBeTruthy();

      const byId = await detailsAPI.getDetailById(
        request,
        { id: createdDetailId, modelsInclude: [], attributes: [] },
        accessToken,
      );
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectDetailShape(byId.data);
      expect(byId.data.designation).toBe(createdDesignation);

      const pagination = await detailsAPI.getPaginationDetails(
        request,
        detailPaginationDto({ searchString: createdDesignation }),
        testUserId,
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdDetailId)).toBe(true);
    });

    test('обновляет деталь и проверяет новые значения', async ({ request }) => {
      expect(createdDetailId).toBeTruthy();

      const updateResponse = await detailsAPI.updateDetail(
        request,
        { ...updatedPayload, id: createdDetailId },
        testUserId,
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateResponse.data)).toContain(updateResponse.status);
      expectNoServerError(updateResponse);

      const updated = await findDetailByDesignation(request, updatedDesignation, accessToken);
      expect(updated, `Detail ${updatedDesignation} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(createdDetailId);
      expect(updated?.name).toBe(updatedPayload.name);
      expect(updated?.attention).toBe(true);
    });

    test('возвращает include, отгрузки и техпроцесс для обновленной детали без серверных ошибок', async ({ request }) => {
      expect(createdDetailId).toBeTruthy();

      const includeResponse = await detailsAPI.getDetailFiles(request, String(createdDetailId), accessToken);
      expectNoServerError(includeResponse);
      if (!clientErrorCodes.includes(includeResponse.status)) {
        expect(successCodes).toContain(includeResponse.status);
        expect(includeResponse.data?.id, JSON.stringify(includeResponse.data)).toBe(createdDetailId);
      }

      const shipments = await detailsAPI.getDetailShipmentsAndOrders(request, createdDetailId as number, accessToken);
      expectNoServerError(shipments);

      const techProcess = await detailsAPI.getTechProcessByDetailId(request, String(createdDetailId), accessToken);
      expectNoServerError(techProcess);

      const relatives = await detailsAPI.getRelativesProductionTask(request, createdDetailId as number, accessToken);
      expectNoServerError(relatives);
    });

    test('архивирует деталь и проверяет архивную выдачу', async ({ request }) => {
      expect(createdDetailId).toBeTruthy();

      const archiveResponse = await detailsAPI.deleteDetail(request, String(createdDetailId), testUserId, accessToken);
      expect(successCodes).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const archiveSearch = await detailsAPI.getArchivedDetails(request, updatedDesignation, accessToken);
      expect(archiveSearch.status).toBe(201);
      expect(await waitForDetailInArchive(request, updatedDesignation, createdDetailId as number, accessToken)).toBe(true);

      const secondArchiveResponse = await detailsAPI.deleteDetail(request, String(createdDetailId), testUserId, accessToken);
      expectNoServerError(secondArchiveResponse);

      createdDetailId = undefined;
    });
  });

  test.describe('Details API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает список деталей без серверных ошибок', async ({ request }) => {
      const detail = await createIsolatedDetail(request, uniqueApiSuffix('detail-list'), accessToken);

      try {
        const response = await detailsAPI.getAllDetails(request, true, [], accessToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
        expect(getRows<DetailLike>(response.data).some((row) => row.id === detail.id), JSON.stringify(response.data)).toBe(true);
      } finally {
        const archive = await detailsAPI.deleteDetail(request, String(detail.id), testUserId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('пагинация поддерживает пустой результат со стабильной структурой', async ({ request }) => {
      const response = await detailsAPI.getPaginationDetails(
        request,
        detailPaginationDto({ searchString: 'api-detail-no-match-999999999' }),
        testUserId,
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
    });

    test('пагинация деталей поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await detailsAPI.getPaginationDetails(
        request,
        detailPaginationDto({ page: 0, pageSize: 1 }),
        testUserId,
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);

      const farPage = await detailsAPI.getPaginationDetails(
        request,
        detailPaginationDto({ page: 999999, pageSize: 5 }),
        testUserId,
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('include детали обрабатывает пустой и неизвестный include без 5xx', async ({ request }) => {
      const detail = await createIsolatedDetail(request, uniqueApiSuffix('detail-include'), accessToken);

      try {
        for (const includes of [[], ['unknownInclude']]) {
          const response = await detailsAPI.getDetailById(
            request,
            { id: detail.id, modelsInclude: includes, attributes: [] },
            accessToken,
          );
          expectNoServerError(response);
        }
      } finally {
        const archive = await detailsAPI.deleteDetail(request, String(detail.id), testUserId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('эндпоинты остатков, дефицитов и операций не отвечают 5xx на базовые фильтры', async ({ request }) => {
      const remains = await detailsAPI.getDetailRemains(request, remainsDto(), accessToken);
      expectNoServerError(remains);

      const deficits = await detailsAPI.getDetailDeficits(request, deficitDto(), accessToken);
      expectNoServerError(deficits);

      const operations = await detailsAPI.getOperationInclude(request, detailPaginationDto({ isSortedByOperations: true }), accessToken);
      expectNoServerError(operations);
    });

    test('проверка уникальности обозначения обрабатывает защитные payload без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const designation of cases) {
        const response = await detailsAPI.checkDesignation(request, { designation }, accessToken);
        expectNoServerError(response);
      }
    });

    test('создание детали отклоняет невалидный payload без серверных ошибок', async ({ request }) => {
      const response = await detailsAPI.createDetail(
        request,
        {
          name: '',
          designation: '',
          characteristic: [],
          parametrs: {},
          materialList: [],
          fileBase: [],
        },
        testUserId,
        accessToken,
      );

      expectClientError(response);
    });

    test('операции с несуществующим id не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await detailsAPI.getDetailById(request, { id: 999999999, modelsInclude: [], attributes: [] }, accessToken);
      expectNoServerError(byId);

      const deleteResponse = await detailsAPI.deleteDetail(request, '999999999', testUserId, accessToken);
      expectClientError(deleteResponse);
    });

    test('мутации детали без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await detailsAPI.createDetail(
        request,
        detailPayload(`NOAUTH-${uniqueApiSuffix('detail')}`),
        testUserId,
      );
      expectClientError(createResponse);

      const deleteResponse = await detailsAPI.deleteDetail(request, '999999999', testUserId);
      expectClientError(deleteResponse);
    });
  });
};
