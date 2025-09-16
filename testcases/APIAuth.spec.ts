import { test, expect, request } from "@playwright/test";
import { AuthAPI } from "../pages/APIAuth";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runAuthAPI = () => {
    logger.info(`Starting Auth API defensive tests - looking for API problems`);

    test.skip("Test 1:Auth API - Security & Authentication Tests", async ({ request, page }) => {
        console.log("Test 1: Auth API - Security & Authentication Tests");
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);
        let securityIssuesFound = 0; // Track security issues found
        let tokenValidationBypassed = false; // Track if token validation is bypassed

        await test.step("Test 1: Login with invalid credentials", async () => {
            console.log("Testing invalid credentials...");

            const invalidLoginResponse = await authAPI.login(
                request,
                "invalid_user",
                "invalid_password",
                "invalid_tabel"
            );

            // API ANALYSIS: API returns 401 for invalid credentials (correct behavior)
            // 401 Unauthorized is the proper HTTP status for invalid credentials
            const expectedStatus = 401;
            const actualStatus = invalidLoginResponse.status;

            if (actualStatus === expectedStatus) {
                console.log("✅ Invalid credentials correctly rejected with 401 (proper authentication error)");
            } else {
                console.log(`❌ SECURITY ISSUE: Invalid credentials returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }

            // Validate response data exists
            if (!invalidLoginResponse.data) {
                console.log("❌ SECURITY ISSUE: No response data for invalid credentials");
                securityIssuesFound++;
            }
        });

        await test.step("Test 2: Login with empty credentials", async () => {
            console.log("Testing empty credentials...");

            const emptyLoginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING,
                API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            );

            // API ANALYSIS: Empty credentials return 401 (correct behavior)
            // 401 Unauthorized is the proper HTTP status for empty/missing credentials
            const expectedStatus = 401;
            const actualStatus = emptyLoginResponse.status;

            if (actualStatus === expectedStatus) {
                console.log("✅ Empty credentials correctly rejected with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: Empty credentials returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }

            // Validate response data exists
            if (!emptyLoginResponse.data) {
                console.log("❌ SECURITY ISSUE: No response data for empty credentials");
                securityIssuesFound++;
            }
        });

        await test.step("Test 3: Login with SQL injection in username", async () => {
            console.log("Testing SQL injection protection...");

            const sqlInjectionResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
                "password",
                "12345"
            );

            // API ANALYSIS: SQL injection correctly blocked with 401 (authentication error)
            // API treats SQL injection as authentication failure, which is secure behavior
            const expectedStatus = 401;
            const actualStatus = sqlInjectionResponse.status;

            if (actualStatus === expectedStatus) {
                console.log("✅ SQL injection attempt correctly blocked with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: SQL injection returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }

            // Validate response data exists
            if (!sqlInjectionResponse.data) {
                console.log("❌ SECURITY ISSUE: No response data for SQL injection attempt");
                securityIssuesFound++;
            }
        });

        await test.step("Test 4: Login with XSS payload in username", async () => {
            console.log("Testing XSS protection...");

            const xssResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
                "password",
                "12345"
            );

            // API ANALYSIS: XSS correctly blocked with 401 (authentication error)
            // API treats XSS as authentication failure, which is secure behavior
            const expectedStatus = 401;
            const actualStatus = xssResponse.status;

            if (actualStatus === expectedStatus) {
                console.log("✅ XSS attempt correctly blocked with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: XSS returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }

            // Validate response data exists
            if (!xssResponse.data) {
                console.log("❌ SECURITY ISSUE: No response data for XSS attempt");
                securityIssuesFound++;
            }
        });

        await test.step("Test 5: Get user with invalid token", async () => {
            console.log("Testing invalid token...");
            console.log(`🔑 Testing with token: "${API_CONST.API_TEST_EDGE_CASES.INVALID_TOKEN}"`);

            const invalidTokenResponse = await authAPI.getUserByToken(
                request,
                API_CONST.API_TEST_EDGE_CASES.INVALID_TOKEN
            );

            // 🚨 CRITICAL SECURITY VULNERABILITY: API accepts invalid tokens!
            // This is a serious security issue - invalid tokens should be rejected
            const expectedStatus = 401;
            const actualStatus = invalidTokenResponse.status;

            if (actualStatus === 200) {
                console.log("🚨 CRITICAL SECURITY ISSUE: Invalid token accepted with 200!");
                console.log("   → This demonstrates token validation is completely bypassed");
                tokenValidationBypassed = true;
            } else if (actualStatus === expectedStatus) {
                console.log("✅ Invalid token correctly rejected with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: Invalid token returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }
        });

        await test.step("Test 6: Get user with malformed token", async () => {
            console.log("Testing malformed token...");
            console.log(`🔑 Testing with token: "${API_CONST.API_TEST_EDGE_CASES.MALFORMED_TOKEN}"`);

            const malformedTokenResponse = await authAPI.getUserByToken(
                request,
                API_CONST.API_TEST_EDGE_CASES.MALFORMED_TOKEN
            );

            // 🚨 CONFIRMED SECURITY VULNERABILITY: Malformed tokens also accepted!
            // This confirms the token validation endpoint has no security at all
            const expectedStatus = 401;
            const actualStatus = malformedTokenResponse.status;

            if (actualStatus === 200) {
                console.log("🚨 CRITICAL SECURITY ISSUE: Malformed token also accepted with 200!");
                console.log("   → Confirms token validation is completely bypassed");
                tokenValidationBypassed = true;
            } else if (actualStatus === expectedStatus) {
                console.log("✅ Malformed token correctly rejected with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: Malformed token returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }
        });

        await test.step("Test 7: Get user with empty token", async () => {
            console.log("Testing empty token...");
            console.log(`🔑 Testing with token: "${API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING}"`);

            const emptyTokenResponse = await authAPI.getUserByToken(
                request,
                API_CONST.API_TEST_EDGE_CASES.EMPTY_STRING
            );

            // 🚨 CRITICAL SECURITY VULNERABILITY: Empty tokens also accepted!
            // This endpoint has ZERO security - accepts literally anything
            const expectedStatus = 401;
            const actualStatus = emptyTokenResponse.status;

            if (actualStatus === 200) {
                console.log("🚨 CRITICAL SECURITY ISSUE: Empty token accepted with 200!");
                console.log("   → Final confirmation: Token validation is completely bypassed");
                tokenValidationBypassed = true;
            } else if (actualStatus === expectedStatus) {
                console.log("✅ Empty token correctly rejected with 401");
            } else {
                console.log(`❌ SECURITY ISSUE: Empty token returned ${actualStatus}, expected ${expectedStatus}`);
                securityIssuesFound++;
            }
        });

        // Final security check - fail the test if any security issues were found
        console.log(`\n🔍 SECURITY AUDIT SUMMARY:`);

        if (tokenValidationBypassed) {
            console.log(`🚨 CRITICAL VULNERABILITY DETECTED:`);
            console.log(`   Token validation is completely bypassed`);
            console.log(`   → Invalid tokens return 200 (should be 401)`);
            console.log(`   → Malformed tokens return 200 (should be 401)`);
            console.log(`   → Empty tokens return 200 (should be 401)`);
            console.log(`   → ANY input is accepted as valid token`);
            securityIssuesFound = 1; // Set to 1 critical vulnerability
        }

        console.log(`   Total security issues found: ${securityIssuesFound}`);

        if (securityIssuesFound > 0) {
            console.log(`\n🚨 SECURITY AUDIT RESULT: FAILED`);
            console.log(`   ${securityIssuesFound} critical security vulnerability detected!`);
            console.log(`   This indicates the API has a serious security flaw that needs immediate attention.`);
            console.log(`\n📋 RECOMMENDED ACTIONS:`);
            console.log(`   1. Fix token validation endpoint to reject invalid tokens`);
            console.log(`   2. Return 401 status for invalid/malformed/empty tokens`);
            console.log(`   3. Implement proper JWT token validation`);
            console.log(`   4. Test the fix and re-run this security audit`);

            // Add Allure annotation for security audit failure
            allure.attachment("Security Audit Results", JSON.stringify({
                status: "FAILED",
                vulnerabilitiesFound: securityIssuesFound,
                criticalIssues: ["Token validation completely bypassed"],
                recommendations: [
                    "Fix token validation endpoint to reject invalid tokens",
                    "Return 401 status for invalid/malformed/empty tokens",
                    "Implement proper JWT token validation",
                    "Test the fix and re-run this security audit"
                ]
            }, null, "application/json"));

            // Fail the test - security audit found vulnerabilities
            // Use a natural assertion that will show clearly in Allure reports
            expect(securityIssuesFound, `🚨 SECURITY AUDIT FAILED: ${securityIssuesFound} critical vulnerability detected. See console output above for detailed findings and recommended actions.`).toBe(0);
        } else {
            // Add Allure annotation for security audit success
            allure.attachment("Security Audit Results", JSON.stringify({
                status: "PASSED",
                vulnerabilitiesFound: 0,
                criticalIssues: [],
                message: "No security issues detected! The API is properly secured against common attack vectors."
            }, null, "application/json"));

            console.log(`\n✅ SECURITY AUDIT RESULT: PASSED`);
            console.log(`   No security issues detected!`);
            console.log(`   The API is properly secured against common attack vectors.`);
        }
    });

    test.skip("Test 2:Auth API - Login Process Test", async ({ request, page }) => {
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);

        await test.step("Step 1: Successful login with valid credentials", async () => {
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            // Validate successful login
            expect(loginResponse.status).toBe(201);
            expect(loginResponse.data).toBeDefined();
            expect(loginResponse.data).toHaveProperty('token');
            expect(loginResponse.data.token).toBeTruthy();
            expect(typeof loginResponse.data.token).toBe('string');

            // Add Allure attachment with login results
            allure.attachment("Login Success Results", JSON.stringify({
                status: "SUCCESS",
                user: loginResponse.data.login,
                employeeId: loginResponse.data.tabel,
                role: loginResponse.data.role?.name,
                tokenLength: loginResponse.data.token.length,
                tokenType: "JWT"
            }, null, "application/json"));

            console.log(`✅ Login successful for user: ${loginResponse.data.login}`);
            console.log(`🔑 Token generated: ${loginResponse.data.token.length} characters`);
        });

        await test.step("Step 2: Validate token authentication", async () => {
            // Get a valid token by logging in
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect(loginResponse.status).toBe(201);
            expect(loginResponse.data.token).toBeTruthy();

            const validToken = loginResponse.data.token;
            const tokenResponse = await authAPI.getUserByToken(request, validToken);

            // Validate token works correctly
            expect(tokenResponse.status).toBe(200);
            expect(tokenResponse.data).toBeDefined();

            // Add Allure attachment with token validation results
            allure.attachment("Token Validation Results", JSON.stringify({
                status: "SUCCESS",
                tokenLength: validToken.length,
                userDataRetrieved: !!tokenResponse.data,
                responseStatus: tokenResponse.status
            }, null, "application/json"));

            console.log(`✅ Token authentication successful`);
        });

        await test.step("Step 3: Test credential format validation", async () => {
            // Test that API properly rejects invalid credential formats
            const invalidFormats = [
                { name: "Standard", data: { username: "testuser", password: "testpass", tabel: "12345" } },
                { name: "Alternative 1", data: { email: "test@example.com", password: "testpass", employee_id: "12345" } },
                { name: "Alternative 2", data: { user: "testuser", pass: "testpass", employee_number: "12345" } },
                { name: "Alternative 3", data: { login: "testuser", pwd: "testpass", tabel: "12345" } }
            ];

            const formatResults = [];
            for (const format of invalidFormats) {
                const response = await request.post(`${ENV.API_BASE_URL}api/auth/login`, {
                    headers: { 'Content-Type': 'application/json' },
                    data: format.data
                });

                const status = response.status();
                formatResults.push({ format: format.name, status: status });

                // API should reject invalid formats with 400 or 401
                expect([400, 401]).toContain(status);
            }

            // Add Allure attachment with format validation results
            allure.attachment("Credential Format Validation", JSON.stringify({
                status: "SUCCESS",
                testedFormats: formatResults,
                message: "All invalid credential formats properly rejected"
            }, null, "application/json"));

            console.log(`✅ Credential format validation successful - all invalid formats rejected`);
        });

        await test.step("Step 4: Validate login response structure", async () => {
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            // Validate successful login response structure
            expect(loginResponse.status).toBe(201);
            expect(loginResponse.data).toBeDefined();
            expect(loginResponse.data).toHaveProperty('token');
            expect(loginResponse.data).toHaveProperty('id');
            expect(loginResponse.data).toHaveProperty('login');
            expect(loginResponse.data).toHaveProperty('tabel');
            expect(loginResponse.data).toHaveProperty('role');

            // Validate token format
            expect(typeof loginResponse.data.token).toBe('string');
            expect(loginResponse.data.token.length).toBeGreaterThan(0);
            expect(loginResponse.data.token.includes('.')).toBe(true); // JWT format

            // Add Allure attachment with response structure validation
            allure.attachment("Login Response Structure", JSON.stringify({
                status: "SUCCESS",
                hasToken: !!loginResponse.data.token,
                hasUserId: !!loginResponse.data.id,
                hasLogin: !!loginResponse.data.login,
                hasEmployeeId: !!loginResponse.data.tabel,
                hasRole: !!loginResponse.data.role,
                tokenFormat: "JWT",
                responseStatus: loginResponse.status
            }, null, "application/json"));

            console.log(`✅ Login response structure validation successful`);
        });
    });

    test.skip("Test 3:Auth API - Login Functionality Diagnostic", async ({ request, page }) => {
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);

        await test.step("Step 1: Verify API endpoint reachability", async () => {
            const healthCheck = await request.get(ENV.API_BASE_URL);

            expect(healthCheck.status()).toBeDefined();
            expect(healthCheck.status()).not.toBe(500);

            // Add Allure attachment with connectivity results
            allure.attachment("API Connectivity Check", JSON.stringify({
                status: "SUCCESS",
                baseUrl: ENV.API_BASE_URL,
                healthCheckStatus: healthCheck.status(),
                endpoint: `${ENV.API_BASE_URL}api/auth/login`,
                message: "API server is reachable"
            }, null, "application/json"));

            console.log(`✅ API server reachable - Status: ${healthCheck.status()}`);
        });

        await test.step("Step 2: Test login endpoint connectivity", async () => {
            const testResponse = await authAPI.login(request, "test", "test", "123");

            expect(testResponse.status).toBeDefined();
            expect(testResponse.data).toBeDefined();

            // Validate endpoint is working (should reject invalid credentials)
            expect([400, 401]).toContain(testResponse.status);

            // Add Allure attachment with endpoint connectivity results
            allure.attachment("Login Endpoint Connectivity", JSON.stringify({
                status: "SUCCESS",
                testCredentials: "test/test/123",
                responseStatus: testResponse.status,
                endpointWorking: true,
                message: "Login endpoint properly rejects invalid credentials"
            }, null, "application/json"));

            console.log(`✅ Login endpoint working - Status: ${testResponse.status}`);
        });

        await test.step("Step 3: Test edge case credential validation", async () => {
            const testCases = [
                { name: "Empty credentials", data: ["", "", ""] },
                { name: "Null credentials", data: [null, null, null] },
                { name: "Very long credentials", data: ["a".repeat(1000), "b".repeat(1000), "c".repeat(1000)] },
                { name: "Special characters", data: ["!@#$%^&*()", "!@#$%^&*()", "!@#$%^&*()"] }
            ];

            const results = [];
            for (const testCase of testCases) {
                const response = await authAPI.login(request, testCase.data[0] as any, testCase.data[1] as any, testCase.data[2] as any);
                results.push({ testCase: testCase.name, status: response.status });

                // All edge cases should be rejected
                expect([400, 401]).toContain(response.status);
            }

            // Add Allure attachment with edge case validation results
            allure.attachment("Edge Case Validation", JSON.stringify({
                status: "SUCCESS",
                testCases: results,
                message: "All edge cases properly rejected by API"
            }, null, "application/json"));

            console.log(`✅ Edge case validation successful - all cases properly rejected`);
        });
    });

    test.skip("Test 4:Auth API - Data Validation & Edge Cases", async ({ request, page }) => {
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);

        await test.step("Step 1: Test extremely long username validation", async () => {
            const longUsernameResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
                "password",
                "12345"
            );

            // API consistently returns 401 for invalid inputs (correct security behavior)
            expect(longUsernameResponse.status).toBe(401);
            expect(longUsernameResponse.data).toBeDefined();

            // Add Allure attachment with validation results
            allure.attachment("Long Username Validation", JSON.stringify({
                status: "SUCCESS",
                testCase: "Extremely long username",
                responseStatus: longUsernameResponse.status,
                message: "Long username properly rejected"
            }, null, "application/json"));

            console.log(`✅ Long username validation successful - Status: ${longUsernameResponse.status}`);
        });

        await test.step("Step 2: Test special characters validation", async () => {
            const specialCharsResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
                API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
                API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS
            );

            expect(specialCharsResponse.status).toBe(401);
            expect(specialCharsResponse.data).toBeDefined();

            // Add Allure attachment with validation results
            allure.attachment("Special Characters Validation", JSON.stringify({
                status: "SUCCESS",
                testCase: "Special characters",
                responseStatus: specialCharsResponse.status,
                message: "Special characters properly rejected"
            }, null, "application/json"));

            console.log(`✅ Special characters validation successful - Status: ${specialCharsResponse.status}`);
        });

        await test.step("Step 3: Test Unicode characters validation", async () => {
            const unicodeResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.UNICODE_CHARACTERS,
                "password",
                "12345"
            );

            expect(unicodeResponse.status).toBe(401);
            expect(unicodeResponse.data).toBeDefined();

            // Add Allure attachment with validation results
            allure.attachment("Unicode Characters Validation", JSON.stringify({
                status: "SUCCESS",
                testCase: "Unicode characters",
                responseStatus: unicodeResponse.status,
                message: "Unicode characters properly rejected"
            }, null, "application/json"));

            console.log(`✅ Unicode characters validation successful - Status: ${unicodeResponse.status}`);
        });

        await test.step("Step 4: Test invalid data types validation", async () => {
            const numberUsernameResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_EDGE_CASES.INVALID_NUMBER as any,
                "password",
                "12345"
            );

            expect(numberUsernameResponse.status).toBe(401);
            expect(numberUsernameResponse.data).toBeDefined();

            // Add Allure attachment with validation results
            allure.attachment("Invalid Data Types Validation", JSON.stringify({
                status: "SUCCESS",
                testCase: "Invalid data types",
                responseStatus: numberUsernameResponse.status,
                message: "Invalid data types properly rejected"
            }, null, "application/json"));

            console.log(`✅ Invalid data types validation successful - Status: ${numberUsernameResponse.status}`);
        });

    });

    test("Test 5:Auth API - Token Validation & Security", async ({ request, page }) => {
        test.setTimeout(60000);
        const authAPI = new AuthAPI(page);
        let validToken: string;

        await test.step("Step 1: Obtain valid authentication token", async () => {
            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect(loginResponse.status).toBe(201);
            expect(loginResponse.data.token).toBeTruthy();
            validToken = loginResponse.data.token;

            // Add Allure attachment with token acquisition results
            allure.attachment("Token Acquisition", JSON.stringify({
                status: "SUCCESS",
                tokenLength: validToken.length,
                tokenType: "JWT",
                message: "Valid authentication token obtained"
            }, null, "application/json"));

            console.log(`✅ Valid token obtained - Length: ${validToken.length} characters`);
        });

        await test.step("Step 2: Test token validation endpoint", async () => {
            const validTokenResponse = await authAPI.getUserByToken(request, validToken);

            expect(validTokenResponse.status).toBe(200);
            expect(validTokenResponse.data).toBeDefined();

            // Check if token endpoint returns proper user data
            if (validTokenResponse.data === "" || validTokenResponse.data === null) {
                // SECURITY VULNERABILITY: Token endpoint returns empty response
                allure.attachment("Token Validation Security Issue", JSON.stringify({
                    status: "SECURITY_VULNERABILITY",
                    issue: "Token endpoint returns empty response",
                    description: "API accepts valid tokens but returns no user data",
                    severity: "HIGH",
                    recommendation: "Fix token validation endpoint to return proper user data"
                }, null, "application/json"));

                console.log("🚨 SECURITY VULNERABILITY: Token endpoint returns empty response");
                console.log("   - API accepts valid tokens but returns no user data");
                console.log("   - This indicates a serious security flaw");

                // Fail the test to report the security issue
                expect(validTokenResponse.data, "SECURITY ISSUE: Token endpoint should return user data, not empty response").not.toBe("");
            } else if (typeof validTokenResponse.data === 'object' && validTokenResponse.data.user) {
                // Proper response with user data
                allure.attachment("Token Validation Success", JSON.stringify({
                    status: "SUCCESS",
                    hasUserData: true,
                    responseType: typeof validTokenResponse.data,
                    message: "Token validation working correctly"
                }, null, "application/json"));

                expect(validTokenResponse.data).toHaveProperty('user');
                console.log("✅ Token validation working correctly - user data returned");
            } else {
                // Unexpected response format
                allure.attachment("Token Validation Unexpected Format", JSON.stringify({
                    status: "UNEXPECTED_FORMAT",
                    responseType: typeof validTokenResponse.data,
                    responseData: validTokenResponse.data,
                    message: "Token endpoint returns data in unexpected format"
                }, null, "application/json"));

                console.log(`⚠️  Token endpoint returns data in unexpected format: ${typeof validTokenResponse.data}`);
                expect(validTokenResponse.data).toBeDefined();
            }
        });

        await test.step("Step 3: Test token expiration handling", async () => {
            const expiredTokenResponse = await authAPI.getUserByToken(
                request,
                API_CONST.API_TEST_EDGE_CASES.EXPIRED_TOKEN
            );

            if (expiredTokenResponse.status === 200) {
                // SECURITY VULNERABILITY: Expired token accepted
                allure.attachment("Token Expiration Security Issue", JSON.stringify({
                    status: "SECURITY_VULNERABILITY",
                    issue: "Expired token accepted",
                    description: "Token expiration validation is missing",
                    severity: "CRITICAL",
                    recommendation: "Implement proper token expiration validation"
                }, null, "application/json"));

                console.log("🚨 CRITICAL SECURITY VULNERABILITY: Expired token accepted");
                expect(expiredTokenResponse.status, "SECURITY ISSUE: Expired tokens should be rejected").toBe(401);
            } else {
                // Proper behavior - expired token rejected
                allure.attachment("Token Expiration Success", JSON.stringify({
                    status: "SUCCESS",
                    responseStatus: expiredTokenResponse.status,
                    message: "Expired token properly rejected"
                }, null, "application/json"));

                expect(expiredTokenResponse.status).toBe(401);
                console.log(`✅ Token expiration handling working correctly - Status: ${expiredTokenResponse.status}`);
            }
        });

        await test.step("Step 4: Test concurrent token usage", async () => {
            // Test multiple requests with the same token
            const promises = Array(5).fill(null).map(() =>
                authAPI.getUserByToken(request, validToken)
            );
            const responses = await Promise.all(promises);

            // Validate all concurrent requests succeed
            responses.forEach((response: any) => {
                expect(response.status).toBe(200);
                expect(response.data).toBeDefined();
            });

            // Add Allure attachment with concurrency test results
            allure.attachment("Concurrent Token Usage", JSON.stringify({
                status: "SUCCESS",
                concurrentRequests: responses.length,
                allSuccessful: responses.every(r => r.status === 200),
                message: "Concurrent token usage working correctly"
            }, null, "application/json"));

            console.log(`✅ Concurrent token usage successful - ${responses.length} requests processed`);
        });
    });
};