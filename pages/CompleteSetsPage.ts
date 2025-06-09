import { expect, Page } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { exec } from "child_process";
import { time } from "console";
import exp from "constants";

// Страница:  Скомплектованные наборы
export class CreateCompleteSetsPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    async disassemblyModalWindow(name: string, designation: string) {
        const modalWindow = this.page.locator(
            '[data-testid="ModalUncomplectKit-RightContent"]'
        );

        await expect(modalWindow).toBeVisible();
        await expect(
            modalWindow.locator(
                '[data-testid="ModalUncomplectKit-AssemblyName"]'
            )
        ).toContainText(name);
        await expect(
            modalWindow.locator(
                '[data-testid="ModalUncomplectKit-AssemblyDesignation"]'
            )
        ).toContainText(designation);
        await expect(
            modalWindow.locator("h3", {
                hasText: " Скомплектованные наборы ",
            })
        ).toBeVisible();
    }

    /** Checks and enters the quantity in the disassembly modal window
     * @param quantity - checks that the input has this value
     * @param quantityOrder - if this parameter is specified, enters this value in the input field
     */
    async checkDisassemblyQuantity(
        locator: string,
        qunatity: string,
        qunatityOrder?: string
    ) {
        const modalWindowLaunchIntoProduction = this.page.locator(locator);
        if (qunatityOrder) {
            await modalWindowLaunchIntoProduction
                .locator("input")
                .fill(qunatityOrder);
            expect(
                await modalWindowLaunchIntoProduction
                    .locator("input")
                    .inputValue()
            ).toBe(qunatityOrder);
        }
        if (!qunatityOrder) {
            expect(
                await modalWindowLaunchIntoProduction
                    .locator("input")
                    .inputValue()
            ).toBe(qunatity);
        }
    }
}
