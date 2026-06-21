# Project Information

## Overview
This document provides essential information about the project structure, including details about `autotests`, `sep_erp_server`, and `sep_erp_client`.

---

## Autotests

### Description
The `autotests` repository is dedicated to testing the functionality of the `sep_erp_server` and `sep_erp_client`. It contains automated test cases, configurations, and documentation related to testing.

### Key Directories
- `/config`: Contains project-wide configurations such as authentication settings, selectors, and environment configurations.
- `/docs`: Includes extensive documentation covering test scenarios, checklists, test coverage matrices, and testing patterns.
- `/testcases/API/`: Contains all API test cases.

### Rules
- **Critical**: All modifications, configurations, and test implementations must occur exclusively within the `autotests` repository.
- **Critical**: Do not modify or interact with files in the `sep_erp_client` and `sep_erp_server` repositories. They are strictly read-only reference materials.

---

## sep_erp_server

### Description
The `sep_erp_server` repository contains the backend logic and API for the ERP system. It is responsible for handling business logic, database interactions, and providing API endpoints for the client. The server is built using NestJS and TypeScript, ensuring a robust and scalable architecture.

### Key Directories
- `/packages/zod-shared`: Contains shared validation schemas and utilities using Zod.
- `/env`: Environment configuration files for different environments (development, production, testing).
- `/docker-compose.e2e.yml`: Docker configuration for end-to-end testing environments.
- `/src`: Contains the source code for the backend application, organized into modules.
- `/migrations`: Database migration scripts for managing schema changes.
- `/seeders`: Scripts for seeding the database with initial data.

### Technology Stack
- **Runtime**: Node.js 20
- **Framework**: NestJS 10 (TypeScript 5)
- **ORM**: Sequelize 6 + sequelize-typescript
- **Database**: PostgreSQL 16
- **Graph Database**: Neo4j 2025
- **Queues / Background Tasks**: BullMQ 5 + Redis 7
- **Cache**: Redis 7
- **File Storage**: MinIO (S3-compatible)
- **WebSockets**: Socket.io 4
- **Validation**: Zod 3 + nestjs-zod
- **Logging**: Pino + nestjs-pino
- **API Documentation**: Swagger + Compodoc
- **Testing**: Jest 29 (unit + e2e)
- **CI / Release**: GitHub Actions + semantic-release

### Key Features
- **Modular Architecture**: The server is organized into 49 modules, each responsible for specific functionality such as authentication, production tasks, warehouse management, and more.
- **Event-Driven**: Uses an event bus for handling asynchronous operations.
- **Real-Time Communication**: Supports WebSockets for real-time updates.
- **Comprehensive Documentation**: Includes Swagger for API documentation and Compodoc for code documentation.

### DTO and API Methods
- **DTO Location**: DTOs (Data Transfer Objects) are located in the `src/modules/<module-name>/dto` directory. For example, authentication-related DTOs are in `src/modules/auth/dto/`.
- **API Controllers**: API endpoints are defined in controller files within each module, such as `src/modules/auth/auth.controller.ts`. These controllers handle HTTP requests and delegate business logic to services.
- **Services**: Business logic is implemented in service files, such as `src/modules/auth/auth.service.ts`. Services interact with the database and other modules to perform operations.
- **Shared DTOs**: Shared DTOs and validation schemas are located in the `packages/zod-shared` directory, ensuring consistency across the server and client.

### Setup and Configuration
- **Environment Variables**: Configured via `.env` files in the `/env` directory.
- **Docker Support**: Includes Docker configurations for development, testing, and production environments.
- **Database Initialization**: Scripts for initializing and seeding the database are provided in the `/scripts` directory.

### Testing
- **Unit Tests**: Located in files with the `.spec.ts` extension.
- **E2E Tests**: Located in files with the `.e2e-spec.ts` extension.
- **Test Commands**:
  - `bun run test:unit`: Run unit tests.
  - `bun run test:e2e`: Run end-to-end tests.
  - `bun run test`: Run all tests.

### License
- The `sep_erp_server` is licensed under specific terms outlined in `LICENSE_RU.txt` and `LICENSE_EN.txt`.

### Testing
- **Test Location**: All tests for `sep_erp_server` and `sep_erp_client` are stored in the `autotests` repository. This ensures that the source code in `sep_erp_server` and `sep_erp_client` remains unchanged and serves as a read-only reference.
- **Test Structure**: Tests are organized into API and UI test suites, with API tests located in `testcases/API/` and UI tests in their respective directories.

### Additional Resources
- **Postman Collection**: Available for testing API endpoints.
- **Architectural Decisions**: Documented in `doc/decisions/` for key architectural choices.

### Important Rules
- **Do Not Modify**: The `sep_erp_server` and `sep_erp_client` directories must not be modified. All changes, configurations, and test implementations must occur exclusively within the `autotests` repository.
- **Read-Only**: Treat `sep_erp_server` and `sep_erp_client` as read-only reference materials to ensure consistency and avoid unintended changes.

---

## sep_erp_client

### Description
The `sep_erp_client` repository contains the frontend user interface for the ERP system. It interacts with the `sep_erp_server` to provide a seamless user experience.

### Key Directories
- `/src`: Contains the source code for the frontend application.
- `/public`: Static assets and public files.

### Technology Stack
- **Frontend Framework**: React/Vue (implied by Vite configuration)
- **Build Tool**: Vite
- **Package Management**: Bun/pnpm

---

## Relationship Between Repositories
- `autotests` is used to test both `sep_erp_server` and `sep_erp_client`.
- `sep_erp_client` interacts with `sep_erp_server` via API calls.
- Both `sep_erp_server` and `sep_erp_client` are read-only for the `autotests` repository.

---

## Additional Notes
- Always refer to the documentation in the `/docs` directory for detailed testing guidelines and scenarios.
- Ensure compliance with licensing terms when using or modifying the code in `sep_erp_server` and `sep_erp_client`.
