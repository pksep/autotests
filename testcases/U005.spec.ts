import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json'; // Import your test data
import testData2 from '../testdata/U004-PC01.json';
import { notDeepStrictEqual } from "assert";
import exp from "constants";
const LEFT_DATA_TABLE = "BasePaginationTable-Table-product";
const TEST_DETAIL_NAME = "U005_test2_DETAILName";
const TEST_CATEGORY = "3D печать";
const TEST_MATERIAL = "09Г2С (Сталь)";
const TEST_NAME = "Круг Сталь 09Г2С Ø100мм";
const TEST_FILE = "87.02-05.01.00СБ Маслобак (ДГП15)СБ.jpg";

const baseFileNamesToVerify = [
    { name: "Test_imagexx_1", extension: ".jpg" },
    { name: "Test_imagexx_2", extension: ".png" }
];


export const runU005 = () => {

    test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
        await allure.step("Step 00: Authentication", async () => {
            // Perform login directly on the provided page fixture
            await performLogin(page, "001", "Перов Д.А.", "54321");
            await page.waitForSelector('[data-testid="LoginForm-Login-Button"]', { state: 'visible' });
            await page.locator('[data-testid="LoginForm-Login-Button"]').click();

            const targetH3 = page.locator('h3:has-text("План по операциям")');
            await expect(targetH3).toBeVisible();
        });
    });
    test("TestCase 01 - создат дитайл - Проверка страница", async ({ browser, page }) => {
        test.setTimeout(50000);
        const shortagePage = new CreatePartsDatabasePage(page);
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(500);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 02: Проверяем наличия заголовка на странице \"База деталей\" (Check for the presence of the title on the 'Parts Database' page)", async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            // Wait for loading
            const titles = testData2.elements.MainPage.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInClass(page, 'detailsdb');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            logger.info('Expected Titles:', titles);
            logger.info('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        });
        const leftTable = page.locator(`[data-testid="${LEFT_DATA_TABLE}"]`);
        await allure.step("Step 03: Проверяем, что таблицы отображаются (Verify that the tables are displayed)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            // Retrieve the expected tables configuration from the JSON file
            const tables = testData2.elements.MainPage.tables;

            // Iterate over each expected table
            for (const table of tables) {
                const tableTitle = table.title; // Expected table title
                const expectedColumns = table.cols; // Expected column headers
                const tableId = table.id; // Table ID (data-testid)

                // Validate the table
                await allure.step(`Validate table with title: "${tableTitle}"`, async () => {
                    // Locate the table using data-testid
                    const targetTable = page.locator(`[data-testid="${tableId}"]`);
                    await expect(targetTable).toBeVisible();

                    // Validate the column headers
                    const headerCells = targetTable.locator('thead tr th');
                    const headerCount = await headerCells.count();
                    expect(headerCount).toBe(expectedColumns.length);
                    console.log(`Number of columns in table "${tableTitle}": ${headerCount}`);

                    // Iterate over each header cell and validate its content
                    for (let i = 0; i < expectedColumns.length; i++) {
                        const expectedHeader = expectedColumns[i].trim(); // Expected column header
                        const headerCell = headerCells.nth(i); // Get the nth header cell

                        // Highlight the header cell for debugging
                        await headerCell.evaluate((cell) => {
                            cell.style.backgroundColor = 'yellow';
                            cell.style.border = '2px solid red';
                            cell.style.color = 'blue';
                        });

                        // Validate the header's text content
                        const actualHeader = await headerCell.textContent();
                        console.log(`Column ${i + 1}: Expected = "${expectedHeader}", Actual = "${actualHeader?.trim()}"`);
                        expect(actualHeader?.trim()).toBe(expectedHeader);
                    }

                    // Validate the table has rows in its tbody
                    const rows = targetTable.locator('tbody tr');
                    const rowCount = await rows.count();
                    console.log(`Number of rows in table "${tableTitle}": ${rowCount}`);
                    expect(rowCount).toBeGreaterThan(0);

                    console.log(`Table "${tableTitle}" validation completed successfully.`);
                });
            }

            console.log("All table validations completed successfully.");
        });
        await allure.step("Step 11: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Wait for the row to become visible
            await firstRow.waitFor({ state: 'visible' });
            await page.waitForTimeout(500);

            const buttons = testData2.elements.MainPage.buttonsBefore;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(500);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 04: Проверяем Filters (Verify the presence of filters on the page)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Retrieve the expected filters configuration from the JSON file
            const jsonFilters = testData2.elements.MainPage.filters;

            // Locate all filter buttons on the page
            const filters = page.locator('.filters__btn');

            // Ensure the number of filters matches the JSON configuration
            const filtersCount = await filters.count();
            expect(filtersCount).toBe(jsonFilters.length);
            console.log(`Number of filters: ${filtersCount}`);

            // Iterate through each filter and validate its properties
            for (let i = 0; i < jsonFilters.length; i++) {
                const expectedFilter = jsonFilters[i]; // The expected filter from the JSON
                const filter = filters.nth(i); // The nth filter button on the page
                await filter.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                // Ensure the filter is visible
                await expect(filter).toBeVisible();

                // Validate the filter's label (text content)
                const actualLabel = await filter.textContent();
                console.log(`Filter ${i + 1}: Expected label = "${expectedFilter.label}", Actual label = "${actualLabel?.trim()}"`);
                expect(actualLabel?.trim()).toBe(expectedFilter.label);

                // Validate whether the filter is enabled or disabled
                const isDisabled = await filter.isDisabled();
                console.log(`Filter ${i + 1}: Expected state = "${expectedFilter.state}", Actual state = "${!isDisabled}"`);
                expect(String(!isDisabled)).toBe(expectedFilter.state); // Match the state ("true" for enabled, "false" for disabled)
            }

            console.log("All filters have been validated successfully.");
        });


        await allure.step("Step 04: Проверяем наличие кнопки (Verify the presence of buttons on the page)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData2.elements.MainPage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean
                if (buttonLabel == "Редактировать" || "Создать копированием") {
                    expectedState = false
                }
                if (buttonLabel == "Создать") {
                    expectedState = true
                }
                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(50);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
            await page.waitForTimeout(500);
        });
        await allure.step("Step 05: нажмите кнопку создания детали. (click on the create detail button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            const createButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Создать' }).filter({
                hasNotText: 'Создать копированием'
            });
            await createButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            createButton.click();

            await page.waitForTimeout(500);
        });
        await allure.step("Step 06: Проверяем, что в списке есть селекторы с названиями. (Check that the list contains selectors with names)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const buttons = testData1.elements.CreatePage.modalAddButtonsPopup;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);
                    const buttons = await page.locator('div.card-yui-kit.specification-dialog__card');
                    const buttonTexts = await buttons.evaluateAll(elements => elements.map(e => e.textContent!.trim()));
                    console.log('Button texts:', buttonTexts);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 07: нажмите кнопку деталь. (click on the create detail button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            const createButton = page.locator('div.card-yui-kit.detailsdb-dialog__card', { hasText: 'Деталь' });
            await createButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            createButton.click();

            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Проверяем наличия заголовка на странице \"Создать деталь\" (Check for the presence of the title on the 'Create Parts' page)", async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            // Wait for loading
            const titles = testData1.elements.CreatePage.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInClass(page, 'editor');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
            await page.waitForTimeout(500);
        });
        await allure.step("Step 09: Проверяем наличие кнопки (Verify the presence of buttons on the page)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(50);

            const buttons = testData1.elements.CreatePage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(50);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);
                    console.log("Button :" + buttonClass + " " + buttonLabel + " " + expectedState);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 10: Проверяем таблиц и содержимого по умолчанию (Verify tables and default content)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            const tables = testData1.elements.CreatePage.tables;

            // Iterate over each table in the array
            for (const table of tables) {
                // Extract the title and rows from the table object
                const tableTitle = table.title;
                const tableRows = table.rows;

                // Perform validation for the table
                await allure.step(`Validate table with title: "${tableTitle}"`, async () => {
                    await page.waitForTimeout(500);

                    // Placeholder function to validate the table
                    const isTableValid = await shortagePage.validateTable(page, tableTitle, tableRows);

                    console.log(`Table validation for "${tableTitle}":`, isTableValid);
                    // Validate the table's content
                    expect(isTableValid).toBeTruthy();
                    logger.info(`Is the table "${tableTitle}" valid?`, isTableValid);
                });
            }

            await page.waitForTimeout(500);
        });
        await allure.step("Step 11: существуют тестовые поля ввода (Verify input fields exist)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            // Extract the array of input fields from your JSON data
            const inputFields = testData1.elements.CreatePage.InputFields;

            // Call the helper function, passing the entire fields array
            const areFieldsValid = await shortagePage.validateInputFields(page, inputFields);

            // Validate that all fields are successfully validated
            expect(areFieldsValid).toBeTruthy();
            logger.info("All input fields are valid and writable.", areFieldsValid);

            await page.waitForTimeout(500);
        });
        await allure.step("Step 12: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            let firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetButton = firstDataRow.locator('td').nth(2).locator('button');
            await targetButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await targetButton.click();
            const titles = testData1.elements.CreatePage.modalAddMaterial.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'modal-yui-kit__modal-content');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', h3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
            //confirm the selected item is shown on the main page.

            await page.waitForTimeout(50);
        });
        await allure.step("Step 13: Проверяем, что кнопки  свитчера отображаются. (Confirm that the switcher is visible)", async () => {
            const switcher = await page.locator('.switch');
            await switcher.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            const switchItems = await page.locator('.switch-yui-kit-item').all();
            expect(switchItems.length).toBe(4);
        });
        await allure.step("Step 14: Проверяем, что свитчер “Материалы для деталей” выбран. (Confirm that material and detail is selected)", async () => {
            const switcher = await page.locator('.switch-yui-kit-item.switch-yui-kit-active');
            const content = await switcher.textContent();
            await switcher.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            expect(content).toBe("Материалы для деталей");
        });
        await allure.step("Step 15: Проверьте, что каждая таблица имеет правильное название. (Validate that each table exists with the correct title)", async () => {
            // Retrieve the object that groups different types of tables.
            const allTableGroups = testData1.elements.CreatePage.modalAddMaterial.tables;

            // Filter out the group with key "buttons"
            const validGroups = Object.entries(allTableGroups).filter(([groupName, _]) => groupName !== "buttons");

            // Retrieve the switch items on the page and await the array.
            const switchItems = await page.locator('.switch-yui-kit-item').all();

            let counter = 0;

            // Iterate over each valid table group.
            for (const [groupName, groupValue] of validGroups) {


                // Click the switch corresponding to this group.
                await switchItems[counter++].click();
                await page.waitForTimeout(500);

                // Now groupValue is an array of table definitions.
                for (const table of groupValue as any[]) {
                    const tableTitle = table.title;
                    // Locate the table using its data-testid attribute.
                    const targetTable = page.locator(`[data-testid="${table["data-testid"]}"]`);

                    // Ensure the table is visible.
                    await expect(targetTable).toBeVisible();

                    // Locate the header element within the table (assuming the title is in the first <th> in <thead>).
                    const actualTitleElement = targetTable.locator('thead tr th').first();

                    // Optionally highlight the header element for debugging.
                    await actualTitleElement.evaluate((el) => {
                        el.style.backgroundColor = 'yellow';
                        el.style.border = '2px solid red';
                        el.style.color = 'blue';
                    });

                    await expect(actualTitleElement).toBeVisible();

                    // Retrieve the header text and compare with the expected title.
                    const actualTitle = await actualTitleElement.textContent();
                    expect(actualTitle?.trim()).toBe(tableTitle);

                    //verify that the table has content
                    const rowsCount = await targetTable.locator('tbody tr').count();
                    const firstRow = await targetTable.locator('tbody tr').first();
                    await firstRow.evaluate((el) => {
                        el.style.backgroundColor = 'yellow';
                        el.style.border = '2px solid red';
                        el.style.color = 'blue';
                    });

                    expect(rowsCount).toBeGreaterThan(0);
                    logger.info(`Table with title "${tableTitle}" in group "${groupName}" is present and correct.`);
                }
            }

            await page.waitForTimeout(500);
        });
        await allure.step("Step 16: Проверяем наличие кнопки (Verify the presence of buttons on the page)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            const buttons = testData1.elements.CreatePage.modalAddMaterial.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean
                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(50);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState, '.base-modal.modal-yui-kit');

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
            await page.waitForTimeout(500);
        });
        await allure.step("Step 17: reset switcher to default (reset switcher to default)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            const targetItem = page.locator('li.switch-yui-kit-item', { hasText: 'Материалы для деталей' });
            // Ensure the item is visible
            await expect(targetItem).toBeVisible();
            // Click the item
            await targetItem.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 18: Verify that search works for table 1 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            const leftTable = page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Type-Table"]');
            await leftTable.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await expect(page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Type-Table"]')).toBeVisible();

            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_CATEGORY);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(500);
            expect(await firstRow.textContent()).toContain(TEST_CATEGORY);
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
        });
        await allure.step("Step 19: Verify that search works for table 2 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            const leftTable = page.locator('[data-testid="ModalBaseMaterial-TableList-Table-SubType-Table"]');
            await leftTable.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await expect(page.locator('[data-testid="ModalBaseMaterial-TableList-Table-SubType-Table"]')).toBeVisible();

            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_MATERIAL);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(500);
            expect(await firstRow.textContent()).toContain(TEST_MATERIAL);
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
        });
        await allure.step("Step 20: Verify that search works for table 3 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            const leftTable = page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-Table"]');
            await leftTable.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await expect(page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-Table"]')).toBeVisible();

            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_NAME);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(500);
            expect(await firstRow.textContent()).toContain(TEST_NAME);
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
        });
        await allure.step("Step 21: Open Archive dialog (Open Archive dialog)", async () => {
            // to be able to open the archive dialog, we need to add something to archive
            const targetTable = page.locator(`[data-testid="ModalBaseMaterial-TableList-Table-Item-Table"]`);

            // Ensure the table is visible.
            await expect(targetTable).toBeVisible();
            //verify that the table has content
            const rowsCount = await targetTable.locator('tbody tr').count();
            const firstRow = await targetTable.locator('tbody tr').first();
            await firstRow.evaluate((el) => {
                el.style.backgroundColor = 'green';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            firstRow.click();
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const dialogSelector = 'dialog.base-modal.modal-yui-kit[open]';
            const buttonClass = 'button-yui-kit.medium.primary-yui-kit';
            const buttonLabel = 'Добавить';
            let expectedState = true;

            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                const cls = 'button-yui-kit.medium.primary-yui-kit';
                const scopedButtonSelector = `${dialogSelector} button.${cls}`;
                const buttonLocator = page.locator(scopedButtonSelector); // Create Locator

                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });

            const clas = 'button-yui-kit.medium.primary-yui-kit';
            // Reuse the locator for the button
            const buttonLocator = page.locator(`${dialogSelector} button.${clas}`); // Create Locator
            await buttonLocator.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Perform hover and click actions
            //await buttonLocator.hover();

            await buttonLocator.click();
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetButton = firstDataRow.locator('td').nth(3).locator('button');
            await targetButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            //await targetButton.click();
            await page.waitForTimeout(500);
        });
        // await allure.step("Step 22: Check title in Archive dialog (Check title and buttons in Archive dialog)", async () => {
        //     const titles = testData1.elements.CreatePage.modalArchive.titles.map((title) => title.trim());

        //     // Retrieve all H3 titles from the specified class
        //     const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'dialog-ban.dialog-yui-kit.dialog-ban');
        //     const normalizedH3Titles = h3Titles.map((title) => title.trim());

        //     // Wait for the page to stabilize
        //     await page.waitForLoadState("networkidle");
        //     // Log for debugging
        //     console.log('Expected Titles:', titles);
        //     console.log('Received Titles:', h3Titles);

        //     // Validate length
        //     expect(normalizedH3Titles.length).toBe(titles.length);

        //     // Validate content and order
        //     expect(normalizedH3Titles).toEqual(titles);

        //     await page.waitForTimeout(50);
        // });
        // await allure.step("Step 23: Check buttons in Archive dialog (Check title and buttons in Archive dialog)", async () => {
        //     const buttons = testData1.elements.CreatePage.modalArchive.buttons;
        //     // Iterate over each button in the array
        //     for (const button of buttons) {
        //         // Extract the class, label, and state from the button object
        //         const buttonClass = button.class;
        //         const buttonLabel = button.label;
        //         let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean
        //         // Perform the validation for the button
        //         await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        //             // Check if the button is visible and enabled
        //             await page.waitForTimeout(50);
        //             const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState, '.dialog-ban.dialog-yui-kit.dialog-ban');

        //             // Validate the button's visibility and state
        //             expect(isButtonReady).toBeTruthy();
        //             logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        //         });
        //     }
        //     await page.waitForTimeout(5000);
        // });

        await allure.step("Step 24: Open Добавить из базы dialog (Open Добавить из базы dialog)", async () => {
            const button = page.locator('button.button-yui-kit.small.primary-yui-kit.attach-file-component__btn', { hasText: 'Добавить из базы' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            button.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 25: Check title in Добавить из базы dialog (Check title in Добавить из базы dialog)", async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            // Wait for loading
            const titles = testData1.elements.CreatePage.modalAddFromBase.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'modal-files-content');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
            await page.waitForTimeout(500);
        });
        await allure.step("Step 26: Check buttons in Добавить из базы dialog (Check buttons in Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(50);

            const buttons = testData1.elements.CreatePage.modalAddFromBase.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(50);
                    console.log(buttonClass + " " + buttonLabel + " " + expectedState);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState, '.modal-files.right-menu-modal.modal-yui-kit');
                    console.log("Button :" + buttonClass + " " + buttonLabel + " " + expectedState);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 27: Validate switcher above table (Validate switcher above table in Добавить из базы dialog)", async () => {
            // Retrieve the expected switcher labels from the JSON file
            const expectedSwitchers = testData1.elements.CreatePage.modalAddFromBase.switcher;

            // Locate all switcher items on the page
            const switchItems = page.locator('.switch-yui-kit-item');
            const switchItemCount = await switchItems.count();

            // Ensure the number of switch items matches the expected switcher labels
            expect(switchItemCount).toBe(expectedSwitchers.length);
            console.log(`Number of switch items: ${switchItemCount}`);

            // Iterate over each switcher, click it, and validate its label
            for (let i = 0; i < expectedSwitchers.length; i++) {
                const expectedLabel = expectedSwitchers[i].label.trim(); // Get expected label from JSON
                const switchItem = switchItems.nth(i); // Get the nth switch item
                await switchItem.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                // Ensure the switch item is visible
                await expect(switchItem).toBeVisible();

                // Get the text content of the switch item and trim it
                const actualLabel = await switchItem.textContent();
                console.log(`Switch item ${i + 1}: Expected = "${expectedLabel}", Actual = "${actualLabel?.trim()}"`);

                // Compare the actual label with the expected label
                expect(actualLabel?.trim()).toBe(expectedLabel);

                // Click the switch item
                await switchItem.click();

                // Wait briefly to let the UI update after clicking
                await page.waitForTimeout(50);

                console.log(`Clicked on switch item ${i + 1} with label: "${expectedLabel}"`);
            }

            console.log("Switcher validation completed successfully.");
        });

        await allure.step("Step 28: Validate filter table (Validate filter above table in Добавить из базы dialog)", async () => {
            // Retrieve the expected filter labels from the JSON file
            const expectedFilters = testData1.elements.CreatePage.modalAddFromBase.filter;

            // Verify the expectedFilters array is defined and not empty
            if (!expectedFilters || expectedFilters.length === 0) {
                throw new Error("Expected filters are not defined or empty.");
            }

            // Locate the dropdown list and the filter items inside it
            const dropdown = page.locator('.select-list-yui-kit.file-window__dropdown');
            dropdown.click();
            const filterItems = dropdown.locator('ul.select-list-yui-kit__list li.select-list-yui-kit__item');

            // Ensure the dropdown exists and is visible
            await expect(dropdown).toBeVisible();

            // Validate that the number of filter items matches the JSON
            const filterCount = await filterItems.count();
            expect(filterCount).toBe(expectedFilters.length);
            console.log(`Number of filter items: ${filterCount}`);

            // Iterate over each filter and validate its label
            for (let i = 0; i < expectedFilters.length; i++) {
                const filter = expectedFilters[i]; // Get the current filter from the JSON

                if (!filter || !filter.label) {
                    throw new Error(`Filter at index ${i} is not defined or has no label.`);
                }
                const expectedLabel = filter.label.trim(); // Get expected label from JSON
                const filterItem = filterItems.nth(i); // Get the nth filter item
                await filterItem.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                // Ensure the filter item is visible
                await expect(filterItem).toBeVisible();

                // Get the text content of the filter item and trim it
                const actualLabel = await filterItem.textContent();
                console.log(`Filter item ${i + 1}: Expected = "${expectedLabel}", Actual = "${actualLabel?.trim()}"`);

                // Compare the actual label with the expected label
                expect(actualLabel?.trim()).toBe(expectedLabel);

                console.log(`Validated filter item ${i + 1} with label: "${expectedLabel}"`);
            }

            console.log("Filter validation completed successfully.");
        });
        await allure.step("Step 29: Validate table headers in Добавить из базы dialog (Validate table headers in Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve the expected column headers from the JSON file
            const expectedHeaders = testData1.elements.CreatePage.modalAddFromBase.tables;

            // Locate the thead element directly using its unique class
            const tableHead = page.locator('thead.table-yui-kit__thead.table-file-head');
            await tableHead.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the thead element exists and is visible
            await expect(tableHead).toBeVisible();

            // Locate all header elements (th) within the thead tag
            const headerCells = tableHead.locator('tr th');

            // Check that the number of headers matches the JSON
            const headerCount = await headerCells.count();
            expect(headerCount).toBe(expectedHeaders.length);
            console.log(`Number of headers: ${headerCount}`);

            // Iterate over each header and compare its text content with the expected value
            for (let i = 0; i < expectedHeaders.length; i++) {
                const expectedTitle = expectedHeaders[i].title.trim(); // Get expected title from JSON
                const actualHeader = headerCells.nth(i); // Get the nth header cell
                await actualHeader.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                // Ensure the header is visible
                await expect(actualHeader).toBeVisible();

                // Get the text content of the header and trim it
                const actualTitle = await actualHeader.textContent();
                console.log(`Header ${i + 1}: Expected = "${expectedTitle}", Actual = "${actualTitle?.trim()}"`);

                // Compare the actual header text with the expected title
                expect(actualTitle?.trim()).toBe(expectedTitle);
            }

            console.log("Table headers have been validated successfully.");
        });
        await allure.step("Step 30: Verify that search works for the files table (Verify that search works for each column)", async () => {
            // Locate the switch item and highlight it for debugging
            const switchItems = page.locator('.switch-yui-kit-item');
            const switchItem = switchItems.nth(0);
            await switchItem.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await switchItem.click();
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table
            const tableContainer = page.locator('.select_file_table.file-window__table');
            await expect(tableContainer).toBeVisible();

            // Locate the table within the container
            const leftTable = tableContainer.locator('table');
            await expect(leftTable).toBeVisible();

            // Locate the search input field
            const searchField = leftTable.locator('input.search-yui-kit__input');

            // Highlight the search field for debugging
            await searchField.evaluate((input) => {
                input.style.backgroundColor = 'red';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            // Ensure the search field is visible and editable
            await expect(searchField).toBeVisible();
            await searchField.focus(); // Focus on the input field
            await searchField.fill(''); // Clear any existing content

            // Programmatically set the value using JavaScript
            await searchField.evaluate((element, value) => {
                const input = element as HTMLInputElement; // Explicitly cast the element
                input.value = value; // Set the value directly
                const event = new Event('input', { bubbles: true }); // Trigger an input event
                input.dispatchEvent(event); // Dispatch the event to mimic user input
            }, TEST_FILE);

            // Verify that the field contains the correct value
            const fieldValue = await searchField.inputValue();
            console.log("Verified input value:", fieldValue);
            expect(fieldValue).toBe(TEST_FILE);

            // Trigger the search by pressing 'Enter'
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");

            // Locate and highlight the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            // Wait for the first row to be visible and validate its content
            await firstRow.waitFor({ state: 'visible' });
            const rowText = await firstRow.textContent();
            console.log("First row text:", rowText);
            expect(rowText?.trim()).toContain(TEST_FILE);

            console.log("Search verification completed successfully.");
        });
    });
    test.skip("TestCase 02 - создат дитайл", async ({ browser, page }) => {
        test.setTimeout(50000);
        const shortagePage = new CreatePartsDatabasePage(page);
        await allure.step("Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)", async () => {
            shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 02: В поле ввода инпута \"Наименование\" вводим значение переменной. (In the input field \"Name\" we enter the value of the variable)", async () => {
            await page.waitForLoadState("networkidle");
            //            const field = page.locator('div.editor__information-inputs.w-full:has-text("Наименование") input.input-yui-kit__input');
            const field = page.locator('div.editor__information-inputs span:has-text("Наименование") ~ fieldset input.input-yui-kit__input');

            await field.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await field.fill(TEST_DETAIL_NAME);
            await expect(await field.inputValue()).toBe(TEST_DETAIL_NAME);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 03: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetButton = firstDataRow.locator('td').nth(2).locator('button');
            await targetButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await targetButton.click();
        });
        await allure.step("Step 04: Verify that search works for table 3 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            const leftTable = page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-Table"]');
            await leftTable.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await expect(page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-Table"]')).toBeVisible();

            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_NAME);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(1000);
            expect(await firstRow.textContent()).toContain(TEST_NAME);
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
            firstRow.click();
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'green'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(500);

        });
        await allure.step("Step 05: Add the found Item (Add the found Item)", async () => {
            await page.waitForLoadState("networkidle");

            const addButton = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Добавить' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
        });
        await allure.step("Step 06: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await targetSpan.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            expect(await targetSpan.innerText()).toBe(TEST_NAME);
        });
        await allure.step("Step 07: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await targetSpan.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            expect(await targetSpan.innerText()).toBe(TEST_NAME);
        });
        await allure.step("Step 08: Вводим значение переменной в обязательное поле в строке \"Длина (Д)\" в таблице \"Характеристики заготовки\" (Enter the variable value in the required field in the \"Длина (Д)\" row in the \"Характеристики заготовки\" table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('div.editor__specification-characteristic__table:has(h3:has-text("Характеристики заготовки"))');
            await tableContainer.waitFor({ state: 'visible' });
            const tableBody = tableContainer.locator('tbody');
            const targetRow = tableBody.locator('tr').filter({
                has: page.locator('td:first-child:has-text("Длина (Д)")'),
            });
            await expect(targetRow).toBeVisible();
            // Locate the 3rd td in the target row
            const targetCell = targetRow.locator('td').nth(2); // Index starts at 2 for the 3rd <td>

            // Locate the input field within the fieldset inside the cell
            const inputField = targetCell.locator('fieldset input.input-yui-kit__input');

            // Highlight the input field for debugging (optional)
            await inputField.evaluate((input) => {
                input.style.backgroundColor = 'yellow';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });
            // Set the desired value
            const desiredValue = '999'; // Replace this with your intended value
            await inputField.evaluate((input, value) => {
                (input as HTMLInputElement).value = value; // Set the value directly
                const event = new Event('input', { bubbles: true }); // Trigger an input event
                input.dispatchEvent(event); // Dispatch the event to mimic user input
            }, desiredValue);

            console.log(`Set the value "${desiredValue}" in the input field.`);

            // Optionally, verify the value
            const currentValue = await inputField.inputValue();
            console.log("Verified input value:", currentValue);
            expect(currentValue).toBe(desiredValue);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 09: Upload files using drag-and-drop functionality", async () => {
            // Locate the hidden file input element
            const fileInput = page.locator('input#docsFileSelected');

            // Set the files to be uploaded
            await fileInput.setInputFiles([
                'testdata/Test_imagexx_1.jpg', // Replace with your actual file paths
                'testdata/Test_imagexx_2.png',
            ]);
            // await fileInput.setInputFiles([
            //     'testdata/1.3.1.1 Клапан М6х10.jpg__+__92d7aeee-893c-4140-8611-9019ea4d63ff.jpg', // Replace with your actual file paths
            //     'testdata/1.3.1.1 Клапан М6х10.PNG__+__c3a2fced-9b03-461b-a596-ef3808d8a475.png',
            // ]);
            // Verify the files were successfully uploaded
            const uploadedFiles = await fileInput.evaluate((element) => {
                const input = element as HTMLInputElement; // Explicitly cast the element as HTMLInputElement
                return input.files?.length || 0; // Return the number of files uploaded
            });
            console.log(`Number of files uploaded: ${uploadedFiles}`);
            expect(uploadedFiles).toBe(2); // Ensure 2 files were uploaded

            // Optional: Wait for visual or backend updates
            await page.waitForLoadState('networkidle');

            console.log("Files successfully uploaded via the hidden input.");
            //await page.waitForTimeout(5000);
        });
        await allure.step("Step 10: Проверяем, что в модальном окне отображаются заголовки(check the headers in the dialog)", async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            // Wait for loading
            const titles = testData1.elements.CreatePage.modalAddDocuments.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'basefile__modal.modal-yui-kit');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            logger.info('Expected Titles:', titles);
            logger.info('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);

            const titlesh4 = testData1.elements.CreatePage.modalAddDocuments.titlesh4.map((title) => title.trim());
            const h4Titles = await shortagePage.getAllH4TitlesInModalClass(page, 'modal-yui-kit__modal-content');
            const normalizedH4Titles = h4Titles.map((title) => title.trim());

            logger.info('Expected Titles:', titlesh4);
            logger.info('Received Titles:', normalizedH4Titles);
            await page.waitForTimeout(50);
            // Validate length
            expect(normalizedH4Titles.length).toBe(titlesh4.length);

            // Validate content and order
            expect(normalizedH4Titles).toEqual(titlesh4);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 11: Ensure the textarea is present and writable", async () => {
            await page.waitForLoadState('networkidle');
            const section = page.locator('.basefile__modal-section');
            await section.waitFor({ state: 'attached', timeout: 5000 });
            const sectionX = await section.locator('.basefile__modal-file').first();
            const sectionY = await section.locator('.basefile__modal-file').nth(1);

            //checking first file field
            let inputs = sectionX.locator('div.basefile__modal-inputs');
            let fieldset = inputs.locator('fieldset.input-yui-kit.default.initial');
            // Locate the textarea inside the fieldset
            let textarea = fieldset.locator('textarea.input-yui-kit__input');
            await textarea.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the textarea is visible
            await expect(textarea).toBeVisible({ timeout: 5000 });
            console.log("Textarea is visible.");

            // Focus on the textarea to verify it is writable
            await textarea.focus();
            console.log("Textarea is focused.");

            // Type text into the textarea
            let testValue = "Test note";
            await textarea.fill(testValue);
            console.log(`Value entered into textarea: ${testValue}`);

            // Verify the entered value
            let currentValue = await textarea.inputValue();
            console.log(`Textarea current value: ${currentValue}`);
            expect(currentValue).toBe(testValue);
            //end first file field
            //checking second file field
            inputs = sectionY.locator('div.basefile__modal-inputs');
            fieldset = inputs.locator('fieldset.input-yui-kit.default.initial');
            // Locate the textarea inside the fieldset
            textarea = fieldset.locator('textarea.input-yui-kit__input');
            await textarea.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the textarea is visible
            await expect(textarea).toBeVisible({ timeout: 5000 });
            console.log("Textarea is visible.");

            // Focus on the textarea to verify it is writable
            await textarea.focus();
            console.log("Textarea is focused.");

            // Type text into the textarea
            testValue = "Test note";
            await textarea.fill(testValue);
            console.log(`Value entered into textarea: ${testValue}`);

            // Verify the entered value
            currentValue = await textarea.inputValue();
            console.log(`Textarea current value: ${currentValue}`);
            expect(currentValue).toBe(testValue);
            //end second file field        
            await page.waitForTimeout(50);
        });
        await allure.step("Step 12: Check buttons in dialog (Check buttons in dialog)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(50);

            const buttons = testData1.elements.CreatePage.modalAddDocuments.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                let expectedState = button.state === "true" ? true : false; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(50);
                    console.log(buttonClass + " " + buttonLabel + " " + expectedState);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState, '.basefile__modal.modal-yui-kit');
                    console.log("Button :" + buttonClass + " " + buttonLabel + " " + expectedState);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 13: Проверяем, что в модальном окне есть не отмеченный чекбокс в строке \"Главный:\" (Check that the checkbox is not selected in the MAIN row)", async () => {
            await page.waitForLoadState('networkidle');
            const section = page.locator('.basefile__modal-section');
            await section.waitFor({ state: 'attached', timeout: 5000 });
            const sectionX = await section.locator('.basefile__modal-file').first();
            const sectionY = await section.locator('.basefile__modal-file').nth(1);

            //checking first file field
            const row = sectionX.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Главный:")'),
            });

            // Ensure the row is visible
            await expect(row).toBeVisible();

            console.log("Row containing label 'Главный:' is visible.");

            // Locate the checkbox in the second column of the row
            const checkbox = row.locator('input[type="checkbox"]');
            await checkbox.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the checkbox is visible
            await expect(checkbox).toBeVisible();
            console.log("Checkbox in 'Главный:' row is visible.");

            // Confirm that the checkbox is not selected
            const isChecked = await checkbox.isChecked();
            console.log(`Checkbox state: ${isChecked ? "Checked" : "Not Checked"}`);
            expect(isChecked).toBeFalsy();
            // end checking the firsrt file field
            //start checking the second file field.
            const row2 = sectionY.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Главный:")'),
            });

            // Ensure the row is visible
            await expect(row2).toBeVisible();

            console.log("Row containing label 'Главный:' is visible.");

            // Locate the checkbox in the second column of the row
            const checkbox2 = row2.locator('input[type="checkbox"]');
            await checkbox2.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the checkbox is visible
            await expect(checkbox2).toBeVisible();
            console.log("Checkbox in 'Главный:' row is visible.");

            // Confirm that the checkbox is not selected
            const isChecked2 = await checkbox2.isChecked();
            console.log(`Checkbox state: ${isChecked2 ? "Checked" : "Not Checked"}`);
            expect(isChecked2).toBeFalsy();
            await page.waitForTimeout(50);
        });
        await allure.step("Step 14: Чек чекбокс в строке \"Главный:\" (Check the checkbox in the \"Главный:\" row)", async () => {
            await page.waitForLoadState('networkidle');
            const section = page.locator('.basefile__modal-section');
            await section.waitFor({ state: 'attached', timeout: 5000 });
            const sectionX = await section.locator('.basefile__modal-file').first();
            const sectionY = await section.locator('.basefile__modal-file').nth(1);

            //checking first file field
            const row = sectionX.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Главный:")'),
            });

            // Ensure the row is visible
            await expect(row).toBeVisible();

            console.log("Row containing label 'Главный:' is visible.");

            // Locate the checkbox in the second column of the row
            const checkbox = row.locator('input[type="checkbox"]');
            await checkbox.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the checkbox is visible
            await expect(checkbox).toBeVisible();
            console.log("Checkbox in 'Главный:' row is visible.");
            await checkbox.check();
            // Confirm that the checkbox is not selected
            const isChecked = await checkbox.isChecked();
            console.log(`Checkbox state: ${isChecked ? "Checked" : "Not Checked"}`);
            expect(isChecked).toBeTruthy();
            // end checking the firsrt file field
            //start checking the second file field.
            const row2 = sectionY.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Главный:")'),
            });

            // Ensure the row is visible
            await expect(row2).toBeVisible();

            console.log("Row containing label 'Главный:' is visible.");

            // Locate the checkbox in the second column of the row
            const checkbox2 = row2.locator('input[type="checkbox"]');
            await checkbox2.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Ensure the checkbox is visible
            await expect(checkbox2).toBeVisible();
            console.log("Checkbox in 'Главный:' row is visible.");
            await checkbox2.check();
            // Confirm that the checkbox is not selected
            const isChecked2 = await checkbox2.isChecked();
            console.log(`Checkbox state: ${isChecked2 ? "Checked" : "Not Checked"}`);
            expect(isChecked2).toBeTruthy();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 15: Проверяем, that in the file field is the name of the file uploaded without its file extension", async () => {
            await page.waitForLoadState('networkidle');
            const section = page.locator('.basefile__modal-section');
            await section.waitFor({ state: 'attached', timeout: 5000 });
            console.log("Dynamic content in modal section loaded.");

            // File names uploaded
            //const uploadedFiles = ["Test_imagexx_1.jpg", "Test_imagexx_2.png"];
            const uploadedFiles = baseFileNamesToVerify.map(file => `${file.name}${file.extension}`);

            // First File: Check the 'Файл' field
            const sectionX = await section.locator('.basefile__modal-file').first();
            const rowX = sectionX.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Файл:")'),
            });

            // Ensure the row is visible
            await expect(rowX).toBeVisible();
            console.log("Row for first file containing label 'Файл:' is visible.");

            // Locate the input field in the second column of the row
            const inputX = rowX.locator('input[type="text"]');
            await expect(inputX).toBeVisible();
            console.log("Input field for first file is visible.");

            // Extract filename without extension and verify
            const filenameX = uploadedFiles[0].split('.')[0];
            const inputValueX = await inputX.inputValue();
            console.log(`Expected filename: ${filenameX}, Actual input value: ${inputValueX}`);
            expect(inputValueX).toBe(filenameX);

            // Highlight for debugging
            await inputX.evaluate((element) => {
                element.style.backgroundColor = 'green';
                element.style.border = '2px solid red';
                element.style.color = 'blue';
            });

            // Second File: Check the 'Файл' field
            const sectionY = await section.locator('.basefile__modal-file').nth(1);
            const rowY = sectionY.locator('.basefile__modal-inputs__span').filter({
                has: page.locator('label.basefile__modal-inputs__label:has-text("Файл:")'),
            });

            // Ensure the row is visible
            await expect(rowY).toBeVisible();
            console.log("Row for second file containing label 'Файл:' is visible.");

            // Locate the input field in the second column of the row
            const inputY = rowY.locator('input[type="text"]');
            await expect(inputY).toBeVisible();
            console.log("Input field for second file is visible.");

            // Extract filename without extension and verify
            const filenameY = uploadedFiles[1].split('.')[0];
            const inputValueY = await inputY.inputValue();
            console.log(`Expected filename: ${filenameY}, Actual input value: ${inputValueY}`);
            expect(inputValueY).toBe(filenameY);

            // Highlight for debugging
            await inputY.evaluate((element) => {
                element.style.backgroundColor = 'green';
                element.style.border = '2px solid red';
                element.style.color = 'blue';
            });

            console.log("Both file fields validated successfully.");
            await page.waitForTimeout(100);
        });
        await allure.step("Step 16: Click the Загрузить все файлы button and confirm modal closure", async () => {
            console.log("Starting file upload process...");

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate the upload button
            const uploadButton = page.locator('button.button-yui-kit.medium.primary-yui-kit.upload-btn', { hasText: 'Загрузить все файлы' });
            const modalLocator = page.locator('.modal-yui-kit__modal-content'); // Replace with actual modal class/ID
            console.log("Upload button and modal located.");

            const maxRetries = 5;
            let retryCounter = 0;

            while (retryCounter <= maxRetries) {
                // Check if modal exists in the DOM
                const modalCount = await modalLocator.count();
                if (modalCount === 0) {
                    console.log("Modal is no longer present in the DOM. Upload succeeded!");
                    break; // Exit the loop when the modal is gone
                }

                console.log(`Attempt ${retryCounter + 1}: Clicking upload button.`);

                // Change button color for debugging
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                await uploadButton.evaluate((button, color) => {
                    button.style.backgroundColor = color;
                    button.style.borderColor = color;
                }, randomColor);
                console.log(`Button color changed to ${randomColor}.`);

                // Click the upload button
                await uploadButton.click();
                console.log("Upload button clicked.");

                // Wait for notifications
                await page.waitForTimeout(500);

                // Check modal visibility again after the button click
                if ((await modalLocator.count()) === 0) {
                    console.log("Modal closed after button click. Upload succeeded!");
                    break;
                }

                // Check for notifications
                const notification = await shortagePage.extractNotificationMessage(page);

                if (notification?.message === "Файл с таким именем уже существует") {
                    console.log("Duplicate filename detected. Updating all filenames.");
                    retryCounter++;

                    const sectionsCount = await page.locator('.basefile__modal-file').count();
                    console.log(`Found ${sectionsCount} file sections to update filenames.`);

                    for (let i = 0; i < sectionsCount; i++) {
                        // Check if modal still exists before proceeding with the loop
                        if ((await modalLocator.count()) === 0) {
                            console.log("Modal closed during filename updates. Exiting loop.");
                            break;
                        }

                        const fileInput = page.locator('.basefile__modal-file').nth(i).locator('input[type="text"]');

                        try {
                            // Check if field is visible before interaction
                            if (!(await fileInput.isVisible())) {
                                console.log(`Input field in section ${i + 1} is no longer visible. Skipping...`);
                                continue;
                            }

                            console.log(`Updating filename for section ${i + 1}.`);

                            const currentValue = await fileInput.inputValue();
                            await fileInput.fill('');
                            await fileInput.press('Enter');
                            await page.waitForTimeout(500);

                            const updatedValue = `${currentValue}_${Math.random().toString(36).substring(2, 6)}`;
                            await fileInput.fill(updatedValue);

                            await fileInput.evaluate((input) => {
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            });

                            console.log(`Filename updated to "${updatedValue}" for section ${i + 1}.`);
                        } catch (error) {
                            console.log(`Error updating filename for section ${i + 1}. Skipping...`);
                            break;
                        }
                    }
                } else if (notification) {
                    console.log(`Unexpected notification: ${notification.message}`);
                    break; // Exit on unexpected notifications
                } else {
                    console.log("No notification detected. Assuming upload succeeded.");
                }

                console.log("Waiting before retrying...");
                await page.waitForTimeout(500);
            }

            if (retryCounter >= maxRetries) {
                throw new Error(`Failed to upload files after ${maxRetries} retries.`);
            }

            console.log("File upload process completed successfully.");
        });
        await allure.step("Step 17: Verify uploaded file names with wildcard matching and extension validation", async () => {
            console.log("Starting file verification process...");
            await page.waitForLoadState("networkidle");
            // Locate the parent section for the specific table
            const parentSection = page.locator('section.attach-file-component');
            console.log("Located parent section for the file table.");

            // Locate the table rows within the scoped section
            const tableRows = parentSection.locator('.table-yui-kit__tr'); // Only rows inside the specific section

            for (const { name, extension } of baseFileNamesToVerify) {
                console.log(`Verifying presence of file with base name: ${name} and extension: ${extension}`);

                // Locate rows where the second column contains the base name
                const matchingRows = await tableRows.locator(`.table-yui-kit__td:nth-child(2):has-text("${name}")`);
                await matchingRows.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                const rowCount = await matchingRows.count();

                if (rowCount > 0) {
                    console.log(`Found ${rowCount} rows matching base name "${name}".`);
                    let extensionMatch = false;

                    for (let i = 0; i < rowCount; i++) {
                        const rowText = await matchingRows.nth(i).textContent();
                        console.log(`Row ${i + 1}: ${rowText}`);

                        // Check if the row text contains the expected extension
                        if (rowText && rowText.includes(extension)) {
                            console.log(`File "${name}" with extension "${extension}" is present.`);
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

            console.log("File verification process completed successfully.");
        });
        await allure.step("Step 18: Open Добавить из базы dialog (Open Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");
            const button = page.locator('button.button-yui-kit.small.primary-yui-kit.attach-file-component__btn', { hasText: 'Добавить из базы' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(500);
            button.click();
            // await page.waitForTimeout(5000);
        });
        await allure.step("Step 19: Verify that search works for the files table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            // Locate the switch item and highlight it for debugging
            const switchItems = page.locator('.switch-yui-kit-item');
            const switchItem = switchItems.nth(0);
            await switchItem.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await switchItem.click();
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table
            const tableContainer = page.locator('.select_file_table.file-window__table');
            await expect(tableContainer).toBeVisible();

            // Locate the table within the container
            const leftTable = tableContainer.locator('table');
            await expect(leftTable).toBeVisible();

            // Locate the search input field
            const searchField = leftTable.locator('input.search-yui-kit__input');

            // Highlight the search field for debugging
            await searchField.evaluate((input) => {
                input.style.backgroundColor = 'red';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            // Ensure the search field is visible and editable
            await expect(searchField).toBeVisible();
            await page.waitForTimeout(500);
            await searchField.focus(); // Focus on the input field
            await searchField.fill(''); // Clear any existing content

            // Programmatically set the value using JavaScript
            await searchField.evaluate((element, value) => {
                const input = element as HTMLInputElement; // Explicitly cast the element
                input.value = value; // Set the value directly
                const event = new Event('input', { bubbles: true }); // Trigger an input event
                input.dispatchEvent(event); // Dispatch the event to mimic user input
            }, TEST_FILE);

            // Verify that the field contains the correct value
            const fieldValue = await searchField.inputValue();
            console.log("Verified input value:", fieldValue);
            expect(fieldValue).toBe(TEST_FILE);

            // Trigger the search by pressing 'Enter'
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");

            // Locate and highlight the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            // Wait for the first row to be visible and validate its content
            await firstRow.waitFor({ state: 'visible' });
            const rowText = await firstRow.textContent();
            console.log("First row text:", rowText);
            expect(rowText?.trim()).toContain(TEST_FILE);

            console.log("Search verification completed successfully.");
        });
        let selectedFileType: string = '';
        let selectedFileName: string = '';
        await allure.step("Step 20: Add the file to the attach list in bottom table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table
            const tableContainer = page.locator('.select_file_table.file-window__table');
            const firstRow = tableContainer.locator('tbody tr:first-child');
            let fileType: string = '';
            selectedFileType = (await firstRow.locator('td').nth(2).textContent()) ?? '';
            selectedFileName = (await firstRow.locator('td').nth(3).textContent()) ?? '';

            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.add_button', { hasText: 'Добавить' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(100);
            const isButtonReady = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit.add_button', 'Добавить', false);
            expect(isButtonReady).toBeTruthy();
            firstRow.click();
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(500);
            const isButtonReady2 = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit.add_button', 'Добавить', true);
            expect(isButtonReady2).toBeTruthy();
            addButton.click();
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            //await page.waitForTimeout(5000);
        });
        await allure.step("Step 21: Confirm the file is listed in the bottom table", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            const selectedPartNumber = TEST_FILE; // Replace with actual part number

            const bottomTableLocator = page.locator('[data-testid="table-bottom"]'); // Adjust 'xxxxx' as per actual table id
            await bottomTableLocator.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;
            console.log(rowCount);
            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Extract the partNumber from the input field in the first cell
                const tableFileType = await row.locator('td').nth(1).textContent();
                const tableFileTypeCell = await row.locator('td').nth(1);
                const tableFileName = await row.locator('td').nth(2).textContent();
                const tableFileNameCell = await row.locator('td').nth(2);

                console.log(`Row ${i + 1}: FileType=${tableFileType?.trim()}, FileName=${tableFileName?.trim()}`);

                // Compare the extracted values
                if (tableFileType?.trim() === selectedFileType) {
                    isRowFound = true;
                    await tableFileTypeCell.evaluate((row) => {
                        row.style.backgroundColor = 'black';
                        row.style.border = '2px solid red';
                        row.style.color = 'white';
                    });
                }
                if (tableFileName?.trim() === selectedFileName) {
                    isRowFound = true;
                    await tableFileNameCell.evaluate((row) => {
                        row.style.backgroundColor = 'black';
                        row.style.border = '2px solid red';
                        row.style.color = 'white';
                    });
                    console.log(`Selected row found in row ${i + 1}`);
                }
            }
            expect(isRowFound).toBeTruthy();
            await page.waitForTimeout(5000);
        });
        await allure.step("Step 22: Click bottom Add button", async () => {
            await page.waitForLoadState("networkidle");

            const addButton = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Добавить' }).last();
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            await page.waitForTimeout(500);
            addButton.click();

        });
        await allure.step("Step 23: Highlight the row containing the selected file name", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent section for the specific table
            const parentSection = page.locator('section.attach-file-component');
            console.log("Located parent section for the file table.");

            // Locate all visible table rows within the scoped section
            const tableRows = parentSection.locator('tbody .table-yui-kit__tr');
            const rowCount = await tableRows.count();

            console.log(`Found ${rowCount} rows in the table.`);

            let fileFound = false;

            for (let i = 0; i < rowCount; i++) {
                const row = tableRows.nth(i);
                const rowHtml = await row.evaluate((rowElement) => rowElement.outerHTML);
                //console.log(`Row ${i + 1} HTML: ${rowHtml}`);
                const fileNameCell = row.locator('.table-yui-kit__td:nth-child(2)');
                await fileNameCell.waitFor({ state: 'visible' });
                const fileNameText = await fileNameCell.textContent();

                console.log(`Row ${i + 1}: ${fileNameText}`);

                // Check if the current row contains the selected file name
                if (fileNameText?.trim() === selectedFileName) { // Match exact name
                    console.log(`Selected file name "${selectedFileName}" found in row ${i + 1}. Highlighting...`);
                    await fileNameCell.evaluate((rowElement) => {
                        rowElement.style.backgroundColor = 'yellow';
                        rowElement.style.border = '2px solid red';
                        rowElement.style.color = 'blue';
                    });
                    fileFound = true;
                    break; // Exit the loop once the file is found and highlighted
                }
            }

            if (!fileFound) {
                throw new Error(`Selected file name "${selectedFileName}" was not found in the table.`);
            }
            await page.waitForTimeout(50);
            console.log("File search and highlight process completed successfully.");
        });
        await allure.step("Step 24: Удалите первый файл из списка медиафайлов.(Remove the first file from the list of attached media files.)", async () => {
            await page.waitForLoadState("networkidle");
            let printButton = page.locator('button.button-yui-kit.small.disabled-yui-kit.primary-yui-kit', { hasText: 'Печать' });
            await printButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'yellow';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            let isPrintButtonReady = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit', 'Печать', false);
            let deleteButton = page.locator('button.button-yui-kit.small.disabled-yui-kit.primary-yui-kit', { hasText: 'Удалить' });
            await deleteButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'yellow';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            let isDeleteButtonReady = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit', 'Удалить', false);
            expect(isPrintButtonReady).toBeTruthy();
            expect(isDeleteButtonReady).toBeTruthy();
            // Locate the parent section for the specific table
            const parentSection = page.locator('section.attach-file-component');
            console.log("Located parent section for the file tableXXX.");

            // Locate all visible table rows within the scoped section
            const tableRows = parentSection.locator('tbody .table-yui-kit__tr');
            const row = tableRows.first();

            // Refine the locator to target the checkbox input inside the third column
            const checkboxInput = row.locator('.table-yui-kit__td:nth-child(3) input[type="checkbox"]');
            await checkboxInput.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            await checkboxInput.waitFor({ state: 'visible' });

            // Check the checkbox
            await checkboxInput.check();
            await page.waitForTimeout(100);
            printButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Печать' });
            isPrintButtonReady = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit', 'Печать', true);
            deleteButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Удалить' });
            isDeleteButtonReady = await shortagePage.isButtonVisible(page, 'button.button-yui-kit.small.primary-yui-kit', 'Удалить', true);
            expect(isPrintButtonReady).toBeTruthy();
            expect(isDeleteButtonReady).toBeTruthy();
            // Assert that the checkbox is checked
            expect(await checkboxInput.isChecked()).toBeTruthy();

            //delete row
            deleteButton.click();
            await deleteButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            await page.waitForTimeout(5000);
        });

        await allure.step("Step 25: Save the detail", async () => {
            const saveButton = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
            await saveButton.evaluate((rowElement) => {
                rowElement.style.backgroundColor = 'green';
                rowElement.style.border = '2px solid red';
                rowElement.style.color = 'blue';
            });
            await page.waitForTimeout(50);
            saveButton.click();
            await page.waitForTimeout(5000);

        });

    });
}
