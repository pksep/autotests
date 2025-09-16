import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class PartsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getPartAttribute(request: APIRequestContext, id: number) {
        logger.info(`Getting part attribute by ID: ${id}`);

        const response = await request.post(ENV.API_BASE_URL + `api/detal/getattribute/${id}`);

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
                'Content-Type': 'application/json'
            },
            data: includeData
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

        const response = await request.get(ENV.API_BASE_URL + 'api/detal/actualspecification');

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

        const response = await request.get(ENV.API_BASE_URL + `api/detal/ava/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved part avatar`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get part avatar, status: ${response.status()}`);
            throw new Error(`Failed to get part avatar with status: ${response.status()}`);
        }
    }

    async createPart(request: APIRequestContext, partData: any, userId: string) {
        logger.info(`Creating part with data:`, partData);

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/detal', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: partData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Part created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create part, status: ${response.status()}`);
            throw new Error(`Failed to create part with status: ${response.status()}`);
        }
    }

    async updatePart(request: APIRequestContext, partData: any, userId: string) {
        logger.info(`Updating part with data:`, partData);

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/detal/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: partData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Part updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update part, status: ${response.status()}`);
            throw new Error(`Failed to update part with status: ${response.status()}`);
        }
    }

    async banPart(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Banning part with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/detal/ban/${id}`, {
            headers: {
                'user-id': userId
            }
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

    async getAllParts(request: APIRequestContext, light: boolean) {
        logger.info(`Getting all parts, light: ${light}`);

        const response = await request.get(ENV.API_BASE_URL + `api/detal/detal/all/${light}`);

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
