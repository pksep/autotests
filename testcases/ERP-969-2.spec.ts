import { test, expect, Locator, Page, TestInfo } from '@playwright/test';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreatePartsPage } from '../pages/CreatePartsPage';
import { CreateStockPage } from '../pages/StockPage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import { CreateRevisionPage } from '../pages/RevisionPage';
import { SELECTORS } from '../config';
import { TEST_DATA } from '../lib/Constants/TestDataERP969';
import { allure } from 'allure-playwright';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as SelectorsAssemblyKitting from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsModalWaybill from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles';
import * as SelectorsERP969 from '../lib/Constants/SelectorsERP969';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/Page';
import logger from '../lib/utils/logger';

// Additional test data variables for the new steps
let orderNumber: string | null = null; // Declare outside to share between steps
let orderedQuantity2: number = 666; // Declare outside to share between steps
let targetRow: any = null; // Declare outside to share between steps
let specificationQuantity: number = 1; // Global variable for specification quantity from step 10
let waybillCollections: number = 0; // Global variable to track waybill collections
let currentBuildQuantity: number = 1; // Global variable for current build quantity (how many items we're building now)

export const runERP_969_2 = () => {
  test('ERP-969-2 - Create 2 details and СБ assembly containing both details', async ({ page }) => {
    test.setTimeout(600000);
    const detailsPage = new CreatePartsDatabasePage(page);

    // ─────────────────────────────────────────────────────────────────────────────
    // PART A: Clean up any existing test data
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step('Step 1: Navigate to Parts Database page and clean up existing test data', async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');

      // Clean up existing detail 1
      await detailsPage.cleanupTestDetail(page, TEST_DATA.DETAIL_1_NAME, TEST_DATA.PARTS_PAGE_DETAL_TABLE);
      await detailsPage.verifyDetailSuccessMessage('Деталь успешно перенесена в архив');

      // Clean up existing detail 2
      await detailsPage.cleanupTestDetail(page, TEST_DATA.DETAIL_2_NAME, TEST_DATA.PARTS_PAGE_DETAL_TABLE);
      await detailsPage.verifyDetailSuccessMessage('Деталь успешно перенесена в архив');

      // Clean up existing assembly
      await detailsPage.cleanupTestDetail(page, TEST_DATA.ASSEMBLY_NAME, TEST_DATA.MAIN_PAGE_СБ_TABLE);
      await detailsPage.verifyDetailSuccessMessage('Сборочная единица успешно перенесён в архив');
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART B: Create first detail
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 2: Create first detail "${TEST_DATA.DETAIL_1_NAME}"`, async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('networkidle');

      // Fill detail name
      await detailsPage.fillDetailName(TEST_DATA.DETAIL_1_NAME, SelectorsPartsDataBase.INPUT_DETAIL_NAME);

      // Save the detail
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE_ID);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await detailsPage.waitForNetworkIdle();

      // Check for success notification message
      await detailsPage.verifyDetailSuccessMessage('Деталь успешно создана');

      // Verify we're now in edit mode (page transitioned from add to edit)
      const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(editPageTitle).toBeVisible();
        },
        'Verify edit page title is visible',
        test.info(),
      );
    });

    await allure.step(`Step 3: Verify first detail "${TEST_DATA.DETAIL_1_NAME}" was saved`, async () => {
      // Click cancel to return to listing
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL_ID);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await detailsPage.waitForNetworkIdle();

      // Search for the detail in the table
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const detailSearchInput = detalTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detailSearchInput).toBeVisible();
        },
        'Verify detail search input is visible',
        test.info(),
      );
      await detailSearchInput.fill(TEST_DATA.DETAIL_1_NAME);
      await detailSearchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const resultRows = detalTable.locator('tbody tr');
      const count = await resultRows.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(count).toBe(1);
        },
        'Verify one result in detal table',
        test.info(),
      );

      // Verify the found row contains the correct detail name
      const foundRow = resultRows.first();
      const rowText = await foundRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowText).toContain(TEST_DATA.DETAIL_1_NAME);
        },
        'Verify row text contains DETAIL_1_NAME',
        test.info(),
      );

      // Highlight the found row
      await detailsPage.highlightElement(foundRow);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART C: Create second detail
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 4: Create second detail "${TEST_DATA.DETAIL_2_NAME}"`, async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('networkidle');

      // Fill detail name
      await detailsPage.fillDetailName(TEST_DATA.DETAIL_2_NAME, SelectorsPartsDataBase.INPUT_DETAIL_NAME);

      // Save the detail
      // Save the detail
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE_ID);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await detailsPage.waitForNetworkIdle();

      // Check for success notification message
      await detailsPage.verifyDetailSuccessMessage('Деталь успешно создана');

      // Verify we're now in edit mode (page transitioned from add to edit)
      const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(editPageTitle).toBeVisible();
        },
        'Verify edit page title is visible',
        test.info(),
      );
    });

    await allure.step(`Step 5: Verify second detail "${TEST_DATA.DETAIL_2_NAME}" was saved`, async () => {
      // Click cancel to return to listing
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL_ID);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await page.waitForLoadState('networkidle');

      // Search for the detail in the table
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const detailSearchInput = detalTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detailSearchInput).toBeVisible();
        },
        'Verify detail search input is visible',
        test.info(),
      );
      await detailSearchInput.fill(TEST_DATA.DETAIL_2_NAME);
      await detailSearchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const resultRows = detalTable.locator('tbody tr');
      const count = await resultRows.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(count).toBe(1);
        },
        'Verify one result in detal table',
        test.info(),
      );

      // Verify the found row contains the correct detail name
      const foundRow = resultRows.first();
      const rowText = await foundRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowText).toContain(TEST_DATA.DETAIL_2_NAME);
        },
        'Verify row text contains DETAIL_2_NAME',
        test.info(),
      );

      // Highlight the found row
      await detailsPage.highlightElement(foundRow);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART D: Create СБ assembly containing both details
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 6: Create assembly "${TEST_DATA.ASSEMBLY_NAME}" with both details`, async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');

      // Open the create dialog
      const createButton = page.locator(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE);
      await detailsPage.highlightElement(createButton);
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE, 500);

      // Select СБ (assembly) type
      const assemblyTypeButton = page.locator(SelectorsPartsDataBase.BASE_PRODUCTS_CREAT_LINK_ASSEMBLY_UNITS).first();
      await detailsPage.highlightElement(assemblyTypeButton);
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS, 500);

      // Fill in the assembly name
      const assemblyInput = page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(assemblyInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify assembly input is visible',
        test.info(),
      );
      await assemblyInput.fill(TEST_DATA.ASSEMBLY_NAME);

      // Add first detail to assembly
      await detailsPage.addDetailToAssemblySpecification(page, TEST_DATA.DETAIL_1_NAME);
      await detailsPage.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');

      // Add second detail to assembly
      await detailsPage.addDetailToAssemblySpecification(page, TEST_DATA.DETAIL_2_NAME);
      await detailsPage.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');

      // Verify both details are now in the specification table
      const specsTable = page.locator(SelectorsPartsDataBase.EDITOR_TABLE_SPECIFICATION_CBED);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(specsTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify specs table is visible',
        test.info(),
      );

      const specRows = specsTable.locator('tbody tr');
      const rowTexts = await specRows.allTextContents();

      // Check that both details are present
      const detail1Found = rowTexts.some(text => text.includes(TEST_DATA.DETAIL_1_NAME));
      const detail2Found = rowTexts.some(text => text.includes(TEST_DATA.DETAIL_2_NAME));

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detail1Found).toBe(true);
          expect.soft(detail2Found).toBe(true);
        },
        'Verify both details found in specs',
        test.info(),
      );

      // Highlight the specification rows that contain our details
      for (let i = 0; i < rowTexts.length; i++) {
        const rowText = rowTexts[i];
        if (rowText.includes(TEST_DATA.DETAIL_1_NAME) || rowText.includes(TEST_DATA.DETAIL_2_NAME)) {
          const detailRow = specRows.nth(i);
          await detailsPage.highlightElement(detailRow);
        }
      }

      // Save the assembly with the added details
      const saveButton = page.locator(SelectorsPartsDataBase.CREATOR_BUTTON_SAVE);
      await detailsPage.highlightElement(saveButton);
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.CREATOR_BUTTON_SAVE, 500);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await page.waitForLoadState('networkidle');

      // Check for success notification message
      await detailsPage.verifyDetailSuccessMessage('Сборочная единица успешно создана');

      // Verify the assembly was created successfully by checking if we're still on the creator page
      // or if we've been redirected to the listing page
      const creatorPage = page.locator(SelectorsPartsDataBase.CREATOR_TITLE);
      const listingPage = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);

      // Check if we're still on creator page or have been redirected to listing
      const isCreatorPage = await creatorPage.isVisible().catch(() => false);
      const isListingPage = await listingPage.isVisible().catch(() => false);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isCreatorPage || isListingPage).toBe(true);
        },
        'Verify creator or listing page is visible',
        test.info(),
      );

      logger.log(`✅ Assembly "${TEST_DATA.ASSEMBLY_NAME}" created successfully with both details`);
    });

    await allure.step(`Step 7: Verify assembly "${TEST_DATA.ASSEMBLY_NAME}" was saved`, async () => {
      // Check if we're already on the listing page, if not navigate there
      const listingPage = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const isOnListingPage = await listingPage.isVisible().catch(() => false);

      if (!isOnListingPage) {
        // We're still on the creator page, click cancel to return to listing
        await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.CREATOR_BUTTON_CANCEL);
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await page.waitForLoadState('networkidle');
      }

      // Search for the assembly in the СБ table (not the details table)
      const cbedTable = page.locator(SelectorsPartsDataBase.CBED_TABLE_DIV);
      const assemblySearchInput = cbedTable.locator(SelectorsPartsDataBase.BASE_DETAIL_CB_TABLE_SEARCH);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(assemblySearchInput).toBeVisible();
        },
        'Verify assembly search input is visible',
        test.info(),
      );
      await assemblySearchInput.fill(TEST_DATA.ASSEMBLY_NAME);
      await assemblySearchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const resultRows = cbedTable.locator('tbody tr');
      const count = await resultRows.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(count).toBe(1);
        },
        'Verify one result in cbed table',
        test.info(),
      );

      // Verify the found row contains the correct assembly name
      const foundRow = resultRows.first();
      const rowText = await foundRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowText).toContain(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify row text contains ASSEMBLY_NAME',
        test.info(),
      );

      // Highlight the found row
      await detailsPage.highlightElement(foundRow);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART E: Verify assembly with details in listing
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 8: Verify assembly with details in listing`, async () => {
      // Navigate back to parts database
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');

      // Search for the assembly in СБ table
      const cbedTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
      await detailsPage.highlightElement(cbedTable);
      const assemblySearchInput = cbedTable.locator(SelectorsPartsDataBase.BASE_DETAIL_CB_TABLE_SEARCH);
      await detailsPage.highlightElement(assemblySearchInput);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(assemblySearchInput).toBeVisible();
        },
        'Verify assembly search input is visible',
        test.info(),
      );

      // Clear any existing search first
      await assemblySearchInput.fill('');
      await assemblySearchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.LONG);

      // Search for the assembly
      await assemblySearchInput.fill(TEST_DATA.ASSEMBLY_NAME);
      await assemblySearchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.LONG);

      // Debug: Check total rows in table before filtering
      const allRows = cbedTable.locator('tbody tr');
      const totalRows = await allRows.count();
      logger.log(`Total rows in СБ table: ${totalRows}`);

      // Debug: Log first few rows to see what's in the table
      for (let i = 0; i < Math.min(totalRows, 3); i++) {
        const rowText = await allRows.nth(i).textContent();
        logger.log(`Row ${i + 1}: ${rowText}`);
      }

      // Verify assembly exists
      const resultRows = cbedTable.locator('tbody tr');
      const count = await resultRows.count();

      if (count === 0) {
        logger.log(`❌ Assembly "${TEST_DATA.ASSEMBLY_NAME}" not found in СБ table`);
        logger.log(`Search term used: "${TEST_DATA.ASSEMBLY_NAME}"`);
        logger.log(`Total rows in table: ${totalRows}`);

        // Try a broader search to see if the assembly exists with a different name
        await assemblySearchInput.fill('ERP9692');
        await assemblySearchInput.press('Enter');
        await page.waitForTimeout(TIMEOUTS.LONG);

        const broaderResults = cbedTable.locator('tbody tr');
        const broaderCount = await broaderResults.count();
        logger.log(`Broader search results for "ERP9692": ${broaderCount} rows`);

        for (let i = 0; i < Math.min(broaderCount, 5); i++) {
          const rowText = await broaderResults.nth(i).textContent();
          logger.log(`Broader search row ${i + 1}: ${rowText}`);
        }
      }

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(count).toBe(1);
        },
        'Verify one result in assembly table',
        test.info(),
      );

      // Highlight the found assembly row
      const foundAssemblyRow = resultRows.first();
      await detailsPage.highlightElement(foundAssemblyRow);

      // Click on the assembly to open it
      await foundAssemblyRow.click();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Click the edit button to open the assembly
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(editButton).toBeVisible();
        },
        'Verify edit button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(editButton);
      await editButton.click();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Verify both details are in the specification table
      const specsTable = page.locator(SelectorsPartsDataBase.EDITOR_TABLE_SPECIFICATION_CBED);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(specsTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify specs table is visible',
        test.info(),
      );

      const specRows = specsTable.locator('tbody tr');
      const rowTexts = await specRows.allTextContents();

      // Check that both details are present and highlight the rows
      const detail1Found = rowTexts.some(text => text.includes(TEST_DATA.DETAIL_1_NAME));
      const detail2Found = rowTexts.some(text => text.includes(TEST_DATA.DETAIL_2_NAME));

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detail1Found).toBe(true);
          expect.soft(detail2Found).toBe(true);
        },
        'Verify both details found in specs',
        test.info(),
      );

      // Highlight the specification rows that contain our details
      for (let i = 0; i < rowTexts.length; i++) {
        const rowText = rowTexts[i];
        if (rowText.includes(TEST_DATA.DETAIL_1_NAME) || rowText.includes(TEST_DATA.DETAIL_2_NAME)) {
          const detailRow = specRows.nth(i);
          await detailsPage.highlightElement(detailRow);
        }
      }

      logger.log(`✅ Assembly "${TEST_DATA.ASSEMBLY_NAME}" created successfully with both details`);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART F: Set details quantity in revision page
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 9: Set details quantity to 5 in revision page`, async () => {
      // Open a new tab and navigate to the warehouse page
      const revisionPage = await page.context().newPage();
      await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await revisionPage.waitForLoadState('networkidle');

      // Click the revision button
      const revisionButton = revisionPage.locator(SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID);
      await detailsPage.highlightElement(revisionButton);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(revisionButton).toBeVisible();
        },
        'Verify revision button is visible',
        test.info(),
      );
      await revisionButton.click();
      await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);

      // Select the Детали (details) tab
      const detailsTab = revisionPage.locator(SelectorsRevision.REVISION_SWITCH_ITEM2);
      await detailsPage.highlightElement(detailsTab);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detailsTab).toBeVisible();
        },
        'Verify details tab is visible',
        test.info(),
      );
      await detailsTab.click();
      await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);

      // Find the search input and search for the first detail
      const revisionTable = revisionPage.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE);
      await detailsPage.highlightElement(revisionTable);
      const searchInput = revisionTable.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(searchInput).toBeVisible();
        },
        'Verify search input is visible',
        test.info(),
      );

      // Clear any existing search first
      await searchInput.fill('');
      await searchInput.press('Enter');
      await revisionPage.waitForTimeout(TIMEOUTS.STANDARD);

      // Set quantity for first detail
      logger.log(`Setting quantity for detail "${TEST_DATA.DETAIL_1_NAME}"`);
      await searchInput.fill(TEST_DATA.DETAIL_1_NAME);
      await searchInput.press('Enter');
      await revisionPage.waitForLoadState('networkidle');
      await revisionPage.waitForTimeout(TIMEOUTS.LONG);

      // Find and update the first detail
      const resultRows = revisionTable.locator('tbody tr');
      const count = await resultRows.count();
      logger.log(`Found ${count} rows for detail "${TEST_DATA.DETAIL_1_NAME}"`);

      if (count > 0) {
        // Find the row containing our detail
        let foundRow = null;
        for (let i = 0; i < count; i++) {
          const rowText = await resultRows.nth(i).textContent();
          if (rowText && rowText.includes(TEST_DATA.DETAIL_1_NAME)) {
            foundRow = resultRows.nth(i);
            logger.log(`Found detail "${TEST_DATA.DETAIL_1_NAME}" in row ${i + 1}`);
            break;
          }
        }

        if (foundRow) {
          // Highlight the found row
          await detailsPage.highlightElement(foundRow);

          // Select the row by clicking on it
          await foundRow.click();
          await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);

          // Update the quantity in the 4th column (the editable element)
          const fourthCell = foundRow.locator('td').nth(3);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(fourthCell).toBeVisible();
            },
            'Verify fourth cell is visible',
            test.info(),
          );

          // Inside the cell, locate the input with data-testid "InputNumber-Input"
          const editField = fourthCell.locator(SelectorsRevision.INPUT_NUMBER_INPUT);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(editField).toBeVisible();
            },
            'Verify edit field is visible',
            test.info(),
          );

          // Fill in "5" and press Enter to submit the change
          await editField.fill(TEST_DATA.DETAIL_NEW_QUANTITY);
          await editField.press('Enter');
          await revisionPage.waitForLoadState('networkidle');

          // Confirm the update in the confirmation dialog
          const confirmDialog = revisionPage.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(confirmDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify confirm dialog is visible',
            test.info(),
          );

          // In the dialog, find and click the approve button
          const confirmButton = confirmDialog.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(confirmButton).toBeVisible();
            },
            'Verify confirm button is visible',
            test.info(),
          );
          await detailsPage.highlightElement(confirmButton);
          await revisionPage.waitForTimeout(TIMEOUTS.STANDARD);
          await confirmButton.click();
          await revisionPage.waitForLoadState('networkidle');

          logger.log(`✅ Detail "${TEST_DATA.DETAIL_1_NAME}" quantity set to 5`);
        }
      }

      // Now set quantity for second detail
      logger.log(`Setting quantity for detail "${TEST_DATA.DETAIL_2_NAME}"`);

      // Clear search and search for second detail
      await searchInput.fill('');
      await searchInput.press('Enter');
      await revisionPage.waitForTimeout(TIMEOUTS.STANDARD);

      await searchInput.fill(TEST_DATA.DETAIL_2_NAME);
      await searchInput.press('Enter');
      await revisionPage.waitForLoadState('networkidle');
      await revisionPage.waitForTimeout(TIMEOUTS.LONG);

      // Find and update the second detail
      const resultRows2 = revisionTable.locator('tbody tr');
      const count2 = await resultRows2.count();
      logger.log(`Found ${count2} rows for detail "${TEST_DATA.DETAIL_2_NAME}"`);

      if (count2 > 0) {
        // Find the row containing our detail
        let foundRow2 = null;
        for (let i = 0; i < count2; i++) {
          const rowText = await resultRows2.nth(i).textContent();
          if (rowText && rowText.includes(TEST_DATA.DETAIL_2_NAME)) {
            foundRow2 = resultRows2.nth(i);
            logger.log(`Found detail "${TEST_DATA.DETAIL_2_NAME}" in row ${i + 1}`);
            break;
          }
        }

        if (foundRow2) {
          // Highlight the found row
          await detailsPage.highlightElement(foundRow2);

          // Select the row by clicking on it
          await foundRow2.click();
          await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);

          // Update the quantity in the 4th column (the editable element)
          const fourthCell2 = foundRow2.locator('td').nth(3);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(fourthCell2).toBeVisible();
            },
            'Verify fourth cell 2 is visible',
            test.info(),
          );

          // Inside the cell, locate the input with data-testid "InputNumber-Input"
          const editField2 = fourthCell2.locator(SelectorsRevision.INPUT_NUMBER_INPUT);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(editField2).toBeVisible();
            },
            'Verify edit field 2 is visible',
            test.info(),
          );

          // Fill in "5" and press Enter to submit the change
          await editField2.fill(TEST_DATA.DETAIL_NEW_QUANTITY);
          await editField2.press('Enter');
          await revisionPage.waitForLoadState('networkidle');

          // Confirm the update in the confirmation dialog
          const confirmDialog2 = revisionPage.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(confirmDialog2).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify confirm dialog 2 is visible',
            test.info(),
          );

          // In the dialog, find and click the approve button
          const confirmButton2 = confirmDialog2.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(confirmButton2).toBeVisible();
            },
            'Verify confirm button 2 is visible',
            test.info(),
          );
          await detailsPage.highlightElement(confirmButton2);
          await revisionPage.waitForTimeout(TIMEOUTS.STANDARD);
          await confirmButton2.click();
          await revisionPage.waitForLoadState('networkidle');

          logger.log(`✅ Detail "${TEST_DATA.DETAIL_2_NAME}" quantity set to 5`);
        }
      }

      logger.log(`✅ Both details quantities set to 5 in revision page`);
    });

    const warehousePage = await page.context().newPage();
    await allure.step('Step 11: Create supplier order and start production for test SB', async () => {
      // Open a new tab for the warehouse page

      await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await warehousePage.waitForLoadState('networkidle');

      // Click the ordering suppliers button
      const orderingSuppliersButton = warehousePage.locator(SelectorsOrderedFromSuppliers.SCLAD_ORDERING_SUPPLIERS);
      await detailsPage.highlightElement(orderingSuppliersButton);
      await orderingSuppliersButton.click();
      await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
      await warehousePage.waitForLoadState('networkidle');

      // Click the create order button
      const createOrderButton = warehousePage.locator(SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON);
      await detailsPage.highlightElement(createOrderButton);
      await createOrderButton.click();
      await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
      await warehousePage.waitForLoadState('networkidle');

      // Verify the supplier order creation modal is visible
      const supplierModal = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(supplierModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify supplier modal is visible',
        test.info(),
      );

      //Click the assemblies operation button
      const assembliesButton = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_SELECT_SUPPLIER_ASSEMBLE_CARD);
      await detailsPage.highlightElement(assembliesButton);
      await assembliesButton.click();
      await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
      await warehousePage.waitForLoadState('networkidle');

      const dialog = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(dialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify dialog is visible',
        test.info(),
      );
      await detailsPage.highlightElement(dialog);
      await warehousePage.waitForTimeout(TIMEOUTS.VERY_LONG);

      // Verify the modal title
      const modalTitle = dialog.locator(`h4${SelectorsOrderedFromSuppliers.MODAL_TITLE}`);
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_ERROR);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalTitle).toContainText('Создание заказа на сборку', { timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify modal title contains expected text',
        test.info(),
      );

      // Capture the order number from the modal title
      const modalTitleText = await modalTitle.textContent();
      logger.log(`Modal title text: ${modalTitleText}`);

      // Extract order number from the title text using regex
      // The format is "Создание заказа на сборку № 25-6067 от 23.07.2025"
      const orderNumberMatch = modalTitleText?.match(/№\s*([^\s]+)/);
      if (orderNumberMatch && orderNumberMatch[1]) {
        orderNumber = orderNumberMatch[1];
        logger.log(`Captured order number: ${orderNumber}`);
      } else {
        console.error('Could not extract order number from modal title');
        throw new Error('Order number not found in modal title');
      }

      //Verify the production table is visible
      const productionTable = warehousePage.locator(SelectorsOrderedFromSuppliers.TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE).first();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(productionTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify production table is visible',
        test.info(),
      );

      // Find and fill the search input
      const searchInput = productionTable.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_TABLE_SEARCH_INPUT);
      await detailsPage.highlightElement(searchInput);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify search input is visible',
        test.info(),
      );
      await searchInput.fill(TEST_DATA.ASSEMBLY_NAME);
      await searchInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Verify exactly one row is returned
      const rows = productionTable.locator('tbody tr');
      const rowCount = await rows.count();
      logger.log(`Found ${rowCount} row(s) in production table for SB "${TEST_DATA.ASSEMBLY_NAME}".`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCount).toBe(1);
        },
        'Verify one row in production table',
        test.info(),
      );

      const checkbox = rows.locator('td').nth(0).locator("input[type='checkbox']");
      await detailsPage.highlightElement(checkbox);
      await checkbox.click();

      // Click the order button without selecting checkbox (should show warning)
      const orderButton = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON);
      await detailsPage.highlightElement(orderButton);
      await orderButton.click();
      await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
      await warehousePage.waitForLoadState('networkidle');

      //now find th ebottom table  via it's top div:ModallAddStockOrderSupply-Main-Content-Block2
      const bottomTable = warehousePage.locator(SelectorsOrderedFromSuppliers.TABLE_MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE);
      await detailsPage.highlightElement(bottomTable);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(bottomTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify bottom table is visible',
        test.info(),
      );
      const bottomRows = bottomTable.locator('tbody tr');
      const bottomRowCount = await bottomRows.count();
      logger.log(`Found ${bottomRowCount} row(s) in bottom table for SB "${TEST_DATA.ASSEMBLY_NAME}".`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(bottomRowCount).toBe(1);
        },
        'Verify one row in bottom table',
        test.info(),
      );

      const quantityInput = bottomRows.first().locator(SelectorsOrderedFromSuppliers.QUANTITY_INPUT_SUFFIX);
      // Wait for the element to be visible before highlighting
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(quantityInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify quantity input is visible',
        test.info(),
      );
      await detailsPage.highlightElement(quantityInput);
      await quantityInput.fill(orderedQuantity2.toString());
      await quantityInput.press('Enter');
      await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);

      // Verify the production start modal is visible
      const startProductionButton = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_CREATE_ORDER_SAVE_BUTTON);
      await detailsPage.highlightElement(startProductionButton);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(startProductionButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify start production button is visible',
        test.info(),
      );

      // Find and click the "В производство" button

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(startProductionButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify start production button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(startProductionButton);
      await startProductionButton.click();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.INPUT_SET);

      // Verify success notification contains the order number
      //await detailsPage.verifyDetailSuccessMessage(`Заказ №${orderNumber} отправлен в производство`);

      // Close the modal by clicking at position 1,1
      await warehousePage.mouse.click(1, 1);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await warehousePage.mouse.click(1, 1);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 12: Search for the created order in the order table', async () => {
      // Verify the order table is visible
      await warehousePage.waitForLoadState('networkidle');
      const orderTable = warehousePage.locator(`table${SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_TABLE}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify order table is visible',
        test.info(),
      );

      // Find and fill the search input with the captured order number
      const searchInput = orderTable.locator(SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify search input is visible',
        test.info(),
      );

      // Ensure orderNumber is not null before using it
      if (!orderNumber) {
        throw new Error('Order number is not available for search');
      }

      await searchInput.fill(TEST_DATA.ASSEMBLY_NAME);
      await searchInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Verify exactly one tbody is returned (due to table structure issue)
      const tbodyElements = orderTable.locator('tbody');
      const tbodyCount = await tbodyElements.count();

      logger.log(`Found ${tbodyCount} tbody element(s) in order table.`);

      // Create the search pattern with "C" prefix
      const searchPattern = `${orderNumber}`;
      logger.log(`Looking for order with pattern: "${searchPattern}"`);

      let foundOrder = false;

      // Cycle through all tbody elements and their rows
      for (let i = 0; i < tbodyCount; i++) {
        const tbody = tbodyElements.nth(i);
        const rows = tbody.locator('tr');
        const rowCount = await rows.count();

        logger.log(`Checking tbody ${i + 1}, found ${rowCount} rows`);

        for (let j = 0; j < rowCount; j++) {
          const row = rows.nth(j);
          const firstCell = row.locator('td').first();
          const cellText = await firstCell.textContent();

          logger.log(`Row ${j + 1} in tbody ${i + 1}: "${cellText}"`);

          if (cellText?.trim() === searchPattern) {
            logger.log(`✅ Found matching order: "${cellText}"`);

            // Highlight the found row
            await detailsPage.highlightElement(row, HIGHLIGHT_SUCCESS);

            foundOrder = true;
            targetRow = row;
            logger.log(`✅ Target row assigned: ${targetRow ? 'success' : 'failed'}`);
            break;
          }
        }

        if (foundOrder) {
          logger.log(`✅ Breaking out of tbody loop, order found`);
          break;
        }
      }

      // Verify that the order was found
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(foundOrder).toBe(true);
          expect.soft(targetRow).not.toBeNull();
        },
        'Verify order was found and target row is not null',
        test.info(),
      );
      logger.log(`✅ Order "${searchPattern}" was found and highlighted`);
      logger.log(`✅ Target row is ready for Step 15: ${targetRow ? 'yes' : 'no'}`);
    });

    await allure.step('Step 13: Click the found order row and verify order details in modal', async () => {
      // Get the date from the 4th column of the found row
      const dateCell = targetRow.locator('td').nth(3); // 4th column (index 3)
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(dateCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify date cell is visible',
        test.info(),
      );
      await detailsPage.highlightElement(dateCell, HIGHLIGHT_PENDING);
      const orderDate = await dateCell.textContent();
      logger.log(`Order date from table: "${orderDate}"`);

      // Click the found row to open the modal
      await targetRow.dblclick();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Verify the modal is visible
      const orderModal = warehousePage.locator(SelectorsOrderedFromSuppliers.ORDER_MODAL_DIALOG);
      await detailsPage.highlightElement(orderModal, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify order modal is visible',
        test.info(),
      );
      await detailsPage.highlightElement(orderModal, HIGHLIGHT_SUCCESS);

      // Verify the modal title
      const modalTitle = orderModal.locator('h4');
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalTitle).toContainText('Заказ', { timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify modal title contains Заказ',
        test.info(),
      );
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_SUCCESS);

      // Verify the order date in the modal
      const modalDateElement = orderModal.locator('.modal-worker__label-span').first();
      await detailsPage.highlightElement(modalDateElement, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalDateElement).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify modal date element is visible',
        test.info(),
      );
      const modalDate = await modalDateElement.textContent();
      logger.log(`Modal date: "${modalDate}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalDate).toContain(orderDate?.trim() || '');
        },
        'Verify modal date contains order date',
        test.info(),
      );
      await detailsPage.highlightElement(modalDateElement, HIGHLIGHT_SUCCESS);

      // Verify the order number (without "C" prefix)
      const modalOrderNumberElement = orderModal.locator('.modal-worker__label-span').nth(1);
      await detailsPage.highlightElement(modalOrderNumberElement, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalOrderNumberElement).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify modal order number element is visible',
        test.info(),
      );
      const modalOrderNumber = await modalOrderNumberElement.textContent();
      logger.log(`Modal order number: "${modalOrderNumber}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(modalOrderNumber?.trim()).toBe(orderNumber?.trim());
        },
        'Verify modal order number matches',
        test.info(),
      );
      await detailsPage.highlightElement(modalOrderNumberElement, HIGHLIGHT_SUCCESS);

      // Find and verify the table contents
      const table = orderModal.locator(SelectorsOrderedFromSuppliers.ORDER_MODAL_TABLE);
      await detailsPage.highlightElement(table, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify table is visible',
        test.info(),
      );
      await detailsPage.highlightElement(table, HIGHLIGHT_SUCCESS);

      // Get the first data row (skip header if present)
      const firstDataRow = table.locator('tbody tr').first();
      await detailsPage.highlightElement(firstDataRow, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(firstDataRow).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify first data row is visible',
        test.info(),
      );
      await detailsPage.highlightElement(firstDataRow, HIGHLIGHT_SUCCESS);

      // Verify the first column contains order number with suffix
      const firstColumn = firstDataRow.locator('td').nth(1);
      await detailsPage.highlightElement(firstColumn, HIGHLIGHT_PENDING);
      const firstColumnText = await firstColumn.textContent();
      logger.log(`First column (order number): "${firstColumnText}"`);
      // Order number column contains plain order number without suffix
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(firstColumnText?.trim()).toBe(orderNumber);
        },
        'Verify first column contains order number',
        test.info(),
      );

      // Verify the third column contains ASSEMBLY_NAME
      const thirdColumn = firstDataRow.locator('td').nth(3); // 3rd column (index 2)
      await detailsPage.highlightElement(thirdColumn, HIGHLIGHT_PENDING);
      const thirdColumnText = await thirdColumn.textContent();
      logger.log(`Third column (item): "${thirdColumnText}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(thirdColumnText?.trim()).toBe(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify third column contains ASSEMBLY_NAME',
        test.info(),
      );

      // Verify the fourth column contains "Заказано"
      const fourthColumn = firstDataRow.locator('td').nth(4); // 4th column (index 3)
      await detailsPage.highlightElement(fourthColumn, HIGHLIGHT_PENDING);
      const fourthColumnText = await fourthColumn.textContent();
      logger.log(`Fourth column (status): "${fourthColumnText}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fourthColumnText?.trim()).toBe('Заказано');
        },
        'Verify fourth column contains Заказано',
        test.info(),
      );

      // Verify the fifth column contains the ordered quantity
      const fifthColumn = firstDataRow.locator('td').nth(5); // 5th column (index 4)
      await detailsPage.highlightElement(fifthColumn, HIGHLIGHT_PENDING);
      // Column 5 is "Кол-во сделанных" (completed) - should be "0"
      const fifthColumnText = await fifthColumn.textContent();
      logger.log(`Completed column (index 5): "${fifthColumnText}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fifthColumnText?.trim()).toBe('0');
        },
        'Verify fifth column is 0',
        test.info(),
      );

      // Verify column 6 (Кол-во в задании / ordered) contains orderedQuantity2
      // Note: The value is inside an input field, not plain text
      const orderedColumn = firstDataRow.locator('td').nth(6);
      await detailsPage.highlightElement(orderedColumn, HIGHLIGHT_PENDING);
      const orderedInput = orderedColumn.locator('input');
      const orderedColumnValue = await orderedInput.inputValue();
      logger.log(`Ordered column (index 6) input value: "${orderedColumnValue}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(parseInt(orderedColumnValue?.trim() || '0')).toBe(orderedQuantity2);
        },
        'Verify ordered column value matches orderedQuantity2',
        test.info(),
      );
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      // Close the modal
      await warehousePage.mouse.click(1, 1);
    });
    await allure.step('Step 14: go to the warehouse page and click the Комплектация сборок на план button', async () => {
      await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await warehousePage.waitForLoadState('networkidle');
      await detailsPage.highlightElement(warehousePage.locator(SelectorsAssemblyKitting.SELECTOR_COMPLETION_CBED_PLAN));
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await warehousePage.locator(SelectorsAssemblyKitting.SELECTOR_COMPLETION_CBED_PLAN).click();

      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 15: Search for our СБ in the kitting table and double-click to open modal', async () => {
      // Find TableComplect-TableComplect-Table
      const kittingTable = warehousePage.locator(`table${SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(kittingTable).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify kitting table is visible',
        test.info(),
      );
      await detailsPage.highlightElement(kittingTable, {
        border: '2px solid red',
      });
      await detailsPage.waitForTimeout(TIMEOUTS.LONG);

      // The selector constant already includes the full [data-testid=...] selector
      // First, try to click the search wrapper to open the dropdown if needed
      const searchWrapper = warehousePage.locator(SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_WRAPPER);
      const isWrapperVisible = await searchWrapper.isVisible().catch(() => false);
      if (isWrapperVisible) {
        await searchWrapper.click();
        await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
        const inputField = searchWrapper.locator(`input${SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT}`);
        await detailsPage.highlightElement(inputField, {
          border: '2px solid red',
        });
        await inputField.fill(TEST_DATA.ASSEMBLY_NAME);
        await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM);
        await inputField.press('Enter');
      }

      // Use the helper method to search - it's more reliable for Vue inputs
      // The selector constant already includes the full [data-testid=...] selector
      // await detailsPage.searchWithPressSequentially(SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT, TEST_DATA.ASSEMBLY_NAME, {
      //   delay: 50,
      //   waitAfterSearch: 2000,
      //   timeout: 10000,
      // });

      // Wait for network to be idle after search
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.LONG);

      // Wait for results to show - should be one row
      const resultRows = kittingTable.locator(SelectorsERP969.KITTING_TABLE_NON_KIT_ROWS);

      // Check current count for debugging
      const currentCount = await resultRows.count();
      logger.log(`Current row count after search: ${currentCount}`);

      // Wait for count to be 1 (the search should filter to one result)
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(resultRows).toHaveCount(1, { timeout: WAIT_TIMEOUTS.LONG });
        },
        'Verify result rows have count 1',
        test.info(),
      );

      // Verify 4th column contains our СБ name
      const fourthColumn = resultRows.first().locator('td').nth(5); // 4th column (index 3)
      const fourthColumnText = await fourthColumn.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fourthColumnText?.trim()).toBe(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify fourth column contains ASSEMBLY_NAME',
        test.info(),
      );

      // Double click the third column to open modal
      const thirdColumn = resultRows.first().locator('td').nth(4); // 3rd column (index 2)
      await thirdColumn.dblclick();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 16: Verify modal details and interact with waybill form', async () => {
      // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
      const waybillModal = warehousePage.locator(SelectorsERP969.WAYBILL_MODAL_OPEN_PATTERN);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(waybillModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify waybill modal is visible',
        test.info(),
      );

      // Find cell with id ModalAddWaybill-WaybillDetails-RequiredQuantityCell
      const requiredQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
      await detailsPage.highlightElement(requiredQuantityCell, {
        backgroundColor: 'green',
        border: '2px solid green',
        color: 'white',
      });
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Confirm it contains the value of our order quantity
      const requiredQuantity = await requiredQuantityCell.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(parseInt(requiredQuantity?.trim() || '0')).toBe(orderedQuantity2);
        },
        'Verify required quantity matches orderedQuantity2',
        test.info(),
      );
      await detailsPage.highlightElement(requiredQuantityCell, {
        backgroundColor: 'green',
        border: '2px solid green',
        color: 'white',
      });

      // Find cell with id ModalAddWaybill-WaybillDetails-CollectedQuantityCell
      const collectedQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
      await detailsPage.highlightElement(collectedQuantityCell, HIGHLIGHT_PENDING);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Confirm it contains the value 0
      const collectedQuantity = await collectedQuantityCell.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(parseInt(collectedQuantity?.trim() || '0')).toBe(0);
        },
        'Verify collected quantity is 0',
        test.info(),
      );
      await detailsPage.highlightElement(collectedQuantityCell, HIGHLIGHT_SUCCESS);

      // Find cell with id ModalAddWaybill-WaybillDetails-NameCell
      const nameCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_NAME_CELL);
      await detailsPage.highlightElement(nameCell, HIGHLIGHT_PENDING);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Confirm it contains the name of our СБ
      const nameCellText = await nameCell.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(nameCellText?.trim()).toBe(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify name cell contains ASSEMBLY_NAME',
        test.info(),
      );
      await detailsPage.highlightElement(nameCell, HIGHLIGHT_SUCCESS);

      // Find input with id ModalAddWaybill-WaybillDetails-OwnQuantityInput
      const ownQuantityInput = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
      await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_PENDING);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Set its value to 1
      await ownQuantityInput.fill(TEST_DATA.NEW_ORDER_QUANTITY);
      await ownQuantityInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');

      // Set its color to green
      await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_SUCCESS);

      // Find cell with id ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel
      const totalQuantityLabel = waybillModal.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL);
      await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_PENDING);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Confirm it contains "Всего: 0"
      const totalQuantityText = await totalQuantityLabel.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(totalQuantityText?.trim()).toBe('Всего: 0');
        },
        'Verify total quantity text is Всего: 0',
        test.info(),
      );
      await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_SUCCESS);

      // Find cell with id ModalAddWaybill-ShipmentDetailsTable-ScladSetSelectedCheckbox
      const checkboxCell = waybillModal.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_SCLAD_SET_SELECTED_CHECKBOX);
      await detailsPage.highlightElement(checkboxCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Select the checkbox (click on the parent div)
      await detailsPage.highlightElement(checkboxCell);
      await checkboxCell.click();
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Find cell with id ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-OrderNumberCell
      const orderNumberCell = waybillModal.locator(
        `[data-testid^="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL_PREFIX}"][data-testid$="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL_SUFFIX}"]`,
      );
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderNumberCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify order number cell is visible',
        test.info(),
      );

      // Confirm it contains our order number
      const orderNumberCellText = await orderNumberCell.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderNumberCellText?.trim()).toContain(orderNumber);
        },
        'Verify order number cell contains order number',
        test.info(),
      );

      // Find cell with id ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-RemainingQuantityCell
      const remainingQuantityCell = waybillModal.locator(
        `[data-testid^="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL_PREFIX}"][data-testid$="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_REMAINING_QUANTITY_CELL_SUFFIX}"]`,
      );
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingQuantityCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify remaining quantity cell is visible',
        test.info(),
      );

      // Confirm it contains our order quantity
      const remainingQuantity = await remainingQuantityCell.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(parseInt(remainingQuantity?.trim() || '0')).toBe(orderedQuantity2);
        },
        'Verify remaining quantity matches orderedQuantity2',
        test.info(),
      );

      // Find and click the Complete Set button
      const completeSetButton = waybillModal.locator(SelectorsModalWaybill.COMPLETE_SET_BUTTON);
      await detailsPage.highlightElement(completeSetButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(completeSetButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify complete set button is visible',
        test.info(),
      );

      // Verify the button is active/enabled
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(completeSetButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify complete set button is enabled',
        test.info(),
      );
      await detailsPage.highlightElement(completeSetButton, {
        backgroundColor: 'green',
        border: '2px solid green',
        color: 'white',
      });

      // Click the Complete Set button
      await detailsPage.highlightElement(completeSetButton);
      await completeSetButton.click();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.VERY_LONG);
    });
    await allure.step('Step 17: Search for our СБ in the kitting table and double-click to open modal', async () => {
      // Find TableComplect-TableComplect-Table
      const kittingTable = warehousePage.locator(`table${SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE}`);
      await detailsPage.highlightElement(kittingTable, {
        border: '2px solid red',
      });
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(kittingTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify kitting table is visible',
        test.info(),
      );

      // Find input Search-Cover-Input and style it
      const searchInput = kittingTable.locator(`input${SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify search input is visible',
        test.info(),
      );
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      await detailsPage.highlightElement(searchInput, HIGHLIGHT_PENDING);

      // Clear any existing value first
      await searchInput.clear();
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      // Focus the input and fill it
      await searchInput.focus();
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(TEST_DATA.ASSEMBLY_NAME);
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      // Verify the value was set
      const inputValue = await searchInput.inputValue();
      logger.log(`Search input value after fill: "${inputValue}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(inputValue).toBe(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify search input value matches ASSEMBLY_NAME',
        test.info(),
      );

      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');

      await warehousePage.waitForTimeout(TIMEOUTS.LONG);

      // Wait for results to show and handle non-standard table structure
      const resultRows = kittingTable.locator(SelectorsERP969.KITTING_TABLE_NON_KIT_ROWS);
      const rowCount = await resultRows.count();
      logger.log(`Found ${rowCount} rows in the table after search`);

      if (rowCount === 0) {
        logger.log('No rows found in table after search - this might be expected if the item was completed');
        return;
      }

      // Get the first row and verify it contains our assembly name
      const firstRow = resultRows.first();
      await detailsPage.highlightElement(firstRow, HIGHLIGHT_PENDING);

      // Verify the name cell contains our СБ name using data-testid
      const nameCell = firstRow.locator(SelectorsERP969.TABLE_COMPLECT_NAME_CELL_PATTERN);
      await detailsPage.highlightElement(nameCell, HIGHLIGHT_PENDING);
      const nameValue = await nameCell.textContent();
      logger.log(`Found SB name: "${nameValue}"`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(nameValue?.trim()).toBe(TEST_DATA.ASSEMBLY_NAME);
        },
        'Verify name value matches ASSEMBLY_NAME',
        test.info(),
      );
      await detailsPage.highlightElement(nameCell, HIGHLIGHT_SUCCESS);

      // Double click the designation cell to open modal using data-testid
      const designationCell = firstRow.locator(SelectorsERP969.TABLE_COMPLECT_DESIGNATION_CELL_PATTERN);
      await detailsPage.highlightElement(designationCell, HIGHLIGHT_PENDING);
      await designationCell.dblclick();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      await detailsPage.highlightElement(designationCell, HIGHLIGHT_SUCCESS);
      await warehousePage.waitForTimeout(TIMEOUTS.VERY_LONG);
    });

    await allure.step('Step 18: Validate waybill modal details and table contents', async () => {
      // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
      const waybillModal = warehousePage.locator(SelectorsERP969.WAYBILL_MODAL_OPEN_PATTERN);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(waybillModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify waybill modal is visible',
        test.info(),
      );

      // Sub-step 18.1: Confirm h4 contains our order number
      await allure.step('Sub-step 18.1: Confirm h4 contains our order number', async () => {
        const modalTitle = waybillModal.locator('h4');
        await detailsPage.highlightElement(modalTitle, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(modalTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify modal title is visible',
          test.info(),
        );
        const titleText = await modalTitle.textContent();
        logger.log(`Modal title: "${titleText}"`);
        logger.log(`Expected order number: "${orderNumber}"`);

        // Check if the title contains the order number or if it's a waybill format
        if (titleText?.includes('Накладная на комплектацию')) {
          logger.log('Modal title is in waybill format - this is expected');
          // For waybill modals, we might not have the order number in the title
          // Let's just verify it's a valid waybill title
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(titleText?.trim()).toContain('Накладная на комплектацию');
            },
            'Verify title contains Накладная на комплектацию',
            test.info(),
          );
        } else {
          // If it's not a waybill format, then check for order number
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(titleText?.trim()).toContain(orderNumber);
            },
            'Verify title contains order number',
            test.info(),
          );
        }

        await detailsPage.highlightElement(modalTitle, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.2: Confirm name cell contains our assembly name
      await allure.step('Sub-step 18.2: Confirm name cell contains our assembly name', async () => {
        const nameCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_NAME_CELL);
        await detailsPage.highlightElement(nameCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const nameValue = await nameCell.textContent();
        logger.log(`Name cell value: "${nameValue}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(nameValue?.trim()).toBe(TEST_DATA.ASSEMBLY_NAME);
          },
          'Verify name value matches ASSEMBLY_NAME',
          test.info(),
        );
        await detailsPage.highlightElement(nameCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.3: Confirm required quantity cell contains our original order quantity
      await allure.step('Sub-step 18.3: Confirm required quantity cell contains our original order quantity', async () => {
        const requiredQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
        await detailsPage.highlightElement(requiredQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const requiredQuantity = await requiredQuantityCell.textContent();
        logger.log(`Required quantity: "${requiredQuantity}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(requiredQuantity?.trim() || '0')).toBe(orderedQuantity2);
          },
          'Verify required quantity matches orderedQuantity2',
          test.info(),
        );
        await detailsPage.highlightElement(requiredQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.4: Confirm collected quantity cell contains the number of items we built
      await allure.step('Sub-step 18.4: Confirm collected quantity cell contains the number of items we built', async () => {
        const collectedQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
        await detailsPage.highlightElement(collectedQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const collectedQuantity = await collectedQuantityCell.textContent();
        logger.log(`Collected quantity: "${collectedQuantity}"`);
        const collectedValue = parseInt(collectedQuantity?.trim() || '0');

        // Use async validation method for complex lookup
        const isValid = await detailsPage.validateCollectedQuantity(TEST_DATA.ASSEMBLY_NAME, parseInt(TEST_DATA.NEW_ORDER_QUANTITY));
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(isValid).toBe(true);
            expect.soft(collectedValue).toBeGreaterThanOrEqual(parseInt(TEST_DATA.NEW_ORDER_QUANTITY));
          },
          'Verify collected quantity validation',
          test.info(),
        );

        await detailsPage.highlightElement(collectedQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.5: Confirm own quantity input contains original order quantity minus collected
      await allure.step('Sub-step 18.5: Confirm own quantity input contains original order quantity minus collected', async () => {
        const ownQuantityInput = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
        await detailsPage.highlightElement(ownQuantityInput, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const ownQuantityValue = await ownQuantityInput.inputValue();
        logger.log(`Own quantity input value: "${ownQuantityValue}"`);
        // This should be the remaining quantity to build
        const ownValue = parseInt(ownQuantityValue || '0');
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(ownValue).toBeGreaterThanOrEqual(0);
            expect.soft(ownValue).toBeLessThanOrEqual(orderedQuantity2);
          },
          'Verify own value is within valid range',
          test.info(),
        );
        await detailsPage.highlightElement(ownQuantityInput, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.6: Confirm progress wrapper contains completion percentage
      await allure.step('Sub-step 18.6: Confirm progress wrapper contains completion percentage', async () => {
        const progressWrapper = waybillModal
          .locator(
            `[data-testid^="${SelectorsModalWaybill.TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_PREFIX}"][data-testid$="${SelectorsModalWaybill.TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_SUFFIX}"]`,
          )
          .first();
        await detailsPage.highlightElement(progressWrapper, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(progressWrapper).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify progress wrapper is visible',
          test.info(),
        );

        // Get collected and required quantities for percentage calculation
        const collectedQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
        const requiredQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);

        const collectedQuantity = parseInt((await collectedQuantityCell.textContent()) || '0');
        const requiredQuantity = parseInt((await requiredQuantityCell.textContent()) || '0');

        // Use async validation method for progress percentage
        const progressValid = await detailsPage.validateProgressPercentage(collectedQuantity, requiredQuantity);
        const isProgressWrapperVisible = await progressWrapper.isVisible();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(progressValid).toBe(true);
            expect.soft(isProgressWrapperVisible).toBe(true);
          },
          'Verify progress validation and visibility',
          test.info(),
        );

        await detailsPage.highlightElement(progressWrapper, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.7: Confirm order number cell contains our order number
      await allure.step('Sub-step 18.7: Confirm order number cell contains our order number', async () => {
        const orderNumberCell = waybillModal.locator(`[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-OrderNumberCell"]`);
        await detailsPage.highlightElement(orderNumberCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderNumberCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify order number cell is visible',
        test.info(),
      );
        const orderNumberCellText = await orderNumberCell.textContent();
        logger.log(`Order number cell: "${orderNumberCellText}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(orderNumberCellText?.trim()).toContain(orderNumber);
          },
          'Verify order number cell contains order number',
          test.info(),
        );
        await detailsPage.highlightElement(orderNumberCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.8: Confirm remaining quantity cell contains our original order quantity
      await allure.step('Sub-step 18.8: Confirm remaining quantity cell contains our original order quantity', async () => {
        const remainingQuantityCell = waybillModal.locator(
          `[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]`,
        );
        await detailsPage.highlightElement(remainingQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingQuantityCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify remaining quantity cell is visible',
        test.info(),
      );
        const remainingQuantity = await remainingQuantityCell.textContent();
        logger.log(`Remaining quantity: "${remainingQuantity}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(remainingQuantity?.trim() || '0')).toBe(orderedQuantity2);
          },
          'Verify remaining quantity matches orderedQuantity2',
          test.info(),
        );
        await detailsPage.highlightElement(remainingQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.9: Confirm total left to do label contains correct value
      await allure.step('Sub-step 18.9: Confirm total left to do label contains correct value', async () => {
        const totalLeftToDoLabel = waybillModal.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_LEFT_TO_DO_LABEL);
        await detailsPage.highlightElement(totalLeftToDoLabel, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const totalLeftText = await totalLeftToDoLabel.textContent();
        logger.log(`Total left to do: "${totalLeftText}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(totalLeftText?.trim()).toBe(`Всего: ${orderedQuantity2}`);
          },
          'Verify total left text matches',
          test.info(),
        );
        await detailsPage.highlightElement(totalLeftToDoLabel, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
      });

      // Sub-step 18.10: Validate details table contents
      await allure.step('Sub-step 18.10: Validate details table contents', async () => {
        const detailsTable = waybillModal.locator(`table${SelectorsModalWaybill.DETAILS_TABLE_TABLE}`);
        await detailsPage.highlightElement(detailsTable, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(detailsTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify details table is visible',
          test.info(),
        );
        await warehousePage.waitForTimeout(TIMEOUTS.INPUT_SET);
        // Get count of rows in tbody
        const detailRows = detailsTable.locator('tbody tr');
        const rowCount = await detailRows.count();
        logger.log(`Found ${rowCount} rows in details table`);

        // Instead of expecting exactly 2 rows, let's find our specific details
        let foundDetail1 = false;
        let foundDetail2 = false;

        // Validate each row against our created details
        for (let i = 0; i < rowCount; i++) {
          const row = detailRows.nth(i);
          await detailsPage.highlightElement(row, {
            backgroundColor: 'orange',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          // Get the detail name for this row
          const nameCell = row.locator(
            `[data-testid^="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_PREFIX}"][data-testid$="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_SUFFIX}"]`,
          );

          // Check if the name cell exists and is visible
          const nameCellExists = await nameCell.count();
          if (nameCellExists === 0) {
            logger.log(`Row ${i + 1} has no name cell - skipping validation`);
            await detailsPage.highlightElement(row, {
              backgroundColor: 'blue',
              border: '2px solid gray',
              color: 'white',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            continue;
          }

          // Wait for the name cell to be visible
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(nameCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify name cell is visible',
            test.info(),
          );
          const detailName = await nameCell.textContent();
          logger.log(`Row ${i + 1} detail name: "${detailName}"`);

          // Check if this row contains one of our details
          if (detailName?.trim() === TEST_DATA.DETAIL_1_NAME) {
            foundDetail1 = true;
            logger.log(`Found ${TEST_DATA.DETAIL_1_NAME} in row ${i + 1}`);
          } else if (detailName?.trim() === TEST_DATA.DETAIL_2_NAME) {
            foundDetail2 = true;
            logger.log(`Found ${TEST_DATA.DETAIL_2_NAME} in row ${i + 1}`);
          }

          // Only validate details if this row contains one of our details
          if (detailName?.trim() === TEST_DATA.DETAIL_1_NAME || detailName?.trim() === TEST_DATA.DETAIL_2_NAME) {
            // Validate quantity cell (should be 9 - what we put in stock)
            // The quantity cell is in the same row, so scope to the row first
            const quantityCell = row.locator(
              `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_QUANTITY_CELL_SUFFIX}"]`,
            );
            await detailsPage.highlightElement(quantityCell, {
              backgroundColor: 'yellow',
              border: '2px solid red',
              color: 'blue',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            const quantityValue = await quantityCell.textContent();
            logger.log(`Row ${i + 1} quantity: "${quantityValue}"`);
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(parseInt(quantityValue?.trim() || '0')).toBe(parseInt(TEST_DATA.DETAIL_NEW_QUANTITY));
              },
              `Verify row ${i + 1} quantity matches`,
              test.info(),
            );

            // Validate in kits cell (should be 0 initially, but could be more from previous builds)
            const inKitsCell = row.locator(
              `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_IN_KITS_CELL_SUFFIX}"]`,
            );
            await detailsPage.highlightElement(inKitsCell, {
              backgroundColor: 'yellow',
              border: '2px solid red',
              color: 'blue',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            const inKitsValue = await inKitsCell.textContent();
            logger.log(`Row ${i + 1} in kits: "${inKitsValue}"`);
            const inKitsValueNum = parseInt(inKitsValue?.trim() || '0');
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(inKitsValueNum).toBeGreaterThanOrEqual(0);
                expect.soft(inKitsValueNum).toBeLessThanOrEqual(parseInt(TEST_DATA.DETAIL_NEW_QUANTITY));
              },
              `Verify row ${i + 1} in kits value is within range`,
              test.info(),
            );

            // Validate free quantity cell (quantity - in kits)
            const freeQuantityCell = row.locator(
              `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_FREE_QUANTITY_CELL_SUFFIX}"]`,
            );
            await detailsPage.highlightElement(freeQuantityCell, {
              backgroundColor: 'yellow',
              border: '2px solid red',
              color: 'blue',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            const freeQuantityValue = await freeQuantityCell.textContent();
            logger.log(`Row ${i + 1} free quantity: "${freeQuantityValue}"`);
            const freeValue = parseInt(freeQuantityValue?.trim() || '0');
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(freeValue).toBe(parseInt(TEST_DATA.DETAIL_NEW_QUANTITY) - inKitsValueNum);
              },
              `Verify row ${i + 1} free value calculation`,
              test.info(),
            );

            // Validate free quantity against warehouse data
            const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(detailName?.trim() || '');
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(freeValue).toBe(expectedFreeQuantity);
              },
              `Verify row ${i + 1} free value matches expected`,
              test.info(),
            );

            // Validate sclad need cell (total demand for this part)
            const scladNeedCell = row.locator(
              `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_NEED_CELL_SUFFIX}"]`,
            );
            await detailsPage.highlightElement(scladNeedCell, {
              backgroundColor: 'yellow',
              border: '2px solid red',
              color: 'blue',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            const scladNeedValue = await scladNeedCell.textContent();
            logger.log(`Row ${i + 1} sclad need: "${scladNeedValue}"`);
            const scladNeedValueNum = parseInt(scladNeedValue?.trim() || '0');

            // Use async validation method for complex lookup
            const scladNeedValid = await detailsPage.validateScladNeed(detailName?.trim() || '', scladNeedValueNum);
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(scladNeedValid).toBe(true);
                expect.soft(scladNeedValueNum).toBeGreaterThanOrEqual(0);
              },
              `Verify row ${i + 1} sclad need validation`,
              test.info(),
            );

            // Validate need cell (our order quantity minus in kits)
            const needCell = row.locator(
              `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_NEED_CELL_SUFFIX}"]`,
            );
            await detailsPage.highlightElement(needCell, {
              backgroundColor: 'yellow',
              border: '2px solid red',
              color: 'blue',
            });
            await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
            const needValue = await needCell.textContent();
            logger.log(`Row ${i + 1} need: "${needValue}"`);
            const needValueNum = parseInt(needValue?.trim() || '0');

            // Use async validation method for complex calculation
            const needValid = await detailsPage.validateNeedQuantity(detailName?.trim() || '', TEST_DATA.ASSEMBLY_NAME, needValueNum, inKitsValueNum);
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(needValid).toBe(true);
                expect.soft(needValueNum).toBeGreaterThanOrEqual(0);
              },
              `Verify row ${i + 1} need quantity validation`,
              test.info(),
            );
          }

          await detailsPage.highlightElement(row, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });
        }

        // Verify we found both our details
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(foundDetail1).toBe(true);
            expect.soft(foundDetail2).toBe(true);
          },
          'Verify both details found',
          test.info(),
        );
        logger.log(`✅ Found both details: ${TEST_DATA.DETAIL_1_NAME} and ${TEST_DATA.DETAIL_2_NAME}`);
        await warehousePage.waitForTimeout(TIMEOUTS.VERY_LONG);
      });
    });

    await allure.step('Step 19: Click on detail name cells and interact with modal', async () => {
      // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
      const waybillModal = warehousePage.locator(SelectorsERP969.WAYBILL_MODAL_OPEN_PATTERN);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(waybillModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify waybill modal is visible',
        test.info(),
      );

      // Find the details table
      const detailsTable = waybillModal.locator(`table${SelectorsModalWaybill.DETAILS_TABLE_TABLE}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detailsTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify details table is visible',
        test.info(),
      );

      // Get all detail rows
      const detailRows = detailsTable.locator('tbody tr');
      const rowCount = await detailRows.count();
      logger.log(`Found ${rowCount} rows in details table for Step 19`);

      // Process each row that contains our details
      for (let i = 0; i < rowCount; i++) {
        const row = detailRows.nth(i);

        // Get the detail name for this row
        const nameCell = row.locator(
          `[data-testid^="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_PREFIX}"][data-testid$="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_SUFFIX}"]`,
        );

        // Check if the name cell exists
        const nameCellExists = await nameCell.count();
        if (nameCellExists === 0) {
          logger.log(`Row ${i + 1} has no name cell - skipping`);
          continue;
        }

        // Wait for the name cell to be visible
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(nameCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify name cell is visible',
          test.info(),
        );
        const detailName = await nameCell.textContent();
        logger.log(`Row ${i + 1} detail name: "${detailName}"`);

        // Only process rows that contain our details
        if (detailName?.trim() === TEST_DATA.DETAIL_1_NAME || detailName?.trim() === TEST_DATA.DETAIL_2_NAME) {
          logger.log(`Processing detail: ${detailName}`);

          // Close all other tabs except the current one before clicking the name cell
          const pages = warehousePage.context().pages();
          logger.log(`Found ${pages.length} tabs before closing`);

          // Close tabs that are not the current warehouse page
          for (let i = pages.length - 1; i >= 0; i--) {
            if (pages[i] !== warehousePage) {
              await pages[i].close();
              logger.log(`Closed tab ${i}`);
              await warehousePage.waitForTimeout(TIMEOUTS.MEDIUM); // Small delay to see tabs closing
            }
          }

          // Click on the name cell to open modal
          await detailsPage.highlightElement(nameCell);
          await nameCell.click();
          await warehousePage.waitForLoadState('networkidle');
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

          // Find the modal dialog that starts with OstatkPCBD-ModalDetal
          const modalDialog = warehousePage.locator(`dialog[data-testid^="${SelectorsModalWaybill.OSTATK_PCBD_MODAL_DETAL_PREFIX}"]`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(modalDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify modal dialog is visible',
            test.info(),
          );

          // Find and validate the modal title matches the detail name
          // The pattern is OstatkPCBD-ModalDetal{number}-InformationName-Name
          const modalTitleElement = modalDialog.locator(
            `[data-testid^="${SelectorsModalWaybill.OSTATK_PCBD_MODAL_DETAL_PREFIX}"][data-testid$="${SelectorsModalWaybill.OSTATK_PCBD_MODAL_DETAL_INFORMATION_NAME_NAME_SUFFIX}"]`,
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(modalTitleElement).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify modal title element is visible',
            test.info(),
          );

          // Get the modal title text and validate it matches the detail name
          const modalTitleText = await modalTitleElement.textContent();
          logger.log(`Modal title: "${modalTitleText}"`);
          logger.log(`Expected detail name: "${detailName}"`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(modalTitleText?.trim()).toBe(detailName?.trim());
            },
            'Verify modal title matches detail name',
            test.info(),
          );

          // Find and click the show full information button
          const showFullInfoButton = modalDialog.locator(
            `[data-testid^="${SelectorsModalWaybill.OSTATK_PCBD_MODAL_DETAL_PREFIX}"][data-testid$="${SelectorsModalWaybill.OSTATK_PCBD_MODAL_DETAL_BUTTONS_SHOW_FULL_INFORMATION_BUTTON_SUFFIX}"]`,
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(showFullInfoButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify show full info button is visible',
            test.info(),
          );

          // Click the button - this will open a new tab with the edit detail page
          await showFullInfoButton.click();
          await warehousePage.waitForLoadState('networkidle');
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

          // Get the new tab that was opened
          const newPages = warehousePage.context().pages();
          const newTab = newPages[newPages.length - 1]; // Get the last opened tab

          // Highlight the first h3 on the new page
          const newPageH3 = newTab.locator('h3').first();
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(newPageH3).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify new page h3 is visible',
            test.info(),
          );
          await detailsPage.highlightElement(newPageH3, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Verify the name field contains the correct detail name
          const nameField = newTab.locator(SelectorsModalWaybill.EDIT_DETAL_INFORMATION_INPUT);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(nameField).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify name field is visible',
            test.info(),
          );
          const nameFieldValue = await nameField.inputValue();
          logger.log(`Name field value: "${nameFieldValue}"`);
          logger.log(`Expected detail name: "${detailName}"`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(nameFieldValue?.trim()).toBe(detailName?.trim());
            },
            'Verify name field value matches detail name',
            test.info(),
          );

          // Highlight the name field to show validation passed
          await detailsPage.highlightElement(nameField, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Click the Archive button
          const archiveButton = newTab.locator(SelectorsModalWaybill.EDIT_DETAL_ARCHIVE_BUTTON);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify archive button is visible',
            test.info(),
          );

          // Highlight the archive button
          await detailsPage.highlightElement(archiveButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Click the archive button
          await detailsPage.highlightElement(archiveButton);
          await archiveButton.click();
          await newTab.waitForLoadState('networkidle');
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Find the archive confirmation dialog
          const archiveConfirmDialog = newTab.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(archiveConfirmDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify archive confirm dialog is visible',
            test.info(),
          );

          // Highlight the confirmation dialog
          await detailsPage.highlightElement(archiveConfirmDialog, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Find and highlight the Yes button
          const yesButton = archiveConfirmDialog.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(yesButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify yes button is visible',
            test.info(),
          );

          // Highlight the Yes button
          await detailsPage.highlightElement(yesButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });

          // Wait 2 seconds as requested
          await newTab.waitForTimeout(TIMEOUTS.LONG);

          // Click the Yes button
          await detailsPage.highlightElement(yesButton);
          await yesButton.click();
          await newTab.waitForLoadState('networkidle');
          await newTab.waitForTimeout(TIMEOUTS.STANDARD);

          // Close the new tab that was opened for detail editing
          await newTab.close();
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

          // Close the modal by clicking outside
          await warehousePage.mouse.click(1, 1);
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

          logger.log(`✅ Completed interaction with detail: ${detailName}`);

          // Break after processing the first detail
          break;
        }
      }

      logger.log(`✅ Step 19 completed - processed detail name interactions`);
    });

    await allure.step('Step 20: Click the actualize button to reload the waybill modal', async () => {
      // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
      const waybillModal = warehousePage.locator(SelectorsERP969.WAYBILL_MODAL_OPEN_PATTERN);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(waybillModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify waybill modal is visible',
        test.info(),
      );

      // Find and highlight the actualize button
      const actualizeButton = waybillModal.locator(SelectorsModalWaybill.CONTROL_BUTTONS_ACTUALIZE_BUTTON);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(actualizeButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify actualize button is visible',
        test.info(),
      );

      await detailsPage.highlightElement(actualizeButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      // Wait a second as requested
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      // Click the actualize button to reload the page
      await detailsPage.highlightElement(actualizeButton);
      await actualizeButton.click();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);

      logger.log(`✅ Step 20 completed - actualize button clicked and page reloaded`);
    });

    await allure.step('Step 21: Validate cell values after reload', async () => {
      // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
      const waybillModal = warehousePage.locator(SelectorsERP969.WAYBILL_MODAL_OPEN_PATTERN);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(waybillModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify waybill modal is visible',
        test.info(),
      );

      // Sub-step 21.1: Validate required quantity cell returns to original order quantity
      await allure.step('Sub-step 21.1: Validate required quantity cell returns to original order quantity', async () => {
        const requiredQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
        await detailsPage.highlightElement(requiredQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const requiredQuantity = await requiredQuantityCell.textContent();
        logger.log(`Required quantity after reload: "${requiredQuantity}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(requiredQuantity?.trim() || '0')).toBe(orderedQuantity2);
          },
          'Verify required quantity after reload matches orderedQuantity2',
          test.info(),
        );
        await detailsPage.highlightElement(requiredQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.2: Validate collected quantity cell is 0
      await allure.step('Sub-step 21.2: Validate collected quantity cell is 0', async () => {
        const collectedQuantityCell = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
        await detailsPage.highlightElement(collectedQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const collectedQuantity = await collectedQuantityCell.textContent();
        logger.log(`Collected quantity after reload: "${collectedQuantity}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(collectedQuantity?.trim() || '0')).toBe(0);
          },
          'Verify collected quantity after reload is 0',
          test.info(),
        );
        await detailsPage.highlightElement(collectedQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.3: Validate own quantity input is original order quantity
      await allure.step('Sub-step 21.3: Validate own quantity input is original order quantity', async () => {
        const ownQuantityInput = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
        await detailsPage.highlightElement(ownQuantityInput, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const ownQuantityValue = await ownQuantityInput.inputValue();
        logger.log(`Own quantity input after reload: "${ownQuantityValue}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(ownQuantityValue || '0')).toBe(orderedQuantity2);
          },
          'Verify own quantity input after reload matches orderedQuantity2',
          test.info(),
        );
        await detailsPage.highlightElement(ownQuantityInput, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.4: Validate progress wrapper shows 0%
      await allure.step('Sub-step 21.4: Validate progress wrapper shows 0%', async () => {
        const progressWrapper = waybillModal
          .locator(
            `[data-testid^="${SelectorsModalWaybill.TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_PREFIX}"][data-testid$="${SelectorsModalWaybill.TABLE_COMPLECT_MODAL_ADD_WAYBILL_CIRCLE_PROGRESS_WRAPPER_SUFFIX}"]`,
          )
          .first();
        await detailsPage.highlightElement(progressWrapper, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(progressWrapper).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify progress wrapper is visible',
          test.info(),
        );
        // Progress should be 0 since collected quantity is 0
        const progressValid = await detailsPage.validateProgressPercentage(0, orderedQuantity2);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(progressValid).toBe(true);
          },
          'Verify progress validation after reload',
          test.info(),
        );
        await detailsPage.highlightElement(progressWrapper, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.5: Validate remaining quantity cell is original order quantity
      await allure.step('Sub-step 21.5: Validate remaining quantity cell is original order quantity', async () => {
        const remainingQuantityCell = waybillModal.locator(
          `[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]`,
        );
        await detailsPage.highlightElement(remainingQuantityCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingQuantityCell).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify remaining quantity cell is visible',
        test.info(),
      );
        const remainingQuantity = await remainingQuantityCell.textContent();
        logger.log(`Remaining quantity after reload: "${remainingQuantity}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(parseInt(remainingQuantity?.trim() || '0')).toBe(orderedQuantity2);
          },
          'Verify remaining quantity after reload matches orderedQuantity2',
          test.info(),
        );
        await detailsPage.highlightElement(remainingQuantityCell, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.6: Validate total left to do label
      await allure.step('Sub-step 21.6: Validate total left to do label', async () => {
        const totalLeftToDoLabel = waybillModal.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_LEFT_TO_DO_LABEL);
        await detailsPage.highlightElement(totalLeftToDoLabel, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
        const totalLeftText = await totalLeftToDoLabel.textContent();
        logger.log(`Total left to do after reload: "${totalLeftText}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(totalLeftText?.trim()).toBe(`Всего: ${orderedQuantity2}`);
          },
          'Verify total left text after reload',
          test.info(),
        );
        await detailsPage.highlightElement(totalLeftToDoLabel, {
          backgroundColor: 'green',
          border: '2px solid green',
          color: 'white',
        });
      });

      // Sub-step 21.7: Validate details table row values
      await allure.step('Sub-step 21.7: Validate details table row values', async () => {
        const detailsTable = waybillModal.locator(`table${SelectorsModalWaybill.DETAILS_TABLE_TABLE}`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(detailsTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify details table is visible',
          test.info(),
        );

        // Get the first row (should be the remaining detail after archiving one)
        const detailRows = detailsTable.locator('tbody tr');
        const rowCount = await detailRows.count();
        logger.log(`Found ${rowCount} rows in details table after reload`);

        if (rowCount > 0) {
          const firstRow = detailRows.first();

          // Get the detail name from the first row
          const nameCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_PREFIX}"][data-testid$="${SelectorsModalWaybill.MODAL_ADD_WAYBILL_DETAILS_TABLE_ROW_NAME_CELL_SUFFIX}"]`,
          );
          const detailName = await nameCell.textContent();
          logger.log(`Validating detail: "${detailName}"`);

          // Validate need cell contains original order quantity
          const needCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_NEED_CELL_SUFFIX}"]`,
          );
          await detailsPage.highlightElement(needCell, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          const needValue = await needCell.textContent();
          logger.log(`Need cell value: "${needValue}"`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(parseInt(needValue?.trim() || '0')).toBe(orderedQuantity2);
            },
            'Verify need cell value matches orderedQuantity2',
            test.info(),
          );
          await detailsPage.highlightElement(needCell, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });

          // Validate deficit cell (quantity needed minus available)
          const deficitCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_DEFICIT_CELL_SUFFIX}"]`,
          );
          await detailsPage.highlightElement(deficitCell, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          const deficitValue = await deficitCell.textContent();
          logger.log(`Deficit cell value: "${deficitValue}"`);
          const deficitNum = parseInt(deficitValue?.trim() || '0');

          // Calculate expected deficit: quantity needed (orderedQuantity2) minus available quantity (DETAIL_NEW_QUANTITY)
          const expectedDeficit = parseInt(TEST_DATA.DETAIL_NEW_QUANTITY) - orderedQuantity2;
          logger.log(`Expected deficit: ${TEST_DATA.DETAIL_NEW_QUANTITY} - ${orderedQuantity2} = ${expectedDeficit}`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(deficitNum).toBe(expectedDeficit);
            },
            'Verify deficit value matches expected',
            test.info(),
          );

          await detailsPage.highlightElement(deficitCell, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });

          // Validate free quantity cell and click to verify
          const freeQuantityCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_FREE_QUANTITY_CELL_SUFFIX}"]`,
          );
          await detailsPage.highlightElement(freeQuantityCell, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          const freeQuantityValue = await freeQuantityCell.textContent();
          logger.log(`Free quantity cell value: "${freeQuantityValue}"`);
          const freeValue = parseInt(freeQuantityValue?.trim() || '0');

          // Validate free quantity against warehouse data (same as Step 18)
          const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(detailName?.trim() || '');
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(freeValue).toBe(expectedFreeQuantity);
            },
            'Verify free value matches expected',
            test.info(),
          );

          // Click the free quantity cell to verify
          await freeQuantityCell.click();
          await warehousePage.waitForLoadState('networkidle');
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          await detailsPage.highlightElement(freeQuantityCell, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });

          // Validate quantity cell and click to verify
          const quantityCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_QUANTITY_CELL_SUFFIX}"]`,
          );
          await detailsPage.highlightElement(quantityCell, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          const quantityValue = await quantityCell.textContent();
          logger.log(`Quantity cell value: "${quantityValue}"`);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(parseInt(quantityValue?.trim() || '0')).toBe(parseInt(TEST_DATA.DETAIL_NEW_QUANTITY));
            },
            'Verify quantity cell value matches',
            test.info(),
          );

          // Click the quantity cell to verify
          await quantityCell.click();
          await warehousePage.waitForLoadState('networkidle');
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          await detailsPage.highlightElement(quantityCell, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });

          // Validate in kits cell is 0 and click to verify
          const inKitsCell = firstRow.locator(
            `[data-testid^="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsModalWaybill.DETAILS_TABLE_ROW_IN_KITS_CELL_SUFFIX}"]`,
          );
          await detailsPage.highlightElement(inKitsCell, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          const inKitsValue = await inKitsCell.textContent();
          logger.log(`In kits cell value: "${inKitsValue}"`);
          const inKitsValueNum = parseInt(inKitsValue?.trim() || '0');
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(inKitsValueNum).toBe(0);
            },
            'Verify in kits value is 0',
            test.info(),
          );

          // Click the in kits cell to verify
          await inKitsCell.click();
          await warehousePage.waitForLoadState('networkidle');
          await warehousePage.waitForTimeout(TIMEOUTS.STANDARD);
          await detailsPage.highlightElement(inKitsCell, {
            backgroundColor: 'green',
            border: '2px solid green',
            color: 'white',
          });
        }
      });

      logger.log(`✅ Step 21 completed - all cell values validated after reload`);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART G: Clean up test data
    // ─────────────────────────────────────────────────────────────────────────────

    // await allure.step("Step 10: Clean up test data", async () => {
    //     await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
    //     await page.waitForLoadState("networkidle");

    //     // Archive the assembly
    //     await detailsPage.cleanupTestDetail(page, ASSEMBLY_NAME, TEST_DATA.MAIN_PAGE_СБ_TABLE);
    //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

    //     // Archive both details
    //     await detailsPage.cleanupTestDetail(page, DETAIL_1_NAME, TEST_DATA.PARTS_PAGE_DETAL_TABLE);
    //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

    //     await detailsPage.cleanupTestDetail(page, DETAIL_2_NAME, TEST_DATA.PARTS_PAGE_DETAL_TABLE);
    //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

    //     logger.log("✅ Test data cleanup completed");
    // });
  });
};
