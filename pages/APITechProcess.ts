import { Page, APIRequestContext } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import logger from '../lib/logger';
import { ENV } from '../config';

export class TechProcessAPI extends APIPageObject {
    constructor(page: Page | null) {
        super(page as any);
    }

    async createOrUpdateTechProcess(request: APIRequestContext, techProcessData: any, authToken?: string) {
        logger.info(`Creating or updating tech process with data:`, JSON.stringify(techProcessData, null, 2));

        const headers = {
            'accept': '*/*',
            'user-id': '1',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/tech-process', {
            headers: headers,
            data: techProcessData
        });

        try {
            const responseData = await response.json();
            logger.info(`Tech process creation/update response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateActualOperations(request: APIRequestContext, authToken?: string) {
        logger.info(`Updating actual operations`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.put(ENV.API_BASE_URL + 'api/tech-process/actual/operations', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Update actual operations response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateActual(request: APIRequestContext, authToken?: string) {
        logger.info(`Updating actual tech process`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.put(ENV.API_BASE_URL + 'api/tech-process/actual', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Update actual response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getTechProcessById(request: APIRequestContext, id: string, authToken?: string) {
        logger.info(`Getting tech process by ID: ${id}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await request.get(ENV.API_BASE_URL + `api/tech-process/${id}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get tech process by ID response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }
}
