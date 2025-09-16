import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class LogsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getSystemLogs(request: APIRequestContext, logData: any) {
        logger.info(`Getting system logs:`, logData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/system', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved system logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get system logs, status: ${response.status()}`);
            throw new Error(`Failed to get system logs with status: ${response.status()}`);
        }
    }

    async getApplicationLogs(request: APIRequestContext, logData: any) {
        logger.info(`Getting application logs:`, logData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/application', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved application logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get application logs, status: ${response.status()}`);
            throw new Error(`Failed to get application logs with status: ${response.status()}`);
        }
    }

    async getErrorLogs(request: APIRequestContext, logData: any) {
        logger.info(`Getting error logs:`, logData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/error', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved error logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get error logs, status: ${response.status()}`);
            throw new Error(`Failed to get error logs with status: ${response.status()}`);
        }
    }

    async getAuditLogs(request: APIRequestContext, logData: any) {
        logger.info(`Getting audit logs:`, logData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/audit', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit logs, status: ${response.status()}`);
            throw new Error(`Failed to get audit logs with status: ${response.status()}`);
        }
    }

    async getLogsByLevel(request: APIRequestContext, level: string, logData: any) {
        logger.info(`Getting logs by level: ${level}`);

        const response = await request.post(ENV.API_BASE_URL + `api/logs/level/${level}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved logs by level`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get logs by level, status: ${response.status()}`);
            throw new Error(`Failed to get logs by level with status: ${response.status()}`);
        }
    }

    async getLogsByUser(request: APIRequestContext, userId: string, logData: any) {
        logger.info(`Getting logs by user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/logs/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved logs by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get logs by user, status: ${response.status()}`);
            throw new Error(`Failed to get logs by user with status: ${response.status()}`);
        }
    }

    async getLogsByModule(request: APIRequestContext, module: string, logData: any) {
        logger.info(`Getting logs by module: ${module}`);

        const response = await request.post(ENV.API_BASE_URL + `api/logs/module/${module}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved logs by module`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get logs by module, status: ${response.status()}`);
            throw new Error(`Failed to get logs by module with status: ${response.status()}`);
        }
    }

    async exportLogs(request: APIRequestContext, exportData: any) {
        logger.info(`Exporting logs:`, exportData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/export', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: exportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully exported logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export logs, status: ${response.status()}`);
            throw new Error(`Failed to export logs with status: ${response.status()}`);
        }
    }

    async clearLogs(request: APIRequestContext, clearData: any, userId: string) {
        logger.info(`Clearing logs:`, clearData);

        const response = await request.delete(ENV.API_BASE_URL + 'api/logs/clear', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: clearData
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Logs cleared successfully' };
            logger.info(`Logs cleared successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to clear logs, status: ${response.status()}`);
            throw new Error(`Failed to clear logs with status: ${response.status()}`);
        }
    }

    async getLogStatistics(request: APIRequestContext, statsData: any) {
        logger.info(`Getting log statistics:`, statsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/logs/statistics', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: statsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved log statistics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get log statistics, status: ${response.status()}`);
            throw new Error(`Failed to get log statistics with status: ${response.status()}`);
        }
    }
}
