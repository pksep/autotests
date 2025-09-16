import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class IntegrationsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createIntegration(request: APIRequestContext, integrationData: any, userId: string) {
        logger.info(`Creating integration:`, integrationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/integrations', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: integrationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create integration, status: ${response.status()}`);
            throw new Error(`Failed to create integration with status: ${response.status()}`);
        }
    }

    async updateIntegration(request: APIRequestContext, integrationData: any, userId: string) {
        logger.info(`Updating integration:`, integrationData);

        const response = await request.put(ENV.API_BASE_URL + 'api/integrations', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: integrationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update integration, status: ${response.status()}`);
            throw new Error(`Failed to update integration with status: ${response.status()}`);
        }
    }

    async getIntegrationById(request: APIRequestContext, integrationId: string) {
        logger.info(`Getting integration by ID: ${integrationId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/integrations/${integrationId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved integration by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get integration by ID, status: ${response.status()}`);
            throw new Error(`Failed to get integration by ID with status: ${response.status()}`);
        }
    }

    async deleteIntegration(request: APIRequestContext, integrationId: string, userId: string) {
        logger.info(`Deleting integration with ID: ${integrationId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/integrations/${integrationId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Integration deleted successfully' };
            logger.info(`Integration deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete integration, status: ${response.status()}`);
            throw new Error(`Failed to delete integration with status: ${response.status()}`);
        }
    }

    async getAllIntegrations(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all integrations with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/integrations/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all integrations`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all integrations, status: ${response.status()}`);
            throw new Error(`Failed to get all integrations with status: ${response.status()}`);
        }
    }

    async getIntegrationsByType(request: APIRequestContext, integrationType: string) {
        logger.info(`Getting integrations by type: ${integrationType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/integrations/type/${integrationType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved integrations by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get integrations by type, status: ${response.status()}`);
            throw new Error(`Failed to get integrations by type with status: ${response.status()}`);
        }
    }

    async testIntegration(request: APIRequestContext, integrationId: string, testData: any, userId: string) {
        logger.info(`Testing integration with ID: ${integrationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/integrations/${integrationId}/test`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: testData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration test completed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to test integration, status: ${response.status()}`);
            throw new Error(`Failed to test integration with status: ${response.status()}`);
        }
    }

    async getIntegrationStatus(request: APIRequestContext, integrationId: string) {
        logger.info(`Getting integration status for ID: ${integrationId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/integrations/${integrationId}/status`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved integration status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get integration status, status: ${response.status()}`);
            throw new Error(`Failed to get integration status with status: ${response.status()}`);
        }
    }

    async enableIntegration(request: APIRequestContext, integrationId: string, userId: string) {
        logger.info(`Enabling integration with ID: ${integrationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/integrations/${integrationId}/enable`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration enabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to enable integration, status: ${response.status()}`);
            throw new Error(`Failed to enable integration with status: ${response.status()}`);
        }
    }

    async disableIntegration(request: APIRequestContext, integrationId: string, userId: string) {
        logger.info(`Disabling integration with ID: ${integrationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/integrations/${integrationId}/disable`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration disabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to disable integration, status: ${response.status()}`);
            throw new Error(`Failed to disable integration with status: ${response.status()}`);
        }
    }

    async getIntegrationLogs(request: APIRequestContext, integrationId: string, logData: any) {
        logger.info(`Getting integration logs for ID: ${integrationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/integrations/${integrationId}/logs`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved integration logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get integration logs, status: ${response.status()}`);
            throw new Error(`Failed to get integration logs with status: ${response.status()}`);
        }
    }

    async syncIntegration(request: APIRequestContext, integrationId: string, syncData: any, userId: string) {
        logger.info(`Syncing integration with ID: ${integrationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/integrations/${integrationId}/sync`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: syncData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Integration sync completed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to sync integration, status: ${response.status()}`);
            throw new Error(`Failed to sync integration with status: ${response.status()}`);
        }
    }
}
