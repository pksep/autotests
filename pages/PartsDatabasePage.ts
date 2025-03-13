import { Page, Locator, expect } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';

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
        РМ: [] as Item[],   // Расходные материалы
        ПД: [] as Item[],   // Расходные материалы        
        ALL: new Map<string, Item>() // Consolidated details
    };
    static resetGlobalTableData(): void {
        globalTableData.СБ.length = 0; // Clear Сборочные единицы
        globalTableData.Д.length = 0; // Clear Детали
        globalTableData.ПМ.length = 0; // Clear Покупные материалы
        globalTableData.МД.length = 0; // Clear Материалы для деталей
        globalTableData.РМ.length = 0; // Clear Расходные материалы
        globalTableData.ПД.length = 0; // Clear Расходные материалы
        globalTableData.ALL.clear();  // Clear the Map
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

        // Helper function to add to ALL group using concatenated `partNumber` and `name` as the unique key
        const addToAll = (item: Item) => {
            const uniqueKey = `${item.partNumber} ${item.partNumber} ${item.name}`.trim();
            const existingItem = groups.ALL.get(uniqueKey);

            // Update the groups.ALL map
            if (existingItem) {
                existingItem.quantity;
            } else {
                groups.ALL.set(uniqueKey, item);
            }
            logger.info(`ALL group updated: Current size = ${groups.ALL.size}`);

            // Also update the global ALL map
            const globalExistingItem = CreatePartsDatabasePage.globalTableData.ALL.get(uniqueKey);
            if (globalExistingItem) {
                globalExistingItem.quantity;
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
                        (CreatePartsDatabasePage.globalTableData[currentGroup as keyof typeof CreatePartsDatabasePage.globalTableData] as Item[]).push(item);
                    }

                    logger.info(`Added item to group ${currentGroup}: ${JSON.stringify(item)}`);

                    // Add to ALL for groups Д, ПД, and РМ
                    if (currentGroup === 'Д' || currentGroup === 'ПД' || currentGroup === 'РМ') {
                        addToAll(item);
                    }
                } else {
                    logger.error(`Skipped row ${i}: Missing required data (id, name, or quantity) Details: \nRow Id: ${rowTestId}\nId:  ${id}\nPart Number: ${partNumber}\nName:  ${name}\nQuantity: ${quantity}`);
                    //expect(1).toBe(0);
                }
            } else if (!isDataRow) {
                logger.warn(`Skipped row ${i}: Not a data row`);
            }
        }

        logger.info(`Final groups: СБ=${groups.СБ.length}, Д=${groups.Д.length}, ПД=${groups.ПД.length}, РМ=${groups.РМ.length}, ALL size=${groups.ALL.size}`);
        return groups;
    }


    async getProductSpecificationsTable(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
        console.log("Started getProductSpecificationsTable function")
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
            console.log("Started checkForDuplicates function");
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

            if (nameColumnIndex === -1 || (partNumberId && designationColumnIndex === -1)) {
                logger.error(`Could not find required columns in ${tableName}`);
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
                logger.info(`No rows found in table ${tableName}`);
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
                        console.log(`Problematic row HTML: ${rowHtml}`);
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
                logger.error(`Duplicates found in ${tableName}: ${duplicates}`);
                logger.error(
                    `Duplicate counts: ${Array.from(seen.entries()).filter(([key, count]) => count > 1)}`
                );
            } else {
                logger.info(`No duplicates found in ${tableName}`);
            }
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
            console.log("Started compareTotals function");
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
                // Log an error if there is a mismatch
                logger.error(`Mismatch for ${globalKey}: expected ${globalValue}, got ${extractedValue}`);
            } else {
                // Log success if the values match
                logger.info(`Matched for ${globalKey}: ${extractedValue}`);
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
            console.log("Started compareItemsCB function");
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
                        // Log mismatch details
                        console.error(
                            `Mismatch found: Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
                        );
                    }
                }
            } else {
                // Log error if the global array data is not an array
                console.error(`Unsupported data type for globalKey: ${globalKey}`);
            }

            // Log completion of comparison
            console.log(`Comparison for ${globalKey} complete.`);
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
            console.log("Started compareItemsД function");
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
                            item.parentPartNumber === tableItem.parentPartNumber &&
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
                        console.error(
                            `Mismatch found: Parent '${arrayItem.parentPartNumber}', Part Number '${arrayItem.partNumber}', Name '${arrayItem.name}', Material '${arrayItem.material}', and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
                        );
                    }
                }
            } else {
                console.error(`Unsupported data type for globalKey: ${globalKey}`);
            }

            logger.info(`Comparison for ${globalKey} complete.`);
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
            console.log("Started compareItemsРМ function");
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
                        // Log mismatch details
                        console.error(
                            `Mismatch found: Name '${arrayItem.name}' and Quantity '${arrayItem.quantity}' exist in the array but not in the table.`
                        );
                    }
                }
            } else {
                // Log error if the global array data is not an array
                console.error(`Unsupported data type for globalKey: ${globalKey}`);
            }

            // Log completion of comparison
            console.log(`Comparison for ${globalKey} complete.`);
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
                console.log("Started validateMaterialExistence function");
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
                        console.error(`Material '${material}' from Материалы для деталей table is not found in the Детали table.`);
                        hasMismatch = true;
                    }
                }

                /**
                 * Step 4: Log the final result of the validation.
                 */
                if (!hasMismatch) {
                    console.log('All materials in Материалы для деталей exist in the Детали table.');
                } else {
                    console.error('Some materials in Материалы для деталей are missing in the Детали table.');
                }
            } catch (error) {
                console.error('An error occurred during material validation:', error);
            }
        };





        await allure.step('Step 2.1.1: Checking sections for duplicate rows', async () => {
            // Perform duplicate checks
            await checkForDuplicates(ASSEMBLY_UNIT_TABLE_ID, "Assembly Units", ASSEMBLY_UNIT_TABLE_PARTNO_ID, ASSEMBLY_UNIT_TABLE_NAME_ID);
            await checkForDuplicates(DETAILS_TABLE_ID, "Details", DETAILS_TABLE_PARTNO_ID, DETAILS_TABLE_NAME_ID);
            await checkForDuplicates(BUYMATERIALS_TABLE_ID, "Buy Materials", null, BUYMATERIALS_TABLE_NAME_ID);
            await checkForDuplicates(MATERIALPARTS_TABLE_ID, "Material Parts", null, MATERIALPARTS_TABLE_NAME_ID);
            await checkForDuplicates(CONSUMABLES_TABLE_ID, "Consumables", null, CONSUMABLES_TABLE_NAME_ID);
        });
        await allure.step('Step 2.1.2: Confirm that totals match', async () => {
            // Compare totals
            await compareTotals(modalLocator, ASSEMBLY_UNIT_TOTAL_LINE, 'СБ');
            await compareTotals(modalLocator, DETAILS_TOTAL_LINE, 'Д');
            await compareTotals(modalLocator, BUYMATERIALS_TOTAL_LINE, 'ПМ');
            await compareTotals(modalLocator, MATERIALPARTS_TOTAL_LINE, 'МД');
            await compareTotals(modalLocator, CONSUMABLES_TOTAL_LINE, 'РМ');
        });
        await allure.step('Step 2.1.3: Verify СБ Line Items and quantity match the scanned ones', async () => {
            // Compare totals
            await compareItemsCB(modalLocator, ASSEMBLY_UNIT_TABLE_ID);
            await compareItemsD(modalLocator, DETAILS_TABLE_ID);
            await compareItemsCon(modalLocator, CONSUMABLES_TABLE_ID);
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
            element.style.backgroundColor = "yellow";
        });
        await row.click(); //opened the product page

        // Open the product editor
        await shortagePage.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500); //clicked the edit button
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
    printGlobalTableData(): void {
        logger.info("Global Table Data Overview:");

        // Iterate through each group in the globalTableData
        Object.keys(CreatePartsDatabasePage.globalTableData).forEach((key) => {
            // Handle ALL group separately since it's a Map
            if (key === 'ALL') {
                const totalCount = CreatePartsDatabasePage.globalTableData.ALL.size; // Count items in ALL (Map)
                console.log(`\nALL (Consolidated Items: ${totalCount}):`);
                console.table(Array.from(CreatePartsDatabasePage.globalTableData.ALL.values()));
            } else {
                const groupItems = CreatePartsDatabasePage.globalTableData[key as keyof typeof CreatePartsDatabasePage.globalTableData];
                const totalCount = Array.isArray(groupItems) ? groupItems.length : 0; // Safely count items in the group
                console.log(`\n${key} (Items in this Group: ${totalCount}):`);
                console.table(groupItems);
            }
        });

        logger.info("\nEnd of Global Table Data.");
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
                        await page.pause();
                        expect(elementValue?.trim()).toBe(item.name);
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
                        logger.error("Incorrect Product Material not found for Type Д");
                    } else {
                        item.material = elementValue;
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



}