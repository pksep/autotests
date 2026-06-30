# Codex Notes For This Workspace

## Boundaries

- Edit only files inside `D:\Work\Git\autotests`.
- Treat `D:\Work\Git\sep_erp_server` and `D:\Work\Git\sep_erp_client` as read-only reference projects.
- When API behavior, DTO shape, route name, or selector origin is unclear, inspect server/client sources, then implement or adjust only autotests.

## Project Layout

- Autotests live in `D:\Work\Git\autotests`.
- Backend reference lives in `D:\Work\Git\sep_erp_server\sep_erp_server`.
- Frontend reference lives in `D:\Work\Git\sep_erp_client\sep_erp_client`.

## Autotests Map

- API page objects: `autotests\pages\API\API*.ts`.
- UI page objects: `autotests\pages\*.ts`.
- Base API helper: `autotests\lib\APIPage.ts`.
- Base UI page object: `autotests\lib\Page.ts`.
- Shared helpers: `autotests\lib\helpers\*.ts`.
- Selectors and test constants: `autotests\lib\Constants\*.ts` and `autotests\config\selectors.ts`.
- API specs: `autotests\testcases\API\*.spec.ts`.
- UI/business-flow specs: `autotests\testcases\*.spec.ts`.
- Environment config: `autotests\config\env.ts`, `autotests\config.ts`, `autotests\playwright.config.ts`.

## Backend Reference Map

- Nest controllers/routes: `sep_erp_server\sep_erp_server\src\modules\**\*.controller.ts` and `src\avatars\avatars.controller.ts`.
- Server services: `sep_erp_server\sep_erp_server\src\modules\**\*.service.ts`.
- Module-local DTOs: `sep_erp_server\sep_erp_server\src\modules\**\dto\*.dto.ts`.
- Shared DTOs/schemas: `sep_erp_server\sep_erp_server\packages\zod-shared\src\**\dto\*.dto.ts` and `packages\zod-shared\src\**\schemas\*.schema.ts`.
- Sequelize models: `sep_erp_server\sep_erp_server\src\modules\**\model\*.model.ts`.
- Utility methods: `sep_erp_server\sep_erp_server\src\utils\methods\*.ts`.

## Frontend Reference Map

- Client API wrappers: `sep_erp_client\sep_erp_client\src\api\*.ts`.
- Client API transport: `sep_erp_client\sep_erp_client\src\utils\api\server-api.ts`.
- Client store DTOs: `sep_erp_client\sep_erp_client\src\stores\dto\**\*.ts`.
- Client store interfaces: `sep_erp_client\sep_erp_client\src\stores\interfaces\**\*.ts`.
- Component interfaces and table hooks: `sep_erp_client\sep_erp_client\src\components\**\interfaces\*.ts`, `src\components\**\interface\*.ts`, `src\components\**\extensions\*.ts`.

## API Suite ↔ Module Map

Each API suite maps 1:1 to one server module. When a suite needs endpoint/DTO reference, go straight to the module column — do not search the whole `src`. Route prefixes are read from the `@Controller(...)` decorator; DTOs live in the module's `dto/` folder (then `packages\zod-shared`).

Paths are relative to `D:\Work\Git`.

| Suite key (`TEST_SUITE`) | Spec | API page object | Server module | Route | DTO dir |
|---|---|---|---|---|---|
| `auth_api` | `autotests\testcases\API\APIAuth.spec.ts` | `autotests\pages\API\APIAuth.ts` | `sep_erp_server\sep_erp_server\src\modules\auth` | `/` | `modules\auth\dto` |
| `users_api` | `autotests\testcases\API\APIUsers.spec.ts` | `autotests\pages\API\APIUsers.ts` | `sep_erp_server\sep_erp_server\src\modules\users` | `/users` | `modules\users\dto` |
| `product_api` | `autotests\testcases\API\APIProducts.spec.ts` | `autotests\pages\API\APIProducts.ts` | `sep_erp_server\sep_erp_server\src\modules\product` | `/product` | `modules\product\dto` |
| `details_api` | `autotests\testcases\API\APIDetails.spec.ts` | `autotests\pages\API\APIDetails.ts` | `sep_erp_server\sep_erp_server\src\modules\detal` | `/detal` | `modules\detal\dto` |
| `cbed_api` | `autotests\testcases\API\APICBED.spec.ts` | `autotests\pages\API\APICBED.ts` | `sep_erp_server\sep_erp_server\src\modules\cbed` | `/cbed` | `modules\cbed\dto` |
| `materials_api` | `autotests\testcases\API\APIMaterials.spec.ts` | `autotests\pages\API\APIMaterials.ts` | `sep_erp_server\sep_erp_server\src\modules\material` | `/material` | `modules\material\dto` |
| `contacts_api` | `autotests\testcases\API\APIContacts.spec.ts` | `autotests\pages\API\APIContacts.ts` | `sep_erp_server\sep_erp_server\src\modules\contact` | `/contacts` | `modules\contact\dto` |
| `companies_api` | `autotests\testcases\API\APICompanies.spec.ts` | `autotests\pages\API\APICompanies.ts` | `sep_erp_server\sep_erp_server\src\modules\company` | `/companies` | `modules\company\dto` |
| `stock_order_api` | `autotests\testcases\API\APIStockOrder.spec.ts` | `autotests\pages\API\APIStockOrder.ts` | `sep_erp_server\sep_erp_server\src\modules\stock-order` | `/stock-order` | `modules\stock-order\dto` |
| `shipments_api` | `autotests\testcases\API\APIShipments.spec.ts` | `autotests\pages\API\APIShipments.ts` | `sep_erp_server\sep_erp_server\src\modules\shipments` | `/shipments` | `modules\shipments\dto` |
| `warehouse_api` | `autotests\testcases\API\APIWarehouse.spec.ts` | `autotests\pages\API\APIWarehouse.ts` | `sep_erp_server\sep_erp_server\src\modules\sclad` | `/sclad` | `modules\sclad\dto` |
| `assemble_api` | `autotests\testcases\API\APIAssemble.spec.ts` | `autotests\pages\API\APIAssemble.ts` | `sep_erp_server\sep_erp_server\src\modules\assemble` | `/assemble` | `modules\assemble\dto` |
| `metaloworking_api` | `autotests\testcases\API\APIMetaloworking.spec.ts` | `autotests\pages\API\APIMetaloworking.ts` | `sep_erp_server\sep_erp_server\src\modules\metaloworking` | `/metaloworking` | `modules\metaloworking\dto` |
| `production_tasks_api` | `autotests\testcases\API\APIProductionTasks.spec.ts` | `autotests\pages\API\APIProductionTasks.ts` | `sep_erp_server\sep_erp_server\src\modules\production-tasks` | `/production-task` | `modules\production-tasks\dto` |

Cross-module lookups (referenced by the suites above, but not their own suite):
- Warehouse/deficits flags → `modules\deficits` (route `/deficits`).
- Stock/assembly movements → `modules\moving`, `modules\movement-object`, `modules\movement-errors`.
- Shared validation schemas (cross-cutting DTOs) → `sep_erp_server\sep_erp_server\packages\zod-shared`.

Naming gotchas:
- Suite `details_api` ↔ module `detal` (not `details`).
- Suite `warehouse_api` ↔ module `sclad` (not `warehouse`).
- Suite `production_tasks_api` ↔ route `/production-task` (singular), module `production-tasks` (plural).

## Lookup Routine

1. Start from the autotest API object or UI page object that matches the feature.
2. Compare the endpoint with the backend controller decorator and method path.
3. Check request DTOs in module-local `dto` first, then in `packages\zod-shared`.
4. Use client `src\api\*.ts` as a practical example of payloads and expected calls.
5. Keep changes scoped to autotests.

More detailed route and DTO notes are in `docs/codex-project-map.md`.

## Running Tests

- Work from `D:\Work\Git\autotests`.
- The normal entry point is `main.spec.ts`; suites are selected by `TEST_SUITE`.
- Suite keys are registered in `testSuiteConfig.ts`, `testSuiteConfig.ui.ts`, and `testSuiteConfig.api.ts`.
- To run any suite, set `TEST_SUITE` and run `pnpm test`:

```powershell
$env:TEST_SUITE='<suite_key>'; pnpm test
```

- Example:

```powershell
$env:TEST_SUITE='auth_api'; pnpm test
```

- For the configured parallel suite set:

```powershell
$env:TEST_SUITE='parallel'; pnpm test
```

- Do not run spec files directly when they only export runner functions that are called from a suite; Playwright may report `No tests found`. Direct file runs are only appropriate for files with top-level Playwright `test(...)` declarations and when `playwright.config.ts` test matching allows them.
- If an API run fails with `connect EACCES` against `https://dev.pksep.ru`, rerun the same command with network/escalated permission; this is a sandbox/network access issue, not a test failure.
