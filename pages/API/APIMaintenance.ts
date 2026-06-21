import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class MaintenanceAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createMaintenanceSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createMaintenanceSchedule', args };
    return this.apiProbe(request, 'MaintenanceAPI.createMaintenanceSchedule', payload, accessToken);
  }

  async updateMaintenanceSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateMaintenanceSchedule', args };
    return this.apiProbe(request, 'MaintenanceAPI.updateMaintenanceSchedule', payload, accessToken);
  }

  async getMaintenanceScheduleById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMaintenanceScheduleById', args };
    return this.apiProbe(request, 'MaintenanceAPI.getMaintenanceScheduleById', payload, accessToken);
  }

  async deleteMaintenanceSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteMaintenanceSchedule', args };
    return this.apiProbe(request, 'MaintenanceAPI.deleteMaintenanceSchedule', payload, accessToken);
  }

  async getAllMaintenanceSchedules(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllMaintenanceSchedules', args };
    return this.apiProbe(request, 'MaintenanceAPI.getAllMaintenanceSchedules', payload, accessToken);
  }

  async getMaintenanceSchedulesByStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMaintenanceSchedulesByStatus', args };
    return this.apiProbe(request, 'MaintenanceAPI.getMaintenanceSchedulesByStatus', payload, accessToken);
  }

  async updateMaintenanceScheduleStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateMaintenanceScheduleStatus', args };
    return this.apiProbe(request, 'MaintenanceAPI.updateMaintenanceScheduleStatus', payload, accessToken);
  }

  async getMaintenanceScheduleTasks(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMaintenanceScheduleTasks', args };
    return this.apiProbe(request, 'MaintenanceAPI.getMaintenanceScheduleTasks', payload, accessToken);
  }

  async addMaintenanceScheduleTask(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addMaintenanceScheduleTask', args };
    return this.apiProbe(request, 'MaintenanceAPI.addMaintenanceScheduleTask', payload, accessToken);
  }

  async getMaintenanceHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMaintenanceHistory', args };
    return this.apiProbe(request, 'MaintenanceAPI.getMaintenanceHistory', payload, accessToken);
  }
}
