import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class SettingsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/settings';

  async createTypeEdizm(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/typeedizm', { data: dto, accessToken });
  }

  async createEdizm(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/edizm', { data: dto, accessToken });
  }

  async getAllEdizm(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/edizm', { accessToken });
  }

  async getAllTypeEdizm(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/typeedizm', { accessToken });
  }

  async updateEdizm(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/edizm/update', { data: dto, accessToken });
  }

  async updateNormHoursValue(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    return this.apiRequest(request, 'POST', this.base() + '/norm-hours', { data: dto, accessToken });
  }

  async getNormHoursValue(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/norm-hours', { accessToken });
  }

  async getAllDB(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/db', { accessToken });
  }

  async newDB(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/db/new', { accessToken });
  }

  async downloadDb(request: APIRequestContext, nameDump: string, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + `/db/download/${encodeURIComponent(nameDump)}`, { accessToken });
  }

  async dropDumpDB(request: APIRequestContext, nameDump: string, accessToken?: string) {
    return this.apiRequest(request, 'DELETE', this.base() + `/db/${encodeURIComponent(nameDump)}`, { accessToken });
  }

  async loadDumpDb(request: APIRequestContext, nameDump: string, isUpdateDb: boolean, accessToken?: string) {
    return this.apiRequest(
      request,
      'PUT',
      this.base() + `/db/load/${encodeURIComponent(nameDump)}/${isUpdateDb}`,
      { accessToken },
    );
  }

  async inactionGet(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/inaction', { accessToken });
  }

  async inactionChange(request: APIRequestContext, hours: number, accessToken?: string) {
    return this.apiRequest(request, 'PUT', this.base() + `/inaction/${hours}`, { accessToken });
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
