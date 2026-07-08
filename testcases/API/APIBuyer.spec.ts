import { test, expect } from '@playwright/test';
import { BuyerAPI } from '../../pages/API/APIBuyer';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectClientError,
  expectNoServerError,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type BuyerLike = Record<string, any>;

const buyerAPI = new BuyerAPI(null);

const buyerPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  ...overrides,
});

const buyerPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  name: `API Buyer ${suffix}`,
  inn: `78${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `78${Math.floor(1000000 + Math.random() * 8999999)}`,
  rekvisit: JSON.stringify([
    { name: 'Юр. адрес', description: `API buyer address ${suffix}` },
    { name: 'Телефон', description: '' },
    { name: 'Сайт', description: '' },
    { name: 'Эл.почта', description: '' },
  ]),
  contacts: JSON.stringify([]),
  description: `Created by Buyer API autotest ${suffix}`,
  docs: '',
  attention: false,
  fileBase: '[]',
  ...overrides,
});

const expectBuyerShape = (buyer: BuyerLike) => {
  expect(buyer).toBeTruthy();
  expect(typeof buyer.id, JSON.stringify(buyer)).toBe('number');
  expect(buyer.name, JSON.stringify(buyer)).toBeTruthy();
};

const findBuyerByName = async (request: any, name: string, accessToken?: string): Promise<BuyerLike | undefined> => {
  const response = await eventually(async () => {
    const result = await buyerAPI.getBuyersPagination(request, buyerPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(result);
    return result;
  }, (result) => getRows<BuyerLike>(result.data).some((row) => row.name === name && row.ban !== true));

  return response ? getRows<BuyerLike>(response.data).find((row) => row.name === name && row.ban !== true) : undefined;
};

export const runBuyerAPINew = () => {
  logger.info('Starting Buyer API coverage suite');

  test.describe.serial('Buyer API: жизненный цикл покупателя', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let buyerId: number | undefined;
    let buyerName = '';
    let updatedBuyerName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (buyerId) {
        const archive = await buyerAPI.banBuyer(request, buyerId, accessToken);
        expectNoServerError(archive);
      }
    });

    test('создает покупателя и находит его в пагинации', async ({ request }) => {
      const suffix = uniqueApiSuffix('buyer');
      buyerName = `API Buyer ${suffix}`;
      updatedBuyerName = `API Buyer Updated ${suffix}`;

      const existingBefore = await buyerAPI.checkNameExisting(request, { name: buyerName }, accessToken);
      expectNoServerError(existingBefore);

      const create = await buyerAPI.createBuyer(request, buyerPayload(suffix), accessToken);
      test.skip(clientErrorCodes.includes(create.status), `POST /api/buyer is not available on this environment: ${create.status}`);
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);

      buyerId = Number(create.data?.id);
      expect(buyerId, JSON.stringify(create.data)).toBeGreaterThan(0);

      const created = await findBuyerByName(request, buyerName, accessToken);
      expect(created, `Buyer ${buyerName} was not found after create`).toBeTruthy();
      expectBuyerShape(created as BuyerLike);
    });

    test('читает покупателя по id, light-списку и include', async ({ request }) => {
      test.skip(!buyerId, 'Покупатель не создан на этом окружении');
      expect(buyerId).toBeTruthy();

      const byId = await buyerAPI.getById(request, buyerId as number, accessToken);
      expect(successCodes).toContain(byId.status);
      expectBuyerShape(byId.data);
      expect(byId.data.name).toBe(buyerName);

      const light = await buyerAPI.getBuyers(request, true, accessToken);
      expectNoServerError(light);
      if (!clientErrorCodes.includes(light.status)) {
        expect(successCodes).toContain(light.status);
        expect(Array.isArray(getRows(light.data)) || Array.isArray(light.data), JSON.stringify(light.data)).toBe(true);
      }

      const include = await buyerAPI.getInclude(request, buyerId as number, { includes: ['documents'] }, accessToken);
      expectNoServerError(include);
      if (!clientErrorCodes.includes(include.status)) {
        expect(successCodes).toContain(include.status);
        expect(Number(include.data?.id), JSON.stringify(include.data)).toBe(buyerId);
      }
    });

    test('обновляет покупателя и проверяет поиск по новому имени', async ({ request }) => {
      test.skip(!buyerId, 'Покупатель не создан на этом окружении');
      expect(buyerId).toBeTruthy();

      const update = await buyerAPI.updateBuyer(
        request,
        buyerPayload(updatedBuyerName.replace('API Buyer ', ''), {
          id: buyerId,
          name: updatedBuyerName,
          description: 'Updated by Buyer API autotest',
          attention: true,
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);

      const updated = await findBuyerByName(request, updatedBuyerName, accessToken);
      expect(updated, `Buyer ${updatedBuyerName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(buyerId);
      expect(updated?.attention).toBe(true);
    });

    test('архивирует покупателя и проверяет архивную выдачу', async ({ request }) => {
      test.skip(!buyerId, 'Покупатель не создан на этом окружении');
      expect(buyerId).toBeTruthy();

      const archive = await buyerAPI.banBuyer(request, buyerId as number, accessToken);
      expect(successCodes).toContain(archive.status);
      expectNoServerError(archive);

      const archived = await eventually(async () => {
        const response = await buyerAPI.getBuyersArchive(request, { searchString: updatedBuyerName }, accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => getRows<BuyerLike>(response.data).some((row) => row.id === buyerId));

      expect(archived, `Buyer ${updatedBuyerName} was not found in archive`).toBeTruthy();
      buyerId = undefined;
    });
  });

  test.describe('Buyer API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу покупателей со стабильной структурой', async ({ request }) => {
      const response = await buyerAPI.getBuyersPagination(request, buyerPaginationDto(), accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
        expectPaginationContract(response.data);
      }
    });

    test('обрабатывает пустой поиск и защитные строки без 5xx', async ({ request }) => {
      const cases = [
        'api-buyer-no-match-999999999',
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await buyerAPI.getBuyersPagination(request, buyerPaginationDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });

    test('light-список и архивная выдача не отвечают 5xx', async ({ request }) => {
      const light = await buyerAPI.getBuyers(request, true, accessToken);
      expectNoServerError(light);

      const archive = await buyerAPI.getBuyersArchive(request, { searchString: 'api-buyer-no-match-999999999' }, accessToken);
      expectNoServerError(archive);
    });

    test('невалидные мутации и no-auth не проходят успешно', async ({ request }) => {
      const invalidCreate = await buyerAPI.createBuyer(
        request,
        buyerPayload(uniqueApiSuffix('invalid'), { name: '', inn: '', cpp: '' }),
        accessToken,
      );
      expectNoServerError(invalidCreate);
      if (successCodes.includes(invalidCreate.status) && invalidCreate.data?.id) {
        const cleanup = await buyerAPI.banBuyer(request, Number(invalidCreate.data.id), accessToken);
        expectNoServerError(cleanup);
      }
      expectClientError(invalidCreate);

      const noAuth = await buyerAPI.createBuyer(request, buyerPayload(uniqueApiSuffix('noauth')));
      expectClientError(noAuth);
    });
  });
};
