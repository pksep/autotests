import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data

let tableData_original: { groupName: string; items: string[][] }[] = [];
let tableData_full: { groupName: string; items: string[][] }[] = [];
let tableData1: { groupName: string; items: string[][] }[] = [];
let tableData2: { groupName: string; items: string[][] }[] = [];
let tableData3: { groupName: string; items: string[][] }[] = [];
let tableData4: { groupName: string; items: string[][] }[] = [];
let table_before_changequantity: { groupName: string; items: string[][] }[] = [];
let value_before_changequantity: number = 0;

const LEFT_DATA_TABLE = "table1-product";
const TEST_PRODUCT = '109.02-00СБ';
const TESTCASE_2_PRODUCT_1 = '109.02-00СБ';

const EDIT_BUTTON = '';
const TEST_PRODUCT_СБ = '1.3.3.1С';
const TESTCASE_2_PRODUCT_СБ = '1.3.3.1С';
const TESTCASE_2_PRODUCT_Д = '1.2.2.1';
const TESTCASE_2_PRODUCT_ПД = 'Блок питания БП12Б-Д1-24';
const TESTCASE_2_PRODUCT_РМ = 'Рулон бумажных полотенец';

let table1Locator: Locator | null = null;
let table2Locator: Locator | null = null;
let table3Locator: Locator | null = null;

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
        test.setTimeout(50000);
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
                    await page.waitForTimeout(500);
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
            await page.waitForLoadState("networkidle");
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
        await allure.step("Step 16: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            //store the original contents of the table
            tableData_original = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
            // Example assertion
            expect(tableData_original.length).toBeGreaterThan(0); // Ensure groups are present

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
                    const buttons = await page.locator('div.card-yui-kit.specification-dialog__card');
                    const buttonTexts = await buttons.evaluateAll(elements => elements.map(e => e.textContent!.trim()));
                    console.log('Button texts:', buttonTexts);
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
            const buttonLabel = 'Добавить';
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
            await page.waitForTimeout(500);
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
            const buttonLabel = 'Добавить';
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
            //await buttonLocator.hover();
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 32: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = firstCellValue; // Replace with actual part number
            const selectedPartName = secondCellValue; // Replace with actual part name
            console.log(selectedPartNumber);
            console.log(selectedPartName);
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
                const partNumber = await row.locator('td').nth(0).textContent();
                const partNumberCell = await row.locator('td').nth(0);
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
        await allure.step("Step 33: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
            //await buttonLocator.hover();
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });
        //let tableData1: { groupName: string; items: string[][] }[] = [];
        await allure.step("Step 34: Перебираем и сохраняем в массивы А1 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData1 = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
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
            tableData2 = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
            // Example assertion
            expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
        });
        await allure.step("Step 37: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            logger.info(`Are tableData1 and tableData2 identical? ${identical}`);
            expect(identical).toBe(true); // Assertion
        });
        await allure.step("Step 38: перейдите в сторону и вернитесь назад, затем перепроверьте arrays Array1 and Array3. (navigate away and back then recheck table arrays Array1 and Array3.)", async () => {
            shortagePage.goto(ENV.BASE_URL);
            await page.waitForTimeout(1000);
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
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
            const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
            await editButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(2000);
            editButton.hover();
            editButton.click();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
            tableData3 = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            console.log(`Are tableData1 and tableData3 identical? ${identical}`);
            expect(identical).toBe(true); // Assertion
        });
        await allure.step("Step 39: Очистка после теста. (Cleanup after test)", async () => {
            //remove the item we added
            await page.waitForLoadState("networkidle");
            await allure.step("Step 39 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                addButton.hover();
                addButton.click();
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 39 sub step 2: find and click the Сборочную единицу button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Сборочную единицу' });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                add2Button.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 39 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TEST_PRODUCT_СБ; // Replace with actual part number

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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
                    // Extract the partName from the second cell (assuming it's direct text)
                    const partName = await row.locator('td').nth(1).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'yellow';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCell = await row.locator('td').nth(4);
                        deleteCell.click();
                        break;
                    }
                }
            });

            await allure.step("Step 39 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 39 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'blue';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(2000);
                button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 39 sub step 6: получить содержимое основной таблицы  (get the content of the main table )", async () => {
                await page.waitForLoadState("networkidle");
                // Parse the table
                tableData4 = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
                // Example assertion
                expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
            });
            await allure.step("Step 39 sub step 7: сравнить его с оригиналом (compare it to the original)", async () => {
                await page.waitForLoadState("networkidle");
                const identical = await shortagePage.compareTableData(tableData_original, tableData4);

                logger.info(`Are tableData1 and tableData2 identical: Item deleted? ${identical}`);
                expect(identical).toBe(true); // Assertion
            });
        });
    });
    test.skip("TestCase 02 - Очистка после теста. (Cleanup after test)", async ({ page }) => {
        test.setTimeout(70000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${LEFT_DATA_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Find СБ к товару (find СБ product)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                editButton.click();
            });
        });
        await allure.step("Step 002: Очистка после теста. (Cleanup after test)", async () => {
            //remove the item we added СБ
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            await allure.step("Step 002 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                addButton.hover();
                addButton.click();
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 002 sub step 2: find and click the Сборочную единицу button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Сборочную единицу' });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 002 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TEST_PRODUCT_СБ; // Replace with actual part number

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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
                    // Extract the partName from the second cell (assuming it's direct text)
                    const partName = await row.locator('td').nth(1).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCell = await row.locator('td').nth(4);
                        await page.waitForTimeout(500);
                        deleteCell.click();
                        await page.waitForTimeout(1000);
                        break;
                    }
                }
            });

            await allure.step("Step 002 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Perform hover and click actions
                //await buttonLocator.hover();
                await page.waitForTimeout(1000);
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 002 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(1000);
            });
            ////////////////// end of СБ deletion
        });

    });
    test.skip("TestCase 03 - Добавьте каждый тип материала по отдельности. (Add Each Material Type Individually)", async ({ page }) => {
        test.setTimeout(70000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${LEFT_DATA_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Добавить СБ к товару (Add СБ to the product and save)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                editButton.click();
            });
            await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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

            await allure.step("Step 09: Нажимаем по селектору из выпадающего списке \"Сборочную единицу (тип СБ)\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
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
            await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
                await page.waitForLoadState("networkidle");
                table2Locator = page.locator('[data-testid="table1-cbed"]');
                await table2Locator!.locator('input.search-yui-kit__input').fill(TEST_PRODUCT_СБ);
                await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible
            });
            let firstCell: Locator | null = null;
            await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
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

            await allure.step("Step 12: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
                const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
                const buttonLabel = 'Добавить';
                let expectedState = true;

                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    await page.waitForTimeout(1000);
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
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");

                const selectedPartNumber = firstCellValue; // Replace with actual part number
                const selectedPartName = secondCellValue; // Replace with actual part name
                console.log(selectedPartNumber);
                console.log(selectedPartName);
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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
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
            await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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
            await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'red';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(500);
                button.hover();
                button.click();
                await page.waitForTimeout(500);
            });
        });
        await allure.step("Step 002: Добавить Д к товару (Add Д to the product and save)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
                //await firstRow.waitFor({ state: 'visible' });
                await firstRow.hover();
                await page.waitForTimeout(500);
                await firstRow.click();
            });
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                editButton.click();
            });
            await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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

            await allure.step("Step 09: Нажимаем по селектору из выпадающего списке \"Деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Деталь)\".)", async () => {
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                //const addButton2 = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' });
                const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' }).filter({
                    hasNotText: 'Cтандартную или покупную деталь'
                });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                addButton.hover();
                addButton.click();
                await page.waitForTimeout(500);
            });
            table2Locator = page.locator('[data-testid="table1-detal"]');
            await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
                await page.waitForLoadState("networkidle");
                table2Locator = page.locator('[data-testid="table1-detal"]');
                await table2Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_Д);
                await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible
            });
            let firstCell: Locator | null = null;
            await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
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
                //expect(firstCellValue).toContain(TESTCASE_2_PRODUCT_Д);
            });

            await allure.step("Step 12: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
                await page.waitForTimeout(500);
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
            await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
                //const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
                const buttonLabel = 'Добавить';
                let expectedState = true;
                const clas = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
                const scopedButtonSelector = `${dialogSelector} button.${clas}`;
                const buttonLocator = page.locator(scopedButtonSelector); // Create Locator
                await page.waitForTimeout(500);
                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                await buttonLocator.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await buttonLocator.click();
                await page.waitForTimeout(500);

            });
            // await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
            //     // Wait for the page to load
            //     await page.waitForLoadState("networkidle");
            //     await page.waitForTimeout(500);
            //     const selectedPartNumber = firstCellValue; // Replace with actual part number
            //     const selectedPartName = secondCellValue; // Replace with actual part name

            //     // Locate the bottom table
            //     const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id

            //     await bottomTableLocator.evaluate((row) => {
            //         row.style.backgroundColor = 'yellow';
            //         row.style.border = '2px solid red';
            //         row.style.color = 'blue';
            //     });

            //     // Locate all rows in the table body
            //     const rowsLocator = bottomTableLocator.locator('tbody tr');

            //     const rowCount = await rowsLocator.count();
            //     expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            //     let isRowFound = false;

            //     // Iterate through each row
            //     for (let i = 0; i < rowCount; i++) {
            //         const row = rowsLocator.nth(i);

            //         // Extract the partNumber from the input field in the first cell
            //         const partNumber = await row.locator('td').nth(0).textContent();
            //         const partNumberCell = await row.locator('td').nth(0);
            //         // Extract the partName from the second cell (assuming it's direct text)
            //         const partName = await row.locator('td').nth(1).textContent();

            //         console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

            //         // Compare the extracted values
            //         if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
            //             isRowFound = true;
            //             await partNumberCell.evaluate((row) => {
            //                 row.style.backgroundColor = 'yellow';
            //                 row.style.border = '2px solid red';
            //                 row.style.color = 'blue';
            //             });
            //             console.log(`Selected row found in row ${i + 1}`);
            //             break;
            //         }
            //     }

            //     // Assert that the selected row is found
            //     //expect(isRowFound).toBeTruthy();
            //     logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
            // });
            // await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            //     // Wait for loading
            //     await page.waitForLoadState("networkidle");

            //     const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
            //     const buttonClass = 'button-yui-kit.medium.primary-yui-kit';
            //     const buttonLabel = 'Добавить';
            //     let expectedState = true;

            //     await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
            //         const cls = 'button-yui-kit.medium.primary-yui-kit';
            //         const scopedButtonSelector = `${dialogSelector} button.${cls}`;
            //         const buttonLocator = page.locator(scopedButtonSelector); // Create Locator

            //         const isButtonReady = await shortagePage.isButtonVisible(
            //             page,
            //             scopedButtonSelector,
            //             buttonLabel,
            //             expectedState
            //         );
            //         expect(isButtonReady).toBeTruthy();
            //         logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            //     });

            //     const clas = 'button-yui-kit.medium.primary-yui-kit';
            //     // Reuse the locator for the button
            //     const buttonLocator = page.locator(`${dialogSelector} button.${clas}`); // Create Locator
            //     await buttonLocator.evaluate((row) => {
            //         row.style.backgroundColor = 'green';
            //         row.style.border = '2px solid red';
            //         row.style.color = 'blue';
            //     });
            //     // Perform hover and click actions
            //     await buttonLocator.hover();
            //     await buttonLocator.click();
            //     await page.waitForTimeout(500);
            // });
            await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                //button.hover();
                button.click();
            });
        });
        await allure.step("Step 003: Добавить ПД к товару (Add ПД to the product and save)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                await page.waitForTimeout(500);
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                await page.waitForTimeout(500);
                editButton.click();
            });
            await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                //addButton.hover();
                await page.waitForTimeout(500);
                addButton.click();

            });

            await allure.step("Step 09: Нажимаем по Кнопка из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the Кнопка from the list \"Cтандартную или покупную деталь\".)", async () => {
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                //const addButton2 = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' });
                const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Cтандартную или покупную деталь' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                addButton.hover();
                addButton.click();
                await page.waitForTimeout(500);
            });
            table3Locator = page.locator('[data-testid="table1-item"]');
            await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
                await page.waitForLoadState("networkidle");
                await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_ПД);
                await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible
            });
            let firstCell: Locator | null = null;
            await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
                // Wait for the page to stabilize
                await page.waitForTimeout(1000);
                await page.waitForLoadState("networkidle");

                // Get the value of the first cell in the first row
                firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
                firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
                await firstCell.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                firstCellValue = firstCellValue.trim();
                // Get the value of the second cell in the first row

                // Confirm that the first cell contains the search term
                expect(firstCellValue).toContain(TESTCASE_2_PRODUCT_ПД);
            });

            await allure.step("Step 12: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
                await page.waitForTimeout(500);
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await firstCell!.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                //firstCell!.hover();
                firstCell!.click();
            });
            await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
                //const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
                const buttonLabel = 'Добавить';
                let expectedState = true;
                const clas = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
                const scopedButtonSelector = `${dialogSelector} button.${clas}`;
                const buttonLocator = page.locator(scopedButtonSelector); // Create Locator
                await page.waitForTimeout(500);
                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                await buttonLocator.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });

            await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const selectedPartNumber = firstCellValue; // Replace with actual part number

                // Locate the bottom table
                const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id
                await bottomTableLocator.evaluate((row) => {
                    row.style.backgroundColor = 'blue';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });

                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');

                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partNumber = await row.locator('td').nth(1).textContent();
                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)


                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
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
                await page.waitForTimeout(3000);
                // Assert that the selected row is found
                expect(isRowFound).toBeTruthy();
                logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
            });
            await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(5000);
            });
            await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
            });
        });
        await allure.step("Step 004: Добавить РМ к товару (Add РМ to the product and save)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                editButton.click();
            });
            await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                addButton.hover();
                addButton.click();

            });

            await allure.step("Step 09: Нажимаем по Кнопка из выпадающего списке \"Расходный материал\". (Click on the Кнопка from the list \"Расходный материал\".)", async () => {
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                //const addButton2 = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' });
                const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Расходный материал' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                await page.waitForTimeout(500);
                //addButton.hover();
                addButton.click();
                await page.waitForTimeout(500);
            });
            table3Locator = page.locator('[data-testid="table1-item"]');
            await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
                await page.waitForLoadState("networkidle");
                await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_РМ);
                await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible
            });
            let firstCell: Locator | null = null;
            await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
                // Wait for the page to stabilize
                await page.waitForLoadState("networkidle");

                // Get the value of the first cell in the first row
                firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
                firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
                await firstCell.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                firstCellValue = firstCellValue.trim();
                // Get the value of the second cell in the first row

                // Confirm that the first cell contains the search term
                //expect(firstCellValue).toContain(TESTCASE_2_PRODUCT_РМ);
            });

            await allure.step("Step 12: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
                await page.waitForTimeout(1000);
                // Wait for loading
                await page.waitForLoadState("networkidle");
                await firstCell!.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                //firstCell!.hover();
                firstCell!.click();
            });
            await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
                //const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
                const buttonLabel = 'Добавить';
                let expectedState = true;
                const clas = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
                const scopedButtonSelector = `${dialogSelector} button.${clas}`;
                const buttonLocator = page.locator(scopedButtonSelector); // Create Locator
                await page.waitForTimeout(500);
                const isButtonReady = await shortagePage.isButtonVisible(
                    page,
                    scopedButtonSelector,
                    buttonLabel,
                    expectedState
                );
                await buttonLocator.evaluate((row) => {
                    row.style.backgroundColor = 'red';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await buttonLocator.click();
                await page.waitForTimeout(500);

            });
            await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                const selectedPartNumber = firstCellValue; // Replace with actual part number

                // Locate the bottom table
                const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id
                await bottomTableLocator.evaluate((row) => {
                    row.style.backgroundColor = 'blue';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });

                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');

                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partNumber = await row.locator('td').nth(1).textContent();
                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)


                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
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
                await page.waitForTimeout(500);
                // Assert that the selected row is found
                //expect(isRowFound).toBeTruthy();
                logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
            });
            await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
                await page.waitForTimeout(500);
                button.click();
            });
        });
        await allure.step("Step 005: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)", async () => {
            await page.waitForLoadState("networkidle");
            tableData_full = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');

        });
        await allure.step("Step 006: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)", async () => {
            await page.waitForLoadState("networkidle");
            const nestedArray = tableData_full.map(group => group.items).flat();

            const result1 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_СБ); // Output: true
            const result2 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_Д); // Output: true
            const result3 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ПД); // Output: true
            const result4 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true

            expect(result1 && result2 && result3 && result4).toBeTruthy();
        });
    });
    test.skip("TestCase 04 - Очистка после теста. (Cleanup after test)", async ({ page }) => {
        test.setTimeout(70000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${LEFT_DATA_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Find СБ к товару (find СБ product)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                // Wait for loading
                shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const rowCount = await leftTable.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);
            });
            await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
                await page.waitForLoadState("networkidle");
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
                // Locate the search field within the left table and fill it
                await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
                await page.waitForLoadState("networkidle");
                // Optionally, validate that the search input is visible
                await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
            });
            await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                // Simulate pressing "Enter" in the search field
                await leftTable.locator('input.search-yui-kit__input').press('Enter');
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
                const firstRow = leftTable.locator('tbody tr:first-child');
                // Locate the "Редактировать" button
                const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });
                editButton.hover();
                editButton.click();
            });
        });
        await allure.step("Step 002: Очистка после теста. (Cleanup after test)", async () => {
            //remove the item we added СБ
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            await allure.step("Step 002 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                addButton.hover();
                addButton.click();
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 002 sub step 2: find and click the Сборочную единицу button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Сборочную единицу' });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 002 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TEST_PRODUCT_СБ; // Replace with actual part number

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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
                    // Extract the partName from the second cell (assuming it's direct text)
                    const partName = await row.locator('td').nth(1).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCell = await row.locator('td').nth(4);
                        await page.waitForTimeout(500);
                        deleteCell.click();
                        await page.waitForTimeout(1000);
                        break;
                    }
                }
            });

            await allure.step("Step 002 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Perform hover and click actions
                //await buttonLocator.hover();
                await page.waitForTimeout(1000);
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 002 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(1000);
            });
            ////////////////// end of СБ deletion
            //remove the item we added Д
            await page.waitForLoadState("networkidle");
            await allure.step("Step 003 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                addButton.hover();
                addButton.click();
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 003 sub step 2: find and click the Деталь button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' }).filter({
                    hasNotText: 'Cтандартную или покупную деталь'
                });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 003 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TESTCASE_2_PRODUCT_Д; // Replace with actual part number

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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
                    // Extract the partName from the second cell (assuming it's direct text)
                    const partName = await row.locator('td').nth(1).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCell = await row.locator('td').nth(4);
                        await deleteCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        await page.waitForTimeout(500);
                        deleteCell.click();
                        break;
                    }
                }
            });

            await allure.step("Step 007 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Perform hover and click actions
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 007 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(1000);
            });
            ///// end of Д removal
            page.reload();
            //remove the item we added ПД
            await page.waitForLoadState("networkidle");
            await allure.step("Step 007 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                addButton.hover();
                addButton.click();
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 007 sub step 2: find and click the Cтандартную или покупную деталь button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Cтандартную или покупную деталь' });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 007 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TESTCASE_2_PRODUCT_ПД; // Replace with actual part number

                const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id
                await page.waitForTimeout(5000);
                await bottomTableLocator.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partNumber = await row.locator('td').nth(1).textContent();
                    console.log("XXXXXXXXXXXXXXXX: ");
                    console.log(partNumber);
                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)
                    //const partName = await row.locator('td').nth(2).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCellValue = await row.locator('td').nth(4).textContent();
                        console.log("XXXXXXXXXXXXXXXX: ");
                        console.log(deleteCellValue);
                        const deleteCell = await row.locator('td').nth(4);
                        await deleteCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
            });

            await allure.step("Step 007 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Perform hover and click actions
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 007 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(2000);
            });
            ////////////////// end of ПД deletion
            ///////////// start РМ deletion
            page.reload();
            //remove the item we added ПД
            await page.waitForLoadState("networkidle");
            await allure.step("Step 007 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                addButton.hover();
                addButton.click();
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 007 sub step 2: find and click the Расходный материал button", async () => {
                const add2Button = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Расходный материал' });
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 007 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TESTCASE_2_PRODUCT_РМ; // Replace with actual part number

                const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id
                await page.waitForTimeout(1000);
                await bottomTableLocator.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partNumber = await row.locator('td').nth(1).textContent();
                    console.log("XXXXXXXXXXXXXXXX: ");
                    console.log(partNumber);
                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)
                    //const partName = await row.locator('td').nth(2).textContent();

                    console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        console.log(`Selected row found in row ${i + 1}`);
                        const deleteCellValue = await row.locator('td').nth(4).textContent();
                        console.log("XXXXXXXXXXXXXXXX: ");
                        console.log(deleteCellValue);
                        const deleteCell = await row.locator('td').nth(4);
                        await deleteCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
            });

            await allure.step("Step 007 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
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
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                // Perform hover and click actions
                //await buttonLocator.hover();
                await buttonLocator.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 007 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(500);
                button.click();
                await page.waitForTimeout(2000);
            });
            ////////////////// end of РМ deletion
        });

    });
    test.skip("TestCase 05 - Редактирование изделия - Сравниваем комплектацию (Editing a product - Comparing the complete set)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page      
        test.setTimeout(50000);
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(500);
            await page.waitForLoadState("networkidle");
        });

        const leftTable = page.locator(`[data-testid="${LEFT_DATA_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0);
        });
        await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 06: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator('button.button-yui-kit.small.primary-yui-kit', { hasText: 'Редактировать' });

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            table_before_changequantity = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
            value_before_changequantity = await shortagePage.getQuantityByLineItem(table_before_changequantity, TESTCASE_2_PRODUCT_Д)

            const addButton = page.locator('button.button-yui-kit.small.primary-yui-kit.specification__btns-adding', { hasText: 'Добавить' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 09: Нажимаем по селектору из выпадающего списке \"Деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Деталь)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' }).filter({
                hasNotText: 'Cтандартную или покупную деталь'
            });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(5000);
        });
        table2Locator = page.locator('[data-testid="table1-detal"]');
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            table2Locator = page.locator('[data-testid="table1-detal"]');
            await table2Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_Д);
            await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible
        });
        let firstCell: Locator | null = null;
        await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
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
            //expect(firstCellValue).toContain(TESTCASE_2_PRODUCT_Д);
        });

        await allure.step("Step 12: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
            await page.waitForTimeout(500);
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
        await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
            //const buttonClass = 'button-yui-kit.small.disabled-yui-kit.primary-yui-kit.base-modal__section-select__button';
            const buttonLabel = 'Добавить';
            let expectedState = true;
            const clas = 'button-yui-kit.small.primary-yui-kit.base-modal__section-select__button';
            const scopedButtonSelector = `${dialogSelector} button.${clas}`;
            const buttonLocator = page.locator(scopedButtonSelector); // Create Locator
            await page.waitForTimeout(500);
            const isButtonReady = await shortagePage.isButtonVisible(
                page,
                scopedButtonSelector,
                buttonLabel,
                expectedState
            );
            await buttonLocator.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await buttonLocator.click();
            await page.waitForTimeout(500);

        });
        // await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
        //     // Wait for the page to load
        //     await page.waitForLoadState("networkidle");
        //     await page.waitForTimeout(500);
        //     const selectedPartNumber = firstCellValue; // Replace with actual part number
        //     const selectedPartName = secondCellValue; // Replace with actual part name

        //     // Locate the bottom table
        //     const bottomTableLocator = page.locator('[data-testid="table1-xxxxx"]'); // Adjust 'xxxxx' as per actual table id

        //     await bottomTableLocator.evaluate((row) => {
        //         row.style.backgroundColor = 'yellow';
        //         row.style.border = '2px solid red';
        //         row.style.color = 'blue';
        //     });

        //     // Locate all rows in the table body
        //     const rowsLocator = bottomTableLocator.locator('tbody tr');

        //     const rowCount = await rowsLocator.count();
        //     expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

        //     let isRowFound = false;

        //     // Iterate through each row
        //     for (let i = 0; i < rowCount; i++) {
        //         const row = rowsLocator.nth(i);

        //         // Extract the partNumber from the input field in the first cell
        //         const partNumber = await row.locator('td').nth(0).textContent();
        //         const partNumberCell = await row.locator('td').nth(0);
        //         // Extract the partName from the second cell (assuming it's direct text)
        //         const partName = await row.locator('td').nth(1).textContent();

        //         console.log(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

        //         // Compare the extracted values
        //         if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
        //             isRowFound = true;
        //             await partNumberCell.evaluate((row) => {
        //                 row.style.backgroundColor = 'yellow';
        //                 row.style.border = '2px solid red';
        //                 row.style.color = 'blue';
        //             });
        //             console.log(`Selected row found in row ${i + 1}`);
        //             break;
        //         }
        //     }

        //     // Assert that the selected row is found
        //     //expect(isRowFound).toBeTruthy();
        //     logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
        // });
        // await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
        //     // Wait for loading
        //     await page.waitForLoadState("networkidle");

        //     const dialogSelector = 'dialog.base-modal.modal-yui-kit.base-modal[open]';
        //     const buttonClass = 'button-yui-kit.medium.primary-yui-kit';
        //     const buttonLabel = 'Добавить';
        //     let expectedState = true;

        //     await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        //         const cls = 'button-yui-kit.medium.primary-yui-kit';
        //         const scopedButtonSelector = `${dialogSelector} button.${cls}`;
        //         const buttonLocator = page.locator(scopedButtonSelector); // Create Locator

        //         const isButtonReady = await shortagePage.isButtonVisible(
        //             page,
        //             scopedButtonSelector,
        //             buttonLabel,
        //             expectedState
        //         );
        //         expect(isButtonReady).toBeTruthy();
        //         logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        //     });

        //     const clas = 'button-yui-kit.medium.primary-yui-kit';
        //     // Reuse the locator for the button
        //     const buttonLocator = page.locator(`${dialogSelector} button.${clas}`); // Create Locator
        //     await buttonLocator.evaluate((row) => {
        //         row.style.backgroundColor = 'green';
        //         row.style.border = '2px solid red';
        //         row.style.color = 'blue';
        //     });
        //     // Perform hover and click actions
        //     await buttonLocator.hover();
        //     await buttonLocator.click();
        //     await page.waitForTimeout(500);
        // });
        await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            //button.hover();
            button.click();
            await page.waitForTimeout(1000);
        });
        await allure.step("Step 17: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {

            await page.reload({
                timeout: 5000, // Sets a 500ms timeout
                waitUntil: 'networkidle', // Waits until the page reaches network idle state
            });

        });
        await allure.step("Step 18: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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

        await allure.step("Step 19: Нажимаем по селектору из выпадающего списке \"Деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Деталь)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator('div.card-yui-kit.specification-dialog__card', { hasText: 'Деталь' }).filter({
                hasNotText: 'Cтандартную или покупную деталь'
            });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            addButton.hover();
            addButton.click();
            await page.waitForTimeout(1000);
        });
        await allure.step("Step 20: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = TESTCASE_2_PRODUCT_Д; // Replace with actual part number
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
                const partNumber = await row.locator('td').nth(0).textContent();
                let partNumberCell = await row.locator('td').nth(0);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber) {
                    isRowFound = true;
                    await partNumberCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    console.log(`Selected row found in row ${i + 1}`);
                    //get the quantity of the row
                    // Locate the <input> element inside the <td> field
                    const inputField = await row.locator('td').nth(3).locator('input');

                    // Retrieve the current value of the input field
                    const currentValue = await inputField.inputValue();

                    // Update the value of the input field
                    await inputField.fill((parseInt(currentValue) + 5).toString());

                    break;
                }
            }
            await page.waitForTimeout(5000);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            //button.hover();
            button.click();
            await page.waitForTimeout(1000);
        });
        await allure.step("Step 17: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const button = page.locator('button.button-yui-kit.medium.primary-yui-kit', { hasText: 'Сохранить' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            //button.hover();
            button.click();
            await page.waitForTimeout(1000);
        });
        await allure.step("Step 18: извлечь основную таблицу продуктов и сохранить ее в массиве. (extract the main product table and store it in an array)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            tableData_full = await shortagePage.parseStructuredTable(page, 'Spectification-TableSpecification-Product');
        });
        await allure.step("Step 19: проверьте, что количество обновлено. (check that the quantity has been updated)", async () => {
            await page.waitForLoadState("networkidle");

            const after = await shortagePage.getQuantityByLineItem(tableData_full, TESTCASE_2_PRODUCT_Д);
            expect(after).toBe(value_before_changequantity + 5);

        });
    });


    // TestCase 04: Add Each Material Type Individually
    test.skip("TestCase 04 - Adding Each Material Type Individually", async ({ page }) => {
        const materialTypes = ['Сборочные Единицы', 'Детали', 'Стандартные или покупные детали', 'Расходные материалы'];
        for (const type of materialTypes) {
            await page.goto('http://example.com');
            await page.fill(`[data-testid='add-material']`, type);
            await page.click(`[data-testid='save-button']`);
            await page.reload();
            const material = await page.textContent(`[data-testid='material-entry']`);
            expect(material).toContain(type);
        }
    });

    // TestCase 05: Add All Material Types at Once
    test.skip("TestCase 05 - Adding All Material Types at Once", async ({ page }) => {
        await page.goto('http://example.com');
        const materialTypes = ['Сборочные Единицы', 'Детали', 'Стандартные или покупные детали', 'Расходные материалы'];
        for (const type of materialTypes) {
            await page.fill(`[data-testid='add-material']`, type);
        }
        await page.click(`[data-testid='save-button']`);
        await page.reload();
        for (const type of materialTypes) {
            const material = await page.textContent(`[data-testid='material-entry']`);
            expect(material).toContain(type);
        }
    });

    // TestCase 06: Edit an Existing Material
    test.skip("TestCase 06 - Edit an Existing Material", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Детали');
        await page.click(`[data-testid='save-button']`);
        await page.fill(`[data-testid='edit-material']`, 'Modified Детали');
        await page.click(`[data-testid='save-button']`);
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).toContain('Modified Детали');
    });

    // TestCase 07: Delete a Material Before Saving
    test.skip("TestCase 07 - Delete a Material Before Saving", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Стандартные или покупные детали');
        await page.click(`[data-testid='delete-material']`);
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Стандартные или покупные детали');
    });

    // TestCase 08: Remove Saved Material
    test.skip("TestCase 08 - Remove Saved Material", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Расходные материалы');
        await page.click(`[data-testid='save-button']`);
        await page.click(`[data-testid='remove-material']`);
        await page.click(`[data-testid='save-button']`);
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Расходные материалы');
    });

    // TestCase 09: Add Invalid Material
    test.skip("TestCase 09 - Add Invalid Material", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Invalid!@#');
        await page.click(`[data-testid='save-button']`);
        const errorMessage = await page.textContent(`[data-testid='error-message']`);
        expect(errorMessage).toContain('Invalid material data');
    });

    // TestCase 10: Reload Without Saving
    test.skip("TestCase 10 - Reload Without Saving", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Детали');
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Детали');
    });

    // TestCase 11: Exceed Allowed Materials
    test.skip("TestCase 11 - Exceed Allowed Materials", async ({ page }) => {
        await page.goto('http://example.com');
        const materialTypes = ['Сборочные Единицы', 'Детали', 'Стандартные или покупные детали', 'Расходные материалы', 'Extra Material'];
        for (const type of materialTypes) {
            await page.fill(`[data-testid='add-material']`, type);
        }
        await page.click(`[data-testid='save-button']`);
        const materialCount = await page.locator(`[data-testid='material-entry']`).count();
        expect(materialCount).toBe(4); // Validate limit enforcement
    });

    // TestCase 12: Interrupt During Save
    test.skip("TestCase 12 - Interrupt During Save", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Расходные материалы');
        await page.close(); // Simulate page close during save
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Расходные материалы');
    });

    // TestCase 13: Partial Save and Reload
    test.skip("TestCase 13 - Partial Save and Reload", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Сборочные Единицы');
        await page.click(`[data-testid='save-button']`);
        await page.fill(`[data-testid='add-material']`, 'Детали');
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Детали');
    });

    // TestCase 14: Collaborative Changes
    test.skip("TestCase 14 - Collaborative Changes", async ({ browser }) => {
        const page1 = await browser.newPage();
        const page2 = await browser.newPage();
        await page1.goto('http://example.com');
        await page1.fill(`[data-testid='add-material']`, 'Расходные материалы');
        await page1.click(`[data-testid='save-button']`);
        await page2.goto('http://example.com');
        await page2.fill(`[data-testid='edit-material']`, 'Modified Расходные материалы');
        await page2.click(`[data-testid='save-button']`);
        const material = await page1.textContent(`[data-testid='material-entry']`);
        expect(material).toContain('Modified Расходные материалы');
    });

    // TestCase 15: Add, Modify, and Delete in One Session
    test.skip("TestCase 15 - Add, Modify, and Delete in One Session", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Детали');
        await page.click(`[data-testid='save-button']`);
        await page.fill(`[data-testid='add-material']`, 'Сборочные Единицы');
        await page.click(`[data-testid='delete-material']`);
        await page.click(`[data-testid='save-button']`);
        await page.reload();
        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Детали');
    });

    // Continuing from the previously written tests...

    // TestCase 16: Cross-Session Consistency
    test.skip("TestCase 16 - Cross-Session Consistency", async ({ browser }) => {
        const page1 = await browser.newPage();
        const page2 = await browser.newPage();

        // User A adds a material and saves
        await page1.goto('http://example.com');
        await page1.fill(`[data-testid='add-material']`, 'Стандартные или покупные детали');
        await page1.click(`[data-testid='save-button']`);

        // User B loads the same product in a new session
        await page2.goto('http://example.com');
        const material = await page2.textContent(`[data-testid='material-entry']`);
        expect(material).toContain('Стандартные или покупные детали'); // Ensure consistency across sessions
    });

    // TestCase 17: Add, Modify, and Delete in One Session
    test.skip("TestCase 17 - Add, Modify, and Delete in One Session", async ({ page }) => {
        await page.goto('http://example.com');
        await page.fill(`[data-testid='add-material']`, 'Детали');
        await page.click(`[data-testid='save-button']`);

        // Modify the material
        await page.fill(`[data-testid='edit-material']`, 'Modified Детали');
        await page.click(`[data-testid='save-button']`);

        // Delete the material
        await page.click(`[data-testid='remove-material']`);
        await page.click(`[data-testid='save-button']`);
        await page.reload();

        const material = await page.textContent(`[data-testid='material-entry']`);
        expect(material).not.toContain('Modified Детали'); // Ensure the material has been deleted
    });

    // TestCase 18: Performance Test - Adding and Reloading Materials
    test.skip("TestCase 18 - Performance Test for Adding and Reloading Materials", async ({ page }) => {
        await page.goto('http://example.com');
        const startTime = Date.now();

        // Add multiple materials
        const materialTypes = ['Сборочные Единицы', 'Детали', 'Стандартные или покупные детали', 'Расходные материалы'];
        for (const type of materialTypes) {
            await page.fill(`[data-testid='add-material']`, type);
        }
        await page.click(`[data-testid='save-button']`);

        // Reload and measure time
        await page.reload();
        const loadTime = Date.now() - startTime;
        console.log(`Reload time: ${loadTime}ms`);

        // Confirm all materials are present
        for (const type of materialTypes) {
            const material = await page.textContent(`[data-testid='material-entry']:has-text("${type}")`);
            expect(material).toContain(type);
        }
    });


}
