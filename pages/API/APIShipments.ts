import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ShipmentsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createShipment(request: APIRequestContext, shipmentData: any, userId: string) {
        logger.info(`Creating shipment with data:`, shipmentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/shipments', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: shipmentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Shipment created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create shipment, status: ${response.status()}`);
            throw new Error(`Failed to create shipment with status: ${response.status()}`);
        }
    }

    async updateShipment(request: APIRequestContext, shipmentData: any, userId: string) {
        logger.info(`Updating shipment with data:`, shipmentData);

        const response = await request.put(ENV.API_BASE_URL + 'api/shipments', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: shipmentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Shipment updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update shipment, status: ${response.status()}`);
            throw new Error(`Failed to update shipment with status: ${response.status()}`);
        }
    }

    async getShipmentById(request: APIRequestContext, id: number) {
        logger.info(`Getting shipment by ID: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/shipments/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved shipment by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get shipment by ID, status: ${response.status()}`);
            throw new Error(`Failed to get shipment by ID with status: ${response.status()}`);
        }
    }

    async deleteShipment(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting shipment with ID: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/shipments/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Shipment deleted successfully' };
            logger.info(`Shipment deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete shipment, status: ${response.status()}`);
            throw new Error(`Failed to delete shipment with status: ${response.status()}`);
        }
    }

    async getAllShipments(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all shipments with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/shipments/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all shipments`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all shipments, status: ${response.status()}`);
            throw new Error(`Failed to get all shipments with status: ${response.status()}`);
        }
    }

    async getShipmentsByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting shipments by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/shipments/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved shipments by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get shipments by status, status: ${response.status()}`);
            throw new Error(`Failed to get shipments by status with status: ${response.status()}`);
        }
    }

    async updateShipmentStatus(request: APIRequestContext, shipmentId: number, status: string, userId: string) {
        logger.info(`Updating shipment status - ID: ${shipmentId}, status: ${status}`);

        const response = await request.put(ENV.API_BASE_URL + `api/shipments/${shipmentId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { status }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Shipment status updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update shipment status, status: ${response.status()}`);
            throw new Error(`Failed to update shipment status with status: ${response.status()}`);
        }
    }

    async getShipmentItems(request: APIRequestContext, shipmentId: number) {
        logger.info(`Getting shipment items for ID: ${shipmentId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/shipments/${shipmentId}/items`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved shipment items`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get shipment items, status: ${response.status()}`);
            throw new Error(`Failed to get shipment items with status: ${response.status()}`);
        }
    }

    async addShipmentItem(request: APIRequestContext, shipmentId: number, itemData: any, userId: string) {
        logger.info(`Adding item to shipment ID: ${shipmentId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/shipments/${shipmentId}/items`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: itemData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Item added to shipment successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add item to shipment, status: ${response.status()}`);
            throw new Error(`Failed to add item to shipment with status: ${response.status()}`);
        }
    }

    async trackShipment(request: APIRequestContext, trackingNumber: string) {
        logger.info(`Tracking shipment with number: ${trackingNumber}`);

        const response = await request.get(ENV.API_BASE_URL + `api/shipments/track/${trackingNumber}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully tracked shipment`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to track shipment, status: ${response.status()}`);
            throw new Error(`Failed to track shipment with status: ${response.status()}`);
        }
    }
}
