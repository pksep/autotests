import { test, expect } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data

const LEFT_DATA_TABLE = "table1-product";
const TEST_PRODUCT = '109.02-00СБ';
const EDIT_BUTTON = '';

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

    test("TestCase 01 - Редактирование изделия - добавление потомка (СБ) (Editing a product - adding a descendant (СБ))", async ({ browser, page }) => {
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
            // Wait for loading+
            console.log("1:" + firstCellValue);
            console.log("2:" + secondCellValue);
            console.log("3:" + thirdCellValue);
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
            await page.waitForTimeout(5000);
        });
        /*                        await allure.step("Step 17: Проверяем, что в списке есть селекторы с названиями. (Check that the list contains selectors with names)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 18: Нажимаем по селектору из выпадающего списке \"Сборочную единицу (тип СБ)\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 19: Проверяем, что в модальном окне отображается заголовок \"База сборочных единиц\". (We check that the modal window displays the title \"Assembly Unit Database\")", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 20: Проверяем, что в модальном окне есть две таблицы. (We check that there are two tables in the modal window.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 21: Проверяем, что тела таблиц отображаются. (Check that table bodies are displayed)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 22: Проверяем, что кнопка \"Добавить выбранное\" отображается в модальном окне. (We check that the \"Добавить выбранное\" button is displayed in the modal window.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 23: Проверяем, что кнопка \"Выбрать\" отображается в модальном окне. (We check that the \"Выбрать\" button is displayed in the modal window.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 24: Проверяем, что поиск во второй таблицы модального окна отображается. (Check that the search in the second table of the modal window is displayed.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 25: Вводим значение переменной в поиск таблицы второй таблицы модального окна. (We enter the value of the variable in the table search of the second table of the modal window.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 26: Проверяем, что в поиске второй таблицы модального окна введенное значение совпадает с переменной. (We check that in the search of the second table of the modal window the entered value matches the variable.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 27: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 28: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 29: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 30: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 31: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 32: Нажимаем по кнопке \"Добавить выбранное\" в модальном окне (Click on the \"Добавить выбранное\" button in the modal window)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 33: Перебираем и сохраняем в массивы А1 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 34: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 35: Перебираем и сохраняем в массивы A2 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });
                                await allure.step("Step 36: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
                                    // Wait for loading
                                    await page.waitForLoadState("networkidle");
                                });*/
    });
    test.skip("TestCase 02 - Редактирование изделия - Сравниваем комплектацию (Editing a product - Comparing the complete set)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 02: Проверяем наличия заголовка на странице \"База деталей\" (Check for the presence of the title on the 'Parts Database' page)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 05: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 06: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 07: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 08: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 09: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 10: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 11: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 12: Нажимаем по данной кнопке. (Press the button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 13: Проверяем заголовки страницы: (Validate the page headers)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 14: Проверяем наличие кнопок на странице (Check for the visibility of action buttons on the page)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 15: Проверяем, что в инпуте наименования совпадает со значением переменной, по которой мы осуществляли поиск данного изделия (We check that the name in the input matches the value of the variable by which we searched for this product.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 16: Перебираем и сохраняем в массивы A3 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Equipment\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 17: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
    });
}
