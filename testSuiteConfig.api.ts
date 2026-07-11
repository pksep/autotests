/**
 * API test suites registry.
 * Only APIAuth.spec.ts remains in testcases/API.
 */

import { runAuthAPINew } from './testcases/API/APIAuth.spec';
import { runAssembleAPINew } from './testcases/API/APIAssemble.spec';
import { runActionsAPINew } from './testcases/API/APIActions.spec';
import { runActionsChainAPINew } from './testcases/API/APIActionsChain.spec';
import { runBuyerAPINew } from './testcases/API/APIBuyer.spec';
import { runCBEDAPINew } from './testcases/API/APICBED.spec';
import { runCommentsAPINew } from './testcases/API/APIComments.spec';
import { runCompaniesAPINew } from './testcases/API/APICompanies.spec';
import { runContactsAPINew } from './testcases/API/APIContacts.spec';
import { runDeficitsAPINew } from './testcases/API/APIDeficits.spec';
import { runDetailsAPINew } from './testcases/API/APIDetails.spec';
import { runDocumentsAPINew } from './testcases/API/APIDocuments.spec';
import { runEquipmentAPINew } from './testcases/API/APIEquipment.spec';
import { runExclusionAPINew } from './testcases/API/APIExclusion.spec';
import { runExpenditureAPINew } from './testcases/API/APIExpenditure.spec';
import { runInventoryAPINew } from './testcases/API/APIInventory.spec';
import { runMaterialsAPINew } from './testcases/API/APIMaterials.spec';
import { runMaintenanceAPINew } from './testcases/API/APIMaintenance.spec';
import { runMetaloworkingAPINew } from './testcases/API/APIMetaloworking.spec';
import { runMarksAPINew } from './testcases/API/APIMarks.spec';
import { runMovementErrorsAPINew } from './testcases/API/APIMovementErrors.spec';
import { runMovementObjectAPINew } from './testcases/API/APIMovementObject.spec';
import { runMovingAPINew } from './testcases/API/APIMoving.spec';
import { runNeo4jAPINew } from './testcases/API/APINeo4j.spec';
import { runNegativeCoverageAPINew } from './testcases/API/APINegativeCoverage.spec';
import { runNotificationAPINew } from './testcases/API/APINotification.spec';
import { runProductionTasksAPINew } from './testcases/API/APIProductionTasks.spec';
import { runProductionShipmentFlowAPI } from './testcases/API/APIProductionShipmentFlow.spec';
import { runProviderAPINew } from './testcases/API/APIProvider.spec';
import { runProviderDeliveriesAPINew } from './testcases/API/APIProviderDeliveries.spec';
import { runRackAPINew } from './testcases/API/APIRack.spec';
import { runProductsAPINew } from './testcases/API/APIProducts.spec';
import { runOperationAPINew } from './testcases/API/APIOperation.spec';
import { runRolesAPINew } from './testcases/API/APIRoles.spec';
import { runSettingsAPINew } from './testcases/API/APISettings.spec';
import { runShipmentsAPINew } from './testcases/API/APIShipments.spec';
import { runSolidworksAPINew } from './testcases/API/APISolidworks.spec';
import { runSpecificationAPINew } from './testcases/API/APISpecification.spec';
import { runStockOrderAPINew } from './testcases/API/APIStockOrder.spec';
import { runSupplyAPINew } from './testcases/API/APISupply.spec';
import { runTechProcessAPINew } from './testcases/API/APITechProcess.spec';
import { runToolsAPINew } from './testcases/API/APITools.spec';
import { runUsersAPINew } from './testcases/API/APIUsers.spec';
import { runWarehouseAPINew } from './testcases/API/APIWarehouse.spec';
import { runWaybillAPINew } from './testcases/API/APIWaybill.spec';
import { runWaybillProviderFlowAPI } from './testcases/API/APIWaybillProviderFlow.spec';
import { runHealthChecksAPINew } from './testcases/API/APIHealthChecks.spec';

const apiSuitesByModule = {
  auth_api: {
    description: 'Набор тестов Auth API для проверки эндпоинтов аутентификации.',
    tests: [
      {
        test: runAuthAPINew,
        description:
          'Тестирует эндпоинты API аутентификации, включая вход, проверку токена, обновление, выход и сценарии безопасности.'
      }
    ]
  },

  buyer_api: {
    description: 'Набор тестов Buyer API для проверки покупателей, архива, include и defensive-сценариев.',
    tests: [
      {
        test: runBuyerAPINew,
        description:
          'Тестирует api/buyer: создание, чтение, обновление, архив, пагинацию, include, attach-file endpoint и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  comments_api: {
    description: 'Набор тестов Comments API для проверки комментариев по entity/thread и defensive-сценариев.',
    tests: [
      {
        test: runCommentsAPINew,
        description:
          'Тестирует api/comments: чтение по entity/thread, создание, обновление, pin/unpin, удаление и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  deficits_api: {
    description: 'Набор тестов Deficits API для таблиц дефицитов, дефицитов материалов и defensive-сценариев.',
    tests: [
      {
        test: runDeficitsAPINew,
        description:
          'Тестирует эндпоинты api/deficits: table_deficit, materials, materialparents, materialonecshipments и безопасную обработку невалидных запросов.'
      }
    ]
  },

  marks_api: {
    description: 'Набор тестов Marks API для отметок выполнения и результатов работ.',
    tests: [
      {
        test: runMarksAPINew,
        description:
          'Тестирует эндпоинты api/marks: список отметок, результаты работ, отметки по операции, чтение по id и defensive-сценарии мутаций.'
      }
    ]
  },

  actions_api: {
    description: 'Набор тестов Actions API для чтения действий по параметрам и defensive-сценариев.',
    tests: [
      {
        test: runActionsAPINew,
        description:
          'Тестирует api/actions/get-by-params с базовыми фильтрами, поиском, спецсимволами и невалидным контрактом.'
      }
    ]
  },

  actions_chain_api: {
    description: 'Набор тестов Actions Chain API для дерева дочерних действий.',
    tests: [
      {
        test: runActionsChainAPINew,
        description:
          'Берет существующее действие через Actions API и проверяет чтение цепочки через api/actions-chain/childs/:id.'
      }
    ]
  },

  specification_api: {
    description: 'Набор тестов Specification API для атрибутов, детей первого уровня и пересчета времени.',
    tests: [
      {
        test: runSpecificationAPINew,
        description:
          'Тестирует api/specification/attributes, first-level-children, time/:type/:id и defensive-сценарии.'
      }
    ]
  },

  notification_api: {
    description: 'Набор тестов Notification API для enrichment batch.',
    tests: [
      {
        test: runNotificationAPINew,
        description:
          'Тестирует api/external/notifications/enrich/batch для одиночного и batch системных уведомлений и минимального невалидного объекта.'
      }
    ]
  },

  negative_coverage_api: {
    description: 'Dedicated negative API coverage for auth, validation, missing-resource and bulk-id scenarios.',
    tests: [
      {
        test: runNegativeCoverageAPINew,
        description:
          'Проверяет 401/403 без токена или с поддельным токеном, 400/422 на битые DTO, 404/409 на несуществующие id и bulk-операции с частично невалидными id.'
      }
    ]
  },

  movement_object_api: {
    description: 'Набор тестов Movement Object API для истории перемещений.',
    tests: [
      {
        test: runMovementObjectAPINew,
        description:
          'Тестирует api/movement-object: историю с пагинацией, чтение одного перемещения и фильтрацию по родителям.'
      }
    ]
  },

  moving_api: {
    description: 'Набор тестов Moving API для списка, no-op create и defensive-сценариев.',
    tests: [
      {
        test: runMovingAPINew,
        description:
          'Тестирует api/moving: получение списка, no-op создание без фантомной записи и defensive-сценарий невалидного payload.'
      }
    ]
  },

  movement_errors_api: {
    description: 'Набор тестов Movement Errors API для текущего пустого контроллера.',
    tests: [
      {
        test: runMovementErrorsAPINew,
        description:
          'Проверяет, что неэкспонированные маршруты movement-errors возвращают клиентскую ошибку без 5xx.'
      }
    ]
  },

  neo4j_api: {
    description: 'Набор тестов Neo4j API для проверки дерева родственников и defensive-сценариев.',
    tests: [
      {
        test: runNeo4jAPINew,
        description:
          'Тестирует api/neo4j/stairs/:itemType/:itemId: валидный контракт чтения и обработку неизвестного типа сущности.'
      }
    ]
  },

  users_api: {
    description: 'Набор тестов Users API для проверки чтения, пагинации, ролей, архива и defensive-сценариев.',
    tests: [
      {
        test: runUsersAPINew,
        description:
          'Тестирует эндпоинты API пользователей: списки, пагинацию, получение по id, уникальность табеля, архив, роли и безопасную обработку ошибочных мутаций.'
      }
    ]
  },

  roles_api: {
    description: 'Набор тестов Roles API для проверки ролей, уникальности имен, архива и defensive-сценариев.',
    tests: [
      {
        test: runRolesAPINew,
        description:
          'Тестирует эндпоинты API ролей: создание, чтение, обновление, архив, уникальность имени, права доступа и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  product_api: {
    description: 'Набор тестов Product API для проверки жизненного цикла изделия и контрактов чтения.',
    tests: [
      {
        test: runProductsAPINew,
        description:
          'Тестирует эндпоинты API изделий: создание, чтение, обновление, архивацию, поиск, include/graph и defensive-сценарии.'
      }
    ]
  },

  details_api: {
    description: 'Набор тестов Details API для проверки жизненного цикла детали и контрактов чтения.',
    tests: [
      {
        test: runDetailsAPINew,
        description:
          'Тестирует эндпоинты API деталей: создание, чтение, обновление, архивацию, пагинацию, include, остатки, дефициты, операции и defensive-сценарии.'
      }
    ]
  },

  cbed_api: {
    description: 'Набор тестов CBED API для проверки жизненного цикла сборочной единицы и контрактов чтения.',
    tests: [
      {
        test: runCBEDAPINew,
        description:
          'Тестирует эндпоинты API сборочных единиц: создание, чтение, обновление, архивацию, пагинацию, include, принадлежность, graph, остатки, дефициты, операции и defensive-сценарии.'
      }
    ]
  },

  materials_api: {
    description: 'Набор тестов Materials API для проверки жизненного цикла материала, типов, подтипов и контрактов чтения.',
    tests: [
      {
        test: runMaterialsAPINew,
        description:
          'Тестирует эндпоинты API материалов: создание типа и подтипа, создание/обновление/архивацию материала, пагинацию, include, aliases, restrictions, дефициты и defensive-сценарии.'
      }
    ]
  },

  maintenance_api: {
    description: 'Отдельный набор глобальных maintenance API endpoint-ов; запускать осознанно, вне обычной регрессии.',
    tests: [
      {
        test: runMaintenanceAPINew,
        description:
          'Проверяет достижимость глобальных пересчетов, актуализаций, reset/settings операций и других потенциально тяжелых maintenance endpoint-ов.'
      }
    ]
  },

  equipment_api: {
    description: 'Набор тестов Equipment API для проверки жизненного цикла оборудования, типов, подтипов, архива и defensive-сценариев.',
    tests: [
      {
        test: runEquipmentAPINew,
        description:
          'Тестирует эндпоинты API оборудования: создание типа и подтипа, создание/обновление/архивацию оборудования, справочники, пагинации, проверки имен и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  exclusion_api: {
    description: 'Набор тестов Exclusion API для проверки исключений, пагинации и defensive-сценариев.',
    tests: [
      {
        test: runExclusionAPINew,
        description:
          'Тестирует api/exclusion: создание, чтение по id, обновление, архив, пагинацию и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  expenditure_api: {
    description: 'Набор тестов Expenditure API для проверки расходов со склада и defensive-сценариев.',
    tests: [
      {
        test: runExpenditureAPINew,
        description:
          'Тестирует api/expenditure: чтение расходов, фильтры по типу/дате, поиск и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  tools_api: {
    description: 'Набор базовых тестов Tools/Instrument API для проверки типов, подтипов, наименований, архива и defensive-сценариев.',
    tests: [
      {
        test: runToolsAPINew,
        description:
          'Тестирует базовый жизненный цикл API инструмента и оснастки: тип, подтип, наименование, чтение, архив, пагинации и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  inventory_api: {
    description: 'Набор базовых тестов Inventory API для проверки типов, подтипов, наименований, архива и defensive-сценариев.',
    tests: [
      {
        test: runInventoryAPINew,
        description:
          'Тестирует базовый жизненный цикл API непроизводственной техники и инвентаря: тип, подтип, наименование, чтение, архив, пагинации и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  documents_api: {
    description: 'Набор тестов Documents API для проверки базового жизненного цикла файлов, поиска и defensive-сценариев.',
    tests: [
      {
        test: runDocumentsAPINew,
        description:
          'Тестирует эндпоинты API документов: загрузку файла, чтение по id, поиск по параметрам, обновление метаданных, presign URL, архив и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  provider_deliveries_api: {
    description: 'Набор базовых тестов Deliveries API для проверки поставок, компаний-поставщиков, позиций, архива и defensive-сценариев.',
    tests: [
      {
        test: runProviderDeliveriesAPINew,
        description:
          'Тестирует поставки: создание компании-поставщика, заказ поставщика с материалом, чтение позиций, архив и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  provider_api: {
    description: 'Набор тестов Provider API для проверки поставщиков, архива, файлов и defensive-сценариев.',
    tests: [
      {
        test: runProviderAPINew,
        description:
          'Тестирует api/provider: список, пагинацию, архив, проверку имени, чтение по id, attach-file, архивирование и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  rack_api: {
    description: 'Набор тестов Rack API для проверки стеллажей, ячеек и defensive-сценариев.',
    tests: [
      {
        test: runRackAPINew,
        description:
          'Тестирует api/rack: пагинацию, чтение по id, создание/обновление, операции с ячейками, архив и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  settings_api: {
    description: 'Набор тестов Settings API для проверки справочников, backup endpoints и defensive-сценариев.',
    tests: [
      {
        test: runSettingsAPINew,
        description:
          'Тестирует api/settings: единицы измерения, типы, нормо-часы, inaction, список/скачивание/удаление/загрузку dump на фиктивных данных и defensive-сценарии.'
      }
    ]
  },

  solidworks_api: {
    description: 'Набор тестов Solidworks API для неиспользуемого модуля интеграции.',
    tests: [
      {
        test: runSolidworksAPINew,
        description:
          'Тестирует api/solidworks: поиск сущности и defensive multipart-мутации create/update без серверных ошибок.'
      }
    ]
  },

  supply_api: {
    description: 'Набор тестов Supply API для номера заказа поставки.',
    tests: [
      {
        test: runSupplyAPINew,
        description:
          'Тестирует api/supply/new-number-order и базовый контракт ответа без серверной ошибки.'
      }
    ]
  },

  contacts_api: {
    description: 'Набор тестов Contacts API для проверки жизненного цикла контактов, связей с компаниями и defensive-сценариев.',
    tests: [
      {
        test: runContactsAPINew,
        description:
          'Тестирует эндпоинты API контактов: создание, чтение, обновление, пагинацию, include компаний, архив, bulk archive и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  companies_api: {
    description: 'Набор тестов Companies API для проверки жизненного цикла компаний, связей с контактами и defensive-сценариев.',
    tests: [
      {
        test: runCompaniesAPINew,
        description:
          'Тестирует эндпоинты API компаний: создание, чтение, обновление, пагинацию, проверку имени, include контактов, открепление контакта, архив, bulk archive и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  stock_order_api: {
    description: 'Набор тестов Stock Order API для проверки заказов склада, позиций, пагинации и defensive-сценариев.',
    tests: [
      {
        test: runStockOrderAPINew,
        description:
          'Тестирует эндпоинты API заказов склада: создание, чтение, обновление, архив, позиции, связи с сущностями, пагинацию и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  shipments_api: {
    description: 'Набор тестов Shipments API для проверки задач на отгрузку, комплектации, документов, связей и defensive-сценариев.',
    tests: [
      {
        test: runShipmentsAPINew,
        description:
          'Тестирует эндпоинты API задач на отгрузку: основные пагинации, отметки отгрузки, чтение по id, комплектацию, документы, include-модели, связи с изделием и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  warehouse_api: {
    description: 'Набор тестов Warehouse/Sclad API для проверки остатков, ревизий, флагов дефицитов, потребностей и defensive-сценариев.',
    tests: [
      {
        test: runWarehouseAPINew,
        description:
          'Тестирует эндпоинты API склада: остатки по типам сущностей, пагинацию остатков, историю ревизий, флаги дефицитов, потребности по родителям и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  assemble_api: {
    description: 'Набор тестов Assemble API для проверки сборки, наборов, приходов, планов и defensive-сценариев.',
    tests: [
      {
        test: runAssembleAPINew,
        description:
          'Тестирует эндпоинты API сборки: основные и складские пагинации, актуальные комплекты, приход, план, операции, связи с родителями, чтение по id и defensive-сценарии.'
      }
    ]
  },

  metaloworking_api: {
    description: 'Набор тестов Metaloworking API для проверки металлообработки, приходов, операций и defensive-сценариев.',
    tests: [
      {
        test: runMetaloworkingAPINew,
        description:
          'Тестирует эндпоинты API металлообработки: основную пагинацию, приход, операции, комплектацию по операциям, чтение по id, связь с деталями и defensive-сценарии.'
      }
    ]
  },

  production_tasks_api: {
    description: 'Набор тестов Production Tasks API для проверки производственных заданий, связей, агрегатов и defensive-сценариев.',
    tests: [
      {
        test: runProductionTasksAPINew,
        description:
          'Тестирует эндпоинты API производственных заданий: списки, count, чтение по id, задачи по пользователю/оборудованию/операции, агрегаты, связи с ass/metall и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  tech_process_api: {
    description: 'Набор тестов Tech Process API для проверки создания, обновления, чтения и defensive-сценариев техпроцессов.',
    tests: [
      {
        test: runTechProcessAPINew,
        description:
          'Тестирует эндпоинты API техпроцессов: создание техпроцесса для детали, чтение по id, обновление описания, связь с деталью и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  operation_api: {
    description: 'Набор тестов Operation API для проверки типов операций, справочников операций и defensive-сценариев.',
    tests: [
      {
        test: runOperationAPINew,
        description:
          'Тестирует эндпоинты API операций: жизненный цикл типа операции, чтение типов/операций, статические выборки, уникальность имени и безопасную обработку ошибочных запросов.'
      }
    ]
  },

  waybill_api: {
    description: 'Набор тестов Waybill API для проверки накладных, пагинации, чтения и defensive-сценариев.',
    tests: [
      {
        test: runWaybillAPINew,
        description:
          'Тестирует эндпоинты API накладных: пагинацию, последнюю накладную, чтение по id, актуальные поставки, связь с заказами склада и безопасную обработку ошибочных мутаций.'
      }
    ]
  },

  waybill_provider_flow_api: {
    description: 'Сквозной API-тест накладной прихода от поставщика с setup заказа поставщику.',
    tests: [
      {
        test: runWaybillProviderFlowAPI,
        description:
          'Создает компанию-поставщика и заказ материала, создает накладную прихода от поставщика, проверяет связь с заказом, обновление, архив накладной и cleanup заказа/компании.'
      }
    ]
  },

  production_shipment_flow_api: {
    description: 'Сквозной API-тест производства, комплектации, прихода и отгрузки изделия.',
    tests: [
      {
        test: runProductionShipmentFlowAPI,
        description:
          'Создает изделие, сборочную единицу и деталь, запускает производство, делает ПЗ, отметки, комплектацию, приход и отгрузку с проверками остатков и дефицитов.'
      }
    ]
  },

  health_checks_api: {
    description: 'Health-check API для всех UI-страниц и переиспользуемых модальных окон.',
    tests: [
      {
        test: runHealthChecksAPINew,
        description:
          'Проверяет минимальные read-only API-зависимости страниц и модальных окон: успешные ответы для стабильных контрактов и отсутствие 5xx для optional/контекстных запросов.'
      }
    ]
  },

  all_api_tests: {
    description: 'Полный набор оставшихся API-тестов.',
    tests: [
      {
        test: runAuthAPINew,
        description:
          'Тестирует эндпоинты API аутентификации, включая вход, проверку токена, обновление, выход и сценарии безопасности.'
      },
      {
        test: runDeficitsAPINew,
        description:
          'Тестирует api/deficits: таблицы дефицитов, материалы, принадлежность материала и defensive-сценарии.'
      },
      {
        test: runMarksAPINew,
        description:
          'Тестирует api/marks: отметки, результаты работ, отметки по операции и defensive-сценарии.'
      },
      {
        test: runActionsAPINew,
        description:
          'Тестирует api/actions/get-by-params: базовое чтение, фильтры и defensive-сценарии.'
      },
      {
        test: runActionsChainAPINew,
        description:
          'Тестирует api/actions-chain/childs/:id для существующего действия.'
      },
      {
        test: runSpecificationAPINew,
        description:
          'Тестирует api/specification: attributes, first-level-children, пересчет времени и defensive-сценарии.'
      },
      {
        test: runNotificationAPINew,
        description:
          'Тестирует api/external/notifications/enrich/batch для системных уведомлений.'
      },
      {
        test: runMovementObjectAPINew,
        description:
          'Тестирует api/movement-object: историю перемещений и чтение по id.'
      },
      {
        test: runMovingAPINew,
        description:
          'Тестирует api/moving: список, no-op создание без фантомной записи и defensive-сценарий.'
      },
      {
        test: runMovementErrorsAPINew,
        description:
          'Тестирует текущий пустой api/movement-errors как неэкспонированный контракт без 5xx.'
      },
      {
        test: runUsersAPINew,
        description:
          'Тестирует эндпоинты API пользователей: списки, пагинацию, получение по id, уникальность табеля, архив, роли и безопасную обработку ошибочных мутаций.'
      },
      {
        test: runRolesAPINew,
        description:
          'Тестирует эндпоинты API ролей: создание, чтение, обновление, архив, уникальность имени, права доступа и defensive-сценарии.'
      },
      {
        test: runProductsAPINew,
        description:
          'Тестирует эндпоинты API изделий: создание, чтение, обновление, архивацию, поиск, include/graph и defensive-сценарии.'
      },
      {
        test: runDetailsAPINew,
        description:
          'Тестирует эндпоинты API деталей: создание, чтение, обновление, архивацию, пагинацию, include, остатки, дефициты, операции и defensive-сценарии.'
      },
      {
        test: runCBEDAPINew,
        description:
          'Тестирует эндпоинты API сборочных единиц: создание, чтение, обновление, архивацию, пагинацию, include, принадлежность, graph, остатки, дефициты, операции и defensive-сценарии.'
      },
      {
        test: runMaterialsAPINew,
        description:
          'Тестирует эндпоинты API материалов: создание типа и подтипа, создание/обновление/архивацию материала, пагинацию, include, aliases, restrictions, дефициты и defensive-сценарии.'
      },
      {
        test: runEquipmentAPINew,
        description:
          'Тестирует эндпоинты API оборудования: создание типа и подтипа, создание/обновление/архивацию оборудования, справочники, пагинации, проверки имен и defensive-сценарии.'
      },
      {
        test: runToolsAPINew,
        description:
          'Тестирует базовый жизненный цикл API инструмента и оснастки: тип, подтип, наименование, чтение, архив, пагинации и defensive-сценарии.'
      },
      {
        test: runInventoryAPINew,
        description:
          'Тестирует базовый жизненный цикл API непроизводственной техники и инвентаря: тип, подтип, наименование, чтение, архив, пагинации и defensive-сценарии.'
      },
      {
        test: runDocumentsAPINew,
        description:
          'Тестирует эндпоинты API документов: загрузку файла, чтение по id, поиск по параметрам, обновление метаданных, presign URL, архив и defensive-сценарии.'
      },
      {
        test: runProviderDeliveriesAPINew,
        description:
          'Тестирует поставки: создание компании-поставщика, заказ поставщика с материалом, чтение позиций, архив и defensive-сценарии.'
      },
      {
        test: runProviderAPINew,
        description:
          'Тестирует api/provider: поставщиков, пагинацию, архив, файлы и defensive-сценарии.'
      },
      {
        test: runRackAPINew,
        description:
          'Тестирует api/rack: пагинацию, стеллажи, ячейки и defensive-сценарии.'
      },
      {
        test: runSettingsAPINew,
        description:
          'Тестирует api/settings: справочники, backup endpoints и defensive-сценарии.'
      },
      {
        test: runSolidworksAPINew,
        description:
          'Тестирует api/solidworks: поиск сущности и defensive multipart-мутации.'
      },
      {
        test: runSupplyAPINew,
        description:
          'Тестирует api/supply/new-number-order.'
      },
      {
        test: runContactsAPINew,
        description:
          'Тестирует эндпоинты API контактов: создание, чтение, обновление, пагинацию, include компаний, архив, bulk archive и defensive-сценарии.'
      },
      {
        test: runCompaniesAPINew,
        description:
          'Тестирует эндпоинты API компаний: создание, чтение, обновление, пагинацию, проверку имени, include контактов, открепление контакта, архив, bulk archive и defensive-сценарии.'
      },
      {
        test: runStockOrderAPINew,
        description:
          'Тестирует эндпоинты API заказов склада: создание, чтение, обновление, архив, позиции, связи с сущностями, пагинацию и безопасную обработку ошибочных запросов.'
      },
      {
        test: runShipmentsAPINew,
        description:
          'Тестирует эндпоинты API задач на отгрузку: основные пагинации, отметки отгрузки, чтение по id, комплектацию, документы, include-модели, связи с изделием и безопасную обработку ошибочных запросов.'
      },
      {
        test: runWarehouseAPINew,
        description:
          'Тестирует эндпоинты API склада: остатки по типам сущностей, пагинацию остатков, историю ревизий, флаги дефицитов, потребности по родителям и безопасную обработку ошибочных запросов.'
      },
      {
        test: runAssembleAPINew,
        description:
          'Тестирует эндпоинты API сборки: основные и складские пагинации, актуальные комплекты, приход, план, операции, связи с родителями, чтение по id и defensive-сценарии.'
      },
      {
        test: runMetaloworkingAPINew,
        description:
          'Тестирует эндпоинты API металлообработки: основную пагинацию, приход, операции, комплектацию по операциям, чтение по id, связь с деталями и defensive-сценарии.'
      },
      {
        test: runProductionTasksAPINew,
        description:
          'Тестирует эндпоинты API производственных заданий: списки, count, чтение по id, задачи по пользователю/оборудованию/операции, агрегаты, связи с ass/metall и defensive-сценарии.'
      },
      {
        test: runTechProcessAPINew,
        description:
          'Тестирует эндпоинты API техпроцессов: создание для детали, чтение по id, обновление, связь с деталью и defensive-сценарии.'
      },
      {
        test: runOperationAPINew,
        description:
          'Тестирует эндпоинты API операций: жизненный цикл типа операции, чтение типов/операций, статические выборки, уникальность имени и defensive-сценарии.'
      },
      {
        test: runWaybillAPINew,
        description:
          'Тестирует эндпоинты API накладных: пагинацию, последнюю накладную, чтение по id, актуальные поставки, связь с заказами склада и defensive-сценарии.'
      },
      {
        test: runWaybillProviderFlowAPI,
        description:
          'Создает компанию-поставщика и заказ материала, создает накладную прихода от поставщика, проверяет связь с заказом, обновление, архив накладной и cleanup.'
      },
      {
        test: runProductionShipmentFlowAPI,
        description:
          'Создает изделие, сборочную единицу и деталь, запускает производство, делает ПЗ, отметки, комплектацию, приход и отгрузку с проверками остатков и дефицитов.'
      }
    ]
  }
};

type ApiSuiteKey = Exclude<keyof typeof apiSuitesByModule, 'all_api_tests'>;

function collectApiTests(keys: readonly ApiSuiteKey[]) {
  return keys.flatMap((key) => apiSuitesByModule[key].tests);
}

const allApiSuiteKeys = Object.keys(apiSuitesByModule).filter((key) => key !== 'all_api_tests') as ApiSuiteKey[];

const apiFunctionalSuiteKeys = [
  'assemble_api',
  'cbed_api',
  'comments_api',
  'companies_api',
  'contacts_api',
  'deficits_api',
  'details_api',
  'documents_api',
  'equipment_api',
  'exclusion_api',
  'inventory_api',
  'marks_api',
  'materials_api',
  'metaloworking_api',
  'notification_api',
  'operation_api',
  'production_shipment_flow_api',
  'production_tasks_api',
  'product_api',
  'provider_api',
  'provider_deliveries_api',
  'roles_api',
  'shipments_api',
  'specification_api',
  'stock_order_api',
  'tech_process_api',
  'tools_api',
  'users_api',
  'waybill_api',
  'waybill_provider_flow_api',
] as const satisfies readonly ApiSuiteKey[];

const apiContractSuiteKeys = [
  'actions_api',
  'actions_chain_api',
  'assemble_api',
  'auth_api',
  'cbed_api',
  'comments_api',
  'companies_api',
  'contacts_api',
  'deficits_api',
  'details_api',
  'documents_api',
  'equipment_api',
  'expenditure_api',
  'inventory_api',
  'marks_api',
  'materials_api',
  'metaloworking_api',
  'movement_object_api',
  'moving_api',
  'neo4j_api',
  'notification_api',
  'operation_api',
  'production_shipment_flow_api',
  'production_tasks_api',
  'product_api',
  'provider_deliveries_api',
  'rack_api',
  'settings_api',
  'shipments_api',
  'specification_api',
  'stock_order_api',
  'supply_api',
  'tech_process_api',
  'tools_api',
  'users_api',
  'warehouse_api',
  'waybill_api',
  'waybill_provider_flow_api',
] as const satisfies readonly ApiSuiteKey[];

const apiNegativeSuiteKeys = [
  'actions_chain_api',
  'assemble_api',
  'cbed_api',
  'companies_api',
  'contacts_api',
  'details_api',
  'documents_api',
  'equipment_api',
  'marks_api',
  'materials_api',
  'metaloworking_api',
  'movement_errors_api',
  'movement_object_api',
  'negative_coverage_api',
  'neo4j_api',
  'operation_api',
  'production_tasks_api',
  'product_api',
  'rack_api',
  'roles_api',
  'settings_api',
  'solidworks_api',
  'specification_api',
  'stock_order_api',
  'tech_process_api',
  'tools_api',
  'users_api',
  'warehouse_api',
  'waybill_api',
] as const satisfies readonly ApiSuiteKey[];

const apiMaintenanceSuiteKeys = [
  'assemble_api',
  'cbed_api',
  'deficits_api',
  'details_api',
  'maintenance_api',
  'production_tasks_api',
  'product_api',
  'settings_api',
  'shipments_api',
  'warehouse_api',
] as const satisfies readonly ApiSuiteKey[];

const apiSmokeSuiteKeys = [
  'assemble_api',
  'deficits_api',
  'metaloworking_api',
  'production_shipment_flow_api',
  'shipments_api',
  'specification_api',
  'stock_order_api',
  'tech_process_api',
  'waybill_provider_flow_api',
] as const satisfies readonly ApiSuiteKey[];

const apiSerialHeavySuiteKeys = [
  'assemble_api',
  'maintenance_api',
  'metaloworking_api',
  'production_shipment_flow_api',
  'production_tasks_api',
  'settings_api',
  'shipments_api',
  'specification_api',
  'warehouse_api',
  'waybill_provider_flow_api',
] as const satisfies readonly ApiSuiteKey[];

const apiSerialHeavySuiteKeySet = new Set<ApiSuiteKey>(apiSerialHeavySuiteKeys);
const apiParallelSafeSuiteKeys = allApiSuiteKeys.filter((key) => !apiSerialHeavySuiteKeySet.has(key));

export const serialApiSuiteKeys = ['api_serial_heavy_tests'] as const;

export const apiSuites = {
  ...apiSuitesByModule,
  api_parallel_safe_tests: {
    description:
      'Быстрый API-набор без тяжелых flow, maintenance, specification, production tasks и других suite-ов, чувствительных к параллельной нагрузке.',
    tests: collectApiTests(apiParallelSafeSuiteKeys),
  },
  api_serial_heavy_tests: {
    description:
      'Тяжелые API-наборы для последовательного запуска: flow, maintenance, specification, production tasks и нагрузочные складские/производственные сценарии.',
    tests: collectApiTests(apiSerialHeavySuiteKeys),
  },
  api_functional_tests: {
    description: 'API-тесты с уровнем покрытия functional из docs/api-coverage-matrix.md.',
    tests: collectApiTests(apiFunctionalSuiteKeys),
  },
  api_contract_tests: {
    description: 'API-тесты с уровнем покрытия contract из docs/api-coverage-matrix.md.',
    tests: collectApiTests(apiContractSuiteKeys),
  },
  api_negative_tests: {
    description: 'API-тесты с уровнем покрытия negative из docs/api-coverage-matrix.md.',
    tests: collectApiTests(apiNegativeSuiteKeys),
  },
  api_maintenance_tests: {
    description: 'API-тесты с уровнем покрытия maintenance из docs/api-coverage-matrix.md.',
    tests: collectApiTests(apiMaintenanceSuiteKeys),
  },
  api_smoke_tests: {
    description: 'API-тесты со smoke-пометками из route matrix в docs/api-coverage-matrix.md.',
    tests: collectApiTests(apiSmokeSuiteKeys),
  },
  all_api_tests: {
    description: 'Полный набор всех API-тестов из модульного API-реестра.',
    tests: collectApiTests(allApiSuiteKeys),
  },
};
