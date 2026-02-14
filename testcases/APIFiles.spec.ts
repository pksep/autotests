import { test, expect, request } from "@playwright/test";
import { APIFiles } from "../pages/APIFiles";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/utils/logger";

export const runFilesAPI = () => {
    logger.info(`Starting Files API defensive tests - looking for API problems`);

    test("Files API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const filesAPI = new APIFiles(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Upload file without authentication", async () => {
            logger.log("Testing unauthenticated file upload...");

            const fileData = {
                name: API_CONST.API_TEST_FILE_NAME,
                type: API_CONST.API_TEST_FILE_TYPE,
                size: API_CONST.API_TEST_FILE_SIZE
            };

            const unauthenticatedResponse = await filesAPI.uploadFile(request, fileData, "invalid_user");

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
            logger.log("✅ Unauthenticated file upload correctly rejected with 401");
        });

        await test.step("Test 2: Upload file with SQL injection in name", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                type: API_CONST.API_TEST_FILE_TYPE,
                size: API_CONST.API_TEST_FILE_SIZE
            };

            const sqlInjectionResponse = await filesAPI.uploadFile(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Upload file with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                type: API_CONST.API_TEST_FILE_TYPE,
                size: API_CONST.API_TEST_FILE_SIZE
            };

            const xssResponse = await filesAPI.uploadFile(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Files API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const filesAPI = new APIFiles(page);
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

        await test.step("Test 4: Upload file with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                name: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                type: ["invalid"], // Should be string, not array
                size: API_CONST.API_TEST_FILE_SIZE
            };

            const invalidUploadResponse = await filesAPI.uploadFile(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidUploadResponse.status).toBe(400);
            expect(invalidUploadResponse.status).not.toBe(201);
            expect(invalidUploadResponse.status).not.toBe(200);
            expect(invalidUploadResponse.status).not.toBe(401);
            expect(invalidUploadResponse.status).not.toBe(500);
            expect(invalidUploadResponse.status).not.toBe(502);
            expect(invalidUploadResponse.status).not.toBe(503);
            expect(invalidUploadResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidUploadResponse.status);
            expect(invalidUploadResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Upload file with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                size: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyUploadResponse = await filesAPI.uploadFile(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyUploadResponse.status).toBe(400);
            expect(emptyUploadResponse.status).not.toBe(201);
            expect(emptyUploadResponse.status).not.toBe(200);
            expect(emptyUploadResponse.status).not.toBe(401);
            expect(emptyUploadResponse.status).not.toBe(500);
            expect(emptyUploadResponse.status).not.toBe(502);
            expect(emptyUploadResponse.status).not.toBe(503);
            expect(emptyUploadResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptyUploadResponse.status);
            expect(emptyUploadResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Files API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const filesAPI = new APIFiles(page);
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

        await test.step("Test 6: Response time performance for get files", async () => {
            logger.log("Testing get files response time performance...");

            const startTime = Date.now();
            const performanceGetResponse = await filesAPI.getFiles(request, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceGetResponse.status).toBe(200);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Get files response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent file operations", async () => {
            logger.log("Testing concurrent file operations...");

            const fileData = {
                name: API_CONST.API_TEST_FILE_NAME_UPDATED,
                type: API_CONST.API_TEST_FILE_TYPE_UPDATED,
                size: API_CONST.API_TEST_FILE_SIZE_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                filesAPI.uploadFile(request, fileData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any operation fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent file operations handled successfully");
        });
    });
};
