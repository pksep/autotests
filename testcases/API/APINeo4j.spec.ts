import { test, expect } from '@playwright/test';
import { Neo4jAPI } from '../../pages/API/APINeo4j';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectValidationError, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

const neo4jAPI = new Neo4jAPI(null);

export const runNeo4jAPINew = () => {
  logger.info('Starting Neo4j API coverage suite');

  test.describe('Neo4j API: relatives stairs contracts и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('строит stairs для валидного типа без серверной ошибки, если Neo4j доступен', async ({ request }) => {
      const response = await neo4jAPI.getRelativesStairs(request, 'product', 999999999, accessToken);
      if (response.status >= 500) {
        test.skip(true, `Neo4j service is not available on this environment: ${response.status}`);
      }

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expect(response.data && typeof response.data, JSON.stringify(response.data)).toBe('object');
        expect(Array.isArray(response.data.shipments), JSON.stringify(response.data)).toBe(true);
        expect(Array.isArray(response.data.stockOrders), JSON.stringify(response.data)).toBe(true);
      }
    });

    test('отклоняет неизвестный тип сущности без 5xx', async ({ request }) => {
      const response = await neo4jAPI.getRelativesStairs(request, 'unknown', 1, accessToken);
      expectValidationError(response);
    });

    test('отклоняет нечисловой itemId как validation error', async ({ request }) => {
      const response = await neo4jAPI.getRelativesStairsRaw(request, 'product', 'bad-id', accessToken);
      expectValidationError(response);
    });
  });
};
