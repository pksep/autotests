import { expect } from '@playwright/test';
import { API_CONST } from '../Constants/APIConstants';

export type ApiResult = {
  status: number;
  data?: any;
  headers?: Record<string, string>;
};

export const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
export const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
export const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;

export const expectNoServerError = (response: ApiResult) => {
  expect(serverErrorCodes, JSON.stringify(response.data)).not.toContain(response.status);
};

export const expectNotSuccessful = (response: ApiResult) => {
  expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
  expectNoServerError(response);
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
