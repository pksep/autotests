import { expect, Page } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { exec } from "child_process";
import { time } from "console";
import exp from "constants";

// Страница:  Ревизия
export class CreateRevisionPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    async changeWarehouseBalances(quantity: string) {
        await this.page.locator('[data-testid="TableRevisionPagination-EditPen"]').fill(quantity)
        await this.page.locator('[data-testid="TableRevisionPagination-EditPen"]').press('Enter')
    }

    async checkWarehouseBalances(quantity: string) {
        const checkBalance = await this.page.locator('[data-testid="TableRevisionPagination-TableData-Current"]').textContent()
        expect(checkBalance).toBe(quantity)
    }
}

