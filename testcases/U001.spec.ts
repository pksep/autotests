let incomingQuantity = "1";
let remainingStockBefore: string;
let remainingStockAfter: string;
let quantityProductLaunchOnProduction = "2";
let quantityProductLaunchOnProductionBefore: string;
let quantityProductLaunchOnProductionAfter;
let quantitySumLaunchOnProduction: Number;
let urgencyDateOnTable;
let orderNumber: { orderNumber: string; orderDate: string };// variable declared in test case 2
const urgencyDate = "23.01.2025";
const urgencyDateNewFormat = 'Янв 23, 2025'
const urgencyDateSecond = "21.01.2025";
const urgencyDateSecondNewFormat = "Янв 21, 2025";
const nameProduct = "Император Человечества";
const designationProduct = "0Т3.01";
const designation = '0Т3'
const nameBuyer = 'М10'
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
import { CreateCompleteSetsPage } from "../pages/CompleteSetsPage";
import { CreateShippedOrderOverviewPage } from "../pages/ShippedOrderOverviewPage";
import { CreateRevisionPage } from "../pages/RevisionPage";
import { ISpetificationData, Click, TypeInvoice } from "../lib/Page";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { cli } from "winston/lib/winston/config";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";
import testData1 from '../testdata/U001-PC1.json';
import testData2 from '../testdata/U002-PC1.json';

export const runU001 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test.beforeEach("Test Case 55 - Authorization", async ({ page }) => {
        await allure.step("Step 088: Authentication", async () => {
            // Perform login directly on the provided page fixture
            await performLogin(page, "001", "Перов Д.А.", "54321");
            await page.waitForSelector('[data-testid="LoginForm-Login-Button"]', { state: 'visible' });
            await page.locator('[data-testid="LoginForm-Login-Button"]').click();

            const targetH3 = page.locator('h3:has-text("План по операциям")');
            await expect(targetH3).toBeVisible();
        });
    });

    test.skip("Спецификация", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await allure.step("Step 01: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 02: Click on the Create order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Создать заказ ",
                    '.button-yui-kit'
                );
            }
        );

        await allure.step("Step 03: Click on the Select button", async () => {
            // Click on the button
            await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

            await page.waitForTimeout(1000);
        });

        await allure.step(
            "Step 04: Search product on modal window",
            async () => {
                //
                const modalWindow = await page.locator('.modal-yui-kit__modal-content')
                // Using table search we look for the value of the variable
                await expect(modalWindow).toBeVisible();

                const searchTable = modalWindow
                    .locator('.search-yui-kit__input')
                    .nth(0);
                await searchTable.fill(nameProduct);

                expect(await searchTable.inputValue()).toBe(nameProduct);
                await searchTable.press("Enter");

                await page.waitForTimeout(1000);
            }
        );

        await allure.step(
            "Step 05: Choice product in modal window",
            async () => {
                await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

                await loadingTaskPage.waitForTimeout(1000)
            }
        );

        await allure.step(
            "Step 06: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Добавить ",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );

        await allure.step("Step 07: Checking the selected product", async () => {
            // Check that the selected product displays the expected product
            await loadingTaskPage.checkProduct(nameProduct);
            await loadingTaskPage.waitForTimeout(500)
        });

        await allure.step(
            "Step 08: We save descendants from the specification into an array",
            async () => {
                // Save Assembly units and Parts from the Specification to an array
                await loadingTaskPage.preservingDescendants(
                    descendantsCbedArray,
                    descendantsDetailArray
                );
            }
        );
    });

    test("Test Case 01 - Loading Task", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await allure.step("Step 01: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 02: Checking the main page headings", async () => {
            const titles = testData1.elements.LoadingPage.titles.map((title) => title.trim());
            const h3Titles = await loadingTaskPage.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 03: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.LoadingPage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await loadingTaskPage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step(
            "Step 04: Click on the Create order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Создать заказ ",
                    '.button-yui-kit'
                );
            }
        );

        await allure.step("Step 05: Checking the main page headings", async () => {
            const titles = testData1.elements.CreateOrderPage.titles.map((title) => title.trim());
            const h3Titles = await loadingTaskPage.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 06: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.CreateOrderPage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await loadingTaskPage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });


        await allure.step("Step 07: Click on the Select button", async () => {
            // Click on the button
            await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

            await page.waitForTimeout(1000);
        });

        await allure.step("Step 08: Checking the main page headings", async () => {
            const titles = testData1.elements.ModalWindowChoiceProduct.titles.map((title) => title.trim());
            const h3Titles = await loadingTaskPage.getAllH3TitlesInModalClassNew(page, '.modal-yui-kit__modal-content');
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

        await allure.step("Step 09: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalWindowChoiceProduct.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await loadingTaskPage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step("Step 10: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalWindowChoiceProduct.filters;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await loadingTaskPage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step(
            "Step 11: Search product on modal window",
            async () => {
                const modalWindow = await page.locator('.modal-yui-kit__modal-content')
                // Using table search we look for the value of the variable
                await expect(modalWindow).toBeVisible();

                const searchTable = modalWindow
                    .locator('.search-yui-kit__input')
                    .nth(0);
                await searchTable.fill(nameProduct);

                expect(await searchTable.inputValue()).toBe(nameProduct);
                await searchTable.press("Enter");

                await page.waitForTimeout(1000);
            }
        );

        await allure.step(
            "Step 12: Choice product in modal window",
            async () => {
                await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

                await loadingTaskPage.waitForTimeout(1000)
            }
        );

        await allure.step(
            "Step 13: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Добавить ",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );

        await allure.step("Step 14: Checking the selected product", async () => {
            // Check that the selected product displays the expected product
            await loadingTaskPage.checkProduct(nameProduct);
            await loadingTaskPage.waitForTimeout(500)
        });

        await allure.step("Step 15: Selecting a buyer", async () => {
            const button = page.locator('.button-yui-kit.medium.primary-yui-kit', { hasText: 'Выбрать' }).nth(1);
            await expect(button).toHaveText('Выбрать');
            await expect(button).toBeVisible();

            await button.click()
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step('Step 16: Check modal window Company', async () => {
            // await loadingTaskPage.searchTable(nameBuyer, '.table-yui-kit__border.table-yui-kit-with-scroll')

            const modalWindow = await page.locator('.modal-yui-kit__modal-content')
            // Using table search we look for the value of the variable
            await expect(modalWindow).toBeVisible();

            const searchTable = modalWindow
                .locator('.search-yui-kit__input')
                .nth(0);
            await searchTable.fill(nameBuyer);

            expect(await searchTable.inputValue()).toBe(nameBuyer);
            await searchTable.press("Enter");

            await page.waitForTimeout(500)

            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0)
        })

        await allure.step(
            "Step 17: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Добавить ",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );


        await allure.step(
            "Step 18: We change the quantity of the ordered product",
            async () => {
                const locator = '.input-yui-kit.initial.medium.add-order-component__input.initial';
                await loadingTaskPage.checkOrderQuantity(locator, "1", quantityProductLaunchOnProduction);

                await loadingTaskPage.waitForTimeout(1000)
            }
        );

        await allure.step(
            "Step 19: We set the date according to urgency",
            async () => {
                await page.locator('.date-picker-yui-kit__header-btn').nth(2).click()
                await page.locator('.vc-popover-content-wrapper.is-interactive').nth(2).isVisible()

                await page.locator('.vc-title-wrapper').click()
                // Находим элемент с годом
                const yearElement = await page.locator('.vc-nav-title.vc-focus');
                const currentYear = await yearElement.textContent();
                if (!currentYear) throw new Error('Year element not found');

                const targetYear = 2025;
                const currentYearNum = parseInt(currentYear);
                console.log(`Current year: ${currentYear}, Target year: ${targetYear}`);

                // Если текущий год не равен целевому
                if (currentYearNum !== targetYear) {
                    // Определяем, нужно ли увеличивать или уменьшать год
                    const isYearLess = currentYearNum < targetYear;
                    const arrowSelector = isYearLess
                        ? '.vc-nav-arrow.is-right.vc-focus'
                        : '.vc-nav-arrow.is-left.vc-focus';

                    // Кликаем на стрелку, пока не достигнем нужного года
                    while (currentYearNum !== targetYear) {
                        await page.locator(arrowSelector).click();
                        await page.waitForTimeout(500); // Небольшая задержка для обновления

                        const newYear = await yearElement.textContent();
                        if (!newYear) throw new Error('Year element not found');
                        const newYearNum = parseInt(newYear);

                        if (newYearNum === targetYear) {
                            console.log(`Year successfully set to ${targetYear}`);
                            break;
                        }
                    }
                } else {
                    console.log(`Year is already set to ${targetYear}`);
                }

                // Проверяем, что год установлен правильно
                const finalYear = await yearElement.textContent();
                if (!finalYear) throw new Error('Year element not found');
                expect(parseInt(finalYear)).toBe(targetYear);

                await page.locator('[aria-label="январь"]').click()
                await page.locator('.vc-day-content.vc-focusable.vc-focus.vc-attr', { hasText: '23' }).nth(0).click()
            }
        );

        await allure.step(
            "Step 20: We save descendants from the specification into an array",
            async () => {
                // Save Assembly units and Parts from the Specification to an array
                await loadingTaskPage.preservingDescendants(
                    descendantsCbedArray,
                    descendantsDetailArray
                );
            }
        );

        await allure.step(
            "Step 21: Click on the save order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    "Сохранить",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );

        await allure.step(
            "Step 22: Checking the ordered quantity",
            async () => {
                await page.waitForTimeout(3000)
                orderNumber = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component')
                console.log("orderNumber: ", orderNumber)

            }
        );

    });

    test("Test Case 02 - Checking the urgency date and quantity in a shipment task", async ({
        page,
    }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);
        const loadingTaskTable = '.shipments-content';

        await allure.step("Step 01: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 02: Search product", async () => {
            // Using table search we look for the value of the variable
            const searchTable = page
                .locator('.search-yui-kit__input')
                .nth(1);
            await searchTable.fill(nameProduct);

            expect(await searchTable.inputValue()).toBe(nameProduct);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);

            // Waiting for the table body
            await loadingTaskPage.waitingTableBody(loadingTaskTable);
        });

        await allure.step(
            "Step 03: Checking the quantity in a task",
            async () => {
                // UPD:
                // const numberColumn = await loadingTaskPage.findColumn(
                //     page,
                //     "ShipmentsTable-Table",
                //     "ShipmentsTable-TableHead-Quantity"
                // );
                // console.log("numberColumn: ", numberColumn);

                const quantityOnTable =
                    await loadingTaskPage.getValueOrClickFromFirstRow(
                        loadingTaskTable,
                        5
                    );
                console.log(
                    "Количество заказанных сущностей в заказе: ",
                    quantityOnTable
                );
            }
        );

        await allure.step(
            "Step 04: Checking the urgency date of an order",
            async () => {
                urgencyDateOnTable = await page
                    .locator('tbody .date-picker-yui-kit__header-btn span')
                    .first()
                    .textContent()

                console.log(
                    "Дата по срочности в таблице: ",
                    urgencyDateOnTable
                );

                expect(urgencyDateOnTable).toBe(urgencyDateNewFormat);
            }
        );
    });

    test("Test Case 03 - Launch Into Production Product", async ({
        page,
    }) => {
        const shortageProduct = new CreateShortageProductPage(page);
        const deficitTable = '[data-testid="DeficitIzd-ScrollTable"]';
        let checkOrderNumber: string;
        const tableMain = "DeficitIzd-ScrollTable";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage product page",
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

        await allure.step("Step 03: Checking the main page headings", async () => {
            const titles = testData1.elements.ProductShortage.titles.map((title) => title.trim());
            const h3Titles = await shortageProduct.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ProductShortage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await shortageProduct.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step("Step 05: Search product", async () => {
            // Using table search we look for the value of the variable
            await shortageProduct.searchTable(nameProduct, deficitTable);

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTable);
        });

        await allure.step(
            "Step 06: Check the checkbox in the first column",
            async () => {
                // Find the variable name in the first line and check the checkbox
                const tableMain = "DeficitIzd-ScrollTable-Table";
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableSubHeader-Check"
                );
                console.log("Column number with checkbox: ", numberColumn);

                await shortageProduct.getValueOrClickFromFirstRow(
                    deficitTable,
                    numberColumn, Click.Yes
                );

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTable);
            }
        );

        await allure.step(
            "Step 07: Checking the urgency date of an order",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableSubHeader-DateByUrgency"
                );
                console.log("numberColumn: ", numberColumn);

                urgencyDateOnTable =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "Date by urgency in the table: ",
                    urgencyDateOnTable
                );

                expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            }
        );

        await allure.step(
            "Step 08: We check the number of those launched into production",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableHeader-OrderedInProduction"
                );

                quantityProductLaunchOnProductionBefore =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "The value in the cells is put into production befor:",
                    quantityProductLaunchOnProductionBefore
                );
            }
        );

        await allure.step(
            "Step 09: Click on the Launch on production button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " Запустить в производство ",
                    '[data-testid="DeficitIzd-StartButton"]'
                );
            }
        );

        await allure.step(
            "Step 10: Testing a modal window for production launch",
            async () => {
                // Check the modal window Launch into production
                await shortageProduct.checkModalWindowLaunchIntoProduction();

                // Check the date in the Launch into production modal window
                await shortageProduct.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );
            }
        );

        await allure.step("Step 11: Checking the main page headings", async () => {
            const titles = testData1.elements.ModalWindowLaunchOnProduction.titles.map((title) => title.trim());
            const h3Titles = await shortageProduct.getAllH3TitlesInModalClass(page, 'content-modal-right-menu');
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

        await allure.step("Step 12: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalWindowLaunchOnProduction.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await shortageProduct.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step("Step 13: Enter a value into a cell", async () => {
            // Check the value in the Own quantity field and enter the value
            const locator = '[data-testid="ModalStartProduction-ModalContent"]';
            await shortageProduct.checkOrderQuantity(
                locator,
                "2",
                quantityProductLaunchOnProduction
            );
        });

        await allure.step("Step 14: We save the order number", async () => {
            // Get the order number
            checkOrderNumber = await shortageProduct.checkOrderNumber();
            console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
            "Step 15: Click on the In launch button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " В производство ",
                    ".btn-status"
                );
            }
        );

        await allure.step(
            "Step 16: We check that the order number is displayed in the notification",
            async () => {
                // Check the order number in the success notification
                await shortageProduct.getMessage(checkOrderNumber);
            }
        );

        await allure.step(
            "Step 17: We check the number of those launched into production",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableHeader-OrderedInProduction"
                );

                quantityProductLaunchOnProductionAfter =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "The value in the cells is put into production after:",
                    quantityProductLaunchOnProductionAfter
                );

                expect(
                    Number(quantityProductLaunchOnProductionAfter)
                ).toBe(
                    Number(quantityProductLaunchOnProductionBefore) +
                    Number(quantityProductLaunchOnProduction)
                );
            }
        );
    });

    test("Test Case 04 - Launch Into Production Cbed", async ({
        page,
    }) => {
        const shortageAssemblies = new CreatShortageAssembliesPage(page);
        const deficitTable = '[data-testid="DeficitCbed-ScrollTable"]';
        const tableMain = "DeficitCbed-Table";
        let checkOrderNumber: string;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage assemblies page",
            async () => {
                // Find and go to the page using the locator shortage assemblies
                const selector =
                    '[data-testid="Sclad-deficitCbed-deficitCbed"]';
                await shortageAssemblies.findTable(selector);
                // Wait for the page to stabilize
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step("Step 03: Checking the main page headings", async () => {
            const titles = testData1.elements.CbedShortage.titles.map((title) => title.trim());
            const h3Titles = await shortageAssemblies.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.CbedShortage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await shortageAssemblies.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 05: Search product", async () => {
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
                    "Step 06: Check the checkbox in the first column",
                    async () => {
                        // Find the variable name in the first line and check the checkbox
                        const tableMain = "DeficitCbed-Table";
                        const numberColumn = await shortageAssemblies.findColumn(
                            page,
                            tableMain,
                            "DeficitCbed-TableHeader-SelectAll"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageAssemblies.getValueOrClickFromFirstRow(
                            deficitTable,
                            numberColumn, Click.Yes
                        );

                        // Wait for the table body to load
                        await shortageAssemblies.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 07: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-UrgencyDate"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 08: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-Ordered"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );

                        quantityProductLaunchOnProductionBefore =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production befor:",
                            quantityProductLaunchOnProductionBefore
                        );
                    }
                );

                await allure.step(
                    "Step 09: Click on the Launch on production button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitCbed-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 10: Testing a modal window for production launch",
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
                    "Step 11: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        const locator =
                            '[data-testid="ModalStartProduction-ModalContent"]';
                        await shortageAssemblies.checkOrderQuantity(
                            locator,
                            "2",
                            quantityProductLaunchOnProduction
                        );
                    }
                );

                await allure.step(
                    "Step 12: We save the order number",
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
                    "Step 13: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 14: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageAssemblies.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 15: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageAssemblies.closeSuccessMessage();
                    }
                );

                await allure.step(
                    "Step 16: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-Ordered"
                            );

                        quantityProductLaunchOnProductionAfter =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production after:",
                            quantityProductLaunchOnProductionAfter
                        );

                        expect(
                            Number(quantityProductLaunchOnProductionAfter)
                        ).toBe(
                            Number(quantityProductLaunchOnProductionBefore) +
                            Number(quantityProductLaunchOnProduction)
                        );
                    }
                );
            }
        }
    });

    test("Test Case 05 - Launch Into Production Parts", async ({
        page,
    }) => {
        const shortageParts = new CreatShortagePartsPage(page);
        const deficitTable = '[data-testid="DeficitDetal-ScrollTable"]';
        const tableMain = "DeficitDetal-Table";
        let checkOrderNumber: string;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 02: Open the shortage parts page", async () => {
            // Find and go to the page using the locator Parts Shortage
            const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
            await shortageParts.findTable(selector);
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 03: Checking the main page headings", async () => {
            const titles = testData1.elements.PartsShortage.titles.map((title) => title.trim());
            const h3Titles = await shortageParts.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");


            const buttons = testData1.elements.PartsShortage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await shortageParts.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 05: Search product", async () => {
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
                    "Step 06: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        const numberColumn = await shortageParts.findColumn(
                            page,
                            tableMain,
                            "DeficitDetal-TableHeader-Icon"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageParts.getValueOrClickFromFirstRowBug(
                            deficitTable,
                            numberColumn, Click.Yes
                        );


                        // Wait for the table body to load
                        await shortageParts.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 07: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-TableHeader-DatesByUrgency"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 08: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-Table-OrderInProduction"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );

                        quantityProductLaunchOnProductionBefore =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production befor:",
                            quantityProductLaunchOnProductionBefore
                        );
                    }
                );

                await allure.step(
                    "Step 09: Click on the Launch on production button ",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitDetal-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 10: Testing a modal window for production launch",
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
                    "Step 11: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        const locator =
                            '[data-testid="ModalStartProduction-ModalContent"]';
                        await shortageParts.checkOrderQuantity(
                            locator,
                            "2",
                            quantityProductLaunchOnProduction
                        );
                    }
                );

                await allure.step(
                    "Step 12: We save the order number",
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
                    "Step 13: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 14: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageParts.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 15: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageParts.closeSuccessMessage();
                    }
                );

                await allure.step(
                    "Step 16: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-Table-OrderInProduction"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );

                        quantityProductLaunchOnProductionAfter =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production after:",
                            quantityProductLaunchOnProductionAfter
                        );

                        quantitySumLaunchOnProduction = Number(quantityProductLaunchOnProductionBefore) +
                            Number(quantityProductLaunchOnProduction)

                        expect(
                            Number(quantityProductLaunchOnProductionAfter)
                        ).toBe(
                            Number(quantityProductLaunchOnProductionBefore) +
                            Number(quantityProductLaunchOnProduction)
                        );
                    }
                );
            }
        }
    });

    test("Test Case 06 - Marking Parts", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
        const tableMetalworkingWarehouse =
            '[data-testid="MetalloworkingSclad-ScrollTable"]';
        const productionTable = '[data-testid="ModalOperationPathMetaloworking-OperationTable"]';
        let numberColumnQunatityMade: number;
        let firstOperation: string;
        const operationTable = "OperationPathInfo-Table";
        const tableMain = "#tablebody";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the metalworking warehouse page",
            async () => {
                // Find and go to the page using the locator Order a warehouse for Metalworking
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);
                // Wait for the page to stabilize
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step('Step 03: Checking the main page headings', async () => {

            const titles = testData2.elements.MetalworkingWarhouse.titles.map((title) => title.trim());
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData2.elements.MetalworkingWarhouse.buttons;
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

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 05: Search product", async () => {
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
                    "Step 06: Check the checkbox in the first column",
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
                    "Step 07: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
                                "MetalloworkingSclad-DetailsTableHeader-UrgencyDateColumn"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await metalworkingWarehouse.getValueOrClickFromFirstRowNoThead(
                                tableMetalworkingWarehouse,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 08: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
                                "MetalloworkingSclad-DetailsTableHeader-OrderedColumn"
                            );
                        console.log("Column number orders: ", numberColumn);

                        quantityProductLaunchOnProductionBefore =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                tableMetalworkingWarehouse,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is orders befor:",
                            quantityProductLaunchOnProductionBefore
                        );

                        expect.soft(
                            Number(quantityProductLaunchOnProductionBefore)
                        ).toBe(quantitySumLaunchOnProduction);
                    }
                );

                await allure.step(
                    "Step 09: Find and click on the operation icon",
                    async () => {
                        // Getting cell value by id
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
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

                await allure.step('Step 10: Checking the modalwindow headings', async () => {
                    await page.waitForTimeout(500)
                    const titles = testData1.elements.ModalWindowPartsProductionPath.titles.map((title) => title.trim());
                    const h3Titles = await metalworkingWarehouse.getAllH3TitlesInModalClass(page, 'modal-yui-kit__modal-content');
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

                await allure.step("Step 11: Checking the buttons on the modalwindow", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowPartsProductionPath.buttons;
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

                await allure.step(
                    "Step 11: Check the production path modal window ",
                    async () => {
                        // Check the production path modal window
                        await page.waitForTimeout(500)
                        await metalworkingWarehouse.productionPathDetailskModalWindow();
                    }
                );

                await allure.step(
                    "Step 12: We find, get the value and click on the cell done pcs",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTable,
                                "OperationPathInfo-Thead-Maked"
                            );
                        console.log(
                            "Column number pieces made: ",
                            numberColumnQunatityMade
                        );

                        // Click on the Done cell
                        await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            productionTable,
                            numberColumnQunatityMade,
                            Click.Yes
                        );
                    }
                );

                await allure.step(
                    "Step 13: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTable,
                                "OperationPathInfo-Thead-Operation"
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnQunatityMade
                        );

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
                    "Step 14: Click on the add mark button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Добавить Отметку для выбранной операции ",
                            '[data-testid="ModalOperationPathMetaloworking-Button-AddMark"]'
                        );

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step('Step 15: Checking the modalwindow headings', async () => {
                    const titles = testData1.elements.ModalWindowMarkOfCompletion.titles.map((title) => title.trim());
                    const h3Titles = await metalworkingWarehouse.getAllH3TitlesInModalClassNew(page, '[data-testid^="OperationPathInfo-ModalMark-Create"]');
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

                await allure.step("Step 16: Checking the buttons on the modalwindow", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowMarkOfCompletion.buttons;
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

                await allure.step(
                    "Step 17: Checking the modal window and marking completion",
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
                    "Step 18: Click on the Save order button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Сохранить Отметку ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 19: Closing a modal window by clicking on the logo",
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

    test("Test Case 07 - Complete Set Of Cbed", async ({ page }) => {
        const completingAssembliesToPlan =
            new CreateCompletingAssembliesToPlanPage(page);
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-Table"]';
        const tableMain = 'TableComplect-TableComplect-Table'

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingAssembliesToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the completion cbed plan page",
            async () => {
                // Find and go to the page using the locator Completing assemblies to plan
                const selector = '[data-testid="Sclad-completionCbedPlan"]';
                await completingAssembliesToPlan.findTable(selector);
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step('Step 03: Checking the main page headings', async () => {

            const titles = testData1.elements.AssemblyKittingOnThePlan.titles.map((title) => title.trim());
            const h3Titles = await completingAssembliesToPlan.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.AssemblyKittingOnThePlan.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled
                    const isButtonReady = await completingAssembliesToPlan.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 05: Search product", async () => {
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
                    "Step 06: Check the first line in the first row",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await completingAssembliesToPlan.checkNameInLineFromFirstRow(
                            cbed.designation,
                            TableComplect
                        );
                    }
                );

                await allure.step(
                    "Step 07: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await completingAssembliesToPlan.findColumn(
                                page,
                                tableMain,
                                "TableComplect-TableComplect-UrgencyDateColumn"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await completingAssembliesToPlan.getValueOrClickFromFirstRowNoThead(
                                TableComplect,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );
                        console.log(
                            "Дата по срочности в переменной: ",
                            urgencyDate
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 08: Find the column designation and click",
                    async () => {
                        // Find the column designation and click
                        const numberColumn =
                            await completingAssembliesToPlan.findColumn(
                                page,
                                tableMain,
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

                // await allure.step('Step 09: Проверяем  наличие заголовков на странице Заказано у поставщиков', async () => {
                //     await page.waitForTimeout(1500)
                //     const titles = testData1.elements.ModalWindowAssemblyInvoice.titles.map((title) => title.trim());
                //     const h3Titles = await completingAssembliesToPlan.getAllH3TitlesInModalClassNew(page, '[data-testid="ModalAddWaybill-WaybillDetails-Right"]');
                //     const normalizedH3Titles = h3Titles.map((title) => title.trim());

                //     // Wait for the page to stabilize
                //     await page.waitForLoadState("networkidle");

                //     // Log for debugging
                //     console.log('Expected Titles:', titles);
                //     console.log('Received Titles:', normalizedH3Titles);

                //     // Validate length
                //     expect(normalizedH3Titles.length).toBe(titles.length);

                //     // Validate content and order
                //     expect(normalizedH3Titles).toEqual(titles);
                // })

                await allure.step("Step 10: Проверяем наличие кнопок на странице Заказано у поставщиков", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowAssemblyInvoice.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled
                            const isButtonReady = await completingAssembliesToPlan.isButtonVisible(page, buttonClass, buttonLabel);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step(
                    "Step 11: Check the modal window for the delivery note and check the checkbox",
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
                    "Step 12: Click on the button to assemble into a set",
                    async () => {
                        // Click on the button
                        await completingAssembliesToPlan.clickButton(
                            " Скомплектовать в набор ",
                            '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 13: Check close modal window complete set",
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

    test("Test Case 08 - Disassembly of the set", async ({ page }) => {
        const completeSets = new CreateCompleteSetsPage(page);
        const completeSetsTable = '[data-testid="ComplectKit-TableScroll"]';
        const disassembly = '[data-testid^="ModalUncomplectKit-AssemblyBlock"]';
        let qunatityCompleteSet: string;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completeSets.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector = '[data-testid="Sclad-completeSets"]';
                await completeSets.findTable(selector);

                // Wait for the table body to load
                // await completeSets.waitingTableBody(completeSetsTable);

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step('Step 03: Checking the main page headings', async () => {

            const titles = testData1.elements.DisassemblyPage.titles.map((title) => title.trim());
            const h3Titles = await completeSets.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.DisassemblyPage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await completeSets.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой. Перебор невозможен.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 05: Search product", async () => {
                    await completeSets.waitForTimeout(1000);
                    // Using table search we look for the value of the variable
                    await completeSets.searchTable(
                        cbed.name,
                        completeSetsTable
                    );

                    // Wait for the table body to load
                    // await completeSets.waitingTableBody(completeSetsTable);
                    await completeSets.waitForTimeout(1500);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 06: We check the number of those launched into production",
                    async () => {
                        const tableTestId = "ComplectKit-Table-Main";
                        const numberColumn = await completeSets.findColumn(
                            page,
                            tableTestId,
                            "ComplectKit-TableHeader-Assembled"
                        );
                        console.log("numberColumn: ", numberColumn);

                        qunatityCompleteSet =
                            await completeSets.getValueOrClickFromFirstRow(
                                completeSetsTable,
                                numberColumn
                            );
                        console.log(
                            "Количество собранных наборов: ",
                            qunatityCompleteSet
                        );
                        await completeSets.checkNameInLineFromFirstRow(
                            cbed.name,
                            completeSetsTable
                        );
                    }
                );

                await allure.step(
                    "Step 07: Look for the column with the checkbox and click on it",
                    async () => {
                        const tableTestId = "ComplectKit-Table-Main";
                        const numberColumn = await completeSets.findColumn(
                            page,
                            tableTestId,
                            "ComplectKit-TableHeader-Check"
                        );
                        console.log("numberColumn Check: ", numberColumn);

                        await completeSets.getValueOrClickFromFirstRow(
                            completeSetsTable,
                            numberColumn,
                            Click.Yes,
                            Click.No
                        );
                    }
                );


                await allure.step(
                    "Step 08: Click on the Submit for assembly button",
                    async () => {
                        await completeSets.clickButton(
                            " Разкомплектовать ",
                            '[data-testid="ComplectKit-Button-Unassemble"]'
                        );
                        // Wait for the page to stabilize
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step('Step 09: Checking the modalwindow headings', async () => {

                    const titles = testData1.elements.ModalWindowResetInSets.titles.map((title) => title.trim());
                    const h3Titles = await completeSets.getAllH3TitlesInModalClassNew(page, '[data-testid="ModalUncomplectKit-RightContent"]');
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

                await allure.step("Step 10: Checking buttons on the modalwindow", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowResetInSets.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled

                            const isButtonReady = await completeSets.isButtonVisible(page, buttonClass, buttonLabel);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step("Step 11: Check modal window ", async () => {
                    await completeSets.disassemblyModalWindow(
                        cbed.name,
                        cbed.designation
                    );

                    // const numberColumn = await completeSets.findColumn(
                    //     page,
                    //     "ModalUncomplectKit-AssemblyTable",
                    //     "ModalUncomplectKit-AssemblyTableHeaderKitQuantity"
                    // );
                    // console.log(
                    //     "numberColumn: AssemblyTableHeaderKitQuantity",
                    //     numberColumn
                    // );

                    // Upd:
                    const qunatityCompleteSetInModalWindow =
                        await completeSets.getValueOrClickFromFirstRow(
                            disassembly,
                            1
                        );
                    console.log(
                        "Количество собранных наборов: ",
                        qunatityCompleteSet
                    );
                    console.log(
                        "Количество собранных наборов в модальном окне: ",
                        qunatityCompleteSetInModalWindow
                    );
                    expect(qunatityCompleteSet).toBe(
                        qunatityCompleteSetInModalWindow
                    );
                });

                await allure.step(
                    "Step 12: Enter quantity for disassembly",
                    async () => {
                        const locator = '[data-testid^="ModalUncomplectKit-AssemblyTableKitInput"] input'
                        const toDisassemble
                            = await page.locator(locator).getAttribute('value');
                        console.log("К разкомплектовке: ", toDisassemble)
                        await page.locator(locator).fill('1')
                    }
                );

                await allure.step(
                    "Step 13: Click on the Disassembly button",
                    async () => {
                        await page.locator('.btn-add', { hasText: " Разкомплектовать " }).click()
                    }
                );
            }
        }
    });

    test("Test Case 09 - Complete Set Of Cbed After Desassembly", async ({
        page,
    }) => {
        const completingAssembliesToPlan =
            new CreateCompletingAssembliesToPlanPage(page);
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-Table"]';
        const tableMain = 'TableComplect-TableComplect-Table'

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingAssembliesToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the completion cbed plan page",
            async () => {
                // Find and go to the page using the locator Completing assemblies to plan
                const selector = '[data-testid="Sclad-completionCbedPlan"]';
                await completingAssembliesToPlan.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 03: Search product", async () => {
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
                    "Step 04: Check the first line in the first row",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await completingAssembliesToPlan.checkNameInLineFromFirstRow(
                            cbed.designation,
                            TableComplect
                        );
                    }
                );

                await allure.step(
                    "Step 05: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await completingAssembliesToPlan.findColumn(
                                page,
                                tableMain,
                                "TableComplect-TableComplect-UrgencyDateColumn"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await completingAssembliesToPlan.getValueOrClickFromFirstRowNoThead(
                                TableComplect,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );
                        console.log(
                            "Дата по срочности в переменной: ",
                            urgencyDate
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 06: Find the column designation and click",
                    async () => {
                        // Find the column designation and click
                        const numberColumn =
                            await completingAssembliesToPlan.findColumn(
                                page,
                                tableMain,
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
                    "Step 07: Check the modal window for the delivery note and check the checkbox",
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
                    "Step 08: Click on the button to assemble into a set",
                    async () => {
                        // Click on the button
                        await completingAssembliesToPlan.clickButton(
                            " Скомплектовать в набор ",
                            '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 09: Check close modal window complete set",
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

    test("Test Case 10 - Receiving Part And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const detail of descendantsDetailArray) {
                //  Check the number of parts in the warehouse before posting
                await allure.step(
                    "Step 01: Receiving quantities from balances",
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
                    "Step 02: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 03: Open the stock receipt page",
                    async () => {
                        // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
                        const selectorstockReceipt =
                            '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
                        await stockReceipt.findTable(selectorstockReceipt);
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step("Step 04: Checking the main page headings", async () => {
                    const titles = testData1.elements.ArrivalAtTheWarehousePage.titles.map((title) => title.trim());
                    const h3Titles = await stockReceipt.getAllH3TitlesInClass(page, 'container');
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

                await allure.step("Step 05: Checking the main buttons on the page", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ArrivalAtTheWarehousePage.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;
                        const expectedState = button.state === "true" ? true : false;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled

                            const isButtonReady = await stockReceipt.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step(
                    "Step 06: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step("Step 07: Checking buttons on the modalwindow", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowSelectSupplier.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;
                        const expectedState = button.state === "true" ? true : false;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled

                            const isButtonReady = await stockReceipt.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step(
                    "Step 08: Select the selector in the modal window",
                    async () => {
                        // Select the selector in the modal window
                        await stockReceipt.selectStockReceipt(
                            StockReceipt.metalworking
                        );
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await stockReceipt.waitingTableBodyNoThead(
                            tableStockRecieptModalWindow
                        );
                    }
                );

                await allure.step("Step 09: Checking buttons on the modalwindow", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowCreateReceiptParts.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;
                        const expectedState = button.state === "true" ? true : false;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled

                            const isButtonReady = await stockReceipt.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step("Step 10: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await stockReceipt.searchTable(
                        detail.designation,
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
                    "Step 11: Enter the quantity in the cells",
                    async () => {
                        // Enter the quantity in the cells
                        await stockReceipt.inputQuantityInCell(
                            incomingQuantity
                        );
                    }
                );

                await allure.step(
                    "Step 12: Find the checkbox column and click",
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
                    "Step 13: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await stockReceipt.checkNameInLineFromFirstRow(
                            detail.designation,
                            '[data-testid="ModalComing-SelectedItems-TableScroll"]'
                        );
                    }
                );


                await allure.step(
                    "Step 14: Click on the create receipt button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать приход ",
                            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 15: Check the number of parts in the warehouse after posting",
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
                    "Step 16: Compare the quantity in cells",
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

    test("Test Case 11 - Receiving Cbed And Check Stock", async ({
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
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step(
                    "Step 01: Receiving quantities from balances",
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
                    "Step 02: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 03: Open the stock receipt page",
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
                    "Step 04: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step(
                    "Step 05: Select the selector in the modal window",
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

                await allure.step("Step 06: Search product", async () => {
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
                    "Step 07: Find the checkbox column and click",
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

                await allure.step("Step 08: Checking the main page headings", async () => {
                    const titles = testData1.elements.ModalWindowCompletSets.titles.map((title) => title.trim());
                    const h3Titles = await stockReceipt.getAllH3TitlesInModalClassNew(page, '[data-testid="ModalKitsList-RightContent"]');
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

                await allure.step("Step 09: Checking the main buttons on the page", async () => {
                    // Wait for the page to stabilize
                    await page.waitForLoadState("networkidle");

                    const buttons = testData1.elements.ModalWindowCompletSets.buttons;
                    // Iterate over each button in the array
                    for (const button of buttons) {
                        // Extract the class, label, and state from the button object
                        const buttonClass = button.class;
                        const buttonLabel = button.label;
                        const expectedState = button.state === "true" ? true : false;

                        // Perform the validation for the button
                        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                            // Check if the button is visible and enabled

                            const isButtonReady = await stockReceipt.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                            // Validate the button's visibility and state
                            expect(isButtonReady).toBeTruthy();
                            console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                        });
                    }
                });

                await allure.step(
                    "Step 10: Check the modal window Completed sets",
                    async () => {
                        // Check the modal window Completed sets
                        await stockReceipt.completesSetsModalWindow();
                        await stockReceipt.waitingTableBody('[data-testid="ModalKitsList-HiddenContent"]');
                    }
                );

                await allure.step(
                    "Step 11: We get the cell number with a checkmark",
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
                    "Step 12: Enter the quantity in the cells",
                    async () => {
                        // Enter the value into the input cell

                        const inputlocator =
                            '[data-testid^="ModalKitsList-TableRow-QuantityInputField"]';

                        await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

                        // Проверяем, что элемент не заблокирован
                        const isDisabled = await page.locator(inputlocator).nth(0).getAttribute('disabled');
                        if (isDisabled) {
                            throw new Error("Элемент заблокирован для ввода.");
                        }
                        const quantityPerShipment
                            = await page.locator(inputlocator).nth(0).getAttribute('value');
                        console.log("Кол-во на отгрузку: ", quantityPerShipment)
                        await page.locator(inputlocator).nth(0).fill('1')
                        await page.locator(inputlocator).nth(0).press('Enter')
                    }
                );

                await allure.step(
                    "Step 13: Click on the choice button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Выбрать ",
                            '[data-testid="ModalKitsList-SelectButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 14: Check that the first row of the table contains the variable name",
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
                    "Step 15: Click on the create receipt button on the modal window",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать приход ",
                            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 16: Check the number of parts in the warehouse after posting",
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
                    "Step 17: Compare the quantity in cells",
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

    test("Test Case 12 - Complete Set Of Product", async ({ page }) => {
        const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
            page
        );
        const tableComplect =
            '[data-testid="TableComplect-TableComplect-ScrollContainer"]';
        const tableMainTable = "TableComplect-TableComplect-Table";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingProductsToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the completion product plan page",
            async () => {
                // Find and go to the page using the locator Complete set of Products on the plan
                const selector = '[data-testid="Sclad-completionProductPlan"]';
                await completingProductsToPlan.findTable(selector);

                // Wait for the table body to load
                await completingProductsToPlan.waitingTableBody(tableComplect);
            }
        );

        await allure.step('Step 03: Checking the main page headings', async () => {

            const titles = testData1.elements.EquipmentOfProductsOnThePlan.titles.map((title) => title.trim());
            const h3Titles = await completingProductsToPlan.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.EquipmentOfProductsOnThePlan.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await completingProductsToPlan.isButtonVisible(page, buttonClass, buttonLabel);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step("Step 05: Search product", async () => {
            // Using table search we look for the value of the variable
            await completingProductsToPlan.searchTable(
                nameProduct,
                tableComplect
            );

            // Wait for the table body to load
            await completingProductsToPlan.waitingTableBody(tableComplect);
        });

        await allure.step(
            "Step 06: Check the first line in the first row",
            async () => {
                // Check that the first row of the table contains the variable name
                await completingProductsToPlan.checkNameInLineFromFirstRow(
                    nameProduct,
                    tableComplect
                );
            }
        );

        await allure.step(
            "Step 07: Checking the urgency date of an order",
            async () => {
                const numberColumn =
                    await completingProductsToPlan.findColumn(
                        page,
                        tableMainTable,
                        "TableComplect-TableComplect-UrgencyDateColumn"
                    );
                console.log(
                    "Number column urgency date: ",
                    numberColumn
                );

                urgencyDateOnTable =
                    await completingProductsToPlan.getValueOrClickFromFirstRowNoThead(
                        tableComplect,
                        numberColumn
                    );

                console.log(
                    "Дата по срочности в таблице: ",
                    urgencyDateOnTable
                );
                console.log(
                    "Дата по срочности в переменной: ",
                    urgencyDate
                );

                expect(urgencyDateOnTable).toBe(urgencyDate);
            }
        );

        await allure.step(
            "Step 08: Find the column designation and click",
            async () => {
                // We get the cell number with the designation
                const numberColumn = await completingProductsToPlan.findColumn(
                    page,
                    tableMainTable,
                    "TableComplect-TableComplect-DesignationColumn"
                );
                console.log("numberColumn: ", numberColumn);

                const test =
                    await completingProductsToPlan.getValueOrClickFromFirstRow(
                        tableComplect,
                        numberColumn
                    );

                // Output to the console
                console.log(`Проверка текста ${test}`);

                await completingProductsToPlan.getValueOrClickFromFirstRow(
                    tableComplect,
                    numberColumn,
                    Click.No,
                    Click.Yes
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step(
            "Step 09: Check the modal window for the delivery note and check the checkbox",
            async () => {
                // Check the modal window for the delivery note and check the checkbox
                await completingProductsToPlan.assemblyInvoiceModalWindow(
                    TypeInvoice.product,
                    true,
                    '1'
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step(
            "Step 10: Click on the button to assemble into a set",
            async () => {
                // Click on the button
                await completingProductsToPlan.clickButton(
                    " Скомплектовать в набор ",
                    '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await completingProductsToPlan.waitingTableBody(tableComplect);
            }
        );
    });

    test("Test Case 13 - Receiving Product And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';
        const tableComplectsSets = '[data-testid="ModalKitsList-Table"]';

        await allure.step(
            "Step 01: Receiving quantities from balances",
            async () => {
                // Check the number of entities in the warehouse before posting
                remainingStockBefore = await stock.checkingTheQuantityInStock(
                    nameProduct,
                    TableSelection.product
                );
            }
        );

        // Capitalization of the entity
        await allure.step("Step 02: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 03: Open the stock receipt page", async () => {
            // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
            const selector =
                '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
            await stockReceipt.findTable(selector);

            // Waiting for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 04: Click on the create receipt button",
            async () => {
                // Click on the button
                await stockReceipt.clickButton(
                    " Создать Приход ",
                    '[data-testid="ComingToSclad-Button-MakeComing"]'
                );
            }
        );

        await allure.step(
            "Step 05: Select the selector in the modal window",
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

        await allure.step("Step 06: Search product", async () => {
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
            "Step 07: Find the checkbox column and click",
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
            "Step 08: Check the modal window Completed sets",
            async () => {
                // Check the modal window Completed sets
                await stockReceipt.completesSetsModalWindow();
                await stockReceipt.waitingTableBody('[data-testid="ModalKitsList-HiddenContent"]');
            }
        );

        await allure.step(
            "Step 09: We get the cell number with a checkmark",
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
                    '[data-testid^="ModalKitsList-TableRow-QuantityInputField"]';

                await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

                // Проверяем, что элемент не заблокирован
                const isDisabled = await page.locator(inputlocator).nth(0).getAttribute('disabled');
                if (isDisabled) {
                    throw new Error("Элемент заблокирован для ввода.");
                }
                const quantityPerShipment
                    = await page.locator(inputlocator).nth(0).getAttribute('value');
                console.log("Кол-во на отгрузку: ", quantityPerShipment)
                await page.locator(inputlocator).nth(0).fill('1')
                await page.locator(inputlocator).nth(0).press('Enter')
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

    test("Test Case 14 - Uploading Shipment Task", async ({ page }) => {
        const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
            page
        );
        const tableTaskForShipment = '.shipments-content';
        let numberColumn: number;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await warehouseTaskForShipment.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the warehouse shipping task page",
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

        await allure.step("Step 03: Checking the main page headings", async () => {
            const titles = testData1.elements.WarehouseLoadingTasks.titles.map((title) => title.trim());
            const h3Titles = await warehouseTaskForShipment.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.WarehouseLoadingTasks.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await warehouseTaskForShipment.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step("Step 05: Search product", async () => {
            // Using table search we look for the value of the variable
            const searchTable = page
                .locator('.search-yui-kit__input')
                .nth(1);
            await searchTable.fill(nameProduct);

            expect(await searchTable.inputValue()).toBe(nameProduct);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);

            // Wait for the table body to load
            await warehouseTaskForShipment.waitingTableBody(
                tableTaskForShipment
            );
        });

        await allure.step(
            "Step 06: Check that the first row of the table contains the variable name",
            async () => {
                // Check that the first row of the table contains the variable name
                await warehouseTaskForShipment.checkNameInLineFromFirstRow(
                    nameProduct,
                    tableTaskForShipment
                );
            }
        );

        await allure.step(
            "Step 07: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                // UPD:
                // numberColumn = await warehouseTaskForShipment.findColumn(
                //     page,
                //     tableModalComing,
                //     "ShipmentsTable-TableHead-Check"
                // );

                // console.log("numberColumn: ", numberColumn);
                await warehouseTaskForShipment.getValueOrClickFromFirstRow(
                    tableTaskForShipment,
                    2,
                    Click.Yes,
                    Click.No
                );
            }
        );


        await allure.step("Step 08: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                ".btn-small"
            );
        });

        await allure.step("Step 09: Checking the modalwindow headings", async () => {
            const titles = testData1.elements.ModalWindowUploadingTask.titles.map((title) => title.trim());
            const h3Titles = await warehouseTaskForShipment.getAllH3TitlesInModalClassNew(page, '[data-testid="ModalShComlit-RightDestroyModal"]');
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

        await allure.step("Step 10: Checking buttons on the modalwindow", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalWindowUploadingTask.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await warehouseTaskForShipment.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step(
            "Step 11: Check the Shipping modal window",
            async () => {
                // Check the Shipping modal window
                await warehouseTaskForShipment.shipmentModalWindow();
            }
        );

        await allure.step("Step 12: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                '[data-testid="ModalShComlit-Button-Ship"]'
            );
        });
    });

    test('Test Case 15 - Checking the number of shipped entities', async ({ page }) => {
        const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
            page
        );
        const tableTaskForShipment = '.shipments-content';
        let numberColumn: number;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await warehouseTaskForShipment.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the warehouse shipping task page",
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

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable

            const searchTable = page
                .locator('.search-yui-kit__input')
                .nth(1);
            await searchTable.fill(nameProduct);

            expect(await searchTable.inputValue()).toBe(nameProduct);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);

            // Wait for the table body to load
            await warehouseTaskForShipment.waitingTableBody(
                tableTaskForShipment
            );
        });

        await allure.step(
            "Step 04: Check that the first row of the table contains the variable name",
            async () => {
                // Check that the first row of the table contains the variable name
                await warehouseTaskForShipment.checkNameInLineFromFirstRow(
                    nameProduct,
                    tableTaskForShipment
                );
            }
        );

        await allure.step(
            "Step 05: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                // UPD:
                // numberColumn = await warehouseTaskForShipment.findColumn(
                //     page,
                //     tableModalComing,
                //     "ShipmentsTable-TableHead-Check"
                // );

                // console.log("numberColumn: ", numberColumn);
                await warehouseTaskForShipment.getValueOrClickFromFirstRow(
                    tableTaskForShipment,
                    2,
                    Click.Yes,
                    Click.No
                );
            }
        );

        await allure.step("Step 06: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                ".btn-small"
            );
        });

        await allure.step('Step 07: Checking the number of shipped entities', async () => {
            const tableBody = '[data-testid="ModalShComlit-TableScroll"]'
            await warehouseTaskForShipment.waitingTableBody(tableBody)

            const modalWindowTable = 'ModalShComlit-Table'
            numberColumn = await warehouseTaskForShipment.findColumn(
                page,
                modalWindowTable,
                "ModalShComlit-TableHead-Shipped"
            );

            console.log("numberColumn: ", numberColumn);
            const valueInShipped = await warehouseTaskForShipment.getValueOrClickFromFirstRow(
                tableBody,
                numberColumn,
                Click.Yes,
                Click.No
            );

            expect.soft(Number(valueInShipped)).toBe(Number(quantityProductLaunchOnProduction) - Number(incomingQuantity))
        })
    })

    test("Test Case 16 - Loading The Second Task", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);

        await allure.step("Step 01: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 02: Click on the Create order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Создать заказ ",
                    '.button-yui-kit'
                );
            }
        );

        await allure.step("Step 03: Click on the Select button", async () => {
            // Click on the button
            await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

            await page.waitForTimeout(1000);
        });

        await allure.step(
            "Step 04: Search product on modal window",
            async () => {
                const modalWindow = await page.locator('.modal-yui-kit__modal-content')
                // Using table search we look for the value of the variable
                await expect(modalWindow).toBeVisible();

                const searchTable = modalWindow
                    .locator('.search-yui-kit__input')
                    .nth(0);
                await searchTable.fill(nameProduct);

                expect(await searchTable.inputValue()).toBe(nameProduct);
                await searchTable.press("Enter");

                await page.waitForTimeout(1000);
            }
        );

        await allure.step(
            "Step 05: Choice product in modal window",
            async () => {
                await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

                await loadingTaskPage.waitForTimeout(1000)
            }
        );

        await allure.step(
            "Step 06: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Добавить ",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );

        await allure.step("Step 07: Checking the selected product", async () => {
            // Check that the selected product displays the expected product
            await loadingTaskPage.checkProduct(nameProduct);
            await loadingTaskPage.waitForTimeout(500)
        });

        await allure.step("Step 08: Selecting a buyer", async () => {
            const button = page.locator('.button-yui-kit.medium.primary-yui-kit', { hasText: 'Выбрать' }).nth(1);
            await expect(button).toHaveText('Выбрать');
            await expect(button).toBeVisible();

            await button.click()
            // Wait for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step('Step 09: Check modal window Company', async () => {
            const modalWindow = await page.locator('.modal-yui-kit__modal-content')
            // Using table search we look for the value of the variable
            await expect(modalWindow).toBeVisible();

            const searchTable = modalWindow
                .locator('.search-yui-kit__input')
                .nth(0);
            await searchTable.fill(nameBuyer);

            expect(await searchTable.inputValue()).toBe(nameBuyer);
            await searchTable.press("Enter");

            await page.waitForTimeout(500)

            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0)
        })

        await allure.step(
            "Step 10: Click on the Select button on modal window",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    " Добавить ",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );
        await allure.step(
            "Step 11: We set the date according to urgency",
            async () => {
                await page.locator('.date-picker-yui-kit__header-btn').nth(2).click()
                await page.locator('.vc-popover-content-wrapper.is-interactive').nth(2).isVisible()

                await page.locator('.vc-title-wrapper').click()

                const yearElement = await page.locator('.vc-nav-title.vc-focus');
                const currentYear = await yearElement.textContent();
                if (!currentYear) throw new Error('Year element not found');

                const targetYear = 2025;
                const currentYearNum = parseInt(currentYear);
                console.log(`Current year: ${currentYear}, Target year: ${targetYear}`);

                // Если текущий год не равен целевому
                if (currentYearNum !== targetYear) {
                    // Определяем, нужно ли увеличивать или уменьшать год
                    const isYearLess = currentYearNum < targetYear;
                    const arrowSelector = isYearLess
                        ? '.vc-nav-arrow.is-right.vc-focus'
                        : '.vc-nav-arrow.is-left.vc-focus';

                    // Кликаем на стрелку, пока не достигнем нужного года
                    while (currentYearNum !== targetYear) {
                        await page.locator(arrowSelector).click();
                        await page.waitForTimeout(500); // Небольшая задержка для обновления

                        const newYear = await yearElement.textContent();
                        if (!newYear) throw new Error('Year element not found');
                        const newYearNum = parseInt(newYear);

                        if (newYearNum === targetYear) {
                            console.log(`Year successfully set to ${targetYear}`);
                            break;
                        }
                    }
                } else {
                    console.log(`Year is already set to ${targetYear}`);
                }

                // Проверяем, что год установлен правильно
                const finalYear = await yearElement.textContent();
                if (!finalYear) throw new Error('Year element not found');
                expect(parseInt(finalYear)).toBe(targetYear);

                await page.locator('[aria-label="январь"]').click()
                await page.locator('.vc-day-content.vc-focusable.vc-focus.vc-attr', { hasText: '21' }).nth(0).click()
            }
        );

        await allure.step(
            "Step 12: Click on the save order button",
            async () => {
                // Click on the button
                await loadingTaskPage.clickButton(
                    "Сохранить",
                    '.button-yui-kit.medium.primary-yui-kit'
                );
            }
        );

        await allure.step(
            "Step 13: Checking the ordered quantity",
            async () => {
                await page.waitForTimeout(3000)
                orderNumber = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component')
                console.log("orderNumber: ", orderNumber)

            }
        );
    });

    test("Test Case 17 - Marking Parts", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
        const tableMetalworkingWarehouse =
            '[data-testid="MetalloworkingSclad-ScrollTable"]';
        const productionTable = '[data-testid="ModalOperationPathMetaloworking-OperationTable"]';
        let numberColumnQunatityMade: number;
        let firstOperation: string;
        const operationTable = "OperationPathInfo-Table";
        const tableMain = "#tablebody";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the metalworking warehouse page",
            async () => {
                // Find and go to the page using the locator Order a warehouse for Metalworking
                const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
                await metalworkingWarehouse.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 03: Search product", async () => {
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
                    "Step 04: Check the checkbox in the first column",
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
                    "Step 05: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
                                "MetalloworkingSclad-DetailsTableHeader-UrgencyDateColumn"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await metalworkingWarehouse.getValueOrClickFromFirstRowNoThead(
                                tableMetalworkingWarehouse,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDateSecond);
                    }
                );

                await allure.step(
                    "Step 06: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
                                "MetalloworkingSclad-DetailsTableHeader-OrderedColumn"
                            );
                        console.log("Column number orders: ", numberColumn);

                        quantityProductLaunchOnProductionBefore =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                tableMetalworkingWarehouse,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is orders befor:",
                            quantityProductLaunchOnProductionBefore
                        );

                        expect.soft(
                            Number(quantityProductLaunchOnProductionBefore)
                        ).toBe(Number(quantityProductLaunchOnProduction) - 1);
                    }
                );

                await allure.step(
                    "Step 07: Find and click on the operation icon",
                    async () => {
                        // Getting cell value by id
                        const numberColumn =
                            await metalworkingWarehouse.findColumn(
                                page,
                                tableMain,
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
                    "Step 08: Check the production path modal window ",
                    async () => {
                        // Check the production path modal window
                        await page.waitForTimeout(500)
                        await metalworkingWarehouse.productionPathDetailskModalWindow();

                        // Wait for the table body to load

                        // await metalworkingWarehouse.waitingTableBody(
                        //     productionTable
                        // );
                    }
                );

                await allure.step(
                    "Step 09: We find, get the value and click on the cell done pcs",
                    async () => {
                        // Getting cell value by id
                        numberColumnQunatityMade =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTable,
                                "OperationPathInfo-Thead-Maked"
                            );
                        console.log(
                            "Column number pieces made: ",
                            numberColumnQunatityMade
                        );

                        // Click on the Done cell
                        await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            productionTable,
                            numberColumnQunatityMade,
                            Click.Yes
                        );
                    }
                );

                await allure.step(
                    "Step 10: Find and get the value from the operation cell",
                    async () => {
                        // Getting the value of the first operation
                        const numberColumnFirstOperation =
                            await metalworkingWarehouse.findColumn(
                                page,
                                operationTable,
                                "OperationPathInfo-Thead-Operation"
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnQunatityMade
                        );

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
                    "Step 11: Click on the add mark button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Добавить Отметку для выбранной операции ",
                            '[data-testid="ModalOperationPathMetaloworking-Button-AddMark"]'
                        );

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    }
                );

                await allure.step(
                    "Step 12: Checking the modal window and marking completion",
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
                    "Step 13: Click on the Save order button",
                    async () => {
                        // Click on the button
                        await metalworkingWarehouse.clickButton(
                            " Сохранить Отметку ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 14: Closing a modal window by clicking on the logo",
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

    test("Test Case 18 - Checking new date by urgency", async ({ page }) => {
        // Проверка изделия на дату по срочности
        const shortageProduct = new CreateShortageProductPage(page);
        const deficitTableIzd = '[data-testid="DeficitIzd-ScrollTable"]';
        let checkOrderNumber: string;
        const tableMainIzd = "DeficitIzd-ScrollTable";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector =
                    '[data-testid="Sclad-deficitProduction-deficitProduction"]';
                await shortageProduct.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTableIzd);
            }
        );

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable
            await shortageProduct.searchTable(nameProduct, deficitTableIzd);

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTableIzd);
        });

        await allure.step(
            "Step 04: Check the checkbox in the first column",
            async () => {
                // Check that the first row of the table contains the variable name
                await shortageProduct.checkNameInLineFromFirstRow(
                    nameProduct,
                    deficitTableIzd
                );

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(
                    deficitTableIzd
                );
            }
        );

        await allure.step(
            "Step 05: Checking the urgency date of an order",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMainIzd,
                    "DeficitIzd-ScrollTable-TableSubHeader-DateByUrgency"
                );
                console.log("numberColumn: ", numberColumn);

                urgencyDateOnTable =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTableIzd,
                        numberColumn
                    );

                console.log(
                    "Date by urgency in the table: ",
                    urgencyDateOnTable
                );

                expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
            }
        );

        // Проверка на дату по срочности сборок
        const shortageAssemblies = new CreatShortageAssembliesPage(page);
        const deficitTableCbed = '[data-testid="DeficitCbed-ScrollTable"]';
        const tableMainCbed = "DeficitCbed-Table";

        await allure.step("Step 06: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 07: Open the shortage assemblies page",
            async () => {
                // Find and go to the page using the locator shortage assemblies
                const selector =
                    '[data-testid="Sclad-deficitCbed-deficitCbed"]';
                await shortageAssemblies.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 08: Search product", async () => {
                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTableCbed);

                    // Using table search we look for the value of the variable
                    await shortageAssemblies.searchTable(
                        cbed.designation,
                        deficitTableCbed
                    );

                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTableCbed);
                });

                await allure.step(
                    "Step 09: Check the checkbox in the first column",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await shortageProduct.checkNameInLineFromFirstRow(
                            cbed.designation,
                            deficitTableCbed
                        );

                        // Wait for the table body to load
                        await shortageProduct.waitingTableBody(
                            deficitTableCbed
                        );
                    }
                );

                await allure.step(
                    "Step 10: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMainCbed,
                                "DeficitCbed-TableHeader-UrgencyDate"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTableCbed,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDateSecond);
                    }
                );
            }
        }

        // Проверка на дату по срочности деталей
        const shortageParts = new CreatShortagePartsPage(page);
        const deficitTableDetal = '[data-testid="DeficitDetal-ScrollTable"]';
        const tableMainDetal = "DeficitDetal-Table";

        await allure.step("Step 11: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 12: Open the shortage parts page", async () => {
            // Find and go to the page using the locator Parts Shortage
            const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
            await shortageParts.findTable(selector);
        });

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 13: Search product", async () => {
                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTableDetal);

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    // Using table search we look for the value of the variable
                    await shortageParts.searchTable(
                        part.designation,
                        deficitTableDetal
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    await page.waitForTimeout(1000);

                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTableDetal);
                });

                await allure.step(
                    "Step 14: Check the checkbox in the first column",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        await shortageProduct.checkNameInLineFromFirstRow(
                            part.designation,
                            deficitTableDetal
                        );

                        // Wait for the table body to load
                        await shortageProduct.waitingTableBody(
                            deficitTableDetal
                        );
                    }
                );

                await allure.step(
                    "Step 15: Check that the first row of the table contains the variable name",
                    async () => {
                        const numberColumn = await shortageParts.findColumn(
                            page,
                            tableMainDetal,
                            "DeficitDetal-TableHeader-Icon"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageParts.getValueOrClickFromFirstRowBug(
                            deficitTableDetal,
                            numberColumn, Click.Yes
                        );


                        // Wait for the table body to load
                        await shortageParts.waitingTableBody(deficitTableDetal);
                    }
                );

                await allure.step(
                    "Step 16: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMainDetal,
                                "DeficitDetal-TableHeader-DatesByUrgency"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTableDetal,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDateSecond);
                    }
                );
            }
        }
    });

    test("Test Case 19 - Receiving Part And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const detail of descendantsDetailArray) {
                //  Check the number of parts in the warehouse before posting
                await allure.step(
                    "Step 01: Receiving quantities from balances",
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
                    "Step 02: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 03: Open the stock receipt page",
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
                    "Step 04: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step(
                    "Step 05: Select the selector in the modal window",
                    async () => {
                        // Select the selector in the modal window
                        await stockReceipt.selectStockReceipt(
                            StockReceipt.metalworking
                        );
                        // Waiting for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await stockReceipt.waitingTableBodyNoThead(
                            tableStockRecieptModalWindow
                        );
                    }
                );

                await allure.step("Step 06: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await stockReceipt.searchTable(
                        detail.designation,
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
                    "Step 07: Enter the quantity in the cells",
                    async () => {
                        // Enter the quantity in the cells
                        await stockReceipt.inputQuantityInCell(
                            incomingQuantity
                        );
                    }
                );

                await allure.step(
                    "Step 08: Find the checkbox column and click",
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
                    "Step 09: Check that the first row of the table contains the variable name",
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

    test("Test Case 20 - Receiving Cbed And Check Stock", async ({
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
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step(
                    "Step 01: Receiving quantities from balances",
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
                    "Step 02: Open the warehouse page",
                    async () => {
                        // Go to the Warehouse page
                        await stockReceipt.goto(
                            SELECTORS.MAINMENU.WAREHOUSE.URL
                        );
                    }
                );

                await allure.step(
                    "Step 03: Open the stock receipt page",
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
                    "Step 04: Click on the create receipt button",
                    async () => {
                        // Click on the button
                        await stockReceipt.clickButton(
                            " Создать Приход ",
                            '[data-testid="ComingToSclad-Button-MakeComing"]'
                        );
                    }
                );

                await allure.step(
                    "Step 05: Select the selector in the modal window",
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

                await allure.step("Step 06: Search product", async () => {
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
                    "Step 07: Find the checkbox column and click",
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
                    "Step 08: Check the modal window Completed sets",
                    async () => {
                        // Check the modal window Completed sets
                        await stockReceipt.completesSetsModalWindow();
                        await stockReceipt.waitingTableBody('[data-testid="ModalKitsList-HiddenContent"]');
                    }
                );

                await allure.step(
                    "Step 09: We get the cell number with a checkmark",
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
                        await page.waitForTimeout(500)
                        const inputlocator =
                            '[data-testid^="ModalKitsList-TableRow-QuantityInputField"]';

                        await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

                        // Проверяем, что элемент не заблокирован
                        const isDisabled = await page.locator(inputlocator).nth(0).getAttribute('disabled');
                        if (isDisabled) {
                            throw new Error("Элемент заблокирован для ввода.");
                        }
                        const quantityPerShipment
                            = await page.locator(inputlocator).nth(0).getAttribute('value');
                        console.log("Кол-во на отгрузку: ", quantityPerShipment)
                        await page.locator(inputlocator).nth(0).fill('1')
                        await page.locator(inputlocator).nth(0).press('Enter')
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

    test("Test Case 21 - Complete Set Of Product", async ({ page }) => {
        const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
            page
        );
        const TableComplect =
            '[data-testid="TableComplect-TableComplect-ScrollContainer"]';

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await completingProductsToPlan.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the completion product plan page",
            async () => {
                // Find and go to the page using the locator Complete set of Products on the plan
                const selector = '[data-testid="Sclad-completionProductPlan"]';
                await completingProductsToPlan.findTable(selector);

                // Wait for the table body to load
                await completingProductsToPlan.waitingTableBody(TableComplect);
            }
        );

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable
            await completingProductsToPlan.searchTable(
                nameProduct,
                TableComplect
            );

            // Wait for the table body to load
            await completingProductsToPlan.waitingTableBody(TableComplect);
        });

        await allure.step(
            "Step 04: Check the first line in the first row",
            async () => {
                // Check that the first row of the table contains the variable name
                await completingProductsToPlan.checkNameInLineFromFirstRow(
                    nameProduct,
                    TableComplect
                );
            }
        );

        await allure.step(
            "Step 05: Find the column designation and click",
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
            "Step 06: Check the modal window for the delivery note and check the checkbox",
            async () => {
                // Check the modal window for the delivery note and check the checkbox
                await completingProductsToPlan.assemblyInvoiceModalWindow(
                    TypeInvoice.product,
                    true,
                    '1'
                );

                // Wait for loading
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step(
            "Step 07: Click on the button to assemble into a set",
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

    test("Test Case 22 - Receiving Product And Check Stock", async ({
        page,
    }) => {
        const stockReceipt =
            new CreateStockReceiptFromSupplierAndProductionPage(page);
        const stock = new CreateStockPage(page);
        const tableStockRecieptModalWindow =
            '[data-testid="ModalComingTable-TableScroll"]';
        const tableComplectsSets = '[data-testid="ModalKitsList-Table"]';

        await allure.step(
            "Step 01: Receiving quantities from balances",
            async () => {
                // Check the number of entities in the warehouse before posting
                remainingStockBefore = await stock.checkingTheQuantityInStock(
                    nameProduct,
                    TableSelection.product
                );
            }
        );

        // Capitalization of the entity
        await allure.step("Step 02: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 03: Open the stock receipt page", async () => {
            // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
            const selector =
                '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
            await stockReceipt.findTable(selector);

            // Waiting for loading
            await page.waitForLoadState("networkidle");
        });

        await allure.step(
            "Step 04: Click on the create receipt button",
            async () => {
                // Click on the button
                await stockReceipt.clickButton(
                    " Создать Приход ",
                    '[data-testid="ComingToSclad-Button-MakeComing"]'
                );
            }
        );

        await allure.step(
            "Step 05: Select the selector in the modal window",
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

        await allure.step("Step 06: Search product", async () => {
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
            "Step 07: Find the checkbox column and click",
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
            "Step 08: Check the modal window Completed sets",
            async () => {
                // Check the modal window Completed sets
                await stockReceipt.completesSetsModalWindow();
                await stockReceipt.waitingTableBody('[data-testid="ModalKitsList-HiddenContent"]');
            }
        );

        await allure.step(
            "Step 09: We get the cell number with a checkmark",
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
                    '[data-testid^="ModalKitsList-TableRow-QuantityInputField"]';

                const quantityPerShipment
                    = await page.locator(inputlocator).nth(0).getAttribute('value');
                console.log("Кол-во на отгрузку: ", quantityPerShipment)
                await page.locator(inputlocator).nth(0).fill('1')
                await page.locator(inputlocator).nth(0).press('Enter')
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

    test("Test Case 23 - Launch Into Production Product", async ({
        page,
    }) => {
        const shortageProduct = new CreateShortageProductPage(page);
        const deficitTable = '[data-testid="DeficitIzd-ScrollTable"]';
        let checkOrderNumber: string;
        const tableMain = "DeficitIzd-ScrollTable";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage product page",
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

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable
            await shortageProduct.searchTable(nameProduct, deficitTable);

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTable);
        });

        await allure.step(
            "Step 04: Check the checkbox in the first column",
            async () => {
                // Find the variable name in the first line and check the checkbox
                const tableMain = "DeficitIzd-ScrollTable-Table";
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableSubHeader-Check"
                );
                console.log("Column number with checkbox: ", numberColumn);

                await shortageProduct.getValueOrClickFromFirstRow(
                    deficitTable,
                    numberColumn, Click.Yes
                );

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTable);
            }
        );

        await allure.step(
            "Step 05: Checking the urgency date of an order",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableSubHeader-DateByUrgency"
                );
                console.log("numberColumn: ", numberColumn);

                urgencyDateOnTable =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "Date by urgency in the table: ",
                    urgencyDateOnTable
                );

                expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            }
        );

        await allure.step(
            "Step 06: We check the number of those launched into production",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableHeader-OrderedInProduction"
                );

                quantityProductLaunchOnProductionBefore =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "The value in the cells is put into production befor:",
                    quantityProductLaunchOnProductionBefore
                );
            }
        );

        await allure.step(
            "Step 07: Click on the Launch on production button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " Запустить в производство ",
                    '[data-testid="DeficitIzd-StartButton"]'
                );
            }
        );

        await allure.step(
            "Step 08: Testing a modal window for production launch",
            async () => {
                // Check the modal window Launch into production
                await shortageProduct.checkModalWindowLaunchIntoProduction();

                // Check the date in the Launch into production modal window
                await shortageProduct.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );
            }
        );

        await allure.step("Step 09: Enter a value into a cell", async () => {
            // Check the value in the Own quantity field and enter the value
            const locator = '[data-testid="ModalStartProduction-ModalContent"]';
            await shortageProduct.checkOrderQuantity(
                locator,
                "2",
                quantityProductLaunchOnProduction
            );
        });

        await allure.step("Step 10: We save the order number", async () => {
            // Get the order number
            checkOrderNumber = await shortageProduct.checkOrderNumber();
            console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
            "Step 11: Click on the In launch button",
            async () => {
                // Click on the button
                await shortageProduct.clickButton(
                    " В производство ",
                    ".btn-status"
                );
            }
        );

        await allure.step(
            "Step 12: We check that the order number is displayed in the notification",
            async () => {
                // Check the order number in the success notification
                await shortageProduct.getMessage(checkOrderNumber);
            }
        );

        await allure.step(
            "Step 13: We check the number of those launched into production",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMain,
                    "DeficitIzd-ScrollTable-TableHeader-OrderedInProduction"
                );

                quantityProductLaunchOnProductionAfter =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTable,
                        numberColumn
                    );

                console.log(
                    "The value in the cells is put into production after:",
                    quantityProductLaunchOnProductionAfter
                );
                quantitySumLaunchOnProduction = Number(quantityProductLaunchOnProductionBefore) +
                    Number(quantityProductLaunchOnProduction)
                expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
                    Number(quantityProductLaunchOnProductionBefore) +
                    Number(quantityProductLaunchOnProduction)
                );
            }
        );
    });

    test("Test Case 24 - Launch Into Production Cbed", async ({
        page,
    }) => {
        const shortageAssemblies = new CreatShortageAssembliesPage(page);
        const deficitTable = '[data-testid="DeficitCbed-ScrollTable"]';
        const tableMain = "DeficitCbed-Table";
        let checkOrderNumber: string;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage assemblies page",
            async () => {
                // Find and go to the page using the locator shortage assemblies
                const selector =
                    '[data-testid="Sclad-deficitCbed-deficitCbed"]';
                await shortageAssemblies.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 03: Search product", async () => {
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
                    "Step 04: Check the checkbox in the first column",
                    async () => {
                        // Find the variable name in the first line and check the checkbox
                        const tableMain = "DeficitCbed-Table";
                        const numberColumn = await shortageAssemblies.findColumn(
                            page,
                            tableMain,
                            "DeficitCbed-TableHeader-SelectAll"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageAssemblies.getValueOrClickFromFirstRow(
                            deficitTable,
                            numberColumn, Click.Yes
                        );

                        // Wait for the table body to load
                        await shortageAssemblies.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 05: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-UrgencyDate"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 06: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-Ordered"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );

                        quantityProductLaunchOnProductionBefore =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production befor:",
                            quantityProductLaunchOnProductionBefore
                        );
                    }
                );

                await allure.step(
                    "Step 07: Click on the Launch on production button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitCbed-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 08: Testing a modal window for production launch",
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
                    "Step 09: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        const locator =
                            '[data-testid="ModalStartProduction-ModalContent"]';
                        await shortageAssemblies.checkOrderQuantity(
                            locator,
                            "2",
                            quantityProductLaunchOnProduction
                        );
                    }
                );

                await allure.step(
                    "Step 10: We save the order number",
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
                    "Step 11: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageAssemblies.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 12: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageAssemblies.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 13: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageAssemblies.closeSuccessMessage();
                    }
                );

                await allure.step(
                    "Step 14: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMain,
                                "DeficitCbed-TableHeader-Ordered"
                            );

                        quantityProductLaunchOnProductionAfter =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production after:",
                            quantityProductLaunchOnProductionAfter
                        );

                        expect(
                            Number(quantityProductLaunchOnProductionAfter)
                        ).toBe(
                            Number(quantityProductLaunchOnProductionBefore) +
                            Number(quantityProductLaunchOnProduction)
                        );
                    }
                );
            }
        }
    });

    test("Test Case 25 - Launch Into Production Parts", async ({
        page,
    }) => {
        const shortageParts = new CreatShortagePartsPage(page);
        const deficitTable = '[data-testid="DeficitDetal-ScrollTable"]';
        const tableMain = "DeficitDetal-Table";
        let checkOrderNumber: string;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 02: Open the shortage parts page", async () => {
            // Find and go to the page using the locator Parts Shortage
            const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
            await shortageParts.findTable(selector);
        });

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 03: Search product", async () => {
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
                    "Step 04: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        const numberColumn = await shortageParts.findColumn(
                            page,
                            tableMain,
                            "DeficitDetal-TableHeader-Icon"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageParts.getValueOrClickFromFirstRowBug(
                            deficitTable,
                            numberColumn, Click.Yes
                        );

                        // Wait for the table body to load
                        await shortageParts.waitingTableBody(deficitTable);
                    }
                );

                await allure.step(
                    "Step 05: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-TableHeader-DatesByUrgency"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );

                await allure.step(
                    "Step 06: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-Table-OrderInProduction"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );


                        quantityProductLaunchOnProductionBefore =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production befor:",
                            quantityProductLaunchOnProductionBefore
                        );
                    }
                );

                await allure.step(
                    "Step 07: Click on the Launch on production button ",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " Запустить в производство ",
                            '[data-testid="DeficitDetal-StartButton"]'
                        );
                    }
                );

                await allure.step(
                    "Step 08: Testing a modal window for production launch",
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
                    "Step 09: Enter a value into a cell",
                    async () => {
                        // Check the value in the Own quantity field and enter the value
                        const locator =
                            '[data-testid="ModalStartProduction-ModalContent"]';
                        await shortageParts.checkOrderQuantity(
                            locator,
                            "2",
                            quantityProductLaunchOnProduction
                        );
                    }
                );

                await allure.step(
                    "Step 10: We save the order number",
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
                    "Step 11: Click on the In launch button",
                    async () => {
                        // Click on the button
                        await shortageParts.clickButton(
                            " В производство ",
                            ".btn-status"
                        );
                    }
                );

                await allure.step(
                    "Step 12: We check that the order number is displayed in the notification",
                    async () => {
                        // Check the order number in the success notification
                        await shortageParts.getMessage(checkOrderNumber);
                    }
                );

                await allure.step(
                    "Step 13: Close success message",
                    async () => {
                        // Close the success notification
                        await shortageParts.closeSuccessMessage();
                    }
                );

                await allure.step(
                    "Step 14: We check the number of those launched into production",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMain,
                                "DeficitDetal-Table-OrderInProduction"
                            );
                        console.log(
                            "Number column launched into production: ",
                            numberColumn
                        );

                        quantityProductLaunchOnProductionAfter =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTable,
                                numberColumn
                            );

                        console.log(
                            "The value in the cells is put into production after:",
                            quantityProductLaunchOnProductionAfter
                        );

                        expect(
                            Number(quantityProductLaunchOnProductionAfter)
                        ).toBe(
                            Number(quantityProductLaunchOnProductionBefore) +
                            Number(quantityProductLaunchOnProduction)
                        );
                    }
                );
            }
        }
    });

    test("Test Case 26 - Uploading Second Shipment Task", async ({ page }) => {
        const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
            page
        );
        const tableTaskForShipment = '.shipments-content';
        let numberColumn: number;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await warehouseTaskForShipment.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the warehouse shipping task page",
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

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable
            const searchTable = page
                .locator('.search-yui-kit__input')
                .nth(1);
            await searchTable.fill(nameProduct);

            expect(await searchTable.inputValue()).toBe(nameProduct);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);

            // Wait for the table body to load
            await warehouseTaskForShipment.waitingTableBody(
                tableTaskForShipment
            );
        });

        await allure.step(
            "Step 04: Check that the first row of the table contains the variable name",
            async () => {
                // Check that the first row of the table contains the variable name
                await warehouseTaskForShipment.checkNameInLineFromFirstRow(
                    orderNumber.orderNumber,
                    tableTaskForShipment
                );
            }
        );

        await allure.step(
            "Step 05: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                // UPD:
                // numberColumn = await warehouseTaskForShipment.findColumn(
                //     page,
                //     tableModalComing,
                //     "ShipmentsTable-TableHead-Check"
                // );

                // console.log("numberColumn: ", numberColumn);
                await warehouseTaskForShipment.getValueOrClickFromFirstRow(
                    tableTaskForShipment,
                    2,
                    Click.Yes,
                    Click.No
                );
            }
        );

        await allure.step("Step 06: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                ".btn-small"
            );
        });

        await allure.step(
            "Step 07: Check the Shipping modal window",
            async () => {
                // Check the Shipping modal window
                await warehouseTaskForShipment.shipmentModalWindow();
            }
        );

        await allure.step("Step 08: Click on the ship button", async () => {
            // Click on the button
            await warehouseTaskForShipment.clickButton(
                " Отгрузить ",
                '[data-testid="ModalShComlit-Button-Ship"]'
            );
        });
    });

    test("Test Case 27 - Checking new date by urgency", async ({ page }) => {
        // Проверка изделия на дату по срочности
        const shortageProduct = new CreateShortageProductPage(page);
        const deficitTableIzd = '[data-testid="DeficitIzd-ScrollTable"]';
        let checkOrderNumber: string;
        const tableMainIzd = "DeficitIzd-ScrollTable";

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 02: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                const selector =
                    '[data-testid="Sclad-deficitProduction-deficitProduction"]';
                await shortageProduct.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await shortageProduct.waitingTableBody(deficitTableIzd);
            }
        );

        await allure.step("Step 03: Search product", async () => {
            // Using table search we look for the value of the variable
            await shortageProduct.searchTable(nameProduct, deficitTableIzd);

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTableIzd);
        });


        await allure.step(
            "Step 04: Checking the urgency date of an order",
            async () => {
                const numberColumn = await shortageProduct.findColumn(
                    page,
                    tableMainIzd,
                    "DeficitIzd-ScrollTable-TableSubHeader-DateByUrgency"
                );
                console.log("numberColumn: ", numberColumn);

                urgencyDateOnTable =
                    await shortageProduct.getValueOrClickFromFirstRow(
                        deficitTableIzd,
                        numberColumn
                    );

                console.log(
                    "Date by urgency in the table: ",
                    urgencyDateOnTable
                );

                expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            }
        );

        // Проверка на дату по срочности сборок
        const shortageAssemblies = new CreatShortageAssembliesPage(page);
        const deficitTableCbed = '[data-testid="DeficitCbed-ScrollTable"]';
        const tableMainCbed = "DeficitCbed-Table";

        await allure.step("Step 05: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 06: Open the shortage assemblies page",
            async () => {
                // Find and go to the page using the locator shortage assemblies
                const selector =
                    '[data-testid="Sclad-deficitCbed-deficitCbed"]';
                await shortageAssemblies.findTable(selector);
            }
        );

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 07: Search product", async () => {
                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTableCbed);

                    // Using table search we look for the value of the variable
                    await shortageAssemblies.searchTable(
                        cbed.designation,
                        deficitTableCbed
                    );

                    // Wait for the table body to load
                    await shortageAssemblies.waitingTableBody(deficitTableCbed);
                });


                await allure.step(
                    "Step 08: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageAssemblies.findColumn(
                                page,
                                tableMainCbed,
                                "DeficitCbed-TableHeader-UrgencyDate"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageAssemblies.getValueOrClickFromFirstRow(
                                deficitTableCbed,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );
            }
        }

        // Проверка на дату по срочности деталей
        const shortageParts = new CreatShortagePartsPage(page);
        const deficitTableDetal = '[data-testid="DeficitDetal-ScrollTable"]';
        const tableMainDetal = "DeficitDetal-Table";


        await allure.step("Step 09: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 10: Open the shortage parts page", async () => {
            // Find and go to the page using the locator Parts Shortage
            const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
            await shortageParts.findTable(selector);
        });

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Iterate through the array of parts
            for (const part of descendantsDetailArray) {
                await allure.step("Step 11: Search product", async () => {
                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTableDetal);

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    // Using table search we look for the value of the variable
                    await shortageParts.searchTable(
                        part.designation,
                        deficitTableDetal
                    );

                    // Waiting for loading
                    await page.waitForLoadState("networkidle");

                    await page.waitForTimeout(1000);

                    // Wait for the table body to load
                    await shortageParts.waitingTableBodyNoThead(deficitTableDetal);
                });

                await allure.step(
                    "Step 12: Check that the first row of the table contains the variable name",
                    async () => {
                        // Check that the first row of the table contains the variable name
                        const numberColumn = await shortageParts.findColumn(
                            page,
                            tableMainDetal,
                            "DeficitDetal-TableHeader-Icon"
                        );
                        console.log("Column number with checkbox: ", numberColumn);

                        await shortageParts.getValueOrClickFromFirstRowBug(
                            deficitTableDetal,
                            numberColumn, Click.Yes
                        );

                        // Wait for the table body to load
                        await shortageParts.waitingTableBody(deficitTableDetal);
                    }
                );

                await allure.step(
                    "Step 13: Checking the urgency date of an order",
                    async () => {
                        const numberColumn =
                            await shortageParts.findColumn(
                                page,
                                tableMainDetal,
                                "DeficitDetal-TableHeader-DatesByUrgency"
                            );
                        console.log(
                            "Number column urgency date: ",
                            numberColumn
                        );

                        urgencyDateOnTable =
                            await shortageParts.getValueOrClickFromFirstRowNoThead(
                                deficitTableDetal,
                                numberColumn
                            );

                        console.log(
                            "Дата по срочности в таблице: ",
                            urgencyDateOnTable
                        );

                        expect(urgencyDateOnTable).toBe(urgencyDate);
                    }
                );
            }
        }
    });

    test("Test Case 28 - Archive Metalworking Warehouse Task All", async ({ page }) => {
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
        const warehouseTable = '[data-testid="MetalloworkingSclad-ScrollTable"]';

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 02: Open the metalworking warehouse page", async () => {
            const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
            await metalworkingWarehouse.findTable(selector);

            // Wait for loading
            await page.waitForLoadState("networkidle");
            await metalworkingWarehouse.waitingTableBody(warehouseTable);
        });


        await allure.step("Step 03: Search product", async () => {
            await metalworkingWarehouse.searchTable(designation, warehouseTable);

            await metalworkingWarehouse.waitingTableBody(warehouseTable);
        });

        await allure.step("Step 04: Check that the first row of the table contains the variable name", async () => {
            await metalworkingWarehouse.checkboxMarkNameInLineFromFirstRow(
                designation,
                warehouseTable
            );
        });

        await allure.step("Step 05: Click on the archive button", async () => {
            await metalworkingWarehouse.clickOnTheTableHeaderCell(15, warehouseTable);

            await metalworkingWarehouse.clickButton(
                " Переместить в архив ",
                '[data-testid="MetalloworkingSclad-PrintControls-ArchiveButton"]'
            );
        });

        await allure.step("Step 06: Confirm the archive", async () => {
            await metalworkingWarehouse.clickButton(
                " Подтвердить ",
                '[data-testid="ModalPromptMini-Button-Confirm"]'
            );
        });
    });

    test("Test Case 29 - Archive Assembly Warehouse Task All", async ({ page }) => {
        const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
        const warehouseTable = '[data-testid="AssemblySclad-Table"]';

        await allure.step("Step 01: Open the warehouse page", async () => {
            await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step("Step 02: Open the assembly warehouse page", async () => {
            const selector = '[data-testid="Sclad-stockOrderAssembly"]';
            await assemblyWarehouse.findTable(selector);

            // Wait for loading
            await page.waitForLoadState("networkidle");
            await assemblyWarehouse.waitingTableBody(warehouseTable);

        });

        await allure.step("Step 03: Search product", async () => {
            await assemblyWarehouse.searchTable(designation, warehouseTable);

            await assemblyWarehouse.waitingTableBody(warehouseTable);
        });

        await allure.step("Step 04: Check that the first row of the table contains the variable name", async () => {
            await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
                designation,
                warehouseTable
            );
        });

        await allure.step("Step 05: Click on the archive button", async () => {
            await assemblyWarehouse.clickOnTheTableHeaderCell(16, warehouseTable);

            await assemblyWarehouse.clickButton(
                " Переместить в архив ",
                '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
            );
        });

        await allure.step("Step 06: Confirm the archive", async () => {
            await assemblyWarehouse.clickButton(
                " Подтвердить ",
                '[data-testid="ModalPromptMini-Button-Confirm"]'
            );
        });
    });

    test("Test Case 30 - Moving Task For Shipment To The Archive", async ({ page }) => {
        const loadingTaskPage = new CreateLoadingTaskPage(page);
        const loadingTaskTable = '.shipments-content';
        let numberColumn: number;

        await allure.step("Step 01: Open the shipment task page", async () => {
            // Go to the Shipping tasks page
            await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

            // Wait for loading
            await page.waitForLoadState("networkidle");
        });


        await allure.step("Step 02: Search product", async () => {
            // Using table search we look for the value of the variable
            const searchTable = page
                .locator('.search-yui-kit__input')
                .nth(1);
            await searchTable.fill(nameProduct);

            expect(await searchTable.inputValue()).toBe(nameProduct);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);

            // Waiting for the table body
            await loadingTaskPage.waitingTableBody(loadingTaskTable);
        });


        await allure.step(
            "Step 03: Check that the first row of the table contains the variable name",
            async () => {
                // Check that the first row of the table contains the variable name
                await loadingTaskPage.checkNameInLineFromFirstRow(
                    nameProduct,
                    loadingTaskTable
                );
            }
        );

        await allure.step(
            "Step 04: Find the column with the name and click on it",
            async () => {
                // Find the checkbox column and click
                // UPD:
                // numberColumn = await loadingTaskPage.findColumn(
                //     page,
                //     tableMainDataTestId,
                //     "ShipmentsTable-TableHead-Name"
                // );

                // console.log("numberColumn: ", numberColumn);
                await loadingTaskPage.getValueOrClickFromFirstRow(
                    loadingTaskTable,
                    2,
                    Click.Yes,
                    Click.No
                );
            }
        );

        await allure.step("Step 05: Click on the archive button", async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                "Архив",
                '.button-yui-kit.small.primary-yui-kit'
            );
        });

        await allure.step("Step 06: Confirm the archive", async () => {
            await loadingTaskPage.clickButton(
                "Да",
                '.dialog-ban__buttons .button-yui-kit.small.primary-yui-kit'
            );
        });
    });

    test("Test Case 31 - Cleaning up warehouse residues", async ({ page }) => {
        const revisionPage = new CreateRevisionPage(
            page
        );
        const tableMain = '[data-testid="Revision-TableRevisionPagination-Products"]';
        const tableMainCbed = '[data-testid="Revision-TableRevisionPagination-Cbeds"]'
        const tableMainDetal = '[data-testid="Revision-TableRevisionPagination-Detals"]'
        let numberColumn: number;

        await allure.step("Step 01: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await revisionPage.goto(
                SELECTORS.MAINMENU.WAREHOUSE.URL
            );
        });

        await allure.step(
            "Step 02: Open the warehouse shipping task page",
            async () => {
                // Find and go to the page using the locator Склад: Задачи на отгрузку
                const selector = '[data-testid="Sclad-revision-revision"]';
                await revisionPage.findTable(selector);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await revisionPage.waitingTableBodyNoThead(
                    tableMain
                );
            }
        );

        await allure.step("Step 03: Checking the main page headings", async () => {
            const titles = testData1.elements.RevisionPage.titles.map((title) => title.trim());
            const h3Titles = await revisionPage.getAllH3TitlesInClass(page, 'container');
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

        await allure.step("Step 04: Checking the main buttons on the page", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.RevisionPage.filters;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const expectedState = button.state === "true" ? true : false;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Check if the button is visible and enabled

                    const isButtonReady = await revisionPage.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step("Step 05: Search product", async () => {
            // Using table search we look for the value of the variable
            await revisionPage.searchTable(
                nameProduct,
                tableMain
            );

            // Wait for the table body to load
            await revisionPage.waitingTableBodyNoThead(
                tableMain
            );
        });

        await allure.step("Step 06: Checking if the first line contains a variable name", async () => {
            await revisionPage.checkNameInLineFromFirstRow(
                nameProduct,
                tableMain
            );
        });

        await allure.step("Step 07: Changing warehouse balances", async () => {
            await revisionPage.changeWarehouseBalances('0');
        });

        await allure.step("Step 08: Confirm the archive", async () => {
            await revisionPage.clickButton(
                " Подтвердить ",
                '[data-testid="ModalPromptMini-Button-Confirm"]'
            );
        });

        await allure.step('Step 09: Checking that the balance is now 0', async () => {
            await page.waitForTimeout(500)
            await revisionPage.checkWarehouseBalances('0')
        })

        // Check if the array is empty
        if (descendantsCbedArray.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            // Loop through the array of assemblies
            for (const cbed of descendantsCbedArray) {
                await allure.step("Step 10: Open the warehouse shipping task page", async () => {
                    await revisionPage.clickButton('Сборки', '[data-testid="MiniNavigation-POS-Data1"]')
                });

                await allure.step("Step 11: Search product", async () => {
                    await revisionPage.waitForTimeout(500)
                    // Using table search we look for the value of the variable
                    await revisionPage.searchTable(
                        cbed.name,
                        tableMainCbed
                    );
                    // Wait for the table body to load
                    await revisionPage.waitingTableBodyNoThead(
                        tableMainCbed
                    );
                });

                await allure.step("Step 12: Checking if the first line contains a variable name", async () => {
                    await revisionPage.checkNameInLineFromFirstRow(
                        cbed.name,
                        tableMainCbed
                    );
                });

                await allure.step("Step 13: Changing warehouse balances", async () => {
                    await revisionPage.changeWarehouseBalances('0');
                });

                await allure.step("Step 14: Confirm the archive", async () => {
                    await revisionPage.clickButton(
                        " Подтвердить ",
                        '[data-testid="ModalPromptMini-Button-Confirm"]'
                    );
                });

                await allure.step('Step 15: Checking that the balance is now 0', async () => {
                    await page.waitForTimeout(500)
                    await revisionPage.checkWarehouseBalances('0')
                })
            }
        }

        // Check if the array is empty
        if (descendantsDetailArray.length === 0) {
            throw new Error("Массив пустой. Перебор невозможен.");
        } else {
            for (const detail of descendantsDetailArray) {
                await allure.step("Step 16: Open the warehouse shipping task page", async () => {
                    await revisionPage.clickButton('Детали', '[data-testid="MiniNavigation-POS-Data2"]')
                });

                await allure.step("Step 17: Search product", async () => {
                    await revisionPage.waitForTimeout(500)
                    // Using table search we look for the value of the variable
                    await revisionPage.searchTable(
                        detail.name,
                        tableMainDetal
                    );
                    // Wait for the table body to load
                    await revisionPage.waitingTableBodyNoThead(
                        tableMainDetal
                    );
                });

                await allure.step("Step 18: Checking if the first line contains a variable name", async () => {
                    await revisionPage.checkNameInLineFromFirstRow(
                        detail.name,
                        tableMainDetal
                    );
                });

                await allure.step("Step 19: Changing warehouse balances", async () => {
                    await revisionPage.changeWarehouseBalances('0');
                });

                await allure.step("Step 20: Confirm the archive", async () => {
                    await revisionPage.clickButton(
                        " Подтвердить ",
                        '[data-testid="ModalPromptMini-Button-Confirm"]'
                    );
                });

                await allure.step('Step 21: Checking that the balance is now 0', async () => {
                    await page.waitForTimeout(500)
                    await revisionPage.checkWarehouseBalances('0')
                })
            }
        }
    });
};