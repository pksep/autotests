import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class BackupAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createBackup(request: APIRequestContext, backupData: any, userId: string) {
        logger.info(`Creating backup:`, backupData);

        const response = await request.post(ENV.API_BASE_URL + 'api/backup/create', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: backupData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Backup created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create backup, status: ${response.status()}`);
            throw new Error(`Failed to create backup with status: ${response.status()}`);
        }
    }

    async restoreBackup(request: APIRequestContext, backupId: string, userId: string) {
        logger.info(`Restoring backup with ID: ${backupId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/backup/restore/${backupId}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Backup restored successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to restore backup, status: ${response.status()}`);
            throw new Error(`Failed to restore backup with status: ${response.status()}`);
        }
    }

    async getBackupById(request: APIRequestContext, backupId: string) {
        logger.info(`Getting backup by ID: ${backupId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/backup/${backupId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved backup by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get backup by ID, status: ${response.status()}`);
            throw new Error(`Failed to get backup by ID with status: ${response.status()}`);
        }
    }

    async deleteBackup(request: APIRequestContext, backupId: string, userId: string) {
        logger.info(`Deleting backup with ID: ${backupId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/backup/${backupId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Backup deleted successfully' };
            logger.info(`Backup deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete backup, status: ${response.status()}`);
            throw new Error(`Failed to delete backup with status: ${response.status()}`);
        }
    }

    async getAllBackups(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all backups with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/backup/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all backups`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all backups, status: ${response.status()}`);
            throw new Error(`Failed to get all backups with status: ${response.status()}`);
        }
    }

    async getBackupsByType(request: APIRequestContext, backupType: string) {
        logger.info(`Getting backups by type: ${backupType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/backup/type/${backupType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved backups by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get backups by type, status: ${response.status()}`);
            throw new Error(`Failed to get backups by type with status: ${response.status()}`);
        }
    }

    async getBackupStatus(request: APIRequestContext, backupId: string) {
        logger.info(`Getting backup status for ID: ${backupId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/backup/${backupId}/status`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved backup status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get backup status, status: ${response.status()}`);
            throw new Error(`Failed to get backup status with status: ${response.status()}`);
        }
    }

    async downloadBackup(request: APIRequestContext, backupId: string) {
        logger.info(`Downloading backup with ID: ${backupId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/backup/download/${backupId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Backup downloaded successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to download backup, status: ${response.status()}`);
            throw new Error(`Failed to download backup with status: ${response.status()}`);
        }
    }

    async scheduleBackup(request: APIRequestContext, scheduleData: any, userId: string) {
        logger.info(`Scheduling backup:`, scheduleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/backup/schedule', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Backup scheduled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to schedule backup, status: ${response.status()}`);
            throw new Error(`Failed to schedule backup with status: ${response.status()}`);
        }
    }

    async getBackupSchedule(request: APIRequestContext, scheduleId: string) {
        logger.info(`Getting backup schedule with ID: ${scheduleId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/backup/schedule/${scheduleId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved backup schedule`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get backup schedule, status: ${response.status()}`);
            throw new Error(`Failed to get backup schedule with status: ${response.status()}`);
        }
    }

    async updateBackupSchedule(request: APIRequestContext, scheduleId: string, scheduleData: any, userId: string) {
        logger.info(`Updating backup schedule with ID: ${scheduleId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/backup/schedule/${scheduleId}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Backup schedule updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update backup schedule, status: ${response.status()}`);
            throw new Error(`Failed to update backup schedule with status: ${response.status()}`);
        }
    }

    async deleteBackupSchedule(request: APIRequestContext, scheduleId: string, userId: string) {
        logger.info(`Deleting backup schedule with ID: ${scheduleId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/backup/schedule/${scheduleId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Backup schedule deleted successfully' };
            logger.info(`Backup schedule deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete backup schedule, status: ${response.status()}`);
            throw new Error(`Failed to delete backup schedule with status: ${response.status()}`);
        }
    }
}
