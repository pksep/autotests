import { test, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage'; // Adjust the path as necessary
import testData from '../testdata/uc000.json'; // Import your test data
import { ENV } from '../config';

// Define the login function
export async function performLogin(page: Page, table: string, login: string, password: string): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.goto(ENV.BASE_URL);
    await loginPage.fillLoginForm(page, table, login, password);
    await page.click('button[type="submit"]');
}

// Define runTC000 to use the performLogin function
export const runTC000 = (isSingleTest: boolean) => {
    if (isSingleTest) {
        test('Test Case - Login with Data', async ({ page }) => {
            const { table, login, password } = testData.users[0];
            await performLogin(page, table, login, password);
            await page.click('button.btn.blues');
        });
    } else {
        // Loop through all test data
        testData.users.forEach((user, index) => {
            test(`Test Case - Login with Data for User ${index + 1} `, async ({ page }) => {
                const { table, login, password } = user;
                await performLogin(page, table, login, password);
                await page.click('button.btn.blues');
            });
        });
    }
};
