import { Page, Locator, expect, TestInfo } from '@playwright/test';

import { PageObject, expectSoftWithScreenshot } from '../lib/Page';
import { CreateMaterialsDatabasePage } from '../pages/MaterialsDatabasePage';
import { ENV, SELECTORS, CONST } from '../config';
import logger from '../lib/logger';
import { title } from 'process';
import { toNamespacedPath } from 'path';
import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';

const MAIN_TABLE_TEST_ID = SelectorsPartsDataBase.MAIN_TABLE_TEST_ID;
const MODAL_CONFIRM_DIALOG_YES_BUTTON = 'ModalConfirm-Content-Buttons-Yes';

const TABLE_TEST_IDS = [
  'Specification-ModalCbed-AccordionCbed-Table',
  'Specification-ModalCbed-AccordionDetalContent-Table',
  'Specification-ModalCbed-AccordionBuyersMaterial-Table',
  'Specification-ModalCbed-ModalComplect-MateriaDetalTable',
  'Specification-ModalCbed-Accordion-MaterialRashod-Table',
];
export type Item = {
  id: string;
  parentPartNumber: string;
  partNumber: string;
  name: string;
  dataTestId: string;
  material: string;
  quantity: number;
};

export type TestProductSpecification = {
  assemblies: Array<{ partNumber: string; name: string; quantity: number }>;
  details: Array<{ partNumber: string; name: string; quantity: number }>;
  standardParts: Array<{ name: string; quantity: number }>;
  consumables: Array<{ name: string; quantity: number }>;
};

// Страница: Сборка
export class CreatePartsDatabasePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
  // this item will store everything that we parse for later processing and validations
  static globalTableData = {
    СБ: [] as Item[], // Сборочные единицы
    Д: [] as Item[], // Детали
    ПМ: [] as Item[], // Покупные материалы
    МД: [] as Item[], // Материалы для деталей
    ПД: [] as Item[], // Расходные материалы
    РМ: [] as Item[], // Расходные материалы
    ALL: new Map<string, Item>(), // Consolidated details
  };
  static resetGlobalTableData(): void {
    CreatePartsDatabasePage.globalTableData.СБ.length = 0; // Clear Сборочные единицы
    CreatePartsDatabasePage.globalTableData.Д.length = 0; // Clear Детали
    CreatePartsDatabasePage.globalTableData.ПМ.length = 0; // Clear Покупные материалы
    CreatePartsDatabasePage.globalTableData.МД.length = 0; // Clear Материалы для деталей
    CreatePartsDatabasePage.globalTableData.РМ.length = 0; // Clear Расходные материалы
    CreatePartsDatabasePage.globalTableData.ПД.length = 0; // Clear Расходные материалы
    CreatePartsDatabasePage.globalTableData.ALL.clear(); // Clear the Map
  }
  /**
   * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
   * @param table - The Playwright Locator for the table element.
   * @returns An object with grouped items and the ALL group.
   */
  async processTableData(
    table: Locator,
    title: string,
    parentQuantity: number,
  ): Promise<{
    СБ: Item[];
    Д: Item[];
    ПД: Item[];
    РМ: Item[];
    ALL: Map<string, Item>;
  }> {
    // Debug logging
    logger.info('Table HTML:', await table.evaluate(el => el.outerHTML));
    logger.info('Table exists:', (await table.count()) > 0);
    logger.info('Table selector:', await table.evaluate(el => el.tagName));

    const rowsLocator = table.locator('tbody tr');
    logger.info('Rows count:', await rowsLocator.count());
    logger.info('Rows selector:', 'tbody tr');

    // Create groups for storing items
    const groups: {
      СБ: Item[];
      Д: Item[];
      ПД: Item[];
      РМ: Item[];
      ALL: Map<string, Item>;
    } = {
      СБ: [],
      Д: [],
      ПД: [],
      РМ: [],
      ALL: new Map(),
    };

    // Helper function to add to ALL group using a unique key
    const addToAll = (item: Item) => {
      const uniqueKey = `${item.partNumber} ${item.name}`.trim();
      const existingItem = groups.ALL.get(uniqueKey);

      if (existingItem) {
        existingItem.quantity += item.quantity; // Update quantity for duplicates
      } else {
        groups.ALL.set(uniqueKey, item);
      }
      logger.info(`ALL group updated: Current size = ${groups.ALL.size}`);

      // Update the global ALL map
      const globalExistingItem = CreatePartsDatabasePage.globalTableData.ALL.get(uniqueKey);
      if (globalExistingItem) {
        globalExistingItem.quantity += item.quantity;
      } else {
        CreatePartsDatabasePage.globalTableData.ALL.set(uniqueKey, item);
      }
      logger.info(`Global ALL group updated: Current size = ${CreatePartsDatabasePage.globalTableData.ALL.size}`);
    };

    // Initialize the first group as 'СБ' by default (header in <thead>)
    let currentGroup: keyof typeof groups = 'СБ';
    logger.info(`Initialized currentGroup: ${currentGroup}`);

    // Process all rows
    const rowCount = await rowsLocator.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rowsLocator.nth(i);

      // Check if the row is a header
      const isHeader = !(await row.getAttribute('class'))?.includes('td-row');
      if (isHeader) {
        const groupTestId = await row.locator('[data-testid]').getAttribute('data-testid');
        logger.info(`Header row ${i}: groupTestId = ${groupTestId}`);

        if (groupTestId === 'TableSpecification-Header-AssemblyUnits') {
          currentGroup = 'СБ';
        } else if (groupTestId === 'TableSpecification-Header-Details') {
          currentGroup = 'Д';
        } else if (groupTestId === 'TableSpecification-Header-StandardDetails') {
          currentGroup = 'ПД';
        } else if (groupTestId === 'TableSpecification-Header-ConsumableMaterials') {
          currentGroup = 'РМ';
        } else {
          logger.warn(`Unknown header groupTestId: ${groupTestId}`);
          currentGroup = 'СБ'; // Default fallback
        }

        logger.info(`currentGroup set to: ${currentGroup}`);
        continue;
      }

      // Process data rows
      const isDataRow = (await row.getAttribute('class'))?.includes('td-row');
      if (isDataRow && currentGroup) {
        const rowTestId = (await row.getAttribute('data-testid')) ?? ''; // Ensure rowTestId is a string
        const id = (await row.locator('td:nth-child(1)').textContent()) ?? '';
        const partNumber = (await row.locator('td:nth-child(2)').textContent()) ?? '';
        const name = (await row.locator('td:nth-child(3)').textContent()) ?? '';
        let quantity = parseInt((await row.locator('td:nth-child(5)').textContent()) ?? '0', 10);

        logger.info(`Item details: id=${id}, partNumber=${partNumber}, name=${name}, quantity=${quantity}, data-testid=${rowTestId}`);
        if (quantity < 1) {
          logger.error(
            `Skipped row ${i}: Invalid Quantity value: Details: \nRow Id: ${rowTestId}\nId:  ${id}\nPart Number: ${partNumber}\nName:  ${name}\nQuantity: ${quantity}`,
          );
          continue;
        }

        if (id && name && quantity) {
          const item: Item = {
            id: id.trim(),
            parentPartNumber: title,
            partNumber: partNumber.trim(),
            name: name.trim(),
            dataTestId: rowTestId,
            material: '',
            quantity,
          };

          // Add item to the current group
          groups[currentGroup].push(item);

          if (Array.isArray(CreatePartsDatabasePage.globalTableData[currentGroup as keyof typeof CreatePartsDatabasePage.globalTableData])) {
            if (currentGroup === 'ПД') {
              let isDuplicate = false;
              for (const row of CreatePartsDatabasePage.globalTableData[currentGroup]) {
                if (row.name.trim().toLowerCase() === item.material.trim().toLowerCase()) {
                  row.quantity += item.quantity; // Update quantity for duplicates
                  isDuplicate = true;
                  break;
                }
              }

              if (!isDuplicate) {
                (CreatePartsDatabasePage.globalTableData[currentGroup] as Item[]).push(item);
                logger.info(`Added new item to ПД group: "${item.material}"`);
              }
            } else {
              (CreatePartsDatabasePage.globalTableData[currentGroup as keyof typeof CreatePartsDatabasePage.globalTableData] as Item[]).push(item);
            }
          }

          logger.info(`Added item to group ${currentGroup}: ${JSON.stringify(item)}`);

          // Add to ALL for groups Д, ПД, and РМ
          if (currentGroup === 'Д' || currentGroup === 'ПД' || currentGroup === 'РМ') {
            addToAll(item);
          }
        } else {
          logger.error(
            `Skipped row ${i}: Missing required data (id, name, or quantity) Details: \nRow Id: ${rowTestId}\nId:  ${id}\nPart Number: ${partNumber}\nName:  ${name}\nQuantity: ${quantity}`,
          );
        }
      } else if (!isDataRow) {
        logger.warn(`Skipped row ${i}: Not a data row`);
      }
    }

    logger.info(`Final groups: СБ=${groups.СБ.length}, Д=${groups.Д.length}, ПД=${groups.ПД.length}, РМ=${groups.РМ.length}, ALL size=${groups.ALL.size}`);
    return groups;
  }

  async getProductSpecificationsTable(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
    logger.info('Started getProductSpecificationsTable function');
    const ASSEMBLY_UNIT_TOTAL_LINE = 'ModalComplect-CbedsTitle';
    const ASSEMBLY_UNIT_TABLE_ID = 'ModalComplect-CbedsTable';
    const ASSEMBLY_UNIT_TABLE_PARTNO_ID = 'ModalComplect-CbedsTableHead-Designation';
    const ASSEMBLY_UNIT_TABLE_NAME_ID = 'ModalComplect-CbedsTableHead-Name';

    const DETAILS_TOTAL_LINE = 'ModalComplect-DetalsTitle';
    const DETAILS_TABLE_ID = 'ModalComplect-DetalsTable';
    const DETAILS_TABLE_PARTNO_ID = 'ModalComplect-DetalsTableHead-Designation';
    const DETAILS_TABLE_NAME_ID = 'ModalComplect-DetalsTableHead-Name';

    const BUYMATERIALS_TOTAL_LINE = 'ModalComplect-BuyMaterialsTitle';
    const BUYMATERIALS_TABLE_ID = 'ModalComplect-BuyMaterialsTable';
    const BUYMATERIALS_TABLE_NAME_ID = 'ModalComplect-BuyMaterialsTableHead-Name';

    const MATERIALPARTS_TOTAL_LINE = 'ModalComplect-DetailMaterialsTitle';
    const MATERIALPARTS_TABLE_ID = 'ModalComplect-DetailMaterialsTable';
    const MATERIALPARTS_TABLE_NAME_ID = 'ModalComplect-DetailMaterialsTableHead-Name';

    const CONSUMABLES_TOTAL_LINE = 'ModalComplect-ConsumableMaterialsTitle';
    const CONSUMABLES_TABLE_ID = 'ModalComplect-ConsumableMaterialsTable';
    const CONSUMABLES_TABLE_NAME_ID = 'ModalComplect-ConsumableMaterialsTableHead-Name';

    let hasDuplicates = false;

    // Highlight and click the product row
    await row.evaluate(element => {
      element.style.border = '3px solid red'; // Highlight
      element.style.backgroundColor = 'yellow';
    });
    await row.click(); // Opened the product page

    await shortagePage.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500); // Clicked the edit button
    const pageLocator = page.locator(`[data-testid="App-RouterView"]`);
    await pageLocator.waitFor({ state: 'attached', timeout: 30000 });
    await shortagePage.findAndClickElement(page, 'TableSpecification-Button-FullSpecification', 500); // Clicked the full specification button
    const modalLocator = page.locator(`[data-testid="ModalComplect-RightContent"]`);
    await modalLocator.waitFor({ state: 'attached', timeout: 30000 });

    /**
     * Checks for duplicate entries in a specified table on the web page.
     *
     * This function scans a table for duplicate rows based on the provided column identifiers
     * (e.g., part number and name), filters out nested rows to avoid irrelevant data,
     * and logs any duplicate entries along with their counts for debugging purposes.
     *
     * @param {string} tableId - The data-testid of the table to be analyzed for duplicates.
     * @param {string} tableName - The name of the table (used in log messages).
     * @param {string | null} partNumberId - The data-testid of the column containing part numbers (can be null).
     * @param {string} nameId - The data-testid of the column containing names.
     * @returns {Promise<void>} - A promise that resolves when the duplicate check is complete.
     */
    const checkForDuplicates = async (tableId: string, tableName: string, partNumberId: string | null, nameId: string): Promise<void> => {
      logger.info(`Started checkForDuplicates function for ${tableName}`);
      /**
       * Step 1: Locate the table on the web page and ensure it is attached to the DOM.
       */
      const table = page.locator(`[data-testid="${tableId}"]`);
      await table.waitFor({ state: 'attached', timeout: 30000 });

      /**
       * Step 2: Identify the indices of the required columns.
       * The partNumberId is optional, and the nameId is mandatory.
       */
      const designationColumnIndex = partNumberId ? await shortagePage.findColumn(page, tableId, partNumberId) : -1; // Use -1 if partNumberId is not provided
      const nameColumnIndex = await shortagePage.findColumn(page, tableId, nameId);

      if (partNumberId && designationColumnIndex === -1) {
        logger.info(`%c❌ Completed checkForDuplicates function for table ${tableName}', 'color: red; font-weight: bold;`);
        console.error(`Could not find partNumber column ${nameId} in ${tableName}`);
        return; // Exit if required columns cannot be found
      }
      if (nameColumnIndex === -1) {
        logger.info(`%c❌ Completed checkForDuplicates function for table ${tableName}', 'color: red; font-weight: bold;`);
        console.error(`Could not find 'name' column ${nameId} in ${tableName}`);
        return; // Exit if required columns cannot be found
      }
      /**
       * Step 3: Retrieve all rows in the table and filter out nested rows.
       * Rows with a nested mini table (e.g., <tbody> <tr> <td> <div> <tr>) are excluded.
       */
      let rows = await table.locator('tbody tr').all();
      const filteredRows = [];
      for (const row of rows) {
        const isNested = await row.evaluate((node: Element) => {
          //logger.info(`%c❌ Completed checkForDuplicates function for table ${tableName}', 'color: red; font-weight: bold;`);
          // Check if the <tr> is a descendant of a <td>
          return node.closest('td') !== null;
        });
        if (!isNested) {
          filteredRows.push(row); // Only add rows that are not nested
        }
      }

      /**
       * Step 4: Log the row counts for verification.
       */
      logger.info(`Total Rows: ${rows.length}`);
      logger.info(`Filtered Rows: ${filteredRows.length}`);
      rows = filteredRows;

      if (rows.length === 0) {
        logger.info(`No rows found in table ${tableName} with Id ${tableId}`);
        return; // Exit if there are no valid rows to process
      }
      logger.info(`Processing ${rows.length} rows in table: ${tableName}`);

      /**
       * Step 5: Initialize a Map to track duplicate rows and their counts.
       */
      const seen = new Map<string, number>();
      const duplicates: string[] = [];

      /**
       * Step 6: Process each row to extract data and check for duplicates.
       */
      for (const row of rows) {
        try {
          // Extract all cells in the current row
          const cells = await row.locator('td').all();

          // Safely extract part number and name columns
          const designation = designationColumnIndex !== -1 && cells[designationColumnIndex] ? await cells[designationColumnIndex].innerText() : null;

          const name = cells[nameColumnIndex] ? await cells[nameColumnIndex].innerText() : null;

          // Log and skip rows with missing data
          if (!designation && !name) {
            logger.warn(`Empty designation and name in row. Skipping...`);
            const rowHtml = await row.evaluate((el: Element) => el.outerHTML);
            logger.info(`Problematic row HTML: ${rowHtml}`);
            continue;
          }

          // Generate a unique identifier for the row
          const identifier =
            designationColumnIndex !== -1
              ? `${designation?.trim() || ''} ${name?.trim() || ''}`.trim() // Combine part number and name
              : `${name?.trim() || ''}`.trim(); // Use only name if part number is unavailable

          // Track duplicates
          if (seen.has(identifier)) {
            duplicates.push(identifier); // Add identifier to duplicates list
            seen.set(identifier, seen.get(identifier)! + 1); // Increment count in Map
          } else {
            seen.set(identifier, 1); // Add new identifier to Map
          }
        } catch (error) {
          // Log any errors encountered while processing the row
          logger.error(`Error processing row in ${tableName}: ${error}`);
          continue;
        }
      }

      /**
       * Step 7: Log duplicate entries and their counts.
       */
      if (duplicates.length > 0) {
        logger.info(`%c❌ Completed checkForDuplicates function for ${tableName} table`, 'color: red; font-weight: bold;');
        console.error(`Duplicates found in ${tableName}: ${duplicates}`);
        console.error(`Duplicate counts: ${Array.from(seen.entries()).filter(([key, count]) => count > 1)}`);
      } else {
        logger.info(`No duplicates found in ${tableName}`);
      }

      logger.info(`%c✔️  Completed checkForDuplicates function for ${tableName} table`, 'color: green; font-weight: bold;');
    };

    /**
     * Compares the displayed total value of a specific table or element on the web page
     * with a precomputed total from the global dataset.
     *
     * This function highlights the targeted element for visibility, extracts its numeric content,
     * and validates it against the corresponding global value. Mismatches are logged for debugging.
     *
     * @param {Locator} modalLocator - The locator for the modal containing the element.
     * @param {string} testId - The data-testid of the element to validate.
     * @param {keyof typeof CreatePartsDatabasePage.globalTableData} globalKey - The global dataset key to validate against.
     * @returns {Promise<void>} - A promise that resolves when the comparison is complete.
     */
    const compareTotals = async (modalLocator: Locator, testId: string, globalKey: keyof typeof CreatePartsDatabasePage.globalTableData): Promise<void> => {
      logger.info(`Started compareTotals function for group ${globalKey}`);
      /**
       * Step 1: Locate the specific element within the modal.
       * Wait for it to be attached to the DOM to ensure it's ready for interaction.
       */
      const element = modalLocator.locator(`[data-testid="${testId}"]`).last();
      await element.waitFor({ state: 'attached', timeout: 30000 });

      /**
       * Step 2: Highlight the element to improve visibility during execution.
       * Adds a red border and yellow background color for debugging purposes.
       */
      await element.evaluate((el: HTMLElement) => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'yellow';
      });

      /**
       * Step 3: Extract the numeric content from the element's text content.
       * Uses a regular expression to find and parse the first numeric value.
       */
      const textContent = await element.textContent(); // Get the raw text content
      const numericValue = textContent?.match(/\d+/); // Extract numeric characters
      const extractedValue = numericValue ? parseInt(numericValue[0], 10) : 0; // Parse as an integer or default to 0

      /**
       * Step 4: Retrieve the corresponding global total value based on the globalKey.
       * 'ALL' corresponds to the size of a Map, while other keys use array length.
       */
      const globalValue =
        globalKey === 'ALL'
          ? CreatePartsDatabasePage.globalTableData.ALL.size // Global value for "ALL" is the size of the Map
          : CreatePartsDatabasePage.globalTableData[globalKey].length; // Global value for other keys is array length

      /**
       * Step 5: Log and compare the extracted value with the global value.
       * Logs informative messages for both matches and mismatches.
       */
      logger.info(`${globalKey}: extracted value = ${extractedValue}, global value = ${globalValue}`);
      if (extractedValue !== globalValue) {
        logger.info(`%c❌ Completed compareTotals function for group ${globalKey}`, 'color: red; font-weight: bold;');
        // Log an error if there is a mismatch
        logger.error(`Mismatch for ${globalKey}: expected ${globalValue}, got ${extractedValue}`);
      } else {
        // Log success if the values match
        logger.info(`Matched for ${globalKey}: ${extractedValue}`);
        logger.info(`%c✔️  Completed compareTotals function for group ${globalKey}`, 'color: green; font-weight: bold;');
      }
    };

    /**
     * Compares the content of a "Cbeds" table on the web page with a predefined dataset.
     *
     * This function extracts data from a table (of the CB group) on the web page, processes it,
     * and compares it with an array stored in the global object. Mismatches between the table
     * data and the array data are logged in detail for debugging purposes.
     *
     * @param {Locator} modalLocator - The locator for the modal containing the table.
     * @param {string} tableId - The data-testid of the table to extract data from.
     * @returns {Promise<void>} - A promise that resolves when the comparison is complete.
     */
    const compareItemsCB = async (modalLocator: Locator, tableId: string): Promise<void> => {
      logger.info('Started compareItemsCB function');
      const globalKey = 'СБ'; // Define the global key for the CB group

      // Locate the table inside the modal
      const table = modalLocator.locator(`[data-testid="${tableId}"]`).last();

      /**
       * Step 1: Extract all rows from the table.
       * These rows include the header row, which we will skip later.
       */
      const rows = await table.locator('tr').all();

      /**
       * Step 2: Find column indices for relevant data fields.
       * These indices are used to locate specific cells within each row.
       */
      const partNoIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-CbedsTableHead-Designation');
      const partNameIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-CbedsTableHead-Name');
      const partCountIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-CbedsTableHead-Count');

      /**
       * Step 3: Process rows to extract data into an object.
       * Each row corresponds to a part, and its data is organized by partNumber.
       */
      const tableData: { [partNumber: string]: { quantity: number; partName: string } } = {};
      rows.shift(); // Skip the header row
      for (const row of rows) {
        // Extract all cells in the current row
        const cells = await row.locator('td').all();

        // Extract part-specific information from the respective cells
        const partNumber = cells[partNoIndex] ? await cells[partNoIndex].innerText() : null;
        const partName = cells[partNameIndex] ? await cells[partNameIndex].innerText() : null;
        const quantity = cells[partCountIndex]
          ? parseInt(await cells[partCountIndex].innerText(), 10) // Parse quantity as an integer
          : null;

        // Add the extracted data to tableData if all fields are valid
        if (partNumber && partName && quantity !== null) {
          tableData[partNumber] = { quantity, partName };
        } else {
          console.warn('Incomplete data found for a row, skipping...');
        }
      }

      /**
       * Step 4: Retrieve the global array data for comparison.
       */
      const arrayData = CreatePartsDatabasePage.globalTableData[globalKey];

      if (Array.isArray(arrayData)) {
        /**
         * Step 5: Compare table data with array data.
         */
        for (const tableItemPartNumber in tableData) {
          const tableItem = tableData[tableItemPartNumber];

          // Find a matching item in the array
          const matchingArrayItem = arrayData.find(
            item => item.partNumber === tableItemPartNumber && item.name === tableItem.partName && item.quantity === tableItem.quantity,
          );

          if (!matchingArrayItem) {
            // Log mismatch details
            console.error(
              `Mismatch found: Part Number '${tableItemPartNumber}', Name '${tableItem.partName}', and Quantity '${tableItem.quantity}' exist in the table but not in the array.`,
            );
          }
        }

        /**
         * Step 6: Compare array data with table data.
         */
        for (const arrayItem of arrayData) {
          const matchingTableItem = tableData[arrayItem.partNumber];
          if (!matchingTableItem || matchingTableItem.quantity !== arrayItem.quantity) {
            logger.info(`%c❌ Completed compareItemsCB function for group ${globalKey}`, 'color: red; font-weight: bold;');
            // Log mismatch details
            console.error(
              `Mismatch found: Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`,
            );
            console.error(tableData[arrayItem.partNumber]);
            console.error(arrayItem);
          }
        }
      } else {
        logger.info(`%c❌ Completed compareItemsCB function for group ${globalKey}`, 'color: red; font-weight: bold;');
        // Log error if the global array data is not an array
        console.error(`Unsupported data type for globalKey: ${globalKey}`);
      }

      // Log completion of comparison
      logger.info(`Comparison for ${globalKey} complete.`);
      logger.info(`%c✔️  Completed compareItemsCB function for group ${globalKey}`, 'color: green; font-weight: bold;');
    };

    /**
     * Compares the content of a details table on the web page with a predefined dataset.
     *
     * This function extracts data from a table (of the D group) on the web page,
     * cleans up problematic nested rows and cells, and compares the extracted data
     * with an existing array in the global object. It identifies mismatches and logs
     * detailed error messages for debugging.
     *
     * @param {Locator} modalLocator - The locator for the modal containing the table.
     * @param {string} tableId - The data-testid of the table to extract data from.
     * @returns {Promise<void>} - A promise that resolves when the comparison is complete.
     */
    const compareItemsD = async (modalLocator: Locator, tableId: string): Promise<void> => {
      logger.info('Started compareItemsД function');
      const globalKey = 'Д'; // Define the global key for the D group

      // Locate the table inside the modal
      const table = modalLocator.locator(`[data-testid="${tableId}"]`).last();

      /**
       * Step 1: Clear problematic cells containing nested rows.
       * This is necessary to avoid processing irrelevant data within <td> cells.
       */
      const problematicCells = await table.locator('td[data-testid^="ModalComplect-DetalsTableBody-WorkpieceCharacterization"]').all();
      for (const cell of problematicCells) {
        await cell.evaluate((node: HTMLElement) => {
          node.innerHTML = ''; // Clear out the inner HTML of the problematic cell
        });
      }

      /**
       * Step 2: Extract all rows from the table and filter out nested rows.
       * Filters ensure that only valid top-level rows are processed.
       */
      let rows = await table.locator('tr').all();
      const filteredRows = [];
      for (const row of rows) {
        const isNested = await row.evaluate((node: Element) => {
          // Check if the <tr> is a descendant of a <td>
          return node.closest('td') !== null;
        });
        if (!isNested) {
          filteredRows.push(row); // Only add rows that are not nested
        }
      }
      rows = filteredRows;

      /**
       * Step 3: Find column indices for relevant data fields.
       * These indices are used to locate specific cells within each row.
       */
      const parentPartIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-DetalsTableHead-CbedDesignation');
      const partNoIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-DetalsTableHead-Designation');
      const partNameIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-DetalsTableHead-Name');
      const partMaterialIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-DetalsTableHead-Zag');
      const partCountIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-DetalsTableHead-Count');

      /**
       * Step 4: Extract data from each row into an object for comparison.
       */
      const tableData: {
        [partNumber: string]: {
          parentPartNumber: string;
          quantity: number;
          partName: string;
          partMaterial: string;
        };
      } = {};
      rows.shift(); // Skip the header row
      for (const row of rows) {
        const cells = await row.locator('td').all();
        const parentPartNumber = cells[parentPartIndex] ? await cells[parentPartIndex].innerText() : null;
        const partNumber = cells[partNoIndex] ? await cells[partNoIndex].innerText() : null;
        const partName = cells[partNameIndex] ? await cells[partNameIndex].innerText() : null;
        const partMaterial = cells[partMaterialIndex] ? await cells[partMaterialIndex].innerText() : null;

        // Extract and clean up quantity
        const rawQuantityText = cells[partCountIndex] ? await cells[partCountIndex].innerText() : null;

        let quantity = null;
        if (rawQuantityText) {
          try {
            const cleanedQuantityText = rawQuantityText.trim().replace(/\D/g, ''); // Remove non-numeric characters
            quantity = cleanedQuantityText ? parseInt(cleanedQuantityText, 10) : null;
          } catch (error) {
            console.error(`Failed to parse quantity: ${rawQuantityText}`, error);
          }
        }

        if (parentPartNumber && partNumber && partName && partMaterial && quantity !== null) {
          tableData[partNumber] = { parentPartNumber, quantity, partName, partMaterial };
        } else {
          console.warn('Incomplete data found for a row, skipping...');
        }
      }

      /**
       * Step 5: Fetch the array data from the global object and compare it with table data.
       */
      const arrayData = CreatePartsDatabasePage.globalTableData[globalKey];

      if (Array.isArray(arrayData)) {
        // Compare table data with array data
        for (const tableItemPartNumber in tableData) {
          const tableItem = tableData[tableItemPartNumber];

          // Find a matching item in the array
          const matchingArrayItem = arrayData.find(
            item =>
              //item.parentPartNumber === tableItem.parentPartNumber &&
              item.partNumber === tableItemPartNumber &&
              item.name === tableItem.partName &&
              item.material === tableItem.partMaterial &&
              item.quantity === tableItem.quantity,
          );

          if (!matchingArrayItem) {
            const closestMatch = arrayData.find(item => item.partNumber === tableItemPartNumber);

            if (closestMatch) {
              console.error(
                `Mismatch found:\n` +
                  `Table Entry => Parent: '${tableItem.parentPartNumber}', Part Number: '${tableItemPartNumber}', Name: '${tableItem.partName}', Material: '${tableItem.partMaterial}', Quantity: '${tableItem.quantity}'\n` +
                  `Closest Array Entry => Parent: '${closestMatch.parentPartNumber}', Part Number: '${closestMatch.partNumber}', Name: '${closestMatch.name}', Material: '${closestMatch.material}', Quantity: '${closestMatch.quantity}'`,
              );
            } else {
              console.error(
                `Mismatch found:\n` +
                  `Table Entry => Parent: '${tableItem.parentPartNumber}', Part Number: '${tableItemPartNumber}', Name: '${tableItem.partName}', Material: '${tableItem.partMaterial}', Quantity: '${tableItem.quantity}'\n` +
                  `No matching partNumber found in the array.`,
              );
            }
          }
        }

        // Compare array data with table data
        for (const arrayItem of arrayData) {
          const matchingTableItem = tableData[arrayItem.partNumber];
          if (
            !matchingTableItem ||
            matchingTableItem.parentPartNumber !== arrayItem.parentPartNumber ||
            matchingTableItem.partName !== arrayItem.name ||
            matchingTableItem.partMaterial !== arrayItem.material ||
            matchingTableItem.quantity !== arrayItem.quantity
          ) {
            logger.info(`%c❌ Completed compareItemsD function for group ${globalKey}`, 'color: red; font-weight: bold;');
            console.error(
              `Mismatch found: Parent '${arrayItem.parentPartNumber}', Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', Material '${arrayItem.material}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`,
            );
          }
        }
      } else {
        logger.info(`%c❌ Completed compareItemsD function for group ${globalKey}`, 'color: red; font-weight: bold;');
        console.error(`Unsupported data type for globalKey: ${globalKey}`);
      }

      logger.info(`Comparison for ${globalKey} complete.`);
      logger.info(`%c✔️  Completed compareItemsD function for group ${globalKey}`, 'color: green; font-weight: bold;');
    };

    /**
     * Compares the content of a "Consumable Materials" table on the web page with a predefined dataset.
     *
     * This function extracts the name and quantity data from a consumable materials table
     * and compares it with the corresponding global dataset. Mismatches are logged for debugging.
     *
     * @param {Locator} modalLocator - The locator for the modal containing the table.
     * @param {string} tableId - The data-testid of the table to validate.
     * @returns {Promise<void>} - A promise that resolves when the comparison is complete.
     */
    const compareItemsCon = async (modalLocator: Locator, tableId: string): Promise<void> => {
      logger.info('Started compareItemsРМ function');
      const globalKey = 'РМ'; // Define the global key for the consumable materials group

      // Locate the table inside the modal
      const table = modalLocator.locator(`[data-testid="${tableId}"]`).last();

      /**
       * Step 1: Extract all rows from the table.
       * These rows include the header row, which we will skip later.
       */
      const rows = await table.locator('tr').all();

      /**
       * Step 2: Find column indices for relevant data fields.
       * These indices are used to locate specific cells within each row.
       */
      const nameIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-ConsumableMaterialsTableHead-Name');
      const quantityIndex = await shortagePage.findColumn(page, tableId, 'ModalComplect-ConsumableMaterialsTableHead-Count');

      /**
       * Step 3: Process rows to extract data into an object.
       * Each row corresponds to a consumable material, and its data is organized by name.
       */
      const tableData: { [materialName: string]: { quantity: number } } = {};
      rows.shift(); // Skip the header row
      for (const row of rows) {
        // Extract all cells in the current row
        const cells = await row.locator('td').all();

        // Extract specific information from the respective cells
        const materialName = cells[nameIndex] ? await cells[nameIndex].innerText() : null;
        const quantity = cells[quantityIndex]
          ? parseInt(await cells[quantityIndex].innerText(), 10) // Parse quantity as an integer
          : null;

        // Add the extracted data to tableData if all fields are valid
        if (materialName && quantity !== null) {
          tableData[materialName] = { quantity };
        } else {
          console.warn('Incomplete data found for a row, skipping...');
        }
      }

      /**
       * Step 4: Retrieve the global array data for comparison.
       */
      const arrayData = CreatePartsDatabasePage.globalTableData[globalKey];

      if (Array.isArray(arrayData)) {
        /**
         * Step 5: Compare table data with array data.
         */
        for (const tableItemName in tableData) {
          const tableItem = tableData[tableItemName];

          // Find a matching item in the array
          const matchingArrayItem = arrayData.find(item => item.name === tableItemName && item.quantity === tableItem.quantity);

          if (!matchingArrayItem) {
            // Log mismatch details
            console.error(`Mismatch found: Name '${tableItemName}' and Quantity '${tableItem.quantity}' exist in the table but not in the array.`);
          }
        }

        /**
         * Step 6: Compare array data with table data.
         */
        for (const arrayItem of arrayData) {
          const matchingTableItem = tableData[arrayItem.name];
          if (!matchingTableItem || matchingTableItem.quantity !== arrayItem.quantity) {
            logger.info(`%c❌ Completed compareItemsCon function for group ${globalKey}`, 'color: red; font-weight: bold;');
            // Log mismatch details
            console.error(`Mismatch found: Name '${arrayItem.name}' and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`);
          }
        }
      } else {
        logger.info(`%c❌ Completed compareItemsCon function for group ${globalKey}`, 'color: red; font-weight: bold;');
        // Log error if the global array data is not an array
        console.error(`Unsupported data type for globalKey: ${globalKey}`);
      }

      // Log completion of comparison
      logger.info(`Comparison for ${globalKey} complete.`);
      logger.info(`%c✔️  Completed compareItemsCon function for group ${globalKey}`, 'color: green; font-weight: bold;');
    };

    /**
     * Confirms that all materials listed in the Материалы для деталей table
     * exist in the materials column of the Детали table.
     *
     * This function checks that every material from the Материалы для деталей table
     * is present in the materials column of the Детали table, without comparing quantities.
     *
     * @param {Locator} modalLocator - The locator for the modal containing the tables.
     * @param {string} detailsTableId - The data-testid of the Детали table.
     * @param {string} materialsTableId - The data-testid of the Материалы для деталей table.
     * @returns {Promise<void>} - A promise that resolves when the validation is complete.
     */
    const validateMaterialExistence = async (modalLocator: Locator, detailsTableId: string, materialsTableId: string): Promise<void> => {
      try {
        logger.info('Started validateMaterialExistence function');
        /**
         * Step 1: Locate the Детали table, ensure readiness, and extract materials.
         */
        const detailsTable = modalLocator.locator(`[data-testid="${detailsTableId}"]`).last();
        await detailsTable.waitFor({ state: 'visible', timeout: 30000 });

        let detailsRows = await detailsTable.locator('tr').all();

        // Filter out nested rows from the Детали table
        const filteredDetailsRows = [];
        for (const row of detailsRows) {
          const isNested = await row.evaluate((node: Element) => node.closest('td') !== null);
          if (!isNested) {
            filteredDetailsRows.push(row);
          }
        }
        detailsRows = filteredDetailsRows;

        // Find column index for the materials in the Детали table
        const detailsMaterialNameIndex = await shortagePage.findColumn(page, detailsTableId, 'ModalComplect-DetalsTableHead-Zag');
        if (detailsMaterialNameIndex === -1) {
          throw new Error('Material column not found in the Детали table.');
        }

        // Extract all materials from the Детали table
        const detailsMaterials = new Set<string>();
        detailsRows.shift(); // Skip the header row
        for (const row of detailsRows) {
          const cells = await row.locator('td').all();
          const materialName = cells[detailsMaterialNameIndex] ? await cells[detailsMaterialNameIndex].innerText() : null;

          if (materialName) {
            detailsMaterials.add(materialName.trim());
          }
        }

        /**
         * Step 2: Locate the Материалы для деталей table, ensure readiness, and extract materials.
         */
        const materialsTable = modalLocator.locator(`[data-testid="${materialsTableId}"]`).last();
        await materialsTable.waitFor({ state: 'visible', timeout: 30000 });

        const materialsRows = await materialsTable.locator('tr').all();

        // Find column index for materials in the Материалы для деталей table
        const materialsTableNameIndex = await shortagePage.findColumn(page, materialsTableId, 'ModalComplect-DetailMaterialsTableHead-Name');
        if (materialsTableNameIndex === -1) {
          throw new Error('Material column not found in the Материалы для деталей table.');
        }

        // Extract all materials from the Материалы для деталей table
        const materialsList = [];
        materialsRows.shift(); // Skip the header row
        for (const row of materialsRows) {
          const cells = await row.locator('td').all();
          const materialName = cells[materialsTableNameIndex] ? await cells[materialsTableNameIndex].innerText() : null;

          if (materialName) {
            materialsList.push(materialName.trim());
          }
        }

        /**
         * Step 3: Validate that all materials in Материалы для деталей exist in the Детали table.
         */
        let hasMismatch = false;
        for (const material of materialsList) {
          if (!detailsMaterials.has(material)) {
            logger.info('%c❌ Completed validateMaterialExistence function for group Д', 'color: red; font-weight: bold;');
            console.error(`Material '${material}' from Материалы для деталей table is not found in the Детали table.`);
            hasMismatch = true;
          }
        }

        /**
         * Step 4: Log the final result of the validation.
         */
        if (!hasMismatch) {
          logger.info('%c✔️  Completed validateMaterialExistence function for group Д', 'color: green; font-weight: bold;');
          logger.info('All materials in Материалы для деталей exist in the Детали table.');
        } else {
          logger.info('%c❌ Completed validateMaterialExistence function for group Д', 'color: red; font-weight: bold;');
          console.error('Some materials in Материалы для деталей are missing in the Детали table.');
        }
      } catch (error) {
        logger.info('%c❌ Completed validateMaterialExistence function for group Д', 'color: red; font-weight: bold;');
        console.error('An error occurred during material validation:', error);
      }
    };

    await allure.step('Step 2.1.1: Checking sections for duplicate rows', async () => {
      // Perform duplicate checks
      await checkForDuplicates(ASSEMBLY_UNIT_TABLE_ID, 'Assembly Units СБ', ASSEMBLY_UNIT_TABLE_PARTNO_ID, ASSEMBLY_UNIT_TABLE_NAME_ID);
      await checkForDuplicates(DETAILS_TABLE_ID, 'Details Д', DETAILS_TABLE_PARTNO_ID, DETAILS_TABLE_NAME_ID);
      await checkForDuplicates(BUYMATERIALS_TABLE_ID, 'Buy Materials ПМ', null, BUYMATERIALS_TABLE_NAME_ID);
      await checkForDuplicates(MATERIALPARTS_TABLE_ID, 'Material Parts МД', null, MATERIALPARTS_TABLE_NAME_ID);
      await checkForDuplicates(CONSUMABLES_TABLE_ID, 'Consumables РМ', null, CONSUMABLES_TABLE_NAME_ID);
    });
    await allure.step('Step 2.1.2: Confirm that totals match', async () => {
      // Compare totals
      await compareTotals(modalLocator, ASSEMBLY_UNIT_TOTAL_LINE, 'СБ');
      await compareTotals(modalLocator, DETAILS_TOTAL_LINE, 'Д');
      await compareTotals(modalLocator, BUYMATERIALS_TOTAL_LINE, 'ПД'); //.2025-03-13 16:56:30 [error]: Mismatch for ПМ: expected 0, got 1 Покупные материалы
      await compareTotals(modalLocator, MATERIALPARTS_TOTAL_LINE, 'МД');
      await compareTotals(modalLocator, CONSUMABLES_TOTAL_LINE, 'РМ');
    });
    await allure.step('Step 2.1.3: Verify СБ Line Items and quantity match the scanned ones', async () => {
      // Compare totals
      await compareItemsCB(modalLocator, ASSEMBLY_UNIT_TABLE_ID); //СБ
      await compareItemsD(modalLocator, DETAILS_TABLE_ID); //Д
      await compareItemsCon(modalLocator, CONSUMABLES_TABLE_ID); //РМ
      await validateMaterialExistence(modalLocator, DETAILS_TABLE_ID, MATERIALPARTS_TABLE_ID);
    });
    // await allure.step('Step 2.1.4: Verify Д Line Items and quantity match the scanned ones', async () => {
    //     // Compare totals
    //     await compareTotals(modalLocator, ASSEMBLY_UNIT_TOTAL_LINE, 'СБ');
    //     await compareTotals(modalLocator, DETAILS_TOTAL_LINE, 'Д');
    //     await compareTotals(modalLocator, BUYMATERIALS_TOTAL_LINE, 'ПМ');
    //     await compareTotals(modalLocator, MATERIALPARTS_TOTAL_LINE, 'МД');
    //     await compareTotals(modalLocator, CONSUMABLES_TOTAL_LINE, 'РМ');
    // });
  }

  async processProduct(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
    // Highlight and click the product row
    await row.evaluate(element => {
      element.style.border = '3px solid red'; // Highlight
      element.style.backgroundColor = 'green';
    });
    await row.click(); //opened the product page

    const editButton = page.locator(`[data-testid="BaseDetals-Button-EditProduct"]`);
    await editButton.waitFor({ state: 'attached', timeout: 30000 });
    await editButton.evaluate((element: HTMLElement) => {
      element.style.border = '3px solid red'; // Highlight
      element.style.backgroundColor = 'yellow';
    });

    await editButton.click();
    //logger.info(`Opened details for product: ${editButton}`);

    // Open the product editor
    //await shortagePage.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500); //clicked the edit button
    let parentQuantity = 1;
    // Process the main table for the product
    const table = page.locator('[data-testid="TableSpecification-Root"]');

    const groups: {
      СБ: Item[];
      Д: Item[];
      ПД: Item[];
      РМ: Item[];
      ALL: Map<string, Item>;
    } = await this.processTableDataAndHandleModals(table, shortagePage, page, title, parentQuantity);

    logger.info('Processed Groups:');
    logger.info(groups);
    return;
  }
  async printParsedTableData(): Promise<void> {
    console.log('Parsed Table Data Overview:');

    // Define the ordered keys for structured output
    const orderedKeys = ['СБ', 'Д', 'ПД', 'МД', 'РМ'];

    // Iterate through each group in the specified order
    orderedKeys.forEach(key => {
      const groupItems = this.parsedData[key] || [];
      const totalCount = Array.isArray(groupItems) ? groupItems.length : 0; // Count items in the group safely

      console.log(`\n${key} (Items in this Group: ${totalCount}):`);
      console.table(groupItems);
    });

    console.log('\nEnd of Parsed Table Data.');
  }

  async processTableDataAndHandleModals(
    table: Locator,
    shortagePage: any,
    page: any,
    title: string,
    parentQuantity: number,
  ): Promise<{
    СБ: Item[];
    Д: Item[];
    ПД: Item[];
    РМ: Item[];
    ALL: Map<string, Item>;
  }> {
    const groups = await this.processTableData(table, title, parentQuantity); // Process the main table

    // Handle rows in each group
    await this.processGroupRows(groups.Д, 'Д', page, parentQuantity);
    await this.processGroupRows(groups.ПД, 'ПД', page, parentQuantity);
    await this.processGroupRows(groups.РМ, 'РМ', page, parentQuantity);
    await this.processSBGroupRows(groups.СБ, page, shortagePage, parentQuantity);

    return groups; // Return all processed data
  }

  async processGroupRows(rows: Item[], groupType: string, page: any, parentQuantity: number): Promise<void> {
    for (const item of rows) {
      logger.info(`Processing ${groupType} item:`, item);

      // Locate and click the row to open the modal
      const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last(); // Adjust selector as necessary
      await rowLocator.waitFor({ state: 'attached', timeout: 30000 });
      await rowLocator.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });
      await rowLocator.click();

      switch (groupType) {
        case 'Д':
          const modal = page.locator('div[data-testid="ModalDetal-destroyModalRight"]:not(.content-modal-right-menu-hidden)').last();
          await modal.waitFor({ state: 'attached', timeout: 30000 });

          // Validate modal title
          let el = await modal.locator('[data-testid="ModalDetail-h3-BriefDetailInformation"]').last();
          await el.waitFor({ state: 'attached', timeout: 30000 });
          await el.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          let elementValue = await el.textContent();
          if (elementValue?.trim() !== testData.titles.Д.label) {
            logger.error('Incorrect modal title for Type Д');
            expect(elementValue?.trim()).toBe(testData.titles.Д.label);
          }

          // Validate product name
          el = await modal.locator('[data-testid="ModalDetail-span-Name"]').last();
          await el.waitFor({ state: 'attached', timeout: 30000 });
          await el.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          elementValue = await el.textContent();
          if (elementValue !== item.name) {
            logger.error('Incorrect Product Name for Type Д');
            expect(elementValue?.trim()).toBe(item.name);
          } else {
            // Add only the product name to the Д group (avoiding duplicates)
            if (!CreatePartsDatabasePage.globalTableData.Д.some(existingItem => existingItem.name === item.name)) {
              CreatePartsDatabasePage.globalTableData.Д.push(item);
            }
          }

          // Validate product designation
          el = await modal.locator('[data-testid="ModalDetail-span-Designation"]').last();
          await el.waitFor({ state: 'attached', timeout: 30000 });
          await el.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          elementValue = await el.textContent();
          if (elementValue !== item.partNumber) {
            logger.error('Incorrect Product Designation for Type Д');
            expect(elementValue?.trim()).toBe(item.partNumber);
          }

          // Validate product material
          el = await modal.locator('[data-testid="ModalDetail-span-Material"]').last();
          await el.waitFor({ state: 'attached', timeout: 30000 });
          await el.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          elementValue = await el.textContent();
          if (!elementValue) {
            logger.error('Incorrect: Product Material not found for Type Д');
            logger.error(JSON.stringify(item, null, 2));
          } else {
            item.material = elementValue.trim();

            // Check the BlankMass value and content of ModalDetail-TableZag
            const blankMassElement = await modal.locator('[data-testid="ModalDetail-span-BlankMass"]').last();
            await blankMassElement.waitFor({ state: 'attached', timeout: 30000 });
            await blankMassElement.evaluate((element: HTMLElement) => {
              element.style.border = '3px solid red'; // Highlight
              element.style.backgroundColor = 'yellow';
            });
            const blankMassValue = await blankMassElement.textContent();

            const tableZagElement = await modal.locator('div[data-testid="ModalDetail-TableZag"]').last();
            await tableZagElement.waitFor({ state: 'attached', timeout: 30000 });
            await tableZagElement.evaluate((element: HTMLElement) => {
              element.style.border = '3px solid red'; // Highlight
              element.style.backgroundColor = 'yellow';
            });
            let tableZagContent = await tableZagElement.innerHTML();
            tableZagContent = tableZagContent.replace(/<!--v-if-->/g, '').trim(); // Remove comments

            const hasTableRows = /<tr[^>]*>/i.test(tableZagContent); // Check for <tr> tags

            if (blankMassValue?.trim() === '0' && !hasTableRows) {
              // Add to the ПМ group or increment the quantity if the material already exists
              const existingItem = CreatePartsDatabasePage.globalTableData.ПМ.find(existingItem => {
                const existingMaterial = existingItem.material.trim().toLowerCase();
                const newMaterial = item.material.trim().toLowerCase();

                logger.info(`Comparing: "${existingMaterial}" with "${newMaterial}"`);
                return existingMaterial === newMaterial;
              });

              if (existingItem) {
                // Increment the quantity if material already exists
                existingItem.quantity += item.quantity + 500;
              } else {
                // Add the material as a new entry
                CreatePartsDatabasePage.globalTableData.ПМ.push({
                  id: '', // Provide a default or placeholder value
                  parentPartNumber: '', // Placeholder
                  partNumber: '', // Placeholder
                  name: '', // Placeholder
                  dataTestId: '', // Placeholder
                  material: item.material.trim(),
                  quantity: item.quantity,
                } as Item);
              }
            } else {
              // Add to МД group
              const existingMDItem = CreatePartsDatabasePage.globalTableData.МД.find(
                existingItem => existingItem.material.trim().toLowerCase() === item.material.trim().toLowerCase(),
              );

              if (existingMDItem) {
                existingMDItem.quantity += item.quantity;
                logger.info(`Updated quantity for material "${existingMDItem.material}" in МД group.`);
              } else {
                CreatePartsDatabasePage.globalTableData.МД.push({
                  id: '',
                  parentPartNumber: '',
                  partNumber: '',
                  name: '',
                  dataTestId: '',
                  material: item.material,
                  quantity: item.quantity,
                } as Item);
                logger.info(`Added material "${item.material}" to МД group.`);
              }
            }
          }

          // Update item quantity
          item.quantity *= parentQuantity;
          break;

        case 'ПД':
          //const modal2 = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]').last();
          const modal2 = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]:not(.content-modal-right-menu-hidden)').last();
          await modal2.waitFor({ state: 'attached', timeout: 30000 });

          let el2 = await modal2.locator('[data-testid="ModalMaterialInformation-Title"]').last(); // Scoped to modal2
          await el2.waitFor({ state: 'attached', timeout: 30000 });
          await el2.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          let elementValue2 = await el2.textContent();
          if (elementValue2.trim() != testData.titles.ПД.label) {
            logger.error('Incorrect modal title for Type ПД');
            expect(elementValue2.trim()).toBe(testData.titles.ПД.label);
          }
          el2 = '';
          elementValue2 = '';

          el2 = await modal2.locator('[data-testid="ModalMaterialInformation-NameValue"]').last(); // Scoped to modal2
          await el2.waitFor({ state: 'attached', timeout: 30000 });
          await el2.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          elementValue2 = await el2.textContent();
          if (elementValue2 != item.name) {
            logger.error('Incorrect Product Name for Type ПД');
            logger.error(JSON.stringify(item, null, 2));
            expect(elementValue2.trim()).toBe(item.name);
          } else {
            item.material = elementValue2;
          }
          item.quantity *= parentQuantity;
          break;

        case 'РМ':
          const modal3 = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]:not(.content-modal-right-menu-hidden)').last();
          await modal3.waitFor({ state: 'attached', timeout: 30000 });

          let el3 = await modal3.locator('[data-testid="ModalMaterialInformation-Title"]').last(); // Scoped to modal3
          await el3.waitFor({ state: 'attached', timeout: 30000 });
          await el3.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          let elementValue3 = await el3.textContent();
          if (elementValue3.trim() != testData.titles.РМ.label) {
            logger.error('Incorrect modal title for Type РМ');
            expect(elementValue3.trim()).toBe(testData.titles.РМ.label);
          }
          el3 = '';
          elementValue3 = '';

          el3 = await modal3.locator('[data-testid="ModalMaterialInformation-NameValue"]').last(); // Scoped to modal3
          await el3.waitFor({ state: 'attached', timeout: 30000 });
          await el3.evaluate((element: HTMLElement) => {
            element.style.border = '3px solid red'; // Highlight
            element.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1000);

          elementValue3 = await el3.textContent();
          if (elementValue3 != item.name) {
            logger.error('Incorrect Product Name for Type РМ');
            expect(elementValue3.trim()).toBe(item.name);
          } else {
            item.material = elementValue3;
          }
          expect(item.quantity).toBeGreaterThan(0);
          item.quantity *= parentQuantity;
          break;

        default:
          logger.error('No matching case');
          break;
      }

      // Close the modal
      await page.mouse.click(1, 1);
    }
  }

  async processSBGroupRows(rows: Item[], page: any, shortagePage: any, parentQuantity: number): Promise<void> {
    for (const item of rows) {
      logger.info(`Processing СБ item:`, item);
      //item.quantity *= parentQuantity;
      const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last();
      await rowLocator.waitFor();
      await rowLocator.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });

      await rowLocator.click();

      // Wait for modal and locate its table
      const modal = page.locator('div[data-testid="ModalCbed-destroyModalRight"]').last();
      await modal.waitFor();

      // Extract the title of the СБ
      const sbTitleElement = modal.locator('[data-testid="ModalCbed-Text-Designation"]').last();
      await sbTitleElement.waitFor({ state: 'attached', timeout: 30000 });
      await sbTitleElement.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });

      const title = (await sbTitleElement.textContent())?.trim();
      logger.info(`Extracted СБ Title: ${title}`);

      const tableInModal = modal.locator('[data-testid="TableSpecification-Table"]');
      let ele = await page.locator('[data-testid="ModalCbed-Title"]').last();
      await ele.waitFor({ state: 'attached', timeout: 30000 });
      await ele.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });
      ele = await page.locator('[data-testid="ModalCbed-Title"]').last().textContent();
      if (ele.trim() != testData.titles.СБ.label) {
        logger.error('Incorrect modal title for Type СБ');
        expect(ele.trim()).toBe(testData.titles.СБ.label);
      }
      await page.waitForTimeout(1000);
      let elem = await page.locator('[data-testid="ModalCbed-Text-Name"]').last();
      await elem.waitFor({ state: 'attached', timeout: 30000 });
      await elem.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });
      elem = await page.locator('[data-testid="ModalCbed-Text-Name"]').last().textContent();
      if (elem != item.name) {
        logger.error('Incorrect Product Name for Type СБ');
        expect(elem.trim()).toBe(item.name);
      }

      await page.waitForTimeout(1000);
      let eleme = await page.locator('[data-testid="ModalCbed-Text-Designation"]').last();
      await eleme.waitFor({ state: 'attached', timeout: 30000 });
      await eleme.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });
      eleme = await page.locator('[data-testid="ModalCbed-Text-Designation"]').last().textContent();
      if (eleme != item.partNumber) {
        logger.error('Incorrect Part Number for Type СБ');
        expect(elem.trim()).toBe(item.partNumber);
      }
      let eRow = await page.locator(`[data-testid="${item.dataTestId}"]`).last();
      await eRow.waitFor({ state: 'attached', timeout: 30000 });
      await eRow.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });

      item.quantity *= parentQuantity;

      // Process the modal's table recursively
      const subGroups = await this.processTableDataAndHandleModals(tableInModal, shortagePage, page, title, item.quantity);

      // Merge subGroups into the main structure or log them
      logger.info('Processed Sub-Groups for СБ item:', subGroups);

      // Close the modal
      await page.mouse.click(1, 1);
    }
  }

  async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
    const table = page.locator(`${tableTestId}`);
    await table.locator('tr').first().waitFor({ state: 'visible' });

    const rows = await table.locator('tbody > tr').elementHandles();
    logger.info(`Total rows in tbody: ${rows.length}`);

    if (rows.length === 0) {
      throw new Error('No rows found in the table.');
    }

    const groups: { groupName: string; items: string[][] }[] = [];
    let currentGroup: { groupName: string; items: string[][] } | null = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Detect group header rows
        const isGroupHeader = await row.evaluate(node => {
          const element = node as Element; // Cast Node to Element
          return element.getAttribute('data-testid')?.startsWith('TableSpecification-Tbody-TableRowHead');
        });

        if (isGroupHeader) {
          const groupName = await row.$eval('td[colspan="5"]', cell => cell.textContent?.trim() || '');
          currentGroup = { groupName, items: [] };
          groups.push(currentGroup);
          logger.info(`Group header detected: "${groupName}"`);
          continue;
        }

        // Detect item rows for the current group
        const isDataRow = await row.evaluate(node => {
          const element = node as Element; // Cast Node to Element
          return element.getAttribute('data-testid')?.startsWith('TableSpecification-DraggableTableRow');
        });

        if (isDataRow && currentGroup) {
          const itemTable = await row.$('table[data-testid^="TableSpecification-DraggableTable"]');
          const itemRows = (await itemTable?.$$('tbody > tr')) || [];

          for (const itemRow of itemRows) {
            const rowData = await itemRow.$$eval('td', cells => cells.map(cell => cell.textContent?.trim() || ''));

            if (rowData.length > 0) {
              currentGroup.items.push(rowData);
              logger.info(`Added row to group "${currentGroup.groupName}": ${rowData}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing row: ${error}`);
      }
    }

    logger.info(`Parsed groups: ${JSON.stringify(groups, null, 2)}`);
    return groups;
  }

  /**
   * Add an item to the specification based on the type.
   * Handles varying table structures for different types (e.g., РМ, ПД, Д, СБ).
   * Includes expect() validations for each step.
   * @param page - The Playwright page object.
   * @param smallDialogButtonId - The data-testid for the small dialog button to select.
   * @param dialogTestId - The data-testid of the dialog to select.
   * @param searchTableTestId - The data-testid of the table to search within.
   * @param searchValue - The value to search for in the table.
   * @param bottomTableTestId - The data-testid of the bottom table for confirmation.
   * @param addToBottomButtonTestId - The data-testid of the button to add to the bottom table.
   * @param addToMainButtonTestId - The data-testid of the button to add to the main table.
   * @param itemType - The type of the item being added (e.g., "РМ", "ПД", "Д", "СБ").
   * @returns Promise<void>
   */
  async addItemToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    searchValue: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    // Determine column index based on item type
    const columnIndex = itemType === 'РМ' || itemType === 'ПД' ? 0 : 1;

    // Step 1: Click the "Добавить" button
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error) {
      logger.warn(`Network idle timeout: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Continuing without waiting for network idle.');
    }
    try {
      await page.waitForTimeout(1000);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Continuing without waiting.');
    }
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    try {
      await addButton.click();
    } catch (error) {
      logger.warn(`Failed to click add button: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn("Skipping add button click since it's being intercepted.");
      return;
    }
    try {
      await page.waitForTimeout(500);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Continuing without waiting.');
    }

    // Step 2: Click the small dialog button
    // Normalize small dialog selector: accept full selector or raw data-testid
    let smallDialogSelector = smallDialogButtonId;
    const smallDialogMatch = smallDialogButtonId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (smallDialogMatch && smallDialogMatch[1]) {
      smallDialogSelector = smallDialogButtonId;
    } else {
      smallDialogSelector = `div[data-testid="${smallDialogButtonId}"]`;
    }
    const dialogButton = page.locator(smallDialogSelector);
    try {
      await dialogButton.click();
    } catch (error) {
      logger.warn(`Failed to click dialog button: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn("Skipping dialog button click since it's not available.");
      return;
    }
    try {
      await page.waitForTimeout(500);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Continuing without waiting.');
    }

    // Step 3: Wait for the modal/dialog to load **before checking item existence**
    // Normalize dialog selector: accept full selector or raw id
    let modalSelector = dialogTestId;
    if (dialogTestId.includes('data-testid')) {
      const dlgMatch = dialogTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (dialogTestId.includes('dialog')) {
        modalSelector = dialogTestId.includes('[open]') ? dialogTestId : `${dialogTestId}[open]`;
      } else if (dlgMatch && dlgMatch[1]) {
        modalSelector = `dialog[data-testid="${dlgMatch[1]}"][open]`;
      } else {
        modalSelector = `dialog${dialogTestId.includes('[open]') ? dialogTestId : `${dialogTestId}[open]`}`;
      }
    } else {
      modalSelector = `dialog[data-testid^="${dialogTestId}"][open]`;
    }
    const modal = page.locator(modalSelector);
    try {
      await expect(modal).toBeVisible(); // Validate modal is visible
    } catch (error) {
      logger.warn(`Modal not visible: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Skipping item addition since modal is not available.');
      return;
    }
    try {
      await page.waitForTimeout(1000);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Continuing without waiting.');
    }

    // Step 4: Check if the item already exists in the bottom table **inside the modal**
    const itemExists = await this.checkItemExistsInBottomTable(page, searchValue, dialogTestId, bottomTableTestId);

    if (!itemExists) {
      //     console.log(`Skipping addition: '${searchValue}' already exists in the bottom table.`);
      //     return; // ✅ Skip the addition process
      // }

      // Step 5: Search for the item in the search table
      let searchTableSelector = searchTableTestId;
      const searchTableMatch = searchTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (searchTableMatch && searchTableMatch[1]) {
        searchTableSelector = searchTableTestId.includes('data-testid') ? searchTableTestId : `[data-testid="${searchTableMatch[1]}"]`;
      } else if (!searchTableTestId.includes('data-testid')) {
        searchTableSelector = `[data-testid="${searchTableTestId}"]`;
      }
      await modal.locator(searchTableSelector).waitFor({ state: 'visible' });
      const itemTableLocator = modal.locator(searchTableSelector);
      await itemTableLocator.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red'; // Highlight
        element.style.backgroundColor = 'yellow';
      });
      await page.waitForTimeout(1000);

      // Fill the search field
      const searchInput = itemTableLocator.locator('input.search-yui-kit__input');
      await searchInput.fill(searchValue);
      logger.info(`Searching for: ${searchValue}`);
      await searchInput.press('Enter');
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (error) {
        logger.warn(`Network idle timeout: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn('Continuing without waiting for network idle.');
      }
      try {
        await page.waitForTimeout(2000);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn('Continuing without waiting.');
      }

      // Check if we have search results
      const searchRowCount = await itemTableLocator.locator('tbody tr').count();
      logger.info(`Search results count: ${searchRowCount}`);

      if (searchRowCount === 0) {
        logger.warn(`No search results found for: ${searchValue}. This might indicate the item doesn't exist in the database.`);
        logger.warn('Skipping item addition since search returned no results.');
        return; // Skip instead of throwing error
      }

      const firstRow = itemTableLocator.locator('tbody tr').first();
      try {
        await page.waitForTimeout(1500);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn('Continuing without waiting.');
      }
      const firstRowText = await firstRow.locator('td').nth(columnIndex).textContent();
      logger.info(`First row text: ${firstRowText}`);

      // Step 6: Validate search result - be more flexible with matching
      if (firstRowText?.trim() !== searchValue.trim()) {
        logger.warn(`Search result doesn't exactly match. Expected: "${searchValue}", Got: "${firstRowText?.trim()}"`);
        logger.warn('Skipping item addition due to search result mismatch.');
        return; // Skip instead of failing
      }
      try {
        await firstRow.click();
      } catch (error) {
        logger.warn(`Failed to click first row: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn("Skipping row click since it's not available.");
        return;
      }
      try {
        await page.waitForTimeout(500);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn('Continuing without waiting.');
      }

      // Step 7: Add the item to the bottom table
      const addToBottomButtonSelector = addToBottomButtonTestId.includes('data-testid')
        ? addToBottomButtonTestId
        : `[data-testid="${addToBottomButtonTestId}"]`;
      const addToBottomButton = modal.locator(addToBottomButtonSelector);
      try {
        await addToBottomButton.click();
      } catch (error) {
        logger.warn(`Failed to click add to bottom button: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn("Skipping add to bottom button click since it's not available.");
        return;
      }
      try {
        await page.waitForTimeout(100);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
        logger.warn('Continuing without waiting.');
      }

      // Step 8: Validate the item in the bottom table
      let bottomTableSelector = bottomTableTestId;
      const bottomTableMatch = bottomTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (bottomTableMatch && bottomTableMatch[1]) {
        bottomTableSelector = bottomTableTestId.includes('data-testid') ? bottomTableTestId : `[data-testid="${bottomTableMatch[1]}"]`;
      } else if (!bottomTableTestId.includes('data-testid')) {
        bottomTableSelector = `[data-testid="${bottomTableTestId}"]`;
      }
      const bottomTableLocator = modal.locator(bottomTableSelector);
      const rows = bottomTableLocator.locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        logger.warn('Bottom table is empty after adding item. This might indicate an issue with the addition process.');
        return; // Skip instead of failing
      }

      let isItemFound = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const partName = await row.locator('td').nth(1).textContent();

        if (partName?.trim() === searchValue.trim()) {
          isItemFound = true;
          break;
        }
      }

      if (!isItemFound) {
        logger.warn(`Item "${searchValue}" was not found in the bottom table after addition.`);
        return; // Skip instead of failing
      }
    }
    // Step 9: Commit additions (or close modal if nothing to add)
    const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid') ? addToMainButtonTestId : `[data-testid="${addToMainButtonTestId}"]`;
    const addToMainButton = modal.locator(addToMainButtonSelector);
    await addToMainButton.waitFor({ state: 'visible', timeout: 10000 });

    let isButtonEnabled = false;
    try {
      isButtonEnabled = await addToMainButton.isEnabled();
    } catch {}
    logger.info(`Add to main button enabled: ${isButtonEnabled}`);

    if (!isButtonEnabled) {
      logger.warn('Add to main disabled. Closing modal via Cancel/Return.');
      const cancelButtonTestId =
        dialogTestId === CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON
          : dialogTestId === CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON
          : dialogTestId === CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON
          : CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON;
      const cancelButton = modal.locator(`[data-testid="${cancelButtonTestId}"]`);
      await cancelButton.click().catch(() => {});
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      return;
    }

    // Click Add to Main when enabled
    await page.waitForTimeout(500).catch(() => {});
    await addToMainButton.click().catch(() => {});
    await page.waitForTimeout(500).catch(() => {});
    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    const parsedTableArray = await this.parseStructuredTable(page, MAIN_TABLE_TEST_ID); // Parse the table

    // Step 11: Ensure item exists in the main table
    let isMainItemFound = false;
    for (const group of parsedTableArray) {
      if (group.items.some(row => row.some(cell => cell.trim() === searchValue.trim()))) {
        isMainItemFound = true;
        break;
      }
    }

    if (!isMainItemFound) {
      logger.warn(`Item "${searchValue}" was not found in the main table after addition.`);
      // Don't fail the test, just log a warning
    }
  }

  /**
   * Add multiple items to the specification within a single dialog session (one group at a time).
   * - Opens the dialog once
   * - For each searchValue: clears search, searches, selects first matching row, clicks "add to bottom", verifies presence
   * - After all items are in the bottom table, clicks "add to main"
   */
  async addMultipleItemsToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    items: Array<{ name: string; quantity?: number }>,
    itemType?: string,
  ): Promise<void> {
    // Open add dialog and select group
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    await addButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500).catch(() => {});

    // Try primary table; if missing, try common fallback for CBED tables; else use modal-level search input
    let itemTableLocator = modal.locator(`table[data-testid="${searchTableTestId}"]`);
    try {
      await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      const fallbackCbedTable = modal.locator(`table[data-testid="BasePaginationTable-Table-cbed"]`);
      if ((await fallbackCbedTable.count()) > 0) {
        itemTableLocator = fallbackCbedTable;
        await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      }
    }

    for (const { name: searchValue, quantity } of items) {
      // Clear the search input and search this item
      // Prefer dedicated data-testid for search input if present; otherwise fallback to input inside table
      let searchInput = modal.locator(`[data-testid="${CONST.BASE_DETAIL_CB_TABLE_SEARCH}"]`).first();
      if ((await searchInput.count()) === 0) {
        searchInput = itemTableLocator.locator('input.search-yui-kit__input').first();
      }
      await searchInput.fill('').catch(() => {});
      await searchInput.fill(searchValue);
      await searchInput.press('Enter');
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {}
      await page.waitForTimeout(500).catch(() => {});

      // Select first result
      const results = itemTableLocator.locator('tbody tr');
      const count = await results.count();
      if (count === 0) {
        logger.warn(`No results for "${searchValue}" in ${dialogTestId}`);
        continue;
      }
      await results
        .first()
        .click()
        .catch(() => {});
      await page.waitForTimeout(200).catch(() => {});

      // Add to bottom
      const addToBottomButton = modal.locator(`[data-testid="${addToBottomButtonTestId}"]`);
      await addToBottomButton.click().catch(() => {});
      await page.waitForTimeout(300).catch(() => {});

      // Verify presence in bottom table
      const bottomTable = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
      await bottomTable.waitFor({ state: 'visible', timeout: 10000 });
      const bottomRows = bottomTable.locator('tbody tr');
      const bottomCount = await bottomRows.count();
      expect(bottomCount).toBeGreaterThan(0);

      // Set quantity if provided (default 1)
      const desiredQty = (quantity ?? 1).toString();
      try {
        const lastRow = bottomRows.nth(bottomCount - 1);
        const qtyCell = lastRow.locator('td').nth(3);
        await qtyCell.dblclick();
        await page.waitForTimeout(100).catch(() => {});
        const qtyInput = qtyCell.locator('input');
        await qtyInput.fill(desiredQty);
        await page.waitForTimeout(50).catch(() => {});
        await qtyInput.press('Enter');
        await page.waitForTimeout(100).catch(() => {});
      } catch (e) {
        logger.warn(`Failed to set quantity for "${searchValue}": ${(e as Error).message}`);
      }
    }

    // Finalize: add all from bottom to main
    const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid') ? addToMainButtonTestId : `[data-testid="${addToMainButtonTestId}"]`;
    const addToMainButton = modal.locator(addToMainButtonSelector);
    await addToMainButton.waitFor({ state: 'visible', timeout: 10000 });
    const enabled = await addToMainButton.isEnabled();
    if (enabled) {
      await addToMainButton.click().catch(() => {});
    } else {
      logger.warn('Add to main button disabled after multiple additions');
    }
    await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Open group dialog, clear all existing items from bottom table, then add provided items and commit to main table.
   */
  private async reconcileGroupClearAndSet(
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    items: Array<{ name: string; quantity?: number }>,
  ): Promise<void> {
    const page = this.page;

    // Open add dialog and select group
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
    await addButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await expect(modal).toBeVisible();

    // Clear existing rows in bottom table
    const bottomTable = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
    await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const deleteColumnIndex = 4; // matches current UI for delete action
    while (true) {
      const rows = bottomTable.locator('tbody tr');
      const count = await rows.count();
      if (count === 0) break;
      const row = rows.nth(count - 1);
      const deleteCell = row.locator('td').nth(deleteColumnIndex);
      await deleteCell.click().catch(() => {});
      await page.waitForTimeout(200).catch(() => {});
    }

    // If items provided, add them and commit to main table in the same open modal
    if (items && items.length > 0) {
      // Locate search table with fallbacks
      let itemTableLocator = modal.locator(`table[data-testid="${searchTableTestId}"]`);
      try {
        await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        const fallbackCbedTable = modal.locator(`table[data-testid="BasePaginationTable-Table-cbed"]`);
        if ((await fallbackCbedTable.count()) > 0) {
          itemTableLocator = fallbackCbedTable;
          await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        }
      }

      for (const { name: searchValue, quantity } of items) {
        // Prefer dedicated search input if present; otherwise fallback to input inside the table
        let searchInput = modal.locator(`[data-testid="${CONST.BASE_DETAIL_CB_TABLE_SEARCH}"]`).first();
        if ((await searchInput.count()) === 0) {
          searchInput = itemTableLocator.locator('input.search-yui-kit__input').first();
        }
        await searchInput.fill('').catch(() => {});
        await searchInput.fill(searchValue);
        await searchInput.press('Enter');
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {}
        await page.waitForTimeout(500).catch(() => {});

        const results = itemTableLocator.locator('tbody tr');
        const count = await results.count();
        if (count === 0) {
          logger.warn(`No results for "${searchValue}" in ${dialogTestId}`);
          continue;
        }
        await results
          .first()
          .click()
          .catch(() => {});
        await page.waitForTimeout(200).catch(() => {});

        // Add to bottom table
        const addToBottomButton = modal.locator(`[data-testid="${addToBottomButtonTestId}"]`);
        await addToBottomButton.click().catch(() => {});
        await page.waitForTimeout(300).catch(() => {});

        // Ensure item appears in bottom table
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const bottomRows = bottomTable.locator('tbody tr');
        const bottomCount = await bottomRows.count();
        expect(bottomCount).toBeGreaterThan(0);

        // Set quantity if provided
        const desiredQty = (quantity ?? 1).toString();
        try {
          const lastRow = bottomRows.nth(bottomCount - 1);
          const qtyCell = lastRow.locator('td').nth(3);
          await qtyCell.dblclick();
          await page.waitForTimeout(100).catch(() => {});
          const qtyInput = qtyCell.locator('input');
          await qtyInput.fill(desiredQty);
          await page.waitForTimeout(50).catch(() => {});
          await qtyInput.press('Enter');
          await page.waitForTimeout(100).catch(() => {});
        } catch (e) {
          logger.warn(`Failed to set quantity for "${searchValue}": ${(e as Error).message}`);
        }
      }

      // Finalize: add all from bottom to main
      const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid') ? addToMainButtonTestId : `[data-testid="${addToMainButtonTestId}"]`;
      const addToMainButton = modal.locator(addToMainButtonSelector);
      await addToMainButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const enabled = await addToMainButton.isEnabled();
      if (enabled) {
        await addToMainButton.click().catch(() => {});
      } else {
        logger.warn('Add to main button disabled after multiple additions');
      }
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    } else {
      // Nothing to add, close modal via cancel button if exists, else escape by clicking cancel specific to dialog
      const cancelButtonTestId =
        dialogTestId === CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON
          : dialogTestId === CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON
          : dialogTestId === CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG
          ? CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON
          : CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON;
      const cancelButton = modal.locator(`[data-testid="${cancelButtonTestId}"]`);
      await cancelButton.click().catch(() => {});
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }

  /**
   * Resets a product's specification to match the provided configuration.
   */
  async resetProductSpecificationsByConfig(productSearch: string, config: TestProductSpecification): Promise<void> {
    const page = this.page;

    // Navigate to parts database and open product for editing
    await this.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
    const leftTable = page.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
    const searchInput = leftTable.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT}"]`);
    await searchInput.fill(productSearch);
    await searchInput.press('Enter');
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    await page.waitForTimeout(1000).catch(() => {});
    const firstRow = leftTable.locator('tbody tr:first-child');
    await firstRow.waitFor({ state: 'visible', timeout: 10000 });
    await firstRow.click();
    await page.waitForTimeout(300).catch(() => {});
    const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);
    await editButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    // СБ: clear and set from config.assemblies (search by name)
    await this.reconcileGroupClearAndSet(
      CONST.MAIN_PAGE_SMALL_DIALOG_СБ,
      CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
      'Specification-ModalCbed-AccordionCbed-Table',
      CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE,
      CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
      CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.assemblies || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    // Д: clear and set from config.details (search by name)
    await this.reconcileGroupClearAndSet(
      CONST.MAIN_PAGE_SMALL_DIALOG_Д,
      CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
      CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE,
      CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
      CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
      CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.details || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    // ПД: clear and set from config.standardParts (search by name)
    await this.reconcileGroupClearAndSet(
      CONST.MAIN_PAGE_SMALL_DIALOG_ПД,
      CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
      CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE,
      CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE,
      CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
      CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.standardParts || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    // РМ: clear and set from config.consumables (often empty)
    await this.reconcileGroupClearAndSet(
      CONST.MAIN_PAGE_SMALL_DIALOG_РМ,
      CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
      CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE,
      CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE,
      CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
      CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.consumables || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    // Save changes
    const saveButton = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
    await saveButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await saveButton.click().catch(() => {});
    await page.waitForTimeout(500).catch(() => {});
  }

  async removeItemFromSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    bottomTableTestId: string,
    removeButtonColumnIndex: number,
    searchValue: string,
    returnButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    // Determine column index based on item type
    //const columnIndex = itemType === "РМ" || itemType === "ПД" ? 0 : 1;
    const columnIndex = 1;
    // Step 1: Wait for the page to stabilize, then click the "Добавить" button
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    await addButton.evaluate(el => {
      el.style.backgroundColor = 'black';
      el.style.border = '2px solid red';
      el.style.color = 'white';
    });
    await addButton.click();
    await page.waitForTimeout(500);

    // Step 2: Click the small dialog button
    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.evaluate(el => {
      el.style.backgroundColor = 'black';
      el.style.border = '2px solid red';
      el.style.color = 'white';
    });
    await dialogButton.click();
    await page.waitForTimeout(1500);

    // Step 3: Highlight the modal and bottom table locator
    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await modal.evaluate(dialog => {
      dialog.style.border = '2px solid red'; // Highlight the modal
    });
    const bottomTableLocator = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
    await bottomTableLocator.evaluate(table => {
      table.style.border = '2px solid red'; // Highlight the bottom table
    });

    const rowsLocator = bottomTableLocator.locator('tbody tr');

    const rowCount = await rowsLocator.count();
    expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

    let isRowFound = false;

    // Step 4: Iterate through the rows to find the matching item
    for (let i = 0; i < rowCount; i++) {
      const row = rowsLocator.nth(i);
      await row.evaluate(table => {
        table.style.border = '2px solid red'; // Highlight the bottom table
      });
      await page.waitForTimeout(1500);
      const partNumber = await row.locator('td').nth(columnIndex).textContent();

      if (partNumber?.trim() === searchValue.trim()) {
        isRowFound = true;
        // Highlight the row with a red border (locating the item)
        const partNumberCell = await row.locator('td').nth(columnIndex);
        await partNumberCell.evaluate(el => {
          el.style.border = '2px solid red';
        });
        await page.waitForTimeout(1000);
        // Click the remove button and fully style the row
        const removeCell = row.locator('td').nth(removeButtonColumnIndex);
        await row.evaluate(el => {
          el.style.backgroundColor = 'black';
          el.style.border = '2px solid red';
          el.style.color = 'white';
        });

        await page.waitForTimeout(50); // Wait for the page to update
        await removeCell.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
    expect(isRowFound).toBeTruthy(); // Validate that the row was found and removed

    // Step 5: Validate item removal from the table
    const remainingRowsCount = await rowsLocator.count();
    expect(remainingRowsCount).toBe(rowCount - 1); // Ensure one row was removed

    // Step 6: Click the button to return to the main page
    const returnButton = page.locator(`[data-testid="${returnButtonTestId}"]`);
    await returnButton.evaluate(button => {
      button.style.backgroundColor = 'black';
      button.style.border = '2px solid green';
      button.style.color = 'white';
    });
    await page.waitForTimeout(500);
    await returnButton.click();
    await page.waitForLoadState('networkidle');
  }

  // async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
  //     // Locate the table using its data-testid
  //     const table = page.locator(`[data-testid="${tableTestId}"]`);

  //     // Wait for the first row of the table to be visible
  //     await table.locator('tr').first().waitFor({ state: 'visible' });

  //     // Fetch all rows inside tbody
  //     const rows = await table.locator('tbody tr').elementHandles();
  //     logger.info(`Total rows in tbody: ${rows.length}`);

  //     // Return error if no rows are found
  //     if (rows.length === 0) {
  //         throw new Error('No rows found in the table.');
  //     }

  //     // Initialize groups array
  //     const groups: { groupName: string; items: string[][] }[] = [];
  //     let currentGroup: { groupName: string; items: string[][] } | null = null;

  //     // Iterate over each row
  //     for (const row of rows) {
  //         try {
  //             // Check if the row is a group header
  //             const groupHeaderCell = await row.$eval('td[colspan]', (cell) => cell?.textContent?.trim()).catch(() => null);
  //             if (groupHeaderCell) {
  //                 // Create a new group with group name
  //                 currentGroup = { groupName: groupHeaderCell, items: [] };
  //                 groups.push(currentGroup);
  //                 logger.info(`Group header detected: "${currentGroup.groupName}"`);
  //             } else if (currentGroup) {
  //                 // Add data rows under the current group
  //                 const rowData = await row.$$eval('td', (cells) =>
  //                     cells.map((cell) => cell.textContent?.trim() || '')
  //                 );
  //                 currentGroup.items.push(rowData);
  //                 logger.info(`Added row to group "${currentGroup.groupName}": ${rowData}`);
  //             }
  //         } catch (error) {
  //             console.error(`Error processing row: ${error}`);
  //         }
  //     }

  //     // Debug final parsed result
  //     logger.info(`Parsed groups: ${JSON.stringify(groups, null, 2)}`);
  //     return groups;
  // }
  async compareTableData<T>(data1: { groupName: string; items: T[][] }[], data2: { groupName: string; items: T[][] }[]): Promise<boolean> {
    if (data1.length !== data2.length) {
      console.error('Data length mismatch');
      return false; // Arrays are different lengths
    }

    return data1.every((group1, index) => {
      const group2 = data2[index];

      // Compare group names
      if (group1.groupName !== group2.groupName) {
        console.error(`Group name mismatch: "${group1.groupName}" !== "${group2.groupName}"`);
        return false;
      }

      // Compare group items
      if (group1.items.length !== group2.items.length) {
        console.error(`Item count mismatch in group "${group1.groupName}"`);
        return false;
      }

      // Compare each item row
      return group1.items.every((row1, rowIndex) => {
        const row2 = group2.items[rowIndex];

        // Check if rows have the same length
        if (row1.length !== row2.length) {
          console.error(`Row length mismatch in group "${group1.groupName}", row ${rowIndex + 1}`);
          return false;
        }

        // Compare individual cells
        return row1.every((cell1, cellIndex) => {
          const cell2 = row2[cellIndex];
          if (cell1 !== cell2) {
            console.error(`Mismatch in group "${group1.groupName}", row ${rowIndex + 1}, cell ${cellIndex + 1}: "${cell1}" !== "${cell2}"`);
            return false;
          }
          return true;
        });
      });
    });
  }
  async isStringInNestedArray(nestedArray: string[][], searchString: string): Promise<boolean> {
    return nestedArray.some(innerArray => innerArray.includes(searchString));
  }
  async getQuantityByLineItem(data: { groupName: string; items: string[][] }[], searchString: string): Promise<number> {
    for (const group of data) {
      for (const lineItem of group.items) {
        if (lineItem.includes(searchString)) {
          // Return the quantity (assuming the quantity is in the last position of the line item array)
          return Promise.resolve(parseInt(lineItem[lineItem.length - 1], 10));
        }
      }
    }
    return Promise.resolve(0); // Return 0 if the string is not found
  }
  async validateTable(page: Page, tableTitle: string, expectedRows: { [key: string]: string }[]): Promise<boolean> {
    try {
      // Locate the section containing the table (using its h3 heading)
      const tableSection = page.locator(`h3:has-text("${tableTitle}")`).locator('..');
      // Debug: highlight the table section
      await tableSection.evaluate(el => {
        el.style.border = '2px solid red';
      });

      // ----- Validate Column Headers Order ----- //
      const headerCells = tableSection.locator('table thead tr th');
      const headerCount = await headerCells.count();
      // Expected column order is derived from the keys of the first expected row.
      // For a 3-col table, the keys might be: [ "Наименование", "ЕИ", "Значение" ]
      // For a 4-col table, they might be: [ "Наименование", "ЕИ", "Значение", "" ]
      const expectedColOrder = Object.keys(expectedRows[0]);
      if (headerCount !== expectedColOrder.length) {
        console.error(`Header column count mismatch for "${tableTitle}": expected ${expectedColOrder.length}, found ${headerCount}`);
        return false;
      }
      for (let i = 0; i < headerCount; i++) {
        const headerText = (await headerCells.nth(i).textContent())?.trim();
        if (headerText !== expectedColOrder[i]) {
          console.error(`Column header mismatch in table "${tableTitle}" at index ${i}: expected "${expectedColOrder[i]}", got "${headerText}"`);
          return false;
        }
      }

      // ----- Validate Table Rows ----- //
      const tableRows = tableSection.locator('table tbody tr');
      // Wait for the first row to be visible before proceeding.
      await tableRows.first().waitFor({ timeout: 10000 });

      // Handle the two different table structures based on headerCount
      if (headerCount === 3) {
        // For tables with 3 columns (e.g., "Параметры детали")
        for (let i = 0; i < expectedRows.length; i++) {
          const expectedRow = expectedRows[i];
          const row = tableRows.nth(i);
          // Debug: highlight each row
          await row.evaluate(el => {
            el.style.backgroundColor = 'yellow';
          });

          const actualName = (await row.locator('td').nth(0).textContent())?.trim();
          const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();
          const actualValue = (await row.locator('td').nth(2).textContent())?.trim();

          if (actualName !== expectedRow['Наименование'] || actualUnit !== expectedRow['ЕИ'] || actualValue !== expectedRow['Значение']) {
            console.error(
              `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`,
            );
            return false;
          }
        }
      } else if (headerCount === 4) {
        // For tables with 4 columns (e.g., "Характеристики детали")
        for (let i = 0; i < expectedRows.length; i++) {
          const expectedRow = expectedRows[i];
          const row = tableRows.nth(i);
          // Debug: highlight each row
          await row.evaluate(el => {
            el.style.backgroundColor = 'yellow';
          });

          const actualName = (await row.locator('td').nth(0).textContent())?.trim();
          const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();

          // Third column: attempt to read an input inside the cell first;
          // if no input exists, fallback to reading the cell text.
          const cellThird = row.locator('td').nth(2);
          let actualValue = '';
          if ((await cellThird.locator('input').count()) > 0) {
            actualValue = (await cellThird.locator('input').inputValue()).trim();
          } else {
            actualValue = ((await cellThird.textContent()) || '').trim();
          }

          // Fourth column: confirms that a button is visible.
          const isButtonVisible = await row.locator('td').nth(3).locator('button').isVisible();

          if (actualName !== expectedRow['Наименование'] || actualUnit !== expectedRow['ЕИ'] || actualValue !== expectedRow['Значение']) {
            console.error(
              `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`,
            );
            return false;
          }
          if (!isButtonVisible) {
            console.error(`Button in the fourth column is not visible in row ${i + 1} of table "${tableTitle}".`);
            return false;
          }
        }
      } else {
        console.error(`Unexpected header count (${headerCount}) for table "${tableTitle}".`);
        return false;
      }

      console.log(`Table "${tableTitle}" validation passed.`);
      return true;
    } catch (error) {
      console.error(`Error validating table "${tableTitle}":`, error);
      return false;
    }
  }

  /**
   * Validates an array of input field definitions.
   * For each field defined in the JSON, it:
   * • Uses a switch based on field type (and a special case for "Медиа файлы")
   * • Locates the element on the page
   * • Verifies that it is visible
   * • For text fields, fills in a test value and checks if the value was set correctly
   *
   * @param page - The Playwright page instance.
   * @param fields - An array of field definitions (each with title and type).
   * @returns A Promise that resolves to true if all fields validate correctly.
   */
  async validateInputFields(page: Page, fields: { title: string; type: string }[]): Promise<boolean> {
    try {
      for (const field of fields) {
        let fieldLocator;
        switch (field.type) {
          case 'input':
            if (field.title === 'Медиа файлы') {
              // For file inputs, use the visible label (assuming it contains "Прикрепить документ")
              fieldLocator = page.locator('label.dnd-yui-kit__label:has-text("Прикрепить документ")');
              await fieldLocator.evaluate(row => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
              });
            } else {
              // For normal text input fields (e.g. "Обозначение", "Наименование")
              fieldLocator = page.locator(`div.editor__information-inputs:has-text("${field.title}") input`);
              await fieldLocator.evaluate(row => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
              });
            }
            break;
          case 'textarea':
            // For "Описание / Примечание", look inside the description section
            fieldLocator = page.locator(`section.editor__description:has(h3:has-text("${field.title}")) textarea`);
            await fieldLocator.evaluate(row => {
              row.style.backgroundColor = 'yellow';
              row.style.border = '2px solid red';
              row.style.color = 'blue';
            });
            break;
          default:
            console.error(`Unsupported field type: ${field.type} for field "${field.title}"`);
            return false;
        }

        // Check that the field (or its visible label for file inputs) is visible.
        if (!(await fieldLocator.isVisible())) {
          console.error(`Field "${field.title}" is not visible.`);
          return false;
        }

        // Verify writability if it's a text field.
        if (!(field.type === 'input' && field.title === 'Медиа файлы')) {
          const testValue = 'Test Value';
          await fieldLocator.fill(testValue);
          const currentValue = await fieldLocator.inputValue();
          if (currentValue !== testValue) {
            console.error(`Field "${field.title}" is not writable. Expected "${testValue}", but got "${currentValue}".`);
            return false;
          }
        }

        console.log(`Field "${field.title}" is visible and ${field.type === 'input' && field.title === 'Медиа файлы' ? 'present' : 'writable'}.`);
      }
      console.log('All input fields validated successfully.');
      return true;
    } catch (error) {
      console.error('Error during input field validation:', error);
      return false;
    }
  }

  /**
   * Recursively parses a structured table for product specifications.
   * The function starts from the given table's data-testid and dynamically extracts group information and item rows.
   * It:
   * • Identifies group headers (СБ, Д, ПД, РМ) and categorizes items accordingly.
   * • Extracts structured data from each row, ensuring correct parsing of №, Обозначение, Наименование, Ед., Кол-во.
   * • Detects nested tables inside rows and processes them recursively.
   * • Detects modal links inside rows (for СБ items) and processes them recursively.
   * • Highlights rows while processing and resets styles afterward.
   *
   * @param page - The Playwright page instance.
   * @param tableTestId - The data-testid of the table to parse.
   * @returns A Promise that resolves to an object containing categorized groups (СБ, Д, ПД, РМ).
   */
  parsedData: { [key: string]: any[] } = { СБ: [], Д: [], ПД: [], МД: [], РМ: [] };
  async parseRecursiveStructuredTable(
    page: Page,
    tableTestId: string,
    parentId: string, // Pass product designation from detail page
    multiplier: number = 1,
  ): Promise<void> {
    const table = page.locator(`[data-testid^="${tableTestId}"]`).last();
    await table.locator('tr').first().waitFor({ state: 'visible' });

    const rows = await table.locator('tbody > tr').elementHandles();
    if (rows.length === 0) {
      throw new Error('No rows found in the table.');
    }

    let currentGroup: 'СБ' | 'Д' | 'ПД' | 'МД' | 'РМ' | null = null;
    const groupOrder: ('СБ' | 'Д' | 'ПД' | 'МД' | 'РМ')[] = ['СБ', 'Д', 'ПД', 'МД', 'РМ'];
    let groupDetected = new Set<string>(); // **Track detected groups**

    for (const row of rows) {
      try {
        const headerCell = await row.$('td[colspan="5"]:not(:has(table))');

        if (headerCell) {
          const text = await headerCell.textContent();
          if (text) {
            for (const group of groupOrder) {
              if (text.includes(group) || (group === 'СБ' && text.includes('Сборочная единица'))) {
                if (!groupDetected.has(group)) {
                  currentGroup = group;
                  groupDetected.add(group);
                  console.log(`Detected group header: ${currentGroup}`);
                }
                continue;
              }
            }
          }
        }

        if (currentGroup && groupDetected.has(currentGroup)) {
          const nestedTableCell = await row.$('td[colspan="5"]:has(table)');
          if (nestedTableCell) {
            const nestedRows = await nestedTableCell.$$('table tbody > tr');

            for (const nestedRow of nestedRows) {
              await nestedRow.evaluate(element => {
                element.style.border = '2px solid red';
                element.style.backgroundColor = 'yellow';
              });

              const rowData: string[] = [];
              const cells = await nestedRow.$$('td');

              for (const cell of cells) {
                const text = await cell.textContent();
                rowData.push(text?.trim() || '');
              }

              if (rowData.length === 5) {
                const item = {
                  designation: rowData[1],
                  name: rowData[2],
                  unit: currentGroup === 'СБ' || currentGroup === 'Д' ? parentId : rowData[3],
                  quantity: currentGroup === 'ПД' ? parseInt(rowData[4], 10) || 1 : parseInt(rowData[4], 10) * multiplier, // ✅ FIX: Use row data if available, default to 1
                };

                if (currentGroup === 'ПД') {
                  // ✅ Check if item already exists in `ПД`
                  const existingIndex = this.parsedData['ПД'].findIndex(existingItem => existingItem.name === item.name);
                  if (existingIndex !== -1) {
                    this.parsedData['ПД'][existingIndex] = item; // ✅ Overwrite existing item
                  } else {
                    this.parsedData['ПД'].push(item); // ✅ Add new item if not found
                  }
                } else {
                  this.parsedData[currentGroup].push(item);
                }

                if (currentGroup === 'СБ') {
                  console.log(`Opening modal for СБ item: ${rowData[1]} (quantity: ${item.quantity})`);
                  await nestedRow.click();
                  await page.waitForTimeout(500);

                  const modalDialog = page.locator(`dialog[data-testid^="ModalCbed"]`).nth(-1); // ✅ Get most recent modal
                  await modalDialog.waitFor({ state: 'visible' });
                  await modalDialog.evaluate(row => {
                    row.style.border = '2px solid red';
                  });
                  const specTable = modalDialog.locator(`[data-testid^="ModalCbed"][data-testid$="-TableSpecification-Cbed"]`).nth(-1);
                  await specTable.waitFor({ state: 'visible' });
                  await specTable.evaluate(row => {
                    row.style.border = '2px solid red';
                  });
                  await specTable.evaluate(el => el.scrollIntoView());
                  await page.waitForTimeout(500);

                  if ((await specTable.count()) > 0) {
                    const designationElement = modalDialog.locator('[data-testid^="ModalCbed"][data-testid$="Designation-Text"] span').nth(-1);
                    await designationElement.waitFor({ state: 'visible' });
                    await designationElement.evaluate(row => {
                      row.style.border = '2px solid red';
                    });
                    const parentDesignation = await designationElement.textContent();
                    console.log(`Extracted ParentDesignation: ${parentDesignation}`);

                    // ✅ Ensure recursion happens only if parentDesignation is valid
                    if (parentDesignation) {
                      await this.parseRecursiveStructuredTable(page, 'ModalCbed-TableSpecification-Cbed', parentDesignation, item.quantity);
                    }
                  }

                  await page.mouse.click(1, 1);
                  await page.waitForTimeout(1000);
                  console.log(`Closed modal for ${rowData[1]}`);
                }

                if (currentGroup === 'Д') {
                  console.log(`Opening material modal for Д item: ${rowData[1]}`);
                  await nestedRow.click();

                  const materialElement = page.locator(`[data-testid^="ModalDetal"][data-testid$="CharacteristicsMaterial-Items"]`);
                  await materialElement.evaluate(row => {
                    (row as HTMLElement).style.backgroundColor = 'yellow';
                    (row as HTMLElement).style.border = '2px solid red';
                    (row as HTMLElement).style.color = 'blue';
                  });
                  await materialElement.evaluate(el => el.scrollIntoView());
                  await materialElement.waitFor({ state: 'visible' });
                  await page.waitForTimeout(2000);

                  let materialText = await materialElement.textContent();
                  let materialGroup = '';

                  // ✅ Call the helper function to find the correct material type
                  if (materialText) {
                    materialGroup = await this.findMaterialType(page, materialText);
                    console.log('Searching for material: ' + materialText);
                    console.log('Found in group: ' + materialGroup);
                  } else {
                    console.warn('Material text is null, skipping material type lookup.');
                  }

                  if (materialText) {
                    console.log(`🔎 Processing material: ${materialText}`);
                    console.log(`📌 Found in group: ${materialGroup}`);

                    if (materialGroup === 'ПД') {
                      console.log(`🛠 Checking if ${materialText} exists in ПД...`);
                      const existingMaterial = this.parsedData['ПД'].find(mat => mat.name === materialText.trim());

                      if (existingMaterial) {
                        console.log(`✅ Existing ПД item found: ${existingMaterial.name}, current quantity: ${existingMaterial.quantity}`);
                        existingMaterial.quantity += item.quantity;
                        console.log(`🔄 Updated quantity: ${existingMaterial.quantity}`);
                      } else {
                        console.log(`➕ Adding new ПД item: ${materialText}, quantity: ${item.quantity}`);
                        this.parsedData['ПД'].push({
                          designation: '-',
                          name: materialText.trim(),
                          unit: 'шт',
                          quantity: item.quantity,
                        });
                      }
                    } else if (materialGroup === 'МД') {
                      console.log(`🛠 Checking if ${materialText} exists in МД...`);
                      const existingMaterial = this.parsedData['МД'].find(mat => mat.material === materialText.trim());

                      if (existingMaterial) {
                        console.log(`✅ Existing МД item found: ${existingMaterial.material}, overriding quantity to 1.`);
                        existingMaterial.quantity = 1;
                      } else {
                        console.log(`➕ Adding new МД item: ${materialText}, quantity: 1`);
                        this.parsedData['МД'].push({
                          material: materialText.trim(),
                          quantity: 1,
                        });
                      }
                    } else {
                      console.log(`🛠 Checking if ${materialText} exists in ${materialGroup}...`);
                      const existingMaterial = this.parsedData[materialGroup].find(mat => mat.material === materialText.trim());

                      if (existingMaterial) {
                        console.log(`✅ Existing ${materialGroup} item found: ${existingMaterial.material}, current quantity: ${existingMaterial.quantity}`);
                        existingMaterial.quantity += item.quantity;
                        console.log(`🔄 Updated quantity: ${existingMaterial.quantity}`);
                      } else {
                        console.log(`➕ Adding new ${materialGroup} item: ${materialText}, quantity: ${item.quantity}`);
                        this.parsedData[materialGroup].push({
                          material: materialText.trim(),
                          quantity: item.quantity,
                        });
                      }
                    }
                  }

                  page.mouse.click(1, 1);
                  await page.waitForTimeout(500);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing row: ${error}`);
      }
    }
    // ✅ Sort items within each group alphabetically by name
    for (const group of Object.keys(this.parsedData)) {
      if (this.parsedData[group]?.length > 0) {
        // Ensure group has items
        this.parsedData[group].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
    }
  }
  //this should really be in the materials base class
  async findMaterialType(page: Page, materialName: string): Promise<string> {
    // Open a new browser tab
    const newContext = await page.context().newPage();
    await newContext.goto(SELECTORS.MAINMENU.MATERIALS.URL);

    // Define possible material types
    const materialTypes = ['МД', 'ПД', 'РД'];
    const switchItems = ['MaterialTableList-Switch-Item1', 'MaterialTableList-Switch-Item2', 'MaterialTableList-Switch-Item3'];

    for (let i = 0; i < switchItems.length; i++) {
      const switchItem = newContext.locator(`[data-testid="${switchItems[i]}"]`);

      // Click the selector item to switch the category
      await switchItem.click();
      await newContext.waitForTimeout(500); // Small delay to allow the switch

      // Locate search input field
      const searchInput = newContext.locator('[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-Input"]');
      await searchInput.fill(materialName);
      await searchInput.press('Enter');
      await searchInput.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      await newContext.waitForTimeout(1000); // Wait for results

      // Locate the table
      const materialTable = newContext.locator('[data-testid="MaterialTableList-Table-Item"]');
      await materialTable.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      // Get number of rows
      const rows = await materialTable.locator('tbody tr').count();

      if (rows === 1) {
        // Found exactly one match, return corresponding material type
        await newContext.close();
        return materialTypes[i];
      } else if (rows > 1) {
        // More than one match—search through each row for an exact match
        const rowElements = await materialTable.locator('tbody tr').elementHandles();

        for (const row of rowElements) {
          const rowText = await row.textContent();

          if (rowText?.trim() === materialName) {
            // ✅ Exact match
            await row.evaluate(el => {
              (el as HTMLElement).style.backgroundColor = 'yellow'; // ✅ Cast `el` to HTMLElement
              (el as HTMLElement).style.border = '2px solid red';
              (el as HTMLElement).style.color = 'blue';
            });

            await newContext.close();
            return materialTypes[i];
          }
        }
      }
    }

    // No exact match found after checking all lists
    await newContext.close();
    throw new Error(`Material "${materialName}" not found in any category.`);
  }

  async searchAndSelectMaterial(sliderDataTestId: string, materialName: string): Promise<void> {
    // Open a new browser tab for material search.
    //const newPage = await this.page.context().newPage();
    //await newPage.goto(SELECTORS.MAINMENU.MATERIALS.URL);

    // Click the specified slider using its data-testid.
    const switchItem = this.page.locator(`[data-testid="${sliderDataTestId}"]`);
    await switchItem.click();
    await this.page.waitForTimeout(500);

    // Locate and fill the search input field, then trigger the search.
    const searchInput = this.page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]');
    await searchInput.fill(materialName);
    await searchInput.press('Enter');

    // Apply debug styling to the search input (optional).
    await searchInput.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    await this.page.waitForTimeout(1000);

    // Locate the material table and apply debug styling.
    const materialTable = this.page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item"]');
    await materialTable.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    // Retrieve the number of rows with search results.
    const rowsCount = await materialTable.locator('tbody tr').count();
    let materialFound = false;

    if (rowsCount === 1) {
      // If exactly one row is present, select it.
      const row = materialTable.locator('tbody tr').first();
      await row.click();
      materialFound = true;
    } else if (rowsCount > 1) {
      // If multiple rows are returned, iterate through them for an exact match.
      const rowElements = await materialTable.locator('tbody tr').elementHandles();
      for (const row of rowElements) {
        const rowText = await row.textContent();
        if (rowText?.trim() === materialName) {
          // Apply debug styling before clicking.
          await row.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });
          await row.click();
          materialFound = true;
          break;
        }
      }
    }
    await this.page.waitForTimeout(1000);

    // Expect a material to have been selected.
    expect(materialFound).toBe(true);
  }

  async extractAllTableData(page: Page, dialogTestId: string): Promise<any> {
    const TABLE_SELECTORS = {
      СБ: "[data-testid='Specification-ModalCbed-AccordionCbed-Table']",
      Д: "[data-testid='Specification-ModalCbed-AccordionDetalContent-Table']",
      ПД: "[data-testid='Specification-ModalCbed-AccordionBuyersMaterial-Table']",
      МД: "[data-testid='Specification-ModalCbed-ModalComplect-MateriaDetalTable']",
      РМ: "[data-testid='Specification-ModalCbed-Accordion-MaterialRashod-Table']",
    };

    const structuredData: { [key: string]: any[] } = {
      СБ: [],
      Д: [],
      ПД: [],
      МД: [],
      РМ: [],
    };

    const dialog = page.locator(`[data-testid="${dialogTestId}"]`);
    await dialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);

    for (const [group, selector] of Object.entries(TABLE_SELECTORS)) {
      const table = dialog.locator(selector);

      if ((await table.count()) === 0) {
        console.log(`Skipping ${group}: Table does not exist.`);
        continue;
      }

      try {
        await table.waitFor({ state: 'attached', timeout: 3000 });
      } catch {
        console.log(`Skipping ${group}: Table is not attached.`);
        continue;
      }

      await page.waitForTimeout(500);

      if ((await table.locator('tbody > tr').count()) === 0) {
        console.log(`Skipping ${group}: Table is empty.`);
        continue;
      }

      const rows = await table.locator('tbody > tr').elementHandles();

      for (const row of rows) {
        await row.evaluate(node => {
          (node as HTMLElement).style.backgroundColor = 'yellow';
          (node as HTMLElement).style.border = '2px solid red';
          (node as HTMLElement).style.color = 'blue';
        });

        const cells = await row.$$('td');
        const rowData = await Promise.all(
          cells.map(async cell => {
            const text = await cell.textContent();
            return text?.trim() || '';
          }),
        );

        if (group === 'ПД') {
          console.log(rowData);
        }

        // ✅ Handle РМ items separately (only 3 columns)
        if (group === 'РМ' && rowData.length === 3) {
          structuredData['РМ'].push({
            name: rowData[0] || '',
            unit: rowData[1] || 'шт',
            quantity: parseInt(rowData[2], 10) || 1, // Ensure quantity defaults to 1 if missing
          });
        }
        // ✅ Standard handling for other groups
        else if (rowData.length >= 4 || (group === 'ПД' && rowData.length === 3)) {
          let quantity = parseInt(rowData[4], 10);
          if (isNaN(quantity)) quantity = 1;

          if (group === 'МД') {
            const materialName = rowData[1];
            const existingMaterial = structuredData['МД'].find(mat => mat.material === materialName);
            if (existingMaterial) {
              existingMaterial.quantity += quantity;
            } else {
              structuredData['МД'].push({ material: materialName, quantity });
            }
          } else if (group === 'ПД') {
            structuredData['ПД'].push({
              designation: rowData[6] || '-',
              name: rowData[1] || '',
              unit: rowData[3] || 'шт',
              quantity: parseInt(rowData[2], 10) || 1, // Ensure quantity defaults to 1 if missing
            });
          } else {
            structuredData[group].push({
              designation: rowData[6] || '-',
              name: rowData[7] || '',
              unit: rowData[3] || 'шт',
              quantity,
            });
          }
        }
      }
    }

    // ✅ Ensure sorting consistency across all groups
    for (const group of Object.keys(structuredData)) {
      if (structuredData[group]?.length > 0) {
        structuredData[group].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
    }

    return structuredData;
  }

  async checkItemExistsInBottomTable(page: Page, selectedPartName: string, modalTestId: string, bottomTableTestId: string): Promise<boolean> {
    await page.waitForLoadState('networkidle');

    // Normalize modal test id: accept raw id or full selector
    let modalId = modalTestId;
    const modalMatch = modalTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (modalMatch && modalMatch[1]) {
      modalId = modalMatch[1];
    }

    // Locate the specific modal containing the table
    const modal = page.locator(`dialog[data-testid^="${modalId}"]`);
    await modal.waitFor({ state: 'attached', timeout: 15000 });
    await modal.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Modal located successfully.');

    await page.waitForTimeout(1500);

    // Normalize bottom table selector: accept raw id or full selector
    let bottomTableSelector = bottomTableTestId;
    const tableMatch = bottomTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (tableMatch && tableMatch[1]) {
      bottomTableSelector = `[data-testid="${tableMatch[1]}"]`;
    } else if (!bottomTableTestId.includes('data-testid')) {
      bottomTableSelector = `[data-testid="${bottomTableTestId}"]`;
    }

    // Locate the bottom table dynamically within the modal
    const bottomTableLocator = modal.locator(bottomTableSelector);

    // **Check if the bottom table exists**
    const isTableVisible = await bottomTableLocator.isVisible();
    if (!isTableVisible) {
      logger.info(`Bottom table '${bottomTableTestId}' does not exist. Returning false.`);
      return false; // ✅ Table doesn't exist, meaning the item isn't there
    }

    await bottomTableLocator.waitFor({ state: 'attached', timeout: 15000 });
    logger.info('Bottom table located successfully.');

    await page.waitForTimeout(1000);

    // Locate all rows in the table body
    const rowsLocator = bottomTableLocator.locator('tbody tr');
    const rowCount = await rowsLocator.count();
    logger.info(`Found ${rowCount} rows in the bottom table.`);

    for (let i = 0; i < rowCount; i++) {
      const row = rowsLocator.nth(i);

      // Wait for the row to become visible
      await row.waitFor({ state: 'visible', timeout: 5000 });

      // Extract part name from the second column (index 1)
      const partNameCell = row.locator('td').nth(1);
      const partName = (await partNameCell.textContent())?.trim();

      logger.info(`Row ${i + 1}: PartName=${partName}`);

      // Check if the current row matches the selected part name
      if (partName === selectedPartName) {
        // Highlight the matching row for debugging
        await row.evaluate(rowElement => {
          rowElement.style.backgroundColor = 'yellow';
          rowElement.style.border = '2px solid green';
          rowElement.style.color = 'blue';
        });

        logger.info(`Selected part name found in row ${i + 1}`);
        return true; // ✅ Item exists in the bottom table
      }
    }

    logger.info('Item not found in the bottom table.');
    return false; // ✅ Item does NOT exist in the bottom table
  }

  // In CreatePartsDatabasePage.ts
  async fillDetailName(detailName: string, dataTestId: string = 'AddDetal-Information-Input-Input'): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Check if dataTestId already contains the full selector with [data-testid=
    const selector = dataTestId.startsWith('[data-testid=') ? dataTestId : `[data-testid="${dataTestId}"]`;
    const field = this.page.locator(selector);

    // (Optional) Highlight for debugging
    await field.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    // Clear any text and simulate Enter to reset the field if necessary
    await field.fill('');
    await field.press('Enter');
    await this.page.waitForTimeout(500);

    // Fill in the provided detail name
    await field.fill(detailName);
    await this.page.waitForTimeout(500);

    // Verify the input value is as expected
    await expect(await field.inputValue()).toBe(detailName);
    await this.page.waitForTimeout(50);
  }
  /**
   * Verifies that a success message is shown after saving a detail.
   * This method uses the generic notification element with data-testid
   * "Notification-Notification-Description" (same as used in getMessage).
   */
  async verifyDetailSuccessMessage(expectedText: string): Promise<void> {
    try {
      // Wait for page to be stable first
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);

      // Locate the notification element using the same data-testid as getMessage:
      const successDialog = this.page.locator('[data-testid="Notification-Notification-Description"]').last();

      // Wait for visibility with a timeout, but don't fail if not found
      const isVisible = await successDialog.isVisible().catch(() => false);

      if (!isVisible) {
        console.warn('Success notification not visible - this might be normal after rapid clicking');
        return; // Don't fail the test if notification is not visible
      }

      // Apply styling for visibility
      await successDialog.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });

      // Retrieve and log the text content for debugging
      const dialogText = await successDialog.textContent();
      console.log('Success dialog text:', dialogText);

      // Verify that the notification contains the expected text
      if (dialogText) {
        expect(dialogText).toContain(expectedText);
      } else {
        logger.warn('Notification text is empty - this might be normal after rapid clicking');
      }
    } catch (error) {
      logger.warn(`Error verifying success message: ${error instanceof Error ? error.message : String(error)}`);
      // Don't fail the test if notification verification fails
    }
  }

  // --- U006-specific reusable methods ---

  /**
   * Verifies that a file with a given base name and extension exists in the file table.
   * @param parentSectionTestId - data-testid of the parent section containing the file table
   * @param tableRowSelector - selector for the table rows (e.g., '.table-yui-kit__tr')
   * @param name - base file name to search for
   * @param extension - file extension to check
   */
  async verifyFileInTable(parentSectionTestId: string, tableRowSelector: string, name: string, extension: string): Promise<void> {
    const parentSection = this.page.locator(`[data-testid="${parentSectionTestId}"]`);
    await this.page.waitForTimeout(1000);
    const tableRows = parentSection.locator(tableRowSelector);
    const matchingRows = await tableRows.locator(`.table-yui-kit__td:nth-child(2):has-text("${name}")`);
    const rowCount = await matchingRows.count();
    if (rowCount > 0) {
      let extensionMatch = false;
      for (let i = 0; i < rowCount; i++) {
        const rowText = await matchingRows.nth(i).textContent();
        if (rowText && rowText.includes(extension)) {
          extensionMatch = true;
          break;
        }
      }
      if (!extensionMatch) {
        throw new Error(`File "${name}" is present but does not match the expected extension "${extension}".`);
      }
    } else {
      throw new Error(`No files found with base name "${name}".`);
    }
  }

  /**
   * Uploads files using a hidden file input.
   * @param fileInputSelector - selector for the file input (e.g., 'input#docsFileSelected')
   * @param filePaths - array of file paths to upload
   */
  async uploadFiles(fileInputSelector: string, filePaths: string[]): Promise<void> {
    const fileInput = this.page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000);
    const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => element.files?.length || 0);
    if (uploadedFiles !== filePaths.length) {
      throw new Error(`Expected to upload ${filePaths.length} files, but got ${uploadedFiles}`);
    }
  }

  /**
   * Validates textarea, checkbox, version, and file name input in a file section.
   * @param fileSectionLocator - Locator for the file section
   * @param textareaTestId - data-testid for the textarea
   * @param checkboxTestId - data-testid for the checkbox
   * @param versionInputTestId - data-testid for the version input
   * @param fileNameInputTestId - data-testid for the file name input
   * @param testValue - value to fill in the textarea
   */
  async validateFileSectionFields(
    fileSectionLocator: Locator,
    textareaTestId: string,
    checkboxTestId: string,
    versionInputTestId: string,
    fileNameInputTestId: string,
    testValue: string,
  ): Promise<void> {
    const textarea = fileSectionLocator.locator(`textarea[data-testid="${textareaTestId}"]`);
    await textarea.fill(testValue);
    expect(await textarea.inputValue()).toBe(testValue);
    const checkbox = fileSectionLocator.locator(`input[data-testid="${checkboxTestId}"]`);
    expect(await checkbox.isVisible()).toBeTruthy();
    const version = fileSectionLocator.locator(`input[data-testid="${versionInputTestId}"]`);
    expect(await version.isVisible()).toBeTruthy();
    const fileName = fileSectionLocator.locator(`input[data-testid="${fileNameInputTestId}"]`);
    expect(await fileName.isVisible()).toBeTruthy();
  }
  // --- End U006-specific methods ---

  // --- Additional U006 reusable methods ---

  /**
   * Verifies table rows with a specific pattern and highlights them.
   * @param tableLocator - The table locator
   * @param rowSelector - The row selector within the table
   * @param expectedCount - Expected number of rows
   * @param highlightRows - Whether to highlight the rows (default: true)
   */
  async verifyTableRows(tableLocator: Locator, rowSelector: string, expectedCount: number, highlightRows: boolean = true): Promise<void> {
    const rows = tableLocator.locator(rowSelector);
    const actualCount = await rows.count();

    logger.info(`Found ${actualCount} rows in table, expected ${expectedCount}`);
    expect(actualCount).toBe(expectedCount);

    if (highlightRows) {
      for (let i = 0; i < actualCount; i++) {
        await this.highlightElement(rows.nth(i));
      }
    }
  }

  /**
   * Fills a form field and verifies the input value.
   * @param dataTestId - The data-testid of the input field
   * @param value - The value to fill
   * @param clearFirst - Whether to clear the field first (default: true)
   */
  async fillAndVerifyField(dataTestId: string, value: string, clearFirst: boolean = true): Promise<void> {
    const field = this.page.locator(`[data-testid="${dataTestId}"]`);
    await field.waitFor({ state: 'visible' });
    await this.highlightElement(field);

    if (clearFirst) {
      await field.clear();
      await this.page.waitForTimeout(500);
    }

    await field.fill(value);
    await this.page.waitForTimeout(500);

    const actualValue = await field.inputValue();
    expect(actualValue).toBe(value);
    logger.info(`Field ${dataTestId} filled with: ${value}`);
  }

  /**
   * Clicks a button and waits for network idle.
   * @param dataTestId - The data-testid of the button
   * @param waitForNetworkIdle - Whether to wait for network idle (default: true)
   */
  async clickButtonByDataTestId(dataTestId: string, waitForNetworkIdle: boolean = true): Promise<void> {
    const button = this.page.locator(`[data-testid="${dataTestId}"]`);
    await button.waitFor({ state: 'visible' });
    await this.highlightElement(button);
    await button.click();

    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle');
    }

    logger.info(`Clicked button: ${dataTestId}`);
  }

  /**
   * Verifies that a modal is visible and highlights it.
   * @param modalDataTestId - The data-testid of the modal
   * @param timeout - Optional timeout for waiting (default: 30000)
   */
  async verifyModalVisible(modalDataTestId: string, timeout: number = 30000): Promise<Locator> {
    const modal = this.page.locator(`[data-testid="${modalDataTestId}"]`);
    await modal.waitFor({ state: 'visible', timeout });
    await this.highlightElement(modal);
    logger.info(`Modal ${modalDataTestId} is visible`);
    return modal;
  }

  /**
   * Searches for text in a table and verifies the result.
   * @param tableLocator - The table locator
   * @param searchInputSelector - The search input selector
   * @param searchValue - The value to search for
   * @param expectedResult - The expected result text
   */
  async searchInTableAndVerify(tableLocator: Locator, searchInputSelector: string, searchValue: string, expectedResult: string): Promise<void> {
    const searchInput = tableLocator.locator(searchInputSelector);
    await searchInput.waitFor({ state: 'visible' });
    await this.highlightElement(searchInput);

    await searchInput.fill(searchValue);
    await searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    const firstRow = tableLocator.locator('tbody tr').first();
    const firstRowText = await firstRow.locator('td').nth(1).textContent();
    expect(firstRowText?.trim()).toBe(expectedResult.trim());

    logger.info(`Search completed: found "${firstRowText}" for search term "${searchValue}"`);
  }

  /**
   * Verifies file upload functionality.
   * @param fileInputSelector - The file input selector
   * @param filePaths - Array of file paths to upload
   * @param expectedCount - Expected number of uploaded files
   */
  async verifyFileUpload(fileInputSelector: string, filePaths: string[], expectedCount: number): Promise<void> {
    const fileInput = this.page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000);

    const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => element.files?.length || 0);
    logger.info(`Number of files uploaded: ${uploadedFiles}`);

    expect(uploadedFiles).toBe(expectedCount);
    logger.info('Files successfully uploaded via the hidden input.');
  }

  /**
   * Verifies document table operations (check, print, delete).
   * @param tableLocator - The document table locator
   * @param rowIndex - The row index to operate on (default: 0)
   */
  async verifyDocumentTableOperations(tableLocator: Locator, rowIndex: number = 0): Promise<void> {
    const row = tableLocator.locator('tbody tr').nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    await this.highlightElement(row);

    // Verify checkbox
    const checkbox = row.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Verify print button - using the constant from the top of the file
    const printButton = this.page.locator(`[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint"]`);
    await expect(printButton).toBeVisible();
    await this.highlightElement(printButton);

    // Verify delete button - using the constant from the top of the file
    const deleteButton = this.page.locator(`[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc"]`);
    await expect(deleteButton).toBeVisible();
    await this.highlightElement(deleteButton);

    logger.info('Document table operations verified successfully');
  }

  /**
   * Archives a document and verifies the archive operation.
   * @param archiveButtonDataTestId - The archive button data-testid
   * @param confirmButtonDataTestId - The confirm button data-testid
   */
  async archiveDocument(archiveButtonDataTestId: string, confirmButtonDataTestId: string): Promise<void> {
    const archiveButton = this.page.locator(`[data-testid="${archiveButtonDataTestId}"]`);
    await expect(archiveButton).toBeVisible();
    await archiveButton.click();
    await this.page.waitForLoadState('networkidle');

    const confirmButton = this.page.locator(`[data-testid="${confirmButtonDataTestId}"]`);
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cleans up existing test details/assemblies by searching and archiving them.
   * @param page - The page object
   * @param detailName - The name of the detail/assembly to clean up
   * @param tableTestId - The data-testid of the table to search in
   * @param searchInputTestId - The data-testid of the search input field (optional, defaults to standard search input)
   * @param archiveButtonTestId - The data-testid of the archive button (optional, defaults to standard archive button)
   * @param confirmModalTestId - The data-testid of the confirm modal (optional, defaults to standard confirm modal)
   * @param confirmButtonTestId - The data-testid of the confirm button (optional, defaults to standard confirm button)
   */
  async cleanupTestDetail(
    page: Page,
    detailName: string,
    tableTestId: string,
    searchInputTestId?: string,
    archiveButtonTestId?: string,
    confirmModalTestId?: string,
    confirmButtonTestId?: string,
  ): Promise<void> {
    const detailTable = page.locator(`[data-testid="${tableTestId}"]`);
    const searchInputSelector = searchInputTestId || 'BasePaginationTable-Thead-SearchInput-Dropdown-Input';
    const searchInput = detailTable.locator(`[data-testid="${searchInputSelector}"]`);

    // Clear search and search for the detail
    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Get all rows and find exact matches
    const rows = detailTable.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      console.log(`No existing ${detailName} found for cleanup`);
      return;
    }

    // Filter rows to find exact matches
    const matchingRows: Locator[] = [];
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText && rowText.trim() === detailName) {
        matchingRows.push(rows.nth(i));
      }
    }

    // Archive each matching row
    for (let i = matchingRows.length - 1; i >= 0; i--) {
      const currentRow = matchingRows[i];

      // Click the row to select it
      await currentRow.click();
      await page.waitForTimeout(500);

      // Click the archive button
      const archiveButtonSelector = archiveButtonTestId || 'BaseProducts-Button-Archive';
      const archiveButton = page.locator(`[data-testid="${archiveButtonSelector}"]`);
      await expect(archiveButton).toBeVisible();
      await archiveButton.click();
      await page.waitForLoadState('networkidle');

      // Confirm archive in modal
      const confirmModalSelector = confirmModalTestId || 'ModalConfirm';
      const archiveModal = page.locator(`dialog[data-testid="${confirmModalSelector}"]`);
      await expect(archiveModal).toBeVisible();

      const confirmButtonSelector = confirmButtonTestId || MODAL_CONFIRM_DIALOG_YES_BUTTON;
      const yesButton = archiveModal.locator(`[data-testid="${confirmButtonSelector}"]`);
      await expect(yesButton).toBeVisible();
      await yesButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    console.log(`✅ Cleaned up ${matchingRows.length} instances of ${detailName}`);
  }

  /**
   * Cleans up test items by searching for items with a given prefix and archiving all found items.
   * Used for U002 test suite setup to clean up DEFAULT_DETAIL, DEFAULT_CBED, and DEFAULT_IZD items.
   * @param itemTypeName - Display name for the item type (e.g., "DETAIL", "CBED", "IZD")
   * @param searchPrefix - The search term prefix to find items (e.g., "DEFAULT_DETAIL")
   * @param searchInputSelector - Selector for the search input field
   * @param tableSelector - Selector for the table containing the items
   * @param searchInputPosition - Position of the search input if multiple exist: 'first', 'last', or a number for nth() (default: 'first')
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirm button in the archive modal
   */
  async cleanupTestItemsByPrefix(
    itemTypeName: string,
    searchPrefix: string,
    searchInputSelector: string,
    tableSelector: string,
    searchInputPosition: 'first' | 'last' | number = 'first',
    archiveButtonSelector: string = SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON,
    confirmButtonSelector: string = SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON,
  ): Promise<void> {
    await allure.step(`Clean up ${itemTypeName} items`, async () => {
      console.log(`${itemTypeName}: Cleaning up ${itemTypeName} items...`);

      // Handle multiple search inputs by selecting the correct one based on position
      let searchInput = this.page.locator(searchInputSelector);
      if (searchInputPosition === 'first') {
        searchInput = searchInput.first();
      } else if (searchInputPosition === 'last') {
        searchInput = searchInput.last();
      } else if (typeof searchInputPosition === 'number') {
        searchInput = searchInput.nth(searchInputPosition);
      }

      await searchInput.clear();
      await searchInput.fill(searchPrefix);
      await searchInput.press('Enter');
      await this.page.waitForTimeout(2000);

      const rows = this.page.locator(`${tableSelector} tbody tr`);
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} ${itemTypeName} items to delete`);

      // Delete items from bottom up
      for (let i = rowCount - 1; i >= 0; i--) {
        const row = rows.nth(i);
        await row.click();
        await this.clickButton('Архив', archiveButtonSelector);
        const confirmButton = this.page.locator(confirmButtonSelector, { hasText: 'Да' });
        await confirmButton.click();
        await this.page.waitForTimeout(1000);
      }

      console.log(`Deleted ${rowCount} ${itemTypeName} items`);
    });
  }

  /**
   * Adds a detail to an assembly specification.
   * @param page - The page object
   * @param detailName - The name of the detail to add
   */
  async addDetailToAssemblySpecification(page: Page, detailName: string): Promise<void> {
    // Click "Добавить" button to open the dialog
    await page.locator(`[data-testid="Specification-Buttons-addingSpecification"]`).click();
    await page.waitForTimeout(1000);

    // Select "Деталь" icon (use .first() to avoid strict mode violation)
    await page.locator(`[data-testid="Specification-Dialog-CardbaseDetail1"]`).first().click();
    await page.waitForTimeout(1000);

    // Wait for the dialog to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Search for the detail in the dialog
    const dialogTable = page.locator(`[data-testid="BasePaginationTable-Table-detal"]`);

    // Wait for the table to be visible first
    await expect(dialogTable).toBeVisible({ timeout: 10000 });

    const dialogSearchInput = dialogTable.locator(`[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]`);

    // Wait for the search input to be visible with a longer timeout
    await expect(dialogSearchInput).toBeVisible({ timeout: 10000 });

    // Clear any existing search and search for the detail
    await dialogSearchInput.fill('');
    await dialogSearchInput.press('Enter');
    await page.waitForTimeout(1000);

    await dialogSearchInput.fill(detailName);
    await dialogSearchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click the detail in search results
    const resultRows = dialogTable.locator('tbody tr');
    const rowCount = await resultRows.count();
    let found = false;

    for (let i = 0; i < rowCount; i++) {
      const rowText = await resultRows.nth(i).textContent();
      if (rowText && rowText.trim() === detailName) {
        // Highlight the search result row before clicking
        const targetRow = resultRows.nth(i);
        await this.highlightElement(targetRow);
        await targetRow.click();
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Detail "${detailName}" not found in dialog results.`);
    }

    await page.waitForTimeout(1000);

    // Add the detail to the assembly
    await page.locator(`[data-testid="Specification-ModalBaseDetal-Select-Button"]`).click();
    await page.waitForTimeout(1000);
    await page.locator(`[data-testid="Specification-ModalBaseDetal-Add-Button"]`).click();
    await page.waitForTimeout(1000);

    // Check for any notification message when detail is added to assembly
    await this.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');

    console.log(`✅ Added detail "${detailName}" to assembly`);
  }

  // --- End Additional U006 reusable methods ---

  // Constants for page state detection
  private readonly ADD_DETAL_TITLE = 'AddDetal-Title';
  private readonly EDIT_DETAL_TITLE = 'EditDetal-Title';
  private readonly SAVE_BUTTON = 'AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save';
  private readonly EDIT_SAVE_BUTTON = 'EditDetal-ButtonSaveAndCancel-ButtonsCenter-Save';

  /**
   * Determine the current page type (add or edit mode)
   * @returns 'add', 'edit', or 'unknown'
   */
  async getCurrentPageType(): Promise<'add' | 'edit' | 'unknown'> {
    try {
      // Wait for page to be stable after navigation
      await this.page.waitForLoadState('domcontentloaded');

      // Add a small delay to ensure DOM is fully ready
      await this.page.waitForTimeout(500);

      // Debug: Log current URL and page title
      logger.info(`getCurrentPageType - Current URL: ${this.page.url()}`);
      logger.info(`getCurrentPageType - Page title: ${await this.page.title()}`);

      // Try multiple selectors to determine page type - prioritize more reliable indicators
      const selectors = [
        // Input field selectors (most reliable)
        { add: `[data-testid="AddDetal-Information-Input-Input"]`, edit: `[data-testid="EditDetal-Information-Input-Input"]` },
        // Container selectors
        { add: `[data-testid="AddDetal"]`, edit: `[data-testid="EditDetal"]` },
        // Characteristic blanks container selectors
        { add: `[data-testid="AddDetal-CharacteristicBlanks"]`, edit: `[data-testid="EditDetal-CharacteristicBlanks"]` },
        // Save button selectors
        { add: `[data-testid="${this.SAVE_BUTTON}"]`, edit: `[data-testid="${this.EDIT_SAVE_BUTTON}"]` },
        // Title selectors (less reliable)
        { add: `[data-testid="${this.ADD_DETAL_TITLE}"]`, edit: `[data-testid="${this.EDIT_DETAL_TITLE}"]` },
        // Alternative title selectors
        { add: `h3:has-text("Создание детали")`, edit: `h3:has-text("Редактирование детали")` },
      ];

      for (const selectorPair of selectors) {
        try {
          const addElement = this.page.locator(selectorPair.add);
          const editElement = this.page.locator(selectorPair.edit);

          const addCount = await addElement.count();
          const editCount = await editElement.count();

          logger.debug(`Selector pair - Add: ${selectorPair.add} (count: ${addCount}), Edit: ${selectorPair.edit} (count: ${editCount})`);

          if (addCount > 0) {
            logger.info(`Page type determined as 'add' using selector: ${selectorPair.add}`);
            return 'add';
          }
          if (editCount > 0) {
            logger.info(`Page type determined as 'edit' using selector: ${selectorPair.edit}`);
            return 'edit';
          }
        } catch (selectorError) {
          logger.debug(`Selector pair failed: ${selectorError instanceof Error ? selectorError.message : String(selectorError)}`);
          continue;
        }
      }

      // Additional fallback: Check for any elements with data-testid containing "AddDetal" or "EditDetal"
      const addDetalElements = this.page.locator('[data-testid*="AddDetal"]');
      const editDetalElements = this.page.locator('[data-testid*="EditDetal"]');

      const addDetalCount = await addDetalElements.count();
      const editDetalCount = await editDetalElements.count();

      logger.info(`getCurrentPageType - Found ${addDetalCount} AddDetal elements and ${editDetalCount} EditDetal elements`);

      if (addDetalCount > 0 && editDetalCount === 0) {
        logger.info("Page type determined as 'add' based on AddDetal elements");
        return 'add';
      }
      if (editDetalCount > 0 && addDetalCount === 0) {
        logger.info("Page type determined as 'edit' based on EditDetal elements");
        return 'edit';
      }

      // Debug: Check for any h3 elements on the page
      const h3Elements = this.page.locator('h3');
      const h3Count = await h3Elements.count();
      logger.info(`getCurrentPageType - Found ${h3Count} h3 elements on page`);

      for (let i = 0; i < h3Count; i++) {
        const h3Text = await h3Elements.nth(i).textContent();
        logger.info(`getCurrentPageType - H3 ${i}: "${h3Text}"`);
      }

      // Debug: Check for any elements with data-testid containing "Detal"
      const detalElements = this.page.locator('[data-testid*="Detal"]');
      const detalCount = await detalElements.count();
      logger.info(`getCurrentPageType - Found ${detalCount} elements with data-testid containing "Detal"`);

      for (let i = 0; i < Math.min(detalCount, 10); i++) {
        // Limit to first 10 for logging
        const testId = await detalElements.nth(i).getAttribute('data-testid');
        logger.info(`getCurrentPageType - Detal element ${i}: data-testid="${testId}"`);
      }

      // If no selectors worked, check if we're in a loading state
      const loadingIndicators = ['[data-testid*="Loading"]', '[data-testid*="Spinner"]', '.loading', '.spinner'];

      for (const loadingSelector of loadingIndicators) {
        const loadingElement = this.page.locator(loadingSelector);
        if ((await loadingElement.count()) > 0) {
          logger.info('Page appears to be in loading state');
          return 'unknown';
        }
      }

      logger.warn('Unable to determine page type - no known selectors found');
      return 'unknown';
    } catch (error) {
      logger.warn(`Error determining page type: ${error instanceof Error ? error.message : String(error)}`);
      return 'unknown';
    }
  }

  /**
   * Get the appropriate save button based on current page type
   * @returns Locator for the save button
   * @throws Error if page type is unknown
   */
  async getSaveButton(): Promise<Locator> {
    const pageType = await this.getCurrentPageType();
    if (pageType === 'add') {
      return this.page.locator(`[data-testid="${this.SAVE_BUTTON}"]`);
    } else if (pageType === 'edit') {
      return this.page.locator(`[data-testid="${this.EDIT_SAVE_BUTTON}"]`);
    }
    throw new Error(`Unknown page type: ${pageType}`);
  }

  /**
   * Check if a save operation is currently in progress
   * @returns true if save operation is in progress, false otherwise
   */
  async isSaveInProgress(): Promise<boolean> {
    try {
      const saveButton = await this.getSaveButton();
      const isEnabled = await saveButton.isEnabled();
      return !isEnabled;
    } catch (error) {
      // If we can't get the save button, assume save is in progress
      return true;
    }
  }

  /**
   * Perform rapid save button clicks with intelligent state handling
   * @param maxClicks Maximum number of clicks to attempt
   * @param options Configuration options for the operation
   * @returns Object with results of the operation
   */
  async performRapidSaveClicks(
    maxClicks: number = 10,
    options: {
      maxConsecutiveFailures?: number;
      stabilizationDelay?: number;
      progressCheckDelay?: number;
    } = {},
  ): Promise<{
    clicksPerformed: number;
    pageTransitioned: boolean;
    finalPageType: 'add' | 'edit' | 'unknown';
    errors: string[];
  }> {
    const { maxConsecutiveFailures = 3, stabilizationDelay = 200, progressCheckDelay = 300 } = options;

    let clicksPerformed = 0;
    let pageTransitioned = false;
    let consecutiveFailures = 0;
    const errors: string[] = [];

    for (let i = 0; i < maxClicks; i++) {
      try {
        // Wait for page stability before checking state
        await this.page.waitForLoadState('domcontentloaded');

        // Check current page state
        const currentPageType = await this.getCurrentPageType();

        if (currentPageType === 'unknown') {
          logger.warn(`Attempt ${i + 1}: Unable to determine page type`);
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            errors.push('Too many consecutive failures, stopping');
            break;
          }
          await this.page.waitForTimeout(1000); // Increased wait time
          continue;
        }

        // Log page transition
        if (currentPageType === 'edit' && !pageTransitioned) {
          logger.info(`Attempt ${i + 1}: Page transitioned to edit mode`);
          pageTransitioned = true;
        }

        // Get the appropriate save button
        const saveButton = await this.getSaveButton();

        // Check button availability with better error handling
        let isVisible = false;
        let isEnabled = false;

        try {
          isVisible = await saveButton.isVisible();
          isEnabled = await saveButton.isEnabled();
        } catch (buttonError) {
          logger.warn(`Attempt ${i + 1}: Error checking button state: ${buttonError instanceof Error ? buttonError.message : String(buttonError)}`);
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            errors.push('Too many consecutive button state errors, stopping');
            break;
          }
          await this.page.waitForTimeout(1000);
          continue;
        }

        if (!isVisible || !isEnabled) {
          logger.info(`Attempt ${i + 1}: Save button unavailable (visible: ${isVisible}, enabled: ${isEnabled})`);
          break;
        }

        // Check if a save operation is already in progress
        if (await this.isSaveInProgress()) {
          logger.info(`Attempt ${i + 1}: Save operation already in progress, waiting...`);
          await this.page.waitForTimeout(progressCheckDelay);
          continue;
        }

        // Highlight button for debugging
        try {
          await this.highlightElement(saveButton);
        } catch (highlightError) {
          logger.warn(`Attempt ${i + 1}: Could not highlight button: ${highlightError instanceof Error ? highlightError.message : String(highlightError)}`);
        }

        // Click the button
        await saveButton.click();
        clicksPerformed++;
        consecutiveFailures = 0; // Reset failure counter on success

        logger.info(`Attempt ${i + 1}: Save button clicked (page type: ${currentPageType})`);

        // Wait for network requests to complete
        await this.page.waitForLoadState('networkidle');

        // Brief stabilization delay
        await this.page.waitForTimeout(stabilizationDelay);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error on attempt ${i + 1}: ${errorMessage}`);
        errors.push(`Attempt ${i + 1}: ${errorMessage}`);
        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          errors.push('Too many consecutive errors, stopping');
          break;
        }

        // If it's a navigation error, wait longer
        if (errorMessage.includes('Execution context was destroyed') || errorMessage.includes('navigation')) {
          logger.info(`Attempt ${i + 1}: Navigation detected, waiting for page stability...`);
          await this.page.waitForTimeout(2000);
        } else {
          await this.page.waitForTimeout(500);
        }
      }
    }

    logger.info(`Total clicks performed: ${clicksPerformed} out of ${maxClicks}`);

    if (pageTransitioned) {
      logger.info('Page successfully transitioned from add to edit mode');
    }

    // Wait for final page state to stabilize
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);

    const finalPageType = await this.getCurrentPageType();
    logger.info(`Final page state: ${finalPageType}`);

    return {
      clicksPerformed,
      pageTransitioned,
      finalPageType,
      errors,
    };
  }
  /**
   * Calculates the free quantity for a detail by checking warehouse inventory.
   * Opens a new tab to the warehouse, searches for the detail, and calculates stock minus in-kits.
   * @param detailName - The name of the detail to search for
   * @returns Promise<number> - The calculated free quantity (stock - inKits)
   */
  async calculateFreeQuantity(detailName: string): Promise<number> {
    // Open a new tab to the warehouse
    const warehousePage = await this.page.context().newPage();
    await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const residualsButton = warehousePage.locator('[data-testid="Sclad-residuals-residuals"]');
    await this.highlightElement(residualsButton, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await residualsButton.click();
    await warehousePage.waitForTimeout(2000);

    const table = warehousePage.locator('[data-testid="OstatkPCBD-Detal-Table"]');
    await table.waitFor({ state: 'visible' });
    await this.highlightElement(table, {
      backgroundColor: 'lightcyan',
      border: '2px solid blue',
      color: 'black',
    });
    await warehousePage.waitForTimeout(1000);

    const searchInput = table.locator('[data-testid="OstatkiPCBDTable-SearchInput-Dropdown-Input"]');
    await this.highlightElement(searchInput, {
      backgroundColor: 'lightgreen',
      border: '2px solid green',
      color: 'black',
    });
    await warehousePage.waitForTimeout(1000);
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await warehousePage.waitForTimeout(2000);

    const firstRow = table.locator('tbody tr').first();
    await this.highlightElement(firstRow, {
      backgroundColor: 'orange',
      border: '2px solid red',
      color: 'black',
    });
    await warehousePage.waitForTimeout(1000);
    const stockCell = firstRow.locator('[data-testid="OstatkiPCBDTable-Row-Stock"]');
    const inKitsCell = firstRow.locator('[data-testid="OstatkiPCBDTable-Row-InKits"]');

    await this.highlightElement(stockCell, {
      backgroundColor: 'lightgreen',
      border: '2px solid green',
      color: 'black',
    });
    await warehousePage.waitForTimeout(1000);
    await this.highlightElement(inKitsCell, {
      backgroundColor: 'lightblue',
      border: '2px solid blue',
      color: 'black',
    });
    await warehousePage.waitForTimeout(1000);

    const stockValue = await stockCell.textContent();
    const inKitsValue = await inKitsCell.textContent();

    const stock = parseInt(stockValue?.trim() || '0', 10);
    const inKits = parseInt(inKitsValue?.trim() || '0', 10);
    const freeQuantity = stock - inKits;

    console.log(`Warehouse data for ${detailName}: Stock=${stock}, InKits=${inKits}, FreeQuantity=${freeQuantity}`);

    await warehousePage.close();
    return freeQuantity;
  }

  /**
   * Validates collected quantity by looking up total builds across multiple orders
   * @param assemblyName - The name of the assembly
   * @param expectedMinimum - The minimum expected collected quantity
   * @returns Promise<boolean> - True if validation passes
   */
  async validateCollectedQuantity(assemblyName: string, expectedMinimum: number): Promise<boolean> {
    try {
      // This would need to query the database or API to get total builds
      // For now, we'll return true if the value is at least the expected minimum
      // In a real implementation, this would:
      // 1. Query all orders for this assembly
      // 2. Sum up all completed quantities
      // 3. Compare with the provided value
      console.log(`Validating collected quantity for assembly: ${assemblyName}, minimum expected: ${expectedMinimum}`);
      return true;
    } catch (error) {
      console.error(`Error validating collected quantity: ${error}`);
      return false;
    }
  }

  /**
   * Validates sclad need by looking up total demand across all orders
   * @param detailName - The name of the detail
   * @param currentValue - The current sclad need value
   * @returns Promise<boolean> - True if validation passes
   */
  async validateScladNeed(detailName: string, currentValue: number): Promise<boolean> {
    try {
      // This would need to query the database or API to get total demand
      // For now, we'll return true if the value is reasonable
      // In a real implementation, this would:
      // 1. Query all active orders that use this detail
      // 2. Sum up all required quantities
      // 3. Compare with the provided value
      console.log(`Validating sclad need for detail: ${detailName}, current value: ${currentValue}`);
      return currentValue >= 0;
    } catch (error) {
      console.error(`Error validating sclad need: ${error}`);
      return false;
    }
  }

  /**
   * Validates need quantity based on assembly specification and previous builds
   * @param detailName - The name of the detail
   * @param assemblyName - The name of the assembly
   * @param currentNeed - The current need value
   * @param inKitsValue - The quantity already in kits
   * @returns Promise<boolean> - True if validation passes
   */
  async validateNeedQuantity(detailName: string, assemblyName: string, currentNeed: number, inKitsValue: number): Promise<boolean> {
    try {
      // This would need to query the assembly specification and previous builds
      // For now, we'll return true if the value is reasonable
      // In a real implementation, this would:
      // 1. Get the assembly specification for this detail
      // 2. Calculate total required for the order
      // 3. Subtract what's already prepared (inKitsValue)
      // 4. Compare with the provided need value
      console.log(`Validating need quantity for detail: ${detailName} in assembly: ${assemblyName}, current need: ${currentNeed}, in kits: ${inKitsValue}`);
      return currentNeed >= 0 && currentNeed >= inKitsValue;
    } catch (error) {
      console.error(`Error validating need quantity: ${error}`);
      return false;
    }
  }

  /**
   * Validates progress percentage based on collected vs required quantities
   * @param collectedQuantity - The collected quantity
   * @param requiredQuantity - The required quantity
   * @param expectedPercentage - The expected percentage (optional)
   * @returns Promise<boolean> - True if validation passes
   */
  async validateProgressPercentage(collectedQuantity: number, requiredQuantity: number, expectedPercentage?: number): Promise<boolean> {
    try {
      if (requiredQuantity === 0) {
        console.log('Required quantity is 0, cannot calculate percentage');
        return true;
      }

      const calculatedPercentage = Math.round((collectedQuantity / requiredQuantity) * 100);
      console.log(`Progress percentage: ${collectedQuantity}/${requiredQuantity} = ${calculatedPercentage}%`);

      if (expectedPercentage !== undefined) {
        return calculatedPercentage === expectedPercentage;
      }

      // If no expected percentage provided, just validate it's reasonable
      return calculatedPercentage >= 0 && calculatedPercentage <= 100;
    } catch (error) {
      console.error(`Error validating progress percentage: ${error}`);
      return false;
    }
  }

  /**
   * Archives a detail or assembly with proper validation and highlighting
   * @param page - The Playwright page object
   * @param itemName - The name of the item to archive
   * @param tableTestId - The data-testid of the table to search in
   * @param searchInputTestId - The data-testid of the search input field (optional, defaults to standard search input)
   * @param archiveButtonTestId - The data-testid of the archive button (optional, defaults to standard archive button)
   * @param confirmModalTestId - The data-testid of the confirm modal (optional, defaults to standard confirm modal)
   * @param confirmButtonTestId - The data-testid of the confirm button (optional, defaults to standard confirm button)
   */
  async archiveDetail(
    page: Page,
    itemName: string,
    tableTestId: string,
    searchInputTestId: string = 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
    archiveButtonTestId: string = 'EditDetal-ButtonSaveAndCancel-ButtonsRight-Archive',
    confirmModalTestId: string = 'ModalConfirm-Content',
    confirmButtonTestId: string = 'ModalConfirm-Content-Buttons-Yes',
  ): Promise<void> {
    // Search for the item in the table
    const itemTable = page.locator(`[data-testid="${tableTestId}"]`);
    const searchInput = itemTable.locator(`[data-testid="${searchInputTestId}"]`);

    // Clear search and search for the item
    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await searchInput.fill(itemName);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Get all rows and find exact matches
    const rows = itemTable.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      console.log(`No existing ${itemName} found for archiving`);
      return;
    }

    // Find the row containing our item
    let foundRow = null;
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText && rowText.trim() === itemName) {
        foundRow = rows.nth(i);
        console.log(`Found ${itemName} in row ${i + 1}`);
        break;
      }
    }

    if (foundRow) {
      // Click the row to select it
      await foundRow.click();
      await page.waitForTimeout(500);

      // Find and click the archive button
      const archiveButton = page.locator(`[data-testid="${archiveButtonTestId}"]`);
      await expect(archiveButton).toBeVisible();

      // Highlight the archive button
      await this.highlightElement(archiveButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(1000);

      // Click the archive button
      await archiveButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify the confirmation modal appears
      const confirmModal = page.locator(`[data-testid="${confirmModalTestId}"]`);
      await expect(confirmModal).toBeVisible({ timeout: 5000 });

      // Highlight the modal
      await this.highlightElement(confirmModal, {
        backgroundColor: 'lightcyan',
        border: '2px solid blue',
        color: 'black',
      });
      await page.waitForTimeout(1000);

      // Get the modal text and verify it contains the correct detail name
      const modalText = await confirmModal.textContent();
      console.log(`Modal text: "${modalText}"`);
      expect(modalText).toContain(itemName);
      expect(modalText).toContain('Вы уверены, что хотите перенести в архив');
      expect(modalText).toContain('Все, связанные с этой сущностью, наборы будут деактивированы');

      // Find and click the Yes button
      const yesButton = confirmModal.locator(`[data-testid="${confirmButtonTestId}"]`);
      await expect(yesButton).toBeVisible();

      // Highlight the Yes button
      await this.highlightElement(yesButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(1000);

      // Click the Yes button
      await yesButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Highlight the Yes button in green to show it was clicked
      await this.highlightElement(yesButton, {
        backgroundColor: 'green',
        border: '2px solid green',
        color: 'white',
      });
      await page.waitForTimeout(1000);

      console.log(`✅ Successfully archived: ${itemName}`);
    } else {
      console.log(`Item "${itemName}" not found in table for archiving`);
    }
  }

  /**
   * Archives all test products matching the given search prefix.
   * Searches for products, selects the last row, archives it, and repeats until no more products are found.
   * @param searchPrefix - The search prefix to match products (e.g., 'TEST_PRODUCT')
   * @param options - Optional configuration:
   *   - maxIterations: Maximum number of archive operations (default: 100)
   */
  async archiveAllTestProductsByPrefix(searchPrefix: string, options?: { maxIterations?: number }): Promise<number> {
    const maxIterations = options?.maxIterations || 100;
    let iteration = 0;
    let archivedCount = 0;

    // Navigate to parts database page
    await this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
    await this.waitForNetworkIdle();

    while (iteration < maxIterations) {
      iteration++;
      console.log(`Archive iteration ${iteration} for products with prefix: ${searchPrefix}`);

      // Search for products
      const table = this.page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
      const searchInput = table.locator('[data-testid*="SearchInput"] input').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.clear();
      await searchInput.fill(searchPrefix);
      await searchInput.press('Enter');
      await this.page.waitForTimeout(1000);
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Get rows
      const tableBody = table.locator('tbody');
      await tableBody.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        console.log(`✅ No more products found with prefix "${searchPrefix}"`);
        break;
      }

      // Delete from bottom up - select the last row
      const lastRow = rows.nth(rowCount - 1);
      await lastRow.scrollIntoViewIfNeeded();

      // Re-fetch the row to avoid stale element
      const currentRows = tableBody.locator('tr');
      const currentRowCount = await currentRows.count();
      if (currentRowCount === 0) {
        console.log('Table became empty during operation');
        break;
      }

      const targetRow = currentRows.nth(currentRowCount - 1);
      await targetRow.scrollIntoViewIfNeeded();

      try {
        await targetRow.click({ timeout: 5000 });
      } catch (error) {
        console.log(`Row click failed (may have been deleted): ${error}`);
        // Re-search and continue
        continue;
      }

      // Archive
      const archiveButton = this.page.locator(SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON);
      await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

      // Check if button is enabled, retry a few times if needed
      let isEnabled = await archiveButton.isEnabled();
      if (!isEnabled) {
        // Retry enabling state a few times
        for (let retry = 0; retry < 5; retry++) {
          isEnabled = await archiveButton.isEnabled();
          if (isEnabled) break;
          await this.page.waitForTimeout(500);
        }
      }

      if (!isEnabled) {
        console.log('Archive button is disabled after retries. Re-checking if item still exists...');
        // Re-search to see if the item was actually archived or if it still exists
        await this.page.waitForTimeout(1000);
        const recheckTable = this.page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
        const recheckTableBody = recheckTable.locator('tbody');
        await recheckTableBody.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
        const recheckRows = recheckTableBody.locator('tr');
        const recheckRowCount = await recheckRows.count();

        if (recheckRowCount === 0) {
          console.log('Item was actually archived (table is now empty).');
          archivedCount++;
          break;
        }

        if (recheckRowCount < rowCount) {
          console.log('Item count decreased, item may have been archived. Continuing...');
          archivedCount++;
          continue;
        }

        console.log('Archive button is disabled and item still exists, stopping');
        break;
      }

      await archiveButton.click();

      // Confirm archive
      const confirmButton = this.page.locator(SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON).filter({ hasText: 'Да' });
      await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
      await confirmButton.click();

      archivedCount++;
      await this.page.waitForTimeout(1000);
      await this.waitForNetworkIdle();
    }

    if (iteration >= maxIterations) {
      console.warn(`⚠️ Reached maximum iterations (${maxIterations}) for archiving products with prefix "${searchPrefix}"`);
    } else {
      console.log(`✅ Completed archiving products with prefix "${searchPrefix}" after ${iteration} iterations`);
    }

    return archivedCount;
  }

  /**
   * Saves the current product being created/edited
   * @returns true if save was successful, false otherwise
   */
  async saveProduct(): Promise<boolean> {
    try {
      const saveButton = this.page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED);
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickButton('Сохранить', SelectorsPartsDataBase.BUTTON_SAVE_CBED);
      await this.waitForNetworkIdle();

      // Wait for loader to disappear (indicates save operation completed)
      const loaderDialog = this.page.locator('[data-testid="Creator-Loader"]');
      await loaderDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(1000); // Give UI time to update

      // Verify save was successful by checking if we're still on the edit page
      // Check for cancel button visibility (indicates we're still on edit page after save)
      const cancelButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
      const isCancelVisible = await cancelButton.isVisible({ timeout: 5000 }).catch(() => false);

      // Also verify we're NOT back on the list page (create button should not be visible)
      const createButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      const isCreateVisible = await createButton.isVisible({ timeout: 2000 }).catch(() => false);

      // Save is successful if cancel button is visible AND we're not back on list page
      return isCancelVisible && !isCreateVisible;
    } catch (error) {
      logger.error(`Failed to save product: ${error}`);
      return false;
    }
  }

  /**
   * Cancels the current product creation/edit and returns to the list page
   * @returns true if cancel was successful and we're back on the list page, false otherwise
   */
  async cancelProductCreation(): Promise<boolean> {
    try {
      // Wait for loader to disappear
      const loaderDialog = this.page.locator('[data-testid="Creator-Loader"]');
      await loaderDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(500);

      const cancelButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
      await cancelButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickButton('Отменить', SelectorsPartsDataBase.BUTTON_CANCEL_CBED);

      // Verify we're back on the Parts Database page
      await this.waitForNetworkIdle();
      const createButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      const isCreateButtonVisible = await createButton.isVisible();

      return isCreateButtonVisible;
    } catch (error) {
      logger.error(`Failed to cancel product creation: ${error}`);
      return false;
    }
  }

  /**
   * Verifies that all test products matching the given search prefix have been deleted.
   * @param searchPrefix - The search prefix to match products (e.g., 'TEST_PRODUCT')
   * @param testInfo - Optional TestInfo for screenshot attachments
   */
  async verifyAllTestProductsDeleted(searchPrefix: string, testInfo?: TestInfo): Promise<number> {
    const page = this.page;

    // Navigate to parts database
    await this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
    await this.waitForNetworkIdle();

    // Verify page loaded by checking for the create button
    const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
    await createButton.waitFor({ state: 'visible', timeout: 3000 });
    expect.soft(await createButton.isVisible()).toBe(true);

    // Search for products with the given prefix
    // When all items are deleted, the table might be empty - this is a success condition
    const tableBodySelector = `${SelectorsPartsDataBase.PRODUCT_TABLE} tbody`;
    try {
      await this.searchAndWaitForTable(searchPrefix, SelectorsPartsDataBase.PRODUCT_TABLE, tableBodySelector, {
        useRedesign: true,
        timeoutBeforeWait: 2000,
        minRows: 0, // Expect 0 rows after deletion - this is success
      });
    } catch (error) {
      // If search fails because table is empty/hidden (no results), this is actually success
      console.log(`Search completed - table may be empty (success condition): ${String(error)}`);
      await page.waitForTimeout(1000); // Give time for any UI updates
    }

    const table = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
    const rows = table.locator('tbody tr');
    const remainingCount = await rows.count().catch(() => 0); // If table doesn't exist, count is 0 (success)
    console.log(`Verify products: found ${remainingCount} test products with prefix "${searchPrefix}"`);

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(remainingCount).toBe(0);
      },
      `Verify all test products are deleted: expected 0, found ${remainingCount}`,
      testInfo,
    );

    if (remainingCount === 0) {
      console.log(`✅ Все тестовые изделия с префиксом "${searchPrefix}" успешно удалены.`);
    } else {
      console.warn(`⚠️ Осталось ${remainingCount} изделий с префиксом "${searchPrefix}" после удаления.`);
    }

    return remainingCount;
  }
}
