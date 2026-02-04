// Production Page constants

// Switch element for filtering by department
export const PRODUCTION_SWITCH = '[data-testid="Production-Container-Row-Accordion-UserByProductionTask-Body-TableWrapper-Switch"]';

// Switch item for Сборка (Assembly)
export const PRODUCTION_SWITCH_ITEM_SBORKA = '[data-testid="Production-Container-Row-Accordion-UserByProductionTask-Body-TableWrapper-Switch-Item0"]';

// Main production table
export const PRODUCTION_TABLE = '[data-testid="Production-Container-Row-Accordion-UserByProductionTask-Body-TableWrapper-Table"]';

// Table row patterns (for dynamic row numbers)
// Base pattern for table rows (main rows, not sub-rows)
export const PRODUCTION_TABLE_ROW_PREFIX = 'Production-Container-Row-Accordion-UserByProductionTask-Body-TableWrapper-Table-Row';

// Table row cell patterns
export const PRODUCTION_TABLE_ROW_POPOVER_CELL_SUFFIX = '-Popover';
export const PRODUCTION_TABLE_ROW_TABEL_NUMBER_CELL_SUFFIX = '-TabelNumber';
export const PRODUCTION_TABLE_ROW_NAME_CELL_SUFFIX = '-Name';
export const PRODUCTION_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX = '-CountPosition';

// Popover menu patterns
export const PRODUCTION_TABLE_ROW_POPOVER_SHOW_BUTTON_SUFFIX = '-Popover-Popover-PopoverShow';
export const PRODUCTION_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX = '-Popover-Popover-OptionsList';
export const PRODUCTION_TABLE_ROW_POPOVER_ITEM1_SUFFIX = '-Popover-Popover-Item1';

// Helper function to build row-specific selectors
export const getProductionTableRowPopoverOptionsList = (rowNumber: string): string => {
  return `[data-testid="${PRODUCTION_TABLE_ROW_PREFIX}${rowNumber}${PRODUCTION_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX}"]`;
};

export const getProductionTableRowPopoverItem1 = (rowNumber: string): string => {
  return `[data-testid="${PRODUCTION_TABLE_ROW_PREFIX}${rowNumber}${PRODUCTION_TABLE_ROW_POPOVER_ITEM1_SUFFIX}"]`;
};

export const getProductionTableRowByTestId = (testId: string): string => {
  return `tr[data-testid="${testId}"]`;
};

// Employee name element on task-by-user page (CSS class selector)
export const TASK_BY_USER_EMPLOYEE_CLASS = '.task-by-user__employee';
