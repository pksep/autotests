import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class UsersAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createUser(request: APIRequestContext, userData: any, userId: string, authToken?: string) {
        logger.info(`Creating user with data:`, userData);

        const headers = {
            'user-id': userId,
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        };

        logger.log(`🔍 Creating user with headers:`, headers);
        logger.log(`🔍 Auth token: ${authToken ? authToken.substring(0, 50) + '...' : 'none'}`);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users', userData, headers);

        const responseData = await response.json();

        logger.log(`🔍 Create user response status: ${response.status()}`);
        logger.log(`🔍 Create user response data:`, responseData);

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
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
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

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/tabel/unique', tabelData, {
            'compress': 'no-compress'
        });

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

        const response = await request.get(ENV.API_BASE_URL + `api/users/list/${light}/${includeRole}`, {
            headers: {
                'compress': 'no-compress'
            }
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Successfully retrieved all users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all users, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async getAllUsersList(request: APIRequestContext) {
        logger.info(`Getting all users list (minimal data)`);

        const response = await request.get(ENV.API_BASE_URL + 'api/users/list', {
            headers: {
                'compress': 'no-compress'
            }
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            // If JSON parsing fails, get the raw text
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Successfully retrieved all users list`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all users list, status: ${response.status()}`);
            throw new Error(`Failed to get all users list with status: ${response.status()}`);
        }
    }

    async getAllUsersWithPagination(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all users with pagination:`, paginationData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/pagination/all', paginationData, {
            'compress': 'no-compress'
        });

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

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/archive', archiveData, {
            'compress': 'no-compress'
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Successfully retrieved archived users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get archived users, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async issueRole(request: APIRequestContext, roleData: any, authToken?: string) {
        logger.info(`Issuing role:`, roleData);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/users/role', roleData, {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Role issued successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to issue role, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async getUsersByRoleId(request: APIRequestContext, roleId: string, authToken?: string) {
        logger.info(`Getting users by role ID: ${roleId}`);

        const headers = {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        };

        const response = await request.get(ENV.API_BASE_URL + `api/users/role/${roleId}`, {
            headers: headers
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Successfully retrieved users by role ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get users by role ID, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async changeUserRole(request: APIRequestContext, newRoleId: string, oldRoleId: string, authToken?: string) {
        logger.info(`Changing user role from ${oldRoleId} to ${newRoleId}`);

        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + `api/users/role/${newRoleId}/${oldRoleId}`, {}, {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`User role changed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to change user role, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async banUser(request: APIRequestContext, banData: any, authToken?: string) {
        logger.info(`Banning user:`, banData);

        const response = await request.delete(ENV.API_BASE_URL + 'api/users/ban', {
            headers: {
                'Content-Type': 'application/json',
                'compress': 'no-compress',
                ...(authToken && { 'authorization': authToken })
            },
            data: banData
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`User banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban user, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async deleteUserById(request: APIRequestContext, userId: string, authToken?: string) {
        logger.info(`Deleting user by ID: ${userId}`);

        const headers: Record<string, string> = {
            'compress': 'no-compress'
        };
        if (authToken) {
            headers['authorization'] = authToken;
        }

        const response = await request.delete(ENV.API_BASE_URL + `api/users/${userId}`, {
            headers
        });

        let responseData: any;
        try {
            const responseText = await response.text();
            responseData = responseText ? JSON.parse(responseText) : { message: 'User deleted successfully' };
        } catch {
            responseData = { message: 'User deleted successfully' };
        }

        if (response.ok()) {
            logger.info(`User deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete user, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async getUserById(request: APIRequestContext, userId: string, authToken?: string) {
        logger.info(`Getting user by ID: ${userId}`);

        const headers = {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        };

        const response = await request.get(ENV.API_BASE_URL + `api/users/${userId}`, {
            headers: headers
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`Successfully retrieved user by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get user by ID, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async detachFile(request: APIRequestContext, userToUpdateId: string, fileId: string, authToken?: string) {
        logger.info(`Detaching file ${fileId} from user ${userToUpdateId}`);

        const headers = {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        };

        const response = await request.delete(ENV.API_BASE_URL + `api/users/files/${userToUpdateId}/${fileId}`, {
            headers: headers
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`File detached successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to detach file, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async attachFile(request: APIRequestContext, typeOperationId: string, authToken?: string) {
        logger.info(`Attaching file for type operation: ${typeOperationId}`);

        const headers = {
            'compress': 'no-compress',
            ...(authToken && { 'authorization': authToken })
        };

        const response = await request.get(ENV.API_BASE_URL + `api/users/by-type-operation/${typeOperationId}`, {
            headers: headers
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
            logger.error(`Failed to parse JSON response, got text instead: ${responseData.substring(0, 100)}...`);
        }

        if (response.ok()) {
            logger.info(`File attachment info retrieved successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get file attachment info, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }
}
