import { test } from '@playwright/test';
import { MovementErrorsAPI } from '../../pages/API/APIMovementErrors';
import { expectNotSuccessful } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movementErrorsAPI = new MovementErrorsAPI(null);

export const runMovementErrorsAPINew = () => {
  logger.info('Starting Movement Errors API coverage suite');

  test.describe('Movement Errors API: пустой контроллер', () => {
    test.describe.configure({ timeout: 30000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('неэкспонированный список возвращает клиентскую ошибку без 5xx', async ({ request }) => {
      test.fail(true, 'Контроллер movement-errors пока не экспонирует маршруты, dev-сервер возвращает 500 static fallback вместо 404.');
      const response = await movementErrorsAPI.probeList(request, accessToken);
      expectNotSuccessful(response);
    });

    test('неэкспонированное чтение по id возвращает клиентскую ошибку без 5xx', async ({ request }) => {
      test.fail(true, 'Контроллер movement-errors пока не экспонирует маршруты, dev-сервер возвращает 500 static fallback вместо 404.');
      const response = await movementErrorsAPI.probeOne(request, 999999999, accessToken);
      expectNotSuccessful(response);
    });
  });
};
