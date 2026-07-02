import { test, expect } from '@playwright/test';
import { SupplyAPI } from '../../pages/API/APISupply';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectRouteNotExposed, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

const supplyAPI = new SupplyAPI(null);

export const runSupplyAPINew = () => {
  logger.info('Starting Supply API coverage suite');

  test.describe('Supply API: номер заказа', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает новый номер заказа поставки без серверной ошибки', async ({ request }) => {
      const response = await supplyAPI.getNewNumberOrder(request, accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      }
    });

    test.describe('Supply API: defensive-сценарии', () => {
      test('не принимает POST на read-only endpoint номера заказа', async ({ request }) => {
        const response = await supplyAPI.postNewNumberOrder(request, { unexpected: true }, accessToken);
        expectRouteNotExposed(response);
      });
    });
  });
};
