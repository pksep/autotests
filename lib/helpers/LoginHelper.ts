/**
 * @file LoginHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for login operations extracted from Page.ts
 *
 * This helper handles:
 * - Filling login forms
 * - Handling different login form versions
 */

import { Page, expect } from '@playwright/test';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import logger from '../utils/logger';

export class LoginHelper {
  constructor(private page: Page) {}

  /**
   * Fills the login form with the provided credentials
   * @param page - The Playwright page instance
   * @param tabel - The table number to select
   * @param login - The login/initial value to select
   * @param password - The password to fill
   */
  async fillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    // Step 2: Wait for and select the "tabel" option
    try {
      await page.waitForSelector('select[data-testid="Authorization-Form-SelectTabel"]', { state: 'visible', timeout: 100000 });
      logger.info('Select element found and visible.');
    } catch (error) {
      logger.error('Error waiting for select element:', error);
      throw error; // Rethrow the error after logging
    }

    // Wait for and select the "tabel" option
    //await this.page.waitForLoadState('networkidle');
    //await page.waitForSelector(
    // 'select[data-testid="Authorization-Form-SelectTabel"]',
    // { state: 'visible' }
    //);

    const tableSelectElement = await page.$('select[data-testid="Authorization-Form-SelectTabel"]');
    if (!tableSelectElement) {
      throw new Error('Select element with name "tabel" not found');
    }
    await tableSelectElement.selectOption({ value: tabel });

    // Wait for and select the "initial" option
    await page.waitForSelector('select[data-testid="Authorization-Form-SelectInitial"]', { state: 'visible' });
    const initialSelectElement = await page.$('select[data-testid="Authorization-Form-SelectInitial"]');
    if (!initialSelectElement) {
      throw new Error('Select element with name "initial" not found');
    }
    await initialSelectElement.selectOption({ value: login });

    // Wait for and fill the password input
    await page.waitForSelector('input[data-testid="Authorization-Form-InputPassword"]', { state: 'visible' });
    const passwordInputElement = await page.$('input[data-testid="Authorization-Form-InputPassword"]');
    if (!passwordInputElement) {
      throw new Error('Password input field not found');
    }
    await passwordInputElement.fill(password);

    // Optionally, log the HTML to confirm it was set correctly
    const html = await page.evaluate(el => el.outerHTML, passwordInputElement);

    // Pause the page for inspection (you can remove this in production)
  }

  /**
   * New version of fillLoginForm using updated selectors
   * @param page - The Playwright page instance
   * @param tabel - The table number to select
   * @param login - The login value to fill
   * @param password - The password to fill
   */
  async newFillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      await page.waitForLoadState('load', { timeout: WAIT_TIMEOUTS.LONG });
      await page.waitForTimeout(500);

      // Step 1: Fill "Табельный номер" field (combobox has disable-open until tabels are loaded)
      const tabelInput = page.locator('[data-testid="LoginForm-TabelNumber-Combobox-Input"]');
      await tabelInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('Табельный номер field is visible.');
      
      const optionsList = page.locator('[data-testid="LoginForm-TabelNumber-Combobox-OptionsList"]');
      const targetOption = optionsList.locator(`text="${tabel}"`).first();

      // Repeatedly try to open the combobox until the option appears
      // This handles slow data loading and the "disable-open" attribute
      await expect(async () => {
        await tabelInput.click();
        await page.waitForTimeout(TIMEOUTS.SHORT);
        
        if (!(await optionsList.isVisible())) {
          await tabelInput.focus();
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(TIMEOUTS.SHORT);
        }
        
        await expect(targetOption).toBeAttached({ timeout: 1000 });
        await expect(targetOption).toBeVisible({ timeout: 1000 });
      }).toPass({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });

      await targetOption.click();
      logger.log(`Табельный номер set to: ${tabel}`);

      // Step 2: Fill "Логин" field
      await page.waitForSelector('[data-testid="LoginForm-Login-Combobox-Input"]', { state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('Логин field is visible.');
      await page.fill('[data-testid="LoginForm-Login-Combobox-Input"]', login);
      logger.log(`Логин set to: ${login}`);

      // Ensure login selection is applied
      await page.waitForTimeout(500);

      // Step 3: Fill "Пароль" field
      logger.log('Waiting for password field...');
      await page.waitForSelector('[data-testid="Password-Inputs-Input-Input"]', { state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('Password field is visible.');
      await page.fill('[data-testid="Password-Inputs-Input-Input"]', password);
      logger.log('Password filled successfully.');

      logger.log('Form filled successfully!');
    } catch (error) {
      console.error('Error filling the login form:', error);
      throw error;
    }
  }
}
