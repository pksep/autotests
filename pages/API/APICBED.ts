import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class CBEDAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createCBED(request: APIRequestContext, cbedData: any, userId: string) {
        logger.info(`Creating CBED with data:`, cbedData);

        const response = await request.post(ENV.API_BASE_URL + 'api/cbed', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: cbedData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`CBED created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create CBED, status: ${response.status()}`);
            throw new Error(`Failed to create CBED with status: ${response.status()}`);
        }
    }

    async updateCBED(request: APIRequestContext, cbedData: any, userId: string) {
        logger.info(`Updating CBED with data:`, cbedData);

        const response = await request.put(ENV.API_BASE_URL + 'api/cbed', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: cbedData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`CBED updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update CBED, status: ${response.status()}`);
            throw new Error(`Failed to update CBED with status: ${response.status()}`);
        }
    }

    async attachFileToCBED(request: APIRequestContext, cbedId: number, fileId: number, userId: string) {
        logger.info(`Attaching file ${fileId} to CBED ${cbedId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/cbed/files/${cbedId}/${fileId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File attached to CBED successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to attach file to CBED, status: ${response.status()}`);
            throw new Error(`Failed to attach file to CBED with status: ${response.status()}`);
        }
    }

    async banCBED(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Banning CBED with id: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/cbed/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'CBED banned successfully' };
            logger.info(`CBED banned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to ban CBED, status: ${response.status()}`);
            throw new Error(`Failed to ban CBED with status: ${response.status()}`);
        }
    }

    async getOneCBED(request: APIRequestContext, id: number) {
        logger.info(`Getting CBED by id: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/cbed/${id}`);

        let responseData: any;
        try {
            responseData = await response.json();
        } catch {
            responseData = await response.text();
        }
        if (response.ok()) {
            logger.info(`Successfully retrieved CBED by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get CBED by ID, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async getOneCBEDSpecification(request: APIRequestContext, id: number, isFull: boolean) {
        logger.info(`Getting CBED specification by id: ${id}, isFull: ${isFull}`);

        const response = await request.get(ENV.API_BASE_URL + `api/cbed/one/spetification/${id}/${isFull}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved CBED specification`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get CBED specification, status: ${response.status()}`);
            throw new Error(`Failed to get CBED specification with status: ${response.status()}`);
        }
    }

    async getOneCBEDById(request: APIRequestContext, cbedData: any) {
        logger.info(`Getting CBED by ID:`, cbedData);

        const response = await request.post(ENV.API_BASE_URL + 'api/cbed/one', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: cbedData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved CBED by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get CBED by ID, status: ${response.status()}`);
            throw new Error(`Failed to get CBED by ID with status: ${response.status()}`);
        }
    }

    async getTechByCBEDId(request: APIRequestContext, id: number) {
        logger.info(`Getting tech process by CBED id: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/cbed/tech_by_id_cbed/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved tech process by CBED ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get tech process by CBED ID, status: ${response.status()}`);
            throw new Error(`Failed to get tech process by CBED ID with status: ${response.status()}`);
        }
    }

    /** Get all CBEDs with optional pagination. */
    async getAllCBED(request: APIRequestContext, full: boolean, page?: number, pageSize?: number) {
        logger.info(`Getting all CBEDs, full: ${full}, page: ${page}, pageSize: ${pageSize}`);

        const params = new URLSearchParams({ full: String(full) });
        if (page !== undefined) params.append('page', String(page));
        if (pageSize !== undefined) params.append('pageSize', String(pageSize));
        const query = params.toString();

        const response = await request.get(ENV.API_BASE_URL + 'api/cbed/list' + (query ? '?' + query : ''));

        let responseData: any;
        try {
            responseData = await response.json();
        } catch {
            responseData = await response.text();
        }
        if (response.ok()) {
            logger.info(`Successfully retrieved all CBEDs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all CBEDs, status: ${response.status()}`);
            return { status: response.status(), data: responseData };
        }
    }

    async getOneCBEDBelongs(request: APIRequestContext, id: number) {
        logger.info(`Getting CBED belongs by id: ${id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/cbed/belongs/${id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved CBED belongs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get CBED belongs, status: ${response.status()}`);
            throw new Error(`Failed to get CBED belongs with status: ${response.status()}`);
        }
    }

    async removeDocumentCBED(request: APIRequestContext, documentData: any) {
        logger.info(`Removing document from CBED:`, documentData);

        const response = await request.post(ENV.API_BASE_URL + 'api/cbed/removedocument', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: documentData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Document removed from CBED successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove document from CBED, status: ${response.status()}`);
            throw new Error(`Failed to remove document from CBED with status: ${response.status()}`);
        }
    }
}
