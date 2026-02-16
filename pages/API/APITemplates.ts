import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class TemplatesAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createTemplate(request: APIRequestContext, templateData: any, userId: string) {
        logger.info(`Creating template:`, templateData);

        const response = await request.post(ENV.API_BASE_URL + 'api/templates', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: templateData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create template, status: ${response.status()}`);
            throw new Error(`Failed to create template with status: ${response.status()}`);
        }
    }

    async updateTemplate(request: APIRequestContext, templateData: any, userId: string) {
        logger.info(`Updating template:`, templateData);

        const response = await request.put(ENV.API_BASE_URL + 'api/templates', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: templateData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update template, status: ${response.status()}`);
            throw new Error(`Failed to update template with status: ${response.status()}`);
        }
    }

    async getTemplateById(request: APIRequestContext, templateId: string) {
        logger.info(`Getting template by ID: ${templateId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/${templateId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved template by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get template by ID, status: ${response.status()}`);
            throw new Error(`Failed to get template by ID with status: ${response.status()}`);
        }
    }

    async deleteTemplate(request: APIRequestContext, templateId: string, userId: string) {
        logger.info(`Deleting template with ID: ${templateId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/templates/${templateId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Template deleted successfully' };
            logger.info(`Template deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete template, status: ${response.status()}`);
            throw new Error(`Failed to delete template with status: ${response.status()}`);
        }
    }

    async getAllTemplates(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all templates with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/templates/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all templates`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all templates, status: ${response.status()}`);
            throw new Error(`Failed to get all templates with status: ${response.status()}`);
        }
    }

    async getTemplatesByType(request: APIRequestContext, templateType: string) {
        logger.info(`Getting templates by type: ${templateType}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/type/${templateType}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved templates by type`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get templates by type, status: ${response.status()}`);
            throw new Error(`Failed to get templates by type with status: ${response.status()}`);
        }
    }

    async getTemplatesByCategory(request: APIRequestContext, category: string) {
        logger.info(`Getting templates by category: ${category}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/category/${category}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved templates by category`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get templates by category, status: ${response.status()}`);
            throw new Error(`Failed to get templates by category with status: ${response.status()}`);
        }
    }

    async getTemplatesByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting templates by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved templates by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get templates by user, status: ${response.status()}`);
            throw new Error(`Failed to get templates by user with status: ${response.status()}`);
        }
    }

    async cloneTemplate(request: APIRequestContext, templateId: string, cloneData: any, userId: string) {
        logger.info(`Cloning template with ID: ${templateId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/templates/${templateId}/clone`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: cloneData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template cloned successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to clone template, status: ${response.status()}`);
            throw new Error(`Failed to clone template with status: ${response.status()}`);
        }
    }

    async validateTemplate(request: APIRequestContext, templateData: any) {
        logger.info(`Validating template:`, templateData);

        const response = await request.post(ENV.API_BASE_URL + 'api/templates/validate', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: templateData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template validated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate template, status: ${response.status()}`);
            throw new Error(`Failed to validate template with status: ${response.status()}`);
        }
    }

    async exportTemplate(request: APIRequestContext, templateId: string, format: string) {
        logger.info(`Exporting template ${templateId} in format: ${format}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/${templateId}/export/${format}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template exported successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to export template, status: ${response.status()}`);
            throw new Error(`Failed to export template with status: ${response.status()}`);
        }
    }

    async importTemplate(request: APIRequestContext, importData: any, userId: string) {
        logger.info(`Importing template:`, importData);

        const response = await request.post(ENV.API_BASE_URL + 'api/templates/import', {
            headers: {
                'user-id': userId
            },
            multipart: importData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template imported successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to import template, status: ${response.status()}`);
            throw new Error(`Failed to import template with status: ${response.status()}`);
        }
    }

    async getTemplateVersions(request: APIRequestContext, templateId: string) {
        logger.info(`Getting template versions for ID: ${templateId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/templates/${templateId}/versions`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved template versions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get template versions, status: ${response.status()}`);
            throw new Error(`Failed to get template versions with status: ${response.status()}`);
        }
    }

    async restoreTemplateVersion(request: APIRequestContext, templateId: string, versionId: string, userId: string) {
        logger.info(`Restoring template version - Template ID: ${templateId}, Version ID: ${versionId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/templates/${templateId}/versions/${versionId}/restore`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Template version restored successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to restore template version, status: ${response.status()}`);
            throw new Error(`Failed to restore template version with status: ${response.status()}`);
        }
    }

    async searchTemplates(request: APIRequestContext, searchData: any) {
        logger.info(`Searching templates:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/templates/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched templates`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search templates, status: ${response.status()}`);
            throw new Error(`Failed to search templates with status: ${response.status()}`);
        }
    }
}
