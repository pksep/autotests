import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class SettingsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getSystemSettings(request: APIRequestContext) {
        logger.info(`Getting system settings`);

        const response = await request.get(ENV.API_BASE_URL + 'api/settings/system');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved system settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get system settings, status: ${response.status()}`);
            throw new Error(`Failed to get system settings with status: ${response.status()}`);
        }
    }

    async updateSystemSettings(request: APIRequestContext, settingsData: any, userId: string) {
        logger.info(`Updating system settings:`, settingsData);

        const response = await request.put(ENV.API_BASE_URL + 'api/settings/system', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`System settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update system settings, status: ${response.status()}`);
            throw new Error(`Failed to update system settings with status: ${response.status()}`);
        }
    }

    async getUserSettings(request: APIRequestContext, userId: string) {
        logger.info(`Getting user settings for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/settings/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved user settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get user settings, status: ${response.status()}`);
            throw new Error(`Failed to get user settings with status: ${response.status()}`);
        }
    }

    async updateUserSettings(request: APIRequestContext, userId: string, settingsData: any) {
        logger.info(`Updating user settings for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/settings/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`User settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update user settings, status: ${response.status()}`);
            throw new Error(`Failed to update user settings with status: ${response.status()}`);
        }
    }

    async getModuleSettings(request: APIRequestContext, module: string) {
        logger.info(`Getting module settings for module: ${module}`);

        const response = await request.get(ENV.API_BASE_URL + `api/settings/module/${module}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved module settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get module settings, status: ${response.status()}`);
            throw new Error(`Failed to get module settings with status: ${response.status()}`);
        }
    }

    async updateModuleSettings(request: APIRequestContext, module: string, settingsData: any, userId: string) {
        logger.info(`Updating module settings for module: ${module}`);

        const response = await request.put(ENV.API_BASE_URL + `api/settings/module/${module}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Module settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update module settings, status: ${response.status()}`);
            throw new Error(`Failed to update module settings with status: ${response.status()}`);
        }
    }

    async getNotificationSettings(request: APIRequestContext, userId: string) {
        logger.info(`Getting notification settings for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/settings/notifications/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved notification settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get notification settings, status: ${response.status()}`);
            throw new Error(`Failed to get notification settings with status: ${response.status()}`);
        }
    }

    async updateNotificationSettings(request: APIRequestContext, userId: string, settingsData: any) {
        logger.info(`Updating notification settings for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/settings/notifications/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Notification settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update notification settings, status: ${response.status()}`);
            throw new Error(`Failed to update notification settings with status: ${response.status()}`);
        }
    }

    async getSecuritySettings(request: APIRequestContext) {
        logger.info(`Getting security settings`);

        const response = await request.get(ENV.API_BASE_URL + 'api/settings/security');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved security settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get security settings, status: ${response.status()}`);
            throw new Error(`Failed to get security settings with status: ${response.status()}`);
        }
    }

    async updateSecuritySettings(request: APIRequestContext, settingsData: any, userId: string) {
        logger.info(`Updating security settings:`, settingsData);

        const response = await request.put(ENV.API_BASE_URL + 'api/settings/security', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Security settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update security settings, status: ${response.status()}`);
            throw new Error(`Failed to update security settings with status: ${response.status()}`);
        }
    }

    async resetSettingsToDefault(request: APIRequestContext, module: string, userId: string) {
        logger.info(`Resetting settings to default for module: ${module}`);

        const response = await request.post(ENV.API_BASE_URL + `api/settings/reset/${module}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Settings reset to default successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to reset settings to default, status: ${response.status()}`);
            throw new Error(`Failed to reset settings to default with status: ${response.status()}`);
        }
    }
}
