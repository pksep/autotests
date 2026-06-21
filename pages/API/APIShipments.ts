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

  async createShipment(request: APIRequestContext, shipmentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST shipments (multipart)`);
    const response = await request.post(this.base(), {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(shipmentData),
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async updateShipment(request: APIRequestContext, shipmentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`PUT shipments`);
    const response = await request.put(this.base(), {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(shipmentData),
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async getShipmentById(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.get(this.base() + `/oneships/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getShipmentById: ${response.status()}`);
    return { status: response.status(), data };
  }

  async deleteShipment(request: APIRequestContext, id: number, accessToken?: string) {
    const response = await request.delete(this.base() + `/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
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
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getAllShipments: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getShipmentsByStatus(request: APIRequestContext, _status: string, accessToken?: string) {
    return this.apiProbe(request, 'ShipmentsAPI.getShipmentsByStatus', { _status }, this.token(accessToken));
  }

  async updateShipmentStatus(request: APIRequestContext, shipmentId: number, status: string, accessToken?: string) {
    return this.apiProbe(request, 'ShipmentsAPI.updateShipmentStatus', { shipmentId, status }, this.token(accessToken));
  }

  async getShipmentItems(request: APIRequestContext, shipmentId: number, accessToken?: string) {
    const response = await request.get(this.base() + `/one/izd/${shipmentId}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getShipmentItems: ${response.status()}`);
    return { status: response.status(), data };
  }

  async addShipmentItem(request: APIRequestContext, shipmentId: number, itemData: any, accessToken?: string) {
    return this.apiProbe(request, 'ShipmentsAPI.addShipmentItem', { shipmentId, itemData }, this.token(accessToken));
  }

  async trackShipment(request: APIRequestContext, trackingNumber: string, accessToken?: string) {
    return this.apiProbe(request, 'ShipmentsAPI.trackShipment', { trackingNumber }, this.token(accessToken));
  }
}
