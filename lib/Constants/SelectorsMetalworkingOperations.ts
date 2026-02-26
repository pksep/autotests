// Metalworking Operations constants
export const ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT = 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Search-Dropdown-Input';

export const METALWORKING_OPERATIONS_ROW_PATTERN_START = 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row';

export const ASSEMBLY_OPERATIONS_ROW_PATTERN_ORDERED = '-Ordered';
export const METALWORKING_OPERATIONS_ROW_PATTERN_CHECKBOX_SUFFIX = '-Checkbox';

/** Full selector for row 0 ordered quantity cell (used in U002-Details). */
export const METALWORKING_ROW0_ORDERED_CELL_SELECTOR = `[data-testid^="${METALWORKING_OPERATIONS_ROW_PATTERN_START}0${ASSEMBLY_OPERATIONS_ROW_PATTERN_ORDERED}"]`;
/** Full selector for row checkbox by suffix (used in U002-Details). */
export const METALWORKING_ROW_CHECKBOX_SELECTOR = `[data-testid$="${METALWORKING_OPERATIONS_ROW_PATTERN_CHECKBOX_SUFFIX}"]`;
