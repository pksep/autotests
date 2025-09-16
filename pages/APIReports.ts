import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class ReportsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createReport(request: APIRequestContext, reportData: any, userId: string) {
        logger.info(`Creating report:`, reportData);

        const response = await request.post(ENV.API_BASE_URL + 'api/reports', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: reportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create report, status: ${response.status()}`);
            throw new Error(`Failed to create report with status: ${response.status()}`);
        }
    }

    async updateReport(request: APIRequestContext, reportData: any, userId: string) {
        logger.info(`Updating report:`, reportData);

        const response = await request.put(ENV.API_BASE_URL + 'api/reports', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: reportData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update report, status: ${response.status()}`);
            throw new Error(`Failed to update report with status: ${response.status()}`);
        }
    }

    async getReportById(request: APIRequestContext, reportId: string) {
        logger.info(`Getting report by ID: ${reportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/reports/${reportId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved report by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get report by ID, status: ${response.status()}`);
            throw new Error(`Failed to get report by ID with status: ${response.status()}`);
        }
    }

    async deleteReport(request: APIRequestContext, reportId: string, userId: string) {
        logger.info(`Deleting report with ID: ${reportId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/reports/${reportId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Report deleted successfully' };
            logger.info(`Report deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete report, status: ${response.status()}`);
            throw new Error(`Failed to delete report with status: ${response.status()}`);
        }
    }

    async getAllReports(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all reports with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/reports/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all reports`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all reports, status: ${response.status()}`);
            throw new Error(`Failed to get all reports with status: ${response.status()}`);
        }
    }

    async getReportsByType(request: APIRequestContext, reportType: string) {
        logger.info(`Getting reports by type: ${reportType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/reports/type/${reportType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved reports by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get reports by type, status: ${response.status()}`);
            throw new Error(`Failed to get reports by type with status: ${response.status()}`);
        }
    }

    async generateReport(request: APIRequestContext, reportId: string, generationData: any, userId: string) {
        logger.info(`Generating report with ID: ${reportId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/reports/${reportId}/generate`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: generationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report generated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to generate report, status: ${response.status()}`);
            throw new Error(`Failed to generate report with status: ${response.status()}`);
        }
    }

    async getReportStatus(request: APIRequestContext, reportId: string) {
        logger.info(`Getting report status for ID: ${reportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/reports/${reportId}/status`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved report status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get report status, status: ${response.status()}`);
            throw new Error(`Failed to get report status with status: ${response.status()}`);
        }
    }

    async downloadReport(request: APIRequestContext, reportId: string) {
        logger.info(`Downloading report with ID: ${reportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/reports/${reportId}/download`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report downloaded successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to download report, status: ${response.status()}`);
            throw new Error(`Failed to download report with status: ${response.status()}`);
        }
    }

    async scheduleReport(request: APIRequestContext, reportId: string, scheduleData: any, userId: string) {
        logger.info(`Scheduling report with ID: ${reportId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/reports/${reportId}/schedule`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report scheduled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to schedule report, status: ${response.status()}`);
            throw new Error(`Failed to schedule report with status: ${response.status()}`);
        }
    }

    async getReportSchedule(request: APIRequestContext, reportId: string) {
        logger.info(`Getting report schedule for ID: ${reportId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/reports/${reportId}/schedule`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved report schedule`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get report schedule, status: ${response.status()}`);
            throw new Error(`Failed to get report schedule with status: ${response.status()}`);
        }
    }

    async updateReportSchedule(request: APIRequestContext, reportId: string, scheduleData: any, userId: string) {
        logger.info(`Updating report schedule for ID: ${reportId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/reports/${reportId}/schedule`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Report schedule updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update report schedule, status: ${response.status()}`);
            throw new Error(`Failed to update report schedule with status: ${response.status()}`);
        }
    }

    async deleteReportSchedule(request: APIRequestContext, reportId: string, userId: string) {
        logger.info(`Deleting report schedule for ID: ${reportId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/reports/${reportId}/schedule`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Report schedule deleted successfully' };
            logger.info(`Report schedule deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete report schedule, status: ${response.status()}`);
            throw new Error(`Failed to delete report schedule with status: ${response.status()}`);
        }
    }
}
