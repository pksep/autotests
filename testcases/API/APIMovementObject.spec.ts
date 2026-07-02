import { test, expect } from '@playwright/test';
import { MovementObjectAPI } from '../../pages/API/APIMovementObject';
import {
  clientErrorCodes,
  expectMissingResource,
  expectNoServerError,
  expectPaginationContract,
  expectValidationError,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const movementObjectAPI = new MovementObjectAPI(null);

const historyDto = (overrides: Record<string, unknown> = {}) => ({
  byParents: {
    productIds: [],
    cbedIds: [],
    detalIds: [],
    materialIds: [],
  },
  isCheckChildrens: false,
  date: {
    start: '2020-01-01T00:00:00.000Z',
    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  page: 0,
  ...overrides,
});

export const runMovementObjectAPINew = () => {
  logger.info('Starting Movement Object API coverage suite');

  test.describe('Movement Object API: история перемещений', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает историю перемещений с пагинацией', async ({ request }) => {
      const response = await movementObjectAPI.getObjectsHistory(request, historyDto(), accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectPaginationContract(response.data);
      }
    });

    test('читает одно перемещение из истории, если оно есть', async ({ request }) => {
      const history = await movementObjectAPI.getObjectsHistory(request, historyDto(), accessToken);
      expectNoServerError(history);
      test.skip(clientErrorCodes.includes(history.status), 'Movement history недоступна.');

      const movement = getRows<Record<string, any>>(history.data).find((row) => row.id);
      test.skip(!movement, 'В dev-базе нет перемещений для чтения по id.');

      const byId = await movementObjectAPI.getOneMovementObject(request, Number(movement!.id), accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(Number(movement!.id));
      }
    });

    test('пустой фильтр по родителям возвращает валидную пагинацию без 5xx', async ({ request }) => {
      const response = await movementObjectAPI.getObjectsHistory(
        request,
        historyDto({ byParents: { productIds: [999999999], cbedIds: [], detalIds: [], materialIds: [] } }),
        accessToken,
      );

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expectPaginationContract(response.data);
      }
    });

    test.describe('Movement Object API: defensive-сценарии', () => {
      test('отклоняет несуществующее перемещение без 5xx и без ложного успеха', async ({ request }) => {
        const response = await movementObjectAPI.getOneMovementObject(request, 999999999, accessToken);
        expectMissingResource(response);
      });

      test('отклоняет нечисловой id перемещения как validation error', async ({ request }) => {
        const response = await movementObjectAPI.getOneMovementObjectRaw(request, 'bad-id', accessToken);
        expectValidationError(response);
      });

      test('отклоняет невалидный payload истории перемещений как validation error', async ({ request }) => {
        const response = await movementObjectAPI.getObjectsHistory(
          request,
          {
            byParents: 'bad-parents',
            isCheckChildrens: 'yes',
            date: { start: 'bad-date', end: 'also-bad' },
            page: -1,
          },
          accessToken,
        );

        expectValidationError(response);
      });
    });
  });
};
