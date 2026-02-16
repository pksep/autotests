import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class WarehouseAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getWarehouseData(request: APIRequestContext, warehouseData: any) {
        logger.info(`Getting warehouse data:`, warehouseData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/sclad', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: warehouseData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved warehouse data`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get warehouse data, status: ${response.status()}`);
            throw new Error(`Failed to get warehouse data with status: ${response.status()}`);
        }
    }

    async getNeedsByParents(request: APIRequestContext, type: string, id: number) {
        logger.info(`Getting needs by parents - type: ${type}, id: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/sclad/needs_by_parents/${type}/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved needs by parents`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get needs by parents, status: ${response.status()}`);
            throw new Error(`Failed to get needs by parents with status: ${response.status()}`);
        }
    }

    async getNeedsByParent(request: APIRequestContext, parentData: any) {
        logger.info(`Getting needs by parent:`, parentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/needs_by_parent', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: parentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved needs by parent`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get needs by parent, status: ${response.status()}`);
            throw new Error(`Failed to get needs by parent with status: ${response.status()}`);
        }
    }

    async resetInSets(request: APIRequestContext) {
        logger.info(`Resetting all sets`);

        const response = await request.get(ENV.API_BASE_URL + 'api/sclad/reset_in_sets');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully reset all sets`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to reset all sets, status: ${response.status()}`);
            throw new Error(`Failed to reset all sets with status: ${response.status()}`);
        }
    }

    async getWarehousePagination(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting warehouse data with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved warehouse data with pagination`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get warehouse data with pagination, status: ${response.status()}`);
            throw new Error(`Failed to get warehouse data with pagination with status: ${response.status()}`);
        }
    }

    async getWarehouseDeficit(request: APIRequestContext, deficitData: any) {
        logger.info(`Getting warehouse deficit:`, deficitData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/deficit', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: deficitData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved warehouse deficit`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get warehouse deficit, status: ${response.status()}`);
            throw new Error(`Failed to get warehouse deficit with status: ${response.status()}`);
        }
    }

    async getWarehouseRemains(request: APIRequestContext, remainsData: any) {
        logger.info(`Getting warehouse remains:`, remainsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/remains', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: remainsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved warehouse remains`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get warehouse remains, status: ${response.status()}`);
            throw new Error(`Failed to get warehouse remains with status: ${response.status()}`);
        }
    }

    async updateWarehouseItem(request: APIRequestContext, itemData: any, userId: string) {
        logger.info(`Updating warehouse item:`, itemData);

        const response = await request.put(ENV.API_BASE_URL + 'api/sclad/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: itemData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Warehouse item updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update warehouse item, status: ${response.status()}`);
            throw new Error(`Failed to update warehouse item with status: ${response.status()}`);
        }
    }

    async createWarehouseItem(request: APIRequestContext, itemData: any, userId: string) {
        logger.info(`Creating warehouse item:`, itemData);

        const response = await request.post(ENV.API_BASE_URL + 'api/sclad/create', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: itemData
        });

        let responseData: any;
        try {
            responseData = await response.json();
        } catch {
            responseData = await response.text();
        }
        if (response.ok()) {
            logger.info(`Warehouse item created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create warehouse item, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }
}
