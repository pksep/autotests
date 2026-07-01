import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class MarksAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/marks';

  async getMarks(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/marks', { accessToken });
  }

  async createMark(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/mark', {
      data: dto,
      accessToken,
    });
  }

  async getMarkForOperation(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/marks/operations', {
      data: dto,
      accessToken,
    });
  }

  async getResultWorks(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/resultworks', {
      data: dto,
      accessToken,
    });
  }

  async getMarkById(request: APIRequestContext, id: number, isIncludeBan = false, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/mark/${isIncludeBan}/${id}`, { accessToken });
  }

  async getMarkByIdRaw(request: APIRequestContext, id: string, isIncludeBan = 'false', accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/mark/${isIncludeBan}/${encodeURIComponent(id)}`, {
      accessToken,
    });
  }

  async updateMark(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/mark', {
      data: dto,
      accessToken,
    });
  }

  async deleteMark(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/delete/mark/${id}`, { accessToken });
  }

  async getMarksByOperation(request: APIRequestContext, operationId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/marks/byoperation/${operationId}`, { accessToken });
  }

  async getMarksByOperationRaw(request: APIRequestContext, operationId: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/marks/byoperation/${encodeURIComponent(operationId)}`, {
      accessToken,
    });
  }
}
