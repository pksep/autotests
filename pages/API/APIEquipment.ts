import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/equipment/*` — Nest `EquipmentController`. */
export class EquipmentAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/equipment';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createEquipmentType(request: APIRequestContext, equipmentData: { name: string }, accessToken?: string) {
    logger.info(`POST equipment/ (type)`);
    const response = await request.post(this.base() + '/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: equipmentData,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }
}
