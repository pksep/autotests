import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS, CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data

let tableData_original: { groupName: string; items: string[][] }[] = [];
let tableData_original_15: { groupName: string; items: string[][] }[] = [];//for test case 15, so that it doesnt rely on test case 1
let tableData_full: { groupName: string; items: string[][] }[] = [];
let tableData_temp: { groupName: string; items: string[][] }[] = [];
let tableData1: { groupName: string; items: string[][] }[] = [];
let tableData2: { groupName: string; items: string[][] }[] = [];
let tableData3: { groupName: string; items: string[][] }[] = [];
let tableData4: { groupName: string; items: string[][] }[] = [];
let table_before_changequantity: { groupName: string; items: string[][] }[] = [];
let value_before_changequantity: number = 0;
let detailvalue_original_before_changequantity: number = 5;

let table1Locator: Locator | null = null;
let table2Locator: Locator | null = null;
let table3Locator: Locator | null = null;

export const runU004_9 = () => {
    logger.info(`Starting test U004`);


    test("TestCase 18 - Добавить, изменить и удалить несколько элементов одновременно в спецификацию и проверка сохранения (Add, Modify, and Delete in One Session)", async ({ page }) => {
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);

        await allure.step("Setup: Clean up Т15 product specifications", async () => {
            // Navigate to parts database page
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);

            // Search for Т15 product
            const leftTable = page.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
            await leftTable.locator('input.search-yui-kit__input').fill("Т15");
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");

            // Click on the found row
            const firstRow = leftTable.locator('tbody tr:first-child');
            await firstRow.waitFor({ state: 'visible' });
            await firstRow.click();
            await page.waitForTimeout(500);

            // Click edit button
            const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);
            editButton.click();
            await page.waitForTimeout(500);

            // Clean up СБ group - remove items not in allowed list
            await allure.step("Clean up СБ group", async () => {
                const allowedСБItems = ["Опора (Траверса Т10А)СБ", "Упор подвижный (Траверса Т10А)СБ"];

                // Click Add button
                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                addButton.click();
                await page.waitForTimeout(500);

                // Click СБ option
                const сбButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
                сбButton.click();
                await page.waitForTimeout(500);

                // Get bottom table and remove unwanted items
                const modalСБ = page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalСБ.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();

                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);
                    const partName = await row.locator('td').nth(1).textContent();

                    if (partName && !allowedСБItems.includes(partName.trim())) {
                        // Delete this item
                        const deleteCell = row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                    }
                }

                // Click Add to main button
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                buttonLocator.click();
                await page.waitForTimeout(500);
            });

            // Clean up Д group - remove items not in allowed list
            await allure.step("Clean up Д group", async () => {
                const allowedДItems = ["Опора штока d45мм"];

                // Click Add button
                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                addButton.click();
                await page.waitForTimeout(500);

                // Click Д option
                const дButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_Д}"]`);
                дButton.click();
                await page.waitForTimeout(500);

                // Get bottom table and remove unwanted items
                const modalД = page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalД.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();

                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);
                    const partName = await row.locator('td').nth(1).textContent();

                    if (partName && !allowedДItems.includes(partName.trim())) {
                        // Delete this item
                        const deleteCell = row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                    }
                }

                // Click Add to main button
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                buttonLocator.click();
                await page.waitForTimeout(500);
            });

            // Clean up ПД group - remove items not in allowed list
            await allure.step("Clean up ПД group", async () => {
                const allowedПДItems = ["Гайка шестигранная DIN934 М12", "Болт с полной резьбой DIN933 М8х40"];

                // Click Add button
                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                addButton.click();
                await page.waitForTimeout(500);

                // Click ПД option
                const пдButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
                пдButton.click();
                await page.waitForTimeout(500);

                // Get bottom table and remove unwanted items
                const modalПД = page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalПД.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();

                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);
                    const partName = await row.locator('td').nth(1).textContent();

                    if (partName && !allowedПДItems.includes(partName.trim())) {
                        // Delete this item
                        const deleteCell = row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                    }
                }

                // Click Add to main button
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                buttonLocator.click();
                await page.waitForTimeout(500);
            });

            // Clean up РМ group - remove all items (should be empty)
            await allure.step("Clean up РМ group", async () => {
                // Click Add button
                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                addButton.click();
                await page.waitForTimeout(500);

                // Click РМ option
                const рмButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
                рмButton.click();
                await page.waitForTimeout(500);

                // Get bottom table and remove all items
                const modalРМ = page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalРМ.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();

                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);
                    const deleteCell = row.locator('td').nth(4);
                    deleteCell.click();
                    await page.waitForTimeout(500);
                }

                // Click Add to main button
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                buttonLocator.click();
                await page.waitForTimeout(500);
            });

            // Save changes
            const saveButton = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
            saveButton.click();
            await page.waitForTimeout(1500);
        });

        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
        });

        const leftTable = page.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });
        await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
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
            await page.waitForTimeout(500);

        });
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);//DATATSTID
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        // Start adding СБ
        await allure.step("Step 09: Нажимаем по селектору из выпадающего списке \"Сборочную единицу (тип СБ)\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            addButton.click();
            await page.waitForTimeout(500);
        });
        const modalСБ = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
        table2Locator = modalСБ.locator(`[data-testid="${CONST.MAIN_PAGE_СБ_TABLE}"]`);
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");

            // Ensure search input is visible and ready
            const searchInput = table2Locator!.locator('input.search-yui-kit__input');
            await searchInput.waitFor({ state: 'visible', timeout: 10000 });

            // Clear any existing content
            await searchInput.clear();
            await page.waitForTimeout(500);

            // Fill the search input
            await searchInput.fill(CONST.TESTCASE_2_PRODUCT_СБ);
            await page.waitForTimeout(500);

            // Verify the input was filled correctly
            const inputValue = await searchInput.inputValue();
            console.log(`Search input value: "${inputValue}"`);
            expect(inputValue).toBe(CONST.TESTCASE_2_PRODUCT_СБ);

            // Press Enter to perform search
            await searchInput.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(3000); // Add timeout for table to update

            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible();
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
            // Confirm that the second cell contains the search term
            expect(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_СБ);
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

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
            const buttonLabel = "Добавить";
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                await page.waitForTimeout(1000);

                // Locate the button using data-testid instead of class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartName = CONST.TESTCASE_2_PRODUCT_СБ; // Replace with actual part number
            // Locate the bottom table
            const modalСБ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modalСБ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;

            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Extract the partNumber from the input field in the first cell
                const partName = await row.locator('td').nth(1).textContent();
                let partNameCell = await row.locator('td').nth(1);

                // Compare the extracted values
                if (partName?.trim() === selectedPartName) {
                    isRowFound = true;
                    await partNameCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    logger.info(`Selected row found in row ${i + 1}`);
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
            await page.waitForTimeout(1000);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
            const buttonLabel = "Добавить";
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of CSS class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        //end adding СБ  
        //start adding Д   
        await allure.step("Step 16: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 17: Нажимаем по селектору из выпадающего списке \"Деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Деталь)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_Д}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        table2Locator = page.locator(`[data-testid="${CONST.MAIN_PAGE_Д_TABLE}"]`);
        await allure.step("Step 18: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");

            // Ensure search input is visible and ready
            const searchInput = table2Locator!.locator(`[data-testid="${CONST.TABLE_SEARCH_INPUT}"]`);
            await searchInput.waitFor({ state: 'visible', timeout: 10000 });

            // Clear any existing content
            await searchInput.clear();
            await page.waitForTimeout(500);

            // Fill the search input
            await searchInput.fill(CONST.TESTCASE_2_PRODUCT_Д);
            await page.waitForTimeout(500);

            // Verify the input was filled correctly
            const inputValue = await searchInput.inputValue();
            console.log(`Search input value: "${inputValue}"`);
            expect(inputValue).toBe(CONST.TESTCASE_2_PRODUCT_Д);

            // Press Enter to perform search
            await searchInput.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);

            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator(`[data-testid="${CONST.TABLE_SEARCH_INPUT}"]`)).toBeVisible();
        });
        await allure.step("Step 19: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
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
            expect(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_Д);
        });
        await allure.step("Step 20: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 21: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
            const buttonLabel = "Добавить";
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of class selectors
                await page.waitForTimeout(500);
                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 22: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartName = CONST.TESTCASE_2_PRODUCT_Д; // Replace with actual part number
            // Locate the bottom table
            const modalСБ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modalСБ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;

            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Extract the partNumber from the input field in the first cell
                const partName = await row.locator('td').nth(1).textContent();
                let partNameCell = await row.locator('td').nth(1);

                // Compare the extracted values
                if (partName?.trim() === selectedPartName) {
                    isRowFound = true;
                    await partNameCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    logger.info(`Selected row found in row ${i + 1}`);
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
            await page.waitForTimeout(1000);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 23: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
            const buttonLabel = "Добавить";
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of CSS class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 24: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        // End adding Д
        //start adding Cтандартную или покупную деталь
        await allure.step("Step 26: Нажимаем по Кнопка из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the Кнопка from the list \"Cтандартную или покупную деталь\".)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        let modalПД = await page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
        table3Locator = modalПД.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 27: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await table3Locator!.locator('input.search-yui-kit__input').fill(CONST.TESTCASE_2_PRODUCT_ПД);
            await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            // Optionally, validate that the search input is visible
            await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 28: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForTimeout(500);
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
            await page.waitForTimeout(500);
            // Confirm that the first cell contains the search term
            expect(firstCellValue).toContain(CONST.TESTCASE_2_PRODUCT_ПД);
        });
        await allure.step("Step 29: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
        await allure.step("Step 30: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
            const buttonLabel = "Добавить";
            let expectedState = true;
            await page.waitForTimeout(500);
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 31: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_ПД; // Replace with actual part number
            // Locate the bottom table
            const modalПД2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modalПД2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                let partNumberCell = await row.locator('td').nth(1);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber) {
                    isRowFound = true;
                    await partNumberCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    logger.info(`Selected row found in row ${i + 1}`);
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
            await page.waitForTimeout(500);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 32: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
            const buttonLabel = "Добавить";
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of CSS class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 33: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        //end adding Cтандартную или покупную деталь
        //start adding Расходный материал
        await allure.step("Step 34: Нажимаем по Кнопка из выпадающего списке \"Расходный материал\". (Click on the Кнопка from the list \"Расходный материал\".)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            await page.waitForTimeout(500);
            //add
            addButton.click();
            await page.waitForTimeout(500);
        });
        let modalРМ = await page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
        table3Locator = modalРМ.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 35: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await table3Locator!.locator('input.search-yui-kit__input').fill(CONST.TESTCASE_2_PRODUCT_РМ);
            await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 36: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Get the value of the second cell in the first row
            secondCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
            const secondCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
            await secondCell.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            secondCellValue = secondCellValue.trim();
            // Get the value of the second cell in the first row

            // Confirm that the first cell contains the search term
            expect(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_РМ);
        });
        await allure.step("Step 37: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
        await allure.step("Step 38: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
            const buttonLabel = "Добавить";
            let expectedState = true;
            await page.waitForTimeout(500);
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "red";
                button.style.border = "2px solid red";
                button.style.color = "white";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 39: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_РМ; // Replace with actual part number
            // Locate the bottom table
            const modalРМ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modalРМ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                let partNumberCell = await row.locator('td').nth(1);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber) {
                    isRowFound = true;
                    await partNumberCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    logger.info(`Selected row found in row ${i + 1}`);
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
            await page.waitForTimeout(500);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 40: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
            const buttonLabel = "Добавить";
            let expectedState = true;
            await page.waitForTimeout(500);
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of CSS class selectors


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonDataTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
            const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
            // Highlight button for debugging
            await buttonLocator2.evaluate((button) => {
                button.style.backgroundColor = "green";
                button.style.border = "2px solid red";
                button.style.color = "blue";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });


        await allure.step("Step 42: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(500);
            button.click();
            await page.waitForTimeout(2000);
        });
        await allure.step("Step 43: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            tableData_temp = await shortagePage.parseStructuredTable(page, CONST.EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nestedArray = tableData_temp.map(group => group.items).flat();
            let quantity1 = 0;
            let quantity2 = 0;
            let quantity3 = 0;
            let quantity4 = 0;
            let quantity: boolean = false;
            const result1 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_СБ); // Output: true
            if (result1) {
                quantity1 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_СБ)
                logger.info(quantity1);
            }
            const result2 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_Д); // Output: true
            if (result2) {
                quantity2 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_Д)
                logger.info(quantity2);
            }
            const result3 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_ПД); // Output: true
            if (result3) {
                quantity3 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_ПД)
                logger.info(quantity3);
            }
            const result4 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_РМ); // Output: true
            if (result4) {
                quantity4 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_РМ)
                logger.info(quantity4);
            }
            if (quantity1 == 6 && quantity2 == 6 && quantity3 == 6 && quantity4 == 6) {
                quantity = true;
            }
            expect(result1 && result2 && result3 && result4 && quantity).toBeTruthy();
        });
    });
    test("TestCase 19 - cleanup (Return to original state)", async ({ page }) => {
        await allure.step("Step 01: Navigate (Navigation)", async () => {
            // Placeholder for test logic: Open the parts database page      
            test.setTimeout(90000);
            const shortagePage = new CreatePartsDatabasePage(page);
            // Placeholder for test logic: Open the parts database page
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
            });
        });
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });
        await allure.step("Step 03: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 04: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
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
            const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Sub Step 1 : Remove СБ . (Remove \"СБ\".)", async () => {
            await allure.step("Step 01: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(500);
            });
            //start remove СБ
            await allure.step("Step 02: Нажимаем по селектору из выпадающего списке \"СБ\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
                await page.waitForLoadState("networkidle");
                const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(5000);
            });
            await allure.step("Step 03: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");

                const selectedPartName = CONST.TESTCASE_2_PRODUCT_СБ; // Replace with actual part number
                // Locate the bottom table
                const modalСБ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalСБ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partName = await row.locator('td').nth(1).textContent();
                    let partNameCell = await row.locator('td').nth(1);

                    // Compare the extracted values
                    if (partName?.trim() === selectedPartName) {
                        isRowFound = true;
                        await partNameCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        //delete the row
                        let deleteCell = await row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
                await page.waitForTimeout(500);
                // Assert that the selected row is found
                expect(isRowFound).toBeTruthy();
            });
            await allure.step("Step 04: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of CSS class selectors

                    const shortagePage = new CreatePartsDatabasePage(page);
                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Use data-testid instead of class
                        buttonLabel,
                        expectedState
                    );
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
                const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                // Highlight button for debugging
                await buttonLocator2.evaluate((button) => {
                    button.style.backgroundColor = "black";
                    button.style.border = "2px solid red";
                    button.style.color = "blue";
                });

                // Perform click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });
        });
        // End Remove СБ
        //Start remove Д
        await allure.step("Step 08: Sub Step 2 : Remove Д -. (Remove \"Д\".)", async () => {
            await allure.step("Step 01: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(500);
            });
            //start remove ПЛ
            await allure.step("Step 02: Нажимаем по селектору из выпадающего списке \"Д\". (Click on the selector from the drop-down list \"(type Д)\".)", async () => {
                await page.waitForLoadState("networkidle");
                const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_Д}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(5000);
            });
            await allure.step("Step 03: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");

                const selectedPartName = CONST.TESTCASE_2_PRODUCT_Д; // Replace with actual part number
                // Locate the bottom table
                const modalСБ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalСБ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the partNumber from the input field in the first cell
                    const partName = await row.locator('td').nth(1).textContent();
                    let partNameCell = await row.locator('td').nth(1);

                    // Compare the extracted values
                    if (partName?.trim() === selectedPartName) {
                        isRowFound = true;
                        await partNameCell.evaluate((row) => {
                            row.style.backgroundColor = 'yellow';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        //delete the row
                        let deleteCell = await row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
                await page.waitForTimeout(500);
                // Assert that the selected row is found
                expect(isRowFound).toBeTruthy();
            });
            await allure.step("Step 04: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of CSS class selectors

                    const shortagePage = new CreatePartsDatabasePage(page);
                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Use data-testid instead of class
                        buttonLabel,
                        expectedState
                    );
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
                const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                // Highlight button for debugging
                await buttonLocator2.evaluate((button) => {
                    button.style.backgroundColor = "green";
                    button.style.border = "2px solid red";
                    button.style.color = "blue";
                });

                // Perform click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });
        });
        // End remove Д
        // Start Remove ПД
        await allure.step("Step 08: Sub Step 3 : Remove ПД -. (Remove \"ПД\".)", async () => {
            await allure.step("Step 01: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(500);
            });
            //start remove ПЛ
            await allure.step("Step 02: Нажимаем по селектору из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Cтандартную или покупную деталь)\".)", async () => {
                await page.waitForLoadState("networkidle");
                const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(5000);
            });
            await allure.step("Step 03: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");

                const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_ПД; // Replace with actual part number
                // Locate the bottom table
                const modalПД2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalПД2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                    let partNumberCell = await row.locator('td').nth(1);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'yellow';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        //delete the row
                        let deleteCell = await row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
                await page.waitForTimeout(500);
                // Assert that the selected row is found
                expect(isRowFound).toBeTruthy();
            });
            await allure.step("Step 04: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of CSS class selectors

                    const shortagePage = new CreatePartsDatabasePage(page);
                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Use data-testid instead of class
                        buttonLabel,
                        expectedState
                    );
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
                const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                // Highlight button for debugging
                await buttonLocator2.evaluate((button) => {
                    button.style.backgroundColor = "green";
                    button.style.border = "2px solid red";
                    button.style.color = "blue";
                });

                // Perform click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });
        });
        // End remove ПД
        // Start Remove РМ
        await allure.step("Step 08: Sub Step 4: Remove РМ -. (Remove \"РМ\".)", async () => {
            await allure.step("Step 01: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const addButton = page.locator(`[data-testid="${CONST.EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 02: Нажимаем по селектору из выпадающего списке \"РМ\". (Click on the selector from the drop-down list \"РМ\".)", async () => {
                await page.waitForLoadState("networkidle");
                const addButton = page.locator(`div[data-testid="${CONST.MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(5000);
            });
            await allure.step("Step 03: Ensure the selected row is now showing in the bottom table", async () => {
                // Wait for the page to load
                await page.waitForLoadState("networkidle");

                const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_РМ; // Replace with actual part number
                // Locate the bottom table
                const modalРМ2 = await page.locator(`dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modalРМ2.locator(`table[data-testid="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                    let partNumberCell = await row.locator('td').nth(1);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'yellow';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        //delete the row
                        let deleteCell = await row.locator('td').nth(4);
                        deleteCell.click();
                        await page.waitForTimeout(500);
                        break;
                    }
                }
                await page.waitForTimeout(500);
                // Assert that the selected row is found
                expect(isRowFound).toBeTruthy();
            });
            await allure.step("Step 04: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of CSS class selectors

                    const shortagePage = new CreatePartsDatabasePage(page);
                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Use data-testid instead of class
                        buttonLabel,
                        expectedState
                    );
                    expect(isButtonReady).toBeTruthy();
                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
                const buttonLocator2 = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                // Highlight button for debugging
                await buttonLocator2.evaluate((button) => {
                    button.style.backgroundColor = "green";
                    button.style.border = "2px solid red";
                    button.style.color = "blue";
                });

                // Perform click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });
        });
        await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(500);
        });
    });
}
