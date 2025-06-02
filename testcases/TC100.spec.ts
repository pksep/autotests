import { test, expect, ElementHandle, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec'; // Adjust the import path as necessary
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import { ENV, SELECTORS } from '../config'; // Import the configuration
import logger from '../lib/logger';
import { allure } from 'allure-playwright';

import testData1 from '../testdata/PD18-T1.json'; // Import your test data
import testData2 from '../testdata/PD18-T2.json'; // Import your test data
import testData3 from '../testdata/PD18-T3.json'; // Import your test data

//const TEST_PRODUCT = 'Т15';
const TEST_PRODUCT = 'СС7500';

const MAIN_PAGE_EDIT_BUTTON = "BaseDetals-Button-Edit";
const LEFT_DATA_TABLE = "BasePaginationTable-Table-Component-product";
const LEFT_DATA_TABLE_URGENCY_DATA_COL = "ShipmentsListTable-TableRow-HeaderDateByUrgency";
const LEFT_DATA_TABLE_PLANNED_DATA_COL = "ShipmentsListTable-TableRow-HeaderDateShipmentPlan";
const LEFT_DATA_TABLE_SEARCHABLE_FIELD = "ShipmentsListTable-TableRow-HeaderOrder";

const CENTER_DATA_TABLE = "BasePaginationTable-Table-Component-cbed";

const RIGHT_DATA_TABLE = "BasePaginationTable-Table-Component-detal";
const RIGHT_DATA_TABLE_URGENCY_DATA_COL = "AssemblySclad-PrintTableHeader-UrgencyDateColumn";
const RIGHT_DATA_TABLE_PLANNED_DATA_COL = "AssemblySclad-PrintTableHeader-PlannedShipmentDateColumn";
const RIGHT_DATA_TABLE_SUBPLANNED_DATA_COL = "AssemblySclad-PrintTableHeader-ShipmentsColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS1 = "AssemblySclad-PrintTableHeader-TypeColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS2 = "AssemblySclad-PrintTableHeader-DesignationColumn";
const RIGHT_DATA_TABLE_SEARCHABLE_COLS3 = "AssemblySclad-PrintTableHeader-NameColumn";
const RIGHT_DATA_TABLE_ORDERS_ICON_COL = "AssemblySclad-PrintTableHeader-ShipmentsColumn";

const RIGHT_MODAL_WINDOW_ID = "ModalShipmentsToIzed-destroyModalRight";
const RIGHT_MODAL_TABLE_ID = "ModalShipmentsToIzed-table-buyers";
const RIGHT_MODAL_TABLE_COL3 = "ModalShipmentsToIzed-thead-th3-buyers";
const RIGHT_MODAL_TABLE_COL4 = "ModalShipmentsToIzed-thead-th4-buyers";
const RIGHT_DATA_TABLE_CELL_X = "AssemblySclad-PrintTableBody-";
const LEFT_DATA_TABLE_CELL_X = "ShipmentsListTable-orderRow";
const MAIN_PAGE_ИЗДЕЛИЕ_TABLE = "BasePaginationTable-Table-product";

const EDIT_PAGE_SPECIFICATIONS_TABLE = "Spectification-TableSpecification-Product";

// Страница: База деталей
export const runTC100 = () => {
    logger.info(`Starting test: Validating full specifications ( Полная спецификация ) for an item on parts database Page`);
    ;




    // test.skip('Test Case 0: База деталей Page - Scan tables within a specific element', async ({ page }) => {
    //     test.setTimeout(0);
    //     allure.label('severity', 'normal');
    //     allure.label('epic', 'База деталей');
    //     allure.label('feature', 'База деталей');
    //     allure.label('story', 'Verify table structures');
    //     allure.description('Verify  База деталей Page - Scan tables within a specific element.');

    //     await allure.step('Step 1: Validate the structure of the tables on the page', async () => {
    //         const shortagePage = new CreatePartsDatabasePage(page);
    //         await page.waitForLoadState('networkidle');
    //         const result = await shortagePage.scanTablesWithinElement(page, 'App-RouterView'); // Replace with your data-testid
    //         expect(result.success, 'Validation failed with the following errors:\n' + result.errors.join('\n')).toBeTruthy();
    //     });
    // });
    test('Test Case 1: База деталей Page - process all products with recursive logic', async ({ page }) => {

        test.setTimeout(2147483);
        allure.label('severity', 'normal');
        allure.label('epic', 'База деталей');
        allure.label('feature', 'База деталей');
        allure.label('story', 'Recursive Processing');
        allure.description('Processes all products recursively, handling nested СБ items.');

        const shortagePage = new CreatePartsDatabasePage(page);
        let dataRows: Locator[]; // Holds rows of all products

        await allure.step('Step 0: Navigate to Parts Database', async () => {
            await page.waitForTimeout(5000);
            await shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        });
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });
        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();//DATA_TESTID
        });
        await allure.step("Step 05: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);//DATA_TESTID
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

        });
        await allure.step("Step 06: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(leftTable.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT); //DATA-TESTID
        });
        await allure.step("Step 07: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');//DATA-TESTID
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 08: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 09: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable.)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Get the value of the first cell in the first row
            firstCellValue = await leftTable.locator('tbody tr:first-child td:nth-child(1)').innerText();
            firstCellValue = firstCellValue.trim();
            // Get the value of the second cell in the first row
            secondCellValue = await leftTable.locator('tbody tr:first-child td:nth-child(2)').innerText();
            secondCellValue = secondCellValue.trim();
            // Get the value of the third cell in the first row
            thirdCellValue = await leftTable.locator('tbody tr:first-child td:nth-child(3)').innerText();
            thirdCellValue = thirdCellValue.trim();

            // Confirm that the first cell contains the search term
            expect(secondCellValue).toContain(TEST_PRODUCT); // Validate that the value matches the search term
        });
        await allure.step("Step 10: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
            await firstRow.hover();
            await firstRow.click();
            await page.waitForTimeout(500);
        });
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);


        await allure.step("Step 12: Нажимаем по данной кнопке. (Press the button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            await editButton.click();
            // Debugging pause to verify visually in the browser
            await page.waitForTimeout(500);
        });

        await allure.step('Step 1: Parse the Product Specifications recursively and build an array', async () => {
            // Fetch the product designation at the start
            const productDesignationElement = page.locator('[data-testid="Creator-Designation-Input-Input"]');
            await productDesignationElement.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await productDesignationElement.waitFor({ state: 'visible' });
            const productDesignation = await productDesignationElement.inputValue() || ''; // This should be the main product ID

            await shortagePage.parseRecursiveStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE, productDesignation);
            await shortagePage.printParsedTableData();

            console.log('Parsed Table Data:', JSON.stringify(shortagePage.parsedData, null, 2));
        });
        await allure.step('Step 2: Parse the Product Specifications Table', async () => {
            const openSpecificationButton = page.locator('[data-testid="Spectification-Buttons-openSpecification"]');
            openSpecificationButton.click();
            const specs = await shortagePage.extractAllTableData(page, 'Spectification-ModalCbed');
            console.log(JSON.stringify(specs, null, 2));

        });



    });

};