// Loading tasks Page
export const buttonCreateOrder = '[data-testid="IssueShipment-ActionsButtons-AddOrder"]';
export const buttonChoiceIzd = 'button[data-testid="AddOrder-AttachmentsButtons-Select"]';
export const buttonChoiceIzdTEMP = 'button[data-testid="Button"]';
export const buttonChoiceIzdTEMPU001 = 'button[data-testid="AddOrder-ModalListProduct-AddButton"]';

export const buttonChoiceBuyer = '[data-testid="AddOrder-OpenBuyersButton"]';
export const buttonAddBuyerOnModalWindow = '[data-testid="AddOrder-ModalListBuyer-ButtonsReturn-Add"]';
export const buttonSaveOrder = '[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Save"]';
export const buttonCancelOrder = '[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Cancel"]';
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
export const EDIT_TITLE_TESTID = 'AddOrder-EditTitle';
export const editTitle = `[data-testid="${EDIT_TITLE_TESTID}"]`;
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
export const SHIPMENTS_TBODY_NUMBER_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-Number"]`;
export const SHIPMENTS_PRODUCT_DATE_ORDER_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Product-DateOrder"]`;
export const SHIPMENTS_PRODUCT_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Product-DateShipments"]`;
export const SHIPMENTS_TBODY_BUYERS_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-Buyers"]`;
export const SHIPMENTS_TBODY_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-Tbody-DateShipments"]`;
export const SHIPMENTS_MODAL_SHIPMENT_TBODY_NUMBER_ORDER_PATTERN = `[data-testid^="${ISSUE_SHIPMENT_TABLE_PREFIX}-ModalShipment-Tbody-NumberOrder"]`;
export const SHIPMENTS_PRODUCT_WRAPPER = `[data-testid="${ISSUE_SHIPMENT_TABLE_PREFIX}-Product-Wrapper"]`;

// AddOrder position table selectors
export const ADD_ORDER_POSITIONS_TABLE = '[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]';
export const ADD_ORDER_POSITIONS_TABLE_BODY = '[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table-Tbody"]';
export const ADD_ORDER_ATTACHMENTS_VALUE_LINK = '[data-testid="AddOrder-AttachmentsValue-Link"]';
export const ADD_ORDER_PRODUCT_WRAPPER = '[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-Wrapper"]';

// AddOrder position table pattern selectors (using ^= for dynamic IDs)
const ADD_ORDER_POSITIONS_TABLE_PREFIX = 'AddOrder-PositionInAccount-ShipmentsTable';
export const ADD_ORDER_POSITIONS_TBODY_NUMBER_ORDER_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-NumberOrder"]`;
export const ADD_ORDER_POSITIONS_TBODY_ARTICLE_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-Article"]`;
export const ADD_ORDER_POSITIONS_TBODY_NAME_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-Name"]`;
export const ADD_ORDER_POSITIONS_PRODUCT_KOL_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Product-Kol"]`;
export const ADD_ORDER_POSITIONS_PRODUCT_DATE_ORDER_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Product-DateOrder"]`;
export const ADD_ORDER_POSITIONS_PRODUCT_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Product-DateShipments"]`;
export const ADD_ORDER_POSITIONS_TBODY_BUYERS_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-Buyers"]`;
export const ADD_ORDER_POSITIONS_TBODY_DATE_BY_URGENCY_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-DateByUrgency"]`;
export const ADD_ORDER_POSITIONS_TBODY_DATE_SHIPMENTS_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-DateShipments"]`;
export const ADD_ORDER_POSITIONS_TBODY_START_COMPLETE_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-StartComplete"]`;
export const ADD_ORDER_POSITIONS_TBODY_NUMBER_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Tbody-Number"]`;
export const ADD_ORDER_POSITIONS_PRODUCT_NAME_PATTERN = `[data-testid^="${ADD_ORDER_POSITIONS_TABLE_PREFIX}-Product-Name"]`;

// AddOrder date selectors
export const ADD_ORDER_DATE_BY_URGENCY_DISPLAY = '[data-testid="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]';
export const ADD_ORDER_DATE_SHIPPING_PLAN_DISPLAY = '[data-testid="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]';
export const ADD_ORDER_DATE_ORDER_DISPLAY = '[data-testid="AddOrder-DateOrder-Calendar-DataPicker-Choose-Value-Display"]';

// AddOrder buyer selector
export const ADD_ORDER_BUYER_SELECTED_COMPANY = '[data-testid="AddOrder-Buyer-SelectedCompany"]';

// Calendar display selector (generic)
export const CALENDAR_DATA_PICKER_DISPLAY = '[data-testid="Calendar-DataPicker-Choose-Value-Display"]';

// IssueShipment action buttons
export const ISSUE_SHIPMENT_ACTIONS_BUTTONS_EDIT_ORDER = '[data-testid="IssueShipment-ActionsButtons-EditOrder"]';

// IssueShipment modal shipment selectors
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_CONTENT_INFO_COUNT =
  '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-ShipmentsHeader-ContentInfo-Count"]';
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_ONE_SHIPMENTS_DATE =
  '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-ShipmentsHeader-OneShipments-Date"]';
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_DATE_SHIPMENTS_DATE =
  '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-ShipmentsHeader-DateShipments-Date"]';
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_DATE_BY_URGENCY_WRAPPER =
  '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-ShipmentsHeader-DateByUrgency-Wrapper"]';
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_PRODUCT_NAME = '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-Product-Name"]';
export const ISSUE_SHIPMENT_MODAL_SHIPMENT_COMPANY_NAME = '[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-ModalShipment-Company-Name"]';
export const SHIPMENT_TABLE = '[data-testid="Shipment-Table"]';
