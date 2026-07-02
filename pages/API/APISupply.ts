import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class SupplyAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  async getNewNumberOrder(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + 'api/supply/new-number-order', { accessToken });
  }

  async postNewNumberOrder(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/supply/new-number-order', { data, accessToken });
  }
}
