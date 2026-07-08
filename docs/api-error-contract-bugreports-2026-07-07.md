# API error contract bug reports, 2026-07-07

Environment:

- `API_BASE_URL`: `https://dev.pksep.ru/`
- Source of truth checked locally: `D:\Work\Git\sep_erp_server\sep_erp_server`
- Run command pattern: `$env:TEST_SUITE='<suite>'; npm exec -- playwright test --reporter=line`

Checked suites after test updates:

- `comments_api`: 5 passed
- `exclusion_api`: 7 passed
- `neo4j_api`: 3 passed
- `documents_api`: 10 passed, 1 failed, 3 did not run
- `buyer_api`: 3 passed, 1 failed, 4 skipped
- `production_tasks_api`: 15 passed, 2 failed

## API-ERR-001: Documents bulk upload returns 502

Test:

- `testcases/API/APIDocuments.spec.ts:348`
- `Documents API: связи файлов с оборудованием и загрузочные сценарии › массово прикрепляет и открепляет документы от оборудования`

Steps:

1. Run `TEST_SUITE=documents_api`.
2. In the bulk attach/unpin scenario, create several test documents through `POST /api/documents/add`.

Expected:

- Document creation returns a success status (`200`, `201`, `202`, or `204`).
- No 5xx response.

Actual:

- `502 Bad Gateway`
- Body is nginx HTML: `<title>502 Bad Gateway</title>`.

Impact:

- Bulk document relationship scenario is blocked before attach/unpin verification.
- The API gateway returns an infrastructure error instead of a JSON API error contract.

## API-ERR-002: Buyer light endpoint falls through to static index and returns 500

Test:

- `testcases/API/APIBuyer.spec.ts:205`
- `Buyer API: контракты чтения и defensive-сценарии › light-список и архивная выдача не отвечают 5xx`

Steps:

1. Send `GET /api/buyer/light/true`.

Expected:

- If Buyer API is supported, return a successful light list response.
- If Buyer API is not exposed by `sep_erp_server`, return a client error such as `404`.
- No 5xx response.

Actual:

- `500`
- Body: `{"statusCode":500,"message":"ENOENT: no such file or directory, stat '/app/dist/static/index.html'","reqId":"d5b6df6c9ae452fd1e7945ecfa6d44b6"}`

Impact:

- A missing/nonexistent API route is reported as a server error.
- The response exposes internal filesystem details.

## API-ERR-003: invalid production task subdivision returns 500

Test:

- `testcases/API/APIProductionTasks.spec.ts:1069`
- `Production Tasks API: defensive-сценарии › несуществующие id и невалидные справочники обрабатываются без серверных ошибок`

Steps:

1. Send `GET /api/production-task/for-all-users/invalid-subdivision`.

Expected:

- Either a client error for an unsupported subdivision or a safe empty/non-success response.
- No 5xx response.

Actual:

- `500`
- Body: `{"statusCode":500,"message":"Cannot read properties of undefined (reading 'forEach')","reqId":"b17c11cb31eae323dd3af6ac41367f96"}`

Impact:

- Invalid route input reaches aggregation code and crashes.
- Client input is classified as an internal server failure.

## API-ERR-004: invalid equipment start time mutation aborts transaction and returns 500

Test:

- `testcases/API/APIProductionTasks.spec.ts:1120`
- `Production Tasks API: defensive-сценарии › невалидные мутации ПЗ отклоняются без серверных ошибок`

Steps:

1. Send `POST /api/production-task/set/start/time/detal`.
2. Body: `{ "equipmentId": 999999999, "time": "<valid ISO timestamp>" }`.

Expected:

- 4xx client error for a missing or invalid equipment id.
- No database transaction message in the API response.

Actual:

- `500`
- Body: `{"statusCode":500,"message":"current transaction is aborted, commands ignored until end of transaction block","reqId":"beba67767d1da68858814c3c0996366bf"}`

Impact:

- Invalid client data is classified as a server error.
- The API exposes an implementation-level database transaction message.
