import { test, expect, request } from "@playwright/test";
import { UsersAPI } from "../pages/APIUsers";
import { AuthAPI } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runUsersAPI = () => {
    logger.info(`Starting Users API defensive tests - looking for API problems`);

    test("Users API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const usersAPI = new UsersAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Create user without authentication", async () => {
            console.log("Testing unauthenticated user creation...");

            const userData = {
                initials: API_CONST.API_TEST_USER_INITIALS,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const unauthenticatedResponse = await usersAPI.createUser(request, userData, "invalid_user");

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
            console.log("✅ Unauthenticated user creation correctly rejected with 401");
        });

        await test.step("Test 2: Create user with SQL injection in initials", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                initials: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const sqlInjectionResponse = await usersAPI.createUser(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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
            console.log("✅ SQL injection attempt correctly blocked");
        });

        await test.step("Test 3: Create user with XSS payload", async () => {
            console.log("Testing XSS protection...");

            const xssData = {
                initials: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const xssResponse = await usersAPI.createUser(request, xssData, API_CONST.API_TEST_USER_ID);

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
            console.log("✅ XSS attempt correctly blocked");
        });

        await test.step("Test 4: Get users without authentication", async () => {
            console.log("Testing unauthenticated user retrieval...");

            const unauthenticatedResponse = await usersAPI.getAllUsersList(request);

            // API PROBLEM: If this returns 200, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            expect(unauthenticatedResponse.status).not.toBe(200);
            expect(unauthenticatedResponse.data).toBeDefined();
            console.log("✅ Unauthenticated user retrieval correctly rejected with 401");
        });
    });

    test("Users API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const usersAPI = new APIUsers(page);
        const authAPI = new APIAuth(page);
        let authToken: string;
        let createdUserId: number;

        await test.step("Step 1: Authenticate with valid credentials", async () => {
            console.log("Authenticating with valid credentials...");

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
            expect(loginResponse.data).toBeDefined();
            expect(loginResponse.data).toHaveProperty('token');
            expect(loginResponse.data.token).toBeTruthy();
            expect(typeof loginResponse.data.token).toBe('string');
            authToken = loginResponse.data.token;
            console.log("✅ Authentication successful");
        });

        await test.step("Test 5: Create user with invalid data types", async () => {
            console.log("Testing data type validation...");

            const invalidData = {
                initials: 12345, // Should be string
                tabel: null, // Should be string
                email: true, // Should be string
                status: ["active"] // Should be string, not array
            };

            const invalidCreateResponse = await usersAPI.createUser(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidCreateResponse.status).toBe(400);
            expect(invalidCreateResponse.status).not.toBe(201);
            expect(invalidCreateResponse.status).not.toBe(200);
            expect(invalidCreateResponse.data).toBeDefined();
            console.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 6: Create user with empty required fields", async () => {
            console.log("Testing required field validation...");

            const emptyData = {
                initials: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const emptyResponse = await usersAPI.createUser(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyResponse.status).toBe(400);
            expect(emptyResponse.status).not.toBe(201);
            expect(emptyResponse.status).not.toBe(200);
            expect(emptyResponse.data).toBeDefined();
            console.log("✅ Empty required fields correctly rejected with 400");
        });

        await test.step("Test 7: Create user with extremely long initials", async () => {
            console.log("Testing input length validation...");

            const longInitialsData = {
                initials: API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const longInitialsResponse = await usersAPI.createUser(request, longInitialsData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, length validation is missing
            expect(longInitialsResponse.status).toBe(400);
            expect(longInitialsResponse.status).not.toBe(201);
            expect(longInitialsResponse.status).not.toBe(200);
            expect(longInitialsResponse.data).toBeDefined();
            console.log("✅ Extremely long initials correctly rejected");
        });

        await test.step("Test 8: Create user with valid data", async () => {
            console.log("Creating user with valid data...");

            const userData = {
                initials: API_CONST.API_TEST_USER_INITIALS,
                tabel: API_CONST.API_TEST_USER_TABEL
            };

            const createResponse = await usersAPI.createUser(request, userData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(createResponse.status).toBe(201);
            expect(createResponse.status).not.toBe(400);
            expect(createResponse.status).not.toBe(401);
            expect(createResponse.data).toBeDefined();
            expect(createResponse.data).toHaveProperty('id');
            expect(typeof createResponse.data.id).toBe('number');
            expect(createResponse.data.id).toBeGreaterThan(0);
            createdUserId = createResponse.data.id;
            console.log(`✅ User created successfully with ID: ${createdUserId}`);
        });

        await test.step("Test 9: Update user with invalid data", async () => {
            console.log("Testing update with invalid data...");

            const invalidUpdateData = {
                initials: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING, // Empty initials should be rejected
                tabel: API_CONST.API_TEST_USER_TABEL_UPDATED
            };

            const invalidUpdateResponse = await usersAPI.updateUser(request, invalidUpdateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, validation is missing
            expect(invalidUpdateResponse.status).toBe(400);
            expect(invalidUpdateResponse.status).not.toBe(200);
            expect(invalidUpdateResponse.data).toBeDefined();
            console.log("✅ Invalid update data correctly rejected with 400");
        });

        await test.step("Test 10: Update non-existent user", async () => {
            console.log("Testing update of non-existent user...");

            const nonExistentUpdateData = {
                initials: API_CONST.API_TEST_USER_INITIALS_UPDATED,
                tabel: API_CONST.API_TEST_USER_TABEL_UPDATED
            };

            const nonExistentUpdateResponse = await usersAPI.updateUser(request, nonExistentUpdateData, "999999");

            // API PROBLEM: If this returns 200, the API is creating fake updates
            expect(nonExistentUpdateResponse.status).toBe(404);
            expect(nonExistentUpdateResponse.status).not.toBe(200);
            expect(nonExistentUpdateResponse.data).toBeDefined();
            console.log("✅ Update of non-existent user correctly rejected with 404");
        });

        await test.step("Test 11: Update user with valid data", async () => {
            console.log("Updating user with valid data...");

            const updateData = {
                initials: API_CONST.API_TEST_USER_INITIALS_UPDATED,
                tabel: API_CONST.API_TEST_USER_TABEL_UPDATED
            };

            const updateResponse = await usersAPI.updateUser(request, updateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.status).not.toBe(400);
            expect(updateResponse.status).not.toBe(404);
            expect(updateResponse.data).toBeDefined();
            expect(updateResponse.data.initials).toBe(API_CONST.API_TEST_USER_INITIALS_UPDATED);
            expect(updateResponse.data.tabel).toBe(API_CONST.API_TEST_USER_TABEL_UPDATED);
            console.log("✅ User updated successfully");
        });
    });

    test("Users API - CRUD Operations & Data Integrity", async ({ request, page }) => {
        test.setTimeout(60000);
        const usersAPI = new APIUsers(page);
        const authAPI = new APIAuth(page);

        await test.step("Step 1: Authenticate", async () => {
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toBeDefined();
            expect(loginResponse.data.token).toBeTruthy();
            console.log("✅ Authentication successful");
        });

        await test.step("Test 12: Test pagination with invalid data", async () => {
            console.log("Testing pagination with invalid data...");

            const invalidPaginationData = {
                page: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_PAGE_NUMBER,
                limit: 10,
                search: ""
            };

            const invalidPaginationResponse = await usersAPI.getAllUsersWithPagination(request, invalidPaginationData);

            // API PROBLEM: If this returns 200, pagination validation is missing
            expect(invalidPaginationResponse.status).toBe(400);
            expect(invalidPaginationResponse.status).not.toBe(200);
            expect(invalidPaginationResponse.data).toBeDefined();
            console.log("✅ Invalid pagination data correctly rejected with 400");
        });

        await test.step("Test 13: Test archive users with invalid data", async () => {
            console.log("Testing archive users with invalid data...");

            const invalidArchiveData = {
                userId: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                archive: true
            };

            const invalidArchiveResponse = await usersAPI.getArchivedUsers(request, invalidArchiveData);

            // API PROBLEM: If this returns 200, archive validation is missing
            expect(invalidArchiveResponse.status).toBe(400);
            expect(invalidArchiveResponse.status).not.toBe(200);
            expect(invalidArchiveResponse.data).toBeDefined();
            console.log("✅ Invalid archive data correctly rejected with 400");
        });

        await test.step("Test 14: Test valid operations", async () => {
            console.log("Testing valid operations...");

            // Test get users list
            const usersListResponse = await usersAPI.getAllUsersList(request);
            expect(usersListResponse.status).toBe(200);
            expect(usersListResponse.status).not.toBe(400);
            expect(usersListResponse.status).not.toBe(401);
            expect(usersListResponse.data).toBeDefined();
            expect(Array.isArray(usersListResponse.data)).toBe(true);
            console.log("✅ Get users list working");

            // Test get all users with light mode
            const allUsersResponse = await usersAPI.getAllUsers(request, true, false);
            expect(allUsersResponse.status).toBe(200);
            expect(allUsersResponse.status).not.toBe(400);
            expect(allUsersResponse.status).not.toBe(401);
            expect(allUsersResponse.data).toBeDefined();
            expect(Array.isArray(allUsersResponse.data)).toBe(true);
            console.log("✅ Get all users working");
        });
    });
};