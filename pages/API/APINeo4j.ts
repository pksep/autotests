import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class Neo4jAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/neo4j';

  async getRelativesStairs(request: APIRequestContext, itemType: string, itemId: number, accessToken?: string) {
    logger.info(`Getting Neo4j relatives stairs for ${itemType}:${itemId}`);

    return this.apiRequest(request, 'GET', this.base() + `/stairs/${encodeURIComponent(itemType)}/${itemId}`, {
      accessToken,
    });
  }

  async getRelativesStairsRaw(request: APIRequestContext, itemType: string, itemId: string, accessToken?: string) {
    logger.info(`Getting Neo4j relatives stairs raw for ${itemType}:${itemId}`);

    return this.apiRequest(
      request,
      'GET',
      this.base() + `/stairs/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}`,
      { accessToken },
    );
  }
}
