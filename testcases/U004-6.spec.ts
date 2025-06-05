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
const EDIT_PAGE_SPECIFICATIONS_TABLE = "Specification-TableSpecification-Product";
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
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item-Table";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE = "ModalBaseMaterial-Table";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON = "ModalBaseMaterial-Select-Button";
const EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON = "ModalBaseMaterial-Add-Button";

const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG = "ModalBaseMaterial";
const EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE = "ModalBaseMaterial-TableList-Table-Item-Table";
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

export const runU004_6 = () => {
    logger.info(`Starting test U004`);



    test("TestCase 11 - Delete a Material Before Saving", async ({ page }) => { /// INCOMPLETE DUE TO BUG
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
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
            await page.waitForTimeout(500);
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            await page.waitForTimeout(500);
            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            await page.waitForTimeout(500);
            addButton.click();
            await page.waitForTimeout(500);

        });

        await allure.step("Step 09: Нажимаем по Кнопка из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the Кнопка from the list \"Cтандартную или покупную деталь\".)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        const modal = await page.locator(`[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
        table3Locator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_ПД);
            await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Optionally, validate that the search input is visible
            await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 14: Убедитесь, что выбранная строка теперь отображается в нижней таблице. (Ensure the selected row is now showing in the bottom table)", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const selectedPartNumber = firstCellValue; // Replace with actual part number

            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
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


                logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber) {
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
            await page.waitForTimeout(3000);
            // Assert that the selected row is found
            expect(isRowFound).toBeTruthy();
            logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
        });
        await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
        await allure.step("Step 16: Захват таблицы и сохранение ее в массиве. (Capture table and store it in an array)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 17: Подтвердите, что элемент теперь находится в массиве. (Confirm that the item is now in the array)", async () => {
            const nestedArray = tableData_full.map(group => group.items).flat();
            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ПД); // Output: true

            expect(result).toBeTruthy();
        });
        await allure.step("Step 18: Удалить элемент без сохранения. (Remove the item without saving)", async () => {
            //remove the item we added ПД
            await page.waitForLoadState("networkidle");
            await allure.step("Step 007 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });

                addButton.click();
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(500);
            });
            await allure.step("Step 007 sub step 2: find and click the Cтандартную или покупную деталь button", async () => {
                const add2Button = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 007 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TESTCASE_2_PRODUCT_ПД;

                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
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

                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)
                    //const partName = await row.locator('td').nth(2).textContent();

                    logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        const deleteCellValue = await row.locator('td').nth(4).textContent();

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

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
                    button.style.backgroundColor = "black";
                    button.style.border = "2px solid red";
                    button.style.color = "white";
                });

                // Perform hover and click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });

            await allure.step("Step 007 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
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
            ////////////////// end of ПД deletion                
        });
        await allure.step("Step 19: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
        await allure.step("Step 20: Захват таблицы и сохранение ее в массиве. (Capture table and store it in an array)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 21: Подтвердите, что элемент теперь НЕ находится в массиве. (Confirm that the item is now NOT in the array)", async () => {
            const nestedArray = tableData_full.map(group => group.items).flat();
            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ПД); // Output: true

            expect(result).toBeFalsy();
        });
    });
    test("TestCase 12 - Удалить сохраненный материал (Remove Saved Material)", async ({ page }) => {
        //first add a material
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';

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
        await allure.step("Step 09: Нажимаем по Кнопка из выпадающего списке \"Расходный материал\". (Click on the Кнопка from the list \"Расходный материал\".)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
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
        const modal = await page.locator(`[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
        table3Locator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_РМ);
            await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 13: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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
                button.style.backgroundColor = "red";
                button.style.border = "2px solid red";
                button.style.color = "white";
            });

            // Perform click actions
            await buttonLocator2.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const selectedPartNumber = firstCellValue; // Replace with actual part number

            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
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


                logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                // Compare the extracted values
                if (partNumber?.trim() === selectedPartNumber) {
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
            await page.waitForTimeout(500);
            // Assert that the selected row is found
            //expect(isRowFound).toBeTruthy();
            logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
        });
        await allure.step("Step 15: Нажимаем по bottom кнопке \"Добавить\" в модальном окне (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
            await buttonLocator2.hover();
            await buttonLocator2.click();
            await page.waitForTimeout(1000);
        });

        //second save
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
        //third refresh and confirm saved
        await allure.step("Step 17: refresh and confirm saved. (refresh and confirm saved)", async () => {
            await page.reload({
                timeout: 5000, // Sets a 500ms timeout
                waitUntil: 'networkidle', // Waits until the page reaches network idle state
            });
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            await page.waitForLoadState("networkidle");
            const nestedArray = tableData_full.map(group => group.items).flat();
            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true			
            expect(result).toBeTruthy();
        });
        //fourth delete and save
        await allure.step("Step 18: delete and save. (delete and save)", async () => {
            test.setTimeout(90000);
            const shortagePage = new CreatePartsDatabasePage(page);
            const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
            let firstCellValue = '';
            let secondCellValue = '';
            let thirdCellValue = '';
            await page.reload();
            //remove the item we added ПД
            await page.waitForLoadState("networkidle");
            await allure.step("Step 18 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });

                addButton.click();
                await page.waitForTimeout(500);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 18 sub step 2: find and click the Расходный материал button", async () => {
                const add2Button = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'black';
                    row.style.border = '2px solid red';
                    row.style.color = 'white';
                });
                add2Button.click();
                await page.waitForTimeout(1000);
            });
            await allure.step("Step 18 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TESTCASE_2_PRODUCT_РМ; // Replace with actual part number

                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
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

                    const partNumberCell = await row.locator('td').nth(1);
                    // Extract the partName from the second cell (assuming it's direct text)
                    //const partName = await row.locator('td').nth(2).textContent();

                    logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
                        const deleteCellValue = await row.locator('td').nth(4).textContent();

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

            await allure.step("Step 18 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
                    button.style.backgroundColor = "black";
                    button.style.border = "2px solid red";
                    button.style.color = "white";
                });

                // Perform click actions
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });

            await allure.step("Step 18 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
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
            ////////////////// end of РМ deletion            
        });
        //fifth refresh and confirm deleted
        await allure.step("Step 19: refresh and confirm deleted. (refresh and confirm deleted)", async () => {
            await page.reload({
                timeout: 5000, // Sets a 500ms timeout
                waitUntil: 'networkidle', // Waits until the page reaches network idle state
            });
            await page.waitForTimeout(1500);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            await page.waitForLoadState("networkidle");
            const nestedArray = tableData_full.map(group => group.items).flat();
            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true			
            expect(result).toBeFalsy();
        });
    });

}
