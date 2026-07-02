import { test, expect } from '@playwright/test';
import { WaybillAPI } from '../../pages/API/APIWaybill';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectMissingResource, expectNoServerError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

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
  expect(getWaybillCount(data), JSON.stringify(data)).toBeGreaterThanOrEqual(0);
  expect(Array.isArray(getRows(data)), JSON.stringify(data)).toBe(true);
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

      expectNoServerError(response);
      if (clientErrorCodes.includes(response.status)) return;

      expect(successCodes).toContain(response.status);
      expectWaybillPaginationContract(response.data);
    });

    test('поддерживает пустой поиск без изменения контракта ответа', async ({ request }) => {
      const response = await waybillAPI.getWaybillPagination(
        request,
        paginationDto({ searchString: 'api-waybill-no-match-999999999' }),
        accessToken,
      );

      expectNoServerError(response);
      if (clientErrorCodes.includes(response.status)) return;

      expect(successCodes).toContain(response.status);
      expectWaybillPaginationContract(response.data);
      expect(getRows(response.data)).toEqual([]);
    });

    test('возвращает последнюю накладную или null без серверной ошибки', async ({ request }) => {
      const response = await waybillAPI.getLastWaybill(request, accessToken);

      expectNoServerError(response);
      if (clientErrorCodes.includes(response.status)) return;
      expect(successCodes).toContain(response.status);
    });

    test('читает существующую накладную из пагинации, если она есть', async ({ request }) => {
      const list = await waybillAPI.getWaybillPagination(request, paginationDto(), accessToken);
      expectNoServerError(list);
      test.skip(clientErrorCodes.includes(list.status), 'Waybill pagination is not available on this environment.');

      const waybill = getRows<ApiRow>(list.data).find((row) => row.id);
      test.skip(!waybill, 'No waybill with id is available on this environment.');
      const existingWaybill = waybill!;

      const byId = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(existingWaybill.id);
      }
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
      if (!clientErrorCodes.includes(missing.status)) {
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
      expectNoServerError(list);
      test.skip(clientErrorCodes.includes(list.status), 'Waybill pagination is not available on this environment.');

      const waybill = getRows<ApiRow>(list.data).find((row) => row.id);
      test.skip(!waybill, 'No waybill with id is available on this environment.');
      const existingWaybill = waybill!;
      const originalDescription = existingWaybill.description ?? '';
      const updatedDescription = `API waybill update probe ${Date.now()}`;

      try {
        const update = await waybillAPI.updateWaybill(
          request,
          { waybillId: existingWaybill.id, description: updatedDescription, documentsIds: [] },
          accessToken,
        );
        expectNoServerError(update);
        expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

        const byId = await waybillAPI.getWaybillById(request, existingWaybill.id, accessToken);
        expectNoServerError(byId);
        if (!clientErrorCodes.includes(byId.status)) {
          expect(successCodes).toContain(byId.status);
          expect(byId.data?.description, JSON.stringify(byId.data)).toBe(updatedDescription);
        }
      } finally {
        const restore = await waybillAPI.updateWaybill(
          request,
          { waybillId: existingWaybill.id, description: originalDescription, documentsIds: [] },
          accessToken,
        );
        expectNoServerError(restore);
      }
    });

    test('удаление несуществующей накладной не роняет сервис', async ({ request }) => {
      const remove = await waybillAPI.deleteWaybill(request, 999999999, accessToken);
      expectMissingResource(remove);
    });
  });
};
