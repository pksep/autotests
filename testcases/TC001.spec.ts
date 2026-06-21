import { Page } from '@playwright/test';
import { SELECTORS } from '../config';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';

/**
 * Function to perform navigation for the TC001 test case.
 * @param page - The Playwright page object.
 * @param dataTestId - The data-testid for the menu item to click.
 */
export async function runTC001(page: Page, dataTestId: string): Promise<true | string> {
  logger.info('Starting TC001 test case');

  // Check if the data-testid is in the SELECTORS list
  const pageConfig = Object.values(SELECTORS.MAINMENU).find(config => config.DATA_TESTID === dataTestId);

  if (!pageConfig) {
    logger.error(`Configuration not found for data-testid: ${dataTestId}`);
    return `Configuration not found for data-testid: ${dataTestId}`;
  }

  // Create an instance of ConcretePage
  const concretePage = new PageObject(page);

  logger.info(`Starting navigation for data-testid: ${dataTestId}`);

  // Perform navigation
  const navigationResult = await concretePage.nav(dataTestId);

  // Return the navigation result
  return navigationResult;
}

// Example usage in a test file
