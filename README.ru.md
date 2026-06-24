# SEP ERP — Автоматизация тестов

Автотесты на Playwright для системы SEP ERP. В этом документе описано, **как управлять и контролировать** запуск тестов с помощью `config.ts` и реестра наборов, а также как устроен проект.

---

## 1. Структура проекта (кратко)

| Путь | Назначение |
|------|------------|
| `config.ts` | Бочка: реэкспорт `ENV`, `LOGIN_TEST_CONFIG`, `SELECTORS`, `PRODUCT_SPECS` из `config/` |
| `config/` | Реализация: `env.ts` (ENV), `auth.config.ts` (логин), `selectors.ts` (меню/URL, спецификации продуктов) |
| `testSuiteConfig.ts` | Реестр наборов: объединяет UI- и API-наборы; единая точка входа для `main.spec.ts` |
| `testSuiteConfig.ui.ts` | Определения UI/E2E-наборов (U001, U002, …) |
| `testSuiteConfig.api.ts` | Определения API-наборов (auth_api, users_api, …) |
| `main.spec.ts` | Единая точка входа: читает `TEST_SUITE` из конфига и запускает соответствующий набор |
| `setup.ts` | Глобальный `beforeEach`: авторизация (для API-наборов не выполняется), ожидание дашборда |
| `playwright.config.ts` | Настройки Playwright (таймауты, baseURL, headless); использует config для baseURL/headless |
| `testcases/*.spec.ts` | Реализации тестов; каждый экспортирует `runXxx()`, регистрирующую тесты Playwright |
| `pages/*.ts` | Пейдж-объекты (наследуют PageObject; для ElementHelper используют `this.element`, напр. `clickButton`) |
| `lib/` | Общие хелперы, утилиты, базовый PageObject |
| `lib/Constants/` | Селекторы (`Selectors*.ts`), тестовые данные (`TestData*.ts`), таймауты (`TimeoutConstants.ts`), константы API (`APIConstants.ts`) |
| `lib/utils/logger.ts` | Логгер проекта (использовать вместо `console` в тестах и хелперах) |
| `eslint.config.mjs` | ESLint 10 flat config; интеграция с Prettier |
| `.prettierrc` | Настройки Prettier (одинарные кавычки, printWidth и т.д.) |
| `.nvmrc` | Версия Node для CI и локально (напр. 20.19) |

Тесты **не** запускаются открытием отдельных файлов `testcases/*.spec.ts`. Все запуски идут через `main.spec.ts`, который выполняет только выбранный в конфиге или окружении набор.

---

## 2. Требования и окружение

- **Node.js** — версия из `.nvmrc` (напр. 20.x). В CI используется этот файл.
- **Менеджер пакетов** — `pnpm` (см. `packageManager` в `package.json`). Выполните `pnpm install`, затем `pnpm exec playwright install --with-deps` для установки браузеров.
- **Тестируемое приложение** — для UI-наборов `BASE_URL` должен указывать на запущенный клиент SEP ERP. Для API-наборов должен быть доступен `API_BASE_URL`. Docker не требуется; приложение и API запускаются отдельно при необходимости.

---

## 3. Как управляется запуск тестов

### 3.1 Выбор набора тестов (suite)

1. **В коде (по умолчанию):**  
   В `config/env.ts` (или через переопределение env) эффективный конфиг задаётся в `ENV`. Значения по умолчанию можно задать в `config/env.ts`:
   - `TEST_SUITE` читается из `process.env.TEST_SUITE` или задаётся по умолчанию (напр. `'U001'`).

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

Значение `TEST_SUITE` должно совпадать с одним из ключей в объединённом реестре (напр. `U002`, `U004_1`, `U001_Setup`, `ERP_3015`, `CheckTableTotals`, `auth_api`).

### 3.2 Схема работы

1. `main.spec.ts` читает `ENV.TEST_SUITE` из config.
2. По нему выбирается `testSuites[TEST_SUITE]` в `testSuiteConfig.ts` (объединение `uiSuites` и `apiSuites`).
3. Вызывается `runSetup()` (логин для UI-наборов, для API-наборов пропускается).
4. По очереди вызываются функции `test` из `suite.tests` (напр. `runU002()`, `runU001_01_Setup()` и т.д.).
5. Каждая `runXxx()` регистрирует и запускает свои тесты Playwright.

Итого: **за один запуск выполняется один набор**, выбранный через `TEST_SUITE` в config или в env.

### 3.3 Запуск нескольких наборов параллельно

Задайте `TEST_SUITE=parallel`, чтобы запустить следующие наборы одновременно (внутри каждого набора тесты по-прежнему выполняются последовательно):

- U001, U002, U003, suite01 (U004_1–U004_9), U005, U006

Наборы используют разные тестовые данные, поэтому их можно выполнять параллельно. Playwright использует 6 воркеров (по одному на набор). В этом режиме в конфиге включается `fullyParallel: true`, чтобы тесты из единственного файла-входа могли выполняться параллельно.

**Проще всего** — использовать скрипт (на Windows не нужно вручную задавать переменную):

```bash
pnpm run test:parallel
```

Либо задать переменную и запустить тесты:

```bash
# Windows (PowerShell)
$env:TEST_SUITE='parallel'; pnpm test

# Linux / macOS
TEST_SUITE=parallel pnpm test
```

Список наборов задаётся в `PARALLEL_SUITE_KEYS` в `testSuiteConfig.ts`. Чтобы задать другое число воркеров: `PLAYWRIGHT_WORKERS=4 pnpm test` (при `TEST_SUITE=parallel` в `.env` или в окружении).

---

## 4. CI/CD (GitHub Actions)

Воркфлоу в `.github/workflows/playwright.yml` запускается при push/PR в `main` и `canary`. Шаги: checkout, настройка pnpm, Node из `.nvmrc`, установка зависимостей, **линт** (`pnpm run lint -- --max-warnings 5000`), установка браузеров Playwright, запуск тестов, загрузка артефакта `playwright-report/` (30 дней).

Чтобы изменить набор или окружение **без изменения кода**, задайте в блоке `env:` джобы:

| Переменная | Назначение |
|------------|------------|
| `TEST_SUITE` | Ключ набора из реестра (напр. `U001`, `U002`, `auth_api`). Не задавать — используется значение по умолчанию из config. |
| `BASE_URL` | URL приложения для UI-тестов. |
| `API_BASE_URL` | Базовый URL для API-тестов. |

---

## 5. config — что можно менять

`config.ts` реэкспортирует из `config/`. Переопределение через `.env` или `process.env` где поддерживается.

| Параметр | Назначение | Переопределение через env |
|----------|------------|---------------------------|
| `BASE_URL` | URL приложения для UI-тестов | `BASE_URL` |
| `API_BASE_URL` | Базовый URL для API-тестов | `API_BASE_URL` |
| `HEADLESS` | Запуск браузера в headless | `HEADLESS` (`'true'` / `'false'`) |
| `TIMEOUT` | Таймаут по умолчанию (мс) | `TIMEOUT` |
| `TEST_SUITE` | Какой набор запускать (должен совпадать с ключом в реестре) | `TEST_SUITE` |
| `TEST_DIR` | Каталог тестов (по умолчанию `'.'`) | `TEST_DIR` |
| `LOG_LEVEL` | Уровень логов: `'error'` \| `'warn'` \| `'info'` \| `'debug'` | `LOG_LEVEL` |
| `DEBUG` | Флаг отладки (логин и т.д.) | — |

Также экспортируются: `LOGIN_TEST_CONFIG`, `SELECTORS` (меню/URL), `PRODUCT_SPECS`. Их используют в тестах; в spec-файлах эти значения не дублируют. Селекторы для UI хранятся в `lib/Constants/Selectors*.ts`; константы для API-тестов — в `lib/Constants/APIConstants.ts`.

---

## 6. testSuiteConfig — реестр наборов

Реестр собирается в `testSuiteConfig.ts` объединением `uiSuites` (`testSuiteConfig.ui.ts`) и `apiSuites` (`testSuiteConfig.api.ts`). Ключи — идентификаторы наборов; значения — `{ description, tests }`.

### 6.1 Структура

- **Импорты:** каждый тестовый файл экспортирует функцию запуска, напр. `runU002`, `runU004_1`, `runERP_3015`, `runAuthAPI`.
- **Объект `testSuites`:** в `testSuiteConfig.ts` задаётся как `testSuites = { ...uiSuites, ...apiSuites }`. Каждая запись содержит:
  - `description` — краткое описание для логов/отчётов
  - `tests` — массив `{ test: runXxx, description }`

### 6.2 Примеры ключей наборов

- **UI / E2E:** `U001`, `U001_Setup`, `U001_Orders`, `U001_Production`, … `U001_Cleanup`, `U002`, `U003`, `U004_1` … `U004_9`, `U005`, `U006`, `ERP_969`, `ERP_3015`, `CheckTableTotals`, `V001`, `page001` … `page010`, `TC100`, `suite01`, `suite02`, …
- **API:** `auth_api`, `users_api`, `orders_api`, … `all_api_tests` и др.

Регистр важен (напр. `U004_1`, а не `u004_1`).

### 6.3 Добавление нового набора

1. Создайте или используйте тестовый файл с экспортом функции запуска, напр. `export function runMySuite() { ... }`.
2. В `testSuiteConfig.ui.ts` или `testSuiteConfig.api.ts`:
   - добавьте импорт: `import { runMySuite } from './testcases/MySuite.spec';`
   - добавьте запись: `MySuite: { description: '...', tests: [ { test: runMySuite, description: '...' } ] },`
3. Запуск: установите в config `TEST_SUITE: 'MySuite'` или в окружении `TEST_SUITE=MySuite`.

---

## 7. Запуск тестов

- **По умолчанию (используется `TEST_SUITE` из config):**
  ```bash
  pnpm exec playwright test
  # или
  npx playwright test
  ```
- **С переопределением набора и опций:**
  ```bash
  # PowerShell
  $env:TEST_SUITE='U004_1'; $env:HEADLESS='true'; npx playwright test

  # Более подробные логи
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

## 8. Линтинг и форматирование

- **Проверка:** `pnpm run lint` (ESLint; включает Prettier через `eslint-plugin-prettier`).
- **Автоисправление:** `pnpm run lint:fix` (форматирование и другие автофиксируемые правила).

В CI перед тестами выполняется `pnpm run lint -- --max-warnings 5000`. Селекторы и таймауты берут из `lib/Constants/`; полные стандарты кода — в `.cursorrules` в репозитории.

---

## 9. Setup и авторизация

- **UI-наборы:** в `setup.ts` перед каждым тестом выполняется выбор пользователя (табельный номер, ФИО, пароль), клик по кнопке входа и ожидание дашборда. Учётные данные задаются в config (`LOGIN_TEST_CONFIG` / значения по умолчанию в setup).
- **API-наборы:** если `ENV.TEST_SUITE` содержит `'api'` (напр. `auth_api`, `orders_api`), шаг веб-логина пропускается.

---

## 10. Краткая шпаргалка

| Задача | Действие |
|--------|-----------|
| Запустить один набор | Задать в config или в env `TEST_SUITE` равным ключу набора (напр. `U002`, `U004_1`) и выполнить `pnpm exec playwright test` |
| Запустить все наборы параллельно (6 воркеров) | `pnpm run test:parallel` или задать `TEST_SUITE=parallel` и выполнить `pnpm test` |
| Запуск без окна браузера | В config задать `HEADLESS: true` или в env `HEADLESS=true` |
| Указать другое окружение | Задать в config или env `BASE_URL` / `API_BASE_URL` |
| Увеличить детализацию логов | В env задать `LOG_LEVEL=info` или `LOG_LEVEL=debug` |
| Линт / автофикс кода | `pnpm run lint` или `pnpm run lint:fix` |
| Добавить новый набор | Реализовать runner в testcases, добавить запись в `testSuiteConfig.ui.ts` или `testSuiteConfig.api.ts`, запускать с `TEST_SUITE=NewKey` |

Такой подход к `config.ts` и реестру наборов держит «какие тесты и куда бегут» в одном месте и даёт понятное управление проектом.

---

## 11. Docker-запуск API-автотестов по расписанию

В корне проекта есть `Dockerfile`, который собирает контейнер для запуска Playwright API-наборов по cron-расписанию. По умолчанию запускается набор `all_api_tests`, формируются HTML-отчет Playwright и Allure-отчет, результаты сохраняются в `/app/reports`.

### Сборка образа

```bash
docker build -t sep-erp-api-autotests .
```

### Разовый запуск

```bash
docker run --rm \
  -e SCHEDULE_ENABLED=false \
  -e API_BASE_URL=https://dev.pksep.ru/ \
  -e LOGIN_TABEL=105 \
  -e LOGIN_USERNAME=YourDisplayName \
  -e LOGIN_PASSWORD=your_password_here \
  -v "$PWD/reports:/app/reports" \
  sep-erp-api-autotests
```

### Запуск по расписанию

```bash
docker run -d --name sep-erp-api-autotests \
  -e CRON_SCHEDULE="0 6 * * *" \
  -e RUN_ON_START=true \
  -e API_BASE_URL=https://dev.pksep.ru/ \
  -e LOGIN_TABEL=105 \
  -e LOGIN_USERNAME=YourDisplayName \
  -e LOGIN_PASSWORD=your_password_here \
  -v "$PWD/reports:/app/reports" \
  sep-erp-api-autotests
```

Полезные переменные:

| Переменная | Значение по умолчанию | Назначение |
|------------|------------------------|------------|
| `TEST_SUITE` | `all_api_tests` | Какой API-набор запускать (`auth_api`, `users_api`, `all_api_tests` и т.д.) |
| `CRON_SCHEDULE` | `0 6 * * *` | Расписание в cron-формате |
| `RUN_ON_START` | `false` | Запустить тесты сразу при старте контейнера |
| `SCHEDULE_ENABLED` | `true` | `false` включает разовый запуск и завершение контейнера |
| `GENERATE_ALLURE` | `true` | Генерировать HTML-отчет Allure из `allure-results` |
| `REPORTS_DIR` | `/app/reports` | Каталог для сохранения отчетов |

Каждый запуск создает отдельную папку вида `reports/YYYYMMDD-HHMMSS/`. Внутри будут `playwright-report/`, `allure-report/`, `allure-results/`, `test-results/` и `status.env` с кодом завершения. Ссылка `reports/latest` указывает на последний запуск.
