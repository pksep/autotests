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

// Scroll wrapper track class selector
export const SCROLL_WRAPPER_TRACK_CLASS = 'div.scroll-wrapper__track.scroll-wrapper__track_vertical';

// User table accordion summary
export const USER_ACCORDION_SUMMARY = '[data-testid="Production-Container-Row-Accordion-UserByProductionTask-Accordion-Summary"]';

// User table accordion button
export const USER_ACCORDION_BUTTON = '[data-testid="Production-Container-Row-Accordion-UserByProductionTask-Accordion-Button"]';

// Equipment table accordion summary
export const EQUIPMENT_ACCORDION_SUMMARY = '[data-testid="Production-Container-Row-Accordion-EquipmentByProductionTask-Accordion-Summary"]';

// Equipment table accordion button
export const EQUIPMENT_ACCORDION_BUTTON = '[data-testid="Production-Container-Row-Accordion-EquipmentByProductionTask-Accordion-Button"]';

// Equipment table switch element
export const EQUIPMENT_SWITCH = '[data-testid="Production-Container-Row-Accordion-EquipmentByProductionTask-Body-TableWrapper-Switch"]';

// Equipment table switch item for Металлообработка
export const EQUIPMENT_SWITCH_ITEM_METALWORKING = '[data-testid="Production-Container-Row-Accordion-EquipmentByProductionTask-Body-TableWrapper-Switch-Item1"]';

// Equipment table
export const EQUIPMENT_TABLE = '[data-testid="Production-Container-Row-Accordion-EquipmentByProductionTask-Body-TableWrapper-Table"]';

// Equipment table row patterns (for dynamic row numbers)
// Base pattern for equipment table rows (main rows, not sub-rows)
export const EQUIPMENT_TABLE_ROW_PREFIX = 'Production-Container-Row-Accordion-EquipmentByProductionTask-Body-TableWrapper-Table-Row';

// Equipment table row cell patterns
export const EQUIPMENT_TABLE_ROW_POPOVER_CELL_SUFFIX = '-Popover';
export const EQUIPMENT_TABLE_ROW_POPOVER_CELL_SUFFIX_WRAPPER = '-Popover-Wrapper';
export const EQUIPMENT_TABLE_ROW_NAME_CELL_SUFFIX = '-Name';
export const EQUIPMENT_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX = '-CountPosition';
export const EQUIPMENT_TABLE_ROW_COUNT_ENTITY_CELL_SUFFIX = '-CountEntity';
export const EQUIPMENT_TABLE_ROW_TIME_CELL_SUFFIX = '-Time';

// Equipment table popover menu patterns
export const EQUIPMENT_TABLE_ROW_POPOVER_SHOW_BUTTON_SUFFIX = '-Popover-Popover-PopoverShow';
export const EQUIPMENT_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX = '-Popover-Popover-PopoverShow-Options';
export const EQUIPMENT_TABLE_ROW_POPOVER_ITEM1_SUFFIX = '-Popover-Popover-Item1';

// Helper functions for Equipment table row-specific selectors
export const getEquipmentTableRowPopoverOptionsList = (rowNumber: string): string => {
  return `[data-testid="${EQUIPMENT_TABLE_ROW_PREFIX}${rowNumber}${EQUIPMENT_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX}"]`;
};

export const getEquipmentTableRowPopoverItem1 = (rowNumber: string): string => {
  return `[data-testid="${EQUIPMENT_TABLE_ROW_PREFIX}${rowNumber}${EQUIPMENT_TABLE_ROW_POPOVER_ITEM1_SUFFIX}"]`;
};

export const getEquipmentTableRowByTestId = (testId: string): string => {
  return `tr[data-testid="${testId}"]`;
};
