import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class MovementObjectAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/movement-object';

  async getObjectsHistory(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/', {
      data: dto,
      accessToken,
    });
  }

  async getOneMovementObject(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/one/${id}`, { accessToken });
  }

  async getOneMovementObjectRaw(request: APIRequestContext, id: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/one/${encodeURIComponent(id)}`, { accessToken });
  }
}
