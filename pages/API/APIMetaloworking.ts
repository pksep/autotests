import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class MetaloworkingAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/metaloworking';

  private metaloworkingAuthHeaders(accessToken?: string, extra: Record<string, string> = {}) {
    return {
      ...extra,
      ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined),
      ...(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken)
        ? { Cookie: `access_token=${accessToken}` }
        : {}),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response), headers: response.headers() };
  }

  async create(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Creating metaloworking');

    const response = await request.post(this.base() + '/', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async update(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Updating metaloworking');

    const response = await request.put(this.base() + '/', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async getById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting metaloworking by ID: ${id}`);

    const response = await request.get(this.base() + `/${id}`, {
      headers: this.metaloworkingAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByIdLight(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting light metaloworking by ID: ${id}`);

    const response = await request.get(this.base() + `/light/${id}`, {
      headers: this.metaloworkingAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByDetalLight(request: APIRequestContext, detalId: number, accessToken?: string) {
    logger.info(`Getting metaloworking by detail ID: ${detalId}`);

    const response = await request.get(this.base() + `/bydetal/light/${detalId}`, {
      headers: this.metaloworkingAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getPagination(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting metaloworking pagination');

    const response = await request.post(this.base() + '/pagination', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async getComingPagination(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting metaloworking coming pagination');

    const response = await request.post(this.base() + '/coming/pagination', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async getOperationPagination(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting metaloworking operation pagination');

    const response = await request.post(this.base() + '/pagination/operations', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async getComplectationOperationPagination(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting metaloworking complectation operation pagination');

    const response = await request.post(this.base() + '/pagination/operations/complectation', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async createShapeBid(request: APIRequestContext, data: Array<Record<string, unknown>>, accessToken?: string) {
    logger.info('Creating metaloworking shape bid');

    const response = await request.post(this.base() + '/shapebid/', {
      headers: this.metaloworkingAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data,
    });

    return this.result(response);
  }

  async delete(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting metaloworking ID: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: this.metaloworkingAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async comback(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Restoring metaloworking ID: ${id}`);

    const response = await request.put(this.base() + `/comback/${id}`, {
      headers: this.metaloworkingAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }
}
