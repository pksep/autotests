import { Page, expect } from "@playwright/test";
import { PageObject, Click } from "../lib/Page";
import logger from "../lib/logger";
import { table } from "console";

export enum StockReceipt {
    metalworking = "Металлообработка",
    cbed = "Сборка",
    suppler = "Поставщик",
}

// Страница: Приход на склад от поставщиков и производства
export class CreateStockReceiptFromSupplierAndProductionPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    /**  Выбираем поставщика и проверяем, что отображается выбранный тип поставщика
     * @param supplier - Выбираем от кого ожидаем посутпление
     */
    async selectStockReceipt(stockReceipt: StockReceipt) {
        const typeOperations = await this.page.$$(".type-operation");
        for (const typeOperation of typeOperations) {
            const nameOperation = (await typeOperation.textContent())!.trim();

            if (nameOperation === stockReceipt) {
                console.log(`Операция ${nameOperation} выбрана.`);
                await typeOperation.click();
                break;
            }
        }

        // Заголовко Поставщик:
        const headerSuppler = await this.page
            .locator(
                '[data-testid="ModalComing-IncomingReceipt-ProviderLabel"]'
            )
            .textContent();
        console.log(`Проверка заголовка поставщиков ${headerSuppler}`);
        expect(headerSuppler?.trim()).toBe("Поставщик:");

        // Проверка выбранного поставщика
        const selectSuppler = await this.page
            .locator(
                '[data-testid="ModalComing-IncomingReceipt-TypeComingDisplay"]'
            )
            .textContent();

        console.log(`Поставщик: ${selectSuppler}`);
        if ((await selectSuppler) == "Сборки") {
            return selectSuppler as "Сборка";
        }
        expect(selectSuppler).toBe(stockReceipt);

        await this.clickButton(
            " Изменить выбор ",
            '[data-testid="ModalComing-IncomingReceipt-ChangeSelectionButton"]',
            Click.No
        );
        await this.clickButton(
            " Отменить ",
            '[data-testid="ModalComing-DocumentAttachment-CancelButton"]',
            Click.No
        );
        await this.clickButton(
            " Печать ",
            '[data-testid="ModalComing-DocumentAttachment-PrintButton"]',
            Click.No
        );
        await this.clickButton(
            " Создать приход ",
            '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]',
            Click.No
        );
    }

    async inputQuantityInCell(quantity: string) {
        const tableStockReciep = await this.page.locator(
            '[data-testid="ModalComingTable-TableScroll"]'
        );
        const tableStockRecieptInput = await tableStockReciep.locator(
            '[type="number"]'
        );
        await tableStockRecieptInput.fill(quantity);
        expect(await tableStockRecieptInput.inputValue()).toBe(quantity);
        await tableStockRecieptInput.press("Enter");
    }
}
