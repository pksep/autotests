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

## Lookup Routine

1. Start from the autotest API object or UI page object that matches the feature.
2. Compare the endpoint with the backend controller decorator and method path.
3. Check request DTOs in module-local `dto` first, then in `packages\zod-shared`.
4. Use client `src\api\*.ts` as a practical example of payloads and expected calls.
5. Keep changes scoped to autotests.

More detailed route and DTO notes are in `docs/codex-project-map.md`.
