import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class LogsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createLogEntry(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createLogEntry', args };
    return this.apiProbe(request, 'LogsAPI.createLogEntry', payload, accessToken);
  }

  async getSystemLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSystemLogs', args };
    return this.apiProbe(request, 'LogsAPI.getSystemLogs', payload, accessToken);
  }

  async getApplicationLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getApplicationLogs', args };
    return this.apiProbe(request, 'LogsAPI.getApplicationLogs', payload, accessToken);
  }

  async getErrorLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getErrorLogs', args };
    return this.apiProbe(request, 'LogsAPI.getErrorLogs', payload, accessToken);
  }

  async getAuditLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAuditLogs', args };
    return this.apiProbe(request, 'LogsAPI.getAuditLogs', payload, accessToken);
  }

  async getLogsByLevel(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getLogsByLevel', args };
    return this.apiProbe(request, 'LogsAPI.getLogsByLevel', payload, accessToken);
  }

  async getLogsByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getLogsByUser', args };
    return this.apiProbe(request, 'LogsAPI.getLogsByUser', payload, accessToken);
  }

  async getLogsByModule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getLogsByModule', args };
    return this.apiProbe(request, 'LogsAPI.getLogsByModule', payload, accessToken);
  }

  async exportLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'exportLogs', args };
    return this.apiProbe(request, 'LogsAPI.exportLogs', payload, accessToken);
  }

  async clearLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'clearLogs', args };
    return this.apiProbe(request, 'LogsAPI.clearLogs', payload, accessToken);
  }

  async getLogStatistics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getLogStatistics', args };
    return this.apiProbe(request, 'LogsAPI.getLogStatistics', payload, accessToken);
  }
}
