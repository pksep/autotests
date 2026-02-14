import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class TasksAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createTask(request: APIRequestContext, taskData: any, userId: string) {
        logger.info(`Creating task:`, taskData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tasks', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: taskData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Task created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create task, status: ${response.status()}`);
            throw new Error(`Failed to create task with status: ${response.status()}`);
        }
    }

    async updateTask(request: APIRequestContext, taskData: any, userId: string) {
        logger.info(`Updating task:`, taskData);

        const response = await request.put(ENV.API_BASE_URL + 'api/tasks', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: taskData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Task updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update task, status: ${response.status()}`);
            throw new Error(`Failed to update task with status: ${response.status()}`);
        }
    }

    async getTaskById(request: APIRequestContext, taskId: string) {
        logger.info(`Getting task by ID: ${taskId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/${taskId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved task by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get task by ID, status: ${response.status()}`);
            throw new Error(`Failed to get task by ID with status: ${response.status()}`);
        }
    }

    async deleteTask(request: APIRequestContext, taskId: string, userId: string) {
        logger.info(`Deleting task with ID: ${taskId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/tasks/${taskId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Task deleted successfully' };
            logger.info(`Task deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete task, status: ${response.status()}`);
            throw new Error(`Failed to delete task with status: ${response.status()}`);
        }
    }

    async getAllTasks(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all tasks with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/tasks/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all tasks`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all tasks, status: ${response.status()}`);
            throw new Error(`Failed to get all tasks with status: ${response.status()}`);
        }
    }

    async getTasksByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting tasks by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved tasks by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get tasks by status, status: ${response.status()}`);
            throw new Error(`Failed to get tasks by status with status: ${response.status()}`);
        }
    }

    async getTasksByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting tasks by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved tasks by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get tasks by user, status: ${response.status()}`);
            throw new Error(`Failed to get tasks by user with status: ${response.status()}`);
        }
    }

    async getTasksByPriority(request: APIRequestContext, priority: string) {
        logger.info(`Getting tasks by priority: ${priority}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/priority/${priority}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved tasks by priority`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get tasks by priority, status: ${response.status()}`);
            throw new Error(`Failed to get tasks by priority with status: ${response.status()}`);
        }
    }

    async updateTaskStatus(request: APIRequestContext, taskId: string, status: string, userId: string) {
        logger.info(`Updating task status - ID: ${taskId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/tasks/${taskId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Task status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update task status, status: ${response.status()}`);
            throw new Error(`Failed to update task status with status: ${response.status()}`);
        }
    }

    async assignTask(request: APIRequestContext, taskId: string, assigneeId: string, userId: string) {
        logger.info(`Assigning task ${taskId} to user ${assigneeId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/tasks/${taskId}/assign`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { assigneeId }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Task assigned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to assign task, status: ${response.status()}`);
            throw new Error(`Failed to assign task with status: ${response.status()}`);
        }
    }

    async addTaskComment(request: APIRequestContext, taskId: string, commentData: any, userId: string) {
        logger.info(`Adding comment to task ${taskId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/tasks/${taskId}/comments`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: commentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Comment added to task successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add comment to task, status: ${response.status()}`);
            throw new Error(`Failed to add comment to task with status: ${response.status()}`);
        }
    }

    async getTaskComments(request: APIRequestContext, taskId: string) {
        logger.info(`Getting comments for task ${taskId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/${taskId}/comments`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved task comments`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get task comments, status: ${response.status()}`);
            throw new Error(`Failed to get task comments with status: ${response.status()}`);
        }
    }

    async addTaskAttachment(request: APIRequestContext, taskId: string, attachmentData: any, userId: string) {
        logger.info(`Adding attachment to task ${taskId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/tasks/${taskId}/attachments`, {
            headers: {
                'user-id': userId
            },
            multipart: attachmentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Attachment added to task successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add attachment to task, status: ${response.status()}`);
            throw new Error(`Failed to add attachment to task with status: ${response.status()}`);
        }
    }

    async getTaskAttachments(request: APIRequestContext, taskId: string) {
        logger.info(`Getting attachments for task ${taskId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/tasks/${taskId}/attachments`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved task attachments`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get task attachments, status: ${response.status()}`);
            throw new Error(`Failed to get task attachments with status: ${response.status()}`);
        }
    }
}
