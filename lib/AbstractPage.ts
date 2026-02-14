import { Page, APIRequestContext } from '@playwright/test';
import logger from './utils/logger';
import { ENV, SELECTORS } from '../config'; // Assuming there's a config file for configuration

/**
 * AbstractPage serves as a base class for other page objects to inherit from.
 * It contains the common functionality for interacting with web pages.
 */
export abstract class AbstractPage {
    protected page: Page;

    /**
     * Initializes the page object with a Playwright page instance.
     * @param page - Экземпляр Playwright Page для взаимодействия с браузером.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Abstract method for opening a page URL. 
     * This must be implemented by subclasses that inherit from AbstractPage.
     * @param url - URL для открытия.
     
    abstract open(url: string): Promise<void>;
    */
 
}
