import { test, expect, request } from "@playwright/test";
import { AssembleAPI } from "../../pages/API/APIAssemble";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";
import { allure } from "allure-playwright";

export const runAssembleAPI = () => {
    logger.info(`Starting Assemble API defensive tests - looking for API problems`);

    test("Assemble API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const assembleAPI = new AssembleAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Create assemble without authentication", async () => {
            logger.log("Testing unauthenticated access...");

            const assembleData = {
                name: API_CONST.API_TEST_ASSEMBLE_NAME,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const unauthenticatedResponse = await assembleAPI.createAssemble(request, assembleData, "invalid_user");

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
            logger.log("✅ Unauthenticated access correctly rejected with 401");
        });

        await test.step("Test 2: Create assemble with SQL injection in name", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const sqlInjectionResponse = await assembleAPI.createAssemble(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Create assemble with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const xssResponse = await assembleAPI.createAssemble(request, xssData, API_CONST.API_TEST_USER_ID);

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

    test("Assemble API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const assembleAPI = new AssembleAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;
        let createdAssembleId: number;

        await test.step("Step 1: Authenticate with valid credentials", async () => {
            logger.log("Authenticating with valid credentials...");

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

        await test.step("Test 4: Create assemble with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                name: 12345, // Should be string
                description: null, // Should be string
                type: true, // Should be string
                status: ["active"] // Should be string, not array
            };

            const invalidCreateResponse = await assembleAPI.createAssemble(request, invalidData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 5: Create assemble with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const emptyResponse = await assembleAPI.createAssemble(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect.soft(emptyResponse.status).toBe(400);
            expect.soft(emptyResponse.status).not.toBe(201);
            expect.soft(emptyResponse.status).not.toBe(200);
            expect.soft(emptyResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });

        await test.step("Test 6: Create assemble with extremely long name", async () => {
            logger.log("Testing input length validation...");

            const longNameData = {
                name: API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const longNameResponse = await assembleAPI.createAssemble(request, longNameData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, length validation is missing
            expect.soft(longNameResponse.status).toBe(400);
            expect.soft(longNameResponse.status).not.toBe(201);
            expect.soft(longNameResponse.status).not.toBe(200);
            expect.soft(longNameResponse.data).toBeDefined();
            logger.log("✅ Extremely long name correctly rejected");
        });

        await test.step("Test 7: Create assemble with valid data", async () => {
            logger.log("Creating assemble with valid data...");

            const assembleData = {
                name: API_CONST.API_TEST_ASSEMBLE_NAME,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION
            };

            const createResponse = await assembleAPI.createAssemble(request, assembleData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect.soft(createResponse.status).toBe(201);
            expect.soft(createResponse.status).not.toBe(400);
            expect.soft(createResponse.status).not.toBe(401);
            expect.soft(createResponse.data).toBeDefined();
            expect.soft(createResponse.data).toHaveProperty('id');
            expect.soft(typeof createResponse.data.id).toBe('number');
            expect.soft(createResponse.data.id).toBeGreaterThan(0);
            createdAssembleId = createResponse.data.id;
            logger.log(`✅ Assemble created successfully with ID: ${createdAssembleId}`);
        });

        await test.step("Test 8: Update assemble with invalid data", async () => {
            logger.log("Testing update with invalid data...");

            const invalidUpdateData = {
                id: createdAssembleId,
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING, // Empty name should be rejected
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION_UPDATED
            };

            const invalidUpdateResponse = await assembleAPI.updateAssemble(request, invalidUpdateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, validation is missing
            expect.soft(invalidUpdateResponse.status).toBe(400);
            expect.soft(invalidUpdateResponse.status).not.toBe(200);
            expect.soft(invalidUpdateResponse.data).toBeDefined();
            logger.log("✅ Invalid update data correctly rejected with 400");
        });

        await test.step("Test 9: Update non-existent assemble", async () => {
            logger.log("Testing update of non-existent assemble...");

            const nonExistentUpdateData = {
                id: 999999,
                name: API_CONST.API_TEST_ASSEMBLE_NAME_UPDATED,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION_UPDATED
            };

            const nonExistentUpdateResponse = await assembleAPI.updateAssemble(request, nonExistentUpdateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, the API is creating fake updates
            expect.soft(nonExistentUpdateResponse.status).toBe(404);
            expect.soft(nonExistentUpdateResponse.status).not.toBe(200);
            expect.soft(nonExistentUpdateResponse.data).toBeDefined();
            logger.log("✅ Update of non-existent assemble correctly rejected with 404");
        });

        await test.step("Test 10: Update assemble with valid data", async () => {
            logger.log("Updating assemble with valid data...");

            const updateData = {
                id: createdAssembleId,
                name: API_CONST.API_TEST_ASSEMBLE_NAME_UPDATED,
                description: API_CONST.API_TEST_ASSEMBLE_DESCRIPTION_UPDATED
            };

            const updateResponse = await assembleAPI.updateAssemble(request, updateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect.soft(updateResponse.status).toBe(200);
            expect.soft(updateResponse.status).not.toBe(400);
            expect.soft(updateResponse.status).not.toBe(404);
            expect.soft(updateResponse.data).toBeDefined();
            expect.soft(updateResponse.data.name).toBe(API_CONST.API_TEST_ASSEMBLE_NAME_UPDATED);
            expect.soft(updateResponse.data.description).toBe(API_CONST.API_TEST_ASSEMBLE_DESCRIPTION_UPDATED);
            logger.log("✅ Assemble updated successfully");
        });
    });

    test("Assemble API - Pagination & Performance Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const assembleAPI = new AssembleAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Step 1: Authenticate", async () => {
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );
            expect.soft(loginResponse.status).toBe(200);
            expect.soft(loginResponse.data).toBeDefined();
            expect.soft(loginResponse.data.token).toBeTruthy();
            logger.log("✅ Authentication successful");
        });

        await test.step("Test 11: Pagination with invalid parameters", async () => {
            logger.log("Testing pagination with invalid parameters...");

            // Test with negative page number
            const negativePageData = {
                page: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_PAGE_NUMBER,
                limit: 10,
                search: ""
            };
            const negativePageResponse = await assembleAPI.getAllAssembleWithPagination(request, negativePageData);

            // API PROBLEM: If this returns 201, pagination validation is missing
            expect.soft(negativePageResponse.status).toBe(400);
            expect.soft(negativePageResponse.status).not.toBe(201);
            expect.soft(negativePageResponse.data).toBeDefined();
            logger.log("✅ Negative page number correctly rejected with 400");

            // Test with zero page size
            const zeroPageSizeData = {
                page: 1,
                limit: API_CONST.API_TEST_EDGE_CASES.ZERO_PAGE_SIZE,
                search: ""
            };
            const zeroPageSizeResponse = await assembleAPI.getAllAssembleWithPagination(request, zeroPageSizeData);

            // API PROBLEM: If this returns 201, page size validation is missing
            expect.soft(zeroPageSizeResponse.status).toBe(400);
            expect.soft(zeroPageSizeResponse.status).not.toBe(201);
            expect.soft(zeroPageSizeResponse.data).toBeDefined();
            logger.log("✅ Zero page size correctly rejected with 400");

            // Test with extremely large page size
            const largePageSizeData = {
                page: 1,
                limit: API_CONST.API_TEST_EDGE_CASES.LARGE_PAGE_SIZE,
                search: ""
            };
            const largePageSizeResponse = await assembleAPI.getAllAssembleWithPagination(request, largePageSizeData);

            // API PROBLEM: If this returns 201, there's no limit on page size
            expect.soft(largePageSizeResponse.status).toBe(400);
            expect.soft(largePageSizeResponse.status).not.toBe(201);
            expect.soft(largePageSizeResponse.data).toBeDefined();
            logger.log("✅ Extremely large page size correctly rejected with 400");
        });

        await test.step("Test 12: Response time performance", async () => {
            logger.log("Testing response time performance...");

            const validPaginationData = {
                page: 1,
                limit: 10,
                search: ""
            };

            const startTime = Date.now();
            const performanceResponse = await assembleAPI.getAllAssembleWithPagination(request, validPaginationData);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect.soft(performanceResponse.status).toBe(201);
            expect.soft(performanceResponse.status).not.toBe(400);
            expect.soft(performanceResponse.data).toBeDefined();
            expect.soft(responseTime).toBeLessThan(API_CONST.API_TEST_EDGE_CASES.PERFORMANCE_THRESHOLD_MS);
            expect.soft(responseTime).toBeGreaterThan(0);
            logger.log(`✅ Response time: ${responseTime}ms (acceptable)`);
        });

        await test.step("Test 13: Test additional assemble endpoints", async () => {
            logger.log("Testing additional assemble endpoints...");

            // Test get actual assemble orders
            const ordersResponse = await assembleAPI.getActualAssembleOrders(request);
            expect.soft(ordersResponse.status).toBe(200);
            expect.soft(ordersResponse.status).not.toBe(400);
            expect.soft(ordersResponse.data).toBeDefined();
            logger.log("✅ Get actual assemble orders working");

            // Test get assemble by parent with invalid ID
            const invalidParentData = {
                parentId: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER
            };
            const invalidParentResponse = await assembleAPI.getAssembleByParent(request, invalidParentData);

            // API PROBLEM: If this returns 201, ID validation is missing
            expect.soft(invalidParentResponse.status).toBe(400);
            expect.soft(invalidParentResponse.status).not.toBe(201);
            expect.soft(invalidParentResponse.data).toBeDefined();
            logger.log("✅ Invalid parent ID correctly rejected with 400");

            // Test get deep deficit object with invalid ID
            const invalidDeficitData = {
                assembleId: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER
            };
            const invalidDeficitResponse = await assembleAPI.getDeepDeficitObject(request, invalidDeficitData);

            // API PROBLEM: If this returns 201, ID validation is missing
            expect.soft(invalidDeficitResponse.status).toBe(400);
            expect.soft(invalidDeficitResponse.status).not.toBe(201);
            expect.soft(invalidDeficitResponse.data).toBeDefined();
            logger.log("✅ Invalid deficit ID correctly rejected with 400");
        });
    });
};