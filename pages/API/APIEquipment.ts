import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/equipment/*` — Nest `EquipmentController`. */
export class EquipmentAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/equipment';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createEquipmentType(request: APIRequestContext, equipmentData: { name: string }, accessToken?: string) {
    logger.info(`POST equipment/ (type)`);
    return this.apiRequest(request, 'POST', this.base() + '/', {
      data: equipmentData,
      accessToken: this.token(accessToken),
    });
  }

  async checkNameUnique(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/name/unique', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async checkNameExisting(request: APIRequestContext, dto: { name: string }, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/name/check', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getEquipmentTypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/', {
      accessToken: this.token(accessToken),
    });
  }

  async getEquipmentTypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/type/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateEquipmentType(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/update', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async removeEquipmentType(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async createEquipmentSubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pt', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getEquipmentSubtypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getEquipmentSubtypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/pt', {
      accessToken: this.token(accessToken),
    });
  }

  async updateEquipmentSubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pt/update', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async removeEquipmentSubtype(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async createEquipment(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/eq', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      multipart: this.toMultipartFields(dto),
    });
    return this.apiResult(response);
  }

  async updateEquipment(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/eq/update', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      multipart: this.toMultipartFields(dto),
    });
    return this.apiResult(response);
  }

  async getEquipmentById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/eq/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async banEquipment(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/ban/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getAllEquipment(request: APIRequestContext, light: boolean, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/eq/all/${light}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getArchivedEquipment(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/eq/archive/', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getTypePagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination/type', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getSubtypePagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination/subtype', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getEquipmentPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination/equipment', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getByTypeOperation(request: APIRequestContext, typeOperationId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/by-type-operation/${typeOperationId}`, {
      accessToken: this.token(accessToken),
    });
  }
}
