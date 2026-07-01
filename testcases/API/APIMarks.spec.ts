import { test, expect } from '@playwright/test';
import { MarksAPI } from '../../pages/API/APIMarks';
import { OperationAPI } from '../../pages/API/APIOperation';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const marksAPI = new MarksAPI(null);
const operationAPI = new OperationAPI(null);

type ApiRow = Record<string, any>;

const resultWorksDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  responsibleUserIds: [],
  selectTypeOperation: null,
  dateRange: null,
  ...overrides,
});

const expectMarkShape = (mark: ApiRow) => {
  expect(Number(mark.id), JSON.stringify(mark)).toBeGreaterThan(0);
  expect(Number(mark.kol), JSON.stringify(mark)).not.toBeNaN();
  expect(typeof mark.brak, JSON.stringify(mark)).toBe('boolean');
  const dateBuild = mark.date_build ?? mark.dateBuild;
  if (dateBuild !== null && dateBuild !== undefined) {
    expect(Date.parse(dateBuild), JSON.stringify(mark)).not.toBeNaN();
  }
  if (mark.user_id !== null && mark.userId !== null && (mark.user_id ?? mark.userId) !== undefined) {
    expect(Number(mark.user_id ?? mark.userId), JSON.stringify(mark)).toBeGreaterThan(0);
  }
  if (mark.oper_id !== null && mark.operId !== null && (mark.oper_id ?? mark.operId) !== undefined) {
    expect(Number(mark.oper_id ?? mark.operId), JSON.stringify(mark)).toBeGreaterThan(0);
  }
  expect(typeof (mark.ban ?? false), JSON.stringify(mark)).toBe('boolean');
};

const expectResultWorksContract = (data: unknown) => {
  expectPaginationContract(data);
  const resultTime = (data as any)?.resultTime;
  if (resultTime !== undefined && resultTime !== null) {
    expect(Number(resultTime), JSON.stringify(data)).not.toBeNaN();
  }

  for (const row of getRows<ApiRow>(data)) {
    expectMarkShape(row);
    if (row.operation) {
      expect(Number(row.operation.id), JSON.stringify(row.operation)).toBeGreaterThan(0);
    }
    if (row.user) {
      expect(Number(row.user.id), JSON.stringify(row.user)).toBeGreaterThan(0);
    }
  }
};

const markCreatePayloadFromExisting = (
  source: ApiRow,
  description: string,
  overrides: Record<string, unknown> = {},
) => ({
  kol: 1,
  brak: true,
  date_build: new Date().toISOString(),
  user_id: Number(source.user_id ?? source.userId),
  oper_id: Number(source.oper_id ?? source.operId),
  assemble_id: source.assemble_id ?? source.assembleId ?? null,
  metaloworking_id: source.metaloworking_id ?? source.metaloworkingId ?? null,
  production_task_id: source.production_task_id ?? source.productionTaskId ?? null,
  description,
  execution_time: 0,
  operation_execution_time: { preTime: 0, helperTime: 0, mainTime: 0 },
  ...overrides,
});

const markUpdatePayloadFromExisting = (
  source: ApiRow,
  id: number,
  description: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  date_build: new Date().toISOString(),
  kol: 1,
  description,
  user_id: Number(source.user_id ?? source.userId),
  oper_id: Number(source.oper_id ?? source.operId),
  brak: true,
  execution_time: 0,
  operation_execution_time: JSON.stringify({ preTime: 0, helperTime: 0, mainTime: 0 }),
  ...overrides,
});

const findSeedMarks = async (request: any, accessToken?: string): Promise<ApiRow[]> => {
  const marks = await marksAPI.getMarks(request, accessToken);
  expectNoServerError(marks);
  if (clientErrorCodes.includes(marks.status)) return [];

  return getRows<ApiRow>(marks.data).filter(
    (mark) =>
      Number(mark.id) > 0 &&
      Number(mark.oper_id ?? mark.operId) > 0 &&
      (Number(mark.assemble_id ?? mark.assembleId) > 0 || Number(mark.metaloworking_id ?? mark.metaloworkingId) > 0),
  );
};

export const runMarksAPINew = () => {
  logger.info('Starting Marks API coverage suite');

  test.describe('Marks API: чтение отметок и результатов работ', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает список отметок и результаты выполненных работ', async ({ request }) => {
      const marks = await marksAPI.getMarks(request, accessToken);
      expectNoServerError(marks);
      if (!clientErrorCodes.includes(marks.status)) {
        expect(successCodes, JSON.stringify(marks.data)).toContain(marks.status);
        expect(Array.isArray(marks.data), JSON.stringify(marks.data)).toBe(true);
        for (const mark of getRows<ApiRow>(marks.data).slice(0, 10)) {
          expectMarkShape(mark);
        }
      }

      const resultWorks = await marksAPI.getResultWorks(request, resultWorksDto(), accessToken);
      expectNoServerError(resultWorks);
      if (!clientErrorCodes.includes(resultWorks.status)) {
        expect(successCodes, JSON.stringify(resultWorks.data)).toContain(resultWorks.status);
        expectResultWorksContract(resultWorks.data);
      }
    });

    test('resultworks поддерживает фильтры, пустую выдачу и граничные page/dateRange', async ({ request }) => {
      const marks = await marksAPI.getMarks(request, accessToken);
      expectNoServerError(marks);
      const seed = getRows<ApiRow>(marks.data).find((row) => row.user_id ?? row.userId);

      const cases = [
        resultWorksDto({ searchString: 'api-mark-no-match-999999999' }),
        resultWorksDto({ page: 999999 }),
        resultWorksDto({
          dateRange: {
            start: '1970-01-01T00:00:00.000Z',
            end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
        ...(seed ? [resultWorksDto({ responsibleUserIds: [Number(seed.user_id ?? seed.userId)] })] : []),
      ];

      for (const dto of cases) {
        const response = await marksAPI.getResultWorks(request, dto, accessToken);
        expectNoServerError(response);
        if (!clientErrorCodes.includes(response.status)) {
          expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
          expectResultWorksContract(response.data);
        }
      }

      const operationTypes = await operationAPI.getTypeOperations(request, true, accessToken);
      expectNoServerError(operationTypes);
      const typeOperation = getRows<ApiRow>(operationTypes.data).find((row) => row.id);
      if (typeOperation) {
        const byType = await marksAPI.getResultWorks(
          request,
          resultWorksDto({ selectTypeOperation: Number(typeOperation.id) }),
          accessToken,
        );
        expectNoServerError(byType);
        if (!clientErrorCodes.includes(byType.status)) {
          expectResultWorksContract(byType.data);
        }
      }
    });

    test('читает отметки по операции, если операция есть', async ({ request }) => {
      const operations = await operationAPI.getAllOperations(request, accessToken);
      expectNoServerError(operations);
      test.skip(clientErrorCodes.includes(operations.status), 'Operations API недоступен.');

      const operation = getRows<Record<string, any>>(operations.data).find((row) => row.id);
      test.skip(!operation, 'В dev-базе нет операций для проверки marks/byoperation.');

      const byOperation = await marksAPI.getMarksByOperation(request, Number(operation!.id), accessToken);
      expectNoServerError(byOperation);
      if (!clientErrorCodes.includes(byOperation.status)) {
        expect(successCodes, JSON.stringify(byOperation.data)).toContain(byOperation.status);
        expect(Array.isArray(byOperation.data), JSON.stringify(byOperation.data)).toBe(true);
        for (const mark of getRows<ApiRow>(byOperation.data)) {
          expect(Number(mark.oper_id ?? mark.operId), JSON.stringify(mark)).toBe(Number(operation!.id));
          expectMarkShape(mark);
        }
      }
    });

    test('marks/byoperation для операции без отметок возвращает стабильный пустой массив', async ({ request }) => {
      const response = await marksAPI.getMarksByOperation(request, 999999999, accessToken);

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expect(getRows(response.data), JSON.stringify(response.data)).toEqual([]);
      }
    });

    test('невалидные route id не приводят к 5xx', async ({ request }) => {
      test.fail(true, 'Некорректные route id в Marks API сейчас могут отдавать 500/502 на dev вместо клиентской ошибки.');
      const byOperation = await marksAPI.getMarksByOperationRaw(request, 'bad-id', accessToken);
      expectNoServerError(byOperation);
      if (!clientErrorCodes.includes(byOperation.status)) {
        expect(Array.isArray(byOperation.data), JSON.stringify(byOperation.data)).toBe(true);
      }

      test.fail(true, 'GET /api/marks/mark/:include/:id на dev сейчас возвращает 502 вместо клиентской ошибки.');
      const byId = await marksAPI.getMarkByIdRaw(request, 'bad-id', 'false', accessToken);
      expectNotSuccessful(byId);
    });

    test('невалидные resultworks payload не приводят к успешной выдаче', async ({ request }) => {
      test.fail(true, 'Некоторые невалидные resultworks payload сейчас приводят к 5xx на dev.');
      for (const dto of [
        resultWorksDto({ page: -1 }),
        resultWorksDto({ responsibleUserIds: 'bad-users' }),
        resultWorksDto({ selectTypeOperation: 'bad-type-operation' }),
        resultWorksDto({ dateRange: { start: 'bad-date', end: 'also-bad-date' } }),
      ]) {
        const response = await marksAPI.getResultWorks(request, dto, accessToken);
        expectNotSuccessful(response);
      }
    });

    test('невалидные payload для создания/обновления отметки не приводят к успешной мутации', async ({ request }) => {
      const create = await marksAPI.createMark(
        request,
        { kol: 'bad', brak: false, date_build: 'bad-date', user_id: 'bad-user', oper_id: 999999999, description: '' },
        accessToken,
      );
      expectNotSuccessful(create);

      const update = await marksAPI.updateMark(request, { id: 999999999, kol: 'bad' }, accessToken);
      expectNotSuccessful(update);
    });

    test('чтение без авторизации не падает, мутации без авторизации запрещены', async ({ request }) => {
      const readMarks = await marksAPI.getMarks(request);
      expectNoServerError(readMarks);

      const readResultWorks = await marksAPI.getResultWorks(request, resultWorksDto());
      expectNoServerError(readResultWorks);

      const create = await marksAPI.createMark(
        request,
        { kol: 1, brak: true, date_build: new Date().toISOString(), user_id: 1, oper_id: 1, description: 'no auth' },
      );
      expectNotSuccessful(create);

      const update = await marksAPI.updateMark(request, { id: 1, kol: 1, description: 'no auth' });
      expectNotSuccessful(update);

      const remove = await marksAPI.deleteMark(request, 1);
      expectNotSuccessful(remove);
    });
  });

  test.describe.serial('Marks API: создание, обновление и архив тестовой отметки', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string;
    let seedMark: ApiRow | undefined;
    let createdMarkId: number | undefined;
    let operationId: number | undefined;
    let createDescription = '';
    let updateDescription = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (!createdMarkId) return;
      const remove = await marksAPI.deleteMark(request, createdMarkId, accessToken);
      expectNoServerError(remove);
    });

    test('создает тестовую отметку и находит ее в marks/byoperation', async ({ request }) => {
      const candidates = (await findSeedMarks(request, accessToken)).slice(0, 20);
      test.skip(candidates.length === 0, 'В dev-базе нет отметок-образцов для создания.');

      let acceptedCreate: Awaited<ReturnType<MarksAPI['createMark']>> | undefined;

      for (const candidate of candidates) {
        createDescription = `API marks create ${uniqueApiSuffix('mark')}`;
        const create = await marksAPI.createMark(
          request,
          markCreatePayloadFromExisting(candidate, createDescription, {
            user_id: Number(API_CONST.API_TEST_USER_ID_72),
          }),
          accessToken,
        );
        expectNoServerError(create);

        if (successCodes.includes(create.status)) {
          seedMark = candidate;
          operationId = Number(candidate.oper_id ?? candidate.operId);
          acceptedCreate = create;
          break;
        }
      }

      test.skip(!acceptedCreate || !seedMark || !operationId, 'Не найден seed mark, на котором dev-сервер принимает createMark.');

      const created = await eventually(
        async () => {
          const response = await marksAPI.getMarksByOperation(request, operationId as number, accessToken);
          expectNoServerError(response);
          return response;
        },
        (response) => getRows<ApiRow>(response.data).some((row) => row.description === createDescription && row.ban !== true),
        { attempts: 12, intervalMs: 700 },
      );

      const mark = created
        ? getRows<ApiRow>(created.data).find((row) => row.description === createDescription && row.ban !== true)
        : undefined;
      expect(mark, JSON.stringify(created?.data)).toBeTruthy();
      expectMarkShape(mark!);
      createdMarkId = Number(mark!.id);
    });

    test('обновляет тестовую отметку', async ({ request }) => {
      test.skip(!seedMark || !createdMarkId, 'Тестовая отметка не создана.');
      updateDescription = `${createDescription} updated`;

      const update = await marksAPI.updateMark(
        request,
        markUpdatePayloadFromExisting(seedMark!, createdMarkId as number, updateDescription, {
          user_id: Number(API_CONST.API_TEST_USER_ID_72),
        }),
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

      const updated = await eventually(
        async () => {
          const response = await marksAPI.getMarksByOperation(request, operationId as number, accessToken);
          expectNoServerError(response);
          return response;
        },
        (response) => getRows<ApiRow>(response.data).some((row) => Number(row.id) === createdMarkId && row.description === updateDescription),
        { attempts: 12, intervalMs: 700 },
      );

      const mark = updated
        ? getRows<ApiRow>(updated.data).find((row) => Number(row.id) === createdMarkId)
        : undefined;
      expect(mark, JSON.stringify(updated?.data)).toBeTruthy();
      expect(mark!.description, JSON.stringify(mark)).toBe(updateDescription);
      expect(mark!.brak, JSON.stringify(mark)).toBe(true);
    });

    test('архивирует тестовую отметку', async ({ request }) => {
      test.skip(!createdMarkId || !operationId, 'Тестовая отметка не создана.');

      const remove = await marksAPI.deleteMark(request, createdMarkId as number, accessToken);
      expectNoServerError(remove);
      expect(successCodes, JSON.stringify(remove.data)).toContain(remove.status);

      const archived = await eventually(
        async () => {
          const response = await marksAPI.getMarksByOperation(request, operationId as number, accessToken);
          expectNoServerError(response);
          return response;
        },
        (response) => {
          const mark = getRows<ApiRow>(response.data).find((row) => Number(row.id) === createdMarkId);
          return !mark || mark.ban === true;
        },
        { attempts: 12, intervalMs: 700 },
      );

      expect(archived, `Отметка ${createdMarkId} не ушла из активной выдачи`).toBeTruthy();
      createdMarkId = undefined;
    });
  });
};
