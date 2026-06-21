import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class SettingsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async getUserSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getUserSettings', args };
    return this.apiProbe(request, 'SettingsAPI.getUserSettings', payload, accessToken);
  }

  async updateUserSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateUserSettings', args };
    return this.apiProbe(request, 'SettingsAPI.updateUserSettings', payload, accessToken);
  }

  async getNormHours(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getNormHours', args };
    return this.apiProbe(request, 'SettingsAPI.getNormHours', payload, accessToken);
  }

  async updateNormHours(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateNormHours', args };
    return this.apiProbe(request, 'SettingsAPI.updateNormHours', payload, accessToken);
  }

  async getAllEdizm(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllEdizm', args };
    return this.apiProbe(request, 'SettingsAPI.getAllEdizm', payload, accessToken);
  }

  async listDatabaseBackups(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'listDatabaseBackups', args };
    return this.apiProbe(request, 'SettingsAPI.listDatabaseBackups', payload, accessToken);
  }

  async createDatabaseBackup(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createDatabaseBackup', args };
    return this.apiProbe(request, 'SettingsAPI.createDatabaseBackup', payload, accessToken);
  }
}
