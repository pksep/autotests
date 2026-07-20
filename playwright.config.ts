import path from 'path';
import { defineConfig } from '@playwright/test';
// Load .env from project root so TEST_SUITE is set before config runs (cwd may differ in some environments)
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { ENV } from './config';
import { apiSuites } from './testSuiteConfig.api';

const isParallel = process.env.TEST_SUITE === 'parallel' || ENV.TEST_SUITE === 'parallel';
const selectedSuiteKey = process.env.TEST_SUITE || ENV.TEST_SUITE;
const isApiSuite = Object.keys(apiSuites).includes(selectedSuiteKey);

const workers = 1;

export default defineConfig({
  testDir: process.env.TEST_DIR || ENV.TEST_DIR,
  timeout: 30000,
  globalTimeout: isParallel || isApiSuite ? 60 * 60 * 1000 : 30 * 60 * 1000, // parallel and API suites can run longer than the old 30m cap
  workers,
  fullyParallel: isParallel || isApiSuite, // required so multiple workers run when only one file (main.spec.ts) matches
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
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor', '--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--no-sandbox'],
    },
    // Filter out Vue warnings
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
  testIgnore: 'repo-at-single-U001/**',
  projects: [
    {
      name: 'SEP ERP',
      testMatch: 'main.spec.ts',
    },
  ],
  reporter: [
    ['line'], // Console output
    ['html', { open: 'never' }], // playwright-report/ — for deploy:gh-pages (no Java required)
    ['allure-playwright'], // Allure reporter (allure generate needs Java)
  ],
});
