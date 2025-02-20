/**
 * @file Button.ts
 * @date 2025-01-20
 * @author Robert Joyce
 * @purpose To encapsulate the functionality of interacting with buttons on the web page.
 * 
 * @usage
 * 1. Instantiate the `Button` class with the `page` instance from Playwright:
 *    const button = new Button(page);
 * 2. Use the `clickButton` method to click a button by passing a valid CSS selector:
 *    await button.clickButton('button.submit');
 * 3. This class is designed for reusable button-clicking logic in Playwright-based tests.
 *
 * @alterations
 * - 2025-01-20: Initial version to handle button clicks with error handling.
 */

import { Page } from '@playwright/test'; // Import the Page class from Playwright for handling page interactions

/**
 * Button class provides methods to interact with buttons on the web page.
 * It includes functionality to click a button and handle errors during the interaction.
 */
export class Button {
    private page: Page; // Declare a private property to hold the Playwright page instance

    /**
     * Constructor to initialize the Button class with a Playwright page instance.
     * @param page - The Playwright Page instance used to interact with the browser.
     */
    constructor(page: Page) {
        this.page = page; // Assign the page instance to the class property
    }

    /**
     * Clicks a button identified by the provided selector.
     * Logs an error and throws it if the click action fails.
     * @param selector - The selector string for the button to click.
     * @throws Error if there is an issue with clicking the button.
     */
    async clickButton(selector: string): Promise<void> {
        try {
            await this.page.click(selector); // Attempt to click the button using the provided selector
        } catch (error) {
            console.error(`Error clicking button with selector: ${selector}`, error); // Log the error to the console
            throw error; // Rethrow the error for further handling
        }
    }
}
