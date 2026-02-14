import { Page } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/utils/logger";

// Страница: Сборка
export class CreateAssemblyPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }
}
