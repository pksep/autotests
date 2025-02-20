/**
 * @file Input.ts
 * @date 2025-01-20
 * @author Robert Joyce
 * @purpose To encapsulate the functionality of interacting with input fields on the web page, including setting values for inputs and text areas.
 * @usage
 * 1. Instantiate the `Input` class with the `page` instance from Playwright:
 *    const inputField = new Input(page);
 * 2. Use the `setInputValue` method to set a value in an input or textarea:
 *    await inputField.setInputValue('input#email', 'user@example.com');
 * 3. The `type` parameter can be 'input' or 'textarea' to specify the type of field.
 * 
 * @alterations
 * - 2025-01-20: Initial version to handle setting input values for input and textarea fields with logging and visibility checks.
 */

import { Page } from '@playwright/test'; // Import the Page class from Playwright for handling page interactions
import { ENV, SELECTORS } from '../config'; // Import environment settings and selector configurations
import logger from '../lib/logger'; // Import the logger utility for logging debug information

/**
 * Input class provides methods to interact with input fields and text areas on the web page.
 * It includes functionality for setting values in both types of fields, with additional logging and visibility checks.
 */
export class Input {
    private page: Page; // Declare a private property to hold the Playwright page instance

    /**
     * Constructor to initialize the Input class with a Playwright page instance.
     * @param page - The Playwright Page instance used to interact with the browser.
     */
    constructor(page: Page) {
        this.page = page; // Assign the page instance to the class property
    }

    /**
     * Sets a value for an input or textarea field, ensuring the field is visible before interacting.
     * Logs the action and provides detailed debug information in the case of the input field type.
     * @param selector - The selector string for the input or textarea element.
     * @param value - The value to set in the input or textarea field.
     * @param type - The type of field to interact with ('input' or 'textarea'). Default is 'input'.
     */
    async setInputValue(selector: string, value: string, type: 'input' | 'textarea' = 'input'): Promise<void> {
        const element = await this.page.locator(selector); // Locate the element based on the provided selector
        
        if (type === 'textarea') {
            await element.fill(value); // If the field is a textarea, fill the value directly
        } else {
            // Ensure the element is visible before filling the value
            if (ENV.DEBUG) {
                logger.info('Input Class: ' + `Attempting to set value for selector: ${selector}`); // Log the selector being used
            }
            await this.page.waitForSelector(selector, { state: 'visible' }); // Wait for the element to be visible
            await element.fill(value); // Fill the input field with the provided value
            if (ENV.DEBUG) {
                logger.info('Input Class: ' + value); // Log the value being filled
                logger.info('Input Class: ' + 'Setting inside input class value...'); // Log that the value was set
            }
        }
    }
}
