import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class CalendarAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createEvent(request: APIRequestContext, eventData: any, userId: string) {
        logger.info(`Creating calendar event:`, eventData);

        const response = await request.post(ENV.API_BASE_URL + 'api/calendar/events', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: eventData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Calendar event created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create calendar event, status: ${response.status()}`);
            throw new Error(`Failed to create calendar event with status: ${response.status()}`);
        }
    }

    async updateEvent(request: APIRequestContext, eventData: any, userId: string) {
        logger.info(`Updating calendar event:`, eventData);

        const response = await request.put(ENV.API_BASE_URL + 'api/calendar/events', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: eventData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Calendar event updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update calendar event, status: ${response.status()}`);
            throw new Error(`Failed to update calendar event with status: ${response.status()}`);
        }
    }

    async getEventById(request: APIRequestContext, eventId: string) {
        logger.info(`Getting calendar event by ID: ${eventId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/calendar/events/${eventId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved calendar event by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get calendar event by ID, status: ${response.status()}`);
            throw new Error(`Failed to get calendar event by ID with status: ${response.status()}`);
        }
    }

    async deleteEvent(request: APIRequestContext, eventId: string, userId: string) {
        logger.info(`Deleting calendar event with ID: ${eventId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/calendar/events/${eventId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Calendar event deleted successfully' };
            logger.info(`Calendar event deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete calendar event, status: ${response.status()}`);
            throw new Error(`Failed to delete calendar event with status: ${response.status()}`);
        }
    }

    async getAllEvents(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all calendar events with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/calendar/events/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all calendar events`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all calendar events, status: ${response.status()}`);
            throw new Error(`Failed to get all calendar events with status: ${response.status()}`);
        }
    }

    async getEventsByDateRange(request: APIRequestContext, dateRange: any) {
        logger.info(`Getting calendar events by date range:`, dateRange);

        const response = await request.post(ENV.API_BASE_URL + 'api/calendar/events/date-range', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: dateRange
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved calendar events by date range`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get calendar events by date range, status: ${response.status()}`);
            throw new Error(`Failed to get calendar events by date range with status: ${response.status()}`);
        }
    }

    async getEventsByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting calendar events by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/calendar/events/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved calendar events by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get calendar events by user, status: ${response.status()}`);
            throw new Error(`Failed to get calendar events by user with status: ${response.status()}`);
        }
    }

    async createRecurringEvent(request: APIRequestContext, eventData: any, userId: string) {
        logger.info(`Creating recurring calendar event:`, eventData);

        const response = await request.post(ENV.API_BASE_URL + 'api/calendar/events/recurring', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: eventData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Recurring calendar event created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create recurring calendar event, status: ${response.status()}`);
            throw new Error(`Failed to create recurring calendar event with status: ${response.status()}`);
        }
    }

    async updateRecurringEvent(request: APIRequestContext, eventData: any, userId: string) {
        logger.info(`Updating recurring calendar event:`, eventData);

        const response = await request.put(ENV.API_BASE_URL + 'api/calendar/events/recurring', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: eventData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Recurring calendar event updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update recurring calendar event, status: ${response.status()}`);
            throw new Error(`Failed to update recurring calendar event with status: ${response.status()}`);
        }
    }

    async deleteRecurringEvent(request: APIRequestContext, eventId: string, userId: string) {
        logger.info(`Deleting recurring calendar event with ID: ${eventId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/calendar/events/recurring/${eventId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Recurring calendar event deleted successfully' };
            logger.info(`Recurring calendar event deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete recurring calendar event, status: ${response.status()}`);
            throw new Error(`Failed to delete recurring calendar event with status: ${response.status()}`);
        }
    }

    async getCalendarSettings(request: APIRequestContext, userId: string) {
        logger.info(`Getting calendar settings for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/calendar/settings/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved calendar settings`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get calendar settings, status: ${response.status()}`);
            throw new Error(`Failed to get calendar settings with status: ${response.status()}`);
        }
    }

    async updateCalendarSettings(request: APIRequestContext, userId: string, settingsData: any) {
        logger.info(`Updating calendar settings for user: ${userId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/calendar/settings/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: settingsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Calendar settings updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update calendar settings, status: ${response.status()}`);
            throw new Error(`Failed to update calendar settings with status: ${response.status()}`);
        }
    }
}
