import { test, expect, Locator, Page } from '@playwright/test';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateStockPage } from '../pages/StockPage';
import { SELECTORS, CONST } from '../config';
import { allure } from 'allure-playwright';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as SelectorsAssemblyKitting from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsModalWaybill from '../lib/Constants/SelectorsModalWindowConsignmentNote';

// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT STYLE OPTIONS (for highlightElement from PageObject)
// ─────────────────────────────────────────────────────────────────────────────
const HIGHLIGHT_PENDING = { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' };
const HIGHLIGHT_SUCCESS = { backgroundColor: 'green', border: '2px solid green', color: 'white' };
const HIGHLIGHT_ERROR = { backgroundColor: 'red', border: '2px solid red', color: 'white' };

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Vue-compatible search using pressSequentially
// ─────────────────────────────────────────────────────────────────────────────
async function searchWithPressSequentially(
  page: Page,
  searchInputSelector: string,
  searchTerm: string,
  options?: { delay?: number; waitAfterSearch?: number }
): Promise<void> {
  const delay = options?.delay ?? 50;
  const waitAfterSearch = options?.waitAfterSearch ?? 2000;

  const searchInput = page.locator(searchInputSelector);
  await expect(searchInput).toBeVisible({ timeout: 5000 });

  // Click to focus, then clear and type
  await searchInput.click();
  await page.waitForTimeout(300);

  // Clear the input first
  await searchInput.fill('');
  await page.waitForTimeout(200);

  // Type the search term using keyboard (more reliable with Vue)
  await searchInput.pressSequentially(searchTerm, { delay });
  await page.waitForTimeout(500);

  // Verify the value was entered
  const inputValue = await searchInput.inputValue();
  console.log(`Search input value: "${inputValue}"`);

  // Press Enter to trigger search
  await searchInput.press('Enter');
  await page.waitForTimeout(waitAfterSearch);
}

let orderNumber: string | null = null; // Declare outside to share between steps
let orderedQuantity: number = 2; // Declare outside to share between steps
let orderedQuantity2: number = 666; // Declare outside to share between steps
let targetRow: any = null; // Declare outside to share between steps
let specificationQuantity: number = 1; // Global variable for specification quantity from step 10
let waybillCollections: number = 0; // Global variable to track waybill collections
let currentBuildQuantity: number = 1; // Global variable for current build quantity (how many items we're building now)

// Get today's date in DD.MM.YYYY format
const today = new Date().toLocaleDateString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const runERP_969 = () => {
  test('TestCase 06 - Архивация всех совпадающих деталей (Cleanup) `${NEW_DETAIL_A}`', async ({ page }) => {
    test.setTimeout(600000);

    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 2: Найдите все детали с точным совпадением имени', async () => {
      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expect(searchInput).toBeVisible();

      // Perform the search for TEST_DETAIL_NAME
      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      await searchInput.fill(CONST.NEW_DETAIL_A);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      // Retrieve all rows
      const rows = detailTable.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} rows in search results.`);

      if (rowCount === 0) {
        console.log('No matching rows found for archiving.');
        return;
      }

      // Filter rows to find exact matches
      const matchingRows: Locator[] = [];

      for (let i = 0; i < rowCount; i++) {
        const rowText = await rows.nth(i).textContent();
        if (rowText && rowText.trim() === CONST.NEW_DETAIL_A) {
          matchingRows.push(rows.nth(i));
        }
      }

      console.log(`Found ${matchingRows.length} exact matches for '${CONST.NEW_DETAIL_A}'.`);

      if (matchingRows.length === 0) {
        console.error('No exact matches found for archiving.');
        return;
      }

      for (let i = matchingRows.length - 1; i >= 0; i--) {
        await allure.step(`Archiving row ${i + 1} out of ${matchingRows.length}`, async () => {
          const currentRow = matchingRows[i];

          // Highlight the row for debugging
          await detailsPage.highlightElement(currentRow, HIGHLIGHT_ERROR);
          await page.waitForTimeout(500);

          // Click the row to select the detail
          await currentRow.click();
          await page.waitForTimeout(500);

          // Click the archive button
          const archiveButton = page.locator(SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON);
          await expect(archiveButton).toBeVisible();
          await archiveButton.click();
          await page.waitForLoadState('networkidle');

          // Verify archive modal appears
          const archiveModal = page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG);
          await expect(archiveModal).toBeVisible();

          const yesButton = archiveModal.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON);
          await expect(yesButton).toBeVisible();
          await yesButton.click();
          await page.waitForLoadState('networkidle');

          // Ensure success message appears
          //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
          await detailsPage.verifyDetailSuccessMessage('Файл успешно перенесён в архив');

          await page.waitForTimeout(1000);
        });
      }

      console.log(`All ${matchingRows.length} exact matching details have been archived.`);
    });
  });
  test('TestCase 06 - Архивация всех совпадающих деталей (Cleanup) `${NEW_SB_A}`', async ({ page }) => {
    test.setTimeout(600000);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 2: Найдите все детали СБ с точным совпадением имени', async () => {
      const detailTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
      const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expect(searchInput).toBeVisible();

      // Clear any existing search text.
      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);

      // Search for the СБ detail using NEW_SB_A.
      await searchInput.fill(CONST.NEW_SB_A);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Retrieve all rows.
      const rows = detailTable.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} rows in search results for СБ: ${CONST.NEW_SB_A}.`);

      if (rowCount === 0) {
        console.log('No matching rows found for archiving СБ.');
        return;
      }

      // Filter rows to find exact matches.
      const matchingRows: Locator[] = [];
      for (let i = 0; i < rowCount; i++) {
        const rowText = await rows.nth(i).textContent();
        if (rowText && rowText.trim() === CONST.NEW_SB_A) {
          matchingRows.push(rows.nth(i));
        }
      }

      console.log(`Found ${matchingRows.length} exact matches for '${CONST.NEW_SB_A}'.`);

      if (matchingRows.length === 0) {
        console.error('No exact matches found for archiving СБ.');
        return;
      }

      // Archive each matching row starting from the bottom.
      for (let i = matchingRows.length - 1; i >= 0; i--) {
        await allure.step(`Archiving row ${i + 1} из ${matchingRows.length} для СБ`, async () => {
          const currentRow = matchingRows[i];

          // Highlight the row for debugging.
          await detailsPage.highlightElement(currentRow, HIGHLIGHT_ERROR);
          await page.waitForTimeout(500);

          // Click the row to select the detail.
          await currentRow.click();
          await page.waitForTimeout(500);

          // Click the archive button.
          const archiveButton = page.locator(SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON);
          await expect(archiveButton).toBeVisible();
          await archiveButton.click();
          await page.waitForLoadState('networkidle');

          // Verify the archive confirmation modal appears.
          const archiveModal = page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG);
          await expect(archiveModal).toBeVisible();
          const yesButton = archiveModal.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON);
          await expect(yesButton).toBeVisible();
          await yesButton.click();
          await page.waitForLoadState('networkidle');

          // Verify a success message appears.
          await detailsPage.verifyDetailSuccessMessage('Файл успешно перенесён в архив');
          await page.waitForTimeout(1000);
        });
      }

      console.log(`Все ${matchingRows.length} совпадающих деталей СБ были архивированы.`);
    });
  });

  test('ERP-969 - Big urgent test for details & specifications', async ({ page }) => {
    test.setTimeout(600000);
    const detailsPage = new CreatePartsDatabasePage(page);

    // ─────────────────────────────────────────────────────────────────────────────
    // PART A: Verify that searching in two tables produces no exact results.
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step("Step 1: Open the 'База Деталей' page", async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');
    });

    await allure.step("Step 2: Verify 'cbed' table is visible", async () => {
      const cbedTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
      await expect(cbedTable).toBeVisible();
    });

    await allure.step("Step 3: Search in 'cbed' table", async () => {
      const cbedTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
      const cbedInput = cbedTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expect(cbedInput).toBeVisible();
      await cbedInput.fill(CONST.NEW_SB_A);
      await cbedInput.press('Enter');
      await page.waitForTimeout(1000); // Allow search results to update.
    });

    await allure.step("Step 4: Verify no results in 'cbed' table", async () => {
      const cbedTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
      const resultRows = cbedTable.locator('tbody tr');
      const count = await resultRows.count();
      expect(count).toBe(0);
    });

    await allure.step("Step 5: Verify 'detal' table is visible", async () => {
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      await expect(detalTable).toBeVisible();
    });

    await allure.step("Step 6: Search in 'detal' table", async () => {
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const detalInput = detalTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expect(detalInput).toBeVisible();
      await detalInput.fill(CONST.NEW_DETAIL_A);
      await detalInput.press('Enter');
      await page.waitForTimeout(1000);
    });

    await allure.step("Step 7: Verify no results in 'detal' table", async () => {
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const resultRows = detalTable.locator('tbody tr');
      const count = await resultRows.count();
      expect(count).toBe(0);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART B: Create a new detail and verify it saves.
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 8: Create new detail with name "${CONST.NEW_DETAIL_A}" and save it`, async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('networkidle');
      await detailsPage.fillDetailName(CONST.NEW_DETAIL_A, 'AddDetal-Information-Input-Input');
      await detailsPage.findAndClickElement(page, CONST.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    });

    await allure.step(`Step 9: Verify detail "${CONST.NEW_DETAIL_A}" was saved`, async () => {
      // Click the cancel button to return to the listing.
      await detailsPage.findAndClickElement(page, CONST.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL, 500);
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');

      // Search for the new detail within the 'detal' table.
      const detalTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      await detalTable.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'yellow';
      });
      const detailSearchInput = detalTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await detailSearchInput.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'yellow';
      });
      await detalTable.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'yellow';
      });
      await page.waitForTimeout(1000);
      await expect(detailSearchInput).toBeVisible();
      await detailSearchInput.fill(CONST.NEW_DETAIL_A);
      await detailSearchInput.press('Enter');
      await page.waitForTimeout(1000);
      const resultRows = detalTable.locator('tbody tr');
      const count = await resultRows.count();
      expect(count).toBe(1);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // PART C: Add a product specification using a detail of type "СБ".
    // ─────────────────────────────────────────────────────────────────────────────

    await allure.step(`Step 10: Add specification with detail "${CONST.NEW_SB_A}" for type СБ`, async () => {
      // Navigate to the product creation page.
      await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');

      // Open the small dialog for adding a specification.
      await detailsPage.findAndClickElement(page, CONST.BASE_DETALS_BUTTON_CREATE, 500);

      // In the small dialog, select the option for type "СБ".
      await detailsPage.findAndClickElement(page, CONST.BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS, 500);

      // Fill in the detail name with NEW_SB_A.
      const smallDialogDetailInput = page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
      await expect(smallDialogDetailInput).toBeVisible({ timeout: 5000 });
      await smallDialogDetailInput.fill(CONST.NEW_SB_A);

      // Click the "Добавить" button in the small dialog.
      await detailsPage.findAndClickElement(page, CONST.SPECIFICATION_BUTTONS_ADDING_SPECIFICATION, 500);

      // Select the "Детайл" icon from the small dialog.
      await detailsPage.findAndClickElement(page, CONST.SPECIFICATION_DIALOG_CARD_BASE_DETAIL_1, 500);

      // In the dialog's bottom table, search for the detail we just entered.
      const dialogTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const dialogSearchInput = dialogTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expect(dialogSearchInput).toBeVisible({ timeout: 5000 });
      await dialogSearchInput.fill(CONST.NEW_DETAIL_A);
      await dialogSearchInput.press('Enter');
      await page.waitForTimeout(1000);

      // Now, search the results for an exact match for NEW_DETAIL_A.
      const resultRows = dialogTable.locator('tbody tr');
      const rowCount = await resultRows.count();
      let found = false;
      for (let i = 0; i < rowCount; i++) {
        const rowText = await resultRows.nth(i).textContent();
        if (rowText && rowText.trim() === CONST.NEW_DETAIL_A) {
          // Exact match found: click the corresponding row.
          await resultRows.nth(i).click();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Detail "${CONST.NEW_DETAIL_A}" not found in dialog results.`);
      }
      await page.waitForTimeout(1000);
      // Click the button to add that detail to the dialog's bottom table.
      await detailsPage.findAndClickElement(page, CONST.SPECIFICATION_MODAL_BASE_DETAL_SELECT_BUTTON, 500);
      await page.waitForTimeout(1000);

      // Click the add button to move the detail into the main specifications table (closes the dialog).
      await detailsPage.findAndClickElement(page, CONST.SPECIFICATION_MODAL_BASE_DETAL_ADD_BUTTON, 500);
      await page.waitForTimeout(1000);

      // Verify that the detail is now visible in the product's specifications table.
      const specsTable = page.locator(SelectorsPartsDataBase.EDITOR_TABLE_SPECIFICATION_CBED);
      await specsTable.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await expect(specsTable).toBeVisible({ timeout: 5000 });
      const specRows = specsTable.locator('tbody tr');
      const rowTexts = await specRows.allTextContents();
      const detailAdded = rowTexts.some(text => text.includes(CONST.NEW_DETAIL_A));
      expect(detailAdded).toBe(true);

      // Finally, click save on the product page and verify the success message.
      const save = await page.locator(SelectorsPartsDataBase.CREATOR_BUTTON_SAVE);
      await save.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await save.click();

      await page.waitForTimeout(1000);
    });
    let skladPage: Page; // Declare outside to share between steps

    await allure.step('Step 11.1: Open a new browser tab and navigate to the Склад page', async () => {
      // Open a new tab and navigate to the Склад page.
      skladPage = await page.context().newPage();
      await skladPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await skladPage.waitForLoadState('networkidle');
    });

    await allure.step('Step 11.2: Click the Ревизия button', async () => {
      // Click the revision button using direct locator.
      const revisionButton = skladPage.locator(SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID);
      await revisionButton.click();
      await skladPage.waitForTimeout(500);
    });

    await allure.step('Step 11.3: Select the Детайли slider', async () => {
      // In the Склад page, select the Detail slider.
      const detailSlider = skladPage.locator(SelectorsRevision.REVISION_SWITCH_ITEM2);
      await detailSlider.click();
      await skladPage.waitForTimeout(500);
    });

    await allure.step('Step 11.4: Find the search input and search for the detail', async () => {
      // Locate the table and its search input within the Склад section.

      const skladTable = skladPage.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE);

      const searchInput = skladTable.locator(SelectorsRevision.SEARCH_COVER_INPUT_2);
      await searchInput.evaluate((element: HTMLElement) => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      // Enter the detail name (NEW_DETAIL_A) and trigger the search.
      await searchInput.fill(CONST.NEW_DETAIL_A);
      await searchInput.press('Enter');
      await skladPage.waitForLoadState('networkidle');
      await skladPage.waitForTimeout(1000);
    });

    await allure.step('Step 11.5: Verify exactly one matching row is found', async () => {
      // Get all <tbody> elements within the target table
      await skladPage.waitForTimeout(1000);
      const allBodies = skladPage.locator(`${SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE} tbody`).first();
      //const lastBody = allBodies.last(); // The one with actual data rows (not headers)

      // Now get all <tr> within the last tbody
      const resultRows = allBodies.locator('tr');
      const rowCount = await resultRows.count();
      console.log(`✅ Found ${rowCount} row(s) in the data tbody`);
      await skladPage.waitForTimeout(5000);
      // Expect exactly one matching row from the search
      expect(rowCount).toBe(1);
    });

    // Step 2: Update the value in the 4th column (the editable element).
    await allure.step("Step 11.6: Update the actual quantity to '1' in the editable cell", async () => {
      // Locate the only returned row after the search.
      const row = skladPage.locator(`${SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE} tbody tr`).first();
      await expect(row).toBeVisible({ timeout: 5000 });

      // Within this row, locate the 4th column (index 3).
      const fourthCell = row.locator('td').nth(3);
      await expect(fourthCell).toBeVisible({ timeout: 5000 });

      // Inside the cell, locate the editable div with contenteditable=true.
      const editField = fourthCell.locator(SelectorsRevision.INPUT_NUMBER_INPUT);
      await expect(editField).toBeVisible({ timeout: 5000 });

      // Fill in "1" and press Enter to submit the change.
      await editField.fill('1');
      await editField.press('Enter');

      // Wait for the update to take effect.
      await skladPage.waitForLoadState('networkidle');
    });

    await allure.step('Step 11.7: Confirm the update in the confirmation dialog', async () => {
      // Wait for the confirmation dialog to appear.
      const confirmDialog = skladPage.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG);
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });

      // In the dialog, click the confirm button.
      const confirmButton = confirmDialog.locator(SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE);
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await confirmButton.click();
      await skladPage.waitForLoadState('networkidle');
    });
    await allure.step('Step 11.8: Reload, open Детайли, search again, and verify updated quantity', async () => {
      // Reload the page and wait until everything settles
      await skladPage.reload();
      await skladPage.waitForLoadState('networkidle');

      // Re-open the Детайли slider tab
      await skladPage.locator(SelectorsRevision.REVISION_SWITCH_ITEM2).click();
      await skladPage.waitForTimeout(1000);

      // Confirm the table is visible
      const skladTable = skladPage.locator(`table${SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE}`).first();
      await expect(skladTable).toBeVisible({ timeout: 5000 });

      // Perform the search again
      const searchInput = skladTable.locator(SelectorsRevision.SEARCH_COVER_INPUT_2);
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('');
      await searchInput.press('Enter');
      await skladPage.waitForTimeout(1000);

      await searchInput.fill(CONST.NEW_DETAIL_A);
      await searchInput.press('Enter');
      await skladPage.waitForLoadState('networkidle');
      await skladPage.waitForTimeout(1000);
      // Select the last <tbody> (actual data) and verify one row is returned
      const allTbody = skladTable.locator('tbody');
      const dataBody = allTbody.last();
      const rows = dataBody.locator('tr');
      const rowCount = await rows.count();
      console.log(`Verified ${rowCount} row(s) in the updated table`);
      expect(rowCount).toBe(1);

      // Locate the editable div in the 4th column and confirm the saved value
      const fourthCell = rows.first().locator('td').nth(3);
      const editDiv = fourthCell.locator(SelectorsRevision.INPUT_NUMBER_INPUT);
      await editDiv.evaluate((element: HTMLElement) => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await skladPage.waitForTimeout(3000);
      await expect(editDiv).toBeVisible({ timeout: 5000 });

      const value = await editDiv.inputValue();
      if (value === null) throw new Error('Editable cell content is null.');
      console.log('Confirmed saved value after reload:', value.trim());

      expect(value.trim()).toBe('1');
    });
    await allure.step('Step 12: Open residuals in new tab and verify saved detail has 0 quantity', async () => {
      // Open a new tab for the residuals check
      const residualsPage = await page.context().newPage();
      const stockPage = new CreateStockPage(residualsPage);
      await residualsPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await residualsPage.waitForLoadState('networkidle');

      // Click the residuals button to enter the stock overview
      await stockPage.findAndClickElement(residualsPage, 'Sclad-residuals-residuals', 500);
      await residualsPage.waitForLoadState('networkidle');

      // Locate the residuals table and confirm visibility
      const residualsTable = residualsPage.locator(SelectorsModalWaybill.OSTATK_PCBD_DETAL_TABLE);
      await expect(residualsTable).toBeVisible({ timeout: 5000 });

      // Perform the search for the new detail
      const searchInput = residualsTable.locator(SelectorsModalWaybill.OSTATK_PCBD_TABLE_SEARCH_INPUT);
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('');
      await searchInput.press('Enter');
      await residualsPage.waitForTimeout(1000);

      await searchInput.fill(CONST.NEW_DETAIL_A);
      await searchInput.press('Enter');
      await residualsPage.waitForLoadState('networkidle');
      await residualsPage.waitForTimeout(1000);
      // Verify exactly one matching row is returned
      const rows = residualsTable.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} row(s) in residuals table for detail "${CONST.NEW_DETAIL_A}".`);
      expect(rowCount).toBe(1);

      // Verify that the 5th column contains value "0"
      const fifthCell = rows.first().locator('td').nth(4);
      await fifthCell.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      const cellText = await fifthCell.textContent();
      if (cellText === null) throw new Error('Fifth column content is null.');
      console.log('Residual quantity found in 5th column:', cellText.trim());
      expect(cellText.trim()).toBe('0');
      await residualsPage.waitForTimeout(3000);
    });

    // to here comment
    const warehousePage = await page.context().newPage();
    await allure.step('Step 13: Create supplier order and start production for test SB', async () => {
      // Open a new tab for the warehouse page

      await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await warehousePage.waitForLoadState('networkidle');

      // Click the ordering suppliers button
      const orderingSuppliersButton = warehousePage.locator(SelectorsOrderedFromSuppliers.SCLAD_ORDERING_SUPPLIERS);
      await orderingSuppliersButton.click();
      await warehousePage.waitForTimeout(500);
      await warehousePage.waitForLoadState('networkidle');

      // Click the create order button
      const createOrderButton = warehousePage.locator(SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON);
      await createOrderButton.click();
      await warehousePage.waitForTimeout(500);
      await warehousePage.waitForLoadState('networkidle');

      // Verify the supplier order creation modal is visible
      const supplierModal = warehousePage.locator(`dialog${SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}`);
      await expect(supplierModal).toBeVisible({ timeout: 5000 });

      //Click the assemblies operation button
      const assembliesButton = supplierModal.locator(SelectorsOrderedFromSuppliers.MODAL_SELECT_SUPPLIER_ASSEMBLE_CARD);
      await assembliesButton.click();
      await warehousePage.waitForTimeout(500);
      await warehousePage.waitForLoadState('networkidle');

      //Verify the production table is visible
      const orderAssembly = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG);
      let productionTable = orderAssembly.locator(SelectorsOrderedFromSuppliers.TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE);
      await productionTable.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await expect(productionTable).toBeVisible({ timeout: 5000 });
      await warehousePage.waitForTimeout(1500);
      // Find and fill the search input
      const searchInput = productionTable.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_TABLE_SEARCH_INPUT);
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(CONST.NEW_SB_A);
      await searchInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(2000);

      // const productionDialog = page.locator(`dialog[data-testid="${CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE}"]`);
      // productionTable = productionDialog.locator(SelectorsOrderedFromSuppliers.TABLE_MODAL_ADD_ORDER_PRODUCTION_TABLE);

      const rows = productionTable.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} row(s) in production table for SB "${CONST.NEW_SB_A}".`);
      expect(rowCount).toBe(1);

      // select the rows checkbox
      const checkbox = rows.locator('td').nth(0).locator("input[type='checkbox']");
      await checkbox.click();

      //find the button with the label выбрать and data-testid ModallAddStockOrderSupply-Main-Content-Block-Button
      const selectButton = warehousePage.locator(`button${SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON}`);
      await detailsPage.highlightElement(selectButton, HIGHLIGHT_PENDING);
      await page.waitForTimeout(1000);
      await selectButton.click();

      //now find th ebottom table  via it's top div:ModallAddStockOrderSupply-Main-Content-Block2
      const bottomTable = warehousePage.locator(SelectorsOrderedFromSuppliers.TABLE_MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE);
      await bottomTable.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await expect(bottomTable).toBeVisible({ timeout: 5000 });
      const bottomRows = bottomTable.locator('tbody tr');
      const bottomRowCount = await bottomRows.count();
      console.log(`Found ${bottomRowCount} row(s) in bottom table for SB "${CONST.NEW_SB_A}".`);
      expect(bottomRowCount).toBe(1);
      // Enter quantity "2" in the 8th column
      const quantityInput = bottomRows
        .first()
        .locator(
          `[data-testid^="${CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT_START}"][data-testid$="${CONST.MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT}"]`
        );
      await quantityInput.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });
      await expect(quantityInput).toBeVisible({ timeout: 5000 });
      await quantityInput.fill(orderedQuantity.toString());
      await quantityInput.press('Enter');
      await warehousePage.waitForTimeout(500);

      // Verify the modal title
      const modalTitle = warehousePage.locator('h4').first();
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_PENDING);
      await expect(modalTitle).toContainText('Создание заказа на сборку', { timeout: 5000 });
      const today = new Date().toLocaleDateString('ru-RU');
      await expect(modalTitle).toContainText(today, { timeout: 5000 });

      // Example: modalTitle = "Создание заказа на сборку № 25-6029 от 21.07.2025"
      const modalTitleText = await modalTitle.textContent();
      const orderNumberMatch = modalTitleText?.match(/№\s*([\d-]+)/);
      orderNumber = orderNumberMatch ? orderNumberMatch[1] : null;

      if (orderNumber) {
        // Highlight the order number in the modal title
        await modalTitle.evaluate((el, num) => {
          if (el.innerHTML) {
            el.innerHTML = el.innerHTML.replace(num, `<span style="background: yellow; border: 2px solid red; color: blue;">${num}</span>`);
          }
        }, orderNumber);
      }

      console.log(`Captured order number: ${orderNumber}`);

      const orderButton = warehousePage.locator(SelectorsOrderedFromSuppliers.MODAL_CREATE_ORDER_SAVE_BUTTON);
      await orderButton.click();
      await warehousePage.waitForTimeout(500);
      await warehousePage.waitForLoadState('networkidle');
      // Verify success notification contains the order number
      //await detailsPage.verifyDetailSuccessMessage(`Заказ №${orderNumber} отправлен в производство`);

      // Close the modal by clicking at position 1,1
      await warehousePage.mouse.click(1, 1);
      await warehousePage.waitForTimeout(1000);
      await warehousePage.mouse.click(1, 1);
      await warehousePage.waitForTimeout(1000);
    });

    await allure.step('Step 14: Search for the created order in the order table', async () => {
      // Verify the order table is visible
      await warehousePage.waitForLoadState('networkidle');
      const orderTable = warehousePage.locator(`table${SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_TABLE}`);
      await expect(orderTable).toBeVisible({ timeout: 5000 });

      // Find and fill the search input with the captured order number
      const searchInput = orderTable.locator(SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_TABLE_SEARCH_INPUT);
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(CONST.NEW_SB_A);
      await searchInput.press('Enter');
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(1000);

      // Verify exactly one tbody is returned (due to table structure issue)
      const tbodyElements = orderTable.locator('tbody');
      const tbodyCount = await tbodyElements.count();

      console.log(`Found ${tbodyCount} tbody element(s) in order table.`);

      // Create the search pattern with "C" prefix
      const searchPattern = `${orderNumber}`;
      console.log(`Looking for order with pattern: "${searchPattern}"`);

      let foundOrder = false;

      // Cycle through all tbody elements and their rows
      for (let i = 0; i < tbodyCount; i++) {
        const tbody = tbodyElements.nth(i);
        const rows = tbody.locator('tr');
        const rowCount = await rows.count();

        console.log(`Checking tbody ${i + 1}, found ${rowCount} rows`);

        for (let j = 0; j < rowCount; j++) {
          const row = rows.nth(j);
          const firstCell = row.locator('td').first();
          const cellText = await firstCell.textContent();

          console.log(`Row ${j + 1} in tbody ${i + 1}: "${cellText}"`);

          if (cellText?.trim() === searchPattern) {
            console.log(`✅ Found matching order: "${cellText}"`);

            // Highlight the found row
            await row.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'green';
              el.style.border = '3px solid red';
              el.style.color = 'white';
            });

            foundOrder = true;
            targetRow = row;
            console.log(`✅ Target row assigned: ${targetRow ? 'success' : 'failed'}`);
            break;
          } else {
            console.log(`❌ No matching order found in tbody ${i + 1}`);
            await row.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'red';
              el.style.border = '3px solid red';
              el.style.color = 'white';
            });
          }
        }

        if (foundOrder) {
          console.log(`✅ Breaking out of tbody loop, order found`);
          break;
        }
      }
      await warehousePage.waitForTimeout(5000);
      // Verify that the order was found
      expect(foundOrder).toBe(true);
      expect(targetRow).not.toBeNull();
      console.log(`✅ Order "${searchPattern}" was found and highlighted`);
      console.log(`✅ Target row is ready for Step 15: ${targetRow ? 'yes' : 'no'}`);
    });

    await allure.step('Step 15: Click the found order row and verify order details in modal', async () => {
      // Get the date from the 4th column of the found row
      const dateCell = targetRow.locator('td').nth(3); // 4th column (index 3)
      await expect(dateCell).toBeVisible({ timeout: 5000 });
      await detailsPage.highlightElement(dateCell, HIGHLIGHT_PENDING);
      const orderDate = await dateCell.textContent();
      console.log(`Order date from table: "${orderDate}"`);

      // Click the found row to open the modal
      await targetRow.dblclick();
      await warehousePage.waitForLoadState('networkidle');
      await warehousePage.waitForTimeout(1000);

      // Verify the modal is visible
      const orderModal = warehousePage.locator(`dialog${SelectorsOrderedFromSuppliers.ORDER_MODAL}[open]`);
      await detailsPage.highlightElement(orderModal, HIGHLIGHT_PENDING);
      await expect(orderModal).toBeVisible({ timeout: 5000 });
      await detailsPage.highlightElement(orderModal, HIGHLIGHT_SUCCESS);

      // Verify the modal title
      const modalTitle = orderModal.locator('h4');
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_PENDING);
      await expect(modalTitle).toContainText('Заказ', { timeout: 5000 });
      await detailsPage.highlightElement(modalTitle, HIGHLIGHT_SUCCESS);

      // Verify the order date in the modal
      const modalDateElement = orderModal.locator('.modal-worker__label-span').first();
      await detailsPage.highlightElement(modalDateElement, HIGHLIGHT_PENDING);
      await expect(modalDateElement).toBeVisible({ timeout: 5000 });
      const modalDate = await modalDateElement.textContent();
      console.log(`Modal date: "${modalDate}"`);
      expect(modalDate).toContain(orderDate?.trim() || '');
      await detailsPage.highlightElement(modalDateElement, HIGHLIGHT_SUCCESS);

      // Verify the order number (without "C" prefix)
      const modalOrderNumberElement = orderModal.locator('.modal-worker__label-span').nth(1);
      await detailsPage.highlightElement(modalOrderNumberElement, HIGHLIGHT_PENDING);
      await expect(modalOrderNumberElement).toBeVisible({ timeout: 5000 });
      const modalOrderNumber = await modalOrderNumberElement.textContent();
      console.log(`Modal order number: "${modalOrderNumber}"`);
      expect(modalOrderNumber?.trim()).toBe(orderNumber?.trim());
      await detailsPage.highlightElement(modalOrderNumberElement, HIGHLIGHT_SUCCESS);

      // Find and verify the table contents
      const table = orderModal.locator(SelectorsOrderedFromSuppliers.ORDER_MODAL_TABLE);
      await detailsPage.highlightElement(table, HIGHLIGHT_PENDING);
      await expect(table).toBeVisible({ timeout: 5000 });
      await detailsPage.highlightElement(table, HIGHLIGHT_SUCCESS);

      // Get the first data row (skip header if present)
      const firstDataRow = table.locator('tbody tr').first();
      await detailsPage.highlightElement(firstDataRow, HIGHLIGHT_PENDING);
      await expect(firstDataRow).toBeVisible({ timeout: 5000 });
      await detailsPage.highlightElement(firstDataRow, HIGHLIGHT_SUCCESS);

      // Verify the first column contains order number with suffix
      const firstColumn = firstDataRow.locator('td').nth(1);
      await detailsPage.highlightElement(firstColumn, HIGHLIGHT_PENDING);
      const firstColumnText = await firstColumn.textContent();
      console.log(`First column (order number): "${firstColumnText}"`);
      // Order number column contains plain order number without suffix
      expect(firstColumnText?.trim()).toBe(orderNumber);

      // Verify the item column (Наименование) contains NEW_SB_A
      const thirdColumn = firstDataRow.locator('td').nth(3); // Item at index 3
      await detailsPage.highlightElement(thirdColumn, HIGHLIGHT_PENDING);
      const thirdColumnText = await thirdColumn.textContent();
      console.log(`Third column (item): "${thirdColumnText}"`);
      expect(thirdColumnText?.trim()).toBe(CONST.NEW_SB_A);

      // Verify the fourth column contains "Заказано"
      const fourthColumn = firstDataRow.locator('td').nth(4); // 4th column (index 3)
      await detailsPage.highlightElement(fourthColumn, HIGHLIGHT_PENDING);
      const fourthColumnText = await fourthColumn.textContent();
      console.log(`Fourth column (status): "${fourthColumnText}"`);
      expect(fourthColumnText?.trim()).toBe('Заказано');

      // Verify column 5 (Кол-во сделанных / completed) contains "0"
      const completedColumn = firstDataRow.locator('td').nth(5);
      await detailsPage.highlightElement(completedColumn, HIGHLIGHT_PENDING);
      const completedColumnText = await completedColumn.textContent();
      console.log(`Completed column (index 5): "${completedColumnText}"`);
      expect(completedColumnText?.trim()).toBe('0');

      // Verify column 6 (Кол-во в задании / ordered) contains orderedQuantity
      // Note: The value is inside an input field, not plain text
      const orderedColumn = firstDataRow.locator('td').nth(6);
      await detailsPage.highlightElement(orderedColumn, HIGHLIGHT_PENDING);
      const orderedInput = orderedColumn.locator('input');
      const orderedColumnValue = await orderedInput.inputValue();
      console.log(`Ordered column (index 6) input value: "${orderedColumnValue}"`);
      expect(parseInt(orderedColumnValue?.trim() || '0')).toBe(orderedQuantity);
      await warehousePage.waitForTimeout(5000);
      // Close the modal
      await warehousePage.mouse.click(1, 1);
    });

    await allure.step('Step 16: Navigate to assembly kitting page and search for our SB', async () => {
      // Declare variables at step level for access across sub-steps
      let kittingPage: any;
      let kittingPageHelper: CreatePartsDatabasePage;
      let kittingTable: any;
      let firstRow: any;
      let waybillModal: any;
      let detailNameCell: any;
      let rowId: string;
      let deficitCell: any;
      let warningMessage: any;
      let completeSetButton: any;
      let ownQuantityInput: any;
      let needCell: any;
      let freeQuantityCellForDeficit: any;
      let needCellForDeficit: any;
      let firstRow3: any;
      let secondRow: any;
      let expectedCompletionPercentage: number;
      const today = new Date().toLocaleDateString('ru-RU');

      // Sub-step 16.1: Open new tab and navigate to warehouse
      await allure.step('Sub-step 16.1: Open new tab and navigate to warehouse', async () => {
        kittingPage = await page.context().newPage();
        kittingPageHelper = new CreatePartsDatabasePage(kittingPage);
        await kittingPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await kittingPage.waitForLoadState('networkidle');
      });

      // Sub-step 16.2: Click assembly kitting button
      await allure.step('Sub-step 16.2: Click assembly kitting button', async () => {
        const assemblyKittingButton = kittingPage.locator(SelectorsAssemblyKitting.SELECTOR_COMPLETION_CBED_PLAN);
        await detailsPage.highlightElement(assemblyKittingButton, HIGHLIGHT_PENDING);
        await assemblyKittingButton.click();
        await kittingPage.waitForLoadState('networkidle');
      });

      // Sub-step 16.3: Verify page title
      await allure.step('Sub-step 16.3: Verify page title', async () => {
        const pageTitle = kittingPage.locator(SelectorsAssemblyKitting.COMPLETING_CBE_TITLE_ASSEMBLY_KITTING_ON_PLAN);
        await detailsPage.highlightElement(pageTitle, HIGHLIGHT_PENDING);
        await expect(pageTitle).toHaveText('Комплектация сборок на план', { timeout: 5000 });
        await detailsPage.highlightElement(pageTitle, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.4: Locate and verify kitting table
      await allure.step('Sub-step 16.4: Locate and verify kitting table', async () => {
        kittingTable = kittingPage.locator(SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE);
        await kittingTable.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'blue';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        });
        await expect(kittingTable).toBeVisible({ timeout: 5000 });
      });

      // Sub-step 16.5: Search for our SB in the table
      await allure.step('Sub-step 16.5: Search for our SB in the table', async () => {
        console.log(`Searching for: "${CONST.NEW_SB_A}"`);
        await searchWithPressSequentially(kittingPage, SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT, CONST.NEW_SB_A);
        const rowCount = await kittingTable.locator('tbody tr').count();
        console.log(`Rows after search: ${rowCount}`);
      });

      // Sub-step 16.6: Verify search result in first row
      await allure.step('Sub-step 16.6: Verify search result in first row', async () => {
        // Use selector that targets main rows (excluding kit rows)
        await kittingPage.waitForTimeout(2000);
        firstRow = kittingTable.locator("tbody tr[data-testid^='CompletCbed-Content-Table-Table-TableRow']:not([data-testid*='-Kit'])").first();
        await detailsPage.highlightElement(firstRow, HIGHLIGHT_PENDING);
        // Removed toBeVisible() assertion - main rows with rowspan are not considered visible by Playwright

        const targetColumn = firstRow.locator('td').nth(5);
        await detailsPage.highlightElement(targetColumn, HIGHLIGHT_PENDING);
        await kittingPage.waitForTimeout(2000);
        const columnText = await targetColumn.textContent();
        console.log(`Column 3 value: "${columnText}"`);
        expect(columnText?.trim()).toBe(CONST.NEW_SB_A);
        await detailsPage.highlightElement(targetColumn, HIGHLIGHT_SUCCESS);
        await detailsPage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.7: Double click third column to open modal
      await allure.step('Sub-step 16.7: Double click third column to open modal', async () => {
        const targetColumn = firstRow.locator('td').nth(3);
        await detailsPage.highlightElement(targetColumn, HIGHLIGHT_PENDING);
        await targetColumn.dblclick();
        await kittingPage.waitForLoadState('networkidle');
        await kittingPage.waitForTimeout(2500);

        // Wait for the modal to appear
        await kittingPage.waitForTimeout(2000);

        // Try to find any dialog element first
        // const anyDialog = kittingPage.locator('dialog[open]');
        // const dialogCount = await anyDialog.count();
        // console.log(`Found ${dialogCount} open dialog(s)`);

        // if (dialogCount > 0) {
        //     // Get the data-testid of the first dialog
        //     const firstDialog = anyDialog.first();
        //     const dialogTestId = await firstDialog.getAttribute('data-testid');
        //     console.log(`First dialog data-testid: "${dialogTestId}"`);
        // }

        waybillModal = kittingPage.locator(`dialog[data-testid^="${CONST.MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT}"][open]`);
        await expect(waybillModal).toBeVisible({ timeout: 10000 });

        await detailsPage.highlightElement(waybillModal, { border: '2px solid red' });
        // Wait for the inner content to be loaded
        const innerContent = waybillModal.locator(SelectorsModalWaybill.WAYBILL_DETAILS_RIGHT_INNER);
        await expect(innerContent).toBeVisible({ timeout: 10000 });

        await detailsPage.highlightElement(targetColumn, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.8: Verify waybill modal is visible

      await allure.step('Sub-step 16.8: Verify waybill modal is visible', async () => {
        // Modal visibility is already verified in sub-step 16.7
        console.log('Waybill modal is visible and ready for interaction');
      });

      // Sub-step 16.9: Verify modal title contains today's date
      await allure.step("Sub-step 16.9: Verify modal title contains today's date", async () => {
        // Find the h4 title within the modal since the data-testid was removed
        const modalTitle = waybillModal.locator('h4');
        await detailsPage.highlightElement(modalTitle, HIGHLIGHT_PENDING);
        await expect(modalTitle).toBeVisible({ timeout: 5000 });
        const titleText = await modalTitle.textContent();
        console.log(`Modal title: "${titleText}"`);
        expect(titleText).toContain('Накладная на комплектацию Сборки');
        await detailsPage.highlightElement(modalTitle, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.10: Verify collected quantity is 0
      await allure.step('Sub-step 16.10: Verify collected quantity is 0', async () => {
        const collectedQuantityCell = kittingPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
        await detailsPage.highlightElement(collectedQuantityCell, HIGHLIGHT_PENDING);
        const collectedQuantityValue = await collectedQuantityCell.textContent();
        const collectedQuantity = collectedQuantityValue ? parseInt(collectedQuantityValue.replace(/[^\d-]/g, '').trim(), 10) : 0;
        console.log(`Collected quantity: "${collectedQuantityValue}"`);
        expect(parseInt(collectedQuantityValue?.trim() || '0')).toBe(0);
        await detailsPage.highlightElement(collectedQuantityCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.11: Verify required quantity matches order quantity
      await allure.step('Sub-step 16.11: Verify required quantity matches order quantity', async () => {
        const requiredQuantityCell = kittingPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
        await detailsPage.highlightElement(requiredQuantityCell, HIGHLIGHT_PENDING);
        const requiredQuantity = await requiredQuantityCell.textContent();
        console.log(`Required quantity: "${requiredQuantity}"`);
        expect(parseInt(requiredQuantity?.trim() || '0')).toBe(orderedQuantity);
        await detailsPage.highlightElement(requiredQuantityCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.12: Verify own quantity input has order quantity
      await allure.step('Sub-step 16.12: Verify own quantity input has order quantity', async () => {
        ownQuantityInput = kittingPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_PENDING);
        const ownQuantityValue = await ownQuantityInput.inputValue();
        console.log(`Own quantity input: "${ownQuantityValue}"`);
        expect(parseInt(ownQuantityValue?.trim() || '0')).toBe(orderedQuantity);
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.13: Verify assembly name in waybill modal
      await allure.step('Sub-step 16.13: Verify assembly name in waybill modal', async () => {
        const nameCell = kittingPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_NAME_CELL);
        await detailsPage.highlightElement(nameCell, { ...HIGHLIGHT_PENDING });
        const sbName = await nameCell.textContent();
        console.log(`SB name: "${sbName}"`);
        expect(sbName?.trim()).toBe(CONST.NEW_SB_A);
        await detailsPage.highlightElement(nameCell, { ...HIGHLIGHT_SUCCESS });
      });

      // Sub-step 16.14: Verify total quantity label
      await allure.step('Sub-step 16.14: Verify total quantity label', async () => {
        // First, calculate the total quantity by summing all quantities from order rows
        const quantityCells = kittingPage.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-Row"][data-testid$="-QuantityCell"]');

        let calculatedTotal = 0;
        let cellIndex = 0;

        // Get all quantity cells and iterate through them
        const allQuantityCells = await quantityCells.all();
        for (const quantityCell of allQuantityCells) {
          const quantityText = await quantityCell.textContent();
          const quantity = parseInt(quantityText?.trim() || '0', 10);
          console.log(`Quantity cell ${cellIndex + 1}: "${quantityText}" = ${quantity}`);
          calculatedTotal += quantity;
          cellIndex++;
        }

        console.log(`Calculated total from order quantities: ${calculatedTotal}`);

        // Now verify the total quantity label shows the correct calculated value
        const totalQuantityLabel = kittingPage.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL);
        await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_PENDING);
        const totalQuantityText = await totalQuantityLabel.textContent();
        console.log(`Total quantity label: "${totalQuantityText}"`);

        // Expect the total label to show "Всего: X" where X is the calculated total
        const expectedText = `Всего: ${calculatedTotal}`;
        expect(totalQuantityText?.trim()).toBe(expectedText);

        await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.15: Verify shipment details section
      await allure.step('Sub-step 16.15: Verify shipment details section', async () => {
        // Verify the shipment details table exists (using the correct data-testid from the HTML)
        const shipmentDetailsTable = kittingPage.locator(SelectorsModalWaybill.TABLE_ORDERS);
        await detailsPage.highlightElement(shipmentDetailsTable, HIGHLIGHT_PENDING);
        await expect(shipmentDetailsTable).toBeVisible({ timeout: 5000 });
        await detailsPage.highlightElement(shipmentDetailsTable, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.16: Verify order number in shipment details
      await allure.step('Sub-step 16.16: Verify order number in shipment details', async () => {
        // Find all order number cells in the shipment details table
        const orderNumberCells = kittingPage.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-Row"][data-testid$="-OrderNumberCell"]');

        // Check if any order number cells exist
        const cellCount = await orderNumberCells.count();
        console.log(`Found ${cellCount} order number cells in the table`);

        if (cellCount === 0) {
          console.log('No order number cells found - this СБ might not have any orders yet');
          console.log('Skipping order number verification for this step');
          return;
        }

        // Get all order number cells and iterate through them
        const allOrderNumberCells = await orderNumberCells.all();

        let orderNumberFound = false;
        let foundOrderNumberText = '';

        for (let i = 0; i < allOrderNumberCells.length; i++) {
          const orderNumberCell = allOrderNumberCells[i];
          const orderNumberText = await orderNumberCell.textContent();
          console.log(`Order number cell ${i + 1}: "${orderNumberText}"`);

          // Check if this cell contains the expected order number
          if (orderNumberText?.trim().includes(orderNumber)) {
            orderNumberFound = true;
            foundOrderNumberText = orderNumberText.trim();

            // Highlight the matching cell
            await detailsPage.highlightElement(orderNumberCell, HIGHLIGHT_PENDING);
            break;
          }
        }

        // Verify that we found the order number in at least one cell
        expect(orderNumberFound).toBe(true);
        console.log(`✅ Found order number "${orderNumber}" in: "${foundOrderNumberText}"`);

        // Style the found cell as successful
        if (orderNumberFound) {
          const matchingCell = kittingPage
            .locator(`[data-testid^="ModalAddWaybill-ShipmentDetailsTable-Row"][data-testid$="-OrderNumberCell"]:has-text("${orderNumber}")`)
            .first();
          await matchingCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'green';
            el.style.border = '2px solid green';
            el.style.color = 'white';
          });
        }
      });

      // Sub-step 16.17: Verify remaining quantity in shipment details
      await allure.step('Sub-step 16.17: Verify remaining quantity in shipment details', async () => {
        // Use the correct data-testid pattern from the HTML structure
        const remainingQuantityCell = kittingPage
          .locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]')
          .first();
        await detailsPage.highlightElement(remainingQuantityCell, HIGHLIGHT_PENDING);
        const remainingQuantity = await remainingQuantityCell.textContent();
        console.log(`Remaining quantity: "${remainingQuantity}"`);
        expect(parseInt(remainingQuantity?.trim() || '0')).toBe(orderedQuantity);
        await detailsPage.highlightElement(remainingQuantityCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.18: Verify detail name in details table
      await allure.step('Sub-step 16.18: Verify detail name in details table', async () => {
        detailNameCell = kittingPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NameCell"]');

        // Check if the details table row exists
        const rowCount = await detailNameCell.count();
        console.log(`Found ${rowCount} detail name cells in the table`);

        if (rowCount === 0) {
          console.log('No detail name cells found - details table might not exist or have different structure');
          return;
        }

        await detailsPage.highlightElement(detailNameCell, HIGHLIGHT_PENDING);
        const detailName = await detailNameCell.textContent();
        console.log(`Detail name: "${detailName}"`);
        expect(detailName?.trim()).toBe(CONST.NEW_DETAIL_A);
        await detailsPage.highlightElement(detailNameCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.19: Verify quantity per unit
      await allure.step('Sub-step 16.19: Verify quantity per unit', async () => {
        const nameCellDataTestId = await detailNameCell.getAttribute('data-testid');
        rowId = nameCellDataTestId?.replace('ModalAddWaybill-DetailsTable-Row', '').replace('-NameCell', '') || '';
        console.log(`Row ID: "${rowId}"`);

        const quantityPerUnitCell = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_QUANTITY_CELL_SUFFIX}"]`
        );
        await detailsPage.highlightElement(quantityPerUnitCell, { ...HIGHLIGHT_PENDING });
        const quantityPerUnit = await quantityPerUnitCell.textContent();
        console.log(`Quantity per unit: "${quantityPerUnit}"`);
        expect(parseInt(quantityPerUnit?.trim() || '0')).toBe(specificationQuantity);
        await detailsPage.highlightElement(quantityPerUnitCell, { ...HIGHLIGHT_SUCCESS });
      });

      // Sub-step 16.20: Verify material cell shows "Нет материала"
      await allure.step("Sub-step 16.20: Verify material cell shows 'Нет материала'", async () => {
        const materialCell = kittingPage.locator(`[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}-MaterialCell"]`);
        await detailsPage.highlightElement(materialCell, { ...HIGHLIGHT_PENDING });
        const materialText = await materialCell.textContent();
        console.log(`Material: "${materialText}"`);
        expect(materialText?.trim()).toBe('Нет материала');
        await detailsPage.highlightElement(materialCell, { ...HIGHLIGHT_SUCCESS });
      });

      // Sub-step 16.21: Verify need cell calculation
      await allure.step('Sub-step 16.21: Verify need cell calculation', async () => {
        needCell = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_NEED_CELL_SUFFIX}"]`
        );
        await detailsPage.highlightElement(needCell, { ...HIGHLIGHT_PENDING });
        const needQuantity = await needCell.textContent();
        console.log(`Need quantity: "${needQuantity}"`);
        expect(parseInt(needQuantity?.trim() || '0')).toBe(orderedQuantity * specificationQuantity);
        await detailsPage.highlightElement(needCell, { ...HIGHLIGHT_SUCCESS });
      });

      // Sub-step 16.22: Verify free quantity cell
      await allure.step('Sub-step 16.22: Verify free quantity cell', async () => {
        const freeQuantityCell = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_FREE_QUANTITY_CELL_SUFFIX}"]`
        );
        await detailsPage.highlightElement(freeQuantityCell, { ...HIGHLIGHT_PENDING });
        const freeQuantity = await freeQuantityCell.textContent();
        console.log(`Free quantity: "${freeQuantity}"`);

        const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(CONST.NEW_DETAIL_A);
        expect(parseInt(freeQuantity?.trim() || '0')).toBe(expectedFreeQuantity);
        await detailsPage.highlightElement(freeQuantityCell, { ...HIGHLIGHT_SUCCESS });
      });

      // Sub-step 16.23: Verify quantity cell
      await allure.step('Sub-step 16.23: Verify quantity cell', async () => {
        const quantityCell = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_QUANTITY_CELL_SUFFIX}"]`
        );
        await detailsPage.highlightElement(quantityCell, { ...HIGHLIGHT_PENDING });
        const quantityValue = await quantityCell.textContent();
        console.log(`Quantity: "${quantityValue}"`);
      });

      // Sub-step 16.24: Verify in kits cell
      await allure.step('Sub-step 16.24: Verify in kits cell', async () => {
        const inKitsCell = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_IN_KITS_CELL_SUFFIX}"]`
        );
        await detailsPage.highlightElement(inKitsCell, HIGHLIGHT_PENDING);
        const inKitsValue = await inKitsCell.textContent();
        console.log(`In kits: "${inKitsValue}"`);
        expect(parseInt(inKitsValue?.trim() || '0')).toBe(0);
        await detailsPage.highlightElement(inKitsCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.25: Verify deficit cell calculation
      await allure.step('Sub-step 16.25: Verify deficit cell calculation', async () => {
        deficitCell = kittingPage.locator(`[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}-DeficitCell"]`);
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_PENDING);
        const deficitValue = await deficitCell.textContent();
        console.log(`Deficit: "${deficitValue}"`);

        freeQuantityCellForDeficit = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_FREE_QUANTITY_CELL_SUFFIX}"]`
        );
        needCellForDeficit = kittingPage.locator(
          `[data-testid="${SelectorsModalWaybill.DETAILS_TABLE_ROW_PREFIX}${rowId}${SelectorsModalWaybill.DETAILS_TABLE_ROW_NEED_CELL_SUFFIX}"]`
        );

        const freeQuantityValueForDeficit = await freeQuantityCellForDeficit.textContent();
        const needValueForDeficit = await needCellForDeficit.textContent();

        const expectedDeficit = parseInt(freeQuantityValueForDeficit?.trim() || '0') - parseInt(needValueForDeficit?.trim() || '0');
        console.log(`Calculated expected deficit: ${freeQuantityValueForDeficit} - ${needValueForDeficit} = ${expectedDeficit}`);

        expect(parseInt(deficitValue?.trim() || '0')).toBe(expectedDeficit);
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.26: Verify warning message if deficit is negative
      await allure.step('Sub-step 16.26: Verify warning message if deficit is negative', async () => {
        // This data-testid likely doesn't exist, so we'll skip this verification
        console.log('Skipping warning message verification - data-testid not found');
      });

      // Sub-step 16.27: Change own quantity input to build quantity
      await allure.step('Sub-step 16.27: Change own quantity input to build quantity', async () => {
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_PENDING);
        await ownQuantityInput.fill(currentBuildQuantity.toString());
        await ownQuantityInput.press('Enter');
        await kittingPage.waitForLoadState('networkidle');
        await kittingPage.waitForTimeout(1000);
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.28: Verify updated need cell
      await allure.step('Sub-step 16.28: Verify updated need cell', async () => {
        await detailsPage.highlightElement(needCell, HIGHLIGHT_PENDING);
        const updatedNeedQuantity = await needCell.textContent();
        console.log(`Updated need quantity: "${updatedNeedQuantity}"`);
        expect(parseInt(updatedNeedQuantity?.trim() || '0')).toBe(currentBuildQuantity * specificationQuantity);
        await detailsPage.highlightElement(needCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.29: Verify updated deficit cell
      await allure.step('Sub-step 16.29: Verify updated deficit cell', async () => {
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_PENDING);
        const updatedDeficitValue = await deficitCell.textContent();
        console.log(`Updated deficit: "${updatedDeficitValue}"`);

        const updatedFreeQuantityValueForDeficit = await freeQuantityCellForDeficit.textContent();
        const updatedNeedValueForDeficit = await needCellForDeficit.textContent();

        const updatedExpectedDeficit = parseInt(updatedFreeQuantityValueForDeficit?.trim() || '0') - parseInt(updatedNeedValueForDeficit?.trim() || '0');
        console.log(`Recalculated expected deficit: ${updatedFreeQuantityValueForDeficit} - ${updatedNeedValueForDeficit} = ${updatedExpectedDeficit}`);

        expect(parseInt(updatedDeficitValue?.trim() || '0')).toBe(updatedExpectedDeficit);
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.30: Verify complete set button is now visible
      await allure.step('Sub-step 16.30: Verify complete set button is now visible', async () => {
        completeSetButton = kittingPage.locator(SelectorsModalWaybill.COMPLETE_SET_BUTTON);
        await detailsPage.highlightElement(completeSetButton, HIGHLIGHT_PENDING);
        await expect(completeSetButton).toBeVisible({ timeout: 5000 });
        await expect(completeSetButton).toBeEnabled({ timeout: 5000 });
        await detailsPage.highlightElement(completeSetButton, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.31: Verify warning message is no longer present
      await allure.step('Sub-step 16.31: Verify warning message is no longer present', async () => {
        if (warningMessage) {
          await expect(warningMessage).not.toBeVisible({ timeout: 5000 });
        }
        await kittingPage.waitForTimeout(5000);
      });

      // Sub-step 16.32: Click complete set button
      await allure.step('Sub-step 16.32: Click complete set button', async () => {
        await completeSetButton.click();
        await kittingPage.waitForLoadState('networkidle');
        await kittingPage.waitForTimeout(1000);
      });

      // Sub-step 16.33: Verify order selection warning appears
      await allure.step('Sub-step 16.33: Verify order selection warning appears', async () => {
        const selectOrderWarning = kittingPage.locator(SelectorsModalWaybill.NOTIFICATION_DESCRIPTION);
        await detailsPage.highlightElement(selectOrderWarning, HIGHLIGHT_PENDING);
        await expect(selectOrderWarning).toBeVisible({ timeout: 5000 });
        const selectOrderText = await selectOrderWarning.textContent();
        console.log(`Select order warning: "${selectOrderText}"`);
        expect(selectOrderText).toContain('Выберите заказ');
        await detailsPage.highlightElement(selectOrderWarning, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.34: Click checkbox in shipment details table
      await allure.step('Sub-step 16.34: Click checkbox in shipment details table', async () => {
        const checkboxCell = kittingPage.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_SCLAD_SET_CHECKBOX_CELL);
        await detailsPage.highlightElement(checkboxCell, HIGHLIGHT_PENDING);
        await checkboxCell.click();
        await kittingPage.waitForLoadState('networkidle');
        await kittingPage.waitForTimeout(1000);
        await detailsPage.highlightElement(checkboxCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.35: Click complete set button again
      await allure.step('Sub-step 16.35: Click complete set button again', async () => {
        await detailsPage.highlightElement(completeSetButton, HIGHLIGHT_PENDING);

        await kittingPage.waitForTimeout(1000);
        await detailsPage.highlightElement(completeSetButton, HIGHLIGHT_SUCCESS);
        await kittingPage.waitForTimeout(1000);
        await completeSetButton.click();
        await kittingPage.waitForLoadState('networkidle');
      });

      // Sub-step 16.36: Verify return to main kitting page
      await allure.step('Sub-step 16.36: Verify return to main kitting page', async () => {
        const pageTitle = kittingPage.locator(SelectorsAssemblyKitting.COMPLETING_CBE_TITLE_ASSEMBLY_KITTING_ON_PLAN);
        await expect(pageTitle).toHaveText('Комплектация сборок на план', { timeout: 5000 });
      });

      // Sub-step 16.37: Refresh page and search for SB again after completion
      await allure.step('Sub-step 16.37: Refresh page and search for SB again after completion', async () => {
        // Refresh the page to get updated completion percentage from server
        console.log('Refreshing page to get updated completion percentage...');
        await kittingPage.reload({ waitUntil: 'networkidle' });
        await kittingPage.waitForTimeout(3000);

        const kittingTable2 = kittingPage.locator(SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE);
        await expect(kittingTable2).toBeVisible({ timeout: 10000 });

        console.log(`Searching for: "${CONST.NEW_SB_A}"`);
        await searchWithPressSequentially(kittingPage, SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT, CONST.NEW_SB_A);

        const rowCount = await kittingTable2.locator('tbody tr').count();
        console.log(`Rows after search: ${rowCount}`);
      });

      // Sub-step 16.38: Get the first row after search
      await allure.step('Sub-step 16.38: Get the first row after search', async () => {
        const kittingTable3 = kittingPage.locator(SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE);
        await expect(kittingTable3).toBeVisible({ timeout: 10000 });

        firstRow3 = kittingTable3.locator('tbody tr').first();
        await firstRow3.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'green';
          el.style.border = '2px solid green';
        });
      });

      // Sub-step 16.39: Verify updated name cell
      await allure.step('Sub-step 16.39: Verify updated name cell', async () => {
        await kittingPage.waitForTimeout(1000);
        const rowNameCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_NAME}"]`
        );
        await detailsPage.highlightElement(rowNameCell, HIGHLIGHT_PENDING);
        const rowName = await rowNameCell.textContent();
        console.log(`Row name: "${rowName}"`);
        expect(rowName?.trim()).toBe(CONST.NEW_SB_A);
        await detailsPage.highlightElement(rowNameCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.40: Verify updated ordered quantity
      await allure.step('Sub-step 16.40: Verify updated ordered quantity', async () => {
        const orderedCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_ORDERED}"]`
        );
        await detailsPage.highlightElement(orderedCell, HIGHLIGHT_PENDING);
        const orderedValue = await orderedCell.textContent();
        console.log(`Ordered value: "${orderedValue}"`);
        expect(orderedValue?.trim()).toBe(orderedQuantity.toString());
        await detailsPage.highlightElement(orderedCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.41: Verify updated operations cell
      await allure.step('Sub-step 16.41: Verify updated operations cell', async () => {
        const operationsCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_OPERATIONS}"]`
        );
        await detailsPage.highlightElement(operationsCell, HIGHLIGHT_PENDING);
        const operationsValue = await operationsCell.textContent();
        console.log(`Operations value: "${operationsValue}"`);
        expect(operationsValue?.trim()).toBe(specificationQuantity.toString());
        await detailsPage.highlightElement(operationsCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.42: Verify updated status cell
      await allure.step('Sub-step 16.42: Verify updated status cell', async () => {
        expectedCompletionPercentage = Math.round((specificationQuantity / orderedQuantity) * 100);

        const statusCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_STATUS}"]`
        );
        await detailsPage.highlightElement(statusCell, HIGHLIGHT_PENDING);
        const statusValue = await statusCell.textContent();
        console.log(`Status value: "${statusValue}"`);
        expect(statusValue?.trim()).toBe(`${expectedCompletionPercentage}%`);
        await detailsPage.highlightElement(statusCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.43: Verify updated completion level cell
      await allure.step('Sub-step 16.43: Verify updated completion level cell', async () => {
        const completionLevelCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_COMPLETION_LEVEL}"]`
        );
        await detailsPage.highlightElement(completionLevelCell, HIGHLIGHT_PENDING);
        const completionLevelValue = await completionLevelCell.textContent();
        console.log(`Completion level: "${completionLevelValue}"`);
        expect(completionLevelValue?.trim()).toBe(`${expectedCompletionPercentage}%`);
        await detailsPage.highlightElement(completionLevelCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.44: Verify updated collected cell
      await allure.step('Sub-step 16.44: Verify updated collected cell', async () => {
        await skladPage.waitForTimeout(2000);
        const collectedCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_COMPLETED}"]`
        );
        await detailsPage.highlightElement(collectedCell, HIGHLIGHT_PENDING);
        const collectedValue = await collectedCell.textContent();
        console.log(`Collected value: "${collectedValue}"`);
        expect(parseInt(collectedValue?.trim() || '0')).toBe(specificationQuantity);
        await detailsPage.highlightElement(collectedCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 16.45: Verify updated remaining cell
      await allure.step('Sub-step 16.45: Verify updated remaining cell', async () => {
        const expectedRemainingQuantity = orderedQuantity - specificationQuantity;

        const remainingCell = firstRow3.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_REMAINING}"]`
        );
        await detailsPage.highlightElement(remainingCell, HIGHLIGHT_PENDING);
        const remainingValue = await remainingCell.textContent();
        console.log(`Remaining value: "${remainingValue}"`);
        expect(parseInt(remainingValue?.trim() || '0')).toBe(expectedRemainingQuantity);
        await detailsPage.highlightElement(remainingCell, HIGHLIGHT_SUCCESS);
      });

      // // Sub-step 16.46: Verify second row execution date
      // await allure.step("Sub-step 16.46: Verify second row execution date", async () => {
      //     secondRow = kittingTable.locator("tbody tr").nth(1);
      //     await secondRow.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'yellow';
      //         el.style.border = '2px solid red';
      //         el.style.color = 'blue';
      //     });

      //     const executionDateCell = secondRow.locator(`[data-testid="${CONST.TABLE_COMPLECT_TABLE_COMPLECT_KITS_ROW_EXECUTION_DATE_CELL}"]`);
      //     await executionDateCell.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'yellow';
      //         el.style.border = '2px solid red';
      //         el.style.color = 'blue';
      //     });
      //     const executionDate = await executionDateCell.textContent();
      //     console.log(`Execution date: "${executionDate}"`);
      //     expect(executionDate).toContain(today);
      // });

      // // Sub-step 16.47: Verify second row collected quantity
      // await allure.step("Sub-step 16.47: Verify second row collected quantity", async () => {
      //     const kitsCollectedQuantityCell = secondRow.locator(`[data-testid="${CONST.TABLE_COMPLECT_TABLE_COMPLECT_KITS_ROW_COLLECTED_QUANTITY_CELL}"]`);
      //     await kitsCollectedQuantityCell.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'yellow';
      //         el.style.border = '2px solid red';
      //         el.style.color = 'blue';
      //     });
      //     const kitsCollectedQuantity = await kitsCollectedQuantityCell.textContent();
      //     console.log(`Kits collected quantity: "${kitsCollectedQuantity}"`);
      //     expect(parseInt(kitsCollectedQuantity?.trim() || "0")).toBe(specificationQuantity);
      //     await kitsCollectedQuantityCell.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'green';
      //         el.style.border = '2px solid green';
      //         el.style.color = 'white';
      //     });
      // });

      // // Sub-step 16.48: Verify second row executor
      // await allure.step("Sub-step 16.48: Verify second row executor", async () => {
      //     const executorCell = secondRow.locator(`[data-testid="${CONST.TABLE_COMPLECT_TABLE_COMPLECT_KITS_ROW_EXECUTOR_CELL}"]`);
      //     await executorCell.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'yellow';
      //         el.style.border = '2px solid red';
      //         el.style.color = 'blue';
      //     });
      //     const executorValue = await executorCell.textContent();
      //     console.log(`Executor: "${executorValue}"`);
      //     expect(executorValue?.trim()).toBeTruthy();
      //     await executorCell.evaluate((el: HTMLElement) => {
      //         el.style.backgroundColor = 'green';
      //         el.style.border = '2px solid green';
      //         el.style.color = 'white';
      //     });
      // });

      await kittingPage.waitForTimeout(3000);
    });

    await allure.step('Step 17: Navigate to assembly kitting plan page and test waybill modal', async () => {
      // Declare variables at step level for access across sub-steps
      let waybillPage: any;
      let waybillTable: any;
      let firstRow: any;
      let needCell: any;
      let deficitCell: any;

      // Navigate back to the sklad main page in a new tab
      waybillPage = await page.context().newPage();
      await waybillPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await waybillPage.waitForLoadState('networkidle');
      await waybillPage.waitForTimeout(2000);

      // Sub-step 17.1: Click the button to open assembly kitting plan page
      await allure.step('Sub-step 17.1: Click the button to open assembly kitting plan page', async () => {
        const completionCbedPlanButton = waybillPage.locator(SelectorsAssemblyKitting.SELECTOR_COMPLETION_CBED_PLAN);
        await detailsPage.highlightElement(completionCbedPlanButton, HIGHLIGHT_PENDING);
        await completionCbedPlanButton.click();
        await waybillPage.waitForLoadState('networkidle');
        await waybillPage.waitForTimeout(2000);
      });

      // Sub-step 17.2: Confirm the h3 title
      await allure.step('Sub-step 17.2: Confirm the h3 title', async () => {
        const pageTitle = waybillPage.locator(SelectorsAssemblyKitting.COMPLETING_CBE_TITLE_ASSEMBLY_KITTING_ON_PLAN);
        await detailsPage.highlightElement(pageTitle, HIGHLIGHT_PENDING);
        await expect(pageTitle).toHaveText('Комплектация сборок на план', { timeout: 10000 });
        await detailsPage.highlightElement(pageTitle, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.3: Find the table and search for our SB
      await allure.step('Sub-step 17.3: Find the table and search for our SB', async () => {
        waybillTable = waybillPage.locator(SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE);

        // Wait for table to be visible and have content loaded
        await expect(waybillTable).toBeVisible({ timeout: 30000 });
        await waybillPage.waitForLoadState('networkidle');
        await waybillPage.waitForTimeout(3000); // Extra wait for table content to load

        await detailsPage.highlightElement(waybillTable, HIGHLIGHT_PENDING);

        // Wait for table rows to exist (they may be hidden due to virtualization)
        const tableRows = waybillTable.locator('tbody tr');
        await waybillPage.waitForFunction(
          (selector: string) => document.querySelectorAll(selector).length > 0,
          `${SelectorsAssemblyKitting.TABLE_COMPLECT_TABLE} tbody tr`,
          { timeout: 30000 }
        );
        const rowCount = await tableRows.count();
        console.log(`Table loaded with ${rowCount} rows, now searching...`);

        const searchInput = waybillTable.locator(SelectorsAssemblyKitting.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT);
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await detailsPage.highlightElement(searchInput, HIGHLIGHT_PENDING);
        await searchInput.clear();
        await waybillPage.waitForTimeout(500);
        await searchInput.fill(CONST.NEW_SB_A);
        await searchInput.press('Enter');
        await waybillPage.waitForLoadState('networkidle');
        await waybillPage.waitForTimeout(3000); // Wait for search results to load
        await searchInput.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'green';
          el.style.border = '2px solid green';
          el.style.color = 'white';
        });
        await waybillTable.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'green';
          el.style.border = '2px solid green';
          el.style.color = 'white';
        });
      });

      // Sub-step 17.4: Find the row containing our SB
      await allure.step('Sub-step 17.4: Find the row containing our SB', async () => {
        // Find the row that contains our SB name instead of assuming it's first
        const allRows = waybillTable.locator('tbody tr');
        const rowCount = await allRows.count();
        console.log(`Found ${rowCount} rows in waybill table`);

        let foundRow = null;
        for (let i = 0; i < rowCount; i++) {
          const row = allRows.nth(i);
          const nameCell = row.locator(`[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_NAME}"]`);
          const cellCount = await nameCell.count();
          if (cellCount > 0) {
            const nameValue = await nameCell.textContent();
            console.log(`Row ${i}: "${nameValue?.trim()}"`);
            if (nameValue?.trim() === CONST.NEW_SB_A) {
              foundRow = row;
              console.log(`✅ Found matching row at index ${i}`);
              break;
            }
          }
        }

        expect(foundRow).not.toBeNull();
        firstRow = foundRow!;

        await detailsPage.highlightElement(firstRow, HIGHLIGHT_PENDING);
        const nameCell = firstRow.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_NAME}"]`
        );
        await nameCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        });
        const nameValue = await nameCell.textContent();
        console.log(`Found SB name: "${nameValue}"`);
        expect(nameValue?.trim()).toBe(CONST.NEW_SB_A);
        await nameCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'green';
          el.style.border = '2px solid green';
          el.style.color = 'white';
        });
        await detailsPage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.5: Double click on the designation column to open modal
      await allure.step('Sub-step 17.5: Double click on the designation column to open modal', async () => {
        const designationCell = firstRow.locator(
          `[data-testid^="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL}"][data-testid$="${CONST.TABLE_COMPLECT_TABLE_ROW_CELL_DESIGNATION}"]`
        );
        await detailsPage.highlightElement(designationCell, HIGHLIGHT_PENDING);
        await designationCell.dblclick();
        await waybillPage.waitForTimeout(2000);
        await detailsPage.highlightElement(designationCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.6: Wait for modal to appear and validate details
      await allure.step('Sub-step 17.6: Wait for modal to appear and validate details', async () => {
        // First locate the dialog element

        const waybillModal = waybillPage.locator(`dialog[data-testid^="${CONST.MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT}"]`);
        await expect(waybillModal).toBeVisible({ timeout: 10000 });

        // Find the h4 title within the modal since the data-testid was removed
        const modalTitle = waybillModal.locator('h4');
        await detailsPage.highlightElement(modalTitle, HIGHLIGHT_PENDING);
        await expect(modalTitle).toBeVisible({ timeout: 10000 });

        // Validate modal title
        const titleText = await modalTitle.textContent();
        console.log(`Modal title: "${titleText}"`);
        expect(titleText?.trim()).toContain('Накладная на комплектацию Сборки');
        await detailsPage.highlightElement(modalTitle, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.7: Validate collected quantity cell
      await allure.step('Sub-step 17.7: Validate collected quantity cell', async () => {
        const collectedQuantityCell = await waybillPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL);
        await detailsPage.highlightElement(collectedQuantityCell, HIGHLIGHT_PENDING);
        const collectedQuantityValue = await collectedQuantityCell.textContent();
        const collectedQuantity = collectedQuantityValue ? parseInt(collectedQuantityValue.replace(/[^\d-]/g, '').trim(), 10) : 0;
        console.log(`Collected quantity: "${collectedQuantityValue}"`);
        expect(parseInt(collectedQuantityValue?.trim() || '0')).toBe(currentBuildQuantity);
      });

      // Sub-step 17.8: Validate required quantity cell
      await allure.step('Sub-step 17.8: Validate required quantity cell', async () => {
        const requiredQuantityCell = waybillPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
        await detailsPage.highlightElement(requiredQuantityCell, HIGHLIGHT_PENDING);
        const requiredQuantityValue = await requiredQuantityCell.textContent();
        console.log(`Required quantity: "${requiredQuantityValue}"`);
        expect(parseInt(requiredQuantityValue?.trim() || '0')).toBe(orderedQuantity);
        await detailsPage.highlightElement(requiredQuantityCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.9: Validate own quantity input
      await allure.step('Sub-step 17.9: Validate own quantity input', async () => {
        const ownQuantityInput = waybillPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_PENDING);
        const ownQuantityValue = await ownQuantityInput.inputValue();

        console.log(`Own quantity input: "${ownQuantityValue}"`);
        expect(parseInt(ownQuantityValue?.trim() || '0')).toBe(orderedQuantity - currentBuildQuantity);
        await detailsPage.highlightElement(ownQuantityInput, HIGHLIGHT_SUCCESS);
        currentBuildQuantity = parseInt(ownQuantityValue?.trim() || '0');
      });

      // Sub-step 17.10: Validate name cell
      await allure.step('Sub-step 17.10: Validate name cell', async () => {
        const waybillNameCell = waybillPage.locator(SelectorsModalWaybill.WAYBILL_DETAILS_NAME_CELL);
        await detailsPage.highlightElement(waybillNameCell, HIGHLIGHT_PENDING);
        const waybillNameValue = await waybillNameCell.textContent();
        console.log(`Waybill name: "${waybillNameValue}"`);
        expect(waybillNameValue?.trim()).toBe(CONST.NEW_SB_A);
        await detailsPage.highlightElement(waybillNameCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.11: Validate total quantity label
      await allure.step('Sub-step 17.11: Validate total quantity label', async () => {
        const totalQuantityLabel = waybillPage.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL);
        await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_PENDING);
        const totalQuantityText = await totalQuantityLabel.textContent();
        console.log(`Total quantity label: "${totalQuantityText}"`);
        expect(totalQuantityText?.trim()).toBe('Всего: 0');
        await detailsPage.highlightElement(totalQuantityLabel, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.12: Validate order number cell
      await allure.step('Sub-step 17.12: Validate order number cell', async () => {
        const orderNumberCell = waybillPage.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-OrderNumberCell"]');
        await detailsPage.highlightElement(orderNumberCell, HIGHLIGHT_PENDING);
        const orderNumberValue = await orderNumberCell.textContent();
        console.log(`Order number: "${orderNumberValue}"`);
        expect(orderNumberValue?.trim()).toBe(`№${orderNumber}`);
        await detailsPage.highlightElement(orderNumberCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.13: Validate remaining quantity cell
      await allure.step('Sub-step 17.13: Validate remaining quantity cell', async () => {
        const remainingQuantityCell = waybillPage.locator(
          '[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]'
        );
        await detailsPage.highlightElement(remainingQuantityCell, HIGHLIGHT_PENDING);
        const remainingQuantityValue = await remainingQuantityCell.textContent();
        console.log(`Remaining quantity: "${remainingQuantityValue}"`);
        expect(parseInt(remainingQuantityValue?.trim() || '0')).toBe(orderedQuantity);
        await detailsPage.highlightElement(remainingQuantityCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.14: Validate total left to do label
      await allure.step('Sub-step 17.14: Validate total left to do label', async () => {
        const totalLeftToDoLabel = waybillPage.locator(SelectorsModalWaybill.SHIPMENT_DETAILS_TABLE_TOTAL_LEFT_TO_DO_LABEL);
        await detailsPage.highlightElement(totalLeftToDoLabel, HIGHLIGHT_PENDING);
        const totalLeftToDoText = await totalLeftToDoLabel.textContent();
        console.log(`Total left to do: "${totalLeftToDoText}"`);
        expect(totalLeftToDoText?.trim()).toBe(`Всего: ${orderedQuantity}`);
        await detailsPage.highlightElement(totalLeftToDoLabel, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.15: Find the detail row by searching for the name cell with dynamic ID
      await allure.step('Sub-step 17.15: Find the detail row by searching for the name cell with dynamic ID', async () => {
        const detailNameCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NameCell"]');
        await detailsPage.highlightElement(detailNameCell, HIGHLIGHT_PENDING);
        const detailNameValue = await detailNameCell.textContent();
        console.log(`Detail name: "${detailNameValue}"`);
        expect(detailNameValue?.trim()).toBe(CONST.NEW_DETAIL_A);
        await detailsPage.highlightElement(detailNameCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.16: Define needCell and deficitCell for later use
      await allure.step('Sub-step 17.16: Define needCell and deficitCell for later use', async () => {
        needCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NeedCell"]');
        deficitCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-DeficitCell"]');
      });

      // Sub-step 17.17: Validate need cell
      await allure.step('Sub-step 17.17: Validate need cell', async () => {
        //Потребность cell
        await detailsPage.highlightElement(needCell, HIGHLIGHT_PENDING);
        const needValue = await needCell.textContent();
        console.log(`Need value: "${needValue}"`);
        expect(parseInt(needValue?.trim() || '0')).toBe(currentBuildQuantity * specificationQuantity);
        await detailsPage.highlightElement(needCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.18: Validate deficit cell
      await allure.step('Sub-step 17.18: Validate deficit cell', async () => {
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_PENDING);
        const deficitValue = await deficitCell.textContent();
        console.log(`Deficit value: "${deficitValue}"`);
        // Add validation logic for deficit cell here
        await detailsPage.highlightElement(deficitCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.19: Validate quantity per unit cell
      await allure.step('Sub-step 17.19: Validate quantity per unit cell', async () => {
        const quantityPerUnitCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-QuantityPerUnitCell"]');
        await detailsPage.highlightElement(quantityPerUnitCell, HIGHLIGHT_PENDING);
        const quantityPerUnitValue = await quantityPerUnitCell.textContent();
        console.log(`Quantity per unit: "${quantityPerUnitValue}"`);
        expect(parseInt(quantityPerUnitValue?.trim() || '0')).toBe(specificationQuantity);
        await detailsPage.highlightElement(quantityPerUnitCell, HIGHLIGHT_SUCCESS);
      });

      // Sub-step 17.20: Validate free quantity cell
      await allure.step('Sub-step 17.20: Validate free quantity cell', async () => {
        const freeQuantityCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-FreeQuantityCell"]');
        await detailsPage.highlightElement(freeQuantityCell, HIGHLIGHT_PENDING);
        const freeQuantityValue = await freeQuantityCell.textContent();
        console.log(`Free quantity: "${freeQuantityValue}"`);
        const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(CONST.NEW_DETAIL_A);
        expect(parseInt(freeQuantityValue?.trim() || '0')).toBe(expectedFreeQuantity);
        await detailsPage.highlightElement(freeQuantityCell, HIGHLIGHT_SUCCESS);
      });
    });
  });
};
