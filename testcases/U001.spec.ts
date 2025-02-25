let incomingQuantity = "1";
let remainingStockBefore: string;
let remainingStockAfter: string;
const nameProduct = "Император Человечества";
const designationProduct = "0Т3.01";
const descendantsCbedArray: ISpetificationData[] = [];
const descendantsDetailArray: ISpetificationData[] = [];

import { test, expect } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { CreateLoadingTaskPage } from "../pages/LoadingTaskPage";
import { CreateAssemblyWarehousePage } from "../pages/AssemplyWarehousePage";
import { CreateMetalworkingWarehousePage } from "../pages/MetalworkingWarehousePage";
import { CreatShortageAssembliesPage } from "../pages/ShortageAssembliesPage";
import { CreateCompletingAssembliesToPlanPage } from "../pages/CompletingAssembliesToPlanPage";
import {
    CreateStockReceiptFromSupplierAndProductionPage,
    StockReceipt,
} from "../pages/StockReceiptFromSupplierAndProductionPage";
import { CreateCompletingProductsToPlanPage } from "../pages/CompletingProductsToPlanPage";
import { CreateWarehouseTaskForShipmentPage } from "../pages/WarehouseTaskForShipmentPage";
import { CreateStockPage, TableSelection } from "../pages/StockPage";
import { CreatShortagePartsPage } from "../pages/ShortagePartsPage";
import { CreateShortageProductPage } from "../pages/ShortageProductPage";
import { ISpetificationData, Click, TypeInvoice } from "../lib/Page";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { cli } from "winston/lib/winston/config";

export const runU001 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
        await performLogin(page, "001", "Перов Д.А.", "54321");
        await page.click("button.btn.blues");
    });

    test("Спецификация", async ({ page }) => {
        // Удалить после
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

        await page.waitForLoadState("networkidle");

        await loadingTaskPage.clickButton(
            " Создать заказ ",
            '[data-testid="IssueShipment-Button-CreateOrder"]'
        );

        await loadingTaskPage.clickButton(
            " Выбрать ",
            '[data-testid="AddAddOrder-SelectProductButton"]'
        );

        await loadingTaskPage.waitingTableBody(
            '[data-testid="BasePaginationTable-Table-Component"]'
        );
        await page.waitForTimeout(1000);
        await loadingTaskPage.searchTable(
            nameProduct,
            '[data-testid="TableProduct-BasePaginationTable"]'
        );
        await page.waitForTimeout(1000);
        await loadingTaskPage.waitingTableBody(
            '[data-testid="BasePaginationTable-Table-Component"]'
        );

        await loadingTaskPage.choiceProductInModal(nameProduct);

        await page.waitForTimeout(2000);

        await loadingTaskPage.clickButton(
            " Выбрать ",
            '[data-testid="ModalAllProducts-btn-Select"]'
        );

        await loadingTaskPage.checkProduct(nameProduct);

        await loadingTaskPage.choiceBuyer("5");

        await page.waitForLoadState("networkidle");

        await loadingTaskPage.preservingDescendants(
            descendantsCbedArray,
            descendantsDetailArray
        );
        // Удалить после
    });

    test.skip("Test Case 01 - Loading Task", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        // Go to the Shipping tasks page
        await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Click on the button
        await loadingTaskPage.clickButton(
            " Создать заказ ",
            '[data-testid="IssueShipment-Button-CreateOrder"]'
        );

        // Click on the button
        await loadingTaskPage.clickButton(
            " Выбрать ",
            '[data-testid="AddAddOrder-SelectProductButton"]'
        );

        // Ожидаем тела таблицы
        await loadingTaskPage.waitingTableBody(
            '[data-testid="BasePaginationTable-Table-Component"]'
        );

        await page.waitForTimeout(1000);

        // Using table search we look for the value of the variable
        await loadingTaskPage.searchTable(
            nameProduct,
            '[data-testid="TableProduct-BasePaginationTable"]'
        );
        await page.waitForTimeout(1000);

        // Waiting for the table body
        await loadingTaskPage.waitingTableBody(
            '[data-testid="BasePaginationTable-Table-Component"]'
        );

        // Select a product in the "Select product" modal window
        await loadingTaskPage.choiceProductInModal(nameProduct);

        await page.waitForTimeout(2000);

        // Click on the button
        await loadingTaskPage.clickButton(
            " Выбрать ",
            '[data-testid="ModalAllProducts-btn-Select"]'
        );

        // Check that the selected product displays the expected product
        await loadingTaskPage.checkProduct(nameProduct);

        // Select a buyer in the dropdown menu
        await loadingTaskPage.choiceBuyer("5");

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Save Assembly units and Parts from the Specification to an array
        await loadingTaskPage.preservingDescendants(
            descendantsCbedArray,
            descendantsDetailArray
        );

        // Click on the button
        await loadingTaskPage.clickButton(
            " Сохранить Заказ ",
            '[data-testid="AddOrder-Button-SaveOrder"]'
        );
    });

    test.skip("Test Case 02 - Launch Into Production Product", async ({
        page,
    }) => {
        const shortageProduct = new CreateShortageProductPage(page);

        // Go to the Warehouse page
        await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Shortage of Products
        const selector =
            '[data-testid="Sclad-deficitProduction-deficitProduction"]';
        await shortageProduct.findTable(selector);

        // Wait for loading
        await page.waitForLoadState("networkidle");

        const deficitTable = '[data-testid="DeficitIzd-ScrollTable"]';

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);

        // Using table search we look for the value of the variable
        await shortageProduct.searchTable(nameProduct, deficitTable);

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);

        // Find the variable name in the first line and check the checkbox
        await shortageProduct.checkboxMarkNameInLineFromFirstRow(
            nameProduct,
            deficitTable
        );

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);

        const numberColumn = await shortageProduct.findColumn(
            page,
            "DeficitIzd-ScrollTable",
            "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
        );
        console.log("numberColumn: ", numberColumn);

        // Upd:
        await shortageProduct.getValueOrClickFromFirstRow(deficitTable, 17);

        // Click on the button
        await shortageProduct.clickButton(
            " Запустить в производство ",
            '[data-testid="DeficitIzd-StartButton"]'
        );

        // Check the modal window Launch into production
        await shortageProduct.checkModalWindowLaunchIntoProduction();

        // Check the date in the Launch into production modal window
        await shortageProduct.checkCurrentDate(
            '[data-testid="ModalStartProduction-OrderDateValue"]'
        );

        // Check the value in the Own quantity field and enter the value
        await shortageProduct.checkOrderQuantity("1", "1");

        // Get the order number
        const checkOrderNumber = await shortageProduct.checkOrderNumber();
        console.log(`Полученный номер заказа: ${checkOrderNumber}`);

        // Click on the button
        await shortageProduct.clickButton(" В производство ", ".btn-status");

        // Check the order number in the success notification
        await shortageProduct.getMessage(checkOrderNumber);
    });

    test.skip("Test Case 03- Launch Into Production Cbed", async ({ page }) => {
        const shortageAssemblies = new CreatShortageAssembliesPage(page);

        // Go to the Warehouse page
        await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Дефицит Сборок
        const selector = '[data-testid="Sclad-deficitCbed-deficitCbed"]';
        await shortageAssemblies.findTable(selector);

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                // Wait for the table body to load
                const deficitTable = '[data-testid="DeficitCbed-ScrollTable"]';
                await shortageAssemblies.waitingTableBody(deficitTable);

                // Using table search we look for the value of the variable
                await shortageAssemblies.searchTable(
                    cbed.designation,
                    deficitTable
                );

                // Wait for the table body to load
                await shortageAssemblies.waitingTableBody(deficitTable);

                // Find the variable name in the first line and check the checkbox
                await shortageAssemblies.checkboxMarkNameInLineFromFirstRow(
                    cbed.designation,
                    deficitTable
                );

                // Wait for the table body to load
                await shortageAssemblies.waitingTableBody(deficitTable);

                // Upd:
                await shortageAssemblies.getValueOrClickFromFirstRow(
                    deficitTable,
                    18
                );

                // Click on the button
                await shortageAssemblies.clickButton(
                    " Запустить в производство ",
                    '[data-testid="DeficitCbed-StartButton"]'
                );

                // Check the modal window Launch into production
                await shortageAssemblies.checkModalWindowLaunchIntoProduction();

                // Check the date in the Launch into production modal window
                await shortageAssemblies.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );

                // Check the value in the Own quantity field and enter the value
                await shortageAssemblies.checkOrderQuantity("1", "1");

                // Get the order number
                const checkOrderNumber =
                    await shortageAssemblies.checkOrderNumber();
                console.log(`Полученный номер заказа: ${checkOrderNumber}`);

                // Click on the button
                await shortageAssemblies.clickButton(
                    " В производство ",
                    ".btn-status"
                );

                // Check the order number in the success notification
                await shortageAssemblies.getMessage(checkOrderNumber);

                // Close the success notification
                await shortageAssemblies.closeSuccessMessege();
            }
        }
    });

    test.skip("Test Case 04- Launch Into Production Parts", async ({
        page,
    }) => {
        const shortageParts = new CreatShortagePartsPage(page);

        // Go to the Warehouse page
        await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Parts Shortage
        const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
        await shortageParts.findTable(selector);

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                // Wait for the table body to load
                const deficitTable = ".scroll-table";
                await shortageParts.waitingTableBodyNoThead(deficitTable);

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Using table search we look for the value of the variable
                await shortageParts.searchTable(part.designation, deficitTable);

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                await page.waitForTimeout(1000);

                // Wait for the table body to load
                await shortageParts.waitingTableBodyNoThead(deficitTable);

                // Check that the first row of the table contains the variable name
                await shortageParts.checkNameInLineFromFirstRowBUG(
                    part.designation,
                    deficitTable
                );

                // Wait for the table body to load
                await shortageParts.waitingTableBody(deficitTable);

                // Upd:
                // await shortageParts.getValueOrClickFromFirstRow(deficitTable, 20);

                // Click on the button
                await shortageParts.clickButton(
                    " Запустить в производство ",
                    '[data-testid="DeficitDetal-StartButton"]'
                );

                // Check the modal window Launch into production
                await shortageParts.checkModalWindowLaunchIntoProduction();

                // Check the date in the Launch into production modal window
                await shortageParts.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );

                // Check the value in the Own quantity field and enter the value
                await shortageParts.checkOrderQuantity("1", "1");

                // Get the order number
                const checkOrderNumber = await shortageParts.checkOrderNumber();
                console.log(`Полученный номер заказа: ${checkOrderNumber}`);

                // Click on the button
                await shortageParts.clickButton(
                    " В производство ",
                    ".btn-status"
                );

                // Check the order number in the success notification
                await shortageParts.getMessage(checkOrderNumber);

                // Close the success notification
                await shortageParts.closeSuccessMessege();
            }
        }
    });

    test.skip("Test Case 05 - Marking Parts", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        // Go to the Warehouse page
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Order a warehouse for Metalworking
        const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
        await metalworkingWarehouse.findTable(selector);

        const tableMetalworkingWarehouse =
            '[data-testid="MetalloworkingSclad-ScrollTable"]';

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(
                    tableMetalworkingWarehouse
                );

                // Using table search we look for the value of the variable
                await metalworkingWarehouse.searchTable(
                    part.designation,
                    tableMetalworkingWarehouse
                );

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(
                    tableMetalworkingWarehouse
                );

                // Check that the first row of the table contains the variable name
                await metalworkingWarehouse.checkNameInLineFromFirstRow(
                    part.designation,
                    tableMetalworkingWarehouse
                );

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(
                    tableMetalworkingWarehouse
                );

                // Getting cell value by id
                const numberColumn = await metalworkingWarehouse.findColumnNew(
                    page,
                    "MetalloworkingSclad-ScrollTable",
                    "MetalloworkingSclad-DetailsTableHeader-OperationsColumn"
                );
                console.log("numberColumn: ", numberColumn);

                // Click on the icon in the cell
                await metalworkingWarehouse.clickIconOperationNew(
                    tableMetalworkingWarehouse,
                    numberColumn,
                    Click.Yes
                );

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Check the production path modal window
                await metalworkingWarehouse.productionPathDetailskModalWindow();

                // Wait for the table body to load
                const productionTable =
                    '[data-testid="OperationPathInfo-table"]';
                await metalworkingWarehouse.waitingTableBody(productionTable);

                // Getting cell value by id
                const operationTable = "OperationPathInfo-table";
                const numberColumnQunatityMade =
                    await metalworkingWarehouse.findColumnNew(
                        page,
                        operationTable,
                        "OperationPathInfo-thead-tr-th-sdelano-sh"
                    );
                console.log("numberColumn: ", numberColumnQunatityMade);

                // Click on the Done cell
                await metalworkingWarehouse.getValueOrClickFromFirstRow(
                    productionTable,
                    numberColumnQunatityMade,
                    Click.Yes
                );

                // Getting the value of the first operation
                const numberColumnFirstOperation =
                    await metalworkingWarehouse.findColumnNew(
                        page,
                        operationTable,
                        "OperationPathInfo-thead-tr-th-operatsii"
                    );
                console.log("numberColumn: ", numberColumnQunatityMade);
                const firstOperation =
                    await metalworkingWarehouse.getValueOrClickFromFirstRow(
                        productionTable,
                        numberColumnFirstOperation
                    );
                console.log(firstOperation);
                logger.info(firstOperation);

                // Click on the button
                await metalworkingWarehouse.clickButton(
                    " Добавить Отметку для выбранной операции ",
                    '[data-testid="ModalOperationPathMetaloworking-add-mark-button"]'
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Check the progress check modal window
                await metalworkingWarehouse.completionMarkModalWindow(
                    firstOperation,
                    part.name,
                    part.designation
                );

                // Click on the button
                await metalworkingWarehouse.clickButton(
                    " Сохранить Отметку ",
                    ".btn-status"
                );

                // Check the production path modal window
                await metalworkingWarehouse.productionPathDetailskModalWindow();

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(productionTable);

                // Double click on the coordinates and close the modal window
                await page.mouse.dblclick(1, 1);

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(
                    tableMetalworkingWarehouse
                );
            }
        }
    });

    test.skip("Test Case 06 - Complete Set Of Cbed", async ({ page }) => {
        const completingAssembliesToPlan =
            new CreateCompletingAssembliesToPlanPage(page);

        // Go to the Warehouse page
        await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Completing assemblies to plan
        const selector = '[data-testid="Sclad-completionCbedPlan"]';
        await completingAssembliesToPlan.findTable(selector);

        // Wait for the table body to load
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-Table"]';

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                // Using table search we look for the value of the variable
                await completingAssembliesToPlan.searchTable(
                    cbed.designation,
                    TableComplect
                );

                // Wait for the table body to load
                await completingAssembliesToPlan.waitingTableBody(
                    TableComplect
                );

                // Check that the first row of the table contains the variable name
                await completingAssembliesToPlan.checkNameInLineFromFirstRow(
                    cbed.designation,
                    TableComplect
                );

                // Find the column designation and click
                const tableCompectDataTestId =
                    "TableComplect-TableComplect-Table";
                const numberColumn =
                    await completingAssembliesToPlan.findColumnNew(
                        page,
                        tableCompectDataTestId,
                        "TableComplect-TableComplect-DesignationColumn"
                    );
                console.log("numberColumn: ", numberColumn);
                await completingAssembliesToPlan.getValueOrClickFromFirstRow(
                    TableComplect,
                    numberColumn,
                    Click.No,
                    Click.Yes
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Check the modal window for the delivery note and check the checkbox
                await completingAssembliesToPlan.assemblyInvoiceModalWindow(
                    TypeInvoice.cbed,
                    true
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Click on the button
                await completingAssembliesToPlan.clickButton(
                    " Скомплектовать в набор ",
                    '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                );

                const modalWindow =
                    '[data-testid="ModalAddWaybill-WaybillDetails-Right"]';
                await completingAssembliesToPlan.checkCloseModalWindow(
                    modalWindow
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        }
    });

    test.skip("Test Case 07 - Receiving Part And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const detail of descendantsDetailArray) {
                // // Check the number of parts in the warehouse before posting
                // // Go to the warehouse page
                remainingStockBefore = await stock.checkingTheQuantityInStock(
                    detail.designation,
                    TableSelection.detail
                );

                // Capitalization of the entity
                // Go to the Warehouse page
                await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

                // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
                const selectorstockReceipt =
                    '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
                await stockReceipt.findTable(selectorstockReceipt);

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Click on the button
                await stockReceipt.clickButton(
                    " Создать Приход ",
                    '[data-testid="ComingToSclad-Button-MakeComing"]'
                );

                // Select the selector in the modal window
                await stockReceipt.selectStockReceipt(
                    StockReceipt.metalworking
                );

                const tableStockRecieptModalWindow =
                    '[data-testid="ModalComingTable-TableScroll"]';

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await stockReceipt.waitingTableBody(
                    tableStockRecieptModalWindow
                );

                // Using table search we look for the value of the variable
                await stockReceipt.searchTable(
                    detail.designation,
                    tableStockRecieptModalWindow
                );

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await stockReceipt.waitingTableBody(
                    tableStockRecieptModalWindow
                );

                // Enter the quantity in the cellsу
                await stockReceipt.inputQuantityInCell(incomingQuantity);

                // Find the checkbox column and click
                const tableModalComing = "ModalComingTable-Table";
                const numberColumn = await stockReceipt.findColumnNew(
                    page,
                    tableModalComing,
                    "ModalComingTable-Header-AllItemsAdd"
                );
                console.log("numberColumn: ", numberColumn);
                await stockReceipt.getValueOrClickFromFirstRowNoThead(
                    tableStockRecieptModalWindow,
                    numberColumn,
                    Click.Yes,
                    Click.No
                );

                // Check that the first row of the table contains the variable name
                await stockReceipt.checkNameInLineFromFirstRow(
                    detail.designation,
                    '[data-testid="ModalComing-SelectedItems-TableScroll"]'
                );

                // Click on the button
                await stockReceipt.clickButton(
                    " Создать приход ",
                    '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                );

                // // Check the number of parts in the warehouse after posting
                // // Go to the Warehouse page
                remainingStockAfter = await stock.checkingTheQuantityInStock(
                    detail.designation,
                    TableSelection.detail
                );
                // Compare the quantity in cells
                expect(Number(remainingStockAfter)).toBe(
                    Number(remainingStockBefore) + Number(incomingQuantity)
                );

                // Output to the console
                console.log(
                    `Количество ${detail.designation} на складе до оприходования: ${remainingStockBefore}, ` +
                        `оприходовали в количестве: ${incomingQuantity}, ` +
                        `и после оприходования: ${remainingStockAfter}.`
                );
            }
        }
    });

    test("Test Case 08 - Receiving Cbed And Check Stock", async ({ page }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                // Check the number of entities in the warehouse before posting
                // Go to the warehouse page
                remainingStockBefore = await stock.checkingTheQuantityInStock(
                    cbed.designation,
                    TableSelection.cbed
                );

                // Capitalization of the entity
                // Go to the Warehouse page
                await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

                // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
                const selectorstockReceipt =
                    '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
                await stockReceipt.findTable(selectorstockReceipt);

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Click on the button
                await stockReceipt.clickButton(
                    " Создать Приход ",
                    '[data-testid="ComingToSclad-Button-MakeComing"]'
                );

                // Select the selector in the modal window
                await stockReceipt.selectStockReceipt(StockReceipt.cbed);

                const tableStockRecieptModalWindow =
                    '[data-testid="ModalComingTable-TableScroll"]';

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await stockReceipt.waitingTableBodyNoThead(
                    tableStockRecieptModalWindow
                );

                // Using table search we look for the value of the variable
                await stockReceipt.searchTable(
                    cbed.designation,
                    tableStockRecieptModalWindow
                );

                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await stockReceipt.waitingTableBodyNoThead(
                    tableStockRecieptModalWindow
                );

                // Find the checkbox column and click
                const tableModalComing = "ModalComingTable-Table";
                const numberColumn = await stockReceipt.findColumnNew(
                    page,
                    tableModalComing,
                    "ModalComingTable-Header-AllItemsAdd"
                );
                console.log("numberColumn: ", numberColumn);
                await stockReceipt.getValueOrClickFromFirstRowNoThead(
                    tableStockRecieptModalWindow,
                    numberColumn,
                    Click.Yes,
                    Click.No
                );

                // Check the modal window Completed sets
                const tableComplectsSets =
                    '[data-testid="ModalKitsList-Table"]';
                await stockReceipt.completesSetsModalWindow();

                // We get the cell number with a checkmark
                const tableComplectsSetsDataTestId = "ModalKitsList-Table";
                const numberColumnCheckbox = await stockReceipt.findColumnNew(
                    page,
                    tableComplectsSetsDataTestId,
                    "ModalKitsList-TableHeader-SelectAll"
                );
                console.log("numberColumn: ", numberColumnCheckbox);
                await stockReceipt.getValueOrClickFromFirstRow(
                    tableComplectsSets,
                    numberColumnCheckbox,
                    Click.Yes,
                    Click.No
                );

                // Enter the value into the input cell
                const inputlocator =
                    '[data-testid="ModalKitsList-TableRow-QuantityInputField"]';
                await stockReceipt.enterTheValueIntoTheLocatorInput(
                    inputlocator,
                    "1"
                );

                // Click on the button
                await stockReceipt.clickButton(
                    " Выбрать ",
                    '[data-testid="ModalKitsList-SelectButton"]'
                );

                // Wait for the table body to load
                const tableSelectedItems =
                    '[data-testid="ModalComing-SelectedItems-ScladTable"]';
                await stockReceipt.waitingTableBody(tableSelectedItems);

                // Check that the first row of the table contains the variable name
                await stockReceipt.checkNameInLineFromFirstRow(
                    cbed.designation,
                    tableSelectedItems
                );

                // Click on the button
                await stockReceipt.clickButton(
                    " Создать приход ",
                    '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                );

                // Checking the remainder of the entity after capitalization
                // Go to the Warehouse page
                remainingStockAfter = await stock.checkingTheQuantityInStock(
                    cbed.designation,
                    TableSelection.cbed
                );

                // Compare the quantity in cells
                expect(Number(remainingStockAfter)).toBe(
                    Number(remainingStockBefore) + Number(incomingQuantity)
                );

                // Output to the console
                console.log(
                    `Количество ${cbed.designation} на складе до оприходования: ${remainingStockBefore}, ` +
                        `оприходовали в количестве: ${incomingQuantity}, ` +
                        `и после оприходования: ${remainingStockAfter}.`
                );
            }
        }
    });

    test.skip("Test Case 09 - Complete Set Of Product", async ({ page }) => {
        const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
            page
        );

        // Go to the warehouse page
        await completingProductsToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Complete set of Products on the plan
        const selector = '[data-testid="Sclad-completionProductPlan"]';
        await completingProductsToPlan.findTable(selector);

        // Wait for the table body to load
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-ScrollContainer"]';
        await completingProductsToPlan.waitingTableBody(TableComplect);

        // Using table search we look for the value of the variable
        await completingProductsToPlan.searchTable(nameProduct, TableComplect);

        // Wait for the table body to load
        await completingProductsToPlan.waitingTableBody(TableComplect);

        // Check that the first row of the table contains the variable name
        await completingProductsToPlan.checkNameInLineFromFirstRow(
            nameProduct,
            TableComplect
        );

        // We get the cell number with the designation
        const tableModalComing = "TableComplect-TableComplect-Table";
        const numberColumn = await completingProductsToPlan.findColumnNew(
            page,
            tableModalComing,
            "TableComplect-TableComplect-DesignationColumn"
        );
        console.log("numberColumn: ", numberColumn);
        const test = await completingProductsToPlan.getValueOrClickFromFirstRow(
            TableComplect,
            numberColumn
        );

        // Output to the console
        console.log(`Проверка текста ${test}`);
        await completingProductsToPlan.getValueOrClickFromFirstRow(
            TableComplect,
            numberColumn,
            Click.No,
            Click.Yes
        );

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Check the modal window for the delivery note and check the checkbox
        await completingProductsToPlan.assemblyInvoiceModalWindow(
            TypeInvoice.product,
            true
        );

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Click on the button
        await completingProductsToPlan.clickButton(
            " Скомплектовать в набор ",
            '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
        );

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Wait for the table body to load
        await completingProductsToPlan.waitingTableBody(TableComplect);
    });

    test.skip("Test Case 10 - Receiving Product And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);

        // Check the number of entities in the warehouse before posting
        // Go to the warehouse page
        remainingStockBefore = await stock.checkingTheQuantityInStock(
            nameProduct,
            TableSelection.product
        );

        // Go to the warehouse page
        await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
        const selector =
            '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
        await stockReceipt.findTable(selector);

        // Waiting for loading
        await page.waitForLoadState("networkidle");

        // Click on the button
        await stockReceipt.clickButton(
            " Создать Приход ",
            '[data-testid="ComingToSclad-Button-MakeComing"]'
        );

        // Select the selector in the modal window
        await stockReceipt.selectStockReceipt(StockReceipt.cbed);

        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';

        // Waiting for loading
        await page.waitForLoadState("networkidle");

        // Wait for the table body to load
        await stockReceipt.waitingTableBodyNoThead(
            tableStockRecieptModalWindow
        );

        // Using table search we look for the value of the variable
        await stockReceipt.searchTable(
            nameProduct,
            tableStockRecieptModalWindow
        );

        // Waiting for loading
        await page.waitForLoadState("networkidle");

        // Wait for the table body to load
        await stockReceipt.waitingTableBodyNoThead(
            tableStockRecieptModalWindow
        );

        // Find the checkbox column and click
        const tableModalComing = "ModalComingTable-Table";
        const numberColumn = await stockReceipt.findColumnNew(
            page,
            tableModalComing,
            "ModalComingTable-Header-AllItemsAdd"
        );
        console.log("numberColumn: ", numberColumn);
        await stockReceipt.getValueOrClickFromFirstRowNoThead(
            tableStockRecieptModalWindow,
            numberColumn,
            Click.Yes,
            Click.No
        );

        // Check the modal window Completed sets
        const tableComplectsSets = '[data-testid="ModalKitsList-Table"]';
        await stockReceipt.completesSetsModalWindow();

        // We get the cell number with a checkmark
        const tableComplectsSetsDataTestId = "ModalKitsList-Table";
        const numberColumnCheckbox = await stockReceipt.findColumnNew(
            page,
            tableComplectsSetsDataTestId,
            "ModalComingTable-Header-AllItemsAdd"
        );
        console.log("numberColumn: ", numberColumnCheckbox);
        await stockReceipt.getValueOrClickFromFirstRow(
            tableComplectsSets,
            numberColumnCheckbox,
            Click.Yes,
            Click.No
        );

        // Enter the value into the input cell
        const inputlocator =
            '[data-testid="ModalKitsList-TableRow-QuantityInputField"]';
        await stockReceipt.enterTheValueIntoTheLocatorInput(inputlocator, "1");

        await stockReceipt.clickButton(
            " Выбрать ",
            '[data-testid="ModalKitsList-SelectButton"]'
        );

        // Wait for the table body to load
        const tableSelectedItems =
            '[data-testid="ModalComing-SelectedItems-ScladTable"]';
        await stockReceipt.waitingTableBody(tableSelectedItems);

        // Check that the first row of the table contains the variable name
        await stockReceipt.checkNameInLineFromFirstRow(
            nameProduct,
            tableSelectedItems
        );

        // Click on the button
        await stockReceipt.clickButton(
            " Создать приход ",
            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
        );

        // Checking the remainder of the entity after capitalization
        // Go to the Warehouse page
        remainingStockAfter = await stock.checkingTheQuantityInStock(
            nameProduct,
            TableSelection.product
        );

        // Compare the quantity in cells
        expect(Number(remainingStockAfter)).toBe(
            Number(remainingStockBefore) + Number(incomingQuantity)
        );

        // Output to the console
        console.log(
            `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
        );
    });

    test.skip("Test Case 11 - Uploading Shipment Task", async ({ page }) => {
        const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
            page
        );

        // Go to the Warehouse page
        await warehouseTaskForShipment.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Склад: Задачи на отгрузку
        const selector = '[data-testid="Sclad-shippingTasks"]';
        await warehouseTaskForShipment.findTable(selector);

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Wait for the table body to load
        const tableTaskForShipment = '[data-testid="ShipmentsTable-table"]';
        await warehouseTaskForShipment.waitingTableBody(tableTaskForShipment);

        // Using table search we look for the value of the variable
        await warehouseTaskForShipment.searchTable(
            nameProduct,
            tableTaskForShipment
        );

        // Wait for the table body to load
        await warehouseTaskForShipment.waitingTableBody(tableTaskForShipment);

        // Check that the first row of the table contains the variable name
        await warehouseTaskForShipment.checkNameInLineFromFirstRow(
            nameProduct,
            tableTaskForShipment
        );

        // Find the checkbox column and click
        const tableModalComing = "ShipmentsTableBlock-Shipments-Table";
        const numberColumn = await warehouseTaskForShipment.findColumnNew(
            page,
            tableModalComing,
            "ShipmentsTable-check-th"
        );
        console.log("numberColumn: ", numberColumn);
        await warehouseTaskForShipment.getValueOrClickFromFirstRow(
            tableTaskForShipment,
            numberColumn,
            Click.Yes,
            Click.No
        );

        // Wait for the modal window to open BUG
        await warehouseTaskForShipment.waitForSelector(
            '[data-testid="ModalKomplect-destroyModalRight"]'
        );

        // Close the modal window
        await page.mouse.click(1, 1);

        // Find the checkbox column and click
        await warehouseTaskForShipment.getValueOrClickFromFirstRow(
            tableTaskForShipment,
            numberColumn,
            Click.Yes,
            Click.No
        );

        // Click on the button
        await warehouseTaskForShipment.clickButton(" Отгрузить ", ".btn-small");

        // Check the Shipping modal window
        await warehouseTaskForShipment.shipmentModalWindow();

        // Click on the button
        await warehouseTaskForShipment.clickButton(
            " Отгрузить ",
            '[data-testid="ModalShComlit-Button-Ship"]'
        );
    });

    test.skip("Test Case - Archive Warehouse Task", async ({ page }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        const selector = '[data-testid="Sclad-stockOrderAssembly"]';
        await assemblyWarehouse.findTable(selector);

        await page.waitForLoadState("networkidle");

        const WarehouseTable = '[data-testid="AssemblySclad-Table"]';
        await assemblyWarehouse.waitingTableBody(WarehouseTable);

        await assemblyWarehouse.searchTable(nameProduct, WarehouseTable);

        await assemblyWarehouse.waitingTableBody(WarehouseTable);

        await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
            nameProduct,
            WarehouseTable
        );

        await assemblyWarehouse.getValueOrClickFromFirstRow(
            WarehouseTable,
            16,
            Click.Yes
        );

        await assemblyWarehouse.clickButton(
            " Переместить в архив ",
            '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
        );

        await assemblyWarehouse.clickButton(
            " Подтвердить ",
            '[data-testid="ModalPromptMini-Button-Confirm"]'
        );
    });

    test.skip("Test Case - Archive Warehouse Task All", async ({ page }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        const selector = '[data-testid="Sclad-stockOrderAssembly"]';
        await assemblyWarehouse.findTable(selector);

        await page.waitForLoadState("networkidle");

        const WarehouseTable = '[data-testid="AssemblySclad-Table"]';
        await assemblyWarehouse.waitingTableBody(WarehouseTable);

        await assemblyWarehouse.searchTable(designationProduct, WarehouseTable);

        await assemblyWarehouse.waitingTableBody(WarehouseTable);

        await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
            designationProduct,
            WarehouseTable
        );

        await assemblyWarehouse.clickOnTheTableHeaderCell(16, WarehouseTable);

        await assemblyWarehouse.clickButton(
            " Переместить в архив ",
            '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
        );

        await assemblyWarehouse.clickButton(
            " Подтвердить ",
            '[data-testid="ModalPromptMini-Button-Confirm"]'
        );
    });

    test.skip("Test Case - Warehouse Stock Before", async ({ page }) => {
        const designationDetail = "119.01-04.01.02";

        const stock = new CreateStockPage(page);

        // Check the number of parts in the warehouse before posting

        remainingStockBefore = await stock.checkingTheQuantityInStockNew(
            designationDetail,
            TableSelection.detail
        );

        console.log(
            `Количество ${designationDetail} на складе до оприходования  ${remainingStockBefore}`
        );
    });

    test.skip("Test Case - Warehouse Stock After", async ({ page }) => {
        const designationDetail = "119.01-04.01.02";

        const stock = new CreateStockPage(page);

        // Check the number of parts in the warehouse after posting
        await stock.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        const selector = '[data-testid="Sclad-residuals-residuals"]';
        await stock.findTable(selector);

        const tablePartsWarehouseStock = ".scroll-table.detal";
        await stock.waitingTableBody(tablePartsWarehouseStock);

        await stock.searchTable(designationDetail, tablePartsWarehouseStock);
        await stock.waitingTableBody(tablePartsWarehouseStock);

        await stock.checkNameInLineFromFirstRow(
            designationDetail,
            tablePartsWarehouseStock
        );

        remainingStockAfter = await stock.getValueOrClickFromFirstRow(
            tablePartsWarehouseStock,
            3
        );

        expect(Number(remainingStockAfter)).toBe(
            Number(remainingStockBefore) + Number(incomingQuantity)
        );

        console.log(
            `Количество ${designationDetail} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
        );
    });

    test.skip("Test Case 05 - Marking parts test", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        // Go to the Warehouse page
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Order a warehouse for Metalworking
        const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
        await metalworkingWarehouse.findTable(selector);

        const tableMetalworkingWarehouse =
            '[data-testid="MetalloworkingSclad-ScrollTable"]';

        const designationDetail = "030.0.1-01.03.01.004-01";
        // Check if the array is empty
        // if (descendantsDetailArray.length === 0) {
        //     console.error("Массив пустой. Перебор невозможен.");
        // } else {
        //     // Iterate through the array of parts
        //     for (const part of descendantsDetailArray) {
        //         // Wait for the table body to load
        await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
        );

        // Using table search we look for the value of the variable
        await metalworkingWarehouse.searchTable(
            designationDetail,
            tableMetalworkingWarehouse
        );

        // Waiting for loading
        await page.waitForLoadState("networkidle");

        // Wait for the table body to load
        await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
        );

        // Check that the first row of the table contains the variable name
        await metalworkingWarehouse.checkNameInLineFromFirstRow(
            designationDetail,
            tableMetalworkingWarehouse
        );

        // Wait for the table body to load
        await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
        );

        const numberColumn = await metalworkingWarehouse.findColumnNew(
            page,
            "MetalloworkingSclad-ScrollTable",
            "MetalloworkingSclad-DetailsTableHeader-OperationsColumn"
        );
        console.log("numberColumn: ", numberColumn);

        // Upd:
        await metalworkingWarehouse.clickIconOperationNew(
            tableMetalworkingWarehouse,
            numberColumn,
            Click.Yes
        );

        // Waiting for loading
        await page.waitForLoadState("networkidle");

        // Check the production path modal window
        await metalworkingWarehouse.productionPathDetailskModalWindow();

        // Wait for the table body to load
        const productionTable = '[data-testid="OperationPathInfo-table"]';
        await metalworkingWarehouse.waitingTableBody(productionTable);

        // Getting cell value by id
        const operationTable = "OperationPathInfo-table";
        const numberColumnQunatityMade =
            await metalworkingWarehouse.findColumnNew(
                page,
                operationTable,
                "OperationPathInfo-thead-tr-th-sdelano-sh"
            );
        console.log("numberColumn: ", numberColumnQunatityMade);

        await metalworkingWarehouse.getValueOrClickFromFirstRow(
            productionTable,
            numberColumnQunatityMade,
            Click.Yes
        );

        // Getting the value of the first operation
        const numberColumnFirstOperation =
            await metalworkingWarehouse.findColumnNew(
                page,
                operationTable,
                "OperationPathInfo-thead-tr-th-sdelano-sh"
            );
        console.log("numberColumn: ", numberColumnQunatityMade);
        const firstOperation =
            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                productionTable,
                numberColumnFirstOperation
            );
        console.log(firstOperation);
        logger.info(firstOperation);

        // Click on the button
        await metalworkingWarehouse.clickButton(
            " Добавить Отметку для выбранной операции ",
            '[data-testid="ModalOperationPathMetaloworking-add-mark-button"]'
        );

        // Wait for loading
        await page.waitForLoadState("networkidle");

        // Check the progress check modal window
        // await metalworkingWarehouse.completionMarkModalWindow(
        //     firstOperation,
        //     designationDetail,
        //     part.designation
        // );

        // Click on the button
        await metalworkingWarehouse.clickButton(
            " Сохранить Отметку ",
            ".btn-status"
        );

        // Check the production path modal window
        await metalworkingWarehouse.productionPathDetailskModalWindow();

        // Wait for the table body to load
        await metalworkingWarehouse.waitingTableBody(productionTable);

        // Double click on the coordinates and close the modal window
        await page.mouse.dblclick(1, 1);

        // Wait for the table body to load
        await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
        );
        // }
        // }
    });
};
