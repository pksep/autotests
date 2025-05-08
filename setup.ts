import { test, expect } from '@playwright/test';
import { performLogin } from './testcases/TC000.spec';

export function runSetup() { // ✅ Use function declaration instead of arrow function
    test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
        await performLogin(page, "001", "Перов Д.А.", "54321");
        await page.waitForSelector('[data-testid="LoginForm-Login-Button"]', { state: 'visible' });
        await page.locator('[data-testid="LoginForm-Login-Button"]').click();

        const targetH3 = page.locator('h3:has-text("План по операциям")');
        await expect(targetH3).toBeVisible();
    });
}
