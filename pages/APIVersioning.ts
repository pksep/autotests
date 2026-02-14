import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class VersioningAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createVersion(request: APIRequestContext, versionData: any, userId: string) {
        logger.info(`Creating version:`, versionData);

        const response = await request.post(ENV.API_BASE_URL + 'api/versioning/versions', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: versionData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Version created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create version, status: ${response.status()}`);
            throw new Error(`Failed to create version with status: ${response.status()}`);
        }
    }

    async updateVersion(request: APIRequestContext, versionData: any, userId: string) {
        logger.info(`Updating version:`, versionData);

        const response = await request.put(ENV.API_BASE_URL + 'api/versioning/versions', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: versionData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Version updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update version, status: ${response.status()}`);
            throw new Error(`Failed to update version with status: ${response.status()}`);
        }
    }

    async getVersionById(request: APIRequestContext, versionId: string) {
        logger.info(`Getting version by ID: ${versionId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/versions/${versionId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved version by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get version by ID, status: ${response.status()}`);
            throw new Error(`Failed to get version by ID with status: ${response.status()}`);
        }
    }

    async deleteVersion(request: APIRequestContext, versionId: string, userId: string) {
        logger.info(`Deleting version with ID: ${versionId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/versioning/versions/${versionId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Version deleted successfully' };
            logger.info(`Version deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete version, status: ${response.status()}`);
            throw new Error(`Failed to delete version with status: ${response.status()}`);
        }
    }

    async getAllVersions(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all versions with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/versioning/versions/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all versions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all versions, status: ${response.status()}`);
            throw new Error(`Failed to get all versions with status: ${response.status()}`);
        }
    }

    async getVersionsByEntity(request: APIRequestContext, entityType: string, entityId: string) {
        logger.info(`Getting versions for entity ${entityType}: ${entityId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/versions/${entityType}/${entityId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved versions for entity`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get versions for entity, status: ${response.status()}`);
            throw new Error(`Failed to get versions for entity with status: ${response.status()}`);
        }
    }

    async getCurrentVersion(request: APIRequestContext, entityType: string, entityId: string) {
        logger.info(`Getting current version for entity ${entityType}: ${entityId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/versions/${entityType}/${entityId}/current`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved current version`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get current version, status: ${response.status()}`);
            throw new Error(`Failed to get current version with status: ${response.status()}`);
        }
    }

    async setCurrentVersion(request: APIRequestContext, entityType: string, entityId: string, versionId: string, userId: string) {
        logger.info(`Setting current version for entity ${entityType}: ${entityId} to version: ${versionId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/versioning/versions/${entityType}/${entityId}/current`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { versionId }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Current version set successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to set current version, status: ${response.status()}`);
            throw new Error(`Failed to set current version with status: ${response.status()}`);
        }
    }

    async compareVersions(request: APIRequestContext, version1Id: string, version2Id: string) {
        logger.info(`Comparing versions ${version1Id} and ${version2Id}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/versions/compare/${version1Id}/${version2Id}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully compared versions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to compare versions, status: ${response.status()}`);
            throw new Error(`Failed to compare versions with status: ${response.status()}`);
        }
    }

    async restoreVersion(request: APIRequestContext, versionId: string, userId: string) {
        logger.info(`Restoring version with ID: ${versionId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/versioning/versions/${versionId}/restore`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Version restored successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to restore version, status: ${response.status()}`);
            throw new Error(`Failed to restore version with status: ${response.status()}`);
        }
    }

    async getVersionHistory(request: APIRequestContext, entityType: string, entityId: string) {
        logger.info(`Getting version history for entity ${entityType}: ${entityId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/versions/${entityType}/${entityId}/history`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved version history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get version history, status: ${response.status()}`);
            throw new Error(`Failed to get version history with status: ${response.status()}`);
        }
    }

    async createVersionBranch(request: APIRequestContext, branchData: any, userId: string) {
        logger.info(`Creating version branch:`, branchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/versioning/branches', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: branchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Version branch created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create version branch, status: ${response.status()}`);
            throw new Error(`Failed to create version branch with status: ${response.status()}`);
        }
    }

    async mergeVersionBranch(request: APIRequestContext, branchId: string, mergeData: any, userId: string) {
        logger.info(`Merging version branch with ID: ${branchId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/versioning/branches/${branchId}/merge`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: mergeData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Version branch merged successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to merge version branch, status: ${response.status()}`);
            throw new Error(`Failed to merge version branch with status: ${response.status()}`);
        }
    }

    async getVersionBranches(request: APIRequestContext, entityType: string, entityId: string) {
        logger.info(`Getting version branches for entity ${entityType}: ${entityId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/versioning/branches/${entityType}/${entityId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved version branches`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get version branches, status: ${response.status()}`);
            throw new Error(`Failed to get version branches with status: ${response.status()}`);
        }
    }

    async deleteVersionBranch(request: APIRequestContext, branchId: string, userId: string) {
        logger.info(`Deleting version branch with ID: ${branchId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/versioning/branches/${branchId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Version branch deleted successfully' };
            logger.info(`Version branch deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete version branch, status: ${response.status()}`);
            throw new Error(`Failed to delete version branch with status: ${response.status()}`);
        }
    }
}
