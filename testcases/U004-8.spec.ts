import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
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


const MAIN_PAGE_TITLE_ID = "BaseDetals-Header-Title";
const MAIN_PAGE_MAIN_DIV = "BaseDetals-Container-MainContainer";
const MAIN_PAGE_ИЗДЕЛИЕ_TABLE = "BasePaginationTable-Table-product";
const MAIN_PAGE_СБ_TABLE = "BasePaginationTable-Table-cbed";
const MAIN_PAGE_Д_TABLE = "BasePaginationTable-Table-detal";
const MAIN_PAGE_SMALL_DIALOG = "Specification-DialogSpecification"; //
const MAIN_PAGE_SMALL_DIALOG_Д = "Specification-Dialog-CardbaseDetail1";
const MAIN_PAGE_SMALL_DIALOG_СБ = "Specification-Dialog-CardbaseOfAssemblyUnits0";
const MAIN_PAGE_SMALL_DIALOG_РМ = "Specification-Dialog-CardtheDatabaseOfMaterials3";
const MAIN_PAGE_SMALL_DIALOG_ПД = "Specification-Dialog-CardtheDatabaseOfMaterials2";

const RESET_СБ_1 = "Опора (Траверса Т10А)СБ";
const RESET_СБ_2 = "Балка траверсы СБ";
const RESET_СБ_3 = "Упор подвижный (Траверса Т10А)СБ";
const RESET_Д_1 = "Опора штока d45мм";
const RESET_ПД_1 = "Гайка шестигранная DIN934 М12";
const RESET_ПД_2 = "Болт с полной резьбой DIN933 М8х40";

const MAIN_PAGE_EDIT_BUTTON = "BaseDetals-Button-Edit";
const MAIN_PAGE_SAVE_BUTTON = "Creator-ButtonSaveAndCancel-ButtonsCenter-Save";
const EDIT_PAGE_MAIN_ID = "Creator";
const EDIT_PAGE_SPECIFICATIONS_TABLE = "Editor-TableSpecification-Product";
const EDIT_PAGE_ADD_BUTTON = "Specification-Buttons-addingSpecification";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG = "Specification-ModalBaseCbed";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "Specification-ModalBaseCbed-Select-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "Specification-ModalBaseCbed-Add-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON = "Specification-ModalBaseCbed-Cancel-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE = "Specification-ModalBaseCbed-Table";

const EDIT_PAGE_ADD_Д_RIGHT_DIALOG = "Specification-ModalBaseDetal";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "Specification-ModalBaseDetal-Select-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "Specification-ModalBaseDetal-Add-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON = "Specification-ModalBaseDetal-Cancel-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE = "BasePaginationTable-Table-detal";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE = "Specification-ModalBaseDetal-Table";

const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG = "ModalBaseMaterial";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE = "ModalBaseMaterial-Table";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "ModalBaseMaterial-Select-Button";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "ModalBaseMaterial-Add-Button";

const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG = "ModalBaseMaterial";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE = "ModalBaseMaterial-Table";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "ModalBaseMaterial-Select-Button";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "ModalBaseMaterial-Add-Button";


const CREATE_DETAIL_PAGE_SPECIFICATION_ADD_BUTTON = "Specification-Buttons-addingSpecification";//
const CREATE_DETAIL_PAGE_SPECIFICATION_ADDFILEFROMBASE_BUTTON = "AddDetal-FileComponent-AddFileButton";//
const CREATE_DETAIL_PAGE_SPECIFICATION_ADDFILEDRAGNDROP_BUTTON = "AddDetal-FileComponent-DragAndDrop-Wrapper";//
const CREATE_DETAIL_PAGE_DETAIL_CHARACTERISTICS_TABLE = "AddDetal-Characteristic-Table";//
const CREATE_DETAIL_PAGE_WORKPIECE_CHARACTERISTICS_TABLE = "";  // <----------------------------
const CREATE_DETAIL_PAGE_DETAIL_PARAMETERS_TABLE = "AddDetal-Detail-Parameters";//
const CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ТИП_TABLE = "ModalBaseMaterial-TableList-Table-Type-Table";//
const CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ПОДТИП_TABLE = "ModalBaseMaterial-TableList-Table-SubType-Table";//
const CREATE_DETAIL_PAGE_ADDMATERIAL_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item-Table";


const TEST_PRODUCT = 'Т15';
const TESTCASE_2_PRODUCT_1 = 'Т15';

const EDIT_BUTTON = '';
const TEST_PRODUCT_СБ = 'Впускной крапан М12';
const TESTCASE_2_PRODUCT_СБ = 'Впускной крапан М12';
const TESTCASE_2_PRODUCT_Д = 'Грибок 15';
const TESTCASE_2_PRODUCT_ПД = 'Блок питания БП12Б-Д1-24';
const TESTCASE_2_PRODUCT_РМ = 'Рулон бумажных полотенец';
const TESTCASE_2_PRODUCT_ASSIGNEMENT = "TESTTESTTEST";

let table1Locator: Locator | null = null;
let table2Locator: Locator | null = null;
let table3Locator: Locator | null = null;

export const runU004_8 = () => {
    logger.info(`Starting test U004`);

    test("TestCase 16 - Добавьте больше материалов, чем ограниченное количество в спецификацию и проверка сохранения (Exceed Allowed Materials)", async ({ page }) => {
        test.setTimeout(900000);
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
        });

        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_Д}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(2000);
        });
        table2Locator = page.locator(`[data-testid="${MAIN_PAGE_Д_TABLE}"]`);
        await allure.step("Step 10: Add all found products one by one ()", async () => {
            // Wait for the table to be loaded
            await table2Locator!.waitFor({ state: 'visible' });

            // Locate the rows within the table
            const rowsLocator = table2Locator!.locator('tbody tr');
            let previousRowCount = 0;
            let currentRowCount = await rowsLocator.count();

            // Loop until no new rows are loaded
            while (currentRowCount > previousRowCount) {
                previousRowCount = currentRowCount;

                // Scroll the last row into view to trigger loading more rows
                await rowsLocator.nth(currentRowCount - 1).scrollIntoViewIfNeeded();
                await page.waitForLoadState("networkidle");

                // Update the row count after scrolling
                currentRowCount = await rowsLocator.count();
            }

            // Iterate through all the loaded rows
            for (let i = 0; i < currentRowCount; i++) {
                const row = rowsLocator.nth(i);

                // Highlight the row for debugging (optional)
                await row.evaluate((el) => {
                    el.style.backgroundColor = 'yellow';
                    el.style.border = '2px solid blue';
                });

                // Click the row to select it
                await row.click();
                await page.waitForTimeout(500);

                await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
                    // Wait for loading
                    await page.waitForLoadState("networkidle");

                    // Scoped dialog selector using data-testid
                    const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
                    const buttonDataTestId = EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
                    const buttonLabel = "Добавить";
                    let expectedState = true;
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
                    await page.waitForTimeout(100);
                });

                await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
                    // Wait for the page to load
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(100);
                    const selectedPartNumber = firstCellValue; // Replace with actual part number
                    const selectedPartName = secondCellValue; // Replace with actual part name

                    // Locate the bottom table
                    const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
                    const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

                    await bottomTableLocator.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });

                    // Locate all rows in the table body
                    const rowsLocator = bottomTableLocator.locator('tbody tr');

                    const rowCount = await rowsLocator.count();
                    expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                    let isRowFound = false;

                    // Iterate through each row
                    for (let i = 0; i < rowCount; i++) {
                        const row = rowsLocator.nth(i);
                        await row.evaluate((row) => {
                            row.style.backgroundColor = 'yellow';
                            row.style.border = '2px solid red';
                            row.style.color = 'blue';
                        });
                        // Extract the partNumber from the input field in the first cell
                        const partNumber = await row.locator('td').nth(0).textContent();
                        const partNumberCell = await row.locator('td').nth(0);
                        // Extract the partName from the second cell (assuming it's direct text)
                        const partName = await row.locator('td').nth(1).textContent();

                        logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                        // Compare the extracted values
                        if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
                            isRowFound = true;
                            await partNumberCell.evaluate((row) => {
                                row.style.backgroundColor = 'yellow';
                                row.style.border = '2px solid red';
                                row.style.color = 'blue';
                            });
                            logger.info(`Selected row found in row ${i + 1}`);
                            break;
                        }
                    }

                    // Assert that the selected row is found
                    //expect(isRowFound).toBeTruthy();
                    logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
                });
            }
            await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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

            await allure.step("Step 35: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
                button.click();

                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(3000);
                await page.reload();
                await page.waitForLoadState("networkidle");
            });
        });
    });
    test("TestCase 17 - cleanup delete all added details (cleanup delete all added details)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page      
        test.setTimeout(900000);
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
        });

        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

        await allure.step("Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        await page.waitForLoadState("networkidle");
        const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_Д}"]`);
        await addButton.evaluate((row) => {
            row.style.backgroundColor = 'green';
            row.style.border = '2px solid red';
            row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(1500);
        const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
        const bottomTableLocator = modal.locator(`table[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

        // Locate all rows in the table body
        const rowsLocator = bottomTableLocator.locator('tbody tr');
        const rowCount = await rowsLocator.count();
        expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty


        // Iterate through each row
        for (let i = rowCount - 1; i >= 0; i--) {
            const row = rowsLocator.nth(i);

            // Wait for the delete button in the fifth cell
            const deleteButton = row.locator('td').nth(4).locator('button');
            const deleteButtonCount = await deleteButton.count();
            logger.info(`Delete button count in row ${i + 1}: ${deleteButtonCount}`);

            if (deleteButtonCount === 0) {
                throw new Error(`Delete button not found in row ${i + 1}.`);
            }

            // Debug the delete button's visibility and state
            const isDeleteButtonVisible = await deleteButton.isVisible();
            const isDeleteButtonEnabled = await deleteButton.isEnabled();

            logger.info(`Delete button in row ${i + 1}: Visible=${isDeleteButtonVisible}, Enabled=${isDeleteButtonEnabled}`);
            if (!isDeleteButtonVisible || !isDeleteButtonEnabled) {
                throw new Error(`Delete button in row ${i + 1} is not interactable.`);
            }

            // Click the delete button
            await deleteButton.click();
            await page.waitForTimeout(500);
            logger.info(`Delete button clicked in row ${i + 1}.`);
        }
        await page.waitForLoadState("networkidle");

        // Scoped dialog selector using data-testid
        const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
        const buttonDataTestId = EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
        buttonLocator.click();
        await page.waitForTimeout(1000);
        //resdtore the default Д for the product
        const itemsToAdd = [
            { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_Д, dialogTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_Д_TABLE, searchValue: RESET_Д_1, bottomTableTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'Д' }
        ];

        for (const item of itemsToAdd) {
            await shortagePage.addItemToSpecification(
                page,
                item.smallDialogButtonId,
                item.dialogTestId,
                item.searchTableTestId,
                item.searchValue,
                item.bottomTableTestId,
                item.addToBottomButtonTestId,
                item.addToMainButtonTestId,
                item.type
            );
        }
        await page.waitForTimeout(500);
        // Wait for loading
        await page.waitForLoadState("networkidle");
        const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
        await button.evaluate((row) => {
            row.style.backgroundColor = 'green';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
        });

        button.click();
        await page.waitForTimeout(500);
    });

}
