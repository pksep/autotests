import { expect, Page, Locator } from "@playwright/test";
import { PageObject, ISpetificationData } from "../lib/Page";
import logger from "../lib/logger";
import { exec } from "child_process";
import { time } from "console";

// Страница: Задачи на отгрузку
export class CreateLoadingTaskPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    //  Выделить в таблице
    // async choiceProductInModal(nameProduct: string) {
    //     const firstRowCells = this.page.locator(
    //         '[data-testid="BasePaginationTable-TableBody-Dynamic"]:first-child td'
    //     );

    //     const cells = await firstRowCells.allInnerTexts();

    //     const index = cells.findIndex((cellText) =>
    //         cellText.includes(nameProduct)
    //     );

    //     if (index !== -1) {
    //         await firstRowCells.nth(index).click();
    //     } else {
    //         throw new Error(
    //             `Продукт "${nameProduct}" не найден в первой строке таблицы.`
    //         );
    //     }
    // }
    //  Выделить в таблице
    async choiceProductInModal(nameProduct: string) {
        // Получаем все ячейки из второго tbody (пропускаем первый tbody с поиском)
        const secondTbodyRows = this.page.locator('[data-testid="BasePaginationTable-TableBody-Dynamic"] tr');
        const firstRow = secondTbodyRows.first();
        const cells = firstRow.locator('td');

        // Получаем тексты всех ячеек первой строки
        const cellTexts = await cells.allInnerTexts();

        // Ищем индекс ячейки, содержащей искомый текст
        const index = cellTexts.findIndex(text => text.includes(nameProduct));

        if (index !== -1) {
            // Кликаем по найденной ячейке
            await cells.nth(index).click();
        } else {
            throw new Error(`Продукт "${nameProduct}" не найден в первой строке таблицы.`);
        }
    }

    // TEST
    async clickFromFirstRow(
        locator: string,
        cellIndex: number
    ) {
        const rows = await this.page.locator(`${locator} tr`);

        const rowCount = await rows.count();
        if (rowCount === 0) {
            throw new Error("В таблице нет строк.");
        }

        const firstRow = rows.nth(0);

        const cells = await firstRow.locator("td").allInnerTexts();

        if (cellIndex < 0 || cellIndex > cells.length) {
            throw new Error(
                `Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`
            );
        }

        const valueInCell = cells[cellIndex];

        logger.info(
            `Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`
        );
        await firstRow.locator("td").nth(cellIndex).click();
        logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
        return valueInCell;
    }


    // Проверить, что выбранное изделие отображается
    async checkProduct(nameProduct: string) {
        const product = this.page
            .locator('[data-testid="AddAddOrder-SelectProductLink"]')
            .textContent();
        expect(await product).toBe(nameProduct);
    }

    // Выбрать покупателя
    async choiceBuyer(number: string) {
        const dropdownBuyer = this.page.locator(".buyer_select");
        expect(await dropdownBuyer.locator("option").count()).toBeGreaterThan(
            0
        );
        await expect(dropdownBuyer).toBeVisible();

        await dropdownBuyer.selectOption(number);
    }

    async getDateFromTableByName(variableName: string): Promise<string | null> {
        const firstRow = this.page.locator("table tr:first-child");

        const cells = await firstRow.locator("td").allInnerTexts(); // Получаем текст всех ячеек
        console.log("Cells:", cells); // Отладочное сообщение

        for (let i = 0; i < cells.length; i++) {
            console.log(`Checking cell: ${cells[i].trim()}`); // Отладочное сообщение
            if (cells[i].trim() === " X ") {
                const dateInput = await firstRow
                    .locator(`[data-testid="DatePicter-DatePicker-Input"]`)
                    .nth(i); // Получаем соответствующий input
                if ((await dateInput.count()) > 0) {
                    const value = await dateInput.getAttribute("value");
                    console.log("Found date:", value); // Отладочное сообщение
                    return value; // Возвращаем значение из атрибута value
                }
            }
        }

        return null; // Если имя не найдено или input не найден
    }

    async getOrderInfoFromLocator(locator: string) {
        const text = await this.page.locator(locator).innerText();

        const regex = /Изменить заказ № (\d+-\d+) от (\d{2}\.\d{2}\.\d{4})/;
        const matches = text.match(regex);

        if (matches) {
            return {
                orderNumber: matches[1],
                orderDate: matches[2]
            };
        }

        throw new Error('Не удалось извлечь информацию о заказе');
    }
}
