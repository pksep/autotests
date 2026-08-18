import { test, expect } from '@playwright/test';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { MetaloworkingAPI } from '../../pages/API/APIMetaloworking';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { UsersAPI } from '../../pages/API/APIUsers';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import type { ApiResult } from '../../lib/helpers/APIAssertions';
import {
  captureApiResult,
  clientErrorCodes,
  expectApiContract,
  expectArrayResponse,
  expectClientError,
  expectEndpointReached,
  expectErrorResponseContract,
  expectNoServerError,
  expectObjectResponse,
  expectPaginationContract,
  expectSchemaContract,
  getCount,
  getRows,
  serverErrorCodes,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { expectArchivedOnlyInArchiveSelection, expectRepeatOperationRejectedOrIdempotent } from '../../lib/helpers/APIDataInvariants';
import {
  paginationOf,
  productionTaskResponseSchema,
} from '../../lib/helpers/APIContractSchemas';

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
const equipmentAPI = new EquipmentAPI(null);
const metaloworkingAPI = new MetaloworkingAPI(null);
const usersAPI = new UsersAPI(null as any);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasNoServerError = (response: ApiResult) => !serverErrorCodes.includes(response.status);

const waitForStaggeredProductionCalculation = async (offsetMs: number) => {
  const configuredWorkers = Number((test.info().config as any).workers ?? 1);
  if (configuredWorkers <= 1) return;
  await sleep(offsetMs + test.info().parallelIndex * 5000);
};

const waitForTaskOperations = async (
  request: any,
  dto: Record<string, unknown>,
  accessToken?: string,
): Promise<ApiResult> => {
  let lastResponse: ApiResult | undefined;
  let lastError: Error | undefined;

  const response = await eventually(async () => {
    try {
      lastResponse = await productionTasksAPI.getTaskOperations(request, dto, accessToken);
      lastError = undefined;
      return lastResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      return { status: 0, data: { message: lastError.message } };
    }
  }, (response) => response.status > 0 && hasNoServerError(response), { attempts: 8, intervalMs: 1500 });

  if (response) return response;
  if (lastResponse) return lastResponse;
  throw lastError ?? new Error(`Production task operations did not return a response for dto: ${JSON.stringify(dto)}`);
};

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
  orderId: [],
  customer: 'buyer',
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

const metaloworkingPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  responsibleUserId: null,
  metalloworkingID: null,
  searchString: '',
  isBan: false,
  childrenByProductionTaskIds: [],
  byParents: byParents(),
  byOrder: undefined,
  isDiscontinued: false,
  sort: [],
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

const onlineBoardMoByAssemblyTaskDto = (overrides: Record<string, unknown> = {}) =>
  detalDeficitDto({
    range: {
      start: '1969-12-31T21:00:00.000Z',
      end: '2100-01-01T20:59:59.999Z',
    },
    sort: [
      {
        sortField: 'calculatedCreateTime',
        sortDesc: false,
      },
    ],
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

const WORK_START_HOUR_UTC = 5;
const WORK_END_HOUR_UTC = 13;
const WORK_END_MINUTE_UTC = 30;
const DATE_TOLERANCE_MS = 1000;
const DATE_MINUTE_TOLERANCE_MS = 60000;

const isWorkDay = (date: Date): boolean => {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
};

const workDayStart = (date: Date): Date => {
  const copy = new Date(date);
  copy.setUTCHours(WORK_START_HOUR_UTC, 0, 0, 0);
  return copy;
};

const workDayEnd = (date: Date): Date => {
  const copy = new Date(date);
  copy.setUTCHours(WORK_END_HOUR_UTC, WORK_END_MINUTE_UTC, 0, 0);
  return copy;
};

const isAtWorkDayEnd = (date: Date): boolean =>
  isWorkDay(date) &&
  date.getUTCHours() === WORK_END_HOUR_UTC &&
  date.getUTCMinutes() === WORK_END_MINUTE_UTC &&
  date.getUTCSeconds() === 0 &&
  date.getUTCMilliseconds() === 0;

const moveToNextWorkDay = (date: Date): Date => {
  const next = new Date(date);
  do {
    next.setUTCDate(next.getUTCDate() + 1);
  } while (!isWorkDay(next));
  next.setUTCHours(WORK_START_HOUR_UTC, 0, 0, 0);
  return next;
};

const moveToPreviousWorkDay = (date: Date): Date => {
  const prev = new Date(date);
  do {
    prev.setUTCDate(prev.getUTCDate() - 1);
  } while (!isWorkDay(prev));
  prev.setUTCHours(WORK_END_HOUR_UTC, WORK_END_MINUTE_UTC, 0, 0);
  return prev;
};

const calculateEndDateLocal = (dateValue: string | Date, minutes: number): Date => {
  let current = new Date(dateValue);
  let remaining = Math.max(Number(minutes) || 0, 0);

  if (!isWorkDay(current)) {
    current = moveToNextWorkDay(current);
  } else {
    const currentMinute = current.getUTCHours() * 60 + current.getUTCMinutes();
    const startMinute = WORK_START_HOUR_UTC * 60;
    const endMinute = WORK_END_HOUR_UTC * 60 + WORK_END_MINUTE_UTC;
    if (currentMinute < startMinute) current = workDayStart(current);
    if (currentMinute >= endMinute) current = moveToNextWorkDay(current);
  }

  while (remaining > 0) {
    const end = workDayEnd(current);
    const available = Math.min(remaining, (end.getTime() - current.getTime()) / 60000);
    if (available > 0) {
      current = new Date(current.getTime() + available * 60000);
      remaining -= available;
    }
    if (remaining > 0) current = moveToNextWorkDay(current);
  }

  if (isAtWorkDayEnd(current)) current = moveToNextWorkDay(current);

  return current;
};

const calculateStartDateLocal = (dateValue: string | Date, minutes: number): Date => {
  let current = new Date(dateValue);
  let remaining = Math.max(Number(minutes) || 0, 0);

  if (!isWorkDay(current)) {
    current = moveToPreviousWorkDay(current);
  } else {
    const currentMinute = current.getUTCHours() * 60 + current.getUTCMinutes();
    const startMinute = WORK_START_HOUR_UTC * 60;
    const endMinute = WORK_END_HOUR_UTC * 60 + WORK_END_MINUTE_UTC;
    if (currentMinute < startMinute) current = moveToPreviousWorkDay(current);
    if (currentMinute > endMinute) current = workDayEnd(current);
  }

  while (remaining > 0) {
    const start = workDayStart(current);
    const available = Math.min(remaining, (current.getTime() - start.getTime()) / 60000);
    if (available > 0) {
      current = new Date(current.getTime() - available * 60000);
      remaining -= available;
    }
    if (remaining > 0) current = moveToPreviousWorkDay(current);
  }

  return current;
};

const calculateDeltaTimeLocal = (calculatedCreateTime: string | Date, planReadyTime: string | Date): number => {
  const calculatedDate = new Date(calculatedCreateTime);
  const planDate = new Date(planReadyTime);
  const sign = calculatedDate <= planDate ? 1 : -1;
  const start = calculatedDate <= planDate ? calculatedDate : planDate;
  const end = calculatedDate <= planDate ? planDate : calculatedDate;

  let totalMinutes = 0;
  const current = new Date(start);

  while (current < end) {
    if (!isWorkDay(current)) {
      current.setUTCDate(current.getUTCDate() + 1);
      current.setUTCHours(0, 0, 0, 0);
      continue;
    }

    const actualStart = current > workDayStart(current) ? current : workDayStart(current);
    const actualEnd = end < workDayEnd(current) ? end : workDayEnd(current);

    if (actualStart < actualEnd) {
      totalMinutes += (actualEnd.getTime() - actualStart.getTime()) / 60000;
    }

    current.setUTCDate(current.getUTCDate() + 1);
    current.setUTCHours(0, 0, 0, 0);
  }

  return Math.round(totalMinutes) * sign;
};

const dateMs = (value: unknown): number | null => {
  if (!value) return null;
  const date = new Date(value as string);
  if (!Number.isFinite(date.getTime())) return null;
  return (isAtWorkDayEnd(date) ? moveToNextWorkDay(date) : date).getTime();
};

const expectSameDate = (actual: unknown, expected: unknown, context: string, toleranceMs = DATE_TOLERANCE_MS) => {
  const actualMs = dateMs(actual);
  const expectedMs = dateMs(expected);
  const details = `${context}; actual=${actual ?? null}; expected=${expected ?? null}`;

  if (expectedMs === null) {
    expect(actualMs, details).toBeNull();
    return;
  }

  expect(actualMs, details).not.toBeNull();
  expect(Math.abs((actualMs as number) - expectedMs), details).toBeLessThanOrEqual(toleranceMs);
};

const getOperationDurationMinutes = (operation: ApiRow | undefined): number => {
  const operationTime = operation?.operationTime;
  if (operationTime && Number.isFinite(Number(operationTime.count))) return Number(operationTime.count);

  return getOperationFormulaDurationMinutes(operation, Number(operation?.quantityMax ?? operation?.countNeeds ?? 1));
};

const getOperationFormulaDurationMinutes = (operation: ApiRow | undefined, quantityValue: unknown): number => {
  const preTime = Number(operation?.preTime || 0);
  const mainTime = Number(operation?.mainTime || 0);
  const helperTime = Number(operation?.helperTime || 0);
  const quantity = Number(quantityValue || 0);
  const hasFormulaTime = [operation?.preTime, operation?.mainTime, operation?.helperTime].some((value) =>
    Number.isFinite(Number(value)),
  );
  if (hasFormulaTime) return preTime + (mainTime + helperTime) * quantity;

  return 0;
};

const getCalculatedOperationDurationMinutes = (operation: ApiRow | undefined): number | undefined => {
  if (!operation?.calculateStartTime || !operation?.planReadyTime) return undefined;
  return Math.abs(calculateDeltaTimeLocal(operation.calculateStartTime, operation.planReadyTime));
};

const expectSameNumber = (actual: unknown, expected: unknown, context: string, tolerance = 0.000001) => {
  const actualNumber = Number(actual);
  const expectedNumber = Number(expected);
  const details = `${context}; actual=${actual ?? null}; expected=${expected ?? null}`;

  expect(Number.isFinite(actualNumber), details).toBeTruthy();
  expect(Number.isFinite(expectedNumber), details).toBeTruthy();
  expect(Math.abs(actualNumber - expectedNumber), details).toBeLessThanOrEqual(tolerance);
};

const expectProductionQuantityFields = (
  position: ApiRow,
  operation: ApiRow,
  orderedQuantity: unknown,
  context: string,
) => {
  const ordered = Number(orderedQuantity);
  const created = Number(operation.countCreated || 0);
  const remaining = Math.max(ordered - created, 0);
  const expectedTimeToPrepare = getOperationFormulaDurationMinutes(operation, ordered);

  expectSameNumber(orderedQuantity, ordered, `Кол-во заказанное по ПЗ: ${context}`);
  expectSameNumber(position.remainingByProductionTask, remaining, `Осталось сделать: ${context}`);
  expectSameNumber(position.timeToPrepare, expectedTimeToPrepare, `Время на изготовление ч/мин: ${context}`);
  expectSameNumber(created + Number(position.remainingByProductionTask || 0), ordered, `Отметки + осталось = заказано: ${context}`);
  expectSameNumber(created, ordered - Number(position.remainingByProductionTask || 0), `Количество отметок в ячейке операции: ${context}`);
};

const expectOperationCellFields = (
  operation: ApiRow | null | undefined,
  expectedIdx: number | null,
  orderedQuantity: unknown,
  executionQuantity: unknown,
  context: string,
) => {
  if (expectedIdx === null) {
    expect(operation?.id || null, `${context}; actual=${operation?.id ?? null}; expected=null`).toBeNull();
    return;
  }

  expect(operation?.id, `${context}: операция должна быть заполнена`).toBeTruthy();
  expectSameNumber(operation?.idx, expectedIdx, `idx операции: ${context}`);
  expect(
    Number(operation?.countCreated || 0),
    `Количество отметок операции: ${context}; actual=${operation?.countCreated ?? null}`,
  ).toBeGreaterThanOrEqual(0);

  const expectedExecutionTime = getOperationFormulaDurationMinutes(operation || undefined, executionQuantity);
  expect(expectedExecutionTime, `Время выполнения ячейки операции: ${context}`).toBeGreaterThanOrEqual(0);

  const expectedDateExecute = operation?.startTime
    ? calculateEndDateLocal(operation.startTime, getOperationDurationMinutes(operation))
    : null;
  expectSameDate(operation?.calculateNeedsTime || null, expectedDateExecute, `Дата выполнения ячейки операции: ${context}`);
};

const getWorkStartCalcType = (position: ApiRow, operation: ApiRow): string => {
  const directValue = operation.workStartCalcType || operation.typeOperation?.workStartCalcType;
  if (directValue) return String(directValue);

  const techProcessOperation = Array.isArray(position.techProcess?.operations)
    ? position.techProcess.operations.find((item: ApiRow) => Number(item.id) === Number(operation.id))
    : null;

  return String(techProcessOperation?.workStartCalcType || techProcessOperation?.typeOperation?.workStartCalcType || 'automatic');
};

const getEquipmentRows = (data: unknown): ApiRow[] => {
  const rows = getRows<ApiRow>(data);
  if (rows.length) return rows;
  if (Array.isArray(data)) return data as ApiRow[];
  if (!data || typeof data !== 'object') return [];
  return Object.values(data as ApiRow)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .filter((item): item is ApiRow => Boolean(item && typeof item === 'object' && Number.isFinite(Number(item.id))));
};

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

const expectNumericContract = (response: { status: number; data?: any }, min = 0, max?: number) => {
  expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
  expect(Number.isFinite(Number(response.data)), JSON.stringify(response.data)).toBe(true);
  expect(Number(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(min);
  if (max !== undefined) expect(Number(response.data), JSON.stringify(response.data)).toBeLessThanOrEqual(max);
};

const getRequiredPageRowCount = (data: unknown, label: string): number => {
  const rows = getRows(data);
  expect(Array.isArray(rows), `${label} should return pagination rows`).toBe(true);
  return rows.length;
};

const getRequiredCount = (data: unknown, label: string): number => {
  const count = getCount(data);
  expect(count, `${label} should return pagination count`).toBeGreaterThanOrEqual(0);
  return count as number;
};

const getRequiredUniqueDetalIds = (data: unknown, label: string): number[] => {
  const rows = getRows<ApiRow>(data);
  expect(Array.isArray(rows), `${label} should return pagination rows`).toBe(true);

  const detailIds = rows.map((row) => {
    const rawId = row.detalId ?? row.detal_id ?? row.detal?.id ?? row.detail?.id ?? row.entity?.id;
    return Number(rawId);
  });

  const invalidRows = rows.filter((_, index) => !Number.isFinite(detailIds[index]) || detailIds[index] <= 0);
  expect(invalidRows, `${label} should return rows with detail ids`).toHaveLength(0);

  return [...new Set(detailIds)].sort((left, right) => left - right);
};

const getRequiredPaginatedUniqueDetalIds = async (
  firstPageData: unknown,
  label: string,
  getPage: (page: number) => Promise<{ status: number; data?: any }>,
): Promise<number[]> => {
  const detailIds = new Set(getRequiredUniqueDetalIds(firstPageData, label));
  const count = getRequiredCount(firstPageData, label);
  const firstPageRows = getRows(firstPageData);
  const pageSize = firstPageRows.length || 50;
  const pageCount = Math.ceil(count / pageSize);

  for (let page = 1; page < pageCount; page++) {
    const response = await getPage(page);
    expectNoServerError(response);
    expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
    expectPaginationContract(response.data);

    for (const detalId of getRequiredUniqueDetalIds(response.data, `${label}, page ${page}`)) {
      detailIds.add(detalId);
    }
  }

  return [...detailIds].sort((left, right) => left - right);
};

const expectNullableObjectContract = (data: unknown) => {
  if (data === null) return;
  expectObjectResponse(data);
};

const expectRelativeDateContract = (data: unknown) => {
  expectObjectResponse(data);
  const record = data as ApiRow;
  expect(Array.isArray(record.productionOperationPositionsIds), JSON.stringify(data)).toBe(true);
  if (record.relativeDate !== null) {
    expect(Number.isFinite(Date.parse(record.relativeDate)), JSON.stringify(data)).toBe(true);
  }
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
    let createdReadFixtureTaskId: number | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);

      let list = await productionTasksAPI.getProductionTaskWithOperationsPaginate(
        request,
        productionTaskPaginationDto({ pageSize: 50 }),
        accessToken,
      );
      expectNoServerError(list);

      let tasks = getRows<ApiRow>(list.data).filter((row) => row.id);
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

      if (!firstTaskId || !firstOperationTypeId || !firstOperationPosId || !firstEntity) {
        const lifecycleSource = await findLifecycleSource(request, undefined, accessToken);
        expect(lifecycleSource, 'No plan row with operations is available to create production task fixture.').toBeTruthy();
        const source = lifecycleSource!;

        if (source.typeWork === 'metall' && !source.equipmentId) {
          source.equipmentId = firstEquipmentId;
        }
        if (source.typeWork === 'metall' && !source.equipmentId) {
          const allEquipments = await productionTasksAPI.getProductionTaskByAllEquipments(request, undefined, accessToken);
          expectNoServerError(allEquipments);
          source.equipmentId = findEquipmentId(allEquipments.data);
        }
        expect(
          source.typeWork !== 'metall' || source.equipmentId,
          'No equipment id is available to create metal production task fixture.',
        ).toBeTruthy();

        const suffix = uniqueApiSuffix('pt-read');
        const createResponse = await productionTasksAPI.createProductionTask(
          request,
          createProductionTaskPayload(source, firstUserId as number, suffix),
          accessToken,
        );
        expectNoServerError(createResponse);
        expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
        createdReadFixtureTaskId = Number(getQueueData(createResponse.data)?.id);
        expect(createdReadFixtureTaskId, JSON.stringify(createResponse.data)).toBeGreaterThan(0);

        const byId = await productionTasksAPI.getProductionTaskById(request, createdReadFixtureTaskId, accessToken);
        expectNoServerError(byId);
        expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);

        firstTask = byId.data;
        firstTaskId = createdReadFixtureTaskId;
        firstOperationTypeId = source.operationId;
        firstOperationPosId = findOperationPosIdForTask(byId.data);
        firstEntity = findEntityForTask(byId.data) || { type: source.typeWork, id: source.entityId };
        firstProductionEntity = findProductionEntityForTask(byId.data);

        list = await productionTasksAPI.getProductionTaskWithOperationsPaginate(
          request,
          productionTaskPaginationDto({ pageSize: 50 }),
          accessToken,
        );
        expectNoServerError(list);
        tasks = getRows<ApiRow>(list.data).filter((row) => row.id);
      }
    });

    test.afterAll(async ({ request }) => {
      if (!createdReadFixtureTaskId) return;
      const cleanup = await productionTasksAPI.banProductionTask(request, createdReadFixtureTaskId, accessToken);
      expectNoServerError(cleanup);
    });

    const runLifecycleScenario = async (request: any, typeWork: LifecycleType) => {
      const lifecycleSource = await findLifecycleSource(request, typeWork, accessToken);
      expect(lifecycleSource, `No ${typeWork} plan row with operations is available for lifecycle create.`).toBeTruthy();
      const source = lifecycleSource!;

      if (typeWork === 'metall' && !source.equipmentId) {
        source.equipmentId = firstEquipmentId;
      }
      if (typeWork === 'metall' && !source.equipmentId) {
        const allEquipments = await productionTasksAPI.getProductionTaskByAllEquipments(request, undefined, accessToken);
        expectNoServerError(allEquipments);
        source.equipmentId = findEquipmentId(allEquipments.data);
      }
      expect(typeWork !== 'metall' || source.equipmentId, 'No equipment id is available for metal lifecycle create.').toBeTruthy();

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
            const productionTaskIdForPolling = createdProductionTaskId as number;
            const afterAdd = await eventually(
              async () => productionTasksAPI.getProductionTaskById(request, productionTaskIdForPolling, accessToken),
              (response) => {
                if (serverErrorCodes.includes(response.status)) return false;
                return getOperationPosIds(response.data).some((id) => !beforeIds.has(id));
              },
              { attempts: 12, intervalMs: 750 },
            );
            expect(afterAdd, JSON.stringify(addOperationPos.data)).toBeTruthy();
            expectNoServerError(afterAdd!);
            addedOperationPosId = getOperationPosIds(afterAdd!.data).find((id) => !beforeIds.has(id));
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

        let activeAfterArchive: ApiResult | undefined;
        let archiveAfterArchive: ApiResult | undefined;
        const archivedState = await eventually(
          async () => {
            activeAfterArchive = await productionTasksAPI.getProductionTaskPaginate(
              request,
              productionTaskPaginationDto({ isBan: false, searchValue: `API production task lifecycle ${suffix}` }),
              accessToken,
            );
            archiveAfterArchive = await productionTasksAPI.getProductionTaskPaginate(
              request,
              productionTaskPaginationDto({ isBan: true, searchValue: `API production task lifecycle ${suffix}` }),
              accessToken,
            );
            expectNoServerError(activeAfterArchive);
            expectNoServerError(archiveAfterArchive);
            return { activeAfterArchive, archiveAfterArchive };
          },
          ({ activeAfterArchive, archiveAfterArchive }) =>
            !clientErrorCodes.includes(activeAfterArchive.status) &&
            !clientErrorCodes.includes(archiveAfterArchive.status) &&
            successCodes.includes(activeAfterArchive.status) &&
            successCodes.includes(archiveAfterArchive.status) &&
            !getRows<ApiRow>(activeAfterArchive.data).some((row) => Number(row.id) === createdProductionTaskId) &&
            getRows<ApiRow>(archiveAfterArchive.data).some((row) => Number(row.id) === createdProductionTaskId),
          { attempts: 30, intervalMs: 2000 },
        );
        expect(
          archivedState,
          [
            `DELETE /api/production-task/ban/${createdProductionTaskId}: Bull не успел обновить active/archive выдачу ПЗ`,
            `active: ${JSON.stringify(activeAfterArchive?.data)}`,
            `archive: ${JSON.stringify(archiveAfterArchive?.data)}`,
          ].join('\n'),
        ).toBeTruthy();
        if (!archivedState) return;
        activeAfterArchive = archivedState.activeAfterArchive;
        archiveAfterArchive = archivedState.archiveAfterArchive;
        expectNoServerError(activeAfterArchive);
        expectNoServerError(archiveAfterArchive);
        if (!clientErrorCodes.includes(activeAfterArchive.status) && !clientErrorCodes.includes(archiveAfterArchive.status)) {
          expect(successCodes).toContain(activeAfterArchive.status);
          expect(successCodes).toContain(archiveAfterArchive.status);
          expectArchivedOnlyInArchiveSelection(
            getRows<ApiRow>(activeAfterArchive.data),
            getRows<ApiRow>(archiveAfterArchive.data),
            createdProductionTaskId,
          );
        }

        const archivedById = await productionTasksAPI.getProductionTaskById(request, createdProductionTaskId, accessToken);
        expectNoServerError(archivedById);
        if (!clientErrorCodes.includes(archivedById.status)) {
          expect(successCodes).toContain(archivedById.status);
          expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(createdProductionTaskId);
          expect(archivedById.data?.ban ?? true, JSON.stringify(archivedById.data)).not.toBe(false);
        }

        const secondArchiveTask = await productionTasksAPI.banProductionTask(
          request,
          createdProductionTaskId,
          accessToken,
        );
        expectNoServerError(secondArchiveTask);
        expectRepeatOperationRejectedOrIdempotent(archiveTask.status, secondArchiveTask.status, successCodes, [400, 404, 409, 410, 422]);

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
        expectApiContract(list, { shape: 'pagination', schema: paginationOf(productionTaskResponseSchema) });
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
        expectApiContract(listWithOperations, { shape: 'pagination', schema: paginationOf(productionTaskResponseSchema) });
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
        expectApiContract(firstPage, { shape: 'pagination', schema: paginationOf(productionTaskResponseSchema) });
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
        expectApiContract(farPage, { shape: 'pagination', schema: paginationOf(productionTaskResponseSchema) });
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('читает производственное задание по id, если в базе есть активные ПЗ', async ({ request }) => {
      expect(firstTaskId, 'Production task fixture was not prepared.').toBeTruthy();

      const byId = await productionTasksAPI.getProductionTaskById(request, firstTaskId as number, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expectSchemaContract(byId.data, productionTaskResponseSchema);
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

      expect(firstOperationTypeId, 'Operation type id was not prepared in production task data.').toBeTruthy();
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
          expectApiContract(plan, { shape: 'pagination', schema: paginationOf(productionTaskResponseSchema) });
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

    test('синхронизирует счетчики создания ПЗ МО с металлообработкой и онлайн-табло МО по ПЗ сборки', async ({ request }) => {
      const planAll = await productionTasksAPI.getPlanForProductionTask(
        request,
        planDto({ workingType: 'metall', deficitFilteringType: 'all' }),
        accessToken,
      );
      expectNoServerError(planAll);
      expect(successCodes, JSON.stringify(planAll.data)).toContain(planAll.status);
      expectPaginationContract(planAll.data);

      const metaloworking = await metaloworkingAPI.getPagination(request, metaloworkingPaginationDto(), accessToken);
      expectNoServerError(metaloworking);
      expect(successCodes, JSON.stringify(metaloworking.data)).toContain(metaloworking.status);
      expectPaginationContract(metaloworking.data);

      const planAllCount = getRequiredCount(planAll.data, 'План ПЗ МО с фильтром "Все"');
      const metaloworkingCount = getRequiredCount(metaloworking.data, 'Страница металлообработки');
      expect(planAllCount, `План ПЗ МО "Все": ${planAllCount}; металлообработка: ${metaloworkingCount}`).toBe(
        metaloworkingCount,
      );

      const planAssemblyDeficit = await productionTasksAPI.getPlanForProductionTask(
        request,
        planDto({ workingType: 'metall', deficitFilteringType: 'assembleDeficit' }),
        accessToken,
      );
      expectNoServerError(planAssemblyDeficit);
      expect(successCodes, JSON.stringify(planAssemblyDeficit.data)).toContain(planAssemblyDeficit.status);
      expectPaginationContract(planAssemblyDeficit.data);

      const onlineBoardMoByAssemblyTask = await productionTasksAPI.getDetalDeficit(
        request,
        onlineBoardMoByAssemblyTaskDto(),
        accessToken,
      );
      expectNoServerError(onlineBoardMoByAssemblyTask);
      expect(successCodes, JSON.stringify(onlineBoardMoByAssemblyTask.data)).toContain(onlineBoardMoByAssemblyTask.status);
      expectPaginationContract(onlineBoardMoByAssemblyTask.data);

      const planAssemblyDeficitDetalIds = await getRequiredPaginatedUniqueDetalIds(
        planAssemblyDeficit.data,
        'План ПЗ МО с фильтром "Дефицит по ПЗ Сборки"',
        (page) =>
          productionTasksAPI.getPlanForProductionTask(
            request,
            planDto({ page, workingType: 'metall', deficitFilteringType: 'assembleDeficit' }),
            accessToken,
          ),
      );
      const onlineBoardMoByAssemblyTaskDetalIds = await getRequiredPaginatedUniqueDetalIds(
        onlineBoardMoByAssemblyTask.data,
        'Онлайн табло МО по ПЗ сборки',
        (page) => productionTasksAPI.getDetalDeficit(request, onlineBoardMoByAssemblyTaskDto({ page }), accessToken),
      );

      const uniqueDetalIdsComparisonMessage =
        `План ПЗ МО "Дефицит по ПЗ Сборки": ${planAssemblyDeficitDetalIds.length} уникальных деталей (${planAssemblyDeficitDetalIds.join(', ')}); ` +
        `онлайн табло МО по ПЗ сборки: ${onlineBoardMoByAssemblyTaskDetalIds.length} уникальных деталей (${onlineBoardMoByAssemblyTaskDetalIds.join(', ')})`;

      expect(
        planAssemblyDeficitDetalIds,
        uniqueDetalIdsComparisonMessage,
      ).toEqual(onlineBoardMoByAssemblyTaskDetalIds);
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

      expect(firstEntity && firstOperationTypeId, 'Production entity and operation type id were not prepared in production task data.').toBeTruthy();

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
      expect(firstProductionEntity, 'Product/cbed/detal relation was not prepared in production task data.').toBeTruthy();

      const shipment = await productionTasksAPI.getShipmentByProductionTask(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(shipment);
      if (!clientErrorCodes.includes(shipment.status)) {
        expectNumericContract(shipment);
      }

      const percent = await productionTasksAPI.getPercentByProductionTask(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(percent);
      if (!clientErrorCodes.includes(percent.status)) {
        expectNumericContract(percent, 0, 100);
      }

      const tasksByEntity = await productionTasksAPI.getProductionTaskByEntity(
        request,
        {
          entityType: firstProductionEntity!.type,
          entityId: firstProductionEntity!.id,
        },
        accessToken,
      );
      expectNoServerError(tasksByEntity);
      if (!clientErrorCodes.includes(tasksByEntity.status)) {
        expect(successCodes, JSON.stringify(tasksByEntity.data)).toContain(tasksByEntity.status);
        expectArrayResponse(getRows(tasksByEntity.data).length ? getRows(tasksByEntity.data) : tasksByEntity.data);
      }

      const relativeDate = await productionTasksAPI.getRelativeDateForEntity(
        request,
        firstProductionEntity!.type,
        firstProductionEntity!.id,
        accessToken,
      );
      expectNoServerError(relativeDate);
      if (!clientErrorCodes.includes(relativeDate.status)) {
        expect(successCodes, JSON.stringify(relativeDate.data)).toContain(relativeDate.status);
        expectRelativeDateContract(relativeDate.data);
      }

      if (firstEntity) {
        const workload = await productionTasksAPI.getWorkloadByEntity(
          request,
          workloadDto({ entityType: firstEntity.type }),
          accessToken,
        );
        expectNoServerError(workload);
        if (!clientErrorCodes.includes(workload.status)) {
          expect(successCodes, JSON.stringify(workload.data)).toContain(workload.status);
          expectArrayResponse(workload.data);
        }
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
        if (!clientErrorCodes.includes(equipmentStartTime.status)) {
          expect(successCodes, JSON.stringify(equipmentStartTime.data)).toContain(equipmentStartTime.status);
          expectNullableObjectContract(equipmentStartTime.data);
        }
      }
    });

    test('проверяет расчёт дат операций ПЗ по всем оборудованиям', async ({ request }) => {
      test.setTimeout(180000);
      await waitForStaggeredProductionCalculation(15000);

      const allEquipment = await equipmentAPI.getAllEquipment(request, true, accessToken);
      expectNoServerError(allEquipment);
      expect(successCodes, JSON.stringify(allEquipment.data)).toContain(allEquipment.status);

      const equipmentRows = getEquipmentRows(allEquipment.data).filter((equipment) => Number.isFinite(Number(equipment.id)));
      expect(equipmentRows.length, 'No equipment is available for production task date validation.').toBeGreaterThan(0);

      const relativeDateCache = new Map<string, string | null>();
      const operationDetailsCache = new Map<string, ApiRow[]>();
      let checkedPositions = 0;

      const getLastOperationRequiredReadyDate = async (position: ApiRow): Promise<string | null> => {
        const entityType = position.entityType;
        const entityId = Number(position.mainEntity?.id || position.productionEntityId);
        if (!entityType || !Number.isFinite(entityId)) return null;

        const cacheKey = `${entityType}:${entityId}`;
        if (relativeDateCache.has(cacheKey)) return relativeDateCache.get(cacheKey) || null;

        const relativeDate = await productionTasksAPI.getRelativeDateForEntity(
          request,
          String(entityType),
          entityId,
          accessToken,
        );
        expectNoServerError(relativeDate);

        const value =
          !clientErrorCodes.includes(relativeDate.status) && relativeDate.data?.relativeDate
            ? String(relativeDate.data.relativeDate)
            : null;
        relativeDateCache.set(cacheKey, value);
        return value;
      };

      const getOperationDetailsRows = async (position: ApiRow, operation: ApiRow): Promise<ApiRow[]> => {
        const entityType = String(position.operationPosType || 'ass') as 'ass' | 'metall';
        const productionEntityId = Number(position.productionItemId || position.productionEntityId);
        const productionTaskId = Number(position.productionTaskId);
        const cacheKey = `${entityType}:${productionEntityId}:${productionTaskId}:${Number(operation.id)}`;

        if (!operationDetailsCache.has(cacheKey)) {
          const taskOperations = await waitForTaskOperations(
            request,
            taskOperationsDto(entityType, productionEntityId, Number(operation.id), { productionTaskId }),
            accessToken,
          );
          expectNoServerError(taskOperations);
          let details: ApiRow[] = [];
          if (!clientErrorCodes.includes(taskOperations.status)) {
            expect(successCodes, JSON.stringify(taskOperations.data)).toContain(taskOperations.status);
            details = Array.isArray(taskOperations.data?.allOperationPositions)
              ? (taskOperations.data.allOperationPositions as ApiRow[])
              : [];
          }
          operationDetailsCache.set(cacheKey, details);
        }

        return operationDetailsCache.get(cacheKey) || [];
      };

      for (const equipment of equipmentRows) {
        const equipmentId = Number(equipment.id);
        let page = 0;
        let count = 0;

        do {
          const tasksByEquipment = await productionTasksAPI.getTaskByEquipment(
            request,
            byEquipmentDto(equipmentId, { page }),
            accessToken,
          );
          expectNoServerError(tasksByEquipment);
          if (clientErrorCodes.includes(tasksByEquipment.status)) break;

          expect(successCodes, JSON.stringify(tasksByEquipment.data)).toContain(tasksByEquipment.status);
          const positions = Array.isArray(tasksByEquipment.data?.positions)
            ? (tasksByEquipment.data.positions as ApiRow[])
            : [];
          count = Number(tasksByEquipment.data?.count || positions.length);

          for (const position of positions) {
            const operation = position.mainOperation as ApiRow | undefined;
            if (!operation?.id) continue;

            const context = [
              `equipment=${equipmentId}`,
              `productionTask=${position.productionTaskId}`,
              `productionOperationPosition=${position.productionOperationPositionId}`,
              `operationPosition=${position.operationPostionsId}`,
              `operation=${operation.id}`,
              `idx=${operation.idx}`,
            ].join(', ');

            expectProductionQuantityFields(
              position,
              operation,
              position.orderedByCurrentTask,
              `страница оборудования: ${context}`,
            );

            const duration = getOperationDurationMinutes(operation);
            const expectedCalculatedCreateTime = position.startTime
              ? calculateEndDateLocal(position.startTime, duration)
              : null;
            expectSameDate(
              position.calculatedCreateTime,
              expectedCalculatedCreateTime,
              `Расчётная дата изготовления на операцию: ${context}`,
            );

            const expectedDeltaTime =
              expectedCalculatedCreateTime && position.planReadyTime
                ? calculateDeltaTimeLocal(expectedCalculatedCreateTime, position.planReadyTime)
                : 0;
            expect(
              Number(position.deltaTime),
              `Дельта операции: ${context}; actual=${position.deltaTime}; expected=${expectedDeltaTime}`,
            ).toBe(expectedDeltaTime);

            const prevOperation = position.prevOperation as ApiRow | null;
            const nextOperation = position.nextOperation as ApiRow | null;
            const operationDetailsRows = await getOperationDetailsRows(position, operation);
            const currentProductionOperationDetailsRows = operationDetailsRows
              .filter((item) => Number(item.productionOperationId) === Number(position.productionOperationPositionId))
              .sort(
                (left, right) =>
                  Number(left.idx ?? 0) - Number(right.idx ?? 0) ||
                  Number(left.operationPositionId ?? 0) - Number(right.operationPositionId ?? 0),
              );
            const currentOperationPositionId = Number(position.operationPostionsId || position.operationPositionId);
            const currentOperationDetailsIndex = currentProductionOperationDetailsRows.findIndex(
              (item) => Number(item.operationPositionId) === currentOperationPositionId,
            );
            const currentOperationDetails =
              currentOperationDetailsIndex >= 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex]
                : undefined;
            const prevOperationDetails =
              currentOperationDetailsIndex > 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex - 1]
                : undefined;
            const nextOperationDetails =
              currentOperationDetailsIndex >= 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex + 1]
                : undefined;
            expectOperationCellFields(
              prevOperation,
              prevOperation?.id ? Number(prevOperation.idx) : null,
              position.orderedByCurrentTask,
              position.remainingByProductionTask,
              `Предыдущая операция, страница оборудования: ${context}`,
            );
            expectOperationCellFields(
              operation,
              Number(operation.idx),
              position.orderedByCurrentTask,
              position.remainingByProductionTask,
              `Текущая операция, страница оборудования: ${context}`,
            );
            expectOperationCellFields(
              nextOperation,
              nextOperation?.id ? Number(nextOperation.idx) : null,
              position.orderedByCurrentTask,
              position.remainingByProductionTask,
              `Следующая операция, страница оборудования: ${context}`,
            );
            const workStartCalcType = getWorkStartCalcType(position, operation);

            if (workStartCalcType === 'prevOperationReadinessDate') {
              if (prevOperationDetails?.calculateNeedsTime) {
                expectSameDate(
                  position.startTime,
                  prevOperationDetails.calculateNeedsTime,
                  `Начало работ равно расчётной дате готовности предыдущей операции техпроцесса: ${context}`,
                );
              }
            }

            if (workStartCalcType === 'nextOperationWorkStart') {
              const expectedStartTime = nextOperationDetails?.startTime
                ? calculateStartDateLocal(nextOperationDetails.startTime, duration)
                : null;
              if (position.startTime && expectedStartTime) {
                expectSameDate(
                  position.startTime,
                  expectedStartTime,
                  `Начало работ по началу следующей операции: ${context}`,
                );
              }
            }

            const nextOperationWorkStartCalcType = nextOperationDetails
              ? getWorkStartCalcType(position, nextOperationDetails)
              : null;
            const nextOperationRequiredReadyTime =
              nextOperationWorkStartCalcType === 'prevOperationReadinessDate'
                ? nextOperationDetails?.calculateStartTime ?? nextOperationDetails?.startTime
                : nextOperationDetails?.startTime;
            const expectedPlanReadyTime =
              currentOperationDetails?.planReadyTime ??
              nextOperationRequiredReadyTime;
            if (position.planReadyTime && expectedPlanReadyTime) {
              expectSameDate(
                position.planReadyTime,
                expectedPlanReadyTime,
                `Дата требуемой готовности на операцию: ${context}`,
              );
            }

            checkedPositions += 1;
          }

          page += 1;
        } while (page * 50 < count);
      }

      expect(checkedPositions, 'No equipment production task operation positions were checked.').toBeGreaterThan(0);
    });

    test('проверяет расчёт дат операций ПЗ по всем сотрудникам', async ({ request }) => {
      test.setTimeout(180000);
      await waitForStaggeredProductionCalculation(45000);

      const allUsers = await usersAPI.getAllUsers(request, true, false, accessToken);
      expectNoServerError(allUsers);
      expect(successCodes, JSON.stringify(allUsers.data)).toContain(allUsers.status);

      const userRows = getRows<ApiRow>(allUsers.data).filter((user) => Number.isFinite(Number(user.id)));
      expect(userRows.length, 'No users are available for production task date validation.').toBeGreaterThan(0);

      const relativeDateCache = new Map<string, string | null>();
      const operationDetailsCache = new Map<string, ApiRow[]>();
      let checkedPositions = 0;

      const getLastOperationRequiredReadyDate = async (position: ApiRow): Promise<string | null> => {
        const entityType = position.entityType;
        const entityId = Number(
          position.entity?.id || position.mainEntity?.id || position.productionEntityId || position.productionItemId,
        );
        if (!entityType || !Number.isFinite(entityId)) return null;

        const cacheKey = `${entityType}:${entityId}`;
        if (relativeDateCache.has(cacheKey)) return relativeDateCache.get(cacheKey) || null;

        const relativeDate = await productionTasksAPI.getRelativeDateForEntity(
          request,
          String(entityType),
          entityId,
          accessToken,
        );
        expectNoServerError(relativeDate);

        const value =
          !clientErrorCodes.includes(relativeDate.status) && relativeDate.data?.relativeDate
            ? String(relativeDate.data.relativeDate)
            : null;
        relativeDateCache.set(cacheKey, value);
        return value;
      };

      const getOperationDetailsRows = async (position: ApiRow, operation: ApiRow): Promise<ApiRow[]> => {
        const entityType = String(position.operationPosType || 'ass') as 'ass' | 'metall';
        const productionEntityId = Number(position.productionItemId || position.productionEntityId);
        const productionTaskId = Number(position.productionTaskId);
        const cacheKey = `${entityType}:${productionEntityId}:${productionTaskId}:${Number(operation.id)}`;

        if (!operationDetailsCache.has(cacheKey)) {
          const taskOperations = await waitForTaskOperations(
            request,
            taskOperationsDto(entityType, productionEntityId, Number(operation.id), { productionTaskId }),
            accessToken,
          );
          expectNoServerError(taskOperations);
          let details: ApiRow[] = [];
          if (!clientErrorCodes.includes(taskOperations.status)) {
            expect(successCodes, JSON.stringify(taskOperations.data)).toContain(taskOperations.status);
            details = Array.isArray(taskOperations.data?.allOperationPositions)
              ? (taskOperations.data.allOperationPositions as ApiRow[])
              : [];
          }
          operationDetailsCache.set(cacheKey, details);
        }

        return operationDetailsCache.get(cacheKey) || [];
      };

      for (const user of userRows) {
        const userId = Number(user.id);
        let page = 0;
        let count = 0;

        do {
          const tasksByUser = await productionTasksAPI.getProductionTaskByUser(
            request,
            byUserDto(userId, { page }),
            accessToken,
          );
          expectNoServerError(tasksByUser);
          if (clientErrorCodes.includes(tasksByUser.status)) break;

          expect(successCodes, JSON.stringify(tasksByUser.data)).toContain(tasksByUser.status);
          const positions = Array.isArray(tasksByUser.data?.positions)
            ? (tasksByUser.data.positions as ApiRow[])
            : [];
          count = Number(tasksByUser.data?.count || positions.length);

          for (const position of positions) {
            const operation = position.mainOperation as ApiRow | undefined;
            if (!operation?.id) continue;

            const context = [
              `user=${userId}`,
              `productionTask=${position.productionTaskId}`,
              `productionOperationPosition=${position.productionOperationPositionId}`,
              `operationPosition=${position.operationPositionId}`,
              `operation=${operation.id}`,
              `idx=${operation.idx}`,
            ].join(', ');

            expectProductionQuantityFields(
              position,
              operation,
              position.myQuantity,
              `страница сотрудников: ${context}`,
            );

            const operationDetailsRows = await getOperationDetailsRows(position, operation);
            const currentProductionOperationDetailsRows = operationDetailsRows
              .filter((item) => Number(item.productionOperationId) === Number(position.productionOperationPositionId))
              .sort(
                (left, right) =>
                  Number(left.idx ?? 0) - Number(right.idx ?? 0) ||
                  Number(left.operationPositionId ?? 0) - Number(right.operationPositionId ?? 0),
              );
            const currentOperationDetailsIndex = currentProductionOperationDetailsRows.findIndex(
              (item) => Number(item.operationPositionId) === Number(position.operationPositionId),
            );
            const operationDetails =
              currentOperationDetailsIndex >= 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex]
                : undefined;
            const prevOperationDetails =
              currentOperationDetailsIndex > 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex - 1]
                : undefined;
            const nextOperationDetails =
              currentOperationDetailsIndex >= 0
                ? currentProductionOperationDetailsRows[currentOperationDetailsIndex + 1]
                : undefined;
            const employeeStartTime = operationDetails?.calculateStartTime || null;
            const duration = getOperationDurationMinutes(operationDetails || operation);
            const expectedCalculatedCreateTime = position.startTime
              ? calculateEndDateLocal(position.startTime, duration)
              : null;
            expectSameDate(
              position.calculatedCreateTime,
              expectedCalculatedCreateTime,
              `Расчётная дата изготовления на операцию: ${context}`,
            );

            const expectedDeltaTime =
              expectedCalculatedCreateTime && position.planReadyTime
                ? calculateDeltaTimeLocal(expectedCalculatedCreateTime, position.planReadyTime)
                : 0;
            expect(
              Number(position.deltaTime),
              `Дельта операции: ${context}; actual=${position.deltaTime}; expected=${expectedDeltaTime}`,
            ).toBe(expectedDeltaTime);

            const workStartCalcType = getWorkStartCalcType(position, operation);
            const prevOperation = position.prevOperation as ApiRow | null;
            const nextOperation = position.nextOperation as ApiRow | null;
            expectOperationCellFields(
              prevOperation,
              prevOperation?.id ? Number(prevOperation.idx) : null,
              position.myQuantity,
              position.myQuantity,
              `Предыдущая операция, страница сотрудников: ${context}`,
            );
            expectOperationCellFields(
              operation,
              Number(operation.idx),
              position.myQuantity,
              position.myQuantity,
              `Текущая операция, страница сотрудников: ${context}`,
            );
            expectOperationCellFields(
              nextOperation,
              nextOperation?.id ? Number(nextOperation.idx) : null,
              position.myQuantity,
              position.myQuantity,
              `Следующая операция, страница сотрудников: ${context}`,
            );

            if (workStartCalcType === 'prevOperationReadinessDate' && prevOperationDetails?.planReadyTime) {
              expectSameDate(
                employeeStartTime,
                prevOperationDetails.planReadyTime,
                `Начало работ равно расчётной дате готовности предыдущей операции техпроцесса: ${context}`,
              );
            }

            if (workStartCalcType === 'nextOperationWorkStart') {
              const nextStartTime = nextOperationDetails?.calculateStartTime;
              const employeeDuration =
                getCalculatedOperationDurationMinutes(operationDetails) ??
                getOperationDurationMinutes(operationDetails || operation);
              const expectedStartTime = nextStartTime
                ? calculateStartDateLocal(nextStartTime, employeeDuration)
                : null;
              if (employeeStartTime && expectedStartTime) {
                expectSameDate(
                  employeeStartTime,
                  expectedStartTime,
                  `Начало работ по началу следующей операции: ${context}`,
                  DATE_MINUTE_TOLERANCE_MS,
                );
              }
            }

            const nextStartTime = nextOperationDetails?.calculateStartTime;
            const expectedPlanReadyTime = nextStartTime;
            const actualPlanReadyTime = operationDetails?.planReadyTime || position.planReadyTime;
            if (actualPlanReadyTime && expectedPlanReadyTime) {
              expectSameDate(
                actualPlanReadyTime,
                expectedPlanReadyTime,
                `Дата требуемой готовности на операцию: ${context}`,
              );
            }

            checkedPositions += 1;
          }

          page += 1;
        } while (page * 40 < count);
      }

      expect(checkedPositions, 'No user production task operation positions were checked.').toBeGreaterThan(0);
    });

    test('обновляет start time пользователя и возвращает исходное значение', async ({ request }) => {
      const originalUserStartTime = await productionTasksAPI.getStartTimeByUser(request, firstUserId as number, accessToken);
      expectNoServerError(originalUserStartTime);
      let originalTime = extractDateValue(originalUserStartTime.data);

      if (!originalTime) {
        originalTime = new Date().toISOString();
        const seedUserStartTime = await productionTasksAPI.setStartTimeByUser(
          request,
          { userId: firstUserId as number, time: originalTime },
          accessToken,
        );
        expectNoServerError(seedUserStartTime);
        expect(successCodes, JSON.stringify(seedUserStartTime.data)).toContain(seedUserStartTime.status);
      }

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
        expect(new Date(updatedTime!).getTime(), JSON.stringify(updatedUserStartTime.data)).toBeGreaterThanOrEqual(
          new Date(newTime).getTime(),
        );
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
      expect(firstOperationPosId, 'Production operation position id was not prepared in production task data.').toBeTruthy();

      const setMissingResponsible = await productionTasksAPI.setResponsibleUser(
        request,
        firstOperationPosId as number,
        999999999,
        accessToken,
      );
      expectClientError(setMissingResponsible, [409]);

      const setMissingEquipment = await productionTasksAPI.setEquipment(
        request,
        firstOperationPosId as number,
        999999999,
        accessToken,
      );
      expectClientError(setMissingEquipment);
      expectErrorResponseContract(setMissingEquipment);
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
      expectClientError(byId, [404]);

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
      expectNoServerError(invalidSubdivision);

      const invalidRelativeDate = await productionTasksAPI.getRelativeDateForEntity(
        request,
        'invalid-type',
        999999999,
        accessToken,
      );
      expectClientError(invalidRelativeDate);

      const invalidTOperations = await productionTasksAPI.getTOperationList(
        request,
        { productionOperationType: 'invalid-type' },
        accessToken,
      );
      expectClientError(invalidTOperations);

      const updateAllTaskRelative = await captureApiResult(() => productionTasksAPI.updateAllTaskRelative(request, accessToken));
      expectEndpointReached(updateAllTaskRelative);
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
      expectClientError(invalidCreate);

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
      expectClientError(invalidUpdate);

      const invalidCreateOperationPos = await productionTasksAPI.createProductionOperationPos(
        request,
        invalidOperationPosDto(),
        accessToken,
      );
      expectClientError(invalidCreateOperationPos);

      const invalidUpdateOperationPos = await productionTasksAPI.updateProductionOperationPos(
        request,
        invalidOperationPosDto({ id: 999999999 }),
        accessToken,
      );
      expectClientError(invalidUpdateOperationPos);

      const invalidStartTimeUser = await productionTasksAPI.setStartTimeByUser(
        request,
        { userId: 'invalid-user-id', time: 12345 },
        accessToken,
      );
      expectClientError(invalidStartTimeUser, [400]);

      const invalidStartTimeEquipment = await productionTasksAPI.setStartTimeByEquipment(
        request,
        { equipmentId: 999999999, time: new Date().toISOString() },
        accessToken,
      );
      expectClientError(invalidStartTimeEquipment);

      const invalidBanOperationPos = await productionTasksAPI.banProductionOperationPos(
        request,
        999999999,
        accessToken,
      );
      expectClientError(invalidBanOperationPos);

      const invalidBanTask = await productionTasksAPI.banProductionTask(
        request,
        999999999,
        accessToken,
      );
      expectClientError(invalidBanTask);
    });

    test('мутации без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await productionTasksAPI.createProductionTask(request, {
        number_order: '',
        description: '',
        type: 'ass',
        date_order: null,
      });
      expectClientError(createResponse);

      const dueDateResponse = await productionTasksAPI.updateStatusProductionTask(request, {
        productionTaskId: 999999999,
        date: new Date().toISOString(),
      });
      expectClientError(dueDateResponse);

      const operationPosResponse = await productionTasksAPI.createProductionOperationPos(
        request,
        invalidOperationPosDto(),
      );
      expectClientError(operationPosResponse);

      const setResponsibleResponse = await productionTasksAPI.setResponsibleUser(
        request,
        999999999,
        999999999,
      );
      expectClientError(setResponsibleResponse);
    });
  });
};
