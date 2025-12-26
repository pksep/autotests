// Shipment Tasks Page
export const TABLE_SHIPMENT_TABLE = 'table[data-testid="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Table"]';
export const TABLE_SHIPMENT_TABLE_ID = 'Table';
const ISSUE_TO_PULL_TABLE_PREFIX = 'IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable';
export const ROW_NUMBER_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-Number"]`;
export const ROW_ORDER_NUMBER_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-NumberOrder"]`;
export const ROW_PRODUCT_NAME_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-Name"]`;
export const ROW_ARTICLE_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-Article"]`;
export const ROW_PRODUCT_KOL_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Product-Kol"]`;
export const ROW_PRODUCT_DATE_ORDER_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Product-DateOrder"]`;
export const ROW_PRODUCT_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Product-DateShipments"]`;
export const ROW_TBODY_DATE_BY_URGENCY_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-DateByUrgency"]`;
export const ROW_TBODY_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-DateShipments"]`;
export const ROW_TBODY_BUYERS_PATTERN = `[data-testid^="${ISSUE_TO_PULL_TABLE_PREFIX}-Tbody-Buyers"]`;
export const BUTTON_SHIP = '[data-testid="IssueToPull-Button-Ship"]';
export const SELECTOR_SHIPPING_TASKS = '[data-testid="Sclad-shippingTasks"]';
export const SELECTOR_SCLAD_SHIPPING_TASKS = '[data-testid="IssueToPull"]';
export const SHIPMENTS_SEARCH_INPUT = 'IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Thead-SearchInput-Dropdown-Input';
export const SHIPMENTS_SEARCH_INPUT_SELECTOR = '[data-testid="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Thead-SearchInput-Dropdown-Input"]';
export const SHIPMENTS_TABLE_BODY = '[data-testid="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Table-Tbody"]';
export const PRODUCT_WRAPPER = '[data-testid^="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Product-Wrapper"]';
export const MODAL_SHIPMENT_DETAILS = '[data-testid^="IssueToPull-ShipmentDetails-ModalShComlit"][data-testid$="-Content"]';

// Shipment-Table patterns
export const SHIPMENT_TBODY_NUMBER_ORDER_PATTERN = '[data-testid^="Shipment-Tbody-NumberOrder"]';
export const SHIPMENT_PRODUCT_KOL_PATTERN = '[data-testid^="Shipment-Product-Kol"]';
export const SHIPMENT_PRODUCT_NAME_PATTERN = '[data-testid^="Shipment-Product-Name"]';
