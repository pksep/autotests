import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/production-task/*` — Nest `ProductionTaskController`. */
export class ProductionTasksAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/production-task';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createProductionTask(request: APIRequestContext, taskData: any, accessToken?: string) {
    logger.info(`POST production-task/`);
    const response = await request.post(this.base() + '/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: taskData,
    });
    const data = await this.parseJsonBody(response);
    return { status: response.status(), data };
  }

  async updateProductionTask(request: APIRequestContext, taskData: any, accessToken?: string) {
    const response = await request.put(this.base() + '/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: taskData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`updateProductionTask: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getProductionTaskPaginate(request: APIRequestContext, paginationData: any, accessToken?: string) {
    const response = await request.post(this.base() + '/list', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: paginationData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getProductionTaskPaginate: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getProductionTaskByUser(request: APIRequestContext, userData: any, accessToken?: string) {
    const response = await request.post(this.base() + '/by-user', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: userData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getProductionTaskByUser: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getProductionTaskById(request: APIRequestContext, productionTaskId: number, accessToken?: string) {
    const response = await request.get(this.base() + `/by-id/${productionTaskId}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getProductionTaskById: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getProductionTaskCount(request: APIRequestContext, accessToken?: string) {
    const response = await request.get(this.base() + '/count', {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getProductionTaskCount: ${response.status()}`);
    return { status: response.status(), data };
  }

  async updateStatusProductionTask(request: APIRequestContext, statusData: any, accessToken?: string) {
    const response = await request.put(this.base() + '/due-date', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: statusData,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`updateStatusProductionTask: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getProductionTaskByAllUsers(request: APIRequestContext, subdivisionType: string, accessToken?: string) {
    const response = await request.get(this.base() + `/for-all-users/${encodeURIComponent(subdivisionType)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getProductionTaskByAllUsers: ${response.status()}`);
    return { status: response.status(), data };
  }

  async updateProductionTaskMarks(request: APIRequestContext, marksData: any, accessToken?: string) {
    return this.apiProbe(request, 'ProductionTasksAPI.updateProductionTaskMarks', marksData, this.token(accessToken));
  }

  async getTaskByProductionOperation(request: APIRequestContext, dto: any, accessToken?: string) {
    const response = await request.post(this.base() + '/by-operation', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: dto,
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getTaskByProductionOperation: ${response.status()}`);
    return { status: response.status(), data };
  }

  async getTOperationList(request: APIRequestContext, query: Record<string, unknown>, accessToken?: string) {
    const qs = new URLSearchParams(query as any).toString();
    const response = await request.get(this.base() + '/toperations-list' + (qs ? `?${qs}` : ''), {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });
    const data = await this.parseJsonBody(response);
    if (!response.ok()) throw new Error(`getTOperationList: ${response.status()}`);
    return { status: response.status(), data };
  }
}
