// Actions (History) page selectors - /actions
// Used for setting filters and finding table rows

/** Container for the "Тип сущности" (entity type) filter - use to scope type filter only */
export const ACTIONS_PAGE_TYPE_FILTER = '.actions__select_type';
/** Clickable header that opens the filter dropdown (BaseFilter-Current) */
export const ACTIONS_PAGE_TYPE_FILTER_TRIGGER = '[data-testid="BaseFilter-Current"]';
/** Option class for filter dropdown options - select by text e.g. "Деталь" */
export const ACTIONS_PAGE_FILTER_OPTION = '.filter__options-option';
/** Loader shown while actions are loading */
export const ACTIONS_PAGE_LOADER = '[data-testid="Actions-Component-Loader"]';

/** Container for the "Сотрудники" (employee/user) filter - click trigger opens ModalListUser */
export const ACTIONS_PAGE_USER_FILTER = '.actions__select_user';

/** ModalListUser (employee picker) - visible after clicking user filter */
export const MODAL_LIST_USER_SECTION = '[data-testid="ModalListUser-Section"]';
/** Search input inside the user list (YSearch dropdown input) - fill and Enter to search */
export const USER_TABLE_LIST_SEARCH_INPUT_DROPDOWN = '[data-testid="UserTableList-Thead-SearchInput-Dropdown-Input"]';
/** User row in the search results table - first row after search should match */
export const USER_TABLE_LIST_ROW = '[data-testid^="UserTableList-Tbody-TableRow"]';
/** Checkbox in a user row to select the user */
export const USER_TABLE_LIST_ROW_CHECKBOX = '[data-testid="UserTableList-Tbody-CheckboxInput"]';
/** Button to add selected user(s) to the chosen list (creates ModalListUser-Table) */
export const MODAL_LIST_USER_ADD_SELECTED = '[data-testid="ModalListUser-Section-AddButton"]';
/** Table of chosen employees (after clicking Add) */
export const MODAL_LIST_USER_TABLE = '[data-testid="ModalListUser-Table"]';
/** Tbody of the chosen employees table - should contain our employee */
export const MODAL_LIST_USER_TABLE_TBODY = '[data-testid="ModalListUser-TBody"]';
/** Button to confirm selection and close modal */
export const MODAL_LIST_USER_CONFIRM = '[data-testid="ModalListUser-ActionButtons-Add"]';

/** Main actions/history table (data-testid e.g. TableAction-v-28) */
export const ACTIONS_TABLE = '[data-testid^="TableAction-"]';
/** Rows in the actions table (TableAction-*-row-*; excludes -cell- nodes) */
export const ACTIONS_TABLE_ROW = '[data-testid^="TableAction-"][data-testid*="-row-"]:not([data-testid*="-cell"])';
/** 0-based column index of the "Действие" (action description) cell in each row. Use row.locator('td').nth(this) for description-only assertions. */
export const ACTIONS_TABLE_DESCRIPTION_CELL_INDEX = 5;
