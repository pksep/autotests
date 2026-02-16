# SEP ERP — Автоматизация тестов

Автотесты на Playwright для системы SEP ERP. В этом документе описано, **как управлять и контролировать** запуск тестов с помощью `config.ts` и `testSuiteConfig.ts`.

---

## 1. Структура проекта (кратко)

| Путь | Назначение |
|------|------------|
| `config.ts` | Окружение, URL, выбор набора тестов, логин, селекторы, константы API |
| `testSuiteConfig.ts` | Реестр наборов тестов: каждый ключ набора сопоставлен одной или нескольким функциям запуска |
| `main.spec.ts` | Единая точка входа: читает `TEST_SUITE` из конфига и запускает соответствующий набор |
| `setup.ts` | Глобальный `beforeEach`: авторизация (для API-наборов не выполняется), ожидание дашборда |
| `playwright.config.ts` | Настройки Playwright (таймауты, baseURL, headless и т.д.); использует config для baseURL/headless |
| `testcases/*.spec.ts` | Реализации тестов; каждый экспортирует функцию `runXxx()`, которая регистрирует тесты Playwright |
| `pages/*.ts` | Пейдж-объекты |
| `lib/` | Общие хелперы, константы, утилиты |

Тесты **не** запускаются открытием отдельных файлов `testcases/*.spec.ts`. Все запуски идут через `main.spec.ts`, который выполняет только выбранный в конфиге набор.

---

## 2. Как управляется запуск тестов

### 2.1 Выбор набора тестов (suite)

1. **В коде (по умолчанию):**  
   В `config.ts` задайте:

   ```ts
   export const ENV = {
     // ...
     TEST_SUITE: 'U002',  // ← замените на нужный набор
     // ...
   };
   ```

2. **Через переменную окружения (переопределяет config):**  
   При запуске Playwright задайте `TEST_SUITE` **точно** как ключ набора (учёт регистра):

   ```bash
   # Windows (PowerShell)
   $env:TEST_SUITE='U004_1'; npx playwright test

   # Windows (CMD)
   set TEST_SUITE=U004_1 && npx playwright test

   # Linux / macOS
   TEST_SUITE=U004_1 npx playwright test
   ```

Значение `TEST_SUITE` должно совпадать с одним из ключей в `testSuiteConfig.ts` (например `U002`, `U004_1`, `U001_Setup`, `ERP_3015`, `CheckTableTotals`, `auth_api`).

### 2.2 Схема работы

1. `main.spec.ts` читает `ENV.TEST_SUITE` из `config.ts`.
2. По нему выбирается `testSuites[TEST_SUITE]` в `testSuiteConfig.ts`.
3. Вызывается `runSetup()` (логин для UI-наборов, для API-наборов пропускается).
4. По очереди вызываются функции `test` из `suite.tests` (например `runU002()` или `runU001_01_Setup()` и т.д.).
5. Каждая `runXxx()` регистрирует и запускает свои тесты Playwright (например `test.describe.serial(..., () => { test(...) })`).

Итого: **за один запуск выполняется один набор**, выбранный через `TEST_SUITE` в config или в env.

---

## 3. config.ts — что можно менять

| Параметр | Назначение | Переопределение через env |
|----------|------------|---------------------------|
| `BASE_URL` | URL приложения для UI-тестов | `BASE_URL` |
| `API_BASE_URL` | Базовый URL для API-тестов | `API_BASE_URL` |
| `HEADLESS` | Запуск браузера в headless | `HEADLESS` (`'true'` / `'false'`) |
| `TIMEOUT` | Таймаут по умолчанию (мс) | `TIMEOUT` |
| `TEST_SUITE` | Какой набор запускать (должен совпадать с ключом в testSuiteConfig) | `TEST_SUITE` |
| `TEST_DIR` | Каталог тестов (по умолчанию `'.'`) | `TEST_DIR` |
| `LOG_LEVEL` | Уровень логов: `'error'` \| `'warn'` \| `'info'` \| `'debug'` | `LOG_LEVEL` |
| `DEBUG` | Флаг отладки (логин и т.д.) | — |

Также в config экспортируются: `LOGIN_TEST_CONFIG`, `SELECTORS` (меню/URL), `API_CONST`, `PRODUCT_SPECS`. Их используют в тестах; в самих spec-файлах эти значения не дублируют.

---

## 4. testSuiteConfig.ts — реестр наборов

### 4.1 Структура

- **Импорты:** каждый тестовый файл экспортирует функцию запуска, например `runU002`, `runU004_1`, `runERP_3015`, `runAuthAPI`.
- **Объект `testSuites`:** ключи — идентификаторы наборов; значения:
  - `description` — краткое описание для логов/отчётов
  - `tests` — массив `{ test: runXxx, description }`

Пример:

```ts
U002: {
  description: 'Запуск в производство (...)',
  tests: [
    { test: runU002, description: '...' },
  ],
},
U004_1: {
  description: '...',
  tests: [
    { test: runU004_1, description: '...' },
  ],
},
```

### 4.2 Примеры ключей наборов

- **UI / E2E:** `U001`, `U001_Setup`, `U001_Orders`, `U001_Production`, … `U001_Cleanup`, `U002`, `U003`, `U004_1` … `U004_9`, `U005`, `U006`, `ERP_969`, `ERP_3015`, `CheckTableTotals`, `V001`, `page001` … `page010`, `TC100`, `suite01`, `suite02`, …
- **API:** `auth_api`, `users_api`, `orders_api`, … `all_api_tests` и др.

Регистр важен (например, `U004_1`, а не `u004_1`).

### 4.3 Добавление нового набора

1. Создайте или используйте тестовый файл с экспортом функции запуска, например `export function runMySuite() { ... }`.
2. В `testSuiteConfig.ts`:
   - добавьте импорт: `import { runMySuite } from './testcases/MySuite.spec';`
   - добавьте запись:  
     `MySuite: { description: '...', tests: [ { test: runMySuite, description: '...' } ] },`
3. Запуск: установите в `config.ts` `TEST_SUITE: 'MySuite'` или в окружении `TEST_SUITE=MySuite`.

---

## 5. Запуск тестов

- **По умолчанию (используется `TEST_SUITE` из config):**
  ```bash
  npx playwright test
  ```
- **С переопределением набора и опций:**
  ```bash
  # PowerShell
  $env:TEST_SUITE='U004_1'; $env:HEADLESS='true'; npx playwright test

  # С более подробными логами
  $env:LOG_LEVEL='info'; npx playwright test
  ```
- **UI Playwright:**
  ```bash
  pnpm run ui
  # или
  npx playwright test --ui
  ```
  Точка входа та же (`main.spec.ts`), тот же `TEST_SUITE` из config/env.

---

## 6. Setup и авторизация

- **UI-наборы:** в `setup.ts` перед каждым тестом выполняется выбор пользователя (табельный номер, ФИО, пароль), клик по кнопке входа и ожидание дашборда. Учётные данные задаются в `config.ts` (`LOGIN_TEST_CONFIG` / значения по умолчанию в setup).
- **API-наборы:** если `ENV.TEST_SUITE` содержит `'api'` (например `auth_api`, `orders_api`), шаг веб-логина пропускается.

---

## 7. Краткая шпаргалка

| Задача | Действие |
|--------|-----------|
| Запустить один набор | Задать в `config.ts` или в env `TEST_SUITE` равным ключу набора (например `U002`, `U004_1`) и выполнить `npx playwright test` |
| Запуск без окна браузера | В config задать `HEADLESS: true` или в env `HEADLESS=true` |
| Указать другое окружение | Задать в config или env `BASE_URL` / `API_BASE_URL` |
| Увеличить детализацию логов | В env задать `LOG_LEVEL=info` или `LOG_LEVEL=debug` |
| Добавить новый набор | Реализовать runner в testcases, импортировать в testSuiteConfig, добавить запись в `testSuites`, запускать с `TEST_SUITE=NewKey` |

Такой подход к `config.ts` и `testSuiteConfig.ts` держит «какие тесты и куда бегут» в одном месте и даёт будущим тестировщикам понятное управление проектом.
