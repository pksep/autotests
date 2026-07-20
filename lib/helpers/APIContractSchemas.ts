export type ContractIssue = {
  path: string;
  message: string;
};

export type ContractParseResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { issues: ContractIssue[] } };

export type ContractSchema<T = unknown> = {
  name: string;
  safeParse: (value: unknown) => ContractParseResult<T>;
};

type Validator = (value: unknown, path: string) => ContractIssue[];

const ok: ContractIssue[] = [];

const createSchema = <T = unknown>(name: string, validator: Validator): ContractSchema<T> => ({
  name,
  safeParse: (value: unknown) => {
    const issues = validator(value, '$');
    return issues.length === 0
      ? { success: true, data: value as T }
      : { success: false, error: { issues } };
  },
});

const issue = (path: string, message: string): ContractIssue => ({ path, message });

const isRecord = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const isNonNegativeNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

const isString = (value: unknown): value is string => typeof value === 'string';

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.length > 0;

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const isDateLike = (value: unknown): boolean =>
  value instanceof Date || (typeof value === 'string' && Number.isFinite(Date.parse(value)));

const optional = (record: Record<string, any>, key: string, predicate: (value: unknown) => boolean, path: string) => {
  if (!(key in record) || record[key] === null || record[key] === undefined) return ok;
  return predicate(record[key]) ? ok : [issue(`${path}.${key}`, 'has invalid type')];
};

const required = (
  record: Record<string, any>,
  key: string,
  predicate: (value: unknown) => boolean,
  path: string,
  message = 'is required or has invalid type',
) => predicate(record[key]) ? ok : [issue(`${path}.${key}`, message)];

const objectValidator = (name: string, validate: (record: Record<string, any>, path: string) => ContractIssue[]) =>
  createSchema(name, (value, path) => {
    if (!isRecord(value)) return [issue(path, 'must be an object')];
    return validate(value, path);
  });

const anyEntityReference = (record: Record<string, any>, keys: string[]) =>
  keys.some((key) => record[key] !== null && record[key] !== undefined);

export const paginationOf = <T = unknown>(rowSchema: ContractSchema<T>, name = `${rowSchema.name}Pagination`) =>
  objectValidator(name, (record, path) => {
    const issues = [
      ...required(record, 'count', isNonNegativeNumber, path),
      ...required(record, 'rows', Array.isArray, path),
    ];

    if (!Array.isArray(record.rows)) return issues;

    record.rows.forEach((row, index) => {
      const result = rowSchema.safeParse(row);
      if (!result.success) {
        issues.push(...result.error.issues.map((item) => ({
          path: item.path.replace('$', `${path}.rows[${index}]`),
          message: item.message,
        })));
      }
    });

    return issues;
  });

export const arrayOf = <T = unknown>(itemSchema: ContractSchema<T>, name = `${itemSchema.name}Array`) =>
  createSchema<T[]>(name, (value, path) => {
    if (!Array.isArray(value)) return [issue(path, 'must be an array')];

    return value.flatMap((item, index) => {
      const result = itemSchema.safeParse(item);
      if (result.success) return ok;
      return result.error.issues.map((contractIssue) => ({
        path: contractIssue.path.replace('$', `${path}[${index}]`),
        message: contractIssue.message,
      }));
    });
  });

export const materialResponseSchema = objectValidator('MaterialSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...required(record, 'name', isNonEmptyString, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'attention', isBoolean, path),
  ...optional(record, 'deliveryTime', isNonNegativeNumber, path),
  ...optional(record, 'quantity', isNonNegativeNumber, path),
  ...optional(record, 'min_remaining', isNonNegativeNumber, path),
  ...optional(record, 'shipments_kolvo', isNonNegativeNumber, path),
  ...(!anyEntityReference(record, [
    'rootParentId',
    'typeMaterialsId',
    'typeMaterialId',
    'type_material_id',
    'typeMaterial',
    'type_material',
    'rootParent',
  ]) ? [issue(path, 'must include material type reference')] : ok),
  ...(!anyEntityReference(record, [
    'subtypeMaterialId',
    'subtype_material_id',
    'subtypeMaterial',
    'subtype_material',
  ]) ? [issue(path, 'must include material subtype reference')] : ok),
]);

export const typeMaterialResponseSchema = objectValidator('TypeMaterialSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...required(record, 'name', isNonEmptyString, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'characteristics', isRecord, path),
  ...optional(record, 'instance_type', (value) => isFiniteNumber(value) || isString(value), path),
]);

export const subtypeMaterialResponseSchema = objectValidator('SubtypeMaterialSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...required(record, 'name', isNonEmptyString, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'density', (value) => isFiniteNumber(value) || isString(value), path),
  ...optional(record, 'instance_type', (value) => isFiniteNumber(value) || isString(value), path),
  ...optional(record, 'parentMaterialIds', Array.isArray, path),
]);

export const stockOrderResponseSchema = objectValidator('StockOrderSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...required(record, 'number_order', isNonEmptyString, path),
  ...optional(record, 'date_order', isDateLike, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'type', isNonEmptyString, path),
  ...optional(record, 'status', isString, path),
  ...optional(record, 'minWarehouseReadinessDate', isDateLike, path),
  ...optional(record, 'createdAt', isDateLike, path),
]);

export const stockOrderItemResponseSchema = objectValidator('StockOrderItemSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...(!anyEntityReference(record, ['stock_order_id', 'stockOrderId', 'stock_order', 'stockOrder'])
    ? [issue(path, 'must include stock order reference')]
    : ok),
  ...optional(record, 'my_kolvo', isNonNegativeNumber, path),
  ...optional(record, 'shipments_kolvo', isNonNegativeNumber, path),
  ...optional(record, 'count_shipments', isNonNegativeNumber, path),
  ...optional(record, 'warehouse_readiness_date', isDateLike, path),
  ...optional(record, 'warehouseReadinessDate', isDateLike, path),
]);

export const shipmentResponseSchema = objectValidator('ShipmentsSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'date_order', isDateLike, path),
  ...optional(record, 'date_shipments', isDateLike, path),
  ...optional(record, 'warehouse_readiness_date', isDateLike, path),
  ...optional(record, 'number_order', isString, path),
  ...optional(record, 'kol', isNonNegativeNumber, path),
  ...optional(record, 'bron', isBoolean, path),
  ...optional(record, 'is_custom_product', isBoolean, path),
  ...optional(record, 'status', isString, path),
  ...optional(record, 'description', isString, path),
]);

export const warehouseRemainResponseSchema = objectValidator('RemainSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...required(record, 'name', isString, path),
  ...optional(record, 'designation', isString, path),
  ...optional(record, 'description', isString, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'attention', isBoolean, path),
  ...optional(record, 'attetion', isBoolean, path),
  ...optional(record, 'createdAt', isDateLike, path),
  ...optional(record, 'quantity', isNonNegativeNumber, path),
  ...optional(record, 'in_kit', isNonNegativeNumber, path),
  ...optional(record, 'production_ordered', isNonNegativeNumber, path),
  ...optional(record, 'min_remaining', isNonNegativeNumber, path),
  ...optional(record, 'shipments_kolvo', isNonNegativeNumber, path),
  ...optional(record, 'discontinued', isBoolean, path),
]);

export const productionTaskResponseSchema = objectValidator('ProductionTaskSchema wire response', (record, path) => [
  ...required(record, 'id', isPositiveNumber, path),
  ...optional(record, 'due_data', isDateLike, path),
  ...optional(record, 'dueData', isDateLike, path),
  ...optional(record, 'working_type', isNonEmptyString, path),
  ...optional(record, 'workingType', isNonEmptyString, path),
  ...optional(record, 'description', isString, path),
  ...optional(record, 'ban', isBoolean, path),
  ...optional(record, 'production_operation_pos', Array.isArray, path),
  ...optional(record, 'marks', Array.isArray, path),
]);
