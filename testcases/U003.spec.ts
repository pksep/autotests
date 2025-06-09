import { test, expect } from "@playwright/test";
import { performLogin } from "./TC000.spec"; //
import { allure } from "allure-playwright";
import { SELECTORS } from "../config";
import { Click } from "../lib/Page";
import { CreateLoadingTaskPage, Month } from "../pages/LoadingTaskPage";
import LoadingTasksPage from '../testdata/LoadingTasksPage.json'
import ProductShortagePage from '../testdata/ProductShortagePage.json'
import { CreateStockPage, TableSelection } from "../pages/StockPage";
import { CreateShortageProductPage } from "../pages/ShortageProductPage";

const arrayIzd = [
    {
        name: 'Изделие Т1 Тест',
        quantityInOrders: 0,
        stock: 0,
        demandForOrders: 0
    },
    {
        name: 'Цилиндр ВСГ16',
        quantityInOrders: 0,
        stock: 0,
        demandForOrders: 0
    },
    {
        name: 'Напольный ямный подъемник (рельсовый) 15т. 1000мм. КПП15Р1000П (РУЧНОЙ)',
        quantityInOrders: 0,
        stock: 0,
        demandForOrders: 0
    }
];
const mainTable = '#tableshipments'
let remainingStock: string;
const nameBuyer = "ООО ''М10''";
const quantityInOrder = Math.floor(Math.random() * 10 + 1).toString();
let orderNumber;

export const runU003 = (isSignleTest: boolean, iterations: number) => {
    console.log(
        `Test e2e U003 - Creating shipping tasks`
    );
};

test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
    await allure.step("Step 00: Authentication", async () => {
        // Perform login directly on the provided page fixture
        await performLogin(page, "001", "Перов Д.А.", "54321");
        await page.waitForSelector('[data-testid="LoginForm-Login-Button"]', { state: 'visible' });
        await page.locator('[data-testid="LoginForm-Login-Button"]').click();

        const targetH3 = page.locator('h3:has-text("План по операциям")');
        await expect(targetH3).toBeVisible();
    });
});

test('Test Case 01 - We check that the remainders do not contain the desired values', async ({ page }) => {
    const stock = new CreateStockPage(page);

    // Check if the array is empty
    if (arrayIzd.length === 0) {
        throw new Error("Массив пустой.");
    } else {
        // Iterate through the array of parts
        for (const Izd of arrayIzd) {
            //  Check the number of parts in the warehouse before posting
            await allure.step(
                "Step 01: Receiving quantities from balances",
                async () => {
                    // Receiving quantities from balances
                    remainingStock =
                        await stock.checkingTheQuantityInStock(
                            Izd.name,
                            TableSelection.product
                        );

                    const productIndex = arrayIzd.findIndex(item => item.name === Izd.name);
                    if (productIndex !== -1) {
                        arrayIzd[productIndex].stock = +remainingStock;
                    }

                    console.log(`Product ${Izd.name}, ${Izd.stock} pieces remaining`)
                }
            );
        }
    }
})

test("Test Case 02 - Checking the tasks for shipment", async ({ page }) => {
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
        // Go to the Shipping tasks page
        await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

        // Wait for loading
        await page.waitForLoadState("networkidle");
    })

    await allure.step("Step 02: Checking the main page headings", async () => {
        const titles = LoadingTasksPage.elements.LoadingPage.titles.map((title) => title.trim());
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

        const buttons = LoadingTasksPage.elements.LoadingPage.buttons;
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

    // Using table search we look for the value of the variable
    if (arrayIzd.length === 0) {
        throw new Error('Массив пустой.')
    } else {
        for (const Izd of arrayIzd) {

            await allure.step("Step 04: Search product", async () => {

                const searchTable = page
                    .locator('.search-yui-kit__input')
                    .nth(1);
                await searchTable.fill(Izd.name);

                expect(await searchTable.inputValue()).toBe(Izd.name);
                await searchTable.press("Enter");

                await page.waitForTimeout(3000)
            });

            // Check if there are any rows in the table after search
            const rows = await page.locator(`${mainTable} tbody tr`).all();

            if (rows.length === 0) {
                console.log(`No orders found for product "${Izd.name}". Continuing with next product...`);
                continue;
            }

            await allure.step("Step 05: Check table rows and calculate sum", async () => {
                let totalSum = 0;

                // Iterate through each row
                for (const row of rows) {
                    // Get the first cell (product name) to verify it contains the search term
                    const firstCell = await row.locator('td').nth(4).textContent();
                    expect(firstCell).toContain(Izd.name);

                    // Get the sixth cell value and add to total
                    const sixthCell = await row.locator('td').nth(5).textContent();
                    if (sixthCell) {
                        const value = parseFloat(sixthCell.replace(/\s/g, '').replace(',', '.'));
                        if (!isNaN(value)) {
                            totalSum += value;
                        }
                    }
                }

                // Save the sum to the corresponding product in arrayIzd
                const productIndex = arrayIzd.findIndex(item => item.name === Izd.name);
                if (productIndex !== -1) {
                    arrayIzd[productIndex].quantityInOrders = totalSum;
                }

                console.log(`Total sum for ${Izd.name}: ${totalSum}`);
            });

        }
    }
})

test('Test Case 03 - Checking product shortages', async ({ page }) => {
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
        const titles = ProductShortagePage.elements.MainPage.titles.map((title) => title.trim());
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

        const buttons = ProductShortagePage.elements.MainPage.buttons;
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

    // Using table search we look for the value of the variable
    if (arrayIzd.length === 0) {
        throw new Error('Массив пустой.')
    } else {
        for (const Izd of arrayIzd) {
            await allure.step("Step 05: Search product", async () => {
                // Using table search we look for the value of the variable
                await shortageProduct.searchTable(Izd.name, deficitTable);

                await page.waitForTimeout(500)
            });

            const rows = await page.locator(`${deficitTable} tbody tr`).all();

            if (rows.length === 0) {
                console.log(`No orders found for product "${Izd.name}". Continuing with next product...`);
                continue;
            }

            let demandForOrders: any

            // Iterate through each row
            for (const row of rows) {
                await allure.step("Step 06: Check that the first row of the table is the name of the variable", async () => {
                    const numberColumnNameIzd = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableSubHeader-Name"
                    );

                    // Get the first cell (product name) to verify it contains the search term
                    const firstCell = await row.locator('td').nth(numberColumnNameIzd).textContent();
                    expect(firstCell).toContain(Izd.name);
                    console.log(`Имя изделия из ячейки: ${firstCell}`)

                })

                await allure.step("Step 07: Проверка значения в ячейки потребность по заказам", async () => {
                    const numberColumn = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableHeader-Need"
                    );
                    // Get the sixth cell value and add to total
                    demandForOrders = await row.locator('td').nth(numberColumn).textContent();

                    const productIndex = arrayIzd.findIndex(item => item.name === Izd.name);
                    if (productIndex !== -1) {
                        arrayIzd[productIndex].demandForOrders = +demandForOrders;
                    }

                    console.log(`Total sum for ${Izd.name}: ${demandForOrders} == ${Izd.demandForOrders}`);
                    expect(Izd.quantityInOrders).toBe(Izd.demandForOrders)
                })

                await allure.step("Step 08: Сравниваем значение в ячейки остатки склада", async () => {
                    const numberColumnStock = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableHeader-Remainder"
                    );

                    const quantityStock = await row.locator('td').nth(numberColumnStock).textContent();

                    expect(Number(quantityStock)).toBe(Izd.stock)
                })
            }
        }
    }
}
)

test("Test Case 04 - Loading Task", async ({ page }) => {
    test.setTimeout(50000);
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

    await allure.step("Step 03: Checking the main page headings", async () => {
        const titles = LoadingTasksPage.elements.CreateOrderPage.titles.map((title) => title.trim());
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

    await allure.step("Step 04: Checking the main buttons on the page", async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState("networkidle");

        const buttons = LoadingTasksPage.elements.CreateOrderPage.buttons;
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

    await allure.step("Step 05: Click on the Select button", async () => {
        // Click on the button
        await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

        await page.waitForTimeout(1000);
    });

    await allure.step("Step 06: Checking the main page headings", async () => {
        const titles = LoadingTasksPage.elements.ModalWindowChoiceProduct.titles.map((title) => title.trim());
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

    await allure.step("Step 07: Checking buttons on the modalwindow", async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState("networkidle");

        const buttons = LoadingTasksPage.elements.ModalWindowChoiceProduct.buttons;
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
        "Step 08: Search product on modal window",
        async () => {
            const modalWindow = await page.locator('.modal-yui-kit__modal-content')
            // Using table search we look for the value of the variable
            await expect(modalWindow).toBeVisible();

            const searchTable = modalWindow
                .locator('.search-yui-kit__input')
                .nth(0);
            await searchTable.fill(arrayIzd[0].name);

            expect(await searchTable.inputValue()).toBe(arrayIzd[0].name);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);
        }
    );

    await allure.step(
        "Step 09: Choice product in modal window",
        async () => {
            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

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

    await allure.step("Step 11: Checking the selected product", async () => {
        // Check that the selected product displays the expected product
        await loadingTaskPage.checkProduct(arrayIzd[0].name);
        await loadingTaskPage.waitForTimeout(500)
    });

    await allure.step("Step 12: Selecting a buyer", async () => {
        const button = page.locator('.button-yui-kit.medium.primary-yui-kit', { hasText: 'Выбрать' }).nth(1);
        await expect(button).toHaveText('Выбрать');
        await expect(button).toBeVisible();

        await button.click()
        // Wait for loading
        await page.waitForLoadState("networkidle");
    });

    await allure.step('Step 13: Check modal window Company', async () => {
        const modalWindow = await page.locator('.modal-yui-kit__modal-content')
        // Using table search we look for the value of the variable
        await expect(modalWindow).toBeVisible();

        const searchTable = modalWindow
            .locator('.search-yui-kit__input')
            .nth(0);
        await searchTable.fill(nameBuyer);

        expect(await searchTable.inputValue()).toBe(nameBuyer);
        await searchTable.press("Enter");
    })

    await allure.step(
        "Step 14: Choice product in modal window",
        async () => {
            await page.locator('.modal-yui-kit__modal-content h3', { hasText: 'Компании' }).hover()

            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0)
        })

    await allure.step(
        "Step 15: Click on the Select button on modal window",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                " Добавить ",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );


    await allure.step(
        "Step 16: We change the quantity of the ordered product",
        async () => {
            const locator = '.input-yui-kit.initial.medium.add-order-component__input.initial';
            await loadingTaskPage.checkOrderQuantity(locator, "1", quantityInOrder);

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

    await allure.step(
        "Step 16: We set the date according to urgency",
        async () => {
            await loadingTaskPage.urgencyDate(Month.Feb, '22')
        }
    );

    await allure.step(
        "Step 17: Click on the save order button",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                "Сохранить",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );

    await allure.step(
        "Step 18: Checking the ordered quantity",
        async () => {
            await page.waitForTimeout(3000)
            orderNumber = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component')
            console.log("orderNumber: ", orderNumber)

        }
    );

    await allure.step('Step 19: Checking buttons on the edit page', async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState("networkidle");

        const buttons = LoadingTasksPage.elements.OrderEditingPage.buttons;
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
            })
        }
    })

    await allure.step('Step 20: We check that the table contains a row with the variable name', async () => {
        await page.waitForSelector(`${mainTable} tbody tr`, { state: 'visible' });
        const rows = await page.locator(`${mainTable} tbody tr`).all();
        let i = 0
        expect(rows.length).toBe(i + 1); // i = 0 для первого, 1 для второго и т.д.

        for (let idx = 0; idx <= i; idx++) {
            const nameCell = await rows[idx].locator('td').nth(4).textContent();
            expect(nameCell?.trim()).toContain(arrayIzd[idx].name);
        }
    })

    await allure.step('Step 21: Click on the add a new product order', async () => {
        await loadingTaskPage.clickButton(
            " Добавить новое изделие к заказу ",
            '.button-yui-kit.medium.outline-yui-kit.editor-buttons__button'
        );
        await page.waitForLoadState('networkidle')
    })

    await allure.step("Step 22: Click on the Select button", async () => {
        await page.waitForTimeout(1000);
        // Click on the button
        await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

        await page.waitForTimeout(1000);
    });



    await allure.step(
        "Step 23: Search product on modal window",
        async () => {
            const modalWindow = await page.locator('.modal-yui-kit__modal-content')
            // Using table search we look for the value of the variable
            await expect(modalWindow).toBeVisible();

            const searchTable = modalWindow
                .locator('.search-yui-kit__input')
                .nth(0);
            await searchTable.fill(arrayIzd[1].name);

            expect(await searchTable.inputValue()).toBe(arrayIzd[1].name);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);
        }
    );

    await allure.step(
        "Step 24: Choice product in modal window",
        async () => {
            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

    await allure.step(
        "Step 25: Click on the Select button on modal window",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                " Добавить ",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );

    await allure.step("Step 26: Checking the selected product", async () => {
        // Check that the selected product displays the expected product
        await loadingTaskPage.checkProduct(arrayIzd[1].name);
        await loadingTaskPage.waitForTimeout(500)
    });

    await allure.step("Step 27: Selecting a buyer", async () => {
        const button = page.locator('.button-yui-kit.medium.primary-yui-kit', { hasText: 'Выбрать' }).nth(1);
        await expect(button).toHaveText('Выбрать');
        await expect(button).toBeVisible();

        await button.click()
        // Wait for loading
        await page.waitForLoadState("networkidle");
    });

    await allure.step('Step 28: Check modal window Company', async () => {
        const modalWindow = await page.locator('.modal-yui-kit__modal-content')
        // Using table search we look for the value of the variable
        await expect(modalWindow).toBeVisible();

        const searchTable = modalWindow
            .locator('.search-yui-kit__input')
            .nth(0);
        await searchTable.fill(nameBuyer);

        expect(await searchTable.inputValue()).toBe(nameBuyer);
        await searchTable.press("Enter");

    })

    await allure.step(
        "Step 29: Choice product in modal window",
        async () => {
            await page.locator('.modal-yui-kit__modal-content h3', { hasText: 'Компании' }).hover()

            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0)
        })

    await allure.step(
        "Step 30: Click on the Select button on modal window",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                " Добавить ",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );


    await allure.step(
        "Step 31: We change the quantity of the ordered product",
        async () => {
            const locator = '.input-yui-kit.initial.medium.add-order-component__input.initial';
            await loadingTaskPage.checkOrderQuantity(locator, "1", quantityInOrder);

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

    await allure.step(
        "Step 32: Click on the save order button",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                "Сохранить",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );

    await allure.step(
        "Step 33: Checking the ordered quantity",
        async () => {
            await page.waitForTimeout(3000)
            orderNumber = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component')
            console.log("orderNumber: ", orderNumber)
        }
    );

    await allure.step('Step 34: We check that the table contains a row with the variable name', async () => {
        // После добавления второго изделия (i = 1)
        const rows = await page.locator(`${mainTable} tbody tr`).all();
        expect(rows.length).toBe(2);
        expect((await rows[0].locator('td').nth(4).textContent())?.trim()).toContain(arrayIzd[0].name);
        expect((await rows[1].locator('td').nth(4).textContent())?.trim()).toContain(arrayIzd[1].name);
    })

    await allure.step('Step 35: Click on the add a new product order', async () => {
        await loadingTaskPage.clickButton(
            " Добавить новое изделие к заказу ",
            '.button-yui-kit.medium.outline-yui-kit.editor-buttons__button'
        );
        await page.waitForLoadState('networkidle')
    })

    await allure.step("Step 36: Click on the Select button", async () => {
        await page.waitForTimeout(1000);
        // Click on the button
        await page.locator('.button-yui-kit ', { hasText: ' Выбрать ' }).nth(0).click()

        await page.waitForTimeout(1000);
    });



    await allure.step(
        "Step 37: Search product on modal window",
        async () => {
            const modalWindow = await page.locator('.modal-yui-kit__modal-content')
            // Using table search we look for the value of the variable
            await expect(modalWindow).toBeVisible();

            const searchTable = modalWindow
                .locator('.search-yui-kit__input')
                .nth(0);
            await searchTable.fill(arrayIzd[2].name);

            expect(await searchTable.inputValue()).toBe(arrayIzd[2].name);
            await searchTable.press("Enter");

            await page.waitForTimeout(1000);
        }
    );

    await allure.step(
        "Step 38: Choice product in modal window",
        async () => {
            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0)

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

    await allure.step(
        "Step 39: Click on the Select button on modal window",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                " Добавить ",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );

    await allure.step("Step 40: Checking the selected product", async () => {
        // Check that the selected product displays the expected product
        await loadingTaskPage.checkProduct(arrayIzd[2].name);
        await loadingTaskPage.waitForTimeout(500)
    });

    await allure.step("Step 41: Selecting a buyer", async () => {
        const button = page.locator('.button-yui-kit.medium.primary-yui-kit', { hasText: 'Выбрать' }).nth(1);
        await expect(button).toHaveText('Выбрать');
        await expect(button).toBeVisible();

        await button.click()
        // Wait for loading
        await page.waitForLoadState("networkidle");
    });

    await allure.step('Step 42: Check modal window Company', async () => {
        const modalWindow = await page.locator('.modal-yui-kit__modal-content')
        // Using table search we look for the value of the variable
        await expect(modalWindow).toBeVisible();

        const searchTable = modalWindow
            .locator('.search-yui-kit__input')
            .nth(0);
        await searchTable.fill(nameBuyer);

        expect(await searchTable.inputValue()).toBe(nameBuyer);
        await searchTable.press("Enter");

    })

    await allure.step(
        "Step 42: Choice product in modal window",
        async () => {
            await page.locator('.modal-yui-kit__modal-content h3', { hasText: 'Компании' }).hover()

            await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0)
        })

    await allure.step(
        "Step 43: Click on the Select button on modal window",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                " Добавить ",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );


    await allure.step(
        "Step 44: We change the quantity of the ordered product",
        async () => {
            const locator = '.input-yui-kit.initial.medium.add-order-component__input.initial';
            await loadingTaskPage.checkOrderQuantity(locator, "1", quantityInOrder);

            await loadingTaskPage.waitForTimeout(1000)
        }
    );

    await allure.step(
        "Step 45: Click on the save order button",
        async () => {
            // Click on the button
            await loadingTaskPage.clickButton(
                "Сохранить",
                '.button-yui-kit.medium.primary-yui-kit'
            );
        }
    );

    await allure.step(
        "Step 46: Checking the ordered quantity",
        async () => {
            await page.waitForTimeout(3000)
            orderNumber = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component')
            console.log("orderNumber: ", orderNumber)
        }
    );

    await allure.step('Step 47: We check that the table contains a row with the variable name', async () => {
        await page.waitForLoadState('networkidle')
        // После добавления второго изделия (i = 1)
        const rows = await page.locator(`${mainTable} tbody tr`).all();
        expect(rows.length).toBeGreaterThan(2);
        expect((await rows[0].locator('td').nth(4).textContent())?.trim()).toContain(arrayIzd[0].name);
        expect((await rows[1].locator('td').nth(4).textContent())?.trim()).toContain(arrayIzd[1].name);
        expect((await rows[2].locator('td').nth(4).textContent())?.trim()).toContain(arrayIzd[2].name);
    })
});

test("Test Case 05 - Checking the tasks for shipment", async ({ page }) => {
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    test.setTimeout(50000);
    await allure.step('Step 01: Open the shipment task page', async () => {
        // Go to the Shipping tasks page
        await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

        // Wait for loading
        await page.waitForLoadState("networkidle");
    })

    // Using table search we look for the value of the variable
    if (arrayIzd.length === 0) {
        throw new Error('Массив пустой.')
    } else {
        for (const Izd of arrayIzd) {

            await allure.step("Step 02: Search product", async () => {

                const searchTable = page
                    .locator('.search-yui-kit__input')
                    .nth(1);
                await searchTable.fill(Izd.name);

                expect(await searchTable.inputValue()).toBe(Izd.name);
                await searchTable.press("Enter");

                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(4000)
            });

            // Check if there are any rows in the table after search
            const rows = await page.locator(`${mainTable} tbody tr`).all();

            if (rows.length === 0) {
                console.log(`No orders found for product "${Izd.name}". Continuing with next product...`);
                continue;
            }

            await allure.step("Step 03: Check table rows and calculate sum", async () => {
                let totalSum = 0;

                // Iterate through each row
                for (const row of rows) {
                    // Get the first cell (product name) to verify it contains the search term
                    const firstCell = await row.locator('td').nth(4).textContent();
                    expect(firstCell).toContain(Izd.name);

                    // Get the sixth cell value and add to total
                    const sixthCell = await row.locator('td').nth(5).textContent();
                    if (sixthCell) {
                        const value = parseFloat(sixthCell.replace(/\s/g, '').replace(',', '.'));
                        if (!isNaN(value)) {
                            totalSum += value;
                        }
                    }
                }

                // Save the sum to the corresponding product in arrayIzd
                const productIndex = arrayIzd.findIndex(item => item.name === Izd.name);
                if (productIndex !== -1) {
                    arrayIzd[productIndex].quantityInOrders = totalSum;
                }

                console.log(`Total sum for ${Izd.name}: ${totalSum}`);
            });

        }
    }
})

test('Test Case 06 - Checking for changes in product shortages', async ({ page }) => {
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

    // Using table search we look for the value of the variable
    if (arrayIzd.length === 0) {
        throw new Error('Массив пустой.')
    } else {
        for (const Izd of arrayIzd) {
            await allure.step("Step 03: Search product", async () => {
                // Using table search we look for the value of the variable
                await shortageProduct.searchTable(Izd.name, deficitTable);

                await page.waitForTimeout(500)
            });

            const rows = await page.locator(`${deficitTable} tbody tr`).all();

            if (rows.length === 0) {
                console.log(`No orders found for product "${Izd.name}". Continuing with next product...`);
                continue;
            }

            let demandForOrders: any

            // Iterate through each row
            for (const row of rows) {
                await allure.step("Step 04: Check that the first row of the table is the name of the variable", async () => {
                    const numberColumnNameIzd = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableSubHeader-Name"
                    );

                    // Get the first cell (product name) to verify it contains the search term
                    const firstCell = await row.locator('td').nth(numberColumnNameIzd).textContent();
                    expect(firstCell).toContain(Izd.name);
                    console.log(`Имя изделия из ячейки: ${firstCell}`)

                })

                await allure.step("Step 05: Проверка значения в ячейки потребность по заказам", async () => {
                    const numberColumn = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableHeader-Need"
                    );
                    // Get the sixth cell value and add to total
                    demandForOrders = await row.locator('td').nth(numberColumn).textContent();

                    const productIndex = arrayIzd.findIndex(item => item.name === Izd.name);
                    if (productIndex !== -1) {
                        arrayIzd[productIndex].demandForOrders = +demandForOrders;
                    }

                    console.log(`Total sum for ${Izd.name}: ${demandForOrders} == ${Izd.demandForOrders}`);
                    expect(Izd.quantityInOrders).toBe(Izd.demandForOrders)
                })

                await allure.step("Step 06: Сравниваем значение в ячейки остатки склада", async () => {
                    const numberColumnStock = await shortageProduct.findColumn(
                        page,
                        tableMain,
                        "DeficitIzd-ScrollTable-TableHeader-Remainder"
                    );

                    const quantityStock = await row.locator('td').nth(numberColumnStock).textContent();

                    expect(Number(quantityStock)).toBe(Izd.stock)
                })
            }
        }
    }
}
)

test('Test Case 07 - Deleting customer orders', async ({ page }) => {
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const loadingTaskTable = '.shipments-content';

    await allure.step('Step 01: Open the shipment task page', async () => {
        // Go to the Shipping tasks page
        await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

        // Wait for loading
        await page.waitForLoadState("networkidle");
    })

    if (arrayIzd.length === 0) {
        throw new Error('Массив пустой.')
    } else {
        for (const Izd of arrayIzd) {

            await allure.step("Step 04: Search product", async () => {

                const searchTable = page
                    .locator('.search-yui-kit__input')
                    .nth(1);
                await searchTable.fill(Izd.name);

                expect(await searchTable.inputValue()).toBe(Izd.name);
                await searchTable.press("Enter");

                await page.waitForTimeout(3000)
            });

            // Check if there are any rows in the table after search
            const rows = await page.locator(`${mainTable} tbody tr`).all();

            if (rows.length === 0) {
                console.log(`No orders found for product "${Izd.name}". Continuing with next product...`);
                continue;
            }

            await allure.step("Step 05: Check table rows and calculate sum", async () => {
                let totalSum = 0;

                // Iterate through each row
                for (const row of rows) {
                    // Get the first cell (product name) to verify it contains the search term
                    const firstCell = await row.locator('td').nth(4).textContent();
                    expect(firstCell).toContain(Izd.name);

                    // Click on the first cell of the row
                    const orderNumber = await row.locator('td').nth(2).textContent()
                    await row.locator('td').nth(1).click();

                    // Wait a bit after clicking the row
                    await page.waitForTimeout(1000);

                    // Click the Archive button and wait for it to be visible
                    const archiveButton = page.locator('.button-yui-kit.small.primary-yui-kit', { hasText: 'Архив' });
                    await archiveButton.click();

                    // Wait for any confirmation dialog to appear with increased timeout
                    const dialog = page.locator('[data-testid="Dialog-Content"]')
                        .filter({ hasText: `Вы уверены, что хотите перенести в архив "${orderNumber}"?` })
                        .first();

                    // Make sure the dialog is fully loaded
                    await page.waitForTimeout(1000);

                    // Click the confirmation button (Да)
                    const confirmButton = dialog.locator('.button-yui-kit.small.primary-yui-kit', { hasText: 'Да' });
                    await confirmButton.click();

                    // Wait for the table to update
                    await page.waitForLoadState('networkidle');
                }
            });
        }
    }
})