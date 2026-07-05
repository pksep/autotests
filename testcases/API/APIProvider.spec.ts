import { test, expect } from '@playwright/test';
import { ProviderAPI } from '../../pages/API/APIProvider';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectClientError,
  expectEndpointReached,
  expectErrorResponseContract,
  expectNoServerError,
  expectPaginationContract,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const providerAPI = new ProviderAPI(null);
type ApiRow = Record<string, any>;

const paginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: false,
  materialProvidersIds: '[]',
  ...overrides,
});

const providerPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: '',
  name: `API Provider ${suffix}`,
  inn: `${Date.now()}`.slice(0, 12),
  cpp: '781001001',
  rekvisit: JSON.stringify([
    { name: 'Юр. адрес', description: `Provider API ${suffix}` },
    { name: 'Телефон', description: '' },
    { name: 'Сайт', description: '' },
    { name: 'Эл.почта', description: '' },
  ]),
  contacts: JSON.stringify([{ initial: `Contact ${suffix}`, description: '' }]),
  description: `Created by Provider API autotest ${suffix}`,
  docs: 'null',
  materialList: [],
  toolListId: '[]',
  equipmentListId: '[]',
  attention: false,
  file_base: '[]',
  ...overrides,
});

const expectProviderShape = (provider: ApiRow) => {
  expect(provider).toBeTruthy();
  expect(typeof provider.id, JSON.stringify(provider)).toBe('number');
  expect(provider.name, JSON.stringify(provider)).toBeTruthy();
};

const findProviderByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await providerAPI.getProvidersPagination(request, paginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

export const runProviderAPINew = () => {
  logger.info('Starting Provider API coverage suite');

  test.describe.serial('Provider API: жизненный цикл поставщика', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let providerId: number | undefined;
    let providerName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (providerId) {
        const archive = await providerAPI.banProvider(request, providerId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('создает поставщика через multipart DTO', async ({ request }) => {
      const suffix = uniqueApiSuffix('provider');
      providerName = `API Provider ${suffix}`;

      const uniqueBefore = await providerAPI.checkNameExisting(request, { name: providerName }, accessToken);
      expectNoServerError(uniqueBefore);
      if (!clientErrorCodes.includes(uniqueBefore.status)) {
        expect(successCodes).toContain(uniqueBefore.status);
        expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);
      }

      const create = await providerAPI.createProvider(
        request,
        providerPayload(suffix, { name: providerName }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);
      expectProviderShape(create.data);
      expect(create.data.name, JSON.stringify(create.data)).toBe(providerName);
      expect(create.data.ban, JSON.stringify(create.data)).not.toBe(true);
      providerId = Number(create.data.id);
    });

    test('читает созданного поставщика по id и находит в pagination/search', async ({ request }) => {
      expect(providerId).toBeTruthy();

      const byId = await providerAPI.getOneProvider(request, providerId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expectProviderShape(byId.data);
      expect(byId.data.id, JSON.stringify(byId.data)).toBe(providerId);
      expect(byId.data.name, JSON.stringify(byId.data)).toBe(providerName);

      const page = await providerAPI.getProvidersPagination(
        request,
        paginationDto({ searchString: providerName, isSortedByDate: true }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(page.data)).toContain(page.status);
      expectNoServerError(page);
      expectPaginationContract(page.data);
      expect(getRows<ApiRow>(page.data).some((row) => row.id === providerId), JSON.stringify(page.data)).toBe(true);

      const found = await findProviderByName(request, providerName, accessToken);
      expect(found, `Provider ${providerName} was not found after create`).toBeTruthy();
      expect(found?.id).toBe(providerId);
    });

    test('проверяет attach-file negative для созданного поставщика без 5xx', async ({ request }) => {
      expect(providerId).toBeTruthy();
      const missingFileId = 999999999;

      const attach = await providerAPI.attachFileToProvider(request, providerId as number, missingFileId, accessToken);
      expectNoServerError(attach);
      if (!clientErrorCodes.includes(attach.status)) {
        expect(successCodes, JSON.stringify(attach.data)).toContain(attach.status);
        if (attach.data && typeof attach.data === 'object') {
          expect(Number(attach.data.id), JSON.stringify(attach.data)).not.toBe(missingFileId);
        } else {
          expect(attach.data, JSON.stringify(attach.data)).toBeFalsy();
        }
      }

      const byId = await providerAPI.getOneProvider(request, providerId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expect(getRows<ApiRow>(byId.data?.documents).some((doc) => doc.id === missingFileId), JSON.stringify(byId.data)).toBe(false);
    });

    test('архивирует поставщика и проверяет архивную выдачу', async ({ request }) => {
      expect(providerId).toBeTruthy();
      const currentProviderId = providerId as number;

      const archive = await providerAPI.banProvider(request, currentProviderId, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);
      expect(archive.data?.ban, JSON.stringify(archive.data)).toBe(true);

      const archived = await eventually(async () => {
        const response = await providerAPI.getArchive(request, { searchString: providerName }, accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === currentProviderId));
      expect(archived, `Provider ${providerName} was not found in archive`).toBeTruthy();

      const active = await providerAPI.getProvidersPagination(
        request,
        paginationDto({ searchString: providerName }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(active.data)).toContain(active.status);
      expectNoServerError(active);
      expect(getRows<ApiRow>(active.data).some((row) => row.id === currentProviderId), JSON.stringify(active.data)).toBe(false);

      providerId = undefined;
    });
  });

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
      const missingBan = await providerAPI.banProvider(request, 999999999, accessToken);
      expectClientError(missingBan);

      const missingAttach = await providerAPI.attachFileToProvider(request, 999999999, 999999999, accessToken);
      expectNoServerError(missingAttach);
      if (clientErrorCodes.includes(missingAttach.status)) {
        expectErrorResponseContract(missingAttach);
      } else {
        expect(successCodes, JSON.stringify(missingAttach.data)).toContain(missingAttach.status);
      }

      const missingProvider = await providerAPI.getOneProvider(request, 999999999, accessToken);
      expectNoServerError(missingProvider);

      const invalidCreate = await captureApiResult(() => providerAPI.createProvider(request, {}, accessToken));
      expectEndpointReached(invalidCreate);
      if (!(invalidCreate instanceof Error) && clientErrorCodes.includes(invalidCreate.status)) {
        expectErrorResponseContract(invalidCreate);
      }
    });
  });
};
