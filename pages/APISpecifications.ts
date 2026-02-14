import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class SpecificationsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getAttributesFromIds(request: APIRequestContext, attributesData: any) {
        logger.info(`Getting attributes from IDs:`, attributesData);

        const response = await request.post(ENV.API_BASE_URL + 'api/specification/attributes', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: attributesData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved attributes from IDs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get attributes from IDs, status: ${response.status()}`);
            throw new Error(`Failed to get attributes from IDs with status: ${response.status()}`);
        }
    }

    async createSpecification(request: APIRequestContext, specData: any, userId: string) {
        logger.info(`Creating specification with data:`, specData);

        const response = await request.post(ENV.API_BASE_URL + 'api/specification', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: specData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Specification created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create specification, status: ${response.status()}`);
            throw new Error(`Failed to create specification with status: ${response.status()}`);
        }
    }

    async updateSpecification(request: APIRequestContext, specData: any, userId: string) {
        logger.info(`Updating specification with data:`, specData);

        const response = await request.put(ENV.API_BASE_URL + 'api/specification', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: specData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Specification updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update specification, status: ${response.status()}`);
            throw new Error(`Failed to update specification with status: ${response.status()}`);
        }
    }

    async getSpecificationById(request: APIRequestContext, id: number) {
        logger.info(`Getting specification by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/specification/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved specification by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get specification by ID, status: ${response.status()}`);
            throw new Error(`Failed to get specification by ID with status: ${response.status()}`);
        }
    }

    async deleteSpecification(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting specification with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/specification/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Specification deleted successfully' };
            logger.info(`Specification deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete specification, status: ${response.status()}`);
            throw new Error(`Failed to delete specification with status: ${response.status()}`);
        }
    }

    async getAllSpecifications(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all specifications with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/specification/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all specifications`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all specifications, status: ${response.status()}`);
            throw new Error(`Failed to get all specifications with status: ${response.status()}`);
        }
    }

    async getSpecificationByProduct(request: APIRequestContext, productId: number) {
        logger.info(`Getting specification by product ID: ${productId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/specification/product/${productId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved specification by product`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get specification by product, status: ${response.status()}`);
            throw new Error(`Failed to get specification by product with status: ${response.status()}`);
        }
    }

    async validateSpecification(request: APIRequestContext, specData: any) {
        logger.info(`Validating specification:`, specData);

        const response = await request.post(ENV.API_BASE_URL + 'api/specification/validate', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: specData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Specification validation completed`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate specification, status: ${response.status()}`);
            throw new Error(`Failed to validate specification with status: ${response.status()}`);
        }
    }

    async exportSpecification(request: APIRequestContext, id: number, format: string) {
        logger.info(`Exporting specification ID: ${id}, format: ${format}`);

        const response = await request.get(ENV.API_BASE_URL + `api/specification/export/${id}/${format}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Specification exported successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export specification, status: ${response.status()}`);
            throw new Error(`Failed to export specification with status: ${response.status()}`);
        }
    }
}
