import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ProductionTasksAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createProductionTask(request: APIRequestContext, taskData: any, userId: string) {
        logger.info(`Creating production task with data:`, taskData);

        const response = await request.post(ENV.API_BASE_URL + 'api/production-task', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: taskData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Production task created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create production task, status: ${response.status()}`);
            throw new Error(`Failed to create production task with status: ${response.status()}`);
        }
    }

    async updateProductionTask(request: APIRequestContext, taskData: any, userId: string) {
        logger.info(`Updating production task with data:`, taskData);

        const response = await request.put(ENV.API_BASE_URL + 'api/production-task', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: taskData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Production task updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update production task, status: ${response.status()}`);
            throw new Error(`Failed to update production task with status: ${response.status()}`);
        }
    }

    async getProductionTaskPaginate(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting production tasks with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/production-task/list', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production tasks with pagination`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production tasks with pagination, status: ${response.status()}`);
            throw new Error(`Failed to get production tasks with pagination with status: ${response.status()}`);
        }
    }

    async getProductionTaskByUser(request: APIRequestContext, userData: any) {
        logger.info(`Getting production task by user:`, userData);

        const response = await request.post(ENV.API_BASE_URL + 'api/production-task/by-user', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: userData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production task by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production task by user, status: ${response.status()}`);
            throw new Error(`Failed to get production task by user with status: ${response.status()}`);
        }
    }

    async getProductionTaskById(request: APIRequestContext, productionTaskId: number) {
        logger.info(`Getting production task by ID: ${productionTaskId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/production-task/by-id/${productionTaskId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production task by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production task by ID, status: ${response.status()}`);
            throw new Error(`Failed to get production task by ID with status: ${response.status()}`);
        }
    }

    async getProductionTaskCount(request: APIRequestContext) {
        logger.info(`Getting production task count`);

        const response = await request.get(ENV.API_BASE_URL + 'api/production-task/count');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production task count`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production task count, status: ${response.status()}`);
            throw new Error(`Failed to get production task count with status: ${response.status()}`);
        }
    }

    async updateStatusProductionTask(request: APIRequestContext, statusData: any, userId: string) {
        logger.info(`Updating production task status:`, statusData);

        const response = await request.put(ENV.API_BASE_URL + 'api/production-task/status', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: statusData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Production task status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update production task status, status: ${response.status()}`);
            throw new Error(`Failed to update production task status with status: ${response.status()}`);
        }
    }

    async getProductionTaskByAllUsers(request: APIRequestContext) {
        logger.info(`Getting production tasks for all users`);

        const response = await request.get(ENV.API_BASE_URL + 'api/production-task/for-all-users');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production tasks for all users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production tasks for all users, status: ${response.status()}`);
            throw new Error(`Failed to get production tasks for all users with status: ${response.status()}`);
        }
    }

    async updateProductionTaskMarks(request: APIRequestContext, marksData: any) {
        logger.info(`Updating production task marks:`, marksData);

        const response = await request.put(ENV.API_BASE_URL + 'api/production-task/update-marks', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: marksData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Production task marks updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update production task marks, status: ${response.status()}`);
            throw new Error(`Failed to update production task marks with status: ${response.status()}`);
        }
    }

    async getTaskByProductionOperation(request: APIRequestContext, id: number) {
        logger.info(`Getting task by production operation ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/production-task/get-by-production-operatioin/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved task by production operation`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get task by production operation, status: ${response.status()}`);
            throw new Error(`Failed to get task by production operation with status: ${response.status()}`);
        }
    }

    async getTOperationList(request: APIRequestContext) {
        logger.info(`Getting T-operation list`);

        const response = await request.get(ENV.API_BASE_URL + 'api/production-task/toperations-list');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved T-operation list`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get T-operation list, status: ${response.status()}`);
            throw new Error(`Failed to get T-operation list with status: ${response.status()}`);
        }
    }
}
