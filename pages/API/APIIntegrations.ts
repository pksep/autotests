import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class IntegrationsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.createIntegration', payload, accessToken);
  }

  async updateIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.updateIntegration', payload, accessToken);
  }

  async getIntegrationById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getIntegrationById', args };
    return this.apiProbe(request, 'IntegrationsAPI.getIntegrationById', payload, accessToken);
  }

  async deleteIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.deleteIntegration', payload, accessToken);
  }

  async getAllIntegrations(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllIntegrations', args };
    return this.apiProbe(request, 'IntegrationsAPI.getAllIntegrations', payload, accessToken);
  }

  async getIntegrationsByType(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getIntegrationsByType', args };
    return this.apiProbe(request, 'IntegrationsAPI.getIntegrationsByType', payload, accessToken);
  }

  async testIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'testIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.testIntegration', payload, accessToken);
  }

  async getIntegrationStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getIntegrationStatus', args };
    return this.apiProbe(request, 'IntegrationsAPI.getIntegrationStatus', payload, accessToken);
  }

  async enableIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'enableIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.enableIntegration', payload, accessToken);
  }

  async disableIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'disableIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.disableIntegration', payload, accessToken);
  }

  async getIntegrationLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getIntegrationLogs', args };
    return this.apiProbe(request, 'IntegrationsAPI.getIntegrationLogs', payload, accessToken);
  }

  async syncIntegration(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'syncIntegration', args };
    return this.apiProbe(request, 'IntegrationsAPI.syncIntegration', payload, accessToken);
  }
}
