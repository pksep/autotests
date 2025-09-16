import { test, expect, request } from "@playwright/test";
import { APIImportExport } from "../pages/APIImportExport";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";

export const runImportExportAPI = () => {
    logger.info(`Starting Import/Export API defensive tests - looking for API problems`);

    test("Import/Export API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const importExportAPI = new APIImportExport(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Import data without authentication", async () => {
            console.log("Testing unauthenticated data import...");

            const importData = {
                type: API_CONST.API_TEST_IMPORT_TYPE,
                data: "test,data,import"
            };

            const unauthenticatedResponse = await importExportAPI.importData(request, importData, "invalid_user");

            // API PROBLEM: If this returns 201, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            expect(unauthenticatedResponse.status).not.toBe(201);
            expect(unauthenticatedResponse.status).not.toBe(200);
            expect(unauthenticatedResponse.status).not.toBe(403);
            expect(unauthenticatedResponse.status).not.toBe(500);
            expect(unauthenticatedResponse.status).not.toBe(502);
            expect(unauthenticatedResponse.status).not.toBe(503);
            expect(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect(unauthenticatedResponse.data).toBeDefined();
            console.log("✅ Unauthenticated data import correctly rejected with 401");
        });

        await test.step("Test 2: Import data with SQL injection", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                type: API_CONST.API_TEST_IMPORT_TYPE,
                data: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME
            };

            const sqlInjectionResponse = await importExportAPI.importData(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, there's a SQL injection vulnerability
            expect(sqlInjectionResponse.status).toBe(400);
            expect(sqlInjectionResponse.status).not.toBe(201);
            expect(sqlInjectionResponse.status).not.toBe(200);
            expect(sqlInjectionResponse.status).not.toBe(401);
            expect(sqlInjectionResponse.status).not.toBe(500);
            expect(sqlInjectionResponse.status).not.toBe(502);
            expect(sqlInjectionResponse.status).not.toBe(503);
            expect(sqlInjectionResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(sqlInjectionResponse.status);
            expect(sqlInjectionResponse.data).toBeDefined();
            console.log("✅ SQL injection attempt correctly blocked");
        });

        await test.step("Test 3: Import data with XSS payload", async () => {
            console.log("Testing XSS protection...");

            const xssData = {
                type: API_CONST.API_TEST_IMPORT_TYPE,
                data: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD
            };

            const xssResponse = await importExportAPI.importData(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, XSS protection is missing
            expect(xssResponse.status).toBe(400);
            expect(xssResponse.status).not.toBe(201);
            expect(xssResponse.status).not.toBe(200);
            expect(xssResponse.status).not.toBe(401);
            expect(xssResponse.status).not.toBe(500);
            expect(xssResponse.status).not.toBe(502);
            expect(xssResponse.status).not.toBe(503);
            expect(xssResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(xssResponse.status);
            expect(xssResponse.data).toBeDefined();
            console.log("✅ XSS attempt correctly blocked");
        });
    });

    test("Import/Export API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const importExportAPI = new APIImportExport(page);
        const authAPI = new APIAuth(page);
        let authToken: string;

        await test.step("Step 1: Authenticate user", async () => {
            console.log("Authenticating user...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            // API PROBLEM: If auth fails, the API is broken
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.status).not.toBe(401);
            expect(loginResponse.status).not.toBe(403);
            expect(loginResponse.status).not.toBe(400);
            expect(loginResponse.status).not.toBe(500);
            expect(loginResponse.status).not.toBe(502);
            expect(loginResponse.status).not.toBe(503);
            expect(loginResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([200, 201]).toContain(loginResponse.status);
            expect(loginResponse.data).toBeDefined();
            expect(loginResponse.data).toHaveProperty('token');
            expect(loginResponse.data.token).toBeTruthy();
            expect(typeof loginResponse.data.token).toBe('string');
            authToken = loginResponse.data.token;
            console.log("✅ Authentication successful");
        });

        await test.step("Test 4: Import data with invalid data types", async () => {
            console.log("Testing data type validation...");

            const invalidData = {
                type: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                data: ["invalid"] // Should be string, not array
            };

            const invalidImportResponse = await importExportAPI.importData(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidImportResponse.status).toBe(400);
            expect(invalidImportResponse.status).not.toBe(201);
            expect(invalidImportResponse.status).not.toBe(200);
            expect(invalidImportResponse.status).not.toBe(401);
            expect(invalidImportResponse.status).not.toBe(500);
            expect(invalidImportResponse.status).not.toBe(502);
            expect(invalidImportResponse.status).not.toBe(503);
            expect(invalidImportResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidImportResponse.status);
            expect(invalidImportResponse.data).toBeDefined();
            console.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Import data with empty required fields", async () => {
            console.log("Testing required field validation...");

            const emptyData = {
                type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                data: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyImportResponse = await importExportAPI.importData(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyImportResponse.status).toBe(400);
            expect(emptyImportResponse.status).not.toBe(201);
            expect(emptyImportResponse.status).not.toBe(200);
            expect(emptyImportResponse.status).not.toBe(401);
            expect(emptyImportResponse.status).not.toBe(500);
            expect(emptyImportResponse.status).not.toBe(502);
            expect(emptyImportResponse.status).not.toBe(503);
            expect(emptyImportResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptyImportResponse.status);
            expect(emptyImportResponse.data).toBeDefined();
            console.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Import/Export API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const importExportAPI = new APIImportExport(page);
        const authAPI = new APIAuth(page);
        let authToken: string;

        await test.step("Step 1: Authenticate user for performance tests", async () => {
            console.log("Authenticating user...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            console.log("✅ Authentication successful for performance tests");
        });

        await test.step("Test 6: Response time performance for export data", async () => {
            console.log("Testing export data response time performance...");

            const exportData = {
                type: API_CONST.API_TEST_EXPORT_TYPE,
                format: "csv"
            };

            const startTime = Date.now();
            const performanceExportResponse = await importExportAPI.exportData(request, exportData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceExportResponse.status).toBe(200);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            console.log(`✅ Export data response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent import/export attempts", async () => {
            console.log("Testing concurrent import/export attempts...");

            const importData = {
                type: API_CONST.API_TEST_IMPORT_TYPE,
                data: "test,concurrent,data"
            };

            const promises = Array(5).fill(null).map(() =>
                importExportAPI.importData(request, importData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any import fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data).toBeDefined();
            });
            console.log("✅ Concurrent import/export attempts handled successfully");
        });
    });
};
