# SEP ERP — Test Automation

Playwright-based test automation for the SEP ERP system. This document explains how to **manage and control** test runs using `config.ts` and `testSuiteConfig.ts`.

---

## 1. Project structure (overview)

| Path | Purpose |
|------|--------|
| `config.ts` | Environment, URLs, which suite runs, login config, selectors, API constants |
| `testSuiteConfig.ts` | Registry of all test suites: each suite key maps to one or more test runner functions |
| `main.spec.ts` | Single entry point: reads `TEST_SUITE` from config and runs the matching suite |
| `setup.ts` | Global `beforeEach`: login (skipped for API suites), wait for dashboard |
| `playwright.config.ts` | Playwright settings (timeouts, baseURL, headless, etc.); uses `config.ts` for baseURL/headless |
| `testcases/*.spec.ts` | Test implementations; each exports a `runXxx()` function that registers Playwright tests |
| `pages/*.ts` | Page objects |
| `lib/` | Shared helpers, constants, utilities |

Tests are **not** started by opening individual `testcases/*.spec.ts` files. All runs go through `main.spec.ts`, which executes only the suite selected in config.

---

## 2. How test execution is controlled

### 2.1 Choosing which suite runs

1. **In code (default):**  
   In `config.ts`, set:

   ```ts
   export const ENV = {
     // ...
     TEST_SUITE: 'U002',  // ← change this to the suite you want
     // ...
   };
   ```

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

The value of `TEST_SUITE` must match one of the keys in `testSuiteConfig.ts` (e.g. `U002`, `U004_1`, `U001_Setup`, `ERP_3015`, `CheckTableTotals`, `auth_api`).

### 2.2 Flow in short

1. `main.spec.ts` reads `ENV.TEST_SUITE` from `config.ts`.
2. It looks up `testSuites[TEST_SUITE]` in `testSuiteConfig.ts`.
3. It runs `runSetup()` (login for UI suites, skipped for API suites).
4. It calls each `test` function in `suite.tests` in order (e.g. `runU002()`, or `runU001_01_Setup()`, …).
5. Each `runXxx()` registers and runs its Playwright tests (e.g. `test.describe.serial(..., () => { test(...) })`).

So: **one suite per run**, selected by `TEST_SUITE` in config or env.

---

## 3. config.ts — what you can change

| Item | Meaning | Override via env |
|------|--------|-------------------|
| `BASE_URL` | App URL for UI tests | `BASE_URL` |
| `API_BASE_URL` | Base URL for API tests | `API_BASE_URL` |
| `HEADLESS` | Run browser headless | `HEADLESS` (`'true'` / `'false'`) |
| `TIMEOUT` | Default timeout (ms) | `TIMEOUT` |
| `TEST_SUITE` | Which suite runs (must match key in testSuiteConfig) | `TEST_SUITE` |
| `TEST_DIR` | Test directory (default `'.'`) | `TEST_DIR` |
| `LOG_LEVEL` | Logger level: `'error'` \| `'warn'` \| `'info'` \| `'debug'` | `LOG_LEVEL` |
| `DEBUG` | Debug flag for login etc. | — |

Other exports: `LOGIN_TEST_CONFIG`, `SELECTORS` (menu/URLs), `API_CONST`, `PRODUCT_SPECS`. Use these in tests; avoid hardcoding the same values in spec files.

---

## 4. testSuiteConfig.ts — suite registry

### 4.1 Structure

- **Imports:** Each test file exports a runner, e.g. `runU002`, `runU004_1`, `runERP_3015`, `runAuthAPI`.
- **Object `testSuites`:** Keys are suite IDs; values are:
  - `description` — short text for logs/reports
  - `tests` — array of `{ test: runXxx, description }`

Example:

```ts
U002: {
  description: 'Launch into production (CreateOrderedFromSuppliersPage, ...)',
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

### 4.2 Suite keys (examples)

- **UI / E2E:** `U001`, `U001_Setup`, `U001_Orders`, `U001_Production`, … `U001_Cleanup`, `U002`, `U003`, `U004_1` … `U004_9`, `U005`, `U006`, `ERP_969`, `ERP_3015`, `CheckTableTotals`, `V001`, `page001` … `page010`, `TC100`, `suite01`, `suite02`, …
- **API:** `auth_api`, `users_api`, `orders_api`, … `all_api_tests`, etc.

Names are **case-sensitive** (e.g. `U004_1` not `u004_1`).

### 4.3 Adding a new suite

1. Create or use a test file that exports a runner, e.g. `export function runMySuite() { ... }`.
2. In `testSuiteConfig.ts`:
   - Import: `import { runMySuite } from './testcases/MySuite.spec';`
   - Add an entry:  
     `MySuite: { description: '...', tests: [ { test: runMySuite, description: '...' } ] },`
3. Run it by setting `TEST_SUITE: 'MySuite'` in `config.ts` or `TEST_SUITE=MySuite` in the environment.

---

## 5. Running tests

- **Default (uses `TEST_SUITE` from config):**
  ```bash
  npx playwright test
  ```
- **Override suite (and optionally other options):**
  ```bash
  # PowerShell
  $env:TEST_SUITE='U004_1'; $env:HEADLESS='true'; npx playwright test

  # With more log output
  $env:LOG_LEVEL='info'; npx playwright test
  ```
- **Playwright UI:**
  ```bash
  pnpm run ui
  # or
  npx playwright test --ui
  ```
  The same entry point (`main.spec.ts`) and the same `TEST_SUITE` from config/env apply.

---

## 6. Setup and login

- **UI suites:** `setup.ts` runs before each test: selects user (tabel), name, password, clicks login, waits for the dashboard. Credentials come from `config.ts` (`LOGIN_TEST_CONFIG` / defaults in setup).
- **API suites:** If `ENV.TEST_SUITE` contains `'api'` (e.g. `auth_api`, `orders_api`), the web login step is skipped.

---

## 7. Quick reference

| Goal | Action |
|------|--------|
| Run one specific suite | Set `TEST_SUITE` in `config.ts` or env to the suite key (e.g. `U002`, `U004_1`) and run `npx playwright test` |
| Run without opening browser | Set `HEADLESS: true` in config or `HEADLESS=true` in env |
| Point to another environment | Set `BASE_URL` / `API_BASE_URL` in config or env |
| See more logs | Set `LOG_LEVEL=info` or `LOG_LEVEL=debug` in env |
| Add a new suite | Add runner in testcases, import it in testSuiteConfig, add entry to `testSuites`, then use `TEST_SUITE=NewKey` |

Using `config.ts` and `testSuiteConfig.ts` this way keeps all “which tests run and where” in one place and makes it clear for future testers how to manage and control the project.
