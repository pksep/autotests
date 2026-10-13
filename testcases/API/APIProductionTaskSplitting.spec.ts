import { test, expect, APIRequestContext } from '@playwright/test';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { CBEDAPI } from '../../pages/API/APICBED';
import { TechProcessAPI } from '../../pages/API/APITechProcess';
import { OperationAPI } from '../../pages/API/APIOperation';
import { StockOrderAPI } from '../../pages/API/APIStockOrder';
import { UsersAPI } from '../../pages/API/APIUsers';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { MarksAPI } from '../../pages/API/APIMarks';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { expectErrorResponseContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type Row = Record<string, any>;
type Result = { status: number; data: any };
type WorkType = 'ass' | 'metall';
const tasks = new ProductionTasksAPI(null);
const details = new DetailsAPI(null);
const cbeds = new CBEDAPI(null);
const tech = new TechProcessAPI(null);
const operations = new OperationAPI(null);
const orders = new StockOrderAPI(null);
const users = new UsersAPI(null as any);
const equipment = new EquipmentAPI(null);
const marks = new MarksAPI(null);
const missingId = 999999999;
const unwrap = (data: any): Row => data?.data && typeof data.data === 'object' ? data.data : data;
const ok = (result: Result) => {
  expect(successCodes, JSON.stringify(result.data)).toContain(result.status);
  return unwrap(result.data);
};
const rejected = (result: Result, status: number) => {
  expect(result.status, JSON.stringify(result.data)).toBe(status);
  expectErrorResponseContract(result);
  expect(result.data.statusCode).toBe(status);
  expect(typeof result.data.message).toBe('string');
  expect(result.data.message.length).toBeGreaterThan(0);
  // Authentication failures can be returned by the gateway before Nest assigns reqId.
  if (status !== 401) {
    expect(typeof result.data.reqId).toBe('string');
    expect(result.data.reqId.length).toBeGreaterThan(0);
  }
};
const position = (task: Row): Row => {
  expect(task.production_operation_pos, JSON.stringify(task)).toHaveLength(1);
  return task.production_operation_pos[0];
};
const operation = (task: Row): Row => {
  const result = position(task).operation_positions;
  expect(result, JSON.stringify(task)).toHaveLength(1);
  return result[0];
};
const activeAssignments = (task: Row): Row[] => {
  const rows = operation(task).assignments;
  expect(Array.isArray(rows), 'GET ПЗ должен возвращать сохранённые назначения').toBe(true);
  return [...rows].sort((a, b) => a.priority - b.priority);
};

// Compare business state rather than recalculated queue dates or audit timestamps.
const snapshot = (task: Row): unknown => ({
  id: task.id,
  parent: task.parent_production_task_id,
  children: (task.children ?? []).map((child: Row) => snapshot(child)),
  positions: (task.production_operation_pos ?? []).map((pos: Row) => ({
    id: pos.id, quantity: pos.quantity, quantity_max: pos.quantity_max,
    operations: pos.operation_positions.map((op: Row) => ({
      id: op.id, operation_id: op.operation_id, user_id: op.user_id, equipment_id: op.equipment_id,
      count_created: op.count_created,
      assignments: (op.assignments ?? []).map((a: Row) => ({
        id: a.id, priority: a.priority, quantity: a.quantity, count_created: a.count_created,
        user_id: a.user_id, equipment_id: a.equipment_id,
      })).sort((a: Row, b: Row) => a.priority - b.priority),
    })),
  })),
});

export const runProductionTaskSplittingAPI = () => {
  for (const typeWork of ['ass', 'metall'] as const) {
    test.describe(`Production Tasks API: разделение ${typeWork}`, () => {
      test.describe.configure({ timeout: 120000 });
      let token: string;
      let entityId: number;
      let typeOperationId: number;
      let operationId: number;
      let planId: number;
      let orderId: number;
      let userIds: number[];
      let equipmentIds: number[];
      let currentTask: Row;
      let currentTaskId: number;
      const createdTaskIds = new Set<number>();
      const createdMarkIds = new Set<number>();
      const suffix = uniqueApiSuffix(`split-${typeWork}`);
      const name = `API Split ${typeWork} ${suffix}`;
      const entityType = typeWork === 'metall' ? 'detal' : 'cbed';
      const resource = (index: number, quantity: number, extra: Row = {}) => ({
        userId: userIds[index], equipmentId: typeWork === 'metall' ? equipmentIds[index] : null,
        quantity, ...extra,
      });
      const splitTaskDto = (task: Row, quantity: number, operationAssignments?: Row[]) => ({
        positions: [{ productionOperationPosId: position(task).id, quantity,
          ...(operationAssignments === undefined ? {} : { operationAssignments }) }],
      });
      const read = async (request: APIRequestContext, id = currentTaskId) =>
        ok(await tasks.getProductionTaskById(request, id, token));
      const assertShares = (task: Row, expected: { index: number; quantity: number }[]) => {
        expect(Number(position(task).quantity)).toBe(10);
        const shares = activeAssignments(task);
        expect(shares).toHaveLength(expected.length);
        expect(new Set(shares.map(a => a.id)).size).toBe(shares.length);
        expect(new Set(shares.map(a => a.priority)).size).toBe(shares.length);
        expect(shares.reduce((sum, a) => sum + Number(a.quantity), 0)).toBe(10);
        for (const { index, quantity } of expected) {
          const share = shares.find(a => a.user_id === userIds[index]);
          expect(share, JSON.stringify(shares)).toBeTruthy();
          expect(Number(share!.quantity)).toBe(quantity);
          expect(Number(share!.count_created)).toBe(0);
          expect(share!.equipment_id).toBe(typeWork === 'metall' ? equipmentIds[index] : null);
        }
      };
      const splitOperation = async (request: APIRequestContext, dto: unknown, id = operation(currentTask).id) => {
        const result = await tasks.splitOperationPosition(request, id, dto, token);
        const response = ok(result);
        expect(Number(response.id)).toBe(id);
        return read(request);
      };
      const splitTask = async (request: APIRequestContext, source: Row, dto: unknown) => {
        const result = await tasks.splitProductionTask(request, source.id, dto, token);
        // Register even a malformed success for cleanup before checking its contract.
        const id = Number(unwrap(result.data)?.id);
        if (id > 0) createdTaskIds.add(id);
        ok(result);
        expect(id).toBeGreaterThan(0);
        return read(request, id);
      };

      test.beforeAll(async ({ request }) => {
        test.setTimeout(120000);
        token = await getAuthToken(request);
        const allUsers = ok(await users.getAllUsers(request, true, false, token));
        userIds = getRows<Row>(allUsers).filter(row => row.id && row.ban !== true)
          .map(row => Number(row.id)).slice(0, 5);
        expect(userIds.length, 'Нужны 4 квалифицированных сотрудника и 1 без квалификации').toBe(5);
        equipmentIds = [];
        if (typeWork === 'metall') {
          const allEquipment = ok(await equipment.getAllEquipment(request, true, token));
          equipmentIds = getRows<Row>(allEquipment).filter(row => row.id && row.ban !== true)
            .map(row => Number(row.id)).slice(0, 5);
          expect(equipmentIds.length, 'Нужны 4 станка и 1 станок вне типа операции').toBe(5);
        }

        const common = {
          name, designation: name, description: name, techProcessID: null, responsible: '0',
          characteristic: [{ name: 'Масса', ez: 'кг', znach: 0 }],
          materialList: [], fileBase: [], attention: false, discontinued: false,
        };
        const entity = typeWork === 'metall'
          ? await details.createDetail(request, {
            ...common, parametrs: { preTime: { ez: 'ч', znach: 0 }, helperTime: { ez: 'ч', znach: 0 }, mainTime: { ez: 'ч', znach: 0 } },
            workpiece_characterization: { mass: 0, trash: 0 }, mat_zag: null, mat_zag_zam: null,
          }, API_CONST.API_TEST_TABEL, token)
          : await cbeds.createCBED(request, {
            ...common, techProcessID: 'null', parametrs: [{ name: 'Норма времени на сборку', ez: 'ч', znach: 0 }],
            listDetal: [], listCbed: [], listPokDet: [], fileBase: '[]', attention: 'false', discontinued: 'false',
          }, API_CONST.API_TEST_TABEL, token);
        entityId = Number(ok(entity).id);
        expect(entityId).toBeGreaterThan(0);
        const techProcessId = Number(ok(await tech.createOrUpdateTechProcess(request, {
          id: '', izd_type: entityType, izd_id: entityId, description: name, operationList: '[]', docs: null,
        }, token)).id);
        expect(techProcessId).toBeGreaterThan(0);
        typeOperationId = Number(ok(await operations.createTypeOperation(request, {
          name, preTime: true, helperTime: true, mainTime: true, cpu: false, square: false, list: false,
          users: userIds.slice(0, 4), equipmentIds: equipmentIds.slice(0, 4),
          metaloworking: typeWork === 'metall', assembly: typeWork === 'ass', sclad: false,
          preTimeMinute: 0, helperTimeMinute: 0, workStartCalcType: 'automatic',
        }, token)).id);
        expect(typeOperationId).toBeGreaterThan(0);
        operationId = Number(ok(await operations.createOperation(request, {
          name: String(typeOperationId), techProcessId: String(techProcessId), preTime: '0', helperTime: '0',
          mainTime: '1', generalCountTime: '1', description: name, docs: '[]',
          instrumentList: '[]', instrumentMerList: '[]', instrumentOsnList: '[]', eqList: '[]',
        }, token)).id);
        expect(operationId).toBeGreaterThan(0);
        // Assembly entities receive default operations. Keep this isolated fixture
        // to one qualified operation so both split APIs exercise the same scope.
        const createdTech = ok(await tech.getTechProcessById(request, String(techProcessId), token));
        for (const op of getRows<Row>(createdTech.operations)) {
          if (Number(op.id) !== operationId) ok(await operations.banOperation(request, Number(op.id), token));
        }
        ok(await tech.createOrUpdateTechProcess(request, {
          id: techProcessId, izd_type: entityType, izd_id: entityId, description: name,
          operationList: JSON.stringify([{ id: operationId }]), docs: null,
        }, token));
        const verifiedTech = ok(await tech.getTechProcessById(request, String(techProcessId), token));
        expect(getRows<Row>(verifiedTech.operations).map(op => Number(op.id)), JSON.stringify(verifiedTech)).toEqual([operationId]);
        expect(Number(verifiedTech.operations[0].idx)).toBe(1);
        orderId = Number(ok(await orders.create(request, {
          workersData: { date_order: new Date().toISOString(), number_order: suffix, description: name, type: entityType },
          workersComplect: [{ my_kolvo: 120, shipments_kolvo: 0, object_id: entityId }],
        }, token)).id);
        expect(orderId).toBeGreaterThan(0);
        let lastPlan: Result | undefined;
        const matchesEntity = (row: Row) => row.name === name || Number(
          typeWork === 'metall' ? row.detal_id ?? row.detalId : row.cbed_id ?? row.cbedId,
        ) === entityId;
        const plan = await eventually(async () => {
          lastPlan = await tasks.getPlanForProductionTask(request, {
          workingType: typeWork, page: 0, pageSize: 50, onlyDeficit: false, searchStr: name,
          byParents: { productIds: [], cbedIds: [], detalIds: [] }, byOrder: { customer: 'buyer', orderId: [] },
          childrenByProductionTaskIds: [], range: { start: null, end: null }, sortReadiness: 'any',
          typeOperationIds: [], assembleIds: [], excludeIds: [],
          }, token);
          return lastPlan;
        }, result => successCodes.includes(result.status) && getRows<Row>(result.data)
          .some(row => matchesEntity(row) && Number(row.maxAvailable ?? row.myQuantity) >= 10),
        { attempts: 30, intervalMs: 1000 });
        expect(plan, `Созданная тестовая сущность должна появиться в плане: ${JSON.stringify(lastPlan)}`).toBeTruthy();
        planId = Number(getRows<Row>(plan!.data).find(matchesEntity)!.id);
        expect(planId).toBeGreaterThan(0);
      });

      test.beforeEach(async ({ request }) => {
        currentTaskId = Number(ok(await tasks.createProductionTask(request, {
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), typeWork, details_filters: {}, description: name,
          productionOperationPos: [{ id: planId, idx: 0, quantity: 10,
            operationPositions: [{ operationId, employeeId: userIds[0], equipmentId: typeWork === 'metall' ? equipmentIds[0] : null }] }],
        }, token)).id);
        createdTaskIds.add(currentTaskId);
        expect(currentTaskId).toBeGreaterThan(0);
        const ready = await eventually(async () => tasks.getProductionTaskById(request, currentTaskId, token),
          result => result.status === 200 && result.data?.production_operation_pos?.length === 1 &&
            result.data.production_operation_pos[0].operation_positions?.length === 1,
          { attempts: 30, intervalMs: 1000 });
        expect(ready, 'Очередь должна создать единственную операцию тестового ПЗ').toBeTruthy();
        currentTask = ready!.data;
        expect(Number(position(currentTask).quantity)).toBe(10);
        expect(operation(currentTask).operation_id).toBe(operationId);
      });

      const cleanupTasks = async (request: APIRequestContext) => {
        for (const id of [...createdTaskIds].reverse()) {
          ok(await tasks.banProductionTask(request, id, token));
          createdTaskIds.delete(id);
        }
      };
      const cleanupMarks = async (request: APIRequestContext) => {
        for (const id of createdMarkIds) {
          ok(await marks.deleteMark(request, id, token));
          createdMarkIds.delete(id);
        }
      };
      test.afterEach(async ({ request }) => {
        try { await cleanupMarks(request); } finally { await cleanupTasks(request); }
      });
      test.afterAll(async ({ request }) => {
        const errors: string[] = [];
        const clean = async (label: string, action: () => Promise<unknown>) => {
          try { await action(); } catch (error) { errors.push(`${label}: ${String(error)}`); }
        };
        await clean('Отметки', () => cleanupMarks(request));
        await clean('ПЗ', () => cleanupTasks(request));
        if (orderId) await clean('Заказ склада', async () => { ok(await orders.ban(request, orderId, token)); });
        if (operationId) await clean('Операция', async () => { ok(await operations.banOperation(request, operationId, token)); });
        if (typeOperationId) await clean('Тип операции', async () => { ok(await operations.banTypeOperation(request, typeOperationId, token)); });
        if (entityId) await clean('Сущность', async () => {
          ok(typeWork === 'metall'
            ? await details.deleteDetail(request, String(entityId), API_CONST.API_TEST_TABEL, token)
            : await cbeds.banCBED(request, entityId, API_CONST.API_TEST_TABEL, token));
        });
        expect(errors, 'Все временные сущности должны быть архивированы').toEqual([]);
      });

      test('разделяет ПЗ, наследует операции и создаёт дочернее ПЗ от дочернего с общим корнем', async ({ request }) => {
        const child = await splitTask(request, currentTask, splitTaskDto(currentTask, 4));
        expect(child.parent_production_task_id).toBe(currentTaskId);
        expect(child.subtask_number).toBe(1);
        expect(child.description).toBe(currentTask.description);
        expect(child.due_data).toBe(currentTask.due_data);
        expect(child.working_type).toBe(typeWork);
        expect(Number(position(child).quantity)).toBe(4);
        expect(position(child)[typeWork === 'metall' ? 'metall_id' : 'ass_id']).toBe(planId);
        expect(operation(child).id).not.toBe(operation(currentTask).id);
        expect(operation(child).operation_id).toBe(operationId);
        expect(operation(child).user_id).toBe(userIds[0]);
        expect(operation(child).equipment_id).toBe(typeWork === 'metall' ? equipmentIds[0] : null);

        const grandchild = await splitTask(request, child, splitTaskDto(child, 2, [{
          operationPositionId: operation(child).id, userId: userIds[1],
          equipmentId: typeWork === 'metall' ? equipmentIds[1] : null,
        }]));
        expect(grandchild.parent_production_task_id).toBe(currentTaskId);
        expect(grandchild.subtask_number).toBe(2);
        expect(operation(grandchild).user_id).toBe(userIds[1]);
        expect(operation(grandchild).equipment_id).toBe(typeWork === 'metall' ? equipmentIds[1] : null);
        const root = await read(request);
        expect(root.children.map((row: Row) => row.id).sort()).toEqual([child.id, grandchild.id].sort());
        expect(Number(position(root).quantity)).toBe(6);
        expect(Number(position(await read(request, child.id)).quantity)).toBe(2);
        expect(Number(position(grandchild).quantity)).toBe(2);
        expect([root, ...root.children].reduce((sum, row) => sum + Number(position(row).quantity), 0)).toBe(10);
        for (const row of [root, ...root.children]) {
          expect(Number(position(row).quantity_max)).toBe(Number(position(row).quantity));
        }
      });

      test('отклоняет неверное разделение ПЗ без изменения исходной позиции и создания детей', async ({ request }) => {
        const before = snapshot(await read(request));
        const posId = position(currentTask).id;
        const opId = operation(currentTask).id;
        const invalid: { label: string; dto: unknown; status: number }[] = [
          { label: 'Пустые позиции', dto: { positions: [] }, status: 400 },
          { label: 'Несколько позиций', dto: { positions: [{ productionOperationPosId: posId, quantity: 1 }, { productionOperationPosId: posId, quantity: 1 }] }, status: 400 },
          { label: 'Нулевое количество', dto: splitTaskDto(currentTask, 0), status: 400 },
          { label: 'Отрицательное количество', dto: splitTaskDto(currentTask, -1), status: 400 },
          { label: 'Дробное количество', dto: splitTaskDto(currentTask, 1.5), status: 400 },
          { label: 'Всё количество', dto: splitTaskDto(currentTask, 10), status: 409 },
          { label: 'Больше доступного', dto: splitTaskDto(currentTask, 11), status: 409 },
          { label: 'Чужая позиция', dto: { positions: [{ productionOperationPosId: missingId, quantity: 1 }] }, status: 409 },
          { label: 'Чужая операция', dto: splitTaskDto(currentTask, 1, [{ operationPositionId: missingId, userId: userIds[1] }]), status: 409 },
          { label: 'Нет квалификации', dto: splitTaskDto(currentTask, 1, [{ operationPositionId: opId, userId: userIds[4] }]), status: 409 },
          { label: 'Дублирующие назначения', dto: splitTaskDto(currentTask, 1, [{ operationPositionId: opId, userId: userIds[1] }, { operationPositionId: opId, userId: userIds[2] }]), status: 400 },
        ];
        for (const entry of invalid) await test.step(entry.label, async () => {
          rejected(await tasks.splitProductionTask(request, currentTaskId, entry.dto, token), entry.status);
          expect(snapshot(await read(request))).toEqual(before);
        });
        rejected(await tasks.splitProductionTask(request, missingId, splitTaskDto(currentTask, 1), token), 404);
      });

      test('разрешает перенос до остатка 1 шт. в ПЗ и в исходном назначении', async ({ request }) => {
        const child = await splitTask(request, currentTask, { positions: [{
          productionOperationPosId: String(position(currentTask).id), quantity: '9',
        }] });
        const root = await read(request);
        expect(Number(position(root).quantity)).toBe(1);
        expect(Number(position(child).quantity)).toBe(9);
        rejected(await tasks.splitProductionTask(request, currentTaskId, splitTaskDto(root, 1), token), 409);
        ok(await tasks.splitOperationPosition(request, operation(child).id, resource(1, 8), token));
        const saved = await read(request, child.id);
        expect(activeAssignments(saved).map(a => Number(a.quantity))).toEqual([1, 8]);
        expect(activeAssignments(saved).map(a => a.user_id)).toEqual([userIds[0], userIds[1]]);
        const before = snapshot(saved);
        rejected(await tasks.splitOperationPosition(request, operation(child).id, resource(2, 1), token), 409);
        expect(snapshot(await read(request, child.id))).toEqual(before);
      });

      test('не принимает реальные позиции, операции и назначения другого ПЗ', async ({ request }) => {
        const child = await splitTask(request, currentTask, splitTaskDto(currentTask, 3));
        ok(await tasks.splitOperationPosition(request, operation(child).id, resource(1, 1), token));
        const childSaved = await read(request, child.id);
        const rootBefore = snapshot(await read(request));
        for (const dto of [
          splitTaskDto(child, 1),
          splitTaskDto(currentTask, 1, [{ operationPositionId: operation(child).id, userId: userIds[1] }]),
        ]) {
          rejected(await tasks.splitProductionTask(request, currentTaskId, dto, token), 409);
          expect(snapshot(await read(request))).toEqual(rootBefore);
        }
        await splitOperation(request, resource(1, 1));
        const before = snapshot(await read(request));
        const foreignId = activeAssignments(childSaved)[1].id;
        for (const dto of [resource(2, 1, { sourceAssignmentId: foreignId }), { removeAssignmentIds: [foreignId] }]) {
          rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, dto, token), 409);
          expect(snapshot(await read(request))).toEqual(before);
          expect(snapshot(await read(request, child.id))).toEqual(snapshot(childSaved));
        }
      });

      test('разделяет назначение из вторичной доли, возвращает количество при удалении и допускает повторное назначение', async ({ request }) => {
        let saved = await splitOperation(request, resource(1, 3));
        assertShares(saved, [{ index: 0, quantity: 7 }, { index: 1, quantity: 3 }]);
        const secondary = activeAssignments(saved)[1];
        saved = await splitOperation(request, resource(2, 1, { sourceAssignmentId: secondary.id }));
        assertShares(saved, [{ index: 0, quantity: 7 }, { index: 1, quantity: 2 }, { index: 2, quantity: 1 }]);
        const third = activeAssignments(saved)[2];
        saved = await splitOperation(request, { removeAssignmentIds: [third.id] });
        assertShares(saved, [{ index: 0, quantity: 8 }, { index: 1, quantity: 2 }]);
        const before = snapshot(saved);
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, { removeAssignmentIds: [third.id] }, token), 409);
        expect(snapshot(await read(request))).toEqual(before);
        saved = await splitOperation(request, { removeAssignmentIds: [secondary.id] });
        assertShares(saved, [{ index: 0, quantity: 10 }]);
        saved = await splitOperation(request, resource(1, 3));
        assertShares(saved, [{ index: 0, quantity: 7 }, { index: 1, quantity: 3 }]);
        expect(activeAssignments(saved)[1].id).not.toBe(secondary.id);
        expect(activeAssignments(saved)[1].priority).toBeGreaterThan(third.priority);
      });

      for (const format of ['assignments', 'additionalAssignments'] as const) {
        test(`атомарно сохраняет несколько долей: ${format}`, async ({ request }) => {
          const dto = format === 'assignments'
            ? { assignments: [resource(1, 2), resource(2, 3)] }
            : { ...resource(1, 2), additionalAssignments: [resource(2, 3)] };
          const saved = await splitOperation(request, dto);
          assertShares(saved, [{ index: 0, quantity: 5 }, { index: 1, quantity: 2 }, { index: 2, quantity: 3 }]);
        });
      }

      test('использует сотрудника как ресурс сборки и оборудование как ресурс металлообработки', async ({ request }) => {
        const dto = typeWork === 'metall'
          ? resource(0, 3, { equipmentId: equipmentIds[1] })
          : { userId: userIds[1], quantity: 3 };
        const saved = await splitOperation(request, dto);
        const shares = activeAssignments(saved);
        expect(shares.map(a => Number(a.quantity))).toEqual([7, 3]);
        expect(shares.map(a => a.user_id)).toEqual(typeWork === 'metall' ? [userIds[0], userIds[0]] : [userIds[0], userIds[1]]);
        expect(shares.map(a => a.equipment_id)).toEqual(typeWork === 'metall' ? [equipmentIds[0], equipmentIds[1]] : [null, null]);
        const before = snapshot(saved);
        const duplicate = typeWork === 'metall'
          ? resource(2, 1, { equipmentId: equipmentIds[1] })
          : { userId: userIds[1], quantity: 1 };
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, duplicate, token), 409);
        expect(snapshot(await read(request))).toEqual(before);
      });

      test('откатывает весь пакет при ошибке второй доли и при удалении с невалидным добавлением', async ({ request }) => {
        let before = snapshot(await read(request));
        for (const dto of [
          { assignments: [resource(1, 2), resource(1, 1)] },
          { assignments: [resource(1, 2), resource(2, 8)] },
          { ...resource(1, 2), additionalAssignments: [resource(4, 1)] },
        ]) {
          rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, dto, token), 409);
          expect(snapshot(await read(request))).toEqual(before);
        }
        const saved = await splitOperation(request, resource(1, 3));
        const secondary = activeAssignments(saved)[1];
        before = snapshot(saved);
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, {
          removeAssignmentIds: [secondary.id], assignments: [resource(2, 1), resource(4, 1)],
        }, token), 409);
        expect(snapshot(await read(request))).toEqual(before);
        const replaced = await splitOperation(request, { removeAssignmentIds: [secondary.id], assignments: [resource(2, 3)] });
        assertShares(replaced, [{ index: 0, quantity: 7 }, { index: 2, quantity: 3 }]);
      });

      test('проверяет границы количества, квалификацию, уникальность ресурсов и источник доли', async ({ request }) => {
        let before = snapshot(await read(request));
        const invalid: { label: string; dto: unknown; status: number }[] = [
          { label: 'Повторный основной ресурс', dto: resource(0, 1), status: 409 },
          { label: 'Всё назначение', dto: resource(1, 10), status: 409 },
          { label: 'Больше остатка', dto: resource(1, 11), status: 409 },
          { label: 'Сотрудник без квалификации', dto: resource(4, 1), status: 409 },
          { label: 'Несуществующий сотрудник', dto: resource(1, 1, { userId: missingId }), status: 409 },
          { label: 'Источник для неразделённой операции', dto: resource(1, 1, { sourceAssignmentId: missingId }), status: 400 },
          ...(typeWork === 'metall' ? [
            { label: 'Без оборудования', dto: resource(1, 1, { equipmentId: null }), status: 409 },
            { label: 'Станок вне типа операции', dto: resource(1, 1, { equipmentId: equipmentIds[4] }), status: 409 },
            { label: 'Повторный станок с другим сотрудником', dto: resource(1, 1, { equipmentId: equipmentIds[0] }), status: 409 },
          ] : []),
        ];
        for (const entry of invalid) await test.step(entry.label, async () => {
          rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, entry.dto, token), entry.status);
          expect(snapshot(await read(request))).toEqual(before);
        });
        rejected(await tasks.splitOperationPosition(request, missingId, resource(1, 1), token), 404);
        const saved = await splitOperation(request, resource(1, 3));
        before = snapshot(saved);
        const primary = activeAssignments(saved)[0];
        for (const dto of [
          resource(2, 1, { sourceAssignmentId: missingId }), resource(1, 1),
          { removeAssignmentIds: [primary.id] }, { removeAssignmentIds: [missingId] },
        ]) {
          rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, dto, token), 409);
          expect(snapshot(await read(request))).toEqual(before);
        }
      });

      test('отклоняет невалидные DTO назначений без частичного сохранения', async ({ request }) => {
        const before = snapshot(await read(request));
        const valid = resource(1, 1);
        const invalid = [
          {}, { ...valid, quantity: 0 }, { ...valid, quantity: -1 }, { ...valid, quantity: 1.5 },
          { ...valid, quantity: '1' }, { ...valid, userId: 0 }, { ...valid, userId: '1' },
          { ...valid, equipmentId: 0 }, { ...valid, sourceAssignmentId: 0 }, { ...valid, extra: true },
          { assignments: [] }, { assignments: [valid] }, { assignments: Array(101).fill(valid) },
          { ...valid, additionalAssignments: Array(100).fill(valid) },
          { removeAssignmentIds: [] }, { removeAssignmentIds: [0] },
          { removeAssignmentIds: [1, 1] }, { removeAssignmentIds: Array(101).fill(1) },
          { removeAssignmentIds: [1], assignments: [{ ...valid, quantity: 0 }] },
          { assignments: [valid, { ...valid, userId: 0 }] },
        ];
        for (const [index, dto] of invalid.entries()) await test.step(`Невалидный DTO ${index + 1}`, async () => {
          rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, dto, token), 400);
          expect(snapshot(await read(request))).toEqual(before);
        });
      });

      test('запрещает разделение ПЗ с уже разделённой операцией', async ({ request }) => {
        const saved = await splitOperation(request, resource(1, 3));
        const before = snapshot(saved);
        rejected(await tasks.splitProductionTask(request, currentTaskId, splitTaskDto(saved, 1), token), 409);
        expect(snapshot(await read(request))).toEqual(before);
      });

      test('сохраняет выполненное количество при разделении и удалении доли и запрещает его перенос', async ({ request }) => {
        const mark = await marks.createMark(request, {
          oper_id: operationId, user_id: userIds[0], kol: 2, brak: false,
          description: name, date_build: new Date().toISOString(), production_task_id: currentTaskId,
          ...(typeWork === 'metall' ? { metaloworking_id: planId } : { assemble_id: planId }),
        }, token);
        const markId = Number(unwrap(mark.data)?.id);
        if (markId > 0) createdMarkIds.add(markId);
        ok(mark);
        expect(markId, JSON.stringify(mark.data)).toBeGreaterThan(0);
        const marked = await eventually(() => read(request),
          task => Number(operation(task).count_created) === 2, { attempts: 20, intervalMs: 500 });
        expect(marked, 'Выполненные 2 шт. должны попасть в операцию ПЗ').toBeTruthy();
        const before = snapshot(marked!);
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, resource(1, 9), token), 409);
        expect(snapshot(await read(request))).toEqual(before);
        const saved = await splitOperation(request, resource(1, 3));
        const shares = activeAssignments(saved);
        expect(shares.map(a => Number(a.quantity))).toEqual([7, 3]);
        expect(shares.map(a => Number(a.count_created))).toEqual([2, 0]);
        expect(Number(operation(saved).count_created)).toBe(2);
        const merged = await splitOperation(request, { removeAssignmentIds: [shares[1].id] });
        expect(activeAssignments(merged).map(a => Number(a.quantity))).toEqual([10]);
        expect(activeAssignments(merged).map(a => Number(a.count_created))).toEqual([2]);
        expect(Number(operation(merged).count_created)).toBe(2);
        const markView = ok(await marks.getMarkById(request, markId, false, token));
        const persistedMark = getRows<Row>(markView.current?.marks).find(row => Number(row.id) === markId);
        expect(persistedMark, JSON.stringify(markView)).toBeTruthy();
        expect(Number(persistedMark!.kol)).toBe(2);
      });

      test('не разрешает разделение архивного ПЗ и его операции', async ({ request }) => {
        ok(await tasks.banProductionTask(request, currentTaskId, token));
        createdTaskIds.delete(currentTaskId);
        rejected(await tasks.splitProductionTask(request, currentTaskId, splitTaskDto(currentTask, 1), token), 404);
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, resource(1, 1), token), 404);
      });

      test('защищает оба метода от запроса с недействительной авторизацией', async ({ request }) => {
        const before = snapshot(await read(request));
        rejected(await tasks.splitProductionTask(request, currentTaskId, splitTaskDto(currentTask, 1), 'invalid.jwt.token'), 401);
        rejected(await tasks.splitOperationPosition(request, operation(currentTask).id, resource(1, 1), 'invalid.jwt.token'), 401);
        expect(snapshot(await read(request))).toEqual(before);
      });
    });
  }
};
