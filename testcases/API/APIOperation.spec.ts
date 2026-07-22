import { test, expect } from '@playwright/test';
import { OperationAPI } from '../../pages/API/APIOperation';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const operationAPI = new OperationAPI(null);

const typeOperationPayload = (name: string, overrides: Record<string, unknown> = {}) => ({
  ban: false,
  equipmentIds: [],
  name,
  preTime: true,
  helperTime: false,
  mainTime: false,
  cpu: false,
  square: false,
  list: false,
  users: [],
  metaloworking: true,
  assembly: false,
  sclad: false,
  preTimeMinute: 0,
  helperTimeMinute: 0,
  workStartCalcType: 'automatic',
  ...overrides,
});

const invalidOperationPayload = (overrides: Record<string, unknown> = {}) => ({
  name: '',
  preTime: '0',
  helperTime: '0',
  techProcessId: '999999999',
  mainTime: '0',
  generalCountTime: '0',
  description: '',
  instrumentList: 'null',
  instrumentMerList: 'null',
  instrumentOsnList: 'null',
  eqList: 'null',
  ...overrides,
});

const operationPayload = (_name: string, typeOperationId: number, overrides: Record<string, unknown> = {}) => ({
  name: String(typeOperationId),
  preTime: '0',
  helperTime: '0',
  techProcessId: '',
  mainTime: '0',
  generalCountTime: '0',
  description: 'Created by API autotest',
  instrumentList: null,
  instrumentMerList: null,
  instrumentOsnList: null,
  eqList: null,
  ...overrides,
});

const expectTypeOperationShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(typeof row.id, JSON.stringify(row)).toBe('number');
  expect(row.name, JSON.stringify(row)).toBeTruthy();
};

const findTypeOperationByName = async (
  request: any,
  name: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const list = await operationAPI.getTypeOperations(request, false, accessToken);
    expectNoServerError(list);
    return list;
  }, (list) => getRows<ApiRow>(list.data).some((row) => row.name === name && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name && row.ban !== true) : undefined;
};

const waitForTypeOperationAbsent = async (
  request: any,
  id: number,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const list = await operationAPI.getTypeOperations(request, false, accessToken);
    expectNoServerError(list);
    return list;
  }, (list) => !getRows<ApiRow>(list.data).some((row) => row.id === id));

  return Boolean(response);
};

const waitForTypeOperationNameAbsent = async (
  request: any,
  name: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const list = await operationAPI.getTypeOperations(request, false, accessToken);
    expectNoServerError(list);
    return list;
  }, (list) => !getRows<ApiRow>(list.data).some((row) => row.name === name && row.ban !== true));

  return Boolean(response);
};

export const runOperationAPINew = () => {
  logger.info('Starting Operation API coverage suite');

  test.describe.serial('Operation API: жизненный цикл типа операции', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let typeOperationId: number | undefined;
    let typeOperationName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (!typeOperationId) return;
      const cleanup = await operationAPI.banTypeOperation(request, typeOperationId, accessToken);
      expectNoServerError(cleanup);
    });

    test('создает тип операции и читает его по id и активному списку', async ({ request }) => {
      typeOperationName = `API Type Operation ${uniqueApiSuffix('oper')}`;

      const uniqueBefore = await operationAPI.checkNameUnique(request, { name: typeOperationName }, accessToken);
      expectNoServerError(uniqueBefore);
      if (!clientErrorCodes.includes(uniqueBefore.status)) {
        expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);
      }

      const create = await operationAPI.createTypeOperation(
        request,
        typeOperationPayload(typeOperationName),
        accessToken,
      );
      expectNoServerError(create);
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectTypeOperationShape(create.data);
      typeOperationId = Number(create.data.id);

      const byId = await operationAPI.getTypeOperationById(
        request,
        { id: typeOperationId, modelInclude: [] },
        accessToken,
      );
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data.id, JSON.stringify(byId.data)).toBe(typeOperationId);
      }

      const createdInList = await findTypeOperationByName(request, typeOperationName, accessToken);
      expect(createdInList, `Type operation ${typeOperationName} was not found in active list after create`).toBeTruthy();
      expect(createdInList?.id).toBe(typeOperationId);
      expect(createdInList?.metaloworking ?? createdInList?.metalworking, JSON.stringify(createdInList)).toBe(true);

      const uniqueAfterCreate = await operationAPI.checkNameUnique(request, { name: typeOperationName }, accessToken);
      expectNoServerError(uniqueAfterCreate);
      if (!clientErrorCodes.includes(uniqueAfterCreate.status)) {
        expect(Number(uniqueAfterCreate.data), JSON.stringify(uniqueAfterCreate.data)).toBeGreaterThanOrEqual(1);
      }
    });

    test('обновляет тип операции и проверяет новые поля в чтении', async ({ request }) => {
      expect(typeOperationId).toBeTruthy();
      const previousName = typeOperationName;
      typeOperationName = `${typeOperationName} Updated`;

      const update = await operationAPI.updateTypeOperation(
        request,
        typeOperationPayload(typeOperationName, {
          id: typeOperationId,
          preTimeMinute: 1,
          helperTime: true,
          helperTimeMinute: 2,
        }),
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expect(update.data.id, JSON.stringify(update.data)).toBe(typeOperationId);
      expect(update.data.name, JSON.stringify(update.data)).toBe(typeOperationName);

      const updatedInList = await findTypeOperationByName(request, typeOperationName, accessToken);
      expect(updatedInList, `Type operation ${typeOperationName} was not found in active list after update`).toBeTruthy();
      expect(updatedInList?.id).toBe(typeOperationId);
      expect(updatedInList?.helperTime, JSON.stringify(updatedInList)).toBe(true);
      expect(Number(updatedInList?.helperTimeMinute), JSON.stringify(updatedInList)).toBe(2);
      expect(await waitForTypeOperationNameAbsent(request, previousName, accessToken)).toBe(true);

      const byId = await operationAPI.getTypeOperationById(
        request,
        { id: typeOperationId, modelInclude: [] },
        accessToken,
      );
      expectNoServerError(byId);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expect(byId.data?.name, JSON.stringify(byId.data)).toBe(typeOperationName);
      expect(byId.data?.helperTime, JSON.stringify(byId.data)).toBe(true);
      expect(Number(byId.data?.helperTimeMinute), JSON.stringify(byId.data)).toBe(2);
    });

    test('архивирует тестовый тип операции и проверяет отсутствие в активном списке', async ({ request }) => {
      expect(typeOperationId).toBeTruthy();
      const currentTypeOperationId = typeOperationId as number;

      const remove = await operationAPI.banTypeOperation(request, currentTypeOperationId, accessToken);
      expectNoServerError(remove);
      expect(successCodes, JSON.stringify(remove.data)).toContain(remove.status);
      expect(remove.data?.ban, JSON.stringify(remove.data)).toBe(true);

      expect(await waitForTypeOperationAbsent(request, currentTypeOperationId, accessToken)).toBe(true);

      const byId = await operationAPI.getTypeOperationById(
        request,
        { id: currentTypeOperationId, modelInclude: [] },
        accessToken,
      );
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
        expect(byId.data?.ban, JSON.stringify(byId.data)).toBe(true);
      }

      typeOperationId = undefined;
    });
  });

  test.describe('Operation API: чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;
    let fixtureTypeOperationId: number | undefined;
    let fixtureOperationId: number | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      const suffix = uniqueApiSuffix('operation-read');

      const typeOperation = await operationAPI.createTypeOperation(
        request,
        typeOperationPayload(`API Read Type Operation ${suffix}`),
        accessToken,
      );
      expectNoServerError(typeOperation);
      expect(successCodes, JSON.stringify(typeOperation.data)).toContain(typeOperation.status);
      fixtureTypeOperationId = Number(typeOperation.data?.id);
      expect(fixtureTypeOperationId, JSON.stringify(typeOperation.data)).toBeGreaterThan(0);

      const operation = await operationAPI.createOperation(
        request,
        operationPayload(`API Read Operation ${suffix}`, fixtureTypeOperationId as number),
        accessToken,
      );
      expectNoServerError(operation);
      expect(successCodes, JSON.stringify(operation.data)).toContain(operation.status);
      fixtureOperationId = Number(operation.data?.id);
      expect(fixtureOperationId, JSON.stringify(operation.data)).toBeGreaterThan(0);
    });

    test.afterAll(async ({ request }) => {
      if (fixtureOperationId) {
        const cleanupOperation = await operationAPI.banOperation(request, fixtureOperationId, accessToken);
        expectNoServerError(cleanupOperation);
      }
      if (fixtureTypeOperationId) {
        const cleanupTypeOperation = await operationAPI.banTypeOperation(request, fixtureTypeOperationId, accessToken);
        expectNoServerError(cleanupTypeOperation);
      }
    });

    test('возвращает справочники типов операций и операции без 5xx', async ({ request }) => {
      const lightTypes = await operationAPI.getTypeOperations(request, true, accessToken);
      expectNoServerError(lightTypes);
      if (!clientErrorCodes.includes(lightTypes.status)) {
        expect(successCodes).toContain(lightTypes.status);
        expect(Array.isArray(lightTypes.data), JSON.stringify(lightTypes.data)).toBe(true);
      }

      const fullTypes = await operationAPI.getTypeOperations(request, false, accessToken);
      expectNoServerError(fullTypes);
      if (!clientErrorCodes.includes(fullTypes.status)) {
        expect(successCodes).toContain(fullTypes.status);
        expect(Array.isArray(fullTypes.data), JSON.stringify(fullTypes.data)).toBe(true);
      }

      const staticTypes = await operationAPI.getTypeOperationStatic(request, 'metal', accessToken);
      expectNoServerError(staticTypes);
      if (!clientErrorCodes.includes(staticTypes.status)) {
        expect(successCodes).toContain(staticTypes.status);
        expect(Array.isArray(staticTypes.data), JSON.stringify(staticTypes.data)).toBe(true);
      }

      const operations = await operationAPI.getAllOperations(request, accessToken);
      expectNoServerError(operations);
      if (!clientErrorCodes.includes(operations.status)) {
        expect(successCodes).toContain(operations.status);
        expect(Array.isArray(operations.data), JSON.stringify(operations.data)).toBe(true);
      }
    });

    test('читает существующую операцию из списка, если она есть', async ({ request }) => {
      const byId = await operationAPI.getOperationById(request, fixtureOperationId as number, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data.id, JSON.stringify(byId.data)).toBe(fixtureOperationId);
      }
    });

    test('невалидные payload и id не приводят к 5xx', async ({ request }) => {
      for (const name of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const unique = await operationAPI.checkNameUnique(request, { name }, accessToken);
        expectNoServerError(unique);
      }

      const missingType = await operationAPI.getTypeOperationById(
        request,
        { id: 999999999, modelInclude: [] },
        accessToken,
      );
      expectNoServerError(missingType);

      const invalidTypeCreate = await operationAPI.createTypeOperation(
        request,
        typeOperationPayload('', { equipmentIds: ['bad-id'] }),
        accessToken,
      );
      expectClientError(invalidTypeCreate);

      const invalidOperationCreate = await operationAPI.createOperation(
        request,
        invalidOperationPayload(),
        accessToken,
      );
      expectClientError(invalidOperationCreate);

      const invalidTechUpdate = await operationAPI.updateOperationTech(
        request,
        { operationId: 999999999, instrumentList: [], eqList: [] },
        accessToken,
      );
      expectNoServerError(invalidTechUpdate);
    });
  });
};
