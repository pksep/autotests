import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json'; // Import your test data
import testData2 from '../testdata/U004-PC01.json';
const LEFT_DATA_TABLE = "table1-product";


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
                    await page.waitForTimeout(500);
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
            await page.waitForTimeout(500);

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
                    await page.waitForTimeout(500);
                    const isButtonReady = await shortagePage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);
                    console.log("Button :" + buttonClass + " " + buttonLabel + " " + expectedState);
                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
            await page.waitForTimeout(500);
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


    });
}
