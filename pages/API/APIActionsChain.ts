import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class ActionsChainAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/actions-chain';

  async getChilds(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/childs/${id}`, {
      accessToken,
    });
  }
}
