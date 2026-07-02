import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ExclusionAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/exclusion';

  async getExclusionPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting exclusions pagination with data:`, paginationData);

    return this.apiRequest(request, 'POST', this.base() + '/pagination', {
      data: paginationData,
      accessToken,
    });
  }

  async getExclusionById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting exclusion by id: ${id}`);

    return this.apiRequest(request, 'GET', this.base() + `/${id}`, {
      accessToken,
    });
  }

  async createExclusion(request: APIRequestContext, exclusionData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating exclusion with data:`, exclusionData);

    return this.apiRequest(request, 'POST', this.base(), {
      data: exclusionData,
      accessToken,
    });
  }

  async updateExclusion(request: APIRequestContext, id: number, exclusionData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating exclusion ${id} with data:`, exclusionData);

    return this.apiRequest(request, 'PUT', this.base() + `/${id}`, {
      data: exclusionData,
      accessToken,
    });
  }

  async banExclusionById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving exclusion with id: ${id}`);

    return this.apiRequest(request, 'DELETE', this.base() + `/${id}`, {
      accessToken,
    });
  }
}
