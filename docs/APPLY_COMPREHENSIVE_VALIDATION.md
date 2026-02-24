# Applying Comprehensive Three-Tier Status Code Validation

## Pattern to Apply to All Test Files:

### For Authentication Failures (Expected 401):
```typescript
// Replace this pattern:
expect(response.status).toBe(401);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.data).toBeDefined();

// With this comprehensive pattern:
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
expect(response.data).toBeDefined();
```

### For Validation Failures (Expected 400):
```typescript
// Replace this pattern:
expect(response.status).toBe(400);
expect(response.status).not.toBe(201);
expect(response.status).not.toBe(200);
expect(response.data).toBeDefined();

// With this comprehensive pattern:
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
expect(response.data).toBeDefined();
```

### For Success Responses (Expected 200/201):
```typescript
// Replace this pattern:
expect(response.status).toBe(200);
expect(response.status).not.toBe(401);
expect(response.status).not.toBe(403);
expect(response.data).toBeDefined();

// With this comprehensive pattern:
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
expect(response.data).toBeDefined();
```

## Files That Need Updates:

### ✅ Completed:
- APIAuth.spec.ts
- APIAssemble.spec.ts (partially)
- APIUsers.spec.ts (partially)
- APIRoles.spec.ts (partially)

### 🔄 In Progress:
- APIDocuments.spec.ts
- APIMaterials.spec.ts

### ⏳ Pending:
- All other API test files (40+ files)

## Search and Replace Commands:

### For Authentication Tests:
```bash
# Find: expect(response.status).toBe(401);
# Replace with comprehensive validation pattern
```

### For Validation Tests:
```bash
# Find: expect(response.status).toBe(400);
# Replace with comprehensive validation pattern
```

### For Success Tests:
```bash
# Find: expect(response.status).toBe(200);
# Replace with comprehensive validation pattern
```

## Benefits of This Pattern:

1. **Security Testing**: Catches unexpected success responses
2. **Infrastructure Monitoring**: Detects server errors (5xx)
3. **API Consistency**: Identifies unexpected status codes
4. **Comprehensive Coverage**: Tests both positive and negative scenarios
5. **Defensive Testing**: Actively looks for problems rather than assuming correctness

## Implementation Notes:

- Always include the catch-all validation: `expect([validCodes]).toContain(response.status)`
- Test both what should happen AND what shouldn't happen
- Include server error checks (500, 502, 503, 504)
- Use descriptive comments explaining why each check is important
- Log results with console.log to show what was tested
