import { test, expect, ElementHandle, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec'; // Adjust the import path as necessary
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import { ENV, SELECTORS } from '../config'; // Import the configuration
import logger from '../lib/logger';
import { allure } from 'allure-playwright';

import testData1 from '../testdata/PD18-T1.json'; // Import your test data
import testData2 from '../testdata/PD18-T2.json'; // Import your test data
import testData3 from '../testdata/PD18-T3.json'; // Import your test data


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
// Страница: База деталей
export const runTC100 = () => {
    logger.info(`Starting test: Validating full specifications ( Полная спецификация ) for an item on parts database Page`);
    ;

    // Use a separate step to initialize the База деталей
    test.beforeEach(async ({ page }) => {
        const shortagePage = new CreatePartsDatabasePage(page);

        await allure.step('Step 1: Open the login page and login', async () => {
            await performLogin(page, '001', 'Перов Д.А.', '54321');
        });

        await allure.step('Step 2: Navigate to Склад', async () => {
            await page.waitForTimeout(5000);
            await shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        });

    });
    test.skip('Test Case 0: База деталей Page - Scan tables within a specific element', async ({ page }) => {
        test.setTimeout(600000);
        allure.label('severity', 'normal');
        allure.label('epic', 'База деталей');
        allure.label('feature', 'База деталей');
        allure.label('story', 'Verify table structures');
        allure.description('Verify  База деталей Page - Scan tables within a specific element.');

        await allure.step('Step 1: Validate the structure of the tables on the page', async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            await page.waitForLoadState('networkidle');
            const result = await shortagePage.scanTablesWithinElement(page, 'App-RouterView'); // Replace with your data-testid
            expect(result.success, 'Validation failed with the following errors:\n' + result.errors.join('\n')).toBeTruthy();
        });
    });
    test('Test Case 1: База деталей Page - process all products with recursive logic', async ({ page }) => {
        test.setTimeout(600000);
        allure.label('severity', 'normal');
        allure.label('epic', 'База деталей');
        allure.label('feature', 'База деталей');
        allure.label('story', 'Recursive Processing');
        allure.description('Processes all products recursively, handling nested СБ items.');

        const shortagePage = new CreatePartsDatabasePage(page);
        let dataRows: Locator[]; // Holds rows of all products

        await allure.step('Step 1: Get a list of all products in the first table', async () => {
            await page.waitForLoadState('networkidle');
            const table = page.locator(`[data-testid="BasePaginationTable-Table-Product"]`);
            dataRows = await shortagePage.getAllDataRows(table);
            logger.info(`Found ${dataRows.length} products.`);
        });

        await allure.step('Step 2: Process each product row and its tables', async () => {
            //dataRows.shift();
            dataRows.shift();
            for (const row of dataRows) {

                const designationLocator = row.locator('[data-testid="TableProduct-TableDesignation"]');

                // Extract the text content of the designation field
                const designation = await designationLocator.textContent() ?? '';

                await shortagePage.processProduct(row, shortagePage, page, designation);
                break;
            }
            shortagePage.printGlobalTableData();

        });
    });

};