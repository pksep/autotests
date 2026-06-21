import 'dotenv/config';

/**
 * Environment variables for the test framework.
 * Override via .env or process.env (e.g. TEST_SUITE=U002, BASE_URL=..., LOG_LEVEL=warn).
 */

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://dev.pksep.ru/',
  API_BASE_URL: process.env.API_BASE_URL || 'https://dev.pksep.ru/',
  HEADLESS: process.env.HEADLESS === 'true',
  TIMEOUT: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 5000,
  LOGIN_DELAY_MS: process.env.LOGIN_DELAY_MS ? parseInt(process.env.LOGIN_DELAY_MS, 10) : 0,
  /** Suite to run. Override via env: TEST_SUITE=CheckTableTotals pnpm exec playwright test. CI can set this in workflow env. */
  TEST_SUITE: process.env.TEST_SUITE || 'U001',
  TEST_DIR: '.',
  DEBUG: true,
  /**
   * Log level: 'error' | 'warn' | 'info' | 'debug'.
   * Override at run time: LOG_LEVEL=warn pnpm exec playwright test
   */
  LOG_LEVEL: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'warn',
};
