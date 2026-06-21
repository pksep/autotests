import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class MonitoringAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async getSystemHealth(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSystemHealth', args };
    return this.apiProbe(request, 'MonitoringAPI.getSystemHealth', payload, accessToken);
  }

  async getSystemMetrics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSystemMetrics', args };
    return this.apiProbe(request, 'MonitoringAPI.getSystemMetrics', payload, accessToken);
  }

  async getPerformanceMetrics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getPerformanceMetrics', args };
    return this.apiProbe(request, 'MonitoringAPI.getPerformanceMetrics', payload, accessToken);
  }

  async getResourceUsage(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getResourceUsage', args };
    return this.apiProbe(request, 'MonitoringAPI.getResourceUsage', payload, accessToken);
  }

  async getAlerts(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAlerts', args };
    return this.apiProbe(request, 'MonitoringAPI.getAlerts', payload, accessToken);
  }

  async createAlert(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createAlert', args };
    return this.apiProbe(request, 'MonitoringAPI.createAlert', payload, accessToken);
  }

  async updateAlert(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateAlert', args };
    return this.apiProbe(request, 'MonitoringAPI.updateAlert', payload, accessToken);
  }

  async deleteAlert(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteAlert', args };
    return this.apiProbe(request, 'MonitoringAPI.deleteAlert', payload, accessToken);
  }

  async getAlertHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAlertHistory', args };
    return this.apiProbe(request, 'MonitoringAPI.getAlertHistory', payload, accessToken);
  }

  async acknowledgeAlert(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'acknowledgeAlert', args };
    return this.apiProbe(request, 'MonitoringAPI.acknowledgeAlert', payload, accessToken);
  }

  async getDashboardData(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardData', args };
    return this.apiProbe(request, 'MonitoringAPI.getDashboardData', payload, accessToken);
  }
}
