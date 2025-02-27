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
import { allure } from "allure-playwright";

export const runU001 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
        await performLogin(page, "001", "Перов Д.А.", "54321");
        await page.click("button.btn.blues");
    });

    test.skip("Спецификация", async ({ page }) => {
        // Удалить после
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await allure.step("Step 1: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 2: Click on the Create order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Создать заказ ",
                    '[data-testid="IssueShipment-Button-CreateOrder"]'
                );
            }
        );

        await allure.step("Step 3: Click on the Select button", async () => {
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
        });

        await allure.step(
            "Step 4: Search product on modal window",
            async () => {
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
            }
        );
        await allure.step(
            "Step 5: Choice product in modal window",
            async () => {
                // Select a product in the "Select product" modal window
                await loadingTaskPage.choiceProductInModal(nameProduct);

                await page.waitForTimeout(2000);
            }
        );

        await allure.step(
            "Step 6: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Выбрать ",
                    '[data-testid="ModalAllProducts-btn-Select"]'
                );
            }
        );

        await allure.step("Step 7: Checking the selected product", async () => {
            // Check that the selected product displays the expected product
            await loadingTaskPage.checkProduct(nameProduct);
        });
        await allure.step("Step 8: Selecting a buyer", async () => {
            // Select a buyer in the dropdown menu
            await loadingTaskPage.choiceBuyer("5");

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step(
            "Step 9: We save descendants from the specification into an array",
            async () => {
                // Save Assembly units and Parts from the Specification to an array
                await loadingTaskPage.preservingDescendants(
                    descendantsCbedArray,
                    descendantsDetailArray
                );
            }
        );

        // Удалить после
    });

    test.skip("Test Case 01 - Loading Task", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await allure.step("Step 1: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 2: Click on the Create order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Создать заказ ",
                    '[data-testid="IssueShipment-Button-CreateOrder"]'
                );
            }
        );

        await allure.step("Step 3: Click on the Select button", async () => {
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
        });

        await allure.step(
            "Step 4: Search product on modal window",
            async () => {
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
            }
        );
        await allure.step(
            "Step 5: Choice product in modal window",
            async () => {
                // Select a product in the "Select product" modal window
                await loadingTaskPage.choiceProductInModal(nameProduct);

                await page.waitForTimeout(2000);
            }
        );

        await allure.step(
            "Step 6: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Выбрать ",
                    '[data-testid="ModalAllProducts-btn-Select"]'
                );
            }
        );

        await allure.step("Step 7: Checking the selected product", async () => {
            // Check that the selected product displays the expected product
            await loadingTaskPage.checkProduct(nameProduct);
        });
        await allure.step("Step 8: Selecting a buyer", async () => {
            // Select a buyer in the dropdown menu
            await loadingTaskPage.choiceBuyer("5");

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });
        await allure.step(
            "Step 9: We save descendants from the specification into an array",
            async () => {
                // Save Assembly units and Parts from the Specification to an array
                await loadingTaskPage.preservingDescendants(
                    descendantsCbedArray,
                    descendantsDetailArray
                );
            }
        );
        await allure.step(
            "Step 10: Click on the save order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Сохранить Заказ ",
                    '[data-testid="AddOrder-Button-SaveOrder"]'
                );
            }
        );
    });

    test.skip("Test Case 02 - Launch Into Production Product", async ({
        page,
    }) => {
        const shortageProduct = new CreateShortageProductPage(page);
        const deficitTable = '[data-testid="DeficitIzd-ScrollTable"]';
        let checkOrderNumber: string;

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });
        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector =
                    '[data-testid="Sclad-deficitProduction-deficitProduction"]';
                await shortageProduct.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await shortageProduct.searchTable(nameProduct, deficitTable);

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTable);
        });

        await allure.step(
            "Step 4: Check the checkbox in the first column",
            async () => {
                // Upd:
                // Find the variable name in the first line and check the checkbox
                await shortageProduct.checkboxMarkNameInLineFromFirstRow(
                    nameProduct,
                    deficitTable
                );

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTable);
            }
        );

        await allure.step(
            "Step 5: We check the number of those launched into production",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    "DeficitIzd-ScrollTable",
                    "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                );
                console.log("numberColumn: ", numberColumn);

                // Upd:
                await shortageProduct.getValueOrClickFromFirstRow(
                    deficitTable,
                    17
                );
            }
        );

        await allure.step(
            "Step 6: Click on the Launch on production button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " Запустить в производство ",
                    '[data-testid="DeficitIzd-StartButton"]'
                );
            }
        );

        await allure.step(
            "Step 7: Testing a modal window for production launch",
            async () => {
                // Check the modal window Launch into production
                await shortageProduct.checkModalWindowLaunchIntoProduction();

                // Check the date in the Launch into production modal window
                await shortageProduct.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );
            }
        );

        await allure.step("Step 8: Enter a value into a cell", async () => {
            // Check the value in the Own quantity field and enter the value
            await shortageProduct.checkOrderQuantity("1", "1");
        });

        await allure.step("Step 9: We save the order number", async () => {
            // Get the order number
            checkOrderNumber = await shortageProduct.checkOrderNumber();
            console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
            "Step 10: Click on the In launch button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " В производство ",
                    ".btn-status"
                );
            }
        );

        await allure.step(
            "Step 11: We check that the order number is displayed in the notification",
            async () => {
                // Check the order number in the success notification
                await shortageProduct.getMessage(checkOrderNumber);
            }
        );
    });

    test.skip("Test Case 03- Launch Into Production Cbed", async ({ page }) => {
        const shortageAssemblies = new CreatShortageAssembliesPage(page);
        const deficitTable = '[data-testid="DeficitCbed-ScrollTable"]';
        let checkOrderNumber: string;

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage assemblies page",
            async () => {
                // Find and go to the page using the locator shortage assemblies
                const selector =
                    '[data-testid="Sclad-deficitCbed-deficitCbed"]';
                await shortageAssemblies.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 3: Search product", async () => {
                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTable);

                    // Using table search we look for the value of the variable
                    await shortageAssemblies.searchTable(
                        cbed.designation,
                        deficitTable
                    );

                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTable);
                });

                await allure.step(
                    "Step 4: Check the checkbox in the first column",
                    async () => {
                        // Find the variable name in the first line and check the checkbox
                        await shortageAssemblies.checkboxMarkNameInLineFromFirstRow(
                            cbed.designation,
                            deficitTable
                        );

                        // Wait for the table body to load
                        await shortageAssemblies.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 5: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                "DeficitIzd-ScrollTable",
                                "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                            );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await shortageAssemblies.getValueOrClickFromFirstRow(
                            deficitTable,
                            18
                        );
                    }
                );

                await allure.step(
                    "Step 6: Click on the Launch on production button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitCbed-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 7: Testing a modal window for production launch",
                    async () => {
                        // Check the modal window Launch into production
                        await shortageAssemblies.checkModalWindowLaunchIntoProduction();

                        // Check the date in the Launch into production modal window
                        await shortageAssemblies.checkCurrentDate(
                            '[data-testid="ModalStartProduction-OrderDateValue"]'
                        );
                    }
                );

                await allure.step(
                    "Step 8: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        await shortageAssemblies.checkOrderQuantity("1", "1");
                    }
                );

                await allure.step(
                    "Step 9: We save the order number",
                    async () => {
                        // Get the order number
                        checkOrderNumber =
                            await shortageAssemblies.checkOrderNumber();
                        console.log(
                            `Полученный номер заказа: ${checkOrderNumber}`
                        );
                    }
                );

                await allure.step(
                    "Step 10: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 11: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageAssemblies.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 12: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageAssemblies.closeSuccessMessage();
                    }
                );
            }
        }
    });

    test.skip("Test Case 04- Launch Into Production Parts", async ({
        page,
    }) => {
        const shortageParts = new CreatShortagePartsPage(page);
        const deficitTable = ".scroll-table";
        let checkOrderNumber: string;

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 2: Open the shortage parts page", async () => {
            // Find and go to the page using the locator Parts Shortage
            const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
            await shortageParts.findTable(selector);
        });

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 3: Search product", async () => {
                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTable);

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    // Using table search we look for the value of the variable
                    await shortageParts.searchTable(
                        part.designation,
                        deficitTable
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    await page.waitForTimeout(1000);

                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTable);
                });

                await allure.step(
                    "Step 4: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await shortageParts.checkNameInLineFromFirstRowBUG(
                            part.designation,
                            deficitTable
                        );

                        // Wait for the table body to load
                        await shortageParts.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 5: Click on the Launch on production button ",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitDetal-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 6: Testing a modal window for production launch",
                    async () => {
                        // Check the modal window Launch into production
                        await shortageParts.checkModalWindowLaunchIntoProduction();

                        // Check the date in the Launch into production modal window
                        await shortageParts.checkCurrentDate(
                            '[data-testid="ModalStartProduction-OrderDateValue"]'
                        );
                    }
                );

                await allure.step(
                    "Step 7: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        await shortageParts.checkOrderQuantity("1", "1");
                    }
                );

                await allure.step(
                    "Step 8: We save the order number",
                    async () => {
                        // Get the order number
                        checkOrderNumber =
                            await shortageParts.checkOrderNumber();
                        console.log(
                            `Полученный номер заказа: ${checkOrderNumber}`
                        );
                    }
                );

                await allure.step(
                    "Step 9: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 10: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageParts.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 11: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageParts.closeSuccessMessage();
                    }
                );
            }
        }
    });

    test.skip("Test Case 05 - Marking Parts", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
        const tableMetalworkingWarehouse =
            '[data-testid="MetalloworkingSclad-ScrollTable"]';
        const productionTable = '[data-testid="OperationPathInfo-table"]';
        let numberColumnQunatityMade: number;
        let firstOperation: string;
        const operationTable = "OperationPathInfo-table";

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the metalworking warehouse page",
            async () => {
                // Find and go to the page using the locator Order a warehouse for Metalworking
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 3: Search product", async () => {
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
                });

                await allure.step(
                    "Step 4: Check the checkbox in the first column",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            part.designation,
                            tableMetalworkingWarehouse
                        );

                        // Wait for the table body to load
                        await metalworkingWarehouse.waitingTableBody(
                            tableMetalworkingWarehouse
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find and click on the operation icon",
                    async () => {
                        // Getting cell value by id
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 6: Check the production path modal window ",
                    async () => {
                        // Check the production path modal window
                        await metalworkingWarehouse.productionPathDetailskModalWindow();

                        // Wait for the table body to load

                        await metalworkingWarehouse.waitingTableBody(
                            productionTable
                        );
                    }
                );

                await allure.step(
                    "Step 7: We find, get the value and click on the cell done pcs",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await metalworkingWarehouse.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 8: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTable,
                                "OperationPathInfo-thead-tr-th-operatsii"
                            );
                        console.log("numberColumn: ", numberColumnQunatityMade);
                        firstOperation =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                productionTable,
                                numberColumnFirstOperation
                            );
                        console.log(firstOperation);
                        logger.info(firstOperation);
                    }
                );

                await allure.step(
                    "Step 9: Click on the add mark button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Добавить Отметку для выбранной операции ",
                            '[data-testid="ModalOperationPathMetaloworking-add-mark-button"]'
                        );

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step(
                    "Step 10: Checking the modal window and marking completion",
                    async () => {
                        // Check the progress check modal window
                        await metalworkingWarehouse.completionMarkModalWindow(
                            firstOperation,
                            part.name,
                            part.designation
                        );
                    }
                );

                await allure.step(
                    "Step 11: Click on the Save order button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Сохранить Отметку ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 12: Check the production path modal window",
                    async () => {
                        // Check the production path modal window
                        await metalworkingWarehouse.productionPathDetailskModalWindow();

                        // Wait for the table body to load
                        await metalworkingWarehouse.waitingTableBody(
                            productionTable
                        );
                    }
                );

                await allure.step(
                    "Step 13: Closing a modal window by clicking on the logo",
                    async () => {
                        // Double click on the coordinates and close the modal window
                        await page.mouse.dblclick(1, 1);

                        // Wait for the table body to load
                        await metalworkingWarehouse.waitingTableBody(
                            tableMetalworkingWarehouse
                        );
                    }
                );
            }
        }
    });

    test.skip("Test Case 06 - Complete Set Of Cbed", async ({ page }) => {
        const completingAssembliesToPlan =
            new CreateCompletingAssembliesToPlanPage(page);
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-Table"]';

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingAssembliesToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 2: Open the completion cbed plan page",
            async () => {
                // Find and go to the page using the locator Completing assemblies to plan
                const selector = '[data-testid="Sclad-completionCbedPlan"]';
                await completingAssembliesToPlan.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 3: Search product", async () => {
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000);
                    // Using table search we look for the value of the variable
                    await completingAssembliesToPlan.searchTable(
                        cbed.designation,
                        TableComplect
                    );

                    await page.waitForTimeout(1000);
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await completingAssembliesToPlan.checkNameInLineFromFirstRow(
                            cbed.designation,
                            TableComplect
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the column designation and click",
                    async () => {
                        // Find the column designation and click
                        const tableCompectDataTestId =
                            "TableComplect-TableComplect-Table";
                        const numberColumn =
                            await completingAssembliesToPlan.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 6: Check the modal window for the delivery note and check the checkbox",
                    async () => {
                        // Check the modal window for the delivery note and check the checkbox
                        await completingAssembliesToPlan.assemblyInvoiceModalWindow(
                            TypeInvoice.cbed,
                            true
                        );

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step(
                    "Step 7: Click on the button to assemble into a set",
                    async () => {
                        // Click on the button
                        await completingAssembliesToPlan.clickButton(
                            " Скомплектовать в набор ",
                            '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 8: Check close modal window complete set",
                    async () => {
                        const modalWindow =
                            '[data-testid="ModalAddWaybill-WaybillDetails-Right"]';
                        await completingAssembliesToPlan.checkCloseModalWindow(
                            modalWindow
                        );
                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    }
                );
            }
        }
    });

    test.skip("Test Case 07 - Receiving Part And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Iterate through the array of parts
            for (const detail of descendantsDetailArray) {
                //  Check the number of parts in the warehouse before posting
                await allure.step(
                    "Step 1: Receiving quantities from balances",
                    async () => {
                        // Receiving quantities from balances
                        remainingStockBefore =
                            await stock.checkingTheQuantityInStock(
                                detail.designation,
                                TableSelection.detail
                            );
                    }
                );

                // Capitalization of the entity
                await allure.step(
                    "Step 2: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 3: Open the stock receipt page",
                    async () => {
                        // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
                        const selectorstockReceipt =
                            '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
                        await stockReceipt.findTable(selectorstockReceipt);
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step(
                    "Step 4: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step(
                    "Step 5: Select the selector in the modal window",
                    async () => {
                        // Select the selector in the modal window
                        await stockReceipt.selectStockReceipt(
                            StockReceipt.metalworking
                        );
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await stockReceipt.waitingTableBody(
                            tableStockRecieptModalWindow
                        );
                    }
                );

                await allure.step("Step 6: Search product", async () => {
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
                });

                await allure.step(
                    "Step 7: Enter the quantity in the cells",
                    async () => {
                        // Enter the quantity in the cells
                        await stockReceipt.inputQuantityInCell(
                            incomingQuantity
                        );
                    }
                );

                await allure.step(
                    "Step 8: Find the checkbox column and click",
                    async () => {
                        // Find the checkbox column and click
                        const tableModalComing = "ModalComingTable-Table";
                        const numberColumn = await stockReceipt.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 9: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await stockReceipt.checkNameInLineFromFirstRow(
                            detail.designation,
                            '[data-testid="ModalComing-SelectedItems-TableScroll"]'
                        );
                    }
                );

                await allure.step(
                    "Step 10: Click on the create receipt button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать приход ",
                            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 11: Check the number of parts in the warehouse after posting",
                    async () => {
                        // Check the number of parts in the warehouse after posting
                        remainingStockAfter =
                            await stock.checkingTheQuantityInStock(
                                detail.designation,
                                TableSelection.detail
                            );
                    }
                );

                await allure.step(
                    "Step 12: Compare the quantity in cells",
                    async () => {
                        // Compare the quantity in cells
                        expect(Number(remainingStockAfter)).toBe(
                            Number(remainingStockBefore) +
                                Number(incomingQuantity)
                        );

                        // Output to the console
                        console.log(
                            `Количество ${detail.designation} на складе до оприходования: ${remainingStockBefore}, ` +
                                `оприходовали в количестве: ${incomingQuantity}, ` +
                                `и после оприходования: ${remainingStockAfter}.`
                        );
                    }
                );
            }
        }
    });

    test.skip("Test Case 08 - Receiving Cbed And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';
        const tableComplectsSets = '[data-testid="ModalKitsList-Table"]';

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            console.error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step(
                    "Step 1: Receiving quantities from balances",
                    async () => {
                        // Check the number of entities in the warehouse before posting
                        remainingStockBefore =
                            await stock.checkingTheQuantityInStock(
                                cbed.designation,
                                TableSelection.cbed
                            );
                    }
                );

                // Capitalization of the entity
                await allure.step(
                    "Step 2: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 3: Open the stock receipt page",
                    async () => {
                        // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
                        const selectorstockReceipt =
                            '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
                        await stockReceipt.findTable(selectorstockReceipt);

                        // Waiting for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step(
                    "Step 4: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step(
                    "Step 5: Select the selector in the modal window",
                    async () => {
                        // Select the selector in the modal window
                        await stockReceipt.selectStockReceipt(
                            StockReceipt.cbed
                        );
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await stockReceipt.waitingTableBodyNoThead(
                            tableStockRecieptModalWindow
                        );
                    }
                );

                await allure.step("Step 6: Search product", async () => {
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
                });

                await allure.step(
                    "Step 7: Find the checkbox column and click",
                    async () => {
                        // Find the checkbox column and click
                        const tableModalComing = "ModalComingTable-Table";
                        const numberColumn = await stockReceipt.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 8: Check the modal window Completed sets",
                    async () => {
                        // Check the modal window Completed sets
                        await stockReceipt.completesSetsModalWindow();
                    }
                );

                await allure.step(
                    "Step 9: We get the cell number with a checkmark",
                    async () => {
                        // We get the cell number with a checkmark
                        const tableComplectsSetsDataTestId =
                            "ModalKitsList-Table";
                        const numberColumnCheckbox =
                            await stockReceipt.findColumn(
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
                    }
                );

                await allure.step(
                    "Step 10: Enter the quantity in the cells",
                    async () => {
                        // Enter the value into the input cell
                        const inputlocator =
                            '[data-testid="ModalKitsList-TableRow-QuantityInputField"]';
                        await stockReceipt.enterTheValueIntoTheLocatorInput(
                            inputlocator,
                            "1"
                        );
                    }
                );

                await allure.step(
                    "Step 11: Click on the choice button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Выбрать ",
                            '[data-testid="ModalKitsList-SelectButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 12: Check that the first row of the table contains the variable name",
                    async () => {
                        // Wait for the table body to load
                        const tableSelectedItems =
                            '[data-testid="ModalComing-SelectedItems-ScladTable"]';
                        await stockReceipt.waitingTableBody(tableSelectedItems);

                        // Check that the first row of the table contains the variable name
                        await stockReceipt.checkNameInLineFromFirstRow(
                            cbed.designation,
                            tableSelectedItems
                        );
                    }
                );

                await allure.step(
                    "Step 13: Click on the create receipt button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать приход ",
                            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 14: Check the number of parts in the warehouse after posting",
                    async () => {
                        // Checking the remainder of the entity after capitalization
                        remainingStockAfter =
                            await stock.checkingTheQuantityInStock(
                                cbed.designation,
                                TableSelection.cbed
                            );
                    }
                );

                await allure.step(
                    "Step 15: Compare the quantity in cells",
                    async () => {
                        // Compare the quantity in cells
                        expect(Number(remainingStockAfter)).toBe(
                            Number(remainingStockBefore) +
                                Number(incomingQuantity)
                        );

                        // Output to the console
                        console.log(
                            `Количество ${cbed.designation} на складе до оприходования: ${remainingStockBefore}, ` +
                                `оприходовали в количестве: ${incomingQuantity}, ` +
                                `и после оприходования: ${remainingStockAfter}.`
                        );
                    }
                );
            }
        }
    });

    test.skip("Test Case 09 - Complete Set Of Product", async ({ page }) => {
        const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
            page
        );
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-ScrollContainer"]';

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingProductsToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 2: Open the completion product plan page",
            async () => {
                // Find and go to the page using the locator Complete set of Products on the plan
                const selector = '[data-testid="Sclad-completionProductPlan"]';
                await completingProductsToPlan.findTable(selector);

                // Wait for the table body to load
                await completingProductsToPlan.waitingTableBody(TableComplect);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await completingProductsToPlan.searchTable(
                nameProduct,
                TableComplect
            );

            // Wait for the table body to load
            await completingProductsToPlan.waitingTableBody(TableComplect);
        });

        await allure.step(
            "Step 4: Check the first line in the first row",
            async () => {
                // Check that the first row of the table contains the variable name
                await completingProductsToPlan.checkNameInLineFromFirstRow(
                    nameProduct,
                    TableComplect
                );
            }
        );

        await allure.step(
            "Step 5: Find the column designation and click",
            async () => {
                // We get the cell number with the designation
                const tableModalComing = "TableComplect-TableComplect-Table";
                const numberColumn = await completingProductsToPlan.findColumn(
                    page,
                    tableModalComing,
                    "TableComplect-TableComplect-DesignationColumn"
                );
                console.log("numberColumn: ", numberColumn);

                const test =
                    await completingProductsToPlan.getValueOrClickFromFirstRow(
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
            }
        );

        await allure.step(
            "Step 6: Check the modal window for the delivery note and check the checkbox",
            async () => {
                // Check the modal window for the delivery note and check the checkbox
                await completingProductsToPlan.assemblyInvoiceModalWindow(
                    TypeInvoice.product,
                    true
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step(
            "Step 7: Click on the button to assemble into a set",
            async () => {
                // Click on the button
                await completingProductsToPlan.clickButton(
                    " Скомплектовать в набор ",
                    '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await completingProductsToPlan.waitingTableBody(TableComplect);
            }
        );
    });

    test.skip("Test Case 10 - Receiving Product And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';
        const tableComplectsSets = '[data-testid="ModalKitsList-Table"]';

        await allure.step(
            "Step 1: Receiving quantities from balances",
            async () => {
                // Check the number of entities in the warehouse before posting
                remainingStockBefore = await stock.checkingTheQuantityInStock(
                    nameProduct,
                    TableSelection.product
                );
            }
        );

        // Capitalization of the entity
        await allure.step("Step 2: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 3: Open the stock receipt page", async () => {
            // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
            const selector =
                '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
            await stockReceipt.findTable(selector);

            // Waiting for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: Click on the create receipt button",
            async () => {
                // Click on the button
                await stockReceipt.clickButton(
                    " Создать Приход ",
                    '[data-testid="ComingToSclad-Button-MakeComing"]'
                );
            }
        );

        await allure.step(
            "Step 5: Select the selector in the modal window",
            async () => {
                // Select the selector in the modal window
                await stockReceipt.selectStockReceipt(StockReceipt.cbed);
                // Waiting for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await stockReceipt.waitingTableBodyNoThead(
                    tableStockRecieptModalWindow
                );
            }
        );

        await allure.step("Step 6: Search product", async () => {
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
        });

        await allure.step(
            "Step 7: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                const tableModalComing = "ModalComingTable-Table";
                const numberColumn = await stockReceipt.findColumn(
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
            }
        );

        await allure.step(
            "Step 8: Check the modal window Completed sets",
            async () => {
                // Check the modal window Completed sets
                await stockReceipt.completesSetsModalWindow();
            }
        );

        await allure.step(
            "Step 9: We get the cell number with a checkmark",
            async () => {
                // We get the cell number with a checkmark
                const tableComplectsSetsDataTestId = "ModalKitsList-Table";
                const numberColumnCheckbox = await stockReceipt.findColumn(
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
            }
        );

        await allure.step(
            "Step 10: Enter the quantity in the cells",
            async () => {
                // Enter the value into the input cell
                const inputlocator =
                    '[data-testid="ModalKitsList-TableRow-QuantityInputField"]';
                await stockReceipt.enterTheValueIntoTheLocatorInput(
                    inputlocator,
                    "1"
                );
            }
        );

        await allure.step(
            "Step 11: Click on the choice button on the modal window",
            async () => {
                // Click on the button
                await stockReceipt.clickButton(
                    " Выбрать ",
                    '[data-testid="ModalKitsList-SelectButton"]'
                );
            }
        );

        await allure.step(
            "Step 12: Check that the first row of the table contains the variable name",
            async () => {
                // Wait for the table body to load
                const tableSelectedItems =
                    '[data-testid="ModalComing-SelectedItems-ScladTable"]';
                await stockReceipt.waitingTableBody(tableSelectedItems);

                // Check that the first row of the table contains the variable name
                await stockReceipt.checkNameInLineFromFirstRow(
                    nameProduct,
                    tableSelectedItems
                );
            }
        );

        await allure.step(
            "Step 13: Click on the create receipt button on the modal window",
            async () => {
                // Click on the button
                await stockReceipt.clickButton(
                    " Создать приход ",
                    '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                );
            }
        );

        await allure.step(
            "Step 14: Check the number of parts in the warehouse after posting",
            async () => {
                // Checking the remainder of the entity after capitalization
                remainingStockAfter = await stock.checkingTheQuantityInStock(
                    nameProduct,
                    TableSelection.product
                );
            }
        );

        await allure.step(
            "Step 15: Compare the quantity in cells",
            async () => {
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
            }
        );
    });

    test("Test Case 11 - Uploading Shipment Task", async ({ page }) => {
        const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
            page
        );
        const tableTaskForShipment = '[data-testid="ShipmentsTable-table"]';
        const tableModalComing = "ShipmentsTable-table";
        let numberColumn: number;

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await warehouseTaskForShipment.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 2: Open the warehouse shipping task page",
            async () => {
                // Find and go to the page using the locator Склад: Задачи на отгрузку
                const selector = '[data-testid="Sclad-shippingTasks"]';
                await warehouseTaskForShipment.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await warehouseTaskForShipment.waitingTableBody(
                    tableTaskForShipment
                );
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await warehouseTaskForShipment.searchTable(
                nameProduct,
                tableTaskForShipment
            );

            // Wait for the table body to load
            await warehouseTaskForShipment.waitingTableBody(
                tableTaskForShipment
            );
        });

        await allure.step(
            "Step 4: Check that the first row of the table contains the variable name",
            async () => {
                // Check that the first row of the table contains the variable name
                await warehouseTaskForShipment.checkNameInLineFromFirstRow(
                    nameProduct,
                    tableTaskForShipment
                );
            }
        );

        await allure.step(
            "Step 5: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                numberColumn = await warehouseTaskForShipment.findColumn(
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
            }
        );

        await allure.step(
            "Step 6: Closing a modal window by clicking on the logo",
            async () => {
                // Close the modal window
                await page.mouse.click(1, 1);

                // Wait for the modal window to open BUG
                await warehouseTaskForShipment.waitForSelector(
                    '[data-testid="ModalKomplect-destroyModalRight"]'
                );
            }
        );

        await allure.step(
            "Step 7: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                await warehouseTaskForShipment.getValueOrClickFromFirstRow(
                    tableTaskForShipment,
                    numberColumn,
                    Click.Yes,
                    Click.No
                );
            }
        );
        await allure.step("Step 8: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                ".btn-small"
            );
        });

        await allure.step(
            "Step 9: Check the Shipping modal window",
            async () => {
                // Check the Shipping modal window
                await warehouseTaskForShipment.shipmentModalWindow();
            }
        );

        await allure.step("Step 10: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                '[data-testid="ModalShComlit-Button-Ship"]'
            );
        });
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

        const numberColumn = await metalworkingWarehouse.findColumn(
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
        const numberColumnQunatityMade = await metalworkingWarehouse.findColumn(
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
            await metalworkingWarehouse.findColumn(
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
