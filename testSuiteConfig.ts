import { runAPI001 } from './testcases/API001.spec';
import { runP001 } from './testcases/P001.spec';
import { runP002 } from './testcases/P002.spec';
import { runP003 } from './testcases/P003.spec';
import { runP004 } from './testcases/P004.spec';
import { runP005 } from './testcases/P005.spec';
import { runP006 } from './testcases/P006.spec';
import { runP007 } from './testcases/P007.spec';
import { runP008 } from './testcases/P008.spec';
import { runP009 } from './testcases/P009.spec';
import { runP010 } from './testcases/P010.spec';
import { runTC000 } from './testcases/TC000.spec';
import { runTC001 } from './testcases/TC001.spec';
import { runTC002 } from './testcases/TC002.spec';
import { runTC100 } from './testcases/TC100.spec';
import { runU001 } from './testcases/U001.spec';
import { runU002 } from './testcases/U002.spec';
import { runU003 } from './testcases/U003.spec';
import { runU004_1 } from './testcases/U004-1.spec';
import { runU004_2 } from './testcases/U004-2.spec';
import { runU004_3 } from './testcases/U004-3.spec';
import { runU004_4 } from './testcases/U004-4.spec';
import { runU004_5 } from './testcases/U004-5.spec';
import { runU004_6 } from './testcases/U004-6.spec';
import { runU004_7 } from './testcases/U004-7.spec';
import { runU004_8 } from './testcases/U004-8.spec';
import { runU004_9 } from './testcases/U004-9.spec';
import { runU005 } from './testcases/U005.spec';
import { runU006 } from './testcases/U006.spec';
import { runU007 } from './testcases/U007.spec';
import { runCheckTableTotals } from './testcases/CheckTableTotals.spec';
import { runERP_969 } from './testcases/ERP-969.spec';
import { runERP_3015 } from './testcases/ERP-3015.spec';
import { runERP_969_2 } from './testcases/ERP-969-2.spec';
import { runAuthAPI } from './testcases/APIAuth.spec';
import { runUsersAPI } from './testcases/APIUsers.spec';
import { runRolesAPI } from './testcases/APIRoles.spec';
import { runDetailsAPI } from './testcases/APIDetails.spec';
import { runDocumentsAPI } from './testcases/APIDocuments.spec';
import { runAssembleAPI } from './testcases/APIAssemble.spec';
import { runMaterialsAPI } from './testcases/APIMaterials.spec';
import { runCBEDAPI } from './testcases/APICBED.spec';
import { runProductsAPI } from './testcases/APIProducts.spec';
import { runOrdersAPI } from './testcases/APIOrders.spec';
import { runProductionTasksAPI } from './testcases/APIProductionTasks.spec';
import { runEquipmentAPI } from './testcases/APIEquipment.spec';
import { runToolsAPI } from './testcases/APITools.spec';
import { runInventoryAPI } from './testcases/APIInventory.spec';
import { runPartsAPI } from './testcases/APIParts.spec';
import { runWarehouseAPI } from './testcases/APIWarehouse.spec';
import { runContactsAPI } from './testcases/APIContacts.spec';
import { runSpecificationsAPI } from './testcases/APISpecifications.spec';
import { runShipmentsAPI } from './testcases/APIShipments.spec';
import { runManufacturingAPI } from './testcases/APIManufacturing.spec';
import { runQualityAPI } from './testcases/APIQuality.spec';
import { runMaintenanceAPI } from './testcases/APIMaintenance.spec';
import { runAnalyticsAPI } from './testcases/APIAnalytics.spec';
import { runNotificationsAPI } from './testcases/APINotifications.spec';
import { runSettingsAPI } from './testcases/APISettings.spec';
import { runLogsAPI } from './testcases/APILogs.spec';
import { runFilesAPI } from './testcases/APIFiles.spec';
import { runSecurityAPI } from './testcases/APISecurity.spec';
import { runBackupAPI } from './testcases/APIBackup.spec';
import { runMonitoringAPI } from './testcases/APIMonitoring.spec';
import { runAuditAPI } from './testcases/APIAudit.spec';
import { runCalendarAPI } from './testcases/APICalendar.spec';
import { runIntegrationsAPI } from './testcases/APIIntegrations.spec';
import { runReportsAPI } from './testcases/APIReports.spec';
import { runTasksAPI } from './testcases/APITasks.spec';
import { runChatAPI } from './testcases/APIChat.spec';
import { runDashboardAPI } from './testcases/APIDashboard.spec';
import { runImportExportAPI } from './testcases/APIImportExport.spec';
import { runSearchAPI } from './testcases/APISearch.spec';
import { runTemplatesAPI } from './testcases/APITemplates.spec';
import { runMessagingAPI } from './testcases/APIMessaging.spec';
import { runSchedulingAPI } from './testcases/APIScheduling.spec';
import { runWorkflowsAPI } from './testcases/APIWorkflows.spec';
import { runVersioningAPI } from './testcases/APIVersioning.spec';
import { runTechProcessAPI } from './testcases/APITechProcess.spec';

// Create a mapping of test suites to their corresponding test functions with descriptions
export const testSuites = {
  ERP_969: {
    description: 'ERP-969 test suite to verify functionalities specific to ERP-969.',
    tests: [
      {
        test: runERP_969,
        description: 'This test checks the ERP-969',
      },
      {
        test: runERP_969_2,
        description: 'This test checks the ERP-969-2',
      },
    ],
  },
  ERP_3015: {
    description: 'ERP-2969 test suite to verify functionalities specific to ERP-3015.',
    tests: [
      {
        test: runERP_3015,
        description: 'This test checks the ERP-3015',
      },
    ],
  },
  api001: {
    description: 'API 001 test suite to verify functionalities specific to API 001.',
    tests: [
      {
        test: runAPI001,
        description: 'This test checks the responsiveness of API 001.',
      },
      // Add more test cases as needed
    ],
  },
  page001: {
    description: 'Page 001 test suite to verify functionalities specific to Page 001.',
    tests: [
      {
        test: runP001,
        description: 'This test checks the responsiveness of Page 001.',
      },
      // Add more test cases as needed
    ],
  },
  page002: {
    description: 'Page 002 test suite to verify functionalities specific to Page 002.',
    tests: [
      {
        test: runP002,
        description: 'This test checks the responsiveness of Page 002.',
      },
      // Add more test cases as needed
    ],
  },
  page003: {
    description: 'Page 003 test suite to verify functionalities specific to Page 003.',
    tests: [
      {
        test: runP003,
        description: 'This test checks the responsiveness of Page 003.',
      },
      // Add more test cases as needed
    ],
  },
  page004: {
    description: 'Page 004 test suite to verify functionalities specific to Page 004.',
    tests: [
      {
        test: runP004,
        description: 'This test checks the responsiveness of Page 004.',
      },
      // Add more test cases as needed
    ],
  },
  page005: {
    description: 'Page 005 test suite to verify functionalities specific to Page 005.',
    tests: [
      {
        test: runP005,
        description: 'This test checks the responsiveness of Page 005.',
      },
      // Add more test cases as needed
    ],
  },
  page006: {
    description: 'Page 006 test suite to verify functionalities specific to Page 006.',
    tests: [
      {
        test: runP006,
        description: 'This test checks the responsiveness of Page 005.',
      },
      // Add more test cases as needed
    ],
  },
  page007: {
    description: 'Page 007 test suite to verify functionalities specific to Page 007.',
    tests: [
      {
        test: runP007,
        description: 'This test checks the responsiveness of Page 007.',
      },
      // Add more test cases as needed
    ],
  },
  page008: {
    description: 'Page 008 test suite to verify functionalities specific to Page 008.',
    tests: [
      {
        test: runP008,
        description: 'This test checks the responsiveness of Page 008.',
      },
      // Add more test cases as needed
    ],
  },
  page009: {
    description: 'Page 009 test suite to verify functionalities specific to Page 009.',
    tests: [
      {
        test: runP009,
        description: 'This test checks the responsiveness of Page 009.',
      },
      // Add more test cases as needed
    ],
  },
  page010: {
    description: 'Ordered from suppliers.',
    tests: [
      {
        test: runP010,
        description: 'Order a part.',
      },
      // Add more test cases as needed
    ],
  },
  suite01: {
    description: 'This is a group of full page tests p02 - P04',
    tests: [
      {
        test: runU004_1,
        description: 'This test checks the User Scenario series of tests U004_1',
      },
      {
        test: runU004_2,
        description: 'This test checks the User Scenario series of tests U004_2',
      },
      {
        test: runU004_3,
        description: 'This test checks the User Scenario series of tests U004_3',
      },
      {
        test: runU004_4,
        description: 'This test checks the User Scenario series of tests U004_4',
      },
      {
        test: runU004_5,
        description: 'This test checks the User Scenario series of tests U004_5',
      },
      {
        test: runU004_6,
        description: 'This test checks the User Scenario series of tests U004_6',
      },
      {
        test: runU004_7,
        description: 'This test checks the User Scenario series of tests U004_7',
      },
      {
        test: runU004_8,
        description: 'This test checks the User Scenario series of tests U004_8',
      },
      {
        test: runU004_9,
        description: 'This test checks the User Scenario series of tests U004_9',
      },
      // Add more test cases as needed
    ],
  },
  suite02: {
    description: 'This is a group of full page tests tests U005 U006',
    tests: [
      {
        test: runU005,
        description: 'This test checks the User Scenario series of tests U005',
      },
      {
        test: runU006,
        description: 'This test checks the User Scenario series of tests U006',
      },
    ],
  },
  TC100: {
    description: 'Complete specifications verification.',
    tests: [
      {
        test: runTC100,
        description: 'verifies the complete specifications matches the scanned product.',
      },
      // Add more test cases as needed
    ],
  },
  U001: {
    description: 'Uploading a task.',
    tests: [
      {
        test: runU001,
        description: 'Creating a shipment task.',
      },
      // Add more test cases as needed
    ],
  },
  U002: {
    description: 'Launch into production.',
    tests: [
      {
        test: runU002,
        description: 'Creating a warehouse task for production.',
      },
      // Add more test cases as needed
    ],
  },
  U003: {
    description: 'Shipment Tasks Management.',
    tests: [
      {
        test: runU003,
        description: 'Managing shipment tasks and products.',
      },
      // Add more test cases as needed
    ],
  },
  U004_1: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_1,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_2: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_2,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_3: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_3,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_4: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_4,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_5: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_5,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_6: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_6,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_7: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_7,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_8: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_8,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U004_9: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU004_9,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U005: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU005,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  U006: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runU006,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  ERP_969_2: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [
      {
        test: runERP_969_2,
        description: 'verify changes to full specifications after adding items to the product',
      },
      // Add more test cases as needed
    ],
  },
  auth_api: {
    description: 'Auth API test suite to verify authentication endpoints.',
    tests: [
      {
        test: runAuthAPI,
        description: 'Tests authentication API endpoints including login and token validation.',
      },
    ],
  },
  users_api: {
    description: 'Users API test suite to verify user management endpoints.',
    tests: [
      {
        test: runUsersAPI,
        description: 'Tests all Users API endpoints including CRUD operations.',
      },
    ],
  },
  roles_api: {
    description: 'Roles API test suite to verify role management endpoints.',
    tests: [
      {
        test: runRolesAPI,
        description: 'Tests all Roles API endpoints including CRUD operations.',
      },
    ],
  },
  details_api: {
    description: 'Details API test suite to verify detail management endpoints.',
    tests: [
      {
        test: runDetailsAPI,
        description: 'Tests all Details API endpoints including CRUD operations with proper CREATE→READ→UPDATE→DELETE order.',
      },
    ],
  },
  documents_api: {
    description: 'Documents API test suite to verify document management endpoints.',
    tests: [
      {
        test: runDocumentsAPI,
        description: 'Tests all Documents API endpoints including file operations.',
      },
    ],
  },
  assemble_api: {
    description: 'Assemble API test suite to verify assembly management endpoints.',
    tests: [
      {
        test: runAssembleAPI,
        description: 'Tests all Assemble API endpoints including CRUD operations.',
      },
    ],
  },
  materials_api: {
    description: 'Materials API test suite to verify material management endpoints.',
    tests: [
      {
        test: runMaterialsAPI,
        description: 'Tests all Materials API endpoints including CRUD operations.',
      },
    ],
  },
  cbed_api: {
    description: 'CBED API test suite to verify assembly unit endpoints.',
    tests: [
      {
        test: runCBEDAPI,
        description: 'Tests all CBED API endpoints including CRUD operations with authentication.',
      },
    ],
  },
  products_api: {
    description: 'Products API test suite to verify product management endpoints.',
    tests: [
      {
        test: runProductsAPI,
        description: 'Tests all Products API endpoints including CRUD operations with specifications dependency.',
      },
    ],
  },
  orders_api: {
    description: 'Orders API test suite to verify order management endpoints.',
    tests: [
      {
        test: runOrdersAPI,
        description: 'Tests all Orders API endpoints including CRUD operations with user and product dependencies.',
      },
    ],
  },
  contacts_api: {
    description: 'Contacts API test suite to verify contact management endpoints.',
    tests: [
      {
        test: runContactsAPI,
        description: 'Tests all Contacts API endpoints including CRUD operations.',
      },
    ],
  },
  equipment_api: {
    description: 'Equipment API test suite to verify equipment management endpoints.',
    tests: [
      {
        test: runEquipmentAPI,
        description: 'Tests all Equipment API endpoints including CRUD operations.',
      },
    ],
  },
  inventory_api: {
    description: 'Inventory API test suite to verify inventory management endpoints.',
    tests: [
      {
        test: runInventoryAPI,
        description: 'Tests all Inventory API endpoints including CRUD operations.',
      },
    ],
  },
  parts_api: {
    description: 'Parts API test suite to verify parts management endpoints.',
    tests: [
      {
        test: runPartsAPI,
        description: 'Tests all Parts API endpoints including CRUD operations.',
      },
    ],
  },
  warehouse_api: {
    description: 'Warehouse API test suite to verify warehouse management endpoints.',
    tests: [
      {
        test: runWarehouseAPI,
        description: 'Tests all Warehouse API endpoints including CRUD operations.',
      },
    ],
  },
  specifications_api: {
    description: 'Specifications API test suite to verify specification management endpoints.',
    tests: [
      {
        test: runSpecificationsAPI,
        description: 'Tests all Specifications API endpoints including CRUD operations.',
      },
    ],
  },
  shipments_api: {
    description: 'Shipments API test suite to verify shipment management endpoints.',
    tests: [
      {
        test: runShipmentsAPI,
        description: 'Tests all Shipments API endpoints including CRUD operations.',
      },
    ],
  },
  manufacturing_api: {
    description: 'Manufacturing API test suite to verify manufacturing management endpoints.',
    tests: [
      {
        test: runManufacturingAPI,
        description: 'Tests all Manufacturing API endpoints including CRUD operations.',
      },
    ],
  },
  quality_api: {
    description: 'Quality API test suite to verify quality management endpoints.',
    tests: [
      {
        test: runQualityAPI,
        description: 'Tests all Quality API endpoints including CRUD operations.',
      },
    ],
  },
  maintenance_api: {
    description: 'Maintenance API test suite to verify maintenance management endpoints.',
    tests: [
      {
        test: runMaintenanceAPI,
        description: 'Tests all Maintenance API endpoints including CRUD operations.',
      },
    ],
  },
  analytics_api: {
    description: 'Analytics API test suite to verify analytics endpoints.',
    tests: [
      {
        test: runAnalyticsAPI,
        description: 'Tests all Analytics API endpoints including data retrieval operations.',
      },
    ],
  },
  notifications_api: {
    description: 'Notifications API test suite to verify notification management endpoints.',
    tests: [
      {
        test: runNotificationsAPI,
        description: 'Tests all Notifications API endpoints including CRUD operations.',
      },
    ],
  },
  settings_api: {
    description: 'Settings API test suite to verify settings management endpoints.',
    tests: [
      {
        test: runSettingsAPI,
        description: 'Tests all Settings API endpoints including CRUD operations.',
      },
    ],
  },
  logs_api: {
    description: 'Logs API test suite to verify log management endpoints.',
    tests: [
      {
        test: runLogsAPI,
        description: 'Tests all Logs API endpoints including retrieval operations.',
      },
    ],
  },
  files_api: {
    description: 'Files API test suite to verify file management endpoints.',
    tests: [
      {
        test: runFilesAPI,
        description: 'Tests all Files API endpoints including upload/download operations.',
      },
    ],
  },
  security_api: {
    description: 'Security API test suite to verify security management endpoints.',
    tests: [
      {
        test: runSecurityAPI,
        description: 'Tests all Security API endpoints including authentication operations.',
      },
    ],
  },
  backup_api: {
    description: 'Backup API test suite to verify backup management endpoints.',
    tests: [
      {
        test: runBackupAPI,
        description: 'Tests all Backup API endpoints including backup/restore operations.',
      },
    ],
  },
  monitoring_api: {
    description: 'Monitoring API test suite to verify monitoring endpoints.',
    tests: [
      {
        test: runMonitoringAPI,
        description: 'Tests all Monitoring API endpoints including metrics retrieval.',
      },
    ],
  },
  reports_api: {
    description: 'Reports API test suite to verify report management endpoints.',
    tests: [
      {
        test: runReportsAPI,
        description: 'Tests all Reports API endpoints including report generation.',
      },
    ],
  },
  integrations_api: {
    description: 'Integrations API test suite to verify integration management endpoints.',
    tests: [
      {
        test: runIntegrationsAPI,
        description: 'Tests all Integrations API endpoints including CRUD operations.',
      },
    ],
  },
  audit_api: {
    description: 'Audit API test suite to verify audit log endpoints.',
    tests: [
      {
        test: runAuditAPI,
        description: 'Tests all Audit API endpoints including log retrieval.',
      },
    ],
  },
  calendar_api: {
    description: 'Calendar API test suite to verify calendar management endpoints.',
    tests: [
      {
        test: runCalendarAPI,
        description: 'Tests all Calendar API endpoints including event management.',
      },
    ],
  },
  tasks_api: {
    description: 'Tasks API test suite to verify task management endpoints.',
    tests: [
      {
        test: runTasksAPI,
        description: 'Tests all Tasks API endpoints including CRUD operations.',
      },
    ],
  },
  chat_api: {
    description: 'Chat API test suite to verify chat management endpoints.',
    tests: [
      {
        test: runChatAPI,
        description: 'Tests all Chat API endpoints including messaging operations.',
      },
    ],
  },
  dashboard_api: {
    description: 'Dashboard API test suite to verify dashboard management endpoints.',
    tests: [
      {
        test: runDashboardAPI,
        description: 'Tests all Dashboard API endpoints including widget management.',
      },
    ],
  },
  search_api: {
    description: 'Search API test suite to verify search endpoints.',
    tests: [
      {
        test: runSearchAPI,
        description: 'Tests all Search API endpoints including search operations.',
      },
    ],
  },
  import_export_api: {
    description: 'Import/Export API test suite to verify data import/export endpoints.',
    tests: [
      {
        test: runImportExportAPI,
        description: 'Tests all Import/Export API endpoints including data operations.',
      },
    ],
  },
  messaging_api: {
    description: 'Messaging API test suite to verify messaging endpoints.',
    tests: [
      {
        test: runMessagingAPI,
        description: 'Tests all Messaging API endpoints including message operations.',
      },
    ],
  },
  templates_api: {
    description: 'Templates API test suite to verify template management endpoints.',
    tests: [
      {
        test: runTemplatesAPI,
        description: 'Tests all Templates API endpoints including CRUD operations.',
      },
    ],
  },
  workflows_api: {
    description: 'Workflows API test suite to verify workflow management endpoints.',
    tests: [
      {
        test: runWorkflowsAPI,
        description: 'Tests all Workflows API endpoints including workflow execution.',
      },
    ],
  },
  scheduling_api: {
    description: 'Scheduling API test suite to verify scheduling endpoints.',
    tests: [
      {
        test: runSchedulingAPI,
        description: 'Tests all Scheduling API endpoints including schedule management.',
      },
    ],
  },
  versioning_api: {
    description: 'Versioning API test suite to verify version management endpoints.',
    tests: [
      {
        test: runVersioningAPI,
        description: 'Tests all Versioning API endpoints including version control.',
      },
    ],
  },
  tech_process_api: {
    description: 'Tech Process API test suite to verify tech process management endpoints.',
    tests: [
      {
        test: runTechProcessAPI,
        description: 'Tests all Tech Process API endpoints including CRUD operations.',
      },
    ],
  },
  production_tasks_api: {
    description: 'Production Tasks API test suite to verify production task endpoints.',
    tests: [
      {
        test: runProductionTasksAPI,
        description: 'Tests all Production Tasks API endpoints including CRUD operations.',
      },
    ],
  },
  tools_api: {
    description: 'Tools API test suite to verify tool management endpoints.',
    tests: [
      {
        test: runToolsAPI,
        description: 'Tests all Tools API endpoints including CRUD operations.',
      },
    ],
  },
  all_api_tests: {
    description: 'Complete API test suite to verify all API endpoints.',
    tests: [
      {
        test: runAuthAPI,
        description: 'Tests authentication API endpoints including login and token validation.',
      },
      {
        test: runUsersAPI,
        description: 'Tests all Users API endpoints including CRUD operations.',
      },
      {
        test: runRolesAPI,
        description: 'Tests all Roles API endpoints including CRUD operations.',
      },
      {
        test: runDocumentsAPI,
        description: 'Tests all Documents API endpoints including file operations.',
      },
      {
        test: runAssembleAPI,
        description: 'Tests all Assemble API endpoints including CRUD operations.',
      },
      {
        test: runMaterialsAPI,
        description: 'Tests all Materials API endpoints including CRUD operations.',
      },
      {
        test: runCBEDAPI,
        description: 'Tests all CBED API endpoints including CRUD operations with authentication.',
      },
      {
        test: runProductsAPI,
        description: 'Tests all Products API endpoints including CRUD operations with specifications dependency.',
      },
      {
        test: runOrdersAPI,
        description: 'Tests all Orders API endpoints including CRUD operations with user and product dependencies.',
      },
      {
        test: runContactsAPI,
        description: 'Tests all Contacts API endpoints including CRUD operations with comprehensive defensive testing.',
      },
      {
        test: runEquipmentAPI,
        description: 'Tests all Equipment API endpoints including CRUD operations.',
      },
      {
        test: runInventoryAPI,
        description: 'Tests all Inventory API endpoints including CRUD operations.',
      },
      {
        test: runPartsAPI,
        description: 'Tests all Parts API endpoints including CRUD operations.',
      },
      {
        test: runWarehouseAPI,
        description: 'Tests all Warehouse API endpoints including CRUD operations.',
      },
      {
        test: runSpecificationsAPI,
        description: 'Tests all Specifications API endpoints including CRUD operations.',
      },
      {
        test: runShipmentsAPI,
        description: 'Tests all Shipments API endpoints including CRUD operations.',
      },
      {
        test: runManufacturingAPI,
        description: 'Tests all Manufacturing API endpoints including CRUD operations.',
      },
      {
        test: runQualityAPI,
        description: 'Tests all Quality API endpoints including CRUD operations.',
      },
      {
        test: runMaintenanceAPI,
        description: 'Tests all Maintenance API endpoints including CRUD operations.',
      },
      {
        test: runAnalyticsAPI,
        description: 'Tests all Analytics API endpoints including data retrieval operations.',
      },
      {
        test: runNotificationsAPI,
        description: 'Tests all Notifications API endpoints including CRUD operations.',
      },
      {
        test: runSettingsAPI,
        description: 'Tests all Settings API endpoints including CRUD operations.',
      },
      {
        test: runLogsAPI,
        description: 'Tests all Logs API endpoints including retrieval operations.',
      },
      {
        test: runFilesAPI,
        description: 'Tests all Files API endpoints including upload/download operations.',
      },
      {
        test: runSecurityAPI,
        description: 'Tests all Security API endpoints including authentication operations.',
      },
      {
        test: runBackupAPI,
        description: 'Tests all Backup API endpoints including backup/restore operations.',
      },
      {
        test: runMonitoringAPI,
        description: 'Tests all Monitoring API endpoints including metrics retrieval.',
      },
      {
        test: runReportsAPI,
        description: 'Tests all Reports API endpoints including report generation.',
      },
      {
        test: runIntegrationsAPI,
        description: 'Tests all Integrations API endpoints including CRUD operations.',
      },
      {
        test: runAuditAPI,
        description: 'Tests all Audit API endpoints including log retrieval.',
      },
      {
        test: runCalendarAPI,
        description: 'Tests all Calendar API endpoints including event management.',
      },
      {
        test: runTasksAPI,
        description: 'Tests all Tasks API endpoints including CRUD operations.',
      },
      {
        test: runChatAPI,
        description: 'Tests all Chat API endpoints including messaging operations.',
      },
      {
        test: runDashboardAPI,
        description: 'Tests all Dashboard API endpoints including widget management.',
      },
      {
        test: runSearchAPI,
        description: 'Tests all Search API endpoints including search operations.',
      },
      {
        test: runImportExportAPI,
        description: 'Tests all Import/Export API endpoints including data operations.',
      },
      {
        test: runMessagingAPI,
        description: 'Tests all Messaging API endpoints including message operations.',
      },
      {
        test: runTemplatesAPI,
        description: 'Tests all Templates API endpoints including CRUD operations.',
      },
      {
        test: runWorkflowsAPI,
        description: 'Tests all Workflows API endpoints including workflow execution.',
      },
      {
        test: runSchedulingAPI,
        description: 'Tests all Scheduling API endpoints including schedule management.',
      },
      {
        test: runVersioningAPI,
        description: 'Tests all Versioning API endpoints including version control.',
      },
      {
        test: runProductionTasksAPI,
        description: 'Tests all Production Tasks API endpoints including CRUD operations.',
      },
      {
        test: runToolsAPI,
        description: 'Tests all Tools API endpoints including CRUD operations.',
      },
    ],
  },
  CheckTableTotals: {
    description: 'Verifies that table row counts match the numeric values displayed in homepage cards.',
    tests: [
      {
        test: runCheckTableTotals,
        description: 'Check table totals functionality by comparing card values with actual table row counts.',
      },
    ],
  },
};
