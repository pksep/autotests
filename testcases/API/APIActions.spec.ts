import { test, expect } from '@playwright/test';
import { ActionsAPI } from '../../pages/API/APIActions';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const actionsAPI = new ActionsAPI(null);

const actionsDto = (overrides: Record<string, unknown> = {}) => ({
  relativeActionType: 'assembly_kit',
  typeObject: null,
  offset: 0,
  searchString: '',
  ...overrides,
});

export const runActionsAPINew = () => {
  logger.info('Starting Actions API coverage suite');

  test.describe('Actions API: чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('получает действия по параметрам', async ({ request }) => {
      const response = await actionsAPI.getByParams(request, actionsDto(), accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
      }
    });

    test('фронтовые фильтры не приводят к 5xx', async ({ request }) => {
      for (const dto of [
        actionsDto({ typeObject: 'product' }),
        actionsDto({ responsibleId: [999999999], idObject: 999999999, typeObject: 'product' }),
      ]) {
        const response = await actionsAPI.getByParams(request, dto, accessToken);
        expectNoServerError(response);
      }
    });

    test('невалидный контракт не считается успешным', async ({ request }) => {
      const response = await actionsAPI.getByParams(
        request,
        { relativeActionType: null, offset: 'bad-offset', typeObject: 'bad-type' },
        accessToken,
      );

      expectNotSuccessful(response);
    });
  });
};
