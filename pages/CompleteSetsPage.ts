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
            '[data-testid="ModalComplectKit-RightContent"]'
        );

        expect(await modalWindow).toBeVisible();
        expect(
            await modalWindow.locator(
                '[data-testid="ModalComplectKit-AssemblyName"]'
            )
        ).toContainText(name);
        expect(
            await modalWindow.locator(
                '[data-testid="ModalComplectKit-AssemblyDesignation"]'
            )
        ).toContainText(designation);
    }
}
