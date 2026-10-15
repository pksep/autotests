type SummaryRow = Record<string, any>;

/** Сроки ПЗ из независимой сводки потребностей, с учётом объединённых строк и разделённых ПЗ. */
export const getProductionRequiredReadyDates = (rows: SummaryRow[], entityType: string): Map<number, string | null> => {
  const isProduct = entityType === 'product';
  const demandId = (row: SummaryRow) => Number(isProduct ? row.shipmentId : row.parentPTNumber) || 0;
  const demandDate = (row: SummaryRow) => isProduct ? row.shipmentReadinessDate : row.parentReadinessDate;
  const stockKey = (row: SummaryRow): string | null => row.stockOrderId
    ? `stock:${row.stockOrderId}:${demandId(row)}`
    : null;
  const demandKey = (row: SummaryRow): string | null => {
    if (demandId(row)) return `demand:${demandId(row)}`;
    const quantity = isProduct ? row.quantityByShipment : row.parentPTQuantity;
    const need = isProduct ? row.shipmentNeed : row.parentPTNeed;
    return !Number(quantity || 0) && !Number(need || 0) && !demandDate(row)
      ? stockKey(row)
      : null;
  };

  // Пустая строка наследует ближайшее ПЗ только внутри той же непрерывной потребности.
  const owners: (number | null)[] = rows.map((row, index) => {
    if (Number(row.productionTaskId)) return Number(row.productionTaskId);
    const key = demandKey(row);
    if (!key) return null;
    for (let previous = index - 1; previous >= 0 && demandKey(rows[previous]) === key; previous--) {
      if (Number(rows[previous].productionTaskId)) return Number(rows[previous].productionTaskId);
    }
    return null;
  });

  const dates = new Map<number, string | null>();
  const addDate = (taskId: number, value: unknown) => {
    if (value === null || value === undefined || value === '') return;
    const timestamp = Date.parse(String(value));
    if (!Number.isFinite(timestamp)) throw new Error(`Некорректная дата в сводке ПЗ ${taskId}: ${value}`);
    const current = dates.get(taskId);
    if (!current || timestamp < Date.parse(current)) dates.set(taskId, new Date(timestamp).toISOString());
  };
  const addGroupDates = (taskId: number, index: number, keyOf: (row: SummaryRow) => string | null,
    dateOf: (row: SummaryRow) => unknown) => {
    const key = keyOf(rows[index]);
    if (!key) return;
    let first = index;
    let last = index;
    while (first > 0 && keyOf(rows[first - 1]) === key) first--;
    while (last + 1 < rows.length && keyOf(rows[last + 1]) === key) last++;
    for (let cursor = first; cursor <= last; cursor++) addDate(taskId, dateOf(rows[cursor]));
  };

  rows.forEach((row, index) => {
    const taskId = owners[index];
    if (!taskId) return;
    if (!dates.has(taskId)) dates.set(taskId, null);
    addDate(taskId, row.planReadyDate);
    addGroupDates(taskId, index, demandKey, demandDate);
    addGroupDates(taskId, index, stockKey, item => item.stockReadinessDate);
  });
  return dates;
};
