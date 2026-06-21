import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
// External shared types aren't always available in the test project workspace.
// Use a permissive local alias to avoid build errors while keeping typing useful.
type CreateInventaryDtoType = Record<string, unknown>;

/** `api/inventary/*` — Nest `InventaryController` on sep_erp_server. */
export class InventoryAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/inventary';

  async createInventoryType(request: APIRequestContext, typeData: { name: string }, accessToken?: string) {
    logger.info(`Creating inventary type:`, typeData);
    const response = await request.post(this.base() + '/', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: typeData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) logger.error(`createInventoryType failed: ${response.status()}`);
    else logger.info(`Inventary type created`);
    return { status: response.status(), data };
  }

  async updateInventoryType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Updating inventary type:`, typeData);
    const response = await request.put(this.base() + '/', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: typeData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) logger.error(`updateInventoryType failed: ${response.status()}`);
    else logger.info(`Inventary type updated`);
    return { status: response.status(), data };
  }

  /**
   * Creates inventary item (POST `name/`). Server expects multipart + CreateInventaryDto fields.
   * @param accessToken JWT from login, or `invalid_user` / omit for no Authorization header.
   */
  async createInventory(request: APIRequestContext, inventoryData: CreateInventaryDtoType, accessToken?: string) {
    logger.info(`Creating inventary item:`, inventoryData);
    const response = await request.post(this.base() + '/name/', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
      multipart: this.toMultipartFields(inventoryData as Record<string, unknown>),
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) logger.error(`createInventory failed: ${response.status()}`);
    else logger.info(`Inventary item created`);
    return { status: response.status(), data };
  }

  async getOneInventory(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting inventary by id: ${id}`);
    const response = await request.get(this.base() + `/name/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getOneInventory failed: ${response.status()}`);
      throw new Error(`getOneInventory failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async updateInventory(request: APIRequestContext, inventoryData: CreateInventaryDtoType, accessToken?: string) {
    logger.info(`Updating inventary item:`, inventoryData);
    const response = await request.put(this.base() + '/name/', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
      multipart: this.toMultipartFields(inventoryData as Record<string, unknown>),
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`updateInventory failed: ${response.status()}`);
      throw new Error(`updateInventory failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  /** Deletes inventary item (server: DELETE `name/:id`). */
  async banInventory(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting inventary id: ${id}`);
    const response = await request.delete(this.base() + `/name/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`banInventory failed: ${response.status()}`);
      throw new Error(`banInventory failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getAllInventory(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting all inventary items`);
    const response = await request.get(this.base() + '/name/', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getAllInventory failed: ${response.status()}`);
      throw new Error(`getAllInventory failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }
}

