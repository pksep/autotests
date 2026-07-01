import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/operation/*` — Nest `OperationController`. */
export class OperationAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/operation';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async getTypeOperations(request: APIRequestContext, light = true, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/typeoperation/${light}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getTypeOperationStatic(request: APIRequestContext, typeWorking: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/typeoperation/static/${encodeURIComponent(typeWorking)}`, {
      accessToken: this.token(accessToken),
    });
  }

  async checkNameUnique(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/name/unique', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async createTypeOperation(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/typeoperation', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async updateTypeOperation(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/typeoperation/update', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getTypeOperationById(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/typeoperation/get', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async banTypeOperation(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/typeoperation/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async createOperation(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST operation/operation`);
    const response = await request.post(this.base() + '/operation', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      multipart: this.toMultipartFields(dto),
    });
    return this.apiResult(response);
  }

  async updateOperation(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST operation/operation/update`);
    const response = await request.post(this.base() + '/operation/update', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      multipart: this.toMultipartFields(dto),
    });
    return this.apiResult(response);
  }

  async getOperationById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/operation/get/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getAllOperations(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/operation/get/', {
      accessToken: this.token(accessToken),
    });
  }

  async updateOperationTech(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/operation/up/tech', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async banOperation(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/operation/${id}`, {
      accessToken: this.token(accessToken),
    });
  }
}
