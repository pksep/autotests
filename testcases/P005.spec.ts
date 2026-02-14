import { test, expect, ElementHandle } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec'; // Adjust the import path as necessary
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { ENV, SELECTORS } from '../config'; // Import the configuration
import testData from '../testdata/MW18-T2.json'; // Import your test data
import testData2 from '../testdata/MW18-T1.json'; // Import your test data
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { countColumns } from '../lib/utils/utilities';

const WAREHOUSE_PAGE_BUTTON = "Sclad-stockOrderMetalworking";
const RESET_FILTERS = "MetalloworkingSclad-FiltersSection-ClearFilters";
const SHOW_LEFT_TABLE_BUTTON = "MetalloworkingSclad-FiltersSection-PlanHidden";
const LEFT_DATA_TABLE = "ShipmentsListTable-Table";
const LEFT_DATA_TABLE_URGENCY_DATA_COL = "ShipmentsListTable-TableRow-HeaderDateByUrgency";
const LEFT_DATA_TABLE_PLANNED_DATA_COL = "ShipmentsListTable-TableRow-HeaderDateShipmentPlan";
const LEFT_DATA_TABLE_SEARCHABLE_FIELD = "ShipmentsListTable-TableRow-HeaderOrder";

const RIGHT_DATA_TABLE = "tablebody";
const RIGHT_DATA_TABLE_URGENCY_DATA_COL = "MetalloworkingSclad-DetailsTableHeader-UrgencyDateColumn";
const RIGHT_DATA_TABLE_PLANNED_DATA_COL = "MetalloworkingSclad-DetailsTableHeader-PlannedShipmentDateColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS1 = "MetalloworkingSclad-DetailsTableHeader-DesignationColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS2 = "MetalloworkingSclad-DetailsTableHeader-NameColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS3 = "MetalloworkingSclad-DetailsTableHeader-NameColumn";
const RIGHT_DATA_TABLE_ORDERS_ICON_COL = "MetalloworkingSclad-DetailsTableHeader-ShipmentsColumn";

const RIGHT_MODAL_WINDOW_ID = "ModalShipmentsToIzed-destroyModalRight";
const RIGHT_MODAL_TABLE_ID = "ModalShipmentsToIzed-table-buyers";
const RIGHT_MODAL_TABLE_COL3 = "ModalShipmentsToIzed-thead-th3-buyers";
const RIGHT_MODAL_TABLE_COL4 = "ModalShipmentsToIzed-thead-th4-buyers";
const RIGHT_DATA_TABLE_CELL_X = "MetalloworkingSclad-MetaloworkingTable-Number";
const LEFT_DATA_TABLE_CELL_X = "ShipmentsListTable-orderRow";


export const runP005 = () => {
    logger.info(`Starting test: Verify Металлообработка склад (Metalworking Warehouse) Page Functionality`);
    test.beforeEach(async ({ page }) => {
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 1: Open the login page and login', async () => {
            // Perform the login using the performLogin function (imported from TC000.spec)
            await performLogin(page, '001', 'Перов Д.А.', '54321');
            //await page.waitForTimeout(2000);
            //await page.click('button.btn.blues');
            // Wait for navigation to complete after login
            //await page.waitForNavigation();
        });

        await allure.step('Step 2: Navigate to Склад', async () => {
            // Navigate to the materials page
            await page.waitForTimeout(5000);
            await shortagePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 3: Find and click the Металлообработка склад button', async () => {
            // Define the selector for the element
            const selector = `[data-testid="${WAREHOUSE_PAGE_BUTTON}"]`; // Металлообработка склад button on warehouse page

            await shortagePage.findTable(selector);
            await page.waitForLoadState('networkidle');
        });
    });
    test('Test case 0: Металлообработка склад (Metalworking Warehouse) Page - Scan tables within a specific element', async ({ page }) => {
        test.setTimeout(600000);
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON);
        await shortagePage.findAndClickElement(page, "MetalloworkingSclad-MetaloworkingTable-OperationsCell", 3000);
        const result1 = await shortagePage.scanTablesWithinElement(page, 'ModalOperationPathMetaloworking-destroyModalRight');
        page.mouse.dblclick(1, 1);

        await shortagePage.findAndClickElement(page, "MetalloworkingSclad-MetaloworkingTable-EditCell", 3000);
        const result2 = await shortagePage.scanTablesWithinElement(page, 'ModalWorkersForIzd-destroyModalRight');
        page.mouse.dblclick(1, 1);

        await shortagePage.findAndClickElement(page, "MetalloworkingSclad-MetaloworkingTable-ShipmentsCell", 3000);
        await shortagePage.findAndClickElement(page, "ModalShipmentsToIzed-Tbody-List", 3000);
        await shortagePage.findAndClickElement(page, "TableKomplect-Cell-Complectation", 3000);
        await shortagePage.findAndClickElement(page, "ModalKomplect-TableBody-row", 3000);
        //const targetElement = await page.locator('ModalDetail-h3-Belonging');
        //await targetElement.scrollIntoViewIfNeeded();
        await shortagePage.findAndClickElement(page, "ModalDetail-h3-Belonging", 3000);
        await page.waitForLoadState('networkidle');

        //const TableNodeShowIzd = await page.locator('TableNode-ShowIzd');
        //await TableNodeShowIzd.scrollIntoViewIfNeeded();

        await shortagePage.findAndClickElement(page, "TableNode-ShowIzd", 3000);
        await shortagePage.findAndClickElement(page, "TableNode-izdTableRow", 3000);
        await shortagePage.findAndClickElement(page, "ModalProduct-TechProcessLink", 3000);
        const result3 = await shortagePage.scanTablesWithinElement(page, 'App-RouterView'); // Replace with your data-testid

        // Combine results and errors
        const combinedErrors = [
            ...result1.errors,
            ...result2.errors,
            ...result3.errors
        ];

        const success = result1.success && result2.success && result3.success;

        // Use Playwright's assertion to check the combined result and fail the test if needed
        expect(success, 'Validation failed with the following errors:\n' + combinedErrors.join('\n')).toBeTruthy();
    });

    test.skip('Test Case 1 - Verify Металлообработка склад (Metalworking Warehouse) Page Column Count and Order Check for RIGHT table', async ({ page }) => {


        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка складe');
        allure.label('story', 'Verify Column count and order');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Column Count and Order Check for RIGHT table.');

        const shortagePage = new CreateMetalworkingWarehousePage(page);
        let columnCount = 0;
        await allure.step('Step 4: Count the number of columns in the table and their order', async () => {
            // Capture the number of columns from the checkTableColumns method
            columnCount = await shortagePage.checkTableColumns(page, RIGHT_DATA_TABLE);
            logger.info(`Column count: ${columnCount}`);
        });

        await allure.step('Step 5: Check table column count from the test data and compare to the page', async () => {
            logger.info('STEP 5: Check table column count from the test data and compare to the page');
            const expectedColumnCount = await countColumns(testData.headers);
            logger.info(`Expected column count: ${expectedColumnCount}`);
            expect(columnCount).toBe(expectedColumnCount);
        });



    });
    test.skip('Test Case 2 - Verify Металлообработка склад (Metalworking Warehouse) Page Column Count and Order Check for LEFT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify Column count and order');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Column Count and Order Check for LEFT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        let columnCount = 0;
        await allure.step('Step 4: Count the number of columns in the table and their order', async () => {
            await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON)
            logger.info('STEP 4: Count the number of columns in the table and their order');
            columnCount = await shortagePage.checkTableColumns(page, LEFT_DATA_TABLE);
            logger.info(`Column count: ${columnCount}`);
        });

        await allure.step('Step 5: Check table column count from the test data and compare to the page', async () => {
            logger.info('STEP 5: Check table column count from the test data and compare to the page');
            const expectedColumnCount = await countColumns(testData2.headers);
            logger.info(`Expected column count: ${expectedColumnCount}`);
            expect(columnCount).toBe(expectedColumnCount);
        });
        logger.info('Navigation to materials page completed');
    });
    test.skip('Test Case 3 - Verify Металлообработка склад (Metalworking Warehouse) Page Column header values Check for RIGHT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify Column header values check');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Column header values Check for RIGHT table.');

        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 4: Check table column Header values', async () => {
            logger.info('STEP 4: Check table column Header values');
            // Capture the number of columns from the checkTableColumns method
            const columnsVerified = await shortagePage.checkTableColumnHeaders(page, RIGHT_DATA_TABLE, testData);
            expect(columnsVerified).toBe(true);
        });

    });

    test.skip('Test Case 4 - Verify Металлообработка склад (Metalworking Warehouse) Page Column header values Check for LEFT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify Column header values check');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Column header values Check for LEFT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 4: Check table column Header values', async () => {
            // Capture the number of columns from the checkTableColumns method
            await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON)
            logger.info('STEP 4: Check table column Header values');
            const columnsVerified = await shortagePage.checkTableColumnHeaders(page, LEFT_DATA_TABLE, testData2);
            expect(columnsVerified).toBe(true);
        });

    });


    test.skip('Test Case 5 - Verify Металлообработка склад (Metalworking Warehouse) Page Row Ordering for RIGHT table', async ({ page }) => {
        test.setTimeout(600000);
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify row sort ordering');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Row Ordering for RIGHT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 4: Check Row ordering', async () => {
            logger.info('STEP 4: Page loaded. Starting column identification.');
            // Call the method for the 'DateByUrgency' header
            logger.info('Finding column for DateByUrgency');
            const urgencyColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_URGENCY_DATA_COL);
            logger.info(`Urgency Column Index: ${urgencyColId}`);

            // Refresh the page to reset the state
            await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
            logger.info('Page reloaded. Starting next column identification.');

            // Call the method for the 'DateShipmentsPlan' header
            logger.info('Finding column for DateShipmentsPlan');
            const plannedShipmentColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_PLANNED_DATA_COL);
            logger.info(`Planned Shipment Column Index: ${plannedShipmentColId}`);

            // Check if both columns are found
            if (urgencyColId !== -1 && plannedShipmentColId !== -1) {
                logger.info('Both columns found. Checking table row ordering.');
                const sortedCorrect = await shortagePage.checkTableRowOrdering(page, RIGHT_DATA_TABLE, urgencyColId, plannedShipmentColId);

                // Log the return value
                logger.info('Check Table Row Ordering Result:', sortedCorrect);

                // Assert the result
                expect(sortedCorrect).toBeDefined();
                expect(sortedCorrect.success).toBe(true);

                if (!sortedCorrect.success) {
                    logger.info(`Error: ${sortedCorrect.message}`);
                }
            } else {
                const missingCol = urgencyColId === -1 ? 'Дата по срочности' : 'Дата план. отгрузки';
                throw new Error(`Column "${missingCol}" not found`);
            }
        });
    });
    test.skip('Test Case 6 - Verify Металлообработка склад (Metalworking Warehouse) Page Row Ordering for LEFT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify row sort ordering');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Row Ordering for LEFT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 4: Find if show left table button is visible and click it', async () => {
            logger.info('STEP 4: Find if show left table button is visible and click it');
            await page.waitForLoadState('networkidle');
            await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON)
        });

        await allure.step('Step 5: Check Row ordering', async () => {
            logger.info('STEP 5: Page loaded. Starting column identification.');

            // Call the method for the 'DateByUrgency' header
            logger.info('Finding column for DateByUrgency');
            const urgencyColId = await shortagePage.findColumn(page, LEFT_DATA_TABLE, LEFT_DATA_TABLE_URGENCY_DATA_COL);
            logger.info(`Urgency Column Index: ${urgencyColId}`);
            await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
            await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON)
            // Call the method for the 'DateShipmentsPlan' header
            logger.info('Finding column for DateShipmentsPlan');
            const plannedShipmentColId = await shortagePage.findColumn(page, LEFT_DATA_TABLE, LEFT_DATA_TABLE_PLANNED_DATA_COL);
            logger.info(`Planned Shipment Column Index: ${plannedShipmentColId}`);

            // Check if both columns are found
            if (urgencyColId !== -1 && plannedShipmentColId !== -1) {
                logger.info('Both columns found. Checking table row ordering.');
                const sortedCorrect = await shortagePage.checkTableRowOrdering(page, LEFT_DATA_TABLE, urgencyColId, plannedShipmentColId);

                // Log the return value
                logger.info('Check Table Row Ordering Result:', sortedCorrect);

                // Assert the result
                expect(sortedCorrect).toBeDefined();
                expect(sortedCorrect.success).toBe(true);

                if (!sortedCorrect.success) {
                    logger.info(`Error: ${sortedCorrect.message}`);
                }
            } else {
                const missingCol = urgencyColId === -1 ? 'Дата по срочности' : 'Дата план. отгрузки';
                throw new Error(`Column "${missingCol}" not found`);
            }

        });
    });
    test.skip('Test Case 7 - Verify Металлообработка склад (Metalworking Warehouse) Page search functionality LEFT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify row sort ordering');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page search functionality for LEFT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);
        let searchQuery = 'Обозначение';

        await allure.step('Step 4: Find if show left table button is visible and click it', async () => {
            logger.info('STEP 4: Find if show left table button is visible and click it');
            await page.waitForLoadState('networkidle');
            await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON);
        });

        await allure.step('Step 5: Check Search Functionality', async () => {

            const tableId = LEFT_DATA_TABLE;
            const searchFieldId = 'Search-Cover-Input'; // Adjust as needed
            const searchFields = [LEFT_DATA_TABLE_SEARCHABLE_FIELD]; // Adjust as needed

            await allure.step('5.1: Reset Filters', async () => {
                // Reset filters on the page
                await shortagePage.clickButton(' Сбросить все фильтры ', `[data-testid="${RESET_FILTERS}"]`);
            });
            // Find column IDs for specified search fields
            let columnIds: number[] = [];
            await allure.step('5.2: Determine searchable columns', async () => {
                columnIds = await shortagePage.getSearchableColumnIds(page, tableId, searchFields);
            });

            let firstRowData: string[] = [];
            await allure.step('5.3: Extract text from searchable columns of the first valid row for testing data', async () => {
                let rowIndex = 1;
                let found = false;

                while (!found) {
                    await page.waitForLoadState('networkidle');
                    const row = await page.locator(`[data-testid="${tableId}"] tbody tr:nth-child(${rowIndex})`);
                    const cells = await row.locator('td');
                    const cellCount = await cells.count();

                    if (cellCount > 0) {
                        found = true;
                        for (const columnId of columnIds) {
                            if (columnId < cellCount) {
                                const cellValue = await cells.nth(columnId).innerText();
                                firstRowData.push(cellValue);
                            } else {
                                console.warn(`Column index ${columnId} is out of bounds for row ${rowIndex}`);
                            }
                        }
                    } else {
                        rowIndex++;
                    }

                    if (rowIndex > await page.locator(`[data-testid="${tableId}"] tbody tr`).count()) {
                        console.error('No valid rows found');
                        break;
                    }
                }
            });


            searchQuery = firstRowData[0];
            for (let i = 0; i < firstRowData.length; i++) {
                await allure.step(`5.4: Testing search results for text ${firstRowData[i]}`, async () => {
                    const searchValue = firstRowData[i];

                    await allure.step(`5.4.1: Reset the page before checking results`, async () => {
                        // Perform search using the first cell's value
                        await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
                        await shortagePage.showLeftTable(LEFT_DATA_TABLE, SHOW_LEFT_TABLE_BUTTON)
                    });

                    await allure.step(`5.4.2: Performing search with ${searchValue}`, async () => {
                        await shortagePage.searchTableByIcon(searchValue, `[data-testid="${tableId}"]`);
                        await page.waitForSelector(`[data-testid="${tableId}"] tbody tr`, { state: 'visible' });
                    });
                    let validRows: ElementHandle<Element>[] = [];
                    let rowCount = 0;

                    await allure.step(`5.4.3: Retrieve results`, async () => {
                        const allRows = await page.locator(`[data-testid="${tableId}"] tbody tr`).elementHandles() as ElementHandle<Element>[];
                        const headerRows: ElementHandle<Element>[] = [];

                        for (const row of allRows) {
                            const thCount = await row.$$('th');
                            if (thCount.length > 0) {
                                headerRows.push(row);
                            }
                        }

                        validRows = allRows.filter(row => !headerRows.includes(row));
                        rowCount = validRows.length;
                        logger.info(`Total header rows found: ${headerRows.length}`);
                        logger.info(`Total valid rows found: ${rowCount}`);
                    });

                    await allure.step(`5.4.4: Confirm results are valid`, async () => {
                        // Log the HTML content of each valid row
                        for (let j = 0; j < rowCount; j++) {
                            const rowHtml = await validRows[j].evaluate(node => (node as HTMLElement).outerHTML);
                            logger.info(`Row ${j + 1} HTML:`, rowHtml);

                            // Uncomment the following line to make the test fail for testing purposes
                            // await validRows[j].$eval(`td:nth-child(${columnIds[0] + 1})`, node => (node as HTMLElement).innerText = 'Invalid Value');

                            // Verify that all results contain the search value in the respective column
                            const cellValue = await validRows[j].$eval(`td:nth-child(${columnIds[0] + 1})`, node => (node as HTMLElement).innerText);
                            expect(cellValue).toContain(searchValue);
                        }
                    });

                    await allure.step(`5.4.5: Confirm search input contains search text`, async () => {
                        logger.info(`5.4.5: Confirm search input contains search text`);
                        const searchInputSelector = '[data-testid="Search-Cover-Input"]'; // Update this selector to match your search input element
                        const inputValue = await page.$eval(searchInputSelector, input => (input as HTMLInputElement).value);
                        //expect(inputValue).toBe(searchValue);
                        //https://app.weeek.net/ws/426401/task/2839
                    });
                });
            }

            logger.info("finished result checking");

            // 5.5 Search History Dropdown
            await allure.step('5.5: Check search history functionality', async () => {
                await shortagePage.checkSearchHistory(page, tableId, searchFieldId, firstRowData);
            });


            // 5.6 Boundary and Edge Cases
            await allure.step('5.6: Perform boundary and edge case tests', async () => {
                await shortagePage.performNegativeSearchTests(page, tableId, searchFieldId);
            });

            // 5.7 Performance Testing
            await allure.step('5.7: Measure the performance of the search functionality', async () => {

                const start = Date.now();

                await shortagePage.searchTable(searchQuery, `[data-testid="${tableId}"]`);

                const results = await page.locator(`[data-testid="${LEFT_DATA_TABLE_CELL_X}"]`);
                //await results.waitFor();
                const end = Date.now();
                const timeTaken = end - start;
                logger.info(`Time taken for search results: ${timeTaken}ms`);
            });

            // 5.8 // Verify accessibility
            await allure.step('5.8: Verify Accessibility', async () => {
                const table = page.locator(`[data-testid="${tableId}"]`);
                const searchInput = page.locator(`[data-testid="${searchFieldId}"]`);
                const ariaLabel = await searchInput.getAttribute('aria-label');
                //expect(ariaLabel).toBeTruthy();
                //https://app.weeek.net/ws/426401/task/2845
            });

            // 5.9 Security Considerations
            await allure.step('5.9: Test for security vulnerabilities', async () => {
                const table = page.locator(`[data-testid="${tableId}"]`);
                const searchTable = table.locator(`[data-testid="${searchFieldId}"]`);

                // Function to filter out rows with `th` elements
                async function getValidRows(): Promise<ElementHandle<Element>[]> {
                    const allRows = await table.locator('tbody tr').elementHandles() as ElementHandle<Element>[];
                    const validRows: ElementHandle<Element>[] = [];

                    for (const row of allRows) {
                        const thCount = await row.$$('th');
                        if (thCount.length === 0) {
                            validRows.push(row);
                        }
                    }
                    return validRows;
                }
                await page.waitForLoadState('networkidle');
                // SQL Injection Test
                const sqlInjectionQuery = "' OR '1'='1";
                await shortagePage.searchTable(sqlInjectionQuery, `[data-testid="${tableId}"]`);

                //await searchTable.fill(sqlInjectionQuery);
                //await table.press('Enter');
                await page.waitForLoadState('networkidle');
                const validRowsAfterSqlInjection = await getValidRows();
                await page.waitForLoadState('networkidle');
                expect(validRowsAfterSqlInjection.length).toBe(0); // Expect no valid rows or appropriate handling

                // XSS Test
                const xssQuery = "<script>alert('XSS')</script>";
                await searchTable.fill(xssQuery);
                await searchTable.press('Enter');
                await page.waitForLoadState('networkidle');
                const validRowsAfterXss = await getValidRows();

                expect(validRowsAfterXss.length).toBe(0); // Expect no valid rows or appropriate handling
            });

            // Additional: Execute search using the icon
            await allure.step('5.10: Verify search can be executed using the search icon', async () => {


                await shortagePage.searchTableByIcon(searchQuery, `[data-testid="${tableId}"]`);
                // Wait for the table body to be fully loaded by checking for the presence of at least one row
                await page.waitForSelector(`[data-testid="${tableId}"] tbody tr`, { state: 'visible' });
                //await page.waitForTimeout(5000);
                const allRows = await page.locator(`[data-testid="${tableId}"] tbody tr`).elementHandles() as ElementHandle<Element>[];
                const headerRows: ElementHandle<Element>[] = [];

                for (const row of allRows) {
                    const thCount = await row.$$('th');
                    if (thCount.length > 0) {
                        headerRows.push(row);
                    }
                }

                const validRows = await allRows.filter(row => !headerRows.includes(row));
                logger.info(`"Rows found: ${validRows.length}"`);

                expect(await validRows.length).toBeGreaterThan(0);
            });

        });

    });
    test.skip('Test Case 8 - Verify Металлообработка склад (Metalworking Warehouse) Page search functionality RIGHT table', async ({ page }) => {
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify row sort ordering');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page search functionality for LEFT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);
        let searchQuery = 'Обозначение';

        await allure.step('Step 4: Check Search Functionality', async () => {
            logger.info('Step 4: Check Search Functionality');

            const tableId = RIGHT_DATA_TABLE;
            const searchFieldId = 'Search-Cover-Input'; // Adjust as needed
            const searchFields = [RIGHT_DATA_TABLE_SEARCHABLE_COLS1, RIGHT_DATA_TABLE_SEARCHABLE_COLS2, RIGHT_DATA_TABLE_SEARCHABLE_COLS3]; // Adjust as needed

            await allure.step('5.1: Reset Filters', async () => {
                logger.info('5.1: Reset Filters');
                // Reset filters on the page
                await shortagePage.clickButton(' Сбросить все фильтры ', `[data-testid="${RESET_FILTERS}"]`);
            });

            // Find column IDs for specified search fields
            let columnIds: number[] = [];
            await allure.step('5.2: Determine searchable columns', async () => {
                logger.info('5.2: Determine searchable columns');
                columnIds = await shortagePage.getSearchableColumnIds(page, tableId, searchFields);
            });
            let firstRowData: string[] = [];
            await allure.step('5.3: Extract text from searchable columns of the first valid row for testing data', async () => {
                logger.info('5.3: Extract text from searchable columns of the first valid row for testing data');
                let rowIndex = 1;
                let found = false;

                // Log initial information
                logger.log(`Starting to search for valid rows in table with ID: ${tableId}`);
                logger.log(`Initial column IDs: ${JSON.stringify(columnIds)}`);

                // Ensure the table is visible
                const tableSelector = `[data-testid="${tableId}"] tbody tr`;
                try {
                    // Attempt to wait for the data-testid element
                    await page.waitForSelector(tableSelector, { state: 'visible', timeout: 5000 });
                } catch (error) {
                    // If data-testid element is not found, fall back to using id
                    const tableSelectorFallback = `#${tableId} tbody tr`;
                    await page.waitForSelector(tableSelectorFallback, { state: 'visible', timeout: 5000 });
                }


                // Get the total number of rows in the table
                const totalRowCount = await page.locator(tableSelector).count();
                logger.log(`Total rows in table: ${totalRowCount}`);

                while (!found && rowIndex <= totalRowCount) {
                    const row = await page.locator(`${tableSelector}:nth-child(${rowIndex})`);
                    const cells = await row.locator('td');
                    const cellCount = await cells.count();

                    logger.log(`Checking row ${rowIndex} with ${cellCount} cells`);

                    if (cellCount > 0) {
                        let rowHasAllContent = true;
                        const rowData: string[] = [];

                        for (const columnId of columnIds) {
                            if (columnId < cellCount) {
                                const cellValue = await cells.nth(columnId).innerText();
                                logger.log(`Cell value from column ${columnId}: ${cellValue}`);

                                if (cellValue.trim() === '') {
                                    rowHasAllContent = false;
                                    break;
                                } else {
                                    rowData.push(cellValue);
                                }
                            } else {
                                console.warn(`Column index ${columnId} is out of bounds for row ${rowIndex}`);
                                rowHasAllContent = false;
                                break;
                            }
                        }

                        if (rowHasAllContent) {
                            found = true;
                            firstRowData.push(...rowData);
                        }
                    }

                    rowIndex++;
                }

                if (!found) {
                    console.error('No valid rows found');
                } else {
                    logger.log('First valid row data:', firstRowData);
                    logger.info('First valid row data for search: ', firstRowData);
                }
            });


            //searchQuery = firstRowData[0];
            for (let i = 0; i < firstRowData.length; i++) {
                await allure.step(`5.4: Testing search results for text ${firstRowData[i]}`, async () => {
                    logger.info(`5.4: Testing search results for text ${firstRowData[i]}`);
                    const searchValue = firstRowData[i];

                    await allure.step(`5.4.1: Reset the page before checking results`, async () => {
                        logger.info(`5.4.1: Reset the page before checking results`);
                        await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
                    });

                    await allure.step(`5.4.2: Performing search with ${searchValue}`, async () => {
                        logger.info(`5.4.2: Performing search with ${searchValue}`);
                        await shortagePage.searchTableByIcon(searchValue, `[data-testid="${tableId}"]`);
                        await page.waitForSelector(`[data-testid="${tableId}"] tbody tr`, { state: 'visible' });
                    });

                    let validRows: ElementHandle<Element>[] = [];
                    let rowCount = 0;

                    await allure.step(`5.4.3: Retrieve results`, async () => {
                        logger.info(`5.4.3: Retrieve results`);
                        const allRows = await page.locator(`[data-testid="${tableId}"] tbody tr`).elementHandles() as ElementHandle<Element>[];
                        const headerRows: ElementHandle<Element>[] = [];

                        for (const row of allRows) {
                            const thCount = await row.$$('th');
                            if (thCount.length > 0) {
                                headerRows.push(row);
                            }
                        }

                        validRows = allRows.filter(row => !headerRows.includes(row));
                        rowCount = validRows.length;
                        logger.info(`Total header rows found: ${headerRows.length}`);
                        logger.info(`Total valid rows found: ${rowCount}`);
                    });

                    await allure.step('5.4.4: Confirm results are valid', async () => {
                        logger.info('5.4.4: Confirm results are valid');

                        for (let j = 0; j < rowCount; j++) {
                            const rowHtml = await validRows[j].evaluate(node => (node as HTMLElement).outerHTML);

                            if (rowHtml) {
                                logger.info(`Row ${j + 1} HTML: ${rowHtml}`);
                            } else {
                                logger.warn(`Row ${j + 1} HTML is empty or null`);
                            }

                            await validRows[j].waitForSelector(`td:nth-child(${columnIds[i] + 1})`, { state: 'visible', timeout: 5000 });

                            const cellContent = await validRows[j].$eval(`td:nth-child(${columnIds[i] + 1})`, node => (node as HTMLElement).innerText);
                            logger.info(`Row ${j + 1}, Column ${columnIds[i] + 1} content: ${cellContent}`);

                            if (cellContent.trim() !== '') {
                                logger.info(`Cell content is not empty: ${cellContent}`);
                                expect(cellContent).toContain(searchValue);
                            } else {
                                logger.warn(`Cell content is empty or null for row ${j + 1}, column ${columnIds[i] + 1}`);
                            }
                        }
                    });

                    await allure.step(`5.4.5: Confirm search input contains search text`, async () => {
                        logger.info(`5.4.5: Confirm search input contains search text`);
                        const searchInputSelector = '[data-testid="Search-Cover-Input"]';
                        const inputValue = await page.$eval(searchInputSelector, input => (input as HTMLInputElement).value);
                        logger.info(`Search input value: ${inputValue}`);
                        expect(inputValue).toBe(searchValue);
                    });
                });
            }



            logger.info("finished result checking");

            // 5.5 Search History Dropdown
            await allure.step('5.5: Check search history functionality', async () => {
                logger.info('5.5: Check search history functionality');
                await shortagePage.checkSearchHistory(page, tableId, searchFieldId, firstRowData);
            });

            // 5.6 Boundary and Edge Cases
            await allure.step('5.6: Perform boundary and edge case tests', async () => {
                logger.info('5.6: Perform boundary and edge case tests');
                await shortagePage.performNegativeSearchTests(page, tableId, searchFieldId);
            });

            // 5.7 Performance Testing
            await allure.step('5.7: Measure the performance of the search functionality', async () => {
                logger.info('5.7: Measure the performance of the search functionality');
                const start = Date.now();
                searchQuery = firstRowData[0];
                await shortagePage.searchTable(searchQuery, `[data-testid="${tableId}"]`);

                const results = await page.locator(`[data-testid="${RIGHT_DATA_TABLE_CELL_X}"]`);

                //await results.waitFor();
                const end = Date.now();
                const timeTaken = end - start;
                logger.info(`Time taken for search results: ${timeTaken}ms`);
            });

            // 5.8 // Verify accessibility
            await allure.step('5.8: Verify Accessibility', async () => {
                logger.info('5.8: Verify Accessibility');
                const table = page.locator(`[data-testid="${tableId}"]`);
                const searchInput = page.locator(`[data-testid="${searchFieldId}"]`);
                const ariaLabel = await searchInput.getAttribute('aria-label');
                //expect(ariaLabel).toBeTruthy();
                //https://app.weeek.net/ws/426401/task/2845

            });

            // 5.9 Security Considerations
            await allure.step('5.9: Test for security vulnerabilities', async () => {
                logger.info('5.9: Test for security vulnerabilities');
                const table = page.locator(`[data-testid="${tableId}"]`);
                const searchTable = table.locator(`[data-testid="${searchFieldId}"]`);

                // Function to filter out rows with `th` elements
                async function getValidRows(): Promise<ElementHandle<Element>[]> {
                    const allRows = await table.locator('tbody tr').elementHandles() as ElementHandle<Element>[];

                    const validRows: ElementHandle<Element>[] = [];

                    for (const row of allRows) {
                        const thCount = await row.$$('th');
                        if (thCount.length === 0) {
                            validRows.push(row);
                        }
                    }
                    return validRows;
                }
                let sqlInjectionQuery = "";

                sqlInjectionQuery = "' OR '1'='1";
                await shortagePage.searchTable(sqlInjectionQuery, `[data-testid="${tableId}"]`);

                let validRowsAfterSqlInjection = await getValidRows();

                validRowsAfterSqlInjection = await getValidRows();

                expect(validRowsAfterSqlInjection.length).toBe(0); // Expect no valid rows or appropriate handling

                // XSS Test
                const xssQuery = "<script>alert('XSS')</script>";
                await shortagePage.searchTable(xssQuery, `[data-testid="${tableId}"]`);
                await page.waitForTimeout(2000); // Wait for results to update
                const validRowsAfterXss = await getValidRows();

                expect(validRowsAfterXss.length).toBe(0); // Expect no valid rows or appropriate handling
            });

            // Additional: Execute search using the icon
            await allure.step('5.10: Verify search can be executed using the search icon', async () => {
                logger.info('5.10: Verify search can be executed using the search icon');
                searchQuery = firstRowData[0];
                await shortagePage.searchTableByIcon(searchQuery, `[data-testid="${tableId}"]`);
                // Wait for the table body to be fully loaded by checking for the presence of at least one row
                await page.waitForSelector(`[data-testid="${tableId}"] tbody tr`, { state: 'visible' });
                //await page.waitForTimeout(5000);
                const allRows = await page.locator(`[data-testid="${tableId}"] tbody tr`).elementHandles() as ElementHandle<Element>[];
                const headerRows: ElementHandle<Element>[] = [];

                for (const row of allRows) {
                    const thCount = await row.$$('th');
                    if (thCount.length > 0) {
                        headerRows.push(row);
                    }
                }

                const validRows = await allRows.filter(row => !headerRows.includes(row));
                logger.info(`"Rows found: ${validRows.length}"`);

                expect(await validRows.length).toBeGreaterThan(0);
            });

            // Additional: Validate search functionality with multiple filters
            // Works for right table only
            /*  await allure.step('5.11: Verify search works with multiple filters', async () => {
                  logger.info('5.11: Verify search works with multiple filters');
                  const table = page.locator(`[data-testid="${tableId}"]`);
                  const searchTable = table.locator(`[data-testid="${searchFieldId}"]`);
  
                  await searchTable.fill(searchQuery);
                  await searchTable.press('Enter');
                  const results = page.locator('[data-testid="Search-Results"]');
                  expect(await results.count()).toBeGreaterThan(0);
  
                  const additionalFilter = page.locator('[data-testid="Additional-Filter"]');
                  await additionalFilter.click();
                  const filteredResults = page.locator('[data-testid="Filtered-Results"]');
                  expect(await filteredResults.count()).toBeGreaterThan(0);
              });*/
        });
    });
    test.skip('Test Case 9 - Verify Металлообработка склад (Metalworking Warehouse) Page - Compare dates with Order List for RIGHT table', async ({ page }) => {
        test.setTimeout(600000);
        allure.label('severity', 'normal');
        allure.label('epic', 'Склад');
        allure.label('feature', 'Металлообработка склад');
        allure.label('story', 'Verify row sort ordering');
        allure.description('Verify Металлообработка склад (Metalworking Warehouse) Page Dates in main table match dates in the Orders List for RIGHT table.');
        const shortagePage = new CreateMetalworkingWarehousePage(page);

        await allure.step('Step 4: compare the dates in each Row, with thier Orders list', async () => {
            logger.info('STEP 4: Find Columns to check ordering in main table.');

            // Call the method for the 'Name' header
            logger.info('Finding column for Name');
            const nameColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_SEARCHABLE_COLS3);
            logger.info(`Name Column Index: ${nameColId}`);

            // Call the method for the 'DateByUrgency' header
            logger.info('Finding column for Date By Urgency');
            const urgencyColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_URGENCY_DATA_COL);
            logger.info(`Urgency Column Index: ${urgencyColId}`);

            // Call the method for the 'Orders Icon' header
            logger.info('Finding column for Orders Icon');
            const ordersColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_ORDERS_ICON_COL);
            logger.info(`Planned Shipment Column Index: ${ordersColId}`);

            // Call the method for the 'DateShipmentsPlan' header
            logger.info('Finding column for Date Shipments Planned');
            const plannedShipmentColId = await shortagePage.findColumn(page, RIGHT_DATA_TABLE, RIGHT_DATA_TABLE_PLANNED_DATA_COL);
            logger.info(`Planned Shipment Column Index: ${plannedShipmentColId}`);

            // Check if all columns are found
            if (nameColId !== -1 && urgencyColId !== -1 && plannedShipmentColId !== -1 && ordersColId !== -1) {
                logger.info('All columns found. Checking table row ordering.');
                const sortedCorrect = await shortagePage.checkDatesWithOrderList(page,
                    RIGHT_DATA_TABLE,
                    nameColId,
                    urgencyColId,
                    plannedShipmentColId,
                    ordersColId,
                    RIGHT_MODAL_WINDOW_ID, //modal id
                    RIGHT_MODAL_TABLE_ID, //table id
                    RIGHT_MODAL_TABLE_COL3,
                    RIGHT_MODAL_TABLE_COL4
                );
            } else {
                const missingCol = nameColId === -1 ? 'Name' :
                    urgencyColId === -1 ? 'Дата по срочности' :
                        plannedShipmentColId === -1 ? 'Дата план. отгрузки' : 'Orders';
                throw new Error(`Column "${missingCol}" not found`);
            }
        });
    });
};