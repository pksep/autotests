import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class RackAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/rack';

  async createRack(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base(), { data: dto, accessToken });
  }

  async updateRack(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base(), { data: dto, accessToken });
  }

  async updateCell(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/update/cell', { data: dto, accessToken });
  }

  async addDataToCell(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/add/cell', { data: dto, accessToken });
  }

  async deleteDataByIds(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + '/delete/cell', { data: dto, accessToken });
  }

  async banRack(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/${id}`, { accessToken });
  }

  async getAllRacks(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination', { data: dto, accessToken });
  }

  async getOneRack(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/${id}`, { accessToken });
  }
}
