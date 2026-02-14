import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class MonitoringAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getSystemHealth(request: APIRequestContext) {
        logger.info(`Getting system health status`);

        const response = await request.get(ENV.API_BASE_URL + 'api/monitoring/health');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved system health status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get system health status, status: ${response.status()}`);
            throw new Error(`Failed to get system health status with status: ${response.status()}`);
        }
    }

    async getSystemMetrics(request: APIRequestContext, metricsData: any) {
        logger.info(`Getting system metrics:`, metricsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/metrics', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: metricsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved system metrics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get system metrics, status: ${response.status()}`);
            throw new Error(`Failed to get system metrics with status: ${response.status()}`);
        }
    }

    async getPerformanceMetrics(request: APIRequestContext, performanceData: any) {
        logger.info(`Getting performance metrics:`, performanceData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/performance', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: performanceData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved performance metrics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get performance metrics, status: ${response.status()}`);
            throw new Error(`Failed to get performance metrics with status: ${response.status()}`);
        }
    }

    async getResourceUsage(request: APIRequestContext, resourceData: any) {
        logger.info(`Getting resource usage:`, resourceData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/resources', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: resourceData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved resource usage`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get resource usage, status: ${response.status()}`);
            throw new Error(`Failed to get resource usage with status: ${response.status()}`);
        }
    }

    async getAlerts(request: APIRequestContext, alertData: any) {
        logger.info(`Getting alerts:`, alertData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/alerts', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: alertData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved alerts`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get alerts, status: ${response.status()}`);
            throw new Error(`Failed to get alerts with status: ${response.status()}`);
        }
    }

    async createAlert(request: APIRequestContext, alertData: any, userId: string) {
        logger.info(`Creating alert:`, alertData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/alerts/create', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: alertData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Alert created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create alert, status: ${response.status()}`);
            throw new Error(`Failed to create alert with status: ${response.status()}`);
        }
    }

    async updateAlert(request: APIRequestContext, alertId: string, alertData: any, userId: string) {
        logger.info(`Updating alert with ID: ${alertId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/monitoring/alerts/${alertId}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: alertData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Alert updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update alert, status: ${response.status()}`);
            throw new Error(`Failed to update alert with status: ${response.status()}`);
        }
    }

    async deleteAlert(request: APIRequestContext, alertId: string, userId: string) {
        logger.info(`Deleting alert with ID: ${alertId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/monitoring/alerts/${alertId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Alert deleted successfully' };
            logger.info(`Alert deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete alert, status: ${response.status()}`);
            throw new Error(`Failed to delete alert with status: ${response.status()}`);
        }
    }

    async getAlertHistory(request: APIRequestContext, alertId: string) {
        logger.info(`Getting alert history for ID: ${alertId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/monitoring/alerts/${alertId}/history`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved alert history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get alert history, status: ${response.status()}`);
            throw new Error(`Failed to get alert history with status: ${response.status()}`);
        }
    }

    async acknowledgeAlert(request: APIRequestContext, alertId: string, userId: string) {
        logger.info(`Acknowledging alert with ID: ${alertId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/monitoring/alerts/${alertId}/acknowledge`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Alert acknowledged successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to acknowledge alert, status: ${response.status()}`);
            throw new Error(`Failed to acknowledge alert with status: ${response.status()}`);
        }
    }

    async getDashboardData(request: APIRequestContext, dashboardData: any) {
        logger.info(`Getting dashboard data:`, dashboardData);

        const response = await request.post(ENV.API_BASE_URL + 'api/monitoring/dashboard', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dashboardData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard data`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard data, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard data with status: ${response.status()}`);
        }
    }
}
