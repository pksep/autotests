import { test, expect, request } from "@playwright/test";
import { DocumentsAPI } from "../pages/APIDocuments";
import { AuthAPI } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runDocumentsAPI = () => {
    logger.info(`Starting Documents API defensive tests - looking for API problems`);

    test("Documents API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new DocumentsAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Attach file without authentication", async () => {
            console.log("Testing unauthenticated file attachment...");

            const unauthenticatedResponse = await documentsAPI.attachFileToUser(
                request,
                1,
                1,
                false,
                "invalid_user"
            );

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
            console.log("✅ Unauthenticated file attachment correctly rejected with 401");
        });

        await test.step("Test 2: Get file without authentication", async () => {
            console.log("Testing unauthenticated file access...");

            const unauthenticatedResponse = await documentsAPI.getFileById(request, 1, true);

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
            console.log("✅ Unauthenticated file access correctly rejected with 401");
        });

        await test.step("Test 3: Change document type without authentication", async () => {
            console.log("Testing unauthenticated document type change...");

            const unauthenticatedResponse = await documentsAPI.changeDocumentType(
                request,
                { type: "new_type" },
                "invalid_user"
            );

            // API PROBLEM: If this returns 200, there's a security issue
            expect(unauthenticatedResponse.status).toBe(401);
            expect(unauthenticatedResponse.status).not.toBe(200);
            expect(unauthenticatedResponse.data).toBeDefined();
            console.log("✅ Unauthenticated document type change correctly rejected with 401");
        });
    });

    test("Documents API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new APIDocuments(page);
        const authAPI = new APIAuth(page);
        let authToken: string;

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

        await test.step("Test 4: Attach file with invalid user ID", async () => {
            console.log("Testing file attachment with invalid user ID...");

            const invalidUserResponse = await documentsAPI.attachFileToUser(
                request,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                1,
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect(invalidUserResponse.status).toBe(400);
            expect(invalidUserResponse.status).not.toBe(200);
            expect(invalidUserResponse.data).toBeDefined();
            console.log("✅ Invalid user ID correctly rejected with 400");
        });

        await test.step("Test 5: Attach file with invalid file ID", async () => {
            console.log("Testing file attachment with invalid file ID...");

            const invalidFileResponse = await documentsAPI.attachFileToUser(
                request,
                1,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect(invalidFileResponse.status).toBe(400);
            expect(invalidFileResponse.status).not.toBe(200);
            expect(invalidFileResponse.data).toBeDefined();
            console.log("✅ Invalid file ID correctly rejected with 400");
        });

        await test.step("Test 6: Get file with invalid ID", async () => {
            console.log("Testing file retrieval with invalid ID...");

            const invalidIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                true
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect(invalidIdResponse.status).toBe(400);
            expect(invalidIdResponse.status).not.toBe(200);
            expect(invalidIdResponse.data).toBeDefined();
            console.log("✅ Invalid file ID correctly rejected with 400");
        });

        await test.step("Test 7: Get non-existent file", async () => {
            console.log("Testing retrieval of non-existent file...");

            const nonExistentResponse = await documentsAPI.getFileById(request, 999999, true);

            // API PROBLEM: If this returns 200, the API is returning fake data
            expect(nonExistentResponse.status).toBe(404);
            expect(nonExistentResponse.status).not.toBe(200);
            expect(nonExistentResponse.data).toBeDefined();
            console.log("✅ Non-existent file correctly rejected with 404");
        });

        await test.step("Test 8: Change document type with invalid ID", async () => {
            console.log("Testing document type change with invalid ID...");

            const invalidIdResponse = await documentsAPI.changeDocumentType(
                request,
                { id: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER, type: "new_type" },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect(invalidIdResponse.status).toBe(400);
            expect(invalidIdResponse.status).not.toBe(200);
            expect(invalidIdResponse.data).toBeDefined();
            console.log("✅ Invalid document ID correctly rejected with 400");
        });

        await test.step("Test 9: Change document type with empty type", async () => {
            console.log("Testing document type change with empty type...");

            const emptyTypeResponse = await documentsAPI.changeDocumentType(
                request,
                { id: 1, type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, validation is missing
            expect(emptyTypeResponse.status).toBe(400);
            expect(emptyTypeResponse.status).not.toBe(200);
            expect(emptyTypeResponse.data).toBeDefined();
            console.log("✅ Empty document type correctly rejected with 400");
        });

        await test.step("Test 10: Change document type with XSS payload", async () => {
            console.log("Testing document type change with XSS payload...");

            const xssResponse = await documentsAPI.changeDocumentType(
                request,
                { id: 1, type: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, XSS protection is missing
            expect(xssResponse.status).toBe(400);
            expect(xssResponse.status).not.toBe(200);
            expect(xssResponse.data).toBeDefined();
            console.log("✅ XSS payload in document type correctly rejected with 400");
        });
    });

    test("Documents API - File Operations & Data Integrity", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new APIDocuments(page);
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

        await test.step("Test 11: Test file operations with valid data", async () => {
            console.log("Testing file operations with valid data...");

            // Test attach file to user with valid data
            const attachResponse = await documentsAPI.attachFileToUser(
                request,
                parseInt(API_CONST.API_TEST_USER_TO_UPDATE_ID),
                parseInt(API_CONST.API_TEST_FILE_ID),
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this fails, the API is broken
            expect(attachResponse.status).toBe(200);
            expect(attachResponse.status).not.toBe(400);
            expect(attachResponse.status).not.toBe(401);
            expect(attachResponse.data).toBeDefined();
            console.log("✅ File attachment with valid data working");

            // Test get file by ID with valid data
            const getFileResponse = await documentsAPI.getFileById(
                request,
                parseInt(API_CONST.API_TEST_DOCUMENT_ID),
                true
            );

            // API PROBLEM: If this fails, the API is broken
            expect(getFileResponse.status).toBe(200);
            expect(getFileResponse.status).not.toBe(400);
            expect(getFileResponse.status).not.toBe(404);
            expect(getFileResponse.data).toBeDefined();
            console.log("✅ File retrieval with valid data working");

            // Test change document type with valid data
            const changeTypeResponse = await documentsAPI.changeDocumentType(
                request,
                { id: parseInt(API_CONST.API_TEST_DOCUMENT_ID), type: API_CONST.API_TEST_DOCUMENT_TYPE_UPDATED },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this fails, the API is broken
            expect(changeTypeResponse.status).toBe(200);
            expect(changeTypeResponse.status).not.toBe(400);
            expect(changeTypeResponse.status).not.toBe(404);
            expect(changeTypeResponse.data).toBeDefined();
            console.log("✅ Document type change with valid data working");
        });

        await test.step("Test 12: Test file operations with boundary values", async () => {
            console.log("Testing file operations with boundary values...");

            // Test with maximum integer ID
            const maxIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.MAX_INTEGER,
                true
            );

            // API PROBLEM: If this returns 200, there's no limit on ID size
            expect(maxIdResponse.status).toBe(404);
            expect(maxIdResponse.status).not.toBe(200);
            expect(maxIdResponse.data).toBeDefined();
            console.log("✅ Maximum integer ID correctly rejected with 404");

            // Test with minimum integer ID
            const minIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.MIN_INTEGER,
                true
            );

            // API PROBLEM: If this returns 200, negative ID validation is missing
            expect(minIdResponse.status).toBe(400);
            expect(minIdResponse.status).not.toBe(200);
            expect(minIdResponse.data).toBeDefined();
            console.log("✅ Minimum integer ID correctly rejected with 400");
        });
    });
};