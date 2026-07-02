import { test, expect } from '@playwright/test';
import { ProviderAPI } from '../../pages/API/APIProvider';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectClientError, expectNoServerError, expectPaginationContract, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const providerAPI = new ProviderAPI(null);

const paginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  ...overrides,
});

export const runProviderAPINew = () => {
  logger.info('Starting Provider API coverage suite');

  test.describe('Provider API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает поставщиков, пагинацию и архив без серверных ошибок', async ({ request }) => {
      const list = await providerAPI.getProviders(request, accessToken);
      expectNoServerError(list);

      const pagination = await providerAPI.getProvidersPagination(request, paginationDto(), accessToken);
      expectNoServerError(pagination);
      if (!clientErrorCodes.includes(pagination.status)) {
        expect(successCodes, JSON.stringify(pagination.data)).toContain(pagination.status);
        expectPaginationContract(pagination.data);
      }

      const archive = await providerAPI.getArchive(request, { searchString: '' }, accessToken);
      expectNoServerError(archive);
    });

    test('проверяет имя и защитные строки без 5xx', async ({ request }) => {
      for (const name of [
        uniqueApiSuffix('provider-name'),
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
      ]) {
        const response = await providerAPI.checkNameExisting(request, { name }, accessToken);
        expectNoServerError(response);
      }
    });

    test('несуществующие provider endpoints обрабатываются без 5xx', async ({ request }) => {
      for (const response of [
        await providerAPI.banProvider(request, 999999999, accessToken),
        await providerAPI.attachFileToProvider(request, 999999999, 999999999, accessToken),
      ]) {
        expectClientError(response);
      }

      const missingProvider = await providerAPI.getOneProvider(request, 999999999, accessToken);
      expectNoServerError(missingProvider);
    });
  });
};
