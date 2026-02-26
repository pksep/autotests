/**
 * API test suites registry.
 * Merged with UI suites in testSuiteConfig.ts. TEST_SUITE keys (e.g. auth_api, all_api_tests) unchanged.
 */

import { runAPI001 } from './testcases/API/API001.spec';
import { runAuthAPI } from './testcases/API/APIAuth.spec';
import { runUsersAPI } from './testcases/API/APIUsers.spec';
import { runRolesAPI } from './testcases/API/APIRoles.spec';
import { runDetailsAPI } from './testcases/API/APIDetails.spec';
import { runDocumentsAPI } from './testcases/API/APIDocuments.spec';
import { runAssembleAPI } from './testcases/API/APIAssemble.spec';
import { runMaterialsAPI } from './testcases/API/APIMaterials.spec';
import { runCBEDAPI } from './testcases/API/APICBED.spec';
import { runProductsAPI } from './testcases/API/APIProducts.spec';
import { runOrdersAPI } from './testcases/API/APIOrders.spec';
import { runProductionTasksAPI } from './testcases/API/APIProductionTasks.spec';
import { runEquipmentAPI } from './testcases/API/APIEquipment.spec';
import { runToolsAPI } from './testcases/API/APITools.spec';
import { runInventoryAPI } from './testcases/API/APIInventory.spec';
import { runPartsAPI } from './testcases/API/APIParts.spec';
import { runWarehouseAPI } from './testcases/API/APIWarehouse.spec';
import { runContactsAPI } from './testcases/API/APIContacts.spec';
import { runSpecificationsAPI } from './testcases/API/APISpecifications.spec';
import { runShipmentsAPI } from './testcases/API/APIShipments.spec';
import { runManufacturingAPI } from './testcases/API/APIManufacturing.spec';
import { runQualityAPI } from './testcases/API/APIQuality.spec';
import { runMaintenanceAPI } from './testcases/API/APIMaintenance.spec';
import { runAnalyticsAPI } from './testcases/API/APIAnalytics.spec';
import { runNotificationsAPI } from './testcases/API/APINotifications.spec';
import { runSettingsAPI } from './testcases/API/APISettings.spec';
import { runLogsAPI } from './testcases/API/APILogs.spec';
import { runFilesAPI } from './testcases/API/APIFiles.spec';
import { runSecurityAPI } from './testcases/API/APISecurity.spec';
import { runBackupAPI } from './testcases/API/APIBackup.spec';
import { runMonitoringAPI } from './testcases/API/APIMonitoring.spec';
import { runAuditAPI } from './testcases/API/APIAudit.spec';
import { runCalendarAPI } from './testcases/API/APICalendar.spec';
import { runIntegrationsAPI } from './testcases/API/APIIntegrations.spec';
import { runReportsAPI } from './testcases/API/APIReports.spec';
import { runTasksAPI } from './testcases/API/APITasks.spec';
import { runChatAPI } from './testcases/API/APIChat.spec';
import { runDashboardAPI } from './testcases/API/APIDashboard.spec';
import { runImportExportAPI } from './testcases/API/APIImportExport.spec';
import { runSearchAPI } from './testcases/API/APISearch.spec';
import { runTemplatesAPI } from './testcases/API/APITemplates.spec';
import { runMessagingAPI } from './testcases/API/APIMessaging.spec';
import { runSchedulingAPI } from './testcases/API/APIScheduling.spec';
import { runWorkflowsAPI } from './testcases/API/APIWorkflows.spec';
import { runVersioningAPI } from './testcases/API/APIVersioning.spec';
import { runTechProcessAPI } from './testcases/API/APITechProcess.spec';

export const apiSuites = {
  api001: {
    description: 'API 001 test suite to verify functionalities specific to API 001.',
    tests: [
      {
        test: runAPI001,
        description: 'This test checks the responsiveness of API 001.',
      },
    ],
  },
  auth_api: {
    description: 'Auth API test suite to verify authentication endpoints.',
    tests: [{ test: runAuthAPI, description: 'Tests authentication API endpoints including login and token validation.' }],
  },
  users_api: {
    description: 'Users API test suite to verify user management endpoints.',
    tests: [{ test: runUsersAPI, description: 'Tests all Users API endpoints including CRUD operations.' }],
  },
  roles_api: {
    description: 'Roles API test suite to verify role management endpoints.',
    tests: [{ test: runRolesAPI, description: 'Tests all Roles API endpoints including CRUD operations.' }],
  },
  details_api: {
    description: 'Details API test suite to verify detail management endpoints.',
    tests: [{ test: runDetailsAPI, description: 'Tests all Details API endpoints including CRUD operations with proper CREATE→READ→UPDATE→DELETE order.' }],
  },
  documents_api: {
    description: 'Documents API test suite to verify document management endpoints.',
    tests: [{ test: runDocumentsAPI, description: 'Tests all Documents API endpoints including file operations.' }],
  },
  assemble_api: {
    description: 'Assemble API test suite to verify assembly management endpoints.',
    tests: [{ test: runAssembleAPI, description: 'Tests all Assemble API endpoints including CRUD operations.' }],
  },
  materials_api: {
    description: 'Materials API test suite to verify material management endpoints.',
    tests: [{ test: runMaterialsAPI, description: 'Tests all Materials API endpoints including CRUD operations.' }],
  },
  cbed_api: {
    description: 'CBED API test suite to verify assembly unit endpoints.',
    tests: [{ test: runCBEDAPI, description: 'Tests all CBED API endpoints including CRUD operations with authentication.' }],
  },
  products_api: {
    description: 'Products API test suite to verify product management endpoints.',
    tests: [{ test: runProductsAPI, description: 'Tests all Products API endpoints including CRUD operations with specifications dependency.' }],
  },
  orders_api: {
    description: 'Orders API test suite to verify order management endpoints.',
    tests: [{ test: runOrdersAPI, description: 'Tests all Orders API endpoints including CRUD operations with user and product dependencies.' }],
  },
  contacts_api: {
    description: 'Contacts API test suite to verify contact management endpoints.',
    tests: [{ test: runContactsAPI, description: 'Tests all Contacts API endpoints including CRUD operations.' }],
  },
  equipment_api: {
    description: 'Equipment API test suite to verify equipment management endpoints.',
    tests: [{ test: runEquipmentAPI, description: 'Tests all Equipment API endpoints including CRUD operations.' }],
  },
  inventory_api: {
    description: 'Inventory API test suite to verify inventory management endpoints.',
    tests: [{ test: runInventoryAPI, description: 'Tests all Inventory API endpoints including CRUD operations.' }],
  },
  parts_api: {
    description: 'Parts API test suite to verify parts management endpoints.',
    tests: [{ test: runPartsAPI, description: 'Tests all Parts API endpoints including CRUD operations.' }],
  },
  warehouse_api: {
    description: 'Warehouse API test suite to verify warehouse management endpoints.',
    tests: [{ test: runWarehouseAPI, description: 'Tests all Warehouse API endpoints including CRUD operations.' }],
  },
  specifications_api: {
    description: 'Specifications API test suite to verify specification management endpoints.',
    tests: [{ test: runSpecificationsAPI, description: 'Tests all Specifications API endpoints including CRUD operations.' }],
  },
  shipments_api: {
    description: 'Shipments API test suite to verify shipment management endpoints.',
    tests: [{ test: runShipmentsAPI, description: 'Tests all Shipments API endpoints including CRUD operations.' }],
  },
  manufacturing_api: {
    description: 'Manufacturing API test suite to verify manufacturing management endpoints.',
    tests: [{ test: runManufacturingAPI, description: 'Tests all Manufacturing API endpoints including CRUD operations.' }],
  },
  quality_api: {
    description: 'Quality API test suite to verify quality management endpoints.',
    tests: [{ test: runQualityAPI, description: 'Tests all Quality API endpoints including CRUD operations.' }],
  },
  maintenance_api: {
    description: 'Maintenance API test suite to verify maintenance management endpoints.',
    tests: [{ test: runMaintenanceAPI, description: 'Tests all Maintenance API endpoints including CRUD operations.' }],
  },
  analytics_api: {
    description: 'Analytics API test suite to verify analytics endpoints.',
    tests: [{ test: runAnalyticsAPI, description: 'Tests all Analytics API endpoints including data retrieval operations.' }],
  },
  notifications_api: {
    description: 'Notifications API test suite to verify notification management endpoints.',
    tests: [{ test: runNotificationsAPI, description: 'Tests all Notifications API endpoints including CRUD operations.' }],
  },
  settings_api: {
    description: 'Settings API test suite to verify settings management endpoints.',
    tests: [{ test: runSettingsAPI, description: 'Tests all Settings API endpoints including CRUD operations.' }],
  },
  logs_api: {
    description: 'Logs API test suite to verify log management endpoints.',
    tests: [{ test: runLogsAPI, description: 'Tests all Logs API endpoints including retrieval operations.' }],
  },
  files_api: {
    description: 'Files API test suite to verify file management endpoints.',
    tests: [{ test: runFilesAPI, description: 'Tests all Files API endpoints including upload/download operations.' }],
  },
  security_api: {
    description: 'Security API test suite to verify security management endpoints.',
    tests: [{ test: runSecurityAPI, description: 'Tests all Security API endpoints including authentication operations.' }],
  },
  backup_api: {
    description: 'Backup API test suite to verify backup management endpoints.',
    tests: [{ test: runBackupAPI, description: 'Tests all Backup API endpoints including backup/restore operations.' }],
  },
  monitoring_api: {
    description: 'Monitoring API test suite to verify monitoring endpoints.',
    tests: [{ test: runMonitoringAPI, description: 'Tests all Monitoring API endpoints including metrics retrieval.' }],
  },
  reports_api: {
    description: 'Reports API test suite to verify report management endpoints.',
    tests: [{ test: runReportsAPI, description: 'Tests all Reports API endpoints including report generation.' }],
  },
  integrations_api: {
    description: 'Integrations API test suite to verify integration management endpoints.',
    tests: [{ test: runIntegrationsAPI, description: 'Tests all Integrations API endpoints including CRUD operations.' }],
  },
  audit_api: {
    description: 'Audit API test suite to verify audit log endpoints.',
    tests: [{ test: runAuditAPI, description: 'Tests all Audit API endpoints including log retrieval.' }],
  },
  calendar_api: {
    description: 'Calendar API test suite to verify calendar management endpoints.',
    tests: [{ test: runCalendarAPI, description: 'Tests all Calendar API endpoints including event management.' }],
  },
  tasks_api: {
    description: 'Tasks API test suite to verify task management endpoints.',
    tests: [{ test: runTasksAPI, description: 'Tests all Tasks API endpoints including CRUD operations.' }],
  },
  chat_api: {
    description: 'Chat API test suite to verify chat management endpoints.',
    tests: [{ test: runChatAPI, description: 'Tests all Chat API endpoints including messaging operations.' }],
  },
  dashboard_api: {
    description: 'Dashboard API test suite to verify dashboard management endpoints.',
    tests: [{ test: runDashboardAPI, description: 'Tests all Dashboard API endpoints including widget management.' }],
  },
  search_api: {
    description: 'Search API test suite to verify search endpoints.',
    tests: [{ test: runSearchAPI, description: 'Tests all Search API endpoints including search operations.' }],
  },
  import_export_api: {
    description: 'Import/Export API test suite to verify data import/export endpoints.',
    tests: [{ test: runImportExportAPI, description: 'Tests all Import/Export API endpoints including data operations.' }],
  },
  messaging_api: {
    description: 'Messaging API test suite to verify messaging endpoints.',
    tests: [{ test: runMessagingAPI, description: 'Tests all Messaging API endpoints including message operations.' }],
  },
  templates_api: {
    description: 'Templates API test suite to verify template management endpoints.',
    tests: [{ test: runTemplatesAPI, description: 'Tests all Templates API endpoints including CRUD operations.' }],
  },
  workflows_api: {
    description: 'Workflows API test suite to verify workflow management endpoints.',
    tests: [{ test: runWorkflowsAPI, description: 'Tests all Workflows API endpoints including workflow execution.' }],
  },
  scheduling_api: {
    description: 'Scheduling API test suite to verify scheduling endpoints.',
    tests: [{ test: runSchedulingAPI, description: 'Tests all Scheduling API endpoints including schedule management.' }],
  },
  versioning_api: {
    description: 'Versioning API test suite to verify version management endpoints.',
    tests: [{ test: runVersioningAPI, description: 'Tests all Versioning API endpoints including version control.' }],
  },
  tech_process_api: {
    description: 'Tech Process API test suite to verify tech process management endpoints.',
    tests: [{ test: runTechProcessAPI, description: 'Tests all Tech Process API endpoints including CRUD operations.' }],
  },
  production_tasks_api: {
    description: 'Production Tasks API test suite to verify production task endpoints.',
    tests: [{ test: runProductionTasksAPI, description: 'Tests all Production Tasks API endpoints including CRUD operations.' }],
  },
  tools_api: {
    description: 'Tools API test suite to verify tool management endpoints.',
    tests: [{ test: runToolsAPI, description: 'Tests all Tools API endpoints including CRUD operations.' }],
  },
  all_api_tests: {
    description: 'Complete API test suite to verify all API endpoints.',
    tests: [
      { test: runAuthAPI, description: 'Tests authentication API endpoints including login and token validation.' },
      { test: runUsersAPI, description: 'Tests all Users API endpoints including CRUD operations.' },
      { test: runRolesAPI, description: 'Tests all Roles API endpoints including CRUD operations.' },
      { test: runDocumentsAPI, description: 'Tests all Documents API endpoints including file operations.' },
      { test: runAssembleAPI, description: 'Tests all Assemble API endpoints including CRUD operations.' },
      { test: runMaterialsAPI, description: 'Tests all Materials API endpoints including CRUD operations.' },
      { test: runCBEDAPI, description: 'Tests all CBED API endpoints including CRUD operations with authentication.' },
      { test: runProductsAPI, description: 'Tests all Products API endpoints including CRUD operations with specifications dependency.' },
      { test: runOrdersAPI, description: 'Tests all Orders API endpoints including CRUD operations with user and product dependencies.' },
      { test: runContactsAPI, description: 'Tests all Contacts API endpoints including CRUD operations with comprehensive defensive testing.' },
      { test: runEquipmentAPI, description: 'Tests all Equipment API endpoints including CRUD operations.' },
      { test: runInventoryAPI, description: 'Tests all Inventory API endpoints including CRUD operations.' },
      { test: runPartsAPI, description: 'Tests all Parts API endpoints including CRUD operations.' },
      { test: runWarehouseAPI, description: 'Tests all Warehouse API endpoints including CRUD operations.' },
      { test: runSpecificationsAPI, description: 'Tests all Specifications API endpoints including CRUD operations.' },
      { test: runShipmentsAPI, description: 'Tests all Shipments API endpoints including CRUD operations.' },
      { test: runManufacturingAPI, description: 'Tests all Manufacturing API endpoints including CRUD operations.' },
      { test: runQualityAPI, description: 'Tests all Quality API endpoints including CRUD operations.' },
      { test: runMaintenanceAPI, description: 'Tests all Maintenance API endpoints including CRUD operations.' },
      { test: runAnalyticsAPI, description: 'Tests all Analytics API endpoints including data retrieval operations.' },
      { test: runNotificationsAPI, description: 'Tests all Notifications API endpoints including CRUD operations.' },
      { test: runSettingsAPI, description: 'Tests all Settings API endpoints including CRUD operations.' },
      { test: runLogsAPI, description: 'Tests all Logs API endpoints including retrieval operations.' },
      { test: runFilesAPI, description: 'Tests all Files API endpoints including upload/download operations.' },
      { test: runSecurityAPI, description: 'Tests all Security API endpoints including authentication operations.' },
      { test: runBackupAPI, description: 'Tests all Backup API endpoints including backup/restore operations.' },
      { test: runMonitoringAPI, description: 'Tests all Monitoring API endpoints including metrics retrieval.' },
      { test: runReportsAPI, description: 'Tests all Reports API endpoints including report generation.' },
      { test: runIntegrationsAPI, description: 'Tests all Integrations API endpoints including CRUD operations.' },
      { test: runAuditAPI, description: 'Tests all Audit API endpoints including log retrieval.' },
      { test: runCalendarAPI, description: 'Tests all Calendar API endpoints including event management.' },
      { test: runTasksAPI, description: 'Tests all Tasks API endpoints including CRUD operations.' },
      { test: runChatAPI, description: 'Tests all Chat API endpoints including messaging operations.' },
      { test: runDashboardAPI, description: 'Tests all Dashboard API endpoints including widget management.' },
      { test: runSearchAPI, description: 'Tests all Search API endpoints including search operations.' },
      { test: runImportExportAPI, description: 'Tests all Import/Export API endpoints including data operations.' },
      { test: runMessagingAPI, description: 'Tests all Messaging API endpoints including message operations.' },
      { test: runTemplatesAPI, description: 'Tests all Templates API endpoints including CRUD operations.' },
      { test: runWorkflowsAPI, description: 'Tests all Workflows API endpoints including workflow execution.' },
      { test: runSchedulingAPI, description: 'Tests all Scheduling API endpoints including schedule management.' },
      { test: runVersioningAPI, description: 'Tests all Versioning API endpoints including version control.' },
      { test: runProductionTasksAPI, description: 'Tests all Production Tasks API endpoints including CRUD operations.' },
      { test: runToolsAPI, description: 'Tests all Tools API endpoints including CRUD operations.' },
    ],
  },
};
