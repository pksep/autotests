import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class BuyerAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/buyer';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  private jsonHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      compress: 'no-compress',
      ...this.authHeaders(this.token(accessToken)),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async createBuyer(request: APIRequestContext, buyerData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating buyer with data:`, buyerData);

    const response = await request.post(this.base(), {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
      multipart: this.toMultipartFields(buyerData),
    });

    return this.result(response);
  }

  async updateBuyer(request: APIRequestContext, buyerData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating buyer with data:`, buyerData);

    const response = await request.post(this.base() + '/update', {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
      multipart: this.toMultipartFields(buyerData),
    });

    return this.result(response);
  }

  async checkNameExisting(request: APIRequestContext, checkData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Checking buyer name existing with data:`, checkData);

    const response = await request.post(this.base() + '/name/check', {
      headers: this.jsonHeaders(accessToken),
      data: checkData,
    });

    return this.result(response);
  }

  async getBuyersPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting buyers pagination with data:`, paginationData);

    const response = await request.post(this.base() + '/pagination', {
      headers: this.jsonHeaders(accessToken),
      data: paginationData,
    });

    return this.result(response);
  }

  async getBuyersArchive(request: APIRequestContext, archiveData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting buyers archive with data:`, archiveData);

    const response = await request.post(this.base() + '/archive', {
      headers: this.jsonHeaders(accessToken),
      data: archiveData,
    });

    return this.result(response);
  }

  async getInclude(request: APIRequestContext, id: number, includeData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting buyer include for id ${id}:`, includeData);

    const response = await request.post(this.base() + `/getinclude/${id}`, {
      headers: this.jsonHeaders(accessToken),
      data: includeData,
    });

    return this.result(response);
  }

  async getBuyers(request: APIRequestContext, light = true, accessToken?: string) {
    logger.info(`Getting buyers light=${light}`);

    const response = await request.get(this.base() + `/light/${light}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async getById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting buyer by id: ${id}`);

    const response = await request.get(this.base() + `/by_id/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async attachFileToBuyer(request: APIRequestContext, buyerId: number, fileId: number, accessToken?: string) {
    logger.info(`Attaching file ${fileId} to buyer ${buyerId}`);

    const response = await request.get(this.base() + `/files/${buyerId}/${fileId}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async banBuyer(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving buyer with id: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }
}
