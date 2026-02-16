import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class EquipmentAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createEquipmentType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Creating equipment type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/equipment/type', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Equipment type created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create equipment type, status: ${response.status()}`);
            throw new Error(`Failed to create equipment type with status: ${response.status()}`);
        }
    }

    async updateEquipmentType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Updating equipment type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/equipment/type/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Equipment type updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update equipment type, status: ${response.status()}`);
            throw new Error(`Failed to update equipment type with status: ${response.status()}`);
        }
    }

    async createEquipment(request: APIRequestContext, equipmentData: any, userId: string) {
        logger.info(`Creating equipment with data:`, equipmentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/equipment/eq', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: equipmentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Equipment created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create equipment, status: ${response.status()}`);
            throw new Error(`Failed to create equipment with status: ${response.status()}`);
        }
    }

    async getOneEquipment(request: APIRequestContext, id: number) {
        logger.info(`Getting equipment by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/equipment/eq/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved equipment by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get equipment by ID, status: ${response.status()}`);
            throw new Error(`Failed to get equipment by ID with status: ${response.status()}`);
        }
    }

    async updateEquipment(request: APIRequestContext, equipmentData: any, userId: string) {
        logger.info(`Updating equipment with data:`, equipmentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/equipment/eq/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: equipmentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Equipment updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update equipment, status: ${response.status()}`);
            throw new Error(`Failed to update equipment with status: ${response.status()}`);
        }
    }

    async removeFileEquipment(request: APIRequestContext, id: number) {
        logger.info(`Removing file from equipment with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/equipment/file/${id}`);

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'File removed from equipment successfully' };
            logger.info(`File removed from equipment successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove file from equipment, status: ${response.status()}`);
            throw new Error(`Failed to remove file from equipment with status: ${response.status()}`);
        }
    }

    async banEquipment(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Banning equipment with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/equipment/ban/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Equipment banned successfully' };
            logger.info(`Equipment banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban equipment, status: ${response.status()}`);
            throw new Error(`Failed to ban equipment with status: ${response.status()}`);
        }
    }

    async getAllEquipment(request: APIRequestContext, light: boolean) {
        logger.info(`Getting all equipment, light: ${light}`);

        const response = await request.get(ENV.API_BASE_URL + `api/equipment/eq/all/${light}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all equipment`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all equipment, status: ${response.status()}`);
            throw new Error(`Failed to get all equipment with status: ${response.status()}`);
        }
    }
}
