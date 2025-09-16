import { test, expect, request } from "@playwright/test";
import { CBEDAPI } from "../pages/APICBED";
import { AuthAPI } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runCBEDAPI = () => {
    logger.info(`Starting CBED API defensive tests - looking for API problems`);

    test("CBED API - Authentication Edge Cases & Error Detection", async ({ request, page }) => {
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);

        await allure.step("Test 1: Invalid credentials should return 401", async () => {
            console.log("Testing invalid credentials...");

            const invalidLoginResponse = await authAPI.login(
                request,
                "invalid_user",
                "invalid_password"
            );

            // API PROBLEM: If this doesn't return 401, there's a security issue
            expect(invalidLoginResponse.status).toBe(401);
            console.log("✅ Invalid credentials correctly rejected with 401");
        });

        await allure.step("Test 2: Empty credentials should return 400", async () => {
            console.log("Testing empty credentials...");

            const emptyLoginResponse = await authAPI.login(
                request,
                "",
                ""
            );

            // API PROBLEM: If this doesn't return 400, validation is missing
            expect(emptyLoginResponse.status).toBe(400);
            console.log("✅ Empty credentials correctly rejected with 400");
        });

        await allure.step("Test 3: SQL injection attempt in username", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                "password"
            );

            // API PROBLEM: If this returns 200, there's a SQL injection vulnerability
            expect(sqlInjectionResponse.status).toBe(401);
            console.log("✅ SQL injection attempt correctly blocked");
        });
    });

    test("CBED API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const cbedAPI = new CBEDAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;
        let createdCBEDId: number;

        await allure.step("Step 1: Authenticate with valid credentials", async () => {
            console.log("Authenticating with valid credentials...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            // API PROBLEM: If auth fails, the API is broken
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            console.log("✅ Authentication successful");
        });

        await allure.step("Test 4: Create CBED with invalid data types", async () => {
            console.log("Testing data type validation...");

            const invalidData = {
                name: 12345, // Should be string
                description: null, // Should be string
                type: true, // Should be string
                status: ["active"] // Should be string, not array
            };

            const invalidCreateResponse = await cbedAPI.createCBED(request, invalidData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, data validation is missing
            expect(invalidCreateResponse.status).toBe(400);
            console.log("✅ Invalid data types correctly rejected with 400");
        });

        await allure.step("Test 5: Create CBED with XSS attempt in name", async () => {
            console.log("Testing XSS protection...");

            const xssData = {
                name: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                description: "Test description",
                type: "test-type",
                status: "active"
            };

            const xssResponse = await cbedAPI.createCBED(request, xssData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, XSS protection is missing
            expect(xssResponse.status).toBe(400);
            console.log("✅ XSS attempt correctly blocked");
        });

        await allure.step("Test 6: Create CBED with extremely long name", async () => {
            console.log("Testing input length validation...");

            const longNameData = {
                name: API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                description: "Test description",
                type: "test-type",
                status: "active"
            };

            const longNameResponse = await cbedAPI.createCBED(request, longNameData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 201, length validation is missing
            expect(longNameResponse.status).toBe(400);
            console.log("✅ Extremely long name correctly rejected");
        });

        await allure.step("Test 7: Create CBED with valid data", async () => {
            console.log("Creating CBED with valid data...");

            const cbedData = {
                name: API_CONST.API_TEST_CBED_NAME,
                description: API_CONST.API_TEST_CBED_DESCRIPTION,
                type: "test-type",
                status: "active"
            };

            const createResponse = await cbedAPI.createCBED(request, cbedData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(createResponse.status).toBe(201);
            expect(createResponse.data).toHaveProperty('id');
            createdCBEDId = createResponse.data.id;
            console.log(`✅ CBED created successfully with ID: ${createdCBEDId}`);
        });

        await allure.step("Test 8: Get CBED with invalid ID", async () => {
            console.log("Testing invalid ID handling...");

            const invalidIdResponse = await cbedAPI.getOneCBED(request, -1);

            // API PROBLEM: If this returns 200, ID validation is missing
            expect(invalidIdResponse.status).toBe(404);
            console.log("✅ Invalid ID correctly rejected with 404");
        });

        await allure.step("Test 9: Get CBED with non-existent ID", async () => {
            console.log("Testing non-existent ID handling...");

            const nonExistentResponse = await cbedAPI.getOneCBED(request, 999999);

            // API PROBLEM: If this returns 200, the API is returning fake data
            expect(nonExistentResponse.status).toBe(404);
            console.log("✅ Non-existent ID correctly rejected with 404");
        });

        await allure.step("Test 10: Get CBED with valid ID", async () => {
            console.log("Getting CBED with valid ID...");

            const getResponse = await cbedAPI.getOneCBED(request, createdCBEDId);

            // API PROBLEM: If this fails, the API is broken
            expect(getResponse.status).toBe(200);
            expect(getResponse.data.id).toBe(createdCBEDId);
            expect(getResponse.data.name).toBe(API_CONST.API_TEST_CBED_NAME);
            console.log("✅ CBED retrieved successfully by ID");
        });

        await allure.step("Test 11: Update CBED with invalid data", async () => {
            console.log("Testing update with invalid data...");

            const invalidUpdateData = {
                id: createdCBEDId,
                name: "", // Empty name should be rejected
                description: API_CONST.API_TEST_CBED_DESCRIPTION_UPDATED,
                type: "updated-test-type",
                status: "active"
            };

            const invalidUpdateResponse = await cbedAPI.updateCBED(request, invalidUpdateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, validation is missing
            expect(invalidUpdateResponse.status).toBe(400);
            console.log("✅ Invalid update data correctly rejected with 400");
        });

        await allure.step("Test 12: Update non-existent CBED", async () => {
            console.log("Testing update of non-existent CBED...");

            const nonExistentUpdateData = {
                id: 999999,
                name: API_CONST.API_TEST_CBED_NAME_UPDATED,
                description: API_CONST.API_TEST_CBED_DESCRIPTION_UPDATED,
                type: "updated-test-type",
                status: "active"
            };

            const nonExistentUpdateResponse = await cbedAPI.updateCBED(request, nonExistentUpdateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 200, the API is creating fake updates
            expect(nonExistentUpdateResponse.status).toBe(404);
            console.log("✅ Update of non-existent CBED correctly rejected with 404");
        });

        await allure.step("Test 13: Update CBED with valid data", async () => {
            console.log("Updating CBED with valid data...");

            const updateData = {
                id: createdCBEDId,
                name: API_CONST.API_TEST_CBED_NAME_UPDATED,
                description: API_CONST.API_TEST_CBED_DESCRIPTION_UPDATED,
                type: "updated-test-type",
                status: "active"
            };

            const updateResponse = await cbedAPI.updateCBED(request, updateData, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.name).toBe(API_CONST.API_TEST_CBED_NAME_UPDATED);
            console.log("✅ CBED updated successfully");
        });

        await allure.step("Test 14: Verify CBED update", async () => {
            console.log("Verifying CBED update...");

            const verifyResponse = await cbedAPI.getOneCBED(request, createdCBEDId);

            // API PROBLEM: If this fails, the update didn't work
            expect(verifyResponse.status).toBe(200);
            expect(verifyResponse.data.name).toBe(API_CONST.API_TEST_CBED_NAME_UPDATED);
            expect(verifyResponse.data.description).toBe(API_CONST.API_TEST_CBED_DESCRIPTION_UPDATED);
            console.log("✅ CBED update verified successfully");
        });

        await allure.step("Test 15: Delete non-existent CBED", async () => {
            console.log("Testing deletion of non-existent CBED...");

            const nonExistentDeleteResponse = await cbedAPI.deleteCBED(request, 999999, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this returns 204, the API is lying about deletion
            expect(nonExistentDeleteResponse.status).toBe(404);
            console.log("✅ Deletion of non-existent CBED correctly rejected with 404");
        });

        await allure.step("Test 16: Delete CBED with invalid user ID", async () => {
            console.log("Testing deletion with invalid user ID...");

            const invalidUserDeleteResponse = await cbedAPI.deleteCBED(request, createdCBEDId, "invalid_user_id");

            // API PROBLEM: If this returns 204, authorization is missing
            expect(invalidUserDeleteResponse.status).toBe(403);
            console.log("✅ Deletion with invalid user ID correctly rejected with 403");
        });

        await allure.step("Test 17: Delete CBED successfully", async () => {
            console.log("Deleting CBED...");

            const deleteResponse = await cbedAPI.deleteCBED(request, createdCBEDId, API_CONST.API_TEST_USER_ID);

            // API PROBLEM: If this fails, the API is broken
            expect(deleteResponse.status).toBe(204);
            console.log("✅ CBED deleted successfully");
        });

        await allure.step("Test 18: Verify CBED deletion", async () => {
            console.log("Verifying CBED deletion...");

            const verifyDeleteResponse = await cbedAPI.getOneCBED(request, createdCBEDId);

            // API PROBLEM: If this returns 200, the deletion didn't work
            expect(verifyDeleteResponse.status).toBe(404);
            console.log("✅ CBED deletion verified - CBED no longer exists");
        });
    });

    test("CBED API - Performance & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const cbedAPI = new CBEDAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await allure.step("Test 19: Get all CBEDs without authentication", async () => {
            console.log("Testing unauthenticated access...");

            const unauthenticatedResponse = await cbedAPI.getAllCBED(request, false);

            // API PROBLEM: If this returns 200, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            console.log("✅ Unauthenticated access correctly rejected with 401");
        });

        await allure.step("Test 20: Authenticate and get all CBEDs", async () => {
            console.log("Authenticating and getting all CBEDs...");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            // API PROBLEM: If auth fails, the API is broken
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            console.log("✅ Authentication successful");

            const getAllResponse = await cbedAPI.getAllCBED(request, true);

            // API PROBLEM: If this fails, the API is broken
            expect(getAllResponse.status).toBe(200);
            expect(Array.isArray(getAllResponse.data)).toBe(true);
            console.log(`✅ Retrieved ${getAllResponse.data.length} CBEDs`);
        });

        await allure.step("Test 21: Test pagination with invalid parameters", async () => {
            console.log("Testing pagination with invalid parameters...");

            // Test with negative page number
            const negativePageResponse = await cbedAPI.getAllCBED(request, true, -1, 10);

            // API PROBLEM: If this returns 200, pagination validation is missing
            expect(negativePageResponse.status).toBe(400);
            console.log("✅ Negative page number correctly rejected with 400");

            // Test with zero page size
            const zeroPageSizeResponse = await cbedAPI.getAllCBED(request, true, 1, 0);

            // API PROBLEM: If this returns 200, page size validation is missing
            expect(zeroPageSizeResponse.status).toBe(400);
            console.log("✅ Zero page size correctly rejected with 400");

            // Test with extremely large page size
            const largePageSizeResponse = await cbedAPI.getAllCBED(request, true, 1, 10000);

            // API PROBLEM: If this returns 200, there's no limit on page size
            expect(largePageSizeResponse.status).toBe(400);
            console.log("✅ Extremely large page size correctly rejected with 400");
        });

        await allure.step("Test 22: Test response time performance", async () => {
            console.log("Testing response time performance...");

            const startTime = Date.now();
            const performanceResponse = await cbedAPI.getAllCBED(request, true);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API PROBLEM: If response time is too slow, there's a performance issue
            expect(performanceResponse.status).toBe(200);
            expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
            console.log(`✅ Response time: ${responseTime}ms (acceptable)`);
        });
    });
};