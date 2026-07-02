import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class ProviderAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/provider';

  async createProvider(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base(), {
      data: this.toMultipartFields(dto),
      accessToken,
      json: false,
    });
  }

  async getProvidersPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination', { data: dto, accessToken });
  }

  async checkNameExisting(request: APIRequestContext, dto: { name: string }, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/name/check', { data: dto, accessToken });
  }

  async getProviders(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base(), { accessToken });
  }

  async getOneProvider(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/${id}`, { accessToken });
  }

  async getArchive(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/archive', { data: dto, accessToken });
  }

  async banProvider(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/ban/${id}`, { accessToken });
  }

  async attachFileToProvider(request: APIRequestContext, providerId: number, fileId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/files/${providerId}/${fileId}`, { accessToken });
  }
}
