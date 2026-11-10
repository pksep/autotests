import { test, expect } from '@playwright/test';
import { WaybillAPI } from '../../pages/API/APIWaybill';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  missingResourceCodes,
  expectErrorResponseContract,
  expectNoServerError,
  getRows,
  successCodes,
  expectRowsResponse,
  expectArrayResponse,
  expectObjectResponse,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import { expectNonNegativeQuantities, expectRepeatOperationRejectedOrIdempotent } from '../../lib/helpers/APIDataInvariants';

type ApiRow = Record<string, any>;

const waybillAPI = new WaybillAPI(null);

const paginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeComing: null,
  ...overrides,
});

const getWaybillCount = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const raw = (data as any).count ?? (data as any).total;
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const expectWaybillPaginationContract = (data: unknown) => {
  expectObjectResponse(data);
  expect(Number.isInteger(getWaybillCount(data)), JSON.stringify(data)).toBe(true);
  expect(getWaybillCount(data), JSON.stringify(data)).toBeGreaterThanOrEqual(0);
  expectRowsResponse(data);
};

export const runWaybillAPINew = () => {
  logger.info('Starting Waybill API coverage suite');

  test.describe('Waybill API: чтение накладных', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает пагинацию накладных с count и rows', async ({ request }) => {
      const response = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);

      expect(response.status).toBe(201);
      expectWaybillPaginationContract(response.data);
      expectNonNegativeQuantities(getRows<ApiRow>(response.data));
    });

    test('поддерживает пустой поиск без изменения контракта ответа', async ({ request }) => {
      const response = await waybillAPI.getWaybillPagination(
        request,
        paginationDto({ searchString: 'api-waybill-no-match-999999999' }),
        accessToken,
      );

      expect(response.status).toBe(201);
      expectWaybillPaginationContract(response.data);
      expect(getRows(response.data)).toEqual([]);
    });

    test('возвращает последнюю накладную или null', async ({ request }) => {
      const response = await waybillAPI.getLastWaybill(request, accessToken);
      expect(response.status).toBe(200);
      const list = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
      expect(list.status).toBe(201);
      expectWaybillPaginationContract(list.data);
      if (response.data === null) {
        expect(getWaybillCount(list.data)).toBe(0);
      } else {
        expectObjectResponse(response.data);
        expect(typeof response.data.name).toBe('string');
        expect(Number(response.data?.id)).toBeGreaterThan(0);
        const byId = await waybillAPI.getWaybillById(request, response.data.id, accessToken);
        expect(byId.status).toBe(200);
      expect(byId.data?.id).toBe(response.data.id);
        expect(byId.data?.name).toBe(response.data.name);
      }
    });

    test('читает существующую накладную из пагинации, если она есть', async ({ request }) => {
      const list = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
      expect(list.status).toBe(201);
      expectWaybillPaginationContract(list.data);

      const waybill = getRows<ApiRow>(list.data).find((row) => row.id);
      test.skip(!waybill, 'No waybill with id is available on this environment.');
      const existingWaybill = waybill!;

      const byId = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
      expectNoServerError(byId);
      expect(byId.status).toBe(200);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(existingWaybill.id);
      expectNonNegativeQuantities([byId.data]);
    });

  });

  test.describe('Waybill API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('невалидные id и фильтры не приводят к 5xx', async ({ request }) => {
      const missing = await waybillAPI.getWaybillById(request, 999999999, accessToken);
      expectNoServerError(missing);
      if (clientErrorCodes.includes(missing.status)) {
        expectErrorResponseContract(missing);
      } else {
        expect(successCodes).toContain(missing.status);
      }

      const byStockOrder = await waybillAPI.getByStockOrder(request, 999999999, 'metalloworking', accessToken);
      expectNoServerError(byStockOrder);
      if (!clientErrorCodes.includes(byStockOrder.status)) {
        expect(successCodes).toContain(byStockOrder.status);
        expect(Array.isArray(byStockOrder.data), JSON.stringify(byStockOrder.data)).toBe(true);
      }

      for (const searchString of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const response = await waybillAPI.getWaybillPagination(request, paginationDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });

    test('обновляет описание существующей накладной и возвращает исходное значение', async ({ request }) => {
      const list = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
      expect(list.status).toBe(201);
      expectWaybillPaginationContract(list.data);

      const waybill = getRows<ApiRow>(list.data).find((row) => row.id);
      test.skip(!waybill, 'No waybill with id is available on this environment.');
      const existingWaybill = waybill!;
      const original = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
      expect(original.status).toBe(200);
      expectArrayResponse(original.data?.documents);
      const originalDocumentIds = original.data.documents.map((document: ApiRow) => Number(document.id));
      const originalDescription = original.data?.description ?? '';
      const updatedDescription = `API waybill update probe ${Date.now()}`;
      const countBefore = getWaybillCount(list.data);

      try {
        const update = await waybillAPI.updateWaybill(
          request,
          { waybillId: existingWaybill.id, description: updatedDescription, documentsIds: originalDocumentIds },
          accessToken,
        );
        expectNoServerError(update);
        expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
        expect(Number(update.data?.id ?? update.data?.waybillId ?? existingWaybill.id), JSON.stringify(update.data)).toBe(existingWaybill.id);

        const byId = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
        expectNoServerError(byId);
        expect(byId.status).toBe(200);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(existingWaybill.id);
        expect(byId.data?.description, JSON.stringify(byId.data)).toBe(updatedDescription);
        expectNonNegativeQuantities([byId.data]);

        const afterUpdateList = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
        expectNoServerError(afterUpdateList);
        expect(afterUpdateList.status).toBe(201);
        expectWaybillPaginationContract(afterUpdateList.data);
        const updatedRow = getRows<ApiRow>(afterUpdateList.data).find((row) => row.id === existingWaybill.id);
        expect(updatedRow, JSON.stringify(afterUpdateList.data)).toBeTruthy();
        expect(updatedRow?.description, JSON.stringify(updatedRow)).toBe(updatedDescription);
        if (countBefore !== undefined) {
          expect(getWaybillCount(afterUpdateList.data), JSON.stringify(afterUpdateList.data)).toBe(countBefore);
        }

        const repeatUpdate = await waybillAPI.updateWaybill(
          request,
          { waybillId: existingWaybill.id, description: updatedDescription, documentsIds: originalDocumentIds },
          accessToken,
        );
        expectNoServerError(repeatUpdate);
        expectRepeatOperationRejectedOrIdempotent(update.status, repeatUpdate.status, successCodes, [400, 404, 409, 410, 422]);

        const afterRepeatList = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
        expectNoServerError(afterRepeatList);
        expect(afterRepeatList.status).toBe(201);
        expectWaybillPaginationContract(afterRepeatList.data);
        const repeatedRows = getRows<ApiRow>(afterRepeatList.data).filter((row) => row.id === existingWaybill.id);
        expect(repeatedRows.length, JSON.stringify(afterRepeatList.data)).toBe(1);
        expect(repeatedRows[0]?.description, JSON.stringify(repeatedRows[0])).toBe(updatedDescription);
        if (countBefore !== undefined) {
          expect(getWaybillCount(afterRepeatList.data), JSON.stringify(afterRepeatList.data)).toBe(countBefore);
        }
      } finally {
        const restore = await waybillAPI.updateWaybill(
          request,
          { waybillId: existingWaybill.id, description: originalDescription, documentsIds: originalDocumentIds },
          accessToken,
        );
        expectNoServerError(restore);

        const restoredById = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
        expectNoServerError(restoredById);
        expect(restoredById.status).toBe(200);
        expect(restoredById.data?.description ?? '', JSON.stringify(restoredById.data)).toBe(originalDescription);
        expectArrayResponse(restoredById.data?.documents);
        expect(restoredById.data.documents.map((document: ApiRow) => Number(document.id)).sort((a: number, b: number) => a - b))
          .toEqual([...originalDocumentIds].sort((a, b) => a - b));
      }
    });

  });
};
