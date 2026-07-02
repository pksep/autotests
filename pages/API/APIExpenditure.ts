import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ExpenditureAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/expenditure';

  async getExpenditures(request: APIRequestContext, expenditureData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting expenditures with data:`, expenditureData);

    return this.apiRequest(request, 'POST', this.base(), {
      data: expenditureData,
      accessToken,
    });
  }
}
