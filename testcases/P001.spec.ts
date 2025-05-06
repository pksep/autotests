import { test, expect } from '@playwright/test';
import { CreatePartsPage } from '../pages/CreatePartsPage';
import { ENV } from '../config'; // Import the configuration

export const runP001 = (isSingleTest: boolean, iterations: number) => {
    test('Verify Create Part Page Functionality', async ({ page }) => {
        console.log(`Starting test: Verify Create Part Page Functionality`);

        const createPartsPage = new CreatePartsPage(page);

        // Open the starting URL from the configuration
        console.log('Opening the base URL');
        await createPartsPage.goto(ENV.BASE_URL);
        console.log('Base URL opened');

        // Fill the login form
        console.log('Calling fillLoginForm');
        await createPartsPage.fillLoginForm(page, '001', 'Перов Д.А.', '54321');
        console.log('fillLoginForm called');

        // Execute navigation to the page
        // console.log('Calling navigateToPage');
        // await createPartsPage.navigateToPage();
        // console.log('navigateToPage called');

        // Placeholder for future detail page verification
        //await createPartsPage.verifyDetailPage();
        //console.log('Test complete');

    });
};