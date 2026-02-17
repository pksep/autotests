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
        const product = await this.page
            .locator('.attachments-value .link').first()
            .textContent();
        expect(product?.trim()).toBe(nameProduct);
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

        const regex = /(?:Редактирование заказа №| Добавить позицию к заказу №) (\d+-\d+)(?: \/(\d+))? от (\d{2}\.\d{2}\.\d{4})/; const matches = text.match(regex);

        if (matches) {
            return {
                orderNumber: matches[1],
                version: matches[2] || null, // Если версия отсутствует, возвращаем null
                orderDate: matches[3]
            };
        }

        throw new Error('Не удалось извлечь информацию о заказе');
    }

    /** Checks and enters the quantity in the order modal window
     * @param locator - selector for the quantity input field
     * @param quantity - expected value in the input (checked only if quantityOrder is not provided)
     * @param quantityOrder - if specified, enters this value in the input field
     */
    async checkOrderQuantity(
        locator: string,
        quantity: string,
        quantityOrder?: string
    ) {
        const input = this.page.locator(locator).locator("input");

        if (quantityOrder) {
            // Если указано quantityOrder, просто вводим его значение
            await input.fill(quantityOrder);
        } else {
            // Если quantityOrder не указан, проверяем текущее значение с quantity
            const currentValue = await input.inputValue();
            expect(currentValue).toBe(quantity);
        }
    }

    /** Checks if a button is visible and active/inactive
     * @param selector - selector for the button
     * @param expectedState - expected state of the button ('active' or 'inactive')
     * @returns Promise<boolean> - true if button state matches expected, false otherwise
     */
    async checkButtonState(selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
        const button = this.page.locator(selector);

        // Проверяем, что кнопка видима
        await expect(button).toBeVisible();

        // Получаем классы кнопки
        const classes = await button.getAttribute('class');

        if (expectedState === 'active') {
            // Проверяем, что кнопка активна (нет класса disabled-yui-kit)
            return !classes?.includes('disabled-yui-kit');
        } else {
            // Проверяем, что кнопка неактивна (есть класс disabled-yui-kit)
            return classes?.includes('disabled-yui-kit') ?? false;
        }
    }

    async clickFromFirstRowBug(
        locator: string,
        cellIndex: number
    ) {
        const modalWindow = await this.page.locator('.modal-yui-kit__modal-content')
        const rows = await modalWindow.locator(`${locator} tbody tr`);

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
  
    async urgencyDate(month: Month, day: string) {
        await this.page.locator('.date-picker-yui-kit__header-btn').nth(2).click()
        await this.page.locator('.vc-popover-content-wrapper.is-interactive').nth(2).isVisible()

        await this.page.locator('.vc-title-wrapper').click()
        // Находим элемент с годом
        const yearElement = await this.page.locator('.vc-nav-title.vc-focus');
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
                await this.page.locator(arrowSelector).click();
                await this.page.waitForTimeout(500); // Небольшая задержка для обновления

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

        await this.page.locator(`[aria-label="${month}"]`).click()
        await this.page.locator('.vc-day-content.vc-focusable.vc-focus.vc-attr', { hasText: day }).nth(0).click()
    }
}

export enum Month {
    Jan = 'январь',
    Feb = 'февраль',
    Mar = 'март',
    Apr = 'апрель',
    May = 'май',
    Jun = 'июнь',
    Jul = 'июль',
    Aug = 'август',
    Sep = 'сентябрь',
    Oct = 'октябрь',
    Nov = 'ноябрь',
    Dec = 'декабрь'
}