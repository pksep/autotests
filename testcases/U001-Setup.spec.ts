/**
 * @file U001-Setup.spec.ts
 * @purpose Test Suite 1: Setup & Creation (Test Cases 01-04)
 * 
 * This suite handles:
 * - Test Case 01: Delete Product before create
 * - Test Case 02: Create Parts
 * - Test Case 03: Create Cbed
 * - Test Case 04: Create Product
 */

import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateRevisionPage } from '../pages/RevisionPage';
import { ISpetificationData, Click, expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import { arrayDetail, arrayCbed, nameProductNew, choiceCbed, choiceDetail } from './U001-Constants';
import logger from '../lib/utils/logger';

export const runU001_01_Setup = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Setup & Creation (Test Cases 01-04)`);

  test('Test Case 01- Delete Product before create', async ({ page }) => {
    logger.log('Test Case 01 - Delete Product before create');
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
      // Clear all three input fields one by one and press Enter after clearing each
      // Don't look for results, just clear all three
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

    // Process Details table: search for "0Т4", delete all results, clear and refresh
    await allure.step('Step 02: Process Details table - search and delete all items starting with 0Т4', async () => {
      // Search for "0Т4" in Details table
      await searchDetail.fill('0Т4');
      await searchDetail.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Delete all matching rows
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

        // Process all rows from bottom to top
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

        // Check if there are still items
        const remainingRows = page.locator(`${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      // Clear the search and press Enter to reset
      await searchDetail.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 02b: Refresh the page after Details cleanup', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    // Process CBED table: search for "0Т4", delete all results, clear and refresh
    await allure.step('Step 03: Process CBED table - search and delete all items starting with 0Т4', async () => {
      // Search for "0Т4" in CBED table
      await searchCbed.fill('0Т4');
      await searchCbed.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Delete all matching rows
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

        // Process all rows from bottom to top
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1);
          const cellText = await nameCell.textContent();

          if (cellText?.trim().startsWith('0Т4')) {
            await row.click();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await partsDatabsePage.archiveAndConfirm(PartsDBSelectors.BUTTON_ARCHIVE, PartsDBSelectors.BUTTON_CONFIRM);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }

        // Check if there are still items
        const remainingRows = page.locator(`${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      // Clear the search and press Enter to reset
      await searchCbed.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03b: Refresh the page after CBED cleanup', async () => {
      await page.reload();
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    // Process Product table: search for "0Т4", delete all results, clear and refresh
    await allure.step('Step 04: Process Product table - search and delete all items starting with 0Т4', async () => {
      // Search for "0Т4" in Product table
      await searchProduct.fill('0Т4');
      await searchProduct.press('Enter');
      await partsDatabsePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Delete all matching rows
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

        // Process all rows from bottom to top
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

        // Check if there are still items
        const remainingRows = page.locator(`${PartsDBSelectors.PRODUCT_TABLE} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      // Clear the search and press Enter to reset
      await searchProduct.evaluate((el: HTMLInputElement) => (el.value = ''));
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });


    // Cleanup warehouse residues before creating new items
    await allure.step('Step 08: Cleanup warehouse residues', async () => {
      logger.log('Cleaning up warehouse residues before creating new items');
      const revisionPage = new CreateRevisionPage(page);
      const tableMain = SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE;
      const tableMainCbed = SelectorsRevision.TABLE_REVISION_PAGINATION_CBEDS_TABLE;
      const tableMainDetal = SelectorsRevision.TABLE_REVISION_PAGINATION_TABLE;

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
        
        // Check if there are any rows in the table
        const rows = page.locator(`${tableMain} tbody tr`);
        const rowCount = await rows.count();
        
        if (rowCount === 0) {
          logger.log(`No warehouse residues found for product: ${nameProductNew}. Skipping cleanup.`);
          return;
        }
        
        await revisionPage.waitingTableBodyNoThead(tableMain);
        await revisionPage.changeBalanceAndConfirmArchive(nameProductNew, tableMain, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
          refreshAndSearchAfter: true,
          waitAfterConfirm: 1000,
        });
      });

      // Cleanup CBEDs
      for (const cbed of arrayCbed) {
        await allure.step(`Step 08d: Cleanup CBED residues - ${cbed.name}`, async () => {
          await revisionPage.clickButton('Сборки', SelectorsRevision.REVISION_SWITCH_ITEM1);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.locator(tableMainCbed).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
          await revisionPage.searchTable(cbed.name, tableMainCbed, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          
          // Check if there are any rows in the table
          const rows = page.locator(`${tableMainCbed} tbody tr`);
          const rowCount = await rows.count();
          
          if (rowCount === 0) {
            logger.log(`No warehouse residues found for CBED: ${cbed.name}. Skipping cleanup.`);
            return;
          }
          
          await revisionPage.waitingTableBodyNoThead(tableMainCbed);
          await revisionPage.changeBalanceAndConfirmArchive(cbed.name, tableMainCbed, '0', SelectorsRevision.TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE, {
            refreshAndSearchAfter: true,
            waitAfterConfirm: 1000,
          });
        });
      }

      // Cleanup Details
      for (const detail of arrayDetail) {
        await allure.step(`Step 08e: Cleanup Detail residues - ${detail.name}`, async () => {
          await revisionPage.clickButton('Детали', SelectorsRevision.REVISION_SWITCH_ITEM2);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.locator(tableMainDetal).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
          await revisionPage.searchTable(detail.name, tableMainDetal, 'TableRevisionPagination-SearchInput-Dropdown-Input');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          
          // Check if there are any rows in the table
          const rows = page.locator(`${tableMainDetal} tbody tr`);
          const rowCount = await rows.count();
          
          if (rowCount === 0) {
            logger.log(`No warehouse residues found for Detail: ${detail.name}. Skipping cleanup.`);
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

  test('Test Case 02 - Create Parts', async ({ page }) => {
    logger.log('Test Case 02 - Create Parts');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitForNetworkIdle();
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 02: Click on the Create button', async () => {
        // Wait for network idle and ensure page is ready
        await partsDatabsePage.waitForNetworkIdle(WAIT_TIMEOUTS.STANDARD);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        
        // Check if the Create button exists on the current page
        let createButton = page.locator(PartsDBSelectors.BUTTON_CREATE_NEW_PART).filter({ hasText: 'Создать' });
        const createButtonCount = await createButton.count();
        
        if (createButtonCount === 0) {
          // Button not found - might need to navigate back to parts database page
          logger.log('⚠️ Create button not found, navigating back to parts database page');
          await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
          await partsDatabsePage.waitForNetworkIdle(WAIT_TIMEOUTS.STANDARD);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          
          // Re-check the button after navigation
          createButton = page.locator(PartsDBSelectors.BUTTON_CREATE_NEW_PART).filter({ hasText: 'Создать' });
        }
        
        // Wait for the button to be visible with a longer timeout
        await createButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
        await createButton.scrollIntoViewIfNeeded();
        
        await partsDatabsePage.clickButton('Создать', PartsDBSelectors.BUTTON_CREATE_NEW_PART);
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton('Деталь', PartsDBSelectors.BUTTON_DETAIL);
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const addDetalContainer = page.locator(PartsDBSelectors.ADD_DETAIL_PAGE);
        await addDetalContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        const nameParts = addDetalContainer.locator(PartsDBSelectors.INPUT_DETAIL_NAME).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await nameParts.click();
        await nameParts.fill(detail.name);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await nameParts.inputValue()).toBe(detail.name);
          },
          `Verify detail name input value equals "${detail.name}"`,
          test.info(),
        );
      });

      await allure.step('Step 05: Enter the designation of the part', async () => {
        const addDetalContainer = page.locator(PartsDBSelectors.ADD_DETAIL_PAGE);
        const nameParts = addDetalContainer.locator(PartsDBSelectors.INPUT_DETAIL_DESIGNATION).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await nameParts.click();
        await nameParts.fill(detail.designation);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await nameParts.inputValue()).toBe(detail.designation);
          },
          `Verify detail designation input value equals "${detail.designation}"`,
          test.info(),
        );
      });

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton('Сохранить', PartsDBSelectors.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      });

      await allure.step('Step 07: Click on the Process', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await partsDatabsePage.clickButton('Технологический процесс', PartsDBSelectors.BUTTON_OPERATION);
      });

      await allure.step('Step 08: Click on the Add Operation', async () => {
        await page.waitForSelector(PartsDBSelectors.MODAL_CONTENT);
        await partsDatabsePage.clickButton('Добавить операцию', PartsDBSelectors.BUTTON_ADD_OPERATION);
      });

      await allure.step('Step 09: Click on the type of operation', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.locator(PartsDBSelectors.BASE_FILTER_TITLE).click();
      });

      await allure.step('Step 10: Search in dropdown menu', async () => {
        const searchTypeOperation = page.locator(PartsDBSelectors.BASE_FILTER_SEARCH_INPUT);
        const typeOperation = 'Сварочная';

        await searchTypeOperation.fill(typeOperation);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await searchTypeOperation.inputValue()).toBe(typeOperation);
          },
          `Verify search type operation input value equals "${typeOperation}"`,
          test.info(),
        );
      });

      await allure.step('Step 11: Choice type operation', async () => {
        await page.locator(PartsDBSelectors.BASE_FILTER_OPTION_FIRST).click();
      });

      await allure.step('Step 12: Click on the Save button', async () => {
        await page
          .locator(PartsDBSelectors.BUTTON_ADD_OPERATION_SAVE, {
            hasText: 'Сохранить',
          })
          .last()
          .click();
        await partsDatabsePage.waitForNetworkIdle();
      });

      await allure.step('Step 13: Click on the Save button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page
          .locator(PartsDBSelectors.BUTTON_SAVE_OPERATION, {
            hasText: 'Сохранить',
          })
          .click();
      });

      await allure.step('Step 14: Click on the Create by copyinp', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.waitForNetworkIdle(WAIT_TIMEOUTS.STANDARD);
        
        const cancelButton = page.locator(PartsDBSelectors.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL).filter({ hasText: 'Отменить' });
        
        // Check if the cancel button exists and is visible
        const cancelButtonCount = await cancelButton.count();
        if (cancelButtonCount === 0) {
          logger.log('⚠️ Cancel button not found - page may have navigated after save. Skipping Step 14.');
          return;
        }

        // Wait for the button to be visible with a longer timeout
        await cancelButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
        await cancelButton.scrollIntoViewIfNeeded();
        await partsDatabsePage.clickButton('Отменить', PartsDBSelectors.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL);
      });
    }
  });

  test('Test Case 03 - Create Cbed', async ({ page }) => {
    logger.log('Test Case 03 - Create Cbed');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Wait for loading
      await partsDatabsePage.waitingTableBody(PartsDBSelectors.CBED_TABLE_WRAPPER);
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await partsDatabsePage.clickButton('Создать', PartsDBSelectors.BUTTON_CREATE_NEW_PART);
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton('Сборочную единицу', PartsDBSelectors.BUTTON_CBED);
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const creator = page.locator(PartsDBSelectors.EDIT_PAGE_MAIN_ID);
        await creator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        const nameParts = creator.locator(PartsDBSelectors.INPUT_NAME_IZD).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await nameParts.click();
        await nameParts.fill(cbed.name);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await nameParts.inputValue()).toBe(cbed.name);
          },
          `Verify cbed name input value equals "${cbed.name}"`,
          test.info(),
        );
      });

      await allure.step('Step 05: Enter the designation of the part', async () => {
        const nameParts = page.locator(PartsDBSelectors.INPUT_DESUGNTATION_IZD);

        await nameParts.fill(cbed.designation);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await nameParts.inputValue()).toBe(cbed.designation);
          },
          `Verify cbed designation input value equals "${cbed.designation}"`,
          test.info(),
        );
      });

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton('Сохранить', PartsDBSelectors.BUTTON_SAVE_CBED);
        await page.waitForTimeout(TIMEOUTS.LONG);
      });

      await allure.step('Step 07: Click on the Create by copyinp', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await partsDatabsePage.clickButton('Отменить', PartsDBSelectors.BUTTON_CANCEL_CBED);
      });
    }
  });

  test('Test Case 04 - Create Product', async ({ page }) => {
    logger.log('Test Case 04 - Create Product');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

      // Wait for loading
      await partsDatabsePage.waitingTableBody(PartsDBSelectors.PRODUCT_TABLE);
    });

    await allure.step('Step 02: Click on the Create button', async () => {
      await partsDatabsePage.waitForNetworkIdle();
      await partsDatabsePage.clickButton('Создать', PartsDBSelectors.BUTTON_CREATE_NEW_PART);
    });

    await allure.step('Step 03: Click on the Detail button', async () => {
      await partsDatabsePage.clickButton('Изделие', PartsDBSelectors.BUTTON_PRODUCT);
    });

    await allure.step('Step 04: Enter the name of the part', async () => {
      await partsDatabsePage.waitForNetworkIdle();
      const nameParts = page.locator(PartsDBSelectors.INPUT_NAME_IZD).first();
      await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await nameParts.fill(nameProductNew);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(nameParts).toHaveValue(nameProductNew);
        },
        `Verify product name input value equals "${nameProductNew}"`,
        test.info(),
      );
    });

    await allure.step('Step 05: Click the Add button', async () => {
      await partsDatabsePage.clickButton('Добавить', PartsDBSelectors.BUTTON_ADD_SPECIFICATION);
    });

    await allure.step('Step 06: Click on the cbed button', async () => {
      await partsDatabsePage.clickButton('Сборочную единицу', choiceCbed);
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 07: Search cbed', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.locator(PartsDBSelectors.SPECIFICATION_MODAL_BASE_CBED_SECTION_PATTERN).isVisible();
        const modalWindowSearchCbed = page.locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT).last();
        await modalWindowSearchCbed.scrollIntoViewIfNeeded();

        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.fillInputWithRetries(modalWindowSearchCbed, cbed.name);
        await modalWindowSearchCbed.press('Enter');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modalWindowSearchCbed.inputValue()).toBe(cbed.name);
          },
          `Verify modal window search cbed input value equals "${cbed.name}"`,
          test.info(),
        );
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      });

      await allure.step('Step 08: Check name in first row', async () => {
        await partsDatabsePage.waitAndCheckFirstRow(page, cbed.name, PartsDBSelectors.CBED_TABLE, { timeoutMs: 500 });
      });
      await allure.step('Step 09: Choice first row', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.CBED_TABLE, 1, Click.Yes, Click.No);
      });

      await allure.step('Step 10: Click on the Add button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.locator(PartsDBSelectors.BUTTON_SPECIFICATION_CBED_SELECT).click();
      });
    }

    await allure.step('Step 11: Click on the Add button', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.locator(PartsDBSelectors.BUTTON_SPECIFICATION_CBED_ADD).click();
    });

    await allure.step('Step 12: Click the Add button', async () => {
      await partsDatabsePage.clickButton('Добавить', PartsDBSelectors.BUTTON_ADD_SPECIFICATION);
    });

    await allure.step('Step 13: Click on the Detail button', async () => {
      await partsDatabsePage.waitForNetworkIdle();
      await page.locator(choiceDetail, { hasText: 'Деталь' }).first().click();
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 13: Search cbed', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.locator(PartsDBSelectors.SPECIFICATION_MODAL_BASE_DETAL_MODAL_CONTENT_PATTERN).isVisible();
        const modalWindowSearchCbed = page.locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT).last();
        await modalWindowSearchCbed.scrollIntoViewIfNeeded();

        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.fillInputWithRetries(modalWindowSearchCbed, detail.name);
        await modalWindowSearchCbed.press('Enter');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modalWindowSearchCbed.inputValue()).toBe(detail.name);
          },
          `Verify modal window search cbed input value equals "${detail.name}"`,
          test.info(),
        );
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      });

      await allure.step('Step 14: Check name in first row', async () => {
        await partsDatabsePage.waitAndCheckFirstRow(page, detail.name, PartsDBSelectors.DETAIL_TABLE, {
          timeoutMs: 1500,
        });
      });

      await allure.step('Step 15: Choice first row', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.getValueOrClickFromFirstRow(PartsDBSelectors.DETAIL_TABLE, 1, Click.Yes, Click.No);
      });

      await allure.step('Step 16: Click on the Add button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.locator(PartsDBSelectors.BUTTON_SPECIFICATION_DETAL_SELECT).click();
      });
    }

    await allure.step('Step 17: Click on the Add button', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page
        .locator(PartsDBSelectors.BUTTON_SPECIFICATION_DETAL_ADD, {
          hasText: 'Добавить',
        })
        .click();
    });

    await allure.step('Step 18: Click on the Save button', async () => {
      await partsDatabsePage.clickButton('Сохранить', PartsDBSelectors.BUTTON_SAVE_CBED);
    });
  });
};
