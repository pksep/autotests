import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/instrument/*` — Nest `InstrumentController` on sep_erp_server. */
export class ToolsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/instrument';

  async createToolType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Creating instrument type:`, typeData);
    const response = await request.post(this.base() + '/', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: typeData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`createToolType failed: ${response.status()}`);
      throw new Error(`createToolType failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async updateToolType(request: APIRequestContext, typeData: any, accessToken?: string) {
    logger.info(`Updating instrument type:`, typeData);
    const response = await request.post(this.base() + '/update', {
      headers: { ...this.authHeaders(accessToken), 'Content-Type': 'application/json', compress: 'no-compress' },
      data: typeData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`updateToolType failed: ${response.status()}`);
      throw new Error(`updateToolType failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  /** Creates instrument name (multipart). */
  async createTool(request: APIRequestContext, toolData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating instrument name:`, toolData);
    const response = await request.post(this.base() + '/nameinstrument', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
      multipart: this.toMultipartFields(toolData),
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) logger.error(`createTool failed: ${response.status()}`);
    else logger.info(`Instrument name created`);
    return { status: response.status(), data };
  }

  async getOneTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting instrument name by id: ${id}`);
    const response = await request.get(this.base() + `/name/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getOneTool failed: ${response.status()}`);
      throw new Error(`getOneTool failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async updateTool(request: APIRequestContext, toolData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating instrument name:`, toolData);
    const response = await request.post(this.base() + '/nameinstrument/update', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
      multipart: this.toMultipartFields(toolData),
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`updateTool failed: ${response.status()}`);
      throw new Error(`updateTool failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async removeFileTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Removing file from instrument, id: ${id}`);
    const response = await request.delete(this.base() + `/file/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`removeFileTool failed: ${response.status()}`);
      throw new Error(`removeFileTool failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async banTool(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving instrument name id: ${id}`);
    const response = await request.delete(this.base() + `/ban/${id}`, {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`banTool failed: ${response.status()}`);
      throw new Error(`banTool failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }

  async getAllTools(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting all instrument names`);
    const response = await request.get(this.base() + '/nameinstrument', {
      headers: { ...this.authHeaders(accessToken), compress: 'no-compress' },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) {
      logger.error(`getAllTools failed: ${response.status()}`);
      throw new Error(`getAllTools failed: ${response.status()}`);
    }
    return { status: response.status(), data };
  }
}
