import { test, expect } from '@playwright/test';
import { performLogin } from './testcases/TC000.spec';
import { ENV, LOGIN_TEST_CONFIG } from './config';
import { WAIT_TIMEOUTS } from './lib/Constants/TimeoutConstants';

export function runSetup() {
  // ✅ Use function declaration instead of arrow function
  test.beforeEach('Test Case 00 - Authorization', async ({ page }) => {
    // Skip web UI setup for API tests
    if (ENV.TEST_SUITE.includes('api')) {
      return;
    }

    const { tabel, username, password } = LOGIN_TEST_CONFIG.TEST_CREDENTIALS;
    await performLogin(page, tabel, username, password);
    await page.waitForSelector('[data-testid="LoginForm-Login-Button"]', { state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await page.locator('[data-testid="LoginForm-Login-Button"]').click();
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle').catch(() => {});

    const targetH3 = page.locator('h3:has-text("План по операциям")');
    await expect(targetH3).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
  });
}
