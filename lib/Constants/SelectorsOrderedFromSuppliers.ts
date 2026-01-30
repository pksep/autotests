// Ordered From Suppliers Page constants
export const ORDERED_SUPPLIERS_PAGE_TABLE = '[data-testid="Sclad-orderingSuppliers"]';

export const ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON = '[data-testid="OrderSuppliers-Main-Button"]';

export const MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT = '[data-testid="OrderSuppliers-Modal-AddOrder"]';

export const SELECT_TYPE_OBJECT_OPERATION_PRODUCT = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-ProductCard"]';

export const SELECT_TYPE_OBJECT_OPERATION_DETAILS = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-DetalCard"]';

export const ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY = 'dialog[data-testid$="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply"] open';

export const ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_TBODY =
  '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Tbody"]';

export const ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0 =
  '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row0"]';

export const ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1 =
  '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row1"]';

export const MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON = '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-Button"]';

export const MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE =
  '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2"]';

export const MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL = '[data-testid="ModalShipmentsToIzed-RightMenu-Modal"]';
export const MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD = '[data-testid="ModalShipmentsToIzed-Table-Sclad"]';
export const MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER = '[data-testid="ModalShipmentsToIzed-TbodySclad-Number"]';
export const MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_COUNT_SHIPMENTS = '[data-testid="ModalShipmentsToIzed-TbodySclad-CountShipments"]';
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER = 'dialog[data-testid="ModalShipmentsToIzed-ModalWorker"]';
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE = '[data-testid="ModalShipmentsToIzed-ModalWorker-Buttons-ButtonArchive"]';
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_SELECT_ALL_CHECKBOX = '[data-testid="ModalShipmentsToIzed-ModalWorker-Content-BlockTable-Table-TableStockOrderItems-SelectAll"]';
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_STOCK_ORDER_ITEMS = '[data-testid="ModalShipmentsToIzed-ModalWorker-Content-BlockTable-Table-TableStockOrderItems-Table"]';

// Pattern selectors for checkbox and row elements
export const TABLE_ROW_CHECKBOX_SUFFIX = '[data-testid$="-TdCheckbox"]';
export const TABLE_ROW_CHECKBOX_WRAPPER_SUFFIX = '[data-testid$="-TdCheckbox-Wrapper-Checkbox"]';

// Pattern selectors for ModalShipmentsToIzed selectors
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_CHECKBOX_PREFIX =
  '[data-testid^="ModalShipmentsToIzed-ModalWorker-Content-BlockTable-Table-TableStockOrderItems-Checkbox-"]';
export const MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_DATA_NUMBER_PREFIX =
  '[data-testid^="ModalShipmentsToIzed-ModalWorker-Content-BlockTable-Table-TableStockOrderItems-TableData-Number-"]';
export const MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_STOCK_ORDER_PREFIX = '[data-testid^="ModalShipmentsToIzed-TbodySclad-StockOrder"]';
export const MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_COUNT_SHIPMENTS_PREFIX = '[data-testid^="ModalShipmentsToIzed-TbodySclad-CountShipments"]';

// Switcher selectors
export const SWITCH_ITEM_0 = '[data-testid="OrderSuppliers-Main-Content-Switch-Item0"]';
export const SWITCH_ITEM_1 = '[data-testid="OrderSuppliers-Main-Content-Switch-Item1"]';
export const SWITCH_ITEM_2 = '[data-testid="OrderSuppliers-Main-Content-Switch-Item2"]';

// ERP-969 additional constants
export const MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE = 'ModalAddOrder-Production-Table';
export const MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT_START = 'ModalAddOrder-Production-Table-TableRow-YourQuantityInput';
export const MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT = '-Input';

// Modal Select Supplier button selectors
export const MODAL_SELECT_SUPPLIER_PROVIDER_CARD = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-ProviderCard"]';
export const MODAL_SELECT_SUPPLIER_DETAL_CARD = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-DetalCard"]';
export const MODAL_SELECT_SUPPLIER_ASSEMBLE_CARD = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-AssembleCard"]';
export const MODAL_SELECT_SUPPLIER_PRODUCT_CARD = '[data-testid="OrderSuppliers-Modal-AddOrder-Content-ProductCard"]';

// Modal Create Order Supplier button selectors
export const MODAL_CREATE_ORDER_CANCEL_BUTTON = 'button[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Bottom-ButtonsCenter-Cancel"]';
export const MODAL_CREATE_ORDER_SAVE_BUTTON = 'button[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Bottom-ButtonsCenter-Save"]';
export const MODAL_CREATE_ORDER_CHOOSE_BUTTON = 'button[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-Button"]';

// ERP-969 specific selectors
export const SCLAD_ORDERING_SUPPLIERS = '[data-testid="Sclad-orderingSuppliers"]';
export const MODAL_ADD_ORDER_PRODUCTION_DIALOG = 'dialog[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply"][open]';
export const MODAL_ADD_ORDER_PRODUCTION_MODAL_TEST_ID = '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply"]';
export const MODAL_TITLE = '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Title"]';
export const TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE =
  'table[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1"]';
export const MODAL_ADD_ORDER_PRODUCTION_TABLE_SEARCH_INPUT =
  '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Search-Dropdown-Input"]';
export const MODAL_ADD_ORDER_PRODUCTION_TABLE_SEARCH_INPUT_DATA_TESTID =
  'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Search-Dropdown-Input';
export const TABLE_MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE =
  'table[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2"]';
export const ORDER_MODAL = '[data-testid="OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker"]';
export const ORDER_MODAL_DIALOG = 'dialog[data-testid^="OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker"]';
export const ORDER_MODAL_TABLE =
  '[data-testid="OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Content-BlockTable-Table-TableStockOrderItems-Table"]';
export const ORDER_MODAL_TOP_ORDER_NUMBER = '[data-testid="OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Content-Headers-LabelOrder-Span"]';

// Additional selectors
export const ORDER_SUPPLIERS_TABLE = '[data-testid="OrderSuppliers-Main-Content-TableWrapper-Table"]';
export const ORDER_SUPPLIERS_TABLE_SEARCH_INPUT = '[data-testid="OrderSuppliers-Main-Content-TableWrapper-Table-Search-Dropdown-Input"]';

// Quantity input selectors for ChoosedTable2
export const QUANTITY_INPUT_SUFFIX = '[data-testid$="-TdQuantity-InputNumber-Input"]';
export const QUANTITY_INPUT_FULL =
  '[data-testid^="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2-Row"][data-testid$="-TdQuantity-InputNumber-Input"]';

// Pattern selectors for Table1 rows (checkbox and ordered on production)
export const TABLE1_ROW_CHECKBOX_PATTERN =
  '[data-testid^="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row"][data-testid$="-TdCheckbox-Wrapper-Checkbox"]';
export const TABLE1_ROW_ORDERED_ON_PRODUCTION_PATTERN =
  '[data-testid^="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row"][data-testid$="-TdOrderedOnProduction"]';

// Modal dialog selectors
export const MODAL_CHOOSED_TABLE2_CBED = '[data-testid="OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2-Modal-Cbed"]';
export const MODAL_ADD_ORDER_SMALL = '[data-testid="OrderSuppliers-Modal-AddOrder"]';
export const MODAL_ADD_ORDER_SMALL_DIALOG_OPEN = 'dialog[data-testid="OrderSuppliers-Modal-AddOrder"][open]';

// Helper function to get selector by test ID from JSON
export const getSelectorByTestId = (testId: string): string => {
  const selectorMap: Record<string, string> = {
    // Switcher selectors
    'OrderSuppliers-Main-Content-Switch-Item0': SWITCH_ITEM_0,
    'OrderSuppliers-Main-Content-Switch-Item1': SWITCH_ITEM_1,
    'OrderSuppliers-Main-Content-Switch-Item2': SWITCH_ITEM_2,
    // Modal Select Supplier buttons
    'OrderSuppliers-Modal-AddOrder-Content-ProviderCard': MODAL_SELECT_SUPPLIER_PROVIDER_CARD,
    'OrderSuppliers-Modal-AddOrder-Content-DetalCard': MODAL_SELECT_SUPPLIER_DETAL_CARD,
    'OrderSuppliers-Modal-AddOrder-Content-AssembleCard': MODAL_SELECT_SUPPLIER_ASSEMBLE_CARD,
    'OrderSuppliers-Modal-AddOrder-Content-ProductCard': MODAL_SELECT_SUPPLIER_PRODUCT_CARD,
    // Modal Create Order Supplier buttons
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Bottom-ButtonsCenter-Cancel': MODAL_CREATE_ORDER_CANCEL_BUTTON,
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Bottom-ButtonsCenter-Save': MODAL_CREATE_ORDER_SAVE_BUTTON,
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-Button': MODAL_CREATE_ORDER_CHOOSE_BUTTON,
  };
  return selectorMap[testId] || `[data-testid="${testId}"]`;
};
