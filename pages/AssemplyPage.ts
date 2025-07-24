import { Page, Locator, expect } from "@playwright/test";
import { PageObject } from "../lib/Page";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
import { allure } from 'allure-playwright';

// Страница: Сборка
export class CreateAssemblyPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }
}
