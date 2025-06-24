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
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";

const arrayDetail = [
    {
        name: '0Т5.21',
        designation: '-'
    }
]
const arrayCbed = [
    {
        name: '0Т5.11',
        designation: '-'
    }
]
const arrayIzd = [
    {
        name: '0Т5.01',
        designation: '-'
    }
]

// Create new part
const buttonCreateNewPart = '[data-testid="BaseDetals-Button-Create"]'
const buttonDetail = '[data-testid="BaseDetals-CreatLink-Cardbase-detail"]'
const buttonCbed = '[data-testid="BaseDetals-CreatLink-Cardbase-of-assembly-units"]'
const buttonProduct = '[data-testid="BaseDetals-CreatLink-Cardthe-base-of-the-tool"]'
const buttonAddOperation = '[data-testid="EditDetal-ModalTechProcess-Buttons-ButtonCreate"]'
const buttonSaveOperation = '[data-testid="EditDetal-ModalTechProcess-Button-Save"]'
const buttonSave = '[data-testid="AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save"]'
const buttonCancel = '[data-testid="EditDetal-ButtonSaveAndCancel-ButtonsCenter-Cancel"]'
const buttonOperation = '[data-testid="EditDetal-Buttons-TechProcess"]'
const buttonOperationProcessAssymbly = '[data-testid="Creator-Buttons-TechProcess"]'
const buttonSaveCbed = '[data-testid="Creator-ButtonSaveAndCancel-ButtonsCenter-Save"]'
const buttonCancelCbed = '[data-testid="Creator-ButtonSaveAndCancel-ButtonsCenter-Cancel"]'
const tableProcessID = '#operation-table'
const tableProcess = '[data-testid="EditDetal-ModalTechProcess-Table-Wrapper"]'
const tableProcessNameOperation = 'EditDetal-ModalTechProcess-Thead-NameOperation'
let nameOprerationOnProcess: string
const tableProcessNameOperationAss = 'Creator-ModalTechProcess-Thead-NameOperation'
const tableProcessAss = '[data-testid="Creator-ModalTechProcess-Table-Wrapper"]'
let nameOprerationOnProcessAssebly: string
const buttonProcessCancel = '[data-testid="Creator-ModalTechProcess-Button-Cancel"]'
let nameOprerationOnProcessIzd: string

// Quantity launched into production
let quantityOrder = "2";
let checkOrderNumber: string;
let quantityLaunchInProduct: string;

const buttonLaunchIntoProduction = '[data-testid="ModalStartProduction-ComplectationTable-CancelButton"]'
const buttonOrder = '[data-testid="ModalAddOrder-ProductionTable-OrderButton"]'
const buttonCreateOrder = ".btn-add"

const selectorOrderedFromSuppliers = '[data-testid="Sclad-orderingSuppliers"]';

const tableModalCheckbox = "ModalAddOrder-ProductionTable-SelectColumn";
const tableModalWindowDataTestId =
    "ModalAddOrder-ProductionTable-Table";
const tableModalWindow =
    '[data-testid="ModalAddOrder-ProductionTable-Table"]';

// MetalWorkingWarhouse
const selectorMetalWorkingWarhouse = '[data-testid="Sclad-stockOrderMetalworking"]';
const tableMetalWorkingWarhouse = '[data-testid="MetalloworkingSclad-DetailsTable"]';
const tableMetalworkingWarehouseID = 'MetalloworkingSclad-DetailsTable'
const tableMetalWorkingOrdered = "MetalloworkingSclad-DetailsTableHeader-OrderedColumn"
const tableMetalWorkingOperation = 'MetalloworkingSclad-DetailsTableHeader-OperationsColumn'
const tableMetalWorkingCheckbox = "MetalloworkingSclad-DetailsTableHeader-SelectColumn"
const buttonMoveToArchive = '[data-testid="MetalloworkingSclad-PrintControls-ArchiveButton"]'
let numberColumnQunatityMade: number;
let firstOperation: string;
let valueLeftToDo
const operationTable = '[data-testid="ModalOperationPathMetaloworking-OperationTable"]';
const operationTableID = "OperationPathInfo-Table";
const operationTableRemainsToDo = 'OperationPathInfo-Thead-RemainsToDo'
const operationTableNameFirstOperation = 'OperationPathInfo-Thead-Operation'

// AssemblyWarhouse
const selectorAsseblyWarhouse = '[data-testid="Sclad-stockOrderAssembly"]';
const tableAssemblyWarhouseID = "#tablebody";
const tableAssemblyWarhouse = '[data-testid="AssemblySclad-Table"]'
const tableAssemblyCheckbox = "AssemblySclad-PrintTableHeader-SelectColumn"
const tableAssemblyOrdered = 'AssemblySclad-PrintTableHeader-OrderedColumn'
const tableAssemblyOperation = 'AssemblySclad-PrintTableHeader-OperationsColumn'
const buttonMoveToArchiveAssembly = '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
const operationTableAssembly = '[data-testid="ModalOperationPath-OperationTable"]'

// Modal Confirmation Window
const buttonConfirmationButton = '[data-testid="ModalPromptMini-Button-Confirm"]'

export const runU002 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test('Test Case 01 - Check all elements on page Ordered from suppliers', async ({ page }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await orderedFromSuppliersPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage assemblies page",
            async () => {
                await orderedFromSuppliersPage.findTable(selectorOrderedFromSuppliers);
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
                await orderedFromSuppliersPage.clickButton(" Создать заказ ", buttonCreateOrder);
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

            const buttons = testData1.elements.ModalCreateOrderSupplier.buttons;
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

        await allure.step('Step 11: Кликаем по чекбоксу', async () => {
            // Find the checkbox column and click
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
                buttonOrder
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

    test('Test Case 02 - Check all elements on page MetalWorkingWarehouse', async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                await metalworkingWarehouse.findTable(selectorMetalWorkingWarhouse);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);
            }
        );

        await allure.step('Step 3: Checking for headings on the Metalworking warehouse page', async () => {
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

        await allure.step("Step 04: Checking for buttons on the Metalworking warehouse page", async () => {
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

    test('Test Case 03 - Check all elements on page Assembly Warehouse', async ({ page }) => {

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
                await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
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

    test("Test Case 04 - Delete Product before create", async ({ page }) => {
        test.setTimeout(90000)
        const partsDatabsePage = new CreatePartsDatabasePage(page);
        const productTable = '[data-testid="BasePaginationTable-Table-product"]'
        const productTableDiv = '[data-testid="BasePaginationTable-Wrapper-product"]'
        const searchProduct = page.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]').first()

        const cbedTable = '[data-testid="BasePaginationTable-Table-cbed"]'
        const cbedTableDiv = '[data-testid="BasePaginationTable-Wrapper-cbed"]'
        const searchCbed = page.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]').nth(1)

        const detailTable = '[data-testid="BasePaginationTable-Table-detal"]'
        const detailTableDiv = '[data-testid="BasePaginationTable-Wrapper-detal"]'
        const searchDetail = page.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]').last()

        const buttonArchive = '[data-testid="BaseDetals-Button-Archive"]'

        await allure.step('Step 01: Open the parts database page', async () => {
            await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        })

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step('Step 02: Search Detail', async () => {
                    await searchDetail.fill(detail.name)
                    await searchDetail.press('Enter')
                    expect(await searchDetail.inputValue()).toBe(detail.name)
                })

                await allure.step('Step 03: Check table rows and process if found', async () => {
                    await page.waitForLoadState('networkidle')
                    await page.waitForTimeout(500)

                    const rows = page.locator(`${detailTableDiv} tbody tr`)
                    const rowCount = await rows.count()

                    if (rowCount === 0) {
                        console.log(`No rows found for detail: ${detail.name}`)
                        return
                    }

                    // Process all rows that match the criteria
                    for (let i = 0; i < rowCount; i++) {
                        const row = rows.nth(0)
                        const nameCell = row.locator('td').nth(1) // Assuming name is in the third column
                        const cellText = await nameCell.textContent()

                        if (cellText?.trim() === detail.name) {
                            await allure.step(`Processing row ${i + 1} for detail: ${detail.name}`, async () => {
                                await partsDatabsePage.getValueOrClickFromFirstRow(detailTable, 0, Click.Yes, Click.No)

                                await allure.step('Click on the Archive button', async () => {
                                    await partsDatabsePage.clickButton('Архив', buttonArchive)
                                })

                                await allure.step('Confirmation of transfer to archive', async () => {
                                    const confirmButton = page.locator('[data-testid="ModalConfirm-Content-Buttons-Button-2"]', { hasText: 'Да' });
                                    await confirmButton.click();
                                    await page.waitForTimeout(1000) // Wait for the row to be removed
                                })
                            })
                        }
                    }
                })
            }
        }

        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step('Step 04: Search Cbed', async () => {
                    await searchCbed.fill(cbed.name)
                    await searchCbed.press('Enter')
                    expect(await searchCbed.inputValue()).toBe(cbed.name)
                })

                await allure.step('Step 05: Check table rows and process if found', async () => {
                    await page.waitForLoadState('networkidle')
                    await page.waitForTimeout(500)

                    const rows = page.locator(`${cbedTableDiv} tbody tr`)
                    const rowCount = await rows.count()

                    if (rowCount === 0) {
                        console.log(`No rows found for cbed: ${cbed.name}`)
                        return
                    }

                    // Process all rows that match the criteria
                    for (let i = 0; i < rowCount; i++) {
                        const row = rows.nth(0)
                        const nameCell = row.locator('td').nth(1) // Assuming name is in the third column
                        const cellText = await nameCell.textContent()

                        if (cellText?.trim() === cbed.name) {
                            await allure.step(`Processing row ${i + 1} for cbed: ${cbed.name}`, async () => {
                                await partsDatabsePage.getValueOrClickFromFirstRow(cbedTable, 0, Click.Yes, Click.No)

                                await allure.step('Click on the Archive button', async () => {
                                    await partsDatabsePage.clickButton('Архив', buttonArchive)
                                })

                                await allure.step('Confirmation of transfer to archive', async () => {
                                    const confirmButton = page.locator('[data-testid="ModalConfirm-Content-Buttons-Button-2"]', { hasText: 'Да' });
                                    await confirmButton.click();
                                    await page.waitForTimeout(1000) // Wait for the row to be removed
                                })
                            })
                        }
                    }
                })
            }
        }

        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step('Step 06: Search Product', async () => {
                    await searchProduct.fill(izd.name)
                    await searchProduct.press('Enter')
                    expect(await searchProduct.inputValue()).toBe(izd.name)
                })

                await allure.step('Step 07: Check table rows and process if found', async () => {
                    await page.waitForLoadState('networkidle')
                    await page.waitForTimeout(500)

                    const rows = page.locator(`${productTableDiv} tbody tr`)
                    const rowCount = await rows.count()

                    if (rowCount === 0) {
                        console.log(`No rows found for product: ${izd.name}`)
                        return
                    }

                    for (let i = 0; i < rowCount; i++) {
                        const row = rows.nth(0)
                        const nameCell = row.locator('td').nth(2) // Assuming name is in the third column
                        const cellText = await nameCell.textContent()

                        if (cellText?.trim() === izd.name) {
                            await allure.step(`Processing row ${i + 1} for product: ${izd.name}`, async () => {
                                await partsDatabsePage.getValueOrClickFromFirstRow(productTable, 0, Click.Yes, Click.No)

                                await allure.step('Click on the Archive button', async () => {
                                    await partsDatabsePage.clickButton('Архив', buttonArchive)
                                })

                                await allure.step('Confirmation of transfer to archive', async () => {
                                    const confirmButton = page.locator('[data-testid="ModalConfirm-Content-Buttons-Button-2"]', { hasText: 'Да' });
                                    await confirmButton.click();
                                    await page.waitForTimeout(1000) // Wait for the row to be removed
                                })
                            })
                        }
                    }
                })
            }
        }
    })

    test("Test Case 05 - Create Parts", async ({ page }) => {
        const partsDatabsePage = new CreatePartsDatabasePage(page);

        await allure.step('Step 01: Open the parts database page', async () => {
            // Go to the Shipping tasks page
            await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        })

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step('Step 02: Click on the Create button', async () => {
                    await partsDatabsePage.clickButton('Создать', buttonCreateNewPart)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Деталь', buttonDetail)
                })

                await allure.step('Step 04: Enter the name of the part', async () => {
                    const nameParts = page.locator('[data-testid="AddDetal-Information-Input-Input"]')

                    await page.waitForTimeout(500)
                    await nameParts.fill(detail.name)
                    await expect(await nameParts.inputValue()).toBe(detail.name)
                })

                await allure.step('Step 05: Enter the designation of the part', async () => {
                    const nameParts = page.locator('[data-testid="AddDetal-Designation-Input-Input"]')

                    await nameParts.fill(detail.designation)
                    expect(await nameParts.inputValue()).toBe(detail.designation)
                })

                await allure.step('Step 06: Click on the Save button', async () => {
                    await partsDatabsePage.clickButton('Сохранить', buttonSave)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', buttonOperation)
                })

                await allure.step('Step 08: Click on the Add Operation', async () => {
                    await page.waitForSelector('[data-testid="Modal-ModalContent"]')
                    await partsDatabsePage.clickButton('Добавить операцию', buttonAddOperation)
                })

                await allure.step('Step 09: Click on the type of operation', async () => {
                    await page.waitForLoadState('networkidle')
                    await page.locator('[data-testid="Filter-Title"]').click()
                })

                await allure.step('Step 10: Search in dropdown menu', async () => {
                    const searchTypeOperation = page.locator('[data-testid="Filter-Search-Dropdown-Input"]')
                    const typeOperation = 'Сварочная'

                    await searchTypeOperation.fill(typeOperation)
                    expect(await searchTypeOperation.inputValue()).toBe(typeOperation)
                })

                await allure.step('Step 11: Choice type operation', async () => {
                    await page.locator('[data-testid="Filter-Options-0"]').click()
                })

                await allure.step('Step 12: Click on the Save button', async () => {
                    await page.locator('[data-testid="Button"]', { hasText: 'Сохранить' }).last().click()
                    await page.waitForLoadState("networkidle");
                })

                await allure.step('Step 13: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, tableProcessID, tableProcessNameOperation)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcess =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            tableProcess,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process: ', nameOprerationOnProcess)
                })

                await allure.step('Step 14: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await page.locator(buttonSaveOperation, { hasText: 'Сохранить' }).click()
                })

                await allure.step('Step 15: Click on the Create by copyinp', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', buttonCancel)
                })
            }
        }
    })

    test('Test Case 06 - Create Cbed', async ({ page }) => {
        const partsDatabsePage = new CreatePartsDatabasePage(page);

        await allure.step('Step 01: Open the parts database page', async () => {
            // Go to the Shipping tasks page
            await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

            // Wait for loading
            await partsDatabsePage.waitingTableBody('[data-testid="BasePaginationTable-Wrapper-cbed"]')
        })

        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step('Step 02: Click on the Create button', async () => {
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000)
                    await partsDatabsePage.clickButton('Создать', buttonCreateNewPart)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Сборочную единицу', buttonCbed)
                })

                await allure.step('Step 04: Enter the name of the part', async () => {
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(500)
                    const nameParts = page.locator('[data-testid="Creator-Information-Input-Input"]')

                    await nameParts.fill(cbed.name)
                    await page.waitForTimeout(500)
                    expect(await nameParts.inputValue()).toBe(cbed.name)
                })

                await allure.step('Step 05: Enter the designation of the part', async () => {
                    const nameParts = page.locator('[data-testid="Creator-Designation-Input-Input"]')

                    await nameParts.fill(cbed.designation)
                    expect(await nameParts.inputValue()).toBe(cbed.designation)
                })

                await allure.step('Step 06: Click on the Save button', async () => {
                    await partsDatabsePage.clickButton('Сохранить', buttonSaveCbed)
                    await page.waitForTimeout(2000)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', buttonOperationProcessAssymbly)
                })

                await allure.step('Step 08: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, tableProcessID, tableProcessNameOperationAss)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcessAssebly =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            tableProcessAss,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process Assembly: ', nameOprerationOnProcessAssebly)
                })

                await allure.step('Step 09: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', buttonProcessCancel)
                })

                await allure.step('Step 10: Click on the Create by copyinp', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Отменить', buttonCancelCbed)
                })
            }
        }
    })

    test('Test Case 07 - Create Product', async ({ page }) => {
        const partsDatabsePage = new CreatePartsDatabasePage(page);

        await allure.step('Step 01: Open the parts database page', async () => {
            // Go to the Shipping tasks page
            await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

            await partsDatabsePage.waitingTableBody('[data-testid="BasePaginationTable-Border-product"]')
        })
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step('Step 02: Click on the Create button', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Создать', buttonCreateNewPart)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Изделие', buttonProduct)
                })

                await allure.step('Step 04: Enter the name of the part', async () => {
                    await page.waitForLoadState("networkidle");
                    const nameParts = page.locator('[data-testid="Creator-Information-Input-Input"]')

                    await page.waitForTimeout(500)
                    await nameParts.fill(izd.name)
                    expect(await nameParts.inputValue()).toBe(izd.name)
                })

                await allure.step('Step 05: Enter the designation of the part', async () => {
                    const nameParts = page.locator('[data-testid="Creator-Designation-Input-Input"]')

                    await nameParts.fill(izd.designation)
                    expect(await nameParts.inputValue()).toBe(izd.designation)
                })
                await allure.step('Step 06: Click on the Save button', async () => {
                    await partsDatabsePage.clickButton('Сохранить', buttonSaveCbed)
                    await page.waitForTimeout(2000)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', buttonOperationProcessAssymbly)
                })

                await allure.step('Step 08: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, tableProcessID, tableProcessNameOperationAss)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcessIzd =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            tableProcessAss,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process Izd: ', nameOprerationOnProcessIzd)
                })

                await allure.step('Step 09: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', buttonProcessCancel)
                })

                await allure.step('Step 10: Click on the Create by copyinp', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Отменить', buttonCancelCbed)
                })
            }
        }
    })

    test("Test Case 08 Detail- Launch Detail Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        detail.name,
                        quantityOrder,
                        Supplier.details
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;

                console.log("Quantity Launched in Product: ", quantityLaunchInProduct);
                console.log("Check Order Number: ", checkOrderNumber);
            }
        }
    });

    test("Test Case 09 Detail - Checking Metalworking Warehouse", async ({
        page,
    }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await metalworkingWarehouse.findTable(selectorMetalWorkingWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await metalworkingWarehouse.searchTable(
                        detail.name,
                        tableMetalWorkingWarhouse
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            tableMetalworkingWarehouseID,
                            tableMetalWorkingOrdered
                        );
                        console.log("numberColumn: ", numberColumn);

                        const numberLaunched =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                tableMetalWorkingWarhouse,
                                numberColumn
                            );

                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            tableMetalWorkingWarhouse
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

                await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                    // Getting cell value by id
                    const numberColumn =
                        await metalworkingWarehouse.findColumn(
                            page,
                            tableMetalworkingWarehouseID,
                            tableMetalWorkingOperation
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await metalworkingWarehouse.clickIconOperationNew(
                        tableMetalWorkingWarhouse,
                        numberColumn,
                        Click.Yes
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(2000)
                })

                await allure.step(
                    "Step 6: We find and get the value from the cell, what remains to be done",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableRemainsToDo
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // Click on the Done cell
                        valueLeftToDo = await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            operationTable,
                            numberColumnQunatityMade
                        );

                        console.log("The value that remains to be made: ", valueLeftToDo);

                        expect(Number(valueLeftToDo)).toBe(
                            Number(quantityOrder) + Number(quantityLaunchInProduct)
                        );
                    }
                );

                await allure.step(
                    "Step 7: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableNameFirstOperation
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                operationTable,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcess)
                    }
                );
            }
        }
    });

    test("Test Case 10 Detail- Launch Detail Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        detail.name,
                        quantityOrder,
                        Supplier.details
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;
            }
        }
    });

    test("Test Case 11 Detail- Checking Metalworking Warehouse", async ({
        page,
    }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                await metalworkingWarehouse.findTable(selectorMetalWorkingWarhouse);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);
            }
        );

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await metalworkingWarehouse.searchTable(
                        detail.name,
                        tableMetalWorkingWarhouse
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            tableMetalworkingWarehouseID,
                            tableMetalWorkingOrdered
                        );
                        console.log("numberColumn: ", numberColumn);

                        const numberLaunched =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                tableMetalWorkingWarhouse,
                                numberColumn
                            );

                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            tableMetalWorkingWarhouse
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

                await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                    // Getting cell value by id
                    const numberColumn =
                        await metalworkingWarehouse.findColumn(
                            page,
                            tableMetalworkingWarehouseID,
                            tableMetalWorkingOperation
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await metalworkingWarehouse.clickIconOperationNew(
                        tableMetalWorkingWarhouse,
                        numberColumn,
                        Click.Yes
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(2000)
                })

                await allure.step(
                    "Step 6: We find and get the value from the cell, what remains to be done",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableRemainsToDo
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            operationTable,
                            numberColumnQunatityMade
                        );

                        console.log("The value that remains to be made: ", valueLeftToDo);

                        expect(Number(valueLeftToDo)).toBe(
                            Number(quantityOrder) + Number(quantityLaunchInProduct)
                        );
                    }
                );

                await allure.step(
                    "Step 7: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableNameFirstOperation
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                operationTable,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcess)
                    }
                );
            }
        }
    });

    test("Test Case 12 Detail - Moving a warehouse task to the archive", async ({
        page,
    }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products

                await metalworkingWarehouse.findTable(selectorMetalWorkingWarhouse);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);
            }
        );

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await metalworkingWarehouse.searchTable(
                        detail.name,
                        tableMetalWorkingWarhouse
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(tableMetalWorkingWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            tableMetalWorkingWarhouse
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            tableMetalworkingWarehouseID,
                            tableMetalWorkingCheckbox
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            tableMetalWorkingWarhouse,
                            numberColumn,
                            Click.Yes
                        );
                    }
                );

                await allure.step(
                    "Step 6: Click the button to move to archive",
                    async () => {
                        await metalworkingWarehouse.clickButton(
                            " Переместить в архив ",
                            buttonMoveToArchive
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
                            buttonConfirmationButton
                        );
                    }
                );
            }
        }
    });

    test("Test Case 13 Detail - Verify no records found after archiving", async ({
        page,
    }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products

                await metalworkingWarehouse.findTable(selectorMetalWorkingWarhouse);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Don't wait for table body as it might be empty after archiving
            }
        );

        if (arrayDetail.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const detail of arrayDetail) {
                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await metalworkingWarehouse.searchTable(
                        detail.name,
                        tableMetalWorkingWarhouse
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(tableMetalWorkingWarhouse, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`${tableMetalWorkingWarhouse} tbody tr`);
                        const rowCount = await rows.count();

                        console.log(`Total rows found in table after search: ${rowCount}`);

                        // If table is empty, that's exactly what we expect after archiving
                        if (rowCount === 0) {
                            console.log("Table is empty - no records found after archiving, which is expected");
                            expect(rowCount).toBe(0);
                            return;
                        }

                        // If table has rows, check that none contain the archived product name
                        let foundRow = false;
                        for (let i = 0; i < rowCount; i++) {
                            const row = rows.nth(i);
                            const nameCell = row.locator('td').nth(1); // Assuming name is in the second column
                            const cellText = await nameCell.textContent();

                            if (cellText?.trim() === detail.name) {
                                foundRow = true;
                                console.log(`Found row with name: ${detail.name} at index ${i}`);
                                break;
                            }
                        }

                        // Assert that no row with the given name was found
                        expect(foundRow).toBeFalsy();
                        console.log(`Row with name "${detail.name}" was successfully archived and is not found in the table`);
                        console.log(`Table contains ${rowCount} other records, but not the archived one`);
                    }
                );
            }
        }
    });

    test("Test Case 14 Cbed - Launch Cbed Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        cbed.name,
                        quantityOrder,
                        Supplier.cbed
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;
            }
        }
    });

    test("Test Case 15 Cbed - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(arrayCbed[0].name, tableAssemblyWarhouse);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOrdered
                        );
                        console.log("numberColumn Ordered: ", numberColumn);


                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                tableAssemblyWarhouse,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            arrayCbed[0].name,
                            tableAssemblyWarhouse
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

                await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                    // Getting cell value by id
                    const numberColumn =
                        await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOperation
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        tableAssemblyWarhouse,
                        numberColumn,
                        Click.Yes
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(2000)
                })

                await allure.step(
                    "Step 6: We find and get the value from the cell, what remains to be done",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableRemainsToDo
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            operationTableAssembly,
                            numberColumnQunatityMade
                        );

                        console.log("The value that remains to be made: ", valueLeftToDo);

                        expect(Number(valueLeftToDo)).toBe(
                            Number(quantityOrder) + Number(quantityLaunchInProduct)
                        );
                    }
                );

                await allure.step(
                    "Step 7: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableNameFirstOperation
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                operationTableAssembly,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcessAssebly)
                    }
                );
            }
        }
    });

    test("Test Case 16 Cbed - Launch Cbed Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        cbed.name,
                        quantityOrder,
                        Supplier.cbed
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;
            }
        }
    });

    test("Test Case 17 Cbed - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(cbed.name, tableAssemblyWarhouse);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOrdered
                        );
                        console.log("numberColumn Ordered: ", numberColumn);

                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                tableAssemblyWarhouse,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            cbed.name,
                            tableAssemblyWarhouse
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

                await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                    // Getting cell value by id
                    const numberColumn =
                        await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOperation
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        tableAssemblyWarhouse,
                        numberColumn,
                        Click.Yes
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(2000)
                })

                await allure.step(
                    "Step 6: We find and get the value from the cell, what remains to be done",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableRemainsToDo
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            operationTableAssembly,
                            numberColumnQunatityMade
                        );

                        console.log("The value that remains to be made: ", valueLeftToDo);

                        expect(Number(valueLeftToDo)).toBe(
                            Number(quantityOrder) + Number(quantityLaunchInProduct)
                        );
                    }
                );

                await allure.step(
                    "Step 7: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableNameFirstOperation
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                operationTableAssembly,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcessAssebly)
                    }
                );
            }
        }
    });

    test("Test Case 18 Cbed - Moving a warehouse task to the archive", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(cbed.name, tableAssemblyWarhouse);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            cbed.name,
                            tableAssemblyWarhouse
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyCheckbox
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await assemblyWarehouse.getValueOrClickFromFirstRow(
                            tableAssemblyWarhouse,
                            numberColumn,
                            Click.Yes
                        );
                    }
                );

                await allure.step(
                    "Step 6: Click the button to move to archive",
                    async () => {
                        await assemblyWarehouse.clickButton(
                            " Переместить в архив ",
                            buttonMoveToArchiveAssembly
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
                            buttonConfirmationButton
                        );
                    }
                );
            }
        }
    });

    test("Test Case 19 Cbed - Verify no records found after archiving", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayCbed.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const cbed of arrayCbed) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the assembly warehouse page",
                    async () => {
                        // Find and go to the page using the locator
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Don't wait for table body as it might be empty after archiving
                    }
                );

                await allure.step("Step 3: Search for the archived CBED product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(
                        cbed.name,
                        tableAssemblyWarhouse
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given CBED name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(tableAssemblyWarhouse, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`${tableAssemblyWarhouse} tbody tr`);
                        const rowCount = await rows.count();

                        console.log(`Total rows found in assembly table after search: ${rowCount}`);

                        // If table is empty, that's exactly what we expect after archiving
                        if (rowCount === 0) {
                            console.log("Assembly table is empty - no records found after archiving, which is expected");
                            expect(rowCount).toBe(0);
                            return;
                        }

                        // If table has rows, check that none contain the archived CBED product name
                        let foundRow = false;
                        for (let i = 0; i < rowCount; i++) {
                            const row = rows.nth(i);
                            const nameCell = row.locator('td').nth(1); // Assuming name is in the second column
                            const cellText = await nameCell.textContent();

                            if (cellText?.trim() === cbed.name) {
                                foundRow = true;
                                console.log(`Found row with CBED name: ${cbed.name} at index ${i}`);
                                break;
                            }
                        }

                        // Assert that no row with the given CBED name was found
                        expect(foundRow).toBeFalsy();
                        console.log(`Row with CBED name "${cbed.name}" was successfully archived and is not found in the table`);
                        console.log(`Assembly table contains ${rowCount} other records, but not the archived CBED`);
                    }
                );
            }
        }
    });

    test("Test Case 20 product - Launch product Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        izd.name,
                        quantityOrder,
                        Supplier.product
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;
            }
        }
    });

    test("Test Case 21 product - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
                    }
                );

                for (const izd of arrayIzd) {
                    await allure.step("Step 3: Search product", async () => {
                        // Using table search we look for the value of the variable
                        await assemblyWarehouse.searchTable(izd.name, tableAssemblyWarhouse);

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    });

                    await allure.step(
                        "Step 4: We check the number of those launched into production",
                        async () => {
                            const numberColumn = await assemblyWarehouse.findColumn(
                                page,
                                tableAssemblyWarhouseID,
                                tableAssemblyOrdered
                            );
                            console.log("numberColumn Ordered: ", numberColumn);


                            const numberLaunched =
                                await assemblyWarehouse.getValueOrClickFromFirstRow(
                                    tableAssemblyWarhouse,
                                    numberColumn
                                );
                            await assemblyWarehouse.checkNameInLineFromFirstRow(
                                izd.name,
                                tableAssemblyWarhouse
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


                    await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                        // Getting cell value by id
                        const numberColumn =
                            await assemblyWarehouse.findColumn(
                                page,
                                tableAssemblyWarhouseID,
                                tableAssemblyOperation
                            );
                        console.log("numberColumn Operation: ", numberColumn);

                        // Click on the icon in the cell
                        await assemblyWarehouse.clickIconOperationNew(
                            tableAssemblyWarhouse,
                            numberColumn,
                            Click.Yes
                        );

                        // Waiting for loading
                        await page.waitForLoadState("networkidle");
                        await page.waitForTimeout(2000)
                    })

                    await allure.step(
                        "Step 6: We find and get the value from the cell, what remains to be done",
                        async () => {
                            // Getting cell value by id
                            numberColumnQunatityMade =
                                await assemblyWarehouse.findColumn(
                                    page,
                                    operationTableID,
                                    operationTableRemainsToDo
                                )
                            console.log(
                                "Column number left to do: ",
                                numberColumnQunatityMade
                            );

                            // UPD
                            // Click on the Done cell
                            valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                                operationTableAssembly,
                                numberColumnQunatityMade
                            );

                            console.log("The value that remains to be made: ", valueLeftToDo);

                            expect(Number(valueLeftToDo)).toBe(
                                Number(quantityOrder) + Number(quantityLaunchInProduct)
                            );
                        }
                    );

                    await allure.step(
                        "Step 7: Find and get the value from the operation cell",
                        async () => {
                            // Getting the value of the first operation
                            const numberColumnFirstOperation =
                                await assemblyWarehouse.findColumn(
                                    page,
                                    operationTableID,
                                    operationTableNameFirstOperation
                                );
                            console.log(
                                "Operation column number: ",
                                numberColumnFirstOperation
                            );

                            firstOperation =
                                await assemblyWarehouse.getValueOrClickFromFirstRow(
                                    operationTableAssembly,
                                    numberColumnFirstOperation
                                );
                            console.log("Name of the first operation: ", firstOperation);

                            expect(firstOperation).toBe(nameOprerationOnProcessAssebly)
                        }
                    );
                }
            }
        }
    });

    test("Test Case 22 product - Launch product Into Production Through Suppliers", async ({
        page,
    }) => {
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(
            page
        );
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                let result =
                    await orderedFromSuppliersPage.launchIntoProductionSupplier(
                        izd.name,
                        quantityOrder,
                        Supplier.product
                    );

                quantityLaunchInProduct = result.quantityLaunchInProduct; // Assign the value to the outer variable
                checkOrderNumber = result.checkOrderNumber;
            }
        }
    });

    test("Test Case 23 product - Checking Assembly Warehouse", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step("Step 1: Open the warehouse page", async () => {
                    // Go to the Warehouse page
                    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                });

                await allure.step(
                    "Step 2: Open the shortage product page",
                    async () => {
                        // Find and go to the page using the locator Shortage of Products
                        await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(izd.name, tableAssemblyWarhouse);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOrdered
                        );
                        console.log("numberColumn Ordered: ", numberColumn);

                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                tableAssemblyWarhouse,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            izd.name,
                            tableAssemblyWarhouse
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

                await allure.step("Step 5: Click on the icon in the Operations cell", async () => {
                    // Getting cell value by id
                    const numberColumn =
                        await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyOperation
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        tableAssemblyWarhouse,
                        numberColumn,
                        Click.Yes
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(2000)
                })

                await allure.step(
                    "Step 6: We find and get the value from the cell, what remains to be done",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableRemainsToDo
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            operationTableAssembly,
                            numberColumnQunatityMade
                        );

                        console.log("The value that remains to be made: ", valueLeftToDo);

                        expect(Number(valueLeftToDo)).toBe(
                            Number(quantityOrder) + Number(quantityLaunchInProduct)
                        );
                    }
                );

                await allure.step(
                    "Step 7: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await assemblyWarehouse.findColumn(
                                page,
                                operationTableID,
                                operationTableNameFirstOperation
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                operationTableAssembly,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcessAssebly)
                    }
                );
            }
        }
    });

    test("Test Case 24 product - Moving a warehouse task to the archive", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);
            }
        );

        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(izd.name, tableAssemblyWarhouse);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(tableAssemblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            izd.name,
                            tableAssemblyWarhouse
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            tableAssemblyWarhouseID,
                            tableAssemblyCheckbox
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await assemblyWarehouse.getValueOrClickFromFirstRow(
                            tableAssemblyWarhouse,
                            numberColumn,
                            Click.Yes
                        );
                    }
                );

                await allure.step(
                    "Step 6: Click the button to move to archive",
                    async () => {
                        await assemblyWarehouse.clickButton(
                            " Переместить в архив ",
                            buttonMoveToArchiveAssembly
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
                            buttonConfirmationButton
                        );
                    }
                );
            }
        }
    });

    test("Test Case 25 product - Verify no records found after archiving", async ({
        page,
    }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            await allure.step("Step 1: Open the warehouse page", async () => {
                // Go to the Warehouse page
                await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            });

            await allure.step(
                "Step 2: Open the assembly warehouse page",
                async () => {
                    // Find and go to the page using the locator
                    await assemblyWarehouse.findTable(selectorAsseblyWarhouse);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");

                    // Don't wait for table body as it might be empty after archiving
                }
            );

            for (const izd of arrayIzd) {
                await allure.step("Step 3: Search for the archived CBED product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(
                        izd.name,
                        tableAssemblyWarhouse
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given CBED name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(tableAssemblyWarhouse, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`${tableAssemblyWarhouse} tbody tr`);
                        const rowCount = await rows.count();

                        console.log(`Total rows found in assembly table after search: ${rowCount}`);

                        // If table is empty, that's exactly what we expect after archiving
                        if (rowCount === 0) {
                            console.log("Assembly table is empty - no records found after archiving, which is expected");
                            expect(rowCount).toBe(0);
                            return;
                        }

                        // If table has rows, check that none contain the archived CBED product name
                        let foundRow = false;
                        for (let i = 0; i < rowCount; i++) {
                            const row = rows.nth(i);
                            const nameCell = row.locator('td').nth(1); // Assuming name is in the second column
                            const cellText = await nameCell.textContent();

                            if (cellText?.trim() === izd.name) {
                                foundRow = true;
                                console.log(`Found row with CBED name: ${izd.name} at index ${i}`);
                                break;
                            }
                        }

                        // Assert that no row with the given CBED name was found
                        expect(foundRow).toBeFalsy();
                        console.log(`Row with CBED name "${izd.name}" was successfully archived and is not found in the table`);
                        console.log(`Assembly table contains ${rowCount} other records, but not the archived CBED`);
                    }
                );
            }
        }
    });
};