import { test, expect, request } from "@playwright/test";
import { MessagingAPI } from "../../pages/API/APIMessaging";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";

export const runMessagingAPI = () => {
    logger.info(`Starting Messaging API defensive tests - looking for API problems`);

    test("Messaging API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const messagingAPI = new MessagingAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Send message without authentication", async () => {
            logger.log("Testing unauthenticated message sending...");

            const messageData = {
                content: API_CONST.API_TEST_MESSAGE_CONTENT,
                conversationId: API_CONST.API_TEST_CONVERSATION_ID
            };

            const unauthenticatedResponse = await messagingAPI.sendMessage(request, messageData, "invalid_user");

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
            logger.log("✅ Unauthenticated message sending correctly rejected with 401");
        });

        await test.step("Test 2: Send message with SQL injection in content", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                content: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                conversationId: API_CONST.API_TEST_CONVERSATION_ID
            };

            const sqlInjectionResponse = await messagingAPI.sendMessage(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Send message with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                content: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                conversationId: API_CONST.API_TEST_CONVERSATION_ID
            };

            const xssResponse = await messagingAPI.sendMessage(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Messaging API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const messagingAPI = new MessagingAPI(page);
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

        await test.step("Test 4: Send message with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                content: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                conversationId: ["invalid"] // Should be string, not array
            };

            const invalidCreateResponse = await messagingAPI.sendMessage(request, invalidData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 5: Send message with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                content: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                conversationId: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyCreateResponse = await messagingAPI.sendMessage(request, emptyData, API_CONST.API_TEST_USER_ID);

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

    test("Messaging API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const messagingAPI = new MessagingAPI(page);
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

        await test.step("Test 6: Response time performance for send message", async () => {
            logger.log("Testing send message response time performance...");

            const messageData = {
                content: API_CONST.API_TEST_MESSAGE_CONTENT,
                conversationId: API_CONST.API_TEST_CONVERSATION_ID
            };

            const startTime = Date.now();
            const performanceCreateResponse = await messagingAPI.sendMessage(request, messageData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceCreateResponse.status).toBe(201);
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Send message response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent message sending attempts", async () => {
            logger.log("Testing concurrent message sending attempts...");

            const messageData = {
                content: API_CONST.API_TEST_MESSAGE_CONTENT_UPDATED,
                conversationId: API_CONST.API_TEST_CONVERSATION_ID
            };

            const promises = Array(5).fill(null).map(() =>
                messagingAPI.sendMessage(request, messageData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any sending fails, there's a concurrency issue
            responses.forEach(response => {
                expect.soft(response.status).toBe(201);
                expect.soft(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent message sending attempts handled successfully");
        });
    });
};
