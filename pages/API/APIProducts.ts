import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ProductsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/product';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  private productAuthHeaders(accessToken?: string, extra: Record<string, string> = {}) {
    const token = this.token(accessToken);
    return {
      ...extra,
      ...this.authHeaders(token),
      ...(token ? { Cookie: `access_token=${token}` } : {}),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async createProduct(request: APIRequestContext, productData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating product`);

    const response = await request.post(this.base() + '/', {
      headers: this.productAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: this.toMultipartFields(productData),
    });

    return this.result(response);
  }

  async updateProduct(request: APIRequestContext, productData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating product`);

    const response = await request.post(this.base() + '/update', {
      headers: this.productAuthHeaders(accessToken, {
        'Content-Type': 'application/json',
        compress: 'no-compress',
      }),
      data: this.toMultipartFields(productData),
    });

    return this.result(response);
  }

  async getProductById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting product by ID: ${id}`);

    const response = await request.post(this.base() + '/one', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: { id },
    });

    return this.result(response);
  }

  async deleteProduct(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting product with ID: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: this.productAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getAllProducts(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting all products with pagination:`, paginationData);

    const response = await request.post(this.base() + '/pagination', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: paginationData,
    });

    return this.result(response);
  }

  async searchProducts(request: APIRequestContext, searchData: any, accessToken?: string) {
    logger.info(`Searching products (operation/include):`, searchData);

    const response = await request.post(this.base() + '/operation/include', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: searchData,
    });

    return this.result(response);
  }

  async getProductSpecifications(request: APIRequestContext, productId: number, accessToken?: string) {
    logger.info(`Getting product shipments for ID: ${productId}`);

    const response = await request.get(this.base() + `/shipments/${productId}`, {
      headers: this.productAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getProductComponents(request: APIRequestContext, productId: number, accessToken?: string) {
    logger.info(`Getting product graph children for ID: ${productId}`);

    const response = await request.post(this.base() + '/graph-childrens', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: { productId },
    });

    return this.result(response);
  }

  async validateProduct(request: APIRequestContext, productData: any, accessToken?: string) {
    logger.info(`Validating product (designation/check):`, productData);

    const response = await request.post(this.base() + '/designation/check', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: productData?.designation ? { designation: productData.designation } : productData,
    });

    return this.result(response);
  }

  async getAllProductsList(request: APIRequestContext, light = true, attributes: string[] = [], accessToken?: string) {
    logger.info(`Getting products list`);

    const response = await request.get(this.base() + `/all/${light}/${encodeURIComponent(JSON.stringify(attributes))}`, {
      headers: this.productAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getProductByIdLight(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting light product by ID: ${id}`);

    const response = await request.get(this.base() + `/light/${id}`, {
      headers: this.productAuthHeaders(accessToken, { compress: 'no-compress' }),
    });

    return this.result(response);
  }

  async getArchivedProducts(request: APIRequestContext, archiveData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting archived products`);

    const response = await request.post(this.base() + '/archive/', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: archiveData,
    });

    return this.result(response);
  }

  async getProductInclude(request: APIRequestContext, id: number, includeData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting product includes for ID: ${id}`);

    const response = await request.post(this.base() + `/getinclude/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.productAuthHeaders(accessToken),
      },
      data: includeData,
    });

    return this.result(response);
  }
}
