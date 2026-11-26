import { APIRequestContext } from '@playwright/test';
import { ENV } from '../../config';
import { APIPageObject } from '../../lib/APIPage';

export type PercentageEntityType = 'detal' | 'cbed' | 'product';

/** Read-only sources used by production pages and operation/complectation modals. */
export class PercentagesAPI extends APIPageObject {
  constructor() { super(null); }

  private read(request: APIRequestContext, path: string, accessToken: string, data?: unknown) {
    return this.apiRequest(request, data === undefined ? 'GET' : 'POST', ENV.API_BASE_URL + 'api/' + path, {
      accessToken, data,
    });
  }

  productionPage(request: APIRequestContext, type: PercentageEntityType, page: number, token: string) {
    const common = {
      page, searchString: '', isBan: false, responsibleUserId: null,
      byParents: { productIds: [], cbedIds: [], detalIds: [] },
      byOrder: { orderId: null, customer: null }, sort: [],
    };
    return type === 'detal'
      ? this.read(request, 'metaloworking/pagination', token, {
        ...common, metalloworkingID: null, childrenByProductionTaskIds: [], isDiscontinued: false,
      })
      : this.read(request, 'assemble/pagination', token, {
        ...common, type, notOrderedByProductionTask: false, sortReadines: 'any', onlyCanComplect: false,
      });
  }

  operationPath(request: APIRequestContext, type: PercentageEntityType, id: number, token: string, productionTaskId?: number) {
    const query = productionTaskId === undefined ? '' : `?productionTaskId=${productionTaskId}`;
    return this.read(request, `${type === 'detal' ? 'metaloworking' : 'assemble'}/${id}${query}`, token);
  }

  entityTasks(request: APIRequestContext, type: PercentageEntityType, id: number, token: string) {
    return this.read(request, `production-task/by-entity?entityId=${id}&entityType=${type}`, token);
  }

  productionTask(request: APIRequestContext, id: number, token: string) {
    return this.read(request, `production-task/by-id/${id}`, token);
  }

  ordersSummary(request: APIRequestContext, type: 'cbed' | 'detal', id: number, token: string) {
    return this.read(request, `production-task/orders-summary/${type}/${id}`, token);
  }

  demand(request: APIRequestContext, type: PercentageEntityType, id: number, token: string) {
    // This controller exposes total demand only; it has no productionTaskId query.
    return this.read(request, `production-task/shipment/${type}/${id}`, token);
  }

  percent(request: APIRequestContext, type: PercentageEntityType, id: number, token: string,
    context: { productionTaskId?: number; requiredQuantity?: number | string } = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined) query.set(key, String(value));
    }
    return this.read(request, `production-task/percent/${type}/${id}${query.size ? '?' + query : ''}`, token);
  }

  children(request: APIRequestContext, type: PercentageEntityType, id: number, token: string,
    context: { productionTaskId?: number; requiredQuantity?: number } = {}) {
    return this.read(request, 'specification/first-level-children', token, { itemId: id, itemType: type, ...context });
  }

  stock(request: APIRequestContext, type: 'detal' | 'cbed' | 'material', id: number, token: string) {
    return type === 'material'
      ? this.read(request, `material/material/get/${id}/true`, token)
      : this.read(request, `${type}/one`, token, {
        id, attributes: ['id', 'quantity', 'in_kit'], modelsInclude: [], isExtension: false,
      });
  }

  shipmentsPage(request: APIRequestContext, token: string) {
    return this.read(request, 'shipments/pagination', token, {
      offset: 0, status: [], dateRange: null, companyId: null, searchStr: '', attributes: [], sort: [],
    });
  }
}
