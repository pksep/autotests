import { test, expect, APIRequestContext } from '@playwright/test';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { CBEDAPI } from '../../pages/API/APICBED';
import { TechProcessAPI } from '../../pages/API/APITechProcess';
import { OperationAPI } from '../../pages/API/APIOperation';
import { StockOrderAPI } from '../../pages/API/APIStockOrder';
import { UsersAPI } from '../../pages/API/APIUsers';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { RolesAPI } from '../../pages/API/APIRoles';
import { ENV } from '../../config';
import { randomUUID } from 'crypto';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { expectErrorResponseContract, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type Row = Record<string, any>;
type Result = { status: number; data: any };
const tasks = new ProductionTasksAPI(null);
const details = new DetailsAPI(null);
const cbeds = new CBEDAPI(null);
const tech = new TechProcessAPI(null);
const operations = new OperationAPI(null);
const orders = new StockOrderAPI(null);
const users = new UsersAPI(null as any);
const equipment = new EquipmentAPI(null);
const roles = new RolesAPI(null as any);
const ok = (result: Result): Row => {
  expect(successCodes, JSON.stringify(result.data)).toContain(result.status);
  return result.data?.data ?? result.data;
};
const position = (task: Row): Row => task.production_operation_pos[0];
const operation = (task: Row): Row => position(task).operation_positions[0];
const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: string, days: number) => dateOnly(new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000));
const local = (date: string, time: string) => new Date(date + 'T' + time + ':00+03:00').toISOString();

export const runProductionWorkCalendarAPI = () => {
  for (const typeWork of ['ass', 'metall'] as const) {
    test.describe('Production Work Calendar API: ' + typeWork, () => {
      test.describe.configure({ mode: 'default', timeout: 180000 });
      let token: string;
      let entityId: number;
      let typeOperationId: number;
      let operationId: number;
      let planId: number;
      let orderId: number;
      let roleId: number;
      let equipmentTypeId: number;
      let equipmentSubtypeId: number;
      let userIds: number[] = [];
      let equipmentIds: number[] = [];
      let currentTask: Row;
      let currentTaskId: number;
      const createdTaskIds = new Set<number>();
      const originalDays = new Map<string, number>();
      const suffix = uniqueApiSuffix('calendar-' + typeWork);
      const name = 'API Calendar ' + suffix;
      const entityType = typeWork === 'metall' ? 'detal' : 'cbed';
      const future = new Date(Date.now() + 21 * 86400000);
      future.setUTCDate(future.getUTCDate() + (8 - future.getUTCDay()) % 7);
      const monday = dateOnly(future);
      const saturday = addDays(monday, 5);
      const resourceId = (index = 0) => typeWork === 'metall' ? equipmentIds[index] : userIds[index];
      const readCalendar = async (request: APIRequestContext, index = 0): Promise<Row[]> => {
        const result = await tasks.getWorkloadByEntity(request, {
          entityType: typeWork,
          range: { start: monday + ' 00:00:00', end: addDays(monday, 10) + ' 23:59:59' },
          ...(typeWork === 'metall' ? { equipmentId: resourceId(index) } : { userId: resourceId(index) }),
        }, token);
        const rows = ok(result);
        expect(Array.isArray(rows)).toBe(true);
        const row = rows.find((item: Row) => Number(item.responsibleInfo?.id) === resourceId(index));
        expect(row, 'Календарь отдельного тестового ресурса').toBeTruthy();
        expect(Array.isArray(row.workdays)).toBe(true);
        return row.workdays;
      };
      const capacity = (days: Row[], date: string): number => {
        const day = days.find(day => day.workDate === date);
        expect(day, 'День должен присутствовать в календаре: ' + date).toBeTruthy();
        return Number(day!.minutes);
      };
      const setDay = async (request: APIRequestContext, workDate: string, minutes: number) => {
        if (!originalDays.has(workDate)) originalDays.set(workDate, capacity(await readCalendar(request), workDate));
        const dto = { entityType: typeWork, resourceId: resourceId(), workDate, minutes };
        expect(ok(await tasks.setResourceWorkday(request, dto, token))).toMatchObject(dto);
        await expect(async () => expect(capacity(await readCalendar(request), workDate)).toBe(minutes))
          .toPass({ timeout: 20000, intervals: [500, 1000] });
      };
      const setStart = async (request: APIRequestContext, date: string) => {
        const time = local(date, '08:00');
        ok(typeWork === 'metall'
          ? await tasks.setStartTimeByEquipment(request, { equipmentId: resourceId(), time }, token)
          : await tasks.setStartTimeByUser(request, { userId: resourceId(), time }, token));
      };
      const expectFinish = async (request: APIRequestContext, start: string, finish: string) => {
        await expect(async () => {
          // Assert the authoritative operation API, independently of the edited workload cell.
          const result = ok(await tasks.getTaskOperations(request, {
            entityType: typeWork, productionEntityId: planId,
            operationId: typeOperationId, productionTaskId: currentTaskId,
          }, token));
          const row = result.allOperationPositions?.find((row: Row) => Number(row.productionTaskId) === currentTaskId)
            ?? result.allOperationPositions?.[0];
          expect(row, JSON.stringify(result)).toBeTruthy();
          expect(Date.parse(row.startTime)).toBe(Date.parse(start));
          expect(Date.parse(row.calculateNeedsTime), JSON.stringify(row)).toBe(Date.parse(finish));
        }).toPass({ timeout: 30000, intervals: [500, 1000, 2000] });
      };

      test.beforeAll(async ({ request }) => {
        token = await getAuthToken(request);
        roleId = Number(ok(await roles.createRole(request, { name, description: name }, undefined, token)).id);
        // Use isolated employees and machines: editing calendars must not reschedule live work.
        for (let index = 0; index < 2; index++) {
          const response = await request.post(ENV.API_BASE_URL + 'api/users', {
            headers: { compress: 'no-compress', Cookie: 'access_token=' + token },
            form: {
              initial: name + '-' + index, login: 'calendar-' + suffix + '-' + index,
              tabel: ('cal-' + suffix + '-' + index).slice(-32), password: randomUUID(),
              dateWork: '2026-01-01', birthday: '1990-01-01', roles: String(roleId),
              phone: '', haracteristic: name, primetch: '', remoteWork: 'false', documentIds: '[]', requisites: '[]',
            },
          });
          // Do not log or attach the user response: it may contain credential fields.
          expect(response.status()).toBe(201);
          const user = await response.json();
          userIds.push(Number(user.id));
          expect(userIds[index]).toBeGreaterThan(0);
        }
        if (typeWork === 'metall') {
          equipmentTypeId = Number(ok(await equipment.createEquipmentType(request, { name }, token)).id);
          equipmentSubtypeId = Number(ok(await equipment.createEquipmentSubtype(request, { name, parentId: equipmentTypeId }, token)).id);
          for (let index = 0; index < 2; index++) {
            const row = ok(await equipment.createEquipment(request, {
              name: name + '-' + index, deliveryTime: '0', invNymber: suffix + '-' + index,
              responsible: '0', description: name, docs: 'null', parentId: equipmentSubtypeId,
              rootParentId: equipmentTypeId, companyIds: '[]', instrumentIdList: '[]',
              attention: false, fileBase: '[]', typeOperationIds: '[]',
            }, token));
            equipmentIds.push(Number(row.id));
            expect(equipmentIds[index]).toBeGreaterThan(0);
          }
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
          mainTime: '60', generalCountTime: '60', description: name, docs: '[]',
          instrumentList: '[]', instrumentMerList: '[]', instrumentOsnList: '[]', eqList: '[]',
        }, token)).id);
        expect(operationId).toBeGreaterThan(0);
        // Remove default assembly operations so the fixture is exactly 10 × 60 minutes.
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

      test.afterEach(async ({ request }) => {
        const errors: string[] = [];
        // Restore saved capacities even when an assertion or a write response failed.
        for (const [workDate, minutes] of originalDays) {
          try {
            const dto = { entityType: typeWork, resourceId: resourceId(), workDate, minutes };
            ok(await tasks.setResourceWorkday(request, dto, token));
            expect(capacity(await readCalendar(request), workDate)).toBe(minutes);
            originalDays.delete(workDate);
          } catch (error) { errors.push('Календарь ' + workDate + ': ' + String(error)); }
        }
        for (const id of createdTaskIds) {
          try { ok(await tasks.banProductionTask(request, id, token)); createdTaskIds.delete(id); }
          catch (error) { errors.push('ПЗ ' + id + ': ' + String(error)); }
        }
        expect(errors, 'Восстановление календаря и уборка тестового ПЗ').toEqual([]);
      });
      test.afterAll(async ({ request }) => {
        const errors: string[] = [];
        const clean = async (label: string, action: () => Promise<Result>) => {
          try { ok(await action()); } catch (error) { errors.push(label + ': ' + String(error)); }
        };
        for (const [workDate, minutes] of originalDays) await clean('Календарь', () => tasks.setResourceWorkday(request,
          { entityType: typeWork, resourceId: resourceId(), workDate, minutes }, token));
        for (const id of createdTaskIds) await clean('ПЗ', () => tasks.banProductionTask(request, id, token));
        if (orderId) await clean('Заказ', () => orders.ban(request, orderId, token));
        if (operationId) await clean('Операция', () => operations.banOperation(request, operationId, token));
        if (typeOperationId) await clean('Тип операции', () => operations.banTypeOperation(request, typeOperationId, token));
        if (entityId) await clean('Сущность', () => typeWork === 'metall'
          ? details.deleteDetail(request, String(entityId), API_CONST.API_TEST_TABEL, token)
          : cbeds.banCBED(request, entityId, API_CONST.API_TEST_TABEL, token));
        for (const id of equipmentIds) await clean('Станок', () => equipment.banEquipment(request, id, token));
        if (equipmentSubtypeId) await clean('Подтип', () => equipment.removeEquipmentSubtype(request, equipmentSubtypeId, token));
        if (equipmentTypeId) await clean('Тип', () => equipment.removeEquipmentType(request, equipmentTypeId, token));
        for (const id of userIds) await clean('Сотрудник', () => users.banUser(request,
          { id, userId: id, banReason: 'API calendar autotest cleanup' }, token));
        if (roleId) await clean('Роль', () => roles.deleteRole(request, String(roleId), undefined, token));
        expect(errors, 'Все временные ресурсы должны быть архивированы').toEqual([]);
      });

      test('изменяет длительность дня, сохраняет её и пересчитывает окончание только своего ресурса', async ({ request }) => {
        const other = await readCalendar(request, 1);
        const adjacent = capacity(await readCalendar(request), addDays(monday, 2));
        await setDay(request, monday, 480);
        await setDay(request, addDays(monday, 1), 480);
        await setStart(request, monday);
        await expectFinish(request, local(monday, '08:00'), local(addDays(monday, 1), '10:00'));
        for (const [minutes, finish] of [
          [240, local(addDays(monday, 1), '14:30')],
          [540, local(addDays(monday, 1), '09:00')],
          [960, local(monday, '18:30')],
          [480, local(addDays(monday, 1), '10:00')],
        ] as const) {
          await setDay(request, monday, minutes);
          await expectFinish(request, local(monday, '08:00'), finish);
          expect((await readCalendar(request, 1)).map(day => [day.workDate, day.minutes]))
            .toEqual(other.map(day => [day.workDate, day.minutes]));
          expect(capacity(await readCalendar(request), addDays(monday, 2))).toBe(adjacent);
        }
      });

      test('делает субботу рабочей и возвращает выходной с пересчётом окончания ПЗ', async ({ request }) => {
        const friday = addDays(saturday, -1);
        const nextMonday = addDays(saturday, 2);
        const other = await readCalendar(request, 1);
        await setDay(request, friday, 480);
        await setDay(request, saturday, 0);
        await setDay(request, addDays(saturday, 1), 0);
        await setDay(request, nextMonday, 480);
        await setStart(request, friday);
        await expectFinish(request, local(friday, '08:00'), local(nextMonday, '10:00'));
        await setDay(request, saturday, 420);
        await expectFinish(request, local(friday, '08:00'), local(saturday, '10:00'));
        await setDay(request, saturday, 0);
        await expectFinish(request, local(friday, '08:00'), local(nextMonday, '10:00'));
        expect((await readCalendar(request, 1)).map(day => [day.workDate, day.minutes]))
          .toEqual(other.map(day => [day.workDate, day.minutes]));
      });

      test('отклоняет неверную длительность и дату без изменения календаря', async ({ request }) => {
        const before = await readCalendar(request);
        const dto = { entityType: typeWork, resourceId: resourceId(), workDate: monday, minutes: 480 };
        for (const invalid of [
          { minutes: -1 }, { minutes: 961 }, { minutes: 1.5 }, { minutes: '480' },
          { minutes: null }, { workDate: '2026-02-30' }, { workDate: 'bad-date' },
        ]) {
          const result = await tasks.setResourceWorkday(request, { ...dto, ...invalid }, token);
          expect(result.status, JSON.stringify({ invalid, response: result.data })).toBe(400);
          expectErrorResponseContract(result);
        }
        expect((await readCalendar(request)).map(day => [day.workDate, day.minutes]))
          .toEqual(before.map(day => [day.workDate, day.minutes]));
      });
    });
  }
};
