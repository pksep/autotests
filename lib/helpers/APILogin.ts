import { test } from '@playwright/test';

type LoginResponse = { status: number; headers: Record<string, string> };

// Legacy ERP blocks the account for one minute without a Retry-After header.
const DEFAULT_COOLDOWN_MS = 61000;
const MAX_WAIT_MS = 125000;
const MAX_ATTEMPTS = 5;

function cooldownMs(headers: Record<string, string>): number {
  const value = Object.entries(headers).find(([name]) => name.toLowerCase() === 'retry-after')?.[1]?.trim();
  if (!value) return DEFAULT_COOLDOWN_MS;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000 + 1000;

  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) + 1000 : DEFAULT_COOLDOWN_MS;
}

/** Retry explicit login rejections only; never retry a transport error or an unknown result. */
export async function loginAfterCooldown<T extends LoginResponse>(
  login: () => Promise<T>,
  options: { retryServerErrors?: boolean } = {},
): Promise<T> {
  let waitedMs = 0;
  for (let attempt = 0; ; attempt++) {
    const response = await login();
    const rateLimited = response.status === 429;
    const retryServerError = options.retryServerErrors && response.status >= 500;
    if ((!rateLimited && !retryServerError) || attempt === MAX_ATTEMPTS - 1) return response;

    const delayMs = rateLimited ? cooldownMs(response.headers) : 500 * (attempt + 1);
    if (delayMs > MAX_WAIT_MS - waitedMs) {
      throw new Error(`Login returned HTTP ${response.status}; server cooldown exceeds the ${MAX_WAIT_MS / 1000}s wait budget`);
    }
    if (rateLimited) {
      // beforeAll has its own timeout slot. Extend that slot as well as ordinary test setup.
      const info = test.info();
      if (info.timeout) test.setTimeout(Math.max(info.timeout, 180000));
      console.info(`Login returned HTTP 429; waiting ${Math.ceil(delayMs / 1000)}s before retry`);
    }
    waitedMs += delayMs;
    for (let remaining = delayMs; remaining > 0; remaining -= 30000) {
      await new Promise(resolve => setTimeout(resolve, Math.min(remaining, 30000)));
    }
  }
}
