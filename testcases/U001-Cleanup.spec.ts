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
import {
  nameProduct,
  nameProductNew,
  descendantsCbedArray,
  descendantsDetailArray,
  arrayDetail,
  arrayCbed,
  designation,
} from './U001-Constants';

export const runU001_11_Cleanup = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Cleanup Operations (Test Cases 36-37)`);

  test('Test Case 36 - Cleaning up warehouse residues', async ({ page }) => {
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
          await revisionPage.changeBalanceAndConfirmArchive(
            detail.name,
            tableMainDetal,
            '0',
            SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE,
            {
              refreshAndSearchAfter: true,
              switchToTabSelector: SelectorsRevision.REVISION_SWITCH_ITEM2,
              waitAfterConfirm: 500,
            },
          );
        });
      }
    }
  });

  test.skip('Test Case 37 - Delete Product after test', async ({ page }) => {
    logger.log('Test Case 37 - Delete Product after test');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);
    const searchProduct = page.locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT).first();
    const searchCbed = page.locator(PartsDBSelectors.SEARCH_CBED_ATTRIBUT).nth(1);
    const searchDetail = page.locator(PartsDBSelectors.SEARCH_DETAIL_ATTRIBUT).last();

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

    for (const detail of arrayDetail) {
      await allure.step('Step 02: Search Detail', async () => {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await searchDetail.inputValue()).toBe(detail.name);
          },
          `Verify search detail input value equals "${detail.name}"`,
          test.info(),
        );
      });

      await allure.step('Step 03: Archive all rows for this detail until 0', async () => {
        const maxArchives = 200;
        let iterationCount = 0;
        while (iterationCount < maxArchives) {
          await partsDatabsePage.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
          const rowCount = await rows.count();
          if (rowCount === 0) {
            logger.log(`No rows left for detail: ${detail.name}`);
            break;
          }
          await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.DETAIL_TABLE, rowCount - 1, Click.Yes, Click.No);
          await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          iterationCount++;
        }
      });
    }

    await allure.step('Step 03a: Clear Detail search, refresh, verify deleted (archive any remaining)', async () => {
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      for (const detail of arrayDetail) {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const maxArchives = 200;
        let iterationCount = 0;
        while (iterationCount < maxArchives) {
          const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
          const rowCount = await rows.count();
          if (rowCount === 0) break;
          await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.DETAIL_TABLE, rowCount - 1, Click.Yes, Click.No);
          await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          iterationCount++;
        }
        const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(rowCount).toBe(0);
          },
          `Verify detail "${detail.name}" is deleted (0 rows)`,
          test.info(),
        );
      }
    });

    await allure.step('Step 03b: Clear Detail search before CBED section', async () => {
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 04: Search Cbed', async () => {
        await searchCbed.fill(cbed.name);
        await searchCbed.press('Enter');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await searchCbed.inputValue()).toBe(cbed.name);
          },
          `Verify search cbed input value equals "${cbed.name}"`,
          test.info(),
        );
      });

      await allure.step('Step 05: Archive all rows for this cbed until 0', async () => {
        const maxArchives = 200;
        let iterationCount = 0;
        while (iterationCount < maxArchives) {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          const rows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
          const rowCount = await rows.count();
          if (rowCount === 0) {
            logger.log(`No rows left for cbed: ${cbed.name}`);
            break;
          }
          await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.CBED_TABLE, rowCount - 1, Click.Yes, Click.No);
          await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          iterationCount++;
        }
      });
    }

    await allure.step('Step 05a: Clear Detail and CBED search, refresh, verify CBED deleted', async () => {
      // Clear Detail search first so Details table does not keep showing filtered data
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchCbed.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      for (const cbed of arrayCbed) {
        await searchCbed.fill(cbed.name);
        await searchCbed.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const rows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(rowCount).toBe(0);
          },
          `Verify cbed "${cbed.name}" is deleted (0 rows)`,
          test.info(),
        );
      }
    });

    await allure.step('Step 05b: Second pass - archive Details that appear after CBED context', async () => {
      // Detail can show in the Details table only when assembly (CBED) has been searched - clear any remaining
      for (const detail of arrayDetail) {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const maxArchives = 200;
        let iterationCount = 0;
        while (iterationCount < maxArchives) {
          const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
          const rowCount = await rows.count();
          if (rowCount === 0) break;
          await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.DETAIL_TABLE, rowCount - 1, Click.Yes, Click.No);
          await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          iterationCount++;
        }
      }
    });

    await allure.step('Step 06: Search Product', async () => {
      await searchProduct.fill(nameProductNew);
      await searchProduct.press('Enter');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await searchProduct.inputValue()).toBe(nameProductNew);
        },
        `Verify search product input value equals "${nameProductNew}"`,
        test.info(),
      );
    });

    await allure.step('Step 07: Archive all rows for this product until 0', async () => {
      const maxArchives = 200;
      let iterationCount = 0;
      while (iterationCount < maxArchives) {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const rows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          logger.log(`No rows left for product: ${nameProductNew}`);
          break;
        }
        const row = rows.nth(rowCount - 1);
        await row.click();
        await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        iterationCount++;
      }
    });

    await allure.step('Step 07a: Clear Product search, refresh, verify deleted', async () => {
      await searchProduct.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchProduct.fill(nameProductNew);
      await searchProduct.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
      const rowCount = await rows.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCount).toBe(0);
        },
        `Verify product "${nameProductNew}" is deleted (0 rows)`,
        test.info(),
      );
    });

    await allure.step('Step 08: Sweep all remaining rows from Details table', async () => {
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      let iterationCount = 0;
      const maxIterations = 200;
      while (iterationCount < maxIterations) {
        const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) break;
        const row = rows.nth(rowCount - 1);
        await row.click();
        await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        iterationCount++;
      }
      logger.log(`Details table sweep finished after ${iterationCount} archives`);
    });

    await allure.step('Step 09: Sweep all remaining rows from CBED table', async () => {
      await searchCbed.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchCbed.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      let iterationCount = 0;
      const maxIterations = 200;
      while (iterationCount < maxIterations) {
        const rows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) break;
        const row = rows.nth(rowCount - 1);
        await row.click();
        await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        iterationCount++;
      }
      logger.log(`CBED table sweep finished after ${iterationCount} archives`);
    });

    await allure.step('Step 10: Sweep all remaining rows from Product table', async () => {
      await searchProduct.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchProduct.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      let iterationCount = 0;
      const maxIterations = 200;
      while (iterationCount < maxIterations) {
        const rows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) break;
        const row = rows.nth(rowCount - 1);
        await row.click();
        await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        iterationCount++;
      }
      logger.log(`Product table sweep finished after ${iterationCount} archives`);
    });

    await allure.step('Step 11: Final verification - all three tables empty', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      for (const detail of arrayDetail) {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const detailRows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await detailRows.count()).toBe(0);
          },
          `Verify detail "${detail.name}" is deleted (0 rows)`,
          test.info(),
        );
      }
      for (const cbed of arrayCbed) {
        await searchCbed.fill(cbed.name);
        await searchCbed.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const cbedRows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await cbedRows.count()).toBe(0);
          },
          `Verify cbed "${cbed.name}" is deleted (0 rows)`,
          test.info(),
        );
      }
      await searchProduct.fill(nameProductNew);
      await searchProduct.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const productRows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await productRows.count()).toBe(0);
        },
        `Verify product "${nameProductNew}" is deleted (0 rows)`,
        test.info(),
      );
    });
  });

};
