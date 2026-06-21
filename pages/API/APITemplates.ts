import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class TemplatesAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.createTemplate', payload, accessToken);
  }

  async updateTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.updateTemplate', payload, accessToken);
  }

  async getTemplateById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getTemplateById', args };
    return this.apiProbe(request, 'TemplatesAPI.getTemplateById', payload, accessToken);
  }

  async deleteTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.deleteTemplate', payload, accessToken);
  }

  async getAllTemplates(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllTemplates', args };
    return this.apiProbe(request, 'TemplatesAPI.getAllTemplates', payload, accessToken);
  }

  async getTemplatesByType(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getTemplatesByType', args };
    return this.apiProbe(request, 'TemplatesAPI.getTemplatesByType', payload, accessToken);
  }

  async getTemplatesByCategory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getTemplatesByCategory', args };
    return this.apiProbe(request, 'TemplatesAPI.getTemplatesByCategory', payload, accessToken);
  }

  async getTemplatesByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getTemplatesByUser', args };
    return this.apiProbe(request, 'TemplatesAPI.getTemplatesByUser', payload, accessToken);
  }

  async cloneTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'cloneTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.cloneTemplate', payload, accessToken);
  }

  async validateTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'validateTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.validateTemplate', payload, accessToken);
  }

  async exportTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'exportTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.exportTemplate', payload, accessToken);
  }

  async importTemplate(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'importTemplate', args };
    return this.apiProbe(request, 'TemplatesAPI.importTemplate', payload, accessToken);
  }

  async getTemplateVersions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getTemplateVersions', args };
    return this.apiProbe(request, 'TemplatesAPI.getTemplateVersions', payload, accessToken);
  }

  async restoreTemplateVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'restoreTemplateVersion', args };
    return this.apiProbe(request, 'TemplatesAPI.restoreTemplateVersion', payload, accessToken);
  }

  async searchTemplates(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'searchTemplates', args };
    return this.apiProbe(request, 'TemplatesAPI.searchTemplates', payload, accessToken);
  }
}
