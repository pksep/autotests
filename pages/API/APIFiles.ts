import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class FilesAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async uploadFile(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'uploadFile', args };
    return this.apiProbe(request, 'FilesAPI.uploadFile', payload, accessToken);
  }

  async downloadFile(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'downloadFile', args };
    return this.apiProbe(request, 'FilesAPI.downloadFile', payload, accessToken);
  }

  async getFileById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getFileById', args };
    return this.apiProbe(request, 'FilesAPI.getFileById', payload, accessToken);
  }

  async deleteFile(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteFile', args };
    return this.apiProbe(request, 'FilesAPI.deleteFile', payload, accessToken);
  }

  async getAllFiles(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllFiles', args };
    return this.apiProbe(request, 'FilesAPI.getAllFiles', payload, accessToken);
  }

  async getFilesByType(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getFilesByType', args };
    return this.apiProbe(request, 'FilesAPI.getFilesByType', payload, accessToken);
  }

  async getFilesByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getFilesByUser', args };
    return this.apiProbe(request, 'FilesAPI.getFilesByUser', payload, accessToken);
  }

  async updateFileMetadata(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateFileMetadata', args };
    return this.apiProbe(request, 'FilesAPI.updateFileMetadata', payload, accessToken);
  }

  async searchFiles(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'searchFiles', args };
    return this.apiProbe(request, 'FilesAPI.searchFiles', payload, accessToken);
  }

  async getFileVersions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getFileVersions', args };
    return this.apiProbe(request, 'FilesAPI.getFileVersions', payload, accessToken);
  }

  async restoreFileVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'restoreFileVersion', args };
    return this.apiProbe(request, 'FilesAPI.restoreFileVersion', payload, accessToken);
  }
}
