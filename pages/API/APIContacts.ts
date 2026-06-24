import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/contacts/*` — Nest `ContactsController`. */
export class ContactsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/contacts';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createContact(request: APIRequestContext, contactData: any, accessToken?: string) {
    logger.info(`POST contacts/`);
    const response = await request.post(this.base() + '/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: contactData,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async updateContact(request: APIRequestContext, contactData: any, accessToken?: string) {
    const response = await request.put(this.base() + '/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: contactData,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async getContactsPagination(request: APIRequestContext, dto: any, accessToken?: string) {
    const response = await request.post(this.base() + '/pagination', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: dto,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async banContact(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.delete(this.base() + `/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async banContactsBulk(request: APIRequestContext, ids: number[] | string, accessToken?: string) {
    const value = Array.isArray(ids) ? ids.join(',') : ids;
    const response = await request.delete(this.base() + `/bulk/${value}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async getContactById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async getInclude(request: APIRequestContext, dto: any, accessToken?: string) {
    const response = await request.post(this.base() + '/include', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: dto,
    });
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }
}
