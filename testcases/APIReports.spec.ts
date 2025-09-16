import { test, expect, request } from "@playwright/test";
import { APIReports } from "../pages/APIReports";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";

export const runReportsAPI = () => {
    logger.info(`Starting Reports API defensive tests - looking for API problems`);

    test("Reports API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new APIReports(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Generate report without authentication", async () => {
            console.log("Testing unauthenticated report generation...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const unauthenticatedResponse = await reportsAPI.generateReport(request, reportData, "invalid_user");

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
            console.log("✅ Unauthenticated report generation correctly rejected with 401");
        });

        await test.step("Test 2: Generate report with SQL injection in name", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const sqlInjectionResponse = await reportsAPI.generateReport(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Generate report with XSS payload", async () => {
            console.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const xssResponse = await reportsAPI.generateReport(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Reports API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new APIReports(page);
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

        await test.step("Test 4: Generate report with invalid data types", async () => {
            console.log("Testing data type validation...");

            const invalidData = {
                name: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                type: ["invalid"], // Should be string, not array
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const invalidGenerateResponse = await reportsAPI.generateReport(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidGenerateResponse.status).toBe(400);
            expect(invalidGenerateResponse.status).not.toBe(201);
            expect(invalidGenerateResponse.status).not.toBe(200);
            expect(invalidGenerateResponse.status).not.toBe(401);
            expect(invalidGenerateResponse.status).not.toBe(500);
            expect(invalidGenerateResponse.status).not.toBe(502);
            expect(invalidGenerateResponse.status).not.toBe(503);
            expect(invalidGenerateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidGenerateResponse.status);
            expect(invalidGenerateResponse.data).toBeDefined();
            console.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Generate report with empty required fields", async () => {
            console.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                format: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyGenerateResponse = await reportsAPI.generateReport(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyGenerateResponse.status).toBe(400);
            expect(emptyGenerateResponse.status).not.toBe(201);
            expect(emptyGenerateResponse.status).not.toBe(200);
            expect(emptyGenerateResponse.status).not.toBe(401);
            expect(emptyGenerateResponse.status).not.toBe(500);
            expect(emptyGenerateResponse.status).not.toBe(502);
            expect(emptyGenerateResponse.status).not.toBe(503);
            expect(emptyGenerateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptyGenerateResponse.status);
            expect(emptyGenerateResponse.data).toBeDefined();
            console.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Reports API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new APIReports(page);
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

        await test.step("Test 6: Response time performance for generate report", async () => {
            console.log("Testing generate report response time performance...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const startTime = Date.now();
            const performanceGenerateResponse = await reportsAPI.generateReport(request, reportData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceGenerateResponse.status).toBe(201);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            console.log(`✅ Generate report response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent report generation attempts", async () => {
            console.log("Testing concurrent report generation attempts...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME_UPDATED,
                type: API_CONST.API_TEST_REPORT_TYPE_UPDATED,
                format: API_CONST.API_TEST_REPORT_FORMAT_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                reportsAPI.generateReport(request, reportData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any generation fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data).toBeDefined();
            });
            console.log("✅ Concurrent report generation attempts handled successfully");
        });
    });
};
