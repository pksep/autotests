import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/sclad/*` — Nest `ScladController` on sep_erp_server. */
export class WarehouseAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/sclad';

  async getNeedsByParents(request: APIRequestContext, type: string, id: number, accessToken?: string) {
    logger.info(`needs_by_parents type=${type} id=${id}`);
    const response = await request.get(this.base() + `/needs-by-parents/${type}/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getNeedsByParents failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getDeficitFlags(request: APIRequestContext, accessToken?: string) {
    logger.info(`deficit flags`);
    const response = await request.get(this.base() + '/flags', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getDeficitFlags failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getNeedsByParent(request: APIRequestContext, parentData: any, accessToken?: string) {
    logger.info(`needs_by_parent:`, parentData);
    const response = await request.post(this.base() + '/needs_by_parent', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: parentData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getNeedsByParent failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async resetInSets(request: APIRequestContext, accessToken?: string) {
    logger.info(`reset_in_sets`);
    const response = await request.get(this.base() + '/reset_in_sets', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`resetInSets failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  /** Paginated remains (POST body GetRemainsDto). */
  async getWarehouseRemains(request: APIRequestContext, remainsData: any, accessToken?: string) {
    logger.info(`remains pagination:`, remainsData);
    const response = await request.post(this.base() + '/remains', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: remainsData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getWarehouseRemains failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getRemainsByEntityType(request: APIRequestContext, entityType: string, accessToken?: string) {
    logger.info(`remains/${entityType}`);
    const response = await request.get(this.base() + `/remains/${entityType}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getRemainsByEntityType failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async updateWarehouseItem(request: APIRequestContext, itemData: any, accessToken?: string) {
    logger.info(`PUT remains (revision):`, itemData);
    const response = await request.put(this.base() + '/remains', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: itemData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`updateWarehouseItem failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getRevisionHistory(request: APIRequestContext, dto: any, accessToken?: string) {
    logger.info(`revision history:`, dto);
    const response = await request.post(this.base() + '/revision/', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: dto,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getRevisionHistory failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async complitAssembly(request: APIRequestContext, izdId: number, typeIzd: string, accessToken?: string) {
    logger.info(`complitass ${izdId} ${typeIzd}`);
    const response = await request.get(this.base() + `/complitass/${izdId}/${typeIzd}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`complitAssembly failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  /**
   * Legacy helper used by defensive specs: hits POST `/remains` with arbitrary JSON
   * (server validates body — expect 400 / 401, not a dedicated "create warehouse" route).
   */
  async createWarehouseItem(request: APIRequestContext, itemData: any, accessToken?: string) {
    logger.info(`POST remains (legacy create probe):`, itemData);
    const response = await request.post(this.base() + '/remains', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: itemData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) logger.error(`createWarehouseItem probe status: ${response.status()}`);
    return { status: response.status(), data };
  }
}
