import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

/** `api/deliveries/*` — supplier deliveries/orders. */
export class DeliveriesAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/deliveries';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createDelivery(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getAllDeliveries(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/', {
      accessToken: this.token(accessToken),
    });
  }

  async getDeliveryById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getDeliveryPositions(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/${id}/positions`, {
      accessToken: this.token(accessToken),
    });
  }

  async banDelivery(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/banned/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getDeliveriesPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getByCompany(request: APIRequestContext, companyId: number, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + `/by-company/${companyId}`, {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }
}
