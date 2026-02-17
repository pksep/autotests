import { expect, Page } from "@playwright/test";
import { Click, PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { exec } from "child_process";
import { time } from "console";
import exp from "constants";

// Страница:  Склад: Задачи на отгрузку
export class CreateWarehouseTaskForShipmentPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    async shipmentModalWindow() {
        const modalWindow = this.page.locator(
            '[data-testid^="IssueToPull-ShipmentDetails-ModalShComlit"][data-testid$="ModalContent"]'
        );

        await expect(modalWindow).toBeVisible();

        await expect(
            modalWindow.locator("h4", { hasText: "Отгрузка" })
        ).toBeVisible();
        await expect(
            modalWindow.locator("h3", { hasText: "Комплектация" })
        ).toBeVisible();
        await expect(
            modalWindow.locator("h3", { hasText: " Описание/Примечание " })
        ).toBeVisible();
        await expect(modalWindow).toBeVisible();
        await expect(
            modalWindow.locator("h3", { hasText: "Медиа файлы" })
        ).toBeVisible();
        await expect(modalWindow).toBeVisible();


        await this.clickButton(
            " Отменить ",
            '[data-testid="ModalShComlit-Button-Cancel"]',
            Click.No
        );

        await expect(modalWindow.locator("textarea")).toBeVisible();
    }
}
