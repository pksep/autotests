import { test, expect } from '@playwright/test';
import { ContactsAPI } from '../../pages/API/APIContacts';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectMissingResource,
  expectNoServerError,
  expectPaginationContract,
  expectUnauthorizedOrForbidden,
  expectValidationError,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { expectRepeatOperationRejectedOrIdempotent } from '../../lib/helpers/APIDataInvariants';

type EntityLike = Record<string, any>;

const contactsAPI = new ContactsAPI(null as any);
const companiesAPI = new CompaniesAPI(null);

const contactPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  isBan: false,
  companyIds: [],
  filterByTypes: [],
  ...overrides,
});

const companyPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  name: `API Contact Company ${suffix}`,
  inn: `77${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `77${Math.floor(1000000 + Math.random() * 8999999)}`,
  type: ['buyer'],
  description: `Created for Contacts API autotest ${suffix}`,
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
  initial: `API Contact ${suffix}`,
  position: 'QA contact',
  description: `Created by API autotest ${suffix}`,
  attention: false,
  requisites: [],
  companyIds,
  ...overrides,
});

const expectContactShape = (contact: EntityLike) => {
  expect(contact).toBeTruthy();
  expect(typeof contact.id, JSON.stringify(contact)).toBe('number');
  expect(contact.initial, JSON.stringify(contact)).toBeTruthy();
};

const findContactByName = async (request: any, initial: string, accessToken?: string) => {
  const response = await eventually(async () => {
    const result = await contactsAPI.getContactsPagination(request, contactPaginationDto({ searchString: initial }), accessToken);
    expectNoServerError(result);
    return result;
  }, (result) => getRows<EntityLike>(result.data).some((row) => row.initial === initial));

  return response ? getRows<EntityLike>(response.data).find((row) => row.initial === initial) : undefined;
};

const waitForContactInActiveSearch = async (
  request: any,
  initial: string,
  contactId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const result = await contactsAPI.getContactsPagination(request, contactPaginationDto({ searchString: initial }), accessToken);
    expectNoServerError(result);
    return result;
  }, (result) => getRows<EntityLike>(result.data).some((row) => row.id === contactId) === expectedPresent);

  return Boolean(response);
};

export const runContactsAPINew = () => {
  logger.info('Starting Contacts API coverage suite');

  test.describe.serial('Contacts API: жизненный цикл контакта', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let companyId: number | undefined;
    let contactId: number | undefined;
    let contactName = '';
    let updatedContactName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (contactId) {
        const response = await contactsAPI.banContact(request, contactId, accessToken);
        expectNoServerError(response);
      }
      if (companyId) {
        const response = await companiesAPI.banCompany(request, companyId, accessToken);
        expectNoServerError(response);
      }
    });

    test('создает компанию-зависимость для проверки связи контакта', async ({ request }) => {
      const suffix = uniqueApiSuffix('contact-company');
      const createCompany = await companiesAPI.createCompany(request, companyPayload(suffix), accessToken);
      expect(successCodes, JSON.stringify(createCompany.data)).toContain(createCompany.status);
      expectNoServerError(createCompany);
      expect(createCompany.data?.id, JSON.stringify(createCompany.data)).toBeTruthy();
      companyId = Number(createCompany.data.id);
    });

    test('создает контакт и находит его в пагинации', async ({ request }) => {
      expect(companyId).toBeTruthy();
      const suffix = uniqueApiSuffix('contact');
      contactName = `API Contact ${suffix}`;
      updatedContactName = `API Contact Updated ${suffix}`;

      const createContact = await contactsAPI.createContact(request, contactPayload(suffix, [companyId as number]), accessToken);
      expect(successCodes, JSON.stringify(createContact.data)).toContain(createContact.status);
      expectNoServerError(createContact);
      contactId = Number(createContact.data?.id);
      expect(contactId, JSON.stringify(createContact.data)).toBeTruthy();

      const created = await findContactByName(request, contactName, accessToken);
      expect(created, `Contact ${contactName} was not found after create`).toBeTruthy();
      expectContactShape(created as EntityLike);
    });

    test('читает контакт по id и include companies', async ({ request }) => {
      expect(contactId).toBeTruthy();
      const byId = await contactsAPI.getContactById(request, contactId as number, accessToken);
      expect(successCodes).toContain(byId.status);
      expectContactShape(byId.data);
      expect(byId.data.initial).toBe(contactName);

      const include = await contactsAPI.getInclude(request, { id: contactId, includes: ['companies'] }, accessToken);
      expectNoServerError(include);
      if (!clientErrorCodes.includes(include.status)) {
        expect(successCodes).toContain(include.status);
        expect(Array.isArray(include.data?.companies), JSON.stringify(include.data)).toBe(true);
        expect(include.data.companies.some((company: EntityLike) => company.id === companyId)).toBe(true);
      }
    });

    test('обновляет контакт и сохраняет связь с компанией', async ({ request }) => {
      expect(contactId).toBeTruthy();
      const updateContact = await contactsAPI.updateContact(
        request,
        contactPayload(updatedContactName.replace('API Contact ', ''), [companyId as number], {
          id: contactId,
          initial: updatedContactName,
          position: 'QA contact updated',
          attention: true,
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateContact.data)).toContain(updateContact.status);
      expectNoServerError(updateContact);
      expect(updateContact.data?.id).toBe(contactId);

      const updated = await findContactByName(request, updatedContactName, accessToken);
      expect(updated, `Contact ${updatedContactName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(contactId);
      expect(updated?.initial).toBe(updatedContactName);
      expect(updated?.attention).toBe(true);
      expect(await waitForContactInActiveSearch(request, contactName, contactId as number, false, accessToken)).toBe(true);

      const attentionFiltered = await contactsAPI.getContactsPagination(
        request,
        contactPaginationDto({ searchString: updatedContactName, isSortedByAttention: true }),
        accessToken,
      );
      expectNoServerError(attentionFiltered);
      expect(successCodes, JSON.stringify(attentionFiltered.data)).toContain(attentionFiltered.status);
      expect(getRows<EntityLike>(attentionFiltered.data).some((row) => row.id === contactId), JSON.stringify(attentionFiltered.data)).toBe(true);

      const byId = await contactsAPI.getContactById(request, contactId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expect(byId.data?.id, JSON.stringify(byId.data)).toBe(contactId);
      expect(byId.data?.initial, JSON.stringify(byId.data)).toBe(updatedContactName);
      expect(byId.data?.position, JSON.stringify(byId.data)).toBe('QA contact updated');

      const include = await contactsAPI.getInclude(request, { id: contactId, includes: ['companies'] }, accessToken);
      expectNoServerError(include);
      if (!clientErrorCodes.includes(include.status)) {
        expect(successCodes).toContain(include.status);
        expect(Array.isArray(include.data?.companies), JSON.stringify(include.data)).toBe(true);
        expect(include.data.companies.some((company: EntityLike) => company.id === companyId), JSON.stringify(include.data)).toBe(true);
      }

      const noAuthUpdate = await contactsAPI.updateContact(
        request,
        contactPayload(updatedContactName.replace('API Contact ', ''), [companyId as number], {
          id: contactId,
          initial: updatedContactName,
          position: 'No-auth update probe',
          attention: false,
        }),
      );
      expectUnauthorizedOrForbidden(noAuthUpdate);

      const afterNoAuthUpdate = await contactsAPI.getContactById(request, contactId as number, accessToken);
      expectNoServerError(afterNoAuthUpdate);
      expect(successCodes, JSON.stringify(afterNoAuthUpdate.data)).toContain(afterNoAuthUpdate.status);
      expect(afterNoAuthUpdate.data?.position, JSON.stringify(afterNoAuthUpdate.data)).toBe('QA contact updated');

      const attentionAfterNoAuth = await contactsAPI.getContactsPagination(
        request,
        contactPaginationDto({ searchString: updatedContactName, isSortedByAttention: true }),
        accessToken,
      );
      expectNoServerError(attentionAfterNoAuth);
      expect(successCodes, JSON.stringify(attentionAfterNoAuth.data)).toContain(attentionAfterNoAuth.status);
      expect(getRows<EntityLike>(attentionAfterNoAuth.data).some((row) => row.id === contactId), JSON.stringify(attentionAfterNoAuth.data)).toBe(true);
    });

    test('архивирует контакт и проверяет архивную выдачу', async ({ request }) => {
      expect(contactId).toBeTruthy();
      const response = await contactsAPI.banContact(request, contactId as number, accessToken);
      expect(successCodes).toContain(response.status);
      expectNoServerError(response);

      const archived = await eventually(async () => {
        const result = await contactsAPI.getContactsPagination(
          request,
          contactPaginationDto({ searchString: updatedContactName, isBan: true }),
          accessToken,
        );
        expectNoServerError(result);
        return result;
      }, (result) => getRows<EntityLike>(result.data).some((row) => row.id === contactId));

      expect(archived, `Contact ${updatedContactName} was not found in archive`).toBeTruthy();
      expect(
        getRows<EntityLike>(archived!.data).some((row) => row.id === contactId && row.ban === true),
        JSON.stringify(archived!.data),
      ).toBe(true);
      expect(await waitForContactInActiveSearch(request, updatedContactName, contactId as number, false, accessToken)).toBe(true);

      const archivedById = await contactsAPI.getContactById(request, contactId as number, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status)) {
        expect(successCodes, JSON.stringify(archivedById.data)).toContain(archivedById.status);
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(contactId);
        expect(archivedById.data?.ban, JSON.stringify(archivedById.data)).toBe(true);
      }

      const companyInclude = await companiesAPI.getInclude(request, { id: companyId, includes: ['contacts'] }, accessToken);
      expectNoServerError(companyInclude);
      if (!clientErrorCodes.includes(companyInclude.status)) {
        expect(successCodes).toContain(companyInclude.status);
        expect(Array.isArray(companyInclude.data?.contacts), JSON.stringify(companyInclude.data)).toBe(true);
        expect(
          companyInclude.data.contacts.some((contact: EntityLike) => contact.id === contactId && contact.ban !== true),
          JSON.stringify(companyInclude.data),
        ).toBe(false);
      }

      const secondArchive = await contactsAPI.banContact(request, contactId as number, accessToken);
      expectNoServerError(secondArchive);
      expectRepeatOperationRejectedOrIdempotent(response.status, secondArchive.status, successCodes, [400, 404, 409, 410, 422]);

      const bulkArchive = await contactsAPI.banContactsBulk(request, [contactId as number, 999999999], accessToken);
      expectNoServerError(bulkArchive);
      expectRepeatOperationRejectedOrIdempotent(response.status, bulkArchive.status, successCodes, [400, 404, 409, 410, 422]);

      const noAuthArchive = await contactsAPI.banContact(request, contactId as number);
      expectUnauthorizedOrForbidden(noAuthArchive);

      const updateArchived = await contactsAPI.updateContact(
        request,
        contactPayload(updatedContactName.replace('API Contact ', ''), [], {
          id: contactId,
          initial: updatedContactName,
          position: 'QA contact archived update',
          attention: true,
        }),
        accessToken,
      );
      expectNoServerError(updateArchived);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(updateArchived.data)).toContain(updateArchived.status);

      const noAuthUpdateArchived = await contactsAPI.updateContact(
        request,
        contactPayload(updatedContactName.replace('API Contact ', ''), [], {
          id: contactId,
          initial: updatedContactName,
          position: 'No-auth archived update probe',
          attention: false,
        }),
      );
      expectUnauthorizedOrForbidden(noAuthUpdateArchived);

      expect(await waitForContactInActiveSearch(request, updatedContactName, contactId as number, false, accessToken)).toBe(true);
      contactId = undefined;
    });
  });

  test.describe('Contacts API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу контактов с count и rows', async ({ request }) => {
      const response = await contactsAPI.getContactsPagination(request, contactPaginationDto(), accessToken);
      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
      expectPaginationContract(response.data);

      const rows = getRows<EntityLike>(response.data);
      if (rows.length > 0) expectContactShape(rows[0]);
    });

    test('поддерживает пустой поиск и дальнюю страницу без 5xx', async ({ request }) => {
      const empty = await contactsAPI.getContactsPagination(
        request,
        contactPaginationDto({ searchString: 'api-contact-no-match-999999999' }),
        accessToken,
      );
      expect(empty.status).toBe(201);
      expect(getRows(empty.data)).toEqual([]);

      const farPage = await contactsAPI.getContactsPagination(request, contactPaginationDto({ page: 999999 }), accessToken);
      expectNoServerError(farPage);
    });

    test('обрабатывает некорректный include без падения тестового раннера', async ({ request }) => {
      const include = await contactsAPI.getInclude(request, { id: 999999999, includes: ['companies'] }, accessToken);
      expectNoServerError(include);
    });

    test('отклоняет невалидные мутации и bulk ids без серверных ошибок', async ({ request }) => {
      const create = await contactsAPI.createContact(request, { initial: '', companyIds: [] }, accessToken);
      expectNoServerError(create);
      if (successCodes.includes(create.status)) {
        if (create.data?.id) {
          const cleanup = await contactsAPI.banContact(request, Number(create.data.id), accessToken);
          expectNoServerError(cleanup);
        }
      } else {
        expectValidationError(create);
      }

      const bulk = await contactsAPI.banContactsBulk(request, 'abc,def', accessToken);
      expectValidationError(bulk);
    });

    test('не пропускает мутации без авторизации', async ({ request }) => {
      const response = await contactsAPI.createContact(request, contactPayload(uniqueApiSuffix('noauth')));
      expectUnauthorizedOrForbidden(response);
    });

    test('bulk archive архивирует несколько валидных контактов без активных хвостов', async ({ request }) => {
      const suffix = uniqueApiSuffix('bulk-contact');
      const firstName = `API Contact ${suffix} A`;
      const secondName = `API Contact ${suffix} B`;
      const createdIds: number[] = [];

      try {
        const first = await contactsAPI.createContact(
          request,
          contactPayload(`${suffix} A`, [], { initial: firstName }),
          accessToken,
        );
        expect(successCodes, JSON.stringify(first.data)).toContain(first.status);
        expectNoServerError(first);
        createdIds.push(Number(first.data?.id));

        const second = await contactsAPI.createContact(
          request,
          contactPayload(`${suffix} B`, [], { initial: secondName }),
          accessToken,
        );
        expect(successCodes, JSON.stringify(second.data)).toContain(second.status);
        expectNoServerError(second);
        createdIds.push(Number(second.data?.id));

        const bulk = await contactsAPI.banContactsBulk(request, createdIds, accessToken);
        expectNoServerError(bulk);
        expect(successCodes, JSON.stringify(bulk.data)).toContain(bulk.status);

        for (const [index, id] of createdIds.entries()) {
          const name = index === 0 ? firstName : secondName;
          expect(await waitForContactInActiveSearch(request, name, id, false, accessToken)).toBe(true);

          const archived = await contactsAPI.getContactsPagination(
            request,
            contactPaginationDto({ searchString: name, isBan: true }),
            accessToken,
          );
          expectNoServerError(archived);
          if (!clientErrorCodes.includes(archived.status)) {
            expect(successCodes, JSON.stringify(archived.data)).toContain(archived.status);
          }

          const byId = await contactsAPI.getContactById(request, id, accessToken);
          expectNoServerError(byId);
          if (clientErrorCodes.includes(byId.status)) {
            expectMissingResource(byId);
          } else {
            expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
            expect(byId.data?.ban, JSON.stringify(byId.data)).toBe(true);
          }
        }
      } finally {
        for (const id of createdIds) {
          const cleanup = await contactsAPI.banContact(request, id, accessToken);
          expectNoServerError(cleanup);
        }
      }
    });

    test('обрабатывает защитные поисковые строки без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await contactsAPI.getContactsPagination(request, contactPaginationDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });
  });
};
