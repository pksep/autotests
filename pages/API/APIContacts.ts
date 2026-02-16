import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ContactsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createContact(request: APIRequestContext, contactData: any, userId: string) {
        logger.info(`Creating contact with data:`, contactData);

        const response = await request.post(ENV.API_BASE_URL + 'api/contacts', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: contactData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Contact created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create contact, status: ${response.status()}`);
            throw new Error(`Failed to create contact with status: ${response.status()}`);
        }
    }

    async updateContact(request: APIRequestContext, id: number, contactData: any, userId: string) {
        logger.info(`Updating contact with ID: ${id}`);

        const response = await request.put(ENV.API_BASE_URL + `api/contacts/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: contactData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Contact updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update contact, status: ${response.status()}`);
            throw new Error(`Failed to update contact with status: ${response.status()}`);
        }
    }

    async getContactById(request: APIRequestContext, id: number) {
        logger.info(`Getting contact by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/contacts/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved contact by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get contact by ID, status: ${response.status()}`);
            throw new Error(`Failed to get contact by ID with status: ${response.status()}`);
        }
    }

    async banContactsBulk(request: APIRequestContext, contactIds: number[], userId: string) {
        logger.info(`Banning contacts bulk:`, contactIds);

        const response = await request.delete(ENV.API_BASE_URL + `api/contacts/bulk/${contactIds.join(',')}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Contacts banned successfully' };
            logger.info(`Contacts banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban contacts bulk, status: ${response.status()}`);
            throw new Error(`Failed to ban contacts bulk with status: ${response.status()}`);
        }
    }

    async getContactInclude(request: APIRequestContext, includeData: any) {
        logger.info(`Getting contact include:`, includeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/contacts/include', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: includeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved contact include`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get contact include, status: ${response.status()}`);
            throw new Error(`Failed to get contact include with status: ${response.status()}`);
        }
    }

    async getAllContacts(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all contacts with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/contacts/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all contacts`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all contacts, status: ${response.status()}`);
            throw new Error(`Failed to get all contacts with status: ${response.status()}`);
        }
    }

    async searchContacts(request: APIRequestContext, searchData: any) {
        logger.info(`Searching contacts:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/contacts/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched contacts`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search contacts, status: ${response.status()}`);
            throw new Error(`Failed to search contacts with status: ${response.status()}`);
        }
    }

    async getContactTypes(request: APIRequestContext) {
        logger.info(`Getting contact types`);

        const response = await request.get(ENV.API_BASE_URL + 'api/contacts/types');

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved contact types`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get contact types, status: ${response.status()}`);
            throw new Error(`Failed to get contact types with status: ${response.status()}`);
        }
    }
}
