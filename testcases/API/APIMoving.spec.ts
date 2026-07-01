import { test, expect } from '@playwright/test';
import { MovingAPI } from '../../pages/API/APIMoving';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movingAPI = new MovingAPI(null);

const movingDto = (overrides: Record<string, unknown> = {}) => ({
  arr_product: [],
  description: 'API moving smoke test',
  to_user: 1,
  to_sklad: false,
  from_user: 1,
  from_sklad: false,
  cause: 'autotest',
  ...overrides,
});

export const runMovingAPINew = () => {
  logger.info('Starting Moving API coverage suite');

  test.describe('Moving API: список и создание', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает список перемещений', async ({ request }) => {
      const response = await movingAPI.getAllMoving(request, accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      }
    });

    test('создает пустое перемещение без 5xx', async ({ request }) => {
      const response = await movingAPI.createMoving(request, movingDto(), accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      }
    });

    test('невалидное перемещение не считается успешным', async ({ request }) => {
      const response = await movingAPI.createMoving(
        request,
        movingDto({ to_user: 'bad-user', from_user: null, to_sklad: 'bad', arr_product: 'bad' }),
        accessToken,
      );

      expectNotSuccessful(response);
    });
  });
};
