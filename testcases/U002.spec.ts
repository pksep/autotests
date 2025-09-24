import { test, expect, Page } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec"; //
import {
    CreateOrderedFromSuppliersPage,
    Supplier,
} from "../pages/OrderedFromSuppliersPage";
import { CreateMetalworkingWarehousePage } from "../pages/MetalworkingWarehousePage";
import { CreateAssemblyWarehousePage } from "../pages/AssemplyWarehousePage";
import { ENV, SELECTORS, CONST } from "../config";
import { allure } from "allure-playwright";
import { Click } from "../lib/Page";
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

let nameOprerationOnProcess: string
let nameOprerationOnProcessAssebly: string
let nameOprerationOnProcessIzd: string

// Quantity launched into production
let quantityOrder = "2";
let checkOrderNumber: string;
let quantityLaunchInProduct: string;

let numberColumnQunatityMade: number;
let firstOperation: string;
let valueLeftToDo




export const runU002 = (isSingleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );

    test('Test Case 01 - Check all elements on page Ordered from suppliers', async ({ page }) => {
        test.setTimeout(60000);
        console.log("Test Case 01 - Check all elements on page Ordered from suppliers");
        const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
        const selectedItems: Array<{ id: string; name: string }> = [];
        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page 
            await orderedFromSuppliersPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage assemblies page",
            async () => {
                await orderedFromSuppliersPage.findTable(`[data-testid="${CONST.ORDERED_SUPPLIERS_PAGE_TABLE}"]`);
                await page.waitForLoadState("networkidle");
            }
        );

        await allure.step('Step 3: Проверяем  наличие заголовков на странице Заказано у поставщиков', async () => {
            console.log('Step 3: Проверяем  наличие заголовков на странице Заказано у поставщиков');
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
            console.log("Step 04: Проверяем наличие кнопок на странице Заказано у поставщиков");
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.MainPage.buttons;
            const knownButtonTestIdsByLabel: Record<string, string> = {
                'Создать заказ': CONST.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON
            };
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const dataTestId = button.datatestid;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    console.log(`Validate button with label: "${buttonLabel}"`);
                    // Check if the button is visible and enabled

                    // Highlight the button as we find it
                    try {
                        const highlightLocator = dataTestId
                            ? page.locator(`[data-testid="${dataTestId}"]`).first()
                            : page.locator(buttonClass).first();
                        await highlightLocator.waitFor({ state: 'visible', timeout: 3000 });
                        await highlightLocator.evaluate((el: HTMLElement) => {
                            el.style.backgroundColor = 'yellow';
                            el.style.border = '2px solid red';
                            el.style.color = 'blue';
                        });
                        await page.waitForTimeout(500);
                    } catch { }

                    let isButtonReady = false;
                    const mappedTestId = dataTestId || knownButtonTestIdsByLabel[buttonLabel];
                    if (mappedTestId) {
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisibleTestId(page, mappedTestId, buttonLabel);
                    } else {
                        console.log(`data-testid отсутствует в тестовых данных для кнопки "${buttonLabel}", используем проверку по классу.`);
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);
                    }

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step("Step 05: Проверка свитчера", async () => {
            console.log("Step 05: Проверка свитчера");
            const switchers = testData1.elements.MainPage.switcher;

            for (const switcher of switchers) {
                // Extract the class, label, and state from the button object
                const buttonClass = switcher.class;
                const buttonLabel = switcher.label;
                const dataTestId = switcher.datatestid;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    console.log(`Validate button with label: "${buttonLabel}"`);
                    // Check if the button is visible and enabled

                    // Highlight the switch as we find it
                    try {
                        const highlightLocator = dataTestId
                            ? page.locator(`[data-testid="${dataTestId}"]`).first()
                            : page.locator(buttonClass).first();
                        await highlightLocator.waitFor({ state: 'visible', timeout: 3000 });
                        await highlightLocator.evaluate((el: HTMLElement) => {
                            el.style.backgroundColor = 'yellow';
                            el.style.border = '2px solid red';
                            el.style.color = 'blue';
                        });
                        await page.waitForTimeout(500);
                    } catch { }

                    let isButtonReady = false;
                    if (dataTestId) {
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisibleTestId(page, dataTestId, buttonLabel);
                    } else {
                        console.log(`data-testid отсутствует в тестовых данных для переключателя "${buttonLabel}", используем проверку по классу.`);
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);
                    }

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        })

        await allure.step(
            "Step 06: Click on the Create Order button",
            async () => {
                const createOrderSelector = `[data-testid="${CONST.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON}"]`;
                try {
                    const createBtn = page.locator(createOrderSelector).first();
                    await createBtn.waitFor({ state: 'visible' });
                    await createBtn.evaluate((el: HTMLElement) => {
                        el.style.backgroundColor = 'yellow';
                        el.style.border = '2px solid red';
                        el.style.color = 'blue';
                    });
                    await page.waitForTimeout(1000);
                } catch { }

                await orderedFromSuppliersPage.clickButton(" Создать заказ ", createOrderSelector);
                // Wait for supplier selection modal to appear (fallback to a reliable content element if container testid differs)
                try {
                    await page.waitForSelector(`[data-testid="${CONST.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}"]`, { state: 'visible', timeout: 5000 });
                } catch {
                    await page.waitForSelector(`[data-testid="OrderSuppliers-Modal-AddOrder-Content-ProductCard"]`, { state: 'visible', timeout: 10000 });
                }
            }
        );

        await allure.step("Step 07: Проверяем модальное окно на наличие всех кнопок с поставщиками", async () => {
            console.log("Step 07: Проверяем модальное окно на наличие всех кнопок с поставщиками");
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalSelectSupplier.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonClass = button.class;
                const buttonLabel = button.label;
                const dataTestId = button.datatestid;

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Простое подсвечивание: ищем элемент по data-testid в пределах модального окна
                    const modal = page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}"]`).first();
                    await modal.waitFor({ state: 'visible' });
                    if (dataTestId) {
                        const item = modal.locator(`[data-testid="${dataTestId}"]`).first();
                        await item.waitFor({ state: 'visible', timeout: 3000 });
                        await item.evaluate((el: HTMLElement) => {
                            el.style.backgroundColor = 'yellow';
                            el.style.border = '2px solid red';
                            el.style.color = 'blue';
                        });
                        await page.waitForTimeout(1000);
                    }

                    // Prefer data-testid when provided; ignore text filter to avoid mismatches like "Изделии" vs "Изделие"
                    //const dataTestId = (button as any).datatestid as string | undefined;
                    let isButtonReady = false;
                    if (dataTestId) {
                        const btn = page.locator(`[data-testid="${dataTestId}"]`).first();
                        await btn.waitFor({ state: 'visible' });
                        const hasDisabledAttr = await btn.getAttribute('disabled');
                        isButtonReady = !hasDisabledAttr;
                    } else {
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);
                    }

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }

        });

        await allure.step('Step 08: Выбор поставщика "Детали"', async () => {
            console.log('Step 08: Выбор поставщика "Детали"');
            const modal = await page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}"][open]`);
            const button = await modal.locator(`[data-testid="${CONST.SELECT_TYPE_OBJECT_OPERATION_DETAILS}"]`);
            await button.click();
            await page.waitForTimeout(500);
            await page.waitForLoadState("networkidle");
        })

        await allure.step('Step 09: Проверка модального окна Создание заказа поставщика', async () => {
            console.log('Step 09: Проверка модального окна Создание заказа поставщика');
            const titles = testData1.elements.ModalCreateOrderSupplier.titles.map((title) => title.trim());
            //const target = `[data-testid="${CONST.MODAL_START_PRODUCTION_MODAL_CLOSE_LEFT}"]`;
            const h3Titles = await orderedFromSuppliersPage.getAllH4TitlesInModalByTestId(page, CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY);
            const normalizedH3Titles = h3Titles.map((title) => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles[0]).toContain(titles[0]);
            expect(normalizedH3Titles[1]).toBe(titles[1]);
        })

        await allure.step("Step 10: Проверяем кнопки в модальном окне Создание заказа поставщика", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            const buttons = testData1.elements.ModalCreateOrderSupplier.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
                // Extract the class, label, and state from the button object
                const buttonLabel = button.label;
                const dataTestId = button.datatestid;
                const buttonClass = button.class;
                const shouldBeEnabled = String((button as any).state ?? 'true').toLowerCase() === 'true';

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    // Подсветка в пределах модалки "Создание заказа поставщика"
                    const modal = page.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY}"]`).first();
                    await modal.waitFor({ state: 'visible' });
                    if (dataTestId) {
                        try {
                            const highlightLocator = modal.locator(`[data-testid="${dataTestId}"]`).first();
                            await highlightLocator.waitFor({ state: 'visible', timeout: 3000 });
                            await highlightLocator.evaluate((el: HTMLElement) => {
                                el.style.backgroundColor = 'yellow';
                                el.style.border = '2px solid red';
                                el.style.color = 'blue';
                            });
                            await page.waitForTimeout(1000);
                        } catch { }
                    }

                    // Проверка доступности: предпочитаем data-testid, иначе падение к классу
                    let isButtonReady = false;
                    if (dataTestId) {
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisibleTestId(
                            page,
                            dataTestId,
                            buttonLabel,
                            shouldBeEnabled,
                            CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY
                        );
                    } else {
                        isButtonReady = await orderedFromSuppliersPage.isButtonVisible(
                            page,
                            `[data-testid="${dataTestId}"]` || buttonClass,
                            buttonLabel,
                            shouldBeEnabled,
                            `[data-testid="${CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY}"]`
                        );
                    }

                    // Validate the button's visibility and state
                    expect(isButtonReady).toBeTruthy();
                    console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
                });
            }
        });

        await allure.step('Step 11: Выбираем первые две строки и сохраняем их данные', async () => {
            const tbody = page.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_TBODY}"]`).first();
            await tbody.waitFor({ state: 'visible' });

            const row0 = tbody.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0}"]`).first();
            const row1 = tbody.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1}"]`).first();
            await row0.waitFor({ state: 'visible', timeout: 5000 });
            await row1.waitFor({ state: 'visible', timeout: 5000 });

            const rows = [row0, row1];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                await row.evaluate((el: HTMLElement) => {
                    el.style.backgroundColor = 'yellow';
                    el.style.border = '2px solid red';
                    el.style.color = 'blue';
                });
                await page.waitForTimeout(150);

                const tdCheckbox = row.locator('[data-testid$="-TdCheckbox"]').first();
                await tdCheckbox.waitFor({ state: 'visible', timeout: 5000 });
                await tdCheckbox.click();
                await page.waitForTimeout(150);

                const checkbox = row.locator('[data-testid$="-TdCheckbox-Wrapper-Checkbox"]').first();
                await expect(checkbox).toBeChecked();

                const tds = row.locator('td');
                const idText = (await tds.nth(1).innerText().catch(() => '')).trim();
                const nameText = (await tds.nth(2).innerText().catch(() => '')).trim();
                selectedItems.push({ id: idText, name: nameText });
                console.log(`Выбрана строка ${i}: id="${idText}", name="${nameText}"`);
            }
        })

        await allure.step("Step 12: Нажимаем кнопку 'Выбрать' и проверяем выбранные позиции", async () => {
            // Ensure the 'Выбрать' button is enabled
            const chooseBtn = page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON}"]`).first();
            await chooseBtn.waitFor({ state: 'visible' });
            await chooseBtn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await page.waitForTimeout(300);

            const enabled = await orderedFromSuppliersPage.isButtonVisibleTestId(
                page,
                CONST.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON,
                'Выбрать',
                true,
                CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY
            );
            expect(enabled).toBeTruthy();
            await chooseBtn.click();

            // Wait for bottom table to appear and verify selected items
            const bottomTable = page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE}"]`).first();
            await bottomTable.waitFor({ state: 'visible', timeout: 5000 });

            for (const item of selectedItems) {
                const rowMatch = bottomTable.locator('tbody tr').filter({ hasText: item.name || item.id });
                await expect(rowMatch.first()).toBeVisible();
            }
        });

        await allure.step("Step 12.0: Устанавливаем количество 1 для выбранных строк", async () => {
            const bottomTable = page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE}"]`).first();
            await bottomTable.waitFor({ state: 'visible', timeout: 5000 });

            for (const item of selectedItems) {
                const row = bottomTable.locator('tbody tr').filter({ hasText: item.name || item.id }).first();
                await row.waitFor({ state: 'visible', timeout: 5000 });
                await row.evaluate((el: HTMLElement) => {
                    el.style.backgroundColor = 'yellow';
                    el.style.border = '2px solid red';
                    el.style.color = 'blue';
                });
                await page.waitForTimeout(200);

                // Находим инпут количества внутри строки по паттерну data-testid
                let qtyInput = row.locator(`*[data-testid^="${CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT_START}"][data-testid$="-TdQuantity-InputNumber-Input"]`).first();
                if (!(await qtyInput.isVisible().catch(() => false))) {
                    // Резервный путь: ищем по окончанию testid внутри текущей строки
                    qtyInput = row.locator(`*[data-testid$="-TdQuantity-InputNumber-Input"]`).first();
                }
                await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
                await qtyInput.evaluate((el: HTMLElement) => {
                    (el as HTMLElement).style.backgroundColor = 'yellow';
                    (el as HTMLElement).style.border = '2px solid red';
                    (el as HTMLElement).style.color = 'blue';
                });
                await qtyInput.click();
                await page.keyboard.press('Control+A');
                await qtyInput.type('1');
                await page.keyboard.press('Tab');
                await page.waitForTimeout(200);
                await expect(qtyInput).toHaveValue('1');
            }
        });

        await allure.step("Step 12.1: Нажимаем 'В производство' (должна быть активна)", async () => {
            const saveBtn = page.locator(`[data-testid="${CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON}"]`).first();
            await saveBtn.waitFor({ state: 'visible' });
            const enabled = await orderedFromSuppliersPage.isButtonVisibleTestId(
                page,
                CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON,
                'В производство',
                true,
                CONST.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY
            );
            await page.waitForTimeout(500);
            expect(enabled).toBeTruthy();
            await saveBtn.click();
        });

        await allure.step("Step 13: Проверяем уведомление после отправки в производство", async () => {
            // Уведомление может появиться быстро и исчезнуть — читаем сразу после клика 'В производство'
            const notif = await orderedFromSuppliersPage.extractNotificationMessage(page);
            if (!notif) {
                throw new Error('Уведомление не найдено после отправки в производство');
            }
            console.log(`Notification Title: ${notif.title}`);
            console.log(`Notification Message: ${notif.message}`);
            expect(notif.title).toBe('Успешно');
            expect(notif.message).toContain('Заказ №');
            expect(notif.message).toContain('отправлен в производство');
        })
    })

    test('Test Case 02 - Check all elements on page MetalWorkingWarehouse', async ({ page }) => {
        console.log("Test Case 02 - Check all elements on page MetalWorkingWarehouse");
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                await metalworkingWarehouse.findTable(CONST.SELECTOR_METAL_WORKING_WARHOUSE);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);
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
        console.log("Test Case 03 - Check all elements on page Assembly Warehouse");

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
                await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
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
        console.log("Test Case 04 - Delete Product before create");
        test.setTimeout(90000)
        const partsDatabsePage = new CreatePartsDatabasePage(page);
        const productTable = `[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`
        const productTableDiv = '[data-testid="BasePaginationTable-Wrapper-product"]'
        const searchProduct = page.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]').first()

        const cbedTable = `[data-testid="${CONST.MAIN_PAGE_СБ_TABLE}"]`
        const cbedTableDiv = '[data-testid="BasePaginationTable-Wrapper-cbed"]'
        const searchCbed = page.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]').nth(1)

        const detailTable = `[data-testid="${CONST.MAIN_PAGE_Д_TABLE}"]`
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
                                    const confirmButton = page.locator(`[data-testid="${CONST.MODAL_CONFIRM_YES_BUTTON_GENERIC}"]`);
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
                                    const confirmButton = page.locator(`[data-testid="${CONST.MODAL_CONFIRM_YES_BUTTON_GENERIC}"]`);
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
                                    const confirmButton = page.locator(`[data-testid="${CONST.MODAL_CONFIRM_YES_BUTTON_GENERIC}"]`);
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
        console.log("Test Case 05 - Create Parts");
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
                    await partsDatabsePage.clickButton('Создать', `[data-testid="${CONST.U002_BUTTON_CREATE_NEW_PART}"]`)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Деталь', `[data-testid="${CONST.U002_BUTTON_DETAIL}"]`)
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
                    await partsDatabsePage.clickButton('Сохранить', `[data-testid="${CONST.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', `[data-testid="${CONST.BUTTON_OPERATION}"]`)
                })

                await allure.step('Step 08: Click on the Add Operation', async () => {
                    await page.waitForSelector('[data-testid="Modal-ModalContent"]')
                    await partsDatabsePage.clickButton('Добавить операцию', `[data-testid="${CONST.BUTTON_ADD_OPERATION}"]`)
                })

                await allure.step('Step 09: Click on the type of operation', async () => {
                    await page.waitForLoadState('networkidle')
                    await page.locator(`[data-testid="${CONST.FILTER_TITLE}"]`).click()
                })

                await allure.step('Step 10: Search in dropdown menu', async () => {
                    const searchTypeOperation = page.locator(`[data-testid="${CONST.FILTER_SEARCH_DROPDOWN_INPUT}"]`)
                    const typeOperation = 'Сварочная'

                    await searchTypeOperation.fill(typeOperation)
                    expect(await searchTypeOperation.inputValue()).toBe(typeOperation)
                })

                await allure.step('Step 11: Choice type operation', async () => {
                    // If a dedicated constant exists for the first option, use it; otherwise keep generic pattern
                    await page.locator('[data-testid="Filter-Options-0"]').click()
                })

                await allure.step('Step 12: Click on the Save button', async () => {
                    await page.locator('[data-testid="Button"]', { hasText: 'Сохранить' }).last().click()
                    await page.waitForLoadState("networkidle");
                })

                await allure.step('Step 13: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, CONST.TABLE_PROCESS_ID, CONST.TABLE_PROCESS_NAME_OPERATION)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcess =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            `[data-testid="${CONST.TABLE_PROCESS}"]`,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process: ', nameOprerationOnProcess)
                })

                await allure.step('Step 14: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await page.locator(`[data-testid="${CONST.BUTTON_SAVE_OPERATION}"]`, { hasText: 'Сохранить' }).click()
                })

                await allure.step('Step 15: Click on the Create by copyinp', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', `[data-testid="${CONST.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL}"]`)
                })
            }
        }
    })

    test('Test Case 06 - Create Cbed', async ({ page }) => {
        console.log("Test Case 06 - Create Cbed");
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
                    await partsDatabsePage.clickButton('Создать', `[data-testid="${CONST.U002_BUTTON_CREATE_NEW_PART}"]`)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Сборочную единицу', `[data-testid="${CONST.U002_BUTTON_CBED}"]`)
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
                    await partsDatabsePage.clickButton('Сохранить', `[data-testid="${CONST.U002_CREATOR_SAVE_BUTTON}"]`)
                    await page.waitForTimeout(2000)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', `[data-testid="${CONST.U002_CREATOR_BUTTONS_TECHPROCESS}"]`)
                })

                await allure.step('Step 08: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, CONST.TABLE_PROCESS_ID, CONST.TABLE_PROCESS_ASSYMBLY_NAME)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcessAssebly =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            `[data-testid="${CONST.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER}"]`,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process Assembly: ', nameOprerationOnProcessAssebly)
                })

                await allure.step('Step 09: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', `[data-testid="${CONST.BUTTON_PROCESS_CANCEL}"]`)
                })

                await allure.step('Step 10: Click on the Create by copyinp', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Отменить', `[data-testid="${CONST.U002_CREATOR_CANCEL_BUTTON}"]`)
                })
            }
        }
    })

    test('Test Case 07 - Create Product', async ({ page }) => {
        console.log("Test Case 07 - Create Product");
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
                    await partsDatabsePage.clickButton('Создать', `[data-testid="${CONST.U002_BUTTON_CREATE_NEW_PART}"]`)
                })

                await allure.step('Step 03: Click on the Detail button', async () => {
                    await partsDatabsePage.clickButton('Изделие', `[data-testid="${CONST.U002_BUTTON_PRODUCT}"]`)
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
                    await partsDatabsePage.clickButton('Сохранить', `[data-testid="${CONST.U002_CREATOR_SAVE_BUTTON}"]`)
                    await page.waitForTimeout(2000)
                })

                await allure.step('Step 07: Click on the Process', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Технологический процесс', `[data-testid="${CONST.U002_CREATOR_BUTTONS_TECHPROCESS}"]`)
                })

                await allure.step('Step 08: Getting the name of the operation', async () => {
                    await page.waitForTimeout(1000)
                    const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, CONST.TABLE_PROCESS_ID, CONST.TABLE_PROCESS_ASSYMBLY_NAME)

                    console.log('Column number with process: ', numberColumnOnNameProcess)

                    nameOprerationOnProcessIzd =
                        await partsDatabsePage.getValueOrClickFromFirstRow(
                            `[data-testid="${CONST.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER}"]`,
                            numberColumnOnNameProcess
                        );

                    console.log('Name process Izd: ', nameOprerationOnProcessIzd)
                })

                await allure.step('Step 09: Click on the Save button', async () => {
                    await page.waitForTimeout(500)
                    await partsDatabsePage.clickButton('Отменить', `[data-testid="${CONST.BUTTON_PROCESS_CANCEL}"]`)
                })

                await allure.step('Step 10: Click on the Create by copyinp', async () => {
                    await page.waitForLoadState("networkidle");
                    await partsDatabsePage.clickButton('Отменить', `[data-testid="${CONST.U002_CREATOR_CANCEL_BUTTON}"]`)
                })
            }
        }
    })

    test("Test Case 08 Detail- Launch Detail Into Production Through Suppliers", async ({ page }) => {
        console.log("Test Case 08 - Launch Detail Into Production Through Suppliers");
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

    test("Test Case 09 Detail - Checking Metalworking Warehouse", async ({ page }) => {
        console.log("Test Case 09 - Checking Metalworking Warehouse");
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
                        await metalworkingWarehouse.findTable(CONST.SELECTOR_METAL_WORKING_WARHOUSE);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await metalworkingWarehouse.searchTable(
                        detail.name,
                        `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            CONST.METALLOWORKINGSCLAD_DETAILS_TABLE,
                            CONST.TABLE_METAL_WORKING_ORDERED_DETAILS
                        );
                        console.log("numberColumn: ", numberColumn);

                        const numberLaunched =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`,
                                numberColumn
                            );

                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
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
                            CONST.METALLOWORKINGSCLAD_DETAILS_TABLE,
                            CONST.TABLE_METAL_WORKING_OPERATION_DETAILS
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await metalworkingWarehouse.clickIconOperationNew(
                        `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_REMAINS_TO_DO
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // Click on the Done cell
                        valueLeftToDo = await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.U002_MODAL_OPERATION_TABLE_METAL}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.U002_MODAL_OPERATION_TABLE_METAL}\"]`,
                                numberColumnFirstOperation
                            );
                        console.log("Name of the first operation: ", firstOperation);

                        expect(firstOperation).toBe(nameOprerationOnProcess)
                    }
                );
            }
        }
    });

    test("Test Case 10 Detail- Launch Detail Into Production Through Suppliers", async ({ page }) => {
        console.log("Test Case 10 - Launch Detail Into Production Through Suppliers");
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

    test("Test Case 11 Detail- Checking Metalworking Warehouse", async ({ page }) => {
        console.log("Test Case 11 - Checking Metalworking Warehouse");
        const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage product page",
            async () => {
                // Find and go to the page using the locator Shortage of Products
                await metalworkingWarehouse.findTable(CONST.SELECTOR_METAL_WORKING_WARHOUSE);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);
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
                        `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            CONST.METALLOWORKINGSCLAD_DETAILS_TABLE,
                            CONST.TABLE_METAL_WORKING_ORDERED_DETAILS
                        );
                        console.log("numberColumn: ", numberColumn);

                        const numberLaunched =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}\"]`,
                                numberColumn
                            );

                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
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
                            CONST.METALLOWORKINGSCLAD_DETAILS_TABLE,
                            CONST.TABLE_METAL_WORKING_OPERATION_DETAILS
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await metalworkingWarehouse.clickIconOperationNew(
                        `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_REMAINS_TO_DO
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.U002_MODAL_OPERATION_TABLE_METAL}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await metalworkingWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.U002_MODAL_OPERATION_TABLE_METAL}\"]`,
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

                await metalworkingWarehouse.findTable(CONST.SELECTOR_METAL_WORKING_WARHOUSE);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);
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
                        `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
                    );

                    // Wait for the table body to load
                    await metalworkingWarehouse.waitingTableBody(`[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await metalworkingWarehouse.checkNameInLineFromFirstRow(
                            detail.name,
                            `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await metalworkingWarehouse.findColumn(
                            page,
                            CONST.METALLOWORKINGSCLAD_DETAILS_TABLE,
                            CONST.TABLE_METAL_WORKING_CHECKBOX
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await metalworkingWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid="${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}"]`,
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
                            `[data-testid="${CONST.BUTTON_MOVE_TO_ARCHIVE}"]`
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
                            `[data-testid="${CONST.U002_MODAL_PROMPT_MINI_BUTTON_CONFIRM}"]`
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

                await metalworkingWarehouse.findTable(CONST.SELECTOR_METAL_WORKING_WARHOUSE);

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
                        `[data-testid=\"${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}\"]`
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(`[data-testid=\"${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}\"]`, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`[data-testid=\"${CONST.METALLOWORKINGSCLAD_DETAILS_TABLE}\"] tbody tr`);
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(arrayCbed[0].name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_ORDERED
                        );
                        console.log("numberColumn Ordered: ", numberColumn);


                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            arrayCbed[0].name,
                            `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`
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
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_OPERATION
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_REMAINS_TO_DO
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(cbed.name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_ORDERED
                        );
                        console.log("numberColumn Ordered: ", numberColumn);

                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            cbed.name,
                            `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`
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
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_OPERATION
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_REMAINS_TO_DO
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(cbed.name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            cbed.name,
                            `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_CHECKBOX
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await assemblyWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
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
                            `[data-testid="${CONST.ZAKAZ_SCLAD_BUTTON_MOVE_TO_ARCHIVE_ASSEMBLY}"]`
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
                            `[data-testid="${CONST.U002_MODAL_PROMPT_MINI_BUTTON_CONFIRM}"]`
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Don't wait for table body as it might be empty after archiving
                    }
                );

                await allure.step("Step 3: Search for the archived CBED product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(
                        cbed.name,
                        `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given CBED name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"] tbody tr`);
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
                    }
                );

                for (const izd of arrayIzd) {
                    await allure.step("Step 3: Search product", async () => {
                        // Using table search we look for the value of the variable
                        await assemblyWarehouse.searchTable(izd.name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");
                    });

                    await allure.step(
                        "Step 4: We check the number of those launched into production",
                        async () => {
                            const numberColumn = await assemblyWarehouse.findColumn(
                                page,
                                CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                                CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_ORDERED
                            );
                            console.log("numberColumn Ordered: ", numberColumn);


                            const numberLaunched =
                                await assemblyWarehouse.getValueOrClickFromFirstRow(
                                    `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
                                    numberColumn
                                );
                            await assemblyWarehouse.checkNameInLineFromFirstRow(
                                izd.name,
                                `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`
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
                                CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                                CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_OPERATION
                            );
                        console.log("numberColumn Operation: ", numberColumn);

                        // Click on the icon in the cell
                        await assemblyWarehouse.clickIconOperationNew(
                            `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`,
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
                                    CONST.OPERATION_TABLE_ID,
                                    CONST.OPERATION_TABLE_REMAINS_TO_DO
                                )
                            console.log(
                                "Column number left to do: ",
                                numberColumnQunatityMade
                            );

                            // UPD
                            // Click on the Done cell
                            valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                                    CONST.OPERATION_TABLE_ID,
                                    CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                                );
                            console.log(
                                "Operation column number: ",
                                numberColumnFirstOperation
                            );

                            firstOperation =
                                await assemblyWarehouse.getValueOrClickFromFirstRow(
                                    `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                        await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                        // Wait for loading
                        await page.waitForLoadState("networkidle");

                        // Wait for the table body to load
                        await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
                    }
                );

                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(izd.name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: We check the number of those launched into production",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_ORDERED
                        );
                        console.log("numberColumn Ordered: ", numberColumn);

                        const numberLaunched =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`,
                                numberColumn
                            );
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            izd.name,
                            `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`
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
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_OPERATION
                        );
                    console.log("numberColumn Operation: ", numberColumn);

                    // Click on the icon in the cell
                    await assemblyWarehouse.clickIconOperationNew(
                        `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_REMAINS_TO_DO
                            )
                        console.log(
                            "Column number left to do: ",
                            numberColumnQunatityMade
                        );

                        // UPD
                        // Click on the Done cell
                        valueLeftToDo = await assemblyWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                                CONST.OPERATION_TABLE_ID,
                                CONST.OPERATION_TABLE_NAME_FIRST_OPERATION
                            );
                        console.log(
                            "Operation column number: ",
                            numberColumnFirstOperation
                        );

                        firstOperation =
                            await assemblyWarehouse.getValueOrClickFromFirstRow(
                                `[data-testid=\"${CONST.ZAKAZ_SCLAD_OPERATION_TABLE_ASSEMBLY}\"]`,
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
                await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

                // Wait for loading
                await page.waitForLoadState("networkidle");

                // Wait for the table body to load
                await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);
            }
        );

        if (arrayIzd.length === 0) {
            throw new Error("Массив пустой.");
        } else {
            for (const izd of arrayIzd) {
                await allure.step("Step 3: Search product", async () => {
                    // Using table search we look for the value of the variable
                    await assemblyWarehouse.searchTable(izd.name, `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for the table body to load
                    await assemblyWarehouse.waitingTableBody(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`);

                    // Wait for loading
                    await page.waitForLoadState("networkidle");
                });

                await allure.step(
                    "Step 4: Check the first line in the first row",
                    async () => {
                        await assemblyWarehouse.checkNameInLineFromFirstRow(
                            izd.name,
                            `[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`
                        );
                    }
                );

                await allure.step(
                    "Step 5: Find the cell and click on the send checkbox",
                    async () => {
                        const numberColumn = await assemblyWarehouse.findColumn(
                            page,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE_ID,
                            CONST.ZAKAZ_SCLAD_TABLE_ASSEMBLY_CHECKBOX
                        );
                        console.log("numberColumn: ", numberColumn);

                        // Upd:
                        await assemblyWarehouse.getValueOrClickFromFirstRow(
                            `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`,
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
                            `[data-testid="${CONST.ZAKAZ_SCLAD_BUTTON_MOVE_TO_ARCHIVE_ASSEMBLY}"]`
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
                            `[data-testid="${CONST.U002_MODAL_PROMPT_MINI_BUTTON_CONFIRM}"]`
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
                    await assemblyWarehouse.findTable(CONST.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);

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
                        `[data-testid=\"${CONST.U002_ASSEMBLY_TABLE}\"]`
                    );

                    // Wait for loading without expecting table body to have rows
                    await page.waitForLoadState("networkidle");
                    await page.waitForTimeout(1000); // Give time for search to complete
                });

                await allure.step(
                    "Step 4: Verify that no records with the given CBED name are found in the table",
                    async () => {
                        // Wait for the table to be present (but it might be empty)
                        await page.waitForSelector(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"]`, { timeout: 5000 });

                        // Get all rows in the table
                        const rows = page.locator(`[data-testid="${CONST.U002_ASSEMBLY_TABLE}"] tbody tr`);
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