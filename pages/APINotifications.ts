import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class NotificationsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createNotification(request: APIRequestContext, notificationData: any, userId: string) {
        logger.info(`Creating notification with data:`, notificationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/notifications', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: notificationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Notification created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create notification, status: ${response.status()}`);
            throw new Error(`Failed to create notification with status: ${response.status()}`);
        }
    }

    async updateNotification(request: APIRequestContext, notificationData: any, userId: string) {
        logger.info(`Updating notification with data:`, notificationData);

        const response = await request.put(ENV.API_BASE_URL + 'api/notifications', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: notificationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Notification updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update notification, status: ${response.status()}`);
            throw new Error(`Failed to update notification with status: ${response.status()}`);
        }
    }

    async getNotificationById(request: APIRequestContext, id: number) {
        logger.info(`Getting notification by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/notifications/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved notification by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get notification by ID, status: ${response.status()}`);
            throw new Error(`Failed to get notification by ID with status: ${response.status()}`);
        }
    }

    async deleteNotification(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting notification with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/notifications/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Notification deleted successfully' };
            logger.info(`Notification deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete notification, status: ${response.status()}`);
            throw new Error(`Failed to delete notification with status: ${response.status()}`);
        }
    }

    async getAllNotifications(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all notifications with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/notifications/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all notifications`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all notifications, status: ${response.status()}`);
            throw new Error(`Failed to get all notifications with status: ${response.status()}`);
        }
    }

    async getNotificationsByType(request: APIRequestContext, type: string) {
        logger.info(`Getting notifications by type: ${type}`);

        const response = await request.get(ENV.API_BASE_URL + `api/notifications/type/${type}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved notifications by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get notifications by type, status: ${response.status()}`);
            throw new Error(`Failed to get notifications by type with status: ${response.status()}`);
        }
    }

    async markNotificationAsRead(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Marking notification as read - ID: ${id}`);

        const response = await request.put(ENV.API_BASE_URL + `api/notifications/${id}/read`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { read: true }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Notification marked as read successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to mark notification as read, status: ${response.status()}`);
            throw new Error(`Failed to mark notification as read with status: ${response.status()}`);
        }
    }

    async markAllNotificationsAsRead(request: APIRequestContext, userId: string) {
        logger.info(`Marking all notifications as read for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + 'api/notifications/mark-all-read', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`All notifications marked as read successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to mark all notifications as read, status: ${response.status()}`);
            throw new Error(`Failed to mark all notifications as read with status: ${response.status()}`);
        }
    }

    async getUnreadNotificationsCount(request: APIRequestContext, userId: string) {
        logger.info(`Getting unread notifications count for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/notifications/unread-count/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved unread notifications count`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get unread notifications count, status: ${response.status()}`);
            throw new Error(`Failed to get unread notifications count with status: ${response.status()}`);
        }
    }

    async sendBulkNotification(request: APIRequestContext, notificationData: any, userId: string) {
        logger.info(`Sending bulk notification:`, notificationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/notifications/bulk', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: notificationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Bulk notification sent successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to send bulk notification, status: ${response.status()}`);
            throw new Error(`Failed to send bulk notification with status: ${response.status()}`);
        }
    }
}
