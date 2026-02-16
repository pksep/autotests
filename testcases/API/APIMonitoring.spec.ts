import { test, expect, request } from "@playwright/test";
import { MonitoringAPI } from "../../pages/API/APIMonitoring";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";

export const runMonitoringAPI = () => {
    logger.info(`Starting Monitoring API defensive tests - looking for API problems`);

    test("Monitoring API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const monitoringAPI = new MonitoringAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Get monitoring metrics without authentication", async () => {
            logger.log("Testing unauthenticated monitoring metrics access...");

            const unauthenticatedResponse = await monitoringAPI.getSystemMetrics(request, {});

            // API PROBLEM: If this returns 200, there's a security issue
            expect.soft(unauthenticatedResponse.status).toBe(401);
            expect.soft(unauthenticatedResponse.status).not.toBe(200);
            expect.soft(unauthenticatedResponse.status).not.toBe(201);
            expect.soft(unauthenticatedResponse.status).not.toBe(403);
            expect.soft(unauthenticatedResponse.status).not.toBe(500);
            expect.soft(unauthenticatedResponse.status).not.toBe(502);
            expect.soft(unauthenticatedResponse.status).not.toBe(503);
            expect.soft(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect.soft(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated monitoring metrics access correctly rejected with 401");
        });

        await test.step("Test 2: Create alert with SQL injection in metric", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                metric: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                threshold: API_CONST.API_TEST_MONITORING_THRESHOLD,
                alertType: API_CONST.API_TEST_MONITORING_ALERT_TYPE
            };

            const sqlInjectionResponse = await monitoringAPI.createAlert(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Create alert with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                metric: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                threshold: API_CONST.API_TEST_MONITORING_THRESHOLD,
                alertType: API_CONST.API_TEST_MONITORING_ALERT_TYPE
            };

            const xssResponse = await monitoringAPI.createAlert(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Monitoring API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const monitoringAPI = new MonitoringAPI(page);
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

        await test.step("Test 4: Create alert with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                metric: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                threshold: ["invalid"], // Should be number, not array
                alertType: API_CONST.API_TEST_MONITORING_ALERT_TYPE
            };

            const invalidCreateResponse = await monitoringAPI.createAlert(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect.soft(invalidCreateResponse.status).toBe(400);
            expect.soft(invalidCreateResponse.status).not.toBe(201);
            expect.soft(invalidCreateResponse.status).not.toBe(200);
            expect.soft(invalidCreateResponse.status).not.toBe(401);
            expect.soft(invalidCreateResponse.status).not.toBe(500);
            expect.soft(invalidCreateResponse.status).not.toBe(502);
            expect.soft(invalidCreateResponse.status).not.toBe(503);
            expect.soft(invalidCreateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(invalidCreateResponse.status);
            expect.soft(invalidCreateResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Create alert with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                metric: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                threshold: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                alertType: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyCreateResponse = await monitoringAPI.createAlert(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect.soft(emptyCreateResponse.status).toBe(400);
            expect.soft(emptyCreateResponse.status).not.toBe(201);
            expect.soft(emptyCreateResponse.status).not.toBe(200);
            expect.soft(emptyCreateResponse.status).not.toBe(401);
            expect.soft(emptyCreateResponse.status).not.toBe(500);
            expect.soft(emptyCreateResponse.status).not.toBe(502);
            expect.soft(emptyCreateResponse.status).not.toBe(503);
            expect.soft(emptyCreateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(emptyCreateResponse.status);
            expect.soft(emptyCreateResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Monitoring API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const monitoringAPI = new MonitoringAPI(page);
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

        await test.step("Test 6: Response time performance for get metrics", async () => {
            logger.log("Testing get metrics response time performance...");

            const startTime = Date.now();
            const performanceGetResponse = await monitoringAPI.getSystemMetrics(request, {});
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceGetResponse.status).toBe(200);
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Get metrics response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent monitoring operations", async () => {
            logger.log("Testing concurrent monitoring operations...");

            const alertData = {
                metric: API_CONST.API_TEST_MONITORING_METRIC_UPDATED,
                threshold: API_CONST.API_TEST_MONITORING_THRESHOLD_UPDATED,
                alertType: API_CONST.API_TEST_MONITORING_ALERT_TYPE_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                monitoringAPI.createAlert(request, alertData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any operation fails, there's a concurrency issue
            responses.forEach(response => {
                expect.soft(response.status).toBe(201);
                expect.soft(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent monitoring operations handled successfully");
        });
    });
};
