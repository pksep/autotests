import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class MaterialsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createSubtypeMaterial(request: APIRequestContext, subtypeData: any, userId: string) {
        logger.info(`Creating subtype material with data:`, subtypeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/material/subtype', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: subtypeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Subtype material created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create subtype material, status: ${response.status()}`);
            throw new Error(`Failed to create subtype material with status: ${response.status()}`);
        }
    }

    async removeSubtypeMaterial(request: APIRequestContext, id: number) {
        logger.info(`Removing subtype material with id: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/material/subtype/${id}`);

        if (response.ok()) {
            // Handle empty response for DELETE operations
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Subtype material removed successfully' };
            logger.info(`Subtype material removed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove subtype material, status: ${response.status()}`);
            throw new Error(`Failed to remove subtype material with status: ${response.status()}`);
        }
    }

    async updateSubtypeMaterial(request: APIRequestContext, subtypeData: any) {
        logger.info(`Updating subtype material with data:`, subtypeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/material/subtype/update', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: subtypeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Subtype material updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update subtype material, status: ${response.status()}`);
            throw new Error(`Failed to update subtype material with status: ${response.status()}`);
        }
    }

    async createAndUpdateMaterial(request: APIRequestContext, materialData: any, userId: string) {
        logger.info(`Creating/updating material with data:`, materialData);

        const response = await request.post(ENV.API_BASE_URL + 'api/material/material', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: materialData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Material created/updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create/update material, status: ${response.status()}`);
            throw new Error(`Failed to create/update material with status: ${response.status()}`);
        }
    }

    async getAllMaterials(request: APIRequestContext) {
        logger.info(`Getting all materials`);

        const response = await request.get(ENV.API_BASE_URL + 'api/material/material');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all materials`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all materials, status: ${response.status()}`);
            throw new Error(`Failed to get all materials with status: ${response.status()}`);
        }
    }

    async getIncludeForMaterial(request: APIRequestContext, includeData: any) {
        logger.info(`Getting include for material:`, includeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/material/material/include', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: includeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved include for material`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get include for material, status: ${response.status()}`);
            throw new Error(`Failed to get include for material with status: ${response.status()}`);
        }
    }

    async actualMaterialLists(request: APIRequestContext) {
        logger.info(`Actualizing material lists`);

        const response = await request.get(ENV.API_BASE_URL + 'api/material/actuallists');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully actualized material lists`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to actualize material lists, status: ${response.status()}`);
            throw new Error(`Failed to actualize material lists with status: ${response.status()}`);
        }
    }

    async actualListsSpecification(request: APIRequestContext) {
        logger.info(`Actualizing lists specification`);

        const response = await request.get(ENV.API_BASE_URL + 'api/material/actualspecification');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully actualized lists specification`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to actualize lists specification, status: ${response.status()}`);
            throw new Error(`Failed to actualize lists specification with status: ${response.status()}`);
        }
    }

    async getAllSubtypeMaterial(request: APIRequestContext, instans: string) {
        logger.info(`Getting all subtype materials for instans: ${instans}`);

        const response = await request.get(ENV.API_BASE_URL + `api/material/subtype-material/${instans}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all subtype materials`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all subtype materials, status: ${response.status()}`);
            throw new Error(`Failed to get all subtype materials with status: ${response.status()}`);
        }
    }
}
