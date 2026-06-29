/**
 * API test suites registry.
 * Only APIAuth.spec.ts remains in testcases/API.
 */

import { runAuthAPINew } from './testcases/API/APIAuth.spec';
import { runAssembleAPINew } from './testcases/API/APIAssemble.spec';
import { runCBEDAPINew } from './testcases/API/APICBED.spec';
import { runCompaniesAPINew } from './testcases/API/APICompanies.spec';
import { runContactsAPINew } from './testcases/API/APIContacts.spec';
import { runDetailsAPINew } from './testcases/API/APIDetails.spec';
import { runMaterialsAPINew } from './testcases/API/APIMaterials.spec';
import { runMetaloworkingAPINew } from './testcases/API/APIMetaloworking.spec';
import { runProductionTasksAPINew } from './testcases/API/APIProductionTasks.spec';
import { runProductionShipmentFlowAPI } from './testcases/API/APIProductionShipmentFlow.spec';
import { runProductsAPINew } from './testcases/API/APIProducts.spec';
import { runShipmentsAPINew } from './testcases/API/APIShipments.spec';
import { runStockOrderAPINew } from './testcases/API/APIStockOrder.spec';
import { runUsersAPINew } from './testcases/API/APIUsers.spec';
import { runWarehouseAPINew } from './testcases/API/APIWarehouse.spec';

export const apiSuites = {
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

  all_api_tests: {
    description: 'Полный набор оставшихся API-тестов.',
    tests: [
      {
        test: runAuthAPINew,
        description:
          'Тестирует эндпоинты API аутентификации, включая вход, проверку токена, обновление, выход и сценарии безопасности.'
      },
      {
        test: runUsersAPINew,
        description:
          'Тестирует эндпоинты API пользователей: списки, пагинацию, получение по id, уникальность табеля, архив, роли и безопасную обработку ошибочных мутаций.'
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
        test: runProductionShipmentFlowAPI,
        description:
          'Создает изделие, сборочную единицу и деталь, запускает производство, делает ПЗ, отметки, комплектацию, приход и отгрузку с проверками остатков и дефицитов.'
      }
    ]
  }
};
