# SEP ERP — Test Automation

Playwright-based test automation for the SEP ERP system. This document explains how to **manage and control** test runs using `config.ts` and the suite registry, and how to work with the codebase.

---

## 1. Project structure (overview)

| Path | Purpose |
|------|--------|
| `config.ts` | Barrel: re-exports `ENV`, `LOGIN_TEST_CONFIG`, `SELECTORS`, `PRODUCT_SPECS` from `config/` |
| `config/` | Implementation: `env.ts` (ENV), `auth.config.ts` (login), `selectors.ts` (menu/URLs, product specs) |
| `testSuiteConfig.ts` | Suite registry: merges UI and API suites; single entry for `main.spec.ts` |
| `testSuiteConfig.ui.ts` | UI/E2E suite definitions (U001, U002, …) |
| `testSuiteConfig.api.ts` | API suite definitions (auth_api, users_api, …) |
| `main.spec.ts` | Single entry point: reads `TEST_SUITE` from config and runs the matching suite |
| `setup.ts` | Global `beforeEach`: login (skipped for API suites), wait for dashboard |
| `playwright.config.ts` | Playwright settings (timeouts, baseURL, headless); uses config for baseURL/headless |
| `testcases/*.spec.ts` | Test implementations; each exports a `runXxx()` that registers Playwright tests |
| `pages/*.ts` | Page objects (extend PageObject; use `this.element` for ElementHelper, e.g. `clickButton`) |
| `lib/` | Shared helpers, utilities, PageObject base |
| `lib/Constants/` | Selectors (`Selectors*.ts`), test data (`TestData*.ts`), timeouts (`TimeoutConstants.ts`), API constants (`APIConstants.ts`) |
| `lib/utils/logger.ts` | Project logger (use instead of `console` in tests and helpers) |
| `eslint.config.mjs` | ESLint 10 flat config; integrates Prettier |
| `.prettierrc` | Prettier options (single quotes, printWidth, etc.) |
| `.nvmrc` | Node version for CI and local (e.g. 20.19) |

Tests are **not** started by opening individual `testcases/*.spec.ts` files. All runs go through `main.spec.ts`, which executes only the suite selected in config or environment.

---

## 2. Requirements and environment

- **Node.js** — Version from `.nvmrc` (e.g. 22.x). CI uses this file.
- **Package manager** — `pnpm` (see `packageManager` in `package.json`). Run `pnpm install` then `pnpm exec playwright install --with-deps` for browsers.
- **Application under test** — For UI suites, `BASE_URL` must point to a running SEP ERP client. For API suites, `API_BASE_URL` must be reachable. No Docker is required; run the app and API as needed.

---

## 3. How test execution is controlled

### 3.1 Choosing which suite runs

1. **In code (default):**  
   In `config/env.ts` (or override via env), the effective config is in `ENV`. You can set defaults in `config/env.ts`:
   - `TEST_SUITE` is read from `process.env.TEST_SUITE` or a default (e.g. `'U001'`).

2. **Via environment variable (overrides config):**  
   When running Playwright, set `TEST_SUITE` to the **exact** suite key (case-sensitive):

   ```bash
   # Windows (PowerShell)
   $env:TEST_SUITE='U004_1'; npx playwright test

   # Windows (CMD)
   set TEST_SUITE=U004_1 && npx playwright test

   # Linux / macOS
   TEST_SUITE=U004_1 npx playwright test
   ```

The value of `TEST_SUITE` must match one of the keys in the merged registry (e.g. `U002`, `U004_1`, `U001_Setup`, `ERP_3015`, `CheckTableTotals`, `auth_api`).

### 3.2 Flow in short

1. `main.spec.ts` reads `ENV.TEST_SUITE` from config.
2. It looks up `testSuites[TEST_SUITE]` in `testSuiteConfig.ts` (which merges `uiSuites` and `apiSuites`).
3. It runs `runSetup()` (login for UI suites, skipped for API suites).
4. It calls each `test` function in `suite.tests` in order (e.g. `runU002()`, `runU001_01_Setup()`, …).
5. Each `runXxx()` registers and runs its Playwright tests.

So: **one suite per run**, selected by `TEST_SUITE` in config or env.

---

## 4. CI/CD (GitHub Actions)

The workflow in `.github/workflows/playwright.yml` runs on push/PR to `main` and `canary`. Steps: checkout, pnpm setup, Node from `.nvmrc`, install deps, **lint** (`pnpm run lint -- --max-warnings 5000`), install Playwright browsers, run tests, upload `playwright-report/` (30 days).

To change which suite or environment runs **without changing code**, set in the job’s `env:` block:

| Variable | Purpose |
|----------|---------|
| `TEST_SUITE` | Suite key from the registry (e.g. `U001`, `U002`, `auth_api`). Omit to use default from config. |
| `BASE_URL` | App URL for UI tests. |
| `API_BASE_URL` | Base URL for API tests. |

---

## 5. config — what you can change

`config.ts` re-exports from `config/`. Override via `.env` or `process.env` where supported.

| Item | Meaning | Override via env |
|------|--------|------------------|
| `BASE_URL` | App URL for UI tests | `BASE_URL` |
| `API_BASE_URL` | Base URL for API tests | `API_BASE_URL` |
| `HEADLESS` | Run browser headless | `HEADLESS` (`'true'` / `'false'`) |
| `TIMEOUT` | Default timeout (ms) | `TIMEOUT` |
| `TEST_SUITE` | Which suite runs (must match key in registry) | `TEST_SUITE` |
| `TEST_DIR` | Test directory (default `'.'`) | `TEST_DIR` |
| `LOG_LEVEL` | Logger level: `'error'` \| `'warn'` \| `'info'` \| `'debug'` | `LOG_LEVEL` |
| `DEBUG` | Debug flag for login etc. | — |

Other exports: `LOGIN_TEST_CONFIG`, `SELECTORS` (menu/URLs), `PRODUCT_SPECS`. Use these in tests; do not hardcode the same values in spec files. Selectors for UI elements live in `lib/Constants/Selectors*.ts`; API test constants in `lib/Constants/APIConstants.ts`.

---

## 6. testSuiteConfig — suite registry

The registry is built in `testSuiteConfig.ts` by merging `uiSuites` (`testSuiteConfig.ui.ts`) and `apiSuites` (`testSuiteConfig.api.ts`). Keys are suite IDs; values are `{ description, tests }`.

### 6.1 Structure

- **Imports:** Each test file exports a runner, e.g. `runU002`, `runU004_1`, `runERP_3015`, `runAuthAPI`.
- **Object `testSuites`:** In `testSuiteConfig.ts`, `testSuites = { ...uiSuites, ...apiSuites }`. Each entry has:
  - `description` — short text for logs/reports
  - `tests` — array of `{ test: runXxx, description }`

### 6.2 Suite keys (examples)

- **UI / E2E:** `U001`, `U001_Setup`, `U001_Orders`, `U001_Production`, … `U001_Cleanup`, `U002`, `U003`, `U004_1` … `U004_9`, `U005`, `U006`, `ERP_969`, `ERP_3015`, `CheckTableTotals`, `V001`, `page001` … `page010`, `TC100`, `suite01`, `suite02`, …
- **API:** `auth_api`, `users_api`, `orders_api`, … `all_api_tests`, etc.

Names are **case-sensitive** (e.g. `U004_1` not `u004_1`).

### 6.3 Adding a new suite

1. Create or use a test file that exports a runner, e.g. `export function runMySuite() { ... }`.
2. In `testSuiteConfig.ui.ts` or `testSuiteConfig.api.ts`:
   - Import: `import { runMySuite } from './testcases/MySuite.spec';`
   - Add an entry: `MySuite: { description: '...', tests: [ { test: runMySuite, description: '...' } ] },`
3. Run it by setting `TEST_SUITE: 'MySuite'` in config or `TEST_SUITE=MySuite` in the environment.

---

## 7. Running tests

- **Default (uses `TEST_SUITE` from config):**
  ```bash
  pnpm exec playwright test
  # or
  npx playwright test
  ```
- **Override suite and options:**
  ```bash
  # PowerShell
  $env:TEST_SUITE='U004_1'; $env:HEADLESS='true'; npx playwright test

  # More log output
  $env:LOG_LEVEL='info'; npx playwright test
  ```
- **Playwright UI:**
  ```bash
  pnpm run ui
  # or
  npx playwright test --ui
  ```
  The same entry point (`main.spec.ts`) and `TEST_SUITE` from config/env apply.

---

## 8. Linting and formatting

- **Lint:** `pnpm run lint` (ESLint; includes Prettier via `eslint-plugin-prettier`).
- **Auto-fix:** `pnpm run lint:fix` (fixes formatting and other auto-fixable rules).

CI runs `pnpm run lint -- --max-warnings 5000` before tests. Use `lib/Constants/` for selectors and timeouts; see `.cursorrules` in the repo for full coding standards.

---

## 9. Setup and login

- **UI suites:** `setup.ts` runs before each test: selects user (tabel, name, password), clicks login, waits for the dashboard. Credentials come from config (`LOGIN_TEST_CONFIG` / defaults in setup).
- **API suites:** If `ENV.TEST_SUITE` contains `'api'` (e.g. `auth_api`, `orders_api`), the web login step is skipped.

---

## 10. Quick reference

| Goal | Action |
|------|--------|
| Run one specific suite | Set `TEST_SUITE` in config or env to the suite key (e.g. `U002`, `U004_1`) and run `pnpm exec playwright test` |
| Run without opening browser | Set `HEADLESS: true` in config or `HEADLESS=true` in env |
| Point to another environment | Set `BASE_URL` / `API_BASE_URL` in config or env |
| See more logs | Set `LOG_LEVEL=info` or `LOG_LEVEL=debug` in env |
| Lint / fix code | `pnpm run lint` or `pnpm run lint:fix` |
| Add a new suite | Add runner in testcases, add entry in `testSuiteConfig.ui.ts` or `testSuiteConfig.api.ts`, then use `TEST_SUITE=NewKey` |

Using `config.ts` and the suite registry keeps “which tests run and where” in one place and makes it clear how to manage and control the project.
