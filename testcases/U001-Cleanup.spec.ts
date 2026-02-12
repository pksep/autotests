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
  console.log(`Start of the test: U001 Cleanup Operations (Test Cases 36-37)`);

  test('Test Case 36 - Cleaning up warehouse residues', async ({ page }) => {
    console.log('Test Case 36 - Cleaning up warehouse residues');
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
    console.log(`Cleaning up ${cbedArrayToClean.length} CBEDs (from ${descendantsCbedArray.length > 0 ? 'descendantsCbedArray' : 'arrayCbed'})`);
    
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
          await revisionPage.changeBalanceAndConfirmArchive(cbed.name, tableMainCbed, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            waitAfterConfirm: 500,
          });
        });
      }
    }

    // Cleanup Details: Use descendantsDetailArray if available, otherwise use arrayDetail
    const detailArrayToClean = descendantsDetailArray.length > 0 ? descendantsDetailArray : arrayDetail;
    console.log(`Cleaning up ${detailArrayToClean.length} Details (from ${descendantsDetailArray.length > 0 ? 'descendantsDetailArray' : 'arrayDetail'})`);
    
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
          await revisionPage.changeBalanceAndConfirmArchive(
            detail.name,
            tableMainDetal,
            '0',
            SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE,
            {
              waitAfterConfirm: 3000,
            },
          );
        });
      }
    }
  });

  test('Test Case 37 - Delete Product after test', async ({ page }) => {
    console.log('Test Case 37 - Delete Product after test');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);
    const searchProduct = page.locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT).first();
    const searchCbed = page.locator(PartsDBSelectors.SEARCH_CBED_ATTRIBUT).nth(1);
    const searchDetail = page.locator(PartsDBSelectors.SEARCH_DETAIL_ATTRIBUT).last();

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitForNetworkIdle();
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

      await allure.step('Step 03: Check table rows and process if found', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const rows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount === 0) {
          console.log(`No rows found for detail: ${detail.name}`);
          return;
        }

        // Process all rows that match the criteria from bottom to top
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1); // Assuming name is in the third column
          const cellText = await nameCell.textContent();

          if (cellText?.trim() === detail.name) {
            await allure.step(`Processing row ${i + 1} for detail: ${detail.name}`, async () => {
              await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.DETAIL_TABLE, i, Click.Yes, Click.No);

              await allure.step('Archive and confirm', async () => {
                await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
              });
            });
          }
        }
      });
    }

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

      await allure.step('Step 05: Check table rows and process if found', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const rows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount === 0) {
          console.log(`No rows found for cbed: ${cbed.name}`);
          return;
        }

        // Process all rows that match the criteria from bottom to top
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1); // Assuming name is in the third column
          const cellText = await nameCell.textContent();

          if (cellText?.trim() === cbed.name) {
            await allure.step(`Processing row ${i + 1} for cbed: ${cbed.name}`, async () => {
              await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.CBED_TABLE, i, Click.Yes, Click.No);

              await allure.step('Archive and confirm', async () => {
                await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
              });
            });
          }
        }
      });
    }

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

    await allure.step('Step 07: Check table rows and process if found', async () => {
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const rows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
      const rowCount = await rows.count();

      if (rowCount === 0) {
        console.log(`No rows found for product: ${nameProductNew}`);
        return;
      }

      // Process all rows that match the criteria from bottom to top
      for (let i = rowCount - 1; i >= 0; i--) {
        const row = rows.nth(i);
        const nameCell = row.locator('td').nth(2); // Assuming name is in the third column
        const cellText = await nameCell.textContent();

        if (cellText?.trim() === nameProductNew) {
          await allure.step(`Processing row ${i + 1} for product: ${nameProductNew}`, async () => {
            // Click on the row to select it
            await row.click();

            await allure.step('Archive and confirm', async () => {
              await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
            });
          });
        }
      }
    });
  });

};
