import { test, expect, Page } from "@playwright/test";
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
import testData1 from '../testdata/U002-PC1.json';


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



    test('Test Case 00 - Check all elements on page Ordered from suppliers', async ({ page }) => {
        const selector = '[data-testid="Sclad-orderingSuppliers"]';
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await orderedFromSuppliersPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage assemblies page",
            async () => {
                await orderedFromSuppliersPage.findTable(selector);
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step('Step 3: Проверяем  наличие заголовков на странице Заказано у поставщиков', async () => {

            const titles = testData1.elements.MainPage.titles.map((title) => title.trim());
            const h3Titles = await orderedFromSuppliersPage.getAllH3TitlesInClass(page, 'container');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        })

        await allure.step("Step 04: Проверяем наличие кнопок на странице Заказано у поставщиков", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.MainPage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step("Step 05: Проверка свитчера", async () => {
            const switchers = testData1.elements.MainPage.switcher;

            for (const switcher of switchers) {
                // Extract the class, label, and state from the button object
                const buttonClass = switcher.class;
                const buttonLabel = switcher.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        })

        await allure.step(
            "Step 06: Click on the Launch on Production button",
            async () => {
                await orderedFromSuppliersPage.clickButton(" Создать заказ ", ".btn-add");
            }
        );

        await allure.step("Step 07: Проверяем модальное окно на наличие всех кнопок с поставщиками", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalSelectSupplier.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step('Step 08: Выбор поставщика "Детали"', async () => {
            await orderedFromSuppliersPage.selectSupplier(Supplier.details)
        })

        await allure.step('Step 09: Проверка модального окна Создание заказа поставщика', async () => {
            const titles = testData1.elements.ModalCreateOrderSupplier.titles.map((title) => title.trim());
            const target = '[data-testid="ModalStartProduction-ModalCloseLeft"]';
            const h3Titles = await orderedFromSuppliersPage.getAllH3TitlesInModalClass(page, 'content-modal-right-menu');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        })

        await allure.step("Step 10: Проверяем кнопки в модальном окне Создание заказа поставщика", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // await page.waitForTimeout(500);

            const buttons = testData1.elements.ModalCreateOrderSupplier.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    // await page.waitForTimeout(500);
                    const isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
            // await page.waitForTimeout(500);
        });

        await allure.step('Step 11: Кликаем по чекбоксу', async () => {
            // Find the checkbox column and click
            const tableModalCheckbox = "ModalAddOrder-ProductionTable-SelectColumn";
            const tableModalWindowDataTestId =
                "ModalAddOrder-ProductionTable-Table";
            const tableModalWindow =
                '[data-testid="ModalAddOrder-ProductionTable-Table"]';
            const numberColumn = await orderedFromSuppliersPage.findColumn(
                page,
                tableModalWindowDataTestId,
                tableModalCheckbox
            );
            console.log("numberColumn: ", numberColumn);
            await orderedFromSuppliersPage.getValueOrClickFromFirstRow(
                tableModalWindow,
                numberColumn,
                Click.Yes,
                Click.No
            );
        })

        await allure.step("Step 12: Click on the Order button", async () => {
            await orderedFromSuppliersPage.clickButton(
                "Заказать",
                '[data-testid="ModalAddOrder-ProductionTable-OrderButton"]'
            );
        });

        await allure.step("Step 13: Проверка модального окна запустить в производство", async () => {
            const titles = testData1.elements.LaunchOnProdictuion.titles.map((title) => title.trim());

            const target = `[data-testid="ModalStartProduction-ModalContent"]`;
            const h3Titles = await orderedFromSuppliersPage.getAllH3TitlesInModalClassNew(page, target);

            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        })

        await allure.step("Step 14: Проверяем кнопки в модальном окне Создание заказа поставщика", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            const buttons = testData1.elements.LaunchOnProdictuion.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    await page.waitForTimeout(500);
                    const isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
            await page.waitForTimeout(500);
        });
    })

    test('Test Case 00 - Check all elements on page MetalWorkingWarehouse', async ({ page }) => {
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

        await allure.step('Step 3: Проверяем  наличие заголовков на странице Заказано у поставщиков', async () => {

            const titles = testData1.elements.MetalworkingWarhouse.titles.map((title) => title.trim());
            const h3Titles = await metalworkingWarehouse.getAllH3TitlesInClass(page, 'container');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        })

        await allure.step("Step 04: Проверяем наличие кнопок на странице Заказано у поставщиков", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.MetalworkingWarhouse.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await metalworkingWarehouse.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });
    })

    test('Test Case 00 - Check all elements on page Assembly Warehouse', async ({ page }) => {
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

        await allure.step('Step 3: Проверяем  наличие заголовков на странице Заказано у поставщиков', async () => {

            const titles = testData1.elements.AssemblyWarehouse.titles.map((title) => title.trim());
            const h3Titles = await assemblyWarehouse.getAllH3TitlesInClass(page, 'container');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
        })

        await allure.step("Step 04: Проверяем наличие кнопок на странице Заказано у поставщиков", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.AssemblyWarehouse.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await assemblyWarehouse.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy()
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });
    })

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
                await metalworkingWarehouse.checkModalWindowForTransferringToArchive('MetalloworkingSclad-PrintControls-ModalPromptMini');
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
                await assemblyWarehouse.checkModalWindowForTransferringToArchive('AssemblySclad-PrintControls-ModalPromptMini');
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