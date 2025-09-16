import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class SearchAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async searchGlobal(request: APIRequestContext, searchData: any) {
        logger.info(`Performing global search:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/global', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully performed global search`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to perform global search, status: ${response.status()}`);
            throw new Error(`Failed to perform global search with status: ${response.status()}`);
        }
    }

    async searchUsers(request: APIRequestContext, searchData: any) {
        logger.info(`Searching users:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/users', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search users, status: ${response.status()}`);
            throw new Error(`Failed to search users with status: ${response.status()}`);
        }
    }

    async searchProducts(request: APIRequestContext, searchData: any) {
        logger.info(`Searching products:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/products', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched products`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search products, status: ${response.status()}`);
            throw new Error(`Failed to search products with status: ${response.status()}`);
        }
    }

    async searchOrders(request: APIRequestContext, searchData: any) {
        logger.info(`Searching orders:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/orders', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched orders`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search orders, status: ${response.status()}`);
            throw new Error(`Failed to search orders with status: ${response.status()}`);
        }
    }

    async searchInventory(request: APIRequestContext, searchData: any) {
        logger.info(`Searching inventory:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/inventory', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched inventory`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search inventory, status: ${response.status()}`);
            throw new Error(`Failed to search inventory with status: ${response.status()}`);
        }
    }

    async searchDocuments(request: APIRequestContext, searchData: any) {
        logger.info(`Searching documents:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/documents', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched documents`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search documents, status: ${response.status()}`);
            throw new Error(`Failed to search documents with status: ${response.status()}`);
        }
    }

    async searchTasks(request: APIRequestContext, searchData: any) {
        logger.info(`Searching tasks:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/tasks', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched tasks`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search tasks, status: ${response.status()}`);
            throw new Error(`Failed to search tasks with status: ${response.status()}`);
        }
    }

    async searchContacts(request: APIRequestContext, searchData: any) {
        logger.info(`Searching contacts:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/contacts', {
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

    async searchEquipment(request: APIRequestContext, searchData: any) {
        logger.info(`Searching equipment:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/equipment', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched equipment`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search equipment, status: ${response.status()}`);
            throw new Error(`Failed to search equipment with status: ${response.status()}`);
        }
    }

    async searchMaterials(request: APIRequestContext, searchData: any) {
        logger.info(`Searching materials:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/materials', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched materials`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search materials, status: ${response.status()}`);
            throw new Error(`Failed to search materials with status: ${response.status()}`);
        }
    }

    async getSearchSuggestions(request: APIRequestContext, query: string) {
        logger.info(`Getting search suggestions for query: ${query}`);

        const response = await request.get(ENV.API_BASE_URL + `api/search/suggestions?q=${encodeURIComponent(query)}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved search suggestions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get search suggestions, status: ${response.status()}`);
            throw new Error(`Failed to get search suggestions with status: ${response.status()}`);
        }
    }

    async getSearchHistory(request: APIRequestContext, userId: string) {
        logger.info(`Getting search history for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/search/history/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved search history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get search history, status: ${response.status()}`);
            throw new Error(`Failed to get search history with status: ${response.status()}`);
        }
    }

    async clearSearchHistory(request: APIRequestContext, userId: string) {
        logger.info(`Clearing search history for user: ${userId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/search/history/${userId}`);

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Search history cleared successfully' };
            logger.info(`Search history cleared successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to clear search history, status: ${response.status()}`);
            throw new Error(`Failed to clear search history with status: ${response.status()}`);
        }
    }

    async getSearchStatistics(request: APIRequestContext, statsData: any) {
        logger.info(`Getting search statistics:`, statsData);

        const response = await request.post(ENV.API_BASE_URL + 'api/search/statistics', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: statsData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved search statistics`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get search statistics, status: ${response.status()}`);
            throw new Error(`Failed to get search statistics with status: ${response.status()}`);
        }
    }
}
