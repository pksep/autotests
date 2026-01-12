// ─────────────────────────────────────────────────────────────────────────────
// DATA-TESTID SELECTORS for ERP-969 specific patterns
// ─────────────────────────────────────────────────────────────────────────────
// These selectors were hardcoded in test files and moved to constants

export const KITTING_TABLE_MAIN_ROWS = "tbody tr[data-testid^='CompletCbed-Content-Table-Table-TableRow']:not([data-testid*='-Kit'])";

export const WAYBILL_MODAL_OPEN_PATTERN = "[data-testid='TableComplect-ModalAddWaybill'][open]";

export const SHIPMENT_DETAILS_QUANTITY_CELLS = "[data-testid^='ModalAddWaybill-ShipmentDetailsTable-Row'][data-testid$='-QuantityCell']";

export const SHIPMENT_DETAILS_ORDER_NUMBER_CELLS = "[data-testid^='ModalAddWaybill-ShipmentDetailsTable-Row'][data-testid$='-OrderNumberCell']";

export const DETAILS_TABLE_NAME_CELLS = "[data-testid^='ModalAddWaybill-DetailsTable-Row'][data-testid$='-NameCell']";

export const ORDER_MODAL_PRODUCTION_DIALOG_PATTERN = "dialog[data-testid^='ModalAddOrder-Production-Table']";

export const ORDER_MODAL_PATTERN = "dialog[data-testid^='OrderModal']";

export const KITTING_TABLE_NON_KIT_ROWS = "tbody tr:not([data-testid*='-Kit'])";

export const TABLE_COMPLECT_NAME_CELL_PATTERN = "[data-testid^='CompletCbed-Content-Table-Table-TableRow'][data-testid$='-Name']";

export const TABLE_COMPLECT_DESIGNATION_CELL_PATTERN = "[data-testid^='CompletCbed-Content-Table-Table-TableRow'][data-testid$='-Designation']";

export const SHIPMENT_DETAILS_REMAINING_QUANTITY_CELL =
  "[data-testid^='ModalAddWaybill-ShipmentDetailsTable-StockOrderRow'][data-testid$='-RemainingQuantityCell']";

export const WAYBILL_SHIPMENT_ORDER_NUMBER_CELL_PATTERN =
  "[data-testid^='ModalAddWaybill-ShipmentDetailsTable-StockOrderRow'][data-testid$='-OrderNumberCell']";

export const WAYBILL_SHIPMENT_REMAINING_QUANTITY_CELL_PATTERN =
  "[data-testid^='ModalAddWaybill-ShipmentDetailsTable-StockOrderRow'][data-testid$='-RemainingQuantityCell']";

export const WAYBILL_DETAILS_TABLE_NAME_CELL_PATTERN = "[data-testid^='ModalAddWaybill-DetailsTable-Row'][data-testid$='-NameCell']";

export const WAYBILL_DETAILS_TABLE_QUANTITY_CELL_PATTERN = "[data-testid^='ModalAddWaybill-DetailsTable-Row'][data-testid$='-QuantityCell']";

export const WAYBILL_DETAILS_TABLE_IN_KITS_CELL_PATTERN = "[data-testid^='ModalAddWaybill-DetailsTable-Row'][data-testid$='-InKitsCell']";

export const WAYBILL_DETAILS_TABLE_FREE_QUANTITY_CELL_PATTERN = "[data-testid^='ModalAddWaybill-DetailsTable-Row'][data-testid$='-FreeQuantityCell']";

// Table cell constants for ERP-969
export const TABLE_COMPLECT_TABLE_ROW_CELL = 'CompletCbed-Content-Table-Table-TableRow';
export const TABLE_COMPLECT_TABLE_ROW_CELL_NAME = '-Name';
export const TABLE_KITTING_TABLE_ROW_CELL = 'CompletCbed-Content-Table-Table-TableRow';
export const TABLE_KITTING_TABLE_ROW_CELL_ORDERED = '-Ordred'; // Note: typo in DOM - it's "Ordred" not "Ordered"
export const TABLE_KITTING_TABLE_ROW_CELL_OPERATIONS = '-Operations';
export const TABLE_KITTING_TABLE_ROW_CELL_STATUS = '-Status';
export const TABLE_KITTING_TABLE_ROW_CELL_COMPLETION_LEVEL = '-CompletionLevel';
export const TABLE_KITTING_TABLE_ROW_CELL_COMPLETION_LEVEL_NEW = '-Status-wrapper-Percent';

export const TABLE_KITTING_TABLE_ROW_CELL_DESIGNATION = '-Designation';

// Usage examples:
// const mainRows = kittingTable.locator(KITTING_TABLE_MAIN_ROWS);
// const waybillModal = kittingPage.locator(WAYBILL_MODAL_OPEN_PATTERN);
// const quantityCells = kittingPage.locator(SHIPMENT_DETAILS_QUANTITY_CELLS);
