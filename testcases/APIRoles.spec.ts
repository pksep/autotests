import { test, expect, request } from "@playwright/test";
import { RolesAPI } from "../pages/APIRoles";
import { AuthAPI } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runRolesAPI = () => {
    logger.info(`Starting Roles API defensive tests - looking for API problems`);

    test("Roles API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const rolesAPI = new RolesAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Create role without authentication", async () => {
            console.log("Testing unauthenticated role creation...");

            const roleData = {
                name: API_CONST.API_TEST_ROLE_NAME,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const unauthenticatedResponse = await rolesAPI.createRole(request, roleData, "invalid_user");

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
            console.log("✅ Unauthenticated role creation correctly rejected with 401");
        });

        await test.step("Test 2: Create role with SQL injection in name", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const sqlInjectionResponse = await rolesAPI.createRole(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

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

        await test.step("Test 3: Create role with XSS payload", async () => {
            console.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const xssResponse = await rolesAPI.createRole(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, XSS protection is missing
            expect(xssResponse.status).toBe(400);
            expect(xssResponse.status).not.toBe(201);
            expect(xssResponse.status).not.toBe(200);
            expect(xssResponse.data).toBeDefined();
            console.log("✅ XSS attempt correctly blocked");
        });

        await test.step("Test 4: Get roles without authentication", async () => {
            console.log("Testing unauthenticated role retrieval...");

            const unauthenticatedResponse = await rolesAPI.getAllRoles(request);

            // API PROBLEM: If this returns 200, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            expect(unauthenticatedResponse.status).not.toBe(200);
            expect(unauthenticatedResponse.data).toBeDefined();
            console.log("✅ Unauthenticated role retrieval correctly rejected with 401");
        });
    });

    test("Roles API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const rolesAPI = new APIRoles(page);
        const authAPI = new APIAuth(page);
        let authToken: string;
        let createdRoleId: number;

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

        await test.step("Test 5: Create role with invalid data types", async () => {
            console.log("Testing data type validation...");

            const invalidData = {
                name: 12345, // Should be string
                description: null, // Should be string
                permissions: true, // Should be array or string
                status: ["active"] // Should be string, not array
            };

            const invalidCreateResponse = await rolesAPI.createRole(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidCreateResponse.status).toBe(400);
            expect(invalidCreateResponse.status).not.toBe(201);
            expect(invalidCreateResponse.status).not.toBe(200);
            expect(invalidCreateResponse.data).toBeDefined();
            console.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 6: Create role with empty required fields", async () => {
            console.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const emptyResponse = await rolesAPI.createRole(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect(emptyResponse.status).toBe(400);
            expect(emptyResponse.status).not.toBe(201);
            expect(emptyResponse.status).not.toBe(200);
            expect(emptyResponse.data).toBeDefined();
            console.log("✅ Empty required fields correctly rejected with 400");
        });

        await test.step("Test 7: Create role with extremely long name", async () => {
            console.log("Testing input length validation...");

            const longNameData = {
                name: API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const longNameResponse = await rolesAPI.createRole(request, longNameData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, length validation is missing
            expect(longNameResponse.status).toBe(400);
            expect(longNameResponse.status).not.toBe(201);
            expect(longNameResponse.status).not.toBe(200);
            expect(longNameResponse.data).toBeDefined();
            console.log("✅ Extremely long name correctly rejected");
        });

        await test.step("Test 8: Create role with valid data", async () => {
            console.log("Creating role with valid data...");

            const roleData = {
                name: API_CONST.API_TEST_ROLE_NAME,
                description: API_CONST.API_TEST_ROLE_DESCRIPTION
            };

            const createResponse = await rolesAPI.createRole(request, roleData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(createResponse.status).toBe(201);
            expect(createResponse.status).not.toBe(400);
            expect(createResponse.status).not.toBe(401);
            expect(createResponse.data).toBeDefined();
            expect(createResponse.data).toHaveProperty('id');
            expect(typeof createResponse.data.id).toBe('number');
            expect(createResponse.data.id).toBeGreaterThan(0);
            createdRoleId = createResponse.data.id;
            console.log(`✅ Role created successfully with ID: ${createdRoleId}`);
        });
    });

    test("Roles API - CRUD Operations & Data Integrity", async ({ request, page }) => {
        test.setTimeout(60000);
        const rolesAPI = new APIRoles(page);
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

        await test.step("Test 9: Test valid operations", async () => {
            console.log("Testing valid operations...");

            // Test get all roles
            const allRolesResponse = await rolesAPI.getAllRoles(request);
            expect(allRolesResponse.status).toBe(200);
            expect(allRolesResponse.status).not.toBe(400);
            expect(allRolesResponse.status).not.toBe(401);
            expect(allRolesResponse.data).toBeDefined();
            expect(Array.isArray(allRolesResponse.data)).toBe(true);
            console.log("✅ Get all roles working");

            // Test get role by valid name
            const validNameResponse = await rolesAPI.getRoleByName(request, API_CONST.API_TEST_ROLE_NAME);
            expect(validNameResponse.status).toBe(200);
            expect(validNameResponse.status).not.toBe(400);
            expect(validNameResponse.status).not.toBe(404);
            expect(validNameResponse.data).toBeDefined();
            console.log("✅ Get role by valid name working");
        });

        await test.step("Test 10: Get role by invalid name", async () => {
            console.log("Testing get role by invalid name...");

            const invalidNameResponse = await rolesAPI.getRoleByName(request, API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING);

            // API PROBLEM: If this returns 200, name validation is missing
            expect(invalidNameResponse.status).toBe(400);
            expect(invalidNameResponse.status).not.toBe(200);
            expect(invalidNameResponse.data).toBeDefined();
            console.log("✅ Invalid role name correctly rejected with 400");
        });
    });
};