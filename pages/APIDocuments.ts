import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class DocumentsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async attachFileToUser(request: APIRequestContext, userToUpdateId: number, fileId: number, unpin: boolean, userId: string) {
        logger.info(`Attaching file ${fileId} to user ${userToUpdateId}, unpin: ${unpin}`);

        const response = await request.post(ENV.API_BASE_URL + `api/users/files/${userToUpdateId}/${fileId}/${unpin}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File attached to user successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to attach file to user, status: ${response.status()}`);
            throw new Error(`Failed to attach file to user with status: ${response.status()}`);
        }
    }

    async getFileById(request: APIRequestContext, id: number, light: boolean) {
        logger.info(`Getting file by id: ${id}, light: ${light}`);

        const response = await request.get(ENV.API_BASE_URL + `api/documents/${id}/${light}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved file by id`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get file by id, status: ${response.status()}`);
            throw new Error(`Failed to get file by id with status: ${response.status()}`);
        }
    }

    async changeDocumentType(request: APIRequestContext, typeData: any, userId: string) {
        logger.info(`Changing document type:`, typeData);

        const response = await request.post(ENV.API_BASE_URL + 'api/documents/editype', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: typeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Document type changed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to change document type, status: ${response.status()}`);
            throw new Error(`Failed to change document type with status: ${response.status()}`);
        }
    }

    async deleteDocument(request: APIRequestContext, id: number, userId: string) {
        logger.info(`Deleting document with id: ${id}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/documents/documents/delete/${id}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            // Handle empty response for DELETE operations
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Document deleted successfully' };
            logger.info(`Document deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete document, status: ${response.status()}`);
            throw new Error(`Failed to delete document with status: ${response.status()}`);
        }
    }

    async setDetalForDocument(request: APIRequestContext, detalData: any, userId: string) {
        logger.info(`Setting detal for document:`, detalData);

        const response = await request.put(ENV.API_BASE_URL + 'api/documents/setdetal', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: detalData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Detal set for document successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to set detal for document, status: ${response.status()}`);
            throw new Error(`Failed to set detal for document with status: ${response.status()}`);
        }
    }

    async removeFileFromUser(request: APIRequestContext, userToUpdateId: number, fileId: number, userId: string) {
        logger.info(`Removing file ${fileId} from user ${userToUpdateId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/users/files/${userToUpdateId}/${fileId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            // Handle empty response for DELETE operations
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'File removed from user successfully' };
            logger.info(`File removed from user successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove file from user, status: ${response.status()}`);
            throw new Error(`Failed to remove file from user with status: ${response.status()}`);
        }
    }
}
