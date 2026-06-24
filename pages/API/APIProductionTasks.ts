import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/production-task/*` — Nest `ProductionTaskController`. */
export class ProductionTasksAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/production-task';
  private onlineBoardBase = () => ENV.API_BASE_URL + 'api/online-board';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createProductionTask(request: APIRequestContext, taskData: any, accessToken?: string) {
    logger.info(`POST production-task/`);
    return this.apiRequest(request, 'POST', this.base() + '/', {
      data: taskData,
      accessToken: this.token(accessToken),
    });
  }

  async updateProductionTask(request: APIRequestContext, taskData: any, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/', {
      data: taskData,
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskPaginate(request: APIRequestContext, paginationData: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/list', {
      data: paginationData,
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskWithOperationsPaginate(request: APIRequestContext, paginationData: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/list-with-operations', {
      data: paginationData,
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskByUser(request: APIRequestContext, userData: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/by-user', {
      data: userData,
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskById(request: APIRequestContext, productionTaskId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/by-id/${productionTaskId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskCount(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/count', {
      accessToken: this.token(accessToken),
    });
  }

  async updateStatusProductionTask(request: APIRequestContext, statusData: any, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/due-date', {
      data: statusData,
      accessToken: this.token(accessToken),
    });
  }

  async getPlanForProductionTask(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/by-plan', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async setResponsibleUser(request: APIRequestContext, operationPosId: number, userId: number, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + `/set/responsible/${operationPosId}/${userId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async setEquipment(request: APIRequestContext, operationPosId: number, equipmentId: number | null, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + `/set/equipment/${operationPosId}/${equipmentId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskByAllUsers(request: APIRequestContext, subdivisionType: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/for-all-users/${encodeURIComponent(subdivisionType)}`, {
      accessToken: this.token(accessToken),
    });
  }

  async updateProductionTaskMarks(request: APIRequestContext, marksData: any, accessToken?: string) {
    return this.apiProbe(request, 'ProductionTasksAPI.updateProductionTaskMarks', marksData, this.token(accessToken));
  }

  async getTaskByProductionOperation(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/by-operation', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getTaskByEquipment(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/by-equipment', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getTaskOperations(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/tasks/operations', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getDetalDeficit(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/detal/deficit', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getStartTimeByUser(request: APIRequestContext, userId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/get/start/time/${userId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async setStartTimeByUser(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/set/start/time', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getStartTimeByEquipment(request: APIRequestContext, equipmentId: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/get/start/time/detal/${equipmentId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async setStartTimeByEquipment(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/set/start/time/detal', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getRelativeDateForEntity(
    request: APIRequestContext,
    entityType: string,
    entityId: number,
    accessToken?: string,
  ) {
    return this.apiRequest(request, 'GET', this.base() + `/get/relative/date/${entityType}/${entityId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getShipmentByProductionTask(request: APIRequestContext, productionType: string, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/shipment/${productionType}/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getPercentByProductionTask(request: APIRequestContext, productionType: string, id: number, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/percent/${productionType}/${id}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskByAllEquipments(
    request: APIRequestContext,
    typeOperationId?: number,
    accessToken?: string,
  ) {
    const query = typeOperationId ? `?typeOperationId=${typeOperationId}` : '';
    return this.apiRequest(request, 'GET', this.base() + `/for-all-equipments${query}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getProductionTaskByEntity(request: APIRequestContext, query: Record<string, unknown>, accessToken?: string) {
    const qs = new URLSearchParams(query as any).toString();
    return this.apiRequest(request, 'GET', this.base() + '/by-entity' + (qs ? `?${qs}` : ''), {
      accessToken: this.token(accessToken),
    });
  }

  async getResultWorks(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/result-works', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getWorkloadByEntity(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/workload-by-entity', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getTOperationList(request: APIRequestContext, query: Record<string, unknown>, accessToken?: string) {
    const qs = new URLSearchParams(query as any).toString();
    return this.apiRequest(request, 'GET', this.base() + '/toperations-list' + (qs ? `?${qs}` : ''), {
      accessToken: this.token(accessToken),
    });
  }

  async createProductionOperationPos(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/create/operation/pos', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async updateProductionOperationPos(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + '/update/operation/pos', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async banProductionOperationPos(request: APIRequestContext, operationPosId: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/ban/operation/pos/${operationPosId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async banProductionTask(request: APIRequestContext, productionTaskId: number, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/ban/${productionTaskId}`, {
      accessToken: this.token(accessToken),
    });
  }

  async getOnlineBoard(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.onlineBoardBase() + '/list', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }

  async getOnlineBoardProduction(request: APIRequestContext, dto: any, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.onlineBoardBase() + '/production/list', {
      data: dto,
      accessToken: this.token(accessToken),
    });
  }
}
