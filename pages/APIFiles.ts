import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class FilesAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async uploadFile(request: APIRequestContext, fileData: any, userId: string) {
        logger.info(`Uploading file:`, fileData);

        const response = await request.post(ENV.API_BASE_URL + 'api/files/upload', {
            headers: {
                'user-id': userId
            },
            multipart: fileData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File uploaded successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to upload file, status: ${response.status()}`);
            throw new Error(`Failed to upload file with status: ${response.status()}`);
        }
    }

    async downloadFile(request: APIRequestContext, fileId: string) {
        logger.info(`Downloading file with ID: ${fileId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/files/download/${fileId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File downloaded successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to download file, status: ${response.status()}`);
            throw new Error(`Failed to download file with status: ${response.status()}`);
        }
    }

    async getFileById(request: APIRequestContext, fileId: string) {
        logger.info(`Getting file by ID: ${fileId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/files/${fileId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved file by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get file by ID, status: ${response.status()}`);
            throw new Error(`Failed to get file by ID with status: ${response.status()}`);
        }
    }

    async deleteFile(request: APIRequestContext, fileId: string, userId: string) {
        logger.info(`Deleting file with ID: ${fileId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/files/${fileId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'File deleted successfully' };
            logger.info(`File deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete file, status: ${response.status()}`);
            throw new Error(`Failed to delete file with status: ${response.status()}`);
        }
    }

    async getAllFiles(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all files with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/files/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all files`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all files, status: ${response.status()}`);
            throw new Error(`Failed to get all files with status: ${response.status()}`);
        }
    }

    async getFilesByType(request: APIRequestContext, fileType: string) {
        logger.info(`Getting files by type: ${fileType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/files/type/${fileType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved files by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get files by type, status: ${response.status()}`);
            throw new Error(`Failed to get files by type with status: ${response.status()}`);
        }
    }

    async getFilesByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting files by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/files/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved files by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get files by user, status: ${response.status()}`);
            throw new Error(`Failed to get files by user with status: ${response.status()}`);
        }
    }

    async updateFileMetadata(request: APIRequestContext, fileId: string, metadata: any, userId: string) {
        logger.info(`Updating file metadata for ID: ${fileId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/files/${fileId}/metadata`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: metadata
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File metadata updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update file metadata, status: ${response.status()}`);
            throw new Error(`Failed to update file metadata with status: ${response.status()}`);
        }
    }

    async searchFiles(request: APIRequestContext, searchData: any) {
        logger.info(`Searching files:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/files/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched files`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search files, status: ${response.status()}`);
            throw new Error(`Failed to search files with status: ${response.status()}`);
        }
    }

    async getFileVersions(request: APIRequestContext, fileId: string) {
        logger.info(`Getting file versions for ID: ${fileId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/files/${fileId}/versions`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved file versions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get file versions, status: ${response.status()}`);
            throw new Error(`Failed to get file versions with status: ${response.status()}`);
        }
    }

    async restoreFileVersion(request: APIRequestContext, fileId: string, versionId: string, userId: string) {
        logger.info(`Restoring file version - File ID: ${fileId}, Version ID: ${versionId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/files/${fileId}/versions/${versionId}/restore`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`File version restored successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to restore file version, status: ${response.status()}`);
            throw new Error(`Failed to restore file version with status: ${response.status()}`);
        }
    }
}
