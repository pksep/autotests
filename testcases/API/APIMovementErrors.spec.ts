import { test } from '@playwright/test';
import { MovementErrorsAPI } from '../../pages/API/APIMovementErrors';
import { expectArrayResponse, expectRouteNotExposed, expectStatusIn, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movementErrorsAPI = new MovementErrorsAPI(null);

export const runMovementErrorsAPINew = () => {
  logger.info('Starting Movement Errors API coverage suite');

  test.describe('Movement Errors API: список и defensive-сценарии', () => {
    test.describe.configure({ timeout: 30000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает список ошибок перемещений', async ({ request }) => {
      const response = await movementErrorsAPI.probeList(request, accessToken);

      expectStatusIn(response, successCodes);
      expectArrayResponse(response.data);
    });

    test('неэкспонированное чтение по id возвращает клиентскую ошибку без 5xx', async ({ request }) => {
      const response = await movementErrorsAPI.probeOne(request, 999999999, accessToken);
      expectRouteNotExposed(response);
    });
  });
};
