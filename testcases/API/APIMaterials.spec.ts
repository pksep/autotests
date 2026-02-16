import { test, expect, request } from "@playwright/test";
import { MaterialsAPI } from "../../pages/API/APIMaterials";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";
import { allure } from "allure-playwright";

export const runMaterialsAPI = () => {
    logger.info(`Starting Materials API defensive tests - looking for API problems`);

    test("Materials API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const materialsAPI = new MaterialsAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Create material without authentication", async () => {
            logger.log("Testing unauthenticated access...");

            const materialData = {
                name: API_CONST.API_TEST_MATERIAL_NAME,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const unauthenticatedResponse = await materialsAPI.createSubtypeMaterial(request, materialData, "invalid_user");

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

        await test.step("Test 2: Create material with SQL injection in name", async () => {
            logger.log("Testing SQL injection protection...");

            const sqlInjectionData = {
                name: API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const sqlInjectionResponse = await materialsAPI.createSubtypeMaterial(request, sqlInjectionData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, there's a SQL injection vulnerability
            expect.soft(sqlInjectionResponse.status).toBe(400);
            expect.soft(sqlInjectionResponse.status).not.toBe(201);
            expect.soft(sqlInjectionResponse.status).not.toBe(200);
            expect.soft(sqlInjectionResponse.data).toBeDefined();
            logger.log("✅ SQL injection attempt correctly blocked");
        });

        await test.step("Test 3: Create material with XSS payload", async () => {
            logger.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const xssResponse = await materialsAPI.createSubtypeMaterial(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, XSS protection is missing
            expect.soft(xssResponse.status).toBe(400);
            expect.soft(xssResponse.status).not.toBe(201);
            expect.soft(xssResponse.status).not.toBe(200);
            expect.soft(xssResponse.data).toBeDefined();
            logger.log("✅ XSS attempt correctly blocked");
        });
    });

    test("Materials API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const materialsAPI = new MaterialsAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;
        let createdMaterialId: number;

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
            expect.soft(loginResponse.data).toBeDefined();
            expect.soft(loginResponse.data).toHaveProperty('token');
            expect.soft(loginResponse.data.token).toBeTruthy();
            expect.soft(typeof loginResponse.data.token).toBe('string');
            authToken = loginResponse.data.token;
            logger.log("✅ Authentication successful");
        });

        await test.step("Test 4: Create material with invalid data types", async () => {
            logger.log("Testing data type validation...");

            const invalidData = {
                name: 12345, // Should be string
                type: null, // Should be string
                subtype: true, // Should be string
                status: ["active"] // Should be string, not array
            };

            const invalidCreateResponse = await materialsAPI.createSubtypeMaterial(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect.soft(invalidCreateResponse.status).toBe(400);
            expect.soft(invalidCreateResponse.status).not.toBe(201);
            expect.soft(invalidCreateResponse.status).not.toBe(200);
            expect.soft(invalidCreateResponse.data).toBeDefined();
            logger.log("✅ Invalid data types correctly rejected with 400");
        });

        await test.step("Test 5: Create material with empty required fields", async () => {
            logger.log("Testing required field validation...");

            const emptyData = {
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const emptyResponse = await materialsAPI.createSubtypeMaterial(request, emptyData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, required field validation is missing
            expect.soft(emptyResponse.status).toBe(400);
            expect.soft(emptyResponse.status).not.toBe(201);
            expect.soft(emptyResponse.status).not.toBe(200);
            expect.soft(emptyResponse.data).toBeDefined();
            logger.log("✅ Empty required fields correctly rejected with 400");
        });

        await test.step("Test 6: Create material with extremely long name", async () => {
            logger.log("Testing input length validation...");

            const longNameData = {
                name: API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const longNameResponse = await materialsAPI.createSubtypeMaterial(request, longNameData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, length validation is missing
            expect.soft(longNameResponse.status).toBe(400);
            expect.soft(longNameResponse.status).not.toBe(201);
            expect.soft(longNameResponse.status).not.toBe(200);
            expect.soft(longNameResponse.data).toBeDefined();
            logger.log("✅ Extremely long name correctly rejected");
        });

        await test.step("Test 7: Create material with valid data", async () => {
            logger.log("Creating material with valid data...");

            const materialData = {
                name: API_CONST.API_TEST_MATERIAL_NAME,
                type: API_CONST.API_TEST_MATERIAL_TYPE
            };

            const createResponse = await materialsAPI.createSubtypeMaterial(request, materialData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect.soft(createResponse.status).toBe(201);
            expect.soft(createResponse.status).not.toBe(400);
            expect.soft(createResponse.status).not.toBe(401);
            expect.soft(createResponse.data).toBeDefined();
            expect.soft(createResponse.data).toHaveProperty('id');
            expect.soft(typeof createResponse.data.id).toBe('number');
            expect.soft(createResponse.data.id).toBeGreaterThan(0);
            createdMaterialId = createResponse.data.id;
            logger.log(`✅ Material created successfully with ID: ${createdMaterialId}`);
        });

        await test.step("Test 8: Update material with invalid data", async () => {
            logger.log("Testing update with invalid data...");

            const invalidUpdateData = {
                id: createdMaterialId,
                name: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING, // Empty name should be rejected
                type: API_CONST.API_TEST_MATERIAL_TYPE_UPDATED
            };

            const invalidUpdateResponse = await materialsAPI.updateSubtypeMaterial(request, invalidUpdateData);

            // API PROBLEM: If this returns 200, validation is missing
            expect.soft(invalidUpdateResponse.status).toBe(400);
            expect.soft(invalidUpdateResponse.status).not.toBe(200);
            expect.soft(invalidUpdateResponse.data).toBeDefined();
            logger.log("✅ Invalid update data correctly rejected with 400");
        });

        await test.step("Test 9: Update non-existent material", async () => {
            logger.log("Testing update of non-existent material...");

            const nonExistentUpdateData = {
                id: 999999,
                name: API_CONST.API_TEST_MATERIAL_NAME_UPDATED,
                type: API_CONST.API_TEST_MATERIAL_TYPE_UPDATED
            };

            const nonExistentUpdateResponse = await materialsAPI.updateSubtypeMaterial(request, nonExistentUpdateData);

            // API PROBLEM: If this returns 200, the API is creating fake updates
            expect.soft(nonExistentUpdateResponse.status).toBe(404);
            expect.soft(nonExistentUpdateResponse.status).not.toBe(200);
            expect.soft(nonExistentUpdateResponse.data).toBeDefined();
            logger.log("✅ Update of non-existent material correctly rejected with 404");
        });

        await test.step("Test 10: Update material with valid data", async () => {
            logger.log("Updating material with valid data...");

            const updateData = {
                id: createdMaterialId,
                name: API_CONST.API_TEST_MATERIAL_NAME_UPDATED,
                type: API_CONST.API_TEST_MATERIAL_TYPE_UPDATED
            };

            const updateResponse = await materialsAPI.updateSubtypeMaterial(request, updateData);

            // API PROBLEM: If this fails, the API is broken
            expect.soft(updateResponse.status).toBe(200);
            expect.soft(updateResponse.status).not.toBe(400);
            expect.soft(updateResponse.status).not.toBe(404);
            expect.soft(updateResponse.data).toBeDefined();
            expect.soft(updateResponse.data.name).toBe(API_CONST.API_TEST_MATERIAL_NAME_UPDATED);
            expect.soft(updateResponse.data.type).toBe(API_CONST.API_TEST_MATERIAL_TYPE_UPDATED);
            logger.log("✅ Material updated successfully");
        });
    });

    test("Materials API - CRUD Operations & Data Integrity", async ({ request, page }) => {
        test.setTimeout(60000);
        const materialsAPI = new MaterialsAPI(page);
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

        await test.step("Test 11: Remove non-existent material", async () => {
            logger.log("Testing removal of non-existent material...");

            const nonExistentRemoveResponse = await materialsAPI.removeSubtypeMaterial(request, 999999);

            // API PROBLEM: If this returns 200, the API is lying about removal
            expect.soft(nonExistentRemoveResponse.status).toBe(404);
            expect.soft(nonExistentRemoveResponse.status).not.toBe(200);
            expect.soft(nonExistentRemoveResponse.data).toBeDefined();
            logger.log("✅ Removal of non-existent material correctly rejected with 404");
        });

        await test.step("Test 12: Remove material with invalid ID", async () => {
            logger.log("Testing removal with invalid ID...");

            const invalidIdRemoveResponse = await materialsAPI.removeSubtypeMaterial(request, API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER);

            // API PROBLEM: If this returns 200, ID validation is missing
            expect.soft(invalidIdRemoveResponse.status).toBe(400);
            expect.soft(invalidIdRemoveResponse.status).not.toBe(200);
            expect.soft(invalidIdRemoveResponse.data).toBeDefined();
            logger.log("✅ Invalid ID removal correctly rejected with 400");
        });

        await test.step("Test 13: Test valid operations", async () => {
            logger.log("Testing valid operations...");

            // Test get all materials
            const allMaterialsResponse = await materialsAPI.getAllMaterials(request);
            expect.soft(allMaterialsResponse.status).toBe(200);
            expect.soft(allMaterialsResponse.status).not.toBe(400);
            expect.soft(allMaterialsResponse.data).toBeDefined();
            expect.soft(Array.isArray(allMaterialsResponse.data)).toBe(true);
            logger.log("✅ Get all materials working");
        });
    });
};