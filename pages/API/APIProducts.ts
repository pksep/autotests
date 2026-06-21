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

  async createProduct(request: APIRequestContext, productData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating product (multipart)`);

    const response = await request.post(this.base() + '/', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(productData),
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Product created successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to create product, status: ${response.status()}`);
      throw new Error(`Failed to create product with status: ${response.status()}`);
    }
  }

  async updateProduct(request: APIRequestContext, productData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating product (multipart)`);

    const response = await request.post(this.base() + '/update', {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
      multipart: this.toMultipartFields(productData),
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Product updated successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to update product, status: ${response.status()}`);
      throw new Error(`Failed to update product with status: ${response.status()}`);
    }
  }

  async getProductById(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Getting product by ID: ${id}`);

    const response = await request.post(this.base() + '/one', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: { id },
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Successfully retrieved product by ID`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get product by ID, status: ${response.status()}`);
      throw new Error(`Failed to get product by ID with status: ${response.status()}`);
    }
  }

  async deleteProduct(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Deleting product with ID: ${id}`);

    const response = await request.delete(this.base() + `/${id}`, {
      headers: { ...this.authHeaders(this.token(accessToken)), compress: 'no-compress' },
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Product deleted successfully`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to delete product, status: ${response.status()}`);
      throw new Error(`Failed to delete product with status: ${response.status()}`);
    }
  }

  async getAllProducts(request: APIRequestContext, paginationData: any, accessToken?: string) {
    logger.info(`Getting all products with pagination:`, paginationData);

    const response = await request.post(this.base() + '/pagination', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: paginationData,
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Successfully retrieved all products`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get all products, status: ${response.status()}`);
      throw new Error(`Failed to get all products with status: ${response.status()}`);
    }
  }

  async searchProducts(request: APIRequestContext, searchData: any, accessToken?: string) {
    logger.info(`Searching products (operation/include):`, searchData);

    const response = await request.post(this.base() + '/operation/include', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: searchData,
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Successfully searched products`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to search products, status: ${response.status()}`);
      throw new Error(`Failed to search products with status: ${response.status()}`);
    }
  }

  async getProductSpecifications(request: APIRequestContext, productId: number, accessToken?: string) {
    logger.info(`Getting product shipments for ID: ${productId}`);

    const response = await request.get(this.base() + `/shipments/${productId}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Successfully retrieved product specifications`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get product specifications, status: ${response.status()}`);
      throw new Error(`Failed to get product specifications with status: ${response.status()}`);
    }
  }

  async getProductComponents(request: APIRequestContext, productId: number, accessToken?: string) {
    logger.info(`Getting product graph children for ID: ${productId}`);

    const response = await request.post(this.base() + '/graph-childrens', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: { id: productId },
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Successfully retrieved product components`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to get product components, status: ${response.status()}`);
      throw new Error(`Failed to get product components with status: ${response.status()}`);
    }
  }

  async validateProduct(request: APIRequestContext, productData: any, accessToken?: string) {
    logger.info(`Validating product (designation/check):`, productData);

    const response = await request.post(this.base() + '/designation/check', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(this.token(accessToken)),
      },
      data: productData?.designation ? { designation: productData.designation } : productData,
    });

    const responseData = await this.parseJsonBody(response);
    if (response.ok()) {
      logger.info(`Product validation completed`);
      return { status: response.status(), data: responseData };
    } else {
      logger.error(`Failed to validate product, status: ${response.status()}`);
      throw new Error(`Failed to validate product with status: ${response.status()}`);
    }
  }
}
