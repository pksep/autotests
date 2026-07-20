import { expect } from '@playwright/test';
import { API_CONST } from '../Constants/APIConstants';

export type ApiResult = {
  status: number;
  data?: any;
  headers?: Record<string, string>;
  method?: string;
  url?: string;
};

export const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
export const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
export const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;
export const validationErrorCodes = [400, 409, 422];
export const missingResourceCodes = [400, 404, 410, 422];
export const authErrorCodes = [401, 403];
export const notExposedRouteCodes = [404, 405];

const redactSensitiveValue = (key: string, value: unknown) => {
  if (/password|token|cookie|authorization|secret/i.test(key)) return '<redacted>';
  return value;
};

const formatBody = (data: unknown, maxLength = 1200) => {
  let serialized: string;

  try {
    serialized = typeof data === 'string'
      ? data
      : JSON.stringify(data, (key, value) => redactSensitiveValue(key, value));
  } catch {
    serialized = String(data);
  }

  serialized = serialized
    .replace(new RegExp(API_CONST.API_TEST_PASSWORD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<redacted>')
    .replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '<jwt>');

  return serialized.length > maxLength ? `${serialized.slice(0, maxLength)}...<truncated>` : serialized;
};

export const formatApiExpectation = (
  response: ApiResult,
  expected: string,
  actual?: string,
  context?: string,
) => [
  context ? `Context: ${context}` : undefined,
  response.method ? `Method: ${response.method}` : undefined,
  response.url ? `Endpoint: ${response.url}` : undefined,
  `Expected: ${expected}`,
  `Actual: ${actual ?? `HTTP ${response.status}; body: ${formatBody(response.data)}`}`,
].filter(Boolean).join('\n');

export const expectNoServerError = (response: ApiResult) => {
  expect(
    serverErrorCodes.includes(response.status),
    formatApiExpectation(
      response,
      `HTTP status not in server error codes [${serverErrorCodes.join(', ')}]`,
    ),
  ).toBe(false);
};

export const expectEndpointReached = (response: ApiResult | Error) => {
  if (response instanceof Error) {
    expect(response.message).toBeTruthy();
    return;
  }

  expect(response.status).toBeGreaterThan(0);
  expect(response.status).toBeLessThan(600);
};

export const captureApiResult = async (action: () => Promise<ApiResult>): Promise<ApiResult | Error> => {
  try {
    return await action();
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
};

export const expectNotSuccessful = (response: ApiResult) => {
  expect(
    successCodes.includes(response.status),
    formatApiExpectation(response, `HTTP status not in success codes [${successCodes.join(', ')}]`),
  ).toBe(false);
  expectNoServerError(response);
};

export const expectStatusIn = (response: ApiResult, allowedCodes: number[], context?: string) => {
  expectNoServerError(response);
  expect(
    allowedCodes.includes(response.status),
    formatApiExpectation(response, `HTTP status in [${allowedCodes.join(', ')}]`, undefined, context),
  ).toBe(true);
};

export const expectClientError = (response: ApiResult, allowedCodes = clientErrorCodes, context?: string) => {
  expectNotSuccessful(response);
  expect(
    allowedCodes.includes(response.status),
    formatApiExpectation(response, `HTTP status in client error codes [${allowedCodes.join(', ')}]`, undefined, context),
  ).toBe(true);
};

export const expectValidationError = (response: ApiResult, context?: string) => {
  expectClientError(response, validationErrorCodes, context);
};

export const expectMissingResource = (response: ApiResult, context?: string) => {
  expectClientError(response, missingResourceCodes, context);
};

export const expectUnauthorizedOrForbidden = (response: ApiResult, context?: string) => {
  expectClientError(response, authErrorCodes, context);
};

export const expectRouteNotExposed = (response: ApiResult, context?: string) => {
  expectClientError(response, notExposedRouteCodes, context);
};

export const expectErrorResponseContract = (response: ApiResult) => {
  expectNotSuccessful(response);
  expect(response.data, 'Error response body should be present').toBeDefined();

  if (!response.data || typeof response.data !== 'object') return;

  const serialized = JSON.stringify(response.data);
  expect(serialized, 'Error response should not expose stack traces').not.toMatch(/\b(stack|trace|at\s+\w+\.)\b/i);
  expect(serialized, 'Error response should not expose implementation exceptions').not.toMatch(
    /Cannot (read|destructure)|current transaction is aborted|Sequelize|QueryFailed|TypeError|ReferenceError/i,
  );
};

export const expectObjectResponse = (data: unknown) => {
  expect(data, JSON.stringify(data)).toBeTruthy();
  expect(typeof data, JSON.stringify(data)).toBe('object');
  expect(Array.isArray(data), JSON.stringify(data)).toBe(false);
};

export const expectArrayResponse = (data: unknown) => {
  expect(Array.isArray(data), JSON.stringify(data)).toBe(true);
};

export const extractAccessToken = (data: any): string | undefined => {
  if (!data || typeof data === 'string') return undefined;
  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

export const getRows = <TRow = Record<string, any>>(data: unknown): TRow[] => {
  if (Array.isArray(data)) return data as TRow[];
  if (data && typeof data === 'object' && Array.isArray((data as any).rows)) return (data as any).rows;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

export const getCount = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const value = (data as any).count ?? (data as any).total;
  return typeof value === 'number' ? value : undefined;
};

export const expectPaginationContract = (data: unknown, pageSize?: number) => {
  const count = getCount(data);
  const rows = getRows(data);

  expect(count, JSON.stringify(data)).toBeGreaterThanOrEqual(0);
  expect(Array.isArray(rows), JSON.stringify(data)).toBe(true);
};

export const expectJsonResponseHeaders = (response: ApiResult) => {
  const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
  if (!contentType) return;
  expect(contentType.toLowerCase()).toContain('application/json');
};

export const expectApiContract = (
  response: ApiResult,
  options: { shape?: 'any' | 'array' | 'object' | 'pagination' | 'number'; successCodesOverride?: number[] } = {},
) => {
  expectNoServerError(response);
  expectJsonResponseHeaders(response);

  if (clientErrorCodes.includes(response.status)) {
    expectErrorResponseContract(response);
    return;
  }

  expect(options.successCodesOverride ?? successCodes, JSON.stringify(response.data)).toContain(response.status);

  if (options.shape === 'array') {
    expectArrayResponse(response.data);
  } else if (options.shape === 'object') {
    expectObjectResponse(response.data);
  } else if (options.shape === 'pagination') {
    expectPaginationContract(response.data);
  } else if (options.shape === 'number') {
    expect(Number(response.data), JSON.stringify(response.data)).not.toBeNaN();
  } else {
    expect(response.data, JSON.stringify(response.data)).toBeDefined();
  }
};

export const expectSensitiveFieldsAreNotExposed = (data: unknown) => {
  const sensitiveKeys = [
    'password',
    'hashedpassword',
    'hash_password',
    'refresh_token',
    'refreshtoken',
    'access_token',
    'accesstoken',
    'salt',
  ];
  const stack = [data];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    for (const [key, value] of Object.entries(current)) {
      expect(sensitiveKeys, `Sensitive key exposed: ${key}`).not.toContain(key.toLowerCase());
      if (value && typeof value === 'object') stack.push(value);
    }
  }
};

export const expectSortedDescendingByKnownDate = (rows: Record<string, any>[]) => {
  const dateKeys = ['createdAt', 'updatedAt', 'date_order', 'dateOrder', 'created_at', 'updated_at'];
  const datedRows = rows
    .map((row) => {
      const key = dateKeys.find((candidate) => row[candidate]);
      return key ? Date.parse(row[key]) : NaN;
    })
    .filter((timestamp) => Number.isFinite(timestamp));

  if (datedRows.length < 2) return;

  for (let i = 1; i < datedRows.length; i++) {
    expect(datedRows[i - 1]).toBeGreaterThanOrEqual(datedRows[i]);
  }
};
