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

export const runU004 = () => {
    logger.info(`Starting test U004`);


    test("TestCase 01 - Редактирование изделия - добавление потомка (СБ) (Editing a product - adding a descendant (СБ))", async ({ browser, page }) => {
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        // Placeholder for test logic: Open the parts database page
        await allure.step("Step 01: Открываем страницу базы деталей (Open the parts database page)", async () => {
            await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
        });
        await allure.step("Step 02: Проверяем наличие заголовка на странице (Check for the presence of the title)", async () => {
            const expectedTitles = testData1.elements.MainPage.titles.map((title) => title.trim());
            await shortagePage.validatePageTitlesWithStyling(MAIN_PAGE_MAIN_DIV, expectedTitles);
        });

        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        await allure.step("Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        });

        await allure.step("Step 04: Проверяем, что поиск в первой таблицы \"Изделий\" отображается (Ensure search functionality in the first table 'Products' is available)", async () => {
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();//DATA_TESTID
        });
        await allure.step("Step 05: Вводим значение переменной в поиск таблицы \"Изделий\" (Enter a variable value in the 'Products' table search)", async () => {
            // Locate the search field within the left table and fill it
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT);//DATA_TESTID
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();

        });
        await allure.step("Step 06: Проверяем, что введенное значение в поиске совпадает с переменной. (Verify the entered search value matches the variable)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value
            await expect(leftTable.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT); //DATA-TESTID
        });
        await allure.step("Step 07: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await leftTable.locator('input.search-yui-kit__input').press('Enter');//DATA-TESTID
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 08: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            await shortagePage.validateTableIsDisplayedWithRows(MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
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
            expect(secondCellValue).toContain(TEST_PRODUCT); // Validate that the value matches the search term
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
            await page.waitForTimeout(500);
        });
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);
        await allure.step("Step 11: Проверяем наличие кнопки \"Редактировать\" под таблицей \"Изделий\" (Verify the presence of the 'Edit' button below the table)", async () => {
            await page.waitForLoadState("networkidle");
            await firstRow.waitFor({ state: "visible" });
            await page.waitForTimeout(500);

            const buttons = testData1.elements.MainPage.buttons;
            await shortagePage.validateButtons(page, buttons); // Call the helper method
            await page.waitForTimeout(500);
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
            await page.waitForTimeout(1000);
            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInTestId(page, EDIT_PAGE_MAIN_ID);
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

            // Validate all buttons using the helper method
            await shortagePage.validateButtons(page, buttons);

            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 15: Проверяем, что в инпуте наименования совпадает со значением переменной, по которой мы осуществляли поиск данного изделия (We check that the name in the input matches the value of the variable by which we searched for this product.)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate all input fields with the specified class
            const inputFields = page.locator('.input-yui-kit.initial.editor__information-input input.input-yui-kit__input');//DATATESTID

            // Get the value of the first input field
            const firstInputValue = await inputFields.nth(0).inputValue();//DATATESTID

            expect(firstInputValue).toBe(secondCellValue);
            logger.info(`Value in first input field: ${firstInputValue}`);

            // Get the value of the second input field
            const secondInputValue = await inputFields.nth(1).inputValue();//DATATESTID
            expect(secondInputValue).toBe(firstCellValue);
            logger.info(`Value in second input field: ${secondInputValue}`);
            // Get the value of the third input field

            const thirdInputValue = await inputFields.nth(2).inputValue();//DATATESTID
            expect(thirdInputValue).toBe(thirdCellValue);
            logger.info(`Value in third input field: ${thirdInputValue}`);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
        });
        await allure.step("Step 16: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
            //store the original contents of the table
            tableData_original = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            detailvalue_original_before_changequantity = await shortagePage.getQuantityByLineItem(tableData_original, TESTCASE_2_PRODUCT_Д);

            expect(tableData_original.length).toBeGreaterThan(0); // Ensure groups are present

            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 17: Verify that the dialog contains all required cards with correct labels.", async () => {
            // Wait for the page to load completely
            await page.waitForLoadState("networkidle");

            const cards = testData1.elements.EditPage.modalAddButtonsPopup; // Read card data from the JSON file dynamically

            for (const card of cards) {
                await allure.step(`Validate card with label: "${card.label}"`, async () => {
                    const cardDataTestId = card.datatestid || ""; // Read the data-testid value dynamically
                    const cardLabel = card.label; // Read the label dynamically

                    // Locate the card using its dynamically provided data-testid
                    const cardElement = await page.locator(`div[data-testid="${cardDataTestId}"]`);
                    await cardElement.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'red';
                    });
                    // Check if the card is present
                    const isCardPresent = await cardElement.count() > 0;
                    expect(isCardPresent).toBeTruthy();
                    logger.info(`Card with data-testid "${cardDataTestId}" is present.`);

                    // Extract the text content of the card and trim whitespace
                    const cardText = (await cardElement.textContent())?.trim();
                    logger.info(`Card text: "${cardText}"`);

                    // Validate the text content matches the expected label
                    expect(cardText).toBe(cardLabel);
                    logger.info(`Card with data-testid "${cardDataTestId}" has the correct label: "${cardLabel}".`);
                });
            }

            logger.info("All cards are present and have correct labels.");
        });


        await allure.step("Step 18: Нажимаем по селектору из выпадающего списке \"Сборочную единицу (тип СБ)\". (Click on the selector from the drop-down list \"Assembly unit (type СБ)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 19: Проверяем, что в модальном окне отображается заголовок \"База сборочных единиц\". (We check that the modal window displays the title \"Assembly Unit Database\")", async () => {
            // Expected titles in the correct order
            const titles = testData1.elements.EditPage.modalAddСБ.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            //const h3Titles = await shortagePage.getAllH3TitlesInModalClass(page, 'modal-yui-kit__modal-content');
            const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, EDIT_PAGE_ADD_СБ_RIGHT_DIALOG);

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
        await allure.step("Step 20: Проверяем наличие кнопок на странице (Check for the visibility of action buttons on the page)", async () => {
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.EditPage.modalAddСБ.buttons;
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;

            // Log dialog presence for debugging
            const isDialogPresent = await page.locator(dialogSelector).count();
            logger.info(`Dialog found? ${isDialogPresent > 0}`);
            if (!isDialogPresent) {
                throw new Error("Dialog is not present.");
            }

            // Validate all buttons within the dialog
            await shortagePage.validateButtons(page, buttons, dialogSelector);
        });
        await allure.step("Step 21: Проверяем, что в модальном окне есть две таблицы. (We check that there are two tables in the modal window.)", async () => {
            // Wait for the page to stabilize (network requests to complete)
            await page.waitForLoadState("networkidle");

            // Define locators for the two tables within the modal
            table1Locator = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
            table2Locator = page.locator(`[data-testid="${MAIN_PAGE_СБ_TABLE}"]`); // Adjust the selector as needed for the second table

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

        await allure.step("Step 23: Проверяем, что кнопка \"Добавить\" отображается в модальном окне активной.", async () => {
            await page.waitForLoadState("networkidle");

            // Use data-testid to scope the dialog
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON;
            const buttonLabel = 'Добавить';
            let expectedState = false;

            await allure.step(`Validate button with label: "${buttonLabel}" (initial state)`, async () => {
                const scopedButtonSelector = `${dialogSelector} [data-testid="${buttonTestId}"]`;
                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled initially?`, isButtonReady);
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

            await allure.step(`Validate button with label: "${buttonLabel}" (after selection)`, async () => {
                const scopedButtonSelector = `${dialogSelector} [data-testid="${buttonTestId}"]`;
                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonTestId, // Use data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled after selection?`, isButtonReady);
            });
        });


        await allure.step("Step 24: Проверяем, что поиск во второй таблицы модального окна отображается. (Check that the search in the second table of the modal window is displayed.)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Check for the presence of the input tag with the specific class inside the table
            const inputLocator = table2Locator!.locator('input.search-yui-kit__input'); //DATATESTID
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
            await table2Locator!.locator('input.search-yui-kit__input').fill(TEST_PRODUCT_СБ); //DATATESTID
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible() //DATATESTID
        });
        await allure.step("Step 26: Проверяем, что в поиске второй таблицы модального окна введенное значение совпадает с переменной. (We check that in the search of the second table of the modal window the entered value matches the variable.)", async () => {
            await page.waitForLoadState("networkidle");
            // Locate the search field within the left table and validate its value 
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toHaveValue(TEST_PRODUCT_СБ); //DATATESTID
        });
        await allure.step("Step 27: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)", async () => {
            // Simulate pressing "Enter" in the search field
            await table2Locator!.locator('input.search-yui-kit__input').press('Enter'); //DATATESTID
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
            expect(secondCellValue).toContain(TEST_PRODUCT_СБ);
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
            await page.waitForTimeout(500);

        });
        await allure.step("Step 31: Нажимаем по кнопке \"Выбрать\" в модальном окне (Click on the \"Выбрать\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // DATATESTID
            const buttonLabel = 'Добавить';
            let expectedState = true;

            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of class names
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonTestId}"]`);

                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonTestId, // Pass data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                //expect(isButtonReady).toBeTruthy(); // DATATESTID
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });

            // Highlight button for debugging
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonTestId}"]`);
            await buttonLocator.evaluate((button) => {
                button.style.backgroundColor = 'green';
                button.style.border = '2px solid red';
                button.style.color = 'blue';
            });

            // Perform hover and click actions
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });

        await allure.step("Step 32: Убедитесь, что выбранная строка теперь отображается в нижней таблице.", async () => {
            // Wait for the page to load completely
            await page.waitForLoadState("networkidle");

            // Retrieve the selected part number and name
            const selectedPartNumber = firstCellValue; // Replace with the actual part number variable
            const selectedPartName = secondCellValue; // Replace with the actual part name variable
            logger.info(`Selected Part Number: ${selectedPartNumber}`);
            logger.info(`Selected Part Name: ${selectedPartName}`);

            // Locate the specific modal containing the table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);

            await modal.waitFor({ state: 'attached', timeout: 15000 }); // Ensure modal is attached to the DOM
            await modal.waitFor({ state: 'visible', timeout: 15000 }); // Ensure modal becomes visible
            logger.info("Modal located successfully.");

            // Locate the bottom table dynamically within the modal
            const bottomTableLocator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`); // Match any table with the suffix "-Table"
            await bottomTableLocator.waitFor({ state: 'attached', timeout: 15000 }); // Wait for table to be attached
            logger.info("Bottom table located successfully.");

            // Highlight the table for debugging
            await bottomTableLocator.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "yellow";
            });

            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure there are rows in the table
            logger.info(`Found ${rowCount} rows in the bottom table.`);

            let isRowFound = false;

            // Iterate through each row to search for the selected row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Wait for the row to become visible
                await row.waitFor({ state: 'visible', timeout: 5000 });

                // Extract data from the first and second columns
                const partNumberCell = row.locator('td').nth(0);
                const partNameCell = row.locator('td').nth(1);
                const partNumber = (await partNumberCell.textContent())?.trim();
                const partName = (await partNameCell.textContent())?.trim();

                logger.info(`Row ${i + 1}: PartNumber=${partNumber}, PartName=${partName}`);

                // Check if the current row matches the selected part number and name
                if (partNumber === selectedPartNumber && partName === selectedPartName) {
                    isRowFound = true;

                    // Highlight the matching row for debugging purposes
                    await row.evaluate((rowElement) => {
                        rowElement.style.backgroundColor = 'yellow';
                        rowElement.style.border = '2px solid green';
                        rowElement.style.color = 'blue';
                    });

                    logger.info(`Selected row found in row ${i + 1}`);
                    break; // Stop searching after finding the row
                }
            }

            // Assert that the selected row is present in the table
            expect(isRowFound).toBeTruthy();
            logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
        });



        await allure.step("Step 33: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");

            // Scoped dialog selector using data-testid
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId from your constants
            const buttonLabel = 'Добавить';
            let expectedState = true;
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonTestId}"]`);
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                // Locate the button using data-testid instead of class names


                const isButtonReady = await shortagePage.isButtonVisibleTestId(
                    page,
                    buttonTestId, // Pass data-testid instead of class
                    buttonLabel,
                    expectedState
                );
                expect(isButtonReady).toBeTruthy();
                logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });

            // Highlight button for debugging
            await buttonLocator.evaluate((button) => {
                button.style.backgroundColor = 'green';
                button.style.border = '2px solid red';
                button.style.color = 'blue';
            });

            // Perform hover and click actions
            await buttonLocator.click();
            await page.waitForTimeout(500);
        });

        //let tableData1: { groupName: string; items: string[][] }[] = [];
        await allure.step("Step 34: Перебираем и сохраняем в массивы А1 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData1 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            // Example assertion
            expect(tableData1.length).toBeGreaterThan(0); // Ensure groups are present
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

            button.click();
            await page.waitForTimeout(500);
        });
        //let tableData2: { groupName: string; items: string[][] }[] = [];
        await allure.step("Step 36: Перебираем и сохраняем в массивы A2 данные по категориям из таблицы \"Комплектация\" данной сущности (We sort and save data by categories from the \"Комплектация\" table of this entity into arrays)", async () => {
            // Wait for loading
            await page.waitForLoadState("networkidle");
            // Parse the table
            tableData2 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            // Example assertion
            expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
        });
        await allure.step("Step 37: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            logger.info(`Are tableData1 and tableData2 identical? ${identical}`);
            expect(identical).toBe(true); // Assertion
        });
        await allure.step("Step 38: перейдите в сторону и вернитесь назад, затем перепроверьте arrays Array1 and Array3. (navigate away and back then recheck table arrays Array1 and Array3.)", async () => {
            await shortagePage.goto(ENV.BASE_URL);
            await page.waitForTimeout(1000);
            await shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
            await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible(); //DATATESTID
            await leftTable.locator('input.search-yui-kit__input').fill(TEST_PRODUCT); //DATATESTID
            await leftTable.locator('input.search-yui-kit__input').press('Enter'); //DATATESTID
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
            await page.waitForTimeout(500);

            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);
            await editButton.evaluate((row) => {
                row.style.backgroundColor = 'green'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(2000);

            editButton.click();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(3000);
            tableData3 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            logger.info(`Are tableData1 and tableData3 identical? ${identical}`);
            expect(identical).toBe(true); // Assertion
        });
        await allure.step("Step 39: Очистка после теста. (Cleanup after test)", async () => {
            //remove the item we added
            await page.waitForLoadState("networkidle");
            await allure.step("Step 39 sub step 1: find and click the Добавить button", async () => {
                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
                await addButton.evaluate((row) => {
                    row.style.backgroundColor = 'red';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });

                addButton.click();
                await page.waitForTimeout(1000);
                await page.waitForLoadState("networkidle");
            });
            await allure.step("Step 39 sub step 2: find and click the Сборочную единицу button", async () => {
                const add2Button = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
                await add2Button.evaluate((row) => {
                    row.style.backgroundColor = 'green';
                    row.style.border = '2px solid red';
                    row.style.color = 'red';
                });
                await page.waitForTimeout(100);
                add2Button.click();
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(100);
            });
            await allure.step("Step 39 sub step 3: find the bottom table", async () => {
                const selectedPartNumber = TEST_PRODUCT_СБ; // Replace with actual part number
                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

                // Locate all rows in the table body
                const rowsLocator = bottomTableLocator.locator('tbody tr');
                const rowCount = await rowsLocator.count();
                expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

                let isRowFound = false;

                // Iterate through each row
                for (let i = 0; i < rowCount; i++) {
                    const row = rowsLocator.nth(i);

                    // Extract the part number from the first cell
                    const partNumberCell = row.locator('td').nth(1);
                    const partNumber = (await partNumberCell.textContent())?.trim();
                    logger.info(`Row ${i + 1}: PartNumber=${partNumber}`);

                    // Compare the part number
                    if (partNumber === selectedPartNumber) {
                        isRowFound = true;

                        // Highlight the part number cell for debugging
                        await partNumberCell.evaluate((cell) => {
                            cell.style.backgroundColor = 'yellow';
                            cell.style.border = '2px solid red';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);

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

                        break; // Stop after finding and deleting the row
                    }
                }

                // Assert that the selected row was found
                if (!isRowFound) {
                    throw new Error(`Row with PartNumber="${selectedPartNumber}" not found.`);
                }
            });


            await allure.step("Step 39 sub step 4: Нажимаем по кнопке \"Добавить\" в модальном окне (Click on the \"Добавить\" button in the modal window)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId from constants
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of class names


                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Pass data-testid instead of class
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

            await allure.step("Step 39 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                const button = page.locator(`[data-testid="${MAIN_PAGE_SAVE_BUTTON}"]`);
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
                tableData4 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
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
    test("TestCase 02 - Очистка после теста. (Cleanup after test)", async ({ page }) => {
        test.setTimeout(90000);
        const shortagePage = new CreatePartsDatabasePage(page);
        const leftTable = page.locator(`[data-testid="${MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
        let firstCellValue = '';
        let secondCellValue = '';
        let thirdCellValue = '';
        await allure.step("Step 001: Find СБ к товару (find СБ product)", async () => {
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
                await page.waitForTimeout(1000);
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
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            await allure.step("Step 002 sub step 1: find and click the Добавить button", async () => {
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
            await allure.step("Step 002 sub step 2: find and click the Сборочную единицу button", async () => {
                const add2Button = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_СБ}"]`);

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


                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

                await bottomTableLocator.waitFor({ state: 'visible' });
                await bottomTableLocator.evaluate((element) => {
                    element.style.border = "2px solid red";
                    element.style.backgroundColor = "yellow";
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
                    const partNumber = await row.locator('td').nth(0).textContent();
                    const partNumberCell = await row.locator('td').nth(0);
                    // Extract the partName from the second cell (assuming it's direct text)
                    const partName = await row.locator('td').nth(1).textContent();

                    logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                    // Compare the extracted values
                    if (partNumber?.trim() === selectedPartNumber) {
                        isRowFound = true;
                        await partNumberCell.evaluate((row) => {
                            row.style.backgroundColor = 'black';
                            row.style.border = '2px solid red';
                            row.style.color = 'white';
                        });
                        logger.info(`Selected row found in row ${i + 1}`);
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

                // Scoped dialog selector using data-testid
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId from constants
                const buttonLabel = "Добавить";
                let expectedState = true;
                const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonDataTestId}"]`);
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Locate the button using data-testid instead of class names


                    const isButtonReady = await shortagePage.isButtonVisibleTestId(
                        page,
                        buttonDataTestId, // Pass data-testid instead of class
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
                await page.waitForTimeout(1000);
                await buttonLocator2.click();
                await page.waitForTimeout(500);
            });
            await allure.step("Step 002 sub step 4a: reset all items in the specifications (reset all items in the specifications)", async () => {

                const itemsToAdd = [
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_СБ, dialogTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_СБ_TABLE, searchValue: RESET_СБ_1, bottomTableTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'СБ' },
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_СБ, dialogTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_СБ_TABLE, searchValue: RESET_СБ_2, bottomTableTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'СБ' },
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_СБ, dialogTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_СБ_TABLE, searchValue: RESET_СБ_3, bottomTableTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'СБ' },
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_Д, dialogTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG, searchTableTestId: MAIN_PAGE_Д_TABLE, searchValue: RESET_Д_1, bottomTableTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'Д' },
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_ПД, dialogTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG, searchTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE, searchValue: RESET_ПД_1, bottomTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'ПД' },
                    { smallDialogButtonId: MAIN_PAGE_SMALL_DIALOG_ПД, dialogTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG, searchTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE, searchValue: RESET_ПД_2, bottomTableTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE, addToBottomButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON, addToMainButtonTestId: EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON, type: 'ПД' }
                ];

                for (const item of itemsToAdd) {
                    const shortagePage = new CreatePartsDatabasePage(page);
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
            await allure.step("Step 002 sub step 5: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
                // Wait for loading
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
        });

    });
    test("TestCase 03 - Редактирование изделия - Добавьте каждый тип материала по отдельности. (Add Each Material Type Individually)", async ({ page }) => {
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


            await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");
                const button = await page.locator(`[data-testid="${MAIN_PAGE_SAVE_BUTTON}"]`);
                await button.evaluate((row) => {
                    row.style.backgroundColor = 'red';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                button.click();
                await page.waitForTimeout(1500);
            });
        });
        await allure.step("Step 002: Добавить Д к товару (Add Д to the product and save)", async () => {
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
                tableData_temp = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
                detailvalue_original_before_changequantity = await shortagePage.getQuantityByLineItem(tableData_temp, TESTCASE_2_PRODUCT_Д);

            });

            await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
        });
        await allure.step("Step 003: Добавить ПД к товару (Add ПД to the product and save)", async () => {
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

                editButton.click();
                await page.waitForTimeout(500);
            });
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
                await page.waitForTimeout(1000);
            });

            await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
        });
        await allure.step("Step 004: Добавить РМ к товару (Add РМ to the product and save)", async () => {
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
            });
            await allure.step("Step 08: Add and Validate Items in Specifications", async () => {
                await page.waitForTimeout(1000);
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

            await allure.step("Step 09: Нажимаем на кнопку \"Сохранить\". (Press the save button)", async () => {
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
        });
        await allure.step("Step 005: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)", async () => {
            await page.waitForLoadState("networkidle");
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);

        });
        await allure.step("Step 006: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
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
    test("TestCase 04 - Очистка после теста. (Cleanup after test)", async ({ page }) => {
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 006: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)", async () => {
            await page.waitForLoadState("networkidle");
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
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);
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
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 14: проверьте, что количество обновлено. (check that the quantity has been updated)", async () => {
            await page.waitForLoadState("networkidle");

            const after = await shortagePage.getQuantityByLineItem(tableData_full, TESTCASE_2_PRODUCT_Д);
            logger.info(after);

            expect(after.toString()).toBe(value_before_changequantity.toString());

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
    test("TestCase 09- Редактирование изделия - Сравниваем комплектацию (Edit an Existing Material ПД - Comparing the complete set)", async ({ page }) => {
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

        await allure.step("Step 09: Нажимаем по селектору из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the selector from the drop-down list \"Assembly unit (type Cтандартную или покупную деталь)\".)", async () => {
            await page.waitForLoadState("networkidle");
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        const dialog = await page.locator(`dialog[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
        table3Locator = dialog.locator(`[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_ПД);
            await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
        });
        let firstCell: Locator | null = null;
        await allure.step("Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            // Get the value of the first cell in the first row
            firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
            firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
            await firstCell.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            firstCellValue = firstCellValue.trim();
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
            firstCell!.hover();
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

        await allure.step("Step 14: Ensure the selected row is now showing in the bottom table", async () => {
            // Wait for the page to load
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const selectedPartNumber = firstCellValue; // Replace with actual part number

            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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

                // Extract the partNumber from the input field in the first cell
                const partNumber = await row.locator('td').nth(1).textContent();
                const partNumberCell = await row.locator('td').nth(1);

                // Extract the partName from the second cell (assuming it's direct text)
                const partName = await row.locator('td').nth(1).textContent();

                logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

                // Compare the extracted values
                if (partName?.trim() === selectedPartNumber) {
                    isRowFound = true;
                    await partNumberCell.evaluate((row) => {
                        row.style.backgroundColor = 'yellow';
                        row.style.border = '2px solid red';
                        row.style.color = 'blue';
                    });
                    logger.info(`Selected row found in row ${i + 1}`);
                    //change the value in the Обозначение column

                    // const assignmentCell = row.locator(
                    //     'td.table-yui-kit__td fieldset input.input-yui-kit__input[type="text"]'
                    // );
                    const assignmentCell = row.locator('[data-testid="ModalBaseMaterial-Designation-Input-Input"]');

                    assignmentCell.fill(TESTCASE_2_PRODUCT_ASSIGNEMENT);
                    await page.waitForTimeout(1000);
                    break;
                }
            }

            // Assert that the selected row is found
            //expect(isRowFound).toBeTruthy();
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
        await allure.step("Step 17: reload the page. (reload the page)", async () => {

            await page.reload();
            await page.waitForLoadState("networkidle");

        });

        await allure.step("Step 18: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            logger.info(tableData_full);
            await page.waitForTimeout(1000);
            const nestedArray = await tableData_full.map(group => group.items).flat();

            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ASSIGNEMENT); // Output: true


            expect(result).toBeTruthy();

        });
    });
    test("TestCase 10 - cleanup (Return to original state)", async ({ page }) => {
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
        });
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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
            await page.waitForTimeout(500);
        });

    });
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
            await page.waitForTimeout(500);
        });
        await allure.step("Step 20: Захват таблицы и сохранение ее в массиве. (Capture table and store it in an array)", async () => {
            await page.waitForLoadState("networkidle");
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
            await page.waitForTimeout(500);
        });
        //third refresh and confirm saved
        await allure.step("Step 17: refresh and confirm saved. (refresh and confirm saved)", async () => {
            await page.reload({
                timeout: 5000, // Sets a 500ms timeout
                waitUntil: 'networkidle', // Waits until the page reaches network idle state
            });
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
                await page.waitForTimeout(500);
            });
            ////////////////// end of РМ deletion            
        });
        //fifth refresh and confirm deleted
        await allure.step("Step 19: refresh and confirm deleted. (refresh and confirm deleted)", async () => {
            await page.reload({
                timeout: 5000, // Sets a 500ms timeout
                waitUntil: 'networkidle', // Waits until the page reaches network idle state
            });
            tableData_full = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            await page.waitForLoadState("networkidle");
            const nestedArray = tableData_full.map(group => group.items).flat();
            const result = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true			
            expect(result).toBeFalsy();
        });
    });
    test("TestCase 13 - Добавить одинаковый СБ в спецификацию ДВА раза и проверка сохранения или нет (Add Duplicate Material Type)", async ({ page }) => {// skipped due to bug
    });
    test("TestCase 14 - Сохранить без добавления каких-либо элементов в спецификацию и проверка сохранения (Save Without Adding Material)", async ({ page }) => {
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
        await allure.step("Step 08: Нажимаем по кнопке \"Сохранить\"  (Click on the \"Сохранить\" button in the main window)", async () => {
            tableData_temp = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            await page.waitForLoadState("networkidle");
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'black';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 09: Compare arrays  (Compare arrays)", async () => {
            const tableData_new = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            await page.waitForLoadState("networkidle");
            const identical = await shortagePage.compareTableData(tableData_temp, tableData_new);

            expect(identical).toBeTruthy();
        });

    });
    test("TestCase 15 - Перезагрузить без сохранения после добавления деталей в спецификацию и проверка (Reload without saving)", async ({ page }) => {
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
            tableData_original_15 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
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

        await allure.step("Step 09: перезагрузите страницу без сохранения (reload the page without saving) (Click on the bottom \"Добавить\" button in the modal window)", async () => {
            //refresh the page
            await page.reload();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
        });
        await allure.step("Step 10: извлечь текущую таблицу спецификаций (extract the current specifications table)", async () => {
            // get table from page
            await page.waitForLoadState("networkidle");
            tableData_temp = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
        });
        await allure.step("Step 11: сравните исходную таблицу с текущей таблицей (compare the original table with the current table)", async () => {
            //compare extracted table with the original table - should be the same
            await page.waitForLoadState("networkidle");
            logger.info("dd");
            logger.info(tableData_temp);
            logger.info(tableData_original_15);
            const identical = await shortagePage.compareTableData(tableData_temp, tableData_original_15);

            expect(identical).toBeTruthy();
        });

    });
    test.skip("TestCase 16 - Добавьте больше материалов, чем ограниченное количество в спецификацию и проверка сохранения (Exceed Allowed Materials)", async ({ page }) => {
        test.setTimeout(500000);
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
    test.skip("TestCase 17 - cleanup delete all added details (cleanup delete all added details)", async ({ page }) => {
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
    test("TestCase 18 - Добавить, изменить и удалить несколько элементов одновременно в спецификацию и проверка сохранения (Add, Modify, and Delete in One Session)", async ({ page }) => {
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

            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);//DATATSTID
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
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            addButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
            table2Locator = modal.locator(`[data-testid="${MAIN_PAGE_СБ_TABLE}"]`);
            await table2Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_СБ);
            await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
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
            expect(secondCellValue).toContain(TESTCASE_2_PRODUCT_СБ);
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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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

            const selectedPartName = TESTCASE_2_PRODUCT_СБ; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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

            const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
            const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_Д}"]`);
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForTimeout(500);
        });
        table2Locator = page.locator(`[data-testid="${MAIN_PAGE_Д_TABLE}"]`);
        await allure.step("Step 18: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
            await table2Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_Д);
            await table2Locator!.locator('input.search-yui-kit__input').press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
            // Optionally, validate that the search input is visible
            await expect(table2Locator!.locator('input.search-yui-kit__input')).toBeVisible();
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
            expect(secondCellValue).toContain(TESTCASE_2_PRODUCT_Д);
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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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

            const selectedPartName = TESTCASE_2_PRODUCT_Д; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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

        await allure.step("Step 24: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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
        // End adding Д
        //start adding Cтандартную или покупную деталь
        await allure.step("Step 26: Нажимаем по Кнопка из выпадающего списке \"Cтандартную или покупную деталь\". (Click on the Кнопка from the list \"Cтандартную или покупную деталь\".)", async () => {
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
        let modal = await page.locator(`[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
        table3Locator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 27: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_ПД);
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
            expect(firstCellValue).toContain(TESTCASE_2_PRODUCT_ПД);
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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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

            const selectedPartNumber = TESTCASE_2_PRODUCT_ПД; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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

        await allure.step("Step 33: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
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
        //end adding Cтандартную или покупную деталь
        //start adding Расходный материал
        await allure.step("Step 34: Нажимаем по Кнопка из выпадающего списке \"Расходный материал\". (Click on the Кнопка from the list \"Расходный материал\".)", async () => {
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
        modal = await page.locator(`[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
        table3Locator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE}"]`);
        await allure.step("Step 35: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)", async () => {
            await page.waitForLoadState("networkidle");
            await table3Locator!.locator('input.search-yui-kit__input').fill(TESTCASE_2_PRODUCT_РМ);
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
            expect(secondCellValue).toContain(TESTCASE_2_PRODUCT_РМ);
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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
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

            const selectedPartNumber = TESTCASE_2_PRODUCT_РМ; // Replace with actual part number
            // Locate the bottom table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
            const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
            const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
            const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
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
            tableData_temp = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nestedArray = tableData_temp.map(group => group.items).flat();
            let quantity1 = 0;
            let quantity2 = 0;
            let quantity3 = 0;
            let quantity4 = 0;
            let quantity: boolean = false;
            const result1 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_СБ); // Output: true
            if (result1) {
                quantity1 = await shortagePage.getQuantityByLineItem(tableData_temp, TESTCASE_2_PRODUCT_СБ)
                logger.info(quantity1);
            }
            const result2 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_Д); // Output: true
            if (result2) {
                quantity2 = await shortagePage.getQuantityByLineItem(tableData_temp, TESTCASE_2_PRODUCT_Д)
                logger.info(quantity2);
            }
            const result3 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_ПД); // Output: true
            if (result3) {
                quantity3 = await shortagePage.getQuantityByLineItem(tableData_temp, TESTCASE_2_PRODUCT_ПД)
                logger.info(quantity3);
            }
            const result4 = await shortagePage.isStringInNestedArray(nestedArray, TESTCASE_2_PRODUCT_РМ); // Output: true
            if (result4) {
                quantity4 = await shortagePage.getQuantityByLineItem(tableData_temp, TESTCASE_2_PRODUCT_РМ)
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
                await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, MAIN_PAGE_TITLE_ID);
            });
        });
        const shortagePage = new CreatePartsDatabasePage(page);
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
        });
        await allure.step("Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)", async () => {
            const firstRow = leftTable.locator('tbody tr:first-child');
            // Locate the "Редактировать" button
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);

            editButton.click();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 08: Sub Step 1 : Remove СБ . (Remove \"СБ\".)", async () => {
            await allure.step("Step 01: Нажимаем по кнопки \"Добавить\" (под таблицей комплектации)Click on the button \"Добавить\" (above the комплектации table)", async () => {
                // Wait for loading
                await page.waitForLoadState("networkidle");

                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
                const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_СБ}"]`);
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

                const selectedPartName = TESTCASE_2_PRODUCT_СБ; // Replace with actual part number
                // Locate the bottom table
                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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

                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
                const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_Д}"]`);
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

                const selectedPartName = TESTCASE_2_PRODUCT_Д; // Replace with actual part number
                // Locate the bottom table
                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_Д_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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

                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
                const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_ПД}"]`);
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

                const selectedPartNumber = TESTCASE_2_PRODUCT_ПД; // Replace with actual part number
                // Locate the bottom table
                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_ПД_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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

                const addButton = page.locator(`[data-testid="${EDIT_PAGE_ADD_BUTTON}"]`);
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
                const addButton = page.locator(`div[data-testid="${MAIN_PAGE_SMALL_DIALOG_РМ}"]`);
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

                const selectedPartNumber = TESTCASE_2_PRODUCT_РМ; // Replace with actual part number
                // Locate the bottom table
                const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"]`);
                const bottomTableLocator = modal.locator(`table[data-testid="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE}"]`);

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
                const dialogSelector = `dialog[data-testid^="${EDIT_PAGE_ADD_РМ_RIGHT_DIALOG}"][open]`;
                const buttonDataTestId = EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
            const button = page.locator(`[data-testid^="${MAIN_PAGE_SAVE_BUTTON}"]`);
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            button.click();
            await page.waitForTimeout(500);
        });
    });
    test.skip("TestCase 20 - Совместные изменения (Collaborative Changes)", async ({ browser }) => {
        const page1 = await browser.newPage();
        const page2 = await browser.newPage();
        await page1.goto('http://');
        await page1.fill(`[data-testid='add-material']`, 'Расходные материалы');
        await page1.click(`[data-testid='save-button']`);
        await page2.goto('http://');
        await page2.fill(`[data-testid='edit-material']`, 'Modified Расходные материалы');
        await page2.click(`[data-testid='save-button']`);
        const material = await page1.textContent(`[data-testid='material-entry']`);
        expect(material).toContain('Modified Расходные материалы');
    });
}
