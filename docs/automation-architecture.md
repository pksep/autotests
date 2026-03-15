# Automation Framework Architecture

## 1. Overview

This repository implements a Playwright-based end-to-end test automation framework in TypeScript for a factory/manufacturing management system (ERP-style web application). The framework uses a **custom suite orchestration model**: a single entry file (`main.spec.ts`) selects which test suite runs based on the `TEST_SUITE` configuration, and each suite is composed of **workflow-style tests** that represent full business processes. Tests run **serially** with one worker; steps and cases depend on previous steps and shared state. The design emphasizes maintainability through a Page Object Model, centralized selectors and timeouts in `lib/Constants/`, soft assertions with screenshot capture, Winston-based logging, and Allure reporting.

---

## 2. Technology Stack

| Component | Technology |
|-----------|------------|
| Test runner | Playwright Test |
| Language | TypeScript |
| Runtime | Node.js |
| Reporting | Allure (allure-playwright) |
| Logging | Winston (custom logger) |
| CI | GitHub Actions |
| Package manager | pnpm |
| Config / env | dotenv, config in `config/` |

---

## 3. Folder Structure

| Path | Purpose |
|------|---------|
| **lib/** | Core framework: `Page.ts` (base PageObject), `AbstractPage.ts`, `Input.ts`, `Button.ts`, and shared utilities. |
| **lib/Constants/** | Selector constants (`Selectors*.ts`), timeout constants (`TimeoutConstants.ts`), test data constants (`TestData*.ts`), highlight styles, enums. |
| **lib/helpers/** | Reusable helper classes: `ElementHelper`, `TableHelper`, `ModalHelper`, `NavigationHelper`, `ValidationHelper`, `ArchiveHelper`, `OrderHelper`, `RowCellHelper`, `NotificationHelper`, `LoginHelper`, `MiscHelper`, `PartsDatabaseHelper`, `PartsDatabaseTableHelper`, `U006Flows`. |
| **lib/utils/** | Logger (`logger.ts`), utilities (`utilities.ts` — e.g. `expectSoftWithScreenshot`, text/date normalization). |
| **pages/** | Page Object classes extending `PageObject` (e.g. `LoginPage`, `PartsDatabasePage`, `StockPage`, `LoadingTaskPage`, `MetalworkingWarehousePage`, `OrderedFromSuppliersPage`, `ActionsPage`). |
| **config/** | `env.ts` (ENV), `auth.config.ts` (login credentials), `selectors.ts` (SELECTORS, PRODUCT_SPECS). Root `config.ts` re-exports these. |
| **testcases/** | Spec files that export **runner functions** (e.g. `runU001_01_Setup`, `runU002_01_Setup`). Runners register `test('Case XX - ...', ...)` with Playwright; tests are not discovered by file name. |
| **testdata/** | JSON files for test data (e.g. `U001-PC1.json`, `uc000.json`, `U004-PC01.json`, `LoadingTasksPage.json`). |
| **logs/** | Winston log output (e.g. `logs/info/`, `logs/errors/`) with rotation. |
| **test-results/** | Playwright and framework artifacts: screenshots (including soft-assertion failures), failure attachments. |
| **docs/** | Documentation (e.g. this architecture document). |

**Key entry and config files:**

- `main.spec.ts` — Single Playwright test file; selects suite from `testSuites[ENV.TEST_SUITE]` and invokes runner functions.
- `setup.ts` — Registers `test.beforeEach` (login and post-login checks); called from `main.spec.ts`.
- `testSuiteConfig.ts` — Merges `uiSuites` and `apiSuites`; exports `testSuites`.
- `testSuiteConfig.ui.ts` — UI suite definitions (U001, U002, U003, U004, U005, U006, U007, P001–P010, V001, CheckTableTotals, ERP_969, ERP_3015, etc.).
- `testSuiteConfig.api.ts` — API suite definitions.
- `playwright.config.ts` — Playwright config: single project matching `**/main.spec.ts`, one worker, baseURL/headless from config, Allure reporter.

---

## 4. Test Execution Architecture

**Entry point:** Playwright is configured to run only `**/main.spec.ts`. No other spec files are matched by the default project.

**Suite selection:** `main.spec.ts` reads `ENV.TEST_SUITE` (from `config`, overridable by `process.env.TEST_SUITE`), looks up `testSuites[selectedSuite]`, and obtains an object `{ description, tests }` where `tests` is an array of `{ test: function, description: string }`.

**Setup:** `runSetup()` is called inside a single `test.describe.serial(...)` block. It registers `test.beforeEach` that performs login (and skips for API suites) and waits for the post-login UI.

**Test registration:** The suite’s `tests` array is iterated; each `test` property is a **runner function** (e.g. `runU001_01_Setup(isSingleTest, iterations)`). When invoked, the runner registers one or more `test('Case XX - ...', async ({ page }) => { ... })` with Playwright. Thus, the actual test cases are created at runtime by the runner, not by file discovery.

**Execution model:** All registered tests run inside the same `test.describe.serial` block with a single worker (`workers: 1` in `playwright.config.ts`), ensuring order and shared state. Global timeout is set (e.g. 30 minutes) for long suites like U001.

---

## 5. Page Object Model

**Inheritance hierarchy:**

```
AbstractPage
    ↑
PageObject  (wraps helper classes)
    ↑
LoginPage
StockPage
PartsDatabasePage
LoadingTaskPage
...
```

- **AbstractPage** (`lib/AbstractPage.ts`): Base class that holds the Playwright `page` instance. No abstract methods in the current implementation.
- **PageObject** (`lib/Page.ts`): Extends `AbstractPage` and **wraps** helper classes. In its constructor it instantiates Button, Input, ElementHelper, NavigationHelper, TableHelper, ModalHelper, ValidationHelper, ArchiveHelper, OrderHelper, RowCellHelper, NotificationHelper, LoginHelper, and MiscHelper (each receives `page`). PageObject exposes methods that delegate to these helpers, providing **global reusable behavior** (e.g. `findAndClickElement`, `waitAndHighlight`, `archiveItem`, `archiveAndConfirm`, `waitAndCheckFirstRow`, `searchAndVerifyFirstRow`, `fillLoginForm`, `clickButton`). It does not “expose helper methods” in the sense of re-exporting helpers directly; it wraps them and exposes a single API.

**Concrete pages:** Each page class (e.g. `LoginPage`, `CreatePartsDatabasePage`, `CreateStockPage`, `CreateLoadingTaskPage`) extends `PageObject`, calls `super(page)`, and may add further helpers (e.g. `PartsDatabaseTableHelper`, `PartsDatabaseHelper`). Page classes contain **only page-specific methods**; shared behavior stays in `PageObject` and its wrapped helpers.

**Example:**

```ts
export class CreatePartsDatabasePage extends PageObject {
  protected partsDatabaseTableHelper: PartsDatabaseTableHelper;
  protected partsDatabaseHelper: PartsDatabaseHelper;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.partsDatabaseTableHelper = new PartsDatabaseTableHelper(page);
    this.partsDatabaseHelper = new PartsDatabaseHelper(page);
  }
  // Page-specific methods...
}
```

**Locator usage:** Page objects and tests use `this.page.locator(selector)` or `page.locator(selector)` where `selector` is imported from `lib/Constants/` (e.g. `SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE`). The framework does not use `getByTestId` as the primary pattern; selectors are full strings (often `[data-testid="..."]`) from constants.

---

## 6. Selector Strategy

**Rule:** Tests **may** reference selector constants but must **never** hardcode selectors. Selectors are defined in `lib/Constants/` and must be imported and used by name in tests and page objects.

**Allowed:** Using a constant from `lib/Constants/`:
```ts
page.locator(SelectorsPartsDataBase.CREATE_BUTTON)
```

**Forbidden:** Writing the selector string inline:
```ts
page.locator('[data-testid="create-button"]')
```

**Storage:** Selector constants live in files such as `SelectorsPartsDataBase.ts`, `SelectorsAssemblyKittingOnThePlan.ts`, `SelectorsModalWindowConsignmentNote.ts`, `SelectorsLoadingTasksPage.ts`, `SelectorsShipmentTasks.ts`, etc. Naming follows `COMPONENT_ELEMENT_PURPOSE` in UPPER_SNAKE_CASE.

**Format:** Selectors use **data-testid** attributes. Full selectors are stored as strings in constants, e.g. `'[data-testid="BaseProducts-Button-Create"]'`. Some files also export ID fragments or patterns (prefix/suffix) for building dynamic row/cell selectors.

**Usage pattern:** Code uses `page.locator(SelectorsX.CONSTANT_NAME)` or `this.page.locator(SelectorsX.CONSTANT_NAME)` where the constant is imported from `lib/Constants/`.

**Example:**

```ts
// lib/Constants/SelectorsPartsDataBase.ts
export const BASE_PRODUCTS_BUTTON_CREATE = '[data-testid="BaseProducts-Button-Create"]';

// In page or test — allowed: reference the constant
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
await page.locator(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE).click();
```

**Menu/navigation structure:** The `config/selectors.ts` file exports `SELECTORS` (e.g. `SELECTORS.MAINMENU.PARTS_DATABASE.URL`, `SELECTORS.MAINMENU.WAREHOUSE.URL`) for navigation and high-level structure; detailed element selectors remain in `lib/Constants/Selectors*.ts`.

---

## 7. Assertion Strategy

**Soft assertions:** The framework requires use of `expect.soft()` instead of `expect()` so that multiple failures can be collected within a test and reported together.

**expectSoftWithScreenshot:** Every `expect.soft()` usage must be wrapped in the helper `expectSoftWithScreenshot(page, assertionFn, description?, testInfo?)` from `lib/utils/utilities.ts`. The helper runs the assertion callback; if a soft assertion fails, it captures a full-page screenshot, attaches it to the test report when `testInfo` is provided, and logs the path. This ensures consistent failure diagnostics.

**Step validation:** Each logical step in a test should (1) perform an action and (2) validate the result with one or more assertions. Placeholder assertions (e.g. `expect.soft(true).toBe(true)`) are forbidden; assertions must check actual outcomes (visibility, text, value, count, state).

**Example:**

```ts
await expectSoftWithScreenshot(
  page,
  () => {
    expect.soft(actualValue).toBe(expectedValue);
  },
  'Description of what is being verified',
  testInfo,
);
```

**Hard assertions:** Used only when the test cannot meaningfully continue after a failure (e.g. critical setup). Default is soft + screenshot wrapper.

---

## 8. Test Design Pattern

**Workflow model:** A test represents a **full business process**, not an isolated unit. For example, the U001 suite models: create/delete product and parts data → create order → launch production → assembly → receiving → shipment → second order cycle → second production → final shipment → archive → cleanup. Steps and cases depend on previous steps and shared state (e.g. order numbers, product names stored in constants or shared modules).

**Structure:** Within a suite, each “test” is a `test('Case NN - ...', async ({ page }) => { ... })` with multiple steps. Steps are wrapped in `allure.step('Step NN: ...', async () => { ... })` and typically call page object methods then assert.

**Serial execution:** Suites run under `test.describe.serial` with `workers: 1`, so execution order is guaranteed and shared state is safe.

**Minimal logic in specs:** Test files should orchestrate only: call page/support methods and assert on return values or page state. Helper logic belongs in page objects or `lib/` helpers, not in spec files.

**Workflow tests vs function-level tests (page method usage):** The framework favors **workflow-style steps** that call page methods over **function-level steps** that implement the flow inside the test.

| Style | Meaning | Example |
|-------|---------|--------|
| **Function test** (avoid) | The test contains the implementation: fill field, click button, validate, etc. | `fill username` → `fill password` → `click login` → `validate redirect` (all in the spec) |
| **Workflow test** (prefer) | The test calls a single page method that encapsulates the flow; implementation lives in the page object. | `loginPage.login()` (or `loginPage.loginAndValidateRedirect()`) |

**Rule:** Prefer workflow steps. Each test step should call a page (or helper) method that does the work and returns something to assert on, rather than inlining the sequence of UI actions and checks in the spec.

**Example — avoid (function-level in the test):**
```ts
await allure.step('Login', async () => {
  await page.locator(Selectors.USERNAME).fill(username);
  await page.locator(Selectors.PASSWORD).fill(password);
  await page.locator(Selectors.LOGIN_BUTTON).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

**Example — prefer (workflow, page method):**
```ts
await allure.step('Login', async () => {
  await loginPage.login();
  await expectSoftWithScreenshot(page, () => expect.soft(await loginPage.isOnDashboard()).toBe(true), 'Redirect after login', testInfo);
});
```
(or a single `loginPage.login()` that performs and validates the redirect inside the page class).

**Function validation strategy:** When a feature is tested for the first time, the test must implement each step explicitly so that every UI interaction and state transition is validated.

**Example (first-time validation — explicit steps):**

- Fill username field  
- Fill password field  
- Click login button  
- Validate redirect to dashboard  

Once a function is verified and considered stable, it should be encapsulated inside a page object method.

**Example (stable feature — page object method):**

```ts
loginPage.login(username, password);
```

Future tests should use the page object method rather than repeating the individual UI interactions.

This ensures:

- Tests remain readable  
- Logic is centralized  
- Changes only affect page objects  

---

## 9. Helper Architecture

Helpers live in `lib/helpers/` and are instantiated inside `PageObject`, which exposes their methods to all page classes. Each helper receives the Playwright `page` and encapsulates a specific interaction or validation pattern.

| Helper | Responsibility |
|--------|----------------|
| **ElementHelper** | Element interaction: find and click by data-testid, get text, scroll, highlight, wait for selector, tooltips. |
| **TableHelper** | Table operations: scan tables, validate structure, wait for table body, search and verify rows. |
| **ModalHelper** | Modal/dialog handling: wait for modal, close modals, waybill modal flows. |
| **NavigationHelper** | Navigation: nav by data-testid, check URL/title/language/breadcrumb, capture screenshot. |
| **ValidationHelper** | Validation: wait and check first row, verify content. |
| **ArchiveHelper** | Archive flows: archive item, archive and confirm with configurable selectors and labels. |
| **OrderHelper** | Order-related operations. |
| **RowCellHelper** | Row and cell interactions in tables. |
| **NotificationHelper** | Notification handling. |
| **LoginHelper** | Login form filling (`fillLoginForm`, `newFillLoginForm`). |
| **MiscHelper** | Miscellaneous shared logic (e.g. assembly invoice modal, kit list flows). |
| **PartsDatabaseHelper** / **PartsDatabaseTableHelper** | Parts database–specific table and specification handling. |
| **U006Flows** | U006-specific flow helpers. |

Page objects may also define their own helpers (e.g. `PartsDatabasePage` uses `PartsDatabaseTableHelper` and `PartsDatabaseHelper`). Shared behavior used by multiple pages remains in `PageObject` and the above helpers.

---

## 10. Configuration System

**Environment:** `config/env.ts` exports `ENV`: `BASE_URL`, `API_BASE_URL`, `HEADLESS`, `TIMEOUT`, `TEST_SUITE`, `TEST_DIR`, `DEBUG`, `LOG_LEVEL`. Values are read from `process.env` (or `.env` via dotenv) with fallbacks. Override at runtime: e.g. `TEST_SUITE=U002`, `BASE_URL=...`, `LOG_LEVEL=warn`.

**Auth:** `config/auth.config.ts` exports `LOGIN_TEST_CONFIG`: login endpoint, `TEST_CREDENTIALS` (username, password, tabel from `process.env.LOGIN_USERNAME`, `LOGIN_PASSWORD`, `LOGIN_TABEL`), headers, and request templates. Credentials are not hardcoded; they are sourced from environment (or `.env`).

**Selectors and product specs:** `config/selectors.ts` exports `SELECTORS` (menu URLs, data-testids, text) and `PRODUCT_SPECS` used by tests. Root `config.ts` re-exports `ENV`, `LOGIN_TEST_CONFIG`, `SELECTORS`, `PRODUCT_SPECS` so the rest of the project can import from a single `config` module.

**Timeouts:** `lib/Constants/TimeoutConstants.ts` exports `TIMEOUTS`, `WAIT_TIMEOUTS`, `TEST_TIMEOUTS`, `RETRY_COUNTS`, `ROW_COLLECTION`. No raw timeout numbers in tests or page code; all waits use these constants.

---

## 11. Logging and Reporting

**Logging:** The framework uses a custom Winston-based logger in `lib/utils/logger.ts`. It exposes `log`, `info`, `warn`, `error`, `debug`. Log level is driven by `ENV.LOG_LEVEL` (or `LOG_LEVEL` env). Output goes to:

- Rotating file transports under `logs/` (e.g. `logs/info/`, `logs/errors/`) with date pattern, max size, and retention.
- Console with timestamp and level.

Tests and page objects use this logger instead of `console.log` for test execution events, failures, and important actions.

**Reporting:** Allure is configured in `playwright.config.ts` via the `allure-playwright` reporter. Each logical step is wrapped in `allure.step('Step NN: ...', async () => { ... })`, producing a step tree in the Allure report. Screenshots are captured on failure (Playwright’s `screenshot: 'only-on-failure'`) and on soft assertion failure via `expectSoftWithScreenshot`, which attaches the screenshot to the test when `testInfo` is provided. Artifacts (screenshots, attachments) are stored under `test-results/`.

---

## 12. Test Data Strategy

**JSON files:** Static test data is stored in `testdata/`, e.g. `U001-PC1.json`, `uc000.json`, `U002-PC1.json`, `U004-PC01.json`, `U005-PC01.json`, `LoadingTasksPage.json`, `ProductShortagePage.json`, and various scenario-specific JSON files. Specs import these where needed (e.g. `import testData1 from '../testdata/U001-PC1.json'`).

**Constants:** Test data constants (e.g. for specific flows or ERP tickets) live in `lib/Constants/` in files such as `TestDataERP969.ts`, `TestDataERP969Values.ts`, `TestDataOrderedFromSuppliers.ts`, `TestDataU004.ts`. Naming and placement follow the rule that test data is separate from selector constants; selector files are `Selectors*.ts`, test data constants are `TestData*.ts` or JSON in `testdata/`.

**Suite-specific state:** Some suites (e.g. U001) use shared state modules (e.g. `U001-Constants.ts`) that export mutable or immutable values (order numbers, product names, arrays) populated or read by tests in sequence.

---

## 13. CI/CD Integration

**Local:** Run tests with `pnpm exec playwright test` or `pnpm test`. Set `TEST_SUITE`, `BASE_URL`, `HEADLESS`, `LOG_LEVEL`, and credentials via environment or `.env`.

**GitHub Actions:** The workflow in `.github/workflows/playwright.yml` runs on push and pull_request to `main` and `canary`. It checks out the repo, sets up Node with pnpm, installs dependencies (`pnpm install --frozen-lockfile`), runs lint (`pnpm run lint`), installs Playwright browsers (`pnpm exec playwright install --with-deps`), and runs `pnpm exec playwright test`. The report is uploaded as an artifact (`playwright-report/`). Suite and URL can be overridden via workflow env if needed; otherwise config defaults (e.g. `TEST_SUITE=U001`) apply.

**Headless:** `ENV.HEADLESS` is used in Playwright config; CI typically runs headless.

---

## 14. Design Principles

- **Single suite per run:** One entry file, one selected suite per execution, controlled by configuration.
- **Workflow over isolation:** Tests model end-to-end business flows; order and dependencies are explicit and serial.
- **No hardcoded selectors:** Tests may use `page.locator(SelectorsX.CONSTANT)` but must never hardcode selector strings; all selectors come from `lib/Constants/`.
- **No raw timeouts:** All timeouts come from `TimeoutConstants.ts`.
- **Soft assertions with screenshots:** Use `expect.soft()` inside `expectSoftWithScreenshot` for consistent failure reporting.
- **Delegation to page objects and helpers:** Specs orchestrate; implementation lives in PageObject, helpers, and page classes.
- **Workflow steps over function-level steps:** Prefer calling page methods (e.g. `loginPage.login()`) over inlining the flow (fill username, fill password, click login, validate redirect) in the spec; see Section 8.
- **Single worker:** Serial execution to preserve order and shared state.
- **Centralized config and auth:** Environment and credentials from config and env, not scattered across specs.

---

## 15. Best Practices

- Import selectors as namespaces: `import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase'`.
- Use `page.locator(SelectorsPartsDataBase.CREATE_BUTTON)` (reference constants); never write `page.locator('[data-testid="..."]')` in tests.
- Wrap every assertion in `expectSoftWithScreenshot(page, () => { expect.soft(...); }, 'Description', testInfo)`.
- Validate every meaningful step (visibility, text, value, count); avoid placeholder assertions.
- Prefer workflow-style steps: call page methods (e.g. `loginPage.login()`) rather than implementing the flow (fill username, fill password, click login) in the test; add new behavior to PageObject or the appropriate helper.
- Use the project logger (`logger.log`, `logger.info`, etc.) instead of `console.log`.
- Do not add retry loops; fix flakiness with better waits or selectors.
- Use highlighting only via page object methods (`waitAndHighlight`, `highlightElement`), not inline style changes in specs.
- Keep test data in `testdata/` or `lib/Constants/TestData*.ts`; keep selectors in `lib/Constants/Selectors*.ts`; do not mix.
- Before adding a new helper method, search for an existing one in `Page.ts` or page classes to avoid duplication.

---

## 16. Framework Strengths

- **Clear separation of concerns:** Selectors, timeouts, test data, and config are centralized; page objects and helpers encapsulate behavior.
- **Predictable execution:** Suite-based orchestration and serial run make dependencies and order explicit and reproducible.
- **Strong failure diagnostics:** Soft assertions plus screenshot capture and Allure steps make debugging easier.
- **Maintainability:** One place to update selectors or timeouts; consistent patterns across specs.
- **Scalable structure:** New suites and cases can be added by adding runners and registering tests without changing the entry point logic.
- **Flexible configuration:** Same codebase can run different suites and environments via env and config.

---

## 17. Possible Improvements

- **Selective case execution:** Running a single “case” within a suite in isolation may fail when it depends on prior cases; consider documented patterns or tooling for running subsets with required setup.
- **API vs UI suite isolation:** Ensure API suites do not load UI-only setup (e.g. login) and that env boundaries are clear.
- **Test data typing:** Stricter TypeScript types for JSON test data and shared state could reduce runtime errors.
- **Reuse of Playwright’s test discovery:** If some suites could be file-based, a hybrid model (suite orchestration for workflows, file discovery for isolated tests) might simplify local “run this file” workflows while keeping the current model for full flows.
- **Stability:** Continue relying on auto-waits and stable data-testids; consider additional patterns (e.g. explicit “ready” checks) for heavily dynamic UIs if flakiness appears.
