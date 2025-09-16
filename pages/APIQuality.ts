import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class QualityAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createQualityCheck(request: APIRequestContext, checkData: any, userId: string) {
        logger.info(`Creating quality check with data:`, checkData);

        const response = await request.post(ENV.API_BASE_URL + 'api/quality/checks', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: checkData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Quality check created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create quality check, status: ${response.status()}`);
            throw new Error(`Failed to create quality check with status: ${response.status()}`);
        }
    }

    async updateQualityCheck(request: APIRequestContext, checkData: any, userId: string) {
        logger.info(`Updating quality check with data:`, checkData);

        const response = await request.put(ENV.API_BASE_URL + 'api/quality/checks', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: checkData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Quality check updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update quality check, status: ${response.status()}`);
            throw new Error(`Failed to update quality check with status: ${response.status()}`);
        }
    }

    async getQualityCheckById(request: APIRequestContext, id: number) {
        logger.info(`Getting quality check by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/quality/checks/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved quality check by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get quality check by ID, status: ${response.status()}`);
            throw new Error(`Failed to get quality check by ID with status: ${response.status()}`);
        }
    }

    async deleteQualityCheck(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting quality check with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/quality/checks/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Quality check deleted successfully' };
            logger.info(`Quality check deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete quality check, status: ${response.status()}`);
            throw new Error(`Failed to delete quality check with status: ${response.status()}`);
        }
    }

    async getAllQualityChecks(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all quality checks with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/quality/checks/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all quality checks`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all quality checks, status: ${response.status()}`);
            throw new Error(`Failed to get all quality checks with status: ${response.status()}`);
        }
    }

    async getQualityChecksByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting quality checks by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/quality/checks/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved quality checks by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get quality checks by status, status: ${response.status()}`);
            throw new Error(`Failed to get quality checks by status with status: ${response.status()}`);
        }
    }

    async updateQualityCheckStatus(request: APIRequestContext, checkId: number, status: string, userId: string) {
        logger.info(`Updating quality check status - ID: ${checkId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/quality/checks/${checkId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Quality check status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update quality check status, status: ${response.status()}`);
            throw new Error(`Failed to update quality check status with status: ${response.status()}`);
        }
    }

    async getQualityCheckResults(request: APIRequestContext, checkId: number) {
        logger.info(`Getting quality check results for ID: ${checkId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/quality/checks/${checkId}/results`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved quality check results`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get quality check results, status: ${response.status()}`);
            throw new Error(`Failed to get quality check results with status: ${response.status()}`);
        }
    }

    async addQualityCheckResult(request: APIRequestContext, checkId: number, resultData: any, userId: string) {
        logger.info(`Adding result to quality check ID: ${checkId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/quality/checks/${checkId}/results`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: resultData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Result added to quality check successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add result to quality check, status: ${response.status()}`);
            throw new Error(`Failed to add result to quality check with status: ${response.status()}`);
        }
    }

    async getQualityMetrics(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting quality metrics for date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/quality/metrics', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved quality metrics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get quality metrics, status: ${response.status()}`);
            throw new Error(`Failed to get quality metrics with status: ${response.status()}`);
        }
    }
}
