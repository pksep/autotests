import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class SchedulingAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.createSchedule', payload, accessToken);
  }

  async updateSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.updateSchedule', payload, accessToken);
  }

  async getScheduleById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getScheduleById', args };
    return this.apiProbe(request, 'SchedulingAPI.getScheduleById', payload, accessToken);
  }

  async deleteSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.deleteSchedule', payload, accessToken);
  }

  async getAllSchedules(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllSchedules', args };
    return this.apiProbe(request, 'SchedulingAPI.getAllSchedules', payload, accessToken);
  }

  async getSchedulesByStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSchedulesByStatus', args };
    return this.apiProbe(request, 'SchedulingAPI.getSchedulesByStatus', payload, accessToken);
  }

  async getSchedulesByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getSchedulesByUser', args };
    return this.apiProbe(request, 'SchedulingAPI.getSchedulesByUser', payload, accessToken);
  }

  async enableSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'enableSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.enableSchedule', payload, accessToken);
  }

  async disableSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'disableSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.disableSchedule', payload, accessToken);
  }

  async executeScheduleNow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'executeScheduleNow', args };
    return this.apiProbe(request, 'SchedulingAPI.executeScheduleNow', payload, accessToken);
  }

  async getScheduleExecutions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getScheduleExecutions', args };
    return this.apiProbe(request, 'SchedulingAPI.getScheduleExecutions', payload, accessToken);
  }

  async getScheduleExecutionById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getScheduleExecutionById', args };
    return this.apiProbe(request, 'SchedulingAPI.getScheduleExecutionById', payload, accessToken);
  }

  async cancelScheduleExecution(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'cancelScheduleExecution', args };
    return this.apiProbe(request, 'SchedulingAPI.cancelScheduleExecution', payload, accessToken);
  }

  async getScheduleLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getScheduleLogs', args };
    return this.apiProbe(request, 'SchedulingAPI.getScheduleLogs', payload, accessToken);
  }

  async validateSchedule(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'validateSchedule', args };
    return this.apiProbe(request, 'SchedulingAPI.validateSchedule', payload, accessToken);
  }

  async getScheduleStatistics(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getScheduleStatistics', args };
    return this.apiProbe(request, 'SchedulingAPI.getScheduleStatistics', payload, accessToken);
  }
}
