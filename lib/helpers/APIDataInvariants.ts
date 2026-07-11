import { expect } from '@playwright/test';

type ApiRow = Record<string, any>;

const numericValue = (value: unknown): number | undefined => {
  const numberValue = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof numberValue === 'number' && Number.isFinite(numberValue) ? numberValue : undefined;
};

export const readNumber = (row: ApiRow | undefined, keys: string[]): number | undefined => {
  if (!row) return undefined;

  for (const key of keys) {
    const value = numericValue(row[key]);
    if (value !== undefined) return value;
  }

  return undefined;
};

export const readField = (row: ApiRow | undefined, keys: string[]): unknown => {
  if (!row) return undefined;

  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }

  return undefined;
};

export const expectNonNegativeQuantities = (
  rows: ApiRow[],
  keys = ['quantity', 'kol', 'count', 'my_kolvo', 'myKolvo', 'shipments_kolvo', 'shipmentsKolvo', 'in_kit', 'inKit'],
) => {
  for (const row of rows) {
    for (const key of keys) {
      const value = numericValue(row[key]);
      if (value === undefined) continue;
      expect(value, `${key} must not be negative: ${JSON.stringify(row)}`).toBeGreaterThanOrEqual(0);
    }
  }
};

export const expectRowLinkedToEntity = (
  row: ApiRow,
  entityType: string,
  entityId: number,
  extraKeys: string[] = [],
) => {
  const keysByType: Record<string, string[]> = {
    product: ['product_id', 'productId'],
    cbed: ['cbed_id', 'cbedId'],
    detal: ['detal_id', 'detalId'],
    material: ['material_id', 'materialId'],
  };
  const keys = ['entity_id', 'entityId', 'object_id', 'objectId', ...(keysByType[entityType] ?? []), ...extraKeys];
  const actualId = readNumber(row, keys);

  expect(actualId, `Row is not linked to ${entityType}:${entityId}: ${JSON.stringify(row)}`).toBe(entityId);
};

export const expectRowsLinkedToEntity = (
  rows: ApiRow[],
  entityType: string,
  entityId: number,
  extraKeys: string[] = [],
) => {
  for (const row of rows) {
    expectRowLinkedToEntity(row, entityType, entityId, extraKeys);
  }
};

export const expectParentChildReference = (
  rows: ApiRow[],
  expectedParent: { id: number; type?: string },
  keys = ['parent_id', 'parentId', 'product_id', 'productId', 'cbed_id', 'cbedId', 'izd_id', 'izdId', 'entity_id', 'entityId'],
) => {
  const hasParent = rows.some((row) => readNumber(row, keys) === expectedParent.id);
  expect(
    hasParent,
    `Expected parent ${expectedParent.type ?? 'entity'}:${expectedParent.id} in rows: ${JSON.stringify(rows)}`,
  ).toBe(true);
};

export const expectArchivedOnlyInArchiveSelection = (
  activeRows: ApiRow[],
  archivedRows: ApiRow[],
  id: number,
) => {
  expect(activeRows.some((row) => Number(row.id) === id), `Archived id ${id} is still in active rows`).toBe(false);
  expect(archivedRows.some((row) => Number(row.id) === id), `Archived id ${id} is missing from archive rows`).toBe(true);
};

export const expectRepeatOperationRejectedOrIdempotent = (
  firstStatus: number,
  secondStatus: number,
  allowedSuccessCodes: number[],
  allowedRejectCodes: number[],
) => {
  expect(allowedSuccessCodes, `First operation should be successful, status=${firstStatus}`).toContain(firstStatus);
  expect(
    [...allowedSuccessCodes, ...allowedRejectCodes],
    `Repeated operation should be idempotent or rejected, status=${secondStatus}`,
  ).toContain(secondStatus);
};

export const expectDateFieldMatches = (
  row: ApiRow,
  keys: string[],
  expectedDate: string,
) => {
  const actual = readField(row, keys);
  expect(actual, `Expected date field ${keys.join('/')} in row: ${JSON.stringify(row)}`).toBeTruthy();

  const actualTime = Date.parse(String(actual));
  const expectedTime = Date.parse(expectedDate);
  expect(actualTime, `Invalid actual date ${String(actual)} in row: ${JSON.stringify(row)}`).not.toBeNaN();
  expect(expectedTime, `Invalid expected date ${expectedDate}`).not.toBeNaN();
  expect(Math.abs(actualTime - expectedTime), `Date mismatch: actual=${String(actual)} expected=${expectedDate}`).toBeLessThanOrEqual(60_000);
};

export const expectValidDateField = (row: ApiRow, keys: string[]) => {
  const actual = readField(row, keys);
  expect(actual, `Expected date field ${keys.join('/')} in row: ${JSON.stringify(row)}`).toBeTruthy();
  expect(Date.parse(String(actual)), `Invalid date ${String(actual)} in row: ${JSON.stringify(row)}`).not.toBeNaN();
};
