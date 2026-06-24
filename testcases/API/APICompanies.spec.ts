import { test, expect } from '@playwright/test';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { ContactsAPI } from '../../pages/API/APIContacts';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type EntityLike = Record<string, any>;

const companiesAPI = new CompaniesAPI(null);
const contactsAPI = new ContactsAPI(null as any);
const materialsAPI = new MaterialsAPI(null as any);

const companyPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  filterByTypes: [],
  isFilteredByInboundSupplier: false,
  isBan: false,
  filterByEntities: {
    materialIds: [],
    equipmentIds: [],
    instrumentIds: [],
    inventaryIds: [],
  },
  ...overrides,
});

const materialPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  instans: 1,
  searchString: '',
  typeMaterialId: null,
  subtypeMaterialId: null,
  filterByAttention: false,
  filterByTime: true,
  ...overrides,
});

const companyPayload = (suffix: string, contactIds: number[] = [], overrides: Record<string, unknown> = {}) => ({
  name: `API Company ${suffix}`,
  inn: `78${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `78${Math.floor(1000000 + Math.random() * 8999999)}`,
  type: ['buyer', 'provider'],
  description: `Created by API autotest ${suffix}`,
  attention: false,
  requisites: [],
  documentIds: [],
  contactIds,
  materialIds: [],
  equipmentIds: [],
  instrumentIds: [],
  inventaryIds: [],
  ...overrides,
});

const contactPayload = (suffix: string, companyIds: number[] = [], overrides: Record<string, unknown> = {}) => ({
  initial: `API Company Contact ${suffix}`,
  position: 'QA contact',
  description: `Created for Companies API autotest ${suffix}`,
  attention: false,
  requisites: [],
  companyIds,
  ...overrides,
});

const expectCompanyShape = (company: EntityLike) => {
  expect(company).toBeTruthy();
  expect(typeof company.id, JSON.stringify(company)).toBe('number');
  expect(company.name, JSON.stringify(company)).toBeTruthy();
};

const findCompanyByName = async (request: any, name: string, accessToken?: string) => {
  const response = await eventually(async () => {
    const result = await companiesAPI.getCompaniesPagination(request, companyPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(result);
    return result;
  }, (result) => getRows<EntityLike>(result.data).some((row) => row.name === name));

  return response ? getRows<EntityLike>(response.data).find((row) => row.name === name) : undefined;
};

export const runCompaniesAPINew = () => {
  logger.info('Starting Companies API coverage suite');

  test.describe.serial('Companies API: жизненный цикл компании', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let companyId: number | undefined;
    let contactId: number | undefined;
    let linkedMaterialId: number | undefined;
    let companyName = '';
    let updatedCompanyName = '';

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

    test('создает компанию и находит ее в пагинации', async ({ request }) => {
      const suffix = uniqueApiSuffix('company');
      companyName = `API Company ${suffix}`;
      updatedCompanyName = `API Company Updated ${suffix}`;

      const uniqueBefore = await companiesAPI.checkName(request, companyName, accessToken);
      expectNoServerError(uniqueBefore);

      const create = await companiesAPI.createCompany(request, companyPayload(suffix), accessToken);
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);
      companyId = Number(create.data?.id);
      expect(companyId, JSON.stringify(create.data)).toBeTruthy();

      const created = await findCompanyByName(request, companyName, accessToken);
      expect(created, `Company ${companyName} was not found after create`).toBeTruthy();
      expectCompanyShape(created as EntityLike);
    });

    test('создает контакт и привязывает его к компании через обновление', async ({ request }) => {
      expect(companyId).toBeTruthy();
      const suffix = uniqueApiSuffix('company-contact');
      const contact = await contactsAPI.createContact(request, contactPayload(suffix, [companyId as number]), accessToken);
      expect(successCodes, JSON.stringify(contact.data)).toContain(contact.status);
      expectNoServerError(contact);
      contactId = Number(contact.data?.id);
      expect(contactId, JSON.stringify(contact.data)).toBeTruthy();

      const update = await companiesAPI.updateCompany(
        request,
        companyPayload(updatedCompanyName.replace('API Company ', ''), [contactId as number], {
          id: companyId,
          name: updatedCompanyName,
          description: 'Updated by API autotest',
          attention: true,
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);
      expect(update.data?.id).toBe(companyId);

      const updated = await findCompanyByName(request, updatedCompanyName, accessToken);
      expect(updated, `Company ${updatedCompanyName} was not found after update`).toBeTruthy();
      expect(updated?.attention).toBe(true);
    });

    test('привязывает поставщика к материалу и проверяет связь через include и фильтр', async ({ request }) => {
      expect(companyId).toBeTruthy();
      expect(contactId).toBeTruthy();

      const materials = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ pageSize: 1 }), accessToken);
      expect(materials.status).toBe(201);

      const material = getRows<EntityLike>(materials.data).find((row) => row.id && row.ban !== true);
      if (!material) {
        test.skip(true, 'No active material is available to verify provider-material relation.');
        return;
      }
      linkedMaterialId = Number(material.id);

      const update = await companiesAPI.updateCompany(
        request,
        companyPayload(updatedCompanyName.replace('API Company ', ''), [contactId as number], {
          id: companyId,
          name: updatedCompanyName,
          type: ['provider'],
          attention: true,
          materialIds: [linkedMaterialId],
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);

      const include = await companiesAPI.getInclude(request, { id: companyId, includes: ['materials'] }, accessToken);
      expectNoServerError(include);
      expect(successCodes).toContain(include.status);
      expect(Array.isArray(include.data?.materials), JSON.stringify(include.data)).toBe(true);
      expect(include.data.materials.some((item: EntityLike) => item.id === linkedMaterialId)).toBe(true);

      const filtered = await companiesAPI.getCompaniesPagination(
        request,
        companyPaginationDto({
          filterByTypes: ['provider'],
          filterByEntities: {
            materialIds: [linkedMaterialId],
            equipmentIds: [],
            instrumentIds: [],
            inventaryIds: [],
          },
        }),
        accessToken,
      );
      expectNoServerError(filtered);
      expect(successCodes).toContain(filtered.status);
      expect(getRows<EntityLike>(filtered.data).some((company) => company.id === companyId)).toBe(true);

      const materialInclude = await materialsAPI.getIncludeForMaterial(
        request,
        { id: linkedMaterialId, includes: ['companies'] },
        accessToken,
      );
      expectNoServerError(materialInclude);
      if (!clientErrorCodes.includes(materialInclude.status)) {
        expect(successCodes).toContain(materialInclude.status);
        expect(Array.isArray(materialInclude.data?.companies), JSON.stringify(materialInclude.data)).toBe(true);
        expect(materialInclude.data.companies.some((company: EntityLike) => company.id === companyId)).toBe(true);
      }
    });

    test('читает компанию по id и include contacts', async ({ request }) => {
      expect(companyId).toBeTruthy();
      expect(contactId).toBeTruthy();

      const byId = await companiesAPI.getCompanyById(request, companyId as number, accessToken);
      expect(successCodes).toContain(byId.status);
      expectCompanyShape(byId.data);
      expect(byId.data.name).toBe(updatedCompanyName);

      const include = await companiesAPI.getInclude(request, { id: companyId, includes: ['contacts'] }, accessToken);
      expectNoServerError(include);
      if (!clientErrorCodes.includes(include.status)) {
        expect(successCodes).toContain(include.status);
        expect(Array.isArray(include.data?.contacts), JSON.stringify(include.data)).toBe(true);
        expect(include.data.contacts.some((contact: EntityLike) => contact.id === contactId)).toBe(true);
      }
    });

    test('открепляет контакт от компании без серверных ошибок', async ({ request }) => {
      expect(companyId).toBeTruthy();
      expect(contactId).toBeTruthy();

      const response = await companiesAPI.unpinContact(request, companyId as number, contactId as number, accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
      }
    });

    test('архивирует компанию и проверяет архивную выдачу', async ({ request }) => {
      expect(companyId).toBeTruthy();
      const response = await companiesAPI.banCompany(request, companyId as number, accessToken);
      expect(successCodes).toContain(response.status);
      expectNoServerError(response);

      const archived = await eventually(async () => {
        const result = await companiesAPI.getCompaniesPagination(
          request,
          companyPaginationDto({ searchString: updatedCompanyName, isBan: true }),
          accessToken,
        );
        expectNoServerError(result);
        return result;
      }, (result) => getRows<EntityLike>(result.data).some((row) => row.id === companyId));

      expect(archived, `Company ${updatedCompanyName} was not found in archive`).toBeTruthy();
      companyId = undefined;
    });
  });

  test.describe('Companies API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает страницу компаний с count и rows', async ({ request }) => {
      const response = await companiesAPI.getCompaniesPagination(request, companyPaginationDto(), accessToken);
      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
      expectPaginationContract(response.data);

      const rows = getRows<EntityLike>(response.data);
      if (rows.length > 0) expectCompanyShape(rows[0]);
    });

    test('поддерживает фильтр по типу и пустой поиск без 5xx', async ({ request }) => {
      const buyer = await companiesAPI.getCompaniesPagination(request, companyPaginationDto({ filterByTypes: ['buyer'] }), accessToken);
      expectNoServerError(buyer);
      if (!clientErrorCodes.includes(buyer.status)) expect(successCodes).toContain(buyer.status);

      const empty = await companiesAPI.getCompaniesPagination(
        request,
        companyPaginationDto({ searchString: 'api-company-no-match-999999999' }),
        accessToken,
      );
      expect(empty.status).toBe(201);
      expect(getRows(empty.data)).toEqual([]);
    });

    test('не отвечает 5xx на несуществующий id, checkName и include', async ({ request }) => {
      const byId = await companiesAPI.getCompanyById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const check = await companiesAPI.checkName(request, 'api-company-no-match-999999999', accessToken);
      expectNoServerError(check);

      const include = await companiesAPI.getInclude(request, { id: 999999999, includes: ['contacts'] }, accessToken);
      expectNoServerError(include);
    });

    test('отклоняет невалидные мутации и bulk ids без серверных ошибок', async ({ request }) => {
      const create = await companiesAPI.createCompany(request, { name: '', type: [], contactIds: [] }, accessToken);
      expectNoServerError(create);
      if (successCodes.includes(create.status)) {
        test.info().annotations.push({
          type: 'known-api-defect',
          description: 'POST /api/companies accepted a minimal invalid payload.',
        });
        if (create.data?.id) {
          const cleanup = await companiesAPI.banCompany(request, Number(create.data.id), accessToken);
          expectNoServerError(cleanup);
        }
      } else {
        expectNotSuccessful(create);
      }

      const update = await companiesAPI.updateCompany(request, { id: 999999999, name: '', type: [], contactIds: [] }, accessToken);
      expectNotSuccessful(update);

      const bulk = await companiesAPI.banCompaniesBulk(request, 'abc,def', accessToken);
      expectNotSuccessful(bulk);
    });

    test('не пропускает мутации без авторизации', async ({ request }) => {
      const response = await companiesAPI.createCompany(request, companyPayload(uniqueApiSuffix('noauth')));
      expectNotSuccessful(response);
    });

    test('обрабатывает защитные поисковые строки без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await companiesAPI.getCompaniesPagination(request, companyPaginationDto({ searchString }), accessToken);
        expectNoServerError(response);
      }
    });
  });
};
