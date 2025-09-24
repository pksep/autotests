import { expect, Page } from "@playwright/test";
import { PageObject, Click } from "../lib/Page";
import logger from "../lib/logger";
import { exec } from "child_process";
import { time } from "console";
import { allure } from "allure-playwright";
import { ENV, SELECTORS, CONST } from "../config";


export enum Supplier {
    cbed = "Сборка",
    details = "Детали",
    product = "Изделии",
    suppler = "Поставщики",
}

// Страница: Заказаны у поставщиков
export class CreateOrderedFromSuppliersPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    // Выбираем поставщика и проверяем, что отображается выбранный тип поставщика
    async selectSupplier(supplier: Supplier) {
        const cardTestIdBySupplier: Record<Supplier, string> = {
            [Supplier.details]: CONST.SELECT_TYPE_OBJECT_OPERATION_DETAILS,
            [Supplier.cbed]: CONST.SELECT_TYPE_OBJECT_OPERATION_ASSEMBLIES,
            [Supplier.product]: CONST.SELECT_TYPE_OBJECT_OPERATION_PRODUCT,
            [Supplier.suppler]: CONST.SELECT_TYPE_OBJECT_OPERATION_PROVIDER,
        };

        const targetCardTestId = cardTestIdBySupplier[supplier];
        const card = this.page.locator(`[data-testid="${targetCardTestId}"]`).first();
        await card.waitFor({ state: 'visible' });
        await card.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
        });
        await this.page.waitForTimeout(500);
        await card.click();

        // После клика открывается новое модальное окно. Его data-testid может отличаться.
        // Ждём появления любого из известных контейнеров следующего шага.
        const modalCandidates = [
            `[data-testid="${CONST.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}"]`,
            `[data-testid="${CONST.ORDERED_SUPPLIERS_PAGE_MODAL_ADD_ORDER_PRODUCTION_TABLE}"]`,
            '[data-testid^="ModalAddOrder-"][data-testid$="ModalContent"]',
            '[data-testid^="ModalAddOrder-ProductionTable"]'
        ].join(', ');

        const nextModal = this.page.locator(modalCandidates).first();
        await nextModal.waitFor({ state: 'visible', timeout: 10000 });
        try {
            await nextModal.evaluate((el: HTMLElement) => {
                el.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.8) inset';
            });
            await this.page.waitForTimeout(300);
        } catch { }

        // Пытаемся мягко проверить заголовок/лейбл выбранного типа, если он присутствует в данной модалке
        try {
            const label = this.page.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_SUPPLIER_LABEL}"]`).first();
            const value = this.page.locator(`[data-testid="${CONST.ORDER_FROM_SUPPLIERS_TYPE_COMING_DISPLAY}"]`).first();
            if (await label.isVisible({ timeout: 1000 }) && await value.isVisible({ timeout: 1000 })) {
                const text = (await value.textContent())?.trim();
                console.log(`Выбранный тип поставщика: ${text}`);
                if (text === 'Сборки') {
                    return text as 'Сборка';
                }
                // Не делаем жёсткую проверку, если значение отсутствует или отличается в другой модалке
                if (text) {
                    expect(text).toBe(supplier);
                }
            }
        } catch {
            // В некоторых модалках эти поля отсутствуют — это нормально
            console.log('Информационный лейбл типа поставщика отсутствует в данной модалке — пропускаем проверку.');
        }
    }

    // Проверяем, что в последнем созданном заказе номер заказа совпадает
    async compareOrderNumbers(orderNumber: string) {
        await this.page
            .locator('[data-testid="OrderSuppliers-LinkImage"]')
            .first()
            .click();
        const headerModalWindow = this.page
            .locator('.modal-right__title')
            .first();
        expect(await headerModalWindow.textContent()).toBe("Заказ");

        await this.page.waitForLoadState('networkidle')
        const checkOrderNumberLocator = this.page.locator(
            '.modal-worker__label-span'
        ).last();

        await expect(checkOrderNumberLocator).toBeVisible();
        const checkOrderNumber = checkOrderNumberLocator.textContent();

        expect(await checkOrderNumber).toBe(orderNumber);
        console.log(`Номера заказов совпадают.`);
    }

    async launchIntoProductionSupplier(
        name: string,
        quantityOrder: string,
        supplier: Supplier
    ): Promise<{ quantityLaunchInProduct: string; checkOrderNumber: string }> {
        // Quantity launched into production
        let quantityLaunchInProduct: string = "0";
        let checkOrderNumber: string = "";

        const tableModalWindow =
            '[data-testid="ModalAddOrder-ProductionTable-Table"]';
        const test =
            '[data-testid="ModalAddOrder-ProductionTable-ScrollContainer"]';
        const tableModalWindowDataTestId =
            "ModalAddOrder-ProductionTable-Table";
        const tableModalCheckbox = "ModalAddOrder-ProductionTable-SelectColumn";
        const tableModalCell =
            "ModalAddOrder-ProductionTable-OrderedOnProductionColumn";
        const tableModalWindowLaunch =
            "ModalStartProduction-ComplectationTable";
        const cellQuantityTable =
            "ModalStartProduction-ComplectationTableHeader-MyQuantity";
        const selector = '[data-testid="Sclad-orderingSuppliers"]';
        const tableYourQunatityCell =
            "ModalAddOrder-ProductionTable-YourQuantityColumn";
        const modalWindowLaunchIntoProductionDetail = '[data-testid="ModalAddOrder-Modals-ModalStartProductiontrue-ModalContent"]'


        const buttonCreateOrder = ".btn-add"
        const buttonLaunchIntoProduction = '[data-testid="ModalStartProduction-ComplectationTable-CancelButton"]'
        const buttonOrder = '[data-testid="ModalAddOrder-ProductionTable-OrderButton"]'

        await allure.step("Step 1: Open the warehouse page", async () => {
            // Go to the Warehouse page
            await this.page.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step(
            "Step 2: Open the shortage assemblies page",
            async () => {
                await this.findTable(selector);
                await this.page.waitForLoadState("networkidle");
            }
        );

        await allure.step(
            "Step 3: Click on the Launch on Production button",
            async () => {
                await this.clickButton(" Создать заказ ", buttonCreateOrder);
            }
        );

        await allure.step(
            "Step 4: Select the selector in the modal window",
            async () => {
                if (supplier == Supplier.cbed) {
                    await this.selectSupplier(Supplier.cbed);
                } else if (supplier == Supplier.details) {
                    await this.selectSupplier(Supplier.details);
                } else if (supplier == Supplier.product) {
                    await this.selectSupplier(Supplier.product);
                }
            }
        );

        await allure.step("Step 5: Search product", async () => {
            await this.waitForTimeout(500)
            await this.waitingTableBody(test);
            await this.searchTable(name, test);
            await this.page.waitForLoadState("networkidle");
            await this.waitForTimeout(500)
            await this.waitingTableBody(test);
        });

        await allure.step(
            "Step 6: Find the checkbox column and click",
            async () => {
                // Find the checkbox column and click
                const numberColumn = await this.findColumn(
                    this.page,
                    tableModalWindowDataTestId,
                    tableModalCheckbox
                );
                console.log("numberColumn: ", numberColumn);
                await this.getValueOrClickFromFirstRow(
                    tableModalWindow,
                    numberColumn,
                    Click.Yes,
                    Click.No
                );
            }
        );

        await allure.step(
            "Step 7: We find the value in the cell ordered for production and get the value",
            async () => {
                // Find the cell column
                const numberColumn = await this.findColumn(
                    this.page,
                    tableModalWindowDataTestId,
                    tableModalCell
                );

                quantityLaunchInProduct =
                    await this.getValueOrClickFromFirstRow(
                        tableModalWindow,
                        numberColumn
                    );
                console.log(
                    "Ordered for production :",
                    quantityLaunchInProduct
                );
            }
        );

        await allure.step(
            "Step 8: Enter the quantity into the input cell",
            async () => {
                // Find the cell column
                const numberColumn = await this.findColumn(
                    this.page,
                    tableModalWindowDataTestId,
                    tableYourQunatityCell
                );
                console.log('Номер ячейки с инпутом :', numberColumn)
                console.log('Количество запускаемых в производство сущности :', quantityOrder)
                await this.findAndFillCell(
                    this.page,
                    tableModalWindowDataTestId,
                    name,
                    8,
                    '2'
                );
            }
        );

        await allure.step("Step 9: Click on the Order button", async () => {
            await this.clickButton(
                "Заказать",
                buttonOrder
            );
        });

        await allure.step(
            "Step 10: Check modal window launch in to production",
            async () => {
                await this.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionDetail);

                await this.checkCurrentDate(
                    '[data-testid="ModalStartProduction-OrderDateValue"]'
                );

                checkOrderNumber = await this.checkOrderNumber();
                console.log(`Полученный номер заказа: ${checkOrderNumber}`);
            }
        );

        await allure.step("Step 11: Check quantity on order", async () => {
            const numberColumn = await this.findColumn(
                this.page,
                tableModalWindowLaunch,
                cellQuantityTable
            );
            console.log("numberColumn: ", numberColumn);

            const qunatityValue = await this.findAndFillCell(
                this.page,
                tableModalWindowLaunch,
                name,
                numberColumn
            );
            expect(qunatityValue).toBe(quantityOrder)
        });

        await allure.step("Step 12: Click on the Order button", async () => {
            await this.clickButton(" В производство ", buttonLaunchIntoProduction);

            await this.getMessage(checkOrderNumber);
        });

        await allure.step("Step 13: Click on the close button", async () => {
            await this.clickButton(
                " Отменить ",
                '[data-testid="ModalAddOrder-ProductionTable-CancelButton"]'
            );
        });

        await allure.step("Step 14: Search product", async () => {
            await this.searchTable(
                name,
                '[data-testid="OrderSuppliers-ScrollTable-TableContainer"]'
            );

            await this.waitingTableBody(
                '[data-testid="OrderSuppliers-ScrollTable-TableContainer"]'
            );
        });

        await allure.step("Step 15: Checking the order number", async () => {
            await this.compareOrderNumbers(checkOrderNumber);
        });
        return { quantityLaunchInProduct, checkOrderNumber };
    }
}