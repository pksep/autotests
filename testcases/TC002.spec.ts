import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import { AbstractPage } from '../lib/AbstractPage';
import logger from '../lib/utils/logger'; // Added logger import

export function runTC002(dataTestId: string) {
    test(`TC002 - Verify Page URL for data-testid: ${dataTestId}`, async ({ page }) => {
        const testCaseId = 'TC002';

        // Check if the data-testid is in the SELECTORS list
        const pageConfig = Object.values(SELECTORS.MAINMENU).find(config => config.DATA_TESTID === dataTestId);

        if (!pageConfig) {
            const errorMessage = `Test Case: ${testCaseId} - Configuration not found for data-testid: ${dataTestId}`;
            logger.error(errorMessage);
            expect(pageConfig).toBeDefined(); // This will fail the test case
            return;
        }

        // Create an instance of AbstractPage
        const abstractPage = new AbstractPage(page);

        logger.info(`Test Case: ${testCaseId} - Starting test for data-testid: ${dataTestId}`);

        const navigationResult = await abstractPage.nav(dataTestId);

        if (navigationResult !== true) {
            const navErrorMessage = `Test Case: ${testCaseId} - Navigation failed for data-testid: ${dataTestId} with message: ${navigationResult}`;
            logger.error(navErrorMessage);
            expect(navigationResult).toBe(true); // This will fail the test case
        } else {
            const urlCheckResult = await abstractPage.checkUrl(pageConfig.URL);

            if (urlCheckResult !== true) {
                const urlErrorMessage = `Test Case: ${testCaseId} - URL path verification failed for data-testid: ${dataTestId} with message: ${urlCheckResult}`;
                logger.error(urlErrorMessage);
                expect(urlCheckResult).toBe(true); // This will fail the test case
            } else {
                logger.info(`Test Case: ${testCaseId} - Test Passed for data-testid: ${dataTestId}`);
            }
        }
    });
}

// Example usage:
//createTC002('product-data-testid'); // Replace 'product-data-testid' with the actual data-testid
