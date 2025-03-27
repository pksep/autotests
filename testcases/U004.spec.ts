import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data

let tableData1: { groupName: string; items: string[][] }[] = [];
let tableData2: { groupName: string; items: string[][] }[] = [];
let tableData3: { groupName: string; items: string[][] }[] = [];

const LEFT_DATA_TABLE = "table1-product";
const TEST_PRODUCT = '109.02-00СБ';
const EDIT_BUTTON = '';
const TEST_PRODUCT_СБ = '1.3.3.1С';
export const runU004 = () => {
    console.log(`Starting test U004`);


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

    test.skip("TestCase 01 - Редактирование изделия - добавление потомка (СБ) (Editing a product - adding a descendant (СБ))", async ({ browser, page }) => {
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(500);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 02: Проверяем наличия заголовка на странице \"База деталей\" (Check for the presence of the title on the 'Parts Database' page)", async () => {
            // Wait for loading
            const titles = testData1.elements.MainPage.titles.map((title) => title.trim());

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
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0);
        });
        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 05: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

        });
        await allure.step("Step 06: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(leftTable.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT);
        });
        await allure.step("Step 07: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 08: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for the page to become idle (ensuring data loading is complete)
            await page.waitForLoadState("networkidle");
            // Assert that the table body has rows
            await page.waitForTimeout(500);
            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0); // Asserts that the row count is greater than 1
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
            expect(firstCellValue).toContain(TEST_PRODUCT); // Validate that the value matches the search term
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
        });
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });

        await allure.step("Step 11: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Wait for the row to become visible
            await firstRow.waitFor({ state: 'visible' });
            await page.waitForTimeout(500);

            const buttons = testData1.elements.MainPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 12: Нажимаем по данной кнопке. (Press the button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            await editButton.click();
            // Debugging pause to verify visually in the browser
            await page.waitForTimeout(500);
        });

        await allure.step("Step 13: Проверяем заголовки страницы: (Validate the page headers)", async () => {
            // Expected titles in the correct order
            const titles = testData1.elements.EditPage.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInClass(page, 'editor');
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
        await allure.step("Step 14: Проверяем наличие кнопок на странице (Check for the visibility of action buttons on the page)", async () => {
            await page.waitForLoadState("networkidle");
            const buttons = testData1.elements.EditPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 15: Проверяем, что в инпуте наименования совпадает со значением переменной, по которой мы осуществляли поиск данного изделия (We check that the name in the input matches the value of the variable by which we searched for this product.)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate all input fields with the specified class
            const inputFields = page.locator('.input-yui-kit.initial.editor__information-input input.input-yui-kit__input');

            // Get the value of the first input field
            const firstInputValue = await inputFields.nth(0).inputValue();

            expect(firstInputValue).toBe(secondCellValue);
            console.log(`Value in first input field: ${firstInputValue}`);

            // Get the value of the second input field
            const secondInputValue = await inputFields.nth(1).inputValue();
            expect(secondInputValue).toBe(firstCellValue);
            console.log(`Value in second input field: ${secondInputValue}`);
            // Get the value of the third input field

            const thirdInputValue = await inputFields.nth(2).inputValue();
            expect(thirdInputValue).toBe(thirdCellValue);
            console.log(`Value in third input field: ${thirdInputValue}`);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 16: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (under the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            addButton.hover();
            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 17: Проверяем, что в списке есть селекторы с названиями. (Check that the list contains selectors with names)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const buttons = testData1.elements.EditPage.modalAddButtonsPopup;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 18: Нажимаем по селектору из выпадающего списке \"Сборочную единицу (тип СБ)\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Сборочную единицу' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            addButton.hover();
            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 19: Проверяем, что в модальном окне отображается заголовок \"База сборочных единиц\". (We check that the modal window displays the title \"Assembly Unit Database\")", async () => {
            // Expected titles in the correct order
            const titles = testData1.elements.EditPage.modalAddСБ.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'modal-yui-kit__modal-content');
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
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 20: Проверяем наличие кнопок на странице  (Check for the visibility of action buttons on the page)", async () => {
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.EditPage.modalAddСБ.buttons;
            const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]'; // Scoped dialog selector

            for (const button of buttons) {
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true"; // Convert state string to boolean

                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Create the full string selector for the button inside the dialog
                    const scopedButtonSelector = `${dialogSelector} button.${buttonClass}`;

                    // Pass the string selector into isButtonVisible
                    const isButtonReady = await shortagePage.isButtonVisible(
                        page,
                        scopedButtonSelector, // Pass the string selector
                        buttonLabel,
                        expectedState
                    );
                    await page.waitForTimeout(500);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        let table1Locator: Locator | null = null;
        let table2Locator: Locator | null = null;
        await allure.step("Step 21: Проверяем, что в модальном окне есть две таблицы. (We check that there are two tables in the modal window.)", async () => {
            // Wait for the page to stabilize (network requests to complete)
            await page.waitForLoadState("networkidle");

            // Define locators for the two tables within the modal
            table1Locator = page.locator('[data-testid="table1-product"]');
            table2Locator = page.locator('[data-testid="table1-cbed"]'); // Adjust the selector as needed for the second table

            // Assert that both tables are visible
            await expect(table1Locator).toBeVisible();
            await expect(table2Locator).toBeVisible();
        });

        await allure.step("Step 22: Проверяем, что тела таблиц отображаются. (Check that table bodies are displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            if (table1Locator) {
                const rowCount1 = await table1Locator.locator('tbody tr').count();
                expect(rowCount1).toBeGreaterThan(0);
            } else {
                throw new Error("table1Locator is null");
            }

            if (table2Locator) {
                const rowCount2 = await table2Locator.locator('tbody tr').count();
                expect(rowCount2).toBeGreaterThan(0);
            } else {
                throw new Error("table2Locator is null");
            }
        });

        await allure.step("Step 23: Проверяем, что кнопка \"Добавить\" отображается в модальном окне активный.", async () => {
            await page.waitForLoadState("networkidle");

            const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
            const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
            const buttonLabel = 'Выбрать';
            let expectedState = false;

            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                const scopedButtonSelector = `${dialogSelector} button.${buttonClass}`;
                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });

            await allure.step(`Select the first item in the second table`, async () => {
                const firstRowLocator = table2Locator!.locator('tbody tr').nth(0);
                await firstRowLocator.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await firstRowLocator.hover();
                await firstRowLocator.click();
            });
            expectedState = true;
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                const cls = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button'
                const scopedButtonSelector = `${dialogSelector} button.${cls}`;
                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
        });

        await allure.step("Step 24: Проверяем, что поиск во второй таблицы модального окна отображается. (Check that the search in the second table of the modal window is displayed.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Check for the presence of the input tag with the specific class inside the table
            const inputLocator = table2Locator!.locator('input.search-yui-kit__input');
            await inputLocator.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            const isInputPresent = await inputLocator.isVisible();

            // Assert that the input is visible
            expect(isInputPresent).toBeTruthy();
        });
        await allure.step("Step 25: Вводим значение переменной в поиск таблицы второй таблицы модального окна. (We enter the value of the variable in the table search of the second table of the modal window.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await table2Locator!.locator('input.search-yui-kit__input').fill(TEST_PRODUCT_СБ);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible
        });
        await allure.step("Step 26: Проверяем, что в поиске второй таблицы модального окна введенное значение совпадает с переменной. (We check that in the search of the second table of the modal window the entered value matches the variable.)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT_СБ);
        });
        await allure.step("Step 27: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 28: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for the page to become idle (ensuring data loading is complete)
            await page.waitForLoadState("networkidle");
            // Assert that the table body has rows
            await page.waitForTimeout(1000);
            const rowCount = await table2Locator!.locator('tbody tr').count();

            expect(rowCount).toBeGreaterThan(0); // Asserts that the row count is greater than 1
        });
        let firstCell: Locator | null = null;
        await allure.step("Step 29: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Get the value of the first cell in the first row
            firstCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
            firstCell = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)');
            await firstCell.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            firstCellValue = firstCellValue.trim();
            // Get the value of the second cell in the first row
            secondCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(2)').innerText();
            const secondCell = await table2Locator!.locator('tbody tr:first-child td:nth-child(2)');
            await secondCell.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            secondCellValue = secondCellValue.trim();
            // Confirm that the first cell contains the search term
            expect(firstCellValue).toContain(TEST_PRODUCT_СБ);
        });

        await allure.step("Step 30: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await firstCell!.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            firstCell!.hover();
            firstCell!.click();

        });
        await allure.step("Step 31: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
            const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
            const buttonLabel = 'Выбрать';
            let expectedState = true;

            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                const cls = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
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

            const clas = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
            // Reuse the locator for the button
            const buttonLocator = page.locator(`${dialogSelector} button.${clas}`); // Create Locator
            await buttonLocator.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Perform hover and click actions
            await buttonLocator.hover();
            await buttonLocator.click();
            await page.waitForTimeout(5000);
        });
        await allure.step("Step 32: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = firstCellValue; // Replace with actual part number
            const selectedPartName = secondCellValue; // Replace with actual part name

            // Locate the bottom table
            const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id

            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;

            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Extract the partNumber from the input field in the first cell
                const partNumber = await row.locator('td').nth(0).locator('input.input-yui-kit__input').inputValue();
                const partNumberCell = await row.locator('td').nth(0).locator('input.input-yui-kit__input');
                // Extract the partName from the second cell (assuming it's direct text)
                const partName = await row.locator('td').nth(1).textContent();

                console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
                    isRowFound = true;
                    await partNumberCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    console.log(`Selected row found in row ${i + 1}`);
                    break;
                }
            }

            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();
            logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
        });
        await allure.step("Step 33: Нажимаем по кнопке \"Добавить выбранное\" в модальном окне (Click on the \"Добавить выбранное\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
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
            await buttonLocator.hover();
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });
        //let tableData1: { groupName: string; items: string[][] }[] = [];
        await allure.step("Step 34: Перебираем и сохраняем в массивы А1 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData1 = await shortagePage.parseStructuredTable(page, 'table1-XXXXX');
            // Example assertion
            expect(tableData1.length).toBeGreaterThan(0); // Ensure groups are present
        });
        await allure.step("Step 35: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            button.hover();
            button.click();
        });
        //let tableData2: { groupName: string; items: string[][] }[] = [];
        await allure.step("Step 36: Перебираем и сохраняем в массивы A2 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData2 = await shortagePage.parseStructuredTable(page, 'table1-XXXXX');
            // Example assertion
            expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
        });
        await allure.step("Step 37: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            logger.info(`Are tableData1 and tableData2 identical? ${identical}`);
            expect(identical).toBe(true); // Assertion
        });
    });
    test("TestCase 02 - повторно откройте деталь, чтобы убедиться, что она сохранена правильно. (повторно откройте деталь, чтобы убедиться, что она сохранена правильно.)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            await page.waitForTimeout(500);
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(500);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 02: Проверяем наличия заголовка на странице \"База деталей\" (Check for the presence of the title on the 'Parts Database' page)", async () => {
            // Wait for loading
            const titles = testData1.elements.MainPage.titles.map((title) => title.trim());

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
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0);
        });
        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 02: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it

            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 03: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(leftTable.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT);
        });
        await allure.step("Step 04: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 05: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for the page to become idle (ensuring data loading is complete)
            await page.waitForLoadState("networkidle");
            // Assert that the table body has rows
            await page.waitForTimeout(500);
            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0); // Asserts that the row count is greater than 1
        });
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 06: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable.)", async () => {
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
            expect(firstCellValue).toContain(TEST_PRODUCT); // Validate that the value matches the search term
        });


        await allure.step("Step 07: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
        });
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });

        await allure.step("Step 08: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Wait for the row to become visible
            await firstRow.waitFor({ state: 'visible' });
            await page.waitForTimeout(500);

            const buttons = testData1.elements.MainPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 09: Нажимаем по данной кнопке. (Press the button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            await editButton.click();
            // Debugging pause to verify visually in the browser
            await page.waitForTimeout(500);
        });

        await allure.step("Step 10: Проверяем заголовки страницы: (Validate the page headers)", async () => {
            // Expected titles in the correct order
            const titles = testData1.elements.EditPage.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInClass(page, 'editor');
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
        await allure.step("Step 11: Проверяем наличие кнопок на странице (Check for the visibility of action buttons on the page)", async () => {
            await page.waitForLoadState("networkidle");
            const buttons = testData1.elements.EditPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 12: Проверяем, что в инпуте наименования совпадает со значением переменной, по которой мы осуществляли поиск данного изделия (We check that the name in the input matches the value of the variable by which we searched for this product.)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate all input fields with the specified class
            const inputFields = page.locator('.input-yui-kit.initial.editor__information-input input.input-yui-kit__input');

            // Get the value of the first input field
            const firstInputValue = await inputFields.nth(0).inputValue();

            expect(firstInputValue).toBe(secondCellValue);
            console.log(`Value in first input field: ${firstInputValue}`);

            // Get the value of the second input field
            const secondInputValue = await inputFields.nth(1).inputValue();
            expect(secondInputValue).toBe(firstCellValue);
            console.log(`Value in second input field: ${secondInputValue}`);
            // Get the value of the third input field

            const thirdInputValue = await inputFields.nth(2).inputValue();
            expect(thirdInputValue).toBe(thirdCellValue);
            console.log(`Value in third input field: ${thirdInputValue}`);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 13: Перебираем и сохраняем в массивы А1 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData3 = await shortagePage.parseStructuredTable(page, 'table1-XXXXX');
            // Example assertion
            expect(tableData3.length).toBeGreaterThan(0); // Ensure groups are present
        });
    });
    test.skip("TestCase 03 - Редактирование изделия - Сравниваем комплектацию (Editing a product - Comparing the complete set)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 02: Проверяем наличия заголовка на странице \"База деталей\" (Check for the presence of the title on the 'Parts Database' page)", async () => {
            // Wait for loading
            const titles = testData1.elements.MainPage.titles.map((title) => title.trim());

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
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0);
        });
        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 05: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

        });
        await allure.step("Step 06: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(leftTable.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT);
        });
        await allure.step("Step 07: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 08: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for the page to become idle (ensuring data loading is complete)
            await page.waitForLoadState("networkidle");
            // Assert that the table body has rows
            await page.waitForTimeout(500);
            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0); // Asserts that the row count is greater than 1
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
            expect(firstCellValue).toContain(TEST_PRODUCT); // Validate that the value matches the search term
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
        });
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });

        await allure.step("Step 11: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Wait for the row to become visible
            await firstRow.waitFor({ state: 'visible' });
            await page.waitForTimeout(500);

            const buttons = testData1.elements.MainPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
        await allure.step("Step 12: Нажимаем по данной кнопке. (Press the button)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            await editButton.click();
            // Debugging pause to verify visually in the browser
            await page.waitForTimeout(500);
        });

        await allure.step("Step 13: Проверяем заголовки страницы: (Validate the page headers)", async () => {
            // Expected titles in the correct order
            const titles = testData1.elements.EditPage.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInClass(page, 'editor');
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
        await allure.step("Step 14: Проверяем наличие кнопок на странице (Check for the visibility of action buttons on the page)", async () => {
            await page.waitForLoadState("networkidle");
            const buttons = testData1.elements.EditPage.buttons;
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

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 15: Проверяем, что в инпуте наименования совпадает со значением переменной, по которой мы осуществляли поиск данного изделия (We check that the name in the input matches the value of the variable by which we searched for this product.)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate all input fields with the specified class
            const inputFields = page.locator('.input-yui-kit.initial.editor__information-input input.input-yui-kit__input');

            // Get the value of the first input field
            const firstInputValue = await inputFields.nth(0).inputValue();

            expect(firstInputValue).toBe(secondCellValue);
            console.log(`Value in first input field: ${firstInputValue}`);

            // Get the value of the second input field
            const secondInputValue = await inputFields.nth(1).inputValue();
            expect(secondInputValue).toBe(firstCellValue);
            console.log(`Value in second input field: ${secondInputValue}`);
            // Get the value of the third input field

            const thirdInputValue = await inputFields.nth(2).inputValue();
            expect(thirdInputValue).toBe(thirdCellValue);
            console.log(`Value in third input field: ${thirdInputValue}`);
            await page.waitForLoadState("networkidle");
        });
    });
}
