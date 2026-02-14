import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class SchedulingAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createSchedule(request: APIRequestContext, scheduleData: any, userId: string) {
        logger.info(`Creating schedule:`, scheduleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/scheduling/schedules', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create schedule, status: ${response.status()}`);
            throw new Error(`Failed to create schedule with status: ${response.status()}`);
        }
    }

    async updateSchedule(request: APIRequestContext, scheduleData: any, userId: string) {
        logger.info(`Updating schedule:`, scheduleData);

        const response = await request.put(ENV.API_BASE_URL + 'api/scheduling/schedules', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update schedule, status: ${response.status()}`);
            throw new Error(`Failed to update schedule with status: ${response.status()}`);
        }
    }

    async getScheduleById(request: APIRequestContext, scheduleId: string) {
        logger.info(`Getting schedule by ID: ${scheduleId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedule by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedule by ID, status: ${response.status()}`);
            throw new Error(`Failed to get schedule by ID with status: ${response.status()}`);
        }
    }

    async deleteSchedule(request: APIRequestContext, scheduleId: string, userId: string) {
        logger.info(`Deleting schedule with ID: ${scheduleId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Schedule deleted successfully' };
            logger.info(`Schedule deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete schedule, status: ${response.status()}`);
            throw new Error(`Failed to delete schedule with status: ${response.status()}`);
        }
    }

    async getAllSchedules(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all schedules with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/scheduling/schedules/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all schedules`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all schedules, status: ${response.status()}`);
            throw new Error(`Failed to get all schedules with status: ${response.status()}`);
        }
    }

    async getSchedulesByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting schedules by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/schedules/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedules by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedules by status, status: ${response.status()}`);
            throw new Error(`Failed to get schedules by status with status: ${response.status()}`);
        }
    }

    async getSchedulesByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting schedules by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/schedules/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedules by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedules by user, status: ${response.status()}`);
            throw new Error(`Failed to get schedules by user with status: ${response.status()}`);
        }
    }

    async enableSchedule(request: APIRequestContext, scheduleId: string, userId: string) {
        logger.info(`Enabling schedule with ID: ${scheduleId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}/enable`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule enabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to enable schedule, status: ${response.status()}`);
            throw new Error(`Failed to enable schedule with status: ${response.status()}`);
        }
    }

    async disableSchedule(request: APIRequestContext, scheduleId: string, userId: string) {
        logger.info(`Disabling schedule with ID: ${scheduleId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}/disable`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule disabled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to disable schedule, status: ${response.status()}`);
            throw new Error(`Failed to disable schedule with status: ${response.status()}`);
        }
    }

    async executeScheduleNow(request: APIRequestContext, scheduleId: string, userId: string) {
        logger.info(`Executing schedule now with ID: ${scheduleId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}/execute-now`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule executed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to execute schedule, status: ${response.status()}`);
            throw new Error(`Failed to execute schedule with status: ${response.status()}`);
        }
    }

    async getScheduleExecutions(request: APIRequestContext, scheduleId: string, paginationData: any) {
        logger.info(`Getting schedule executions for schedule: ${scheduleId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}/executions`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedule executions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedule executions, status: ${response.status()}`);
            throw new Error(`Failed to get schedule executions with status: ${response.status()}`);
        }
    }

    async getScheduleExecutionById(request: APIRequestContext, executionId: string) {
        logger.info(`Getting schedule execution by ID: ${executionId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/executions/${executionId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedule execution by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedule execution by ID, status: ${response.status()}`);
            throw new Error(`Failed to get schedule execution by ID with status: ${response.status()}`);
        }
    }

    async cancelScheduleExecution(request: APIRequestContext, executionId: string, userId: string) {
        logger.info(`Cancelling schedule execution with ID: ${executionId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/scheduling/executions/${executionId}/cancel`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule execution cancelled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to cancel schedule execution, status: ${response.status()}`);
            throw new Error(`Failed to cancel schedule execution with status: ${response.status()}`);
        }
    }

    async getScheduleLogs(request: APIRequestContext, executionId: string) {
        logger.info(`Getting schedule logs for execution: ${executionId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/executions/${executionId}/logs`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedule logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedule logs, status: ${response.status()}`);
            throw new Error(`Failed to get schedule logs with status: ${response.status()}`);
        }
    }

    async validateSchedule(request: APIRequestContext, scheduleData: any) {
        logger.info(`Validating schedule:`, scheduleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/scheduling/schedules/validate', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Schedule validated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate schedule, status: ${response.status()}`);
            throw new Error(`Failed to validate schedule with status: ${response.status()}`);
        }
    }

    async getScheduleStatistics(request: APIRequestContext, scheduleId: string) {
        logger.info(`Getting schedule statistics for ID: ${scheduleId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/scheduling/schedules/${scheduleId}/statistics`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved schedule statistics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get schedule statistics, status: ${response.status()}`);
            throw new Error(`Failed to get schedule statistics with status: ${response.status()}`);
        }
    }
}
