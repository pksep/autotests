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
const MAIN_PAGE_SMALL_DIALOG = "Spectification-DialogSpecification"; //
const MAIN_PAGE_SMALL_DIALOG_Д = "Spectification-Dialog-CardbaseDetail1";
const MAIN_PAGE_SMALL_DIALOG_СБ = "Spectification-Dialog-CardbaseOfAssemblyUnits0";
const MAIN_PAGE_SMALL_DIALOG_РМ = "Spectification-Dialog-CardtheDatabaseOfMaterials3";
const MAIN_PAGE_SMALL_DIALOG_ПД = "Spectification-Dialog-CardtheDatabaseOfMaterials2";

const RESET_СБ_1 = "Опора (Траверса Т10А)СБ";
const RESET_СБ_2 = "Балка траверсы СБ";
const RESET_СБ_3 = "Упор подвижный (Траверса Т10А)СБ";
const RESET_Д_1 = "Опора штока d45мм";
const RESET_ПД_1 = "Гайка шестигранная DIN934 М12";
const RESET_ПД_2 = "Болт с полной резьбой DIN933 М8х40";

const MAIN_PAGE_EDIT_BUTTON = "BaseDetals-Button-Edit";
const MAIN_PAGE_SAVE_BUTTON = "Creator-ButtonSaveAndCancel-ButtonsCenter-Save";
const EDIT_PAGE_MAIN_ID = "Creator";
const EDIT_PAGE_SPECIFICATIONS_TABLE = "Spectification-TableSpecification-Product";
const EDIT_PAGE_ADD_BUTTON = "Spectification-Buttons-addingSpecification";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG = "Spectification-ModalBaseCbed";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "Spectification-ModalBaseCbed-Select-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "Spectification-ModalBaseCbed-Add-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON = "Spectification-ModalBaseCbed-Cancel-Button";
const EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE = "Spectification-ModalBaseCbed-Table";

const EDIT_PAGE_ADD_Д_RIGHT_DIALOG = "Spectification-ModalBaseDetal";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "Spectification-ModalBaseDetal-Select-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "Spectification-ModalBaseDetal-Add-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON = "Spectification-ModalBaseDetal-Cancel-Button";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE = "BasePaginationTable-Table-detal";
const EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE = "Spectification-ModalBaseDetal-Table";

const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG = "ModalBaseMaterial";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item-Table";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE = "ModalBaseMaterial-Table";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "ModalBaseMaterial-Select-Button";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "ModalBaseMaterial-Add-Button";

const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG = "ModalBaseMaterial";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item-Table";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE = "ModalBaseMaterial-Table";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "ModalBaseMaterial-Select-Button";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "ModalBaseMaterial-Add-Button";


const CREATE_DETAIL_PAGE_SPECIFICATION_ADD_BUTTON = "Spectification-Buttons-addingSpecification";//
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

export const runU004_3 = () => {
    logger.info(`Starting test U004`);


    test("TestCase 05 - Adding All Material Types at Once", async ({ page }) => {
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Добавить СБ к товару (Add СБ to the product and save)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
            });
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

            await allure.step("Step 08: Add and Validate Items in Specifications", async () => {
                const itemsToAdd = [
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_СБ, dialogTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_СБ_TABLE, searchValue: TEST_PRODUCT_СБ, bottomTableTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'СБ' }
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


        });
        await allure.step("Step 002: Добавить Д к товару (Add Д to the product and save)", async () => {
            await allure.step("Step 08: Add and Validate Items in Specifications", async () => {
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
        });
        await allure.step("Step 003: Добавить ПД к товару (Add ПД to the product and save)", async () => {

            await allure.step("Step 08: Add and Validate Items in Specifications", async () => {
                const itemsToAdd = [
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_ПД, dialogTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG, searchTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE, searchValue: TESTCASE_2_PRODUCT_ПД, bottomTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'ПД' }

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
        });
        await allure.step("Step 004: Добавить РМ к товару (Add РМ to the product and save)", async () => {
            await allure.step("Step 08: Add and Validate Items in Specifications", async () => {
                await page.waitForTimeout(5000);
                const itemsToAdd = [
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_РМ, dialogTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG, searchTableTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE, searchValue: TESTCASE_2_PRODUCT_РМ, bottomTableTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'РМ' }

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


        });
        await allure.step("Step 005: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
        await allure.step("Step 006: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);

        });
        await allure.step("Step 007: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)", async () => {
            await page.waitForLoadState("networkidle");
            const nestedArray = tableData_full.map(group => group.items).flat();

            const result1 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_СБ); // Output: true
            const result2 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_Д); // Output: true
            const result3 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ПД); // Output: true
            const result4 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true
            logger.info(result1);
            logger.info(result2);
            logger.info(result3);
            logger.info(result4);
            expect(result1 && result2 && result3 && result4).toBeTruthy();
        });
    });
    test("TestCase 06 - Очистка после теста. (Cleanup after test)", async ({ page }) => {
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Find Specification к товару (find Specification product)", async () => {
            await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
                await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
            });

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
        });
        await allure.step("Step 002: Очистка после теста. (Cleanup after test)", async () => {
            //remove the item we added СБ
            await allure.step("Step 002 sub step 1: Remove СБ", async () => {
                const itemsToRemove = [
                    {
                        smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_СБ, // Button to open the dialog for "Сборочную единицу"
                        dialogTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG, // Modal dialog test ID
                        bottomTableTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE, // Bottom table test ID in the modal
                        removeButtonColumnIndex: 4, // Column index for the delete button
                        searchValue: TEST_PRODUCT_СБ, // The specific part number to locate
                        returnButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, // The ID of the button to return to the main page
                        itemType: 'СБ' // Item type
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
                        item.returnButtonTestId, // Pass the returnButtonTestId here
                        item.itemType
                    );
                }

            });

            await allure.step("Step 002 sub step 2: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                await page.waitForLoadState("networkidle");
                const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });

                button.click();
                await page.waitForTimeout(1500);
            });
            ////////////////// end of СБ deletion
            //remove the item we added Д
            await allure.step("Step 002 sub step 3: Remove Д", async () => {
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
                    await page.waitForTimeout(500);
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

            });


            await allure.step("Step 002 sub step 4: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                await page.waitForLoadState("networkidle");
                const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(500);

                button.click();
                await page.waitForTimeout(2000);
            });
            ///// end of Д removal
            await page.reload();
            //remove the item we added ПД
            await allure.step("Step 002 sub step 5: Remove ПД", async () => {
                const itemsToRemove = [
                    {
                        smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_ПД, // Button to open the dialog for "Стандартную или покупную деталь"
                        dialogTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG, // Test ID for the modal dialog
                        bottomTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE, // Table test ID in the modal
                        removeButtonColumnIndex: 4, // Column index for the delete button
                        searchValue: TESTCASE_2_PRODUCT_ПД, // The part number to locate and remove
                        returnButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON, // The ID of the button to return to the main page
                        itemType: 'ПД' // Item type
                    }
                ];

                for (const item of itemsToRemove) {
                    await page.waitForTimeout(500);
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

            });
            await allure.step("Step 002 sub step 6: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                await page.waitForLoadState("networkidle");
                const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(500);

                button.click();
                await page.waitForTimeout(2000);
            });
            ////////////////// end of ПД deletion
            ///////////// start РМ deletion
            await page.reload();
            //remove the item we added РМ
            await allure.step("Step 002 sub step 7: Remove РМ", async () => {
                const itemsToRemove = [
                    {
                        smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_РМ, // Button to open the dialog for "Расходный материал"
                        dialogTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG, // Modal dialog test ID
                        bottomTableTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE, // Bottom table test ID in the modal
                        removeButtonColumnIndex: 4, // Column index for the delete button
                        searchValue: TESTCASE_2_PRODUCT_РМ, // The part number to locate and remove
                        returnButtonTestId: EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, // The ID of the button to return to the main page
                        itemType: 'РМ' // Item type
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

            });


            await allure.step("Step 002 sub step 8: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                await page.waitForLoadState("networkidle");
                const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                await page.waitForTimeout(500);

                button.click();
                await page.waitForTimeout(2000);
            });
            ////////////////// end of РМ deletion
        });

    });
}
