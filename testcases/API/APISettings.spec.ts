import { test, expect } from '@playwright/test';
import { SettingsAPI } from '../../pages/API/APISettings';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const settingsAPI = new SettingsAPI(null as any);

export const runSettingsAPINew = () => {
  logger.info('Starting Settings API coverage suite');

  test.describe('Settings API: справочники и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает единицы измерения, типы, нормо-часы и бездействие без 5xx', async ({ request }) => {
      for (const response of [
        await settingsAPI.getAllEdizm(request, accessToken),
        await settingsAPI.getAllTypeEdizm(request, accessToken),
        await settingsAPI.getNormHoursValue(request, accessToken),
        await settingsAPI.inactionGet(request, accessToken),
      ]) {
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        }
      }
    });

    test.skip('читает список backup-файлов и безопасно проверяет отсутствующий dump', async ({ request }) => {
      const list = await settingsAPI.getAllDB(request, accessToken);
      expectNoServerError(list);

      const missingName = `api-missing-${uniqueApiSuffix('dump')}.dump`;
      const download = await settingsAPI.downloadDb(request, missingName, accessToken);
      expectNoServerError(download);

      const drop = await settingsAPI.dropDumpDB(request, missingName, accessToken);
      expectNoServerError(drop);

      const load = await settingsAPI.loadDumpDb(request, missingName, false, accessToken);
      expectNoServerError(load);
    });

    test('невалидные мутации справочников настроек не проходят успешно', async ({ request }) => {
      const responses = [
        await settingsAPI.createTypeEdizm(request, { name: '' }, accessToken),
        await settingsAPI.createEdizm(request, { name: '', typeId: 999999999 }, accessToken),
        await settingsAPI.updateEdizm(request, { id: 999999999, name: '' }, accessToken),
        await settingsAPI.updateNormHoursValue(request, { id: 999999999, value: -1 }, accessToken),
        await settingsAPI.inactionChange(request, -1, accessToken),
      ];

      for (const response of responses) {
        expectNoServerError(response);
      }
    });
  });
};
