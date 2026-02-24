# Defensive Testing Pattern for API Tests

## Three-Tier Status Code Validation

### Pattern Structure:
```typescript
// 1. Test for Expected Result ✅
expect(response.status).toBe(expectedStatus);

// 2. Test for Unexpected Results ❌
expect(response.status).not.toBe(unexpectedStatus1);
expect(response.status).not.toBe(unexpectedStatus2);
expect(response.status).not.toBe(unexpectedStatus3);

// 3. Catch-All for Anything Else 🚨
expect([validStatus1, validStatus2, validStatus3]).toContain(response.status);
```

## Status Code Categories

### Success Scenarios (Expected 200/201):
```typescript
// Expected success
expect(response.status).toBe(200);
expect(response.status).not.toBe(401);
expect(response.status).not.toBe(403);
expect(response.status).not.toBe(400);
expect(response.status).not.toBe(500);
expect(response.status).not.toBe(502);
expect(response.status).not.toBe(503);
expect(response.status).not.toBe(504);
// Catch-all: Any other status code indicates API inconsistency
expect([200, 201]).toContain(response.status);
```

### Authentication Failures (Expected 401):
```typescript
// Expected authentication failure
expect(response.status).toBe(401);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.status).not.toBe(403);
expect(response.status).not.toBe(500);
expect(response.status).not.toBe(502);
expect(response.status).not.toBe(503);
expect(response.status).not.toBe(504);
// Catch-all: Any other status code indicates API inconsistency
expect([401, 400, 422]).toContain(response.status);
```

### Validation Failures (Expected 400):
```typescript
// Expected validation failure
expect(response.status).toBe(400);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.status).not.toBe(401);
expect(response.status).not.toBe(500);
expect(response.status).not.toBe(502);
expect(response.status).not.toBe(503);
expect(response.status).not.toBe(504);
// Catch-all: Any other status code indicates API inconsistency
expect([400, 422, 401]).toContain(response.status);
```

### Authorization Failures (Expected 403):
```typescript
// Expected authorization failure
expect(response.status).toBe(403);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.status).not.toBe(401);
expect(response.status).not.toBe(400);
expect(response.status).not.toBe(500);
expect(response.status).not.toBe(502);
expect(response.status).not.toBe(503);
expect(response.status).not.toBe(504);
// Catch-all: Any other status code indicates API inconsistency
expect([403, 401, 400]).toContain(response.status);
```

### Not Found Failures (Expected 404):
```typescript
// Expected not found failure
expect(response.status).toBe(404);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.status).not.toBe(401);
expect(response.status).not.toBe(400);
expect(response.status).not.toBe(500);
expect(response.status).not.toBe(502);
expect(response.status).not.toBe(503);
expect(response.status).not.toBe(504);
// Catch-all: Any other status code indicates API inconsistency
expect([404, 400]).toContain(response.status);
```

## What This Pattern Catches:

### Security Issues:
- **SQL Injection**: Should return 400, not 201
- **XSS Attacks**: Should return 400, not 201
- **Unauthorized Access**: Should return 401, not 200
- **Invalid Tokens**: Should return 401, not 200

### Infrastructure Problems:
- **Server Errors**: 500, 502, 503, 504 indicate server issues
- **Gateway Issues**: 502, 503, 504 indicate network/infrastructure problems
- **Service Unavailable**: 503 indicates service is down

### API Inconsistencies:
- **Unexpected Status Codes**: Any status not in the catch-all array
- **Inconsistent Error Handling**: Different error codes for same scenario
- **Missing Validation**: Success responses when validation should fail

### Edge Cases:
- **Boundary Values**: Min/max integers, string lengths
- **Data Type Mismatches**: String vs number, array vs object
- **Empty/Null Values**: Proper handling of missing data
- **Special Characters**: Unicode, symbols, whitespace

## Implementation Notes:

1. **Always include the catch-all**: `expect([validCodes]).toContain(response.status)`
2. **Test both positive and negative**: What should happen AND what shouldn't
3. **Include server error checks**: Always check for 5xx errors
4. **Use descriptive comments**: Explain why each check is important
5. **Log results**: Use console.log to show what was tested
6. **Include data validation**: Always check `expect(response.data).toBeDefined()`

## Example Test Step:
```typescript
await test.step("Test: SQL injection protection", async () => {
    console.log("Testing SQL injection protection...");
    
    const sqlInjectionResponse = await api.createResource(
        request,
        { name: "admin'; DROP TABLE users; --" },
        userId
    );
    
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
```
