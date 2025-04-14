import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json'; // Import your test data
import testData2 from '../testdata/U004-PC01.json';
const LEFT_DATA_TABLE = "table1-product";
const TEST_DETAIL_NAME = "U005_test2_DETAILName";

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
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const rowCount = await leftTable.locator('tbody tr').count();
            expect(rowCount).toBeGreaterThan(0);
        });
        await allure.step("Step 04: Проверяем наличие кнопки (Verify the presence of buttons on the page)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

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
            const firstDataRow = tableContainer.locator('table tbody tr').first();
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

            await page.waitForTimeout(500);
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
        await allure.step("Step 17: Open Archive dialog (Open Archive dialog)", async () => {
            // to be able to open the archive dialog, we need to add something to archive
            const targetTable = page.locator(`[data-testid="table1-item"]`);

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
        // await allure.step("Step 18: Check title in Archive dialog (Check title and buttons in Archive dialog)", async () => {
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
        // await allure.step("Step 19: Check buttons in Archive dialog (Check title and buttons in Archive dialog)", async () => {
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

        await allure.step("Step 20: Open Добавить из базы dialog (Open Добавить из базы dialog)", async () => {
            const button = page.locator('button.button-yui-kit.small.primary-yui-kit.attach-file-component__btn', { hasText: 'Добавить из базы' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            button.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 21: Check title in Добавить из базы dialog (Check title in Добавить из базы dialog)", async () => {
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
        await allure.step("Step 22: Check buttons in Добавить из базы dialog (Check buttons in Добавить из базы dialog)", async () => {
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
        await allure.step("Step 23: Validate switcher above table (Validate switcher above table in Добавить из базы dialog)", async () => {
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
                await page.waitForTimeout(500);

                console.log(`Clicked on switch item ${i + 1} with label: "${expectedLabel}"`);
            }

            console.log("Switcher validation completed successfully.");
        });

        await allure.step("Step 24: Validate filter table (Validate filter above table in Добавить из базы dialog)", async () => {
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
        await allure.step("Step 25: Validate table headers in Добавить из базы dialog (Validate table headers in Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");

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


    });
    test.skip("TestCase 02 - создат дитайл", async ({ browser, page }) => {
        const shortagePage = new CreatePartsDatabasePage(page);
        await allure.step("Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)", async () => {
            shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
        });
        await allure.step("Step 01: В поле ввода инпута \"Наименование\" вводим значение переменной. (In the input field \"Name\" we enter the value of the variable)", async () => {
            const field = page.locator('div.editor__information-inputs.w-full:has-text("Наименование") input.input-yui-kit__input');
            await field.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.fill('div.editor__information-inputs.w-full:has-text("Наименование") input.input-yui-kit__input', TEST_DETAIL_NAME);
            await expect(await field.inputValue()).toBe(TEST_DETAIL_NAME);
            await page.waitForTimeout(5000);
        });
    });
}
