import { Page, TestInfo, TestInfoError, Locator } from '@playwright/test';
import { SELECTORS } from '../../config';
import * as SelectorsPartsDataBase from '../Constants/SelectorsPartsDataBase';
import logger from './logger';

/**
 * Interface representing specification data.
 * @property designation - The designation of the specification item.
 * @property name - The name of the specification item.
 * @property quantity - The quantity of the specification item.
 */
export interface ISpetificationData {
  designation: string;
  name: string;
  quantity: number;
}

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
 * Utility function to populate test data arrays
 * @param page - The Playwright Page object
 * @param skipNavigation - Whether to skip navigation to parts database page
 */
export async function populateTestData(page: Page, skipNavigation = false) {
  // Lazy import to avoid circular dependency (PartsDatabasePage imports PageObject from Page.ts)
  const { CreatePartsDatabasePage } = await import('../../pages/PartsDatabasePage');
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
      logger.log(`Found existing detail: ${arrayDetail[0].name}`);
    } else {
      arrayDetail = [];
      logger.log('No existing details found');
    }
  } catch (error) {
    console.error('Error populating detail array:', error);
    arrayDetail = [];
  }

  // Get existing assemblies (CBED)
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
      logger.log(`Found existing assembly: ${arrayCbed[0].name}`);
    } else {
      arrayCbed = [];
      logger.log('No existing assemblies found');
    }
  } catch (error) {
    console.error('Error populating cbed array:', error);
    arrayCbed = [];
  }

  // Get existing products (IZD)
  try {
    const izdTable = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
    await izdTable.waitFor({ state: 'visible', timeout: 5000 });
    const izdRows = izdTable.locator('tbody tr');
    const izdCount = await izdRows.count();

    if (izdCount > 0) {
      const firstIzdRow = izdRows.first();
      const izdName = await firstIzdRow.locator('td').nth(1).textContent();
      const izdDesignation = await firstIzdRow.locator('td').nth(2).textContent();
      arrayIzd = [
        {
          name: izdName?.trim() || 'DEFAULT_IZD',
          designation: izdDesignation?.trim() || '-',
        },
      ];
      logger.log(`Found existing product: ${arrayIzd[0].name}`);
    } else {
      arrayIzd = [];
      logger.log('No existing products found');
    }
  } catch (error) {
    console.error('Error populating izd array:', error);
    arrayIzd = [];
  }
}

/**
 * Wraps expect.soft() with automatic screenshot capture on failure
 * @param page - The Playwright Page object
 * @param assertionFn - The assertion function to execute
 * @param description - Optional description for the assertion (used in screenshot filename)
 * @param testInfo - Optional TestInfo object for attaching screenshots to test report
 */
export async function expectSoftWithScreenshot(
  page: Page,
  assertionFn: () => void | Promise<void>,
  description?: string,
  testInfo?: TestInfo,
): Promise<void> {
  const getSoftErrorCount = (): number => {
    // Access Playwright's internal soft assertion error count
    // This is a workaround since Playwright doesn't expose this directly
    const test = (page as any).__test;
    if (test && test.info) {
      return (test.info() as any).errors?.length || 0;
    }
    return 0;
  };

  const errorCountBefore = getSoftErrorCount();

  try {
    await assertionFn();
  } catch (error) {
    // Re-throw to let Playwright handle it
    throw error;
  }

  const errorCountAfter = getSoftErrorCount();
  const hasError = errorCountAfter > errorCountBefore;

  if (hasError) {
    try {
      const timestamp = Date.now();
      const safeDescription = description
        ? description.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
        : 'soft_assert';
      const screenshotPath = `test-results/soft-assert-${safeDescription}-${timestamp}.png`;

      await page.screenshot({ path: screenshotPath, fullPage: true });

      if (testInfo) {
        await testInfo.attach('soft-assert-screenshot', {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }

      const attachmentNote = testInfo
        ? ' (attached to test report - will appear in HTML report on failure)'
        : '';
      logger.log(`📸 Screenshot captured for soft assertion: ${description}`);
      logger.log(`   Screenshot path: ${screenshotPath}${attachmentNote}`);

      (page as any).__lastSoftAssertScreenshot = screenshotPath;
    } catch (error) {
      logger.log(`Could not capture screenshot for soft assertion: ${error}`);
    }
  }
}

/**
 * Normalizes text by removing extra whitespace and normalizing Unicode characters
 * @param text - The text string to normalize
 * @returns The normalized text string
 */
export function normalizeText(text: string): string {
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
export function normalizeOrderNumber(orderNum: string): string {
  return orderNum.replace(/^№\s*/, '').trim();
}

/**
 * Normalizes date strings to DD.MM.YYYY format
 * Handles formats: DD.MM.YYYY, DD.MM.YY, and month names (янв, фев, etc.)
 * @param rawDate - The raw date string to normalize
 * @returns Normalized date string in DD.MM.YYYY format, or original string if it's just a number
 */
export function normalizeDate(rawDate: string): string {
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
 * Extracts the data-testid value from a selector string
 * @param selector - The selector string (e.g., '[data-testid="MyElement"]')
 * @returns The extracted data-testid value, or the original selector if no match found
 */
export function extractIdFromSelector(selector: string): string {
  const match = selector.match(/\[data-testid="([^"]+)"]/);
  return match ? match[1] : selector;
}

/**
 * Recursively compares two arrays to check if they are identical
 * @param arr1 - First array to compare
 * @param arr2 - Second array to compare
 * @returns Promise that resolves to true if arrays are identical, false otherwise
 */
export async function arraysAreIdentical<T>(arr1: T[], arr2: T[]): Promise<boolean> {
  if (arr1.length !== arr2.length) {
    return false; // Arrays have different lengths
  }

  for (let i = 0; i < arr1.length; i++) {
    const value = arr1[i];
    const value2 = arr2[i];
    if (Array.isArray(value) && Array.isArray(value2)) {
      const areEqual = await arraysAreIdentical(value, value2); // Recursive call
      if (!areEqual) {
        return false;
      }
    } else if (value !== value2) {
      return false; // Compare primitives
    }
  }

  return true;
}

/**
 * This method counts the number of sub headers for a group of columns. IE, they have a parent column above them.
 * @param headers - The headers object containing columns and their sub-headers.
 * @returns The total count of columns, including sub-headers.
 */
export async function countColumns(headers: any): Promise<number> {
  let count = 0;
  for (const key in headers) {
    if (headers[key].subHeaders) {
      count += await countColumns(headers[key].subHeaders); // Await the result
    }
    count++; // Ensure each top-level column is counted
  }
  return count;
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

/**
 * Retrieving descendants from the entity specification
 * Extracts specification data from draggable tables
 * @param table - The Locator for the table containing draggable tables
 * @returns Promise resolving to specification data organized by type
 */
export async function extractDataSpetification(table: Locator): Promise<ISpetificationReturnData> {
  const cbedListData: ISpetificationData[] = [];
  const detalListData: ISpetificationData[] = [];
  const listPokDetListData: ISpetificationData[] = [];
  const materialListData: ISpetificationData[] = [];

  // Get all draggable tables
  const draggableTables = table.locator('.draggable-table');
  const tableCount = await draggableTables.count();
  logger.log(`Found ${tableCount} draggable tables`);

  // Wait for the first table to be attached to DOM (may be hidden initially)
  await draggableTables.first().waitFor({ state: 'attached' });

  for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
    const currentTable = draggableTables.nth(tableIndex);

    // Check if table is visible or hidden
    const isVisible = await currentTable.isVisible();
    logger.log(`Table ${tableIndex} visibility: ${isVisible}`);

    const tbody = currentTable.locator('tbody');
    const tbodyRows = tbody.locator('tr');
    const rowCount = await tbodyRows.count();
    logger.log(`Table ${tableIndex} has ${rowCount} rows`);

    if (rowCount === 0) {
      logger.log(`Table ${tableIndex} is empty, skipping`);
      continue;
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = tbodyRows.nth(rowIndex);
      const rowData = row.locator('td');
      const tdCount = await rowData.count();

      if (tdCount === 0) {
        logger.log(`Row ${rowIndex} has no td elements, skipping`);
        continue;
      }

      const cell2 = (await rowData.nth(1).textContent()) || '';
      const cell3 = (await rowData.nth(2).textContent()) || '';
      const cell5 = (await rowData.nth(4).textContent()) || '0';

      const designation = cell2?.trim() || '';
      const name = cell3?.trim() || '';
      const quantity = Number(cell5?.trim()) || 0;

      logger.log(`Processing row ${rowIndex} in table ${tableIndex}:`, {
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
  logger.log('Сборки (cbeds):', JSON.stringify(cbedListData, null, 2));
  logger.log('Детали (detals):', JSON.stringify(detalListData, null, 2));
  logger.log('Покупные детали (listPokDet):', JSON.stringify(listPokDetListData, null, 2));
  logger.log('Материалы (materialList):', JSON.stringify(materialListData, null, 2));

  return {
    cbeds: cbedListData,
    detals: detalListData,
    listPokDet: listPokDetListData,
    materialList: materialListData,
  };
}
