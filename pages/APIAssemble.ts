import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class AssembleAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createAssemble(request: APIRequestContext, assembleData: any, userId: string) {
        logger.info(`Creating assemble with data:`, assembleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: assembleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Assemble created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create assemble, status: ${response.status()}`);
            throw new Error(`Failed to create assemble with status: ${response.status()}`);
        }
    }

    async updateAssemble(request: APIRequestContext, assembleData: any, userId: string) {
        logger.info(`Updating assemble with data:`, assembleData);

        const response = await request.put(ENV.API_BASE_URL + 'api/assemble', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: assembleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Assemble updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update assemble, status: ${response.status()}`);
            throw new Error(`Failed to update assemble with status: ${response.status()}`);
        }
    }

    async getActualAssembleOrders(request: APIRequestContext) {
        logger.info(`Getting actual assemble orders`);

        const response = await request.get(ENV.API_BASE_URL + 'api/assemble/actual');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved actual assemble orders`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get actual assemble orders, status: ${response.status()}`);
            throw new Error(`Failed to get actual assemble orders with status: ${response.status()}`);
        }
    }

    async getAllAssembleWithPagination(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all assemble with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved assemble with pagination`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get assemble with pagination, status: ${response.status()}`);
            throw new Error(`Failed to get assemble with pagination with status: ${response.status()}`);
        }
    }

    async getAllAssembleWithPaginationSclad(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all assemble with pagination sclad:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/sclad/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved assemble with pagination sclad`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get assemble with pagination sclad, status: ${response.status()}`);
            throw new Error(`Failed to get assemble with pagination sclad with status: ${response.status()}`);
        }
    }

    async getAssembleByParent(request: APIRequestContext, parentData: any) {
        logger.info(`Getting assemble by parent:`, parentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/relative', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: parentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved assemble by parent`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get assemble by parent, status: ${response.status()}`);
            throw new Error(`Failed to get assemble by parent with status: ${response.status()}`);
        }
    }

    async getMetalloworkingComing(request: APIRequestContext, comingData: any) {
        logger.info(`Getting metalloworking coming:`, comingData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/coming/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: comingData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved metalloworking coming`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get metalloworking coming, status: ${response.status()}`);
            throw new Error(`Failed to get metalloworking coming with status: ${response.status()}`);
        }
    }

    async getDeepDeficitObject(request: APIRequestContext, deficitData: any) {
        logger.info(`Getting deep deficit object:`, deficitData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/deficit/deep', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: deficitData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved deep deficit object`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get deep deficit object, status: ${response.status()}`);
            throw new Error(`Failed to get deep deficit object with status: ${response.status()}`);
        }
    }

    async getAllAssemblePlan(request: APIRequestContext, planData: any) {
        logger.info(`Getting all assemble plan:`, planData);

        const response = await request.post(ENV.API_BASE_URL + 'api/assemble/asstoplan', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: planData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all assemble plan`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all assemble plan, status: ${response.status()}`);
            throw new Error(`Failed to get all assemble plan with status: ${response.status()}`);
        }
    }
}
