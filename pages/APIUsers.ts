import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class UsersAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createUser(request: APIRequestContext, userData: any, userId: string, authToken?: string) {
        logger.info(`Creating user with data:`, userData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users', userData, {
            'user-id': userId,
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        });

        const responseData = await response.json();

        if (response.ok()) {
            logger.info(`User created successfully`);
        } else {
            logger.error(`Failed to create user, status: ${response.status()}`);
        }

        return { status: response.status(), data: responseData };
    }

    async updateUser(request: APIRequestContext, userData: any, userId: string, authToken?: string) {
        logger.info(`Updating user with data:`, userData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/update', userData, {
            'user-id': userId,
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        });

        const responseData = await response.json();

        if (response.ok()) {
            logger.info(`User updated successfully`);
        } else {
            logger.error(`Failed to update user, status: ${response.status()}`);
        }

        return { status: response.status(), data: responseData };
    }

    async checkTabelUnique(request: APIRequestContext, tabelData: any) {
        logger.info(`Checking tabel uniqueness:`, tabelData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/tabel/unique', tabelData);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Tabel uniqueness check completed`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to check tabel uniqueness, status: ${response.status()}`);
            throw new Error(`Failed to check tabel uniqueness with status: ${response.status()}`);
        }
    }

    async getAllUsers(request: APIRequestContext, light: boolean, includeRole: boolean) {
        logger.info(`Getting all users - light: ${light}, includeRole: ${includeRole}`);

        const response = await request.get(ENV.API_BASE_URL + `api/users/list/${light}/${includeRole}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all users, status: ${response.status()}`);
            throw new Error(`Failed to get all users with status: ${response.status()}`);
        }
    }

    async getAllUsersList(request: APIRequestContext) {
        logger.info(`Getting all users list (minimal data)`);

        const response = await request.get(ENV.API_BASE_URL + 'api/users/list');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all users list`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all users list, status: ${response.status()}`);
            throw new Error(`Failed to get all users list with status: ${response.status()}`);
        }
    }

    async getAllUsersWithPagination(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all users with pagination:`, paginationData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/pagination/all', paginationData);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved users with pagination`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get users with pagination, status: ${response.status()}`);
            throw new Error(`Failed to get users with pagination with status: ${response.status()}`);
        }
    }

    async getArchivedUsers(request: APIRequestContext, archiveData: any) {
        logger.info(`Getting archived users:`, archiveData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/archive', archiveData);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved archived users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get archived users, status: ${response.status()}`);
            throw new Error(`Failed to get archived users with status: ${response.status()}`);
        }
    }
}
