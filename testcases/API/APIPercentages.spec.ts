import { APIRequestContext, expect, test } from '@playwright/test';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import { PercentagesAPI, PercentageEntityType } from '../../pages/API/APIPercentages';

type Row = Record<string, any>;
type Result = { status: number; data: any };
type Need = { key: string; quantity: number; free: number };
const api = new PercentagesAPI();
const types: PercentageEntityType[] = ['detal', 'cbed', 'product'];
const lists = [
  { field: 'listCbed', response: 'cbed', stock: 'cbed' },
  { field: 'listDetal', response: 'detal', stock: 'detal' },
  { field: 'materialList', response: 'material', stock: 'material' },
  { field: 'listPokDet', response: 'pokDet', stock: 'material' },
] as const;

function ok(result: Result, status: number, label: string): any {
  // Only route/context and status are included in diagnostics; never auth headers.
  expect(result.status, label).toBe(status);
  return result.data;
}

function numeric(value: unknown, label: string): number {
  expect(typeof value, label).toBe('number');
  expect(Number.isFinite(value), label).toBe(true);
  return value as number;
}

function specificationNumber(value: unknown, label: string): number {
  // Historical specification JSON stores some quantities as decimal strings.
  if (typeof value === 'string') {
    expect(value, label).toMatch(/^-?\d+(?:\.\d+)?$/);
    return numeric(Number(value), label);
  }
  return numeric(value, label);
}

function percentage(value: unknown, label: string, allowNumericString = false): number {
  if (allowNumericString && typeof value === 'string') {
    expect(value, label).toMatch(/^\d+(?:\.\d+)?$/);
    value = Number(value);
  }
  const result = numeric(value, label);
  expect(result, label).toBeGreaterThanOrEqual(0);
  expect(result, label).toBeLessThanOrEqual(100);
  expect(Number.isInteger(result), label).toBe(true);
  return result;
}

function entity(work: Row, type: PercentageEntityType): Row {
  expect(work?.[type]?.id, `${type}: entity must be present`).toBeGreaterThan(0);
  return work[type];
}

function operations(work: Row, type: PercentageEntityType): Row[] {
  const result = entity(work, type).techProcesses?.operations;
  expect(Array.isArray(result), `${type}/${work.id}: operations`).toBe(true);
  return result.filter((operation: Row) => !operation.ban);
}

function completed(operation: Row): number {
  expect(Array.isArray(operation.marks), `operation ${operation.id}: marks`).toBe(true);
  return operation.marks.reduce((sum: number, mark: Row) => {
    if (mark.ban || mark.brak !== false) return sum;
    return sum + Math.max(0, numeric(mark.kol, 'mark.kol') - numeric(mark.quantity_shipped, 'mark.quantity_shipped'));
  }, 0);
}

function ratio(done: number, required: number): number {
  return required > 0 ? Math.round(100 * Math.min(1, Math.max(0, done / required))) : 0;
}

function remaining(work: Row): number {
  return Math.max(0, numeric(work.kolvo_shipments, 'kolvo_shipments') - numeric(work.kolvo_create, 'kolvo_create'));
}

function expectedWorkPercent(work: Row, type: PercentageEntityType): number {
  const active = operations(work, type).sort((a, b) => Number(a.idx) - Number(b.idx));
  return active.length ? ratio(completed(active[active.length - 1]), remaining(work)) : 0;
}

// This oracle uses raw quantities, not the production application's calculation helpers.
function readiness(needs: Need[], required: number, collected = 0): number {
  if (required === 0) return 100; // production-task/percent contract
  const grouped = new Map<string, Need>();
  for (const need of needs) {
    const previous = grouped.get(need.key);
    grouped.set(need.key, previous ? { ...need, quantity: previous.quantity + need.quantity } : { ...need });
  }
  const positive = [...grouped.values()].filter(need => need.quantity > 0);
  const coveredShares = positive.reduce((sum, need) => {
    const available = need.free + collected * need.quantity;
    return sum + Math.min(1, available / (required * need.quantity));
  }, 0);
  return positive.length ? Math.round(100 * coveredShares / positive.length) : 0;
}

function specification(source: Row, type: PercentageEntityType) {
  return lists.filter(list => type !== 'detal' || list.field === 'materialList').flatMap(list => {
    expect(Array.isArray(source[list.field]), `${type}/${source.id}: ${list.field}`).toBe(true);
    return source[list.field].map((item: Row) => ({
      ...list, id: specificationNumber(item.id, 'specification.id'), quantity: specificationNumber(item.quantity, 'specification.quantity'),
    }));
  });
}

async function needsFor(request: APIRequestContext, type: PercentageEntityType, source: Row, token: string): Promise<Need[]> {
  const stocks = new Map<string, number>();
  const needs: Need[] = [];
  for (const item of specification(source, type)) {
    const key = `${item.stock}/${item.id}`;
    if (!stocks.has(key)) {
      const stock = ok(await api.stock(request, item.stock, item.id, token), item.stock === 'material' ? 200 : 201, key);
      expect(stock?.id, key).toBe(item.id);
      stocks.set(key, Math.max(0, numeric(stock.quantity, key + '.quantity') - numeric(stock.in_kit, key + '.in_kit')));
    }
    needs.push({ key, quantity: item.quantity, free: stocks.get(key)! });
  }
  return needs;
}

async function needsForTask(request: APIRequestContext, token: string, needs: Need[], taskId: number): Promise<Need[]> {
  const allocations = new Map<string, number>();
  for (const need of needs) {
    const [type, id] = need.key.split('/');
    if ((type !== 'cbed' && type !== 'detal') || allocations.has(need.key)) continue;

    // The order summary exposes the stock balance before any planned production arrives.
    const summary = ok(await api.ordersSummary(request, type, Number(id), token), 200, `${need.key}: orders summary`);
    expect(Array.isArray(summary.rows), `${need.key}: summary rows`).toBe(true);
    const allocated = (summary.rows as Row[]).filter(row => row.parentPTNumber === taskId).reduce((sum, row) => {
      const quantity = numeric(row.parentPTNeed, `${need.key}: parent demand`);
      const deficit = numeric(row.deficit, `${need.key}: parent deficit`);
      return sum + Math.max(0, Math.min(quantity, quantity + deficit));
    }, 0);
    allocations.set(need.key, allocated);
  }
  return needs.map(need => ({ ...need, free: allocations.get(need.key) ?? need.free }));
}

function collectedKits(work: Row, type: PercentageEntityType): number {
  return type === 'detal' ? 0 : numeric(work.collected, `${type}/${work.id}: collected kits`);
}

async function kitsByTask(request: APIRequestContext, type: PercentageEntityType, work: Row, tasks: Row[], token: string) {
  let available = collectedKits(work, type);
  const coverage = new Map<number, number>();
  if (available === 0) return coverage;

  const firstOperationId = operations(work, type).find(operation => operation.idx === 1)?.id;
  const positions = [];
  for (const task of tasks) {
    const plan = ok(await api.productionTask(request, task.id, token), 200, `task ${task.id}: saved operations`);
    const position = (plan.production_operation_pos as Row[]).find(row => row.id === task.productionOperationPosId);
    expect(position, `task ${task.id}: saved position`).toBeDefined();
    const firstOperation = (position!.operation_positions as Row[]).find(row => row.operation_id === firstOperationId);
    positions.push({ task, positionId: task.productionOperationPosId, firstOperation });
  }

  // Closed kitting operations take precedence. The rest are ordered by their saved dates.
  const dateOrder = (date?: string | null) => date ? Date.parse(date) : Number.MAX_SAFE_INTEGER;
  positions.sort((a, b) =>
    Number(a.firstOperation?.is_relevance !== false) - Number(b.firstOperation?.is_relevance !== false)
    || dateOrder(a.firstOperation?.plan_ready_time) - dateOrder(b.firstOperation?.plan_ready_time)
    || dateOrder(a.firstOperation?.start_time) - dateOrder(b.firstOperation?.start_time)
    || a.positionId - b.positionId);

  for (const { task } of positions) {
    const covered = Math.min(available, numeric(task.quantity, `task ${task.id}: quantity`));
    coverage.set(task.id, (coverage.get(task.id) ?? 0) + covered);
    available -= covered;
  }
  return coverage;
}

async function pageRows(request: APIRequestContext, type: PercentageEntityType, token: string): Promise<Row[]> {
  const result = ok(await api.productionPage(request, type, 0, token), 201, `${type}: production page`);
  expect(Array.isArray(result.rows), `${type}: rows`).toBe(true);
  expect(result.rows.length, `${type}: seed an active production row for percentage regression`).toBeGreaterThan(0);
  return result.rows;
}

function informative(rows: Row[], type: PercentageEntityType): Row[] {
  // Selection is cheap and side-effect free. Assertions run on the actual cases,
  // rather than being repeated thousands of times by the sorting comparator.
  return rows.map(work => {
    const ops: Row[] = (work[type]?.techProcesses?.operations ?? []).filter((op: Row) => !op.ban);
    const counts = ops.map(op => (op.marks ?? []).reduce((sum: number, mark: Row) =>
      sum + (!mark.ban && mark.brak === false ? Math.max(0, Number(mark.kol) - Number(mark.quantity_shipped)) : 0), 0));
    const required = Math.max(0, Number(work.kolvo_shipments) - Number(work.kolvo_create));
    const score = (work.kolvo_create > 0 ? 10 : 0) + (counts.some(n => n > 0 && n < required) ? 20 : 0)
      + (new Set(counts).size > 1 ? 5 : 0);
    return { work, score, hasOperations: ops.length > 0 };
  }).filter(item => item.hasOperations).sort((a, b) => b.score - a.score).map(item => item.work);
}

function specificationSize(work: Row, type: PercentageEntityType): number {
  return lists.filter(list => type !== 'detal' || list.field === 'materialList')
    .reduce((sum, list) => sum + (work[type]?.[list.field]?.length ?? 0), 0);
}

async function fixture(request: APIRequestContext, type: PercentageEntityType, token: string, withChildren = false) {
  const rows = informative(await pageRows(request, type, token), type)
    .filter(row => !withChildren || row.production_operation_pos?.some((pos: Row) => !pos.ban));
  const childrenRows = rows.filter(row => specificationSize(row, type) > 0)
    .sort((a, b) => specificationSize(a, type) - specificationSize(b, type));
  // Details may legitimately have no materialList (blank stock is a separate feature).
  const selected = withChildren ? childrenRows[0] ?? (type === 'detal' ? rows[0] : undefined) : rows[0];
  expect(Boolean(selected), `${type}: seed production with operations${withChildren ? ' and specification children' : ''}`).toBe(true);
  return selected!;
}

async function taskFixture(request: APIRequestContext, type: PercentageEntityType, token: string, minTasks: number) {
  const candidates = informative(await pageRows(request, type, token), type)
    .filter(work => work.production_operation_pos?.filter((pos: Row) => !pos.ban).length >= minTasks)
    .filter(work => type === 'detal' || specificationSize(work, type) > 0)
    .sort((a, b) => specificationSize(a, type) - specificationSize(b, type));
  for (const work of candidates.slice(0, 20)) {
    const tasks = ok(await api.entityTasks(request, type, work[type].id, token), 200, 'entity tasks');
    expect(Array.isArray(tasks), 'entity tasks').toBe(true);
    if (tasks.length >= minTasks) return { work, tasks: tasks as Row[] };
  }
  throw new Error(`${type}: need production with ${minTasks} active task(s)${type === 'detal' ? '' : ' and specification children'}`);
}

async function checkComplectation(request: APIRequestContext, type: PercentageEntityType, source: Row, token: string,
  needs: Need[], required: number, collected: number,
  context: { productionTaskId?: number; requiredQuantity?: number } = {}) {
  const label = `${type}/${source.id}, task=${context.productionTaskId ?? 'all'}, required=${required}, collected=${collected}`;
  const children = ok(await api.children(request, type, source.id, token, context), 201, label + ': children');
  const spec = specification(source, type);
  for (const list of lists.filter(item => type !== 'detal' || item.field === 'materialList')) {
    const rows = children[list.response];
    expect(Array.isArray(rows), label + ': ' + list.response).toBe(true);
    const expected = spec.filter(item => item.field === list.field);
    expect(rows.length, label + ': specification rows must not disappear').toBe(expected.length);
    const unmatched = [...rows];
    for (const item of expected) {
      const index = unmatched.findIndex((row: Row) => row.id === item.id && row.quantityPerAssembly === item.quantity);
      expect(index, label + ': child ' + item.id).toBeGreaterThanOrEqual(0);
      const child = unmatched.splice(index, 1)[0];
      const free = needs.find(need => need.key === `${item.stock}/${item.id}`)!.free;
      expect(child.freeQuantity, label + ': free stock').toBe(free);
      expect(numeric(child.needsByProductionTask, label + ': demand')).toBeCloseTo(required * item.quantity, 8);
      const covered = free + collected * item.quantity;
      const childLabel = `${label}: ${list.response}/${item.id} percentage`;
      expect(percentage(child.percentCompletion, childLabel), childLabel).toBe(ratio(covered, required * item.quantity));
    }
  }
  const actual = ok(await api.percent(request, type, source.id, token, context), 200, label + ': header');
  expect(percentage(actual, label + ': header percentage'), label).toBe(readiness(needs, required, collected));
}

export const runPercentagesAPI = () => {
  test.describe('API: проценты на страницах и в модальных окнах', () => {
    test.describe.configure({ mode: 'default', timeout: 180000 });
    let token = '';
    test.beforeAll(async ({ request }) => { token = await getAuthToken(request); });

    for (const type of types) {
      test(`${type}: страница — готовность по последней операции и оставшемуся количеству`, async ({ request }) => {
        const rows = await pageRows(request, type, token);
        for (const work of rows) {
          const label = `${type}/${work.id}: page.precentCreated`;
          expect.soft(percentage(work.precentCreated, label, true), label).toBe(expectedWorkPercent(work, type));
        }
      });

      test(`${type}: модалка пути — проценты и отметки согласованы со страницей после обновления`, async ({ request }) => {
        const rows = informative(await pageRows(request, type, token), type).slice(0, 3);
        expect(rows.length, 'Need production rows with operations').toBeGreaterThan(0);
        for (const work of rows) {
          for (let refresh = 0; refresh < 2; refresh++) {
            const path = ok(await api.operationPath(request, type, work.id, token), 200, `${type}/${work.id}: path`);
            expect(path.id).toBe(work.id);
            expect(percentage(path.precentCreated, 'path.precentCreated', true)).toBe(expectedWorkPercent(path, type));
            expect(Number(path.precentCreated), `${type}/${work.id}: page ↔ modal`).toBe(Number(work.precentCreated));
            // General-path operation counts can belong to the latest PZ; the global
            // percentage contract uses the raw marks for all outstanding production.
          }
        }
      });

      test(`${type}: модалка комплектации — общий процент и строки по остаткам и готовым наборам`, async ({ request }) => {
        const work = await fixture(request, type, token, true);
        const source = entity(work, type);
        const needs = await needsFor(request, type, source, token);
        const tasks = ok(await api.entityTasks(request, type, source.id, token), 200, 'entity tasks');
        expect(Array.isArray(tasks), 'entity tasks').toBe(true);
        const required = tasks.reduce((sum: number, task: Row) => sum + numeric(task.quantity, 'task.quantity'), 0);
        const demand = ok(await api.demand(request, type, source.id, token), 200, 'total demand');
        expect(numeric(demand, 'total demand')).toBe(required);
        await checkComplectation(request, type, source, token, needs, required, collectedKits(work, type));
      });

      test(`${type}: модалка — переключение ПЗ A → B → A → общий режим`, async ({ request }) => {
        const { work, tasks } = await taskFixture(request, type, token, 2);
        const source = entity(work, type);
        const needs = await needsFor(request, type, source, token);
        const kits = await kitsByTask(request, type, work, tasks, token);
        const taskNeeds = new Map<number, Need[]>();
        const snapshots = new Map<number, string>();
        for (const task of [tasks[0], tasks[1], tasks[0]]) {
          const context = { productionTaskId: task.id };
          const position = work.production_operation_pos.find((pos: Row) => pos.id === task.productionOperationPosId);
          expect(Boolean(position), `task ${task.id}: production position`).toBe(true);
          expect(numeric(task.quantity, 'selected task quantity')).toBe(position.quantity);
          expect(task.entityPositionId, `task ${task.id}: entity position`).toBe(work.id);
          const path = ok(await api.operationPath(request, type, work.id, token, task.id), 200, 'selected task path');
          const ops = operations(path, type);
          expect(ops.length, 'Selected task must have operation rows').toBeGreaterThan(0);
          for (const op of ops) {
            const label = `${type}/${work.id}, task ${task.id}, operation ${op.id}: countCreated`;
            // marks contains all tasks; productionTaskMarks is the server's
            // projection of those marks onto the selected task's saved budget.
            expect(Array.isArray(op.productionTaskMarks), label + ': task marks').toBe(true);
            expect(numeric(op.countCreated, label), label).toBe(completed({ ...op, marks: op.productionTaskMarks }));
          }
          const snapshot = JSON.stringify(ops.map(op => [op.id, op.countCreated,
            ratio(completed({ ...op, marks: op.productionTaskMarks }), task.quantity)]));
          if (snapshots.has(task.id)) expect(snapshot, 'Returning to task A must restore its progress').toBe(snapshots.get(task.id));
          snapshots.set(task.id, snapshot);
          let allocated = taskNeeds.get(task.id);
          if (!allocated) {
            allocated = await needsForTask(request, token, needs, task.id);
            taskNeeds.set(task.id, allocated);
          }
          await checkComplectation(request, type, source, token, allocated, task.quantity, kits.get(task.id) ?? 0, context);
        }
        const total = tasks.reduce((sum: number, task: Row) => sum + task.quantity, 0);
        await checkComplectation(request, type, source, token, needs, total, collectedKits(work, type));
      });

      test(`${type}: модалка — нулевое, дробное и заданное количество имеет приоритет`, async ({ request }) => {
        const { work, tasks } = await taskFixture(request, type, token, 1);
        const source = entity(work, type);
        const needs = await needsFor(request, type, source, token);
        const taskId = tasks[0].id;
        const kits = await kitsByTask(request, type, work, tasks, token);
        const taskNeeds = await needsForTask(request, token, needs, taskId);
        for (const required of [0, 0.5, 1, 350, 500]) {
          // The header accepts an explicit quantity even in a selected task context.
          const actual = ok(await api.percent(request, type, source.id, token, {
            requiredQuantity: required, productionTaskId: taskId,
          }), 200, `requiredQuantity=${required}`);
          expect(percentage(actual, `requiredQuantity=${required}`)).toBe(readiness(taskNeeds, required, kits.get(taskId) ?? 0));
          // Children without task context use the same explicit quantity.
          await checkComplectation(request, type, source, token, needs, required, collectedKits(work, type), { requiredQuantity: required });
        }
      });
    }

    test('отгрузка: процент страницы согласован с комплектацией изделия на количество отгрузки', async ({ request }) => {
      const data = ok(await api.shipmentsPage(request, token), 201, 'shipments page');
      expect(Array.isArray(data.rows), 'shipments rows').toBe(true);
      const shipments = data.rows.filter((row: Row) => row.productId && row.kol > 0).slice(0, 3);
      expect(shipments.length, 'Need shipments with a catalog product').toBeGreaterThan(0);
      for (const shipment of shipments) {
        const children = ok(await api.children(request, 'product', shipment.productId, token, { requiredQuantity: shipment.kol }), 201, 'shipment children');
        const needs: Need[] = lists.flatMap(list => {
          expect(Array.isArray(children[list.response]), list.response).toBe(true);
          return children[list.response].map((child: Row) => ({
            key: `${list.stock}/${child.id}`, quantity: numeric(child.quantityPerAssembly, 'quantityPerAssembly'),
            free: numeric(child.freeQuantity, 'freeQuantity'),
          }));
        });
        const expected = readiness(needs, shipment.kol);
        expect(percentage(shipment.lvl_complectation, `shipment ${shipment.id}`)).toBe(expected);
        const header = ok(await api.percent(request, 'product', shipment.productId, token, { requiredQuantity: shipment.kol }), 200, 'shipment header');
        expect(percentage(header, 'shipment header')).toBe(expected);
      }
    });

    for (const value of ['-1', 'NaN', 'Infinity', 'abc']) {
      test(`модалка: requiredQuantity=${value} отклоняется`, async ({ request }) => {
        const work = await fixture(request, 'cbed', token);
        const before = percentage(ok(await api.percent(request, 'cbed', work.cbed.id, token), 200, 'baseline read'), 'baseline');
        const result = await api.percent(request, 'cbed', work.cbed.id, token, { requiredQuantity: value });
        expect(result.status, 'Invalid quantity must produce a validation error').toBe(400);
        expect(result.data).toBeTruthy();
        expect(typeof result.data).toBe('object');
        expect(percentage(ok(await api.percent(request, 'cbed', work.cbed.id, token), 200, 'valid read after rejection'), 'valid read')).toBe(before);
      });
    }
  });
};
