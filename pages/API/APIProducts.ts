import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ProductsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createProduct(request: APIRequestContext, productData: any, userId: string) {
        logger.info(`Creating product with data:`, productData);

        const response = await request.post(ENV.API_BASE_URL + 'api/product', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: productData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Product created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create product, status: ${response.status()}`);
            throw new Error(`Failed to create product with status: ${response.status()}`);
        }
    }

    async updateProduct(request: APIRequestContext, productData: any, userId: string) {
        logger.info(`Updating product with data:`, productData);

        const response = await request.put(ENV.API_BASE_URL + 'api/product', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: productData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Product updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update product, status: ${response.status()}`);
            throw new Error(`Failed to update product with status: ${response.status()}`);
        }
    }

    async getProductById(request: APIRequestContext, id: number) {
        logger.info(`Getting product by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/product/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved product by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get product by ID, status: ${response.status()}`);
            throw new Error(`Failed to get product by ID with status: ${response.status()}`);
        }
    }

    async deleteProduct(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting product with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/product/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Product deleted successfully' };
            logger.info(`Product deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete product, status: ${response.status()}`);
            throw new Error(`Failed to delete product with status: ${response.status()}`);
        }
    }

    async getAllProducts(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all products with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/product/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all products`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all products, status: ${response.status()}`);
            throw new Error(`Failed to get all products with status: ${response.status()}`);
        }
    }

    async searchProducts(request: APIRequestContext, searchData: any) {
        logger.info(`Searching products:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/product/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched products`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search products, status: ${response.status()}`);
            throw new Error(`Failed to search products with status: ${response.status()}`);
        }
    }

    async getProductSpecifications(request: APIRequestContext, productId: number) {
        logger.info(`Getting product specifications for ID: ${productId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/product/${productId}/specifications`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved product specifications`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get product specifications, status: ${response.status()}`);
            throw new Error(`Failed to get product specifications with status: ${response.status()}`);
        }
    }

    async getProductComponents(request: APIRequestContext, productId: number) {
        logger.info(`Getting product components for ID: ${productId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/product/${productId}/components`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved product components`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get product components, status: ${response.status()}`);
            throw new Error(`Failed to get product components with status: ${response.status()}`);
        }
    }

    async validateProduct(request: APIRequestContext, productData: any) {
        logger.info(`Validating product:`, productData);

        const response = await request.post(ENV.API_BASE_URL + 'api/product/validate', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: productData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Product validation completed`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate product, status: ${response.status()}`);
            throw new Error(`Failed to validate product with status: ${response.status()}`);
        }
    }
}
