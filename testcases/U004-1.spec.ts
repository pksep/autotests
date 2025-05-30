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

export const runU004_1 = () => {
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
            await page.waitForTimeout(1500);
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
            console.log(h3Titles);
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
            await page.waitForTimeout(1000);

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
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 28: Проверяем, что тело таблицы отображается после фильтрации (Verify the table body is displayed after filtering)", async () => {
            // Wait for the page to become idle (ensuring data loading is complete)
            await page.waitForLoadState("networkidle");
            // Assert that the table body has rows
            await page.waitForTimeout(1000);
            const rowCount = await table2Locator!.locator('tbody tr').count();
            console.log("results rowCount:" + rowCount);
            expect(rowCount).toBeGreaterThan(0); // Asserts that the row count is greater than 1
        });
        let firstCell: Locator | null = null;
        await allure.step("Step 29: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Get the value of the first cell in the first row
            firstCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
            console.log("results firstCellValue:" + firstCellValue);
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
            const rowLocator = table2Locator!.locator('tbody tr:first-child');

            // Check if the row has the "active" class
            const hasActiveClass = await rowLocator.evaluate((row) => {
                return row.classList.contains('active');
            });

            // Assert that the row contains the class
            expect(hasActiveClass).toBeTruthy();

            console.log(`✅ First row has 'active' class: ${hasActiveClass}`);

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
                console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                expect(isButtonReady).toBeTruthy();
            });

            // Highlight button for debugging
            const buttonLocator = page.locator(`${dialogSelector} [data-testid="${buttonTestId}"]`);
            await buttonLocator.evaluate((button) => {
                button.style.backgroundColor = 'green';
                button.style.border = '2px solid red';
                button.style.color = 'blue';
            });
            await page.waitForLoadState("networkidle"); // Ensure everything is loaded
            await page.screenshot({ path: "screenshot.png", fullPage: true }); // Capture full page

            // Perform hover and click actions
            await buttonLocator.click();
            await page.waitForTimeout(1500);
            await buttonLocator.click();
            await page.waitForTimeout(1500);
        });

        await allure.step("Step 32: Убедитесь, что выбранная строка теперь отображается в нижней таблице.", async () => {
            // Wait for the page to load completely
            await page.waitForLoadState("networkidle");

            // Retrieve the selected part number and name
            const selectedPartNumber = firstCellValue; // Replace with the actual part number variable
            const selectedPartName = secondCellValue; // Replace with the actual part name variable
            console.log(`Selected Part Number: ${selectedPartNumber}`);
            console.log(`Selected Part Name: ${selectedPartName}`);

            // Locate the specific modal containing the table
            const modal = await page.locator(`dialog[data-testid^="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG}"]`);

            await modal.waitFor({ state: 'attached', timeout: 15000 }); // Ensure modal is attached to the DOM
            await modal.waitFor({ state: 'visible', timeout: 15000 }); // Ensure modal becomes visible
            logger.info("Modal located successfully.");
            await page.waitForTimeout(1500);
            // Locate the bottom table dynamically within the modal
            const bottomTableLocator = modal.locator(`[data-testid="${EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE}"]`); // Match any table with the suffix "-Table"
            await bottomTableLocator.waitFor({ state: 'attached', timeout: 15000 }); // Wait for table to be attached
            logger.info("Bottom table located successfully.");
            await page.waitForTimeout(1000);
            // Highlight the table for debugging
            await bottomTableLocator.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "yellow";
            });

            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            console.log(rowCount);
            expect(rowCount).toBeGreaterThan(0); // Ensure there are rows in the table
            logger.info(`Found ${rowCount} rows in the bottom table.`);

            let isRowFound = false;

            // Iterate through each row to search for the selected row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Wait for the row to become visible
                await row.waitFor({ state: 'visible', timeout: 5000 });

                // Extract data from the first and second columns
                const partNumberCell = await row.locator('td').nth(0);
                const partNameCell = await row.locator('td').nth(1);
                console.log("row" + i + "partNumberCell.textContent():" + await partNumberCell.textContent());
                console.log("row" + i + "partNameCell.textContent():" + await partNameCell.textContent());
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
            await page.waitForTimeout(1500);
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
            await page.waitForTimeout(5000);
            tableData2 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);
            // Example assertion
            expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
        });
        await allure.step("Step 37: Сравниваем массивы Array1 и Array2. (Compare arrays Array1 and Array2.)", async () => {
            console.log(tableData1);
            console.log(tableData2);
            const identical = await shortagePage.compareTableData(tableData1, tableData2);

            logger.info(`Are tableData1 and tableData2 identical? ${identical}`);
            expect(identical).toBe(false); // Assertion
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
            expect(identical).toBe(false); // Assertion
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
                await page.waitForTimeout(3000);
            });
            await allure.step("Step 39 sub step 6: получить содержимое основной таблицы  (get the content of the main table )", async () => {
                await page.waitForLoadState("networkidle");
                // Parse the table
                await page.waitForTimeout(1500);
                tableData4 = await shortagePage.parseStructuredTable(page, EDIT_PAGE_SPECIFICATIONS_TABLE);

                // Example assertion
                expect(tableData2.length).toBeGreaterThan(0); // Ensure groups are present
            });
            await allure.step("Step 39 sub step 7: сравнить его с оригиналом (compare it to the original)", async () => {
                await page.waitForLoadState("networkidle");
                const identical = await shortagePage.compareTableData(tableData_original, tableData4);
                console.log(tableData_original);
                console.log(tableData4);
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

}
