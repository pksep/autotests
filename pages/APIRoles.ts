import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class RolesAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createRole(request: APIRequestContext, roleData: any, userId: string) {
        logger.info(`Creating role with data:`, roleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/roles', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: roleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Role created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create role, status: ${response.status()}`);
            throw new Error(`Failed to create role with status: ${response.status()}`);
        }
    }

    async getAllRoles(request: APIRequestContext) {
        logger.info(`Getting all roles`);

        const response = await request.get(ENV.API_BASE_URL + 'api/roles');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all roles`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all roles, status: ${response.status()}`);
            throw new Error(`Failed to get all roles with status: ${response.status()}`);
        }
    }

    async getRoleByName(request: APIRequestContext, name: string) {
        logger.info(`Getting role by name: ${name}`);

        const response = await request.get(ENV.API_BASE_URL + `api/roles/${name}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved role by name`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get role by name, status: ${response.status()}`);
            throw new Error(`Failed to get role by name with status: ${response.status()}`);
        }
    }

    async updateRoleAccess(request: APIRequestContext, accessData: any, userId: string) {
        logger.info(`Updating role access with data:`, accessData);

        const response = await request.post(ENV.API_BASE_URL + 'api/roles/accesses', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: accessData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Role access updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update role access, status: ${response.status()}`);
            throw new Error(`Failed to update role access with status: ${response.status()}`);
        }
    }

    async checkRoleNameUnique(request: APIRequestContext, nameData: any) {
        logger.info(`Checking role name uniqueness:`, nameData);

        const response = await request.post(ENV.API_BASE_URL + 'api/roles/name/unique', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: nameData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Role name uniqueness check completed`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to check role name uniqueness, status: ${response.status()}`);
            throw new Error(`Failed to check role name uniqueness with status: ${response.status()}`);
        }
    }
}
