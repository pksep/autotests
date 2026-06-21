import { Page, APIRequestContext } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';
import { ENV } from '../../config';

/** `api/tech-process/*` — Nest `TechProcessController` + `PUT api/shipments/actual` for batch “actual” refresh. */
export class TechProcessAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/tech-process';

  async createOrUpdateTechProcess(request: APIRequestContext, techProcessData: Record<string, unknown>, accessToken?: string) {
    logger.info(`POST tech-process/ (multipart)`);
    const response = await request.post(this.base() + '/', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
      multipart: this.toMultipartFields(techProcessData),
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  /** Обновление всех отгрузок “актуальных” (сервер: ShipmentsController.actualAllShipments). */
  async updateActualOperations(request: APIRequestContext, accessToken?: string) {
    logger.info(`PUT shipments/actual`);
    const response = await request.put(ENV.API_BASE_URL + 'api/shipments/actual', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  /** Alias: same as {@link updateActualOperations} (legacy spec name). */
  async updateActual(request: APIRequestContext, accessToken?: string) {
    return this.updateActualOperations(request, accessToken);
  }

  async getTechProcessById(request: APIRequestContext, id: string, accessToken?: string) {
    logger.info(`GET tech-process/${id}`);
    const response = await request.get(this.base() + `/${encodeURIComponent(id)}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }
}
