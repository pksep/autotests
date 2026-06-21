import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class CalendarAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createEvent', args };
    return this.apiProbe(request, 'CalendarAPI.createEvent', payload, accessToken);
  }

  async updateEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateEvent', args };
    return this.apiProbe(request, 'CalendarAPI.updateEvent', payload, accessToken);
  }

  async getEventById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getEventById', args };
    return this.apiProbe(request, 'CalendarAPI.getEventById', payload, accessToken);
  }

  async deleteEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteEvent', args };
    return this.apiProbe(request, 'CalendarAPI.deleteEvent', payload, accessToken);
  }

  async getAllEvents(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllEvents', args };
    return this.apiProbe(request, 'CalendarAPI.getAllEvents', payload, accessToken);
  }

  async getEventsByDateRange(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getEventsByDateRange', args };
    return this.apiProbe(request, 'CalendarAPI.getEventsByDateRange', payload, accessToken);
  }

  async getEventsByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getEventsByUser', args };
    return this.apiProbe(request, 'CalendarAPI.getEventsByUser', payload, accessToken);
  }

  async createRecurringEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createRecurringEvent', args };
    return this.apiProbe(request, 'CalendarAPI.createRecurringEvent', payload, accessToken);
  }

  async updateRecurringEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateRecurringEvent', args };
    return this.apiProbe(request, 'CalendarAPI.updateRecurringEvent', payload, accessToken);
  }

  async deleteRecurringEvent(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteRecurringEvent', args };
    return this.apiProbe(request, 'CalendarAPI.deleteRecurringEvent', payload, accessToken);
  }

  async getCalendarSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getCalendarSettings', args };
    return this.apiProbe(request, 'CalendarAPI.getCalendarSettings', payload, accessToken);
  }

  async updateCalendarSettings(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateCalendarSettings', args };
    return this.apiProbe(request, 'CalendarAPI.updateCalendarSettings', payload, accessToken);
  }
}
