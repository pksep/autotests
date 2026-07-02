import { test } from '@playwright/test';
import { SolidworksAPI } from '../../pages/API/APISolidworks';
import logger from '../../lib/utils/logger';
import { expectClientError, expectNoServerError } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const solidworksAPI = new SolidworksAPI(null);

export const runSolidworksAPINew = () => {
  logger.info('Starting Solidworks API coverage suite');

  test.describe('Solidworks API: неиспользуемый модуль без 5xx', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('ищет отсутствующую сущность и проверяет defensive multipart-мутации', async ({ request }) => {
      const entityName = uniqueApiSuffix('sw-missing');

      const missingEntity = await solidworksAPI.getEntity(request, entityName, 'product', accessToken);
      expectNoServerError(missingEntity);

      for (const response of [
        await solidworksAPI.createEntity(request, { name: '', type: 'product' }, accessToken),
        await solidworksAPI.updateEntity(request, { id: 999999999, name: '', type: 'product' }, accessToken),
      ]) {
        expectClientError(response);
      }
    });
  });
};
