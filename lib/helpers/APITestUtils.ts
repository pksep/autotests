import { APIRequestContext, expect, test } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { API_CONST } from '../Constants/APIConstants';
import { extractAccessToken } from './APIAssertions';

const authAPI = new AuthAPI();
const tokenByRequest = new WeakMap<APIRequestContext, string>();

const unauthenticatedSuccesses = new WeakMap<APIRequestContext, Set<string>>();

export function enableUnauthenticatedAudit(request: APIRequestContext): void {
  if (unauthenticatedSuccesses.has(request)) return;

  const recorded = new Set<string>();
  unauthenticatedSuccesses.set(request, recorded);
  const outputFile = process.env.NO_AUTH_AUDIT_FILE;
  if (!outputFile) return;

  for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
    const original = (request as any)[method].bind(request) as (...args: any[]) => Promise<any>;
    (request as any)[method] = async (...args: any[]) => {
      const options = args[1] || {};
      const headers = { ...(options.headers || {}) };
      delete headers.Authorization;
      delete headers.authorization;
      headers.Cookie = '';
      args[1] = { ...options, headers };

      const response = await original(...args);
      if (response.status() >= 200 && response.status() < 400) {
        const entry = JSON.stringify({ method: method.toUpperCase(), url: response.url(), status: response.status() });
        if (!recorded.has(entry)) {
          recorded.add(entry);
          require('fs').appendFileSync(outputFile, `${entry}\n`);
        }
      }
      return response;
    };
  }
}
export const getAuthToken = async (request: APIRequestContext): Promise<string> => {
  if (process.env.API_NO_AUTH === 'true') {
    enableUnauthenticatedAudit(request);
    return '';
  }

  if (tokenByRequest.has(request)) return tokenByRequest.get(request) as string;

  let loginResponse: Awaited<ReturnType<AuthAPI['login']>> | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    loginResponse = await authAPI.login(
      request,
      API_CONST.API_TEST_USERNAME,
      API_CONST.API_TEST_PASSWORD,
      API_CONST.API_TEST_TABEL,
    );

    if (loginResponse.status < 500 || attempt === 4) break;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }

  expect(loginResponse?.status).toBe(201);
  const accessToken = extractAccessToken(loginResponse?.data);
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
