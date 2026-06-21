import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class ImportExportAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async importData(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'importData', args };
    return this.apiProbe(request, 'ImportExportAPI.importData', payload, accessToken);
  }

  async exportData(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'exportData', args };
    return this.apiProbe(request, 'ImportExportAPI.exportData', payload, accessToken);
  }

  async getImportStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getImportStatus', args };
    return this.apiProbe(request, 'ImportExportAPI.getImportStatus', payload, accessToken);
  }

  async getExportStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getExportStatus', args };
    return this.apiProbe(request, 'ImportExportAPI.getExportStatus', payload, accessToken);
  }

  async downloadExport(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'downloadExport', args };
    return this.apiProbe(request, 'ImportExportAPI.downloadExport', payload, accessToken);
  }

  async getImportHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getImportHistory', args };
    return this.apiProbe(request, 'ImportExportAPI.getImportHistory', payload, accessToken);
  }

  async getExportHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getExportHistory', args };
    return this.apiProbe(request, 'ImportExportAPI.getExportHistory', payload, accessToken);
  }

  async validateImportData(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'validateImportData', args };
    return this.apiProbe(request, 'ImportExportAPI.validateImportData', payload, accessToken);
  }

  async getImportTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getImportTemplate', args };
    return this.apiProbe(request, 'ImportExportAPI.getImportTemplate', payload, accessToken);
  }

  async getExportTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getExportTemplate', args };
    return this.apiProbe(request, 'ImportExportAPI.getExportTemplate', payload, accessToken);
  }

  async cancelImport(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'cancelImport', args };
    return this.apiProbe(request, 'ImportExportAPI.cancelImport', payload, accessToken);
  }

  async cancelExport(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'cancelExport', args };
    return this.apiProbe(request, 'ImportExportAPI.cancelExport', payload, accessToken);
  }

  async getImportErrors(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getImportErrors', args };
    return this.apiProbe(request, 'ImportExportAPI.getImportErrors', payload, accessToken);
  }

  async getExportErrors(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getExportErrors', args };
    return this.apiProbe(request, 'ImportExportAPI.getExportErrors', payload, accessToken);
  }
}
