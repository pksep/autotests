import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class SecurityAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async changePassword(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'changePassword', args };
    return this.apiProbe(request, 'SecurityAPI.changePassword', payload, accessToken);
  }

  async resetPassword(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'resetPassword', args };
    return this.apiProbe(request, 'SecurityAPI.resetPassword', payload, accessToken);
  }

  async enableTwoFactor(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'enableTwoFactor', args };
    return this.apiProbe(request, 'SecurityAPI.enableTwoFactor', payload, accessToken);
  }

  async disableTwoFactor(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'disableTwoFactor', args };
    return this.apiProbe(request, 'SecurityAPI.disableTwoFactor', payload, accessToken);
  }

  async verifyTwoFactor(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'verifyTwoFactor', args };
    return this.apiProbe(request, 'SecurityAPI.verifyTwoFactor', payload, accessToken);
  }

  async getSecurityLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSecurityLogs', args };
    return this.apiProbe(request, 'SecurityAPI.getSecurityLogs', payload, accessToken);
  }

  async getActiveSessions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getActiveSessions', args };
    return this.apiProbe(request, 'SecurityAPI.getActiveSessions', payload, accessToken);
  }

  async terminateSession(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'terminateSession', args };
    return this.apiProbe(request, 'SecurityAPI.terminateSession', payload, accessToken);
  }

  async terminateAllSessions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'terminateAllSessions', args };
    return this.apiProbe(request, 'SecurityAPI.terminateAllSessions', payload, accessToken);
  }

  async getSecuritySettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSecuritySettings', args };
    return this.apiProbe(request, 'SecurityAPI.getSecuritySettings', payload, accessToken);
  }

  async updateSecuritySettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateSecuritySettings', args };
    return this.apiProbe(request, 'SecurityAPI.updateSecuritySettings', payload, accessToken);
  }
}
