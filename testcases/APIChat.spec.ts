import { test, expect, request } from "@playwright/test";
import { APIChat } from "../pages/APIChat";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/utils/logger";

export const runChatAPI = () => {
    logger.info(`Starting Chat API defensive tests - looking for API problems`);

    test("Chat API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const chatAPI = new APIChat(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Create chat room without authentication", async () => {
            logger.log("Testing unauthenticated chat room creation...");

            const chatRoomData = {
                name: API_CONST.API_TEST_CHAT_ROOM_NAME
            };

            const unauthenticatedResponse = await chatAPI.createChatRoom(request, chatRoomData, "invalid_user");

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
            logger.log("✅ Unauthenticated chat room creation correctly rejected with 401");
        });

        await test.step("Test 2: Send message with SQL injection in content", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                content: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                roomId: API_CONST.API_TEST_CHAT_ROOM_ID
            };

            const sqlInjectionResponse = await chatAPI.sendMessage(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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
            logger.log("✅ SQL injection attempt correctly blocked");
        });

        await test.step("Test 3: Send message with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                content: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                roomId: API_CONST.API_TEST_CHAT_ROOM_ID
            };

            const xssResponse = await chatAPI.sendMessage(request, xssData, API_CONST.API_TEST_USER_ID);

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
            logger.log("✅ XSS attempt correctly blocked");
        });
    });

    test("Chat API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const chatAPI = new APIChat(page);
        const authAPI = new APIAuth(page);
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
            logger.log("✅ Authentication successful");
        });

        await test.step("Test 4: Send message with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                content: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                roomId: ["invalid"] // Should be string, not array
            };

            const invalidSendResponse = await chatAPI.sendMessage(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidSendResponse.status).toBe(400);
            expect(invalidSendResponse.status).not.toBe(201);
            expect(invalidSendResponse.status).not.toBe(200);
            expect(invalidSendResponse.status).not.toBe(401);
            expect(invalidSendResponse.status).not.toBe(500);
            expect(invalidSendResponse.status).not.toBe(502);
            expect(invalidSendResponse.status).not.toBe(503);
            expect(invalidSendResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidSendResponse.status);
            expect(invalidSendResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Send message with empty content", async () => {
            logger.log("Testing empty content validation...");

            const emptyData = {
                content: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                roomId: API_CONST.API_TEST_CHAT_ROOM_ID
            };

            const emptySendResponse = await chatAPI.sendMessage(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, empty content validation is missing
            expect(emptySendResponse.status).toBe(400);
            expect(emptySendResponse.status).not.toBe(201);
            expect(emptySendResponse.status).not.toBe(200);
            expect(emptySendResponse.status).not.toBe(401);
            expect(emptySendResponse.status).not.toBe(500);
            expect(emptySendResponse.status).not.toBe(502);
            expect(emptySendResponse.status).not.toBe(503);
            expect(emptySendResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptySendResponse.status);
            expect(emptySendResponse.data).toBeDefined();
            logger.log("✅ Empty content correctly rejected with 400");
        });
    });

    test("Chat API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const chatAPI = new APIChat(page);
        const authAPI = new APIAuth(page);
        let authToken: string;

        await test.step("Step 1: Authenticate user for performance tests", async () => {
            logger.log("Authenticating user...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("✅ Authentication successful for performance tests");
        });

        await test.step("Test 6: Response time performance for get messages", async () => {
            logger.log("Testing get messages response time performance...");

            const startTime = Date.now();
            const performanceGetResponse = await chatAPI.getMessages(request, API_CONST.API_TEST_CHAT_ROOM_ID, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceGetResponse.status).toBe(200);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Get messages response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent message sending", async () => {
            logger.log("Testing concurrent message sending...");

            const messageData = {
                content: API_CONST.API_TEST_CHAT_MESSAGE_CONTENT_UPDATED,
                roomId: API_CONST.API_TEST_CHAT_ROOM_ID
            };

            const promises = Array(5).fill(null).map(() =>
                chatAPI.sendMessage(request, messageData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any message sending fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent message sending handled successfully");
        });
    });
};
