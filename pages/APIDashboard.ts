import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class DashboardAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async getDashboardData(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard data for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard data`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard data, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard data with status: ${response.status()}`);
        }
    }

    async getDashboardWidgets(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard widgets for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/widgets`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard widgets`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard widgets, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard widgets with status: ${response.status()}`);
        }
    }

    async createDashboardWidget(request: APIRequestContext, widgetData: any, userId: string) {
        logger.info(`Creating dashboard widget:`, widgetData);

        const response = await request.post(ENV.API_BASE_URL + 'api/dashboard/widgets', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: widgetData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Dashboard widget created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create dashboard widget, status: ${response.status()}`);
            throw new Error(`Failed to create dashboard widget with status: ${response.status()}`);
        }
    }

    async updateDashboardWidget(request: APIRequestContext, widgetData: any, userId: string) {
        logger.info(`Updating dashboard widget:`, widgetData);

        const response = await request.put(ENV.API_BASE_URL + 'api/dashboard/widgets', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: widgetData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Dashboard widget updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update dashboard widget, status: ${response.status()}`);
            throw new Error(`Failed to update dashboard widget with status: ${response.status()}`);
        }
    }

    async deleteDashboardWidget(request: APIRequestContext, widgetId: string, userId: string) {
        logger.info(`Deleting dashboard widget with ID: ${widgetId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/dashboard/widgets/${widgetId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Dashboard widget deleted successfully' };
            logger.info(`Dashboard widget deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete dashboard widget, status: ${response.status()}`);
            throw new Error(`Failed to delete dashboard widget with status: ${response.status()}`);
        }
    }

    async getDashboardLayout(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard layout for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/layout`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard layout`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard layout, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard layout with status: ${response.status()}`);
        }
    }

    async updateDashboardLayout(request: APIRequestContext, userId: string, layoutData: any) {
        logger.info(`Updating dashboard layout for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/dashboard/${userId}/layout`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: layoutData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Dashboard layout updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update dashboard layout, status: ${response.status()}`);
            throw new Error(`Failed to update dashboard layout with status: ${response.status()}`);
        }
    }

    async getDashboardSettings(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard settings for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/settings`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard settings, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard settings with status: ${response.status()}`);
        }
    }

    async updateDashboardSettings(request: APIRequestContext, userId: string, settingsData: any) {
        logger.info(`Updating dashboard settings for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/dashboard/${userId}/settings`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Dashboard settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update dashboard settings, status: ${response.status()}`);
            throw new Error(`Failed to update dashboard settings with status: ${response.status()}`);
        }
    }

    async getDashboardAnalytics(request: APIRequestContext, userId: string, analyticsData: any) {
        logger.info(`Getting dashboard analytics for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/dashboard/${userId}/analytics`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: analyticsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard analytics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard analytics, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard analytics with status: ${response.status()}`);
        }
    }

    async getDashboardKPIs(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard KPIs for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/kpis`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard KPIs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard KPIs, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard KPIs with status: ${response.status()}`);
        }
    }

    async getDashboardNotifications(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard notifications for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/notifications`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard notifications`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard notifications, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard notifications with status: ${response.status()}`);
        }
    }

    async getDashboardRecentActivity(request: APIRequestContext, userId: string) {
        logger.info(`Getting dashboard recent activity for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/dashboard/${userId}/recent-activity`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved dashboard recent activity`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get dashboard recent activity, status: ${response.status()}`);
            throw new Error(`Failed to get dashboard recent activity with status: ${response.status()}`);
        }
    }

    async resetDashboardToDefault(request: APIRequestContext, userId: string) {
        logger.info(`Resetting dashboard to default for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/dashboard/${userId}/reset`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Dashboard reset to default successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to reset dashboard to default, status: ${response.status()}`);
            throw new Error(`Failed to reset dashboard to default with status: ${response.status()}`);
        }
    }
}
