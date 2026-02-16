import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ImportExportAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async importData(request: APIRequestContext, importData: any, userId: string) {
        logger.info(`Importing data:`, importData);

        const response = await request.post(ENV.API_BASE_URL + 'api/import-export/import', {
            headers: {
                'user-id': userId
            },
            multipart: importData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Data imported successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to import data, status: ${response.status()}`);
            throw new Error(`Failed to import data with status: ${response.status()}`);
        }
    }

    async exportData(request: APIRequestContext, exportData: any, userId: string) {
        logger.info(`Exporting data:`, exportData);

        const response = await request.post(ENV.API_BASE_URL + 'api/import-export/export', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: exportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Data exported successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export data, status: ${response.status()}`);
            throw new Error(`Failed to export data with status: ${response.status()}`);
        }
    }

    async getImportStatus(request: APIRequestContext, importId: string) {
        logger.info(`Getting import status for ID: ${importId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/import/${importId}/status`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved import status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get import status, status: ${response.status()}`);
            throw new Error(`Failed to get import status with status: ${response.status()}`);
        }
    }

    async getExportStatus(request: APIRequestContext, exportId: string) {
        logger.info(`Getting export status for ID: ${exportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/export/${exportId}/status`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved export status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get export status, status: ${response.status()}`);
            throw new Error(`Failed to get export status with status: ${response.status()}`);
        }
    }

    async downloadExport(request: APIRequestContext, exportId: string) {
        logger.info(`Downloading export with ID: ${exportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/export/${exportId}/download`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Export downloaded successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to download export, status: ${response.status()}`);
            throw new Error(`Failed to download export with status: ${response.status()}`);
        }
    }

    async getImportHistory(request: APIRequestContext, userId: string, paginationData: any) {
        logger.info(`Getting import history for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/import-export/import/history/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved import history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get import history, status: ${response.status()}`);
            throw new Error(`Failed to get import history with status: ${response.status()}`);
        }
    }

    async getExportHistory(request: APIRequestContext, userId: string, paginationData: any) {
        logger.info(`Getting export history for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/import-export/export/history/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved export history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get export history, status: ${response.status()}`);
            throw new Error(`Failed to get export history with status: ${response.status()}`);
        }
    }

    async validateImportData(request: APIRequestContext, importData: any, userId: string) {
        logger.info(`Validating import data:`, importData);

        const response = await request.post(ENV.API_BASE_URL + 'api/import-export/import/validate', {
            headers: {
                'user-id': userId
            },
            multipart: importData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Import data validated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate import data, status: ${response.status()}`);
            throw new Error(`Failed to validate import data with status: ${response.status()}`);
        }
    }

    async getImportTemplate(request: APIRequestContext, templateType: string) {
        logger.info(`Getting import template for type: ${templateType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/import/template/${templateType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved import template`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get import template, status: ${response.status()}`);
            throw new Error(`Failed to get import template with status: ${response.status()}`);
        }
    }

    async getExportTemplate(request: APIRequestContext, templateType: string) {
        logger.info(`Getting export template for type: ${templateType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/export/template/${templateType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved export template`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get export template, status: ${response.status()}`);
            throw new Error(`Failed to get export template with status: ${response.status()}`);
        }
    }

    async cancelImport(request: APIRequestContext, importId: string, userId: string) {
        logger.info(`Cancelling import with ID: ${importId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/import-export/import/${importId}/cancel`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Import cancelled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to cancel import, status: ${response.status()}`);
            throw new Error(`Failed to cancel import with status: ${response.status()}`);
        }
    }

    async cancelExport(request: APIRequestContext, exportId: string, userId: string) {
        logger.info(`Cancelling export with ID: ${exportId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/import-export/export/${exportId}/cancel`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Export cancelled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to cancel export, status: ${response.status()}`);
            throw new Error(`Failed to cancel export with status: ${response.status()}`);
        }
    }

    async getImportErrors(request: APIRequestContext, importId: string) {
        logger.info(`Getting import errors for ID: ${importId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/import/${importId}/errors`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved import errors`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get import errors, status: ${response.status()}`);
            throw new Error(`Failed to get import errors with status: ${response.status()}`);
        }
    }

    async getExportErrors(request: APIRequestContext, exportId: string) {
        logger.info(`Getting export errors for ID: ${exportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/import-export/export/${exportId}/errors`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved export errors`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get export errors, status: ${response.status()}`);
            throw new Error(`Failed to get export errors with status: ${response.status()}`);
        }
    }
}
