import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class DashboardAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async getDashboardData(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardData', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardData', payload, accessToken);
  }

  async getDashboardWidgets(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardWidgets', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardWidgets', payload, accessToken);
  }

  async createDashboardWidget(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createDashboardWidget', args };
    return this.apiProbe(request, 'DashboardAPI.createDashboardWidget', payload, accessToken);
  }

  async updateDashboardWidget(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateDashboardWidget', args };
    return this.apiProbe(request, 'DashboardAPI.updateDashboardWidget', payload, accessToken);
  }

  async deleteDashboardWidget(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteDashboardWidget', args };
    return this.apiProbe(request, 'DashboardAPI.deleteDashboardWidget', payload, accessToken);
  }

  async getDashboardLayout(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardLayout', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardLayout', payload, accessToken);
  }

  async updateDashboardLayout(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateDashboardLayout', args };
    return this.apiProbe(request, 'DashboardAPI.updateDashboardLayout', payload, accessToken);
  }

  async getDashboardSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardSettings', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardSettings', payload, accessToken);
  }

  async updateDashboardSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateDashboardSettings', args };
    return this.apiProbe(request, 'DashboardAPI.updateDashboardSettings', payload, accessToken);
  }

  async getDashboardAnalytics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardAnalytics', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardAnalytics', payload, accessToken);
  }

  async getDashboardKPIs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardKPIs', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardKPIs', payload, accessToken);
  }

  async getDashboardNotifications(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardNotifications', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardNotifications', payload, accessToken);
  }

  async getDashboardRecentActivity(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getDashboardRecentActivity', args };
    return this.apiProbe(request, 'DashboardAPI.getDashboardRecentActivity', payload, accessToken);
  }

  async resetDashboardToDefault(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'resetDashboardToDefault', args };
    return this.apiProbe(request, 'DashboardAPI.resetDashboardToDefault', payload, accessToken);
  }
}
