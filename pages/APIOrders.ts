import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class OrdersAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createOrder(request: APIRequestContext, orderData: any, userId: string) {
        logger.info(`Creating order with data:`, orderData);

        const response = await request.post(ENV.API_BASE_URL + 'api/orders', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: orderData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Order created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create order, status: ${response.status()}`);
            throw new Error(`Failed to create order with status: ${response.status()}`);
        }
    }

    async updateOrder(request: APIRequestContext, orderData: any, userId: string) {
        logger.info(`Updating order with data:`, orderData);

        const response = await request.put(ENV.API_BASE_URL + 'api/orders', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: orderData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Order updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update order, status: ${response.status()}`);
            throw new Error(`Failed to update order with status: ${response.status()}`);
        }
    }

    async getOrderById(request: APIRequestContext, id: number) {
        logger.info(`Getting order by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/orders/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved order by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get order by ID, status: ${response.status()}`);
            throw new Error(`Failed to get order by ID with status: ${response.status()}`);
        }
    }

    async deleteOrder(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting order with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/orders/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Order deleted successfully' };
            logger.info(`Order deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete order, status: ${response.status()}`);
            throw new Error(`Failed to delete order with status: ${response.status()}`);
        }
    }

    async getAllOrders(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all orders with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/orders/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all orders`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all orders, status: ${response.status()}`);
            throw new Error(`Failed to get all orders with status: ${response.status()}`);
        }
    }

    async getOrdersByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting orders by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/orders/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved orders by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get orders by status, status: ${response.status()}`);
            throw new Error(`Failed to get orders by status with status: ${response.status()}`);
        }
    }

    async updateOrderStatus(request: APIRequestContext, orderId: number, status: string, userId: string) {
        logger.info(`Updating order status - ID: ${orderId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/orders/${orderId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Order status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update order status, status: ${response.status()}`);
            throw new Error(`Failed to update order status with status: ${response.status()}`);
        }
    }

    async getOrderItems(request: APIRequestContext, orderId: number) {
        logger.info(`Getting order items for ID: ${orderId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/orders/${orderId}/items`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved order items`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get order items, status: ${response.status()}`);
            throw new Error(`Failed to get order items with status: ${response.status()}`);
        }
    }

    async addOrderItem(request: APIRequestContext, orderId: number, itemData: any, userId: string) {
        logger.info(`Adding item to order ID: ${orderId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/orders/${orderId}/items`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: itemData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Item added to order successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add item to order, status: ${response.status()}`);
            throw new Error(`Failed to add item to order with status: ${response.status()}`);
        }
    }
}
