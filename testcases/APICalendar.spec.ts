import { test, expect, request } from "@playwright/test";
import { APICalendar } from "../pages/APICalendar";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/utils/logger";

export const runCalendarAPI = () => {
    logger.info(`Starting Calendar API defensive tests - looking for API problems`);

    test("Calendar API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const calendarAPI = new APICalendar(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Create calendar event without authentication", async () => {
            logger.log("Testing unauthenticated calendar event creation...");

            const eventData = {
                title: API_CONST.API_TEST_CALENDAR_EVENT_TITLE,
                startDate: API_CONST.API_TEST_CALENDAR_EVENT_START_DATE,
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE
            };

            const unauthenticatedResponse = await calendarAPI.createEvent(request, eventData, "invalid_user");

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
            logger.log("✅ Unauthenticated calendar event creation correctly rejected with 401");
        });

        await test.step("Test 2: Create event with SQL injection in title", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                title: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                startDate: API_CONST.API_TEST_CALENDAR_EVENT_START_DATE,
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE
            };

            const sqlInjectionResponse = await calendarAPI.createEvent(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Create event with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                title: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                startDate: API_CONST.API_TEST_CALENDAR_EVENT_START_DATE,
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE
            };

            const xssResponse = await calendarAPI.createEvent(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Calendar API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const calendarAPI = new APICalendar(page);
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

        await test.step("Test 4: Create event with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                title: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                startDate: ["invalid"], // Should be string, not array
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE
            };

            const invalidCreateResponse = await calendarAPI.createEvent(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidCreateResponse.status).toBe(400);
            expect(invalidCreateResponse.status).not.toBe(201);
            expect(invalidCreateResponse.status).not.toBe(200);
            expect(invalidCreateResponse.status).not.toBe(401);
            expect(invalidCreateResponse.status).not.toBe(500);
            expect(invalidCreateResponse.status).not.toBe(502);
            expect(invalidCreateResponse.status).not.toBe(503);
            expect(invalidCreateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidCreateResponse.status);
            expect(invalidCreateResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Create event with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                title: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                startDate: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                endDate: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            };

            const emptyCreateResponse = await calendarAPI.createEvent(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyCreateResponse.status).toBe(400);
            expect(emptyCreateResponse.status).not.toBe(201);
            expect(emptyCreateResponse.status).not.toBe(200);
            expect(emptyCreateResponse.status).not.toBe(401);
            expect(emptyCreateResponse.status).not.toBe(500);
            expect(emptyCreateResponse.status).not.toBe(502);
            expect(emptyCreateResponse.status).not.toBe(503);
            expect(emptyCreateResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptyCreateResponse.status);
            expect(emptyCreateResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });
    });

    test("Calendar API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const calendarAPI = new APICalendar(page);
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

        await test.step("Test 6: Response time performance for create event", async () => {
            logger.log("Testing create event response time performance...");

            const eventData = {
                title: API_CONST.API_TEST_CALENDAR_EVENT_TITLE,
                startDate: API_CONST.API_TEST_CALENDAR_EVENT_START_DATE,
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE
            };

            const startTime = Date.now();
            const performanceCreateResponse = await calendarAPI.createEvent(request, eventData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceCreateResponse.status).toBe(201);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Create event response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent event creation attempts", async () => {
            logger.log("Testing concurrent event creation attempts...");

            const eventData = {
                title: API_CONST.API_TEST_CALENDAR_EVENT_TITLE_UPDATED,
                startDate: API_CONST.API_TEST_CALENDAR_EVENT_START_DATE_UPDATED,
                endDate: API_CONST.API_TEST_CALENDAR_EVENT_END_DATE_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                calendarAPI.createEvent(request, eventData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any creation fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent event creation attempts handled successfully");
        });
    });
};
