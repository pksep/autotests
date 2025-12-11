// Loading tasks Page
export const buttonCreateOrder = '[data-testid="IssueShipment-ActionsButtons-AddOrder"]';
export const buttonChoiceIzd = 'button[data-testid="AddOrder-AttachmentsButtons-Select"]';
export const buttonChoiceIzdTEMP = 'button[data-testid="Button"]';
export const buttonChoiceIzdTEMPU001 = 'button[data-testid="AddOrder-ModalListProduct-AddButton"]';

export const buttonChoiceBuyer = '[data-testid="AddOrder-OpenBuyersButton"]';
export const buttonAddBuyerOnModalWindow = '[data-testid="AddOrder-ModalListBuyer-ButtonsReturn-Add"]';
export const buttonSaveOrder = '[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Save"]';
export const buttonArchive = '[data-testid="IssueShipment-ActionsButtons-Archive"]';

// Calendar selectors
export const calendarTrigger = '[data-testid="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-HeaderBtn-Trigger"]';
export const calendarPopover = '[data-testid="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Popover"]';
export const calendarComponent = '[data-testid="AddOrder-DateByUrgency-Calendar-DataPicker-Component"]';

export const loadingMainTable = '.scroll-wrapper__slot';

// Modal selectors
export const modalListProduct = '[data-testid="AddOrder-ModalListProduct"]';
export const modalListProductNew = 'dialog[data-testid="AddOrder-ModalListProduct-Modal"][open]';
export const modalListBuyer = '[data-testid="AddOrder-ModalListBuyer"]';
export const searchDropdownInput = '[data-testid="Search-Dropdown-Input"]';
export const searchDropdownInputNew = '[data-testid="AddOrder-ModalListProduct-Search-Dropdown-Input"]';
export const quantityInput = '[data-testid="AddOrder-Quantity-InputNumber-Input"]';
export const editTitle = '[data-testid="AddOrder-EditTitle"]';
export const addOrderComponent = '[data-testid="AddOrder"]';
export const addOrderComponentCheckboxNew = 'input[data-testid="AddOrder-ModalListProduct-ProductCheckbox-2"]';

// IssueShipment page and table selectors
export const issueShipmentPage = '[data-testid="IssueShipment"]';
const ISSUE_SHIPMENT_TABLE_PREFIX = 'IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable';
export const SHIPMENTS_TABLE = `[data-testid="${ISSUE_SHIPMENT_TABLE_PREFIX}-Table"]`;
export const SHIPMENTS_TABLE_BODY = `[data-testid="${ISSUE_SHIPMENT_TABLE_PREFIX}-Table-Tbody"]`;
export const EDIT_SHIPMENTS_TABLE_BODY = `[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table-Tbody"]`;
export const SHIPMENTS_SEARCH_INPUT = `${ISSUE_SHIPMENT_TABLE_PREFIX}-Thead-SearchInput`;
export const SHIPMENTS_SEARCH_INPUT_SELECTOR = `[data-testid="${ISSUE_SHIPMENT_TABLE_PREFIX}-Thead-SearchInput-Dropdown-Input"]`;
export const SHIPMENTS_ORDER_NUMBER_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-NumberOrder"]`;
export const SHIPMENTS_ARTICLE_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-Article"]`;
export const SHIPMENTS_PRODUCT_NAME_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-Name"]`;
export const SHIPMENTS_PRODUCT_QUANTITY_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Product-Kol"]`;
export const SHIPMENTS_URGENCY_DATE_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-DateByUrgency"]`;
