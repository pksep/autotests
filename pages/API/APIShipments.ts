import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/shipments/*` — Nest `ShipmentsController`. */
export class ShipmentsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/shipments';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async createShipment(request: APIRequestContext, shipmentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST shipments (multipart)`);
    const response = await request.post(this.base(), {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(this.token(accessToken)),
        compress: 'no-compress',
      },
      data: shipmentData,
    });
    return this.result(response);
  }

  async updateShipment(request: APIRequestContext, shipmentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`PUT shipments`);
    const response = await request.put(this.base(), {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(this.token(accessToken)),
        compress: 'no-compress',
      },
      data: shipmentData,
    });
    return this.result(response);
  }

  async getShipmentById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/oneships/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async deleteShipment(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.delete(this.base() + `/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getAllShipments(request: APIRequestContext, paginationData: any, accessToken?: string) {
    const response = await request.post(this.base() + '/pagination', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: paginationData,
    });
    return this.result(response);
  }

  async getAllShChecks(request: APIRequestContext, accessToken?: string) {
    const response = await request.get(this.base() + '/shcheck', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async createShCheck(request: APIRequestContext, shCheckData: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/shcheck', {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(this.token(accessToken)),
        compress: 'no-compress',
      },
      data: shCheckData,
    });
    return this.result(response);
  }

  async rollbackShCheck(request: APIRequestContext, shCheckId: number, accessToken?: string) {
    const response = await request.delete(this.base() + `/combackcomplit/${shCheckId}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getShCheckPagination(request: APIRequestContext, paginationData: any, accessToken?: string) {
    const response = await request.post(this.base() + '/shcheck/pagination', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: paginationData,
    });
    return this.result(response);
  }

  async getShCompleteById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/shcomplite/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getIncludeModel(request: APIRequestContext, id: number, includeData: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + `/getinclude/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: includeData,
    });
    return this.result(response);
  }

  async actualAllShipments(request: APIRequestContext, accessToken?: string) {
    const response = await request.put(this.base() + '/actual', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getIdsWithShipments(request: APIRequestContext, accessToken?: string) {
    const response = await request.get(this.base() + '/shipments/k6', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getItemsByEntity(request: APIRequestContext, entityType: string, entityId: number, accessToken?: string) {
    const response = await request.post(this.base() + '/items/by-entity', {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(this.token(accessToken)),
        compress: 'no-compress',
      },
      data: { entityType, entityId },
    });
    return this.result(response);
  }

  async setWarehouseReadinessDate(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.put(this.base() + '/set/warehouse/date', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: dto,
    });
    return this.result(response);
  }

  async getShipmentItems(request: APIRequestContext, shipmentId: number, accessToken?: string) {
    const response = await request.get(this.base() + `/one/izd/${shipmentId}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getShipmentsListPagination(request: APIRequestContext, light: boolean, paginationData: any, accessToken?: string) {
    const response = await request.post(this.base() + `/shipments-list/pagination/${light}`, {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: paginationData,
    });
    return this.result(response);
  }

  async getShipmentLightById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/light/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getShipmentsByProduct(request: APIRequestContext, productId: number, accessToken?: string) {
    const response = await request.get(this.base() + `/by-product/${productId}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getShipmentDocuments(request: APIRequestContext, shipmentId: number, accessToken?: string) {
    const response = await request.get(this.base() + `/documents/${shipmentId}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    return this.result(response);
  }

  async getAttributes(request: APIRequestContext, params: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/attributes', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: params,
    });
    return this.result(response);
  }
}
