import { test, expect } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec"; //
import {
    CreateOrderedFromSuppliersPage,
    Supplier,
} from "../pages/OrderedFromSuppliersPage";
import { CreateMetalworkingWarehousePage } from "../pages/MetalworkingWarehousePage";
import { CreateAssemblyWarehousePage } from "../pages/AssemplyWarehousePage";
import { ENV, SELECTORS } from "../config";
import { allure } from "allure-playwright";
import { Click } from "../lib/Page";
import { allColors } from "winston/lib/winston/config";

// Quantity launched into production
let quantityOrder = "2";
const nameDetail = "Адептус механикус";
const nameCbed = "СБ Маслобака 2 Литра";
let checkOrderNumber: string;
let quantityLaunchInProduct: string;

export const runU002 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
        await performLogin(page, "001", "Перов Д.А.", "54321");
        await page.click("button.btn.blues");
    });

    test("Test Case 01 Detail- Launch Detail Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );

        let result =
            await orderedFromSuppliersPage.launchIntoProductionSupplier(
                nameDetail,
                quantityOrder,
                Supplier.details
            );

        quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
        checkOrderNumber = result.checkOrderNumber;

        console.log("Quantity Launched in Product: ", quantityLaunchInProduct);
        console.log("Check Order Number: ", checkOrderNumber);
    });

    test("Test Case 02 Detail - Checking Metalworking Warehouse", async ({
        page,
    }) => {
        const metalworkingTable = "#tablebody";
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(metalworkingTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await metalworkingWarehouse.searchTable(
                nameDetail,
                metalworkingTable
            );

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(metalworkingTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: We check the number of those launched into production",
            async () => {
                // const numberColumn = await metalworkingWarehouse.findColumn(
                //     page,
                //     "DeficitIzd-ScrollTable",
                //     "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                // );
                // console.log("numberColumn: ", numberColumn);

                // Upd:
                const numberLaunched =
                    await metalworkingWarehouse.getValueOrClickFromFirstRow(
                        metalworkingTable,
                        4
                    );
                await metalworkingWarehouse.checkNameInLineFromFirstRow(
                    nameDetail,
                    metalworkingTable
                );

                console.log(numberLaunched);
                console.log(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );

                expect(Number(numberLaunched)).toBe(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );
            }
        );
    });

    test("Test Case 03 Detail- Launch Detail Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        let result =
            await orderedFromSuppliersPage.launchIntoProductionSupplier(
                nameDetail,
                quantityOrder,
                Supplier.details
            );

        quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
        checkOrderNumber = result.checkOrderNumber;
    });

    test("Test Case 04 Detail- Checking Metalworking Warehouse", async ({
        page,
    }) => {
        const metalworkingTable = "#tablebody";
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(metalworkingTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await metalworkingWarehouse.searchTable(
                nameDetail,
                metalworkingTable
            );

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(metalworkingTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: We check the number of those launched into production",
            async () => {
                // const numberColumn = await metalworkingWarehouse.findColumn(
                //     page,
                //     "DeficitIzd-ScrollTable",
                //     "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                // );
                // console.log("numberColumn: ", numberColumn);

                // Upd:
                const numberLaunched =
                    await metalworkingWarehouse.getValueOrClickFromFirstRow(
                        metalworkingTable,
                        4
                    );
                await metalworkingWarehouse.checkNameInLineFromFirstRow(
                    nameDetail,
                    metalworkingTable
                );

                console.log(numberLaunched);
                console.log(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );

                expect(Number(numberLaunched)).toBe(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );
            }
        );
    });

    test("Test Case 05 Detail - Moving a warehouse task to the archive", async ({
        page,
    }) => {
        const metalworkingTable = "#tablebody";
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(metalworkingTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await metalworkingWarehouse.searchTable(
                nameDetail,
                metalworkingTable
            );

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(metalworkingTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: Check the first line in the first row",
            async () => {
                await metalworkingWarehouse.checkNameInLineFromFirstRow(
                    nameDetail,
                    metalworkingTable
                );
            }
        );

        await allure.step(
            "Step 5: Find the cell and click on the send checkbox",
            async () => {
                const tableModalComing = "MetalloworkingSclad-ScrollTable";
                const numberColumn = await metalworkingWarehouse.findColumn(
                    page,
                    metalworkingTable,
                    "TableComplect-TableComplect-DesignationColumn"
                );
                console.log("numberColumn: ", numberColumn);

                // Upd:
                await metalworkingWarehouse.getValueOrClickFromFirstRow(
                    metalworkingTable,
                    14,
                    Click.Yes
                );
            }
        );

        await allure.step(
            "Step 6: Click the button to move to archive",
            async () => {
                await metalworkingWarehouse.clickButton(
                    " Переместить в архив ",
                    '[data-testid="MetalloworkingSclad-PrintControls-ArchiveButton"]'
                );
            }
        );

        await allure.step(
            "Step 7: Check modal window transferring to archive",
            async () => {
                await metalworkingWarehouse.checkModalWindowForTransferringToArchive();
            }
        );

        await allure.step(
            "Step 8: Click the button to confirm button",
            async () => {
                await metalworkingWarehouse.clickButton(
                    " Подтвердить ",
                    '[data-testid="ModalPromptMini-Button-Confirm"]'
                );
            }
        );
    });

    test("Test Case 06 Cbed - Launch Cbed Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );

        let result =
            await orderedFromSuppliersPage.launchIntoProductionSupplier(
                nameCbed,
                quantityOrder,
                Supplier.cbed
            );

        quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
        checkOrderNumber = result.checkOrderNumber;
    });

    test("Test Case 07 Cbed - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyTable = "#tablebody";
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderAssembly"]';
                await assemblyWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await assemblyWarehouse.waitingTableBody(assemblyTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await assemblyWarehouse.searchTable(nameCbed, assemblyTable);

            // Wait for the table body to load
            await assemblyWarehouse.waitingTableBody(assemblyTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: We check the number of those launched into production",
            async () => {
                // const numberColumn = await metalworkingWarehouse.findColumn(
                //     page,
                //     "DeficitIzd-ScrollTable",
                //     "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                // );
                // console.log("numberColumn: ", numberColumn);

                // Upd:
                const numberLaunched =
                    await assemblyWarehouse.getValueOrClickFromFirstRow(
                        assemblyTable,
                        5
                    );
                await assemblyWarehouse.checkNameInLineFromFirstRow(
                    nameCbed,
                    assemblyTable
                );

                console.log(numberLaunched);
                console.log(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );

                expect(Number(numberLaunched)).toBe(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );
            }
        );
    });

    test("Test Case 08 Cbed - Launch Cbed Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );

        let result =
            await orderedFromSuppliersPage.launchIntoProductionSupplier(
                nameCbed,
                quantityOrder,
                Supplier.cbed
            );

        quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
        checkOrderNumber = result.checkOrderNumber;
    });

    test("Test Case 09 Cbed - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyTable = "#tablebody";
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderAssembly"]';
                await assemblyWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await assemblyWarehouse.waitingTableBody(assemblyTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await assemblyWarehouse.searchTable(nameCbed, assemblyTable);

            // Wait for the table body to load
            await assemblyWarehouse.waitingTableBody(assemblyTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: We check the number of those launched into production",
            async () => {
                // const numberColumn = await metalworkingWarehouse.findColumn(
                //     page,
                //     "DeficitIzd-ScrollTable",
                //     "DeficitIzd-ScrollTable-TableHeader-ItsNumber"
                // );
                // console.log("numberColumn: ", numberColumn);

                // Upd:
                const numberLaunched =
                    await assemblyWarehouse.getValueOrClickFromFirstRow(
                        assemblyTable,
                        5
                    );
                await assemblyWarehouse.checkNameInLineFromFirstRow(
                    nameCbed,
                    assemblyTable
                );

                console.log(numberLaunched);
                console.log(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );

                expect(Number(numberLaunched)).toBe(
                    Number(quantityOrder) + Number(quantityLaunchInProduct)
                );
            }
        );
    });

    test("Test Case 10 Cbed - Moving a warehouse task to the archive", async ({
        page,
    }) => {
        const assemblyTable = "#tablebody";
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-stockOrderAssembly"]';
                await assemblyWarehouse.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await assemblyWarehouse.waitingTableBody(assemblyTable);
            }
        );

        await allure.step("Step 3: Search product", async () => {
            // Using table search we look for the value of the variable
            await assemblyWarehouse.searchTable(nameCbed, assemblyTable);

            // Wait for the table body to load
            await assemblyWarehouse.waitingTableBody(assemblyTable);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 4: Check the first line in the first row",
            async () => {
                await assemblyWarehouse.checkNameInLineFromFirstRow(
                    nameCbed,
                    assemblyTable
                );
            }
        );

        await allure.step(
            "Step 5: Find the cell and click on the send checkbox",
            async () => {
                const numberColumn = await assemblyWarehouse.findColumn(
                    page,
                    assemblyTable,
                    "AssemblySclad-PrintTableHeader-SelectColumn"
                );
                console.log("numberColumn: ", numberColumn);

                // Upd:
                await assemblyWarehouse.getValueOrClickFromFirstRow(
                    assemblyTable,
                    15,
                    Click.Yes
                );
            }
        );

        await allure.step(
            "Step 6: Click the button to move to archive",
            async () => {
                await assemblyWarehouse.clickButton(
                    " Переместить в архив ",
                    '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
                );
            }
        );

        await allure.step(
            "Step 7: Check modal window transferring to archive",
            async () => {
                await assemblyWarehouse.checkModalWindowForTransferringToArchive();
            }
        );

        await allure.step(
            "Step 8: Click the button to confirm button",
            async () => {
                await assemblyWarehouse.clickButton(
                    " Подтвердить ",
                    '[data-testid="ModalPromptMini-Button-Confirm"]'
                );
            }
        );
    });
};
