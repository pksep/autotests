import { APIRequestContext, expect, test } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { API_CONST } from '../Constants/APIConstants';
import { extractAccessToken } from './APIAssertions';

const authAPI = new AuthAPI();
const tokenByRequest = new WeakMap<APIRequestContext, string>();

export const getAuthToken = async (request: APIRequestContext): Promise<string> => {
  const cached = tokenByRequest.get(request);
  if (cached) return cached;

  const loginResponse = await authAPI.login(
    request,
    API_CONST.API_TEST_USERNAME,
    API_CONST.API_TEST_PASSWORD,
    API_CONST.API_TEST_TABEL,
  );

  expect(loginResponse.status).toBe(201);
  const accessToken = extractAccessToken(loginResponse.data);
  expect(accessToken).toBeTruthy();

  tokenByRequest.set(request, accessToken as string);
  return accessToken as string;
};

export const uniqueApiSuffix = (prefix = 'api'): string => {
  const random = Math.random().toString(36).slice(2, 8);
  try {
    const info = test.info();
    return `${prefix}-w${info.workerIndex}-p${info.parallelIndex}-${random}`;
  } catch {
    return `${prefix}-${process.pid}-${random}`;
  }
};

export const eventually = async <T>(
  action: () => Promise<T>,
  predicate: (value: T) => boolean,
  options: { attempts?: number; intervalMs?: number } = {},
): Promise<T | undefined> => {
  const attempts = options.attempts ?? 8;
  const intervalMs = options.intervalMs ?? 500;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const value = await action();
    if (predicate(value)) return value;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return undefined;
};

export const waitForNextSecond = async (): Promise<void> => {
  const now = Date.now();
  const delay = 1000 - (now % 1000) + 50;
  await new Promise((resolve) => setTimeout(resolve, delay));
};
