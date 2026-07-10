import { test, expect } from '@playwright/test';
import { InventoryAPI } from '../../pages/API/APIInventory';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, expectPaginationContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const inventoryAPI = new InventoryAPI(null);

const TYPE = 'TYPE';
const SUBTYPE = 'SUBTYPE';

const inventoryPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeId: null,
  subTypeId: null,
  isFilteredByDate: false,
  isFilteredByOwn: false,
  isFilteredByAttention: false,
  ...overrides,
});

const inventoryPayload = (
  suffix: string,
  typeId: number,
  subtypeId: number,
  overrides: Record<string, unknown> = {},
) => ({
  name: `API Inventory ${suffix}`,
  parentTypeId: typeId,
  parentSubtypeId: subtypeId,
  responsibleUserId: 'null',
  deliveryTime: '0',
  mountUsed: '0',
  minRemaining: '0',
  description: `Created by API autotest ${suffix}`,
  companyIds: '[]',
  docs: 'null',
  documentsBase: '[]',
  attention: false,
  fileBase: '[]',
  ...overrides,
});

const expectBaseShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(typeof row.id, JSON.stringify(row)).toBe('number');
  expect(row.name, JSON.stringify(row)).toBeTruthy();
};

const findInventoryByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await inventoryAPI.getInventoryPagination(request, inventoryPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

const waitForInventoryAbsentFromActivePagination = async (
  request: any,
  inventoryId: number,
  name: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await inventoryAPI.getInventoryPagination(request, inventoryPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => !getRows<ApiRow>(response.data).some((row) => row.id === inventoryId));

  return Boolean(response);
};

export const runInventoryAPINew = () => {
  logger.info('Starting Inventory API coverage suite');

  test.describe.serial('Inventory API: базовый жизненный цикл инвентаря', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let typeId: number | undefined;
    let subtypeId: number | undefined;
    let inventoryId: number | undefined;
    let suffix = '';
    let typeName = '';
    let subtypeName = '';
    let inventoryName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (inventoryId) {
        const archiveInventory = await inventoryAPI.banInventory(request, inventoryId, accessToken);
        expectNoServerError(archiveInventory);
      }
      if (subtypeId) {
        const archiveSubtype = await inventoryAPI.removeInventorySubtype(request, subtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }
      if (typeId) {
        const archiveType = await inventoryAPI.removeInventoryType(request, typeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('создает тип и подтип инвентаря', async ({ request }) => {
      suffix = uniqueApiSuffix('inventory');
      typeName = `API Inventory Type ${suffix}`;
      subtypeName = `API Inventory Subtype ${suffix}`;
      inventoryName = `API Inventory ${suffix}`;

      const uniqueType = await inventoryAPI.checkNameUnique(request, { type: TYPE, name: typeName }, accessToken);
      expectNoServerError(uniqueType);
      if (!clientErrorCodes.includes(uniqueType.status)) {
        expect(Number(uniqueType.data), JSON.stringify(uniqueType.data)).toBe(0);
      }

      const typeResponse = await inventoryAPI.createInventoryType(request, { name: typeName }, accessToken);
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      expectBaseShape(typeResponse.data);
      typeId = Number(typeResponse.data.id);

      const subtypeResponse = await inventoryAPI.createInventorySubtype(
        request,
        { name: subtypeName, inventary_type_id: typeId },
        accessToken,
      );
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      expectBaseShape(subtypeResponse.data);
      subtypeId = Number(subtypeResponse.data.id);
    });

    test('обновляет тип и подтип инвентаря и читает их по id', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      typeName = `${typeName} Updated`;
      subtypeName = `${subtypeName} Updated`;

      const updateType = await inventoryAPI.updateInventoryType(request, { id: typeId, name: typeName }, accessToken);
      expectNoServerError(updateType);
      expect(successCodes, JSON.stringify(updateType.data)).toContain(updateType.status);
      expect(updateType.data?.name, JSON.stringify(updateType.data)).toBe(typeName);

      const updateSubtype = await inventoryAPI.updateInventorySubtype(request, { id: subtypeId, name: subtypeName }, accessToken);
      expectNoServerError(updateSubtype);
      expect(successCodes, JSON.stringify(updateSubtype.data)).toContain(updateSubtype.status);
      expect(updateSubtype.data?.name, JSON.stringify(updateSubtype.data)).toBe(subtypeName);

      const typeById = await inventoryAPI.getInventoryTypeById(request, typeId as number, accessToken);
      expectNoServerError(typeById);
      if (!clientErrorCodes.includes(typeById.status)) {
        expect(successCodes).toContain(typeById.status);
        expect(typeById.data?.id, JSON.stringify(typeById.data)).toBe(typeId);
      }

      const subtypeById = await inventoryAPI.getInventorySubtypeById(request, subtypeId as number, accessToken);
      expectNoServerError(subtypeById);
      if (!clientErrorCodes.includes(subtypeById.status)) {
        expect(successCodes).toContain(subtypeById.status);
        expect(subtypeById.data?.id, JSON.stringify(subtypeById.data)).toBe(subtypeId);
      }
    });

    test('создает, читает и обновляет наименование инвентаря', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      const duplicateBefore = await inventoryAPI.checkNameExisting(request, { name: inventoryName }, accessToken);
      expectNoServerError(duplicateBefore);

      const create = await inventoryAPI.createInventory(
        request,
        inventoryPayload(suffix, typeId as number, subtypeId as number),
        accessToken,
      );
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);
      inventoryId = Number(create.data?.id);
      expect(inventoryId, JSON.stringify(create.data)).toBeGreaterThan(0);

      const byId = await inventoryAPI.getOneInventory(request, inventoryId, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(inventoryId);
      }

      const updatedName = `${inventoryName} Updated`;
      const update = await inventoryAPI.updateInventory(
        request,
        inventoryPayload(suffix, typeId as number, subtypeId as number, {
          id: inventoryId,
          name: updatedName,
          attention: true,
          description: 'Updated by API autotest',
        }),
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

      const updated = await findInventoryByName(request, updatedName, accessToken);
      expect(updated, `Inventory ${updatedName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(inventoryId);

      const persisted = await inventoryAPI.getOneInventory(request, inventoryId, accessToken);
      expectNoServerError(persisted);
      if (!clientErrorCodes.includes(persisted.status)) {
        expect(successCodes).toContain(persisted.status);
        expect(persisted.data?.id, JSON.stringify(persisted.data)).toBe(inventoryId);
        expect(persisted.data?.name, JSON.stringify(persisted.data)).toBe(updatedName);
        expect(persisted.data?.attention, JSON.stringify(persisted.data)).toBe(true);
        expect(persisted.data?.description, JSON.stringify(persisted.data)).toBe('Updated by API autotest');
      }
      inventoryName = updatedName;
    });

    test('архивирует наименование инвентаря и служебные типы', async ({ request }) => {
      expect(inventoryId).toBeTruthy();
      const currentInventoryId = inventoryId as number;

      const archiveInventory = await inventoryAPI.banInventory(request, currentInventoryId, accessToken);
      expectNoServerError(archiveInventory);
      expect(successCodes, JSON.stringify(archiveInventory.data)).toContain(archiveInventory.status);
      if (archiveInventory.data && typeof archiveInventory.data === 'object') {
        expect(archiveInventory.data.ban, JSON.stringify(archiveInventory.data)).toBe(true);
      }

      const archived = await eventually(async () => {
        const response = await inventoryAPI.getArchivedInventory(request, { searchString: inventoryName }, accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === currentInventoryId));
      expect(archived, `Inventory ${inventoryName} was not found in archive`).toBeTruthy();

      expect(await waitForInventoryAbsentFromActivePagination(request, currentInventoryId, inventoryName, accessToken)).toBe(true);
      inventoryId = undefined;

      const archiveSubtype = await inventoryAPI.removeInventorySubtype(request, subtypeId as number, accessToken);
      expectNoServerError(archiveSubtype);
      subtypeId = undefined;

      const archiveType = await inventoryAPI.removeInventoryType(request, typeId as number, accessToken);
      expectNoServerError(archiveType);
      typeId = undefined;
    });
  });

  test.describe('Inventory API: базовое чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает справочники и пагинации без серверных ошибок', async ({ request }) => {
      const types = await inventoryAPI.getInventoryTypes(request, accessToken);
      expectNoServerError(types);
      if (!clientErrorCodes.includes(types.status)) {
        expect(successCodes).toContain(types.status);
        expect(Array.isArray(types.data), JSON.stringify(types.data)).toBe(true);
      }

      const subtypes = await inventoryAPI.getInventorySubtypes(request, accessToken);
      expectNoServerError(subtypes);
      if (!clientErrorCodes.includes(subtypes.status)) {
        expect(successCodes).toContain(subtypes.status);
        expect(Array.isArray(subtypes.data), JSON.stringify(subtypes.data)).toBe(true);
      }

      const inventory = await inventoryAPI.getAllInventory(request, accessToken);
      expectNoServerError(inventory);

      const typePagination = await inventoryAPI.getTypePagination(request, inventoryPaginationDto(), accessToken);
      expectNoServerError(typePagination);
      if (!clientErrorCodes.includes(typePagination.status)) expectPaginationContract(typePagination.data);

      const subtypePagination = await inventoryAPI.getSubtypePagination(request, inventoryPaginationDto(), accessToken);
      expectNoServerError(subtypePagination);
      if (!clientErrorCodes.includes(subtypePagination.status)) expectPaginationContract(subtypePagination.data);

      const inventoryPagination = await inventoryAPI.getInventoryPagination(request, inventoryPaginationDto(), accessToken);
      expectNoServerError(inventoryPagination);
      if (!clientErrorCodes.includes(inventoryPagination.status)) expectPaginationContract(inventoryPagination.data);
    });

    test('защитные payload и несуществующие id не приводят к 5xx', async ({ request }) => {
      for (const name of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const unique = await inventoryAPI.checkNameUnique(request, { type: TYPE, name }, accessToken);
        expectNoServerError(unique);

        const pagination = await inventoryAPI.getInventoryPagination(request, inventoryPaginationDto({ searchString: name }), accessToken);
        expectNoServerError(pagination);
      }

      const byTypeId = await inventoryAPI.getInventoryTypeById(request, 999999999, accessToken);
      expectNoServerError(byTypeId);

      const invalidCreate = await inventoryAPI.createInventory(
        request,
        inventoryPayload('invalid', 1, 1, { name: '', parentTypeId: 'null', parentSubtypeId: 'null', companyIds: '[]' }),
        accessToken,
      );
      expectClientError(invalidCreate);
    });
  });
};
