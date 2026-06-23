import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class StockOrderAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/stock-order';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  private stockOrderAuthHeaders(accessToken?: string, extra: Record<string, string> = {}) {
    const token = this.token(accessToken);
    return {
      ...extra,
      ...this.authHeaders(token),
      ...(token ? { Cookie: `access_token=${token}` } : {}),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async getCount(request: APIRequestContext, accessToken?: string) {
    logger.info('Getting stock order count');

    const response = await request.get(this.base() + '/count', {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAll(request: APIRequestContext, archive: boolean, accessToken?: string) {
    logger.info(`Getting all stock orders, archive=${archive}`);

    const response = await request.get(this.base() + `/all/${archive}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting stock orders with main pagination');

    const response = await request.post(this.base() + '/pagination', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getPaginationByArchive(
    request: APIRequestContext,
    archive: boolean,
    paginationData: Record<string, unknown>,
    accessToken?: string,
  ) {
    logger.info(`Getting stock orders with archive pagination, archive=${archive}`);

    const response = await request.post(this.base() + `/pagination/${archive}`, {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getOrderPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting stock orders to way pagination');

    const response = await request.post(this.base() + '/order/pagination', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getOne(request: APIRequestContext, stockOrderData: Record<string, unknown>, accessToken?: string) {
    logger.info('Getting one stock order');

    const response = await request.post(this.base() + '/one', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: stockOrderData,
    });

    return this.result(response);
  }

  async create(request: APIRequestContext, stockOrderData: Record<string, unknown>, accessToken?: string) {
    logger.info('Creating stock order');

    const response = await request.post(this.base() + '/', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: stockOrderData,
    });

    return this.result(response);
  }

  async update(request: APIRequestContext, id: number, stockOrderData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating stock order ID: ${id}`);

    const response = await request.put(this.base() + `/update/${id}`, {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: stockOrderData,
    });

    return this.result(response);
  }

  async ban(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving stock order ID: ${id}`);

    const response = await request.delete(this.base() + `/banned/${id}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getItem(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting stock order item ID: ${id}`);

    const response = await request.get(this.base() + `/item/${id}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async updateItem(request: APIRequestContext, itemData: Record<string, unknown>, accessToken?: string) {
    logger.info('Updating stock order item');

    const response = await request.put(this.base() + '/items', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: itemData,
    });

    return this.result(response);
  }

  async banItem(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving stock order item ID: ${id}`);

    const response = await request.delete(this.base() + `/items/${id}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByObject(request: APIRequestContext, id: number | string, typeObject: string, accessToken?: string) {
    logger.info(`Getting stock orders by object ${typeObject}:${id}`);

    const response = await request.get(this.base() + `/by-obj-id/${id}/${encodeURIComponent(typeObject)}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getItemsByEntity(request: APIRequestContext, entityType: string, entityId: number, accessToken?: string) {
    logger.info(`Getting stock order items by entity ${entityType}:${entityId}`);

    const response = await request.get(this.base() + `/items/by-entity/${encodeURIComponent(entityType)}/${entityId}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async setWarehouseReadinessDate(
    request: APIRequestContext,
    readinessData: Record<string, unknown>,
    accessToken?: string,
  ) {
    logger.info('Setting stock order item warehouse readiness date');

    const response = await request.put(this.base() + '/set/warehouse/date', {
      headers: this.stockOrderAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: readinessData,
    });

    return this.result(response);
  }

  async getItemsByStockOrder(request: APIRequestContext, stockOrderId: number, accessToken?: string) {
    logger.info(`Getting stock order items by stock order ID: ${stockOrderId}`);

    const response = await request.get(this.base() + `/by-stock-order/${stockOrderId}`, {
      headers: this.stockOrderAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }
}
