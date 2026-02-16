import { test, expect, request } from "@playwright/test";
import { SecurityAPI } from "../../pages/API/APISecurity";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";

export const runSecurityAPI = () => {
    logger.info(`Starting Security API defensive tests - looking for API problems`);

    test("Security API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const securityAPI = new SecurityAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Update security settings without authentication", async () => {
            logger.log("Testing unauthenticated security settings update...");

            const securityData = {
                key: API_CONST.API_TEST_SECURITY_SETTING_KEY,
                value: API_CONST.API_TEST_SECURITY_SETTING_VALUE,
                action: API_CONST.API_TEST_SECURITY_ACTION
            };

            const unauthenticatedResponse = await securityAPI.updateSecuritySettings(request, securityData, "invalid_user");

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
            logger.log("✅ Unauthenticated security settings update correctly rejected with 401");
        });

        await test.step("Test 2: Update security settings with SQL injection", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                key: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                value: API_CONST.API_TEST_SECURITY_SETTING_VALUE,
                action: API_CONST.API_TEST_SECURITY_ACTION
            };

            const sqlInjectionResponse = await securityAPI.updateSecuritySettings(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, there's a SQL injection vulnerability
            expect.soft(sqlInjectionResponse.status).toBe(400);
            expect.soft(sqlInjectionResponse.status).not.toBe(200);
            expect.soft(sqlInjectionResponse.status).not.toBe(201);
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

        await test.step("Test 3: Update security settings with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                key: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                value: API_CONST.API_TEST_SECURITY_SETTING_VALUE,
                action: API_CONST.API_TEST_SECURITY_ACTION
            };

            const xssResponse = await securityAPI.updateSecuritySettings(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, XSS protection is missing
            expect.soft(xssResponse.status).toBe(400);
            expect.soft(xssResponse.status).not.toBe(200);
            expect.soft(xssResponse.status).not.toBe(201);
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

    test("Security API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const securityAPI = new SecurityAPI(page);
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

        await test.step("Test 4: Update security settings with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                key: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                value: ["invalid"], // Should be string, not array
                action: API_CONST.API_TEST_SECURITY_ACTION
            };

            const invalidUpdateResponse = await securityAPI.updateSecuritySettings(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, data validation is missing
            expect.soft(invalidUpdateResponse.status).toBe(400);
            expect.soft(invalidUpdateResponse.status).not.toBe(200);
            expect.soft(invalidUpdateResponse.status).not.toBe(201);
            expect.soft(invalidUpdateResponse.status).not.toBe(401);
            expect.soft(invalidUpdateResponse.status).not.toBe(500);
            expect.soft(invalidUpdateResponse.status).not.toBe(502);
            expect.soft(invalidUpdateResponse.status).not.toBe(503);
            expect.soft(invalidUpdateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(invalidUpdateResponse.status);
            expect.soft(invalidUpdateResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Update security settings with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                key: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                value: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                action: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyUpdateResponse = await securityAPI.updateSecuritySettings(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, required field validation is missing
            expect.soft(emptyUpdateResponse.status).toBe(400);
            expect.soft(emptyUpdateResponse.status).not.toBe(200);
            expect.soft(emptyUpdateResponse.status).not.toBe(201);
            expect.soft(emptyUpdateResponse.status).not.toBe(401);
            expect.soft(emptyUpdateResponse.status).not.toBe(500);
            expect.soft(emptyUpdateResponse.status).not.toBe(502);
            expect.soft(emptyUpdateResponse.status).not.toBe(503);
            expect.soft(emptyUpdateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([400, 422, 401]).toContain(emptyUpdateResponse.status);
            expect.soft(emptyUpdateResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Security API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const securityAPI = new SecurityAPI(page);
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

        await test.step("Test 6: Response time performance for get security settings", async () => {
            logger.log("Testing get security settings response time performance...");

            const startTime = Date.now();
            const performanceGetResponse = await securityAPI.getSecuritySettings(request);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceGetResponse.status).toBe(200);
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Get security settings response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent security operations", async () => {
            logger.log("Testing concurrent security operations...");

            const securityData = {
                key: API_CONST.API_TEST_SECURITY_SETTING_KEY_UPDATED,
                value: API_CONST.API_TEST_SECURITY_SETTING_VALUE_UPDATED,
                action: API_CONST.API_TEST_SECURITY_ACTION_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                securityAPI.updateSecuritySettings(request, securityData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any operation fails, there's a concurrency issue
            responses.forEach(response => {
                expect.soft(response.status).toBe(200);
                expect.soft(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent security operations handled successfully");
        });
    });
};
