import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class MaterialsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base() {
    return ENV.API_BASE_URL + 'api/material';
  }

  private jsonHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      compress: 'no-compress',
      ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async createTypeMaterial(request: APIRequestContext, typeData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating type material with data:`, typeData);

    const response = await request.post(this.base() + '/type-material', {
      headers: this.jsonHeaders(accessToken),
      data: typeData,
    });

    return this.result(response);
  }

  async updateTypeMaterial(request: APIRequestContext, typeData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating type material with data:`, typeData);

    const response = await request.post(this.base() + '/type-material/update', {
      headers: this.jsonHeaders(accessToken),
      data: typeData,
    });

    return this.result(response);
  }

  async removeTypeMaterial(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Removing type material with id: ${id}`);

    const response = await request.delete(this.base() + `/type-material/${id}`, {
      headers: this.jsonHeaders(accessToken),
    });

    return this.result(response);
  }

  async createSubtypeMaterial(request: APIRequestContext, subtypeData: any, accessToken?: string) {
    logger.info(`Creating subtype material with data:`, subtypeData);

    const response = await request.post(ENV.API_BASE_URL + 'api/material/subtype', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined),
      },
      data: subtypeData,
    });

    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async removeSubtypeMaterial(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Removing subtype material with id: ${id}`);

    const response = await request.delete(ENV.API_BASE_URL + `api/material/subtype/${id}`, {
      headers: this.jsonHeaders(accessToken),
    });

    return this.result(response);
  }

  async updateSubtypeMaterial(request: APIRequestContext, subtypeData: any, accessToken?: string) {
    logger.info(`Updating subtype material with data:`, subtypeData);

    const response = await request.post(ENV.API_BASE_URL + 'api/material/subtype/update', {
      headers: this.jsonHeaders(accessToken),
      data: subtypeData,
    });

    return this.result(response);
  }

  async createAndUpdateMaterial(request: APIRequestContext, materialData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating/updating material with data:`, materialData);

    const response = await request.post(ENV.API_BASE_URL + 'api/material/material/', {
      headers: { ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined), compress: 'no-compress' },
      multipart: this.toMultipartFields(materialData),
    });

    return this.result(response);
  }

  async getAllMaterials(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting all materials`);

    const response = await request.get(ENV.API_BASE_URL + 'api/material/material/', {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async getMaterialsPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting materials pagination with data:`, paginationData);

    const response = await request.post(this.base() + '/material/pagination', {
      headers: this.jsonHeaders(accessToken),
      data: paginationData,
    });

    return this.result(response);
  }

  async getTypeMaterialsPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting type materials pagination with data:`, paginationData);

    const response = await request.post(this.base() + '/pagination/type-material', {
      headers: this.jsonHeaders(accessToken),
      data: paginationData,
    });

    return this.result(response);
  }

  async getSubtypeMaterialsPagination(request: APIRequestContext, paginationData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting subtype materials pagination with data:`, paginationData);

    const response = await request.post(this.base() + '/pagination/subtype-materials', {
      headers: this.jsonHeaders(accessToken),
      data: paginationData,
    });

    return this.result(response);
  }

  async getMaterialById(request: APIRequestContext, id: number, light = true, accessToken?: string) {
    logger.info(`Getting material by id: ${id}, light: ${light}`);

    const response = await request.get(this.base() + `/material/get/${id}/${light}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async banMaterial(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Archiving material with id: ${id}`);

    const response = await request.delete(this.base() + `/ban/${id}`, {
      headers: this.jsonHeaders(accessToken),
    });

    return this.result(response);
  }

  async getArchivedMaterials(request: APIRequestContext, archiveData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting archived materials with data:`, archiveData);

    const response = await request.post(this.base() + '/material/archive/', {
      headers: this.jsonHeaders(accessToken),
      data: archiveData,
    });

    return this.result(response);
  }

  async checkNameUnique(request: APIRequestContext, checkData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Checking material namespace uniqueness with data:`, checkData);

    const response = await request.post(this.base() + '/name/unique', {
      headers: this.jsonHeaders(accessToken),
      data: checkData,
    });

    return this.result(response);
  }

  async checkNameExisting(request: APIRequestContext, checkData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Checking material name existing with data:`, checkData);

    const response = await request.post(this.base() + '/name/check', {
      headers: this.jsonHeaders(accessToken),
      data: checkData,
    });

    return this.result(response);
  }

  async getIncludeForMaterial(request: APIRequestContext, includeData: any, accessToken?: string) {
    logger.info(`Getting include for material:`, includeData);

    const response = await request.post(ENV.API_BASE_URL + 'api/material/material/include', {
      headers: this.jsonHeaders(accessToken),
      data: includeData,
    });

    return this.result(response);
  }

  async getMaterialAliases(request: APIRequestContext, materialId: number, accessToken?: string) {
    logger.info(`Getting aliases for material id: ${materialId}`);

    const response = await request.get(this.base() + `/aliases/${materialId}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async createMaterialAlias(request: APIRequestContext, aliasData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating material alias with data:`, aliasData);

    const response = await request.post(this.base() + '/aliases', {
      headers: this.jsonHeaders(accessToken),
      data: aliasData,
    });

    return this.result(response);
  }

  async getMaterialShipmentsAndOrders(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting material shipments and orders for id: ${id}`);

    const response = await request.get(this.base() + `/shipments/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async getMeasurementUnitRestrictionsInfo(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting material measurement unit restrictions for id: ${id}`);

    const response = await request.get(this.base() + `/restrictions/measurement-unit/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async getMeasurementCoefficientRestrictionsInfo(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting material measurement coefficient restrictions for id: ${id}`);

    const response = await request.get(this.base() + `/restrictions/measurement-coefficient/${id}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }

  async getMaterialDeficits(request: APIRequestContext, deficitData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting material deficits with data:`, deficitData);

    const response = await request.post(this.base() + '/deficits', {
      headers: this.jsonHeaders(accessToken),
      data: deficitData,
    });

    return this.result(response);
  }

  async actualMaterialLists(request: APIRequestContext, accessToken?: string) {
    logger.info(`Actualizing material lists`);

    const response = await request.get(ENV.API_BASE_URL + 'api/material/type-material', {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully actualized material lists`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to actualize material lists, status: ${response.status()}`);
      throw new Error(`Failed to actualize material lists with status: ${response.status()}`);
    }
  }

  async actualListsSpecification(request: APIRequestContext, accessToken?: string) {
    logger.info(`Actualizing lists specification`);

    const response = await request.get(ENV.API_BASE_URL + 'api/material/material/', {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully actualized lists specification`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to actualize lists specification, status: ${response.status()}`);
      throw new Error(`Failed to actualize lists specification with status: ${response.status()}`);
    }
  }

  async getAllSubtypeMaterial(request: APIRequestContext, instans: string, accessToken?: string) {
    logger.info(`Getting all subtype materials for instans: ${instans}`);

    const response = await request.get(ENV.API_BASE_URL + `api/material/subtype-material/${instans}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
    });

    return this.result(response);
  }
}
