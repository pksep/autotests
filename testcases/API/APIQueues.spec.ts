import { expect, test, type APIResponse } from '@playwright/test';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

const cleanCompletedUrl = () => ENV.API_BASE_URL + 'api/queues/clean-completed';
const authRequiredStatuses = [401, 403];

const getResponseText = async (response: APIResponse): Promise<string> => {
  try {
    return await response.text();
  } catch {
    return '';
  }
};

const expectNoServerError = (response: APIResponse) => {
  expect(response.status(), `Unexpected 5xx from ${response.url()}`).toBeLessThan(500);
};

const expectHtmlPage = async (response: APIResponse) => {
  const contentType = response.headers()['content-type'] || '';
  const body = await getResponseText(response);

  expect(contentType.toLowerCase()).toContain('text/html');
  expect(body.toLowerCase()).toContain('<!doctype html>');
  expect(body).toContain('Clean completed jobs');
};

export const runQueuesAPINew = () => {
  logger.info('Starting Queues API coverage suite');

  test.describe('Queues API: служебная HTML-страница очистки completed jobs', () => {
    test.describe.configure({ timeout: 30000 });

    test('[maintenance] GET /api/queues/clean-completed возвращает HTML-страницу', async ({ request }) => {
      const response = await request.get(cleanCompletedUrl(), {
        headers: { Accept: 'text/html' },
      });

      expect(response.status()).toBe(200);
      await expectHtmlPage(response);
    });

    test('[maintenance] POST /api/queues/clean-completed требует авторизацию или выполняет clean без 5xx', async ({ request }) => {
      const response = await request.post(cleanCompletedUrl(), {
        headers: { Accept: 'text/html' },
      });

      expectNoServerError(response);

      if (authRequiredStatuses.includes(response.status())) {
        return;
      }

      expect([200, 201, 204]).toContain(response.status());

      if (response.status() !== 204) {
        await expectHtmlPage(response);
      }
    });
  });
};
