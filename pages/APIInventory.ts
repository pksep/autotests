import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class InventoryAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createInventoryType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Creating inventory type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/inventory/type', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Inventory type created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create inventory type, status: ${response.status()}`);
            throw new Error(`Failed to create inventory type with status: ${response.status()}`);
        }
    }

    async updateInventoryType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Updating inventory type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/inventory/type/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Inventory type updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update inventory type, status: ${response.status()}`);
            throw new Error(`Failed to update inventory type with status: ${response.status()}`);
        }
    }

    async createInventory(request: APIRequestContext, inventoryData: any, userId: string) {
        logger.info(`Creating inventory with data:`, inventoryData);

        const response = await request.post(ENV.API_BASE_URL + 'api/inventory/inventory', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: inventoryData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Inventory created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create inventory, status: ${response.status()}`);
            throw new Error(`Failed to create inventory with status: ${response.status()}`);
        }
    }

    async getOneInventory(request: APIRequestContext, id: number) {
        logger.info(`Getting inventory by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/inventory/inventory/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved inventory by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get inventory by ID, status: ${response.status()}`);
            throw new Error(`Failed to get inventory by ID with status: ${response.status()}`);
        }
    }

    async updateInventory(request: APIRequestContext, inventoryData: any, userId: string) {
        logger.info(`Updating inventory with data:`, inventoryData);

        const response = await request.post(ENV.API_BASE_URL + 'api/inventory/inventory/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: inventoryData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Inventory updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update inventory, status: ${response.status()}`);
            throw new Error(`Failed to update inventory with status: ${response.status()}`);
        }
    }

    async removeFileInventory(request: APIRequestContext, id: number) {
        logger.info(`Removing file from inventory with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/inventory/file/${id}`);

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'File removed from inventory successfully' };
            logger.info(`File removed from inventory successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove file from inventory, status: ${response.status()}`);
            throw new Error(`Failed to remove file from inventory with status: ${response.status()}`);
        }
    }

    async banInventory(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Banning inventory with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/inventory/ban/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Inventory banned successfully' };
            logger.info(`Inventory banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban inventory, status: ${response.status()}`);
            throw new Error(`Failed to ban inventory with status: ${response.status()}`);
        }
    }

    async getAllInventory(request: APIRequestContext, light: boolean) {
        logger.info(`Getting all inventory, light: ${light}`);

        const response = await request.get(ENV.API_BASE_URL + `api/inventory/inventory/all/${light}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all inventory`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all inventory, status: ${response.status()}`);
            throw new Error(`Failed to get all inventory with status: ${response.status()}`);
        }
    }
}
