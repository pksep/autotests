import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/specification/*` — Nest `SpecificationController` (sep_erp_server). */
export class SpecificationsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/specification';

  async getAttributesFromIds(request: APIRequestContext, attributesData: any, accessToken?: string) {
    logger.info(`POST specification/attributes`);
    const response = await request.post(this.base() + '/attributes', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(accessToken),
      },
      data: attributesData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getAttributesFromIds failed: ${response.status()}`);
      throw new Error(`getAttributesFromIds failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async calculateProductionTime(request: APIRequestContext, type: string, id: number, accessToken?: string) {
    logger.info(`PUT specification/time/${type}/${id}`);
    const response = await request.put(this.base() + `/time/${encodeURIComponent(type)}/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  /**
   * Сервер не имеет POST `/specification` — defensive-спеки бьют в `attributes` с тем же телом.
   */
  async createSpecification(request: APIRequestContext, specData: any, accessToken?: string) {
    logger.info(`createSpecification → POST specification/attributes`);
    const response = await request.post(this.base() + '/attributes', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(
          accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined
        ),
      },
      data: specData,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async updateSpecification(request: APIRequestContext, specData: any, accessToken?: string) {
    return this.createSpecification(request, specData, accessToken);
  }

  async getSpecificationById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.getAttributesFromIds(request, { ids: [id] }, accessToken);
  }

  async deleteSpecification(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`deleteSpecification: no matching route — probe`);
    return this.apiProbe(request, 'SpecificationsAPI.deleteSpecification', { id }, accessToken);
  }

  async getAllSpecifications(request: APIRequestContext, paginationData: any, accessToken?: string) {
    return this.getAttributesFromIds(request, paginationData, accessToken);
  }

  async getSpecificationsByProduct(request: APIRequestContext, productId: number, accessToken?: string) {
    return this.getAttributesFromIds(request, { productId }, accessToken);
  }

  async validateSpecification(request: APIRequestContext, validateData: any, accessToken?: string) {
    return this.getAttributesFromIds(request, validateData, accessToken);
  }

  async exportSpecification(request: APIRequestContext, id: number, format: string, accessToken?: string) {
    return this.getAttributesFromIds(request, { id, format }, accessToken);
  }
}
