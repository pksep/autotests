import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class AuditAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getAuditLogs(request: APIRequestContext, auditData: any) {
        logger.info(`Getting audit logs:`, auditData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/logs', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: auditData
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

    async getAuditLogById(request: APIRequestContext, auditId: string) {
        logger.info(`Getting audit log by ID: ${auditId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/audit/logs/${auditId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit log by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit log by ID, status: ${response.status()}`);
            throw new Error(`Failed to get audit log by ID with status: ${response.status()}`);
        }
    }

    async getAuditLogsByUser(request: APIRequestContext, userId: string, auditData: any) {
        logger.info(`Getting audit logs by user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/audit/logs/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: auditData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit logs by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit logs by user, status: ${response.status()}`);
            throw new Error(`Failed to get audit logs by user with status: ${response.status()}`);
        }
    }

    async getAuditLogsByAction(request: APIRequestContext, action: string, auditData: any) {
        logger.info(`Getting audit logs by action: ${action}`);

        const response = await request.post(ENV.API_BASE_URL + `api/audit/logs/action/${action}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: auditData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit logs by action`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit logs by action, status: ${response.status()}`);
            throw new Error(`Failed to get audit logs by action with status: ${response.status()}`);
        }
    }

    async getAuditLogsByResource(request: APIRequestContext, resource: string, auditData: any) {
        logger.info(`Getting audit logs by resource: ${resource}`);

        const response = await request.post(ENV.API_BASE_URL + `api/audit/logs/resource/${resource}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: auditData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit logs by resource`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit logs by resource, status: ${response.status()}`);
            throw new Error(`Failed to get audit logs by resource with status: ${response.status()}`);
        }
    }

    async getAuditLogsByDateRange(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting audit logs by date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/logs/date-range', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit logs by date range`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit logs by date range, status: ${response.status()}`);
            throw new Error(`Failed to get audit logs by date range with status: ${response.status()}`);
        }
    }

    async exportAuditLogs(request: APIRequestContext, exportData: any) {
        logger.info(`Exporting audit logs:`, exportData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/logs/export', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: exportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully exported audit logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export audit logs, status: ${response.status()}`);
            throw new Error(`Failed to export audit logs with status: ${response.status()}`);
        }
    }

    async getAuditStatistics(request: APIRequestContext, statsData: any) {
        logger.info(`Getting audit statistics:`, statsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/statistics', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: statsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit statistics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit statistics, status: ${response.status()}`);
            throw new Error(`Failed to get audit statistics with status: ${response.status()}`);
        }
    }

    async getAuditDashboard(request: APIRequestContext, dashboardData: any) {
        logger.info(`Getting audit dashboard:`, dashboardData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/dashboard', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dashboardData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved audit dashboard`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get audit dashboard, status: ${response.status()}`);
            throw new Error(`Failed to get audit dashboard with status: ${response.status()}`);
        }
    }

    async createAuditRule(request: APIRequestContext, ruleData: any, userId: string) {
        logger.info(`Creating audit rule:`, ruleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/rules', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: ruleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Audit rule created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create audit rule, status: ${response.status()}`);
            throw new Error(`Failed to create audit rule with status: ${response.status()}`);
        }
    }

    async updateAuditRule(request: APIRequestContext, ruleId: string, ruleData: any, userId: string) {
        logger.info(`Updating audit rule with ID: ${ruleId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/audit/rules/${ruleId}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: ruleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Audit rule updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update audit rule, status: ${response.status()}`);
            throw new Error(`Failed to update audit rule with status: ${response.status()}`);
        }
    }

    async deleteAuditRule(request: APIRequestContext, ruleId: string, userId: string) {
        logger.info(`Deleting audit rule with ID: ${ruleId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/audit/rules/${ruleId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Audit rule deleted successfully' };
            logger.info(`Audit rule deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete audit rule, status: ${response.status()}`);
            throw new Error(`Failed to delete audit rule with status: ${response.status()}`);
        }
    }

    async getAllAuditRules(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all audit rules with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/audit/rules/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all audit rules`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all audit rules, status: ${response.status()}`);
            throw new Error(`Failed to get all audit rules with status: ${response.status()}`);
        }
    }
}
