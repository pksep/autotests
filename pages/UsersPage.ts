import { Page, expect, TestInfo, Locator } from '@playwright/test';
import { allure } from 'allure-playwright';
import { PageObject, expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsSettingsPage from '../lib/Constants/SelectorsSettingsPage';
import * as SelectorsUsersPage from '../lib/Constants/SelectorsUsersPage';
import * as SelectorsNotifications from '../lib/Constants/SelectorsNotifications';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

export type CreateUserParams = {
  username: string;
  jobType: string; // e.g. "Слесарь сборщик"
  phoneSuffix: string; // e.g. "995"
  login: string; // e.g. "Тестовыё сборка 2"
  password: string; // e.g. "1234"
  department: string; // e.g. "Сборка"
  tableNumberStart: number; // e.g. 999
};

export type CreateUserResult = {
  success: boolean;
  usedTableNumber?: number;
  message?: string;
  attempts?: number;
};

export class CreateUsersPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  private isTableNumberConflictMessage(message: string): boolean {
    const m = message.toLowerCase();
    return (
      m.includes('табел') &&
      (m.includes('занят') || m.includes('использ') || m.includes('существует'))
    );
  }

  async createTestUser(params: CreateUserParams, testInfo: TestInfo): Promise<CreateUserResult> {
    let result: CreateUserResult;
    await allure.step(`Create test user "${params.username}"`, async () => {
      // 1) /settings
      await this.goto('settings');
      await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);

      // 2) Click Staff card
      const staffCard = this.page.locator(SelectorsSettingsPage.SETTINGS_PAGE_CARD_STAFF).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(staffCard).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify staff card is visible on settings page',
        testInfo,
      );
      await this.highlightElement(staffCard);
      await staffCard.click();
      await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);

      // 3) Click "create user" button
      const createUserButton = this.page.locator(SelectorsUsersPage.USERS_PAGE_CREATE_USER_BUTTON).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(createUserButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify create user button is visible',
        testInfo,
      );
      await this.highlightElement(createUserButton);
      await createUserButton.click();

      // 4) Wait for form and fill username
      const usernameInput = this.page.locator(SelectorsUsersPage.USERS_FORM_USERNAME_INPUT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(usernameInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify user name input is visible',
        testInfo,
      );
      await usernameInput.fill(params.username);

      const usernameValue = await usernameInput.inputValue();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(usernameValue).toBe(params.username);
        },
        'Verify user name was filled',
        testInfo,
      );

      // Wait for form to be fully loaded after username is filled
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      // 5) Job type dropdown - click on the dropdown text element to open it
      const jobTypeDropdown = this.page.locator(SelectorsUsersPage.USERS_FORM_JOB_TYPE_DROPDOWN_SELECTED_TEXT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(jobTypeDropdown).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify job type dropdown is visible',
        testInfo,
      );
      await this.highlightElement(jobTypeDropdown);
      await jobTypeDropdown.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for dropdown to open

      // Wait for the dropdown options list to be visible - filter for the one that's open (has open="true" attribute)
      const optionsList = this.page.locator(`${SelectorsUsersPage.USERS_FORM_JOB_TYPE_DROPDOWN_OPTIONS_LIST}[open="true"]`).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(optionsList).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify job type dropdown options list is visible',
        testInfo,
      );

      // Find the <li> element that contains the job type text
      // The text is inside a div with class "options__value"
      const jobTypeOption = optionsList.locator('li').filter({ hasText: params.jobType }).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(jobTypeOption).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        `Verify job type option "${params.jobType}" is visible in dropdown`,
        testInfo,
      );
      await this.highlightElement(jobTypeOption);
      await jobTypeOption.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for selection to register and form to update
      await this.waitForNetworkIdle(); // Wait for any network requests after selection
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Extra wait for form fields to appear

      // 6) Phone input - version number changes after job type selection (v-423 -> v-19)
      // Wait for the fieldset first, then find the input inside it
      const phoneFieldset = this.page.locator(SelectorsUsersPage.USERS_FORM_PHONE_FIELDSET).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(phoneFieldset).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify phone fieldset is visible',
        testInfo,
      );
      const phoneInput = phoneFieldset.locator('input[data-testid$="RowInfo-2-Input-Input"]');
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(phoneInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify phone input is visible',
        testInfo,
      );
      await this.highlightElement(phoneInput);
      await phoneInput.fill(params.phoneSuffix);

      // 7) Login
      const loginInput = this.page.locator(SelectorsUsersPage.USERS_FORM_LOGIN_INPUT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(loginInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify login input is visible',
        testInfo,
      );
      await loginInput.fill(params.login);

      // 8) Password
      const passwordInput = this.page.locator(SelectorsUsersPage.USERS_FORM_PASSWORD_INPUT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(passwordInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify password input is visible',
        testInfo,
      );
      await passwordInput.fill(params.password);

      // 9) Department dropdown - click to open and select
      if (params.department) {
        // First click the department dropdown to open it
        // Use .last() or .nth(1) because there are two dropdowns - first is job type, second is department
        const deptDropdown = this.page.locator(SelectorsUsersPage.USERS_FORM_DEPARTMENT_DROPDOWN_CURRENT).last();
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(deptDropdown).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          },
          'Verify department dropdown is visible',
          testInfo,
        );
        await this.highlightElement(deptDropdown);
        await deptDropdown.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for dropdown to open

        // Wait for the dropdown options list to be visible
        // Find the options list that's associated with the department dropdown
        // We need to find the one that's closest to the department dropdown we clicked
        // Since there are two dropdowns with the same pattern, we'll find all and check which one contains department options
        const allOpenDropdowns = this.page.locator(`${SelectorsUsersPage.USERS_FORM_DEPARTMENT_DROPDOWN_OPTIONS_LIST}[open="true"]`);
        const dropdownCount = await allOpenDropdowns.count();
        
        let deptOptionsList: Locator | null = null;
        // Try to find the dropdown that contains the department option we're looking for
        for (let i = 0; i < dropdownCount; i++) {
          const dropdown = allOpenDropdowns.nth(i);
          const allOptionsInDropdown = dropdown.locator('li');
          const optionCountInDropdown = await allOptionsInDropdown.count();
          
          // Check if this dropdown contains our target department
          for (let j = 0; j < optionCountInDropdown; j++) {
            const option = allOptionsInDropdown.nth(j);
            const optionText = await option.locator('div.options__value').textContent();
            if (optionText && optionText.trim().toLowerCase() === params.department.toLowerCase()) {
              deptOptionsList = dropdown;
              break;
            }
          }
          if (deptOptionsList) break;
        }
        
        // If we didn't find it, use the last one (department is typically second)
        if (!deptOptionsList && dropdownCount > 0) {
          deptOptionsList = allOpenDropdowns.last();
        }
        
        if (!deptOptionsList) {
          throw new Error('No open department dropdown found');
        }
        
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(deptOptionsList!).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          },
          'Verify department dropdown options list is visible',
          testInfo,
        );

        // Now click on the title element AFTER the dropdown is open
        const titleElement = this.page.locator('[data-testid^="UserInfoRow-v-"][data-testid$="-title"]').filter({ hasText: 'Подразделение' }).first();
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(titleElement).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          },
          'Verify department title element is visible',
          testInfo,
        );
        await this.highlightElement(titleElement);
        await this.page.waitForTimeout(1000); // Wait 1 second before clicking
        await titleElement.click();
        await this.page.waitForTimeout(TIMEOUTS.SHORT);

        // Verify dropdown is still open after clicking title, reopen if needed
        // Check all open dropdowns and find the department one
        const allOpenDropdownsAfterTitle = this.page.locator(`${SelectorsUsersPage.USERS_FORM_DEPARTMENT_DROPDOWN_OPTIONS_LIST}[open="true"]`);
        const dropdownCountAfterTitle = await allOpenDropdownsAfterTitle.count();
        
        let deptOptionsListAfterTitle: Locator | null = null;
        if (dropdownCountAfterTitle === 1) {
          deptOptionsListAfterTitle = allOpenDropdownsAfterTitle.first();
        } else if (dropdownCountAfterTitle > 1) {
          deptOptionsListAfterTitle = allOpenDropdownsAfterTitle.last(); // Department is typically the second/last one
        }
        
        const isStillOpen = deptOptionsListAfterTitle ? await deptOptionsListAfterTitle.isVisible().catch(() => false) : false;
        
        if (!isStillOpen) {
          // Dropdown closed, reopen it
          await deptDropdown.click();
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
          const allOpenDropdownsReopened = this.page.locator(`${SelectorsUsersPage.USERS_FORM_DEPARTMENT_DROPDOWN_OPTIONS_LIST}[open="true"]`);
          const dropdownCountReopened = await allOpenDropdownsReopened.count();
          if (dropdownCountReopened === 1) {
            deptOptionsListAfterTitle = allOpenDropdownsReopened.first();
          } else if (dropdownCountReopened > 1) {
            deptOptionsListAfterTitle = allOpenDropdownsReopened.last();
          } else {
            throw new Error('Department dropdown did not open after clicking');
          }
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(deptOptionsListAfterTitle!).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify department dropdown options list is visible after reopening',
            testInfo,
          );
        }

        // Ensure we have a valid dropdown list
        if (!deptOptionsListAfterTitle) {
          throw new Error('Department dropdown options list not found');
        }

        // Find the option by iterating through all options and matching text
        // Get all li elements in the dropdown
        const allOptions = deptOptionsListAfterTitle.locator('li');
        const optionCount = await allOptions.count();
        
        let deptOption: Locator | null = null;
        const availableOptions: string[] = [];
        for (let i = 0; i < optionCount; i++) {
          const option = allOptions.nth(i);
          const optionText = await option.locator('div.options__value').textContent();
          const trimmedText = optionText ? optionText.trim() : '';
          availableOptions.push(trimmedText);
          // Match with trimmed text, case-insensitive
          if (trimmedText.toLowerCase() === params.department.toLowerCase()) {
            deptOption = option;
            break;
          }
        }
        
        if (!deptOption) {
          throw new Error(`Department option "${params.department}" not found in dropdown. Available options: ${availableOptions.join(', ')}`);
        }
        
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(deptOption!).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          },
          `Verify department option "${params.department}" is visible in dropdown`,
          testInfo,
        );
        await this.highlightElement(deptOption);
        await deptOption.scrollIntoViewIfNeeded();
        await deptOption.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for selection to register and form to update
        await this.waitForNetworkIdle(); // Wait for any network requests after selection
      }

      // 10) Table number + Save, decrement on conflict
      const tableNumberInput = this.page.locator(SelectorsUsersPage.USERS_FORM_TABLE_NUMBER_INPUT).first();
      const saveButton = this.page.locator(SelectorsUsersPage.USERS_FORM_SAVE_BUTTON).first();

      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(tableNumberInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          expect.soft(saveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify table number input and save button are visible',
        testInfo,
      );

      let currentTableNumber = params.tableNumberStart;
      const maxAttempts = 100;
      let attempts = 0;

      while (attempts < maxAttempts && currentTableNumber > 0) {
        attempts++;

        await allure.step(`Attempt ${attempts}: Save user with table number ${currentTableNumber}`, async () => {
          // Fill table number
          await tableNumberInput.fill(String(currentTableNumber));
          await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

          // Verify the field has the correct value
          const fieldValue = await tableNumberInput.inputValue();
          if (fieldValue !== String(currentTableNumber)) {
            // If fill didn't work, try using evaluate to set the value directly
            await tableNumberInput.evaluate((el: HTMLInputElement, value: string) => {
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }, String(currentTableNumber));
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          }

          await this.highlightElement(saveButton);
          await saveButton.click();
        });

        // Wait for notification to appear after clicking save
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        
        // Wait for and read the notification
        const notificationDesc = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION).last();
        let notificationText = '';
        
        // Poll for notification with retries (notifications can take time to appear)
        for (let i = 0; i < 5; i++) {
          try {
            // Wait for notification to be visible and attached before reading
            const isVisible = await notificationDesc.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false);
            if (isVisible) {
              // Wait for element to be attached and stable
              await notificationDesc.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
              // Highlight the notification to ensure we're reading the correct one
              await this.highlightElement(notificationDesc);
              // Read textContent with timeout
              notificationText = (await notificationDesc.textContent({ timeout: WAIT_TIMEOUTS.SHORT }))?.trim() || '';
              if (notificationText) {
                break;
              }
            }
          } catch (e) {
            // Notification might not be ready yet, continue polling
            console.log(`Notification not ready yet (attempt ${i + 1}/5)`);
          }
          await this.page.waitForTimeout(TIMEOUTS.SHORT);
        }

        // Check if notification indicates table number conflict
        const isConflict = notificationText && this.isTableNumberConflictMessage(notificationText);
        
        if (isConflict) {
          // Table number is already in use - decrement and try again in next iteration
          console.log(`⚠️ Table number ${currentTableNumber} conflict detected. Notification: "${notificationText}". Decrementing to ${currentTableNumber - 1} and retrying...`);
          currentTableNumber -= 1;
          continue; // Continue to next iteration to try with decremented table number
        }
        
        // Wait a bit more to see if form closes (success) or stays open (failure)
        await this.page.waitForTimeout(TIMEOUTS.STANDARD);
        
        // Check if save button is still visible (form didn't close = save likely failed)
        const saveButtonStillVisible = await saveButton.isVisible().catch(() => false);
        
        // If save button is still visible, the form didn't close - likely a conflict or error
        // Wait a bit more and re-check notification
        if (saveButtonStillVisible) {
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
          
          // Re-check notification - it might have appeared late
          try {
            const recheckNotification = await notificationDesc.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false);
            if (recheckNotification) {
              await notificationDesc.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
              await this.highlightElement(notificationDesc);
              const recheckText = (await notificationDesc.textContent({ timeout: WAIT_TIMEOUTS.SHORT }))?.trim() || '';
              console.log(`Form still open, rechecking notification: "${recheckText}"`);
              
              if (recheckText && this.isTableNumberConflictMessage(recheckText)) {
                console.log(`⚠️ Table number ${currentTableNumber} conflict detected on recheck. Decrementing to ${currentTableNumber - 1} and retrying...`);
                currentTableNumber -= 1;
                continue;
              }
            }
          } catch (e) {
            // Notification not available, continue with form visibility check
            console.log(`Recheck notification not available: ${e}`);
          }
          
          // If form is still open and no conflict notification, log warning but continue
          // (might be a different error, but we'll try with decremented number anyway)
          console.log(`⚠️ Form still open after save attempt with table number ${currentTableNumber}. Assuming conflict and decrementing to ${currentTableNumber - 1}...`);
          currentTableNumber -= 1;
          continue;
        }

        // No conflict detected and form closed - save was successful
        // Get final notification and highlight it if visible
        const finalNotificationDesc = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION).last();
        let finalNotification = '';
        try {
          const finalNotificationVisible = await finalNotificationDesc.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false);
          if (finalNotificationVisible) {
            await finalNotificationDesc.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
            await this.highlightElement(finalNotificationDesc);
            finalNotification = (await finalNotificationDesc.textContent({ timeout: WAIT_TIMEOUTS.SHORT }))?.trim() || '';
          }
        } catch (e) {
          // Final notification not available, but save succeeded (form closed)
          console.log(`Final notification not available: ${e}`);
        }

        result = {
          success: true,
          usedTableNumber: currentTableNumber,
          message: finalNotification || notificationText || 'Saved (no notification)',
          attempts,
        };
        return;
      }

      const finalMessage = await this.getLatestNotificationText();
      result = {
        success: false,
        usedTableNumber: currentTableNumber,
        message: finalMessage || 'Failed to save user (table number conflicts or unknown error)',
        attempts,
      };
    });
    return result!;
  }

  /**
   * Cleans up test users by searching for users with a given prefix and archiving all found users.
   * @param searchPrefix - The search term prefix to find users by username (e.g., "ERP2969_TEST_USER" matches "ERP2969_TEST_USER_001", "ERP2969_TEST_USER_002", etc.)
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   */
  async cleanupTestUsersByPrefix(searchPrefix: string, testInfo: TestInfo): Promise<void> {
    await allure.step(`Clean up users with prefix "${searchPrefix}"`, async () => {
      // Navigate to settings/employee page
      await this.goto('settings');
      await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);

      // Click Staff card to go to users page
      const staffCard = this.page.locator(SelectorsSettingsPage.SETTINGS_PAGE_CARD_STAFF).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(staffCard).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify staff card is visible on settings page',
        testInfo,
      );
      await staffCard.click();
      await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Extra wait for users page to load

      // Find the table and wait for it to be visible
      const table = this.page.locator(SelectorsUsersPage.USERS_LIST_TABLE).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify users table is visible',
        testInfo,
      );

      // Get initial row count before search (for comparison)
      const rowsBeforeSearch = table.locator('tbody tr');
      const initialRowCount = await rowsBeforeSearch.count();
      console.log(`Initial row count before search: ${initialRowCount}`);

      // Find the search input - it's inside the table container
      const searchInput = this.page.locator(SelectorsUsersPage.USERS_LIST_SEARCH_INPUT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify search input is visible',
        testInfo,
      );

      // Perform search using the helper method for better reliability
      await this.searchWithPressSequentially(
        SelectorsUsersPage.USERS_LIST_SEARCH_INPUT,
        searchPrefix,
        { delay: 50, waitAfterSearch: TIMEOUTS.STANDARD, timeout: WAIT_TIMEOUTS.STANDARD },
      );
      
      // Verify search input has the correct value after search
      const searchValue = await searchInput.inputValue();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(searchValue).toBe(searchPrefix);
        },
        `Verify search input contains prefix "${searchPrefix}" after search`,
        testInfo,
      );
      
      // Wait for table to update after search - wait for network and give extra time for filtering
      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM); // Extra wait for table filtering

      // Find all rows in the table after search
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} rows in table after searching for prefix "${searchPrefix}" (was ${initialRowCount} before search)`);
      
      // Safety check: if search didn't filter and we have many rows, verify they all match
      if (rowCount > 0 && rowCount === initialRowCount && initialRowCount > 10) {
        console.log(`⚠️ WARNING: Search may not be filtering - row count unchanged (${rowCount} rows). Will verify each row matches prefix before deleting.`);
      }

      // Safety check: if rowCount is very large, the search might not be working
      if (rowCount > 50) {
        throw new Error(
          `Search returned ${rowCount} rows, which seems too many. ` +
          `Search prefix "${searchPrefix}" may not be filtering correctly. ` +
          `Aborting to prevent deleting all users.`
        );
      }

      let deletedCount = 0;
      let skippedCount = 0;

      // Delete users from bottom up, but verify each row matches the prefix
      for (let i = rowCount - 1; i >= 0; i--) {
        const row = rows.nth(i);
        
        // Wait for row to be visible and scroll into view
        await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        await row.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        
        // Get the row text to verify it matches the search prefix
        const rowText = await row.textContent();
        const rowTextLower = rowText?.toLowerCase() || '';
        const searchPrefixLower = searchPrefix.toLowerCase();
        
        // Verify the row contains the search prefix (check username in row text)
        // This is critical: we only delete rows that actually match the search prefix
        if (!rowTextLower.includes(searchPrefixLower)) {
          console.log(`⏭️ Skipping row ${i}: does not contain prefix "${searchPrefix}". Row text preview: "${rowText?.substring(0, 80).trim()}..."`);
          skippedCount++;
          continue; // Skip this row - it doesn't match the search prefix
        }
        
        // Log that we found a matching row
        console.log(`✅ Row ${i} matches prefix "${searchPrefix}". Row text preview: "${rowText?.substring(0, 80).trim()}..."`);
        
        // Verify row matches before deleting (double-check)
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(rowTextLower).toContain(searchPrefixLower);
          },
          `Verify row ${i} matches search prefix "${searchPrefix}" before deleting`,
          testInfo,
        );
        
        // Close any open dropdowns before clicking the row
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TIMEOUTS.SHORT);
        
        // Click the row to select it
        await row.click();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        
        // Wait for the Archive button to be enabled
        const archiveButton = this.page.locator(SelectorsUsersPage.USERS_LIST_ARCHIVE_BUTTON).filter({ hasText: 'Архив' }).first();
        await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(archiveButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
          },
          'Verify archive button is enabled',
          testInfo,
        );
        
        // Click the Archive button
        await archiveButton.click();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        
        // Wait for and click the confirm button
        const confirmModal = this.page.locator(SelectorsUsersPage.USERS_ARCHIVE_CONFIRM_MODAL).first();
        await confirmModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        
        const confirmButton = this.page.locator(SelectorsUsersPage.USERS_ARCHIVE_CONFIRM_BUTTON).first();
        await confirmButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        await confirmButton.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.waitForNetworkIdle();
        
        deletedCount++;
      }

      console.log(`Deleted ${deletedCount} users with prefix "${searchPrefix}" (skipped ${skippedCount} rows that didn't match)`);
      
      // Verify we actually deleted users if any were found
      // If no users were found (rowCount === 0), that's fine - cleanup may have already happened
      if (rowCount > 0) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(deletedCount).toBeGreaterThan(0);
          },
          `Verify at least one user with prefix "${searchPrefix}" was deleted (found ${rowCount} total rows)`,
          testInfo,
        );
      } else {
        console.log(`No users found with prefix "${searchPrefix}" - cleanup may have already been completed`);
      }
    });
  }
}

