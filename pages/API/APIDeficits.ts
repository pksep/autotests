import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class DeficitsAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/deficits';

  async getDeficitTable(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/table_deficit', { accessToken });
  }

  async updateDeficitTable(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/table_deficit', {
      data: dto,
      accessToken,
    });
  }

  async getMaterialDeficits(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/materials', {
      data: dto,
      accessToken,
    });
  }

  async getMaterialForShipment(request: APIRequestContext, shipmentId: number, type: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/materials/shipments/${shipmentId}/${type}`, {
      accessToken,
    });
  }

  async getMaterialShipmentAttractions(request: APIRequestContext, materialId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/materialonecshipments/${materialId}`, { accessToken });
  }

  async getMaterialParents(request: APIRequestContext, materialId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/materialparents/${materialId}`, { accessToken });
  }

  async updateAllDeficits(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/update-all-deficit', { accessToken });
  }
}
