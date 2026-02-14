/**
 * @file ValidationHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for validation and verification operations extracted from Page.ts
 * 
 * This helper handles:
 * - Page header and button validation
 * - Table validation
 * - Button state validation
 * - Checkbox validation
 * - File validation
 * - Search and verification
 */

import { Page, expect, Locator, TestInfo } from '@playwright/test';
import { WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import * as SelectorsFileComponents from '../Constants/SelectorsFileComponents';
import { expectSoftWithScreenshot } from '../utils/utilities';
import logger from '../utils/logger';
import { ModalHelper } from './ModalHelper';

export class ValidationHelper {
  private modalHelper: ModalHelper;

  constructor(private page: Page) {
    this.modalHelper = new ModalHelper(page);
  }

  /**
   * Validates page headings (H3 titles) and buttons on a page.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param titles - Array of expected H3 titles (will be trimmed)
   * @param buttons - Array of button configurations to validate
   * @param containerSelector - CSS class name or data-testid selector to search for H3 titles
   * @param options - Optional configuration:
   *   - skipTitleValidation: If true, skips H3 title validation
   *   - skipButtonValidation: If true, skips button validation
   *   - useModalMethod: If true, uses modal method for H3 titles
   *   - testInfo: TestInfo for screenshots
   */
  async validatePageHeadersAndButtons(
    page: Page,
    titles: string[],
    buttons: Array<{
      class?: string;
      datatestid?: string;
      label: string;
      state?: string | boolean;
    }>,
    containerSelector: string,
    options?: {
      skipTitleValidation?: boolean;
      skipButtonValidation?: boolean;
      useModalMethod?: boolean;
      testInfo?: TestInfo;
    },
  ): Promise<void> {
    // Validate H3 titles
    if (!options?.skipTitleValidation && titles.length > 0) {
      // Wait for the page to stabilize before collecting H3 titles
      await page.waitForLoadState('networkidle');

      const expectedTitles = titles.map(title => title.trim());
      // Use modal method if specified, otherwise use regular method
      let h3Titles = options?.useModalMethod
        ? await this.modalHelper.getAllH3TitlesInModalClassNew(page, containerSelector)
        : await this.modalHelper.getAllH3TitlesInClass(page, containerSelector);

      // If no titles found in container, try searching the entire page body (excluding modals)
      // This handles cases where page-level titles are outside the container
      if (h3Titles.length === 0) {
        logger.log('No H3 titles found in container, searching entire page body (excluding modals)...');
        const pageBody = page.locator('body');
        const allH3Elements = await pageBody.locator('h3').all();

        for (const h3Tag of allH3Elements) {
          try {
            // Check if this H3 is inside any modal/dialog using evaluate
            const isInsideModal = await h3Tag.evaluate(el => {
              // Check for dialog element (HTML5 semantic element)
              if (el.closest('dialog')) return true;
              // Check for role="dialog" attribute
              if (el.closest('[role="dialog"]')) return true;
              // Check for data-testid containing "Modal"
              let parent = el.parentElement;
              while (parent) {
                if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
                  const testId = parent.getAttribute('data-testid');
                  if (testId && testId.includes('Modal')) {
                    return true;
                  }
                }
                parent = parent.parentElement;
              }
              return false;
            });

            // Only include H3 if it's not inside a modal
            if (!isInsideModal) {
              const title = await h3Tag.textContent();
              if (title) {
                h3Titles.push(title.trim());
              }
            }
          } catch (error) {
            // Skip if element is detached or not accessible
            logger.log(`Skipping H3 element due to error: ${error}`);
          }
        }
      }

      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Log for debugging
      logger.log('Expected Titles:', expectedTitles);
      logger.log('Received Titles:', normalizedH3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(expectedTitles.length);
        },
        `Verify H3 titles count: expected ${expectedTitles.length}, actual ${normalizedH3Titles.length}`,
        options?.testInfo,
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(expectedTitles);
        },
        `Verify H3 titles match: expected ${JSON.stringify(expectedTitles)}, actual ${JSON.stringify(normalizedH3Titles)}`,
        options?.testInfo,
      );
    }

    // Validate buttons
    if (!options?.skipButtonValidation && buttons.length > 0) {
      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Iterate over each button in the array
      for (const button of buttons) {
        const buttonLabel = button.label;
        const expectedState = typeof button.state === 'string' ? button.state === 'true' : button.state ?? true;

        // Perform the validation for the button
        const { allure } = await import('allure-playwright');
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          let isButtonReady: boolean;

          // Use isButtonVisibleTestId if datatestid is provided, otherwise use isButtonVisible
          if (button.datatestid) {
            isButtonReady = await this.isButtonVisibleTestId(page, button.datatestid, buttonLabel, expectedState);
          } else if (button.class) {
            isButtonReady = await this.isButtonVisible(page, button.class, buttonLabel, expectedState);
          } else {
            throw new Error(`Button "${buttonLabel}" must have either 'class' or 'datatestid' property`);
          }

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled: expected true, actual ${isButtonReady}`,
            options?.testInfo,
          );
          logger.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
    }
  }

  /**
   * Validate page titles by checking the H3 elements within a given section, and apply styling for debugging.
   * @param testId - The data-testid attribute of the section containing the titles.
   * @param expectedTitles - An array of expected titles to validate against.
   * @returns Promise<void> - Validates the content and order of titles, applies styling, or throws an error if validation fails.
   */
  async validatePageTitlesWithStyling(testId: string, expectedTitles: string[]): Promise<void> {
    // Normalize: accept raw testId or a full selector containing data-testid
    let selector = testId;
    const match = testId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!testId.includes('data-testid')) {
      selector = `[data-testid="${testId}"]`;
    }

    const locator = this.page.locator(`${selector} h3`); // Locate H3 elements within the section
    const actualTitles = await locator.allTextContents();
    const normalizedTitles = actualTitles.map(title => title.trim());

    // Log expected and received titles for debugging
    logger.info('Expected Titles:', expectedTitles);
    logger.info('Received Titles:', normalizedTitles);

    // Apply styling for debugging
    await locator.evaluateAll(elements => {
      elements.forEach(el => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    });

    // Validate length and content/order of titles
    expect(normalizedTitles.length).toBe(expectedTitles.length);
    expect(normalizedTitles).toEqual(expectedTitles);

    logger.log('Page titles validated successfully with styling applied.');
  }

  /**
   * Validate that a table is displayed and has rows.
   * @param tableTestId - The data-testid of the table to validate.
   * @returns Promise<void> - Validates the presence and non-emptiness of the table.
   */
  async validateTableIsDisplayedWithRows(tableTestId: string): Promise<void> {
    // Normalize selector: accept raw testId or full selector
    let selector = tableTestId;
    const match = tableTestId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!tableTestId.includes('data-testid')) {
      selector = `[data-testid="${tableTestId}"]`;
    }

    // Wait for the table to be visible
    const tableElement = this.page.locator(selector);
    await tableElement.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    // Wait for at least one row to appear in the table
    const tableLocator = this.page.locator(`${selector} tbody tr`);
    await tableLocator.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    // Get the row count
    const rowCount = await tableLocator.count();

    // Highlight the table for debugging
    await tableElement.evaluate(table => {
      table.style.border = '2px solid green';
      table.style.backgroundColor = 'lightyellow';
    });

    // Ensure the table has rows
    expect(rowCount).toBeGreaterThan(0);

    logger.log(`Table with data-testid "${tableTestId}" has ${rowCount} rows.`);
  }

  /**
   * Validate a button's visibility and state using its data-testid.
   * Checks if the button is disabled either by attribute or CSS class.
   * @param page - The Playwright page object.
   * @param buttons - Array of button configurations including data-testid, label, and expected state.
   * @param dialogSelector - Optional scoped selector for the dialog or container.
   */
  async validateButtons(page: Page, buttons: Array<{ datatestid: string; label: string; state: string }>, dialogSelector?: string): Promise<void> {
    for (const button of buttons) {
      const buttonTestId = button.datatestid.trim();
      const buttonLabel = button.label.trim();
      const expectedState = button.state === 'true'; // Convert state string to boolean

      const scopedButtonSelector = dialogSelector ? `${dialogSelector} [data-testid="${buttonTestId}"]` : `[data-testid="${buttonTestId}"]`;

      const buttonLocator = page.locator(scopedButtonSelector);

      // Validate button visibility
      const isButtonVisible = await buttonLocator.isVisible();

      // Validate button enabled state (via attribute or CSS class)
      const hasDisabledAttribute = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled'));
      const hasDisabledCSSClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
      const isButtonEnabled = !hasDisabledAttribute && !hasDisabledCSSClass;

      // Assertions for visibility and state
      expect(isButtonVisible).toBeTruthy();
      expect(isButtonEnabled).toBe(expectedState);

      // Highlight button for debugging
      await buttonLocator.evaluate(btn => {
        btn.style.backgroundColor = 'yellow';
        btn.style.border = '2px solid red';
        btn.style.color = 'blue';
      });

      logger.info(`Button "${buttonLabel}" - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);
    }
  }

  /**
   * Validates that the checkbox in the "Главный:" row is not checked.
   * @param page - Playwright page object.
   * @param section - Locator for the file section.
   * @param sectionIndex - Index of the section being checked.
   * @returns Returns whether the checkbox is checked.
   */
  async validateCheckbox(page: Page, section: Locator, sectionIndex: number) {
    const row = section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-Main"]').filter({
      has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-Main"]:has-text("Главный:")'),
    });

    await expect(row).toBeVisible();
    logger.log(`Row containing label 'Главный:' is visible for section ${sectionIndex}.`);

    const checkbox = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_CHECKBOX_MAIN);
    await checkbox.evaluate(el => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    await expect(checkbox).toBeVisible();
    logger.log(`Checkbox in 'Главный:' row is visible for section ${sectionIndex}.`);

    const isChecked = await checkbox.isChecked();
    logger.log(`Checkbox state for section ${sectionIndex}: ${isChecked ? 'Checked' : 'Not Checked'}`);

    return isChecked; // Return the checkbox state
  }

  /**
   * Checks the checkbox in the "Главный:" row and applies styling.
   * @param page - Playwright page object.
   * @param section - Locator for the file section.
   * @param sectionIndex - Index of the section being checked.
   * @returns Returns whether the checkbox is checked.
   */
  async checkCheckbox(page: Page, section: Locator, sectionIndex: number) {
    const row = section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-Main"]').filter({
      has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-Main"]:has-text("Главный:")'),
    });

    await expect(row).toBeVisible();
    logger.log(`Row containing label 'Главный:' is visible for section ${sectionIndex}.`);

    const checkbox = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_CHECKBOX_MAIN);

    // Restore the styling
    await checkbox.evaluate(el => {
      el.style.backgroundColor = 'green';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    await expect(checkbox).toBeVisible();
    logger.log(`Checkbox in 'Главный:' row is visible for section ${sectionIndex}.`);

    await checkbox.check();
    const isChecked = await checkbox.isChecked();
    logger.log(`Checkbox state for section ${sectionIndex}: ${isChecked ? 'Checked' : 'Not Checked'}`);

    return isChecked; // Return the checkbox state for validation
  }

  /**
   * Validates that all uploaded file fields contain the correct filename without extension.
   * @param page - Playwright page object.
   * @param fileSections - Array of file section locators.
   * @param uploadedFiles - Array of uploaded file names.
   */
  async validateFileNames(page: Page, fileSections: Locator[], uploadedFiles: string[]): Promise<void> {
    if (fileSections.length !== uploadedFiles.length) {
      throw new Error(`Mismatch: Expected ${uploadedFiles.length} files, but found ${fileSections.length} sections.`);
    }

    for (let i = 0; i < fileSections.length; i++) {
      const fileSection = fileSections[i]; // Extract each file section dynamically

      const row = fileSection.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputGroup-FileName"]').filter({
        has: page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Label-FileName"]:has-text("Файл:")'),
      });
      await row.evaluate((element: HTMLElement) => {
        element.style.backgroundColor = 'yellow';
        element.style.border = '2px solid red';
        element.style.color = 'blue';
      });

      await expect(row).toBeVisible();
      logger.log(`Row for file ${i + 1} containing label 'Файл:' is visible.`);

      const input = row.locator(SelectorsFileComponents.ADD_DETAIL_FILE_COMPONENT_INPUT_FILE_NAME_INPUT);
      await expect(input).toBeVisible();
      logger.log(`Input field for file ${i + 1} is visible.`);

      const expectedFilename = uploadedFiles[i].split('.')[0];
      const actualInputValue = await input.inputValue();
      logger.log(`Expected filename: ${expectedFilename}, Actual input value: ${actualInputValue}`);
      expect(actualInputValue).toBe(expectedFilename);

      // Highlight for debugging
      await input.evaluate((element: HTMLElement) => {
        element.style.backgroundColor = 'green';
        element.style.border = '2px solid red';
        element.style.color = 'blue';
      });
    }
  }

  /**
   * Check header text
   * @param header - The expected header text
   * @param url - The selector for the header element
   */
  async checkHeader(header: string, url: string) {
    const checkHeader = this.page.locator(url);
    await expect(checkHeader.locator('h3').nth(0)).toHaveText(header);
  }

  /**
   * Checks if a button is visible and active/inactive
   * @param page - The Playwright page instance
   * @param buttonSelector - selector for the button
   * @param label - The button label text
   * @param Benabled - expected state of the button (true = enabled, false = disabled)
   * @param dialogContext - Optional: Specify dialog context for scoping
   * @param waitForEnabled - Optional: If true, wait for button to become enabled
   * @param waitTimeout - Optional: Maximum time to wait for button to become enabled
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async isButtonVisible(
    page: Page,
    buttonSelector: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContext: string = '', // Optional: Specify dialog context for scoping
    waitForEnabled: boolean = false, // Optional: If true, wait for button to become enabled (default: false for backward compatibility)
    waitTimeout: number = 10000, // Optional: Maximum time to wait for button to become enabled (default: 10 seconds)
  ): Promise<boolean> {
    try {
      // Apply dialog context if provided
      const scopedSelector = dialogContext ? `${dialogContext} ${buttonSelector}` : buttonSelector;

      // Locate the button using the updated selector
      const button = page.locator(scopedSelector, {
        hasText: new RegExp(`^\\s*${label.trim()}\\s*$`),
      });
      logger.log(`Found ${await button.count()} buttons matching selector "${scopedSelector}" and label "${label}".`);

      // Debugging: Log initial info
      logger.log(`Starting isButtonVisible for label: "${label}" with Benabled: ${Benabled}, waitForEnabled: ${waitForEnabled}`);

      // Highlight the button for debugging
      await button.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });

      // Wait for the button to be attached to the DOM
      await button.waitFor({ state: 'attached' });
      logger.log(`Button "${label}" is attached to the DOM.`);

      // Verify visibility
      const isVisible = await button.isVisible();
      logger.log(`Button "${label}" visibility: ${isVisible}`);
      await expect(button).toBeVisible(); // Assert visibility explicitly

      if (Benabled) {
        logger.log(`Expecting button "${label}" to be enabled.`);

        if (waitForEnabled) {
          logger.log(`Waiting for button "${label}" to become enabled (timeout: ${waitTimeout}ms)...`);

          // Wait for button to become enabled (with timeout)
          const checkInterval = 200; // Check every 200ms
          const startTime = Date.now();
          let isEnabled = false;

          while (Date.now() - startTime < waitTimeout) {
            const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
            const hasDisabledAttr = await button.evaluate(btn => btn.hasAttribute('disabled'));

            if (!hasDisabledClass && !hasDisabledAttr) {
              isEnabled = true;
              logger.log(`Button "${label}" is now enabled.`);
              break;
            }

            // Wait before next check
            await page.waitForTimeout(checkInterval);
          }

          if (!isEnabled) {
            const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
            const hasDisabledAttr = await button.evaluate(btn => btn.hasAttribute('disabled'));
            logger.log(`Button "${label}" still disabled after waiting. Disabled class: ${hasDisabledClass}, Disabled attr: ${hasDisabledAttr}`);
            expect(hasDisabledClass).toBeFalsy(); // This will throw if still disabled
            expect(hasDisabledAttr).toBeFalsy(); // This will throw if still disabled
          }
        } else {
          // Original behavior: check immediately without waiting
          const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
          const isDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));
          logger.log(`Disabled class present for button "${label}": ${hasDisabledClass}`);
          expect(hasDisabledClass).toBeFalsy(); // Button should not be disabled
          logger.log(`Disabled attribute present for button "${label}": ${isDisabledAttribute}`);
          expect(isDisabledAttribute).toBeFalsy(); // Button should not have 'disabled' attribute
        }
      } else {
        logger.log(`Expecting button "${label}" to be disabled.`);
        const hasDisabledClass = await button.evaluate(btn => btn.classList.contains('disabled-yui-kit'));
        const isDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));
        const isDisabled = hasDisabledClass || isDisabledAttribute;
        logger.log(`Disabled class present for button "${label}": ${isDisabled}`);
        expect(isDisabled).toBeTruthy(); // Button should be disabled
      }

      logger.log(`Button "${label}" passed all checks.`);
      return true; // If everything passes, the button is valid
    } catch (error) {
      console.error(`Error while checking button "${label}" state:`, error);
      return false; // Return false on failure
    }
  }

  /**
   * Checks if a button is visible and active/inactive by data-testid
   * @param page - The Playwright page instance
   * @param testId - The data-testid of the button
   * @param label - The button label text
   * @param Benabled - expected state of the button (true = enabled, false = disabled)
   * @param dialogContextTestId - Optional: Specify dialog context testId for scoping
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async isButtonVisibleTestId(
    page: Page,
    testId: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContextTestId: string = '', // Optional: Specify dialog context testId for scoping
  ): Promise<boolean> {
    try {
      // Check if testId is already a full selector (starts with '[') or a pattern selector
      const isFullSelector = testId.trim().startsWith('[');
      // Check if dialogContextTestId is already a full selector (only if it's provided)
      const isDialogContextFullSelector = dialogContextTestId ? dialogContextTestId.trim().startsWith('[') : false;

      // Apply dialog context if provided
      let scopedSelector: string;
      if (isFullSelector) {
        // If testId is already a full selector, use it directly
        if (dialogContextTestId) {
          // If dialogContextTestId is also a full selector, use it directly; otherwise wrap it
          const dialogSelector = isDialogContextFullSelector ? dialogContextTestId : `[data-testid="${dialogContextTestId}"]`;
          scopedSelector = `${dialogSelector} ${testId}`;
        } else {
          scopedSelector = testId;
        }
      } else {
        // Otherwise, wrap it in data-testid attribute selector
        if (dialogContextTestId) {
          // If dialogContextTestId is a full selector, use it directly; otherwise wrap it
          const dialogSelector = isDialogContextFullSelector ? dialogContextTestId : `[data-testid="${dialogContextTestId}"]`;
          scopedSelector = `${dialogSelector} [data-testid="${testId}"]`;
        } else {
          scopedSelector = `[data-testid="${testId}"]`;
        }
      }

      // Locate the button using the updated testId-based selector
      const button = page.locator(scopedSelector, {
        hasText: new RegExp(`^\\s*${label.trim()}\\s*$`),
      });
      logger.log(`Found ${await button.count()} buttons matching testId "${testId}" and label "${label}".`);

      // Debugging: Log initial info
      logger.log(`Starting isButtonVisibleTestId for label: "${label}" with Benabled: ${Benabled}`);
      // Highlight the button for debugging
      await button.evaluate(btn => {
        btn.style.backgroundColor = 'yellow';
        btn.style.border = '2px solid red';
        btn.style.color = 'blue';
      });
      // Wait for the button to be attached to the DOM
      await button.waitFor({ state: 'attached' });
      logger.log(`Button "${label}" is attached to the DOM.`);
      // Verify visibility
      const isVisible = await button.isVisible();

      logger.log(`Button "${label}" visibility: ${isVisible}`);
      await expect(button).toBeVisible(); // Assert visibility explicitly
      try {
        await this.page.waitForTimeout(500);
      } catch (error) {
        console.warn(`Timeout waiting in button validation: ${error instanceof Error ? error.message : String(error)}`);
        console.warn('Continuing without waiting.');
      }
      // Check for 'disabled-yui-kit' class and 'disabled' attribute
      const hasDisabledClass = await button.evaluate(btn => {
        const classList = Array.from(btn.classList);
        logger.log(`Button classList:`, classList);
        const hasDisabled = btn.classList.contains('disabled-yui-kit');
        logger.log(`Button has disabled-yui-kit class:`, hasDisabled);
        const hasDisabledAttr = btn.hasAttribute('disabled');
        logger.log(`Button has disabled attribute:`, hasDisabledAttr);
        const outerHTML = btn.outerHTML;
        logger.log(`Button outerHTML:`, outerHTML);
        return hasDisabled;
      });

      // Also check for disabled attribute
      const hasDisabledAttribute = await button.evaluate(btn => btn.hasAttribute('disabled'));

      logger.log(`Disabled class present for button "${label}": ${hasDisabledClass}`);
      logger.log(`Disabled attribute present for button "${label}": ${hasDisabledAttribute}`);

      if (Benabled) {
        logger.log(`Expecting button "${label}" to be enabled.`);
        expect(hasDisabledClass).toBeFalsy(); // Button should not be disabled
        expect(hasDisabledAttribute).toBeFalsy(); // Button should not have 'disabled' attribute
      } else {
        logger.log(`Expecting button "${label}" to be disabled.`);
        // Button should be disabled either by class or attribute
        const isDisabled = hasDisabledClass || hasDisabledAttribute;
        expect(isDisabled).toBeTruthy(); // Button should be disabled (class or attribute)
      }
      logger.log(`Button "${label}" passed all checks.`);
      return true; // If everything passes, the button is valid
    } catch (error) {
      console.error(`Error while checking button "${label}" state:`, error);
      return false; // Return false on failure
    }
  }

  /**
   * Checks if a button state matches expected
   * @param name - The button name/label
   * @param selector - selector for the button
   * @param expectedState - expected state of the button ('active' or 'inactive')
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async checkButtonState(name: string, selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
    const button = this.page.locator(selector, { hasText: name });

    await expect(button).toBeVisible();

    const classes = await button.getAttribute('class');

    if (expectedState === 'active') {
      return !classes?.includes('disabled-yui-kit');
    } else {
      return classes?.includes('disabled-yui-kit') ?? false;
    }
  }

  /**
   * Searches for a term in a table and verifies that the first row contains the search term.
   * This method requires TableHelper and RowCellHelper methods, so it accepts a pageObject parameter
   * to call those methods through PageObject proxies.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param searchTerm - The term to search for
   * @param tableSelector - Selector for the table element
   * @param tableBodySelector - Selector for the table body element
   * @param options - Optional configuration
   */
  async searchAndVerifyFirstRow(
    pageObject: any, // PageObject instance to call helper methods
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: {
      useRedesign?: boolean;
      searchInputDataTestId?: string;
      timeoutBeforeWait?: number;
      minRows?: number;
      timeoutMs?: number;
    },
  ): Promise<void> {
    // Search and wait for table (calls TableHelper through PageObject)
    await pageObject.searchAndWaitForTable(searchTerm, tableSelector, tableBodySelector, options);

    // Verify the first row contains the search term (calls RowCellHelper through PageObject)
    await pageObject.checkNameInLineFromFirstRow(searchTerm, tableBodySelector);
  }

  /**
   * Wait and check first row contains search term
   * This method requires RowCellHelper methods, so it accepts a pageObject parameter
   * to call those methods through PageObject proxies.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param page - The Playwright page instance
   * @param searchTerm - The search term to verify
   * @param tableSelector - Selector for the table
   * @param options - Optional configuration
   */
  async waitAndCheckFirstRow(
    pageObject: any, // PageObject instance to call helper methods
    page: Page,
    searchTerm: string,
    tableSelector: string,
    options?: {
      timeoutMs?: number;
      waitForNetworkIdle?: boolean;
      testInfo?: TestInfo;
      description?: string;
    },
  ): Promise<void> {
    if (options?.waitForNetworkIdle !== false) {
      await page.waitForLoadState('networkidle');
    }
    if (options?.timeoutMs && options.timeoutMs > 0) {
      await page.waitForTimeout(options.timeoutMs);
    }
    // Calls RowCellHelper through PageObject
    await pageObject.checkNameInLineFromFirstRow(searchTerm, tableSelector, {
      testInfo: options?.testInfo,
      description: options?.description,
    });
  }
}
