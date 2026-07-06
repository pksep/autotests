import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class DocumentsAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  async createDocuments(request: APIRequestContext, docs: Record<string, unknown>[], files: { name: string; mimeType: string; buffer: Buffer }[], accessToken?: string) {
    logger.info(`Creating documents`);

    const multipart: Record<string, any> = {
      docs: JSON.stringify(docs),
    };
    files.forEach((file, index) => {
      multipart[`document${index ? index : ''}`] = file;
    });
    if (files.length === 1) {
      multipart.document = files[0];
      delete multipart.document0;
    }

    const response = await request.post(ENV.API_BASE_URL + 'api/documents/add', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(accessToken),
      },
      multipart,
    });

    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async attachFileToUser(request: APIRequestContext, userToUpdateId: number, fileId: number, unpin: boolean, userId: string) {
    logger.info(`Attaching file ${fileId} to user ${userToUpdateId}, unpin: ${unpin}`);

    const response = await request.put(ENV.API_BASE_URL + (unpin ? 'api/documents/unpin-documents' : 'api/documents/attach-to-entity'), {
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      data: {
        idEntity: userToUpdateId,
        idDocument: fileId,
        typeEntity: 'user',
      },
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

  async getFileById(request: APIRequestContext, id: number, light: boolean, accessToken?: string) {
    logger.info(`Getting file by id: ${id}, light: ${light}`);

    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + `api/documents/${id}/${light}`, {
      accessToken,
    });
  }

  async checkNameExisting(request: APIRequestContext, data: { name: string }, accessToken?: string) {
    logger.info(`Checking document name: ${data.name}`);

    return this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/documents/name/check', {
      data,
      accessToken,
    });
  }

  async getDocumentsByParams(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting documents by params`);

    return this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/documents/param', {
      data,
      accessToken,
    });
  }

  async getDocumentNames(request: APIRequestContext, accessToken?: string) {
    logger.info(`Getting document names`);

    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + 'api/documents/names', {
      accessToken,
    });
  }

  async presignPut(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info(`Getting presigned upload url`);

    return this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/documents/presign', {
      data,
      accessToken,
    });
  }

  async getCdnFile(request: APIRequestContext, filename: string, accessToken?: string) {
    logger.info(`Getting CDN file metadata`);

    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + `api/documents/cdn/${filename}`, {
      accessToken,
    });
  }

  async changeAvatar(request: APIRequestContext, id: number, accessToken?: string) {
    logger.info(`Changing document avatar flag: ${id}`);

    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + `api/documents/avachanges/${id}`, {
      accessToken,
    });
  }

  async getAvatarByEntity(request: APIRequestContext, typeEntity: string, idEntity: number, accessToken?: string) {
    logger.info(`Getting avatar by entity: ${typeEntity}/${idEntity}`);

    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + `api/documents/avatar${typeEntity}/${idEntity}`, {
      accessToken,
    });
  }

  async updateDocument(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating document`);

    return this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/documents/update', {
      data,
      accessToken,
    });
  }

  async archiveDocument(request: APIRequestContext, id: number, unpin = false, accessToken?: string) {
    logger.info(`Archiving document with id: ${id}, unpin: ${unpin}`);

    return this.apiRequest(request, 'DELETE', ENV.API_BASE_URL + `api/documents/${id}/${unpin}`, {
      accessToken,
      headers: {
        'user-id': '1',
      },
    });
  }

  async attachDocumentToEntity(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info(`Attaching document to entity`);

    return this.apiRequest(request, 'PUT', ENV.API_BASE_URL + 'api/documents/attach-to-entity', {
      data,
      accessToken,
    });
  }

  async unpinDocuments(request: APIRequestContext, data: Record<string, unknown>, accessToken?: string) {
    logger.info(`Unpinning documents`);

    return this.apiRequest(request, 'PUT', ENV.API_BASE_URL + 'api/documents/unpin-documents', {
      data,
      accessToken,
    });
  }

  async changeDocumentType(request: APIRequestContext, typeData: any, userId: string) {
    logger.info(`Changing document type:`, typeData);

    const response = await request.post(ENV.API_BASE_URL + 'api/documents/editype', {
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      data: typeData,
    });

    if (response.ok()) {
      logger.info(`Document type changed successfully`);
    } else {
      logger.error(`Failed to change document type, status: ${response.status()}`);
    }

    return { status: response.status(), data: await this.parseJsonBody(response), headers: response.headers() };
  }

  async deleteDocument(request: APIRequestContext, id: number, userId: string, accessToken?: string) {
    logger.info(`Deleting document with id: ${id}`);

    const response = await request.delete(ENV.API_BASE_URL + `api/documents/${id}/false`, {
      headers: {
        'user-id': userId,
        ...this.authHeaders(accessToken),
      },
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

    const response = await request.put(ENV.API_BASE_URL + 'api/documents/attach-to-entity', {
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      data: {
        typeEntity: 'detal',
        ...detalData,
      },
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
        'user-id': userId,
      },
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
