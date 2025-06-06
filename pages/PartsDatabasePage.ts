import { Page, Locator, expect } from "@playwright/test";

import { PageObject } from "../lib/Page";
import { CreateMaterialsDatabasePage } from '../pages/MaterialsDatabasePage';

import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';
const EDIT_PAGE_ADD_BUTTON = "Specification-Buttons-addingSpecification";
const MAIN_TABLE_TEST_ID = "Editor-TableSpecification-Product";

const TABLE_TEST_IDS = [
    "Specification-ModalCbed-AccordionCbed-Table",
    "Specification-ModalCbed-AccordionDetalContent-Table",
    "Specification-ModalCbed-AccordionBuyersMaterial-Table",
    "Specification-ModalCbed-ModalComplect-MateriaDetalTable",
    "Specification-ModalCbed-Accordion-MaterialRashod-Table"
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

// Страница: Сборка
export class CreatePartsDatabasePage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }
    // this item will store everything that we parse for later processing and validations
    static globalTableData = {
        СБ: [] as Item[],   // Сборочные единицы
        Д: [] as Item[],    // Детали
        ПМ: [] as Item[],   // Покупные материалы
        МД: [] as Item[],   // Материалы для деталей
        ПД: [] as Item[],   // Расходные материалы                
        РМ: [] as Item[],   // Расходные материалы
        ALL: new Map<string, Item>() // Consolidated details
    };
    static resetGlobalTableData(): void {
        CreatePartsDatabasePage.globalTableData.СБ.length = 0; // Clear Сборочные единицы
        CreatePartsDatabasePage.globalTableData.Д.length = 0; // Clear Детали
        CreatePartsDatabasePage.globalTableData.ПМ.length = 0; // Clear Покупные материалы
        CreatePartsDatabasePage.globalTableData.МД.length = 0; // Clear Материалы для деталей
        CreatePartsDatabasePage.globalTableData.РМ.length = 0; // Clear Расходные материалы
        CreatePartsDatabasePage.globalTableData.ПД.length = 0; // Clear Расходные материалы
        CreatePartsDatabasePage.globalTableData.ALL.clear();  // Clear the Map
    }
    /**
     * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
     * @param table - The Playwright Locator for the table element.
     * @returns An object with grouped items and the ALL group.
     */
    async processTableData(table: Locator, title: string, parentQuantity: number): Promise<{
        СБ: Item[],
        Д: Item[],
        ПД: Item[],
        РМ: Item[],
        ALL: Map<string, Item>
    }> {
        // Debug logging
        logger.info('Table HTML:', await table.evaluate(el => el.outerHTML));
        logger.info('Table exists:', await table.count() > 0);
        logger.info('Table selector:', await table.evaluate(el => el.tagName));

        const rowsLocator = table.locator('tbody tr');
        logger.info('Rows count:', await rowsLocator.count());
        logger.info('Rows selector:', 'tbody tr');

        // Create groups for storing items
        const groups: {
            СБ: Item[],
            Д: Item[],
            ПД: Item[],
            РМ: Item[],
            ALL: Map<string, Item>
        } = {
            СБ: [],
            Д: [],
            ПД: [],
            РМ: [],
            ALL: new Map()
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
                const rowTestId = (await row.getAttribute('data-testid')) ?? ""; // Ensure rowTestId is a string
                const id = await row.locator('td:nth-child(1)').textContent() ?? '';
                const partNumber = await row.locator('td:nth-child(2)').textContent() ?? '';
                const name = await row.locator('td:nth-child(3)').textContent() ?? '';
                let quantity = parseInt(await row.locator('td:nth-child(5)').textContent() ?? '0', 10);

                logger.info(`Item details: id=${id}, partNumber=${partNumber}, name=${name}, quantity=${quantity}, data-testid=${rowTestId}`);
                if (quantity < 1) {
                    logger.error(`Skipped row ${i}: Invalid Quantity value: Details: \nRow Id: ${rowTestId}\nId:  ${id}\nPart Number: ${partNumber}\nName:  ${name}\nQuantity: ${quantity}`);
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
                        quantity
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
                    logger.error(`Skipped row ${i}: Missing required data (id, name, or quantity) Details: \nRow Id: ${rowTestId}\nId:  ${id}\nPart Number: ${partNumber}\nName:  ${name}\nQuantity: ${quantity}`);
                }
            } else if (!isDataRow) {
                logger.warn(`Skipped row ${i}: Not a data row`);
            }
        }

        logger.info(`Final groups: СБ=${groups.СБ.length}, Д=${groups.Д.length}, ПД=${groups.ПД.length}, РМ=${groups.РМ.length}, ALL size=${groups.ALL.size}`);
        return groups;
    }



    async getProductSpecificationsTable(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
        logger.info("Started getProductSpecificationsTable function")
        const ASSEMBLY_UNIT_TOTAL_LINE = "ModalComplect-CbedsTitle";
        const ASSEMBLY_UNIT_TABLE_ID = "ModalComplect-CbedsTable";
        const ASSEMBLY_UNIT_TABLE_PARTNO_ID = "ModalComplect-CbedsTableHead-Designation";
        const ASSEMBLY_UNIT_TABLE_NAME_ID = "ModalComplect-CbedsTableHead-Name";

        const DETAILS_TOTAL_LINE = "ModalComplect-DetalsTitle";
        const DETAILS_TABLE_ID = "ModalComplect-DetalsTable";
        const DETAILS_TABLE_PARTNO_ID = "ModalComplect-DetalsTableHead-Designation";
        const DETAILS_TABLE_NAME_ID = "ModalComplect-DetalsTableHead-Name";

        const BUYMATERIALS_TOTAL_LINE = "ModalComplect-BuyMaterialsTitle";
        const BUYMATERIALS_TABLE_ID = "ModalComplect-BuyMaterialsTable";
        const BUYMATERIALS_TABLE_NAME_ID = "ModalComplect-BuyMaterialsTableHead-Name";

        const MATERIALPARTS_TOTAL_LINE = "ModalComplect-DetailMaterialsTitle";
        const MATERIALPARTS_TABLE_ID = "ModalComplect-DetailMaterialsTable";
        const MATERIALPARTS_TABLE_NAME_ID = "ModalComplect-DetailMaterialsTableHead-Name";

        const CONSUMABLES_TOTAL_LINE = "ModalComplect-ConsumableMaterialsTitle";
        const CONSUMABLES_TABLE_ID = "ModalComplect-ConsumableMaterialsTable";
        const CONSUMABLES_TABLE_NAME_ID = "ModalComplect-ConsumableMaterialsTableHead-Name";

        let hasDuplicates = false;

        // Highlight and click the product row
        await row.evaluate((element) => {
            element.style.border = "3px solid red"; // Highlight
            element.style.backgroundColor = "yellow";
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
        const checkForDuplicates = async (
            tableId: string,
            tableName: string,
            partNumberId: string | null,
            nameId: string
        ): Promise<void> => {
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
            const designationColumnIndex = partNumberId
                ? await shortagePage.findColumn(page, tableId, partNumberId)
                : -1; // Use -1 if partNumberId is not provided
            const nameColumnIndex = await shortagePage.findColumn(page, tableId, nameId);

            if ((partNumberId && designationColumnIndex === -1)) {
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
                    const designation = designationColumnIndex !== -1 && cells[designationColumnIndex]
                        ? await cells[designationColumnIndex].innerText()
                        : null;

                    const name = cells[nameColumnIndex]
                        ? await cells[nameColumnIndex].innerText()
                        : null;

                    // Log and skip rows with missing data
                    if (!designation && !name) {
                        logger.warn(`Empty designation and name in row. Skipping...`);
                        const rowHtml = await row.evaluate((el: Element) => el.outerHTML);
                        logger.info(`Problematic row HTML: ${rowHtml}`);
                        continue;
                    }

                    // Generate a unique identifier for the row
                    const identifier = designationColumnIndex !== -1
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
                console.error(
                    `Duplicate counts: ${Array.from(seen.entries()).filter(([key, count]) => count > 1)}`
                );
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
        const compareTotals = async (
            modalLocator: Locator,
            testId: string,
            globalKey: keyof typeof CreatePartsDatabasePage.globalTableData
        ): Promise<void> => {
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
                el.style.border = "3px solid red";
                el.style.backgroundColor = "yellow";
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
        const compareItemsCB = async (
            modalLocator: Locator,
            tableId: string
        ): Promise<void> => {
            logger.info("Started compareItemsCB function");
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
                        item =>
                            item.partNumber === tableItemPartNumber &&
                            item.name === tableItem.partName &&
                            item.quantity === tableItem.quantity
                    );

                    if (!matchingArrayItem) {
                        // Log mismatch details
                        console.error(
                            `Mismatch found: Part Number '${tableItemPartNumber}', Name '${tableItem.partName}', and Quantity '${tableItem.quantity}' exist in the table but not in the array.`
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
                            `Mismatch found: Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
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
        const compareItemsD = async (
            modalLocator: Locator,
            tableId: string
        ): Promise<void> => {
            logger.info("Started compareItemsД function");
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
                const rawQuantityText = cells[partCountIndex]
                    ? await cells[partCountIndex].innerText()
                    : null;

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
                            item.quantity === tableItem.quantity
                    );

                    if (!matchingArrayItem) {
                        const closestMatch = arrayData.find(item => item.partNumber === tableItemPartNumber);

                        if (closestMatch) {
                            console.error(
                                `Mismatch found:\n` +
                                `Table Entry => Parent: '${tableItem.parentPartNumber}', Part Number: '${tableItemPartNumber}', Name: '${tableItem.partName}', Material: '${tableItem.partMaterial}', Quantity: '${tableItem.quantity}'\n` +
                                `Closest Array Entry => Parent: '${closestMatch.parentPartNumber}', Part Number: '${closestMatch.partNumber}', Name: '${closestMatch.name}', Material: '${closestMatch.material}', Quantity: '${closestMatch.quantity}'`
                            );
                        } else {
                            console.error(
                                `Mismatch found:\n` +
                                `Table Entry => Parent: '${tableItem.parentPartNumber}', Part Number: '${tableItemPartNumber}', Name: '${tableItem.partName}', Material: '${tableItem.partMaterial}', Quantity: '${tableItem.quantity}'\n` +
                                `No matching partNumber found in the array.`
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
                            `Mismatch found: Parent '${arrayItem.parentPartNumber}', Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', Material '${arrayItem.material}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
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
        const compareItemsCon = async (
            modalLocator: Locator,
            tableId: string
        ): Promise<void> => {
            logger.info("Started compareItemsРМ function");
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
            const nameIndex = await shortagePage.findColumn(
                page,
                tableId,
                'ModalComplect-ConsumableMaterialsTableHead-Name'
            );
            const quantityIndex = await shortagePage.findColumn(
                page,
                tableId,
                'ModalComplect-ConsumableMaterialsTableHead-Count'
            );

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
                    const matchingArrayItem = arrayData.find(
                        item =>
                            item.name === tableItemName &&
                            item.quantity === tableItem.quantity
                    );

                    if (!matchingArrayItem) {
                        // Log mismatch details
                        console.error(
                            `Mismatch found: Name '${tableItemName}' and Quantity '${tableItem.quantity}' exist in the table but not in the array.`
                        );
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
                        console.error(
                            `Mismatch found: Name '${arrayItem.name}' and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
                        );
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
        const validateMaterialExistence = async (
            modalLocator: Locator,
            detailsTableId: string,
            materialsTableId: string
        ): Promise<void> => {
            try {
                logger.info("Started validateMaterialExistence function");
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
                const detailsMaterialNameIndex = await shortagePage.findColumn(
                    page,
                    detailsTableId,
                    'ModalComplect-DetalsTableHead-Zag'
                );
                if (detailsMaterialNameIndex === -1) {
                    throw new Error('Material column not found in the Детали table.');
                }

                // Extract all materials from the Детали table
                const detailsMaterials = new Set<string>();
                detailsRows.shift(); // Skip the header row
                for (const row of detailsRows) {
                    const cells = await row.locator('td').all();
                    const materialName = cells[detailsMaterialNameIndex]
                        ? await cells[detailsMaterialNameIndex].innerText()
                        : null;

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
                const materialsTableNameIndex = await shortagePage.findColumn(
                    page,
                    materialsTableId,
                    'ModalComplect-DetailMaterialsTableHead-Name'
                );
                if (materialsTableNameIndex === -1) {
                    throw new Error('Material column not found in the Материалы для деталей table.');
                }

                // Extract all materials from the Материалы для деталей table
                const materialsList = [];
                materialsRows.shift(); // Skip the header row
                for (const row of materialsRows) {
                    const cells = await row.locator('td').all();
                    const materialName = cells[materialsTableNameIndex]
                        ? await cells[materialsTableNameIndex].innerText()
                        : null;

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
            await checkForDuplicates(ASSEMBLY_UNIT_TABLE_ID, "Assembly Units СБ", ASSEMBLY_UNIT_TABLE_PARTNO_ID, ASSEMBLY_UNIT_TABLE_NAME_ID);
            await checkForDuplicates(DETAILS_TABLE_ID, "Details Д", DETAILS_TABLE_PARTNO_ID, DETAILS_TABLE_NAME_ID);
            await checkForDuplicates(BUYMATERIALS_TABLE_ID, "Buy Materials ПМ", null, BUYMATERIALS_TABLE_NAME_ID);
            await checkForDuplicates(MATERIALPARTS_TABLE_ID, "Material Parts МД", null, MATERIALPARTS_TABLE_NAME_ID);
            await checkForDuplicates(CONSUMABLES_TABLE_ID, "Consumables РМ", null, CONSUMABLES_TABLE_NAME_ID);
        });
        await allure.step('Step 2.1.2: Confirm that totals match', async () => {
            // Compare totals
            await compareTotals(modalLocator, ASSEMBLY_UNIT_TOTAL_LINE, 'СБ');
            await compareTotals(modalLocator, DETAILS_TOTAL_LINE, 'Д');
            await compareTotals(modalLocator, BUYMATERIALS_TOTAL_LINE, 'ПД');//.2025-03-13 16:56:30 [error]: Mismatch for ПМ: expected 0, got 1 Покупные материалы
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
        await row.evaluate((element) => {
            element.style.border = "3px solid red"; // Highlight
            element.style.backgroundColor = "green";
        });
        await row.click(); //opened the product page

        const editButton = page.locator(`[data-testid="BaseDetals-Button-EditProduct"]`);
        await editButton.waitFor({ state: 'attached', timeout: 30000 });
        await editButton.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red"; // Highlight
            element.style.backgroundColor = "yellow";
        });

        await editButton.click();
        //logger.info(`Opened details for product: ${editButton}`);

        // Open the product editor
        //await shortagePage.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500); //clicked the edit button
        let parentQuantity = 1;
        // Process the main table for the product
        const table = page.locator('[data-testid="TableSpecification-Root"]');


        const groups: {
            СБ: Item[],
            Д: Item[],
            ПД: Item[],
            РМ: Item[],
            ALL: Map<string, Item>
        } = await this.processTableDataAndHandleModals(table, shortagePage, page, title, parentQuantity);

        logger.info("Processed Groups:");
        logger.info(groups);
        return
    }
    async printParsedTableData(): Promise<void> {
        console.log("Parsed Table Data Overview:");

        // Define the ordered keys for structured output
        const orderedKeys = ['СБ', 'Д', 'ПД', 'МД', 'РМ'];

        // Iterate through each group in the specified order
        orderedKeys.forEach((key) => {
            const groupItems = this.parsedData[key] || [];
            const totalCount = Array.isArray(groupItems) ? groupItems.length : 0; // Count items in the group safely

            console.log(`\n${key} (Items in this Group: ${totalCount}):`);
            console.table(groupItems);
        });

        console.log("\nEnd of Parsed Table Data.");
    }






    async processTableDataAndHandleModals(
        table: Locator,
        shortagePage: any,
        page: any,
        title: string,
        parentQuantity: number
    ): Promise<{
        СБ: Item[],
        Д: Item[],
        ПД: Item[],
        РМ: Item[],
        ALL: Map<string, Item>
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
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
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
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    let elementValue = await el.textContent();
                    if (elementValue?.trim() !== testData.titles.Д.label) {
                        logger.error("Incorrect modal title for Type Д");
                        expect(elementValue?.trim()).toBe(testData.titles.Д.label);
                    }

                    // Validate product name
                    el = await modal.locator('[data-testid="ModalDetail-span-Name"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    elementValue = await el.textContent();
                    if (elementValue !== item.name) {
                        logger.error("Incorrect Product Name for Type Д");
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
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    elementValue = await el.textContent();
                    if (elementValue !== item.partNumber) {
                        logger.error("Incorrect Product Designation for Type Д");
                        expect(elementValue?.trim()).toBe(item.partNumber);
                    }

                    // Validate product material
                    el = await modal.locator('[data-testid="ModalDetail-span-Material"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    elementValue = await el.textContent();
                    if (!elementValue) {
                        logger.error("Incorrect: Product Material not found for Type Д");
                        logger.error(JSON.stringify(item, null, 2));
                    } else {
                        item.material = elementValue.trim();

                        // Check the BlankMass value and content of ModalDetail-TableZag
                        const blankMassElement = await modal.locator('[data-testid="ModalDetail-span-BlankMass"]').last();
                        await blankMassElement.waitFor({ state: 'attached', timeout: 30000 });
                        await blankMassElement.evaluate((element: HTMLElement) => {
                            element.style.border = "3px solid red"; // Highlight
                            element.style.backgroundColor = "yellow";
                        });
                        const blankMassValue = await blankMassElement.textContent();

                        const tableZagElement = await modal.locator('div[data-testid="ModalDetail-TableZag"]').last();
                        await tableZagElement.waitFor({ state: 'attached', timeout: 30000 });
                        await tableZagElement.evaluate((element: HTMLElement) => {
                            element.style.border = "3px solid red"; // Highlight
                            element.style.backgroundColor = "yellow";
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
                            const existingMDItem = CreatePartsDatabasePage.globalTableData.МД.find(existingItem =>
                                existingItem.material.trim().toLowerCase() === item.material.trim().toLowerCase()
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
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    let elementValue2 = await el2.textContent();
                    if (elementValue2.trim() != testData.titles.ПД.label) {
                        logger.error("Incorrect modal title for Type ПД");
                        expect(elementValue2.trim()).toBe(testData.titles.ПД.label);
                    }
                    el2 = '';
                    elementValue2 = '';

                    el2 = await modal2.locator('[data-testid="ModalMaterialInformation-NameValue"]').last(); // Scoped to modal2
                    await el2.waitFor({ state: 'attached', timeout: 30000 });
                    await el2.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    elementValue2 = await el2.textContent();
                    if (elementValue2 != item.name) {
                        logger.error("Incorrect Product Name for Type ПД");
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
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    let elementValue3 = await el3.textContent();
                    if (elementValue3.trim() != testData.titles.РМ.label) {
                        logger.error("Incorrect modal title for Type РМ");
                        expect(elementValue3.trim()).toBe(testData.titles.РМ.label);
                    }
                    el3 = '';
                    elementValue3 = '';

                    el3 = await modal3.locator('[data-testid="ModalMaterialInformation-NameValue"]').last(); // Scoped to modal3
                    await el3.waitFor({ state: 'attached', timeout: 30000 });
                    await el3.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    elementValue3 = await el3.textContent();
                    if (elementValue3 != item.name) {
                        logger.error("Incorrect Product Name for Type РМ");
                        expect(elementValue3.trim()).toBe(item.name);
                    } else {
                        item.material = elementValue3;
                    }
                    expect(item.quantity).toBeGreaterThan(0);
                    item.quantity *= parentQuantity;
                    break;

                default:
                    logger.error("No matching case");
                    break;
            }

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }


    async processSBGroupRows(
        rows: Item[],
        page: any,
        shortagePage: any,
        parentQuantity: number
    ): Promise<void> {
        for (const item of rows) {
            logger.info(`Processing СБ item:`, item);
            //item.quantity *= parentQuantity;
            const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last();
            await rowLocator.waitFor();
            await rowLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            await rowLocator.click();

            // Wait for modal and locate its table
            const modal = page.locator('div[data-testid="ModalCbed-destroyModalRight"]').last();
            await modal.waitFor();

            // Extract the title of the СБ
            const sbTitleElement = modal.locator('[data-testid="ModalCbed-Text-Designation"]').last();
            await sbTitleElement.waitFor({ state: 'attached', timeout: 30000 });
            await sbTitleElement.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            const title = (await sbTitleElement.textContent())?.trim();
            logger.info(`Extracted СБ Title: ${title}`);

            const tableInModal = modal.locator('[data-testid="TableSpecification-Table"]');
            let ele = await page.locator('[data-testid="ModalCbed-Title"]').last();
            await ele.waitFor({ state: 'attached', timeout: 30000 });
            await ele.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            ele = await page
                .locator('[data-testid="ModalCbed-Title"]')
                .last()
                .textContent();
            if (ele.trim() != testData.titles.СБ.label) {
                logger.error("Incorrect modal title for Type СБ");
                expect(ele.trim()).toBe(testData.titles.СБ.label);
            }
            await page.waitForTimeout(1000);
            let elem = await page.locator('[data-testid="ModalCbed-Text-Name"]').last();
            await elem.waitFor({ state: 'attached', timeout: 30000 });
            await elem.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            elem = await page
                .locator('[data-testid="ModalCbed-Text-Name"]')
                .last()
                .textContent();
            if (elem != item.name) {
                logger.error("Incorrect Product Name for Type СБ");
                expect(elem.trim()).toBe(item.name);
            }

            await page.waitForTimeout(1000);
            let eleme = await page.locator('[data-testid="ModalCbed-Text-Designation"]').last();
            await eleme.waitFor({ state: 'attached', timeout: 30000 });
            await eleme.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            eleme = await page
                .locator('[data-testid="ModalCbed-Text-Designation"]')
                .last()
                .textContent();
            if (eleme != item.partNumber) {
                logger.error("Incorrect Part Number for Type СБ");
                expect(elem.trim()).toBe(item.partNumber);
            }
            let eRow = await page.locator(`[data-testid="${item.dataTestId}"]`).last();
            await eRow.waitFor({ state: 'attached', timeout: 30000 });
            await eRow.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            item.quantity *= parentQuantity;

            // Process the modal's table recursively
            const subGroups = await this.processTableDataAndHandleModals(
                tableInModal,
                shortagePage,
                page,
                title,
                item.quantity
            );

            // Merge subGroups into the main structure or log them
            logger.info("Processed Sub-Groups for СБ item:", subGroups);

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }

    async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
        const table = page.locator(`[data-testid="${tableTestId}"]`);
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
                const isGroupHeader = await row.evaluate((node) => {
                    const element = node as Element; // Cast Node to Element
                    return element.getAttribute('data-testid')?.startsWith('TableSpecification-Tbody-TableRowHead');
                });

                if (isGroupHeader) {
                    const groupName = await row.$eval('td[colspan="5"]', (cell) => cell.textContent?.trim() || '');
                    currentGroup = { groupName, items: [] };
                    groups.push(currentGroup);
                    logger.info(`Group header detected: "${groupName}"`);
                    continue;
                }

                // Detect item rows for the current group
                const isDataRow = await row.evaluate((node) => {
                    const element = node as Element; // Cast Node to Element
                    return element.getAttribute('data-testid')?.startsWith('TableSpecification-DraggableTableRow');
                });

                if (isDataRow && currentGroup) {
                    const itemTable = await row.$('table[data-testid^="TableSpecification-DraggableTable"]');
                    const itemRows = await itemTable?.$$('tbody > tr') || [];

                    for (const itemRow of itemRows) {
                        const rowData = await itemRow.$$eval('td', (cells) =>
                            cells.map((cell) => cell.textContent?.trim() || '')
                        );

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
        itemType?: string
    ): Promise<void> {
        // Determine column index based on item type
        const columnIndex = itemType === "РМ" || itemType === "ПД" ? 0 : 1;

        // Step 1: Click the "Добавить" button
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
        const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
        await addButton.click();
        await page.waitForTimeout(500);

        // Step 2: Click the small dialog button
        const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
        await dialogButton.click();
        await page.waitForTimeout(500);

        // Step 3: Wait for the modal/dialog to load **before checking item existence**
        const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
        await expect(modal).toBeVisible(); // Validate modal is visible
        await page.waitForTimeout(1000);

        // Step 4: Check if the item already exists in the bottom table **inside the modal**
        const itemExists = await this.checkItemExistsInBottomTable(page, searchValue, dialogTestId, bottomTableTestId);

        if (!itemExists) {
            //     console.log(`Skipping addition: '${searchValue}' already exists in the bottom table.`);
            //     return; // ✅ Skip the addition process
            // }

            // Step 5: Search for the item in the search table
            await modal.locator(`table[data-testid="${searchTableTestId}"]`).waitFor({ state: "visible" });
            const itemTableLocator = modal.locator(`table[data-testid="${searchTableTestId}"]`);
            await itemTableLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            await page.waitForTimeout(1000);
            await itemTableLocator.locator("input.search-yui-kit__input").fill(searchValue);
            await itemTableLocator.locator("input.search-yui-kit__input").press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);

            const firstRow = itemTableLocator.locator("tbody tr").first();
            await page.waitForTimeout(1500);
            const firstRowText = await firstRow.locator("td").nth(columnIndex).textContent();

            // Step 6: Validate search result
            expect(firstRowText?.trim()).toBe(searchValue.trim()); // ✅ Ensure exact match
            await firstRow.click();
            await page.waitForTimeout(500);

            // Step 7: Add the item to the bottom table
            const addToBottomButton = modal.locator(`[data-testid="${addToBottomButtonTestId}"]`);
            await addToBottomButton.click();
            await page.waitForTimeout(100);

            // Step 8: Validate the item in the bottom table
            const bottomTableLocator = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
            const rows = bottomTableLocator.locator("tbody tr");
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the bottom table is not empty

            let isItemFound = false;
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const partName = await row.locator("td").nth(1).textContent();

                if (partName?.trim() === searchValue.trim()) {
                    isItemFound = true;
                    break;
                }
            }
            expect(isItemFound).toBeTruthy(); // Ensure the item is found in the bottom table
        }
        // Step 9: Add the item to the main table
        const addToMainButton = modal.locator(`[data-testid="${addToMainButtonTestId}"]`);
        await addToMainButton.click();
        await page.waitForTimeout(500);

        // Step 10: Ensure modal is closed before checking the main table
        await modal.waitFor({ state: "hidden", timeout: 5000 });

        const parsedTableArray = await this.parseStructuredTable(page, MAIN_TABLE_TEST_ID); // Parse the table

        // Step 11: Ensure item exists in the main table
        let isMainItemFound = false;
        for (const group of parsedTableArray) {
            if (group.items.some(row => row.some(cell => cell.trim() === searchValue.trim()))) {
                isMainItemFound = true;
                break;
            }
        }

        expect(isMainItemFound).toBeTruthy(); // Ensure the item exists in the main table
    }



    async removeItemFromSpecification(
        page: Page,
        smallDialogButtonId: string,
        dialogTestId: string,
        bottomTableTestId: string,
        removeButtonColumnIndex: number,
        searchValue: string,
        returnButtonTestId: string,
        itemType?: string
    ): Promise<void> {
        // Determine column index based on item type
        //const columnIndex = itemType === "РМ" || itemType === "ПД" ? 0 : 1;
        const columnIndex = 1;
        // Step 1: Wait for the page to stabilize, then click the "Добавить" button
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
        const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
        await addButton.evaluate((el) => {
            el.style.backgroundColor = "black";
            el.style.border = "2px solid red";
            el.style.color = "white";
        });
        await addButton.click();
        await page.waitForTimeout(500);

        // Step 2: Click the small dialog button
        const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
        await dialogButton.evaluate((el) => {
            el.style.backgroundColor = "black";
            el.style.border = "2px solid red";
            el.style.color = "white";
        });
        await dialogButton.click();
        await page.waitForTimeout(1500);

        // Step 3: Highlight the modal and bottom table locator
        const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
        await modal.evaluate((dialog) => {
            dialog.style.border = "2px solid red"; // Highlight the modal
        });
        const bottomTableLocator = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
        await bottomTableLocator.evaluate((table) => {
            table.style.border = "2px solid red"; // Highlight the bottom table
        });

        const rowsLocator = bottomTableLocator.locator("tbody tr");

        const rowCount = await rowsLocator.count();
        expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

        let isRowFound = false;

        // Step 4: Iterate through the rows to find the matching item
        for (let i = 0; i < rowCount; i++) {
            const row = rowsLocator.nth(i);
            await row.evaluate((table) => {
                table.style.border = "2px solid red"; // Highlight the bottom table
            });
            await page.waitForTimeout(1500);
            const partNumber = await row.locator("td").nth(columnIndex).textContent();


            if (partNumber?.trim() === searchValue.trim()) {
                isRowFound = true;
                // Highlight the row with a red border (locating the item)
                const partNumberCell = await row.locator("td").nth(columnIndex);
                await partNumberCell.evaluate((el) => {
                    el.style.border = "2px solid red";
                });
                await page.waitForTimeout(1000);
                // Click the remove button and fully style the row
                const removeCell = row.locator("td").nth(removeButtonColumnIndex);
                await row.evaluate((el) => {
                    el.style.backgroundColor = "black";
                    el.style.border = "2px solid red";
                    el.style.color = "white";
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
        await returnButton.evaluate((button) => {
            button.style.backgroundColor = "black";
            button.style.border = "2px solid green";
            button.style.color = "white";
        });
        await page.waitForTimeout(500);
        await returnButton.click();
        await page.waitForLoadState("networkidle");
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
    async compareTableData<T>(
        data1: { groupName: string; items: T[][] }[],
        data2: { groupName: string; items: T[][] }[]
    ): Promise<boolean> {
        if (data1.length !== data2.length) {
            console.error("Data length mismatch");
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
                    console.error(
                        `Row length mismatch in group "${group1.groupName}", row ${rowIndex + 1}`
                    );
                    return false;
                }

                // Compare individual cells
                return row1.every((cell1, cellIndex) => {
                    const cell2 = row2[cellIndex];
                    if (cell1 !== cell2) {
                        console.error(
                            `Mismatch in group "${group1.groupName}", row ${rowIndex + 1}, cell ${cellIndex + 1}: "${cell1}" !== "${cell2}"`
                        );
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
    async getQuantityByLineItem(
        data: { groupName: string; items: string[][] }[],
        searchString: string
    ): Promise<number> {
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
    async validateTable(
        page: Page,
        tableTitle: string,
        expectedRows: { [key: string]: string }[]
    ): Promise<boolean> {
        try {
            // Locate the section containing the table (using its h3 heading)
            const tableSection = page.locator(`h3:has-text("${tableTitle}")`).locator('..');
            // Debug: highlight the table section
            await tableSection.evaluate((el) => { el.style.border = '2px solid red'; });

            // ----- Validate Column Headers Order ----- //
            const headerCells = tableSection.locator('table thead tr th');
            const headerCount = await headerCells.count();
            // Expected column order is derived from the keys of the first expected row.
            // For a 3-col table, the keys might be: [ "Наименование", "ЕИ", "Значение" ]
            // For a 4-col table, they might be: [ "Наименование", "ЕИ", "Значение", "" ]
            const expectedColOrder = Object.keys(expectedRows[0]);
            if (headerCount !== expectedColOrder.length) {
                console.error(
                    `Header column count mismatch for "${tableTitle}": expected ${expectedColOrder.length}, found ${headerCount}`
                );
                return false;
            }
            for (let i = 0; i < headerCount; i++) {
                const headerText = (await headerCells.nth(i).textContent())?.trim();
                if (headerText !== expectedColOrder[i]) {
                    console.error(
                        `Column header mismatch in table "${tableTitle}" at index ${i}: expected "${expectedColOrder[i]}", got "${headerText}"`
                    );
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
                    await row.evaluate((el) => { el.style.backgroundColor = 'yellow'; });

                    const actualName = (await row.locator('td').nth(0).textContent())?.trim();
                    const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();
                    const actualValue = (await row.locator('td').nth(2).textContent())?.trim();

                    if (
                        actualName !== expectedRow['Наименование'] ||
                        actualUnit !== expectedRow['ЕИ'] ||
                        actualValue !== expectedRow['Значение']
                    ) {
                        console.error(
                            `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                            `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`
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
                    await row.evaluate((el) => { el.style.backgroundColor = 'yellow'; });

                    const actualName = (await row.locator('td').nth(0).textContent())?.trim();
                    const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();

                    // Third column: attempt to read an input inside the cell first;
                    // if no input exists, fallback to reading the cell text.
                    const cellThird = row.locator('td').nth(2);
                    let actualValue = "";
                    if (await cellThird.locator('input').count() > 0) {
                        actualValue = (await cellThird.locator('input').inputValue()).trim();
                    } else {
                        actualValue = ((await cellThird.textContent()) || "").trim();
                    }

                    // Fourth column: confirms that a button is visible.
                    const isButtonVisible = await row.locator('td').nth(3).locator('button').isVisible();

                    if (
                        actualName !== expectedRow['Наименование'] ||
                        actualUnit !== expectedRow['ЕИ'] ||
                        actualValue !== expectedRow['Значение']
                    ) {
                        console.error(
                            `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                            `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`
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
                    case "input":
                        if (field.title === "Медиа файлы") {
                            // For file inputs, use the visible label (assuming it contains "Прикрепить документ")
                            fieldLocator = page.locator('label.dnd-yui-kit__label:has-text("Прикрепить документ")');
                            await fieldLocator.evaluate((row) => {
                                row.style.backgroundColor = 'yellow';
                                row.style.border = '2px solid red';
                                row.style.color = 'blue';
                            });
                        } else {
                            // For normal text input fields (e.g. "Обозначение", "Наименование")
                            fieldLocator = page.locator(`div.editor__information-inputs:has-text("${field.title}") input`);
                            await fieldLocator.evaluate((row) => {
                                row.style.backgroundColor = 'yellow';
                                row.style.border = '2px solid red';
                                row.style.color = 'blue';
                            });
                        }
                        break;
                    case "textarea":
                        // For "Описание / Примечание", look inside the description section
                        fieldLocator = page.locator(`section.editor__description:has(h3:has-text("${field.title}")) textarea`);
                        await fieldLocator.evaluate((row) => {
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

                // Verify writability if it’s a text field.
                if (!(field.type === "input" && field.title === "Медиа файлы")) {
                    const testValue = "Test Value";
                    await fieldLocator.fill(testValue);
                    const currentValue = await fieldLocator.inputValue();
                    if (currentValue !== testValue) {
                        console.error(`Field "${field.title}" is not writable. Expected "${testValue}", but got "${currentValue}".`);
                        return false;
                    }
                }

                console.log(`Field "${field.title}" is visible and ${(field.type === "input" && field.title === "Медиа файлы") ? "present" : "writable"}.`);
            }
            console.log("All input fields validated successfully.");
            return true;
        } catch (error) {
            console.error("Error during input field validation:", error);
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
        multiplier: number = 1
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
                            if (text.includes(group) || (group === "СБ" && text.includes("Сборочная единица"))) {
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
                            await nestedRow.evaluate((element) => {
                                element.style.border = "2px solid red";
                                element.style.backgroundColor = "yellow";
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
                                    unit: currentGroup === "СБ" || currentGroup === "Д" ? parentId : rowData[3],
                                    quantity: currentGroup === "ПД" ? 0 : parseInt(rowData[4], 10) * multiplier // ✅ Fix: Set quantity to 0 for ПД
                                };

                                if (currentGroup === "ПД") {
                                    // ✅ Check if item already exists in `ПД`
                                    const existingIndex = this.parsedData["ПД"].findIndex(existingItem => existingItem.name === item.name);

                                    if (existingIndex !== -1) {
                                        this.parsedData["ПД"][existingIndex] = item; // ✅ Overwrite existing item
                                    } else {
                                        this.parsedData["ПД"].push(item); // ✅ Add new item if not found
                                    }
                                } else {
                                    this.parsedData[currentGroup].push(item);
                                }

                                if (currentGroup === "СБ") {
                                    console.log(`Opening modal for СБ item: ${rowData[1]} (quantity: ${item.quantity})`);
                                    await nestedRow.click();
                                    await page.waitForTimeout(500);
                                    const modalDialog = page.locator(`dialog[data-testid^="Specification-ModalCbed"]`).last();
                                    await modalDialog.waitFor({ state: 'visible' });
                                    const specTable = modalDialog.locator(`[data-testid^="Specification-ModalCbed"][data-testid$="-TableSpecification-Cbed"]`).last();
                                    await specTable.evaluate((el) => el.scrollIntoView());
                                    await page.waitForTimeout(500);
                                    if (await specTable.count() > 0) {
                                        const designationElement = modalDialog.locator('[data-testid^="Specification-ModalCbed"][data-testid$="Designation-Text"] span').last();
                                        await designationElement.waitFor({ state: 'visible' });
                                        const parentDesignation = await designationElement.textContent() || '';
                                        console.log(`Extracted ParentDesignation: ${parentDesignation}`);
                                        await this.parseRecursiveStructuredTable(page, "Specification-TableSpecification-Cbed", parentDesignation, item.quantity);
                                    }
                                    await page.mouse.click(1, 1);
                                    await page.waitForTimeout(1000);
                                    console.log(`Closed modal for ${rowData[1]}`);
                                }

                                if (currentGroup === "Д") {
                                    console.log(`Opening material modal for Д item: ${rowData[1]}`);
                                    await nestedRow.click();
                                    const materialElement = page.locator(`[data-testid^="Specification-ModalDetal"][data-testid$="CharacteristicsMaterial-Items"]`);
                                    await materialElement.evaluate((row) => {
                                        row.style.backgroundColor = 'yellow';
                                        row.style.border = '2px solid red';
                                        row.style.color = 'blue';
                                    });
                                    await materialElement.evaluate((el) => el.scrollIntoView());
                                    await materialElement.waitFor({ state: 'visible' });
                                    await page.waitForTimeout(2000);
                                    const materialText = await materialElement.textContent();
                                    if (materialText) {
                                        const existingMaterial = this.parsedData["МД"].find(mat => mat.material === materialText.trim());
                                        if (existingMaterial) {
                                            existingMaterial.quantity += item.quantity;
                                        } else {
                                            this.parsedData["МД"].push({
                                                material: materialText.trim(),
                                                quantity: item.quantity
                                            });
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
            if (this.parsedData[group]?.length > 0) { // Ensure group has items
                this.parsedData[group].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            }
        }

    }






    async extractAllTableData(page: Page, dialogTestId: string): Promise<any> {
        const TABLE_SELECTORS = {
            "СБ": "[data-testid='Specification-ModalCbed-AccordionCbed-Table']",
            "Д": "[data-testid='Specification-ModalCbed-AccordionDetalContent-Table']",
            "ПД": "[data-testid='Specification-ModalCbed-AccordionBuyersMaterial-Table']",
            "МД": "[data-testid='Specification-ModalCbed-ModalComplect-MateriaDetalTable']",
            "РМ": "[data-testid='Specification-ModalCbed-Accordion-MaterialRashod-Table']"
        };

        const structuredData: { [key: string]: any[] } = {
            "СБ": [],
            "Д": [],
            "ПД": [],
            "МД": [],
            "РМ": []
        };

        const dialog = page.locator(`[data-testid="${dialogTestId}"]`);
        await dialog.waitFor({ state: "visible" });
        await page.waitForTimeout(1000);

        for (const [group, selector] of Object.entries(TABLE_SELECTORS)) {
            const table = dialog.locator(selector);

            if (await table.count() === 0) {
                console.log(`Skipping ${group}: Table does not exist.`);
                continue;
            }

            try {
                await table.waitFor({ state: "attached", timeout: 3000 });
            } catch {
                console.log(`Skipping ${group}: Table is not attached.`);
                continue;
            }

            await page.waitForTimeout(500);

            if (await table.locator("tbody > tr").count() === 0) {
                console.log(`Skipping ${group}: Table is empty.`);
                continue;
            }

            const rows = await table.locator("tbody > tr").elementHandles();

            for (const row of rows) {
                await row.evaluate((node) => {
                    (node as HTMLElement).style.backgroundColor = "yellow"; // Cast `node` to `HTMLElement`
                    (node as HTMLElement).style.border = "2px solid red";
                    (node as HTMLElement).style.color = "blue";
                });

                const cells = await row.$$("td");
                const rowData = await Promise.all(cells.map(async (cell) => {
                    const text = await cell.textContent();
                    return text?.trim() || "";
                }));
                if (group === "ПД") {
                    console.log(rowData);
                }
                // Handle different groups with a standard format
                if (rowData.length >= 4 || (group === "ПД" && rowData.length === 3)) {
                    let quantity = parseInt(rowData[4], 10);
                    if (isNaN(quantity)) quantity = 1; // Default fallback for missing values

                    if (group === "МД") {
                        const materialName = rowData[1];
                        const existingMaterial = structuredData["МД"].find(mat => mat.material === materialName);
                        if (existingMaterial) {
                            existingMaterial.quantity += quantity;
                        } else {
                            structuredData["МД"].push({ material: materialName, quantity });
                        }
                    } else {
                        if (group === "ПД") {
                            structuredData[group].push({
                                designation: rowData[6] || "-",
                                name: rowData[1] || "",
                                unit: rowData[3] || "шт",
                                quantity: 0
                            });
                        }
                        else {
                            structuredData[group].push({
                                designation: rowData[6] || "-",
                                name: rowData[7] || "",
                                unit: rowData[3] || "шт",
                                quantity
                            });
                        }
                    }
                }
            }
        }

        // Ensure consistency with recursive format (sorting, structuring)
        for (const group of Object.keys(structuredData)) {
            if (structuredData[group]?.length > 0) { // Check if group is not empty
                structuredData[group].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            }
        }



        return structuredData;
    }

    async checkItemExistsInBottomTable(
        page: Page,
        selectedPartName: string,
        modalTestId: string,
        bottomTableTestId: string
    ): Promise<boolean> {
        await page.waitForLoadState("networkidle");

        // Locate the specific modal containing the table
        const modal = page.locator(`dialog[data-testid^="${modalTestId}"]`);
        await modal.waitFor({ state: "attached", timeout: 15000 });
        await modal.waitFor({ state: "visible", timeout: 15000 });
        logger.info("Modal located successfully.");

        await page.waitForTimeout(1500);

        // Locate the bottom table dynamically within the modal
        const bottomTableLocator = modal.locator(`[data-testid="${bottomTableTestId}"]`);

        // **Check if the bottom table exists**
        const isTableVisible = await bottomTableLocator.isVisible();
        if (!isTableVisible) {
            logger.info(`Bottom table '${bottomTableTestId}' does not exist. Returning false.`);
            return false; // ✅ Table doesn't exist, meaning the item isn't there
        }

        await bottomTableLocator.waitFor({ state: "attached", timeout: 15000 });
        logger.info("Bottom table located successfully.");

        await page.waitForTimeout(1000);

        // Locate all rows in the table body
        const rowsLocator = bottomTableLocator.locator("tbody tr");
        const rowCount = await rowsLocator.count();
        logger.info(`Found ${rowCount} rows in the bottom table.`);

        for (let i = 0; i < rowCount; i++) {
            const row = rowsLocator.nth(i);

            // Wait for the row to become visible
            await row.waitFor({ state: "visible", timeout: 5000 });

            // Extract part name from the second column (index 1)
            const partNameCell = row.locator("td").nth(1);
            const partName = (await partNameCell.textContent())?.trim();

            logger.info(`Row ${i + 1}: PartName=${partName}`);

            // Check if the current row matches the selected part name
            if (partName === selectedPartName) {
                // Highlight the matching row for debugging
                await row.evaluate((rowElement) => {
                    rowElement.style.backgroundColor = "yellow";
                    rowElement.style.border = "2px solid green";
                    rowElement.style.color = "blue";
                });

                logger.info(`Selected part name found in row ${i + 1}`);
                return true; // ✅ Item exists in the bottom table
            }
        }

        logger.info("Item not found in the bottom table.");
        return false; // ✅ Item does NOT exist in the bottom table
    }









} 