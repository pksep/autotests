import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
// External shared types aren't always available in the test project workspace.
// Use a permissive local alias to avoid build errors while keeping typing useful.
type CreateInventaryDtoType = Record<string, unknown>;

/** `api/inventary/*` — Nest `InventaryController` on sep_erp_server. */
export class InventoryAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/inventary';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createInventoryType(request: APIRequestContext, typeData: { name: string }, accessToken?: string) {
    logger.info(`Creating inventary type:`, typeData);
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

  async getInventoryTypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/', {
      accessToken: this.token(accessToken),
    });
  }

  async getInventoryTypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/type/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateInventoryType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Updating inventary type:`, typeData);
    return this.apiRequest(request, 'PUT', this.base() + '/', {
      data: typeData,
      accessToken: this.token(accessToken),
    });
  }

  async removeInventoryType(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async createInventorySubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pt/', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getInventorySubtypeById(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getInventorySubtypes(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/pt/', {
      accessToken: this.token(accessToken),
    });
  }

  async updateInventorySubtype(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/pt/', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async removeInventorySubtype(request: APIRequestContext, id: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/pt/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  /**
   * Creates inventary item (POST `name/`). Server expects multipart + CreateInventaryDto fields.
   * @param accessToken JWT from login, or `invalid_user` / omit for no Authorization header.
   */
  async createInventory(request: APIRequestContext, inventoryData: CreateInventaryDtoType, accessToken?: string) {
    logger.info(`Creating inventary item:`, inventoryData);
    const response = await request.post(this.base() + '/name/', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(inventoryData as Record<string, unknown>),
    });
    return this.apiResult(response);
  }

  async getOneInventory(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting inventary by id: ${id}`);
    return this.apiRequest(request, 'GET', this.base() + `/name/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateInventory(request: APIRequestContext, inventoryData: CreateInventaryDtoType, accessToken?: string) {
    logger.info(`Updating inventary item:`, inventoryData);
    const response = await request.put(this.base() + '/name/', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(inventoryData as Record<string, unknown>),
    });
    return this.apiResult(response);
  }

  /** Deletes inventary item (server: DELETE `name/:id`). */
  async banInventory(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting inventary id: ${id}`);
    return this.apiRequest(request, 'DELETE', this.base() + `/name/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getAllInventory(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting all inventary items`);
    return this.apiRequest(request, 'GET', this.base() + '/name/', {
      accessToken: this.token(accessToken),
    });
  }

  async getArchivedInventory(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/name/archive/', {
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

  async getInventoryPagination(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/pagination/inventary', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }
}

