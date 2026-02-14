import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class ManufacturingAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createManufacturingOrder(request: APIRequestContext, orderData: any, userId: string) {
        logger.info(`Creating manufacturing order with data:`, orderData);

        const response = await request.post(ENV.API_BASE_URL + 'api/manufacturing/orders', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: orderData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Manufacturing order created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create manufacturing order, status: ${response.status()}`);
            throw new Error(`Failed to create manufacturing order with status: ${response.status()}`);
        }
    }

    async updateManufacturingOrder(request: APIRequestContext, orderData: any, userId: string) {
        logger.info(`Updating manufacturing order with data:`, orderData);

        const response = await request.put(ENV.API_BASE_URL + 'api/manufacturing/orders', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: orderData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Manufacturing order updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update manufacturing order, status: ${response.status()}`);
            throw new Error(`Failed to update manufacturing order with status: ${response.status()}`);
        }
    }

    async getManufacturingOrderById(request: APIRequestContext, id: number) {
        logger.info(`Getting manufacturing order by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/manufacturing/orders/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved manufacturing order by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get manufacturing order by ID, status: ${response.status()}`);
            throw new Error(`Failed to get manufacturing order by ID with status: ${response.status()}`);
        }
    }

    async deleteManufacturingOrder(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting manufacturing order with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/manufacturing/orders/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Manufacturing order deleted successfully' };
            logger.info(`Manufacturing order deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete manufacturing order, status: ${response.status()}`);
            throw new Error(`Failed to delete manufacturing order with status: ${response.status()}`);
        }
    }

    async getAllManufacturingOrders(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all manufacturing orders with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/manufacturing/orders/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all manufacturing orders`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all manufacturing orders, status: ${response.status()}`);
            throw new Error(`Failed to get all manufacturing orders with status: ${response.status()}`);
        }
    }

    async getManufacturingOrdersByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting manufacturing orders by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/manufacturing/orders/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved manufacturing orders by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get manufacturing orders by status, status: ${response.status()}`);
            throw new Error(`Failed to get manufacturing orders by status with status: ${response.status()}`);
        }
    }

    async updateManufacturingOrderStatus(request: APIRequestContext, orderId: number, status: string, userId: string) {
        logger.info(`Updating manufacturing order status - ID: ${orderId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/manufacturing/orders/${orderId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Manufacturing order status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update manufacturing order status, status: ${response.status()}`);
            throw new Error(`Failed to update manufacturing order status with status: ${response.status()}`);
        }
    }

    async getManufacturingOrderItems(request: APIRequestContext, orderId: number) {
        logger.info(`Getting manufacturing order items for ID: ${orderId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/manufacturing/orders/${orderId}/items`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved manufacturing order items`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get manufacturing order items, status: ${response.status()}`);
            throw new Error(`Failed to get manufacturing order items with status: ${response.status()}`);
        }
    }

    async addManufacturingOrderItem(request: APIRequestContext, orderId: number, itemData: any, userId: string) {
        logger.info(`Adding item to manufacturing order ID: ${orderId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/manufacturing/orders/${orderId}/items`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: itemData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Item added to manufacturing order successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add item to manufacturing order, status: ${response.status()}`);
            throw new Error(`Failed to add item to manufacturing order with status: ${response.status()}`);
        }
    }

    async getManufacturingProgress(request: APIRequestContext, orderId: number) {
        logger.info(`Getting manufacturing progress for order ID: ${orderId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/manufacturing/orders/${orderId}/progress`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved manufacturing progress`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get manufacturing progress, status: ${response.status()}`);
            throw new Error(`Failed to get manufacturing progress with status: ${response.status()}`);
        }
    }
}
