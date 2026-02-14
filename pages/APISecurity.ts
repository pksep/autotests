import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class SecurityAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async changePassword(request: APIRequestContext, passwordData: any, userId: string) {
        logger.info(`Changing password for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/change-password', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: passwordData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Password changed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to change password, status: ${response.status()}`);
            throw new Error(`Failed to change password with status: ${response.status()}`);
        }
    }

    async resetPassword(request: APIRequestContext, resetData: any) {
        logger.info(`Resetting password:`, resetData);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/reset-password', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: resetData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Password reset successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to reset password, status: ${response.status()}`);
            throw new Error(`Failed to reset password with status: ${response.status()}`);
        }
    }

    async enableTwoFactor(request: APIRequestContext, userId: string) {
        logger.info(`Enabling two-factor authentication for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/2fa/enable', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Two-factor authentication enabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to enable two-factor authentication, status: ${response.status()}`);
            throw new Error(`Failed to enable two-factor authentication with status: ${response.status()}`);
        }
    }

    async disableTwoFactor(request: APIRequestContext, userId: string) {
        logger.info(`Disabling two-factor authentication for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/2fa/disable', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Two-factor authentication disabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to disable two-factor authentication, status: ${response.status()}`);
            throw new Error(`Failed to disable two-factor authentication with status: ${response.status()}`);
        }
    }

    async verifyTwoFactor(request: APIRequestContext, verificationData: any, userId: string) {
        logger.info(`Verifying two-factor authentication for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/2fa/verify', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: verificationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Two-factor authentication verified successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to verify two-factor authentication, status: ${response.status()}`);
            throw new Error(`Failed to verify two-factor authentication with status: ${response.status()}`);
        }
    }

    async getSecurityLogs(request: APIRequestContext, logData: any) {
        logger.info(`Getting security logs:`, logData);

        const response = await request.post(ENV.API_BASE_URL + 'api/security/logs', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: logData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved security logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get security logs, status: ${response.status()}`);
            throw new Error(`Failed to get security logs with status: ${response.status()}`);
        }
    }

    async getActiveSessions(request: APIRequestContext, userId: string) {
        logger.info(`Getting active sessions for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/security/sessions/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved active sessions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get active sessions, status: ${response.status()}`);
            throw new Error(`Failed to get active sessions with status: ${response.status()}`);
        }
    }

    async terminateSession(request: APIRequestContext, sessionId: string, userId: string) {
        logger.info(`Terminating session: ${sessionId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/security/sessions/${sessionId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Session terminated successfully' };
            logger.info(`Session terminated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to terminate session, status: ${response.status()}`);
            throw new Error(`Failed to terminate session with status: ${response.status()}`);
        }
    }

    async terminateAllSessions(request: APIRequestContext, userId: string) {
        logger.info(`Terminating all sessions for user: ${userId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/security/sessions/all/${userId}`);

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'All sessions terminated successfully' };
            logger.info(`All sessions terminated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to terminate all sessions, status: ${response.status()}`);
            throw new Error(`Failed to terminate all sessions with status: ${response.status()}`);
        }
    }

    async getSecuritySettings(request: APIRequestContext) {
        logger.info(`Getting security settings`);

        const response = await request.get(ENV.API_BASE_URL + 'api/security/settings');

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

        const response = await request.put(ENV.API_BASE_URL + 'api/security/settings', {
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
}
