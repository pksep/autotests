# Codex Project Map

This file is a working index for future autotest changes. Backend and frontend paths are reference-only; do not edit them from this workspace task.

## Hard Rule

All code changes go under `D:\Work\Git\autotests`. Use `D:\Work\Git\sep_erp_server` and `D:\Work\Git\sep_erp_client` only for reading DTOs, methods, routes, selectors, and UI/API behavior.

## Autotests Structure

| Area | Path | Notes |
| --- | --- | --- |
| API page objects | `pages\API\API*.ts` | One class per API domain, usually extends `APIPageObject`. |
| API tests | `testcases\API\*.spec.ts` | Test entrypoints export `run*API` helpers. |
| API base helper | `lib\APIPage.ts` | Auth helpers, JSON request helpers, common API behavior. |
| UI page objects | `pages\*.ts` | Page object classes, usually named `Create*Page` or domain-specific names. |
| UI/business tests | `testcases\*.spec.ts` | Flow-oriented specs such as `U001`, `U002`, `ERP-*`, `P*`, `TC*`. |
| Shared UI helpers | `lib\helpers\*.ts` | Table, modal, navigation, login, archive, validation utilities. |
| Selectors/constants | `lib\Constants\*.ts`, `config\selectors.ts` | Prefer existing selector constants before adding new inline selectors. |
| Env/config | `config\env.ts`, `config.ts`, `playwright.config.ts` | Base URLs and Playwright settings. |

## Backend Reference: Where DTOs And Methods Live

Root: `D:\Work\Git\sep_erp_server\sep_erp_server`

| Backend item | Path pattern |
| --- | --- |
| Controllers/routes | `src\modules\**\*.controller.ts`, `src\avatars\avatars.controller.ts` |
| Services/business methods | `src\modules\**\*.service.ts` |
| Module DTOs | `src\modules\**\dto\*.dto.ts` |
| Shared DTOs | `packages\zod-shared\src\**\dto\*.dto.ts` |
| Shared schemas | `packages\zod-shared\src\**\schemas\*.schema.ts` |
| Models | `src\modules\**\model\*.model.ts`, `src\avatars\model\*.model.ts` |
| General utility methods | `src\utils\methods\*.ts` |

Common module domains with controllers and DTOs:

| Domain | Controller | Main DTO locations |
| --- | --- | --- |
| auth | `src\modules\auth\auth.controller.ts` | `src\modules\auth\dto`, `packages\zod-shared\src\user\dto` |
| users | `src\modules\users\users.controller.ts` | `src\modules\users\dto`, `packages\zod-shared\src\user\dto` |
| roles | `src\modules\roles\roles.controller.ts` | `src\modules\roles\dto`, `packages\zod-shared\src\role\dto` |
| detal / parts | `src\modules\detal\detal.controller.ts` | `src\modules\detal\dto`, `packages\zod-shared\src\detal\dto` |
| cbed | `src\modules\cbed\cbed.controller.ts` | `src\modules\cbed\dto`, `packages\zod-shared\src\cbed\dto` |
| product | `src\modules\product\product.controller.ts` | `src\modules\product\dto`, `packages\zod-shared\src\product\dto` |
| material | `src\modules\material\material.controller.ts` | `src\modules\material\dto`, `packages\zod-shared\src\material\dto` |
| assemble | `src\modules\assemble\assemble.controller.ts` | `src\modules\assemble\dto`, `packages\zod-shared\src\assemble\dto` |
| assemble-kit | `src\modules\assemble-kit\assemble-kit.service.ts` | `src\modules\assemble-kit\dto`, `packages\zod-shared\src\assemble-kit\dto` |
| metaloworking | `src\modules\metaloworking\metaloworking.controller.ts` | `src\modules\metaloworking\dto`, `packages\zod-shared\src\metaloworking\dto` |
| production-task | `src\modules\production-tasks\production-tasks.controller.ts` | `src\modules\production-tasks\dto`, `packages\zod-shared\src\production-tasks\dto` |
| online-board | `src\modules\production-tasks\online-board\online-board.controller.ts` | `packages\zod-shared\src\production-tasks\dto` |
| shipments | `src\modules\shipments\shipments.controller.ts` | `src\modules\shipments\dto`, `packages\zod-shared\src\shipments\dto` |
| stock-order | `src\modules\stock-order\stock-order.controller.ts` | `src\modules\stock-order\dto`, `packages\zod-shared\src\stock-order\dto` |
| sclad / warehouse | `src\modules\sclad\sclad.controller.ts` | `src\modules\sclad\dto`, `packages\zod-shared\src\sclad\dto` |
| documents | `src\modules\documents\documents.controller.ts` | `src\modules\documents\dto`, `packages\zod-shared\src\document\dto` |
| waybill | `src\modules\waybill\waybill.controller.ts` | `src\modules\waybill\dto`, `packages\zod-shared\src\waybill\dto` |
| companies | `src\modules\company\companies.controller.ts` | `src\modules\company\dto`, `packages\zod-shared\src\company\dto` |
| contacts | `src\modules\contact\contacts.controller.ts` | `src\modules\contact\dto`, `packages\zod-shared\src\contact\dto` |
| deliveries | `src\modules\deliveries\deliveries.controller.ts` | `src\modules\deliveries\dto`, `packages\zod-shared\src\deliveries\dto` |
| equipment | `src\modules\equipment\equipment.controller.ts` | `src\modules\equipment\dto`, `packages\zod-shared\src\equipment\dto` |
| instrument/tools | `src\modules\instrument\instrument.controller.ts` | `src\modules\instrument\dto`, `packages\zod-shared\src\instrument\dto` |
| inventary | `src\modules\inventary\inventary.controller.ts` | `src\modules\inventary\dto`, `packages\zod-shared\src\inventary\dto` |
| operation / tech process | `src\modules\operation\operation.controller.ts`, `src\modules\tech-process\tech-process.controller.ts` | `src\modules\operation\dto`, `src\modules\tech-process\dto`, `packages\zod-shared\src\operations\dto`, `packages\zod-shared\src\tech-process\dto` |
| marks / result works | `src\modules\marks\marks.controller.ts` | `src\modules\marks\dto`, `packages\zod-shared\src\marks\dto` |
| rack | `src\modules\rack\rack.controller.ts` | `src\modules\rack\dto`, `packages\zod-shared\src\rack\dto` |
| settings | `src\modules\settings\settings.controller.ts` | `src\modules\settings\dto`, `packages\zod-shared\src\settings\dto` |
| comments/thread | `src\modules\thread\thread.controller.ts` | `src\modules\thread\dto`, `packages\zod-shared\src\thread\dto` |
| actions | `src\modules\actions\actions.controller.ts` | `src\modules\actions\dto`, `packages\zod-shared\src\action\dto` |

## Backend Route Lookup

Use controller decorators as the source of truth. Typical route roots:

| Route root | Controller |
| --- | --- |
| `/api/auth/*` | `src\modules\auth\auth.controller.ts` |
| `/api/users/*` | `src\modules\users\users.controller.ts` |
| `/api/roles/*` | `src\modules\roles\roles.controller.ts` |
| `/api/detal/*` | `src\modules\detal\detal.controller.ts` |
| `/api/cbed/*` | `src\modules\cbed\cbed.controller.ts` |
| `/api/product/*` | `src\modules\product\product.controller.ts` |
| `/api/material/*` | `src\modules\material\material.controller.ts` |
| `/api/assemble/*` | `src\modules\assemble\assemble.controller.ts` |
| `/api/metaloworking/*` | `src\modules\metaloworking\metaloworking.controller.ts` |
| `/api/production-task/*` | `src\modules\production-tasks\production-tasks.controller.ts` |
| `/api/online-board/*` | `src\modules\production-tasks\online-board\online-board.controller.ts` |
| `/api/shipments/*` | `src\modules\shipments\shipments.controller.ts` |
| `/api/stock-order/*` | `src\modules\stock-order\stock-order.controller.ts` |
| `/api/sclad/*` | `src\modules\sclad\sclad.controller.ts` |
| `/api/documents/*` | `src\modules\documents\documents.controller.ts` |
| `/api/waybill/*` | `src\modules\waybill\waybill.controller.ts` |
| `/api/companies/*` | `src\modules\company\companies.controller.ts` |
| `/api/contacts/*` | `src\modules\contact\contacts.controller.ts` |
| `/api/deliveries/*` | `src\modules\deliveries\deliveries.controller.ts` |
| `/api/equipment/*` | `src\modules\equipment\equipment.controller.ts` |
| `/api/instrument/*` | `src\modules\instrument\instrument.controller.ts` |
| `/api/inventary/*` | `src\modules\inventary\inventary.controller.ts` |
| `/api/operation/*` | `src\modules\operation\operation.controller.ts` |
| `/api/tech-process/*` | `src\modules\tech-process\tech-process.controller.ts` |
| `/api/marks/*` | `src\modules\marks\marks.controller.ts` |
| `/api/rack/*` | `src\modules\rack\rack.controller.ts` |
| `/api/settings/*` | `src\modules\settings\settings.controller.ts` |
| `/api/comments/*` | `src\modules\thread\thread.controller.ts` |
| `/api/actions/*` | `src\modules\actions\actions.controller.ts` |

## Frontend Reference: API Calls And Payload Examples

Root: `D:\Work\Git\sep_erp_client\sep_erp_client`

| Frontend item | Path pattern |
| --- | --- |
| API wrapper files | `src\api\*.ts` |
| HTTP transport | `src\utils\api\server-api.ts` |
| Store DTOs | `src\stores\dto\**\*.ts` |
| Store interfaces | `src\stores\interfaces\**\*.ts` |
| Component interfaces | `src\components\**\interfaces\*.ts`, `src\components\**\interface\*.ts` |
| Table/composable behavior | `src\components\**\extensions\*.ts`, `src\views\**\extenstions\*.ts` |

Useful client API wrappers:

| Domain | Client API file |
| --- | --- |
| actions | `src\api\actions.ts` |
| assemble | `src\api\assemble.ts` |
| auth/users | `src\api\users.ts` plus auth calls in server transport consumers |
| cbed | `src\api\cbed.ts` |
| companies | `src\api\company.ts` |
| deliveries | `src\api\delivery.ts` |
| detal | `src\api\detal.ts` |
| documents | `src\api\documents.ts` |
| equipment | `src\api\equipment.ts` |
| materials | `src\api\materials.ts` |
| marks | `src\api\marks.ts` |
| metaloworking | `src\api\metalloworking.ts` |
| operation | `src\api\operation.ts` |
| production-task / online-board | `src\api\production-task.ts` |
| product | `src\api\product.ts` |
| sclad | `src\api\sclad.ts` |
| shipments | `src\api\shipments.ts` |
| stock-order | `src\api\stock-order.ts` |
| tech-process | `src\api\tech-process.ts` |
| waybill | `src\api\waybill.ts` |

## Autotest API Object Cross-Reference

| Backend domain | Autotest API object |
| --- | --- |
| auth | `pages\API\APIAuth.ts`, `pages\API\APIAuthNew.ts` tests |
| users | `pages\API\APIUsers.ts` |
| roles | `pages\API\APIRoles.ts` |
| detal / parts | `pages\API\APIDetails.ts`, `pages\API\APIParts.ts` |
| cbed | `pages\API\APICBED.ts` |
| product | `pages\API\APIProducts.ts` |
| material | `pages\API\APIMaterials.ts` |
| assemble | `pages\API\APIAssemble.ts` |
| production-task | `pages\API\APIProductionTasks.ts` |
| shipments | `pages\API\APIShipments.ts` |
| sclad | `pages\API\APIWarehouse.ts` |
| documents | `pages\API\APIDocuments.ts` |
| contacts | `pages\API\APIContacts.ts` |
| equipment | `pages\API\APIEquipment.ts` |
| instrument/tools | `pages\API\APITools.ts` |
| inventory | `pages\API\APIInventory.ts` |
| tech-process/specification | `pages\API\APITechProcess.ts`, `pages\API\APISpecifications.ts` |

## Fast Search Commands

Run from `D:\Work\Git` unless noted.

```powershell
rg -n "@(Controller|Get|Post|Put|Patch|Delete)\(" sep_erp_server\sep_erp_server\src\modules
rg -n "class .*API|request\.|ENV\.API_BASE_URL" autotests\pages\API autotests\lib\APIPage.ts
rg -n "serverApi\.(get|post|put|delete|head)" sep_erp_client\sep_erp_client\src\api
rg --files sep_erp_server\sep_erp_server\src\modules -g "*.dto.ts"
rg --files sep_erp_server\sep_erp_server\packages\zod-shared\src -g "*.dto.ts" -g "*.schema.ts"
rg -n "export (interface|type|class|const)" autotests\lib autotests\pages autotests\testcases
```

## Practical Rules For Future Changes

- Prefer existing `pages\API\API*.ts` methods over writing raw request calls in specs.
- If an autotest endpoint disagrees with backend controller decorators, backend wins; fix only autotests.
- If a payload is unclear, compare three places: autotest method, backend DTO, frontend `src\api\*.ts`.
- Prefer constants from `lib\Constants` and helper methods from `lib\helpers` over duplicating selectors or polling logic.
- Keep test data near the relevant `testcases\*-Constants.ts` or `lib\Constants\TestData*.ts` pattern already used by that flow.
