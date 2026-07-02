import { test, expect } from '@playwright/test';
import { ExpenditureAPI } from '../../pages/API/APIExpenditure';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, expectPaginationContract, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

const expenditureAPI = new ExpenditureAPI(null);

const expenditureDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  customer: null,
  dateRange: null,
  searchString: '',
  ...overrides,
});

export const runExpenditureAPINew = () => {
  logger.info('Starting Expenditure API coverage suite');

  test.describe('Expenditure API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу расходов со стабильной структурой', async ({ request }) => {
      const response = await expenditureAPI.getExpenditures(request, expenditureDto(), accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectPaginationContract(response.data);
      }
    });

    test('поддерживает фильтры типа расхода и диапазона дат без 5xx', async ({ request }) => {
      const dateRange = {
        start: '2020-01-01T00:00:00.000Z',
        end: new Date().toISOString(),
      };

      for (const customer of ['shipment', 'waybill']) {
        const response = await expenditureAPI.getExpenditures(request, expenditureDto({ customer, dateRange }), accessToken);
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
          expectPaginationContract(response.data);
        }
      }
    });

    test('поиск и защитные строки не приводят к 5xx', async ({ request }) => {
      const cases = [
        'api-expenditure-no-match-999999999',
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await expenditureAPI.getExpenditures(request, expenditureDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });

    test('невалидный payload не проходит успешно', async ({ request }) => {
      const response = await expenditureAPI.getExpenditures(
        request,
        { page: -1, customer: 'unknown', dateRange: { start: 'bad', end: 'bad' } },
        accessToken,
      );
      expectClientError(response);
    });
  });
};
