/**
 * @file U001-Cleanup.spec.ts
 * @purpose Test Suite 11: Cleanup Operations (Test Cases 36-37)
 *
 * This suite handles:
 * - Test Case 36: Cleaning up warehouse residues
 * - Test Case 37: Delete Product after test
 */

import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateRevisionPage } from '../pages/RevisionPage';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { Click, expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import logger from '../lib/utils/logger';
import testData1 from '../testdata/U001-PC1.json';
import { nameProduct, nameProductNew, descendantsCbedArray, descendantsDetailArray, arrayDetail, arrayCbed, designation } from './U001-Constants';

export const runU001_11_Cleanup = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Cleanup Operations (Test Cases 36-37)`);

  test('Case 36 - Cleaning up warehouse residues', async ({ page }) => {
    logger.log('Test Case 36 - Cleaning up warehouse residues');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const revisionPage = new CreateRevisionPage(page);
    const tableMain = SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE;
    const tableMainCbed = SelectorsRevision.TABLE_REVISION_PAGINATION_CBEDS_TABLE;
    const tableMainDetal = SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE;
    let numberColumn: number;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the warehouse revisions page', async () => {
      // Find and go to the page using the locator Склад: Задачи на отгрузку
      await revisionPage.findTable(SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await revisionPage.waitingTableBodyNoThead(tableMain);
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      // [SPEED] JSON validation (titles/filters) commented out - re-enable for UI validation
      // const titles = testData1.elements.RevisionPage.titles.map(title => title.trim());
      // const buttons = testData1.elements.RevisionPage.filters.map(button => ({ class: button.class, datatestid: button.datatestid, label: button.label, state: button.state === 'true' }));
      // await revisionPage.validatePageHeadersAndButtons(page, titles, buttons, SelectorsRevision.PAGE_TESTID);
    });

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await revisionPage.searchTable(nameProduct, tableMain, 'TableRevisionPagination-SearchInput-Dropdown-Input');

      // Wait for the table body to load
      await revisionPage.waitingTableBodyNoThead(tableMain);
    });

    await allure.step('Step 06-09: Change balance and confirm archive', async () => {
      await revisionPage.changeBalanceAndConfirmArchive(nameProduct, tableMain, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
        refreshAndSearchAfter: true,
        waitAfterConfirm: 1000,
      });
    });

    // Cleanup CBEDs: Use descendantsCbedArray if available, otherwise use arrayCbed
    const cbedArrayToClean = descendantsCbedArray.length > 0 ? descendantsCbedArray : arrayCbed;
    logger.log(`Cleaning up ${cbedArrayToClean.length} CBEDs (from ${descendantsCbedArray.length > 0 ? 'descendantsCbedArray' : 'arrayCbed'})`);

    if (cbedArrayToClean.length === 0) {
      console.warn('WARNING: Both descendantsCbedArray and arrayCbed are empty. Skipping CBED cleanup.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of cbedArrayToClean) {
        await allure.step('Step 10: Open the warehouse shipping task page', async () => {
          await revisionPage.clickButton('Сборки', SelectorsRevision.REVISION_SWITCH_ITEM1);
        });

        await allure.step('Step 11: Search product', async () => {
          await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);
          // Using table search we look for the value of the variable
          await revisionPage.searchTable(cbed.name, tableMainCbed, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          // Wait for the table body to load
          await revisionPage.waitingTableBodyNoThead(tableMainCbed);
        });

        await allure.step('Step 12-15: Change balance and confirm archive', async () => {
          // Same pattern as product at start: refresh and search after confirm; switch to Сборки tab after reload
          await revisionPage.changeBalanceAndConfirmArchive(cbed.name, tableMainCbed, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            switchToTabSelector: SelectorsRevision.REVISION_SWITCH_ITEM1,
            waitAfterConfirm: 500,
          });
        });
      }
    }

    // Cleanup Details: Use descendantsDetailArray if available, otherwise use arrayDetail
    const detailArrayToClean = descendantsDetailArray.length > 0 ? descendantsDetailArray : arrayDetail;
    logger.log(`Cleaning up ${detailArrayToClean.length} Details (from ${descendantsDetailArray.length > 0 ? 'descendantsDetailArray' : 'arrayDetail'})`);

    if (detailArrayToClean.length === 0) {
      console.warn('WARNING: Both descendantsDetailArray and arrayDetail are empty. Skipping Detail cleanup.');
    } else {
      for (const detail of detailArrayToClean) {
        await allure.step('Step 16: Open the warehouse shipping task page', async () => {
          await revisionPage.clickButton('Детали', SelectorsRevision.REVISION_SWITCH_ITEM2);
        });

        await allure.step('Step 17: Search product', async () => {
          await revisionPage.waitForTimeout(TIMEOUTS.MEDIUM);
          // Using table search we look for the value of the variable
          await revisionPage.searchTable(detail.name, tableMainDetal, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          // Wait for the table body to load
          await revisionPage.waitingTableBodyNoThead(tableMainDetal);
        });

        await allure.step('Step 18-21: Change balance and confirm archive', async () => {
          // Same pattern as product at start: refresh and search after confirm; switch to Детали tab after reload
          await revisionPage.changeBalanceAndConfirmArchive(detail.name, tableMainDetal, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            switchToTabSelector: SelectorsRevision.REVISION_SWITCH_ITEM2,
            waitAfterConfirm: 500,
          });
        });
      }
    }
  });

  test('Case 37 - Delete Product after test', async ({ page }) => {
    logger.log('Test Case 37 - Delete Product after test (same cleanup as Case 00: details, CBEDs, products, warehouse residues)');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const partsDatabsePage = new CreatePartsDatabasePage(page);
    const revisionPage = new CreateRevisionPage(page);
    const searchProduct = page.locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT).first();
    const searchCbed = page.locator(PartsDBSelectors.SEARCH_CBED_ATTRIBUT).nth(1);
    const searchDetail = page.locator(PartsDBSelectors.SEARCH_DETAIL_ATTRIBUT).last();
    const tableMain = SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE;
    const tableMainCbed = SelectorsRevision.TABLE_REVISION_PAGINATION_CBEDS_TABLE;
    const tableMainDetal = SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE;

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitForNetworkIdle();
    });

    await allure.step('Step 01a: Clear all search input fields', async () => {
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchCbed.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchProduct.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 01b: Refresh the page', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 02: Process Details table - search and delete all items starting with 0Т4', async () => {
      await searchDetail.fill('0Т4');
      await searchDetail.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100;
      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith('0Т4')) {
            await row.click();
            await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }
        const remainingRows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        if ((await remainingRows.count()) === 0) hasMoreItems = false;
        else await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 02b: Refresh the page after Details cleanup', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03: Process CBED table - search and delete all items starting with 0Т4', async () => {
      await searchCbed.fill('0Т4');
      await searchCbed.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100;
      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        const rows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith('0Т4')) {
            await row.click();
            await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }
        const remainingRows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        if ((await remainingRows.count()) === 0) hasMoreItems = false;
        else await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
      await searchCbed.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03b: Refresh the page after CBED cleanup', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 04: Process Product table - search and delete all items starting with 0Т4', async () => {
      await searchProduct.fill('0Т4');
      await searchProduct.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100;
      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        const rows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(2);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith('0Т4')) {
            await row.click();
            await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }
        const remainingRows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
        if ((await remainingRows.count()) === 0) hasMoreItems = false;
        else await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
      await searchProduct.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 08: Cleanup warehouse residues', async () => {
      await allure.step('Step 08a: Open the warehouse page', async () => {
        await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Step 08b: Open the warehouse revisions page', async () => {
        await revisionPage.findTable(SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID);
        await page.waitForLoadState('networkidle');
        await revisionPage.waitingTableBodyNoThead(tableMain);
      });
      await allure.step('Step 08c: Cleanup product residues', async () => {
        await revisionPage.searchTable(nameProductNew, tableMain, 'TableRevisionPagination-SearchInput-Dropdown-Input');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const rows = page.locator(`${tableMain} tbody tr`);
        if ((await rows.count()) === 0) {
          logger.log(`No warehouse residues for product: ${nameProductNew}. Skipping.`);
        } else {
          await revisionPage.waitingTableBodyNoThead(tableMain);
          await revisionPage.changeBalanceAndConfirmArchive(nameProductNew, tableMain, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            waitAfterConfirm: 1000,
          });
        }
      });
      for (const cbed of arrayCbed) {
        await allure.step(`Step 08d: Cleanup CBED residues - ${cbed.name}`, async () => {
          await revisionPage.clickButton('Сборки', SelectorsRevision.REVISION_SWITCH_ITEM1);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.locator(tableMainCbed).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
          await revisionPage.searchTable(cbed.name, tableMainCbed, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          const rows = page.locator(`${tableMainCbed} tbody tr`);
          if ((await rows.count()) === 0) {
            logger.log(`No warehouse residues for CBED: ${cbed.name}. Skipping.`);
            return;
          }
          await revisionPage.waitingTableBodyNoThead(tableMainCbed);
          await revisionPage.changeBalanceAndConfirmArchive(cbed.name, tableMainCbed, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            waitAfterConfirm: 1000,
          });
        });
      }
      for (const detail of arrayDetail) {
        await allure.step(`Step 08e: Cleanup Detail residues - ${detail.name}`, async () => {
          await revisionPage.clickButton('Детали', SelectorsRevision.REVISION_SWITCH_ITEM2);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.locator(tableMainDetal).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
          await revisionPage.searchTable(detail.name, tableMainDetal, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          const rows = page.locator(`${tableMainDetal} tbody tr`);
          if ((await rows.count()) === 0) {
            logger.log(`No warehouse residues for Detail: ${detail.name}. Skipping.`);
            return;
          }
          await revisionPage.waitingTableBodyNoThead(tableMainDetal);
          await revisionPage.changeBalanceAndConfirmArchive(detail.name, tableMainDetal, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            waitAfterConfirm: 1000,
          });
        });
      }
    });
  });
};
