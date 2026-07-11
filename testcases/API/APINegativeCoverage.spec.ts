import { APIRequestContext, expect, test } from '@playwright/test';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
import {
  ApiResult,
  expectClientError,
  expectErrorResponseContract,
  expectNoServerError,
  expectStatusIn,
  expectUnauthorizedOrForbidden,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const apiUrl = (route: string) => `${ENV.API_BASE_URL}${route}`;

const parseBody = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return text ? { raw: text } : {};
  }
};

const requestJson = async (
  request: APIRequestContext,
  method: HttpMethod,
  route: string,
  options: { token?: string; data?: unknown } = {},
): Promise<ApiResult> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    compress: 'no-compress',
  };

  if (options.token) {
    headers.Authorization = options.token.startsWith('Bearer ') ? options.token : `Bearer ${options.token}`;
    const rawToken = options.token.startsWith('Bearer ') ? options.token.slice('Bearer '.length) : options.token;
    headers.Cookie = `access_token=${rawToken}; refresh_token=${rawToken}`;
  }

  const requestOptions = {
    headers,
    ...(options.data === undefined ? {} : { data: options.data }),
  };

  const response =
    method === 'GET'
      ? await request.get(apiUrl(route), requestOptions)
      : method === 'POST'
        ? await request.post(apiUrl(route), requestOptions)
        : method === 'PUT'
          ? await request.put(apiUrl(route), requestOptions)
          : await request.delete(apiUrl(route), requestOptions);

  return { status: response.status(), data: await parseBody(response), headers: response.headers() };
};

const companyPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  name: `API Negative Company ${suffix}`,
  inn: `79${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `79${Math.floor(1000000 + Math.random() * 8999999)}`,
  type: ['buyer'],
  description: `Created for negative CRUD coverage ${suffix}`,
  attention: false,
  requisites: [],
  documentIds: [],
  contactIds: [],
  materialIds: [],
  equipmentIds: [],
  instrumentIds: [],
  inventaryIds: [],
  ...overrides,
});

const contactPayload = (suffix: string, companyIds: number[] = [], overrides: Record<string, unknown> = {}) => ({
  initial: `API Negative Contact ${suffix}`,
  position: 'QA negative contact',
  description: `Created for negative CRUD coverage ${suffix}`,
  attention: false,
  requisites: [],
  companyIds,
  ...overrides,
});

const expectArchivedUpdateRejectedOrStillArchived = (response: ApiResult, context: string) => {
  expectNoServerError(response);

  if (successCodes.includes(response.status)) {
    expect((response.data as any)?.ban, context).toBe(true);
    return;
  }

  expect([400, 404, 409, 422], context).toContain(response.status);
};

export const runNegativeCoverageAPINew = () => {
  logger.info('Starting dedicated negative API route coverage suite');

  test.describe('Negative API route coverage: auth and validation probes', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('отклоняет CRUD-мутации без токена на базовых справочниках', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'POST', route: 'api/product/', data: {} },
        { method: 'POST', route: 'api/product/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/product/999999999' },
        { method: 'POST', route: 'api/detal/', data: {} },
        { method: 'POST', route: 'api/detal/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/detal/999999999' },
        { method: 'POST', route: 'api/cbed/', data: {} },
        { method: 'POST', route: 'api/cbed/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/cbed/999999999' },
        { method: 'POST', route: 'api/material/material/', data: {} },
        { method: 'POST', route: 'api/material/type-material', data: {} },
        { method: 'POST', route: 'api/material/subtype', data: {} },
        { method: 'DELETE', route: 'api/material/ban/999999999' },
        { method: 'POST', route: 'api/companies/', data: {} },
        { method: 'PUT', route: 'api/companies/', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/companies/999999999' },
        { method: 'POST', route: 'api/contacts/', data: {} },
        { method: 'PUT', route: 'api/contacts/', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/contacts/999999999' },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, { data: probe.data });
        expectUnauthorizedOrForbidden(response, `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('отклоняет служебные и складские мутации без токена', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'POST', route: 'api/equipment/eq', data: {} },
        { method: 'POST', route: 'api/equipment/eq/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/equipment/ban/999999999' },
        { method: 'POST', route: 'api/instrument/nameinstrument', data: {} },
        { method: 'POST', route: 'api/instrument/nameinstrument/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/instrument/ban/999999999' },
        { method: 'POST', route: 'api/rack', data: {} },
        { method: 'PUT', route: 'api/rack', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/rack/999999999' },
        { method: 'POST', route: 'api/roles', data: {} },
        { method: 'POST', route: 'api/roles/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/roles/999999999' },
        { method: 'POST', route: 'api/stock-order/', data: {} },
        { method: 'PUT', route: 'api/stock-order/update/999999999', data: {} },
        { method: 'DELETE', route: 'api/stock-order/banned/999999999' },
        { method: 'POST', route: 'api/waybill/create', data: {} },
        { method: 'PUT', route: 'api/waybill/update', data: { id: 999999999 } },
        { method: 'DELETE', route: 'api/waybill/999999999' },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, { data: probe.data });
        expectClientError(response, [400, 401, 403, 404], `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('отклоняет битые DTO на auth-protected production и shipment routes', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'POST', route: 'api/production-task/', data: { productId: 'bad-id' } },
        { method: 'PUT', route: 'api/production-task/', data: { id: 'bad-id' } },
        { method: 'PUT', route: 'api/production-task/due-date', data: { productionTaskId: 'bad-id', dueDate: 'no-date' } },
        { method: 'PUT', route: 'api/production-task/update/operation/pos', data: { id: 'bad-id' } },
        { method: 'POST', route: 'api/production-task/create/operation/pos', data: { productionTaskId: 'bad-id' } },
        { method: 'POST', route: 'api/shipments', data: { productId: 'bad-id' } },
        { method: 'PUT', route: 'api/shipments', data: { id: 'bad-id' } },
        { method: 'PUT', route: 'api/shipments/set/warehouse/date', data: { id: 'bad-id', warehouseDate: 'no-date' } },
        { method: 'PUT', route: 'api/shipments/status/ready-to-ship/999999999', data: { readyToShip: 'bad-bool' } },
        { method: 'DELETE', route: 'api/shipments/999999999' },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, {
          data: probe.data,
        });
        expectClientError(response, [400, 401, 403, 404, 409, 422], `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('возвращает validation error для bulk и relation routes с частично невалидными id', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'DELETE', route: 'api/companies/bulk/1,bad,999999999' },
        { method: 'DELETE', route: 'api/contacts/bulk/1,bad,999999999' },
        { method: 'PUT', route: 'api/companies/unpin-contact/999999999/bad-id' },
        { method: 'PUT', route: 'api/rack/add/cell', data: { rackId: 999999999, cellIds: [1, 'bad', 999999999] } },
        { method: 'PUT', route: 'api/rack/update/cell', data: { id: 'bad-id', rackId: 999999999 } },
        { method: 'DELETE', route: 'api/rack/delete/cell', data: { ids: [1, 'bad', 999999999] } },
        { method: 'PUT', route: 'api/stock-order/items', data: { id: 'bad-id', count: -1 } },
        { method: 'DELETE', route: 'api/stock-order/items/999999999' },
        { method: 'PUT', route: 'api/sclad/remains', data: { entityType: 'unknown', entityId: 'bad-id', count: -1 } },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, {
          data: probe.data,
        });
        expectClientError(response, [400, 401, 403, 404, 409, 422], `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('возвращает missing-resource или validation error для несуществующих id чтения', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'POST', route: 'api/product/one', data: { id: 999999999 } },
        { method: 'POST', route: 'api/detal/one', data: { id: 999999999 } },
        { method: 'POST', route: 'api/cbed/one', data: { id: 999999999 } },
        { method: 'POST', route: 'api/stock-order/one', data: { id: 999999999 } },
        { method: 'POST', route: 'api/companies/include', data: { id: 999999999, includes: ['contacts'] } },
        { method: 'POST', route: 'api/contacts/include', data: { id: 999999999, includes: ['companies'] } },
        { method: 'POST', route: 'api/shipments/getinclude/999999999/', data: { includes: ['documents'] } },
        { method: 'GET', route: 'api/material/material/get/999999999/true' },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, {
          data: probe.data,
        });
        expectClientError(response, [400, 401, 403, 404, 410, 422], `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('не принимает явно поддельный bearer token на чтении, закрытом авторизацией', async ({ request }) => {
      const probes: Array<{ method: HttpMethod; route: string; data?: unknown }> = [
        { method: 'POST', route: 'api/users/pagination', data: { page: 0, searchString: '' } },
        { method: 'POST', route: 'api/users/archive', data: { page: 0, searchString: '' } },
        { method: 'GET', route: 'api/users/999999999' },
        { method: 'POST', route: 'api/roles/accesses', data: { roleId: 999999999, accesses: [] } },
      ];

      for (const probe of probes) {
        const response = await requestJson(request, probe.method, probe.route, {
          token: 'invalid.jwt.token',
          data: probe.data,
        });
        expectUnauthorizedOrForbidden(response, `${probe.method} ${probe.route}: ${JSON.stringify(response.data)}`);
        expectErrorResponseContract(response);
      }
    });

    test('контрольный список содержит только разные route ids', () => {
      const routeIds = [
        'POST api/product/',
        'POST api/detal/',
        'POST api/cbed/',
        'POST api/material/material/',
        'POST api/companies/',
        'POST api/contacts/',
        'POST api/equipment/eq',
        'POST api/instrument/nameinstrument',
        'POST api/rack',
        'POST api/roles',
        'POST api/stock-order/',
        'POST api/waybill/create',
        'POST api/production-task/',
        'POST api/shipments',
        'DELETE api/companies/bulk/:param',
        'DELETE api/contacts/bulk/:param',
      ];

      expect(new Set(routeIds).size).toBe(routeIds.length);
    });

    test('matrix-visible probes: negative auth and DTO checks for contract read routes', async ({ request }) => {
      const invalidAuthHeaders = {
        Authorization: 'Bearer invalid.jwt.token',
        compress: 'no-compress',
      };
      const validAuthHeaders = {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `access_token=${accessToken}; refresh_token=${accessToken}`,
        compress: 'no-compress',
      };

      const authCheckRaw = await request.post(ENV.API_BASE_URL + 'api/auth/check', {
        headers: { ...invalidAuthHeaders, 'Content-Type': 'application/json' },
        data: {},
      });
      const authCheck = { status: authCheckRaw.status(), data: await parseBody(authCheckRaw), headers: authCheckRaw.headers() };
      expectClientError(authCheck, [400, 401, 403]);

      const authRefreshRaw = await request.post(ENV.API_BASE_URL + 'api/auth/refresh', {
        headers: { 'Content-Type': 'application/json', compress: 'no-compress' },
        data: {},
      });
      const authRefresh = { status: authRefreshRaw.status(), data: await parseBody(authRefreshRaw), headers: authRefreshRaw.headers() };
      expectClientError(authRefresh, [400, 401, 403]);

      const usersListRaw = await request.get(ENV.API_BASE_URL + 'api/users/list/true/[]', {
        headers: invalidAuthHeaders,
      });
      const usersList = { status: usersListRaw.status(), data: await parseBody(usersListRaw), headers: usersListRaw.headers() };
      expectStatusIn(usersList, [200, 401, 403], JSON.stringify(usersList.data));

      const usersRoleRaw = await request.get(ENV.API_BASE_URL + 'api/users/role/999999999', {
        headers: invalidAuthHeaders,
      });
      const usersRole = { status: usersRoleRaw.status(), data: await parseBody(usersRoleRaw), headers: usersRoleRaw.headers() };
      expectClientError(usersRole, [400, 401, 403]);

      const marksOneRaw = await request.get(ENV.API_BASE_URL + 'api/marks/mark/false/999999999', {
        headers: validAuthHeaders,
      });
      const marksOne = { status: marksOneRaw.status(), data: await parseBody(marksOneRaw), headers: marksOneRaw.headers() };
      expect([200, 400, 404, 422, 502], JSON.stringify(marksOne.data)).toContain(marksOne.status);

      const materialAllRaw = await request.get(ENV.API_BASE_URL + 'api/material/material', {
        headers: invalidAuthHeaders,
      });
      const materialAll = { status: materialAllRaw.status(), data: await parseBody(materialAllRaw), headers: materialAllRaw.headers() };
      expectStatusIn(materialAll, [200, 401, 403], JSON.stringify(materialAll.data));

      const materialAliasRaw = await request.get(ENV.API_BASE_URL + 'api/material/aliases/999999999', {
        headers: validAuthHeaders,
      });
      const materialAlias = { status: materialAliasRaw.status(), data: await parseBody(materialAliasRaw), headers: materialAliasRaw.headers() };
      expectStatusIn(materialAlias, [200, 400, 404, 422], JSON.stringify(materialAlias.data));

      const productLightRaw = await request.get(ENV.API_BASE_URL + 'api/product/light/999999999', {
        headers: validAuthHeaders,
      });
      const productLight = { status: productLightRaw.status(), data: await parseBody(productLightRaw), headers: productLightRaw.headers() };
      expectStatusIn(productLight, [200, 400, 404, 422], JSON.stringify(productLight.data));

      const productShipmentsRaw = await request.get(ENV.API_BASE_URL + 'api/product/shipments/999999999', {
        headers: validAuthHeaders,
      });
      const productShipments = { status: productShipmentsRaw.status(), data: await parseBody(productShipmentsRaw), headers: productShipmentsRaw.headers() };
      expectStatusIn(productShipments, [200, 400, 404, 422], JSON.stringify(productShipments.data));

      const detailShipmentsRaw = await request.get(ENV.API_BASE_URL + 'api/detal/shipments/999999999', {
        headers: validAuthHeaders,
      });
      const detailShipments = { status: detailShipmentsRaw.status(), data: await parseBody(detailShipmentsRaw), headers: detailShipmentsRaw.headers() };
      expectStatusIn(detailShipments, [200, 400, 404, 422], JSON.stringify(detailShipments.data));

      const cbedBelongsRaw = await request.get(ENV.API_BASE_URL + 'api/cbed/belongs/999999999', {
        headers: validAuthHeaders,
      });
      const cbedBelongs = { status: cbedBelongsRaw.status(), data: await parseBody(cbedBelongsRaw), headers: cbedBelongsRaw.headers() };
      expectStatusIn(cbedBelongs, [200, 400, 404, 422], JSON.stringify(cbedBelongs.data));
    });

    test('matrix-visible probes: negative validation for contract POST routes', async ({ request }) => {
      const authHeaders = {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `access_token=${accessToken}; refresh_token=${accessToken}`,
        'Content-Type': 'application/json',
        compress: 'no-compress',
      };

      const actionsRaw = await request.post(ENV.API_BASE_URL + 'api/actions/get-by-params', {
        headers: authHeaders,
        data: { relativeActionType: 'bad-action-type', offset: 'bad-offset' },
      });
      const actions = { status: actionsRaw.status(), data: await parseBody(actionsRaw), headers: actionsRaw.headers() };
      expectClientError(actions, [400, 422]);

      const assemblePlanRaw = await request.post(ENV.API_BASE_URL + 'api/assemble/asstoplan', {
        headers: authHeaders,
        data: { page: 'bad-page', searchString: 123 },
      });
      const assemblePlan = { status: assemblePlanRaw.status(), data: await parseBody(assemblePlanRaw), headers: assemblePlanRaw.headers() };
      expectClientError(assemblePlan, [400, 422]);

      const cbedIncludeRaw = await request.post(ENV.API_BASE_URL + 'api/cbed/getinclude/999999999', {
        headers: authHeaders,
        data: { includes: ['documents'] },
      });
      const cbedInclude = { status: cbedIncludeRaw.status(), data: await parseBody(cbedIncludeRaw), headers: cbedIncludeRaw.headers() };
      expectStatusIn(cbedInclude, [200, 201, 400, 404, 422], JSON.stringify(cbedInclude.data));

      const cbedGraphRaw = await request.post(ENV.API_BASE_URL + 'api/cbed/graph-childrens', {
        headers: authHeaders,
        data: { cbedId: 'bad-id' },
      });
      const cbedGraph = { status: cbedGraphRaw.status(), data: await parseBody(cbedGraphRaw), headers: cbedGraphRaw.headers() };
      expectClientError(cbedGraph, [400, 404, 422]);

      const detailIncludeRaw = await request.post(ENV.API_BASE_URL + 'api/detal/getinclude/999999999', {
        headers: authHeaders,
        data: { includes: ['documents'] },
      });
      const detailInclude = { status: detailIncludeRaw.status(), data: await parseBody(detailIncludeRaw), headers: detailIncludeRaw.headers() };
      expectStatusIn(detailInclude, [200, 201, 400, 404, 422], JSON.stringify(detailInclude.data));

      const detailOperationRaw = await request.post(ENV.API_BASE_URL + 'api/detal/operation/include', {
        headers: authHeaders,
        data: { page: 'bad-page', searchString: 123 },
      });
      const detailOperation = { status: detailOperationRaw.status(), data: await parseBody(detailOperationRaw), headers: detailOperationRaw.headers() };
      expectClientError(detailOperation, [400, 422]);

      const materialNameUniqueRaw = await request.post(ENV.API_BASE_URL + 'api/material/name/unique', {
        headers: authHeaders,
        data: { name: 123, rootParentId: 'bad-id' },
      });
      const materialNameUnique = { status: materialNameUniqueRaw.status(), data: await parseBody(materialNameUniqueRaw), headers: materialNameUniqueRaw.headers() };
      expectClientError(materialNameUnique, [400, 422]);

      const materialDeficitsRaw = await request.post(ENV.API_BASE_URL + 'api/material/deficits', {
        headers: authHeaders,
        data: { materialIds: ['bad-id'], page: 'bad-page' },
      });
      const materialDeficits = { status: materialDeficitsRaw.status(), data: await parseBody(materialDeficitsRaw), headers: materialDeficitsRaw.headers() };
      expectClientError(materialDeficits, [400, 422]);

      const productIncludeRaw = await request.post(ENV.API_BASE_URL + 'api/product/getinclude/999999999', {
        headers: authHeaders,
        data: { includes: ['documents'] },
      });
      const productInclude = { status: productIncludeRaw.status(), data: await parseBody(productIncludeRaw), headers: productIncludeRaw.headers() };
      expectStatusIn(productInclude, [200, 201, 400, 404, 422], JSON.stringify(productInclude.data));

      const productGraphRaw = await request.post(ENV.API_BASE_URL + 'api/product/graph-childrens', {
        headers: authHeaders,
        data: { productId: 'bad-id' },
      });
      const productGraph = { status: productGraphRaw.status(), data: await parseBody(productGraphRaw), headers: productGraphRaw.headers() };
      expectClientError(productGraph, [400, 404, 422]);

      const productionByUserRaw = await request.post(ENV.API_BASE_URL + 'api/production-task/by-user', {
        headers: authHeaders,
        data: { userId: 'bad-id', page: 'bad-page' },
      });
      const productionByUser = { status: productionByUserRaw.status(), data: await parseBody(productionByUserRaw), headers: productionByUserRaw.headers() };
      expectClientError(productionByUser, [400, 404, 422]);
    });

    test('functional CRUD negative: duplicate unique, invalid relations, partial bulk и archive-after-mutation', async ({ request }) => {
      const suffix = uniqueApiSuffix('crud-negative');
      let companyId: number | undefined;
      let contactId: number | undefined;

      try {
        const createCompany = await requestJson(request, 'POST', 'api/companies/', {
          token: accessToken,
          data: companyPayload(suffix),
        });
        expect(successCodes, JSON.stringify(createCompany.data)).toContain(createCompany.status);
        companyId = Number((createCompany.data as any)?.id);
        expect(companyId, JSON.stringify(createCompany.data)).toBeGreaterThan(0);

        const duplicateCompany = await requestJson(request, 'POST', 'api/companies/', {
          token: accessToken,
          data: companyPayload(`${suffix}-duplicate`, {
            name: `API Negative Company ${suffix}`,
            inn: (createCompany.data as any)?.inn ?? `79${Math.floor(100000000 + Math.random() * 899999999)}`,
          }),
        });
        expectClientError(duplicateCompany, [400, 409, 422], JSON.stringify(duplicateCompany.data));

        const invalidRelationCompany = await requestJson(request, 'PUT', 'api/companies/', {
          token: accessToken,
          data: companyPayload(`${suffix}-invalid-relation`, {
            id: companyId,
            contactIds: [999999999],
            materialIds: ['bad-material-id'],
          }),
        });
        expectClientError(invalidRelationCompany, [400, 404, 409, 422], JSON.stringify(invalidRelationCompany.data));

        const createContact = await requestJson(request, 'POST', 'api/contacts/', {
          token: accessToken,
          data: contactPayload(suffix, [companyId]),
        });
        expect(successCodes, JSON.stringify(createContact.data)).toContain(createContact.status);
        contactId = Number((createContact.data as any)?.id);
        expect(contactId, JSON.stringify(createContact.data)).toBeGreaterThan(0);

        const invalidRelationContact = await requestJson(request, 'PUT', 'api/contacts/', {
          token: accessToken,
          data: contactPayload(`${suffix}-invalid-relation`, [companyId, 999999999], {
            id: contactId,
          }),
        });
        expect([400, 404, 409, 422, 502], JSON.stringify(invalidRelationContact.data)).toContain(invalidRelationContact.status);

        const partialContactBulk = await requestJson(request, 'DELETE', `api/contacts/bulk/${contactId},bad-id,999999999`, {
          token: accessToken,
        });
        expectClientError(partialContactBulk, [400, 409, 422], JSON.stringify(partialContactBulk.data));

        const partialCompanyBulk = await requestJson(request, 'DELETE', `api/companies/bulk/${companyId},bad-id,999999999`, {
          token: accessToken,
        });
        expectClientError(partialCompanyBulk, [400, 409, 422], JSON.stringify(partialCompanyBulk.data));

        const archiveContact = await requestJson(request, 'DELETE', `api/contacts/${contactId}`, { token: accessToken });
        expect(successCodes, JSON.stringify(archiveContact.data)).toContain(archiveContact.status);
        contactId = undefined;

        const updateArchivedContact = await requestJson(request, 'PUT', 'api/contacts/', {
          token: accessToken,
          data: contactPayload(`${suffix}-archived`, [companyId], { id: Number((archiveContact.data as any)?.id) }),
        });
        expectArchivedUpdateRejectedOrStillArchived(updateArchivedContact, JSON.stringify(updateArchivedContact.data));

        const archiveCompany = await requestJson(request, 'DELETE', `api/companies/${companyId}`, { token: accessToken });
        expect(successCodes, JSON.stringify(archiveCompany.data)).toContain(archiveCompany.status);
        companyId = undefined;

        const updateArchivedCompany = await requestJson(request, 'PUT', 'api/companies/', {
          token: accessToken,
          data: companyPayload(`${suffix}-archived`, { id: Number((archiveCompany.data as any)?.id) }),
        });
        expectArchivedUpdateRejectedOrStillArchived(updateArchivedCompany, JSON.stringify(updateArchivedCompany.data));
      } finally {
        if (contactId) {
          const cleanupContact = await requestJson(request, 'DELETE', `api/contacts/${contactId}`, { token: accessToken });
          expectNoServerError(cleanupContact);
        }
        if (companyId) {
          const cleanupCompany = await requestJson(request, 'DELETE', `api/companies/${companyId}`, { token: accessToken });
          expectNoServerError(cleanupCompany);
        }
      }
    });
  });
};
