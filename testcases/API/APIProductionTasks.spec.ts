import { test, expect } from '@playwright/test';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectNoServerError,
  expectNotSuccessful,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;
type LifecycleType = 'ass' | 'metall';
type LifecycleSource = {
  typeWork: LifecycleType;
  entityId: number;
  operationId: number;
  quantity: number;
  availableQuantity: number;
  equipmentId?: number;
};

const productionTasksAPI = new ProductionTasksAPI(null);

const productionTaskPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  isBan: false,
  responsibleUserIds: [],
  responsibleEquipmentIds: [],
  searchValue: '',
  ...overrides,
});

const byParents = (overrides: Record<string, unknown> = {}) => ({
  productIds: [],
  cbedIds: [],
  detalIds: [],
  ...overrides,
});

const byOrder = (overrides: Record<string, unknown> = {}) => ({
  orderId: null,
  customer: null,
  ...overrides,
});

const range = () => ({
  start: null,
  end: null,
});

const planDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  assembleIds: [],
  workingType: 'ass',
  byParents: byParents(),
  byOrder: byOrder(),
  sortReadiness: 'any',
  deficitFilteringType: 'all',
  searchStr: '',
  typeOperationIds: [],
  childrenByProductionTaskIds: [],
  range: range(),
  excludeIds: [],
  ...overrides,
});

const onlineBoardDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  workingType: 'ass',
  range: range(),
  typeOperationIds: [],
  employeIds: [],
  searchStr: '',
  productionIds: [],
  byParents: byParents(),
  byOrder: byOrder(),
  userByProductioinTask: null,
  childrenByProductionTaskIds: [],
  isComplect: false,
  sort: [],
  ...overrides,
});

const byUserDto = (userId: number, overrides: Record<string, unknown> = {}) => ({
  userId,
  page: 0,
  searchString: '',
  range: range(),
  ...overrides,
});

const byEquipmentDto = (equipmentId: number, overrides: Record<string, unknown> = {}) => ({
  equipmentId,
  page: 0,
  searchString: '',
  range: range(),
  isShowCbed: false,
  ...overrides,
});

const byOperationDto = (operationTypeId: number, overrides: Record<string, unknown> = {}) => ({
  operationTypeId,
  page: 0,
  searchString: '',
  equipmentIds: [],
  range: range(),
  productionOperationType: 'ass',
  ...overrides,
});

const taskOperationsDto = (
  entityType: 'ass' | 'metall',
  productionEntityId: number | null,
  operationId: number,
  overrides: Record<string, unknown> = {},
) => ({
  entityType,
  productionEntityId,
  operationId,
  productionTaskId: null,
  ...overrides,
});

const detalDeficitDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  isOnlyDetalId: false,
  assembleIds: [],
  range: range(),
  employeIds: [],
  searchString: '',
  byParents: byParents(),
  byOrder: byOrder(),
  childrenByProductionTaskIds: [],
  typeOperationIds: [],
  sort: [],
  ...overrides,
});

const resultWorksDto = (overrides: Record<string, unknown> = {}) => ({
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  subdivisonType: 'Metaloworking',
  ...overrides,
});

const workloadDto = (overrides: Record<string, unknown> = {}) => ({
  entityType: 'ass',
  range: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  subdivision: 'Assemble',
  ...overrides,
});

const invalidOperationPosDto = (overrides: Record<string, unknown> = {}) => ({
  type: 'invalid-type',
  production_task_id: null,
  ass_id: null,
  metall_id: null,
  idx: 'invalid-index',
  quantity: 'invalid-quantity',
  operation_positions: 'invalid-positions',
  ...overrides,
});

const findNumberByKeys = (value: unknown, keys: string[]): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);

    for (const [key, child] of Object.entries(current)) {
      if (keys.includes(key) && Number.isFinite(Number(child)) && Number(child) > 0) {
        return Number(child);
      }
      if (child && typeof child === 'object') stack.push(child);
    }
  }

  return undefined;
};

const findEntityForTask = (task: ApiRow | undefined): { type: 'ass' | 'metall'; id: number } | undefined => {
  if (!task) return undefined;

  const assId =
    findNumberByKeys(task, ['ass_id', 'assId']) ||
    (Array.isArray(task.ass) && Number.isFinite(Number(task.ass[0]?.id)) ? Number(task.ass[0].id) : undefined);

  if (assId) return { type: 'ass', id: assId };

  const metallId =
    findNumberByKeys(task, ['metall_id', 'metallId']) ||
    (Array.isArray(task.metall) && Number.isFinite(Number(task.metall[0]?.id)) ? Number(task.metall[0].id) : undefined);

  return metallId ? { type: 'metall', id: metallId } : undefined;
};

const findProductionEntityForTask = (
  task: ApiRow | undefined,
): { type: 'product' | 'cbed' | 'detal'; id: number } | undefined => {
  if (!task) return undefined;

  const productId = findNumberByKeys(task, ['product_id', 'productId']);
  if (productId) return { type: 'product', id: productId };

  const cbedId = findNumberByKeys(task, ['cbed_id', 'cbedId']);
  if (cbedId) return { type: 'cbed', id: cbedId };

  const detalId = findNumberByKeys(task, ['detal_id', 'detalId']);
  return detalId ? { type: 'detal', id: detalId } : undefined;
};

const findOperationPosIdForTask = (task: ApiRow | undefined): number | undefined => {
  if (!task) return undefined;
  if (Array.isArray(task.production_operation_pos)) {
    const operationPos = task.production_operation_pos.find((item: ApiRow) => item.id);
    if (operationPos) return Number(operationPos.id);
  }

  return findNumberByKeys(task, ['production_operation_pos_id', 'productionOperationPosId', 'operation_pos_id', 'operationPosId']);
};

const findTask = <TValue>(
  tasks: ApiRow[],
  selector: (task: ApiRow) => TValue | undefined,
): { task: ApiRow; value: TValue } | undefined => {
  for (const task of tasks) {
    const value = selector(task);
    if (value) return { task, value };
  }

  return undefined;
};

const findEquipmentId = (value: unknown): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);

    const record = current as ApiRow;
    const directId = findNumberByKeys(record, [
      'equipment_id',
      'equipmentId',
      'responsible_equipment_id',
      'responsibleEquipmentId',
    ]);
    if (directId) return directId;

    if (
      Number.isFinite(Number(record.id)) &&
      (
        record.equipmentTypeId ||
        record.equipment_type_id ||
        record.type_equipment_id ||
        record.typeEquipmentId ||
        record.equipment_ptype_id ||
        record.equipmentPTypeId
      )
    ) {
      return Number(record.id);
    }

    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') stack.push(child);
    }
  }

  return undefined;
};

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const getOperationPosIds = (task: ApiRow | undefined): number[] => {
  if (!task || !Array.isArray(task.production_operation_pos)) return [];

  return task.production_operation_pos
    .map((item: ApiRow) => Number(item.id))
    .filter((id: number) => Number.isFinite(id) && id > 0);
};

const extractDateValue = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return value;
  if (typeof value !== 'object') return undefined;

  const record = value as ApiRow;
  for (const key of ['dueDate', 'due_date', 'dueData', 'due_data', 'time', 'startTime', 'start_time', 'date', 'value']) {
    const field = record[key];
    if (typeof field === 'string' && Number.isFinite(Date.parse(field))) return field;
  }

  const queueData = getQueueData(record);
  if (queueData !== record) return extractDateValue(queueData);

  return undefined;
};

const sameUtcMinute = (left: string, right: string) => {
  return new Date(left).toISOString().slice(0, 16) === new Date(right).toISOString().slice(0, 16);
};

const findOperationIdForLifecycle = (value: unknown): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);

    const record = current as ApiRow;
    if (
      Number.isFinite(Number(record.id)) &&
      (
        Number.isFinite(Number(record.tOperationId)) ||
        Number.isFinite(Number(record.type_operation_id)) ||
        Number.isFinite(Number(record.typeOperationId))
      )
    ) {
      return Number(record.id);
    }

    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') stack.push(child);
    }
  }

  return undefined;
};

const findLifecycleSource = async (
  request: any,
  preferredTypeWork?: LifecycleType,
  accessToken?: string,
): Promise<LifecycleSource | undefined> => {
  const types = preferredTypeWork ? [preferredTypeWork] : (['ass', 'metall'] as const);

  for (const typeWork of types) {
    const plan = await productionTasksAPI.getPlanForProductionTask(
      request,
      planDto({ workingType: typeWork, pageSize: 20 }),
      accessToken,
    );
    expectNoServerError(plan);

    const row = getRows<ApiRow>(plan.data).find((item) => {
      const available = Number(item.maxAvailable ?? item.myQuantity ?? 0);
      return item.id && available >= 1 && findOperationIdForLifecycle(item);
    });
    if (!row) continue;

    const operationId = findOperationIdForLifecycle(row);
    if (!operationId) continue;

    const availableQuantity = Number(row.myQuantity || row.maxAvailable || 1);

    return {
      typeWork,
      entityId: Number(row.id),
      operationId,
      quantity: 1,
      availableQuantity: Math.max(1, Math.floor(availableQuantity)),
      equipmentId: findNumberByKeys(row, ['equipment_id', 'equipmentId']),
    };
  }

  return undefined;
};

const createProductionTaskPayload = (
  source: LifecycleSource,
  employeeId: number,
  suffix: string,
) => ({
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  typeWork: source.typeWork,
  details_filters: {
    byOrder: byOrder(),
    onlyDeficit: false,
    childrenByProductionTaskIds: [],
    byParents: byParents(),
    typeOperationIds: [],
  },
  description: `API production task lifecycle ${suffix}`,
  productionOperationPos: [
    {
      id: source.entityId,
      idx: 0,
      quantity: source.quantity,
      operationPositions: [
        {
          operationId: source.operationId,
          employeeId,
          equipmentId: source.typeWork === 'metall' ? source.equipmentId || null : null,
        },
      ],
    },
  ],
});

const productionOperationPosPayload = (
  source: LifecycleSource,
  productionTaskId: number,
  employeeId: number,
  overrides: Record<string, unknown> = {},
) => ({
  type: source.typeWork,
  production_task_id: productionTaskId,
  ass_id: source.typeWork === 'ass' ? source.entityId : null,
  metall_id: source.typeWork === 'metall' ? source.entityId : null,
  idx: 0,
  quantity: source.quantity,
  operation_positions: [
    {
      operationId: source.operationId,
      employeeId,
      equipmentId: source.typeWork === 'metall' ? source.equipmentId || null : null,
    },
  ],
  ...overrides,
});

export const runProductionTasksAPINew = () => {
  logger.info('Starting Production Tasks API coverage suite');

  test.describe('Production Tasks API: контракты чтения и производственные связи', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstTask: ApiRow | undefined;
    let firstTaskId: number | undefined;
    let firstUserId: number | undefined;
    let firstEquipmentId: number | undefined;
    let firstOperationTypeId: number | undefined;
    let firstOperationPosId: number | undefined;
    let firstEntity: { type: 'ass' | 'metall'; id: number } | undefined;
    let firstProductionEntity: { type: 'product' | 'cbed' | 'detal'; id: number } | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);

      const list = await productionTasksAPI.getProductionTaskWithOperationsPaginate(
        request,
        productionTaskPaginationDto({ pageSize: 50 }),
        accessToken,
      );
      expectNoServerError(list);

      const tasks = getRows<ApiRow>(list.data).filter((row) => row.id);
      firstTask = tasks[0];
      firstTaskId = firstTask ? Number(firstTask.id) : undefined;
      firstUserId =
        findTask(tasks, (task) => findNumberByKeys(task, ['user_id', 'userId', 'responsible_user_id', 'responsibleUserId']))?.value ||
        Number(API_CONST.API_TEST_USER_ID);
      firstEquipmentId = findTask(tasks, (task) =>
        findEquipmentId(task),
      )?.value;
      if (!firstEquipmentId) {
        const allEquipments = await productionTasksAPI.getProductionTaskByAllEquipments(
          request,
          undefined,
          accessToken,
        );
        expectNoServerError(allEquipments);
        firstEquipmentId = findEquipmentId(allEquipments.data);
      }
      firstOperationTypeId = findTask(tasks, (task) =>
        findNumberByKeys(task, [
          'type_operation_id',
          'typeOperationId',
          'operation_type_id',
          'operationTypeId',
          'operationId',
          'tOperationId',
        ]),
      )?.value;
      firstOperationPosId = findTask(tasks, findOperationPosIdForTask)?.value;
      firstEntity = findTask(tasks, findEntityForTask)?.value;
      firstProductionEntity = findTask(tasks, findProductionEntityForTask)?.value;
    });

    const runLifecycleScenario = async (request: any, typeWork: LifecycleType) => {
      const lifecycleSource = await findLifecycleSource(request, typeWork, accessToken);
      test.skip(!lifecycleSource, `No ${typeWork} plan row with operations is available for lifecycle create.`);
      const source = lifecycleSource!;

      if (typeWork === 'metall' && !source.equipmentId) {
        source.equipmentId = firstEquipmentId;
      }
      if (typeWork === 'metall' && !source.equipmentId) {
        const allEquipments = await productionTasksAPI.getProductionTaskByAllEquipments(request, undefined, accessToken);
        expectNoServerError(allEquipments);
        source.equipmentId = findEquipmentId(allEquipments.data);
      }
      test.skip(typeWork === 'metall' && !source.equipmentId, 'No equipment id is available for metal lifecycle create.');

      const suffix = uniqueApiSuffix(`pt-${typeWork}`);
      let createdProductionTaskId: number | undefined;
      let addedOperationPosId: number | undefined;

      try {
        const createResponse = await productionTasksAPI.createProductionTask(
          request,
          createProductionTaskPayload(source, firstUserId as number, suffix),
          accessToken,
        );
        expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
        expectNoServerError(createResponse);

        const createdTask = getQueueData(createResponse.data);
        createdProductionTaskId = Number(createdTask?.id);
        expect(createdProductionTaskId, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
        expect(createdTask?.description, JSON.stringify(createdTask)).toBe(`API production task lifecycle ${suffix}`);

        const byId = await productionTasksAPI.getProductionTaskById(request, createdProductionTaskId, accessToken);
        expect(byId.status).toBe(200);
        expectNoServerError(byId);
        expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(createdProductionTaskId);

        const createdOperationPosId = findOperationPosIdForTask(byId.data);
        expect(createdOperationPosId, JSON.stringify(byId.data)).toBeGreaterThan(0);

        const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
        const dueDateResponse = await productionTasksAPI.updateStatusProductionTask(
          request,
          {
            productionTaskId: createdProductionTaskId,
            dueDate,
          },
          accessToken,
        );
        expectNoServerError(dueDateResponse);
        if (!clientErrorCodes.includes(dueDateResponse.status)) {
          expect(successCodes).toContain(dueDateResponse.status);
        }

        const byIdAfterDueDate = await productionTasksAPI.getProductionTaskById(request, createdProductionTaskId, accessToken);
        expect(byIdAfterDueDate.status).toBe(200);
        expectNoServerError(byIdAfterDueDate);
        const actualDueDate = extractDateValue(byIdAfterDueDate.data);
        expect(actualDueDate, JSON.stringify(byIdAfterDueDate.data)).toBeTruthy();
        expect(new Date(actualDueDate!).toISOString().slice(0, 10)).toBe(new Date(dueDate).toISOString().slice(0, 10));

        const updateOperationPos = await productionTasksAPI.updateProductionOperationPos(
          request,
          productionOperationPosPayload(source, createdProductionTaskId, firstUserId as number, {
            id: createdOperationPosId,
          }),
          accessToken,
        );
        expectNoServerError(updateOperationPos);
        if (!clientErrorCodes.includes(updateOperationPos.status)) {
          expect(successCodes).toContain(updateOperationPos.status);
        }

        if (source.availableQuantity >= 2) {
          const beforeAdd = await productionTasksAPI.getProductionTaskById(request, createdProductionTaskId, accessToken);
          expectNoServerError(beforeAdd);
          const beforeIds = new Set(getOperationPosIds(beforeAdd.data));

          const addOperationPos = await productionTasksAPI.createProductionOperationPos(
            request,
            productionOperationPosPayload(source, createdProductionTaskId, firstUserId as number, { idx: 1 }),
            accessToken,
          );
          expectNoServerError(addOperationPos);
          if (!clientErrorCodes.includes(addOperationPos.status)) {
            expect(successCodes).toContain(addOperationPos.status);
          }

          addedOperationPosId = Number(getQueueData(addOperationPos.data)?.id) || undefined;
          if (!addedOperationPosId) {
            const afterAdd = await productionTasksAPI.getProductionTaskById(request, createdProductionTaskId, accessToken);
            expectNoServerError(afterAdd);
            addedOperationPosId = getOperationPosIds(afterAdd.data).find((id) => !beforeIds.has(id));
          }
          expect(addedOperationPosId, JSON.stringify(addOperationPos.data)).toBeGreaterThan(0);

          const banOperationPos = await productionTasksAPI.banProductionOperationPos(
            request,
            addedOperationPosId as number,
            accessToken,
          );
          expectNoServerError(banOperationPos);
          if (!clientErrorCodes.includes(banOperationPos.status)) {
            expect(successCodes).toContain(banOperationPos.status);
          }
          addedOperationPosId = undefined;
        }

        const archiveTask = await productionTasksAPI.banProductionTask(
          request,
          createdProductionTaskId,
          accessToken,
        );
        expectNoServerError(archiveTask);
        if (!clientErrorCodes.includes(archiveTask.status)) {
          expect(successCodes).toContain(archiveTask.status);
        }

        createdProductionTaskId = undefined;
      } finally {
        if (addedOperationPosId) {
          const cleanupOperationPos = await productionTasksAPI.banProductionOperationPos(
            request,
            addedOperationPosId,
            accessToken,
          );
          expectNoServerError(cleanupOperationPos);
        }
        if (createdProductionTaskId) {
          const cleanup = await productionTasksAPI.banProductionTask(request, createdProductionTaskId, accessToken);
          expectNoServerError(cleanup);
        }
      }
    };

    test('создает, обновляет и архивирует тестовое ПЗ сборки на контролируемых данных', async ({ request }) => {
      await runLifecycleScenario(request, 'ass');
    });

    test('создает, обновляет и архивирует тестовое ПЗ металлообработки на контролируемых данных', async ({ request }) => {
      await runLifecycleScenario(request, 'metall');
    });

    test('возвращает список, список с операциями и count без серверных ошибок', async ({ request }) => {
      const list = await productionTasksAPI.getProductionTaskPaginate(
        request,
        productionTaskPaginationDto(),
        accessToken,
      );
      expectNoServerError(list);
      if (!clientErrorCodes.includes(list.status)) {
        expect(successCodes).toContain(list.status);
        expect(getCount(list.data), JSON.stringify(list.data)).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(getRows(list.data)), JSON.stringify(list.data)).toBe(true);
      }

      const listWithOperations = await productionTasksAPI.getProductionTaskWithOperationsPaginate(
        request,
        productionTaskPaginationDto({ pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(listWithOperations);
      if (!clientErrorCodes.includes(listWithOperations.status)) {
        expect(successCodes).toContain(listWithOperations.status);
        expectPaginationContract(listWithOperations.data, 5);
      }

      const count = await productionTasksAPI.getProductionTaskCount(request, accessToken);
      expect(count.status).toBe(200);
      expectNoServerError(count);
      expect(Number(count.data), JSON.stringify(count.data)).toBeGreaterThanOrEqual(0);
    });

    test('пагинация поддерживает пустой поиск и граничные page/pageSize', async ({ request }) => {
      const noMatch = await productionTasksAPI.getProductionTaskPaginate(
        request,
        productionTaskPaginationDto({ searchValue: 'api-production-task-no-match-999999999' }),
        accessToken,
      );
      expectNoServerError(noMatch);
      if (!clientErrorCodes.includes(noMatch.status)) {
        expect(successCodes).toContain(noMatch.status);
        expect(getCount(noMatch.data), JSON.stringify(noMatch.data)).toBe(0);
        expect(getRows(noMatch.data)).toEqual([]);
      }

      const firstPage = await productionTasksAPI.getProductionTaskPaginate(
        request,
        productionTaskPaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expectNoServerError(firstPage);
      if (!clientErrorCodes.includes(firstPage.status)) {
        expect(successCodes).toContain(firstPage.status);
        expectPaginationContract(firstPage.data, 1);
      }

      const farPage = await productionTasksAPI.getProductionTaskPaginate(
        request,
        productionTaskPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('читает производственное задание по id, если в базе есть активные ПЗ', async ({ request }) => {
      test.skip(!firstTaskId, 'No production tasks are available on this environment.');

      const byId = await productionTasksAPI.getProductionTaskById(request, firstTaskId as number, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(firstTaskId);
      }
    });

    test('возвращает задачи по пользователю, оборудованию и операции без серверных ошибок', async ({ request }) => {
      const byUser = await productionTasksAPI.getProductionTaskByUser(
        request,
        byUserDto(firstUserId as number),
        accessToken,
      );
      expectNoServerError(byUser);
      if (!clientErrorCodes.includes(byUser.status)) {
        expect(successCodes).toContain(byUser.status);
        expect(byUser.data, JSON.stringify(byUser.data)).toBeTruthy();
      }

      if (firstEquipmentId) {
        const byEquipment = await productionTasksAPI.getTaskByEquipment(
          request,
          byEquipmentDto(firstEquipmentId),
          accessToken,
        );
        expectNoServerError(byEquipment);
        if (!clientErrorCodes.includes(byEquipment.status)) {
          expect(successCodes).toContain(byEquipment.status);
          expect(byEquipment.data, JSON.stringify(byEquipment.data)).toBeTruthy();
        }
      }

      test.skip(!firstOperationTypeId, 'No operation type id was found in production task data.');
      const byOperation = await productionTasksAPI.getTaskByProductionOperation(
        request,
        byOperationDto(firstOperationTypeId as number),
        accessToken,
      );
      expectNoServerError(byOperation);
      if (!clientErrorCodes.includes(byOperation.status)) {
        expect(successCodes).toContain(byOperation.status);
        expect(byOperation.data, JSON.stringify(byOperation.data)).toBeTruthy();
      }
    });

    test('возвращает агрегированные доски пользователей, оборудования и результаты работ', async ({ request }) => {
      for (const subdivision of ['Metaloworking', 'Assemble']) {
        const byAllUsers = await productionTasksAPI.getProductionTaskByAllUsers(request, subdivision, accessToken);
        expectNoServerError(byAllUsers);
        if (!clientErrorCodes.includes(byAllUsers.status)) {
          expect(successCodes).toContain(byAllUsers.status);
          expect(Array.isArray(getRows(byAllUsers.data)) || Array.isArray(byAllUsers.data), JSON.stringify(byAllUsers.data)).toBe(true);
        }
      }

      const byAllEquipments = await productionTasksAPI.getProductionTaskByAllEquipments(request, undefined, accessToken);
      expectNoServerError(byAllEquipments);
      if (!clientErrorCodes.includes(byAllEquipments.status)) {
        expect(successCodes).toContain(byAllEquipments.status);
        expect(Array.isArray(getRows(byAllEquipments.data)) || Array.isArray(byAllEquipments.data), JSON.stringify(byAllEquipments.data)).toBe(true);
      }

      const resultWorks = await productionTasksAPI.getResultWorks(request, resultWorksDto(), accessToken);
      expectNoServerError(resultWorks);
      if (!clientErrorCodes.includes(resultWorks.status)) {
        expect(successCodes).toContain(resultWorks.status);
        expect(resultWorks.data, JSON.stringify(resultWorks.data)).toBeTruthy();
      }
    });

    test('возвращает план ПЗ, онлайн-доски и дефицит деталей без серверных ошибок', async ({ request }) => {
      for (const workingType of ['ass', 'metall']) {
        const plan = await productionTasksAPI.getPlanForProductionTask(
          request,
          planDto({ workingType }),
          accessToken,
        );
        expectNoServerError(plan);
        if (!clientErrorCodes.includes(plan.status)) {
          expect(successCodes).toContain(plan.status);
          expectPaginationContract(plan.data);
        }

        const onlineBoard = await productionTasksAPI.getOnlineBoard(
          request,
          onlineBoardDto({ workingType }),
          accessToken,
        );
        expectNoServerError(onlineBoard);
        if (!clientErrorCodes.includes(onlineBoard.status)) {
          expect(successCodes).toContain(onlineBoard.status);
          expect(onlineBoard.data, JSON.stringify(onlineBoard.data)).toBeTruthy();
        }

        const onlineBoardProduction = await productionTasksAPI.getOnlineBoardProduction(
          request,
          onlineBoardDto({ workingType }),
          accessToken,
        );
        expectNoServerError(onlineBoardProduction);
        if (!clientErrorCodes.includes(onlineBoardProduction.status)) {
          expect(successCodes).toContain(onlineBoardProduction.status);
          expect(onlineBoardProduction.data, JSON.stringify(onlineBoardProduction.data)).toBeTruthy();
        }
      }

      const detalDeficit = await productionTasksAPI.getDetalDeficit(request, detalDeficitDto(), accessToken);
      expectNoServerError(detalDeficit);
      if (!clientErrorCodes.includes(detalDeficit.status)) {
        expect(successCodes).toContain(detalDeficit.status);
        expect(detalDeficit.data, JSON.stringify(detalDeficit.data)).toBeTruthy();
      }
    });

    test('возвращает операции ПЗ и данные модалки задач по операции', async ({ request }) => {
      for (const productionOperationType of ['ass', 'metall']) {
        const operations = await productionTasksAPI.getTOperationList(
          request,
          {
            productionOperationType,
            ...(firstTaskId ? { productionTaskIds: [firstTaskId] } : {}),
          },
          accessToken,
        );
        expectNoServerError(operations);
        if (!clientErrorCodes.includes(operations.status)) {
          expect(successCodes).toContain(operations.status);
          expect(Array.isArray(operations.data), JSON.stringify(operations.data)).toBe(true);
        }
      }

      test.skip(!firstEntity || !firstOperationTypeId, 'No production entity or operation type id was found in production task data.');

      const taskOperations = await productionTasksAPI.getTaskOperations(
        request,
        taskOperationsDto(firstEntity!.type, firstEntity!.id, firstOperationTypeId as number, {
          productionTaskId: firstTaskId,
        }),
        accessToken,
      );
      expectNoServerError(taskOperations);
      if (!clientErrorCodes.includes(taskOperations.status)) {
        expect(successCodes).toContain(taskOperations.status);
        expect(taskOperations.data, JSON.stringify(taskOperations.data)).toBeTruthy();
      }
    });

    test('проверяет связи ПЗ с производственной сущностью, если такая связь найдена', async ({ request }) => {
      test.skip(!firstProductionEntity, 'No product/cbed/detal relation was found in production task data.');

      const shipment = await productionTasksAPI.getShipmentByProductionTask(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(shipment);

      const percent = await productionTasksAPI.getPercentByProductionTask(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(percent);

      const tasksByEntity = await productionTasksAPI.getProductionTaskByEntity(
        request,
        {
          entityType: firstProductionEntity!.type,
          entityId: firstProductionEntity!.id,
        },
        accessToken,
      );
      expectNoServerError(tasksByEntity);

      const relativeDate = await productionTasksAPI.getRelativeDateForEntity(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(relativeDate);

      if (firstEntity) {
        const workload = await productionTasksAPI.getWorkloadByEntity(
          request,
          workloadDto({ entityType: firstEntity.type }),
          accessToken,
        );
        expectNoServerError(workload);
      }
    });

    test('возвращает стартовые даты без серверных ошибок для найденных исполнителей', async ({ request }) => {
      const userStartTime = await productionTasksAPI.getStartTimeByUser(request, firstUserId as number, accessToken);
      expectNoServerError(userStartTime);

      if (firstEquipmentId) {
        const equipmentStartTime = await productionTasksAPI.getStartTimeByEquipment(
          request,
          firstEquipmentId,
          accessToken,
        );
        expectNoServerError(equipmentStartTime);
      }
    });

    test('обновляет start time пользователя и возвращает исходное значение', async ({ request }) => {
      const originalUserStartTime = await productionTasksAPI.getStartTimeByUser(request, firstUserId as number, accessToken);
      expectNoServerError(originalUserStartTime);
      const originalTime = extractDateValue(originalUserStartTime.data);
      test.skip(!originalTime, 'No existing user start time is available to restore safely.');

      const newTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      let shouldRestoreUserTime = false;

      try {
        const setUserStartTime = await productionTasksAPI.setStartTimeByUser(
          request,
          { userId: firstUserId as number, time: newTime },
          accessToken,
        );
        expectNoServerError(setUserStartTime);
        expect(successCodes, JSON.stringify(setUserStartTime.data)).toContain(setUserStartTime.status);
        shouldRestoreUserTime = true;

        const updatedUserStartTime = await productionTasksAPI.getStartTimeByUser(request, firstUserId as number, accessToken);
        expectNoServerError(updatedUserStartTime);
        const updatedTime = extractDateValue(updatedUserStartTime.data);
        expect(updatedTime, JSON.stringify(updatedUserStartTime.data)).toBeTruthy();
        expect(sameUtcMinute(updatedTime!, newTime), JSON.stringify(updatedUserStartTime.data)).toBe(true);
      } finally {
        if (shouldRestoreUserTime) {
          const restoreUserStartTime = await productionTasksAPI.setStartTimeByUser(
            request,
            { userId: firstUserId as number, time: originalTime },
            accessToken,
          );
          expectNoServerError(restoreUserStartTime);
        }
      }
    });

    test('негативные операции назначения по найденной позиции ПЗ не приводят к серверным ошибкам', async ({ request }) => {
      test.skip(!firstOperationPosId, 'No production operation position id was found in production task data.');

      const setMissingResponsible = await productionTasksAPI.setResponsibleUser(
        request,
        firstOperationPosId as number,
        999999999,
        accessToken,
      );
      expectNoServerError(setMissingResponsible);

      const setMissingEquipment = await productionTasksAPI.setEquipment(
        request,
        firstOperationPosId as number,
        999999999,
        accessToken,
      );
      expectNoServerError(setMissingEquipment);
    });
  });

  test.describe('Production Tasks API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('защитные searchValue/searchString payload не приводят к 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchValue of cases) {
        const list = await productionTasksAPI.getProductionTaskPaginate(
          request,
          productionTaskPaginationDto({ searchValue }),
          accessToken,
        );
        expectNoServerError(list);

        const byUser = await productionTasksAPI.getProductionTaskByUser(
          request,
          byUserDto(Number(API_CONST.API_TEST_USER_ID), { searchString: searchValue }),
          accessToken,
        );
        expectNoServerError(byUser);
      }
    });

    test('несуществующие id и невалидные справочники обрабатываются без серверных ошибок', async ({ request }) => {
      const byId = await productionTasksAPI.getProductionTaskById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const byUser = await productionTasksAPI.getProductionTaskByUser(
        request,
        byUserDto(999999999),
        accessToken,
      );
      expectNoServerError(byUser);

      const byEquipment = await productionTasksAPI.getTaskByEquipment(
        request,
        byEquipmentDto(999999999),
        accessToken,
      );
      expectNoServerError(byEquipment);

      const byOperation = await productionTasksAPI.getTaskByProductionOperation(
        request,
        byOperationDto(999999999),
        accessToken,
      );
      expectNoServerError(byOperation);

      const invalidSubdivision = await productionTasksAPI.getProductionTaskByAllUsers(
        request,
        'invalid-subdivision',
        accessToken,
      );
      expectNotSuccessful(invalidSubdivision);

      const invalidRelativeDate = await productionTasksAPI.getRelativeDateForEntity(
        request,
        'invalid-type',
        999999999,
        accessToken,
      );
      expectNotSuccessful(invalidRelativeDate);

      const invalidTOperations = await productionTasksAPI.getTOperationList(
        request,
        { productionOperationType: 'invalid-type' },
        accessToken,
      );
      expectNotSuccessful(invalidTOperations);
    });

    test('невалидные мутации ПЗ отклоняются без серверных ошибок', async ({ request }) => {
      const invalidCreate = await productionTasksAPI.createProductionTask(
        request,
        {
          number_order: '',
          description: '',
          type: 'invalid-type',
          date_order: null,
        },
        accessToken,
      );
      expectNotSuccessful(invalidCreate);

      const invalidUpdate = await productionTasksAPI.updateProductionTask(
        request,
        {
          id: 999999999,
          number_order: '',
          description: '',
          working_type: 'invalid-type',
        },
        accessToken,
      );
      expectNotSuccessful(invalidUpdate);

      const invalidCreateOperationPos = await productionTasksAPI.createProductionOperationPos(
        request,
        invalidOperationPosDto(),
        accessToken,
      );
      expectNotSuccessful(invalidCreateOperationPos);

      const invalidUpdateOperationPos = await productionTasksAPI.updateProductionOperationPos(
        request,
        invalidOperationPosDto({ id: 999999999 }),
        accessToken,
      );
      expectNotSuccessful(invalidUpdateOperationPos);

      const invalidStartTimeUser = await productionTasksAPI.setStartTimeByUser(
        request,
        { userId: 999999999, time: new Date().toISOString() },
        accessToken,
      );
      expectNotSuccessful(invalidStartTimeUser);

      const invalidStartTimeEquipment = await productionTasksAPI.setStartTimeByEquipment(
        request,
        { equipmentId: 999999999, time: new Date().toISOString() },
        accessToken,
      );
      expectNotSuccessful(invalidStartTimeEquipment);

      const invalidBanOperationPos = await productionTasksAPI.banProductionOperationPos(
        request,
        999999999,
        accessToken,
      );
      expectNotSuccessful(invalidBanOperationPos);

      const invalidBanTask = await productionTasksAPI.banProductionTask(
        request,
        999999999,
        accessToken,
      );
      expectNotSuccessful(invalidBanTask);
    });

    test('мутации без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await productionTasksAPI.createProductionTask(request, {
        number_order: '',
        description: '',
        type: 'ass',
        date_order: null,
      });
      expectNotSuccessful(createResponse);

      const dueDateResponse = await productionTasksAPI.updateStatusProductionTask(request, {
        productionTaskId: 999999999,
        date: new Date().toISOString(),
      });
      expectNotSuccessful(dueDateResponse);

      const operationPosResponse = await productionTasksAPI.createProductionOperationPos(
        request,
        invalidOperationPosDto(),
      );
      expectNotSuccessful(operationPosResponse);

      const setResponsibleResponse = await productionTasksAPI.setResponsibleUser(
        request,
        999999999,
        999999999,
      );
      expectNotSuccessful(setResponsibleResponse);
    });
  });
};
