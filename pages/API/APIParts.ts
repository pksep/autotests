import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class PartsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async getPartAttribute(request: APIRequestContext, id: number, body: { attributes: string[] } = { attributes: ['id'] }, accessToken?: string) {
    logger.info(`Getting part attribute by ID: ${id}`);

    const response = await request.post(ENV.API_BASE_URL + `api/detal/getattribute/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(accessToken),
      },
      data: body,
    });

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully retrieved part attribute`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get part attribute, status: ${response.status()}`);
      throw new Error(`Failed to get part attribute with status: ${response.status()}`);
    }
  }

  async getPartInclude(request: APIRequestContext, id: number, includeData: any) {
    logger.info(`Getting part include by ID: ${id}`);

    const response = await request.post(ENV.API_BASE_URL + `api/detal/getinclude/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: includeData,
    });

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully retrieved part include`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get part include, status: ${response.status()}`);
      throw new Error(`Failed to get part include with status: ${response.status()}`);
    }
  }

  async getPartShipmentsAndOrders(request: APIRequestContext, id: number) {
    logger.info(`Getting part shipments and orders by ID: ${id}`);

    const response = await request.get(ENV.API_BASE_URL + `api/detal/shipments/${id}`);

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully retrieved part shipments and orders`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get part shipments and orders, status: ${response.status()}`);
      throw new Error(`Failed to get part shipments and orders with status: ${response.status()}`);
    }
  }

  async actualListsSpecification(request: APIRequestContext) {
    logger.info(`Actualizing parts lists specification`);

    const response = await request.get(ENV.API_BASE_URL + 'api/detal/all/false/%5B%5D');

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully actualized parts lists specification`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to actualize parts lists specification, status: ${response.status()}`);
      throw new Error(`Failed to actualize parts lists specification with status: ${response.status()}`);
    }
  }

  async getPartAvatar(request: APIRequestContext, id: number) {
    logger.info(`Getting part avatar by ID: ${id}`);

    const response = await request.post(ENV.API_BASE_URL + 'api/detal/one', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { id, attributes: ['image'] },
    });

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully retrieved part avatar`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get part avatar, status: ${response.status()}`);
      throw new Error(`Failed to get part avatar with status: ${response.status()}`);
    }
  }

  async createPart(request: APIRequestContext, partData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating part (detal)`);

    const response = await request.post(ENV.API_BASE_URL + 'api/detal/', {
      headers: { ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined), compress: 'no-compress' },
      multipart: this.toMultipartFields(partData),
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Part created successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to create part, status: ${response.status()}`);
      return { status: response.status(), data: responseData };
    }
  }

  async updatePart(request: APIRequestContext, partData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating part (detal)`);

    const response = await request.post(ENV.API_BASE_URL + 'api/detal/update', {
      headers: { ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined), compress: 'no-compress' },
      multipart: this.toMultipartFields(partData),
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Part updated successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to update part, status: ${response.status()}`);
      throw new Error(`Failed to update part with status: ${response.status()}`);
    }
  }

  async banPart(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting (archiving) part ID: ${id}`);

    const response = await request.delete(ENV.API_BASE_URL + `api/detal/${id}`, {
      headers: {
        ...this.authHeaders(accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined),
        compress: 'no-compress',
      },
    });

    if (response.ok()) {
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : { message: 'Part banned successfully' };
      logger.info(`Part banned successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to ban part, status: ${response.status()}`);
      throw new Error(`Failed to ban part with status: ${response.status()}`);
    }
  }

  async getAllParts(request: APIRequestContext, light: boolean, attributes: string = '[]', accessToken?: string) {
    logger.info(`Getting all parts, light: ${light}`);

    const response = await request.get(
      ENV.API_BASE_URL + `api/detal/all/${light}/${encodeURIComponent(attributes)}`,
      {
        headers: { compress: 'no-compress', ...this.authHeaders(accessToken) },
      }
    );

    if (response.ok()) {
      const responseData = await response.json();
      logger.info(`Successfully retrieved all parts`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get all parts, status: ${response.status()}`);
      throw new Error(`Failed to get all parts with status: ${response.status()}`);
    }
  }
}
