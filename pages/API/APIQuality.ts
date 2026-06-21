import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class QualityAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createQualityCheck(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createQualityCheck', args };
    return this.apiProbe(request, 'QualityAPI.createQualityCheck', payload, accessToken);
  }

  async updateQualityCheck(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateQualityCheck', args };
    return this.apiProbe(request, 'QualityAPI.updateQualityCheck', payload, accessToken);
  }

  async getQualityCheckById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getQualityCheckById', args };
    return this.apiProbe(request, 'QualityAPI.getQualityCheckById', payload, accessToken);
  }

  async deleteQualityCheck(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteQualityCheck', args };
    return this.apiProbe(request, 'QualityAPI.deleteQualityCheck', payload, accessToken);
  }

  async getAllQualityChecks(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllQualityChecks', args };
    return this.apiProbe(request, 'QualityAPI.getAllQualityChecks', payload, accessToken);
  }

  async getQualityChecksByStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getQualityChecksByStatus', args };
    return this.apiProbe(request, 'QualityAPI.getQualityChecksByStatus', payload, accessToken);
  }

  async updateQualityCheckStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateQualityCheckStatus', args };
    return this.apiProbe(request, 'QualityAPI.updateQualityCheckStatus', payload, accessToken);
  }

  async getQualityCheckResults(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getQualityCheckResults', args };
    return this.apiProbe(request, 'QualityAPI.getQualityCheckResults', payload, accessToken);
  }

  async addQualityCheckResult(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addQualityCheckResult', args };
    return this.apiProbe(request, 'QualityAPI.addQualityCheckResult', payload, accessToken);
  }

  async getQualityMetrics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getQualityMetrics', args };
    return this.apiProbe(request, 'QualityAPI.getQualityMetrics', payload, accessToken);
  }
}
