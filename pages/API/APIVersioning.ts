import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class VersioningAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createVersion', args };
    return this.apiProbe(request, 'VersioningAPI.createVersion', payload, accessToken);
  }

  async updateVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateVersion', args };
    return this.apiProbe(request, 'VersioningAPI.updateVersion', payload, accessToken);
  }

  async getVersionById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getVersionById', args };
    return this.apiProbe(request, 'VersioningAPI.getVersionById', payload, accessToken);
  }

  async deleteVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteVersion', args };
    return this.apiProbe(request, 'VersioningAPI.deleteVersion', payload, accessToken);
  }

  async getAllVersions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllVersions', args };
    return this.apiProbe(request, 'VersioningAPI.getAllVersions', payload, accessToken);
  }

  async getVersionsByEntity(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getVersionsByEntity', args };
    return this.apiProbe(request, 'VersioningAPI.getVersionsByEntity', payload, accessToken);
  }

  async getCurrentVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getCurrentVersion', args };
    return this.apiProbe(request, 'VersioningAPI.getCurrentVersion', payload, accessToken);
  }

  async setCurrentVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'setCurrentVersion', args };
    return this.apiProbe(request, 'VersioningAPI.setCurrentVersion', payload, accessToken);
  }

  async compareVersions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'compareVersions', args };
    return this.apiProbe(request, 'VersioningAPI.compareVersions', payload, accessToken);
  }

  async restoreVersion(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'restoreVersion', args };
    return this.apiProbe(request, 'VersioningAPI.restoreVersion', payload, accessToken);
  }

  async getVersionHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getVersionHistory', args };
    return this.apiProbe(request, 'VersioningAPI.getVersionHistory', payload, accessToken);
  }

  async createVersionBranch(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createVersionBranch', args };
    return this.apiProbe(request, 'VersioningAPI.createVersionBranch', payload, accessToken);
  }

  async mergeVersionBranch(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'mergeVersionBranch', args };
    return this.apiProbe(request, 'VersioningAPI.mergeVersionBranch', payload, accessToken);
  }

  async getVersionBranches(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getVersionBranches', args };
    return this.apiProbe(request, 'VersioningAPI.getVersionBranches', payload, accessToken);
  }

  async deleteVersionBranch(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteVersionBranch', args };
    return this.apiProbe(request, 'VersioningAPI.deleteVersionBranch', payload, accessToken);
  }
}
