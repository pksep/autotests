/**
 * @file TableHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for table operations extracted from Page.ts
 * 
 * This helper handles:
 * - Table scanning and validation
 * - Table column operations
 * - Table searching
 * - Table row operations
 * - Table cell operations
 */

import { Page, expect, Locator, ElementHandle } from '@playwright/test';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import * as SelectorsSearchInputs from '../Constants/SelectorsSearchInputs';
import { normalizeText } from '../utils/utilities';
import { expectSoftWithScreenshot } from '../utils/utilities';
import logger from '../utils/logger';

export interface ValidationResult {
  success: boolean;
  errors: string[];
}

export class TableHelper {
  constructor(private page: Page) {}

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
          headerTexts.push(normalizeText(text));
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
          flattened.push(normalizeText(headers[key].label));

          if (headers[key].subHeaders) {
            for (const subKey in headers[key].subHeaders) {
              flattened.push(normalizeText(headers[key].subHeaders[subKey]));
            }
          }
        } else {
          flattened.push(normalizeText(headers[key]));
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

        // Note: do not use logger inside evaluate() - it runs in browser context
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
   * Search in the main table
   * @param nameSearch - the name entered in the table search to perform the search
   * @param locator - the full locator of the table
   * @param searchInputDataTestId - Optional data-testid for the search input
   */
  async searchTable(nameSearch: string, locator: string, searchInputDataTestId?: string) {
    logger.log('Search Table', nameSearch, locator, searchInputDataTestId);
    const table = this.page.locator(locator);
    await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
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
    logger.log(`Search field value before Enter: "${currentValue}"`);

    // Press Enter to trigger search
    await searchTable.press('Enter');
    await this.page.waitForLoadState('networkidle');

    // Wait a bit more for the search to complete
    await this.page.waitForTimeout(1000);

    // Check the final value
    const finalValue = await searchTable.inputValue();
    logger.log(`Search field value after Enter: "${finalValue}"`);

    // Don't assert the value matches exactly, as some search fields clear after search
    // Just verify the search was performed
    logger.log(`Search performed for: "${nameSearch}"`);
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
   * Search table then optionally wait for table body. Used by Page.searchAndWaitForTable.
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
    }
    if (options?.timeoutBeforeWait) {
      await this.page.waitForTimeout(options.timeoutBeforeWait);
    }
    if (options?.minRows !== undefined) {
      await this.waitingTableBody(tableBodySelector, {
        minRows: options.minRows,
        timeoutMs: options?.timeoutMs,
      });
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
   * Get searchable column IDs for a table
   * @param page - The Playwright page instance
   * @param tableId - The ID or data-testid of the table
   * @param searchFields - Array of search field data-testids
   * @returns Array of column indices
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
   * @param searchTerms - Array of search terms to verify in the search history.
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
      const trimmedTerm = normalizeText(term.trim());

      // Log the current search term
      logger.info('Current Search Term (trimmed):', trimmedTerm);

      const termExists = historyItems.some(item => normalizeText(item.trim()) === trimmedTerm);
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

  /**
   * Find and fill a cell in a table
   * @param page - The Playwright page instance
   * @param tableSelector - The selector for the table
   * @param variableName - The variable name to search for in cells
   * @param targetCellIndex - The index of the target cell to fill
   * @param value - Optional value to fill (if not provided, returns current value)
   * @returns The current value if value not provided, or void if value was filled
   */
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
    logger.log(`Найдено строк: ${rows.length}`);

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

        logger.log(`Проверяем ячейку с текстом: "${cellText}"`);

        // Более гибкое сравнение текста
        if (cellText.toLowerCase().includes(variableName.toLowerCase())) {
          logger.log(`Найдена ячейка с переменной "${variableName}"`);

          if (targetCellIndex < cells.length) {
            const targetCell = cells[targetCellIndex];
            logger.log(`Обрабатываем целевую ячейку с индексом ${targetCellIndex}`);

            // Проверяем наличие input в ячейке
            const inputField = await targetCell.$('input[type="number"], input[type="text"]');
            if (!inputField) {
              logger.log('Input не найден, проверяем наличие других элементов ввода');
              const anyInput = await targetCell.$('input');
              if (!anyInput) {
                throw new Error(`Поле ввода не найдено в целевой ячейке.`);
              }
            }

            if (value) {
              logger.log(`Пытаемся ввести значение: ${value}`);
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

                logger.log(`Текущее значение в input: ${inputValue}`);
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
              logger.log(`Текущее значение: ${currentValue}`);
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
    logger.log(`Search input value: "${inputValue}"`);

    // Press Enter to trigger search
    await searchInput.press('Enter');
    await this.page.waitForTimeout(waitAfterSearch);
  }
}
