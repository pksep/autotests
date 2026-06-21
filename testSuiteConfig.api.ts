/**
 * API test suites registry.
 * Merged with UI suites in testSuiteConfig.ts. TEST_SUITE keys (e.g. auth_api, all_api_tests) unchanged.
 */

import { runAPI001 } from './testcases/API/API001.spec';
import { runAuthAPI } from './testcases/API/APIAuth.spec';
import { runAuthAPINew } from './testcases/API/APIAuthNew.spec';
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
    description: 'Набор тестов API 001 для проверки функциональности, специфичной для API 001.',
    tests: [
      {
        test: runAPI001,
        description: 'Этот тест проверяет скорость ответа API 001.',
      },
    ],
  },
  auth_api: {
    description: 'Набор тестов Auth API для проверки эндпоинтов аутентификации.',
    tests: [{ test: runAuthAPI, description: 'Тестирует эндпоинты API аутентификации, включая вход и проверку токена.' }],
  },
  auth_api_new: {
    description: 'Новый набор тестов Auth API с комплексными тестами аутентификации.',
    tests: [{ test: runAuthAPINew, description: 'Тестирует эндпоинты API аутентификации, включая вход, проверку токена, обновление, выход и сценарии безопасности.' }],
  },
  users_api: {
    description: 'Набор тестов Users API для проверки эндпоинтов управления пользователями.',
    tests: [{ test: runUsersAPI, description: 'Тестирует все эндпоинты Users API, включая CRUD-операции.' }],
  },
  roles_api: {
    description: 'Набор тестов Roles API для проверки эндпоинтов управления ролями.',
    tests: [{ test: runRolesAPI, description: 'Тестирует все эндпоинты Roles API, включая CRUD-операции.' }],
  },
  details_api: {
    description: 'Набор тестов Details API для проверки эндпоинтов управления деталями.',
    tests: [{ test: runDetailsAPI, description: 'Тестирует все эндпоинты Details API, включая CRUD-операции с правильным порядком CREATE→READ→UPDATE→DELETE.' }],
  },
  documents_api: {
    description: 'Набор тестов Documents API для проверки эндпоинтов управления документами.',
    tests: [{ test: runDocumentsAPI, description: 'Тестирует все эндпоинты Documents API, включая операции с файлами.' }],
  },
  assemble_api: {
    description: 'Набор тестов Assemble API для проверки эндпоинтов управления сборками.',
    tests: [{ test: runAssembleAPI, description: 'Тестирует все эндпоинты Assemble API, включая CRUD-операции.' }],
  },
  materials_api: {
    description: 'Набор тестов Materials API для проверки эндпоинтов управления материалами.',
    tests: [{ test: runMaterialsAPI, description: 'Тестирует все эндпоинты Materials API, включая CRUD-операции.' }],
  },
  cbed_api: {
    description: 'Набор тестов CBED API для проверки эндпоинтов сборочных единиц.',
    tests: [{ test: runCBEDAPI, description: 'Тестирует все эндпоинты CBED API, включая CRUD-операции с аутентификацией.' }],
  },
  products_api: {
    description: 'Набор тестов Products API для проверки эндпоинтов управления изделиями.',
    tests: [{ test: runProductsAPI, description: 'Тестирует все эндпоинты Products API, включая CRUD-операции с зависимостью от спецификаций.' }],
  },
  orders_api: {
    description: 'Набор тестов Orders API для проверки эндпоинтов управления заказами.',
    tests: [{ test: runOrdersAPI, description: 'Тестирует все эндпоинты Orders API, включая CRUD-операции с зависимостями от пользователей и изделий.' }],
  },
  contacts_api: {
    description: 'Набор тестов Contacts API для проверки эндпоинтов управления контактами.',
    tests: [{ test: runContactsAPI, description: 'Тестирует все эндпоинты Contacts API, включая CRUD-операции.' }],
  },
  equipment_api: {
    description: 'Набор тестов Equipment API для проверки эндпоинтов управления оборудованием.',
    tests: [{ test: runEquipmentAPI, description: 'Тестирует все эндпоинты Equipment API, включая CRUD-операции.' }],
  },
  inventory_api: {
    description: 'Набор тестов Inventory API для проверки эндпоинтов управления инвентарем.',
    tests: [{ test: runInventoryAPI, description: 'Тестирует все эндпоинты Inventory API, включая CRUD-операции.' }],
  },
  parts_api: {
    description: 'Набор тестов Parts API для проверки эндпоинтов управления комплектующими.',
    tests: [{ test: runPartsAPI, description: 'Тестирует все эндпоинты Parts API, включая CRUD-операции.' }],
  },
  warehouse_api: {
    description: 'Набор тестов Warehouse API для проверки эндпоинтов управления складом.',
    tests: [{ test: runWarehouseAPI, description: 'Тестирует все эндпоинты Warehouse API, включая CRUD-операции.' }],
  },
  specifications_api: {
    description: 'Набор тестов Specifications API для проверки эндпоинтов управления спецификациями.',
    tests: [{ test: runSpecificationsAPI, description: 'Тестирует все эндпоинты Specifications API, включая CRUD-операции.' }],
  },
  shipments_api: {
    description: 'Набор тестов Shipments API для проверки эндпоинтов управления отгрузками.',
    tests: [{ test: runShipmentsAPI, description: 'Тестирует все эндпоинты Shipments API, включая CRUD-операции.' }],
  },
  manufacturing_api: {
    description: 'Набор тестов Manufacturing API для проверки эндпоинтов управления производством.',
    tests: [{ test: runManufacturingAPI, description: 'Тестирует все эндпоинты Manufacturing API, включая CRUD-операции.' }],
  },
  quality_api: {
    description: 'Набор тестов Quality API для проверки эндпоинтов управления качеством.',
    tests: [{ test: runQualityAPI, description: 'Тестирует все эндпоинты Quality API, включая CRUD-операции.' }],
  },
  maintenance_api: {
    description: 'Набор тестов Maintenance API для проверки эндпоинтов управления обслуживанием.',
    tests: [{ test: runMaintenanceAPI, description: 'Тестирует все эндпоинты Maintenance API, включая CRUD-операции.' }],
  },
  analytics_api: {
    description: 'Набор тестов Analytics API для проверки эндпоинтов аналитики.',
    tests: [{ test: runAnalyticsAPI, description: 'Тестирует все эндпоинты Analytics API, включая операции получения данных.' }],
  },
  notifications_api: {
    description: 'Набор тестов Notifications API для проверки эндпоинтов управления уведомлениями.',
    tests: [{ test: runNotificationsAPI, description: 'Тестирует все эндпоинты Notifications API, включая CRUD-операции.' }],
  },
  settings_api: {
    description: 'Набор тестов Settings API для проверки эндпоинтов управления настройками.',
    tests: [{ test: runSettingsAPI, description: 'Тестирует все эндпоинты Settings API, включая CRUD-операции.' }],
  },
  logs_api: {
    description: 'Набор тестов Logs API для проверки эндпоинтов управления логами.',
    tests: [{ test: runLogsAPI, description: 'Тестирует все эндпоинты Logs API, включая операции получения.' }],
  },
  files_api: {
    description: 'Набор тестов Files API для проверки эндпоинтов управления файлами.',
    tests: [{ test: runFilesAPI, description: 'Тестирует все эндпоинты Files API, включая операции загрузки/скачивания.' }],
  },
  security_api: {
    description: 'Набор тестов Security API для проверки эндпоинтов управления безопасностью.',
    tests: [{ test: runSecurityAPI, description: 'Тестирует все эндпоинты Security API, включая операции аутентификации.' }],
  },
  backup_api: {
    description: 'Набор тестов Backup API для проверки эндпоинтов управления резервным копированием.',
    tests: [{ test: runBackupAPI, description: 'Тестирует все эндпоинты Backup API, включая операции создания/восстановления резервных копий.' }],
  },
  monitoring_api: {
    description: 'Набор тестов Monitoring API для проверки эндпоинтов мониторинга.',
    tests: [{ test: runMonitoringAPI, description: 'Тестирует все эндпоинты Monitoring API, включая получение метрик.' }],
  },
  reports_api: {
    description: 'Набор тестов Reports API для проверки эндпоинтов управления отчетами.',
    tests: [{ test: runReportsAPI, description: 'Тестирует все эндпоинты Reports API, включая генерацию отчетов.' }],
  },
  integrations_api: {
    description: 'Набор тестов Integrations API для проверки эндпоинтов управления интеграциями.',
    tests: [{ test: runIntegrationsAPI, description: 'Тестирует все эндпоинты Integrations API, включая CRUD-операции.' }],
  },
  audit_api: {
    description: 'Набор тестов Audit API для проверки эндпоинтов журнала аудита.',
    tests: [{ test: runAuditAPI, description: 'Тестирует все эндпоинты Audit API, включая получение журналов.' }],
  },
  calendar_api: {
    description: 'Набор тестов Calendar API для проверки эндпоинтов управления календарем.',
    tests: [{ test: runCalendarAPI, description: 'Тестирует все эндпоинты Calendar API, включая управление событиями.' }],
  },
  tasks_api: {
    description: 'Набор тестов Tasks API для проверки эндпоинтов управления задачами.',
    tests: [{ test: runTasksAPI, description: 'Тестирует все эндпоинты Tasks API, включая CRUD-операции.' }],
  },
  chat_api: {
    description: 'Набор тестов Chat API для проверки эндпоинтов управления чатом.',
    tests: [{ test: runChatAPI, description: 'Тестирует все эндпоинты Chat API, включая операции обмена сообщениями.' }],
  },
  dashboard_api: {
    description: 'Набор тестов Dashboard API для проверки эндпоинтов управления дашбордом.',
    tests: [{ test: runDashboardAPI, description: 'Тестирует все эндпоинты Dashboard API, включая управление виджетами.' }],
  },
  search_api: {
    description: 'Набор тестов Search API для проверки эндпоинтов поиска.',
    tests: [{ test: runSearchAPI, description: 'Тестирует все эндпоинты Search API, включая операции поиска.' }],
  },
  import_export_api: {
    description: 'Набор тестов Import/Export API для проверки эндпоинтов импорта/экспорта данных.',
    tests: [{ test: runImportExportAPI, description: 'Тестирует все эндпоинты Import/Export API, включая операции с данными.' }],
  },
  messaging_api: {
    description: 'Набор тестов Messaging API для проверки эндпоинтов обмена сообщениями.',
    tests: [{ test: runMessagingAPI, description: 'Тестирует все эндпоинты Messaging API, включая операции с сообщениями.' }],
  },
  templates_api: {
    description: 'Набор тестов Templates API для проверки эндпоинтов управления шаблонами.',
    tests: [{ test: runTemplatesAPI, description: 'Тестирует все эндпоинты Templates API, включая CRUD-операции.' }],
  },
  workflows_api: {
    description: 'Набор тестов Workflows API для проверки эндпоинтов управления рабочими процессами.',
    tests: [{ test: runWorkflowsAPI, description: 'Тестирует все эндпоинты Workflows API, включая выполнение рабочих процессов.' }],
  },
  scheduling_api: {
    description: 'Набор тестов Scheduling API для проверки эндпоинтов расписаний.',
    tests: [{ test: runSchedulingAPI, description: 'Тестирует все эндпоинты Scheduling API, включая управление расписаниями.' }],
  },
  versioning_api: {
    description: 'Набор тестов Versioning API для проверки эндпоинтов управления версиями.',
    tests: [{ test: runVersioningAPI, description: 'Тестирует все эндпоинты Versioning API, включая контроль версий.' }],
  },
  tech_process_api: {
    description: 'Набор тестов Tech Process API для проверки эндпоинтов управления техпроцессами.',
    tests: [{ test: runTechProcessAPI, description: 'Тестирует все эндпоинты Tech Process API, включая CRUD-операции.' }],
  },
  production_tasks_api: {
    description: 'Набор тестов Production Tasks API для проверки эндпоинтов производственных заданий.',
    tests: [{ test: runProductionTasksAPI, description: 'Тестирует все эндпоинты Production Tasks API, включая CRUD-операции.' }],
  },
  tools_api: {
    description: 'Набор тестов Tools API для проверки эндпоинтов управления инструментами.',
    tests: [{ test: runToolsAPI, description: 'Тестирует все эндпоинты Tools API, включая CRUD-операции.' }],
  },
  
  all_api_tests: {
    description: 'Полный набор тестов API для проверки всех эндпоинтов API.',
    tests: [
      { test: runAuthAPI, description: 'Тестирует эндпоинты API аутентификации, включая вход и проверку токена.' },
      { test: runAuthAPINew, description: 'Тестирует эндпоинты API аутентификации, включая вход, проверку токена, обновление, выход и сценарии безопасности.' },
      { test: runUsersAPI, description: 'Тестирует все эндпоинты Users API, включая CRUD-операции.' },
      { test: runRolesAPI, description: 'Тестирует все эндпоинты Roles API, включая CRUD-операции.' },
      { test: runDocumentsAPI, description: 'Тестирует все эндпоинты Documents API, включая операции с файлами.' },
      { test: runAssembleAPI, description: 'Тестирует все эндпоинты Assemble API, включая CRUD-операции.' },
      { test: runMaterialsAPI, description: 'Тестирует все эндпоинты Materials API, включая CRUD-операции.' },
      { test: runCBEDAPI, description: 'Тестирует все эндпоинты CBED API, включая CRUD-операции с аутентификацией.' },
      { test: runProductsAPI, description: 'Тестирует все эндпоинты Products API, включая CRUD-операции с зависимостью от спецификаций.' },
      { test: runOrdersAPI, description: 'Тестирует все эндпоинты Orders API, включая CRUD-операции с зависимостями от пользователей и изделий.' },
      { test: runContactsAPI, description: 'Тестирует все эндпоинты Contacts API, включая CRUD-операции с комплексным защитным тестированием.' },
      { test: runEquipmentAPI, description: 'Тестирует все эндпоинты Equipment API, включая CRUD-операции.' },
      { test: runInventoryAPI, description: 'Тестирует все эндпоинты Inventory API, включая CRUD-операции.' },
      { test: runPartsAPI, description: 'Тестирует все эндпоинты Parts API, включая CRUD-операции.' },
      { test: runWarehouseAPI, description: 'Тестирует все эндпоинты Warehouse API, включая CRUD-операции.' },
      { test: runSpecificationsAPI, description: 'Тестирует все эндпоинты Specifications API, включая CRUD-операции.' },
      { test: runShipmentsAPI, description: 'Тестирует все эндпоинты Shipments API, включая CRUD-операции.' },
      { test: runManufacturingAPI, description: 'Тестирует все эндпоинты Manufacturing API, включая CRUD-операции.' },
      { test: runQualityAPI, description: 'Тестирует все эндпоинты Quality API, включая CRUD-операции.' },
      { test: runMaintenanceAPI, description: 'Тестирует все эндпоинты Maintenance API, включая CRUD-операции.' },
      { test: runAnalyticsAPI, description: 'Тестирует все эндпоинты Analytics API, включая операции получения данных.' },
      { test: runNotificationsAPI, description: 'Тестирует все эндпоинты Notifications API, включая CRUD-операции.' },
      { test: runSettingsAPI, description: 'Тестирует все эндпоинты Settings API, включая CRUD-операции.' },
      { test: runLogsAPI, description: 'Тестирует все эндпоинты Logs API, включая операции получения.' },
      { test: runFilesAPI, description: 'Тестирует все эндпоинты Files API, включая операции загрузки/скачивания.' },
      { test: runSecurityAPI, description: 'Тестирует все эндпоинты Security API, включая операции аутентификации.' },
      { test: runBackupAPI, description: 'Тестирует все эндпоинты Backup API, включая операции создания/восстановления резервных копий.' },
      { test: runMonitoringAPI, description: 'Тестирует все эндпоинты Monitoring API, включая получение метрик.' },
      { test: runReportsAPI, description: 'Тестирует все эндпоинты Reports API, включая генерацию отчетов.' },
      { test: runIntegrationsAPI, description: 'Тестирует все эндпоинты Integrations API, включая CRUD-операции.' },
      { test: runAuditAPI, description: 'Тестирует все эндпоинты Audit API, включая получение журналов.' },
      { test: runCalendarAPI, description: 'Тестирует все эндпоинты Calendar API, включая управление событиями.' },
      { test: runTasksAPI, description: 'Тестирует все эндпоинты Tasks API, включая CRUD-операции.' },
      { test: runChatAPI, description: 'Тестирует все эндпоинты Chat API, включая операции обмена сообщениями.' },
      { test: runDashboardAPI, description: 'Тестирует все эндпоинты Dashboard API, включая управление виджетами.' },
      { test: runSearchAPI, description: 'Тестирует все эндпоинты Search API, включая операции поиска.' },
      { test: runImportExportAPI, description: 'Тестирует все эндпоинты Import/Export API, включая операции с данными.' },
      { test: runMessagingAPI, description: 'Тестирует все эндпоинты Messaging API, включая операции с сообщениями.' },
      { test: runTemplatesAPI, description: 'Тестирует все эндпоинты Templates API, включая CRUD-операции.' },
      { test: runWorkflowsAPI, description: 'Тестирует все эндпоинты Workflows API, включая выполнение рабочих процессов.' },
      { test: runSchedulingAPI, description: 'Тестирует все эндпоинты Scheduling API, включая управление расписаниями.' },
      { test: runVersioningAPI, description: 'Тестирует все эндпоинты Versioning API, включая контроль версий.' },
      { test: runProductionTasksAPI, description: 'Тестирует все эндпоинты Production Tasks API, включая CRUD-операции.' },
      { test: runToolsAPI, description: 'Тестирует все эндпоинты Tools API, включая CRUD-операции.' },
    ],
  },
};
