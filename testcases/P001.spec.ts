import { test, expect } from '@playwright/test';
import { CreatePartsPage } from '../pages/CreatePartsPage';
import { ENV } from '../config'; // Import the configuration
import logger from '../lib/utils/logger';

export const runP001 = (isSingleTest: boolean, iterations: number) => {
    test('Verify Create Part Page Functionality', async ({ page }) => {
        logger.log(`Starting test: Verify Create Part Page Functionality`);

        const createPartsPage = new CreatePartsPage(page);

        // Open the starting URL from the configuration
        logger.log('Opening the base URL');
        await createPartsPage.goto(ENV.BASE_URL);
        logger.log('Base URL opened');

        // Fill the login form
        logger.log('Calling fillLoginForm');
        await createPartsPage.fillLoginForm(page, '001', 'Перов Д.А.', '54321');
        logger.log('fillLoginForm called');

        // Execute navigation to the page
        // logger.log('Calling navigateToPage');
        // await createPartsPage.navigateToPage();
        // logger.log('navigateToPage called');

        // Placeholder for future detail page verification
        //await createPartsPage.verifyDetailPage();
        //logger.log('Test complete');

    });
};