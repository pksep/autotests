import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class MaintenanceAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createMaintenanceSchedule(request: APIRequestContext, scheduleData: any, userId: string) {
        logger.info(`Creating maintenance schedule with data:`, scheduleData);

        const response = await request.post(ENV.API_BASE_URL + 'api/maintenance/schedules', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Maintenance schedule created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create maintenance schedule, status: ${response.status()}`);
            throw new Error(`Failed to create maintenance schedule with status: ${response.status()}`);
        }
    }

    async updateMaintenanceSchedule(request: APIRequestContext, scheduleData: any, userId: string) {
        logger.info(`Updating maintenance schedule with data:`, scheduleData);

        const response = await request.put(ENV.API_BASE_URL + 'api/maintenance/schedules', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: scheduleData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Maintenance schedule updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update maintenance schedule, status: ${response.status()}`);
            throw new Error(`Failed to update maintenance schedule with status: ${response.status()}`);
        }
    }

    async getMaintenanceScheduleById(request: APIRequestContext, id: number) {
        logger.info(`Getting maintenance schedule by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/maintenance/schedules/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved maintenance schedule by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get maintenance schedule by ID, status: ${response.status()}`);
            throw new Error(`Failed to get maintenance schedule by ID with status: ${response.status()}`);
        }
    }

    async deleteMaintenanceSchedule(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting maintenance schedule with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/maintenance/schedules/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Maintenance schedule deleted successfully' };
            logger.info(`Maintenance schedule deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete maintenance schedule, status: ${response.status()}`);
            throw new Error(`Failed to delete maintenance schedule with status: ${response.status()}`);
        }
    }

    async getAllMaintenanceSchedules(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all maintenance schedules with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/maintenance/schedules/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all maintenance schedules`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all maintenance schedules, status: ${response.status()}`);
            throw new Error(`Failed to get all maintenance schedules with status: ${response.status()}`);
        }
    }

    async getMaintenanceSchedulesByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting maintenance schedules by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/maintenance/schedules/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved maintenance schedules by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get maintenance schedules by status, status: ${response.status()}`);
            throw new Error(`Failed to get maintenance schedules by status with status: ${response.status()}`);
        }
    }

    async updateMaintenanceScheduleStatus(request: APIRequestContext, scheduleId: number, status: string, userId: string) {
        logger.info(`Updating maintenance schedule status - ID: ${scheduleId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/maintenance/schedules/${scheduleId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Maintenance schedule status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update maintenance schedule status, status: ${response.status()}`);
            throw new Error(`Failed to update maintenance schedule status with status: ${response.status()}`);
        }
    }

    async getMaintenanceScheduleTasks(request: APIRequestContext, scheduleId: number) {
        logger.info(`Getting maintenance schedule tasks for ID: ${scheduleId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/maintenance/schedules/${scheduleId}/tasks`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved maintenance schedule tasks`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get maintenance schedule tasks, status: ${response.status()}`);
            throw new Error(`Failed to get maintenance schedule tasks with status: ${response.status()}`);
        }
    }

    async addMaintenanceScheduleTask(request: APIRequestContext, scheduleId: number, taskData: any, userId: string) {
        logger.info(`Adding task to maintenance schedule ID: ${scheduleId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/maintenance/schedules/${scheduleId}/tasks`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: taskData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Task added to maintenance schedule successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add task to maintenance schedule, status: ${response.status()}`);
            throw new Error(`Failed to add task to maintenance schedule with status: ${response.status()}`);
        }
    }

    async getMaintenanceHistory(request: APIRequestContext, equipmentId: number) {
        logger.info(`Getting maintenance history for equipment ID: ${equipmentId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/maintenance/history/${equipmentId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved maintenance history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get maintenance history, status: ${response.status()}`);
            throw new Error(`Failed to get maintenance history with status: ${response.status()}`);
        }
    }
}
