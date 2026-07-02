import { test } from '@playwright/test';
import { MovementErrorsAPI } from '../../pages/API/APIMovementErrors';
import { expectRouteNotExposed } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movementErrorsAPI = new MovementErrorsAPI(null);

export const runMovementErrorsAPINew = () => {
  logger.info('Starting Movement Errors API coverage suite');

  test.describe('Movement Errors API: пустой контроллер и defensive-сценарии', () => {
    test.describe.configure({ timeout: 30000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('неэкспонированный список возвращает клиентскую ошибку без 5xx', async ({ request }) => {
      const response = await movementErrorsAPI.probeList(request, accessToken);
      expectRouteNotExposed(response);
    });

    test('неэкспонированное чтение по id возвращает клиентскую ошибку без 5xx', async ({ request }) => {
      const response = await movementErrorsAPI.probeOne(request, 999999999, accessToken);
      expectRouteNotExposed(response);
    });
  });
};
