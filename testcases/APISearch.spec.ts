import { test, expect, request } from "@playwright/test";
import { APISearch } from "../pages/APISearch";
import { APIAuth } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/utils/logger";

export const runSearchAPI = () => {
    logger.info(`Starting Search API defensive tests - looking for API problems`);

    test("Search API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const searchAPI = new APISearch(page);
        const authAPI = new APIAuth(page);

        await test.step("Test 1: Search without authentication", async () => {
            logger.log("Testing unauthenticated search...");

            const searchData = {
                query: API_CONST.API_TEST_SEARCH_QUERY,
                filters: API_CONST.API_TEST_SEARCH_FILTERS
            };

            const unauthenticatedResponse = await searchAPI.search(request, searchData, "invalid_user");

            // API PROBLEM: If this returns 200, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            expect(unauthenticatedResponse.status).not.toBe(200);
            expect(unauthenticatedResponse.status).not.toBe(201);
            expect(unauthenticatedResponse.status).not.toBe(403);
            expect(unauthenticatedResponse.status).not.toBe(500);
            expect(unauthenticatedResponse.status).not.toBe(502);
            expect(unauthenticatedResponse.status).not.toBe(503);
            expect(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated search correctly rejected with 401");
        });

        await test.step("Test 2: Search with SQL injection in query", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                query: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                filters: API_CONST.API_TEST_SEARCH_FILTERS
            };

            const sqlInjectionResponse = await searchAPI.search(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, there's a SQL injection vulnerability
            expect(sqlInjectionResponse.status).toBe(400);
            expect(sqlInjectionResponse.status).not.toBe(200);
            expect(sqlInjectionResponse.status).not.toBe(201);
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

        await test.step("Test 3: Search with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                query: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                filters: API_CONST.API_TEST_SEARCH_FILTERS
            };

            const xssResponse = await searchAPI.search(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, XSS protection is missing
            expect(xssResponse.status).toBe(400);
            expect(xssResponse.status).not.toBe(200);
            expect(xssResponse.status).not.toBe(201);
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

    test("Search API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const searchAPI = new APISearch(page);
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

        await test.step("Test 4: Search with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                query: API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER,
                filters: "invalid" // Should be object, not string
            };

            const invalidSearchResponse = await searchAPI.search(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, data validation is missing
            expect(invalidSearchResponse.status).toBe(400);
            expect(invalidSearchResponse.status).not.toBe(200);
            expect(invalidSearchResponse.status).not.toBe(201);
            expect(invalidSearchResponse.status).not.toBe(401);
            expect(invalidSearchResponse.status).not.toBe(500);
            expect(invalidSearchResponse.status).not.toBe(502);
            expect(invalidSearchResponse.status).not.toBe(503);
            expect(invalidSearchResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(invalidSearchResponse.status);
            expect(invalidSearchResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Search with empty query", async () => {
            logger.log("Testing empty query validation...");

            const emptyData = {
                query: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                filters: API_CONST.API_TEST_SEARCH_FILTERS
            };

            const emptySearchResponse = await searchAPI.search(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, empty query validation is missing
            expect(emptySearchResponse.status).toBe(400);
            expect(emptySearchResponse.status).not.toBe(200);
            expect(emptySearchResponse.status).not.toBe(201);
            expect(emptySearchResponse.status).not.toBe(401);
            expect(emptySearchResponse.status).not.toBe(500);
            expect(emptySearchResponse.status).not.toBe(502);
            expect(emptySearchResponse.status).not.toBe(503);
            expect(emptySearchResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect([400, 422, 401]).toContain(emptySearchResponse.status);
            expect(emptySearchResponse.data).toBeDefined();
            logger.log("✅ Empty query correctly rejected with 400");
        });
    });

    test("Search API - Performance & Concurrency Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const searchAPI = new APISearch(page);
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

        await test.step("Test 6: Response time performance for search", async () => {
            logger.log("Testing search response time performance...");

            const searchData = {
                query: API_CONST.API_TEST_SEARCH_QUERY,
                filters: API_CONST.API_TEST_SEARCH_FILTERS
            };

            const startTime = Date.now();
            const performanceSearchResponse = await searchAPI.search(request, searchData, API_CONST.API_TEST_USER_ID);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceSearchResponse.status).toBe(200);
            expect(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            logger.log(`✅ Search response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 7: Test concurrent search attempts", async () => {
            logger.log("Testing concurrent search attempts...");

            const searchData = {
                query: API_CONST.API_TEST_SEARCH_QUERY_UPDATED,
                filters: API_CONST.API_TEST_SEARCH_FILTERS_UPDATED
            };

            const promises = Array(5).fill(null).map(() =>
                searchAPI.search(request, searchData, API_CONST.API_TEST_USER_ID)
            );
            const responses = await Promise.all(promises);

            // API PROBLEM: If any search fails, there's a concurrency issue
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.data).toBeDefined();
            });
            logger.log("✅ Concurrent search attempts handled successfully");
        });
    });
};
