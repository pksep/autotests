import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class ToolsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createToolType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Creating tool type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tools/type', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Tool type created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create tool type, status: ${response.status()}`);
            throw new Error(`Failed to create tool type with status: ${response.status()}`);
        }
    }

    async updateToolType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Updating tool type with data:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tools/type/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Tool type updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update tool type, status: ${response.status()}`);
            throw new Error(`Failed to update tool type with status: ${response.status()}`);
        }
    }

    async createTool(request: APIRequestContext, toolData: any, userId: string) {
        logger.info(`Creating tool with data:`, toolData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tools/tool', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: toolData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Tool created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create tool, status: ${response.status()}`);
            throw new Error(`Failed to create tool with status: ${response.status()}`);
        }
    }

    async getOneTool(request: APIRequestContext, id: number) {
        logger.info(`Getting tool by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tools/tool/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved tool by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get tool by ID, status: ${response.status()}`);
            throw new Error(`Failed to get tool by ID with status: ${response.status()}`);
        }
    }

    async updateTool(request: APIRequestContext, toolData: any, userId: string) {
        logger.info(`Updating tool with data:`, toolData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tools/tool/update', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: toolData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Tool updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update tool, status: ${response.status()}`);
            throw new Error(`Failed to update tool with status: ${response.status()}`);
        }
    }

    async removeFileTool(request: APIRequestContext, id: number) {
        logger.info(`Removing file from tool with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/tools/file/${id}`);

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'File removed from tool successfully' };
            logger.info(`File removed from tool successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove file from tool, status: ${response.status()}`);
            throw new Error(`Failed to remove file from tool with status: ${response.status()}`);
        }
    }

    async banTool(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Banning tool with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/tools/ban/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Tool banned successfully' };
            logger.info(`Tool banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban tool, status: ${response.status()}`);
            throw new Error(`Failed to ban tool with status: ${response.status()}`);
        }
    }

    async getAllTools(request: APIRequestContext, light: boolean) {
        logger.info(`Getting all tools, light: ${light}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tools/tool/all/${light}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all tools`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all tools, status: ${response.status()}`);
            throw new Error(`Failed to get all tools with status: ${response.status()}`);
        }
    }
}
