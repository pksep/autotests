import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class ManufacturingAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createManufacturingOrder(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createManufacturingOrder', args };
    return this.apiProbe(request, 'ManufacturingAPI.createManufacturingOrder', payload, accessToken);
  }

  async updateManufacturingOrder(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateManufacturingOrder', args };
    return this.apiProbe(request, 'ManufacturingAPI.updateManufacturingOrder', payload, accessToken);
  }

  async getManufacturingOrderById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getManufacturingOrderById', args };
    return this.apiProbe(request, 'ManufacturingAPI.getManufacturingOrderById', payload, accessToken);
  }

  async deleteManufacturingOrder(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteManufacturingOrder', args };
    return this.apiProbe(request, 'ManufacturingAPI.deleteManufacturingOrder', payload, accessToken);
  }

  async getAllManufacturingOrders(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllManufacturingOrders', args };
    return this.apiProbe(request, 'ManufacturingAPI.getAllManufacturingOrders', payload, accessToken);
  }

  async getManufacturingOrdersByStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getManufacturingOrdersByStatus', args };
    return this.apiProbe(request, 'ManufacturingAPI.getManufacturingOrdersByStatus', payload, accessToken);
  }

  async updateManufacturingOrderStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateManufacturingOrderStatus', args };
    return this.apiProbe(request, 'ManufacturingAPI.updateManufacturingOrderStatus', payload, accessToken);
  }

  async getManufacturingOrderItems(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getManufacturingOrderItems', args };
    return this.apiProbe(request, 'ManufacturingAPI.getManufacturingOrderItems', payload, accessToken);
  }

  async addManufacturingOrderItem(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addManufacturingOrderItem', args };
    return this.apiProbe(request, 'ManufacturingAPI.addManufacturingOrderItem', payload, accessToken);
  }

  async getManufacturingProgress(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getManufacturingProgress', args };
    return this.apiProbe(request, 'ManufacturingAPI.getManufacturingProgress', payload, accessToken);
  }
}
