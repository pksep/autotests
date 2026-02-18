import { defineConfig } from '@playwright/test';
import { ENV } from './config';
import path from 'path';
import logger from './lib/utils/logger';

export default defineConfig({
  testDir: process.env.TEST_DIR || ENV.TEST_DIR, //path.join(__dirname, "."), set in config.ts
  timeout: 30000,
  globalTimeout: 30 * 60 * 1000, // 30 minutes for full suite (e.g. U001)
  workers: 1, // Sequential only: suites like U001 create then use then delete data; parallel workers would conflict
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || ENV.BASE_URL, //setgit a this in your config.ts
    headless: ENV.HEADLESS, //set this in your config.ts
    viewport: { width: 1920, height: 830 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    // API testing specific settings
    extraHTTPHeaders: {
      Accept: 'application/json',
      // Removed Content-Type to avoid interfering with form submissions
      // API tests will set their own Content-Type headers
    },
    // Browser settings to make automation more like manual browsing
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    //timezoneId: 'America/New_York',
    timezoneId: 'Europe/Budapest',
    // Disable webdriver detection
    javaScriptEnabled: true,
    // Add realistic delays
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    },
    // Filter out Vue warnings
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
  projects: [
    {
      name: 'suite01',
      testMatch: '**/main.spec.ts', // Match the dynamically generated test entry point
    },
  ],
  reporter: [
    ['line'], // Console output
    ['allure-playwright'], // Allure reporter
  ],
});
