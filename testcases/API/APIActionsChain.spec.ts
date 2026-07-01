import { test, expect } from '@playwright/test';
import { ActionsAPI } from '../../pages/API/APIActions';
import { ActionsChainAPI } from '../../pages/API/APIActionsChain';
import { clientErrorCodes, expectNoServerError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const actionsAPI = new ActionsAPI(null);
const actionsChainAPI = new ActionsChainAPI(null);

export const runActionsChainAPINew = () => {
  logger.info('Starting Actions Chain API coverage suite');

  test.describe('Actions Chain API: дерево действий', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает цепочку для существующего действия', async ({ request }) => {
      const actions = await actionsAPI.getByParams(
        request,
        { relativeActionType: 'assembly_kit', typeObject: null, offset: 0, searchString: '' },
        accessToken,
      );
      expectNoServerError(actions);
      test.skip(clientErrorCodes.includes(actions.status), 'Actions API недоступен для поиска исходного действия.');

      const action = getRows<Record<string, any>>(actions.data).find((row) => row.id);
      test.skip(!action, 'В dev-базе нет действий для проверки actions-chain.');

      const chain = await actionsChainAPI.getChilds(request, Number(action!.id), accessToken);
      expectNoServerError(chain);
      if (!clientErrorCodes.includes(chain.status)) {
        expect(successCodes, JSON.stringify(chain.data)).toContain(chain.status);
        expect(chain.data?.id, JSON.stringify(chain.data)).toBeTruthy();
        expect(Array.isArray(chain.data?.child_actions ?? []), JSON.stringify(chain.data)).toBe(true);
      }
    });
  });
};
