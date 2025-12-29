/**
 * @file config.ts
 * @date 2025-01-20
 * @purpose To define environment variables (ENV) and CSS selectors (SELECTORS) used throughout the test framework.
 *
 * @alterations
 * - 2025-01-20: Initial version for handling environment configuration and CSS selectors.
 * - 2025-01-20: Updated DEBUG parsing and added fallback for TIMEOUT value.
 *  Module requirements:
 *     npm install winston
 *     npm install playwright
 *     npm install winston-daily-rotate-file
 */

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:8080/',
  //API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5000/",
  API_BASE_URL: process.env.API_BASE_URL || 'http://dev.pksep.ru/',
  //HEADLESS: process.env.HEADLESS === "false" ? false : true,
  HEADLESS: process.env.HEADLESS === 'true' ? true : false,
  TIMEOUT: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 5000,
  //TEST_SUITE: 'U003',
  TEST_SUITE: 'ERP_969',
  TEST_DIR: '.',
  DEBUG: true, // Enable debug mode for login testing
};

// Login Testing Configuration - Easy access for manual testing
export const LOGIN_TEST_CONFIG = {
  // API Endpoint
  LOGIN_ENDPOINT: `${ENV.API_BASE_URL}api/auth/login`,

  // Test Credentials (you can modify these for testing)
  TEST_CREDENTIALS: {
    username: 'Джойс Р.Г.',
    password: 'O0_f2!3@34OInU',
    tabel: '105',
  },

  // Alternative credential formats to test
  ALTERNATIVE_CREDENTIALS: {
    email: 'test@example.com',
    user: 'testuser',
    login: 'testuser',
    employee_id: '12345',
    employee_number: '12345',
  },

  // Request Headers
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  // Request Body Templates
  REQUEST_TEMPLATES: {
    // Standard format
    standard: {
      username: 'testuser',
      password: 'testpass',
      tabel: '12345',
    },

    // Alternative format 1
    alternative1: {
      email: 'test@example.com',
      password: 'testpass',
      employee_id: '12345',
    },

    // Alternative format 2
    alternative2: {
      user: 'testuser',
      pass: 'testpass',
      employee_number: '12345',
    },

    // Alternative format 3
    alternative3: {
      login: 'testuser',
      pwd: 'testpass',
      tabel: '12345',
    },
  },
};

export const SELECTORS = {
  LOGIN: {
    EMPLOYEE_NUMBER_INPUT: 'select[name="tabel"]',
    LOGIN_INPUT: 'select[name="initial"]',
    PASSWORD_INPUT: 'input[name="password"]',
    LOGIN_BUTTON: 'button[type="submit"]',
    ERROR_MESSAGE: '.alert.result.alert-danger',
  },

  MAINMENU: {
    PRODUCT: {
      URL: 'product',
      TEXT_RUS: 'продукция НПО Автомотив',
      TEXT_ENG: 'Product',
      DATA_TESTID: 'create-dataid', //changed for testing
      BREADCRUMB_SELECTOR: '.breadcrumb',
    },
    RESULTS: {
      URL: 'resultwork',
      TEXT_RUS: 'Результаты работы',
      TEXT_ENG: 'Results',
      DATA_TESTID: 'menu-results',
    },
    LIBRARY: {
      URL: 'library',
      TEXT_RUS: 'Библиотека',
      TEXT_ENG: 'Library',
      DATA_TESTID: 'menu-library',
    },
    TASKS: {
      URL: 'issues',
      TEXT_RUS: 'Задачи',
      TEXT_ENG: 'Issues',
      DATA_TESTID: 'menu-tasks',
    },
    ASSEMBLY_UNITS: {
      URL: 'cbed',
      TEXT_RUS: 'База сборочных единиц',
      TEXT_ENG: 'Assembly Units',
      DATA_TESTID: 'menu-assembly-units',
    },
    PARTS_DATABASE: {
      URL: 'baseproducts',
      TEXT_RUS: 'База продукции',
      TEXT_ENG: 'Parts',
      DATA_TESTID: 'menu-parts',
    },
    MATERIALS: {
      URL: 'basematerial',
      TEXT_RUS: 'База материалов',
      TEXT_ENG: 'Materials',
      DATA_TESTID: 'menu-materials',
    },
    TOOLS: {
      URL: 'basetools',
      TEXT_RUS: 'База инструмента и оснастки',
      TEXT_ENG: 'Tools',
      DATA_TESTID: 'menu-tools',
    },
    EQUIPMENT: {
      URL: 'baseequipment',
      TEXT_RUS: 'База оборудования',
      TEXT_ENG: 'Equipment',
      DATA_TESTID: 'menu-equipment',
    },
    OPERATIONS: {
      URL: 'inventary',
      TEXT_RUS: 'База техники и инвентаря',
      TEXT_ENG: 'Inventary',
      DATA_TESTID: 'menu-operations',
    },
    SUPPLIERS: {
      URL: 'baseprovider',
      TEXT_RUS: 'База поставщиков',
      TEXT_ENG: 'Suppliers',
      DATA_TESTID: 'menu-suppliers',
    },
    BUYERS: {
      URL: 'basebuyer',
      TEXT_RUS: 'База покупателей',
      TEXT_ENG: 'Customers',
      DATA_TESTID: 'menu-buyers',
    },
    FILES: {
      URL: 'filebase',
      TEXT_RUS: 'База файлов',
      TEXT_ENG: 'Files',
      DATA_TESTID: 'menu-files',
    },
    SHIPPING_TASKS: {
      URL: 'issueshipment',
      TEXT_RUS: 'Задачи на отгрузку',
      TEXT_ENG: 'Shipping Issues',
      DATA_TESTID: 'menu-shipping-tasks',
    },
    WAREHOUSE: {
      URL: 'sclad',
      TEXT_RUS: 'Склад',
      TEXT_ENG: 'Warehouse',
      DATA_TESTID: 'MenuLeft-warehouse-read',
    },
    PRODUCTION: {
      URL: 'production',
      TEXT_RUS: 'Производство',
      TEXT_ENG: 'Production',
      DATA_TESTID: 'menu-production',
    },
    ACTIONS: {
      URL: 'actions',
      TEXT_RUS: 'Действия',
      TEXT_ENG: 'Actions',
      DATA_TESTID: 'menu-actions',
    },
    REJECT: {
      URL: 'reject',
      TEXT_RUS: 'Брак',
      TEXT_ENG: 'Reject',
      DATA_TESTID: 'menu-reject',
    },
    WASTE: {
      URL: 'waste',
      TEXT_RUS: 'Отходы',
      TEXT_ENG: 'Waste',
      DATA_TESTID: 'menu-waste',
    },
    WRITE_OFF: {
      URL: 'write-off',
      TEXT_RUS: 'Списание',
      TEXT_ENG: 'Write Off',
      DATA_TESTID: 'menu-write-off',
    },
    REPORTS: {
      URL: 'reports',
      TEXT_RUS: 'Отчеты',
      TEXT_ENG: 'Reports',
      DATA_TESTID: 'menu-reports',
    },
    COMPLAINT: {
      URL: 'complaint',
      TEXT_RUS: 'Рекламация',
      TEXT_ENG: 'Complaint',
      DATA_TESTID: 'menu-complaint',
    },
    ARCHIVE: {
      URL: 'archive',
      TEXT_RUS: 'Архив',
      TEXT_ENG: 'Archive',
      DATA_TESTID: 'menu-archive',
    },
  },
  SUBPAGES: {
    CREATEDETAIL: {
      URL: 'baseproducts/detal/add',
      TEXT_RUS: 'Создать деталь',
      TEXT_ENG: 'Create Part',
      DATA_TESTID: 'BaseProducts-Button-Create',
    },
  },
};

export const CONST = {
  // warehouse page
  WAREHOUSE_PAGE_CONTAINER: 'Sclad-mainContainer-mainContainer',
  WAREHOUSE_PAGE_DEFICIT_PRODUCTION_BUTTON: 'Sclad-deficitProduction-deficitProduction',
  WAREHOUSE_PAGE_DEFICIT_CBED_BUTTON: 'Sclad-deficitCbed-deficitCbed',
  WAREHOUSE_PAGE_DEFICIT_DETAL_BUTTON: 'Sclad-deficitDetal-deficitDetal',
  WAREHOUSE_PAGE_RESIDUALS_BUTTON: 'Sclad-residuals-residuals',
  WAREHOUSE_PAGE_REVISIONS_BUTTON: 'Sclad-revision-revision',
  WAREHOUSE_PAGE_MOVEMENT_BUTTON: 'Sclad-movement-movement',
  WAREHOUSE_PAGE_DEFICIT_MATERIAL_BUTTON: 'Sclad-deficitMaterial-deficitMaterial',
  WAREHOUSE_PAGE_RESIDUALS_MATERIAL_BUTTON: 'Sclad-residualsMaterial-residualsMaterial',
  WAREHOUSE_PAGE_ORDERING_SUPPLIERS_BUTTON: 'Sclad-orderingSuppliers',
  WAREHOUSE_PAGE_ORDERED_WAY_BUTTON: 'Sclad-orderedWay',
  WAREHOUSE_PAGE_ORDERS_SHIPPED_BUTTON: 'Sclad-ordersShipped',
  WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON: 'Sclad-stockOrderMetalworking',
  WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON: 'Sclad-stockOrderAssembly',
  WAREHOUSE_PAGE_RACKS_BUTTON: 'Sclad-racks',
  WAREHOUSE_PAGE_AVERAGE_CONSUMPTION_BUTTON: 'Sclad-averageConsumption',
  WAREHOUSE_PAGE_RECEIPTS_WAREHOUSE_FOR_SUPPLIERS_AND_PRODUCTION_BUTTON: 'Sclad-receiptsWarehouseForSuppliersAndProduction',
  WAREHOUSE_PAGE_WAREHOUSE_CONSUMPTION_BUTTON: 'Sclad-warehouseConsumption',
  WAREHOUSE_PAGE_RELOCATION_BUTTON: 'Sclad-relocation',
  WAREHOUSE_PAGE_WASTE_STORAGE_BUTTON: 'Sclad-wasteStorage',
  WAREHOUSE_PAGE_SHIPPING_TASKS_BUTTON: 'Sclad-shippingTasks',
  WAREHOUSE_PAGE_MATERIAL_DEFICIT_ON_PLAN_MO_BUTTON: 'Sclad-materialDeficitOnPlanMO',
  WAREHOUSE_PAGE_MATERIAL_DEFICIT_ON_PLAN_ASSEMBLY_BUTTON: 'Sclad-materialDeficitOnPlanAssembly',
  WAREHOUSE_PAGE_METALWORKING_EQUIPMENT_BUTTON: 'Sclad-metalworkingEquipment',
  WAREHOUSE_PAGE_CIRCLE_PROFILE_CUTTING_BUTTON: 'Sclad-circleProfileCutting',
  WAREHOUSE_PAGE_SHEET_CUTTING_BUTTON: 'Sclad-sheetCutting',
  WAREHOUSE_PAGE_METALWORKING_PACKAGE_BUTTON: 'Sclad-metalworkingPackage',
  WAREHOUSE_PAGE_ASSEMBLY_AND_PRODUCT_BUTTON: 'Sclad-assemblyAndProduct',
  WAREHOUSE_PAGE_ASSEMBLY_AND_PRODUCT_DIRECTION_FLEX_BUTTON: 'Sclad-assemblyAndProduct-directionFlex',
  WAREHOUSE_PAGE_COMPLETION_CBED_PLAN_BUTTON: 'Sclad-completionCbedPlan',
  WAREHOUSE_PAGE_COMPLETION_PRODUCT_PLAN_BUTTON: 'Sclad-completionProductPlan',
  WAREHOUSE_PAGE_COMPLETE_SETS_BUTTON: 'Sclad-completeSets',
  WAREHOUSE_PAGE_ONLINE_BOARD_LINK_BUTTON: 'Sclad-onlineBoardLink',
  WAREHOUSE_PAGE_METAL_WORKING_BUTTON: 'Sclad-metalWorking-metalWorking',

  // order metalworking page
  ORDER_METALWORKING_PAGE_CONTAINER: 'MetalloworkingSclad',
  ORDER_METALWORKING_PAGE_TABLE: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table',
  ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Search-Dropdown-Input',

  //partsDatabase Page
  BUTTON_DETAIL: 'BaseProducts-CreatLink-Cardbase-detail',
  ADD_DETAL_DESIGNATION_INPUT_INPUT: 'AddDetal-Designation-Input-Input',
  ADD_DETAL_INFORMATION_INPUT_DESIGNATION: 'AddDetal-Information-Input-Designation',
  BUTTON_OPERATION: 'EditDetal-Buttons-TechProcess',
  BUTTON_ADD_OPERATION: 'EditDetal-ModalTechProcess-Buttons-ButtonCreate',
  BUTTON_SAVE_OPERATION: 'EditDetal-ModalTechProcess-Button-Save',
  MODAL_ADD_OPERATION: 'EditDetal-ModalTechProcess-ModalAddOperation-Modal',
  BUTTON_SAVE_ADD_OPERATION: 'EditDetal-ModalTechProcess-ModalAddOperation-SaveButton',
  FILTER_TITLE: 'BaseFilter-Title',
  FILTER_SEARCH_DROPDOWN_INPUT: 'BaseFilter-Search-Dropdown-Input',
  FILTER_OPTION_FIRST: 'BaseFilter-Options-0',
  TABLE_PROCESS_ID: 'operation-table',
  DETAIL_PAGE_MODAL_TECH_PROCESS_TABLE: 'Creator-ModalTechProcess-Table',
  TABLE_PROCESS_NAME_OPERATION: 'EditDetal-ModalTechProcess-Thead-NameOperation',
  DETAIL_PAGE_MODAL_TECH_PROCESS_TABLE_PROCESS_NAME_OPERATION: 'Creator-ModalTechProcess-Thead-NameOperation',
  BUTTON: 'Button',
  TABLE_PROCESS: 'EditDetal-ModalTechProcess-Table-Wrapper',
  TABLE_PROCESS_CBED: 'BasePaginationTable-Wrapper-cbed',
  BUTTON_CBED: 'BaseProducts-CreatLink-Cardbase-of-assembly-units',
  INPUT_DESUGNTATION_IZD: 'Creator-Designation-Input-Input',
  INPUT_NAME_IZD: 'Creator-Information-Input-Input',
  BUTTON_PRODUCT: 'BaseProducts-CreatLink-Cardthe-base-of-the-tool',
  BUTTON_OPERATION_PROCESS_ASSYMBLY: 'Creator-Buttons-TechProcess',
  TABLE_PROCESS_ASSYMBLY: 'Creator-ModalTechProcess-Table-Wrapper',
  TABLE_PROCESS_ASSYMBLY_ID: 'Creator-ModalTechProcess-Thead-IdOperation',
  TABLE_PROCESS_ASSYMBLY_NAME: 'Creator-ModalTechProcess-Thead-NameOperation',
  BUTTON_PROCESS_CANCEL: 'Creator-ModalTechProcess-Button-Cancel',
  BUTTON_PROCESS_SAVE: 'Creator-ModalTechProcess-Button-Save',
  TABLE_PRODUCT: 'BasePaginationTable-Border-product',

  PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD: 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
  MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT: 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
  PARTS_PAGE_DETAL_TABLE: 'BasePaginationTable-Table-detal',
  MAIN_PAGE_СБ_TABLE: 'BasePaginationTable-Table-cbed',
  MAIN_SEARCH_COVER_INPUT: 'OrderSuppliers-Main-Content-TableWrapper-Table-Search-Dropdown-Input',
  BASE_DETAIL_CB_TABLE_SEARCH: 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
  EDIT_PARTS_PAGE_ARCHIVE_BUTTON: 'EditDetal-ButtonSaveAndCancel-ButtonsRight-Archive',
  ARCHIVE_MODAL_CONFIRM_DIALOG: 'ModalConfirm',
  ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON: 'ModalConfirm-Content-Buttons-Yes',
  ARCHIVE_MODAL_CONFIRM_DIALOG_NO_BUTTON: 'ModalConfirm-Content-Buttons-No',
  BASE_DETALS_BUTTON_CREATE: 'BaseProducts-Button-Create',
  BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS: 'BaseProducts-CreatLink-Titlebase-of-assembly-units',
  CREATOR_INFORMATION_INPUT: 'Creator-Information-Input-Input',
  EDITOR_TABLE_SPECIFICATION_CBED: 'Editor-TableSpecification-Cbed',
  CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE: 'Creator-ButtonSaveAndCancel-ButtonsCenter-Save',
  CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL: 'Creator-ButtonSaveAndCancel-ButtonsCenter-Cancel',
  ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE: 'AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save',
  EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL: 'EditDetal-ButtonSaveAndCancel-ButtonsCenter-Cancel',
  MAIN_PAGE_EDIT_BUTTON: 'BaseProducts-Button-Edit',
  EDIT_DETAIL_CANCEL_BUTTON_TEXT: 'Отменить',
  ADD_DETAL_INFORMATION_INPUT_INPUT: 'AddDetal-Information-Input-Input',
  EDIT_DETAL_INFORMATION_INPUT_INPUT: 'EditDetal-Information-Input-Input',
  EDIT_DETAL_TITLE: 'EditDetal-Title',
  CREATOR_TITLE: 'Creator-Title',
  MODAL_TITLE: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Title',
  SCLAD_REVISION_REVISION: 'Sclad-revision-revision',
  REVISION_SWITCH_ITEM2: 'Revision-Switch-Item2',
  TABLE_REVISION_PAGINATION_SEARCH_INPUT: 'TableRevisionPagination-SearchInput-Dropdown-Input',
  INPUT_NUMBER_INPUT: 'InputNumber-Input',
  TABLE_REVISION_PAGINATION_CONFIRM_DIALOG: 'TableRevisionPagination-ConfirmDialog',
  TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE: 'TableRevisionPagination-ConfirmDialog-Approve',
  //MODAL_ADD_ORDER_SUPPLIERS_ORDER_CREATION_MODAL_CONTENT: "OrderSuppliers-Modal-AddOrder",
  MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT: 'OrderSuppliers-Modal-AddOrder',
  SELECT_TYPE_OBJECT_OPERATION_ASSEMBLIES: 'OrderSuppliers-Modal-AddOrder-Content-AssembleCard',
  SELECT_TYPE_OBJECT_OPERATION_DETAILS: 'OrderSuppliers-Modal-AddOrder-Content-DetalCard',
  SELECT_TYPE_OBJECT_OPERATION_PRODUCT: 'OrderSuppliers-Modal-AddOrder-Content-ProductCard',
  SELECT_TYPE_OBJECT_OPERATION_PROVIDER: 'OrderSuppliers-Modal-AddOrder-Content-ProviderCard',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT: '-TdQuantity-InputNumber-Input',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_CHECKBOX_END: '-TdCheckbox-Wrapper-Checkbox',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_ORDERED_ON_PRODUCTION: '-TdOrderedOnProduction',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_ORDERED_ON_PRODUCTION_TITLE: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Main-Title',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_DIALOG: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_DIALOG_ORDER_NUMBER:
    'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Content-BlockTable-Table-TableStockOrderItems-TableData-Number-',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT_START:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2-Row',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Bottom-ButtonsCenter-Save',
  MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-Button',
  // Table1 (left/top) row/cell identifiers
  TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE_ROW_PREFIX: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row',
  TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE_ROW_CHECKBOX_SUFFIX: '-TdCheckbox',
  ORDER_SUPPLIERS_TABLE_ORDER_TABLE: 'OrderSuppliers-Main-Content-TableWrapper-Table',
  ORDER_MODAL: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker',
  COMPLEX_SBORKA_BY_PLAN: 'CompletCbed-Content-Table-Table-SearchInput-Dropdown-Input',
  SCLAD_ORDERING_SUPPLIERS: 'Sclad-orderingSuppliers',
  ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON: 'OrderSuppliers-Main-Button',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_OWN_QUANTITY_INPUT: 'ModalAddWaybill-WaybillDetails-OwnQuantityInput-Input',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_NAME_CELL: 'ModalAddWaybill-WaybillDetails-NameCell',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL: 'ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel',
  MODAL_ADD_WAYBILL_CONTROL_BUTTONS_COMPLETE_SET_BUTTON: 'ModalAddWaybill-ControlButtons-CompleteSetButton',
  TABLE_COMPLECT_TABLE_ROW_CELL: 'CompletCbed-Content-Table-Table-TableRow',
  TABLE_COMPLECT_TABLE_ROW_CELL_NAME: '-Name',
  TABLE_COMPLECT_TABLE_ROW_CELL_DESIGNATION: '-Designation',
  SCLAD_COMPLETION_CBED_PLAN: 'Sclad-completionCbedPlan',
  TABLE_REVISION_PAGINATION_TABLE: 'Revision-TableRevisionPagination-Detals-Table',
  MODAL_ADD_ORDER_PRODUCTION_DIALOG: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply',
  TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1',
  TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE_QUANTITY_HEADER:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2-HeadRow-ThQuantity',
  MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-ChoosedTable2',
  MODAL_ADD_ORDER_PRODUCTION_TABLE_SEARCH_INPUT:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Search-Dropdown-Input',
  ORDER_MODAL_CANCEL_BUTTON: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Buttons-ButtonCancel',
  TABLE_COMPLECT_TABLE: 'CompletCbed-Content-Table-Table',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT: 'TableComplect-ModalAddWaybill',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL: 'ModalAddWaybill-WaybillDetails-RequiredQuantityCell',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL: 'ModalAddWaybill-WaybillDetails-CollectedQuantityCell',
  ORDER_MODAL_TABLE: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Content-BlockTable-Table-TableStockOrderItems-Table',
  ORDER_MODAL_TOP_ORDER_NUMBER: 'OrderSuppliers-Main-Content-TableWrapper-Table-Modal-Worker-Content-Headers-LabelOrder-Span',
  // Constants unique to ERP-969.spec.ts
  MODAL_CONFIRM_DIALOG: 'ModalConfirm',
  MODAL_CONFIRM_DIALOG_YES_BUTTON: 'ModalConfirm-Content-Buttons-Yes',
  PARTS_PAGE_ARCHIVE_BUTTON: 'BaseProducts-Button-Archive',
  SEARCH_COVER_INPUT_2: 'TableRevisionPagination-SearchInput-Dropdown-Input',

  // OrderedFromSuppliersPage constants
  ORDERED_SUPPLIERS_PAGE_TABLE: 'Sclad-orderingSuppliers',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_TABLE: 'ModalAddOrder-ProductionTable-Table',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_SCROLL_CONTAINER: 'ModalAddOrder-ProductionTable-ScrollContainer',
  MODAL_START_PRODUCTION_MODAL_CLOSE_LEFT: 'ModalStartProduction-ModalCloseLeft',
  MODAL_START_PRODUCTION_MODAL_CONTENT: 'ModalStartProduction-ModalContent',
  // U002-specific fallbacks where generic constants differ
  U002_BUTTON_CREATE_NEW_PART: 'BaseProducts-Button-Create',
  U002_BUTTON_DETAIL: 'BaseProducts-CreatLink-Cardbase-detail',
  U002_BUTTON_CBED: 'BaseProducts-CreatLink-Cardbase-of-assembly-units',
  U002_BUTTON_PRODUCT: 'BaseProducts-CreatLink-Cardthe-base-of-the-tool',
  U002_CREATOR_BUTTONS_TECHPROCESS: 'Creator-Buttons-TechProcess',
  U002_CREATOR_SAVE_BUTTON: 'Creator-ButtonSaveAndCancel-ButtonsCenter-Save',
  U002_CREATOR_CANCEL_BUTTON: 'Creator-ButtonSaveAndCancel-ButtonsCenter-Cancel',
  U002_CREATOR_TECHPROCESS_TABLE_WRAPPER: 'Creator-ModalTechProcess-Table-Wrapper',
  U002_MODAL_OPERATION_TABLE_METAL: 'ModalOperationPathMetaloworking-OperationTable',
  U002_ASSEMBLY_TABLE: 'AssemblySclad-Table',
  U002_MODAL_ADD_ORDER_PRODUCTION_ORDER_BUTTON: 'ModalAddOrder-ProductionTable-OrderButton',
  U002_MODAL_PROMPT_MINI_BUTTON_CONFIRM: 'ModalPromptMini-Button-Confirm',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_SELECT_COLUMN: 'ModalAddOrder-ProductionTable-SelectColumn',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_ORDERED_ON_PRODUCTION_COLUMN:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-HeadRow-ShipmentFromCompany',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_YOUR_QUANTITY_COLUMN: 'ModalAddOrder-ProductionTable-YourQuantityColumn',
  ORDERED_SUPPLIERS_PAGE_MODAL_START_PRODUCTION_COMPLECTATION_TABLE: 'ModalStartProduction-ComplectationTable',
  ORDERED_SUPPLIERS_PAGE_MODAL_START_PRODUCTION_COMPLECTATION_TABLE_HEADER_MY_QUANTITY: 'ModalStartProduction-ComplectationTableHeader-MyQuantity',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_MODALS_MODAL_START_PRODUCTION_TRUE_MODAL_CONTENT: 'ModalAddOrder-Modals-ModalStartProductiontrue-ModalContent',
  ORDERED_SUPPLIERS_PAGE_MODAL_START_PRODUCTION_COMPLECTATION_TABLE_CANCEL_BUTTON: 'ModalStartProduction-ComplectationTable-CancelButton',
  ORDERED_SUPPLIERS_PAGE_MODAL_START_PRODUCTION_COMPLECTATION_TABLE_ORDER_BUTTON: 'ModalStartProduction-ComplectationTable-InProduction',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON: 'ModalAddOrder-ProductionTable-OrderButton',
  ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_TABLE_CANCEL_BUTTON: 'ModalAddOrder-ProductionTable-CancelButton',
  ORDERED_SUPPLIERS_PAGE_ORDER_SUPPLIERS_SCROLL_TABLE_TABLE_CONTAINER: 'OrderSuppliers-ScrollTable-TableContainer',
  ORDERED_SUPPLIERS_PAGE_ORDER_SUPPLIERS_LINK_IMAGE: 'OrderSuppliers-LinkImage',
  ORDERED_SUPPLIERS_PAGE_ORDER_SUPPLIERS_LINK_IMAGE_NO_CONTENT: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row0-Image-Image-NoContent',
  ORDER_EDIT_MODAL_TITLE_TEXT: 'Заказ (редактирование)',
  SUCCESS_NOTIFICATION_TITLE: 'Успешно',
  ORDER_NUMBER_PREFIX: 'Заказ №',
  ORDER_SENT_TO_PRODUCTION_TEXT: 'отправлен в производство',
  CREATE_ORDER_BUTTON_TEXT: ' Создать заказ ',
  ORDERED_SUPPLIERS_PAGE_MODAL_START_PRODUCTION_ORDER_DATE_VALUE: 'ModalStartProduction-OrderDateValue',
  ORDERER_SUPPLIERS_MAIN_CONTAINER: 'OrderSuppliers',
  ORDERED_SUPPLIERS_PAGE_ORDER_SUPPLIERS_TABLE_ROW_POPOVER: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row',
  ORDERED_SUPPLIERS_PAGE_ORDER_SUPPLIERS_TABLE_ROW_POPOVER_BUTTON: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row',
  ORDERER_SUPPLIERS_PAGE_ORDER_SUPPLIERS_TABLE_ROW_CONTEXT_CELL: '-Popover',
  ORDERED_SUPPLIERS_PAGE_MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD: 'ModalShipmentsToIzed-Table-Sclad',

  COMPLETING_CBE_TITLE_ASSEMBLY_KITTING_ON_PLAN: 'CompletCbed-Title',
  SPECIFICATION_BUTTONS_ADDING_SPECIFICATION: 'Specification-Buttons-addingSpecification',
  SPECIFICATION_DIALOG_CARD_BASE_DETAIL_1: 'Specification-Dialog-CardbaseDetail1',
  SPECIFICATION_MODAL_BASE_DETAL_SELECT_BUTTON: 'Specification-ModalBaseDetal-Select-Button',
  SPECIFICATION_MODAL_BASE_DETAL_ADD_BUTTON: 'Specification-ModalBaseDetal-Add-Button',
  MODAL_PROMPT_MINI_BUTTON_CONFIRM: 'ModalPromptMini-Button-Confirm',
  OSTATTKPCBD_DETAIL_TABLE: 'OstatkPCBD-Detal-Table',
  MODAL_START_PRODUCTION_ORDER_NUMBER_VALUE: 'ModalStartProduction-OrderNumberValue',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_HEADING: 'ModalAddWaybill-WaybillDetails-Heading',
  MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT_INNER: 'ModalAddWaybill-WaybillDetails-Right',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_TABLE: 'ModalAddWaybill-ShipmentDetailsTable-Table',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_SCLAD_SET_CHECKBOX_CELL: 'ModalAddWaybill-ShipmentDetailsTable-ScladSetCheckboxCell',
  TABLE_COMPLECT_TABLE_ROW_CELL_ORDERED: '-Ordred',
  TABLE_COMPLECT_TABLE_ROW_CELL_OPERATIONS: '-Operations',
  TABLE_COMPLECT_TABLE_ROW_CELL_STATUS: '-Status',
  TABLE_COMPLECT_TABLE_ROW_CELL_COMPLETION_LEVEL: '-Readness',
  TABLE_COMPLECT_TABLE_ROW_CELL_COMPLETED: '-Complited',
  TABLE_COMPLECT_TABLE_ROW_CELL_REMAINING: '-Left',
  NOTIFICATION_NOTIFICATION_DESCRIPTION: 'Notification-Notification-Description',
  MINI_NAVIGATION_POS_DATA2: 'Revision-Switch-Item2',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW: 'ModalAddWaybill-DetailsTable-Row',
  QUANTITY_PER_UNIT_CELL: 'QuantityPerUnitCell',
  MATERIAL_CELL: 'MaterialCell',
  NEED_CELL: 'NeedCell',
  FREE_QUANTITY_CELL: 'FreeQuantityCell',
  QUANTITY_CELL: 'QuantityCell',
  IN_KITS_CELL: 'InKitsCell',
  DEFICIT_CELL: 'DeficitCell',
  OSTATTKPCBD_TABLE_SEARCH_INPUT: 'OstatkiPCBDTable-SearchInput-Dropdown-Input',
  TABLE_REVISION_PAGINATION_EDIT_PEN: 'InputNumber-Input',
  // Test Data
  SEARCH_TEXT: 'NonExistentDetail',
  NEW_DETAIL_A: '0T5.21', // For type Д (the main detail)
  NEW_SB_A: '0T5.11', // For the new СБ detail
  DETAIL_1_NAME: 'ERP9692_DETAIL_001',
  DETAIL_2_NAME: 'ERP9692_DETAIL_002',
  ASSEMBLY_NAME: 'ERP9692_ASSEMBLY_001',
  DETAIL_NEW_QUANTITY: '9',
  NEW_ORDER_QUANTITY: '3',

  // Constants unique to ERP-969-2.spec.ts
  SEARCH_COVER_INPUT: 'Search-Cover-Input',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_SCLAD_SET_SELECTED_CHECKBOX: 'ModalAddWaybill-ShipmentDetailsTable-ScladSetSelectedCheckbox',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL_PREFIX: 'ModalAddWaybill-ShipmentDetailsTable-StockOrderRow',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL_SUFFIX: '-OrderNumberCell',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_REMAINING_QUANTITY_CELL_SUFFIX: '-RemainingQuantityCell',
  MODAL_ADD_WAYBILL_CONTROL_BUTTONS_ACTUALIZE_BUTTON: 'ModalAddWaybill-ControlButtons-ActualizeButton',
  MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_TOTAL_LEFT_TO_DO_LABEL: 'ModalAddWaybill-ShipmentDetailsTable-TotalLeftToDoLabel',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_TABLE: 'ModalAddWaybill-DetailsTable-Table',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_PREFIX: 'ModalAddWaybill-DetailsTable-Row',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_SUFFIX: '-NameCell',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_QUANTITY_CELL_SUFFIX: '-QuantityCell',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_IN_KITS_CELL_SUFFIX: '-InKitsCell',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_FREE_QUANTITY_CELL_SUFFIX: '-FreeQuantityCell',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_SCLAD_NEED_CELL_SUFFIX: '-ScladNeedCell',
  MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NEED_CELL_SUFFIX: '-NeedCell',
  TABLE_COMPLECT_TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_PREFIX: 'TableComplect-ModalAddWaybill',
  TABLE_COMPLECT_TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_SUFFIX: '-CircleProgress-Wrapper',
  OSTATK_PCBD_MODAL_DETAL_PREFIX: 'OstatkPCBD-ModalDetal',
  OSTATK_PCBD_MODAL_DETAL_INFORMATION_NAME_NAME_SUFFIX: '-InformationName-Name',
  OSTATK_PCBD_MODAL_DETAL_BUTTONS_SHOW_FULL_INFORMATION_BUTTON_SUFFIX: '-Buttons-ShowFullInformationButton',

  // Constants for U004 files
  //MAIN_PAGE_TITLE_ID: "BaseProducts-Header-Title",
  MAIN_PAGE_TITLE_ID: 'BaseProducts-Container-MainContainer-Title',
  MAIN_PAGE_MAIN_DIV: 'BaseProducts-Container-MainContainer',
  MAIN_PAGE_ИЗДЕЛИЕ_TABLE: 'BasePaginationTable-Table-product',
  MAIN_PAGE_Д_TABLE: 'BasePaginationTable-Table-detal',
  MAIN_PAGE_SMALL_DIALOG: 'Specification-DialogSpecification',
  MAIN_PAGE_SMALL_DIALOG_Д: 'Specification-Dialog-CardbaseDetail1',
  MAIN_PAGE_SMALL_DIALOG_СБ: 'Specification-Dialog-CardbaseOfAssemblyUnits0',
  MAIN_PAGE_SMALL_DIALOG_РМ: 'Specification-Dialog-CardtheDatabaseOfMaterials3',
  MAIN_PAGE_SMALL_DIALOG_ПД: 'Specification-Dialog-CardtheDatabaseOfMaterials2',
  RESET_СБ_1: 'Опора (Траверса Т10А)СБ',
  RESET_СБ_2: 'Балка траверсы СБ',
  RESET_СБ_3: 'Упор подвижный (Траверса Т10А)СБ',
  RESET_Д_1: 'Опора штока d45мм',
  RESET_ПД_1: 'Гайка шестигранная DIN934 М12',
  RESET_ПД_2: 'Болт с полной резьбой DIN933 М8х40',
  MAIN_PAGE_SAVE_BUTTON: 'Creator-ButtonSaveAndCancel-ButtonsCenter-Save',
  EDIT_PAGE_MAIN_ID: 'Creator',
  EDIT_PAGE_SPECIFICATIONS_TABLE: 'Editor-TableSpecification-Product',
  EDIT_PAGE_ADD_BUTTON: 'Specification-Buttons-addingSpecification',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG: 'Specification-ModalBaseCbed',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON: 'Specification-ModalBaseCbed-Select-Button',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON: 'Specification-ModalBaseCbed-Add-Button',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON: 'Specification-ModalBaseCbed-Cancel-Button',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE: 'Specification-ModalBaseCbed-Table',
  EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_NAME_CELL: 'Specification-ModalBaseCbed-Tbody-Name',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG: 'Specification-ModalBaseDetal',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON: 'Specification-ModalBaseDetal-Select-Button',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON: 'Specification-ModalBaseDetal-Add-Button',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON: 'Specification-ModalBaseDetal-Cancel-Button',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE: 'BasePaginationTable-Table-detal',
  EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE: 'Specification-ModalBaseDetal-Table',
  EDIT_PAGE_ADD_ПД_RIGHT_DIALOG: 'ModalBaseMaterial',
  EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE: 'ModalBaseMaterial-TableList-Table-Item',
  EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE: 'ModalBaseMaterial-Table',
  EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON: 'ModalBaseMaterial-Select-Button',
  EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON: 'ModalBaseMaterial-Add-Button',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG: 'ModalBaseMaterial',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE: 'ModalBaseMaterial-TableList-Table-Item',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE: 'ModalBaseMaterial-Table',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON: 'ModalBaseMaterial-Select-Button',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON: 'ModalBaseMaterial-Add-Button',
  EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON: 'ModalBaseMaterial-Cancel-Button',
  CREATE_DETAIL_PAGE_SPECIFICATION_ADD_BUTTON: 'Specification-Buttons-addingSpecification',
  CREATE_DETAIL_PAGE_SPECIFICATION_ADDFILEFROMBASE_BUTTON: 'AddDetal-FileComponent-AddFileButton',
  CREATE_DETAIL_PAGE_SPECIFICATION_ADDFILEDRAGNDROP_BUTTON: 'AddDetal-FileComponent-DragAndDrop-Wrapper',
  CREATE_DETAIL_PAGE_DETAIL_CHARACTERISTICS_TABLE: 'AddDetal-Characteristic-Table',
  CREATE_DETAIL_PAGE_WORKPIECE_CHARACTERISTICS_TABLE: '',
  CREATE_DETAIL_PAGE_DETAIL_PARAMETERS_TABLE: 'AddDetal-Detail-Parameters',
  CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ТИП_TABLE: 'ModalBaseMaterial-TableList-Table-Type-Table',
  CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ПОДТИП_TABLE: 'ModalBaseMaterial-TableList-Table-SubType-Table',
  CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ITEM_TABLE: 'ModalBaseMaterial-TableList-Table-Item-Table',
  TEST_PRODUCT: 'Т15',
  TESTCASE_2_PRODUCT_1: 'Т15',
  EDIT_BUTTON: 'BaseProducts-Button-Edit',
  TEST_PRODUCT_СБ: 'Опора (Траверса Т10А)СБ',
  // Test Case 2 Product Constants (for U004-2.spec.ts) - FIXED LOCATION
  TESTCASE_2_PRODUCT_СБ: 'СБ Маслобака 2 Литра',
  TESTCASE_2_PRODUCT_Д: 'Опора штока d45мм',
  TESTCASE_2_PRODUCT_ПД: '22" (21,5) Сенсорный инфракрасный экран с антивандальным стеклом, мультитач, 4 касания, S-серия',
  TESTCASE_2_PRODUCT_РМ: 'Рулон бумажных полотенец',
  TESTCASE_2_PRODUCT_ASSIGNEMENT: 'TESTTESTTEST',

  // Constants for U005 files
  LEFT_DATA_TABLE: 'BasePaginationTable-Table-product',
  TEST_DETAIL_NAME: 'U005_test2_DETAILName',
  TEST_CATEGORY: '3D печать',
  TEST_MATERIAL: '09Г2С (Сталь)',
  TEST_NAME: 'Круг Сталь 09Г2С Ø100мм',
  TEST_FILE: '87.02-05.01.00СБ Маслобак (ДГП15)СБ.jpg',
  MAIN_PAGE_CREATE_BUTTON: 'BaseProducts-Button-Create',
  MAIN_PAGE_CREATE_DETAIL_LINK: 'BaseProducts-CreateLink-base-detail',
  ADD_DETAIL_INFORMATION_INPUT: 'AddDetal-Information-Input-Input',
  ADD_DETAIL_CHARACTERISTIC_BLANKS: 'AddDetal-CharacteristicBlanks',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY: 'AddDetal-CharacteristicBlanks-Tbody',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_SET: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Set',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_RESET: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Reset',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_TITLE: 'AddDetal-CharacteristicBlanks-Title',
  ADD_DETAIL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE: 'AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save',
  MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH: 'ModalBaseMaterial-TableList-Switch',
  MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1: 'ModalBaseMaterial-TableList-Switch-Item1',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_TYPE: 'ModalBaseMaterial-TableList-Table-Type',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_TYPE_SEARCH_INPUT_DROPDOWN_INPUT: 'ModalBaseMaterial-TableList-Table-Type-SearchInput-Dropdown-Input',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_SUB_TYPE: 'ModalBaseMaterial-TableList-Table-SubType',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_SUB_TYPE_SEARCH_INPUT_DROPDOWN_INPUT: 'ModalBaseMaterial-TableList-Table-SubType-SearchInput-Dropdown-Input',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM: 'ModalBaseMaterial-TableList-Table-Item',
  MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT: 'ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input',
  MODAL_BASE_MATERIAL_ADD_BUTTON: 'ModalBaseMaterial-Add-Button',
  ADD_DETAIL_FILE_COMPONENT_ADD_FILE_BUTTON: 'AddDetal-FileComponent-AddFileButton',
  ADD_DETAIL_FILE_COMPONENT: 'AddDetal-FileComponent',
  ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE: 'AddDetal-FileComponent-DocumentTable-Table',
  ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_BUTTON_PRINT: 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint',
  ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_DELETE_DOC: 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES: 'AddDetal-FileComponent-ModalBaseFiles',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_SWITCH_ITEM0: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Switch-Item0',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Table-Table',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_SEARCH_DROPDOWN_INPUT: 'Search-Dropdown-Input',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable-Table',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE_TBODY: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Table-Table-Tbody',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_ADD_BUTTON: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-AddButton',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_TABLE: 'AddDetal-FileComponent-ModalBaseFiles-Table',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FOOTER_BUTTONS_ADD_BUTTON: 'AddDetal-FileComponent-ModalBaseFiles-FooterButtons-AddButton',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_DROPDOWN: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Dropdown',
  ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE_THEAD: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Table-Table-Thead',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_SECTION: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_LOADER: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Loader',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-File',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_TEXTAREA_DESCRIPTION_TEXTAREA:
    'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Textarea-Description-Textarea',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_CHECKBOX_MAIN: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Checkbox-Main',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_INPUT_NUMBER_VERSION_INPUT:
    'AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputNumber-Version-Input',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_INPUT_FILE_NAME_INPUT: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Input-FileName-Input',
  ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_BUTTON_UPLOAD: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Button-Upload',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_BAN_DIALOG: 'ModalConfirm',

  // Constants for U006 files
  ADD_DETAIL_PAGE: 'AddDetal',
  ADD_DETAL_TITLE: 'AddDetal-Title',
  SWITCH_MATERIAL_ITEM_2: 'ModalBaseMaterial-TableList-Switch-Item2',
  DETAIL_NAME_INPUT_EDIT: 'EditDetal-Information-Input-Input',
  EDIT_CHARACTERISTIC_BLANKS_CONTAINER: 'EditDetal-CharacteristicBlanks',
  CHARACTERISTIC_BLANKS_MATERIAL_BUTTON: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Set',
  CHARACTERISTIC_BLANKS_MATERIAL_RESET_BUTTON: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Reset',
  EDIT_SAVE_BUTTON: 'EditDetal-ButtonSaveAndCancel-ButtonsCenter-Save',
  MATERIAL_MODAL: 'ModalBaseMaterial',
  MATERIAL_TABLE: 'ModalBaseMaterial-TableList-Table-Item',
  MATERIAL_SEARCH_INPUT: 'ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input',
  MATERIAL_ADD_BUTTON: 'ModalBaseMaterial-Add-Button',
  MATERIAL_SWITCH_ITEM1: 'ModalBaseMaterial-TableList-Switch-Item1',
  MATERIAL_CANCEL_BUTTON: 'ModalBaseMaterial-Cancel-Button',
  FILE_COMPONENT: 'AddDetal-FileComponent',
  FILE_ADD_BUTTON: 'AddDetal-FileComponent-AddFileButton',
  FILE_DRAG_DROP_MODAL: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal',
  FILE_DRAG_DROP_SECTION: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section',
  FILE_DRAG_DROP_FILE: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-File',
  FILE_DESCRIPTION_TEXTAREA: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Textarea-Description-Textarea',
  FILE_MAIN_CHECKBOX: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Checkbox-Main',
  FILE_VERSION_INPUT: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputNumber-Version-Input',
  FILE_NAME_INPUT: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Input-FileName-Input',
  FILE_UPLOAD_BUTTON: 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Button-Upload',
  FILE_BASE_MODAL: 'AddDetal-FileComponent-ModalBaseFiles',
  FILE_BASE_SWITCH_ITEM0: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-Switch-Item0',
  FILE_BASE_TABLE: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable',
  FILE_BASE_SEARCH_INPUT: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable-Search-Dropdown-Input',
  FILE_BASE_TABLE_INNER: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable-Table',
  FILE_BASE_ADD_BUTTON: 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-AddButton',
  FILE_BASE_BOTTOM_TABLE: 'AddDetal-FileComponent-ModalBaseFiles-Table',
  FILE_BASE_FOOTER_ADD_BUTTON: 'AddDetal-FileComponent-ModalBaseFiles-FooterButtons-AddButton',
  DOCUMENT_TABLE: 'AddDetal-FileComponent-DocumentTable',
  DOCUMENT_TABLE_ROW: 'AddDetal-FileComponent-DocumentTable-Tbody-TableRow',
  DOCUMENT_TABLE_CHECKBOX: 'AddDetal-FileComponent-DocumentTable-Checkbox',
  DOCUMENT_TABLE_PRINT_BUTTON: 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint',
  DOCUMENT_TABLE_DELETE_BUTTON: 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc',
  DOCUMENT_TABLE_NAME_CELL: 'AddDetal-FileComponent-DocumentTable-Tbody-Name',
  DOCUMENT_TABLE_SELECTOR: 'AddDetal-FileComponent-DocumentTable-Table',
  SPECIAL_CHAR_NAME: 'Деталь@#!$%^&*()_+',
  TEST_MATERIAL_NAME: 'Шестигранник Сталь 40х S22',
  TEST_MATERIAL_NAME_2: 'Войлок акустический 10мм',
  TEST_MATERIAL_NAME_2_ATTRIBUTE_COUNT: 3,
  CHR_TABLE: 'AddDetal-CharacteristicBlanks-Table',
  EDIT_CHR_TABLE: 'EditDetal-CharacteristicBlanks-Table',
  ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN: 'AddDetal-CharacteristicBlanks-Tbody-InputNumber',
  CHARACTERISTIC_BLANKS_INPUT_SUFFIX: '-Input',
  EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN: 'EditDetal-CharacteristicBlanks-Tbody-InputNumber',
  MATERIAL_REMOVE_BUTTON: 'EditDetal-CharacteristicBlanks-SelectedMaterialName-Reset',
  ADD_DETAILE_RESET_MATERIAL_BUTTON: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Reset',
  DETAIL_MATERIAL_ADD_BUTTON: 'AddDetal-CharacteristicBlanks-SelectedMaterialName-Set',
  DETAIL_TABLE: 'BasePaginationTable-Table-detal',
  TABLE_SEARCH_INPUT: 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
  DETAIL_NAME_INPUT: 'AddDetal-Information-Input-Input',
  CHARACTERISTIC_BLANKS_CONTAINER: 'AddDetal-CharacteristicBlanks',
  CHARACTERISTIC_BLANKS_TITLE: 'AddDetal-CharacteristicBlanks-Title',
  SAVE_BUTTON: 'AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save',
  ARCHIVE_BUTTON: 'BaseProducts-Button-Archive',
  CONFIRM_MODAL: 'ModalConfirm',
  CONFIRM_YES_BUTTON: 'ModalConfirm-Content-Buttons-Yes',
  SEARCH_DROPDOWN_INPUT: 'Search-Dropdown-Input',
  ARCHIVE_BUTTON_GENERIC: 'Button',
  MODAL_CONFIRM_GENERIC: 'ModalConfirm',
  MODAL_CONFIRM_YES_BUTTON_GENERIC: 'ModalConfirm-Content-Buttons-Yes',
  ADD_DETAIL_BUTTONS_TECH_PROCESS: 'AddDetal-Buttons-TechProcess',
  ADD_DETAIL_BUTTONS_COST_PRICE: 'AddDetal-Buttons-CostPrice',
  ADD_DETAIL_BUTTONS_ACCESSORY: 'AddDetal-Buttons-Accessory',
  ADD_DETAIL_BUTTONS_CHANGE_HISTORY: 'AddDetal-Buttons-ChangeHistory',
  // U005 Button Constants
  BASE_DETALS_BUTTON_EDIT: 'BaseProducts-Button-Edit',
  BASE_DETALS_BUTTON_CREATE_COPY: 'BaseProducts-Button-CreateCopy',
  BASE_DETALS_BUTTON_ARCHIVE: 'BaseProducts-Button-Archive',
  BASE_DETALS_FILTER_COMPONENT_SORT_BY_ATTENTION: 'BaseProducts-Filter-Component-SortByAttention',
  BASE_DETALS_FILTER_COMPONENT_SORT_BY_DATE: 'BaseProducts-Filter-Component-SortByDate',

  //Metalworking warehouse page
  // MetalWorkingWarhouse
  SELECTOR_METAL_WORKING_WARHOUSE: 'Sclad-stockOrderMetalworking',
  TABLE_METAL_WORKING_WARHOUSE: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table',

  //TABLE_METAL_WORKING_WAREHOUSE_ID: "MetalloworkingSclad-Content-WithFilters-TableWrapper-Table",
  TABLE_METAL_WORKING_ORDERED: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-HeadRow-Ordered',
  TABLE_METAL_WORKING_OPERATION: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-HeadRow-Operations',
  METALLOWORKINGSCLAD_DETAILS_TABLE: 'MetalloworkingSclad-DetailsTable',
  TABLE_METAL_WORKING_ORDERED_DETAILS: 'MetalloworkingSclad-DetailsTableHeader-OrderedColumn',
  TABLE_METAL_WORKING_OPERATION_DETAILS: 'MetalloworkingSclad-DetailsTableHeader-OperationsColumn',
  TABLE_METAL_WORKING_CHECKBOX: 'MetalloworkingSclad-DetailsTableHeader-SelectColumn',
  BUTTON_MOVE_TO_ARCHIVE: 'MetalloworkingSclad-PrintControls-ArchiveButton',
  BUTTON_MOVE_TO_ARCHIVE_NEW: 'MetalloworkingSclad-Content-WithFilters-Buttons-ArchiveButton',
  TABLE_METAL_WORKING_URGENCY: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-HeadRow-DateByUrgency',

  // Operations row pattern constants
  METALWORKING_OPERATIONS_ROW_PATTERN_START: 'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row',
  METALWORKING_OPERATIONS_ROW_PATTERN_END: '-Operations',
  ASSEMBLY_OPERATIONS_ROW_PATTERN_START: 'AssemblySclad-Table-Row',
  ASSEMBLY_OPERATIONS_ROW_PATTERN_END: '-Operations',
  ASSEMBLY_OPERATIONS_ROW_PATTERN_ORDERED: '-Ordered',
  ASSEMBLY_SCLAD_TABLE_BODY_TD_OPERATION: 'AssemblySclad-TableBody-TdOperation',
  ASSEMBLY_SCLAD_TABLE_BODY_TR: 'AssemblySclad-TableBody-Tr',
  DATA_CELL: 'AssemblySclad-TableHead-TableTd',

  ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO: 'AssemblySclad-TableBody-TdKolvo',
  ASSEMBLY_SCLAD_TABLE_BODY_TD_NAME: 'AssemblySclad-TableBody-TdName',
  ASSEMBLY_SCLAD_TABLE_BODY_TR_OPERATIONS_CELL: 'AssemblySclad-TableBodyTrTd9Paragraph',
  OPERATION_TABLE_ID: 'OperationPathInfo-Table',
  OPERATION_TABLE_REMAINS_TO_DO: 'OperationPathInfo-Thead-RemainsToDo',
  OPERATION_TABLE: 'ModalOperationPathMetaloworking-OperationTable',
  OPERATION_TABLE_NAME_FIRST_OPERATION: 'OperationPathInfo-Thead-Operation',
  OPERATION_PATH_INFO_TBODY_FULL_NAME: 'OperationPathInfo-Tbody-FullName',

  // order from suppliers page
  ORDER_FROM_SUPPLIERS_MODAL: 'OrderSuppliers-Modal-AddOrder-ModalAddProviderOrderSupply',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply',
  ORDER_FROM_SUPPLIERS_PAGE_CONTENT_MODAL_RIGHT_MENU: 'OrderSuppliers-Modal-AddOrder-Content-ModalRightMenu',
  ORDER_FROM_SUPPLIERS_TYPE_COMING_DISPLAY: 'ModalAddOrder-SupplierOrderDetails-TypeComingDisplay',
  ORDER_FROM_SUPPLIERS_SUPPLIER_LABEL: 'ModalAddOrder-SupplierOrderDetails-SupplierLabel',
  TABLEMODALWINDOW: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1',
  TABLEMODALWINDOWCHECKBOX: 'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-HeadRow-ThCheckbox',

  // Order from suppliers modal (Table1 row-specific elements)
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_TBODY:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Tbody',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row0',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0_TD_CHECKBOX:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row0-TdCheckbox',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0_TD_CHECKBOX_INPUT:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row0-TdCheckbox-Wrapper-Checkbox',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row1',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1_TD_CHECKBOX:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row1-TdCheckbox',
  ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1_TD_CHECKBOX_INPUT:
    'OrderSuppliers-Modal-AddOrder-ModalAddStockOrderSupply-Main-Content-Block-TableWrapper-Table1-Row1-TdCheckbox-Wrapper-Checkbox',

  //Заказ склада на Сборку page
  ZAKAZ_SCLAD_STOCK_ORDER_ASSEMBLY_BUTTON: 'Sclad-stockOrderAssembly',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT: '${props.dataTestid}-TableHead-Search-Dropdown-Input',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID: 'tablebody',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE: 'AssemblySclad-ScrollTable',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_CHECKBOX: 'AssemblySclad-Table-Checkbox',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_ORDERED: 'AssemblySclad-TableHead-Ordered',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_OPERATION: 'AssemblySclad-Table-Operations',
  ZAKAZ_SCLAD_BUTTON_MOVE_TO_ARCHIVE_ASSEMBLY: 'AssemblySclad-PrintControls-ArchiveButton',
  ZAKAZ_SCLAD_BUTTON_ARCHIVE_ASSEMBLY: 'AssemblySclad-Button-Archive',
  ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY: 'ModalOperationPath-OperationTable',
  ZAKAZ_SCLAD_TABLE_ASSEMBLY_CHECKBOX_CBEED: 'DeficitCbed-TableData-Checkbox',
  // Modal Confirmation Window
  ZAKAZ_SCLAD_MODAL_CONFIRMATION_BUTTON: 'ModalPromptMini-Button-Confirm',
  ASSEMBLY_SCLAD_BAN_MODAL: 'AssemblySclad-BanModal',
  ASSEMBLY_SCLAD_BAN_MODAL_YES_BUTTON: 'AssemblySclad-BanModal-Content-Buttons-Yes',
  // Direct cell access constants
  OPERATION_TABLE_MAKE_SH_CELL: 'OperationPathInfo-Tbody-MakeSh',

  // Metalworking warehouse checkbox pattern constants
  METALWORKING_CHECKBOX_ROW_PATTERN_START: 'Metalloworking-Content-WithFilters-Table-Table-Row',
  METALWORKING_CHECKBOX_ROW_PATTERN_END: '-Checkbox-Wrapper-Checkbox',
  METALWORKING_CHECKBOX_ROW_PATTERN_END_CHECKBOX: '-Checkbox',

  // CheckTableTotals Test Constants
  SWITCH_ITEM0: 'Switch-Item0',
  SWITCH_ITEM1: 'Switch-Item1',
  CARD: 'Card',
  TABLE: 'Table',
  TABLE_SBORKA: 'TableOperationBody-TableOperation-TableOperation',

  // Button Text Constants
  BUTTON_TEXT_YES: 'Да',
  BUTTON_TEXT_NO: 'Нет',
  BUTTON_TEXT_SAVE: 'Сохранить',
  BUTTON_TEXT_CANCEL: 'Отмена',
  BUTTON_TEXT_ADD: 'Добавить',
  BUTTON_TEXT_SELECT: 'Выбрать',
  BUTTON_TEXT_CREATE: 'Создать',
  BUTTON_TEXT_DETAIL: 'Деталь',
  BUTTON_TEXT_ASSEMBLY_UNIT: 'Сборочную единицу',
  BUTTON_TEXT_TECHNOLOGICAL_PROCESS: 'Технологический процесс',
  BUTTON_TEXT_ADD_OPERATION: 'Добавить операцию',
  BUTTON_TEXT_PRODUCT: 'Изделие',
  BUTTON_TEXT_ASSEMBLIES: 'Сборки',
  BUTTON_TEXT_PARTS: 'Детали',

  // U001 Uploading Constants
  UPLOADING_TABLE_MAIN: 'IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Table',
  UPLOADING_TABLE_ID: 'Table',
  UPLOADING_BUTTON_SHIP: 'IssueToPull-Button-Ship',

  // U001 Deficit Constants
  DEFICIT_IZD_MAIN_TABLE: 'DeficitIzd-Main-Table',
  DEFICIT_IZD_TABLE_MAIN: 'DeficitIzd-Main-Table',
  DEFICIT_IZD_TABLE_HEADROW_TOTAL_CHECKBOX: 'DeficitIzdTable-HeadRow-TotalCheckbox',
  DEFICIT_IZD_TABLE_HEADROW_DATE_URGENCY: 'DeficitIzdTable-HeadRow-DateUrgency',
  DEFICIT_IZD_TABLE_HEADROW_ORDER_FROM_PRODUCTION: 'DeficitIzdTable-HeadRow-OrderFromProduction',
  DEFICIT_IZD_MAIN_FOOTER_BUTTON_INTO_PRODUCTION: 'DeficitIzd-Main-Footer-Button-IntoProduction',

  DEFICIT_CBED_TABLE: 'DeficitCbed-Table',
  DEFICIT_CBED_TABLE_MAIN: 'DeficitCbed-Table',
  DEFICIT_CBED_TABLE_HEADER_VIEWS_DEFICITS_DUEDATE: 'DeficitCbed-TableHeader-ViewsDeficitsDuedate',
  DEFICIT_CBED_TABLE_HEADER_VIEWS_DEFICITS_ORDERED_FOR_PRODUCTION: 'DeficitCbed-TableHeader-ViewsDeficitsOrderedforproduction',
  DEFICIT_CBED_TABLE_HEADER_SELECT_ALL: 'DeficitCbed-TableHeader-SelectAll',
  DEFICIT_CBED_START_BUTTON: 'DeficitCbed-StartButton',
  DEFICIT_CBED_START_PRODUCTION_MODAL_MODAL_CONTENT: 'DeficitCbed-StartProductionModal-ModalContent',

  DEFICIT_DETAIL_MAIN_TABLE: 'DeficitIzd-Main-Table',
  DEFICIT_DETAIL_TABLE_MAIN: 'DeficitIzd-Main-Table',
  DEFICIT_DETAIL_TABLE_HEADROW_DATE_URGENCY: 'DeficitIzdTable-HeadRow-DateUrgency',
  DEFICIT_DETAIL_TABLE_HEADROW_ORDER_FROM_PRODUCTION: 'DeficitIzdTable-HeadRow-OrderFromProduction',
  DEFICIT_DETAIL_TABLE_HEADROW_TOTAL_CHECKBOX: 'DeficitIzdTable-HeadRow-TotalCheckbox',
  DEFICIT_DETAIL_MAIN_FOOTER_BUTTON_INTO_PRODUCTION: 'DeficitIzd-Main-Footer-Button-IntoProduction',
};

// API Test Data Constants
export const API_CONST = {
  // Auth Test Data
  API_TEST_USERNAME: 'Джойс Р.Г.',
  API_TEST_PASSWORD: 'O0_f2!3@34OInU',
  API_TEST_TABEL: '105',
  API_TEST_AUTHORIZATION_TOKEN: 'Bearer test-token-12345',

  // Users Test Data
  API_TEST_USER_ID: '1',
  API_TEST_USER_ID_72: '72', // Real user account created on dev server
  API_CREATOR_USER_ID_66: '66', // Real user account created on dev server
  API_TEST_USER_INITIALS: 'TU',
  API_TEST_USER_INITIALS_UPDATED: 'TU2',
  API_TEST_USER_TABEL: '12345',
  API_TEST_USER_TABEL_UPDATED: '12346',

  // Roles Test Data
  API_TEST_ROLE_NAME: 'API Test Role',
  API_TEST_ROLE_NAME_UPDATED: 'Updated API Test Role',
  API_TEST_ROLE_DESCRIPTION: 'API test role for automated testing',
  API_TEST_ROLE_DESCRIPTION_UPDATED: 'Updated API test role for automated testing',

  // Details Test Data
  API_TEST_DETAIL_ID: '2',
  API_TEST_DETAIL_NAME: 'API Test Detail',
  API_TEST_DETAIL_DESIGNATION: 'API-TEST-001',
  API_TEST_DETAIL_DESCRIPTION: 'API test detail for automated testing',
  API_TEST_DETAIL_ID_LARGE: '999',

  // Documents Test Data
  API_TEST_DOCUMENT_ID: '1',
  API_TEST_FILE_ID: '1',
  API_TEST_USER_TO_UPDATE_ID: '1',
  API_TEST_DOCUMENT_TYPE: 'test-type',
  API_TEST_DOCUMENT_TYPE_UPDATED: 'updated-test-type',

  // Assemble Test Data
  API_TEST_ASSEMBLE_ID: '1',
  API_TEST_ASSEMBLE_NAME: 'Test Assemble',
  API_TEST_ASSEMBLE_NAME_UPDATED: 'Updated Test Assemble',
  API_TEST_ASSEMBLE_DESCRIPTION: 'Test assemble description',
  API_TEST_ASSEMBLE_DESCRIPTION_UPDATED: 'Updated test assemble description',

  // Materials Test Data
  API_TEST_MATERIAL_ID: '1',
  API_TEST_MATERIAL_NAME: 'Test Material',
  API_TEST_MATERIAL_NAME_UPDATED: 'Updated Test Material',
  API_TEST_MATERIAL_TYPE: 'test-type',
  API_TEST_MATERIAL_TYPE_UPDATED: 'updated-test-type',
  API_TEST_SUBTYPE_INSTANS: '1',

  // CBED Test Data
  API_TEST_CBED_ID: '1',
  API_TEST_CBED_NAME: 'Test CBED',
  API_TEST_CBED_NAME_UPDATED: 'Updated Test CBED',
  API_TEST_CBED_DESCRIPTION: 'Test CBED description',
  API_TEST_CBED_DESCRIPTION_UPDATED: 'Updated test CBED description',

  // Products Test Data
  API_TEST_PRODUCT_ID: '1',
  API_TEST_PRODUCT_NAME: 'Test Product',
  API_TEST_PRODUCT_NAME_UPDATED: 'Updated Test Product',
  API_TEST_PRODUCT_DESCRIPTION: 'Test product description',
  API_TEST_PRODUCT_DESCRIPTION_UPDATED: 'Updated test product description',
  API_TEST_PRODUCT_CATEGORY: 'test-category',
  API_TEST_PRODUCT_CATEGORY_UPDATED: 'updated-test-category',
  API_TEST_PRODUCT_PRICE: 100.0,
  API_TEST_PRODUCT_PRICE_UPDATED: 150.0,

  // Orders Test Data
  API_TEST_ORDER_ID: '1',
  API_TEST_ORDER_STATUS: 'pending',
  API_TEST_ORDER_STATUS_UPDATED: 'confirmed',
  API_TEST_ORDER_TOTAL_AMOUNT: 100.0,
  API_TEST_ORDER_TOTAL_AMOUNT_UPDATED: 150.0,
  API_TEST_ORDER_NOTES: 'Test order',
  API_TEST_ORDER_NOTES_UPDATED: 'Updated test order',

  // Contacts Test Data
  API_TEST_CONTACT_ID: '1',
  API_TEST_CONTACT_NAME: 'Test Contact',
  API_TEST_CONTACT_NAME_UPDATED: 'Updated Test Contact',
  API_TEST_CONTACT_EMAIL: 'test@example.com',
  API_TEST_CONTACT_EMAIL_UPDATED: 'updated@example.com',
  API_TEST_CONTACT_PHONE: '+1234567890',
  API_TEST_CONTACT_PHONE_UPDATED: '+0987654321',
  API_TEST_CONTACT_TYPE: 'customer',
  API_TEST_CONTACT_TYPE_UPDATED: 'supplier',

  // Equipment Test Data
  API_TEST_EQUIPMENT_ID: '1',
  API_TEST_EQUIPMENT_NAME: 'Test Equipment',
  API_TEST_EQUIPMENT_NAME_UPDATED: 'Updated Test Equipment',
  API_TEST_EQUIPMENT_TYPE: 'machine',
  API_TEST_EQUIPMENT_TYPE_UPDATED: 'tool',
  API_TEST_EQUIPMENT_STATUS: 'active',
  API_TEST_EQUIPMENT_STATUS_UPDATED: 'maintenance',

  // Inventory Test Data
  API_TEST_INVENTORY_ID: '1',
  API_TEST_INVENTORY_NAME: 'Test Inventory',
  API_TEST_INVENTORY_NAME_UPDATED: 'Updated Test Inventory',
  API_TEST_INVENTORY_QUANTITY: 100,
  API_TEST_INVENTORY_QUANTITY_UPDATED: 150,
  API_TEST_INVENTORY_LOCATION: 'warehouse-a',
  API_TEST_INVENTORY_LOCATION_UPDATED: 'warehouse-b',

  // Parts Test Data
  API_TEST_PART_ID: '1',
  API_TEST_PART_NAME: 'Test Part',
  API_TEST_PART_NAME_UPDATED: 'Updated Test Part',
  API_TEST_PART_NUMBER: 'PART-001',
  API_TEST_PART_NUMBER_UPDATED: 'PART-002',
  API_TEST_PART_CATEGORY: 'mechanical',
  API_TEST_PART_CATEGORY_UPDATED: 'electrical',

  // Warehouse Test Data
  API_TEST_WAREHOUSE_ID: '1',
  API_TEST_WAREHOUSE_NAME: 'Test Warehouse',
  API_TEST_WAREHOUSE_NAME_UPDATED: 'Updated Test Warehouse',
  API_TEST_WAREHOUSE_LOCATION: 'Building A',
  API_TEST_WAREHOUSE_LOCATION_UPDATED: 'Building B',
  API_TEST_WAREHOUSE_CAPACITY: 1000,
  API_TEST_WAREHOUSE_CAPACITY_UPDATED: 1500,

  // Specifications Test Data
  API_TEST_SPECIFICATION_ID: '1',
  API_TEST_SPECIFICATION_NAME: 'Test Specification',
  API_TEST_SPECIFICATION_NAME_UPDATED: 'Updated Test Specification',
  API_TEST_SPECIFICATION_VERSION: '1.0',
  API_TEST_SPECIFICATION_VERSION_UPDATED: '2.0',
  API_TEST_SPECIFICATION_STATUS: 'draft',
  API_TEST_SPECIFICATION_STATUS_UPDATED: 'approved',

  // Shipments Test Data
  API_TEST_SHIPMENT_ID: '1',
  API_TEST_SHIPMENT_TRACKING_NUMBER: 'TRK-001',
  API_TEST_SHIPMENT_TRACKING_NUMBER_UPDATED: 'TRK-002',
  API_TEST_SHIPMENT_STATUS: 'pending',
  API_TEST_SHIPMENT_STATUS_UPDATED: 'shipped',
  API_TEST_SHIPMENT_DESTINATION: 'New York',
  API_TEST_SHIPMENT_DESTINATION_UPDATED: 'Los Angeles',

  // Manufacturing Test Data
  API_TEST_MANUFACTURING_ORDER_ID: '1',
  API_TEST_MANUFACTURING_ORDER_NAME: 'Test Manufacturing Order',
  API_TEST_MANUFACTURING_ORDER_NAME_UPDATED: 'Updated Test Manufacturing Order',
  API_TEST_MANUFACTURING_ORDER_STATUS: 'planned',
  API_TEST_MANUFACTURING_ORDER_STATUS_UPDATED: 'in-progress',
  API_TEST_MANUFACTURING_ORDER_QUANTITY: 50,
  API_TEST_MANUFACTURING_ORDER_QUANTITY_UPDATED: 75,

  // Quality Test Data
  API_TEST_QUALITY_CHECK_ID: '1',
  API_TEST_QUALITY_CHECK_NAME: 'Test Quality Check',
  API_TEST_QUALITY_CHECK_NAME_UPDATED: 'Updated Test Quality Check',
  API_TEST_QUALITY_CHECK_STATUS: 'pending',
  API_TEST_QUALITY_CHECK_STATUS_UPDATED: 'passed',
  API_TEST_QUALITY_CHECK_SCORE: 85,
  API_TEST_QUALITY_CHECK_SCORE_UPDATED: 95,

  // Maintenance Test Data
  API_TEST_MAINTENANCE_SCHEDULE_ID: '1',
  API_TEST_MAINTENANCE_SCHEDULE_NAME: 'Test Maintenance Schedule',
  API_TEST_MAINTENANCE_SCHEDULE_NAME_UPDATED: 'Updated Test Maintenance Schedule',
  API_TEST_MAINTENANCE_SCHEDULE_FREQUENCY: 'weekly',
  API_TEST_MAINTENANCE_SCHEDULE_FREQUENCY_UPDATED: 'monthly',
  API_TEST_MAINTENANCE_SCHEDULE_STATUS: 'active',
  API_TEST_MAINTENANCE_SCHEDULE_STATUS_UPDATED: 'paused',

  // Analytics Test Data
  API_TEST_ANALYTICS_DATE_RANGE: '2024-01-01,2024-12-31',
  API_TEST_ANALYTICS_METRICS: ['production', 'quality', 'efficiency'],
  API_TEST_ANALYTICS_KPI_TYPE: 'performance',
  API_TEST_ANALYTICS_KPI_TYPE_UPDATED: 'quality',

  // Notifications Test Data
  API_TEST_NOTIFICATION_ID: '1',
  API_TEST_NOTIFICATION_TITLE: 'Test Notification',
  API_TEST_NOTIFICATION_TITLE_UPDATED: 'Updated Test Notification',
  API_TEST_NOTIFICATION_MESSAGE: 'This is a test notification',
  API_TEST_NOTIFICATION_MESSAGE_UPDATED: 'This is an updated test notification',
  API_TEST_NOTIFICATION_TYPE: 'info',
  API_TEST_NOTIFICATION_TYPE_UPDATED: 'warning',

  // Settings Test Data
  API_TEST_SETTING_KEY: 'test_setting',
  API_TEST_SETTING_KEY_UPDATED: 'updated_test_setting',
  API_TEST_SETTING_VALUE: 'test_value',
  API_TEST_SETTING_VALUE_UPDATED: 'updated_test_value',
  API_TEST_SETTING_CATEGORY: 'general',
  API_TEST_SETTING_CATEGORY_UPDATED: 'advanced',

  // Logs Test Data
  API_TEST_LOG_LEVEL: 'info',
  API_TEST_LOG_LEVEL_UPDATED: 'debug',
  API_TEST_LOG_MODULE: 'api',
  API_TEST_LOG_MODULE_UPDATED: 'database',
  API_TEST_LOG_MESSAGE: 'Test log message',
  API_TEST_LOG_MESSAGE_UPDATED: 'Updated test log message',

  // Files Test Data
  API_TEST_FILE_NAME: 'test-file.txt',
  API_TEST_FILE_NAME_UPDATED: 'updated-test-file.txt',
  API_TEST_FILE_TYPE: 'text',
  API_TEST_FILE_TYPE_UPDATED: 'document',
  API_TEST_FILE_SIZE: 1024,
  API_TEST_FILE_SIZE_UPDATED: 2048,

  // Security Test Data
  API_TEST_SECURITY_SETTING_KEY: 'password_policy',
  API_TEST_SECURITY_SETTING_KEY_UPDATED: 'session_timeout',
  API_TEST_SECURITY_SETTING_VALUE: 'strong',
  API_TEST_SECURITY_SETTING_VALUE_UPDATED: '30_minutes',
  API_TEST_SECURITY_ACTION: 'login',
  API_TEST_SECURITY_ACTION_UPDATED: 'logout',

  // Backup Test Data
  API_TEST_BACKUP_ID: '1',
  API_TEST_BACKUP_NAME: 'Test Backup',
  API_TEST_BACKUP_NAME_UPDATED: 'Updated Test Backup',
  API_TEST_BACKUP_TYPE: 'full',
  API_TEST_BACKUP_TYPE_UPDATED: 'incremental',
  API_TEST_BACKUP_STATUS: 'pending',
  API_TEST_BACKUP_STATUS_UPDATED: 'completed',

  // Monitoring Test Data
  API_TEST_MONITORING_METRIC: 'cpu_usage',
  API_TEST_MONITORING_METRIC_UPDATED: 'memory_usage',
  API_TEST_MONITORING_THRESHOLD: 80,
  API_TEST_MONITORING_THRESHOLD_UPDATED: 90,
  API_TEST_MONITORING_ALERT_TYPE: 'warning',
  API_TEST_MONITORING_ALERT_TYPE_UPDATED: 'critical',

  // Reports Test Data
  API_TEST_REPORT_ID: '1',
  API_TEST_REPORT_NAME: 'Test Report',
  API_TEST_REPORT_NAME_UPDATED: 'Updated Test Report',
  API_TEST_REPORT_TYPE: 'summary',
  API_TEST_REPORT_TYPE_UPDATED: 'detailed',
  API_TEST_REPORT_FORMAT: 'pdf',
  API_TEST_REPORT_FORMAT_UPDATED: 'excel',

  // Integrations Test Data
  API_TEST_INTEGRATION_ID: '1',
  API_TEST_INTEGRATION_NAME: 'Test Integration',
  API_TEST_INTEGRATION_NAME_UPDATED: 'Updated Test Integration',
  API_TEST_INTEGRATION_TYPE: 'api',
  API_TEST_INTEGRATION_TYPE_UPDATED: 'webhook',
  API_TEST_INTEGRATION_STATUS: 'active',
  API_TEST_INTEGRATION_STATUS_UPDATED: 'inactive',

  // Audit Test Data
  API_TEST_AUDIT_ACTION: 'create',
  API_TEST_AUDIT_ACTION_UPDATED: 'update',
  API_TEST_AUDIT_RESOURCE: 'user',
  API_TEST_AUDIT_RESOURCE_UPDATED: 'product',
  API_TEST_AUDIT_RESULT: 'success',
  API_TEST_AUDIT_RESULT_UPDATED: 'failure',

  // Calendar Test Data
  API_TEST_CALENDAR_EVENT_ID: '1',
  API_TEST_CALENDAR_EVENT_TITLE: 'Test Event',
  API_TEST_CALENDAR_EVENT_TITLE_UPDATED: 'Updated Test Event',
  API_TEST_CALENDAR_EVENT_START_DATE: '2024-01-01T10:00:00Z',
  API_TEST_CALENDAR_EVENT_START_DATE_UPDATED: '2024-01-01T11:00:00Z',
  API_TEST_CALENDAR_EVENT_END_DATE: '2024-01-01T11:00:00Z',
  API_TEST_CALENDAR_EVENT_END_DATE_UPDATED: '2024-01-01T12:00:00Z',

  // Tasks Test Data
  API_TEST_TASK_ID: '1',
  API_TEST_TASK_TITLE: 'Test Task',
  API_TEST_TASK_TITLE_UPDATED: 'Updated Test Task',
  API_TEST_TASK_DESCRIPTION: 'Test task description',
  API_TEST_TASK_DESCRIPTION_UPDATED: 'Updated test task description',
  API_TEST_TASK_PRIORITY: 'medium',
  API_TEST_TASK_PRIORITY_UPDATED: 'high',
  API_TEST_TASK_STATUS: 'todo',
  API_TEST_TASK_STATUS_UPDATED: 'in-progress',

  // Chat Test Data
  API_TEST_CHAT_ROOM_ID: '1',
  API_TEST_CHAT_ROOM_NAME: 'Test Chat Room',
  API_TEST_CHAT_ROOM_NAME_UPDATED: 'Updated Test Chat Room',
  API_TEST_CHAT_MESSAGE_ID: '1',
  API_TEST_CHAT_MESSAGE_CONTENT: 'Test message',
  API_TEST_CHAT_MESSAGE_CONTENT_UPDATED: 'Updated test message',

  // Dashboard Test Data
  API_TEST_DASHBOARD_WIDGET_ID: '1',
  API_TEST_DASHBOARD_WIDGET_TYPE: 'chart',
  API_TEST_DASHBOARD_WIDGET_TYPE_UPDATED: 'table',
  API_TEST_DASHBOARD_WIDGET_TITLE: 'Test Widget',
  API_TEST_DASHBOARD_WIDGET_TITLE_UPDATED: 'Updated Test Widget',

  // Search Test Data
  API_TEST_SEARCH_QUERY: 'test search',
  API_TEST_SEARCH_QUERY_UPDATED: 'updated test search',
  API_TEST_SEARCH_FILTERS: { category: 'test' },
  API_TEST_SEARCH_FILTERS_UPDATED: { category: 'updated' },

  // Import/Export Test Data
  API_TEST_IMPORT_ID: '1',
  API_TEST_EXPORT_ID: '1',
  API_TEST_IMPORT_TYPE: 'csv',
  API_TEST_EXPORT_TYPE: 'excel',
  API_TEST_IMPORT_STATUS: 'pending',
  API_TEST_EXPORT_STATUS: 'completed',

  // Messaging Test Data
  API_TEST_MESSAGE_ID: '1',
  API_TEST_CONVERSATION_ID: '1',
  API_TEST_MESSAGE_CONTENT: 'Test message content',
  API_TEST_MESSAGE_CONTENT_UPDATED: 'Updated test message content',

  // Templates Test Data
  API_TEST_TEMPLATE_ID: '1',
  API_TEST_TEMPLATE_NAME: 'Test Template',
  API_TEST_TEMPLATE_NAME_UPDATED: 'Updated Test Template',
  API_TEST_TEMPLATE_CATEGORY: 'email',
  API_TEST_TEMPLATE_CATEGORY_UPDATED: 'document',

  // Workflows Test Data
  API_TEST_WORKFLOW_ID: '1',
  API_TEST_WORKFLOW_NAME: 'Test Workflow',
  API_TEST_WORKFLOW_NAME_UPDATED: 'Updated Test Workflow',
  API_TEST_WORKFLOW_STATUS: 'draft',
  API_TEST_WORKFLOW_STATUS_UPDATED: 'active',

  // Scheduling Test Data
  API_TEST_SCHEDULE_ID: '1',
  API_TEST_SCHEDULE_NAME: 'Test Schedule',
  API_TEST_SCHEDULE_NAME_UPDATED: 'Updated Test Schedule',
  API_TEST_SCHEDULE_FREQUENCY: 'daily',
  API_TEST_SCHEDULE_FREQUENCY_UPDATED: 'weekly',

  // Versioning Test Data
  API_TEST_VERSION_ID: '1',
  API_TEST_VERSION_NUMBER: '1.0.0',
  API_TEST_VERSION_NUMBER_UPDATED: '1.1.0',
  API_TEST_VERSION_STATUS: 'draft',
  API_TEST_VERSION_STATUS_UPDATED: 'published',

  // Production Tasks Test Data
  API_TEST_PRODUCTION_TASK_ID: '1',
  API_TEST_PRODUCTION_TASK_NAME: 'Test Production Task',
  API_TEST_PRODUCTION_TASK_NAME_UPDATED: 'Updated Test Production Task',
  API_TEST_PRODUCTION_TASK_STATUS: 'planned',
  API_TEST_PRODUCTION_TASK_STATUS_UPDATED: 'in-progress',

  // Tools Test Data
  API_TEST_TOOL_ID: '1',
  API_TEST_TOOL_NAME: 'Test Tool',
  API_TEST_TOOL_NAME_UPDATED: 'Updated Test Tool',
  API_TEST_TOOL_TYPE: 'hand-tool',
  API_TEST_TOOL_TYPE_UPDATED: 'power-tool',
  API_TEST_TOOL_STATUS: 'available',
  API_TEST_TOOL_STATUS_UPDATED: 'in-use',
  API_TEST_CBED_TYPE: 'assembly',

  // Edge Case Test Data for Defensive Testing
  API_TEST_EDGE_CASES: {
    // Security Test Data
    SQL_INJECTION_USERNAME: "admin'; DROP TABLE users; --",
    XSS_PAYLOAD: "<script>alert('XSS')</script>",
    XSS_PAYLOAD_ADVANCED: "javascript:alert('XSS')",

    // Input Validation Test Data
    EMPTY_STRING: '',
    NULL_VALUE: null,
    UNDEFINED_VALUE: undefined,
    VERY_LONG_STRING: 'A'.repeat(10000),
    SPECIAL_CHARACTERS: '!@#$%^&*()_+-=[]{}|;\':",./<>?',
    UNICODE_CHARACTERS: '🚀🌟💫⭐️🎯🔥💎✨',

    // Data Type Test Data
    INVALID_NUMBER: 'not_a_number',
    NEGATIVE_NUMBER: -1,
    ZERO_NUMBER: 0,
    VERY_LARGE_NUMBER: 999999999999,
    FLOAT_NUMBER: 3.14159,

    // Array/Object Test Data
    INVALID_ARRAY: 'not_an_array',
    EMPTY_ARRAY: [],
    LARGE_ARRAY: new Array(1000).fill('test'),
    INVALID_OBJECT: 'not_an_object',
    EMPTY_OBJECT: {},

    // Authentication Test Data
    INVALID_TOKEN: 'invalid_token_12345',
    EXPIRED_TOKEN: 'expired_token_12345',
    MALFORMED_TOKEN: 'malformed.token',

    // Performance Test Data
    PERFORMANCE_THRESHOLD_MS: 5000,
    LARGE_PAGE_SIZE: 10000,
    NEGATIVE_PAGE_NUMBER: -1,
    ZERO_PAGE_SIZE: 0,

    // Boundary Test Data
    MAX_INTEGER: 2147483647,
    MIN_INTEGER: -2147483648,
    MAX_STRING_LENGTH: 1000,
    MIN_STRING_LENGTH: 1,
  },

  // Duplicate constants removed - now defined above at line 540

  // Tech Process Test Data
  API_TEST_TECH_PROCESS_ID: '1',
  API_TEST_TECH_PROCESS_ID_2: '2',
  API_TEST_TECH_PROCESS_DESCRIPTION: 'процесс токарный',
  API_TEST_TECH_PROCESS_DESCRIPTION_UPDATED: 'обновленный процесс токарный',
  API_TEST_TECH_PROCESS_IZD_TYPE: 'cbed',
  API_TEST_TECH_PROCESS_IZD_ID: '2',
  API_TEST_TECH_PROCESS_IZD_ID_UPDATED: '3',
  API_TEST_TECH_PROCESS_OPERATION_LIST: '[{"id":8857}]',
  API_TEST_TECH_PROCESS_OPERATION_LIST_UPDATED: '[{"id":8858}]',

  // Comprehensive Status Code Validation Patterns
  STATUS_CODE_VALIDATION: {
    // Expected success codes
    SUCCESS_CODES: [200, 201, 202, 204],

    // Expected error codes for different scenarios
    AUTHENTICATION_ERROR_CODES: [401, 400, 422],
    AUTHORIZATION_ERROR_CODES: [403, 401, 400],
    VALIDATION_ERROR_CODES: [400, 422, 401],
    NOT_FOUND_ERROR_CODES: [404, 400],

    // Unexpected/problematic codes that indicate API issues
    UNEXPECTED_SUCCESS_CODES: [201, 200], // When we expect failure
    UNEXPECTED_ERROR_CODES: [500, 502, 503, 504, 520, 521, 522, 523, 524],

    // Server error codes that indicate infrastructure problems
    SERVER_ERROR_CODES: [500, 502, 503, 504, 520, 521, 522, 523, 524],

    // Client error codes that should be handled properly
    CLIENT_ERROR_CODES: [400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 422, 423, 424, 426, 428, 429, 431, 451],
  },
};

// Reusable product specifications for tests
export const PRODUCT_SPECS = {
  T15: {
    productName: 'Т15',
    assemblies: [
      {
        partNumber: '109.01-03.00СБ',
        name: 'Опора (Траверса Т10А)СБ',
        quantity: 2,
      },
      { partNumber: '109.02-01.00СБ', name: 'Балка траверсы', quantity: 1 },
      { partNumber: '109.02-02.00СБ', name: 'Упор подвижный', quantity: 2 },
    ],
    details: [{ partNumber: '109.01-01', name: 'Стойка опоры траверсы', quantity: 2 }],
    standardParts: [
      { name: 'Гайка шестигранная DIN934 М8', quantity: 4 },
      { name: 'Болт с полной резьбой DIN933 М8х40', quantity: 4 },
    ],
    consumables: [] as Array<{ name: string; quantity: number }>,
  },
};
