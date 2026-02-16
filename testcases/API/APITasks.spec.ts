import { test, expect, request } from "@playwright/test";
import { TasksAPI } from "../../pages/API/APITasks";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";

export const runTasksAPI = () => {
    logger.info(`Starting Tasks API defensive tests - looking for API problems`);

    test("Tasks API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const tasksAPI = new TasksAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Create task without authentication", async () => {
            logger.log("Testing unauthenticated task creation...");

            const taskData = {
                title: API_CONST.API_TEST_TASK_TITLE,
                description: API_CONST.API_TEST_TASK_DESCRIPTION,
                priority: API_CONST.API_TEST_TASK_PRIORITY
            };

            const unauthenticatedResponse = await tasksAPI.createTask(request, taskData, "invalid_user");

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
            logger.log("✅ Unauthenticated task creation correctly rejected with 401");
        });

        await test.step("Test 2: Create task with SQL injection in title", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                title: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                description: API_CONST.API_TEST_TASK_DESCRIPTION,
                priority: API_CONST.API_TEST_TASK_PRIORITY
            };

            const sqlInjectionResponse = await tasksAPI.createTask(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Create task with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                title: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                description: API_CONST.API_TEST_TASK_DESCRIPTION,
                priority: API_CONST.API_TEST_TASK_PRIORITY
            };

            const xssResponse = await tasksAPI.createTask(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Tasks API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const tasksAPI = new TasksAPI(page);
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

        await test.step("Test 4: Create task with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                title: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                description: ["invalid"], // Should be string, not array
                priority: API_CONST.API_TEST_TASK_PRIORITY
            };

            const invalidCreateResponse = await tasksAPI.createTask(request, invalidData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 5: Create task with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                title: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                description: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                priority: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyCreateResponse = await tasksAPI.createTask(request, emptyData, API_CONST.API_TEST_USER_ID);

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

    test("Tasks API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const tasksAPI = new TasksAPI(page);
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

        await test.step("Test 6: Response time performance for create task", async () => {
            logger.log("Testing create task response time performance...");

            const taskData = {
                title: API_CONST.API_TEST_TASK_TITLE,
                description: API_CONST.API_TEST_TASK_DESCRIPTION,
                priority: API_CONST.API_TEST_TASK_PRIORITY
            };

            const startTime = Date.now();
            const performanceCreateResponse = await tasksAPI.createTask(request, taskData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceCreateResponse.status).toBe(201);
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Create task response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent task creation attempts", async () => {
            logger.log("Testing concurrent task creation attempts...");

            const taskData = {
                title: API_CONST.API_TEST_TASK_TITLE_UPDATED,
                description: API_CONST.API_TEST_TASK_DESCRIPTION_UPDATED,
                priority: API_CONST.API_TEST_TASK_PRIORITY_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                tasksAPI.createTask(request, taskData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any creation fails, there's a concurrency issue
            responses.forEach(response => {
                expect.soft(response.status).toBe(201);
                expect.soft(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent task creation attempts handled successfully");
        });
    });
};
