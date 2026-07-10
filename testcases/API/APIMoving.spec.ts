import { test, expect } from '@playwright/test';
import { MovingAPI } from '../../pages/API/APIMoving';
import { clientErrorCodes, expectNoServerError, expectClientError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movingAPI = new MovingAPI(null);
type ApiRow = Record<string, any>;

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

const findMovingByDescription = async (
  request: any,
  description: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const list = await movingAPI.getAllMoving(request, accessToken);
    expectNoServerError(list);
    return list;
  }, (list) => getRows<ApiRow>(list.data).some((row) => row.description === description));

  return response ? getRows<ApiRow>(response.data).find((row) => row.description === description) : undefined;
};

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

    test('создание пустого перемещения не дает 5xx и не создает ложную запись в списке', async ({ request }) => {
      const description = `API moving ${uniqueApiSuffix('moving')}`;
      const cause = `autotest ${description}`;
      const response = await movingAPI.createMoving(request, movingDto({ description, cause }), accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);

        const created = await findMovingByDescription(request, description, accessToken);
        expect(created, `Moving ${description} unexpectedly appeared in list after no-op create`).toBeUndefined();
      }
    });

    test('невалидное перемещение не считается успешным', async ({ request }) => {
      const response = await movingAPI.createMoving(
        request,
        movingDto({ to_user: 'bad-user', from_user: null, to_sklad: 'bad', arr_product: 'bad' }),
        accessToken,
      );

      expectClientError(response);
    });
  });
};
