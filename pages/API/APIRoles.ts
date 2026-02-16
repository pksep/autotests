import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class RolesAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createRole(request: APIRequestContext, roleData: any, userId: string, authToken?: string) {
        logger.info(`Creating role with data:`, roleData);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/roles', {
            headers: headers,
            data: roleData
        });

        try {
            const responseData = await response.json();
            logger.info(`Role creation response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            // For 201 status, empty response body is normal
            if (response.status() === 201) {
                logger.info(`Role creation successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getAllRoles(request: APIRequestContext, authToken?: string) {
        logger.info(`Getting all roles`);

        const headers = {
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.get(ENV.API_BASE_URL + 'api/roles', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`All roles response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getRoleByName(request: APIRequestContext, name: string, authToken?: string) {
        logger.info(`Getting role by name: ${name}`);

        const headers = {
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.get(ENV.API_BASE_URL + `api/roles/${name}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Role by name response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateRoleAccess(request: APIRequestContext, accessData: any, userId: string, authToken?: string) {
        logger.info(`Updating role access with data:`, accessData);

        const headers = {
            'Content-Type': 'application/json',
            'user-id': userId,
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/roles/accesses', {
            headers: headers,
            data: accessData
        });

        try {
            const responseData = await response.json();
            logger.info(`Role access update response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async checkRoleNameUnique(request: APIRequestContext, nameData: any, authToken?: string) {
        logger.info(`Checking role name uniqueness:`, nameData);

        const headers = {
            'Content-Type': 'application/json',
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/roles/name/unique', {
            headers: headers,
            data: nameData
        });

        try {
            const responseData = await response.json();
            logger.info(`Role name uniqueness check response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getRoleById(request: APIRequestContext, id: string, authToken?: string) {
        logger.info(`Getting role by ID: ${id}`);

        const headers = {
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.get(ENV.API_BASE_URL + `api/roles/one/${id}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Role by ID response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async deleteRole(request: APIRequestContext, roleId: string, userId: string, authToken?: string) {
        logger.info(`Deleting role with ID: ${roleId}`);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.delete(ENV.API_BASE_URL + `api/roles/${roleId}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Role deletion response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateRole(request: APIRequestContext, roleData: any, userId: string, authToken?: string) {
        logger.info(`Updating role with data:`, roleData);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Content-Type': 'application/json',
            'compress': 'no-compress',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/roles/update', {
            headers: headers,
            data: roleData
        });

        try {
            const responseData = await response.json();
            logger.info(`Role update response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }
}
