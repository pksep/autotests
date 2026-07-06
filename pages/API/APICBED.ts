import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data: any;
  headers?: Record<string, string>;
};

export class CBEDAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/cbed';

  private cbedAuthHeaders(accessToken?: string, extra: Record<string, string> = {}) {
    return {
      ...extra,
      ...this.authHeaders(accessToken),
      ...(accessToken ? { Cookie: `access_token=${accessToken}` } : {}),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<ApiResult> {
    return { status: response.status(), data: await this.parseJsonBody(response), headers: response.headers() };
  }

  async createCBED(request: APIRequestContext, cbedData: Record<string, unknown>, userId: string, accessToken?: string) {
    logger.info(`Creating CBED`);

    const response = await request.post(this.base() + '/', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: this.toMultipartFields(cbedData),
    });

    return this.result(response);
  }

  async updateCBED(request: APIRequestContext, cbedData: Record<string, unknown>, userId: string, accessToken?: string) {
    logger.info(`Updating CBED`);

    const response = await request.post(this.base() + '/update', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: this.toMultipartFields(cbedData),
    });

    return this.result(response);
  }

  async attachFileToCBED(request: APIRequestContext, cbedId: number, fileId: number, userId: string, accessToken?: string) {
    logger.info(`Attaching file ${fileId} to CBED ${cbedId}`);

    const response = await request.put(ENV.API_BASE_URL + 'api/documents/attach-to-entity', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: {
        idEntity: cbedId,
        idDocument: fileId,
        typeEntity: 'cbed',
      },
    });

    return this.result(response);
  }

  async banCBED(request: APIRequestContext, id: number, userId: string, accessToken?: string) {
    logger.info(`Banning CBED with id: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, {
        'user-id': userId,
        compress: 'no-compress',
      }),
    });

    return this.result(response);
  }

  async getOneCBED(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting CBED by id: ${id}`);

    const response = await request.post(this.base() + '/one', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: { id },
    });

    return this.result(response);
  }

  async getOneCBEDSpecification(request: APIRequestContext, id: number, isFull: boolean, accessToken?: string) {
    logger.info(`Getting CBED specification by id: ${id}, isFull: ${isFull}`);

    const response = await request.get(this.base() + `/one/spetification/${isFull}/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getOneCBEDById(request: APIRequestContext, cbedData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED by ID`);

    const response = await request.post(this.base() + '/one', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: cbedData,
    });

    return this.result(response);
  }

  async getTechByCBEDId(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting tech process by CBED id: ${id}`);

    const response = await request.get(this.base() + `/tech-process/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getDrafts(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting CBED drafts by id: ${id}`);

    const response = await request.get(this.base() + `/drafts/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getRelativesProductionTask(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting CBED relatives production task by id: ${id}`);

    const response = await request.get(this.base() + `/relatives/production/task/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async actualAvatar(request: APIRequestContext, accessToken?: string) {
    logger.info(`Actualizing CBED avatars`);

    const response = await request.put(this.base() + '/ava/update', {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAllCBED(request: APIRequestContext, full: boolean, page?: number, pageSize?: number, accessToken?: string) {
    logger.info(`Getting all CBEDs, full: ${full}, page: ${page}, pageSize: ${pageSize}`);

    const response = await request.post(this.base() + '/pagination', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: {
        isFull: full,
        page: page ?? 0,
        limit: pageSize ?? 10,
      },
    });

    return this.result(response);
  }

  async getCBEDPagination(request: APIRequestContext, paginationData: Record<string, unknown>, userId: string, accessToken?: string) {
    logger.info(`Getting paginated CBEDs`);

    const response = await request.post(this.base() + '/pagination', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        'user-id': userId,
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async checkDesignation(request: APIRequestContext, designationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Checking CBED designation availability`);

    const response = await request.post(this.base() + '/designation/check', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: designationData,
    });

    return this.result(response);
  }

  async getArchivedCBED(request: APIRequestContext, archiveData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting archived CBEDs`);

    const response = await request.post(this.base() + '/archive/', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: archiveData,
    });

    return this.result(response);
  }

  async getCBEDInclude(request: APIRequestContext, id: number, includeData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED includes for id: ${id}`);

    const response = await request.post(this.base() + `/getinclude/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: includeData,
    });

    return this.result(response);
  }

  async getOperationInclude(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED operation include`);

    const response = await request.post(this.base() + '/operation/include', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: paginationData,
    });

    return this.result(response);
  }

  async getCBEDRemains(request: APIRequestContext, remainData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED remains`);

    const response = await request.post(this.base() + '/sclad/remains', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: remainData,
    });

    return this.result(response);
  }

  async getCBEDShipmentsAndOrders(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting CBED shipments and orders for id: ${id}`);

    const response = await request.get(this.base() + `/shipments/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getOneCBEDBelongs(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting CBED belongs by id: ${id}`);

    const response = await request.get(this.base() + `/belongs/${id}`, {
      headers: this.cbedAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getCBEDGraphChildren(request: APIRequestContext, graphData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED graph children`);

    const response = await request.post(this.base() + '/graph-childrens', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: graphData,
    });

    return this.result(response);
  }

  async getCBEDDeficits(request: APIRequestContext, deficitData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting CBED deficits`);

    const response = await request.post(this.base() + '/deficits', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: deficitData,
    });

    return this.result(response);
  }

  async removeDocumentCBED(request: APIRequestContext, documentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Removing document from CBED`);

    const response = await request.put(ENV.API_BASE_URL + 'api/documents/unpin-documents', {
      headers: this.cbedAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: {
        typeEntity: 'cbed',
        ...documentData,
      },
    });

    return this.result(response);
  }
}
