import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/companies/*` — Nest `CompaniesController`. */
export class CompaniesAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/companies';

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

  async createCompany(request: APIRequestContext, companyData: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST companies/`);
    const response = await request.post(this.base() + '/', {
      headers: this.jsonHeaders(accessToken),
      data: companyData,
    });
    return this.result(response);
  }

  async updateCompany(request: APIRequestContext, companyData: Record<string, unknown>, accessToken?: string) {
    logger.info(`PUT companies/`);
    const response = await request.put(this.base() + '/', {
      headers: this.jsonHeaders(accessToken),
      data: companyData,
    });
    return this.result(response);
  }

  async checkName(request: APIRequestContext, name: string, accessToken?: string) {
    const response = await request.get(this.base() + `/check/${encodeURIComponent(name)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return this.result(response);
  }

  async getCompaniesPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/pagination', {
      headers: this.jsonHeaders(accessToken),
      data: dto,
    });
    return this.result(response);
  }

  async getCompanyById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return this.result(response);
  }

  async banCompany(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.delete(this.base() + `/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return this.result(response);
  }

  async banCompaniesBulk(request: APIRequestContext, ids: number[] | string, accessToken?: string) {
    const value = Array.isArray(ids) ? ids.join(',') : ids;
    const response = await request.delete(this.base() + `/bulk/${value}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return this.result(response);
  }

  async getInclude(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/include', {
      headers: this.jsonHeaders(accessToken),
      data: dto,
    });
    return this.result(response);
  }

  async unpinContact(request: APIRequestContext, companyId: number, contactId: number, accessToken?: string) {
    const response = await request.put(this.base() + `/unpin-contact/${companyId}/${contactId}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    return this.result(response);
  }
}
