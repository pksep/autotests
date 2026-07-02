import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class SolidworksAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/solidworks';

  async getEntity(request: APIRequestContext, entityName: string, entityType: string, accessToken?: string) {
    return this.apiRequest(
      request,
      'GET',
      this.base() + `/get-entity/${encodeURIComponent(entityName)}/${encodeURIComponent(entityType)}`,
      { accessToken },
    );
  }

  async createEntity(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/create-entity', {
      data: this.toMultipartFields(dto),
      accessToken,
      json: false,
    });
  }

  async updateEntity(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/update-entity', {
      data: this.toMultipartFields(dto),
      accessToken,
      json: false,
    });
  }
}
