import { test, expect, request } from "@playwright/test";
import { DocumentsAPI } from "../../pages/API/APIDocuments";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";
import { allure } from "allure-playwright";

export const runDocumentsAPI = () => {
    logger.info(`Starting Documents API defensive tests - looking for API problems`);

    test("Documents API - Security & Authentication Tests", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new DocumentsAPI(page);
        const authAPI = new AuthAPI(page);

        await test.step("Test 1: Attach file without authentication", async () => {
            logger.log("Testing unauthenticated file attachment...");

            const unauthenticatedResponse = await documentsAPI.attachFileToUser(
                request,
                1,
                1,
                false,
                "invalid_user"
            );

            // API PROBLEM: If this returns 200, there's a security issue
            expect.soft(unauthenticatedResponse.status).toBe(401);
            expect.soft(unauthenticatedResponse.status).not.toBe(200);
            expect.soft(unauthenticatedResponse.status).not.toBe(201);
            expect.soft(unauthenticatedResponse.status).not.toBe(403);
            expect.soft(unauthenticatedResponse.status).not.toBe(500);
            expect.soft(unauthenticatedResponse.status).not.toBe(502);
            expect.soft(unauthenticatedResponse.status).not.toBe(503);
            expect.soft(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect.soft(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated file attachment correctly rejected with 401");
        });

        await test.step("Test 2: Get file without authentication", async () => {
            logger.log("Testing unauthenticated file access...");

            const unauthenticatedResponse = await documentsAPI.getFileById(request, 1, true);

            // API PROBLEM: If this returns 200, there's a security issue
            expect.soft(unauthenticatedResponse.status).toBe(401);
            expect.soft(unauthenticatedResponse.status).not.toBe(200);
            expect.soft(unauthenticatedResponse.status).not.toBe(201);
            expect.soft(unauthenticatedResponse.status).not.toBe(403);
            expect.soft(unauthenticatedResponse.status).not.toBe(500);
            expect.soft(unauthenticatedResponse.status).not.toBe(502);
            expect.soft(unauthenticatedResponse.status).not.toBe(503);
            expect.soft(unauthenticatedResponse.status).not.toBe(504);
            // Catch-all: Any other status code indicates API inconsistency
            expect.soft([401, 400, 422]).toContain(unauthenticatedResponse.status);
            expect.soft(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated file access correctly rejected with 401");
        });

        await test.step("Test 3: Change document type without authentication", async () => {
            logger.log("Testing unauthenticated document type change...");

            const unauthenticatedResponse = await documentsAPI.changeDocumentType(
                request,
                { type: "new_type" },
                "invalid_user"
            );

            // API PROBLEM: If this returns 200, there's a security issue
            expect.soft(unauthenticatedResponse.status).toBe(401);
            expect.soft(unauthenticatedResponse.status).not.toBe(200);
            expect.soft(unauthenticatedResponse.data).toBeDefined();
            logger.log("✅ Unauthenticated document type change correctly rejected with 401");
        });
    });

    test("Documents API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new DocumentsAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

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

        await test.step("Test 4: Attach file with invalid user ID", async () => {
            logger.log("Testing file attachment with invalid user ID...");

            const invalidUserResponse = await documentsAPI.attachFileToUser(
                request,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                1,
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect.soft(invalidUserResponse.status).toBe(400);
            expect.soft(invalidUserResponse.status).not.toBe(200);
            expect.soft(invalidUserResponse.data).toBeDefined();
            logger.log("✅ Invalid user ID correctly rejected with 400");
        });

        await test.step("Test 5: Attach file with invalid file ID", async () => {
            logger.log("Testing file attachment with invalid file ID...");

            const invalidFileResponse = await documentsAPI.attachFileToUser(
                request,
                1,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect.soft(invalidFileResponse.status).toBe(400);
            expect.soft(invalidFileResponse.status).not.toBe(200);
            expect.soft(invalidFileResponse.data).toBeDefined();
            logger.log("✅ Invalid file ID correctly rejected with 400");
        });

        await test.step("Test 6: Get file with invalid ID", async () => {
            logger.log("Testing file retrieval with invalid ID...");

            const invalidIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER,
                true
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect.soft(invalidIdResponse.status).toBe(400);
            expect.soft(invalidIdResponse.status).not.toBe(200);
            expect.soft(invalidIdResponse.data).toBeDefined();
            logger.log("✅ Invalid file ID correctly rejected with 400");
        });

        await test.step("Test 7: Get non-existent file", async () => {
            logger.log("Testing retrieval of non-existent file...");

            const nonExistentResponse = await documentsAPI.getFileById(request, 999999, true);

            // API PROBLEM: If this returns 200, the API is returning fake data
            expect.soft(nonExistentResponse.status).toBe(404);
            expect.soft(nonExistentResponse.status).not.toBe(200);
            expect.soft(nonExistentResponse.data).toBeDefined();
            logger.log("✅ Non-existent file correctly rejected with 404");
        });

        await test.step("Test 8: Change document type with invalid ID", async () => {
            logger.log("Testing document type change with invalid ID...");

            const invalidIdResponse = await documentsAPI.changeDocumentType(
                request,
                { id: API_CONST.API_TEST_EDGE_CASES.NEGATIVE_NUMBER, type: "new_type" },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, ID validation is missing
            expect.soft(invalidIdResponse.status).toBe(400);
            expect.soft(invalidIdResponse.status).not.toBe(200);
            expect.soft(invalidIdResponse.data).toBeDefined();
            logger.log("✅ Invalid document ID correctly rejected with 400");
        });

        await test.step("Test 9: Change document type with empty type", async () => {
            logger.log("Testing document type change with empty type...");

            const emptyTypeResponse = await documentsAPI.changeDocumentType(
                request,
                { id: 1, type: API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, validation is missing
            expect.soft(emptyTypeResponse.status).toBe(400);
            expect.soft(emptyTypeResponse.status).not.toBe(200);
            expect.soft(emptyTypeResponse.data).toBeDefined();
            logger.log("✅ Empty document type correctly rejected with 400");
        });

        await test.step("Test 10: Change document type with XSS payload", async () => {
            logger.log("Testing document type change with XSS payload...");

            const xssResponse = await documentsAPI.changeDocumentType(
                request,
                { id: 1, type: API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this returns 200, XSS protection is missing
            expect.soft(xssResponse.status).toBe(400);
            expect.soft(xssResponse.status).not.toBe(200);
            expect.soft(xssResponse.data).toBeDefined();
            logger.log("✅ XSS payload in document type correctly rejected with 400");
        });
    });

    test("Documents API - File Operations & Data Integrity", async ({ request, page }) => {
        test.setTimeout(60000);
        const documentsAPI = new DocumentsAPI(page);
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

        await test.step("Test 11: Test file operations with valid data", async () => {
            logger.log("Testing file operations with valid data...");

            // Test attach file to user with valid data
            const attachResponse = await documentsAPI.attachFileToUser(
                request,
                parseInt(API_CONST.API_TEST_USER_TO_UPDATE_ID),
                parseInt(API_CONST.API_TEST_FILE_ID),
                false,
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this fails, the API is broken
            expect.soft(attachResponse.status).toBe(200);
            expect.soft(attachResponse.status).not.toBe(400);
            expect.soft(attachResponse.status).not.toBe(401);
            expect.soft(attachResponse.data).toBeDefined();
            logger.log("✅ File attachment with valid data working");

            // Test get file by ID with valid data
            const getFileResponse = await documentsAPI.getFileById(
                request,
                parseInt(API_CONST.API_TEST_DOCUMENT_ID),
                true
            );

            // API PROBLEM: If this fails, the API is broken
            expect.soft(getFileResponse.status).toBe(200);
            expect.soft(getFileResponse.status).not.toBe(400);
            expect.soft(getFileResponse.status).not.toBe(404);
            expect.soft(getFileResponse.data).toBeDefined();
            logger.log("✅ File retrieval with valid data working");

            // Test change document type with valid data
            const changeTypeResponse = await documentsAPI.changeDocumentType(
                request,
                { id: parseInt(API_CONST.API_TEST_DOCUMENT_ID), type: API_CONST.API_TEST_DOCUMENT_TYPE_UPDATED },
                API_CONST.API_TEST_USER_ID
            );

            // API PROBLEM: If this fails, the API is broken
            expect.soft(changeTypeResponse.status).toBe(200);
            expect.soft(changeTypeResponse.status).not.toBe(400);
            expect.soft(changeTypeResponse.status).not.toBe(404);
            expect.soft(changeTypeResponse.data).toBeDefined();
            logger.log("✅ Document type change with valid data working");
        });

        await test.step("Test 12: Test file operations with boundary values", async () => {
            logger.log("Testing file operations with boundary values...");

            // Test with maximum integer ID
            const maxIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.MAX_INTEGER,
                true
            );

            // API PROBLEM: If this returns 200, there's no limit on ID size
            expect.soft(maxIdResponse.status).toBe(404);
            expect.soft(maxIdResponse.status).not.toBe(200);
            expect.soft(maxIdResponse.data).toBeDefined();
            logger.log("✅ Maximum integer ID correctly rejected with 404");

            // Test with minimum integer ID
            const minIdResponse = await documentsAPI.getFileById(
                request,
                API_CONST.API_TEST_EDGE_CASES.MIN_INTEGER,
                true
            );

            // API PROBLEM: If this returns 200, negative ID validation is missing
            expect.soft(minIdResponse.status).toBe(400);
            expect.soft(minIdResponse.status).not.toBe(200);
            expect.soft(minIdResponse.data).toBeDefined();
            logger.log("✅ Minimum integer ID correctly rejected with 400");
        });
    });
};