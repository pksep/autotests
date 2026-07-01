import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

/** `api/waybill/*` - Nest `WaybillController`. */
export class WaybillAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/waybill';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' ? accessToken : undefined;
  }

  async getDeliveriedComing(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/deliveriedcoming', {
      accessToken: this.token(accessToken),
    });
  }

  async getLastWaybill(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/last', {
      accessToken: this.token(accessToken),
    });
  }

  async createWaybill(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/create', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async updateWaybill(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/update', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async deleteWaybill(request: APIRequestContext, id: number | string, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/${encodeURIComponent(String(id))}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getWaybillPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getWaybillById(request: APIRequestContext, id: number | string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/${encodeURIComponent(String(id))}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getByStockOrder(
    request: APIRequestContext,
    stockOrderId: number | string,
    stockType: string,
    accessToken?: string,
  ) {
    return this.apiRequest(
      request,
      'GET',
      this.base() + `/getByStockOrder/${encodeURIComponent(String(stockOrderId))}/${encodeURIComponent(stockType)}`,
      { accessToken: this.token(accessToken) },
    );
  }
}
