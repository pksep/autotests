import { test, expect, request } from "@playwright/test";
import { ReportsAPI } from "../../pages/API/APIReports";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";

export const runReportsAPI = () => {
    logger.info(`Starting Reports API defensive tests - looking for API problems`);

    test("Reports API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new ReportsAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Generate report without authentication", async () => {
            logger.log("Testing unauthenticated report generation...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const unauthenticatedResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, reportData, "invalid_user");

            // API PROBLEM: If this returns 201, there's a security issue
            expect.soft(unauthenticatedResponse.status).toBe(401);
            expect.soft(unauthenticatedResponse.status).not.toBe(201);
            expect.soft(unauthenticatedResponse.status).not.toBe(200);
            expect.soft(unauthenticatedResponse.status).not.toBe(403);
            expect.soft(unauthenticatedResponse.status).not.toBe(500);
            expect.soft(unauthenticatedResponse.status).not.toBe(502);
            expect.soft(unauthenticatedResponse.status).not.toBe(503);
            expect.soft(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect.soft(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated report generation correctly rejected with 401");
        });

        await test.step("Test 2: Generate report with SQL injection in name", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const sqlInjectionResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, sqlInjectionData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, there's a SQL injection vulnerability
            expect.soft(sqlInjectionResponse.status).toBe(400);
            expect.soft(sqlInjectionResponse.status).not.toBe(201);
            expect.soft(sqlInjectionResponse.status).not.toBe(200);
            expect.soft(sqlInjectionResponse.status).not.toBe(401);
            expect.soft(sqlInjectionResponse.status).not.toBe(500);
            expect.soft(sqlInjectionResponse.status).not.toBe(502);
            expect.soft(sqlInjectionResponse.status).not.toBe(503);
            expect.soft(sqlInjectionResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(sqlInjectionResponse.status);
            expect.soft(sqlInjectionResponse.data).toBeDefined();
            logger.log("✅ SQL injection attempt correctly blocked");
        });

        await test.step("Test 3: Generate report with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const xssResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, XSS protection is missing
            expect.soft(xssResponse.status).toBe(400);
            expect.soft(xssResponse.status).not.toBe(201);
            expect.soft(xssResponse.status).not.toBe(200);
            expect.soft(xssResponse.status).not.toBe(401);
            expect.soft(xssResponse.status).not.toBe(500);
            expect.soft(xssResponse.status).not.toBe(502);
            expect.soft(xssResponse.status).not.toBe(503);
            expect.soft(xssResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(xssResponse.status);
            expect.soft(xssResponse.data).toBeDefined();
            logger.log("✅ XSS attempt correctly blocked");
        });
    });

    test("Reports API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new ReportsAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await test.step("Step 1: Authenticate user", async () => {
            logger.log("Authenticating user...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            // API PROBLEM: If auth fails, the API is broken
            expect.soft(loginResponse.status).toBe(200);
            expect.soft(loginResponse.status).not.toBe(401);
            expect.soft(loginResponse.status).not.toBe(403);
            expect.soft(loginResponse.status).not.toBe(400);
            expect.soft(loginResponse.status).not.toBe(500);
            expect.soft(loginResponse.status).not.toBe(502);
            expect.soft(loginResponse.status).not.toBe(503);
            expect.soft(loginResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([200, 201]).toContain(loginResponse.status);
            expect.soft(loginResponse.data).toBeDefined();
            expect.soft(loginResponse.data).toHaveProperty('token');
            expect.soft(loginResponse.data.token).toBeTruthy();
            expect.soft(typeof loginResponse.data.token).toBe('string');
            authToken = loginResponse.data.token;
            logger.log("✅ Authentication successful");
        });

        await test.step("Test 4: Generate report with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                name: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                type: ["invalid"], // Should be string, not array
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const invalidGenerateResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect.soft(invalidGenerateResponse.status).toBe(400);
            expect.soft(invalidGenerateResponse.status).not.toBe(201);
            expect.soft(invalidGenerateResponse.status).not.toBe(200);
            expect.soft(invalidGenerateResponse.status).not.toBe(401);
            expect.soft(invalidGenerateResponse.status).not.toBe(500);
            expect.soft(invalidGenerateResponse.status).not.toBe(502);
            expect.soft(invalidGenerateResponse.status).not.toBe(503);
            expect.soft(invalidGenerateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(invalidGenerateResponse.status);
            expect.soft(invalidGenerateResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Generate report with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                format: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyGenerateResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect.soft(emptyGenerateResponse.status).toBe(400);
            expect.soft(emptyGenerateResponse.status).not.toBe(201);
            expect.soft(emptyGenerateResponse.status).not.toBe(200);
            expect.soft(emptyGenerateResponse.status).not.toBe(401);
            expect.soft(emptyGenerateResponse.status).not.toBe(500);
            expect.soft(emptyGenerateResponse.status).not.toBe(502);
            expect.soft(emptyGenerateResponse.status).not.toBe(503);
            expect.soft(emptyGenerateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(emptyGenerateResponse.status);
            expect.soft(emptyGenerateResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Reports API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const reportsAPI = new ReportsAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await test.step("Step 1: Authenticate user for performance tests", async () => {
            logger.log("Authenticating user...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect.soft(loginResponse.status).toBe(200);
            expect.soft(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("✅ Authentication successful for performance tests");
        });

        await test.step("Test 6: Response time performance for generate report", async () => {
            logger.log("Testing generate report response time performance...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME,
                type: API_CONST.API_TEST_REPORT_TYPE,
                format: API_CONST.API_TEST_REPORT_FORMAT
            };

            const startTime = Date.now();
            const performanceGenerateResponse = await reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, reportData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceGenerateResponse.status).toBe(201);
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Generate report response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent report generation attempts", async () => {
            logger.log("Testing concurrent report generation attempts...");

            const reportData = {
                name: API_CONST.API_TEST_REPORT_NAME_UPDATED,
                type: API_CONST.API_TEST_REPORT_TYPE_UPDATED,
                format: API_CONST.API_TEST_REPORT_FORMAT_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                reportsAPI.generateReport(request, API_CONST.API_TEST_REPORT_ID, reportData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any generation fails, there's a concurrency issue
            responses.forEach(response => {
                expect.soft(response.status).toBe(201);
                expect.soft(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent report generation attempts handled successfully");
        });
    });
};
