import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class AssembleAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/assemble';

  private assembleAuthHeaders(accessToken?: string, extra: Record<string, string> = {}) {
    return {
      ...extra,
      ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined),
      ...(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken)
        ? { Cookie: `access_token=${accessToken}` }
        : {}),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response), headers: response.headers() };
  }

  async createAssemble(request: APIRequestContext, assembleData: any, userId: string, accessToken?: string) {
    logger.info(`Creating assemble with data:`, assembleData);

    const response = await request.post(this.base() + '/', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: assembleData,
    });

    return this.result(response);
  }

  async updateAssemble(request: APIRequestContext, assembleData: any, userId: string, accessToken?: string) {
    logger.info(`Updating assemble with data:`, assembleData);

    const response = await request.put(this.base() + '/complectkit/update', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: assembleData,
    });

    return this.result(response);
  }

  async getActualAssembleOrders(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting actual assemble orders`);

    const response = await request.get(this.base() + '/complects', {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAllAssembleWithPagination(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting all assemble with pagination:`, paginationData);

    const response = await request.post(this.base() + '/pagination', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getAllAssembleWithPaginationSclad(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting all assemble with pagination sclad:`, paginationData);

    const response = await request.post(this.base() + '/sclad/pagination', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getAssembleByParent(request: APIRequestContext, parentData: any, accessToken?: string) {
    logger.info(`Getting assemble by parent:`, parentData);

    const entityId = parentData?.entityId ?? parentData?.parentId ?? parentData?.id;
    const entityType = parentData?.entityType ?? parentData?.type ?? 'cbed';

    const response = await request.get(this.base() + `/kits-by-parents/${entityId}/${entityType}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAssembleComing(request: APIRequestContext, comingData: any, accessToken?: string) {
    logger.info(`Getting assemble coming:`, comingData);

    const response = await request.post(this.base() + '/coming/pagination', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: comingData,
    });

    return this.result(response);
  }

  async getMetalloworkingComing(request: APIRequestContext, comingData: any, accessToken?: string) {
    return this.getAssembleComing(request, comingData, accessToken);
  }

  async getDeepDeficitObject(request: APIRequestContext, deficitData: any, accessToken?: string) {
    logger.info(`Getting deep deficit object:`, deficitData);

    const response = await request.post(this.base() + '/deficit/deep', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: deficitData,
    });

    return this.result(response);
  }

  async createAssembleKit(request: APIRequestContext, kitData: any, accessToken?: string) {
    logger.info(`Creating assemble kit:`, kitData);

    const response = await request.post(this.base() + '/complectkit/create', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: kitData,
    });

    return this.result(response);
  }

  async getAllAssemblePlan(request: APIRequestContext, planData: any, accessToken?: string) {
    logger.info(`Getting all assemble plan:`, planData);

    const response = await request.post(this.base() + '/asstoplan', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: planData,
    });

    return this.result(response);
  }

  async getComplectKitById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting assemble kit by ID: ${id}`);

    const response = await request.get(this.base() + `/complectkit/${id}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getComplectKitByAssembly(request: APIRequestContext, assemblyId: number, accessToken?: string) {
    logger.info(`Getting assemble kits by assembly ID: ${assemblyId}`);

    const response = await request.get(this.base() + `/complectkit/getbyassembly/${assemblyId}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async updateResponsibleKit(request: APIRequestContext, id: number, userId: number, accessToken?: string) {
    logger.info(`Updating assemble kit responsible: ${id} -> ${userId}`);

    const response = await request.get(this.base() + `/complectkit/update_responsible/${id}/${userId}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getDisactiveKitsCount(request: APIRequestContext, type: string, accessToken?: string) {
    logger.info(`Getting disactive assemble kit count for type: ${type}`);

    const response = await request.get(this.base() + `/complectkit/disactive/count/${encodeURIComponent(type)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getActiveKitsCountById(request: APIRequestContext, id: number, type: string, accessToken?: string) {
    logger.info(`Getting active assemble kit count for ${type}:${id}`);

    const response = await request.get(this.base() + `/complectkit/active/count/${id}/${encodeURIComponent(type)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getRelativeKitChild(request: APIRequestContext, id: number, type: string, accessToken?: string) {
    logger.info(`Getting relative kit child for ${type}:${id}`);

    const response = await request.get(this.base() + `/relative/kit/child/${id}/${encodeURIComponent(type)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting assemble by ID: ${id}`);

    const response = await request.get(this.base() + `/${id}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAssembleWaybill(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting assemble waybill by ID: ${id}`);

    const response = await request.get(this.base() + `/waybill/${id}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByIdLight(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting light assemble by ID: ${id}`);

    const response = await request.get(this.base() + `/light/${id}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByIzdLight(request: APIRequestContext, id: number, typeIzd: string, accessToken?: string) {
    logger.info(`Getting light assemble by izd ${typeIzd}:${id}`);

    const response = await request.get(this.base() + `/byizd/light/${id}/${encodeURIComponent(typeIzd)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getByIzd(request: APIRequestContext, id: number, typeIzd: string, accessToken?: string) {
    logger.info(`Getting assemble by izd ${typeIzd}:${id}`);

    const response = await request.get(this.base() + `/byizd/${id}/${encodeURIComponent(typeIzd)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async countValueByEntity(request: APIRequestContext, id: number, typeIzd: string, accessToken?: string) {
    logger.info(`Getting assemble kit value count by ${typeIzd}:${id}`);

    const response = await request.get(this.base() + `/count_value_by_obj/${id}/${encodeURIComponent(typeIzd)}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getOperationPagination(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting assemble operation pagination`);

    const response = await request.post(this.base() + '/pagination/operation', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getComplectKitPagination(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting assemble kit pagination`);

    const response = await request.post(this.base() + '/complectkit/getall/', {
      headers: this.assembleAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async uncomplectKit(request: APIRequestContext, kitId: number, uncomplectQuantity: number, accessToken?: string) {
    logger.info(`Uncomplect assemble kit ID: ${kitId}`);

    const response = await request.delete(this.base() + `/uncomplect/${kitId}/${uncomplectQuantity}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async banComplect(request: APIRequestContext, kitId: number, accessToken?: string) {
    logger.info(`Banning assemble kit ID: ${kitId}`);

    const response = await request.delete(this.base() + `/complect/ban/${kitId}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async deleteAssemble(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting assemble ID: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: this.assembleAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }
}
