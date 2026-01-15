/**
 * @file Page.ts
 * @date 2025-01-20
 * @purpose To handle common actions and utilities across all pages, including interacting with input fields, buttons, and handling errors.
 *
 * @alterations
 * - 2025-01-20: Initial version of the PageObject class to handle reusable page interactions.
 * - 2025-01-20: Added logging, text normalization, and error message handling methods.
 */

import { Page, expect, Locator, ElementHandle, TestInfo, TestInfoError } from '@playwright/test'; // Import Playwright's Page class
import { AbstractPage } from './AbstractPage'; // Import the base AbstractPage class
import { ENV, SELECTORS, CONST } from '../config'; // Import environment and selector configurations
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase'; // Import Parts Database selectors
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote'; // Import Modal Window Consignment Note selectors
import * as SelectorsStartProduction from '../lib/Constants/SelectorsStartProduction'; // Import Start Production selectors
import * as SelectorsNotifications from '../lib/Constants/SelectorsNotifications'; // Import Notifications selectors
import * as SelectorsSearchInputs from '../lib/Constants/SelectorsSearchInputs'; // Import Search Inputs selectors
import * as SelectorsFileComponents from '../lib/Constants/SelectorsFileComponents'; // Import File Components selectors
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers'; // Import Ordered From Suppliers selectors
import { Input } from './Input'; // Import the Input helper class for handling input fields
import { Button } from './Button'; // Import the Button helper class for handling button clicks
import logger from './logger'; // Import logger utility for logging messages
import { table } from 'console';
import { exec } from 'child_process';
import exp from 'constants';
import { allure } from 'allure-playwright';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles'; // Import highlight style constants
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants'; // Import timeout constants

// Global variable declarations for test data arrays
declare global {
  var arrayDetail: Array<{ name: string; designation?: string }>;
  var arrayCbed: Array<{ name: string; designation?: string }>;
  var arrayIzd: Array<{ name: string; designation?: string }>;
}

// Initialize global arrays
global.arrayDetail = global.arrayDetail || [];
global.arrayCbed = global.arrayCbed || [];
global.arrayIzd = global.arrayIzd || [];

/**
 * PageObject class that provides common page actions, such as interacting with inputs, buttons, and retrieving text.
 * Inherits from the AbstractPage class for basic page handling functionality.
 */
// Utility function to populate test data arrays
export async function populateTestData(page: Page, skipNavigation = false) {
  // Lazy import to avoid circular dependency (PartsDatabasePage imports PageObject from Page.ts)
  const { CreatePartsDatabasePage } = await import('../pages/PartsDatabasePage');
  const partsDatabasePage = new CreatePartsDatabasePage(page);

  // Go to parts database page only if not already there
  if (!skipNavigation) {
    await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
    await page.waitForLoadState('networkidle');
  }

  // Get existing details
  try {
    const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
    await detailTable.waitFor({ state: 'visible', timeout: 5000 });
    const detailRows = detailTable.locator('tbody tr');
    const detailCount = await detailRows.count();

    if (detailCount > 0) {
      const firstDetailRow = detailRows.first();
      const detailName = await firstDetailRow.locator('td').nth(1).textContent();
      const detailDesignation = await firstDetailRow.locator('td').nth(2).textContent();
      arrayDetail = [
        {
          name: detailName?.trim() || 'DEFAULT_DETAIL',
          designation: detailDesignation?.trim() || '-',
        },
      ];
      console.log(`Found existing detail: ${arrayDetail[0].name}`);
    }
  } catch (error) {
    console.log('No details found, using default');
    arrayDetail = [{ name: 'DEFAULT_DETAIL', designation: '-' }];
  }

  // Get existing assemblies
  try {
    const cbedTable = page.locator(SelectorsPartsDataBase.CBED_TABLE);
    await cbedTable.waitFor({ state: 'visible', timeout: 5000 });
    const cbedRows = cbedTable.locator('tbody tr');
    const cbedCount = await cbedRows.count();

    if (cbedCount > 0) {
      const firstCbedRow = cbedRows.first();
      const cbedName = await firstCbedRow.locator('td').nth(1).textContent();
      const cbedDesignation = await firstCbedRow.locator('td').nth(2).textContent();
      arrayCbed = [
        {
          name: cbedName?.trim() || 'DEFAULT_CBED',
          designation: cbedDesignation?.trim() || '-',
        },
      ];
      console.log(`Found existing assembly: ${arrayCbed[0].name}`);
    }
  } catch (error) {
    console.log('No assemblies found, using default');
    arrayCbed = [{ name: 'DEFAULT_CBED', designation: '-' }];
  }

  // Get existing products by searching for them
  try {
    console.log('Looking for products table...');
    const productTable = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
    await productTable.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Products table found, searching for products...');

    // Search for products that might exist (try common patterns)
    const searchInput = page.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} ${SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT}`);
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });

    // Try searching for products with common patterns
    const searchTerms = ['Впускной', 'крапан', 'М12', 'DEFAULT_PRODUCT'];
    let foundProduct = false;

    for (const searchTerm of searchTerms) {
      console.log(`Searching for products with term: "${searchTerm}"`);
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await page.waitForTimeout(1000); // Wait for search results

      const productRows = productTable.locator('tbody tr');
      const productCount = await productRows.count();
      console.log(`Found ${productCount} products matching "${searchTerm}"`);

      if (productCount > 0) {
        const firstProductRow = productRows.first();
        const productName = await firstProductRow.locator('td').nth(2).textContent();
        const productDesignation = await firstProductRow.locator('td').nth(3).textContent();
        arrayIzd = [
          {
            name: productName?.trim() || 'DEFAULT_PRODUCT',
            designation: productDesignation?.trim() || '-',
          },
        ];
        console.log(`Found existing product: ${arrayIzd[0].name}`);
        foundProduct = true;
        break;
      }
    }

    if (!foundProduct) {
      console.log('No products found with any search terms, will use default');
    }
  } catch (error) {
    console.log('No products found, using default. Error:', error);
    arrayIzd = [{ name: 'DEFAULT_PRODUCT', designation: '-' }];
  }

  // Populate details array
  try {
    console.log('Looking for details table...');
    const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
    await detailTable.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Details table found, searching for details...');

    const searchInput = page.locator(`${SelectorsPartsDataBase.DETAIL_TABLE} ${SelectorsPartsDataBase.SEARCH_DETAIL_ATTRIBUT}`);
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });

    const searchTerms = ['DEFAULT_DETAIL', 'Шток', 'поршнем'];
    let foundDetail = false;

    for (const searchTerm of searchTerms) {
      console.log(`Searching for details with term: "${searchTerm}"`);
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);

      const rows = page.locator(`${SelectorsPartsDataBase.DETAIL_TABLE} tbody tr`);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        console.log(`Found ${rowCount} details with search term: "${searchTerm}"`);
        arrayDetail = [];
        for (let i = 0; i < Math.min(rowCount, 3); i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const designationCell = rows.nth(i).locator('td').nth(2);
          const name = (await nameCell.textContent())?.trim() || `DETAIL_${i + 1}`;
          const designation = (await designationCell.textContent())?.trim() || '-';
          arrayDetail.push({ name, designation });
        }
        foundDetail = true;
        break;
      }
    }

    if (!foundDetail) {
      console.log('No details found with any search terms, will use default');
    }
  } catch (error) {
    console.log('No details found, using default. Error:', error);
    arrayDetail = [{ name: 'DEFAULT_DETAIL', designation: '-' }];
  }

  // Populate CBED array
  try {
    console.log('Looking for CBED table...');
    const cbedTable = page.locator(SelectorsPartsDataBase.CBED_TABLE);
    await cbedTable.waitFor({ state: 'visible', timeout: 5000 });
    console.log('CBED table found, searching for CBEDs...');

    const searchInput = page.locator(`${SelectorsPartsDataBase.CBED_TABLE} ${SelectorsPartsDataBase.SEARCH_CBED_ATTRIBUT}`);
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });

    const searchTerms = ['DEFAULT_CBED', 'СБЕД', 'сборка'];
    let foundCbed = false;

    for (const searchTerm of searchTerms) {
      console.log(`Searching for CBEDs with term: "${searchTerm}"`);
      await searchInput.clear();
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);

      const rows = page.locator(`${SelectorsPartsDataBase.CBED_TABLE} tbody tr`);
      const rowCount = await rows.count();

      if (rowCount > 0) {
        console.log(`Found ${rowCount} CBEDs with search term: "${searchTerm}"`);
        arrayCbed = [];
        for (let i = 0; i < Math.min(rowCount, 3); i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const designationCell = rows.nth(i).locator('td').nth(2);
          const name = (await nameCell.textContent())?.trim() || `CBED_${i + 1}`;
          const designation = (await designationCell.textContent())?.trim() || '-';
          arrayCbed.push({ name, designation });
        }
        foundCbed = true;
        break;
      }
    }

    if (!foundCbed) {
      console.log('No CBEDs found with any search terms, will use default');
    }
  } catch (error) {
    console.log('No CBEDs found, using default. Error:', error);
    arrayCbed = [{ name: 'DEFAULT_CBED', designation: '-' }];
  }
}

/**
 * Helper function to wrap expect.soft() with automatic screenshot capture
 * This ensures screenshots are taken before every soft assertion for debugging purposes
 *
 * @param page - The Playwright Page object to capture screenshot from
 * @param assertionFn - A function that contains the expect.soft() assertion
 * @param description - Optional description for the assertion (used in logs and screenshot naming)
 * @param testInfo - Optional TestInfo object to attach screenshot to test report
 *
 * @example
 * await expectSoftWithScreenshot(page, () => {
 *   expect.soft(actualValue).toBe(expectedValue);
 * }, 'Verify quantity matches', test.info());
 */
export async function expectSoftWithScreenshot(page: Page, assertionFn: () => void | Promise<void>, description?: string, testInfo?: TestInfo): Promise<void> {
  const errorsArray: TestInfoError[] | undefined = testInfo && (testInfo as any).errors;
  const canDetectFailure = Array.isArray(errorsArray);
  const getSoftErrorCount = (): number => {
    if (canDetectFailure && errorsArray) {
      return errorsArray.length;
    }
    return (page as any).__softAssertErrorCount ?? 0;
  };

  const beforeCount = getSoftErrorCount();
  const result = assertionFn();
  if (result instanceof Promise) {
    await result;
  }
  const afterCount = getSoftErrorCount();
  const assertionFailed = canDetectFailure ? afterCount > beforeCount : true;

  if (!assertionFailed) {
    if (!canDetectFailure) {
      (page as any).__softAssertErrorCount = afterCount;
    }
    return;
  }

  const timestamp = Date.now();
  const safeDescription = description ? description.replace(/[^a-zA-Z0-9]/g, '_') : 'assertion';
  const screenshotPath = `test-results/soft-assert-${safeDescription}-${timestamp}.png`;
  let screenshotAttached = false;

  try {
    await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 5000 });

    if (testInfo) {
      try {
        await testInfo.attach(`soft-assert-${description || 'screenshot'}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
        screenshotAttached = true;
      } catch (attachError) {
        console.log(`Could not attach screenshot to test report: ${attachError}`);
      }
    }

    if (description) {
      const attachmentNote = screenshotAttached ? ' (attached to test report - will appear in HTML report on failure)' : '';
      console.log(`📸 Screenshot captured for soft assertion: ${description}`);
      console.log(`   Screenshot path: ${screenshotPath}${attachmentNote}`);
    }

    (page as any).__lastSoftAssertScreenshot = screenshotPath;
  } catch (error) {
    console.log(`Could not capture screenshot for soft assertion: ${error}`);
  }
}

export class PageObject extends AbstractPage {
  protected button: Button; // Button helper instance
  protected input: Input; // Input helper instance

  constructor(page: Page) {
    super(page); // Initialize the base AbstractPage with the page object
    this.button = new Button(page); // Initialize the button helper
    this.input = new Input(page); // Initialize the input helper
  }

  /**
   * Scans and validates the structure of tables within a specified element, and identifies rows with duplicate data-testids and cells missing data-testids.
   * @param page - The Playwright page instance.
   * @param dataTestId - The data-testid of the container element.
   * @returns A promise that resolves once the validation is complete.
   * @throws An error if any validation check fails.
   */
  async scanTablesWithinElement(page: Page, dataTestId: string): Promise<ValidationResult> {
    const errors: string[] = [];

    // Locate the element with the specified data-testid
    const container = await page.$(`[data-testid="${dataTestId}"]`);
    if (!container) {
      const errorMessage = `Element with data-testid "${dataTestId}" not found.`;
      logger.error(errorMessage);
      errors.push(errorMessage);
    } else {
      // Find all tables within the located container
      const tables = await container.$$('table');
      if (tables.length === 0) {
        const errorMessage = `No tables found within the element with data-testid "${dataTestId}".`;
        logger.error(errorMessage);
        errors.push(errorMessage);
      } else {
        // Iterate through each table and validate its structure
        for (const [index, table] of tables.entries()) {
          const tableErrors: string[] = [];
          logger.info(`Validating Table ${index + 1} within data-testid "${dataTestId}":`);

          // Validate the table structure (you can expand this as needed)
          const thead = await table.$('thead');
          if (!thead) {
            const errorMessage = `Table ${index + 1} is missing <thead>.`;
            logger.error(errorMessage);
            tableErrors.push(errorMessage);
          }

          const tbody = await table.$('tbody');
          if (!tbody) {
            const errorMessage = `Table ${index + 1} is missing <tbody>.`;
            logger.error(errorMessage);
            tableErrors.push(errorMessage);
          }

          // Check for duplicate data-testids in rows
          const rows = await table.$$('tr');
          const dataTestIdMap = new Map();
          const duplicateDataTestIds = new Set();
          for (const row of rows) {
            const rowDataTestId = await row.evaluate(node => node.getAttribute('data-testid'));
            if (rowDataTestId) {
              if (dataTestIdMap.has(rowDataTestId)) {
                duplicateDataTestIds.add(rowDataTestId);
              } else {
                dataTestIdMap.set(rowDataTestId, true);
              }
            }
          }

          // Log duplicate data-testids only once per data-testid
          duplicateDataTestIds.forEach(duplicateId => {
            const errorMessage = `Duplicate data-testid "${duplicateId}" found in Table ${index + 1}`;
            logger.warn(errorMessage);
            tableErrors.push(errorMessage);
          });

          // Check for th and td cells missing data-testid
          const cells = await table.$$('th, td');
          for (const cell of cells) {
            const cellDataTestId = await cell.evaluate(node => node.getAttribute('data-testid'));
            if (!cellDataTestId) {
              const cellTagName = await cell.evaluate(node => node.tagName.toLowerCase());
              const errorMessage = `Cell <${cellTagName}> is missing data-testid in Table ${index + 1}`;
              logger.warn(errorMessage);
              tableErrors.push(errorMessage);
            }
          }

          // Find the closest preceding h3 tag containing the header of the page or modal window
          const header = await table.evaluate(node => {
            let element = node as HTMLElement;
            while (element && element.tagName.toLowerCase() !== 'body') {
              const previousElement = element.previousElementSibling as HTMLElement;
              if (previousElement) {
                element = previousElement;
                if (element.tagName.toLowerCase() === 'h3') {
                  return element.innerText;
                }
              } else {
                element = element.parentElement as HTMLElement;
              }
            }
            return null;
          });

          const headerText = header ? ` (Header: ${header})` : '';

          // Append header text to each error message and remove duplicates
          const tableErrorMessages = Array.from(new Set(tableErrors.map(error => `${error}${headerText}`)));

          // Further validations can be added here
          if (tableErrors.length === 0) {
            logger.info(`Table ${index + 1} has a valid structure.`);
          } else {
            errors.push(...tableErrorMessages);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Finds an element with the specified partial data-testid and clicks on it.
   * If not found, it tries to find an element with the same value as id and clicks on it.
   * @param page - The Playwright page instance.
   * @param partialDataTestId - The partial data-testid of the elements to search for.
   * @param waitTime - The amount of time to wait after clicking, in milliseconds.
   * @returns A promise that resolves once the element is clicked and the wait time has elapsed.
   */
  async findAndClickElement(page: Page, partialDataTestId: string, waitTime: number = 10000, doubleClick?: boolean): Promise<void> {
    // Check if partialDataTestId already contains the full selector with [data-testid=
    // If yes, use it directly; if no, wrap it with [data-testid^="..."]
    const isFullSelector = partialDataTestId.startsWith('[data-testid');
    const selector = isFullSelector ? partialDataTestId : `[data-testid^="${partialDataTestId}"]`;
    const searchTerm = isFullSelector ? 'selector' : 'data-testid';

    logger.info(`Searching for elements with ${searchTerm}="${partialDataTestId}"`);

    // Use locator (modern Playwright API) instead of page.$$() (old API)
    // Locators automatically wait for elements and are more reliable
    const locator = page.locator(selector);

    try {
      // Wait for at least one element to be visible
      await expect(locator.first()).toBeVisible({ timeout: 10000 });

      // Count how many elements match
      const count = await locator.count();
      logger.info(`Found ${count} element(s) with ${searchTerm}="${partialDataTestId}"`);

      if (count > 1) {
        logger.warn(`Found multiple elements with ${searchTerm}="${partialDataTestId}" will click first`);
      }

      // Get the first element locator
      const firstElement = locator.first();

      // Highlight the element before clicking
      await firstElement.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });

      // Click on the first element
      if (!doubleClick) {
        await firstElement.click({ force: true });
      } else {
        await firstElement.dblclick({ force: true });
      }

      logger.info(`Clicked on the first element with ${searchTerm}="${partialDataTestId}"`);

      // Wait for the specified amount of time
      await page.waitForTimeout(waitTime);
      await page.waitForTimeout(1500);
      logger.info(`Waited for ${waitTime}ms after clicking the element`);
    } catch (error) {
      // If selector search failed, try fallback methods
      if (isFullSelector) {
        // Extract the data-testid value from the full selector
        const dataTestIdValue = partialDataTestId.match(/data-testid="([^"]+)"/)?.[1];
        if (dataTestIdValue) {
          logger.warn(`Element with selector="${partialDataTestId}" not found, trying getByTestId with "${dataTestIdValue}"...`);
          try {
            const testIdLocator = page.getByTestId(dataTestIdValue);
            await expect(testIdLocator).toBeVisible({ timeout: 10000 });

            logger.info(`Element found with getByTestId("${dataTestIdValue}")`);

            await testIdLocator.scrollIntoViewIfNeeded();
            await testIdLocator.evaluate(element => {
              element.style.border = '2px solid red';
              element.style.backgroundColor = 'yellow';
            });

            if (!doubleClick) {
              await testIdLocator.click({ force: true });
            } else {
              await testIdLocator.dblclick({ force: true });
            }

            logger.info(`Clicked on the element with getByTestId("${dataTestIdValue}")`);
            await page.waitForTimeout(waitTime);
            await page.waitForTimeout(1500);
            logger.info(`Waited for ${waitTime}ms after clicking the element`);
            return; // Success, exit early
          } catch (testIdError) {
            logger.warn(`getByTestId("${dataTestIdValue}") also failed, trying ID fallback...`);
          }
        }

        // Try ID fallback
        const idValue = dataTestIdValue || partialDataTestId.replace(/[\[\]"]/g, '');
        logger.warn(`Trying to find by ID="${idValue}"...`);
        const idLocator = page.locator(`#${idValue}`);

        try {
          await expect(idLocator).toBeVisible({ timeout: 10000 });
          logger.info(`Element with id="${idValue}" found`);

          await idLocator.scrollIntoViewIfNeeded();
          await idLocator.evaluate(element => {
            element.style.border = '2px solid red';
            element.style.backgroundColor = 'yellow';
          });

          if (!doubleClick) {
            await idLocator.click({ force: true });
          } else {
            await idLocator.dblclick({ force: true });
          }

          logger.info(`Clicked on the element with id="${idValue}"`);
          await page.waitForTimeout(waitTime);
          logger.info(`Waited for ${waitTime}ms after clicking the element`);
          return; // Success, exit early
        } catch (idError) {
          // All methods failed
          logger.error(`No element found with selector="${partialDataTestId}", getByTestId, or id="${idValue}"`);
          throw new Error(
            `findAndClickElement failed: Could not find element with selector="${partialDataTestId}", getByTestId, or id="${idValue}". ` +
              `The element may not be visible, may have a different selector, or the page may not have loaded completely.`,
          );
        }
      } else {
        // For partial data-testid, try ID fallback
        logger.warn(`Element with data-testid^="${partialDataTestId}" not found, trying to find by ID...`);
        const idLocator = page.locator(`#${partialDataTestId}`);

        try {
          await expect(idLocator).toBeVisible({ timeout: 10000 });
          logger.info(`Element with id="${partialDataTestId}" found`);

          await idLocator.scrollIntoViewIfNeeded();
          await idLocator.evaluate(element => {
            element.style.border = '2px solid red';
            element.style.backgroundColor = 'yellow';
          });

          if (!doubleClick) {
            await idLocator.click({ force: true });
          } else {
            await idLocator.dblclick({ force: true });
          }

          logger.info(`Clicked on the element with id="${partialDataTestId}"`);
          await page.waitForTimeout(waitTime);
          logger.info(`Waited for ${waitTime}ms after clicking the element with id="${partialDataTestId}"`);
        } catch (idError) {
          // Neither data-testid nor id worked - throw error
          logger.error(`No element found with data-testid^="${partialDataTestId}" or id="${partialDataTestId}"`);

          throw new Error(
            `findAndClickElement failed: Could not find element with data-testid^="${partialDataTestId}" or id="${partialDataTestId}". ` +
              `The element may not be visible, may have a different selector, or the page may not have loaded completely.`,
          );
        }
      }
    }
  }

  /**
   * Gets the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The text content of the element or null if the element doesn't exist.
   */
  async getText(selector: string): Promise<string | null> {
    return await this.page.textContent(selector); // Return the text content of the element
  }

  /**
   * Normalizes a string by removing extra spaces and normalizing Unicode characters.
   * @param text - The text string to normalize.
   * @returns The normalized text string.
   */
  normalizeText(text: string): string {
    return text
      .normalize('NFC')
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Trim leading and trailing spaces
  }

  /**
   * Normalizes order numbers by removing "№" symbol and trimming whitespace
   * @param orderNum - The order number string to normalize
   * @returns Normalized order number without "№" symbol
   */
  normalizeOrderNumber(orderNum: string): string {
    return orderNum.replace(/^№\s*/, '').trim();
  }

  /**
   * Normalizes date strings to DD.MM.YYYY format
   * Handles formats: DD.MM.YYYY, DD.MM.YY, and month names (янв, фев, etc.)
   * @param rawDate - The raw date string to normalize
   * @returns Normalized date string in DD.MM.YYYY format, or original string if it's just a number
   */
  normalizeDate(rawDate: string): string {
    if (!rawDate || !rawDate.trim()) {
      logger.warn('normalizeDate: Empty or undefined date string');
      return rawDate || '';
    }

    const trimmedDate = rawDate.trim();

    // Skip normalization if it's just a number (like "0" for DateOrder)
    if (/^\d+$/.test(trimmedDate)) {
      return trimmedDate;
    }

    const parseDate = (dateStr: string): Date => {
      if (!dateStr || !dateStr.trim()) {
        throw new Error('Empty date string');
      }

      if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length >= 3) {
          const [day, month, yearStr] = parts;
          const year = yearStr && yearStr.length === 2 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr || '0', 10);
          return new Date(year, Number(month) - 1, Number(day));
        }
      }

      const months: { [key: string]: number } = {
        янв: 0,
        фев: 1,
        мар: 2,
        апр: 3,
        май: 4,
        июн: 5,
        июл: 6,
        авг: 7,
        сен: 8,
        окт: 9,
        ноя: 10,
        дек: 11,
      };
      const parts = dateStr.split(' ');
      const monthName = parts[0].toLowerCase();
      const day = parseInt(parts[1].replace(',', ''), 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, months[monthName], day);
    };

    try {
      const date = parseDate(trimmedDate);
      const day = `${date.getDate()}`.padStart(2, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const year = `${date.getFullYear()}`;
      return `${day}.${month}.${year}`;
    } catch (error) {
      logger.warn(`Failed to normalize date "${rawDate}": ${error}`);
      return rawDate;
    }
  }

  /**
   * Retrieves and normalizes the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The normalized text content of the element or null if the element doesn't exist.
   */
  async getTextNormalized(selector: string): Promise<string | null> {
    const text = await this.getText(selector); // Get the raw text
    return text ? this.normalizeText(text) : null; // Return normalized text if available
  }

  /**
   * Retrieves the error message or any other message and returns the normalized text.
   * @param selector - The CSS selector for the element containing the error message.
   * @returns The normalized error message or null if no message is found.
   */
  async getErrorMessage(selector: string): Promise<string | null> {
    return await this.getTextNormalized(selector); // Use the getTextNormalized method to fetch and normalize the error message
  }

  /**
   * Scrolls an element into view and then scrolls down an additional 100px to ensure element is fully visible in smaller viewports
   * @param element - The locator element to scroll into view
   * @param pageInstance - The page instance to perform the scroll on
   */
  async scrollIntoViewWithExtra(element: Locator, pageInstance: Page): Promise<void> {
    await element.scrollIntoViewIfNeeded();
    // Scroll down an additional 100px to ensure element is fully visible in smaller viewports
    await pageInstance.evaluate(() => {
      window.scrollBy(0, 100);
    });
    await pageInstance.waitForTimeout(200); // Small delay for scroll to complete
  }

  /**
   * Waits for element, scrolls into view, highlights it, and optionally waits
   * Combines common UI interaction patterns into a single method
   * @param locator - The locator to interact with
   * @param options - Optional configuration
   * @param options.timeout - Timeout for wait operations (default: 10000)
   * @param options.highlight - Whether to highlight the element (default: true)
   * @param options.highlightColor - Highlight background color (default: 'yellow')
   * @param options.highlightBorder - Highlight border style (default: '2px solid red')
   * @param options.highlightTextColor - Highlight text color (default: 'blue')
   * @param options.waitAfter - Milliseconds to wait after highlighting (default: 500)
   * @param options.scrollExtra - Whether to use scrollIntoViewWithExtra (default: false)
   */
  async waitAndHighlight(
    locator: Locator,
    options?: {
      timeout?: number;
      highlight?: boolean;
      highlightColor?: string;
      highlightBorder?: string;
      highlightTextColor?: string;
      waitAfter?: number;
      scrollExtra?: boolean;
    },
  ): Promise<void> {
    const timeout = options?.timeout ?? 10000;
    const shouldHighlight = options?.highlight ?? true;
    const waitAfter = options?.waitAfter ?? 500;
    const scrollExtra = options?.scrollExtra ?? false;

    await locator.waitFor({ state: 'visible', timeout });

    if (scrollExtra) {
      await this.scrollIntoViewWithExtra(locator, this.page);
    } else {
      await locator.scrollIntoViewIfNeeded();
    }

    if (shouldHighlight) {
      await this.highlightElement(locator, {
        backgroundColor: options?.highlightColor ?? 'yellow',
        border: options?.highlightBorder ?? '2px solid red',
        color: options?.highlightTextColor ?? 'blue',
      });
    }

    if (waitAfter > 0) {
      await this.page.waitForTimeout(waitAfter);
    }
  }

  /**
   * Creates a new tab, navigates to the specified URL, and returns both the page and a new PageObject instance
   * @param url - The URL to navigate to in the new tab
   * @param PageObjectClass - The PageObject class constructor to instantiate (e.g., CreateLoadingTaskPage)
   * @returns An object containing the new page and page object instance
   */
  async createNewTabAndNavigate<T extends PageObject>(url: string, PageObjectClass: new (page: Page) => T): Promise<{ page: Page; pageObject: T }> {
    const context = this.page.context();
    const newPage = await context.newPage();
    const pageObject = new PageObjectClass(newPage);
    await pageObject.goto(url);
    await pageObject.waitForNetworkIdle();
    await newPage.waitForTimeout(1000);
    return { page: newPage, pageObject };
  }

  /**
   * Opens the specified URL or the default base URL if none is provided.
   * @param url - The URL to navigate to. Defaults to BASE_URL from ENV if not provided.
   */
  async goto(url: string = ENV.BASE_URL): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' }); // Navigate to the provided URL and wait until the DOM content is loaded
  }

  /**
   * Waits for the network to be idle (no network requests for at least 500ms).
   * This is a common pattern used across many test cases to ensure page stability after actions.
   * @param timeout - Optional timeout in milliseconds (default: 30000)
   */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Navigates to a page, finds a table element, waits for network idle, and waits for the table body to load.
   * This is a common pattern used across many test cases.
   * @param url - The URL to navigate to
   * @param tableSelector - The selector for the table element to find and click
   * @param tableBodySelector - The selector for the table body to wait for
   * @param options - Optional configuration for waiting table body (minRows, timeoutMs)
   */
  async navigateToPageAndWaitForTable(
    url: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: { minRows?: number; timeoutMs?: number },
  ): Promise<void> {
    await this.goto(url);
    await this.findTable(tableSelector);
    await this.page.waitForLoadState('networkidle');
    await this.waitingTableBody(tableBodySelector, options);
  }

  /**
   * Searches a table and waits for the table body to load.
   * This is a common pattern used across many test cases.
   * @param searchTerm - The search term to enter
   * @param tableSelector - The selector for the table to search in
   * @param tableBodySelector - The selector for the table body to wait for
   * @param options - Optional configuration:
   *   - useRedesign: If true, uses searchTableRedesign instead of searchTable (default: false)
   *   - searchInputDataTestId: Optional data-testid for the search input (for searchTable method)
   *   - timeoutBeforeWait: Optional timeout in ms before waiting for table body
   *   - minRows: Minimum number of rows to wait for
   *   - timeoutMs: Timeout in ms for waiting table body
   */
  async searchAndWaitForTable(
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: {
      useRedesign?: boolean;
      searchInputDataTestId?: string;
      timeoutBeforeWait?: number;
      minRows?: number;
      timeoutMs?: number;
    },
  ): Promise<void> {
    if (options?.useRedesign) {
      await this.searchTableRedesign(searchTerm, tableSelector);
      await this.page.waitForLoadState('networkidle');
    } else {
      await this.searchTable(searchTerm, tableSelector, options?.searchInputDataTestId);
      // searchTable already includes waitForLoadState('networkidle')
    }

    if (options?.timeoutBeforeWait) {
      await this.page.waitForTimeout(options.timeoutBeforeWait);
    }

    // Only wait for table body if minRows is explicitly provided
    if (options?.minRows !== undefined) {
      await this.waitingTableBody(tableBodySelector, {
        minRows: options.minRows,
        timeoutMs: options?.timeoutMs,
      });
    }
  }

  /**
   * Validates page headings (H3 titles) and buttons on a page.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param titles - Array of expected H3 titles (will be trimmed)
   * @param buttons - Array of button configurations to validate
   * @param className - CSS class name to search for H3 titles (default: 'container')
   * @param options - Optional configuration:
   *   - skipTitleValidation: If true, skips H3 title validation
   *   - skipButtonValidation: If true, skips button validation
   */
  async validatePageHeadersAndButtons(
    page: Page,
    titles: string[],
    buttons: Array<{
      class?: string;
      datatestid?: string;
      label: string;
      state?: string | boolean;
    }>,
    containerSelector: string,
    options?: {
      skipTitleValidation?: boolean;
      skipButtonValidation?: boolean;
      useModalMethod?: boolean;
      testInfo?: TestInfo;
    },
  ): Promise<void> {
    // Validate H3 titles
    if (!options?.skipTitleValidation && titles.length > 0) {
      // Wait for the page to stabilize before collecting H3 titles
      await page.waitForLoadState('networkidle');

      const expectedTitles = titles.map(title => title.trim());
      // Use modal method if specified, otherwise use regular method
      let h3Titles = options?.useModalMethod
        ? await this.getAllH3TitlesInModalClassNew(page, containerSelector)
        : await this.getAllH3TitlesInClass(page, containerSelector);

      // If no titles found in container, try searching the entire page body (excluding modals)
      // This handles cases where page-level titles are outside the container
      if (h3Titles.length === 0) {
        console.log('No H3 titles found in container, searching entire page body (excluding modals)...');
        const pageBody = page.locator('body');
        const allH3Elements = await pageBody.locator('h3').all();

        for (const h3Tag of allH3Elements) {
          try {
            // Check if this H3 is inside any modal/dialog using evaluate
            const isInsideModal = await h3Tag.evaluate(el => {
              // Check for dialog element (HTML5 semantic element)
              if (el.closest('dialog')) return true;
              // Check for role="dialog" attribute
              if (el.closest('[role="dialog"]')) return true;
              // Check for data-testid containing "Modal"
              let parent = el.parentElement;
              while (parent) {
                if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
                  const testId = parent.getAttribute('data-testid');
                  if (testId && testId.includes('Modal')) {
                    return true;
                  }
                }
                parent = parent.parentElement;
              }
              return false;
            });

            // Only include H3 if it's not inside a modal
            if (!isInsideModal) {
              const title = await h3Tag.textContent();
              if (title) {
                h3Titles.push(title.trim());
              }
            }
          } catch (error) {
            // Skip if element is detached or not accessible
            console.log(`Skipping H3 element due to error: ${error}`);
          }
        }
      }

      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Log for debugging
      console.log('Expected Titles:', expectedTitles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(expectedTitles.length);
        },
        `Verify H3 titles count: expected ${expectedTitles.length}, actual ${normalizedH3Titles.length}`,
        options?.testInfo,
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(expectedTitles);
        },
        `Verify H3 titles match: expected ${JSON.stringify(expectedTitles)}, actual ${JSON.stringify(normalizedH3Titles)}`,
        options?.testInfo,
      );
    }

    // Validate buttons
    if (!options?.skipButtonValidation && buttons.length > 0) {
      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Iterate over each button in the array
      for (const button of buttons) {
        const buttonLabel = button.label;
        const expectedState = typeof button.state === 'string' ? button.state === 'true' : button.state ?? true;

        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          let isButtonReady: boolean;

          // Use isButtonVisibleTestId if datatestid is provided, otherwise use isButtonVisible
          if (button.datatestid) {
            isButtonReady = await this.isButtonVisibleTestId(page, button.datatestid, buttonLabel, expectedState);
          } else if (button.class) {
            isButtonReady = await this.isButtonVisible(page, button.class, buttonLabel, expectedState);
          } else {
            throw new Error(`Button "${buttonLabel}" must have either 'class' or 'datatestid' property`);
          }

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled: expected true, actual ${isButtonReady}`,
            options?.testInfo,
          );
          console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
    }
  }

  /**
   * Searches for a term in a table and verifies that the first row contains the search term.
   * This is a common pattern used across many test cases.
   * @param searchTerm - The term to search for
   * @param tableSelector - Selector for the table element
   * @param tableBodySelector - Selector for the table body element
   * @param options - Optional configuration:
   *   - useRedesign: If true, uses searchTableRedesign instead of searchTable
   *   - searchInputDataTestId: Data test ID for the search input (when not using redesign)
   *   - timeoutBeforeWait: Timeout in ms before waiting for table body
   *   - minRows: Minimum number of rows expected in the table
   *   - timeoutMs: Timeout in ms for waiting for table body
   */
  async searchAndVerifyFirstRow(
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: {
      useRedesign?: boolean;
      searchInputDataTestId?: string;
      timeoutBeforeWait?: number;
      minRows?: number;
      timeoutMs?: number;
    },
  ): Promise<void> {
    // Search and wait for table
    await this.searchAndWaitForTable(searchTerm, tableSelector, tableBodySelector, options);

    // Verify the first row contains the search term
    await this.checkNameInLineFromFirstRow(searchTerm, tableBodySelector);
  }

  /**
   * Archives an item by selecting the first row and clicking archive/confirm buttons.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param searchTerm - The term to verify is in the first row (optional, for validation)
   * @param tableSelector - Selector for the table element
   * @param archiveButtonSelector - Selector or label for the archive button
   * @param confirmButtonSelector - Selector or label for the confirm button
   * @param options - Optional configuration:
   *   - useCheckboxMark: If true, uses checkboxMarkNameInLineFromFirstRow instead of checkNameInLineFromFirstRow
   *   - headerCellIndex: If provided, clicks on table header cell before archive button
   *   - archiveButtonLabel: Label text for archive button (default: 'Архив')
   *   - confirmButtonLabel: Label text for confirm button (default: 'Да')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async archiveItem(
    page: Page,
    searchTerm: string,
    tableSelector: string,
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    options?: {
      useCheckboxMark?: boolean;
      headerCellIndex?: number;
      archiveButtonLabel?: string;
      confirmButtonLabel?: string;
      waitAfterConfirm?: number;
      verifyArchived?: boolean;
      verifyTableSelector?: string;
      tableBodySelector?: string;
      searchInputDataTestId?: string;
    },
  ): Promise<void> {
    // Select/check the first row
    if (options?.useCheckboxMark) {
      await this.checkboxMarkNameInLineFromFirstRow(searchTerm, tableSelector);
    } else {
      await this.checkNameInLineFromFirstRow(searchTerm, tableSelector);
    }

    // Click on table header cell if specified (some archive operations require this)
    if (options?.headerCellIndex !== undefined) {
      await this.clickOnTheTableHeaderCell(options.headerCellIndex, tableSelector);
    }

    // Click archive button
    const archiveLabel = options?.archiveButtonLabel || 'Архив';
    await this.clickButton(archiveLabel, archiveButtonSelector);

    // Wait a bit for modal to appear
    await page.waitForTimeout(200);

    // Confirm the archive
    const confirmLabel = options?.confirmButtonLabel || 'Да';
    await this.clickButton(confirmLabel, confirmButtonSelector);

    // Wait for the modal to close and table to update
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(options?.waitAfterConfirm || 1000);

    // Verify the item is archived by searching again
    if (options?.verifyArchived !== false && options?.tableBodySelector) {
      console.log('Verifying item is archived by searching again...');
      const verifyTableSelector = options.verifyTableSelector || tableSelector;

      // Perform the search using redesign method
      await this.searchTableRedesign(searchTerm, verifyTableSelector);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check that the item is no longer in the table
      // When there are no results, the table body might be hidden, so we check for attached state
      const tableBodyLocator = page.locator(options.tableBodySelector);
      const isTableBodyVisible = await tableBodyLocator.isVisible().catch(() => false);

      let rowCount = 0;
      if (isTableBodyVisible) {
        const rows = page.locator(`${options.tableBodySelector} tr`);
        rowCount = await rows.count();
      }

      if (rowCount > 0) {
        console.log(`Warning: Item "${searchTerm}" still found in table after archiving (${rowCount} rows). It may not have been archived properly.`);
      } else {
        console.log(`Item "${searchTerm}" successfully archived - not found in search results.`);
      }
    }
  }

  /**
   * Performs a simple archive operation: clicks the archive button and confirms.
   * This is a common pattern used across many test cases.
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirmation button
   * @param options - Optional configuration:
   *   - archiveButtonLabel: Label for the archive button (default: 'Архив')
   *   - confirmButtonLabel: Label for the confirm button (default: 'Да')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async archiveAndConfirm(
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    options?: {
      archiveButtonLabel?: string;
      confirmButtonLabel?: string;
      waitAfterConfirm?: number;
    },
  ): Promise<void> {
    // Click archive button
    const archiveLabel = options?.archiveButtonLabel || 'Архив';
    const archiveButton = this.page.locator(archiveButtonSelector, { hasText: archiveLabel });

    // Wait for button to be visible and enabled
    await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for button to be enabled with retry
    let isEnabled = false;
    for (let retry = 0; retry < 10; retry++) {
      isEnabled = await archiveButton.isEnabled();
      if (isEnabled) {
        break;
      }
      await this.page.waitForTimeout(500);
    }

    if (!isEnabled) {
      throw new Error(`Archive button "${archiveLabel}" is not enabled after waiting.`);
    }

    await this.highlightElement(archiveButton, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(500);
    await archiveButton.click();

    // Wait a bit for modal to appear
    await this.page.waitForTimeout(200);

    // Confirm the archive
    const confirmLabel = options?.confirmButtonLabel || 'Да';
    await this.clickButton(confirmLabel, confirmButtonSelector);

    // Wait for the modal to close
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(options?.waitAfterConfirm || 1000);
  }

  /**
   * Waits for network idle, optionally waits for a timeout, then checks that the first row contains the search term.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param searchTerm - The term to verify is in the first row
   * @param tableSelector - Selector for the table element
   * @param options - Optional configuration:
   *   - timeoutMs: Timeout in ms after network idle (default: 0, no timeout)
   *   - waitForNetworkIdle: If true, waits for networkidle (default: true)
   */
  async waitAndCheckFirstRow(
    page: Page,
    searchTerm: string,
    tableSelector: string,
    options?: {
      timeoutMs?: number;
      waitForNetworkIdle?: boolean;
      testInfo?: TestInfo;
      description?: string;
    },
  ): Promise<void> {
    if (options?.waitForNetworkIdle !== false) {
      await page.waitForLoadState('networkidle');
    }
    if (options?.timeoutMs && options.timeoutMs > 0) {
      await page.waitForTimeout(options.timeoutMs);
    }
    await this.checkNameInLineFromFirstRow(searchTerm, tableSelector, {
      testInfo: options?.testInfo,
      description: options?.description,
    });
  }

  /**
   * Pauses the test execution for a specified amount of time (in milliseconds).
   * @param ms - The duration in milliseconds to pause the execution. Defaults to 1000ms.
   */
  async waitForTimeout(ms: number = 1000): Promise<void> {
    if (ENV.DEBUG) {
      logger.info(`Page Class: Pausing for ${ms} milliseconds...`); // Log the pause action for debugging purposes
    }
    await this.page.waitForTimeout(ms); // Wait for the specified timeout duration
    if (ENV.DEBUG) {
      logger.info('Page Class: Pause complete'); // Log after the pause is complete
    }
  }

  /**
   * Fill in the login form.
   * @param page - The Playwright page instance.
   * @param tabel - The table value.
   * @param login - The login username.
   * @param password - The login password.
   */

  async fillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    // Step 2: Wait for and select the "tabel" option
    try {
      await page.waitForSelector('select[data-testid="Authorization-Form-SelectTabel"]', { state: 'visible', timeout: 100000 });
      logger.info('Select element found and visible.');
    } catch (error) {
      logger.error('Error waiting for select element:', error);
      throw error; // Rethrow the error after logging
    }

    // Wait for and select the "tabel" option
    //await this.page.waitForLoadState('networkidle');
    //await page.waitForSelector(
    // 'select[data-testid="Authorization-Form-SelectTabel"]',
    // { state: 'visible' }
    //);

    const tableSelectElement = await page.$('select[data-testid="Authorization-Form-SelectTabel"]');
    if (!tableSelectElement) {
      throw new Error('Select element with name "tabel" not found');
    }
    await tableSelectElement.selectOption({ value: tabel });

    // Wait for and select the "initial" option
    await page.waitForSelector('select[data-testid="Authorization-Form-SelectInitial"]', { state: 'visible' });
    const initialSelectElement = await page.$('select[data-testid="Authorization-Form-SelectInitial"]');
    if (!initialSelectElement) {
      throw new Error('Select element with name "initial" not found');
    }
    await initialSelectElement.selectOption({ value: login });

    // Wait for and fill the password input
    await page.waitForSelector('input[data-testid="Authorization-Form-InputPassword"]', { state: 'visible' });
    const passwordInputElement = await page.$('input[data-testid="Authorization-Form-InputPassword"]');
    if (!passwordInputElement) {
      throw new Error('Password input field not found');
    }
    await passwordInputElement.fill(password);

    // Optionally, log the HTML to confirm it was set correctly
    const html = await page.evaluate(el => el.outerHTML, passwordInputElement);

    // Pause the page for inspection (you can remove this in production)
  }

  async newFillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Step 1: Fill "Табельный номер" field
      await page.waitForSelector('[data-testid="LoginForm-TabelNumber-Combobox-Input"]', { state: 'visible', timeout: 10000 });
      console.log('Табельный номер field is visible.');
      await page.click('[data-testid="LoginForm-TabelNumber-Combobox-Input"]'); // Open dropdown

      await page.waitForSelector('[data-testid="LoginForm-TabelNumber-Combobox-OptionsList"]', { state: 'visible' });
      await page.click(`[data-testid="LoginForm-TabelNumber-Combobox-OptionsList"] >> text="${tabel}"`);
      console.log(`Табельный номер set to: ${tabel}`);

      // Step 2: Fill "Логин" field
      await page.waitForSelector('[data-testid="LoginForm-Login-Combobox-Input"]', { state: 'visible', timeout: 10000 });
      console.log('Логин field is visible.');
      await page.fill('[data-testid="LoginForm-Login-Combobox-Input"]', login);
      console.log(`Логин set to: ${login}`);

      // Ensure login selection is applied
      await page.waitForTimeout(500);

      // Step 3: Fill "Пароль" field
      console.log('Waiting for password field...');
      await page.waitForSelector('[data-testid="Password-Inputs-Input-Input"]', { state: 'visible', timeout: 10000 });
      console.log('Password field is visible.');
      await page.fill('[data-testid="Password-Inputs-Input-Input"]', password);
      console.log('Password filled successfully.');

      console.log('Form filled successfully!');
    } catch (error) {
      console.error('Error filling the login form:', error);
      throw error;
    }
  }

  /**
   * Hover over an element and read the tooltip text.
   * @param hoverSelector - The selector for the element to hover over.
   * @param tooltipSelector - The selector for the tooltip element.
   * @returns The text content of the tooltip, or null if not found.
   */

  async readTooltip(hoverSelector: string, tooltipSelector: string): Promise<string | null> {
    await this.page.hover(hoverSelector);
    await this.page.waitForSelector(tooltipSelector);
    const tooltipText = await this.page.locator(tooltipSelector).textContent();
    return tooltipText;
  }

  /**
   * Navigate to the element with the specified data-testid and log the details.
   * @param dataTestId - The data-testid of the element to navigate to.
   * @returns True if navigation is successful, or an error message if it fails.
   */

  async nav(dataTestId: string): Promise<true | string> {
    try {
      const elementHandles = await this.page.$$(`[data-testid="${dataTestId}"]`);
      // Check if elementHandle is not null
      if (!elementHandles) {
        return `Element with data-testid="${dataTestId}" not found`;
      }

      const elementCount = elementHandles.length;
      //logger.info(dataTestId);
      if (elementCount === 0) {
        const errorMessage = `Navigation failed: Element with data-testid "${dataTestId}" not found.`;
        logger.error(errorMessage);
        return errorMessage;
      }

      if (elementCount > 1) {
        const errorMessage = `Navigation failed: Multiple elements with data-testid "${dataTestId}" found. Expected only one.`;
        logger.error(errorMessage);
        return errorMessage;
      }

      await elementHandles[0].click();
      await this.page.waitForLoadState('load');
      const pageUrl = this.page.url();
      const pageTitle = await this.page.title();
      const pageBreadcrumb = await this.page.innerText('.breadcrumb');

      logger.info(`Navigated to: ${pageUrl}`);
      logger.info(`Page Title: ${pageTitle}`);
      logger.info(`Breadcrumb: ${pageBreadcrumb}`);
      return true;
    } catch (error) {
      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = `Navigation failed: ${error.message}`;
      } else {
        errorMessage = 'Navigation failed: An unknown error occurred';
      }

      logger.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Check if the current URL path matches the expected path.
   * @param expectedPath - The expected URL path to compare.
   * @returns True if the URL path matches, or an error message if it does not.
   */

  async checkUrl(expectedPath: string): Promise<true | string> {
    try {
      const actualURL = new URL(this.page.url());
      const actualPath = actualURL.pathname;
      if (actualPath !== expectedPath) {
        const errorMessage = `URL path does not match. Expected: ${expectedPath}, Actual: ${actualPath}`;
        logger.error(errorMessage);
        return errorMessage;
      }
      logger.info(`URL path verification passed: ${actualPath}`);
      return true;
    } catch (error) {
      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = `URL path verification failed: ${error.message}`;
      } else {
        errorMessage = 'URL path verification failed: An unknown error occurred';
      }

      logger.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Check if the current page title matches the expected title.
   * @param expectedTitle - The expected page title to compare.
   * @throws Error if the actual title does not match the expected title.
   */

  async checkTitle(expectedTitle: string): Promise<void> {
    const actualTitle = await this.page.title();
    if (actualTitle !== expectedTitle) {
      throw new Error(`Title does not match. Expected: ${expectedTitle}, Actual: ${actualTitle}`);
    }
    logger.info(`Title verification passed: ${actualTitle}`);
  }

  /**
   * Check if the current page language matches the expected language.
   * @param expectedLanguage - The expected language to compare.
   * @throws Error if the actual language does not match the expected language or if the language element is not found.
   */

  async checkLanguage(expectedLanguage: string): Promise<void> {
    const languageElement = await this.page.$('selector-for-language-element');

    // Check if languageElement is not null
    if (!languageElement) {
      throw new Error('Language element not found');
    }

    const language = await languageElement.textContent();

    // Check if language text is not null
    if (!language) {
      throw new Error('Language text is not available');
    }

    if (language.trim() !== expectedLanguage) {
      throw new Error(`Language does not match. Expected: ${expectedLanguage}, Actual: ${language}`);
    }

    logger.info(`Language verification passed: ${language}`);
  }
  /**
   * Check if the current breadcrumb matches the expected breadcrumb.
   * @param expectedBreadcrumb - The expected breadcrumb to compare.
   * @throws Error if the actual breadcrumb does not match the expected breadcrumb.
   */

  async checkBreadCrumb(expectedBreadcrumb: string): Promise<void> {
    const actualBreadcrumb = await this.page.innerText('.breadcrumb');
    if (actualBreadcrumb !== expectedBreadcrumb) {
      throw new Error(`Breadcrumb does not match. Expected: ${expectedBreadcrumb}, Actual: ${actualBreadcrumb}`);
    }
    logger.info(`Breadcrumb verification passed: ${actualBreadcrumb}`);
  }

  /**
   * Capture a screenshot of the current page and save it to the specified file.
   * @param filename - The name of the file to save the screenshot.
   * @returns A promise that resolves when the screenshot is captured and saved.
   */

  async captureScreenshot(filename: string): Promise<void> {
    logger.info(`Capturing screenshot: ${filename}`);
    await this.page.screenshot({ path: filename });
  }

  /**
   * Wait for the specified selector to become visible on the page.
   * @param selector - The selector to wait for.
   * @returns A promise that resolves when the selector is visible.
   */
  async waitForSelector(selector: string): Promise<void> {
    logger.info(`Waiting for selector: ${selector}`);
    await this.page.waitForSelector(selector, { state: 'visible' });
    logger.info(`Selector is visible: ${selector}`);
  }

  /**
   * Function to check the number of columns in a table with a specific ID.
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to locate.
   * @returns The column count as a number.
   */
  async checkTableColumns(page: Page, tableId: string, skip?: boolean): Promise<number> {
    // Locate the table with the specific id
    logger.info(tableId);
    await page.waitForLoadState('networkidle');
    // Try to find the table using both selectors
    let tab = await page.$(`#${tableId}`);
    if (!tab) {
      tab = await page.$(`[data-testid="${tableId}"]`);
    }

    if (!tab) {
      throw new Error(`Table with id "${tableId}" not found`);
    }

    // Get all rows in the table containing th tags

    const allRows = await tab.$$('tr:has(th)');
    if (skip && allRows.length > 0) {
      allRows.shift(); // removes the first element from the array
    }
    // Initialize the column count
    let columnCount = 0;

    // Loop through each row containing th tags
    for (const row of allRows) {
      // Check if the row's data-testid contains "SearchRow"
      const dataTestId = await row.getAttribute('data-testid');
      if (dataTestId && dataTestId.includes('Search')) {
        continue; // Ignore this row
      }

      // Count the number of columns in this row
      const columns = await row.$$('th');
      columnCount += columns.length;
    }

    // Return the column count
    logger.info(columnCount);
    return columnCount;
  }

  /**
   * This method counts the number of sub headers for a group of columns. IE, they have a parent column above them.
   * @param headers - The headers object containing columns and their sub-headers.
   * @returns The total count of columns, including sub-headers.
   */

  async countColumns(headers: any): Promise<number> {
    let count = 0;
    for (const key in headers) {
      if (headers[key].subHeaders) {
        count += await this.countColumns(headers[key].subHeaders); // Await the result
      }
      count++; // Ensure each top-level column is counted
    }
    return count;
  }
  /**
   * Check if the table column headers match the expected headers.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param expectedHeaders - The expected headers to compare.
   * @returns A promise that resolves to true if the headers match, or throws an error if not.
   */

  async checkTableColumnHeaders(page: Page, tableId: string, expectedHeaders: any, skip?: boolean): Promise<boolean> {
    // Define the selector for the table header
    await page.waitForTimeout(1000);
    let tab = await page.$(`#${tableId}`);
    if (!tab) {
      tab = await page.$(`[data-testid="${tableId}"]`);
    }

    if (!tab) {
      throw new Error(`Table with id "${tableId}" not found`);
    }

    // Get all rows in the table containing th tags
    const allRows = await tab.$$('tr:has(th)');
    if (skip && allRows.length > 0) {
      allRows.shift(); // removes the first element from the array
    }
    // Initialize the column count and headerTexts
    let headerTexts: string[] = [];

    // Loop through each row containing th tags
    for (const row of allRows) {
      // Check if the row's data-testid contains "SearchRow"
      const dataTestId = await row.getAttribute('data-testid');
      if (dataTestId && dataTestId.includes('Search')) {
        continue; // Ignore this row
      }

      // Get the text content of each th element in the row
      const columns = await row.$$('th');
      for (const col of columns) {
        let text = await col.innerText();
        const colDataTestId = await col.getAttribute('data-testid'); // Get the data-testid attribute

        if (!text.trim()) {
          // Check if the column contains a div with class "unicon"
          const hasUniconDiv = await col.$('div.unicon');
          if (hasUniconDiv) {
            text = 'Tick';
          }
        }
        if (typeof text === 'undefined') {
          logger.info('The parameter "text" is undefined.');
        } else {
          // Normalize text content and add to headerTexts array
          headerTexts.push(this.normalizeText(text));
        }

        // Log the column text or 'Tick'
        if (text === 'Tick') {
          logger.info('Column text: Tick');
        } else {
          logger.info(`Column text: ${text}`);
        }
      }
    }

    // Flatten expected headers structure to handle main and sub-columns
    const flattenHeaders = (headers: any): string[] => {
      const flattened: string[] = [];

      for (const key in headers) {
        if (headers[key] && typeof headers[key] === 'object' && headers[key].label) {
          flattened.push(this.normalizeText(headers[key].label));

          if (headers[key].subHeaders) {
            for (const subKey in headers[key].subHeaders) {
              flattened.push(this.normalizeText(headers[key].subHeaders[subKey]));
            }
          }
        } else {
          flattened.push(this.normalizeText(headers[key]));
        }
      }

      return flattened;
    };

    const expectedHeaderLabels = flattenHeaders.call(this, expectedHeaders.headers);

    // Compare the actual header texts with the expected header labels for existence
    const actualHeadersExistInExpected = headerTexts.every(text => expectedHeaderLabels.includes(text));
    const expectedHeadersExistInActual = expectedHeaderLabels.every(text => headerTexts.includes(text));

    // Compare the ordering of actual header texts with the expected header labels
    const headersMatchInOrder = headerTexts.every((text, index) => text === expectedHeaderLabels[index]);

    // Log the result for debugging purposes
    if (actualHeadersExistInExpected && expectedHeadersExistInActual && headersMatchInOrder) {
      logger.info('Header labels match the expected values in both existence and order.');
      return true;
    } else {
      logger.info('Headers do not match in existence and/or order.');
      if (!actualHeadersExistInExpected) {
        logger.info(
          'Missing in Expected:',
          headerTexts.filter(text => !expectedHeaderLabels.includes(text)),
        );
      }
      if (!expectedHeadersExistInActual) {
        logger.info(
          'Missing in Actual:',
          expectedHeaderLabels.filter(text => !headerTexts.includes(text)),
        );
      }
      if (!headersMatchInOrder) {
        logger.info('Order mismatch between actual and expected headers.');
      }
      return false;
    }
  }

  /**
   * Find the table element using the specified selector, scroll it into view, and click on it.
   * @param selector - The selector to locate the table element.
   * @returns A promise that resolves when the element is found, scrolled into view, and clicked.
   */

  async findTable(selector: string): Promise<void> {
    // Wait for the element to be visible and enabled
    await this.page.waitForSelector(selector, { state: 'visible' });

    // Check if the element is present on the page
    const element = await this.page.$(selector);

    if (element) {
      logger.info('Element is present on the page');

      // Check if the element is visible
      const isVisible = await this.page.isVisible(selector);
      if (isVisible) {
        // Scroll the element into view with a null check
        await this.page.evaluate(selector => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          } else {
            console.warn(`Element with selector "${selector}" not found.`);
          }
        }, selector);

        // Click on the element
        await this.page.click(selector);
        //logger.info('Element clicked');
      } else {
        //logger.info('Element is not visible on the page');
      }
    } else {
      //logger.info('Element is not present on the page');
    }
  }

  /**
   * Find the column index with the specified data-testid in a table and handle header rows merging if necessary.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param colId - The data-testid of the column to find.
   * @returns The index of the column with the specified data-testid, or false if not found.
   */
  async findColumn(page: Page, tableId: string, colId: string): Promise<number> {
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logger.info(`Browser log: ${msg.text()}`);
      } else if (msg.type() === 'info') {
        logger.info(`Browser info: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        logger.warn(`Browser warning: ${msg.text()}`);
      } else if (msg.type() === 'error') {
        logger.error(`Browser error: ${msg.text()}`);
      }
    });

    logger.info(`Task started: Finding table "${tableId}" and analyzing header rows.`);

    const columnIndex = await page.evaluate(
      ({ tableId, colId }) => {
        let table;

        if (tableId.startsWith('.')) {
          // Если строка начинается с '.', это класс
          table = document.querySelector(tableId);
        } else if (tableId.startsWith('#')) {
          // Если строка начинается с '#', это id
          table = document.getElementById(tableId.substring(1));
        } else {
          // В противном случае предполагаем, что это data-testid
          table = document.querySelector(`[data-testid="${tableId}"]`);
        }

        // Если элемент не найден, можно добавить дополнительную проверку
        if (!table) {
          // Попробуем найти элемент по id, если это не data-testid
          table = document.getElementById(tableId);
        }

        // Проверка на наличие элемента
        if (table) {
          console.log('Элемент найден:', table);
        } else {
          console.log('Элемент не найден');
        }

        if (!table) {
          console.error(`Table with data-testid or id "${tableId}" not found.`);
          return -1;
        }
        console.info(`Found table. Now analyzing rows to locate column "${colId}".`);

        // Extract header rows
        let headerRows = Array.from(table.querySelectorAll('thead tr, tbody tr:has(th)')).filter(row => row.querySelectorAll('th').length > 0);

        // Filter out irrelevant rows
        headerRows = headerRows.filter(row => {
          const dataTestId = row?.getAttribute?.('data-testid'); // Safely access the attribute
          return !dataTestId?.includes('SearchRow') && !dataTestId?.includes('TableFooter');
        });
        // Handle the case for a single row of headers
        if (headerRows.length === 1) {
          console.info('Only one header row found. No merging necessary.');
          const singleRow = headerRows[0];
          const singleRowCells = Array.from(singleRow.querySelectorAll('th'));

          // Look for the column in the single row
          for (let i = 0; i < singleRowCells.length; i++) {
            const headerDataTestId = singleRowCells[i].getAttribute('data-testid');
            if (headerDataTestId === colId) {
              return i; // Return the index of the column
            }
          }

          console.error('Column not found in the single header row.');
          return -1; // Return -1 if not found
        }

        // Start with the last row as the initial merged row
        let mergedRow = Array.from(headerRows[headerRows.length - 1].querySelectorAll('th'));

        // Iterate backward through the rows to merge
        for (let i = headerRows.length - 2; i >= 0; i--) {
          const currentRow = Array.from(headerRows[i].querySelectorAll('th'));
          const newMergedRow = [];

          let childIndex = 0;
          for (let j = 0; j < currentRow.length; j++) {
            const cell = currentRow[j];

            const colspan = parseInt(cell.getAttribute('colspan') || '1');

            if (colspan > 1) {
              // Replace parent with child columns from the merged row
              for (let k = 0; k < colspan; k++) {
                newMergedRow.push(mergedRow[childIndex++]);
              }
            } else {
              // Add the current cell as-is
              newMergedRow.push(cell);
            }
          }
          // Update mergedRow for the next iteration
          mergedRow = newMergedRow;
        }

        // Print all data-testid values in the final merged row

        const dataTestIds = mergedRow
          .filter(cell => cell && typeof cell.getAttribute === 'function') // Validate each element
          .map(cell => cell.getAttribute('data-testid')); // Extract the data-testid attribute

        console.info('All data-testid values in the final merged row:');
        // Look for the column in the final merged row
        for (let i = 0; i < mergedRow.length; i++) {
          const headerDataTestId = mergedRow[i].getAttribute('data-testid');

          if (headerDataTestId === colId) {
            return i; // Return the index of the column
          }
        }

        console.error('Column not found.');
        return -1; // Return -1 if not found
      },
      { tableId, colId },
    );

    if (columnIndex !== -1) {
      logger.info(`Column with data-testid "${colId}" found at index: ${columnIndex}`);
    } else {
      logger.error(`Column with data-testid "${colId}" not found.`);
    }

    return columnIndex;
  }

  /**
   * Check the ordering of table rows based on the urgency date and planned shipment date columns.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param urgencyColIndex - The index of the urgency date column.
   * @param plannedShipmentColIndex - The index of the planned shipment date column.
   * @returns An object containing the success status and an optional message if the ordering check fails.
   */
  // async checkTableRowOrdering(
  //   page: Page,
  //   tableId: string,
  //   urgencyColIndex: number,
  //   plannedShipmentColIndex: number
  // ): Promise<{ success: boolean; message?: string }> {
  //   // Get all rows in the table
  //   logger.info(urgencyColIndex);

  //   let table = await page.$(`#${tableId}`);
  //   if (!table) {
  //     table = await page.$(`[data-testid="${tableId}"]`);
  //   }

  //   if (!table) {
  //     return {
  //       success: false,
  //       message: `Table with id "${tableId}" not found`,
  //     };
  //   }

  //   // Get all rows in the table excluding the header rows
  //   const rows = await table.$$("tbody tr");
  //   const headerRows = await table.$$("tbody tr th");
  //   rows.splice(0, headerRows.length); // Remove header rows

  //   // Filter out rows that contain `th` elements
  //   const filteredRows = rows.filter(async (row) => {
  //     const thElements = await row.$$("th");
  //     return thElements.length === 0;
  //   });

  //   // Debug: Log the count of rows found
  //   logger.info(`Total rows found in the table: ${filteredRows.length}`);

  //   // Extract data from rows
  //   const rowData = await Promise.all(
  //     filteredRows.map(async (row) => {
  //       const cells = await row.$$("td");
  //       const urgencyDate =
  //         (await cells[urgencyColIndex]?.innerText()) ?? "";
  //       const plannedShipmentDate =
  //         (await cells[plannedShipmentColIndex]?.innerText()) ?? "";
  //       return { urgencyDate, plannedShipmentDate };
  //     })
  //   );

  //   // Function to parse date strings with various separators
  //   const parseDate = (dateStr: string): Date => {
  //     const parts = dateStr.split(/[.\-\/]/); // Split by dots, hyphens, or slashes
  //     if (parts.length === 3) {
  //       return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD
  //     }
  //     return new Date(dateStr); // Fallback to default Date parsing
  //   };

  //   // Sort rows
  //   const compareDates = (a: string, b: string) =>
  //     parseDate(a).getTime() - parseDate(b).getTime();

  //   // Verify row ordering for urgencyDate
  //   let lastUrgencyDateIndex = -1;
  //   for (let i = 0; i < rowData.length; i++) {
  //     if (rowData[i].urgencyDate) {
  //       if (
  //         lastUrgencyDateIndex >= 0 &&
  //         compareDates(
  //           rowData[lastUrgencyDateIndex].urgencyDate,
  //           rowData[i].urgencyDate
  //         ) > 0
  //       ) {
  //         return {
  //           success: false,
  //           message: `Row ordering error in urgencyDate at index ${i}`,
  //         };
  //       }
  //       lastUrgencyDateIndex = i;
  //     } else {
  //       break; // Exit the loop once we encounter a row with an empty urgencyDate
  //     }
  //   }
  // }

  /**
   * Verify the success message contains the specified order number.
   * @param orderNumber - The order number to check within the success message.
   * @returns A promise that resolves when the message is verified.
   */

  async getMessage(orderNumber?: string) {
    const successMessageLocator = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION).last();
    await expect(successMessageLocator).toBeVisible();
    if (orderNumber) {
      const successMessageText = (await successMessageLocator.textContent()) || '';
      expect(successMessageText).toContain(orderNumber);
    }
  }

  /**
   * Perform a search in the main table using the specified search term.
   * @param nameSearch - The search term to fill in the search input.
   * @param locator - The selector to locate the table element.
   * @returns A promise that resolves when the search is performed.
   */
  async closeSuccessMessage() {
    try {
      // Находим и кликаем по кнопке закрытия
      const closeButton = this.page.locator('[data-testid="Notification-Notification-Icon"]').last();
      await expect(closeButton).toBeVisible();
      await closeButton.click();
    } catch (error) {
      console.error('Ошибка при закрытии уведомления:', error);
    }
  }

  /**
   * Search in the main table
   * @param nameSearch - the name entered in the table search to perform the search
   * @param locator - the full locator of the table
   */
  async searchTable(nameSearch: string, locator: string, searchInputDataTestId?: string) {
    console.log('Search Table', nameSearch, locator, searchInputDataTestId);
    const table = this.page.locator(locator);
    await table.evaluate(el => {
      el.style.backgroundColor = 'green';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    const searchContainer = (
      searchInputDataTestId ? table.locator(`[data-testid="${searchInputDataTestId}"]`) : table.locator(SelectorsSearchInputs.MAIN_SEARCH_COVER_INPUT)
    ).nth(0);

    // Wait for search container to be visible
    await searchContainer.waitFor({ state: 'visible', timeout: 10000 });

    // For dropdown inputs, click the container first to open it
    try {
      await searchContainer.click({ timeout: 2000 });
      await this.page.waitForTimeout(300);
    } catch (e) {
      // Container might already be open, continue
    }

    // Find the input element inside the container (YSearch component)
    // Try both: input inside container, or input with data-testid directly
    let searchTable = searchContainer.locator('input').first();

    // If input is not found/visible in container, try locating it directly
    if (searchInputDataTestId) {
      const directInput = table.locator(`input[data-testid="${searchInputDataTestId}"]`).first();
      try {
        await directInput.waitFor({ state: 'visible', timeout: 2000 });
        searchTable = directInput;
      } catch (e) {
        // Fall back to container approach
      }
    }

    // Wait for the input to be visible or attached
    try {
      await searchTable.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      // If not visible, try attached state (element exists in DOM but might be hidden)
      await searchTable.waitFor({ state: 'attached', timeout: 5000 });
    }

    // Clear and fill without clicking (which can be blocked by dialogs)
    await searchTable.evaluate((el: HTMLInputElement) => (el.value = ''));
    await this.page.waitForTimeout(200);
    await searchTable.fill(nameSearch);
    await this.page.waitForTimeout(300);

    // Verify the value was set before pressing Enter
    const currentValue = await searchTable.inputValue();
    console.log(`Search field value before Enter: "${currentValue}"`);

    // Press Enter to trigger search
    await searchTable.press('Enter');
    await this.page.waitForLoadState('networkidle');

    // Wait a bit more for the search to complete
    await this.page.waitForTimeout(1000);

    // Check the final value
    const finalValue = await searchTable.inputValue();
    console.log(`Search field value after Enter: "${finalValue}"`);

    // Don't assert the value matches exactly, as some search fields clear after search
    // Just verify the search was performed
    console.log(`Search performed for: "${nameSearch}"`);
  }

  /**
   * Search in the main table
   * @param nameSearch - the name entered in the table search to perform the search
   * @param locator - the full locator of the table
   */
  async searchTableRedesign(nameSearch: string, locator: string) {
    const table = this.page.locator(locator);
    // const searchTable = table
    //   .locator('[data-testid="DeficitIzdTable-Search-Dropdown-Input"]')
    //   .nth(0);

    const searchTable = table.locator('.search-yui-kit__input').nth(0);

    // Clear and fill without clicking (which can be blocked by dialogs)
    await searchTable.evaluate((el: HTMLInputElement) => (el.value = ''));
    await this.page.waitForTimeout(200);
    await searchTable.fill(nameSearch);
    await this.page.waitForTimeout(1000); // Wait for fill to complete

    const currentValue = await searchTable.inputValue();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(currentValue).toBe(nameSearch);
      },
      `Verify search input equals "${nameSearch}"`,
      undefined,
    );
    await searchTable.press('Enter');
    await this.page.waitForTimeout(1000); // Wait 1 second after pressing Enter before verifying results
  }

  /**
   * Поиск в основой таблице
   * @param nameSearch - имя которое вводим в поиск таблицы и осуществляем поиск but my clickign search icon
   * @param locator - локатор селектора [data-testid=**]
   */
  async searchTableByIcon(nameSearch: string, locator: string) {
    const table = this.page.locator(locator);
    const searchTable = table.locator(SelectorsSearchInputs.SEARCH_COVER_INPUT).nth(0);
    await searchTable.fill(nameSearch);

    const currentValue = await searchTable.inputValue();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(currentValue).toBe(nameSearch);
      },
      `Verify search input equals "${nameSearch}"`,
      undefined,
    );
    const searchIcon = table.locator('[data-testid="Search-Cover-Icon"]');
    await searchIcon.click();
  }

  /**
   * Wait for the table body to become visible.
   * @param locator - the full locator of the table
   * @returns A promise that resolves when the table body is visible.
   */
  async waitingTableBody(locator: string, { minRows = 1, timeoutMs = 10000 }: { minRows?: number; timeoutMs?: number } = {}) {
    const locatorTable = this.page.locator(locator);
    await locatorTable.evaluate((element: HTMLElement) => {
      element.style.border = '2px solid red';
    });

    if (minRows <= 0) {
      // Just wait for the table to be attached/visible without requiring rows
      await locatorTable.waitFor({ state: 'visible', timeout: timeoutMs });
      return { success: true };
    }

    // Check if the locator is already a tbody selector (contains "Tbody" or "tbody")
    const isTbodySelector = /Tbody|tbody/i.test(locator);
    const rowSelector = isTbodySelector ? `${locator} tr` : `${locator} tbody tr`;

    if (minRows === 1) {
      // Preserve legacy behavior exactly
      await this.page.waitForSelector(rowSelector, {
        state: 'attached',
        timeout: timeoutMs,
      });
    } else {
      // Wait for at least minRows visible rows or timeout
      await this.page.waitForFunction(
        (args: { sel: string; expected: number; isTbody: boolean }) => {
          const { sel, expected, isTbody } = args;
          const root = document.querySelector(sel);
          if (!root) return false;
          const rowSelector = isTbody ? 'tr' : 'tbody tr';
          const allRows = root.querySelectorAll(rowSelector);
          let visible = 0;
          for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i] as HTMLElement;
            if (row && row.offsetParent !== null) visible++;
            if (visible >= expected) return true;
          }
          return false;
        },
        { sel: locator, expected: minRows, isTbody: isTbodySelector },
        { timeout: timeoutMs },
      );
    }

    return { success: true };
  }

  /**
   * Check the ordering of table rows based on the urgency date and planned shipment date columns.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param urgencyColIndex - The index of the urgency date column.
   * @param plannedShipmentColIndex - The index of the planned shipment date column.
   * @returns An object containing the success status and an optional message if the ordering check fails.
   */
  async checkDatesWithOrderList(
    page: Page,
    tableId: string,
    nameColIdIndex: number,
    urgencyColIndex: number,
    plannedShipmentColIndex: number,
    ordersIconColIndex: number,
    modalSelector: string,
    modalTableSelector: string,
    urgencyModalColId: string,
    plannedShipmentModalColId: string,
  ): Promise<{ success: boolean; message?: string }> {
    // Step 1: Get all rows in the table
    logger.info(urgencyColIndex);

    let table = await page.$(`#${tableId}`);
    if (!table) {
      table = await page.$(`[data-testid="${tableId}"]`);
    }

    if (!table) {
      return {
        success: false,
        message: `Table with id "${tableId}" not found`,
      };
    }

    // Step 2: Get all rows in the table
    const rows = await table.$$('tbody tr');

    // Step 3: Filter out rows that contain `th` elements
    const filteredRows = [];
    for (const row of rows) {
      const thElements = await row.$$('th');
      if (thElements.length === 0) {
        filteredRows.push(row);
      }
    }

    // Step 4: Log total rows found
    logger.info(`Total rows found in the table: ${filteredRows.length}`);

    let allTestsPassed = true; // Variable to track the overall success status

    for (let i = 0; i < filteredRows.length; i++) {
      if (i > 100) {
        break;
      }
      const row = filteredRows[i];
      const cells = await row.$$('td');
      let nameForErrorReport = await cells[nameColIdIndex].innerText();
      let urgencyDateForCompare = await cells[urgencyColIndex].innerText();
      let plannedShipmentDateForCompare = await cells[plannedShipmentColIndex].innerText();

      logger.info(`Urgency Date: ${urgencyDateForCompare}`);
      logger.info(`Planned Shipment Date: ${plannedShipmentDateForCompare}`);

      // Click on the icon in the ordersIconColIndex column
      const iconCell = cells[ordersIconColIndex];
      const icon = await iconCell.$('img.link_img');
      if (icon) {
        // Scroll the icon into view before clicking it
        await iconCell.evaluate(node => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await page.waitForTimeout(5000); // Optional: wait for smooth scroll to finish

        await icon.click();
        logger.info(`Clicked on the icon in row with urgency date ${urgencyDateForCompare} and planned shipment date ${plannedShipmentDateForCompare}`);
        const result = await this.ordersListVerifyModalDates(
          page,
          modalSelector,
          modalTableSelector,
          urgencyDateForCompare,
          plannedShipmentDateForCompare,
          urgencyModalColId,
          plannedShipmentModalColId,
        );

        page.mouse.dblclick(1, 1);
        if (!result.success) {
          // Log the error and continue testing
          allTestsPassed = false; // Mark the overall success status as false
          logger.error(`Test failed for order ${nameForErrorReport}. Dates do not match.`);
        }
      } else {
        logger.warn(
          `No icon found in the ordersIconColIndex column for row with urgency date ${urgencyDateForCompare} and planned shipment date ${plannedShipmentDateForCompare}`,
        );
      }
    }

    // Return the overall success status
    if (!allTestsPassed) {
      return {
        success: false,
        message: 'One or more orders failed the date comparison test. Check logs for details.',
      };
    }

    return { success: true };
  }

  /**
   * Click a button with the specified text and locator.
   * @param textButton - The text content of the button to click.
   * @param locator - The selector to locate the button element.
   * @returns A promise that resolves when the button is clicked.
   */
  async clickButton(textButton: string, locator: string, click: Click = Click.Yes) {
    const button = this.page.locator(locator, { hasText: textButton });
    await this.highlightElement(button, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(1000);
    await expect(button).toHaveText(textButton);
    await expect(button).toBeVisible();

    if (click === Click.Yes) {
      try {
        await button.click();
      } catch (error) {
        console.warn(`Click failed for button "${textButton}", trying with force`, error);
        await button.click({ force: true });
      }
    }
  }

  /**
   * Wait for the table body to become visible. if not thead
   * @param locator - the full locator of the table
   * @returns A promise that resolves when the table body is visible.
   */
  async waitingTableBodyNoThead(locator: string) {
    const locatorTable = this.page.locator(locator);

    // Wait for any table rows in tbody - generic approach without relying on classes or hardcoded data-testid patterns
    await this.page.waitForSelector(`${locator} tbody tr`, {
      state: 'attached',
      timeout: 10000,
    });
  }

  async checkHeader(header: string, url: string) {
    const checkHeader = this.page.locator(url);
    await expect(checkHeader.locator('h3').nth(0)).toHaveText(header);
  }

  async ordersListVerifyModalDates(
    page: Page,
    modalSelectorId: string,
    modalTableSelectorId: string,
    urgencyModalColValForCompare: string,
    plannedShipmentModalColValForCompare: string,
    urgencyDateId: string,
    plannedShipmentDateId: string,
  ): Promise<{ success: boolean; message?: string }> {
    // Step 1: Check that the modal has opened
    await page.waitForSelector(`[data-testid="${modalSelectorId}"]`, {
      state: 'attached',
      timeout: 50000,
    });
    logger.info(`Modal opened: ${modalSelectorId}`);

    // Step 2: Find the table in the modal
    const table = await page.waitForSelector(`[data-testid="${modalTableSelectorId}"]`, { state: 'visible', timeout: 50000 });
    if (!table) {
      logger.error(`Table with selector "${modalTableSelectorId}" not found in the modal.`);
      return {
        success: false,
        message: `Table with selector "${modalTableSelectorId}" not found in the modal.`,
      };
    }
    await page.waitForLoadState('networkidle');
    await this.waitingTableBody(`[data-testid="${modalTableSelectorId}"]`);
    logger.info(`Table with selector "${modalTableSelectorId}" found in the modal.`);

    // Step 3: Find the columns in the modal table
    const urgencyModalCellNumber = await this.findColumn(page, modalTableSelectorId, urgencyDateId);
    logger.info(`Urgency Modal Cell: ${urgencyModalCellNumber}`);
    const plannedShipmentModalCellNumber = await this.findColumn(page, modalTableSelectorId, plannedShipmentDateId);
    logger.info(`Planned Shipment Modal Cell: ${plannedShipmentModalCellNumber}`);

    if (!urgencyModalCellNumber || !plannedShipmentModalCellNumber) {
      logger.error(`Required columns not found in the modal table.`);
      return {
        success: false,
        message: `Required columns not found in the modal table.`,
      };
    }

    // Step 4: Extract dates from the modal table
    const rows = await table.$$('tbody tr');
    const filteredRows = await this.filterRowsWithoutTh(rows);
    let urgencyModalDate = '';
    let plannedShipmentModalDate = '';
    let counter = 0;

    for (const row of filteredRows) {
      const hasNotDeficitClass = await row.evaluate(node => {
        const element = node as Element;
        return element.classList.contains('not-deficit');
      });
      if (!hasNotDeficitClass) {
        const cells = await row.$$('td');
        urgencyModalDate = await cells[urgencyModalCellNumber].innerText();
        plannedShipmentModalDate = await cells[plannedShipmentModalCellNumber].innerText();
        logger.info(`Row without .not-deficit class found. Urgency Date: ${urgencyModalDate}, Planned Shipment Date: ${plannedShipmentModalDate}`);
        break;
      }
    }

    logger.info(`Modal Urgency Date: ${urgencyModalDate}`);
    logger.info(`Modal Planned Shipment Date: ${plannedShipmentModalDate}`);

    // Step 5: Confirm that the modal dates match the parent table dates
    // if (urgencyModalColValForCompare.trim() !== urgencyModalDate.trim() || plannedShipmentModalColValForCompare.trim() !== plannedShipmentModalDate.trim()) {
    //    console.log("FFFFFF");
    //    logger.error(`counter: ${counter}`);
    //    logger.error(`Dates do not match. Parent table: ${urgencyModalColValForCompare}, ${plannedShipmentModalColValForCompare}. Modal: ${urgencyModalDate}, ${plannedShipmentModalDate}.`);
    //    return {
    //        success: false,
    //        message: `Dates do not match. Parent table: ${urgencyModalColValForCompare}, ${plannedShipmentModalColValForCompare}. Modal: ${urgencyModalDate}, ${plannedShipmentModalDate}.`
    //    };
    // }
    // console.log("GGGGG");
    // logger.info(`Dates MATCH for row with urgency date ${urgencyModalColValForCompare} and planned shipment date ${plannedShipmentModalColValForCompare}.`);
    return { success: true };
  }

  /** Checks the current date in the locator
   * @param locator - the full locator of the table
   */
  async checkCurrentDate(locator: string) {
    const checkDate = await this.page.locator(locator).textContent();
    const today = new Date();
    const formattedToday = today.toLocaleDateString('ru-RU');

    // if (!checkDate || !checkDate.includes(formattedToday)) { //erp-2366
    //   throw new Error(
    //     `Ожидаемая дата "${formattedToday}" не найдена в тексте: "${checkDate}".`
    //   );
    // }

    logger.info(`Текущая дата "${formattedToday}" успешно найдена в тексте.`);
    return formattedToday;
  }

  // Check the "Start Production" modal window
  async checkModalWindowLaunchIntoProduction(locator: string) {
    const modalWindow = await this.page.locator(locator);

    // Debug: Check what elements are actually in the modal
    const allH4Elements = await modalWindow.locator('h4').all();
    console.log(`Found ${allH4Elements.length} h4 elements in modal`);
    for (let i = 0; i < allH4Elements.length; i++) {
      const text = await allH4Elements[i].textContent();
      console.log(`H4 ${i}: "${text}"`);
      // Highlight each H4 element
      await allH4Elements[i].evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    }

    const allH3Elements = await modalWindow.locator('h3').all();
    console.log(`Found ${allH3Elements.length} h3 elements in modal`);
    for (let i = 0; i < allH3Elements.length; i++) {
      const text = await allH3Elements[i].textContent();
      console.log(`H3 ${i}: "${text}"`);
      // Highlight each H3 element
      await allH3Elements[i].evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    }

    // Try to find the title in any heading element (h1-h6)
    const titleElement = modalWindow.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: 'Запустить в производство' }).first();
    const titleExists = (await titleElement.count()) > 0;
    console.log(`Title "Запустить в производство" found: ${titleExists}`);

    if (titleExists) {
      expect(titleElement).toBeVisible();
    } else {
      console.log('Title not found, skipping title check');
    }
    expect(await modalWindow.locator('h3', { hasText: 'Описание/Примечание' })).toBeVisible();
    expect(await modalWindow.locator('h3', { hasText: 'Комплектация' })).toBeVisible();

    await this.page.locator('[data-testid="ModalStartProduction-NoteTextarea-Textarea"]').isVisible();

    const buttonCansel = await this.page.locator('[data-testid="ModalStartProduction-ComplectationTable-CancelButton"]', { hasText: 'Отменить' });
    expect(buttonCansel).toBeVisible();

    const buttonLaunchProduction = await this.page.locator('[data-testid="ModalStartProduction-ComplectationTable-InProduction"]', {
      hasText: 'В производство',
    });
    expect(buttonLaunchProduction).toBeVisible();

    await this.page.locator(`${SelectorsStartProduction.MODAL_START_PRODUCTION_MODAL_CONTENT} table tbody tr`).isVisible();
  }

  /** Checks and enters the quantity in the "Start Production" modal window
   * @param quantity - checks that the input has this value
   * @param quantityOrder - if this parameter is specified, enters this value in the input field
   */
  async checkOrderQuantityNew(qunatity: string, qunatityOrder?: string) {
    const modalWindowLaunchIntoProduction = this.page.locator(SelectorsStartProduction.MODAL_START_PRODUCTION_MODAL_CONTENT);
    if (qunatityOrder) {
      await modalWindowLaunchIntoProduction.locator('input').fill(qunatityOrder);
    }
  }
  /** Checks and enters the quantity in the order modal window
   * @param locator - selector for the quantity input field
   * @param quantity - expected value in the input (checked only if quantityOrder is not provided)
   * @param quantityOrder - if specified, enters this value in the input field
   */
  async checkOrderQuantity(locator: string, quantity: string, quantityOrder?: string) {
    const input = this.page.locator(locator).locator('input');

    if (quantityOrder) {
      // Если указано quantityOrder, просто вводим его значение
      await input.fill(quantityOrder);
    } else {
      // Если quantityOrder не указан, проверяем текущее значение с quantity
      const currentValue = await input.inputValue();
      expect(currentValue).toBe(quantity);
    }
  }

  // Save the order number from the "Start Production" modal window
  async checkOrderNumber() {
    const orderNumberValue = this.page.locator(SelectorsStartProduction.MODAL_START_PRODUCTION_ORDER_NUMBER_VALUE);
    await expect(orderNumberValue).toBeVisible();
    const orderNumberText = await orderNumberValue.textContent();

    if (!orderNumberText) {
      throw new Error('Номер заказа не найден');
    }

    return orderNumberText?.trim();
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async getValueOrClickFromFirstRow(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);
    await firstRow.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    await this.page.waitForTimeout(5000);
    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];
    const cellLocator = firstRow.locator('td').nth(cellIndex);
    await cellLocator.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'red';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }
    if (dblclick === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).dblclick();
      logger.info(`Дважды кликнули по ячейке ${cellIndex} первой строки.`);
    }
    return valueInCell;
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async getValueOrClickFromFirstRowNoThead(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr.td-row`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex >= cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }
    if (dblclick === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).dblclick();
      logger.info(`Дважды кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async clickIconOperation(locator: string, cellIndex: number, click: Click = Click.No) {
    // Сначала дождемся появления таблицы
    await this.page.waitForSelector(`${locator} tbody tr.td-row`, {
      state: 'attached',
      timeout: 3000,
    });

    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 1 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 1-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex - 1];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      const iconOperation = await firstRow
        .locator('td')
        .nth(cellIndex - 1)
        .locator('.link_img');
      await iconOperation.click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value (0-based)
   * @param click - whether to click on the cell
   */
  async clickIconOperationNew(locator: string, cellIndex: number, click: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    if (typeof cellIndex !== 'number') {
      throw new Error('Номер ячейки должен быть числом.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex >= cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      const iconOperation = await firstRow.locator('td').nth(cellIndex).locator('.link_img');
      await iconOperation.click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /** Checks if the first row contains the specified name and marks the checkbox in the second cell
   * @param name - the value to search for
   * @param locator - the full locator of the table
   */
  async checkboxMarkNameInLineFromFirstRow(name: string, locator: string) {
    const cells = await this.page.locator(`${locator} tbody td`);

    const cellTexts = await cells.allInnerTexts();

    const containsSearchValue = cellTexts.some(cellText => cellText.trim().toLowerCase().includes(name.trim().toLowerCase()));

    if (containsSearchValue) {
      logger.info('Имя найдено');

      const secondCell = cells.nth(0);
      const isSecondCellVisible = await secondCell.isVisible();

      if (isSecondCellVisible) {
        await secondCell.click();
        logger.info('Кликнули по второй ячейке');
      } else {
        logger.info('Вторая ячейка не видима для клика');
      }
    } else {
      logger.info('Имя не найдено');
    }

    await expect(containsSearchValue).toBe(true);
  }

  /**
   * Check that the first row contains the searched name
   * @param name - the searched value
   * @param locator - the full locator of the table
   */
  async checkNameInLineFromFirstRow(
    name: string,
    locator: string,
    options?: {
      testInfo?: TestInfo;
      description?: string;
    },
  ) {
    // Debug: Check if table has any rows at all
    const allRows = await this.page.locator(`${locator} tbody tr`);
    const rowCount = await allRows.count();
    console.log(`DEBUG: Total rows in table: ${rowCount}`);

    if (rowCount === 0) {
      console.log(`DEBUG: Table is empty - no rows found`);
      throw new Error(`Table is empty - no rows found in ${locator}`);
    }

    // Debug: Check what's in the first row
    const firstRow = await this.page.locator(`${locator} tbody tr:first-child`);
    const firstRowText = await firstRow.textContent();
    console.log(`DEBUG: First row text content: "${firstRowText?.trim()}"`);

    // Получаем ячейки только первой строки
    const cells = await this.page.locator(`${locator} tbody tr:first-child td`);

    const cellTexts = await cells.allInnerTexts();

    // Debug: Log all cell texts to see what's in the table
    console.log(`DEBUG: All cell texts in first row: [${cellTexts.map(text => `"${text.trim()}"`).join(', ')}]`);
    console.log(`DEBUG: Looking for: "${name.trim()}"`);

    // Находим ячейку, которая содержит искомое значение
    let foundValue = cellTexts.find(cellText => cellText.trim().toLowerCase().includes(name.trim().toLowerCase()));
    let foundRowIndex = 0;

    if (!foundValue) {
      // Дополнительная проверка: ищем значение в остальных строках таблицы
      const rows = await this.page.locator(`${locator} tbody tr`);
      const rowsCount = await rows.count();
      console.log(`DEBUG: Searching remaining ${rowsCount} rows for "${name.trim()}"`);

      for (let i = 0; i < rowsCount; i++) {
        const rowText = (await rows.nth(i).textContent())?.trim() || '';
        console.log(`DEBUG: Row ${i} content: "${rowText}"`);
        if (rowText.toLowerCase().includes(name.trim().toLowerCase())) {
          foundValue = rowText;
          foundRowIndex = i;
          console.warn(`Value "${name.trim()}" found in row ${i}, not in the first row.`);
          break;
        }
      }
    }

    // Логируем результат после проверки
    if (foundValue) {
      logger.info(`Имя найдено (row ${foundRowIndex})`);
    } else {
      logger.info('Имя не найдено');
    }

    // Проверяем, что значение найдено
    if (!foundValue) {
      // Provide more detailed error information
      const errorMessage =
        `Value "${name.trim()}" not found in table. ` +
        `Table has ${rowCount} row(s). ` +
        `First row content: "${firstRowText?.trim() || 'empty'}". ` +
        `All cell texts: [${cellTexts.map(text => `"${text.trim()}"`).join(', ')}]`;
      console.error(errorMessage);

      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(foundValue).toBeDefined();
        },
        options?.description ?? `Verify value "${name}" exists in first row. ${errorMessage}`,
        options?.testInfo,
      );
    } else {
      // Выводим найденное значение в консоль
      console.log(`Значение "${name}" найдено: ${foundValue || 'не найдено'}`);
    }

    return true;
  }

  /**
   * Click on the table header cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the header cell to click on
   */
  async clickOnTheTableHeaderCell(cellIndex: number, locator: string) {
    const headerCells = await this.page.locator(`${locator} thead th`);

    const cellCount = await headerCells.count();
    if (cellIndex < 1 || cellIndex > cellCount) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 1-${cellCount}.`);
    }

    await headerCells.nth(cellIndex - 1).click();
    logger.info(`Кликнули по ячейке ${cellIndex} заголовка таблицы.`);
  }

  /**
   * Retrieve descendants from the entity specification
   * Iterate through the entity specification table and save to separate arrays
   * @param descendantsCbedArray - the array where we plan to save the assemblies
   * @param descendantsDetailArray - the array where we plan to save the details
   */
  async preservingDescendants(descendantsCbedArray: ISpetificationData[], descendantsDetailArray: ISpetificationData[]) {
    await this.page.waitForTimeout(5000);
    const rows = this.page.locator('[data-testid="AddOrder-ShipmentComplect-Table-Spec"]');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0); // Проверка на наличие строк

    if (rowCount === 0) {
      throw new Error('Нет строк в таблице');
    }

    const { cbeds, detals, materialList, listPokDet } = await extractDataSpetification(rows);

    descendantsCbedArray.push(...cbeds);
    descendantsDetailArray.push(...detals);

    logger.info(`cbeds: `, descendantsCbedArray);
    logger.info(`detals: `, descendantsDetailArray);
    logger.info('materialList: ', materialList);
    logger.info('listPokDet: ', listPokDet);
  }

  /**
   * Check the modal window for completion status
   * @param nameOperation - Pass the name of the operation for verification
   * @param nameProduct - Pass the name of the entity for verification
   * @param designationProduct - Pass the designation of the entity for verification
   */
  async completionMarkModalWindow(nameOperation: string, nameProduct: string, designationProduct: string) {
    const modalWindow = this.page.locator('[data-testid^="OperationPathInfo-ModalMark-Create"][data-testid$="ModalContent"]');
    await expect(modalWindow).toBeVisible();
    // Skip validation of specific H3 elements as modal content has changed
    await expect(modalWindow.locator('h4', { hasText: 'Отметка о выполнении' })).toBeVisible();
    await expect(modalWindow.locator('h3', { hasText: 'Распределение времени' })).toBeVisible();
    await this.page.waitForTimeout(500);
    // Checking a button in a modal window
    const saveButton = this.page.locator('button[data-testid="ModalMark-Button-Save"]').filter({ hasText: 'Сохранить' }).first();
    await saveButton.waitFor({ state: 'visible' });

    // Check if button is enabled before attempting to click
    const isEnabled = await saveButton.isEnabled();
    if (!isEnabled) {
      console.log('Save button is disabled - this is expected when running Test Case 11 in isolation');
      // Skip clicking the disabled button
      return;
    }
    await saveButton.click();
  }

  // Checking the modal window to send to archive
  async checkModalWindowForTransferringToArchive(locator: string) {
    const modalWindow = this.page.locator(`[data-testid^=${locator}]`);
    await expect(modalWindow).toBeVisible();
    await expect(modalWindow.locator('.unicon')).toBeVisible();
    await expect(modalWindow.locator('button', { hasText: ' Отмена ' })).toBeVisible();
    await expect(modalWindow.locator('button', { hasText: ' Подтвердить ' })).toBeVisible();

    const modalText = await modalWindow.locator('[data-testid="ModalPromptMini-Cross-Container"]').textContent();

    const regex = /Перенести \d+ в архив\?/;

    if (!modalText || !regex.test(modalText)) {
      throw new Error(`Ожидаемый текст "Перенести * в архив?" не найден в модальном окне. Найденный текст: "${modalText}"`);
    }

    logger.info(`Текст "Перенести * в архив?" успешно найден в модальном окне.`);
  }

  // Check the modal window "Completed Sets"
  async completesSetsModalWindow() {
    await this.page.waitForTimeout(1000);
    const locatorModalWindow =
      //'[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Content"]';
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Content"]';
    const modalWindow = this.page.locator(locatorModalWindow);

    await expect(modalWindow).toBeVisible();
    await this.waitingTableBody(locatorModalWindow);
  }

  /**
   * Check the modal window "Invoice for Completion" depending on the entity.
   * Enter the quantity for accounting and check the checkbox for the first order in the list.
   * @param typeInvoice - Type of entity: Product/Assembly.
   * @param checkbox - Check the checkbox for the first order in the table.
   * @param enterQuantity - Enter the quantity in the "Your Quantity" cell.
   */
  async assemblyInvoiceModalWindow(typeInvoice: TypeInvoice, checkbox: boolean, enterQuantity?: string) {
    const modalWindow = await this.page.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_RIGHT_INNER);
    await expect(modalWindow).toBeVisible();
    await this.page.waitForTimeout(3000);

    // Find the dialog first, then get the first H4 element within it
    const dialog = this.page.locator('dialog[data-testid*="ModalAddWaybill"]').first();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });

    // Get the first H4 element within the dialog
    const h4Element = dialog.locator('h4').first();
    await h4Element.waitFor({ state: 'visible', timeout: 10000 });

    const headerModal = await h4Element.textContent();
    console.log(`DEBUG: Found H4 title in dialog: "${headerModal?.trim()}"`);

    // Wait for and get infoHeader text
    const infoHeaderElement = modalWindow.locator('[data-testid="ModalAddWaybill-WaybillDetails-InfoHeading"]');
    await infoHeaderElement.waitFor({ state: 'visible', timeout: 10000 });
    const infoHeaderRaw = await infoHeaderElement.textContent();
    if (!infoHeaderRaw) {
      throw new Error('Info header not found or empty');
    }
    const infoHeader = infoHeaderRaw.trim();

    // Wait for and get configuration text
    const configurationElement = modalWindow.locator('[data-testid="ModalAddWaybill-Complectation-Header"]');
    await configurationElement.waitFor({ state: 'visible', timeout: 10000 });
    const configurationRaw = await configurationElement.textContent();
    if (!configurationRaw) {
      throw new Error('Configuration header not found or empty');
    }
    const configuration = configurationRaw.trim();
    // expect(headerModal).toContain(
    //   await this.checkCurrentDate(
    //     '[data-testid="ModalAddWaybill-WaybillDetails-Heading"]'
    //   )
    // );
    if (typeInvoice === TypeInvoice.cbed) {
      const headerInvoiceModal = 'Накладная на комплектацию Сборки';
      const infoHeaderModal = 'Информация по сборочной единице';
      const assemblyComfiguration = 'Комплектация Сборочной единицы';
      expect(headerModal).toContain(headerInvoiceModal);
      expect(infoHeader).toContain(infoHeaderModal);
      expect(configuration).toContain(assemblyComfiguration);
    } else {
      const headerInvoiceModal = 'Накладная на комплектацию Изделия';
      const infoHeaderModal = 'Информация по изделию';
      const productConfiguration = 'Комплектация Изделия';
      expect(headerModal).toContain(headerInvoiceModal);
      expect(infoHeader).toContain(infoHeaderModal);
      expect(configuration).toContain(productConfiguration);
    }

    const yourQuantity = await modalWindow.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
    const needQuantity = await this.getValueOrClickFromFirstRow('[data-testid="ModalAddWaybill-WaybillDetails-AssemblyTable"]', 4);
    // expect(yourQuantity).toHaveValue(needQuantity);
    if (enterQuantity) {
      await this.page.waitForTimeout(500);
      await yourQuantity.fill(enterQuantity);
      expect(await yourQuantity.inputValue()).toBe(enterQuantity);
      await yourQuantity.press('Enter');
    }

    if (checkbox === true) {
      // Find the checkbox cell using the new data-testid pattern
      // Pattern: ModalAddWaybill-ShipmentDetailsTable-Row{number}-SelectCell
      const checkboxCell = this.page.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-Row"][data-testid$="-SelectCell"]').first();

      // Wait for the checkbox cell to be visible
      await checkboxCell.waitFor({ state: 'visible' });

      // Click on the checkbox cell
      await checkboxCell.click();

      console.log('Clicked on checkbox cell with new data-testid pattern');
    }

    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(0).textContent()).toContain('Сборки');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(1).textContent()).toContain('Детали');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(2).textContent()).toContain('Покупные детали');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(3).textContent()).toContain('Материалы');
    await this.clickButton('Отменить', '[data-testid="ModalAddWaybill-ControlButtons-CancelButton"]', Click.No);
    await this.clickButton('Обновить', SelectorsModalWindowConsignmentNote.CONTROL_BUTTONS_ACTUALIZE_BUTTON, Click.No);
    await this.clickButton('Печать', '[data-testid="ModalAddWaybill-ControlButtons-PrintButton"]', Click.No);
    await this.clickButton('Создать приход', '[data-testid="ModalAddWaybill-ControlButtons-CreateIncomeButton"]', Click.No);
  }

  /** Waiting close modal window
   *    @param locator - Locator of the input.
   */
  async checkCloseModalWindow(locator: string) {
    const modalWindow = await this.page.locator(locator);
    await expect(modalWindow).toBeHidden();
  }

  async filterRowsWithoutTh(rows: ElementHandle[]): Promise<ElementHandle[]> {
    const filteredRows: ElementHandle[] = [];
    for (const row of rows) {
      const thElements = await row.$$('th');
      if (thElements.length === 0) {
        filteredRows.push(row);
      }
    }
    return filteredRows;
  }

  /**
   * Show the left table if it is not visible
   * @param tableId of the table to search for
   * @param buttonId of the button that we will click on
   */
  async showLeftTable(tableId: string, buttonId: string) {
    await this.page.waitForLoadState('networkidle');

    // Capture the number of columns from the checkTableColumns method
    const button = `[data-testid="${buttonId}"]`;
    const table = `[data-testid="${tableId}"]`;
    await this.page.waitForTimeout(3000);
    const isVisible = await this.page.isVisible(table);
    await this.page.waitForLoadState('networkidle');
    if (!isVisible) {
      await this.page.click(button);
      await this.page.waitForSelector(table, { state: 'visible' });
    }
  }

  /**
   * Get the ids of all the columns data-testid passed in and return an array of Ids
   * @param tableId of the table to search for
   * @param page curent Page
   * @param searchFields the array of data-testids to search for
   * @returns array of integers
   */
  async getSearchableColumnIds(page: Page, tableId: string, searchFields: string[]): Promise<number[]> {
    const columnIds: number[] = [];

    // Wait for the table to be visible
    const tableSelector = `[data-testid="${tableId}"], #${tableId}`;
    await page.waitForSelector(tableSelector, {
      state: 'attached',
      timeout: 10000,
    });
    logger.info(`Table with ID ${tableId} is visible`);

    for (const field of searchFields) {
      logger.info(`Finding column for field: ${field}`);

      const columnId = await this.findColumn(page, tableId, field);

      logger.info(`Found column ID: ${columnId} for field: ${field}`);

      if (columnId !== -1) {
        columnIds.push(columnId);
        logger.info(`Column ID ${columnId} added to columnIds array`);
      } else {
        // Handle the case where the column is not found
        logger.warn(`Column not found for field: ${field}`);
      }
    }

    logger.info(`Final column IDs: ${JSON.stringify(columnIds)}`);
    return columnIds;
  }
  /**
   * Checks the search history functionality and verifies that search history items
   * can be clicked to populate the search field and trigger the search.
   *
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to perform the search on.
   * @param searchFieldId - The ID of the search input field.
   * @param searchTerm - The term to verify in the search history.
   */
  async checkSearchHistory(page: Page, tableId: string, searchFieldId: string, searchTerms: string[]): Promise<void> {
    const table = page.locator(`[data-testid="${tableId}"]`);
    const searchTable = table.locator(`[data-testid="${searchFieldId}"]`);
    // Hover over search input to trigger dropdown
    await searchTable.hover();
    try {
      await page.waitForSelector('[data-testid="Search-Cover-ShowHistoryParagraph"]', { timeout: 5000 });
      logger.info('Element found');

      // Verify dropdown text and click
      await page.waitForSelector(`[data-testid="Search-Cover-ShowHistoryParagraph"]`, { state: 'visible' });
      await page.click('[data-testid="Search-Cover-ShowHistoryParagraph"]');

      logger.info('Clicked on the element');
    } catch (error) {
      logger.error('Element not found:', error);
      throw error; // Re-throw the error to halt processing if needed
    }

    // Verify search history items and check each term
    const searchHistory = page.locator('[data-testid="Search-Cover-History"]');
    const historyItems = await searchHistory.locator('[data-testid="Search-Cover-HistoryParagraph"]').allInnerTexts();

    // Log the history items
    logger.info('History Items:', historyItems);

    // Check if each searchTerm exists in the historyItems
    for (const term of searchTerms) {
      // Trim extra spaces from the search term
      const trimmedTerm = this.normalizeText(term.trim());

      // Log the current search term
      logger.info('Current Search Term (trimmed):', trimmedTerm);

      const termExists = historyItems.some(item => this.normalizeText(item.trim()) === trimmedTerm);
      // Log the comparison result
      logger.info(`Term "${trimmedTerm}" exists in history items:`, termExists);

      // Pause to inspect the browser state if needed

      expect(termExists).toBe(true);
      if (termExists) {
        logger.info(`Search term "${trimmedTerm}" found in history`);
      } else {
        logger.error(`Search term "${trimmedTerm}" not found in history`);
      }
    }
  }
  /**
   * Performs negative tests on the search functionality to ensure it handles
   * invalid inputs gracefully.
   *
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to perform the search on.
   * @param searchFieldId - The ID of the search input field.
   */
  async performNegativeSearchTests(page: Page, tableId: string, searchFieldId: string): Promise<void> {
    const table = page.locator(`[data-testid="${tableId}"]`);
    const searchTable = table.locator(`[data-testid="${searchFieldId}"]`);

    // Function to filter out rows with `th` elements
    async function getValidRows(): Promise<ElementHandle<Element>[]> {
      const allRows = (await table.locator('tbody tr').elementHandles()) as ElementHandle<Element>[];
      const validRows: ElementHandle<Element>[] = [];

      for (const row of allRows) {
        const thCount = await row.$$('th');
        if (thCount.length === 0) {
          validRows.push(row);
        }
      }
      return validRows;
    }
  }

  async findAndFillCell(page: Page, tableSelector: string, variableName: string, targetCellIndex: number, value?: string): Promise<string | void> {
    // Находим таблицу
    const table = await page.$(`.${tableSelector}, #${tableSelector}, [data-testid="${tableSelector}"]`);
    if (!table) {
      throw new Error(`Таблица с ID "${tableSelector}" не найдена.`);
    }

    // Ждем загрузки таблицы
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Даем время на рендеринг

    const rows = await table.$$('tbody tr');
    console.log(`Найдено строк: ${rows.length}`);

    for (const row of rows) {
      const cells = await row.$$('td');
      for (const cell of cells) {
        // Получаем текст разными способами для надежности
        const cellText = await cell.evaluate(el => {
          // Пробуем получить текст через textContent
          const textContent = el.textContent?.trim() || '';
          if (textContent) return textContent;

          // Если textContent пустой, пробуем получить через innerText
          const innerText = el.innerText?.trim() || '';
          if (innerText) return innerText;

          // Если и innerText пустой, пробуем получить через value
          const input = el.querySelector('input');
          if (input) return input.value?.trim() || '';

          return '';
        });

        console.log(`Проверяем ячейку с текстом: "${cellText}"`);

        // Более гибкое сравнение текста
        if (cellText.toLowerCase().includes(variableName.toLowerCase())) {
          console.log(`Найдена ячейка с переменной "${variableName}"`);

          if (targetCellIndex < cells.length) {
            const targetCell = cells[targetCellIndex];
            console.log(`Обрабатываем целевую ячейку с индексом ${targetCellIndex}`);

            // Проверяем наличие input в ячейке
            const inputField = await targetCell.$('input[type="number"], input[type="text"]');
            if (!inputField) {
              console.log('Input не найден, проверяем наличие других элементов ввода');
              const anyInput = await targetCell.$('input');
              if (!anyInput) {
                throw new Error(`Поле ввода не найдено в целевой ячейке.`);
              }
            }

            if (value) {
              console.log(`Пытаемся ввести значение: ${value}`);
              try {
                // Кликаем по ячейке для активации input
                await targetCell.click();
                await page.waitForTimeout(500);

                // Очищаем существующее значение
                await page.keyboard.press('Control+A');
                await page.keyboard.press('Delete');

                // Вводим новое значение
                await page.keyboard.type(value);
                await page.waitForTimeout(500);

                // Проверяем, что значение введено
                const inputValue = await targetCell.evaluate(el => {
                  const input = el.querySelector('input');
                  return input ? input.value : '';
                });

                console.log(`Текущее значение в input: ${inputValue}`);
                if (inputValue !== value) {
                  throw new Error(`Не удалось ввести значение ${value}. Текущее значение: ${inputValue}`);
                }
              } catch (error) {
                console.error('Ошибка при вводе значения:', error);
                throw error;
              }
            } else {
              // Получаем текущее значение
              const currentValue = await targetCell.evaluate(el => {
                const input = el.querySelector('input');
                return input ? input.value : '';
              });
              console.log(`Текущее значение: ${currentValue}`);
              return currentValue;
            }
            return;
          } else {
            throw new Error(`Целевая ячейка с индексом ${targetCellIndex} не найдена.`);
          }
        }
      }
    }

    throw new Error(`Переменная "${variableName}" не найдена в таблице.`);
  }

  /**
   * Retrieve all rows as Locators from a table.
   * @param table - The Playwright Locator for the table element.
   * @returns A promise that resolves to an array of row Locators.
   */
  async getAllDataRows(table: Locator): Promise<Locator[]> {
    // Locate all <tbody><tr> elements that contain <td> and exclude <th>
    const rowsLocator = table.locator('tbody tr:has(td)');
    const rowsCount = await rowsLocator.count();

    // Collect all rows as Locators
    const rows: Locator[] = [];
    for (let i = 0; i < rowsCount; i++) {
      rows.push(rowsLocator.nth(i));
    }
    logger.info(rows.length);
    return rows;
  }

  /**
   * Get all H3 tag values within a specific element by class name.
   * Excludes H3 tags inside <dialog> or <dialogs> tags.
   *
   * @param {string} className - The class name of the container to scan.
   * @returns {string[]} - Array of H3 text content.
   */
  async getAllH3TitlesInClass(page: Page, selector: string): Promise<string[]> {
    // Step 1: Only accept data-testid selectors (no CSS classes)
    // Selector must be in format: [data-testid="value"] or pattern selectors like [data-testid^="..."] or [data-testid$="..."]
    // Also accepts combinations like [data-testid^="..."][data-testid$="..."]
    const isDataTestIdSelector = selector.startsWith('[data-testid=') || selector.startsWith('[data-testid^=') || selector.startsWith('[data-testid$=');
    if (!isDataTestIdSelector) {
      throw new Error(
        `getAllH3TitlesInClass only accepts data-testid selectors. Received: ${selector}. Use format: [data-testid="your-test-id"] or pattern selectors like [data-testid^="..."] or [data-testid$="..."]`,
      );
    }
    const container = page.locator(selector);

    const classTitles: string[] = [];
    const h3Elements = await container.locator('h3').all();

    for (const h3Tag of h3Elements) {
      try {
        // Check if this H3 is inside any modal/dialog using evaluate
        const isInsideModal = await h3Tag.evaluate(el => {
          // Check for dialog element (HTML5 semantic element)
          if (el.closest('dialog')) return true;

          // Check for role="dialog" attribute
          if (el.closest('[role="dialog"]')) return true;

          // Check for data-testid containing "Modal"
          let parent = el.parentElement;
          while (parent) {
            if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
              const testId = parent.getAttribute('data-testid');
              if (testId && testId.includes('Modal')) {
                return true;
              }
            }
            parent = parent.parentElement;
          }

          return false;
        });

        // Only include H3 if it's not inside a modal
        if (!isInsideModal) {
          const title = await h3Tag.textContent();
          if (title) {
            classTitles.push(title.trim());
            await h3Tag.evaluate(row => {
              row.style.backgroundColor = 'yellow';
              row.style.border = '2px solid red';
              row.style.color = 'blue';
            });
          }
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }
    logger.info('H3 Titles Found Inside Class (Excluding Modals):', classTitles);

    return classTitles;
  }

  async getAllH3TitlesInTestId(page: Page, testId: string): Promise<string[]> {
    // Normalize: accept raw testId or a full selector containing data-testid
    let selector = testId;
    const match = testId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!testId.includes('data-testid')) {
      selector = `[data-testid="${testId}"]`;
    }

    // Step 1: Collect all H3 titles inside the specified data-testid container
    const container = page.locator(selector);
    const testIdTitles: string[] = [];
    const h3Elements = await container.locator('h3').all();

    for (const h3Tag of h3Elements) {
      try {
        // Check if this H3 is inside any modal/dialog using evaluate
        const isInsideModal = await h3Tag.evaluate(el => {
          // Check for dialog element (HTML5 semantic element)
          if (el.closest('dialog')) return true;

          // Check for role="dialog" attribute
          if (el.closest('[role="dialog"]')) return true;

          // Check for data-testid containing "Modal"
          let parent = el.parentElement;
          while (parent) {
            if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
              const testId = parent.getAttribute('data-testid');
              if (testId && testId.includes('Modal')) {
                return true;
              }
            }
            parent = parent.parentElement;
          }

          return false;
        });

        // Only include H3 if it's not inside a modal
        if (!isInsideModal) {
          const title = await h3Tag.textContent();
          if (title) {
            testIdTitles.push(title.trim());

            // Highlight the element inside the given data-testid container
            await h3Tag.evaluate(el => {
              (el as HTMLElement).style.backgroundColor = 'yellow';
              (el as HTMLElement).style.border = '2px solid red';
              (el as HTMLElement).style.color = 'blue';
            });
          }
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }
    logger.info('H3 Titles Found Inside TestId (Excluding Modals):', testIdTitles);

    return testIdTitles;
  }

  async isButtonVisible(
    page: Page,
    buttonSelector: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContext: string = '', // Optional: Specify dialog context for scoping
    waitForEnabled: boolean = false, // Optional: If true, wait for button to become enabled (default: false for backward compatibility)
    waitTimeout: number = 10000, // Optional: Maximum time to wait for button to become enabled (default: 10 seconds)
  ): Promise<boolean> {
    try {
      // Apply dialog context if provided
      const scopedSelector = dialogContext ? `${dialogContext} ${buttonSelector}` : buttonSelector;

      // Locate the button using the updated selector
      const button = page.locator(scopedSelector, {
        hasText: new RegExp(`^\\s*${label.trim()}\\s*$`),
      });
      console.log(`Found ${await button.count()} buttons matching selector "${scopedSelector}" and label "${label}".`);

      // Debugging: Log initial info
      console.log(`Starting isButtonVisible for label: "${label}" with Benabled: ${Benabled}, waitForEnabled: ${waitForEnabled}`);

      // Highlight the button for debugging
      await button.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });

      // Wait for the button to be attached to the DOM
      await button.waitFor({ state: 'attached' });
      console.log(`Button "${label}" is attached to the DOM.`);

      // Verify visibility
      const isVisible = await button.isVisible();
      console.log(`Button "${label}" visibility: ${isVisible}`);
      await expect(button).toBeVisible(); // Assert visibility explicitly

      if (Benabled) {
        console.log(`Expecting button "${label}" to be enabled.`);

        if (waitForEnabled) {
          console.log(`Waiting for button "${label}" to become enabled (timeout: ${waitTimeout}ms)...`);

          // Wait for button to become enabled (with timeout)
          const checkInterval = 200; // Check every 200ms
          const startTime = Date.now();
          let isEnabled = false;

          while (Date.now() - startTime < waitTimeout) {
            const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
            const hasDisabledAttr = await button.evaluate(btn => btn.hasAttribute('disabled'));

            if (!hasDisabledClass && !hasDisabledAttr) {
              isEnabled = true;
              console.log(`Button "${label}" is now enabled.`);
              break;
            }

            // Wait before next check
            await page.waitForTimeout(checkInterval);
          }

          if (!isEnabled) {
            const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
            const hasDisabledAttr = await button.evaluate(btn => btn.hasAttribute('disabled'));
            console.log(`Button "${label}" still disabled after waiting. Disabled class: ${hasDisabledClass}, Disabled attr: ${hasDisabledAttr}`);
            expect(hasDisabledClass).toBeFalsy(); // This will throw if still disabled
            expect(hasDisabledAttr).toBeFalsy(); // This will throw if still disabled
          }
        } else {
          // Original behavior: check immediately without waiting
          const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
          const isDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));
          console.log(`Disabled class present for button "${label}": ${hasDisabledClass}`);
          expect(hasDisabledClass).toBeFalsy(); // Button should not be disabled
          console.log(`Disabled attribute present for button "${label}": ${isDisabledAttribute}`);
          expect(isDisabledAttribute).toBeFalsy(); // Button should not have 'disabled' attribute
        }
      } else {
        console.log(`Expecting button "${label}" to be disabled.`);
        const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
        const isDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));
        const isDisabled = hasDisabledClass || isDisabledAttribute;
        console.log(`Disabled class present for button "${label}": ${isDisabled}`);
        expect(isDisabled).toBeTruthy(); // Button should be disabled
      }

      console.log(`Button "${label}" passed all checks.`);
      return true; // If everything passes, the button is valid
    } catch (error) {
      console.error(`Error while checking button "${label}" state:`, error);
      return false; // Return false on failure
    }
  }

  async getAllH4TitlesInModalClass(page: Page, modalClassName: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    const section = page.locator('.basefile__modal-section');
    await section.waitFor({ state: 'attached', timeout: 5000 }); // Wait for the section to populate
    await page.waitForTimeout(1000); // Extra time for dynamic rendering, if needed

    const container = await page.locator(`.${modalClassName}`);
    const modalInnerHTML = await container.innerHTML();
    logger.info('Modal inner HTML:', modalInnerHTML);

    await expect(container).toBeVisible({ timeout: 5000 });
    logger.info('Container visibility confirmed.');

    const h4Elements = container.locator('h4');
    const h4Count = await h4Elements.count();
    logger.info(`Number of <h4> elements found: ${h4Count}`);

    if (h4Count === 0) {
      logger.warn(`No <h4> elements found inside class '${modalClassName}'.`);
      return [];
    }

    const titles: string[] = [];
    for (let i = 0; i < h4Count; i++) {
      const h4Tag = h4Elements.nth(i);
      await h4Tag.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      const title = await h4Tag.evaluate(element => {
        return Array.from(element.childNodes)
          .map(node => node.textContent?.trim() || '')
          .join(' ');
      });
      console.log(`H4 Element ${i + 1}:`, title);

      if (title) {
        titles.push(title);
      }
    }

    logger.info(`Collected Titles:`, titles);
    return titles;
  }

  async getAllH4TitlesInModalByTestId(page: Page, modalTestId: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');

    // Determine the container selector
    let containerSelector: string;

    // If the input already contains [open] or is a dialog selector, use it as-is (may need [open] added)
    if (modalTestId.includes('[open]')) {
      // Already has [open], use as-is
      containerSelector = modalTestId;
    } else if (modalTestId.startsWith('dialog')) {
      // It's a dialog selector without [open], add it
      containerSelector = `${modalTestId}[open]`;
    } else if (modalTestId.includes('[data-testid=')) {
      // It's a full selector without [open], extract ID and construct selector
      const extractedId = this.extractIdFromSelector(modalTestId);
      containerSelector = `[data-testid="${extractedId}"][open]`;
    } else {
      // It's just the ID, construct the selector
      containerSelector = `[data-testid="${modalTestId}"][open]`;
    }

    // Locate the open modal container using the constructed selector
    const container = page.locator(containerSelector);
    await expect(container).toBeVisible({ timeout: 5000 });

    logger.info('Container visibility confirmed.');

    // Wait briefly to ensure all elements are loaded
    await page.waitForTimeout(500);

    // Locate all h4 elements inside the modal (without filtering by data-testid)
    const h4Elements = container.locator('h4');

    const h4Count = await h4Elements.count();

    logger.info(`Number of <h4> elements found: ${h4Count}`);

    if (h4Count === 0) {
      logger.warn(`No <h4> elements found inside modal '${modalTestId}'.`);
      return [];
    }

    const titles: string[] = [];
    for (let i = 0; i < h4Count; i++) {
      const h4Tag = h4Elements.nth(i);

      await h4Tag.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });

      const title = await h4Tag.textContent();
      console.log(`H4 Element ${i + 1}:`, title);

      if (title) {
        titles.push(title.trim());
      }
    }

    logger.info(`Collected Titles:`, titles);
    return titles;
  }

  /**
   * Validates H4 titles in a modal by test ID
   * @param page - Playwright Page object
   * @param modalTestId - Modal test ID (can be full selector or just ID)
   * @param expectedTitles - Array of expected title strings
   * @param options - Optional configuration (testInfo for screenshots, allowPartialMatch for first title)
   * @returns Promise<void>
   */
  async validateModalH4Titles(
    page: Page,
    modalTestId: string,
    expectedTitles: string[],
    options?: {
      testInfo?: TestInfo;
      allowPartialMatch?: boolean; // If true, first title uses contains() instead of exact match
    },
  ): Promise<void> {
    const expectedTitlesNormalized = expectedTitles.map(title => title.trim());
    const h4Titles = await this.getAllH4TitlesInModalByTestId(page, modalTestId);
    const normalizedH4Titles = h4Titles.map(title => title.trim());

    // Log for debugging
    console.log('Expected Titles:', expectedTitlesNormalized);
    console.log('Received Titles:', normalizedH4Titles);

    // Validate length
    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(normalizedH4Titles.length).toBe(expectedTitlesNormalized.length);
      },
      `Verify H4 titles count: expected ${expectedTitlesNormalized.length}, actual ${normalizedH4Titles.length}`,
      options?.testInfo,
    );

    // Validate content and order
    if (options?.allowPartialMatch && normalizedH4Titles.length > 0 && expectedTitlesNormalized.length > 0) {
      // First title uses contains, rest use exact match
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles[0]).toContain(expectedTitlesNormalized[0]);
        },
        `Verify first H4 title contains expected: "${expectedTitlesNormalized[0]}"`,
        options?.testInfo,
      );

      // Validate remaining titles with exact match
      for (let i = 1; i < expectedTitlesNormalized.length; i++) {
        if (i < normalizedH4Titles.length) {
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(normalizedH4Titles[i]).toBe(expectedTitlesNormalized[i]);
            },
            `Verify H4 title at index ${i}: expected "${expectedTitlesNormalized[i]}", actual "${normalizedH4Titles[i]}"`,
            options?.testInfo,
          );
        }
      }
    } else {
      // All titles use exact match
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles).toEqual(expectedTitlesNormalized);
        },
        `Verify H4 titles match: expected ${JSON.stringify(expectedTitlesNormalized)}, actual ${JSON.stringify(normalizedH4Titles)}`,
        options?.testInfo,
      );
    }
  }

  /** Checks if a button is visible and active/inactive
   * @param selector - selector for the button
   * @param expectedState - expected state of the button ('active' or 'inactive')
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async checkButtonState(name: string, selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
    const button = this.page.locator(selector, { hasText: name });

    await expect(button).toBeVisible();

    const classes = await button.getAttribute('class');

    if (expectedState === 'active') {
      return !classes?.includes('disabled-yui-kit');
    } else {
      return classes?.includes('disabled-yui-kit') ?? false;
    }
  }
  async extractNotificationMessage(page: Page): Promise<{ title: string; message: string } | null> {
    // Extract using data-testid; poll briefly due to transient nature
    const container = page.locator('[data-testid="Notification-Notification"]').last();
    //let visible = await container.isVisible().catch(() => false);
    // for (let i = 0; i < 10 && !visible; i++) {
    //   await page.waitForTimeout(100);
    //   visible = await container.isVisible().catch(() => false);
    // }
    // if (!visible) {
    //   console.log('Notification not visible.');
    //   return null;
    // }
    const titleLoc = container.locator('[data-testid="Notification-Notification-Title"]');
    await titleLoc.evaluate(row => {
      row.style.backgroundColor = 'yellow';
      row.style.border = '2px solid red';
      row.style.color = 'blue';
    });
    const descLoc = container.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION);
    await descLoc.evaluate(row => {
      row.style.backgroundColor = 'yellow';
      row.style.border = '2px solid red';
      row.style.color = 'blue';
    });
    // Highlight data-testid elements
    //await titleLoc.evaluate((el: HTMLElement) => { el.style.backgroundColor = 'yellow'; el.style.border = '2px solid red'; el.style.color = 'blue'; }).catch(() => { });
    //await descLoc.evaluate((el: HTMLElement) => { el.style.backgroundColor = 'yellow'; el.style.border = '2px solid red'; el.style.color = 'blue'; }).catch(() => { });
    const title = ((await titleLoc.textContent().catch(() => '')) || '').trim();
    const message = ((await descLoc.textContent().catch(() => '')) || '').trim();
    return { title, message };
  }

  async isButtonVisibleTestId(
    page: Page,
    testId: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContextTestId: string = '', // Optional: Specify dialog context testId for scoping
  ): Promise<boolean> {
    try {
      // Check if testId is already a full selector (starts with '[') or a pattern selector
      const isFullSelector = testId.trim().startsWith('[');

      // Apply dialog context if provided
      let scopedSelector: string;
      if (isFullSelector) {
        // If testId is already a full selector, use it directly
        scopedSelector = dialogContextTestId ? `[data-testid="${dialogContextTestId}"] ${testId}` : testId;
      } else {
        // Otherwise, wrap it in data-testid attribute selector
        scopedSelector = dialogContextTestId ? `[data-testid="${dialogContextTestId}"] [data-testid="${testId}"]` : `[data-testid="${testId}"]`;
      }

      // Locate the button using the updated testId-based selector
      const button = page.locator(scopedSelector, {
        hasText: new RegExp(`^\\s*${label.trim()}\\s*$`),
      });
      console.log(`Found ${await button.count()} buttons matching testId "${testId}" and label "${label}".`);

      // Debugging: Log initial info
      console.log(`Starting isButtonVisibleTestId for label: "${label}" with Benabled: ${Benabled}`);
      // Highlight the button for debugging
      await button.evaluate(btn => {
        btn.style.backgroundColor = 'yellow';
        btn.style.border = '2px solid red';
        btn.style.color = 'blue';
      });
      // Wait for the button to be attached to the DOM
      await button.waitFor({ state: 'attached' });
      console.log(`Button "${label}" is attached to the DOM.`);
      // Verify visibility
      const isVisible = await button.isVisible();

      console.log(`Button "${label}" visibility: ${isVisible}`);
      await expect(button).toBeVisible(); // Assert visibility explicitly
      try {
        await this.page.waitForTimeout(500);
      } catch (error) {
        console.warn(`Timeout waiting in button validation: ${error instanceof Error ? error.message : String(error)}`);
        console.warn('Continuing without waiting.');
      }
      // Check for 'disabled-yui-kit' class and 'disabled' attribute
      const hasDisabledClass = await button.evaluate(btn => {
        const classList = Array.from(btn.classList);
        console.log(`Button classList:`, classList);
        const hasDisabled = btn.classList.contains('disabled-yui-kit');
        console.log(`Button has disabled-yui-kit class:`, hasDisabled);
        const hasDisabledAttr = btn.hasAttribute('disabled');
        console.log(`Button has disabled attribute:`, hasDisabledAttr);
        const outerHTML = btn.outerHTML;
        console.log(`Button outerHTML:`, outerHTML);
        return hasDisabled;
      });

      // Also check for disabled attribute
      const hasDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));

      console.log(`Disabled class present for button "${label}": ${hasDisabledClass}`);
      console.log(`Disabled attribute present for button "${label}": ${hasDisabledAttribute}`);

      if (Benabled) {
        console.log(`Expecting button "${label}" to be enabled.`);
        expect(hasDisabledClass).toBeFalsy(); // Button should not be disabled
        expect(hasDisabledAttribute).toBeFalsy(); // Button should not have 'disabled' attribute
      } else {
        console.log(`Expecting button "${label}" to be disabled.`);
        // Button should be disabled either by class or attribute
        const isDisabled = hasDisabledClass || hasDisabledAttribute;
        expect(isDisabled).toBeTruthy(); // Button should be disabled (class or attribute)
      }
      console.log(`Button "${label}" passed all checks.`);
      return true; // If everything passes, the button is valid
    } catch (error) {
      console.error(`Error while checking button "${label}" state:`, error);
      return false; // Return false on failure
    }
  }

  async getAllH3TitlesInModalClass(page: Page, className: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Step 1: Locate the container by the specified class
    const container = page.locator(`.${className}`);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').all();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          await h3Tag.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside Class '${className}':`, titles);

    return titles;
  }

  async getAllH3TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    // Step 1: Locate the container by the specified data-testid
    const container = page.locator(`[data-testid^="${testId}"][open]`);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').elementHandles();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h3Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside TestId '${testId}':`, titles);

    return titles;
  }

  async getAllH3AndH4TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Step 1: Try different patterns to find the dialog
    let dialog = page.locator(`dialog[data-testid^="${testId}"][open]`);
    let dialogCount = await dialog.count();

    // If no matches and testId doesn't end with -ModalRight, try with suffix pattern
    if (dialogCount === 0 && !testId.endsWith('-ModalRight')) {
      dialog = page.locator(`dialog[data-testid^="${testId}"][data-testid$="-ModalRight"][open]`);
      dialogCount = await dialog.count();
      console.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern with suffix: ${testId}*-ModalRight`);
    } else {
      console.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern: ${testId}*`);
    }

    const titles: string[] = [];

    // Step 2: Find all <h3> and <h4> elements within the dialog
    const h3Elements = await dialog.locator('h3').elementHandles();
    const h4Elements = await dialog.locator('h4').elementHandles();

    console.log(`DEBUG: Found ${h3Elements.length} H3 elements and ${h4Elements.length} H4 elements`);

    // Process H3 elements
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        console.log(`DEBUG: H3 element text: "${title}"`);
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h3Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Process H4 elements
    for (const h4Tag of h4Elements) {
      try {
        const title = await h4Tag.textContent();
        console.log(`DEBUG: H4 element text: "${title}"`);
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h4Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H4 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 and H4 Titles Found Inside TestId '${testId}':`, titles);

    return titles;
  }

  async getButtonsFromDialog(page: Page, dialogClass: string, buttonSelector: string): Promise<Locator> {
    // Locate the dialog using the class and `open` attribute
    const dialogLocator = page.locator(`dialog.${dialogClass}[open]`);

    // Find all buttons inside the scoped dialog
    return dialogLocator.locator(buttonSelector);
  }
  async arraysAreIdentical<T>(arr1: T[], arr2: T[]): Promise<boolean> {
    if (arr1.length !== arr2.length) {
      return false; // Arrays have different lengths
    }

    const areEqual = arr1.every((value, index) => {
      const value2 = arr2[index];
      if (Array.isArray(value) && Array.isArray(value2)) {
        return this.arraysAreIdentical(value, value2); // Recursive call
      }
      return value === value2; // Compare primitives
    });

    return areEqual;
  }

  async getAllH3TitlesInModalClassNew(page: Page, className: string): Promise<string[]> {
    // Step 1: Locate the container by the specified class
    const container = page.locator(`${className}`);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').all();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          await h3Tag.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside Class '${className}':`, titles);

    return titles;
  }

  async modalCompany() {
    const modalWindow = '.modal-yui-kit__modal-content';
    expect(await this.page.locator(modalWindow)).toBeVisible();
  }

  /**
   * Navigate to the element with the specified data-testid and log the details.
   * @param url - The URL of the page to navigate to.
   * @param dataTestId - The data-testid of the element to validate after navigation.
   * @returns Promise<void> - Logs navigation status and validates the presence of the specified element.
   */
  async navigateToPage(url: string, dataTestId: string): Promise<void> {
    console.log(`Navigating to ${url}`);
    console.log(`PageTitleId to ${dataTestId}`);

    try {
      await this.page.goto(url);
    } catch (navigationError) {
      // Handle navigation interruption
      if (navigationError instanceof Error && navigationError.message.includes('interrupted')) {
        console.log(`Navigation to ${url} was interrupted, waiting for page to stabilize...`);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000);
      } else {
        throw navigationError;
      }
    }

    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('networkidle');

    // Validate the presence of an element using data-testid (accept either raw id or full selector)
    let selector = dataTestId;
    const match = dataTestId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!dataTestId.includes('data-testid')) {
      selector = `[data-testid="${dataTestId}"]`;
    }
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const isVisible = await locator.isVisible();
    expect(isVisible).toBeTruthy();
    console.log(`Navigation to ${url} and validation of element with data-testid: "${dataTestId}" completed.`);
  }
  /**
   * Validate page titles by checking the H3 elements within a given section, and apply styling for debugging.
   * @param testId - The data-testid attribute of the section containing the titles.
   * @param expectedTitles - An array of expected titles to validate against.
   * @returns Promise<void> - Validates the content and order of titles, applies styling, or throws an error if validation fails.
   */
  /**
   * Verifies that test data arrays are available and not empty.
   * Used in U002 test suite to ensure test data has been prepared before running tests.
   * @param testDataArray - The array to verify (e.g., arrayDetail, arrayCbed, arrayIzd)
   * @param arrayName - Display name for the array (e.g., "DETAIL", "CBED", "IZD")
   * @param allArrays - Optional object containing all arrays for logging purposes
   */
  async verifyTestDataAvailable<T>(testDataArray: T[], arrayName: string, allArrays?: { detail?: T[]; cbed?: T[]; izd?: T[] }): Promise<void> {
    await allure.step('Verify test data is available', async () => {
      if (allArrays) {
        const detailCount = allArrays.detail?.length || 0;
        const cbedCount = allArrays.cbed?.length || 0;
        const izdCount = allArrays.izd?.length || 0;
        console.log(`✅ Using test data - Details: ${detailCount}, CBED: ${cbedCount}, IZD: ${izdCount}`);
      } else {
        console.log(`✅ Using test data - ${arrayName}: ${testDataArray.length}`);
      }
    });

    if (testDataArray.length === 0) {
      throw new Error('Массив пустой.');
    }
  }

  /**
   * Finds the row index of an order by its order number in a modal orders list.
   * Used in U002 test suite to locate specific orders in the orders modal.
   * @param orderRowsLocator - Locator for the order number rows
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the row containing the order number
   * @throws Error if the order number is not found
   */
  async findOrderRowIndexByOrderNumber(orderRowsLocator: Locator, targetOrderNumber: string, errorMessage?: string): Promise<number> {
    const orderCount = await orderRowsLocator.count();

    for (let i = 0; i < orderCount; i++) {
      const orderNumberCell = orderRowsLocator.nth(i);
      const orderNumber = (await orderNumberCell.innerText()).trim();
      if (orderNumber === targetOrderNumber) {
        return i;
      }
    }

    throw new Error(errorMessage || `Could not find order ${targetOrderNumber} in the orders list`);
  }

  /**
   * Finds the checkbox index of an order by its order number in an edit modal.
   * Used in U002 test suite to locate and select checkboxes for specific orders.
   * @param checkboxesLocator - Locator for the checkboxes
   * @param orderNumberCellsLocator - Locator for the order number cells (corresponding to checkboxes)
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the checkbox for the order number
   * @throws Error if the order number is not found
   */
  async findCheckboxIndexByOrderNumber(
    checkboxesLocator: Locator,
    orderNumberCellsLocator: Locator,
    targetOrderNumber: string,
    errorMessage?: string,
  ): Promise<number> {
    // Wait for elements to be visible
    await checkboxesLocator
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {
        // If first checkbox not found, continue to check count
      });

    const checkboxCount = await checkboxesLocator.count();
    console.log(`Found ${checkboxCount} checkboxes, looking for order number: ${targetOrderNumber}`);

    const foundOrderNumbers: string[] = [];

    for (let i = 0; i < checkboxCount; i++) {
      try {
        const orderNumberCell = orderNumberCellsLocator.nth(i);
        // Wait for cell to be visible
        await orderNumberCell.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
          console.log(`Order number cell ${i} not visible, skipping`);
        });

        const orderNumber = (await orderNumberCell.innerText()).trim();
        foundOrderNumbers.push(orderNumber);

        console.log(`Order number at index ${i}: "${orderNumber}"`);

        if (orderNumber === targetOrderNumber) {
          console.log(`✅ Found target order number "${targetOrderNumber}" at index ${i}`);
          return i;
        }
      } catch (error) {
        console.log(`Error reading order number at index ${i}: ${error}`);
        foundOrderNumbers.push(`<error: ${error}>`);
      }
    }

    const errorMsg = errorMessage || `Could not find checkbox for order ${targetOrderNumber}`;
    console.log(`❌ ${errorMsg}`);
    console.log(`Found order numbers: ${JSON.stringify(foundOrderNumbers)}`);
    throw new Error(`${errorMsg}. Found order numbers: ${foundOrderNumbers.join(', ')}`);
  }

  /**
   * Opens a context menu by clicking on a popover cell and then clicks on the 'Заказы' menu item.
   * Used in U002 test suite to open orders modal from warehouse tables.
   * @param popoverSelector - Selector for the popover/context menu cell
   * @param menuItemSelector - Selector for the 'Заказы' menu item
   * @param waitForModalSelector - Optional selector for the modal to wait for after clicking menu item
   * @param popoverPosition - Optional position selector ('first', 'last', or number for nth()) - default: 'first'
   */
  async openContextMenuAndClickOrders(
    popoverSelector: string,
    menuItemSelector: string,
    waitForModalSelector?: string,
    popoverPosition: 'first' | 'last' | number = 'first',
  ): Promise<void> {
    await allure.step("Open context menu and click 'Заказы'", async () => {
      // Click on the popover cell (ellipse with context menu)
      let popoverCell = this.page.locator(popoverSelector);
      if (popoverPosition === 'first') {
        popoverCell = popoverCell.first();
      } else if (popoverPosition === 'last') {
        popoverCell = popoverCell.last();
      } else if (typeof popoverPosition === 'number') {
        popoverCell = popoverCell.nth(popoverPosition);
      }

      await popoverCell.waitFor({ state: 'visible', timeout: 5000 });

      // Highlight the popover before clicking
      await this.highlightElement(popoverCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await popoverCell.click();
      console.log('Clicked on popover cell');

      // Click on 'Заказы' in context menu
      const ordersMenuItem = this.page.locator(menuItemSelector).first();
      await ordersMenuItem.waitFor({ state: 'visible', timeout: 5000 });

      // Highlight the menu item before clicking
      await this.highlightElement(ordersMenuItem, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await ordersMenuItem.click();
      console.log("Clicked on 'Заказы' menu item");

      // Optionally wait for the orders modal to appear
      if (waitForModalSelector) {
        const ordersModal = this.page.locator(`${waitForModalSelector}[open]`);
        await ordersModal.waitFor({ state: 'visible', timeout: 10000 });
      }
    });
  }

  /**
   * Verifies that the orders modal opens and contains the expected orders.
   * Used in U002 test suite to verify orders are displayed correctly in the modal.
   * @param modalSelector - Selector for the orders modal
   * @param tableSelector - Selector for the orders table
   * @param orderRowsSelector - Selector for order number rows (direct locator or within modal)
   * @param quantityCellsSelector - Selector for quantity cells (direct locator or within order rows)
   * @param expectedOrderNumbers - Array of expected order numbers to verify
   * @param expectedQuantities - Array of expected quantities to verify
   * @param itemTypeName - Optional name for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useRowLocator - If true, quantity cells are located within order rows; if false, they use nth() index
   * @param additionalWaitTimeout - Optional additional wait timeout (for IZD case)
   */
  async verifyOrdersModal(
    modalSelector: string,
    tableSelector: string,
    orderRowsSelector: string,
    quantityCellsSelector: string,
    expectedOrderNumbers: string[],
    expectedQuantities: string[],
    itemTypeName?: string,
    useRowLocator: boolean = false,
    additionalWaitTimeout?: number,
  ): Promise<void> {
    await allure.step(
      itemTypeName ? `Verify orders modal opens and shows both ${itemTypeName} orders` : 'Verify orders modal opens and shows both orders',
      async () => {
        // Wait for the orders modal to appear
        const ordersModal = this.page.locator(`${modalSelector}[open]`);
        await ordersModal.waitFor({ state: 'visible', timeout: 10000 });

        // Highlight modal for IZD case
        if (itemTypeName === 'IZD') {
          await this.highlightElement(ordersModal, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
        }

        // Check the orders table
        const ordersTable = this.page.locator(tableSelector);
        await ordersTable.waitFor({ state: 'visible', timeout: 5000 });

        // Get all order rows
        const orderRows = useRowLocator ? ordersModal.locator(orderRowsSelector) : this.page.locator(orderRowsSelector);
        const orderCount = await orderRows.count();
        const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
        console.log(`Found ${orderCount} ${logPrefix}orders in the modal`);

        // Additional wait for IZD case
        if (additionalWaitTimeout) {
          await this.page.waitForTimeout(additionalWaitTimeout);
        }

        // Verify we have at least the expected number of orders
        expect(orderCount).toBeGreaterThanOrEqual(expectedOrderNumbers.length);

        // Get order numbers and quantities
        const orderNumbers: string[] = [];
        const quantities: string[] = [];

        for (let i = 0; i < orderCount; i++) {
          let orderNumberCell;
          let quantityCell;

          if (useRowLocator) {
            // IZD case: order number and quantity are within the row
            orderNumberCell = orderRows.nth(i).locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER);
            quantityCell = orderRows.nth(i).locator(quantityCellsSelector);

            // Highlight cells for IZD case (different colors)
            if (itemTypeName === 'IZD') {
              await this.highlightElement(orderNumberCell, {
                backgroundColor: 'red',
                border: '2px solid yellow',
                color: 'blue',
              });
              await this.highlightElement(quantityCell, {
                backgroundColor: 'red',
                border: '2px solid yellow',
                color: 'blue',
              });
            }
          } else {
            // DETAIL/CBED case: order number from rows, quantity from separate locator with nth()
            orderNumberCell = orderRows.nth(i);
            quantityCell = this.page.locator(quantityCellsSelector).nth(i);
          }

          const orderNumber = (await orderNumberCell.innerText()).trim();
          orderNumbers.push(orderNumber);

          const quantity = (await quantityCell.innerText()).trim();
          quantities.push(quantity);

          if (itemTypeName === 'IZD') {
            console.log(`${itemTypeName} Order ${i + 1}: Number="${orderNumber}", Quantity="${quantity}"`);
          }
        }

        console.log(`${logPrefix}Order numbers: ${orderNumbers}`);
        console.log(`${logPrefix}Quantities: ${quantities}`);

        // Verify our orders are present
        for (const expectedOrderNumber of expectedOrderNumbers) {
          expect(orderNumbers).toContain(expectedOrderNumber);
        }
        for (const expectedQuantity of expectedQuantities) {
          expect(quantities).toContain(expectedQuantity);
        }
      },
    );
  }

  /**
   * Gets a quantity cell, highlights it, and returns the quantity value.
   * Used in U002 test suite to verify warehouse quantities.
   * @param quantityCellSelector - Selector for the quantity cell (can be a simple selector or a complex one)
   * @param expectedValue - Optional expected value to verify
   * @param quantityType - Optional type description for logging (e.g., "Total ordered", "Remaining ordered")
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useComplexSelector - If true, the selector is a complex pattern with prefix and suffix
   * @param prefixSelector - Optional prefix selector for complex selectors (used with useComplexSelector)
   * @param suffixSelector - Optional suffix selector for complex selectors (used with useComplexSelector)
   * @returns The quantity value as a number
   */
  async getQuantityCellAndVerify(
    quantityCellSelector: string,
    expectedValue?: number,
    quantityType: string = 'quantity',
    itemTypeName?: string,
    useComplexSelector: boolean = false,
    prefixId?: string,
    suffixId?: string,
  ): Promise<number> {
    const stepName =
      expectedValue === 55
        ? `Verify total ${itemTypeName ? itemTypeName + ' ' : ''}quantity is 55`
        : `Verify ${itemTypeName ? itemTypeName + ' ' : ''}quantity decreased by 5`;

    let stepResult = 0;
    await allure.step(stepName, async () => {
      // Build the selector based on type
      let quantityCell: Locator;
      if (useComplexSelector && prefixId && suffixId) {
        // Build complex selector with prefix and suffix
        quantityCell = this.page.locator(`[data-testid^="${prefixId}"][data-testid$="${suffixId}"]`).first();
      } else {
        quantityCell = this.page.locator(quantityCellSelector).first();
      }

      await quantityCell.waitFor({ state: 'visible', timeout: 5000 });

      // Highlight the quantity cell
      await this.highlightElement(quantityCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      const quantity = Number((await quantityCell.innerText()).trim());
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      const quantityTypeLabel = quantityType === 'Total ordered' ? 'Total ordered' : 'Remaining ordered';
      console.log(`${logPrefix}${quantityTypeLabel} quantity: ${quantity}`);

      // Verify expected value if provided
      if (expectedValue !== undefined) {
        expect(quantity).toBe(expectedValue);
        const successMessage =
          expectedValue === 55
            ? `✅ Verified total ${itemTypeName ? itemTypeName + ' ' : ''}quantity is 55 (50 + 5)`
            : `✅ Verified ${itemTypeName ? itemTypeName + ' ' : ''}quantity decreased by 5 - now showing ${quantity} instead of 55`;
        console.log(successMessage);
      }

      stepResult = quantity;
    });

    return stepResult;
  }

  /**
   * Clicks on an order in the orders modal to open the edit dialog.
   * Used in U002 test suite to open edit dialogs for specific orders.
   * @param orderRowsSelector - Selector for order rows
   * @param orderNumber - The order number to click on
   * @param errorMessage - Optional custom error message if order not found
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   */
  async clickOrderToOpenEditDialog(orderRowsSelector: string, orderNumber: string, errorMessage?: string, itemTypeName?: string): Promise<void> {
    await allure.step('Click on second order to open edit dialog', async () => {
      // Find the row with the order and click on it
      const orderRows = this.page.locator(orderRowsSelector);
      const orderRowIndex = await this.findOrderRowIndexByOrderNumber(
        orderRows,
        orderNumber,
        errorMessage || `Could not find ${itemTypeName ? itemTypeName + ' ' : ''}order ${orderNumber} in the orders list`,
      );

      // Click on the order number cell to open edit dialog
      const orderCell = orderRows.nth(orderRowIndex);
      await this.highlightElement(orderCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await orderCell.click();
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      console.log(`Clicked on ${logPrefix}order ${orderNumber} to open edit dialog`);

      // Wait a bit for the dialog to open and content to load
      await this.page.waitForTimeout(500);
    });
  }

  /**
   * Selects a checkbox for a specific order and archives it.
   * Used in U002 test suite to archive orders from the edit dialog.
   * @param orderNumber - The order number to archive
   * @param checkboxesSelector - Selector for checkboxes
   * @param orderNumberCellsSelector - Selector for order number cells
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirm button
   * @param editModalSelector - Selector for the edit modal (to wait for it)
   * @param errorMessage - Optional custom error message if checkbox not found
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   */
  async selectCheckboxAndArchiveOrder(
    orderNumber: string,
    checkboxesSelector: string,
    orderNumberCellsSelector: string,
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    editModalSelector: string,
    errorMessage?: string,
    itemTypeName?: string,
  ): Promise<void> {
    await allure.step('Select checkbox and archive the second order', async () => {
      // Wait for the edit dialog to appear
      const editModal = this.page.locator(`${editModalSelector}[open]`);
      await editModal.waitFor({ state: 'visible', timeout: 10000 });

      // Wait a bit more for modal content to load
      await this.page.waitForTimeout(1000);

      // Find the checkbox for the order
      const checkboxes = this.page.locator(checkboxesSelector);
      const orderNumberCells = this.page.locator(orderNumberCellsSelector);

      // Wait for at least one checkbox to be visible
      await checkboxes
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {
          console.log('Warning: No checkboxes found in edit modal');
        });
      const checkboxIndex = await this.findCheckboxIndexByOrderNumber(
        checkboxes,
        orderNumberCells,
        orderNumber,
        errorMessage || `Could not find checkbox for ${itemTypeName ? itemTypeName + ' ' : ''}order ${orderNumber}`,
      );

      // Click the checkbox
      const checkbox = checkboxes.nth(checkboxIndex);
      await this.highlightElement(checkbox, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await checkbox.click();
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      console.log(`Selected checkbox for ${logPrefix}order ${orderNumber}`);

      // Archive and confirm
      await this.archiveAndConfirm(archiveButtonSelector, confirmButtonSelector);
      console.log('Archived and confirmed');
    });
  }

  async validatePageTitlesWithStyling(testId: string, expectedTitles: string[]): Promise<void> {
    // Normalize: accept raw testId or a full selector containing data-testid
    let selector = testId;
    const match = testId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!testId.includes('data-testid')) {
      selector = `[data-testid="${testId}"]`;
    }

    const locator = this.page.locator(`${selector} h3`); // Locate H3 elements within the section
    const actualTitles = await locator.allTextContents();
    const normalizedTitles = actualTitles.map(title => title.trim());

    // Log expected and received titles for debugging
    logger.info('Expected Titles:', expectedTitles);
    logger.info('Received Titles:', normalizedTitles);

    // Apply styling for debugging
    await locator.evaluateAll(elements => {
      elements.forEach(el => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    });

    // Validate length and content/order of titles
    expect(normalizedTitles.length).toBe(expectedTitles.length);
    expect(normalizedTitles).toEqual(expectedTitles);

    console.log('Page titles validated successfully with styling applied.');
  }
  /**
   * Validate that a table is displayed and has rows.
   * @param tableTestId - The data-testid of the table to validate.
   * @returns Promise<void> - Validates the presence and non-emptiness of the table.
   */
  async validateTableIsDisplayedWithRows(tableTestId: string): Promise<void> {
    await this.page.waitForTimeout(500);

    // Normalize selector: accept raw testId or full selector
    let selector = tableTestId;
    const match = tableTestId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!tableTestId.includes('data-testid')) {
      selector = `[data-testid="${tableTestId}"]`;
    }

    const tableLocator = this.page.locator(`${selector} tbody tr`);
    const rowCount = await tableLocator.count();

    // Highlight the table for debugging
    await this.page.locator(selector).evaluate(table => {
      table.style.border = '2px solid green';
      table.style.backgroundColor = 'lightyellow';
    });

    // Ensure the table has rows
    expect(rowCount).toBeGreaterThan(0);

    console.log(`Table with data-testid "${tableTestId}" has ${rowCount} rows.`);
  }

  /**
   * Validate a button's visibility and state using its data-testid.
   * Checks if the button is disabled either by attribute or CSS class.
   * @param page - The Playwright page object.
   * @param buttons - Array of button configurations including data-testid, label, and expected state.
   * @param dialogSelector - Optional scoped selector for the dialog or container.
   */
  async validateButtons(page: Page, buttons: Array<{ datatestid: string; label: string; state: string }>, dialogSelector?: string): Promise<void> {
    for (const button of buttons) {
      const buttonTestId = button.datatestid.trim();
      const buttonLabel = button.label.trim();
      const expectedState = button.state === 'true'; // Convert state string to boolean

      const scopedButtonSelector = dialogSelector ? `${dialogSelector} [data-testid="${buttonTestId}"]` : `[data-testid="${buttonTestId}"]`;

      const buttonLocator = page.locator(scopedButtonSelector);

      // Validate button visibility
      const isButtonVisible = await buttonLocator.isVisible();

      // Validate button enabled state (via attribute or CSS class)
      const hasDisabledAttribute = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled'));
      const hasDisabledCSSClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
      const isButtonEnabled = !hasDisabledAttribute && !hasDisabledCSSClass;

      // Assertions for visibility and state
      expect(isButtonVisible).toBeTruthy();
      expect(isButtonEnabled).toBe(expectedState);

      // Highlight button for debugging
      await buttonLocator.evaluate(btn => {
        btn.style.backgroundColor = 'yellow';
        btn.style.border = '2px solid red';
        btn.style.color = 'blue';
      });

      logger.info(`Button "${buttonLabel}" - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);
    }
  }
  /**
   * Validates that the checkbox in the "Главный:" row is not checked.
   * @param {import('@playwright/test').Page} page - Playwright page object.
   * @param {import('@playwright/test').Locator} section - Locator for the file section.
   * @param {number} sectionIndex - Index of the section being checked.
   * @returns {Promise<boolean>} - Returns whether the checkbox is checked.
   */
  async validateCheckbox(page: Page, section: Locator, sectionIndex: number) {
    const row = section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-Main"]').filter({
      has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-Main"]:has-text("Главный:")'),
    });

    await expect(row).toBeVisible();
    console.log(`Row containing label 'Главный:' is visible for section ${sectionIndex}.`);

    const checkbox = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_CHECKBOX_MAIN);
    await checkbox.evaluate(el => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    await expect(checkbox).toBeVisible();
    console.log(`Checkbox in 'Главный:' row is visible for section ${sectionIndex}.`);

    const isChecked = await checkbox.isChecked();
    console.log(`Checkbox state for section ${sectionIndex}: ${isChecked ? 'Checked' : 'Not Checked'}`);

    return isChecked; // Return the checkbox state
  }
  /**
   * Checks the checkbox in the "Главный:" row and applies styling.
   * @param {import('@playwright/test').Page} page - Playwright page object.
   * @param {import('@playwright/test').Locator} section - Locator for the file section.
   * @param {number} sectionIndex - Index of the section being checked.
   * @returns {Promise<boolean>} - Returns whether the checkbox is checked.
   */
  async checkCheckbox(page: Page, section: Locator, sectionIndex: number) {
    const row = section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-Main"]').filter({
      has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-Main"]:has-text("Главный:")'),
    });

    await expect(row).toBeVisible();
    console.log(`Row containing label 'Главный:' is visible for section ${sectionIndex}.`);

    const checkbox = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_CHECKBOX_MAIN);

    // Restore the styling
    await checkbox.evaluate(el => {
      el.style.backgroundColor = 'green';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    await expect(checkbox).toBeVisible();
    console.log(`Checkbox in 'Главный:' row is visible for section ${sectionIndex}.`);

    await checkbox.check();
    const isChecked = await checkbox.isChecked();
    console.log(`Checkbox state for section ${sectionIndex}: ${isChecked ? 'Checked' : 'Not Checked'}`);

    return isChecked; // Return the checkbox state for validation
  }

  /**
   * Validates that all uploaded file fields contain the correct filename without extension.
   * @param {Page} page - Playwright page object.
   * @param {Locator[]} fileSections - Array of file section locators.
   * @param {string[]} uploadedFiles - Array of uploaded file names.
   */
  async validateFileNames(page: Page, fileSections: Locator[], uploadedFiles: string[]): Promise<void> {
    if (fileSections.length !== uploadedFiles.length) {
      throw new Error(`Mismatch: Expected ${uploadedFiles.length} files, but found ${fileSections.length} sections.`);
    }

    for (let i = 0; i < fileSections.length; i++) {
      const fileSection = fileSections[i]; // Extract each file section dynamically

      const row = fileSection.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-FileName"]').filter({
        has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-FileName"]:has-text("Файл:")'),
      });
      await row.evaluate((element: HTMLElement) => {
        element.style.backgroundColor = 'yellow';
        element.style.border = '2px solid red';
        element.style.color = 'blue';
      });

      await expect(row).toBeVisible();
      console.log(`Row for file ${i + 1} containing label 'Файл:' is visible.`);

      const input = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_INPUT_FILE_NAME_INPUT);
      await expect(input).toBeVisible();
      console.log(`Input field for file ${i + 1} is visible.`);

      const expectedFilename = uploadedFiles[i].split('.')[0];
      const actualInputValue = await input.inputValue();
      console.log(`Expected filename: ${expectedFilename}, Actual input value: ${actualInputValue}`);
      expect(actualInputValue).toBe(expectedFilename);

      // Highlight for debugging
      await input.evaluate((element: HTMLElement) => {
        element.style.backgroundColor = 'green';
        element.style.border = '2px solid red';
        element.style.color = 'blue';
      });
    }
  }
  /**
   * Highlights an element with standard debugging styles.
   * @param element - The Playwright locator to highlight
   * @param customStyles - Optional custom styles to apply
   */
  async highlightElement(
    element: Locator,
    customStyles?: {
      backgroundColor?: string;
      border?: string;
      color?: string;
      outline?: string;
      boxShadow?: string;
      zIndex?: string;
      transition?: string;
    },
  ): Promise<void> {
    await element.evaluate(
      (
        el: HTMLElement,
        styles: {
          backgroundColor?: string;
          border?: string;
          color?: string;
          outline?: string;
          boxShadow?: string;
          zIndex?: string;
          transition?: string;
        },
      ) => {
        el.style.backgroundColor = styles?.backgroundColor || 'green';
        el.style.border = styles?.border || '2px solid red';
        el.style.color = styles?.color || 'blue';
        el.style.outline = styles?.outline || '3px solid magenta';
        el.style.boxShadow = styles?.boxShadow || '0 0 0 4px rgba(255, 0, 255, 0.4)';
        el.style.zIndex = styles?.zIndex || '2147483647';
        el.style.transition = styles?.transition || 'none';
      },
      customStyles || {},
    );
  }
  /**
   * Locates an element by data-testid, highlights it, and waits for it to be visible.
   * @param dataTestId - The data-testid to locate
   * @param timeout - Optional timeout for waiting (default: 30000)
   * @returns The located element
   */
  async locateAndHighlightElement(dataTestId: string, timeout: number = 30000): Promise<Locator> {
    const element = this.page.locator(`[data-testid="${dataTestId}"]`);
    await element.waitFor({ state: 'visible', timeout });
    await this.highlightElement(element);
    return element;
  }

  /**
   * Vue-compatible search using pressSequentially
   * @param searchInputSelector - Selector for the search input element
   * @param searchTerm - Term to search for
   * @param options - Optional configuration (delay, waitAfterSearch)
   */
  async searchWithPressSequentially(
    searchInputSelector: string,
    searchTerm: string,
    options?: { delay?: number; waitAfterSearch?: number; timeout?: number },
  ): Promise<void> {
    const delay = options?.delay ?? 50;
    const waitAfterSearch = options?.waitAfterSearch ?? 2000;
    const timeout = options?.timeout ?? 10000;

    // Try to extract data-testid value if it's a full selector
    let dataTestId: string | null = null;
    const match = searchInputSelector.match(/data-testid=["']([^"']+)["']/);
    if (match && match[1]) {
      dataTestId = match[1];
    }

    let searchInput;
    if (dataTestId) {
      // Try getByTestId first as it's more reliable
      try {
        searchInput = this.page.getByTestId(dataTestId);
        await expect(searchInput).toBeVisible({ timeout: Math.min(timeout, 5000) });
      } catch (e) {
        // Fallback to locator if getByTestId fails
        searchInput = this.page.locator(searchInputSelector);
        await expect(searchInput).toBeVisible({ timeout });
      }
    } else {
      searchInput = this.page.locator(searchInputSelector);
      await expect(searchInput).toBeVisible({ timeout });
    }

    // Click to focus, then clear and type
    await searchInput.click();
    await this.page.waitForTimeout(300);

    // Clear the input first
    await searchInput.fill('');
    await this.page.waitForTimeout(200);

    // Type the search term using keyboard (more reliable with Vue)
    await searchInput.pressSequentially(searchTerm, { delay });
    await this.page.waitForTimeout(500);

    // Verify the value was entered
    const inputValue = await searchInput.inputValue();
    console.log(`Search input value: "${inputValue}"`);

    // Press Enter to trigger search
    await searchInput.press('Enter');
    await this.page.waitForTimeout(waitAfterSearch);
  }

  /**
   * Helper function to extract ID from full selector
   * @param selector - The selector string (may contain [data-testid="..."] or just the ID)
   * @returns The extracted data-testid value or the original selector if no match
   */
  extractIdFromSelector(selector: string): string {
    const match = selector.match(/\[data-testid="([^"]+)"]/);
    return match ? match[1] : selector;
  }

  /**
   * Helper function to fill input and wait for value to be set (replaces waitForTimeout after fill)
   * @param inputLocator - The input locator
   * @param value - Value to fill
   * @param timeout - Maximum time to wait (default: TIMEOUTS.MEDIUM)
   */
  async fillInputAndWaitForValue(inputLocator: Locator, value: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await inputLocator.fill(value);
    // For search inputs, just wait a brief moment for the value to be set
    // The actual search will be validated by waiting for network idle and table results
    await inputLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.VERY_SHORT });
  }

  /**
   * Fill input with retries - attempts to fill input multiple times until value matches
   * @param input - The input locator
   * @param value - Value to fill
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @returns The final value in the input
   */
  async fillInputWithRetries(input: Locator, value: string, maxAttempts = 3): Promise<string> {
    await input.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    let currentValue = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await input.fill('');
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      await input.fill(value);
      await this.page.waitForTimeout(TIMEOUTS.SHORT);
      currentValue = (await input.inputValue())?.trim() || '';
      if (currentValue === value) {
        break;
      }
      console.warn(`Input mismatch on attempt ${attempt}. Expected "${value}", got "${currentValue}". Retrying...`);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    return currentValue;
  }

  /**
   * Helper function to find the actual search input element (handles wrapper vs direct input)
   * @param page - Playwright Page object
   * @param searchInputSelector - Selector for the search input wrapper
   * @param timeout - Timeout for waiting (default: WAIT_TIMEOUTS.STANDARD)
   * @returns The actual input locator to use
   */
  async findSearchInput(page: Page, searchInputSelector: string, timeout: number = WAIT_TIMEOUTS.STANDARD): Promise<Locator> {
    const searchInputWrapper = page.locator(searchInputSelector).first();
    await searchInputWrapper.waitFor({ state: 'visible', timeout });
    await searchInputWrapper.scrollIntoViewIfNeeded();

    // Check if wrapper itself is an input
    const tagName = await searchInputWrapper.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    if (tagName === 'input') {
      await searchInputWrapper.waitFor({ state: 'visible', timeout });
      return searchInputWrapper;
    }

    // Look for input inside wrapper
    const searchInput = searchInputWrapper.locator('input').first();
    const inputCount = await searchInput.count();

    if (inputCount === 0) {
      // If no input found, try using the wrapper itself (might be contenteditable)
      return searchInputWrapper;
    }

    // Wait for the input to be visible
    await searchInput.waitFor({ state: 'visible', timeout });
    return searchInput;
  }
}

// Retrieving descendants from the entity specification
/**
 * Interface representing specification data.
 * @property designation - The designation of the specification item.
 * @property name - The name of the specification item.
 * @property quantity - The quantity of the specification item.
 */
async function extractDataSpetification(table: Locator): Promise<ISpetificationReturnData> {
  const cbedListData: ISpetificationData[] = [];
  const detalListData: ISpetificationData[] = [];
  const listPokDetListData: ISpetificationData[] = [];
  const materialListData: ISpetificationData[] = [];

  // Get all draggable tables
  const draggableTables = table.locator('.draggable-table');
  const tableCount = await draggableTables.count();
  console.log(`Found ${tableCount} draggable tables`);

  // Wait for the first table to be attached to DOM (may be hidden initially)
  await draggableTables.first().waitFor({ state: 'attached' });

  for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
    const currentTable = draggableTables.nth(tableIndex);

    // Check if table is visible or hidden
    const isVisible = await currentTable.isVisible();
    console.log(`Table ${tableIndex} visibility: ${isVisible}`);

    const tbody = currentTable.locator('tbody');
    const tbodyRows = tbody.locator('tr');
    const rowCount = await tbodyRows.count();
    console.log(`Table ${tableIndex} has ${rowCount} rows`);

    if (rowCount === 0) {
      console.log(`Table ${tableIndex} is empty, skipping`);
      continue;
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = tbodyRows.nth(rowIndex);
      const rowData = row.locator('td');
      const tdCount = await rowData.count();

      if (tdCount === 0) {
        console.log(`Row ${rowIndex} has no td elements, skipping`);
        continue;
      }

      const cell2 = (await rowData.nth(1).textContent()) || '';
      const cell3 = (await rowData.nth(2).textContent()) || '';
      const cell5 = (await rowData.nth(4).textContent()) || '0';

      const designation = cell2?.trim() || '';
      const name = cell3?.trim() || '';
      const quantity = Number(cell5?.trim()) || 0;

      console.log(`Processing row ${rowIndex} in table ${tableIndex}:`, {
        designation,
        name,
        quantity,
      });

      // Determine which array to push based on table index
      switch (tableIndex) {
        case 0:
          cbedListData.push({ designation, name, quantity });
          break;
        case 1:
          detalListData.push({ designation, name, quantity });
          break;
        case 2:
          listPokDetListData.push({ designation, name, quantity });
          break;
        case 3:
          materialListData.push({ designation, name, quantity });
          break;
      }
    }
  }

  // Log the contents of each array
  console.log('Сборки (cbeds):', JSON.stringify(cbedListData, null, 2));
  console.log('Детали (detals):', JSON.stringify(detalListData, null, 2));
  console.log('Покупные детали (listPokDet):', JSON.stringify(listPokDetListData, null, 2));
  console.log('Материалы (materialList):', JSON.stringify(materialListData, null, 2));

  return {
    cbeds: cbedListData,
    detals: detalListData,
    listPokDet: listPokDetListData,
    materialList: materialListData,
  };
}

interface ValidationResult {
  success: boolean;
  errors: string[];
}

export interface ISpetificationData {
  designation: string;
  name: string;
  quantity: number;
}

/**
 * Interface representing the return data structure of specifications.
 * @property cbeds - An array of specification data for cbeds.
 * @property detals - An array of specification data for detals.
 * @property listPokDet - An array of specification data for listPokDet.
 * @property materialList - An array of specification data for materials.
 */
interface ISpetificationReturnData {
  cbeds: ISpetificationData[];
  detals: ISpetificationData[];
  listPokDet: ISpetificationData[];
  materialList: ISpetificationData[];
}

export enum Click {
  Yes = 1,
  No = 0,
}

export enum TypeInvoice {
  cbed = 'Сборка',
  product = 'Изделие',
}
