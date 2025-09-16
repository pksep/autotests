import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class AnalyticsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getProductionAnalytics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting production analytics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/production', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved production analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get production analytics, status: ${response.status()}`);
            throw new Error(`Failed to get production analytics with status: ${response.status()}`);
        }
    }

    async getInventoryAnalytics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting inventory analytics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/inventory', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved inventory analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get inventory analytics, status: ${response.status()}`);
            throw new Error(`Failed to get inventory analytics with status: ${response.status()}`);
        }
    }

    async getQualityAnalytics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting quality analytics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/quality', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved quality analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get quality analytics, status: ${response.status()}`);
            throw new Error(`Failed to get quality analytics with status: ${response.status()}`);
        }
    }

    async getMaintenanceAnalytics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting maintenance analytics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/maintenance', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved maintenance analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get maintenance analytics, status: ${response.status()}`);
            throw new Error(`Failed to get maintenance analytics with status: ${response.status()}`);
        }
    }

    async getFinancialAnalytics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting financial analytics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/financial', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved financial analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get financial analytics, status: ${response.status()}`);
            throw new Error(`Failed to get financial analytics with status: ${response.status()}`);
        }
    }

    async getPerformanceMetrics(request: APIRequestContext, metricsData: any) {
        logger.info(`Getting performance metrics:`, metricsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/performance', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: metricsData
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

    async getKPIs(request: APIRequestContext, kpiData: any) {
        logger.info(`Getting KPIs:`, kpiData);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/kpis', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: kpiData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved KPIs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get KPIs, status: ${response.status()}`);
            throw new Error(`Failed to get KPIs with status: ${response.status()}`);
        }
    }

    async getTrendAnalysis(request: APIRequestContext, trendData: any) {
        logger.info(`Getting trend analysis:`, trendData);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/trends', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: trendData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved trend analysis`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get trend analysis, status: ${response.status()}`);
            throw new Error(`Failed to get trend analysis with status: ${response.status()}`);
        }
    }

    async exportAnalyticsReport(request: APIRequestContext, reportData: any) {
        logger.info(`Exporting analytics report:`, reportData);

        const response = await request.post(ENV.API_BASE_URL + 'api/analytics/export', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: reportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully exported analytics report`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export analytics report, status: ${response.status()}`);
            throw new Error(`Failed to export analytics report with status: ${response.status()}`);
        }
    }
}
