import { test, expect } from '@playwright/test';
import { OperationAPI } from '../../pages/API/APIOperation';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

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

const expectTypeOperationShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(typeof row.id, JSON.stringify(row)).toBe('number');
  expect(row.name, JSON.stringify(row)).toBeTruthy();
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

    test('создает тип операции и читает его по id', async ({ request }) => {
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
    });

    test('обновляет тип операции', async ({ request }) => {
      expect(typeOperationId).toBeTruthy();
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
    });

    test('архивирует тестовый тип операции', async ({ request }) => {
      expect(typeOperationId).toBeTruthy();

      const remove = await operationAPI.banTypeOperation(request, typeOperationId as number, accessToken);
      expectNoServerError(remove);
      expect(successCodes, JSON.stringify(remove.data)).toContain(remove.status);
      typeOperationId = undefined;
    });
  });

  test.describe('Operation API: чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
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
      const operations = await operationAPI.getAllOperations(request, accessToken);
      expectNoServerError(operations);
      test.skip(clientErrorCodes.includes(operations.status), 'Operations list is not available on this environment.');

      const operation = getRows<ApiRow>(operations.data).find((row) => row.id);
      test.skip(!operation, 'No operation with id is available on this environment.');
      const existingOperation = operation!;

      const byId = await operationAPI.getOperationById(request, existingOperation.id, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data.id, JSON.stringify(byId.data)).toBe(existingOperation.id);
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
      expectNotSuccessful(invalidTypeCreate);

      const invalidOperationCreate = await operationAPI.createOperation(
        request,
        invalidOperationPayload(),
        accessToken,
      );
      expectNotSuccessful(invalidOperationCreate);

      const invalidTechUpdate = await operationAPI.updateOperationTech(
        request,
        { operationId: 999999999, instrumentList: [], eqList: [] },
        accessToken,
      );
      expectNoServerError(invalidTechUpdate);
    });
  });
};
