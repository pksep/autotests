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

export const runU004_4 = () => {
    logger.info(`Starting test U004`);


    test("TestCase 07 - Редактирование изделия - Сравниваем комплектацию (Edit an Existing Детайл - Comparing the complete set)", async ({ page }) => {

        test.setTimeout(90000);
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
            await page.waitForTimeout(1500);
        });

        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            const itemsToAdd = [
                { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_Д, dialogTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_Д_TABLE, searchValue: TESTCASE_2_PRODUCT_Д, bottomTableTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'Д' }
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
        });

        await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            table_before_changequantity = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            value_before_changequantity = await shortagePage.getQuantityByLineItem(table_before_changequantity, TESTCASE_2_PRODUCT_Д);
            logger.info(value_before_changequantity);
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(1500);

        });
        await allure.step("Step 10: reload the page. (reload the page)", async () => {

            await page.reload();

        });
        await allure.step("Step 11: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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

        await allure.step("Step 12: Нажимаем по селектору из выпадающего списке \"Деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Деталь)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_Д}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(1000);
        });
        await allure.step("Step 13: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartName = TESTCASE_2_PRODUCT_Д; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
            await modal.evaluate((element: HTMLElement) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "red";
            });
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
            await bottomTableLocator.evaluate((element: HTMLElement) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "blue";
            });
            await page.waitForTimeout(500);
            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;

            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);
                await page.waitForTimeout(500);
                // Extract the partNumber from the input field in the first cell
                const partName = await row.locator('td').nth(1).textContent();
                await page.waitForTimeout(500);
                let partNameCell = await row.locator('td').nth(1);
                await partNameCell.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                // Compare the extracted values
                if (partName?.trim() === selectedPartName) {
                    isRowFound = true;
                    //table_before_changequantity = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
                    //value_before_changequantity = await shortagePage.getQuantityByLineItem(table_before_changequantity, TESTCASE_2_PRODUCT_Д)
                    expect(value_before_changequantity).toBe(1);

                    logger.info(value_before_changequantity);
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

            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 14: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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

            // Perform hover and click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 15: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(1500);
        });
        await allure.step("Step 16: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(1500);
        });
        await allure.step("Step 17: извлечь основную таблицу продуктов и сохранить ее в массиве. (extract the main product table and store it in an array)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 18: проверьте, что количество обновлено. (check that the quantity has been updated)", async () => {
            await page.waitForLoadState("networkidle");

            const after = await shortagePage.getQuantityByLineItem(tableData_full, TESTCASE_2_PRODUCT_Д);
            expect(after).toBe(value_before_changequantity + 5);

        });
    });
    test("TestCase 08 - cleanup (Return to original state)", async ({ page }) => {
        // Placeholder for test logic: Open the parts database page      
        test.setTimeout(90000);

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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 10: Убедиться, что выбранная строка теперь отображается в нижней таблице (Ensure the selected row is now showing in the bottom table)", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");

            const selectedPartNumber = TESTCASE_2_PRODUCT_Д; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
            await page.waitForTimeout(1000);
            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

            let isRowFound = false;

            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);
                await page.waitForTimeout(500);
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
                    //qty_value_after_change = await inputField.inputValue();

                    // Update the value of the input field

                    logger.info(value_before_changequantity);
                    await inputField.fill(value_before_changequantity.toString());//value_before_changequantity = 1
                    //await inputField.fill(value_before_changequantity.toString());
                    //await inputField.fill('1');
                    await page.waitForTimeout(1500);
                    break;
                }
            }

            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();

        });
        await allure.step("Step 11: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
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

            // Perform hover and click actions
            await buttonLocator2.click();
            await page.waitForTimeout(1500);
        });

        await allure.step("Step 12: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            //
            button.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 13: извлечь основную таблицу продуктов и сохранить ее в массиве. (extract the main product table and store it in an array)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 14: проверьте, что количество обновлено. (check that the quantity has been updated)", async () => {
            await page.waitForLoadState("networkidle");

            const after = await shortagePage.getQuantityByLineItem(tableData_full, TESTCASE_2_PRODUCT_Д);
            logger.info(after);

            expect(after.toString()).toBe((value_before_changequantity).toString());

        });
        //await allure.step("Step 15: delete added detail. (delete added detail)", async () => {
        await allure.step("Step 15 substep 1: Открываем страницу базы деталей (Open the parts database page)", async () => {
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
        });
        await allure.step("Step 15 substep 2: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });
        await allure.step("Step 15 substep 3: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 15 substep 4: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        });
        await allure.step("Step 15 substep 5: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 15 substep 6: Нажимаем по найденной строке (Click on the found row in the table)", async () => {
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
        await allure.step("Step 15 substep 7: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button

            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        const itemsToRemove = [
            {
                smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_Д, // Identifies the "Деталь" button
                dialogTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG, // Modal dialog test ID
                bottomTableTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE, // Table in the modal
                removeButtonColumnIndex: 4, // Column index for the delete button
                searchValue: TESTCASE_2_PRODUCT_Д, // Part number to locate and remove
                returnButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON, // The ID of the button to return to the main page
                itemType: 'Д' // Type of item
            }
        ];

        for (const item of itemsToRemove) {
            const shortagePage = new CreatePartsDatabasePage(page);
            await shortagePage.removeItemFromSpecification(
                page,
                item.smallDialogButtonId,
                item.dialogTestId,
                item.bottomTableTestId,
                item.removeButtonColumnIndex,
                item.searchValue,
                item.returnButtonTestId,
                item.itemType
            );
        }
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
        //});
    });
}
