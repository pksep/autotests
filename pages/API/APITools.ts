import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/instrument/*` — Nest `InstrumentController` on sep_erp_server. */
export class ToolsAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/instrument';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createToolType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Creating instrument type:`, typeData);
    return this.apiRequest(request, 'POST', this.base() + '/', {
      data: typeData,
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

  async getToolTypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/', {
      accessToken: this.token(accessToken),
    });
  }

  async getToolTypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/type/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateToolType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Updating instrument type:`, typeData);
    return this.apiRequest(request, 'POST', this.base() + '/update', {
      data: typeData,
      accessToken: this.token(accessToken),
    });
  }

  async removeToolType(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async createToolSubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pt', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getToolSubtypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getToolSubtypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/pt', {
      accessToken: this.token(accessToken),
    });
  }

  async updateToolSubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pt/update', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async removeToolSubtype(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  /** Creates instrument name (multipart). */
  async createTool(request: APIRequestContext, toolData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating instrument name:`, toolData);
    const response = await request.post(this.base() + '/nameinstrument', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(toolData),
    });
    return this.apiResult(response);
  }

  async getOneTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting instrument name by id: ${id}`);
    return this.apiRequest(request, 'GET', this.base() + `/name/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateTool(request: APIRequestContext, toolData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating instrument name:`, toolData);
    const response = await request.post(this.base() + '/nameinstrument/update', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(toolData),
    });
    return this.apiResult(response);
  }

  async removeFileTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Removing file from instrument, id: ${id}`);
    return this.apiRequest(request, 'DELETE', this.base() + `/file/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async banTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving instrument name id: ${id}`);
    return this.apiRequest(request, 'DELETE', this.base() + `/ban/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getArchivedTools(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/nameinstrument/archive/', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getAllTools(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting all instrument names`);
    return this.apiRequest(request, 'GET', this.base() + '/nameinstrument', {
      accessToken: this.token(accessToken),
    });
  }

  async getTypePagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/type/pagination', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getSubtypePagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/subtype/pagination', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getToolPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/instrument/pagination', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getDeficitTools(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/instrumentdeficit/', {
      accessToken: this.token(accessToken),
    });
  }
}
