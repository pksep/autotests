# Defensive API Testing Patterns

## Overview
This document outlines defensive testing patterns designed to **actively find API problems** and **edge cases** that need to be reported to developers for fixes.

## Core Testing Philosophy
- **Assume the API is broken** until proven otherwise
- **Test for failures** rather than just success cases
- **Look for security vulnerabilities** in every endpoint
- **Validate data integrity** and **error handling**
- **Test performance** and **resource limits**

## 1. Authentication & Authorization Testing

### Security Vulnerabilities to Test:
```typescript
// Test 1: Invalid credentials should return 401
const invalidLoginResponse = await authAPI.login(request, "invalid_user", "invalid_password");
expect(invalidLoginResponse.status).toBe(401);

// Test 2: Empty credentials should return 400
const emptyLoginResponse = await authAPI.login(request, "", "");
expect(emptyLoginResponse.status).toBe(400);

// Test 3: SQL injection attempt
const sqlInjectionResponse = await authAPI.login(request, "admin'; DROP TABLE users; --", "password");
expect(sqlInjectionResponse.status).toBe(401);

// Test 4: XSS attempt in credentials
const xssResponse = await authAPI.login(request, "<script>alert('XSS')</script>", "password");
expect(xssResponse.status).toBe(400);

// Test 5: Unauthenticated access should be rejected
const unauthenticatedResponse = await apiMethod(request, false);
expect(unauthenticatedResponse.status).toBe(401);
```

## 2. Data Validation Testing

### Input Validation to Test:
```typescript
// Test 1: Invalid data types
const invalidData = {
    name: 12345, // Should be string
    description: null, // Should be string
    type: true, // Should be string
    status: ["active"] // Should be string, not array
};
expect(createResponse.status).toBe(400);

// Test 2: Empty required fields
const emptyData = {
    name: "",
    description: "Valid description"
};
expect(createResponse.status).toBe(400);

// Test 3: Extremely long input
const longData = {
    name: "A".repeat(10000),
    description: "Valid description"
};
expect(createResponse.status).toBe(400);

// Test 4: Special characters and Unicode
const specialData = {
    name: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
    description: "🚀🌟💫⭐️🎯🔥💎✨"
};
// Should either accept or reject consistently
```

## 3. ID and Resource Testing

### Resource Validation to Test:
```typescript
// Test 1: Invalid ID format
const invalidIdResponse = await apiMethod(request, -1);
expect(invalidIdResponse.status).toBe(400);

// Test 2: Non-existent ID
const nonExistentResponse = await apiMethod(request, 999999);
expect(nonExistentResponse.status).toBe(404);

// Test 3: Zero ID
const zeroIdResponse = await apiMethod(request, 0);
expect(zeroIdResponse.status).toBe(400);

// Test 4: String ID when expecting number
const stringIdResponse = await apiMethod(request, "not_a_number");
expect(stringIdResponse.status).toBe(400);
```

## 4. CRUD Operation Testing

### Create Operation Defensive Tests:
```typescript
// Test 1: Duplicate creation
const duplicateResponse = await createMethod(request, existingData);
expect(duplicateResponse.status).toBe(409); // Conflict

// Test 2: Missing required fields
const missingFieldsResponse = await createMethod(request, {});
expect(missingFieldsResponse.status).toBe(400);

// Test 3: Invalid foreign key references
const invalidRefResponse = await createMethod(request, { userId: 999999 });
expect(invalidRefResponse.status).toBe(400);
```

### Update Operation Defensive Tests:
```typescript
// Test 1: Update non-existent resource
const nonExistentUpdate = await updateMethod(request, 999999, validData);
expect(nonExistentUpdate.status).toBe(404);

// Test 2: Update with invalid data
const invalidUpdate = await updateMethod(request, validId, invalidData);
expect(invalidUpdate.status).toBe(400);

// Test 3: Update without authorization
const unauthorizedUpdate = await updateMethod(request, validId, validData, "invalid_user");
expect(unauthorizedUpdate.status).toBe(403);
```

### Delete Operation Defensive Tests:
```typescript
// Test 1: Delete non-existent resource
const nonExistentDelete = await deleteMethod(request, 999999);
expect(nonExistentDelete.status).toBe(404);

// Test 2: Delete without authorization
const unauthorizedDelete = await deleteMethod(request, validId, "invalid_user");
expect(unauthorizedDelete.status).toBe(403);

// Test 3: Delete already deleted resource
const alreadyDeleted = await deleteMethod(request, deletedId);
expect(alreadyDeleted.status).toBe(404);
```

## 5. Performance Testing

### Performance Validation:
```typescript
// Test 1: Response time limits
const startTime = Date.now();
const response = await apiMethod(request);
const endTime = Date.now();
const responseTime = endTime - startTime;

expect(response.status).toBe(200);
expect(responseTime).toBeLessThan(5000); // 5 second limit

// Test 2: Large data sets
const largeDataResponse = await apiMethod(request, { pageSize: 10000 });
expect(largeDataResponse.status).toBe(400); // Should reject large page sizes

// Test 3: Concurrent requests
const promises = Array(10).fill().map(() => apiMethod(request));
const responses = await Promise.all(promises);
responses.forEach(response => expect(response.status).toBe(200));
```

## 6. Pagination Testing

### Pagination Validation:
```typescript
// Test 1: Negative page numbers
const negativePage = await apiMethod(request, { page: -1, size: 10 });
expect(negativePage.status).toBe(400);

// Test 2: Zero page size
const zeroPageSize = await apiMethod(request, { page: 1, size: 0 });
expect(zeroPageSize.status).toBe(400);

// Test 3: Extremely large page size
const largePageSize = await apiMethod(request, { page: 1, size: 10000 });
expect(largePageSize.status).toBe(400);

// Test 4: Page beyond available data
const beyondData = await apiMethod(request, { page: 999999, size: 10 });
expect(beyondData.status).toBe(404);
```

## 7. Error Response Validation

### Error Response Structure:
```typescript
// Test 1: Error responses should have proper structure
const errorResponse = await apiMethod(request, invalidData);
expect(errorResponse.status).toBe(400);
expect(errorResponse.data).toHaveProperty('error');
expect(errorResponse.data).toHaveProperty('message');
expect(errorResponse.data).toHaveProperty('code');

// Test 2: Error messages should be helpful
expect(errorResponse.data.message).toContain('validation');
expect(errorResponse.data.message).not.toContain('undefined');
```

## 8. Data Integrity Testing

### Data Consistency Validation:
```typescript
// Test 1: Created data should match input
const createResponse = await createMethod(request, inputData);
expect(createResponse.status).toBe(201);
expect(createResponse.data.name).toBe(inputData.name);
expect(createResponse.data.description).toBe(inputData.description);

// Test 2: Updated data should persist
const updateResponse = await updateMethod(request, id, updateData);
expect(updateResponse.status).toBe(200);
const verifyResponse = await getMethod(request, id);
expect(verifyResponse.data.name).toBe(updateData.name);

// Test 3: Deleted data should not exist
const deleteResponse = await deleteMethod(request, id);
expect(deleteResponse.status).toBe(204);
const verifyDeleteResponse = await getMethod(request, id);
expect(verifyDeleteResponse.status).toBe(404);
```

## 9. Security Headers Testing

### Security Header Validation:
```typescript
// Test 1: Check for security headers
const response = await apiMethod(request);
expect(response.headers).toHaveProperty('x-content-type-options');
expect(response.headers).toHaveProperty('x-frame-options');
expect(response.headers).toHaveProperty('x-xss-protection');

// Test 2: Check for CORS headers
expect(response.headers).toHaveProperty('access-control-allow-origin');
```

## 10. Rate Limiting Testing

### Rate Limit Validation:
```typescript
// Test 1: Rapid successive requests
const promises = Array(100).fill().map(() => apiMethod(request));
const responses = await Promise.all(promises);

// Should either all succeed or some should be rate limited
const rateLimited = responses.filter(r => r.status === 429);
const successful = responses.filter(r => r.status === 200);

expect(rateLimited.length + successful.length).toBe(100);
```

## Test Case Structure Template

```typescript
export const runDefensiveAPITests = () => {
    test("API_NAME - Security & Authentication Tests", async ({ request, page }) => {
        // Authentication edge cases
        // SQL injection tests
        // XSS tests
        // Unauthorized access tests
    });

    test("API_NAME - Data Validation & Edge Cases", async ({ request, page }) => {
        // Data type validation
        // Input length validation
        // Special character handling
        // Required field validation
    });

    test("API_NAME - CRUD Operations & Data Integrity", async ({ request, page }) => {
        // Create with invalid data
        // Update non-existent resources
        // Delete authorization checks
        // Data consistency verification
    });

    test("API_NAME - Performance & Resource Limits", async ({ request, page }) => {
        // Response time testing
        // Large data set handling
        // Pagination validation
        // Concurrent request testing
    });
};
```

## Reporting API Problems

When tests fail, document the following:

1. **Problem Description**: What the API is doing wrong
2. **Expected Behavior**: What the API should do
3. **Actual Behavior**: What the API actually does
4. **Security Impact**: If applicable
5. **Reproduction Steps**: How to reproduce the issue
6. **Test Data**: The specific data that caused the problem

## Example Problem Report

```
API PROBLEM FOUND: CBED Creation API

Problem: API accepts SQL injection in name field
Expected: Return 400 Bad Request with validation error
Actual: Returns 201 Created and stores malicious data
Security Impact: HIGH - SQL injection vulnerability
Reproduction: POST /api/cbed with name: "admin'; DROP TABLE users; --"
Test Case: Test 5 in APICBED.spec.ts
```

This defensive testing approach ensures we actively find and report API problems to developers for fixes.
