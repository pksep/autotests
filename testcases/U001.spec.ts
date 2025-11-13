import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as ProductionPathSelectors from '../lib/Constants/SelectorsProductionPath';
import * as MarkOfCompletionSelectors from '../lib/Constants/SelectorsMarkOfCompletion';
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsRemainingProducts from '../lib/Constants/SelectorsRemainingProducts';
import * as SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction from '../lib/Constants/SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction';
import * as SelectorsCompleteSets from '../lib/Constants/SelectorsCompleteSets';
import * as SelectorsWarehouseTaskForShipment from '../lib/Constants/SelectorsWarehouseTaskForShipment';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';

let incomingQuantity = '1';
let remainingStockBefore: string;
let remainingStockAfter: string;
let quantityProductLaunchOnProduction = '2';
let quantityProductLaunchOnProductionBefore: string;
let quantityProductLaunchOnProductionAfter;
let quantitySumLaunchOnProduction: Number;
let urgencyDateOnTable;
let orderNumber: { orderNumber: string; orderDate: string }; // variable declared in test case 2
const urgencyDate = '23.01.2025';
const urgencyDateNewFormat = 'Янв 23, 2025';
const urgencyDateSecond = '21.01.2025';
const urgencyDateSecondNewFormat = 'Янв 21, 2025';
const nameProduct = '0Т4.01';
const designationProduct = '0Т4.01';
const designation = '0Т4';
const nameBuyer = 'М10';

//const descendantsCbedArray: ISpetificationData[] = [];

const descendantsDetailArray: ISpetificationData[] = [];

// Mock data
// const descendantsDetailArray = [
//   {
//     name: '0Т4.21',
//     designation: '-',
//     quantity: 1,
//   },
//   {
//     name: '0Т4.22',
//     designation: '-',
//     quantity: 1,
//   },
// ];

const descendantsCbedArray: ISpetificationData[] = [
  {
    name: '0Т4.11',
    designation: '-',
    quantity: 1,
  },
  {
    name: '0Т4.12',
    designation: '-',
    quantity: 1,
  },
];

import { test, expect } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreatShortageAssembliesPage } from '../pages/ShortageAssembliesPage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import {
  CreateStockReceiptFromSupplierAndProductionPage,
  StockReceipt,
} from '../pages/StockReceiptFromSupplierAndProductionPage';
import { CreateCompletingProductsToPlanPage } from '../pages/CompletingProductsToPlanPage';
import { CreateWarehouseTaskForShipmentPage } from '../pages/WarehouseTaskForShipmentPage';
import { CreateStockPage, TableSelection } from '../pages/StockPage';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { CreateShortageProductPage } from '../pages/ShortageProductPage';
import { CreateCompleteSetsPage } from '../pages/CompleteSetsPage';
import { CreateShippedOrderOverviewPage } from '../pages/ShippedOrderOverviewPage';
import { CreateRevisionPage } from '../pages/RevisionPage';
import { ISpetificationData, Click, TypeInvoice } from '../lib/Page';
import { ENV, SELECTORS, CONST } from '../config';
import logger from '../lib/logger';
import { cli } from 'winston/lib/winston/config';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U001-PC1.json';
import testData2 from '../testdata/U002-PC1.json';
import { ALL } from 'dns';

const arrayDetail = [
  {
    name: '0Т4.21',
    designation: '-',
  },
  {
    name: '0Т4.22',
    designation: '-',
  },
];
const arrayCbed = [
  {
    name: '0Т4.11',
    designation: '-',
  },
  {
    name: '0Т4.12',
    designation: '-',
  },
];
const nameProductNew = '0Т4.01';

const buttonLaunchIntoProductionModalWindow =
  '[data-testid="ModalStartProduction-ComplectationTable-InProduction"]';
const choiceCbed =
  '[data-testid="Specification-Dialog-CardbaseOfAssemblyUnits0"]';
const choiceDetail = '[data-testid="Specification-Dialog-CardbaseDetail1"]';

// DeficitIzd - using constants from SelectorsShortagePages
const deficitTable = SelectorsShortagePages.TABLE_DEFICIT_IZD;
const tableMain = SelectorsShortagePages.TABLE_DEFICIT_IZD_ID;
const columnCheckbox = 'DeficitIzdTable-HeadRow-TotalCheckbox';
const columnDateUrgency = 'DeficitIzdTable-HeadRow-DateUrgency';
const columnOrderFromProduction = 'DeficitIzdTable-HeadRow-OrderFromProduction';
const buttonLaunchIntoProduction =
  SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION;
const modalWindowLaunchIntoProduction =
  SelectorsShortagePages.MODAL_START_PRODUCTION;

// DeficitCbed - using constants from SelectorsShortagePages
const deficitTableCbed = SelectorsShortagePages.TABLE_DEFICIT_CBED;
const tableMainCbed = SelectorsShortagePages.TABLE_DEFICIT_CBED_ID;
const columnDateUrgencyCbed = 'DeficitCbed-TableHeader-ViewsDeficitsDuedate';
const columnOrderFromProductionCbed =
  'DeficitCbed-TableHeader-ViewsDeficitsOrderedforproduction';
const columnCheckboxCbed = 'DeficitCbed-TableHeader-SelectAll';
const buttonLaunchIntoProductionCbed =
  SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION_CBED;
const modalWindowLaunchIntoProductionCbed =
  SelectorsShortagePages.MODAL_START_PRODUCTION_CBED;

// DeficitDetail - using constants from SelectorsShortagePages
const deficitTableDetail = `table${SelectorsShortagePages.TABLE_DEFICIT_IZD}`;
const tableMainDetail = SelectorsShortagePages.TABLE_DEFICIT_IZD_ID;
const columnDateUrgencyDetail = 'DeficitIzdTable-HeadRow-DateUrgency';
const columnOrderFromProductionDetail =
  'DeficitIzdTable-HeadRow-OrderFromProduction';
const columnCheckBoxDetail = 'DeficitIzdTable-HeadRow-TotalCheckbox';
const buttonLaunchIntoProductionDetail = `button${SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION}`;
const modalWindowLaunchIntoProductionDetail =
  SelectorsShortagePages.MODAL_START_PRODUCTION;

// Uploading - using constants from SelectorsShipmentTasks
const tableMainUploading = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE;
const tableMainUploadingID = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE_ID;
const buttonUploading = SelectorsShipmentTasks.BUTTON_SHIP;

export const runU001 = (isSingleTest: boolean, iterations: number) => {
  console.log(
    `Start of the test: checking the functionality of the "Shipment Tasks" page`
  );

  test.skip('Спецификация', async ({ page }) => {
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 02: Click on the Create order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton(
        'Создать заказ',
        LoadingTasksSelectors.buttonCreateOrder
      );
    });

    await allure.step('Step 03: Click on the Select button', async () => {
      // Click on the button
      await page
        .locator(LoadingTasksSelectors.buttonChoiceIzd, {
          hasText: 'Выбрать',
        })
        .nth(0)
        .click();

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 04: Search product on modal window', async () => {
      //
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expect(modalWindow).toBeVisible();

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameProduct);

      expect(await searchTable.inputValue()).toBe(nameProduct);
      await searchTable.press('Enter');

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 05: Choice product in modal window', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0);

      await loadingTaskPage.waitForTimeout(1000);
    });

    await allure.step(
      'Step 06: Click on the Select button on modal window',
      async () => {
        // Click on the button
        await loadingTaskPage.clickButton(
          'Добавить',
          LoadingTasksSelectors.buttonChoiceIzd
        );
      }
    );

    await allure.step('Step 07: Checking the selected product', async () => {
      // Check that the selected product displays the expected product
      await loadingTaskPage.checkProduct(nameProduct);
      await loadingTaskPage.waitForTimeout(500);
    });

    await allure.step(
      'Step 08: We save descendants from the specification into an array',
      async () => {
        // Clear array first to avoid duplicates
        descendantsCbedArray.length = 0;
        descendantsDetailArray.length = 0;
        // Save Assembly units and Parts from the Specification to an array
        await loadingTaskPage.preservingDescendants(
          descendantsCbedArray,
          descendantsDetailArray
        );
      }
    );
  });

  test('Test Case 01- Delete Product before create', async ({ page }) => {
    console.log('Test Case 01 - Delete Product before create');
    test.setTimeout(90000);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    const searchProduct = page
      .locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT)
      .first();
    const searchCbed = page
      .locator(PartsDBSelectors.SEARCH_CBED_ATTRIBUT)
      .nth(1);
    const searchDetail = page
      .locator(PartsDBSelectors.SEARCH_DETAIL_ATTRIBUT)
      .last();

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 02: Search Detail', async () => {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        expect(await searchDetail.inputValue()).toBe(detail.name);
      });

      await allure.step(
        'Step 03: Check table rows and process if found',
        async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          const rows = page.locator(
            `${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`
          );
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
              await allure.step(
                `Processing row ${i + 1} for detail: ${detail.name}`,
                async () => {
                  // Click on the row to select it
                  await row.click();

                  await allure.step('Click on the Archive button', async () => {
                    await partsDatabsePage.clickButton(
                      'Архив',
                      PartsDBSelectors.BUTTON_ARCHIVE
                    );
                  });

                  await allure.step(
                    'Confirmation of transfer to archive',
                    async () => {
                      const confirmButton = page.locator(
                        PartsDBSelectors.BUTTON_CONFIRM,
                        { hasText: 'Да' }
                      );
                      await confirmButton.click();
                      await page.waitForTimeout(1000); // Wait for the row to be removed
                    }
                  );
                }
              );
            }
          }
        }
      );
    }

    for (const cbed of arrayCbed) {
      await allure.step('Step 04: Search Cbed', async () => {
        await searchCbed.fill(cbed.name);
        await searchCbed.press('Enter');
        expect(await searchCbed.inputValue()).toBe(cbed.name);
      });

      await allure.step(
        'Step 05: Check table rows and process if found',
        async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);

          const rows = page.locator(
            `${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`
          );

          const rowCount = await rows.count();
          console.log(`XXXXXXXXrows found for cbed: ${cbed.name}:${rowCount}`);
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
              await allure.step(
                `Processing row ${i + 1} for cbed: ${cbed.name}`,
                async () => {
                  // Click on the row to select it
                  await row.click();

                  await allure.step('Click on the Archive button', async () => {
                    await partsDatabsePage.clickButton(
                      'Архив',
                      PartsDBSelectors.BUTTON_ARCHIVE
                    );
                  });

                  await allure.step(
                    'Confirmation of transfer to archive',
                    async () => {
                      const confirmButton = page.locator(
                        PartsDBSelectors.BUTTON_CONFIRM,
                        { hasText: 'Да' }
                      );
                      await confirmButton.click();
                      await page.waitForTimeout(1000); // Wait for the row to be removed
                    }
                  );
                }
              );
            }
          }
        }
      );
    }

    await allure.step('Step 06: Search Product', async () => {
      await searchProduct.fill(nameProductNew);
      await searchProduct.press('Enter');
      expect(await searchProduct.inputValue()).toBe(nameProductNew);
    });

    await allure.step(
      'Step 07: Check table rows and process if found',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

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
            await allure.step(
              `Processing row ${i + 1} for product: ${nameProductNew}`,
              async () => {
                // Click on the row to select it
                await row.click();

                await allure.step('Click on the Archive button', async () => {
                  await partsDatabsePage.clickButton(
                    'Архив',
                    PartsDBSelectors.BUTTON_ARCHIVE
                  );
                });

                await allure.step(
                  'Confirmation of transfer to archive',
                  async () => {
                    const confirmButton = page.locator(
                      PartsDBSelectors.BUTTON_CONFIRM,
                      { hasText: 'Да' }
                    );
                    await confirmButton.click();
                    await page.waitForTimeout(1000); // Wait for the row to be removed
                  }
                );
              }
            );
          }
        }
      }
    );
  });

  test('Test Case 02 - Create Parts', async ({ page }) => {
    console.log('Test Case 02 - Create Parts');
    test.setTimeout(90000);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await partsDatabsePage.clickButton(
          'Создать',
          PartsDBSelectors.BUTTON_CREATE_NEW_PART
        );
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton(
          'Деталь',
          PartsDBSelectors.BUTTON_DETAIL
        );
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        const nameParts = page.locator(PartsDBSelectors.INPUT_DETAIL_NAME);

        await page.waitForTimeout(500);
        await nameParts.fill(detail.name);
        await expect(await nameParts.inputValue()).toBe(detail.name);
      });

      await allure.step(
        'Step 05: Enter the designation of the part',
        async () => {
          const nameParts = page.locator(
            PartsDBSelectors.INPUT_DETAIL_DESIGNATION
          );

          await nameParts.fill(detail.designation);
          expect(await nameParts.inputValue()).toBe(detail.designation);
        }
      );

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton(
          'Сохранить',
          PartsDBSelectors.BUTTON_SAVE
        );
      });

      await allure.step('Step 07: Click on the Process', async () => {
        await page.waitForLoadState('networkidle');
        await partsDatabsePage.clickButton(
          'Технологический процесс',
          PartsDBSelectors.BUTTON_OPERATION
        );
      });

      await allure.step('Step 08: Click on the Add Operation', async () => {
        await page.waitForSelector(PartsDBSelectors.MODAL_CONTENT);
        await partsDatabsePage.clickButton(
          'Добавить операцию',
          PartsDBSelectors.BUTTON_ADD_OPERATION
        );
      });

      await allure.step('Step 09: Click on the type of operation', async () => {
        await page.waitForLoadState('networkidle');
        await page.locator(PartsDBSelectors.BASE_FILTER_TITLE).click();
      });

      await allure.step('Step 10: Search in dropdown menu', async () => {
        const searchTypeOperation = page.locator(
          PartsDBSelectors.BASE_FILTER_SEARCH_INPUT
        );
        const typeOperation = 'Сварочная';

        await searchTypeOperation.fill(typeOperation);
        expect(await searchTypeOperation.inputValue()).toBe(typeOperation);
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
        await page.waitForLoadState('networkidle');
      });

      await allure.step('Step 13: Click on the Save button', async () => {
        await page.waitForTimeout(500);
        await page
          .locator(PartsDBSelectors.BUTTON_SAVE_OPERATION, {
            hasText: 'Сохранить',
          })
          .click();
      });

      await allure.step('Step 14: Click on the Create by copyinp', async () => {
        await page.waitForTimeout(500);
        await partsDatabsePage.clickButton(
          'Отменить',
          PartsDBSelectors.BUTTON_CANCEL
        );
      });
    }
  });

  test('Test Case 03 - Create Cbed', async ({ page }) => {
    console.log('Test Case 03 - Create Cbed');
    test.setTimeout(90000);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForTimeout(1000);
      // Wait for loading
      await partsDatabsePage.waitingTableBody(
        PartsDBSelectors.CBED_TABLE_WRAPPER
      );
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await partsDatabsePage.clickButton(
          'Создать',
          PartsDBSelectors.BUTTON_CREATE_NEW_PART
        );
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton(
          'Сборочную единицу',
          PartsDBSelectors.BUTTON_CBED
        );
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        const nameParts = page.locator(PartsDBSelectors.INPUT_NAME_IZD);

        await nameParts.fill(cbed.name);
        await page.waitForTimeout(500);
        expect(await nameParts.inputValue()).toBe(cbed.name);
      });

      await allure.step(
        'Step 05: Enter the designation of the part',
        async () => {
          const nameParts = page.locator(
            PartsDBSelectors.INPUT_DESUGNTATION_IZD
          );

          await nameParts.fill(cbed.designation);
          expect(await nameParts.inputValue()).toBe(cbed.designation);
        }
      );

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton(
          'Сохранить',
          PartsDBSelectors.BUTTON_SAVE_CBED
        );
        await page.waitForTimeout(2000);
      });

      await allure.step('Step 07: Click on the Create by copyinp', async () => {
        await page.waitForLoadState('networkidle');
        await partsDatabsePage.clickButton(
          'Отменить',
          PartsDBSelectors.BUTTON_CANCEL_CBED
        );
      });
    }
  });

  test('Test Case 04 - Create Product', async ({ page }) => {
    console.log('Test Case 04 - Create Product');
    test.setTimeout(90000);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      // Go to the Shipping tasks page
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);

      // Wait for loading
      await partsDatabsePage.waitingTableBody(PartsDBSelectors.PRODUCT_TABLE);
    });

    await allure.step('Step 02: Click on the Create button', async () => {
      await page.waitForLoadState('networkidle');
      await partsDatabsePage.clickButton(
        'Создать',
        PartsDBSelectors.BUTTON_CREATE_NEW_PART
      );
    });

    await allure.step('Step 03: Click on the Detail button', async () => {
      await partsDatabsePage.clickButton(
        'Изделие',
        PartsDBSelectors.BUTTON_PRODUCT
      );
    });

    await allure.step('Step 04: Enter the name of the part', async () => {
      await page.waitForLoadState('networkidle');
      const nameParts = page.locator(PartsDBSelectors.INPUT_NAME_IZD);

      await page.waitForTimeout(500);
      await nameParts.fill(nameProductNew);
      expect(await nameParts.inputValue()).toBe(nameProductNew);
    });

    await allure.step('Step 05: Click the Add button', async () => {
      await partsDatabsePage.clickButton(
        'Добавить',
        PartsDBSelectors.BUTTON_ADD_SPECIFICATION
      );
    });

    await allure.step('Step 06: Click on the cbed button', async () => {
      await partsDatabsePage.clickButton('Сборочную единицу', choiceCbed);
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 07: Search cbed', async () => {
        await page.waitForLoadState('networkidle');
        await page
          .locator(
            '[data-testid^="Spectification-ModalBaseCbed"][data-testid$="Section"]'
          )
          .isVisible();
        const modalWindowSearchCbed = page
          .locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT)
          .last();

        await page.waitForTimeout(500);
        await modalWindowSearchCbed.fill(cbed.name);
        await modalWindowSearchCbed.press('Enter');
        await page.waitForTimeout(500);
        expect(await modalWindowSearchCbed.inputValue()).toBe(cbed.name);
      });

      await allure.step('Step 08: Check name in first row', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await partsDatabsePage.checkNameInLineFromFirstRow(
          cbed.name,
          PartsDBSelectors.CBED_TABLE
        );
      });
      await allure.step('Step 09: Choice first row', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await partsDatabsePage.getValueOrClickFromFirstRow(
          PartsDBSelectors.CBED_TABLE,
          1,
          Click.Yes,
          Click.No
        );
      });

      await allure.step('Step 10: Click on the Add button', async () => {
        await page.waitForTimeout(500);
        await page
          .locator(PartsDBSelectors.BUTTON_SPECIFICATION_CBED_SELECT)
          .click();
      });
    }

    await allure.step('Step 11: Click on the Add button', async () => {
      await page.waitForTimeout(500);
      await page
        .locator(PartsDBSelectors.BUTTON_SPECIFICATION_CBED_ADD)
        .click();
    });

    await allure.step('Step 12: Click the Add button', async () => {
      await partsDatabsePage.clickButton(
        'Добавить',
        PartsDBSelectors.BUTTON_ADD_SPECIFICATION
      );
    });

    await allure.step('Step 13: Click on the Detail button', async () => {
      await page.waitForLoadState('networkidle');
      await page.locator(choiceDetail, { hasText: 'Деталь' }).first().click();
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 13: Search cbed', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await page
          .locator(
            '[data-testid^="Spectification-ModalBaseDetal"][data-testid$="ModalContent"]'
          )
          .isVisible();
        const modalWindowSearchCbed = page
          .locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT)
          .last();

        await page.waitForTimeout(500);
        await modalWindowSearchCbed.fill(detail.name);
        await modalWindowSearchCbed.press('Enter');
        expect(await modalWindowSearchCbed.inputValue()).toBe(detail.name);
      });

      await allure.step('Step 14: Check name in first row', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await partsDatabsePage.checkNameInLineFromFirstRow(
          detail.name,
          PartsDBSelectors.DETAIL_TABLE
        );
      });

      await allure.step('Step 15: Choice first row', async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await partsDatabsePage.getValueOrClickFromFirstRow(
          PartsDBSelectors.DETAIL_TABLE,
          1,
          Click.Yes,
          Click.No
        );
      });

      await allure.step('Step 16: Click on the Add button', async () => {
        await page.waitForTimeout(500);
        await page
          .locator(PartsDBSelectors.BUTTON_SPECIFICATION_DETAL_SELECT)
          .click();
      });
    }

    await allure.step('Step 17: Click on the Add button', async () => {
      await page.waitForTimeout(500);
      await page
        .locator(PartsDBSelectors.BUTTON_SPECIFICATION_DETAL_ADD, {
          hasText: 'Добавить',
        })
        .click();
    });

    await allure.step('Step 18: Click on the Save button', async () => {
      await partsDatabsePage.clickButton(
        'Сохранить',
        PartsDBSelectors.BUTTON_SAVE_CBED
      );
    });
  });

  test('Test Case 05 - Deleting customer orders', async ({ page }) => {
    console.log('Test Case 05 - Deleting customer orders');
    test.setTimeout(90000);
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const loadingTaskTable = '.shipments-content';

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 04: Search product', async () => {
      const searchTable = page.locator('.search-yui-kit__input').nth(1);
      await searchTable.fill(nameProductNew);

      expect(await searchTable.inputValue()).toBe(nameProductNew);
      await searchTable.press('Enter');

      await page.waitForTimeout(3000);
    });

    // Цикл: пока в первой строке таблицы есть нужный продукт, архивируем
    while (true) {
      // Получаем первую строку таблицы
      const firstRow = await page
        .locator(`${LoadingTasksSelectors.loadingMainTable} tbody tr`)
        .first();
      const rowCount = await page
        .locator(`${LoadingTasksSelectors.loadingMainTable} tbody tr`)
        .count();
      if (rowCount === 0) {
        console.log(
          `No orders found for product "${nameProductNew}". Exiting...`
        );
        break;
      }

      // Получаем имя продукта из первой строки (5-я ячейка, индекс 4)
      const firstCell = await firstRow.locator('td').nth(4).textContent();
      if (!firstCell || !firstCell.includes(nameProductNew)) {
        // Если имя продукта не совпадает — выходим
        break;
      }

      // Получаем номер заказа (3-я ячейка, индекс 2)
      const orderNumber = await firstRow.locator('td').nth(2).textContent();
      // Кликаем по первой ячейке (2-я ячейка, индекс 1)
      await firstRow.locator('td').nth(1).click();
      await page.waitForTimeout(1000);

      // Кликаем по кнопке Архив
      const archiveButton = page.locator(LoadingTasksSelectors.buttonArchive, {
        hasText: 'Архив',
      });
      await archiveButton.click();

      // Ждем появления диалога подтверждения
      const dialog = page
        .locator(PartsDBSelectors.MODAL_CONFIRM_CONTENT)
        .filter({
          hasText: `Вы уверены, что хотите перенести в архив "${orderNumber}"?`,
        });
      await page.waitForTimeout(1000);

      // Кликаем по кнопке Да
      const confirmButton = page.locator(
        '[data-testid="ModalConfirm-Content-Buttons-Yes"]',
        { hasText: 'Да' }
      );
      await confirmButton.click();

      // Ждем обновления таблицы
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // небольшой таймаут для стабильности
    }
  });

  test('Test Case 06 - Loading Task', async ({ page }) => {
    console.log('Test Case 06 - Loading Task');
    test.setTimeout(90000);
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 02: Checking the main page headings', async () => {
      const titles = testData1.elements.LoadingPage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await loadingTaskPage.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 03: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.LoadingPage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, datatestid, and state from the button object
          const buttonClass = button.class;
          const buttonDataTestId = button.datatestid;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await loadingTaskPage.isButtonVisibleTestId(
                page,
                buttonDataTestId,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 04: Click on the Create order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton(
        'Создать заказ',
        LoadingTasksSelectors.buttonCreateOrder
      );
    });

    await allure.step('Step 05: Checking the main page headings', async () => {
      await page.waitForTimeout(1000);
      const titles = testData1.elements.CreateOrderPage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await loadingTaskPage.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 06: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.CreateOrderPage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await loadingTaskPage.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 07: Click on the Select button', async () => {
      // Click on the button
      await page
        .locator(LoadingTasksSelectors.buttonChoiceIzd, {
          hasText: 'Выбрать',
        })
        .nth(0)
        .click();

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 08: Checking the main page headings', async () => {
      const titles = testData1.elements.ModalWindowChoiceProduct.titles.map(
        title => title.trim()
      );
      const h3Titles = await loadingTaskPage.getAllH3TitlesInModalClassNew(
        page,
        '.modal-yui-kit__modal-content'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 09: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.ModalWindowChoiceProduct.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await loadingTaskPage.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 10: Checking filters on a page', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      const buttons = testData1.elements.ModalWindowChoiceProduct.filters;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the class, label, and state from the button object
        const buttonClass = button.class;
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true' ? true : false;

        // Perform the validation for the button
        await allure.step(
          `Validate button with label: "${buttonLabel}"`,
          async () => {
            // Check if the button is visible and enabled using data-testid
            if (!buttonDataTestId) {
              throw new Error(
                `Button "${buttonLabel}" does not have a data-testid`
              );
            }
            const isButtonReady = await loadingTaskPage.isButtonVisibleTestId(
              page,
              buttonDataTestId,
              buttonLabel,
              expectedState
            );

            // Validate the button's visibility and state
            expect(isButtonReady).toBeTruthy();
            console.log(
              `Is the "${buttonLabel}" button visible and enabled?`,
              isButtonReady
            );
          }
        );
      }
    });

    await allure.step('Step 11: Search product on modal window', async () => {
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expect(modalWindow).toBeVisible();

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameProduct);

      expect(await searchTable.inputValue()).toBe(nameProduct);
      await searchTable.press('Enter');

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 12: Choice product in modal window', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0);

      await loadingTaskPage.waitForTimeout(1000);
    });

    await allure.step(
      'Step 13: Click on the Select button on modal window',
      async () => {
        // Click on the button
        await loadingTaskPage.clickButton(
          'Добавить',
          LoadingTasksSelectors.buttonChoiceIzd
        );
      }
    );

    await allure.step('Step 14: Checking the selected product', async () => {
      // Check that the selected product displays the expected product
      await loadingTaskPage.checkProduct(nameProduct);
      await loadingTaskPage.waitForTimeout(500);
    });

    await allure.step('Step 15: Click on the Select buyer button', async () => {
      await loadingTaskPage.clickButton(
        'Выбрать',
        LoadingTasksSelectors.buttonChoiceBuyer
      );

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 16: Check modal window Company', async () => {
      // await loadingTaskPage.searchTable(nameBuyer, '.table-yui-kit__border.table-yui-kit-with-scroll')

      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expect(modalWindow).toBeVisible();

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameBuyer);

      expect(await searchTable.inputValue()).toBe(nameBuyer);
      await searchTable.press('Enter');

      await page.waitForTimeout(500);

      await loadingTaskPage.clickFromFirstRowBug(
        '.table-yui-kit__border.table-yui-kit-with-scroll',
        0
      );
    });

    await allure.step(
      'Step 17: Click on the Select button on modal window',
      async () => {
        // Click on the button
        await loadingTaskPage.clickButton(
          'Добавить',
          LoadingTasksSelectors.buttonAddBuyerOnModalWindow
        );
      }
    );

    await allure.step(
      'Step 18: We change the quantity of the ordered product',
      async () => {
        const locator =
          '.input-yui-kit.initial.medium.add-order-component__input.initial';
        await loadingTaskPage.checkOrderQuantity(
          locator,
          '1',
          quantityProductLaunchOnProduction
        );

        await loadingTaskPage.waitForTimeout(1000);
      }
    );

    // await allure.step(
    //     "Step 19: We set the date according to urgency",
    //     async () => {
    //         await page.locator('.date-picker-yui-kit__header-btn').nth(2).click()
    //         await page.locator('.vc-popover-content-wrapper.is-interactive').nth(2).isVisible()

    //         await page.locator('.vc-title-wrapper').click()
    //         // Находим элемент с годом
    //         const yearElement = await page.locator('.vc-nav-title.vc-focus');
    //         const currentYear = await yearElement.textContent();
    //         if (!currentYear) throw new Error('Year element not found');

    //         const targetYear = 2025;
    //         const currentYearNum = parseInt(currentYear);
    //         console.log(`Current year: ${currentYear}, Target year: ${targetYear}`);

    //         // Если текущий год не равен целевому
    //         if (currentYearNum !== targetYear) {
    //             // Определяем, нужно ли увеличивать или уменьшать год
    //             const isYearLess = currentYearNum < targetYear;
    //             const arrowSelector = isYearLess
    //                 ? '.vc-nav-arrow.is-right.vc-focus'
    //                 : '.vc-nav-arrow.is-left.vc-focus';

    //             // Кликаем на стрелку, пока не достигнем нужного года
    //             while (currentYearNum !== targetYear) {
    //                 await page.locator(arrowSelector).click();
    //                 await page.waitForTimeout(500); // Небольшая задержка для обновления

    //                 const newYear = await yearElement.textContent();
    //                 if (!newYear) throw new Error('Year element not found');
    //                 const newYearNum = parseInt(newYear);

    //                 if (newYearNum === targetYear) {
    //                     console.log(`Year successfully set to ${targetYear}`);
    //                     break;
    //                 }
    //             }
    //         } else {
    //             console.log(`Year is already set to ${targetYear}`);
    //         }

    //         // Проверяем, что год установлен правильно
    //         const finalYear = await yearElement.textContent();
    //         if (!finalYear) throw new Error('Year element not found');
    //         expect(parseInt(finalYear)).toBe(targetYear);

    //         await page.locator('[aria-label="январь"]').click()
    //         await page.locator('.vc-day-content.vc-focusable.vc-focus.vc-attr', { hasText: '23' }).nth(0).click()
    //     }
    // );
    await allure.step(
      'Step 19: We set the date according to urgency',
      async () => {
        console.log('Step 19: We set the date according to urgency');
        await page.locator(LoadingTasksSelectors.calendarTrigger).click();
        await page.locator(LoadingTasksSelectors.calendarPopover).isVisible();

        // Scope to the calendar component
        const calendar = page.locator(LoadingTasksSelectors.calendarComponent);

        // Open the years popup by clicking the header year button
        const yearButton = calendar
          .locator('button[id^="open-years-popup"]')
          .first();
        await yearButton.waitFor({ state: 'visible' });
        await yearButton.click();

        // Scope to the open years popover
        const yearsPopover = page
          .locator('wa-popover[for^="open-years-popup"][open]')
          .first();
        await yearsPopover.waitFor({ state: 'visible' });

        // Select target year directly inside the open years popover
        const targetYear = 2025;
        // Some builds render part="year " (with a trailing space) — use starts-with selector
        const yearCell = yearsPopover
          .locator('[part^="year"]', { hasText: String(targetYear) })
          .first();
        await yearCell.waitFor({ state: 'visible', timeout: 10000 });
        await yearCell.click();

        // Verify selection reflects on the header year button
        const finalYearText = ((await yearButton.textContent()) || '').trim();
        expect(parseInt(finalYearText, 10)).toBe(targetYear);
        // Open months popup and select January
        const monthButton = calendar
          .locator('button[id^="open-months-popup"]')
          .first();
        await monthButton.waitFor({ state: 'visible' });
        await monthButton.click();

        const monthsPopover = page
          .locator('wa-popover[for^="open-months-popup"][open]')
          .first();
        await monthsPopover.waitFor({ state: 'visible' });
        // Click January (Month 1, index 1)
        const januaryCell = monthsPopover.locator('div[part^="month"]').nth(1);
        await januaryCell.waitFor({ state: 'visible' });
        await januaryCell.click({ force: true });
        // Wait for month button to show "Янв" to confirm selection
        await monthButton.waitFor({ state: 'visible' });
        await page.waitForTimeout(1000); // Give time for the selection to register

        // Pick the day 23 in January 2025 by aria-label
        await calendar
          .locator('button[role="gridcell"][aria-label="January 23rd, 2025"]')
          .first()
          .click();
      }
    );

    await allure.step(
      'Step 20: We save descendants from the specification into an array',
      async () => {
        // Clear array first to avoid duplicates
        descendantsCbedArray.length = 0;
        descendantsDetailArray.length = 0;
        // Save Assembly units and Parts from the Specification to an array
        await loadingTaskPage.preservingDescendants(
          descendantsCbedArray,
          descendantsDetailArray
        );
      }
    );

    await allure.step('Step 21: Click on the save order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton(
        'Сохранить',
        LoadingTasksSelectors.buttonSaveOrder
      );
    });

    await allure.step('Step 22: Checking the ordered quantity', async () => {
      await page.waitForTimeout(3000);
      const orderInfo = await loadingTaskPage.getOrderInfoFromLocator(
        '.add-order-component'
      );
      orderNumber = {
        orderNumber: orderInfo.orderNumber || '',
        orderDate: orderInfo.orderDate,
      };
      console.log('orderNumber: ', orderNumber);
    });
  });

  test('Test Case 07 - Checking the urgency date and quantity in a shipment task', async ({
    page,
  }) => {
    console.log(
      'Test Case 07 - Checking the urgency date and quantity in a shipment task'
    );
    test.setTimeout(90000);
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const mainTableLoadingTask =
      'IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Table';

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 02: Search product', async () => {
      // Using table search we look for the value of the variable
      await loadingTaskPage.searchAndWaitForTable(
        nameProduct,
        LoadingTasksSelectors.loadingMainTable,
        LoadingTasksSelectors.loadingMainTable,
        { useRedesign: true }
      );
    });

    await allure.step('Step 03: Checking the quantity in a task', async () => {
      // Find the quantity cell using data-testid pattern
      // Pattern: IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-Kol{id}
      const quantityCell = page
        .locator(
          '[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-Kol"]'
        )
        .first();

      await quantityCell.waitFor({ state: 'visible', timeout: 10000 });
      await quantityCell.scrollIntoViewIfNeeded();

      // Highlight the quantity cell
      await quantityCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'lightcyan';
        el.style.border = '2px solid blue';
      });

      // Get the quantity value from the cell
      const quantityValue = await quantityCell.textContent();
      const quantityOnTable = quantityValue?.trim() || '';

      console.log(
        'Количество заказанных сущностей в заказе: ',
        quantityOnTable
      );

      expect.soft(quantityOnTable).toBe(quantityProductLaunchOnProduction);
    });

    await allure.step(
      'Step 04: Checking the urgency date of an order',
      async () => {
        urgencyDateOnTable = await page
          .locator('tbody .date-picker-yui-kit__header-btn span')
          .first()
          .textContent();

        console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

        expect(urgencyDateOnTable).toBe(urgencyDateNewFormat);
      }
    );
  });

  test('Test Case 08 - Launch Into Production Product', async ({ page }) => {
    console.log('Test Case 08 - Launch Into Production Product');
    test.setTimeout(90000);
    const shortageProduct = new CreateShortageProductPage(page);

    let checkOrderNumber: string;

    await allure.step(
      'Step 01-02: Open the warehouse page and shortage product page',
      async () => {
        // Find and go to the page using the locator Shortage of Products
        const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
        await shortageProduct.navigateToPageAndWaitForTable(
          SELECTORS.MAINMENU.WAREHOUSE.URL,
          selector,
          deficitTable
        );
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.ProductShortage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await shortageProduct.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.ProductShortage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await shortageProduct.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(
        nameProduct,
        deficitTable,
        deficitTable,
        { useRedesign: true, timeoutBeforeWait: 2000 }
      );
    });

    await allure.step(
      'Step 06: Check the checkbox in the first column',
      async () => {
        // Find the checkbox using data-testid
        const checkboxCell = page
          .locator(SelectorsShortagePages.ROW_CHECKBOX)
          .first();

        await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        await checkboxCell.scrollIntoViewIfNeeded();

        // Highlight the checkbox cell
        await checkboxCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });

        // Find the actual checkbox input inside the cell
        const checkbox = checkboxCell.getByRole('checkbox').first();

        // Check if the checkbox is disabled
        const isDisabled = await checkbox.isDisabled();
        if (isDisabled) {
          throw new Error('Cannot check the checkbox. Checkbox is disabled.');
        }

        // Check if the checkbox is already checked
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          console.log('Checkbox is not checked, attempting to check it...');
          await checkbox.click();
          await page.waitForTimeout(300);

          // Verify the checkbox is now checked
          const isCheckedAfter = await checkbox.isChecked();
          if (!isCheckedAfter) {
            throw new Error(
              'Failed to check the checkbox. Checkbox remains unchecked after click.'
            );
          }
          console.log('Checkbox successfully checked');
        } else {
          console.log('Checkbox is already checked, skipping click');
        }

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);
      }
    );

    await allure.step(
      'Step 07: Checking the urgency date of an order',
      async () => {
        // Find the urgency date cell using data-testid
        const urgencyDateCell = page
          .locator(SelectorsShortagePages.ROW_DATE_URGENCY)
          .first();

        await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
        await urgencyDateCell.scrollIntoViewIfNeeded();

        // Highlight the urgency date cell
        await urgencyDateCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightyellow';
          el.style.border = '2px solid orange';
        });

        // Get the urgency date value from the cell
        const urgencyDateValue = await urgencyDateCell.textContent();
        urgencyDateOnTable = urgencyDateValue?.trim() || '';

        console.log('Date by urgency in the table: ', urgencyDateOnTable);

        expect.soft(urgencyDateOnTable).toBe(urgencyDate);
      }
    );

    await allure.step(
      'Step 08: We check the number of those launched into production',
      async () => {
        // Find the production ordered quantity cell using data-testid
        const productionOrderedCell = page
          .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED)
          .first();

        await productionOrderedCell.waitFor({
          state: 'visible',
          timeout: 10000,
        });
        await productionOrderedCell.scrollIntoViewIfNeeded();

        // Highlight the production ordered quantity cell
        await productionOrderedCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcyan';
          el.style.border = '2px solid blue';
        });

        // Get the production ordered quantity value from the cell
        const productionOrderedValue =
          await productionOrderedCell.textContent();
        quantityProductLaunchOnProductionBefore =
          productionOrderedValue?.trim() || '';

        console.log(
          'The value in the cells is put into production befor:',
          quantityProductLaunchOnProductionBefore
        );
      }
    );

    await allure.step(
      'Step 09: Click on the Launch on production button',
      async () => {
        // Click on the button
        await shortageProduct.clickButton(
          'Запустить в производство',
          buttonLaunchIntoProduction
        );
      }
    );

    await allure.step(
      'Step 10: Testing a modal window for production launch',
      async () => {
        // Check the modal window Launch into production
        await shortageProduct.checkModalWindowLaunchIntoProduction(
          modalWindowLaunchIntoProduction
        );
      }
    );

    await allure.step(
      'Step 12: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons =
          testData1.elements.ModalWindowLaunchOnProduction.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await shortageProduct.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 13: Enter a value into a cell', async () => {
      // Check the value in the Own quantity field and enter the value
      const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
      await shortageProduct.checkOrderQuantity(
        locator,
        '2',
        quantityProductLaunchOnProduction
      );
    });

    await allure.step('Step 14: We save the order number', async () => {
      // Get the order number
      checkOrderNumber = await shortageProduct.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);
    });

    await allure.step('Step 15: Click on the In launch button', async () => {
      // Click on the button
      await shortageProduct.clickButton(
        'В производство',
        buttonLaunchIntoProductionModalWindow
      );
    });

    await allure.step(
      'Step 16: We check that the order number is displayed in the notification',
      async () => {
        // Check the order number in the success notification
        await shortageProduct.getMessage(checkOrderNumber);
      }
    );

    await allure.step(
      'Step 17: We check the number of those launched into production',
      async () => {
        // Find the production ordered quantity cell using data-testid
        const productionOrderedCell = page
          .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED)
          .first();

        await productionOrderedCell.waitFor({
          state: 'visible',
          timeout: 10000,
        });
        await productionOrderedCell.scrollIntoViewIfNeeded();

        // Highlight the production ordered quantity cell
        await productionOrderedCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcyan';
          el.style.border = '2px solid blue';
        });

        // Get the production ordered quantity value from the cell
        const productionOrderedValue =
          await productionOrderedCell.textContent();
        quantityProductLaunchOnProductionAfter =
          productionOrderedValue?.trim() || '';

        console.log(
          'The value in the cells is put into production after:',
          quantityProductLaunchOnProductionAfter
        );

        expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
          Number(quantityProductLaunchOnProductionBefore) +
            Number(quantityProductLaunchOnProduction)
        );
      }
    );
  });

  test('Test Case 09 - Launch Into Production Cbed', async ({ page }) => {
    console.log('Test Case 04 - Launch Into Production Cbed');
    test.setTimeout(900000);
    const shortageAssemblies = new CreatShortageAssembliesPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the shortage assemblies page',
      async () => {
        // Find and go to the page using the locator shortage assemblies
        const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
        await shortageAssemblies.findTable(selector);
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.CbedShortage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await shortageAssemblies.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.CbedShortage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled

              const isButtonReady = await shortageAssemblies.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(deficitTableCbed);
          await page.waitForTimeout(500);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            deficitTableCbed,
            deficitTableCbed,
            { useRedesign: true, timeoutBeforeWait: 1000 }
          );
          await page.waitForLoadState('domcontentloaded');

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step(
          'Step 06: Check the checkbox in the first column',
          async () => {
            await page.waitForTimeout(1000);
            // Find the checkbox using data-testid
            const checkboxCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_SELECT)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageAssemblies.waitingTableBody(deficitTableCbed);
          }
        );

        await allure.step(
          'Step 07: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_URGENCY_DATE)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 08: We check the number of those launched into production',
          async () => {
            // Find the ordered quantity cell using data-testid
            const orderedCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED)
              .first();

            await orderedCell.waitFor({ state: 'visible', timeout: 10000 });
            await orderedCell.scrollIntoViewIfNeeded();

            // Highlight the ordered cell
            await orderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the ordered quantity value from the cell
            const orderedValue = await orderedCell.textContent();
            quantityProductLaunchOnProductionBefore =
              orderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production befor:',
              quantityProductLaunchOnProductionBefore
            );
          }
        );

        await allure.step(
          'Step 09: Click on the Launch on production button',
          async () => {
            // Click on the button
            await shortageAssemblies.clickButton(
              'Запустить в производство',
              buttonLaunchIntoProductionCbed
            );
          }
        );

        await allure.step(
          'Step 10: Testing a modal window for production launch',
          async () => {
            await page.waitForLoadState('networkidle');
            // Check the modal window Launch into production
            await shortageAssemblies.checkModalWindowLaunchIntoProduction(
              modalWindowLaunchIntoProductionCbed
            );

            // Check the date in the Launch into production modal window
            // await shortageAssemblies.checkCurrentDate(
            //   '[data-testid="ModalStartProduction-OrderDateValue"]'
            // );//ERP-2336
          }
        );

        await allure.step('Step 11: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.ROW_PRODUCTION_INPUT;
          await shortageAssemblies.checkOrderQuantity(
            locator,
            '2',
            quantityProductLaunchOnProduction
          );
        });

        await allure.step('Step 12: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageAssemblies.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
          'Step 13: Click on the In launch button',
          async () => {
            // Click on the button
            await shortageAssemblies.clickButton(
              'В производство',
              buttonLaunchIntoProductionModalWindow
            );
          }
        );

        await allure.step(
          'Step 14: We check that the order number is displayed in the notification',
          async () => {
            // Check the order number in the success notification
            await shortageAssemblies.getMessage(checkOrderNumber);
          }
        );

        await allure.step('Step 15: Close success message', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
          await shortageAssemblies.closeSuccessMessage();
        });

        await allure.step(
          'Step 16: We check the number of those launched into production',
          async () => {
            // Find the ordered quantity cell using data-testid
            const orderedCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED)
              .first();

            await orderedCell.waitFor({ state: 'visible', timeout: 10000 });
            await orderedCell.scrollIntoViewIfNeeded();

            // Highlight the ordered cell
            await orderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the ordered quantity value from the cell
            const orderedValue = await orderedCell.textContent();
            quantityProductLaunchOnProductionAfter = orderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production after:',
              quantityProductLaunchOnProductionAfter
            );

            expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
              Number(quantityProductLaunchOnProductionBefore) +
                Number(quantityProductLaunchOnProduction)
            );
          }
        );
      }
    }
  });

  test('Test Case 10 - Launch Into Production Parts', async ({ page }) => {
    console.log('Test Case 10 - Launch Into Production Parts');
    test.setTimeout(900000);
    const shortageParts = new CreatShortagePartsPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.PartsShortage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await shortageParts.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.PartsShortage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Step 04a: Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled

              const isButtonReady = await shortageParts.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 05: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(
            part.name,
            deficitTableDetail,
            deficitTableDetail,
            { useRedesign: true, timeoutBeforeWait: 1000 }
          );
        });

        await allure.step(
          'Step 06: Check that the first row of the table contains the variable name',
          async () => {
            // Find the checkbox using data-testid (starts with pattern)
            const checkboxCell = page
              .locator(SelectorsShortagePages.ROW_CHECKBOX_PATTERN)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageParts.waitingTableBody(deficitTableDetail);
          }
        );

        await allure.step(
          'Step 07: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid (starts with pattern)
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.ROW_DATE_URGENCY_PATTERN)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 08: We check the number of those launched into production',
          async () => {
            // Get the value using data-testid directly
            const quantityCell = page
              .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN)
              .first();
            await quantityCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });
            quantityProductLaunchOnProductionBefore =
              (await quantityCell.textContent()) || '0';

            console.log(
              'The value in the cells is put into production befor:',
              quantityProductLaunchOnProductionBefore
            );
          }
        );

        await allure.step(
          'Step 09: Click on the Launch on production button ',
          async () => {
            // Ensure at least one row is rendered
            const rows = page.locator(SelectorsShortagePages.ROW_PATTERN);
            await rows.first().waitFor({ state: 'visible', timeout: 15000 });

            const firstRow = rows.first();

            // Prefer role-based checkbox if present
            const roleCheckbox = firstRow.getByRole('checkbox').first();

            let ensuredChecked = false;
            try {
              await roleCheckbox.scrollIntoViewIfNeeded();
              await roleCheckbox.waitFor({ state: 'visible', timeout: 10000 });
              const roleIsChecked = await roleCheckbox.isChecked();
              if (!roleIsChecked) {
                console.log(
                  'Checkbox (role) is not selected, selecting it now...'
                );
                await roleCheckbox.click();
                ensuredChecked = true;
                await page.waitForTimeout(200);
              } else {
                console.log('Checkbox (role) is already selected');
                ensuredChecked = true;
              }
            } catch (e) {
              console.log(
                'Role-based checkbox not available/visible, falling back to cell/input.'
              );
            }

            if (!ensuredChecked) {
              // Fallback: find checkbox cell and inner input
              const checkboxCell = firstRow
                .locator('[data-testid$="-Checkbox"]')
                .first();
              await checkboxCell.scrollIntoViewIfNeeded();
              const inputCheckbox = checkboxCell
                .locator(
                  'input[type="checkbox"], input[data-testid="checkbox"]'
                )
                .first();

              // Some UIs hide input and toggle on cell/label click
              try {
                await inputCheckbox.waitFor({
                  state: 'visible',
                  timeout: 5000,
                });
                const isChecked = await inputCheckbox.isChecked();
                if (!isChecked) {
                  console.log(
                    'Checkbox input is not selected, clicking input...'
                  );
                  await inputCheckbox.click();
                  await page.waitForTimeout(200);
                } else {
                  console.log('Checkbox input is already selected');
                }
              } catch {
                console.log(
                  'Checkbox input not visible, clicking the checkbox cell instead...'
                );
                await checkboxCell.click();
                await page.waitForTimeout(200);
              }
            }

            // Click on the button
            await shortageParts.clickButton(
              'Запустить в производство',
              buttonLaunchIntoProductionDetail
            );
          }
        );

        await allure.step(
          'Step 10: Testing a modal window for production launch',
          async () => {
            // Check the modal window Launch into production
            await shortageParts.checkModalWindowLaunchIntoProduction(
              modalWindowLaunchIntoProductionDetail
            );

            // Check the date in the Launch into production modal window
            // await shortageParts.checkCurrentDate(
            //   '[data-testid="ModalStartProduction-OrderDateValue"]'
            // );//ERP-2366
          }
        );

        await allure.step('Step 11: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
          await shortageParts.checkOrderQuantity(
            locator,
            '2',
            quantityProductLaunchOnProduction
          );
        });

        await allure.step('Step 12: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageParts.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
          'Step 13: Click on the In launch button',
          async () => {
            // Click on the button
            await shortageParts.clickButton(
              'В производство',
              buttonLaunchIntoProductionModalWindow
            );
          }
        );

        await allure.step(
          'Step 14: We check that the order number is displayed in the notification',
          async () => {
            // Check the order number in the success notification
            await shortageParts.getMessage(checkOrderNumber);
          }
        );

        await allure.step('Step 15: Close success message', async () => {
          await shortageParts.closeSuccessMessage();
        });

        await allure.step(
          'Step 16: We check the number of those launched into production',
          async () => {
            // Find the production ordered quantity cell using data-testid (starts with pattern)
            const productionOrderedCell = page
              .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN)
              .first();

            await productionOrderedCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await productionOrderedCell.scrollIntoViewIfNeeded();

            // Highlight the production ordered quantity cell
            await productionOrderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the production ordered quantity value from the cell
            const productionOrderedValue =
              await productionOrderedCell.textContent();
            quantityProductLaunchOnProductionAfter =
              productionOrderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production after:',
              quantityProductLaunchOnProductionAfter
            );

            quantitySumLaunchOnProduction =
              Number(quantityProductLaunchOnProductionBefore) +
              Number(quantityProductLaunchOnProduction);

            expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
              Number(quantityProductLaunchOnProductionBefore) +
                Number(quantityProductLaunchOnProduction)
            );
          }
        );
      }
    }
  });

  // HARDCODED VALUES FOR TEST CASE 11 (to allow skipping previous test cases)
  // These values are normally set in Test Case 10
  //quantitySumLaunchOnProduction = 4; // Normally: quantityProductLaunchOnProductionBefore (2) + quantityProductLaunchOnProduction (2)

  test('Test Case 11 - Marking Parts', async ({ page }) => {
    console.log('Test Case 06 - Marking Parts');
    test.setTimeout(500000);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    const productionTable = ProductionPathSelectors.OPERATION_TABLE;
    let numberColumnQunatityMade: number;
    let firstOperation: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the metalworking warehouse page',
      async () => {
        // Find and go to the page using the locator Order a warehouse for Metalworking
        const selector =
          MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
        await metalworkingWarehouse.findTable(selector);
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData2.elements.MetalworkingWarhouse.titles.map(title =>
        title.trim()
      );
      const h3Titles = await metalworkingWarehouse.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData2.elements.MetalworkingWarhouse.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await metalworkingWarehouse.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        console.log('part.nameXXXX: ', part.name);
        await allure.step('Step 05: Search product', async () => {
          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(
            MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE
          );

          await page.waitForTimeout(500);
          // Using table search we look for the value of the variable
          await metalworkingWarehouse.searchAndWaitForTable(
            part.name,
            MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE,
            MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE,
            { useRedesign: true, timeoutBeforeWait: 500 }
          );
        });

        await allure.step(
          'Step 06: Checking that the first line is a variable name',
          async () => {
            // Check that the first row of the table contains the variable name
            await metalworkingWarehouse.checkNameInLineFromFirstRow(
              part.name,
              MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE
            );

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(
              MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE
            );
          }
        );

        await allure.step(
          'Step 07: Checking the urgency date of an order',
          async () => {
            // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-DateByUrgency
            const urgencyDateCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-DateByUrgency"]'
              )
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect.soft(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 08: We check the number of those launched into production',
          async () => {
            // Get the value using data-testid directly
            const quantityCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-Ordered"]'
              )
              .first();
            await quantityCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });
            quantityProductLaunchOnProductionBefore =
              (await quantityCell.textContent()) || '0';

            console.log(
              'The value in the cells is orders befor:',
              quantityProductLaunchOnProductionBefore
            );

            expect
              .soft(Number(quantityProductLaunchOnProductionBefore))
              .toBe(quantitySumLaunchOnProduction);
          }
        );

        await allure.step(
          'Step 09: Find and click on the operation icon',
          async () => {
            // Get the operations cell using data-testid directly
            // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-Operations
            const operationsCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-Operations"]'
              )
              .first();

            await operationsCell.waitFor({ state: 'visible', timeout: 10000 });
            await operationsCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await operationsCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click the operations cell directly
            await operationsCell.click();

            // Waiting for loading
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step(
          'Step 10: Checking the modalwindow headings',
          async () => {
            await page.waitForTimeout(2500);
            const titles =
              testData1.elements.ModalWindowPartsProductionPath.titles.map(
                title => title.trim()
              );
            const h3Titles =
              await metalworkingWarehouse.getAllH3AndH4TitlesInModalTestId(
                page,
                'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-ModalOperationPathMetaloworking'
              );
            const normalizedH3Titles = h3Titles.map(title => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
          }
        );

        await allure.step(
          'Step 11: Checking the buttons on the modalwindow',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ModalWindowPartsProductionPath.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled
                  const isButtonReady =
                    await metalworkingWarehouse.isButtonVisible(
                      page,
                      buttonClass,
                      buttonLabel,
                      expectedState
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 12: We find, get the value and click on the cell done pcs',
          async () => {
            // Get the done/made cell using data-testid directly
            // Pattern: OperationPathInfo-tbodysdelano-sh{number}
            const doneCell = page
              .locator(ProductionPathSelectors.OPERATION_ROW_DONE_PATTERN)
              .first();

            await doneCell.waitFor({ state: 'visible', timeout: 10000 });
            await doneCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await doneCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click on the Done cell
            await doneCell.click();
          }
        );

        await allure.step(
          'Step 13: Find and get the value from the operation cell',
          async () => {
            // Get the operation cell using data-testid directly
            const operationCell = page
              .locator(ProductionPathSelectors.OPERATION_ROW_FULL_NAME)
              .first();

            await operationCell.waitFor({ state: 'visible', timeout: 10000 });
            await operationCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await operationCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the operation value from the cell
            const operationValue = await operationCell.textContent();
            firstOperation = operationValue?.trim() || '';

            console.log(firstOperation);
            logger.info(firstOperation);
          }
        );

        await allure.step('Step 14: Click on the add mark button', async () => {
          // Click on the button
          await metalworkingWarehouse.clickButton(
            'Добавить отметку',
            MarkOfCompletionSelectors.BUTTON_ADD_MARK
          );

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 15: Checking the modalwindow headings',
          async () => {
            await page.waitForTimeout(2500);
            const titles =
              testData1.elements.ModalWindowMarkOfCompletion.titles.map(title =>
                title.trim()
              );

            // Pass only the prefix part of the testId - the method will handle the suffix
            const h3Titles =
              await metalworkingWarehouse.getAllH3AndH4TitlesInModalTestId(
                page,
                'OperationPathInfo-ModalMark-Create'
              );
            const normalizedH3Titles = h3Titles.map(title => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
          }
        );

        await allure.step(
          'Step 16: Checking the buttons on the modalwindow',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ModalWindowMarkOfCompletion.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;
              const buttonDataTestId = button.datatestid;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const isButtonReady =
                    await metalworkingWarehouse.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 17: Checking the modal window and marking completion',
          async () => {
            // Check the progress check modal window
            await metalworkingWarehouse.completionMarkModalWindow(
              firstOperation,
              part.name,
              part.designation
            );
          }
        );

        // await allure.step(
        //   'Step 18: Click on the Save order button',
        //   async () => {
        //     // Click on the button
        //     await metalworkingWarehouse.clickButton(
        //       'Сохранить',
        //       '[data-testid="ModalMark-Button-Save"]'
        //     );
        //   }
        // );

        await allure.step(
          'Step 18: Closing the first modal window by pressing escape',
          async () => {
            // Close the modal window from "Add mark" step
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        );

        // await allure.step('Step 19: Closing modal windows', async () => {
        //   // Try to find and click the modal close button first
        //   const closeButton = page
        //     .locator('button[data-testid="ModalMark-Button-Cancel"]')
        //     .first();
        //   const closeCount = await closeButton.count();

        //   if (closeCount > 0) {
        //     await closeButton.click();
        //     await page.waitForTimeout(500);
        //   }

        //   // Also try pressing Escape to close any remaining modals
        //   await page.keyboard.press('Escape');
        //   await page.waitForTimeout(500);

        //   // Finally, try clicking at (1,1) to close any remaining overlays
        //   await page.mouse.dblclick(1, 1);
        //   await page.waitForTimeout(1000);
        //   await page.waitForLoadState('networkidle');

        //   // Wait for the table body to load
        //   await metalworkingWarehouse.waitingTableBody(
        //     MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE
        //   );
        // });
        console.log('part.nameYYYYYY: ', part.name);
      }
    }
  });

  // HARDCODED VALUES FOR TEST CASE 12 (to allow skipping previous test cases)
  // These values are normally set in Test Case 06
  // descendantsCbedArray.length = 0; // Clear array first
  // descendantsCbedArray.push(
  //   { name: '0Т4.11', designation: '-', quantity: 1 },
  //   { name: '0Т4.12', designation: '-', quantity: 1 }
  // );

  test('Test Case 12 - Complete Set Of Cbed', async ({ page }) => {
    console.log('Test Case 12 - Complete Set Of Cbed');
    test.setTimeout(90000);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(
      page
    );
    // Use CONST.TABLE_COMPLECT_TABLE for table selector
    const tableMain = CONST.TABLE_COMPLECT_TABLE;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the completion cbed plan page',
      async () => {
        // Find and go to the page using the locator Completing assemblies to plan
        const selector =
          SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
        await completingAssembliesToPlan.findTable(selector);
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      await page.waitForTimeout(500);
      const titles = testData1.elements.AssemblyKittingOnThePlan.titles.map(
        title => title.trim()
      );
      const h3Titles = await completingAssembliesToPlan.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.AssemblyKittingOnThePlan.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonDataTestId = button.datatestid;
          const buttonLabel = button.label;
          const buttonState = button.state;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const expectedState = buttonState === 'true' ? true : false;
              const isButtonReady =
                await completingAssembliesToPlan.isButtonVisibleTestId(
                  page,
                  buttonDataTestId,
                  buttonLabel,
                  expectedState
                );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой. Перебор невозможен.');
    } else {
      console.log(
        'TTTTTTTTTTTTTTTTTTTT: ' + JSON.stringify(descendantsCbedArray, null, 2)
      );
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05: Search product', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          // Using table search we look for the value of the variable
          await completingAssembliesToPlan.searchTable(
            cbed.name,
            `table[data-testid="${CONST.TABLE_COMPLECT_TABLE}"]`,
            CONST.COMPLEX_SBORKA_BY_PLAN
          );
          await page.waitForTimeout(1000);
        });

        await allure.step(
          'Step 06: Check the first line in the first row',
          async () => {
            // Check that the first row of the table contains the variable name
            await completingAssembliesToPlan.checkNameInLineFromFirstRow(
              cbed.name,
              `table[data-testid="${CONST.TABLE_COMPLECT_TABLE}"]`
            );
          }
        );

        await allure.step(
          'Step 07: Checking the urgency date of an order',
          async () => {
            // Get the value using data-testid directly
            // const urgencyDateCell = page
            //   .locator(
            //     '[data-testid^="CompletCbed-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
            //   )
            //   .first();
            const urgencyDateCell = page
              .locator(
                SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DATE_URGENCY_PATTERN
              )
              .nth(1); //ERP-2423
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });
            urgencyDateOnTable = (await urgencyDateCell.textContent()) || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
            console.log('Дата по срочности в переменной: ', urgencyDate);

            expect.soft(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 08: Find the column designation and click',
          async () => {
            // Get the designation cell using data-testid directly and double-click it
            const designationCell = page
              .locator(
                SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN
              )
              .first();
            await designationCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });
            await designationCell.dblclick();
            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step(
          'Step 09: Checking for the presence of headings in the modal window Invoice for assembly',
          async () => {
            await page.waitForTimeout(1500);
            const titles =
              testData1.elements.ModalWindowAssemblyInvoice.titles.map(title =>
                title.trim()
              );
            const h3Titles =
              await completingAssembliesToPlan.getAllH3TitlesInModalClassNew(
                page,
                SelectorsModalWindowConsignmentNote.MODAL_WINDOW_OPEN
              );
            const normalizedH3Titles = h3Titles.map(title => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
          }
        );

        await allure.step(
          'Step 10: Checking the presence of buttons in the modal window Invoice for assembly',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ModalWindowAssemblyInvoice.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled
                  const isButtonReady =
                    await completingAssembliesToPlan.isButtonVisible(
                      page,
                      buttonClass,
                      buttonLabel
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 11: Checking a checkbox in a modal window',
          async () => {
            await page.waitForTimeout(2000);

            // Check the checkbox in the modal using data-testid
            // Pattern: ModalAddWaybill-ShipmentDetailsTable-Row{number}-SelectCell
            const checkboxCell = page
              .locator(
                SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN
              )
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Click the checkbox cell
            await checkboxCell.click();
            await page.waitForTimeout(500);

            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step('Step 12: Enter your quantity', async () => {
          await completingAssembliesToPlan.checkOrderQuantity(
            SelectorsModalWindowConsignmentNote.QUANTITY_INPUT,
            quantityProductLaunchOnProduction,
            incomingQuantity
          );
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 13: Click on the button to assemble into a set',
          async () => {
            // Click on the button
            await completingAssembliesToPlan.clickButton(
              'Скомплектовать',
              SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
            );
          }
        );

        await allure.step(
          'Step 14: Check close modal window complete set',
          async () => {
            await completingAssembliesToPlan.checkCloseModalWindow(
              SelectorsModalWindowConsignmentNote.MODAL_WINDOW
            );
            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );
      }
    }
  });

  test('Test Case 13 - Disassembly of the set', async ({ page }) => {
    // doc test case 8
    console.log('Test Case 13 - Disassembly of the set');
    test.setTimeout(90000);

    // Setup request failure logging to identify 404 sources
    const failedRequests: Array<{ url: string; resourceType: string }> = [];
    page.on('requestfailed', request => {
      const url = request.url();
      const resourceType = request.resourceType();
      failedRequests.push({ url, resourceType });
      logger.error(
        `Request FAILED (${resourceType}): ${url} - Status: ${
          request.failure()?.errorText || 'Unknown'
        }`
      );
    });

    const completeSets = new CreateCompleteSetsPage(page);
    const completeSetsTable = SelectorsCompleteSets.TABLE_SCROLL;
    const disassembly = '[data-testid^="ModalUncomplectKit-AssemblyBlock"]';
    let qunatityCompleteSet: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completeSets.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsCompleteSets.SELECTOR_COMPLETE_SETS;
      await completeSets.findTable(selector);

      // Wait for the table body to load
      // await completeSets.waitingTableBody(completeSetsTable);

      // Wait for loading
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    });

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.DisassemblyPage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await completeSets.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.DisassemblyPage.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonDataTestId = button.datatestid;
          const buttonLabel = button.label;
          const buttonState = button.state;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled
              const expectedState = buttonState === 'true' ? true : false;
              const isButtonReady = await completeSets.isButtonVisibleTestId(
                page,
                buttonDataTestId,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой. Перебор невозможен.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05: Search product', async () => {
          await completeSets.waitForTimeout(1000);
          // Using table search we look for the value of the variable
          await completeSets.searchTable(
            cbed.name,
            completeSetsTable,
            'DeficitCbed-SearchInput-Dropdown-Input'
          );

          // Wait for the table body to load
          // await completeSets.waitingTableBody(completeSetsTable);
          await completeSets.waitForTimeout(1500);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 06: We check the number of those launched into production',
          async () => {
            // Find the assembled quantity cell using data-testid
            const assembledCell = page
              .locator(SelectorsCompleteSets.TABLE_CELL_ASSEMBLED)
              .first();

            await assembledCell.waitFor({ state: 'visible', timeout: 10000 });
            await assembledCell.scrollIntoViewIfNeeded();

            // Highlight the assembled quantity cell
            await assembledCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the assembled quantity value from the cell
            const assembledValue = await assembledCell.textContent();
            qunatityCompleteSet = assembledValue?.trim() || '';

            console.log('Количество собранных наборов: ', qunatityCompleteSet);
            await completeSets.checkNameInLineFromFirstRow(
              cbed.name,
              completeSetsTable
            );
          }
        );

        await allure.step(
          'Step 07: Look for the column with the checkbox and click on it',
          async () => {
            // Find the checkbox using data-testid
            const checkboxCell = page
              .locator(SelectorsCompleteSets.TABLE_CELL_CHECKBOX)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }
          }
        );

        await allure.step(
          'Step 08: Click on the Submit for assembly button',
          async () => {
            await completeSets.clickButton(
              'Разкомплектовать',
              SelectorsCompleteSets.BUTTON_UNASSEMBLE
            );
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step(
          'Step 09: Checking the modalwindow headings',
          async () => {
            const titles = testData1.elements.ModalWindowResetInSets.titles.map(
              title => title.trim()
            );
            const h3Titles = await completeSets.getAllH3TitlesInModalClassNew(
              page,
              SelectorsCompleteSets.MODAL_UNCOMPLECT_KIT_RIGHT_CONTENT
            );
            const normalizedH3Titles = h3Titles.map(title => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
          }
        );

        await allure.step(
          'Step 10: Checking buttons on the modalwindow',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons = testData1.elements.ModalWindowResetInSets.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;
              const buttonDataTestId = button.datatestid;
              const buttonState = button.state;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const expectedState = buttonState === 'true' ? true : false;
                  const isButtonReady =
                    await completeSets.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step('Step 11: Check modal window', async () => {
          await completeSets.disassemblyModalWindow(
            cbed.name,
            cbed.designation
          );

          // const numberColumn = await completeSets.findColumn(
          //     page,
          //     "ModalUncomplectKit-AssemblyTable",
          //     "ModalUncomplectKit-AssemblyTableHeaderKitQuantity"
          // );
          // console.log(
          //     "numberColumn: AssemblyTableHeaderKitQuantity",
          //     numberColumn
          // );
          qunatityCompleteSet = await completeSets.getValueOrClickFromFirstRow(
            disassembly,
            1
          );
          // Upd:
          const qunatityCompleteSetInModalWindow =
            await completeSets.getValueOrClickFromFirstRow(disassembly, 1);
          console.log('Количество собранных наборов: ', qunatityCompleteSet);
          console.log(
            'Количество собранных наборов в модальном окне: ',
            qunatityCompleteSetInModalWindow
          );
          //expect(qunatityCompleteSet).toBe(qunatityCompleteSetInModalWindow);
        });

        await allure.step(
          'Step 12: Enter quantity for disassembly',
          async () => {
            const cell = page.locator(
              '[data-testid^="ModalUncomplectKit-AssemblyTableKitInput"]'
            );
            const input = cell.getByTestId('InputNumber-Input');
            await input.scrollIntoViewIfNeeded();
            await input.waitFor({ state: 'visible', timeout: 10000 });
            const currentValue = await input.inputValue();
            console.log('К разкомплектовке: ', currentValue);
            await input.fill('1');
            await page.waitForTimeout(2000);
          }
        );

        await allure.step(
          'Step 13: Click on the Disassembly button',
          async () => {
            const disassembleBtn = page.getByTestId(
              'ComplectKit-Modal-UncomplectKit-Bottom-ButtonsCenter-Save'
            );

            await disassembleBtn.scrollIntoViewIfNeeded();
            await disassembleBtn.waitFor({ state: 'visible', timeout: 10000 });
            await expect(disassembleBtn).toBeEnabled();

            // Trial click to detect overlays
            await disassembleBtn.click({ trial: true });
            await disassembleBtn.click();
            await page.waitForTimeout(2000);
          }
        );
      }

      // Log summary of failed requests after all loop iterations
      if (failedRequests.length > 0) {
        logger.info(`\n=== 404 Request Failure Summary ===`);
        logger.info(`Total failed requests: ${failedRequests.length}`);

        // Group by resource type
        const byType = failedRequests.reduce((acc, req) => {
          acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        logger.info(`Failed by type: ${JSON.stringify(byType, null, 2)}`);

        // Show unique URLs (limit to first 10 to avoid spam)
        const uniqueUrls = [...new Set(failedRequests.map(r => r.url))].slice(
          0,
          10
        );
        logger.info(`Sample failed URLs (first 10):`);
        uniqueUrls.forEach(url => logger.info(`  - ${url}`));

        if (failedRequests.length > 10) {
          logger.info(`  ... and ${failedRequests.length - 10} more failures`);
        }
        logger.info(`=====================================\n`);
      }
    }
  });

  test('Test Case 14 - Complete Set Of Cbed After Desassembly', async ({
    //doc test case 9
    page,
  }) => {
    console.log('Test Case 14 - Complete Set Of Cbed After Desassembly');
    test.setTimeout(90000);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(
      page
    );
    const TableComplect = await allure.step(
      'Step 01: Open the warehouse page',
      async () => {
        // Go to the Warehouse page
        await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      }
    );

    await allure.step(
      'Step 02: Open the completion cbed plan page',
      async () => {
        // Find and go to the page using the locator Completing assemblies to plan
        const selector =
          SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
        await completingAssembliesToPlan.findTable(selector);
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 03: Search product', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          // Using table search we look for the value of the variable
          await completingAssembliesToPlan.searchTable(
            cbed.name,
            `table[data-testid="${CONST.TABLE_COMPLECT_TABLE}"]`,
            CONST.COMPLEX_SBORKA_BY_PLAN
          );

          await page.waitForTimeout(1000);
        });

        await allure.step(
          'Step 04: Check the first line in the first row',
          async () => {
            // Check that the first row of the table contains the variable name
            await completingAssembliesToPlan.checkNameInLineFromFirstRow(
              cbed.name,
              //SelectorsAssemblyKittingOnThePlan.TABLE_ASSEMBLY_ON_THE_PLAN
              `table[data-testid="${CONST.TABLE_COMPLECT_TABLE}"]`
            );
          }
        );

        await allure.step(
          'Step 05: Checking the urgency date of an order',
          async () => {
            // Get the value using data-testid directly
            // Pattern: CompletCbed-Content-Table-Table-TableRow{number}-DateUrgency
            // const urgencyDateCell = page
            //   .locator(
            //     '[data-testid^="CompletCbed-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
            //   )
            //   .first(); //ERP-2423
            const urgencyDateCell = page
              .locator(
                SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DATE_URGENCY_PATTERN
              )
              .nth(1);
            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            urgencyDateOnTable = await urgencyDateCell.textContent();

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
            console.log('Дата по срочности в переменной: ', urgencyDate);

            if (urgencyDateOnTable) {
              expect(urgencyDateOnTable.trim()).toBe(urgencyDate);
            } else {
              throw new Error('Urgency date cell not found or empty');
            }
          }
        );

        await allure.step(
          'Step 06: Find the column designation and click',
          async () => {
            // Get the designation cell using data-testid directly
            // Pattern: CompletCbed-Content-Table-Table-TableRow{number}-Designation
            const designationCell = page
              .locator(
                SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN
              )
              .first();

            await designationCell.waitFor({ state: 'visible', timeout: 10000 });
            await designationCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await designationCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            await designationCell.dblclick();
            await page.waitForTimeout(10000);

            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step(
          'Step 07: Checking a checkbox in a modal window',
          async () => {
            await page.waitForTimeout(2000);

            // Check the checkbox in the modal using data-testid
            // Pattern: ModalAddWaybill-ShipmentDetailsTable-Row{number}-SelectCell
            const checkboxCell = page
              .locator(
                SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN
              )
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Click the checkbox cell
            await checkboxCell.click();
            await page.waitForTimeout(500);

            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );

        await allure.step('Step 08: Enter your quantity', async () => {
          // Check the modal window for the delivery note and check the checkbox
          await completingAssembliesToPlan.checkOrderQuantity(
            SelectorsModalWindowConsignmentNote.QUANTITY_INPUT,
            quantityProductLaunchOnProduction,
            incomingQuantity
          );
          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 09: Click on the button to assemble into a set',
          async () => {
            // Click on the button
            await completingAssembliesToPlan.clickButton(
              'Скомплектовать',
              SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
            );
          }
        );

        await allure.step(
          'Step 10: Check close modal window complete set',
          async () => {
            await completingAssembliesToPlan.checkCloseModalWindow(
              SelectorsModalWindowConsignmentNote.MODAL_WINDOW
            );
            // Wait for loading
            await page.waitForLoadState('networkidle');
          }
        );
      }
    }
  });

  test('Test Case 15 - Receiving Part And Check Stock', async ({ page }) => {
    // doc test case 10
    console.log('Test Case 15 - Receiving Part And Check Stock');
    test.setTimeout(900000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const detail of descendantsDetailArray) {
        //  Check the number of parts in the warehouse before posting
        await allure.step(
          'Step 01: Receiving quantities from balances',
          async () => {
            // Receiving quantities from balances
            remainingStockBefore = await stock.checkingTheQuantityInStock(
              detail.name,
              TableSelection.detail
            );
          }
        );

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          // Go to the Warehouse page
          await page.waitForLoadState('networkidle');
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Wait for page to load (don't wait for networkidle as it may never complete)
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1000);

          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          // The findTable method will wait for the element to be visible
          await stockReceipt.findTable(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION
          );

          // Wait a moment for any initial loading to complete
          await page.waitForTimeout(1000);
        });

        await allure.step(
          'Step 04: Checking the main page headings',
          async () => {
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);
            const titles =
              testData1.elements.ArrivalAtTheWarehousePage.titles.map(title =>
                title.trim()
              );
            console.log(titles);
            const h3Titles = await stockReceipt.getAllH3TitlesInClass(
              page,
              'container'
            );
            console.log(h3Titles);

            const normalizedH3Titles = h3Titles.map(title => title.trim());
            console.log(normalizedH3Titles);
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);
          }
        );

        await allure.step(
          'Step 05: Checking the main buttons on the page',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ArrivalAtTheWarehousePage.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;
              const buttonDataTestId = button.datatestid;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const isButtonReady =
                    await stockReceipt.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );
                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 06: Click on the create receipt button',
          async () => {
            // Click on the button
            await stockReceipt.clickButton(
              'Создать приход',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME
            );
          }
        );

        await allure.step(
          'Step 07: Checking buttons on the modalwindow',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ModalWindowSelectSupplier.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonLabel = button.label;
              const buttonDataTestId = button.datatestid;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const isButtonReady =
                    await stockReceipt.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 08: Select the selector in the modal window',
          async () => {
            // Select the selector in the modal window
            await stockReceipt.selectStockReceipt(StockReceipt.metalworking);
            // Waiting for loading
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Wait for the table body to load
            await stockReceipt.waitingTableBody(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
            );
          }
        );

        await allure.step(
          'Step 09: Checking buttons on the modalwindow',
          async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons =
              testData1.elements.ModalWindowCreateReceiptParts.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonDataTestId = button.datatestid;
              const buttonLabel = button.label;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const isButtonReady =
                    await stockReceipt.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );

                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step('Step 10: Search product', async () => {
          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await stockReceipt.searchAndWaitForTable(
            detail.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            { useRedesign: true }
          );
        });

        await allure.step(
          'Step 11: Enter the quantity in the cells',
          async () => {
            // Find the quantity input cell using data-testid pattern
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdInput
            const quantityCell = page
              .locator(
                '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdInput"]'
              )
              .first();

            await quantityCell.waitFor({ state: 'visible', timeout: 10000 });
            await quantityCell.scrollIntoViewIfNeeded();

            // Highlight the cell (td) in yellow first
            await quantityCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '3px solid orange';
              el.style.outline = '2px solid orange';
            });

            console.log(
              'Cell (td) highlighted in yellow/orange. Looking for input field...'
            );

            // Wait a moment to see the cell highlight
            await page.waitForTimeout(1000);

            // Find the input field using data-testid pattern that ends with -TdInput-Input-Input
            // Try to find it within the cell first (more reliable)
            let quantityInput = quantityCell
              .locator('input[data-testid$="-TdInput-Input-Input"]')
              .first();

            // If not found in cell, try page-level search
            const inputFound = await quantityInput
              .waitFor({ state: 'visible', timeout: 2000 })
              .then(() => true)
              .catch(() => false);

            if (!inputFound) {
              console.log(
                'Input not found in cell, trying page-level search...'
              );
              quantityInput = page
                .locator(
                  'input[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdInput-Input-Input"]'
                )
                .first();
            }

            await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
            await quantityInput.scrollIntoViewIfNeeded();

            // Highlight the input element in red to verify we found the correct element
            await quantityInput.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'red';
              el.style.border = '3px solid red';
              el.style.outline = '3px solid red';
              el.style.zIndex = '9999';
            });

            console.log(
              'Input element highlighted in red. Setting quantity value...'
            );

            // Set the quantity value
            const valueToSet = incomingQuantity;
            const currentValue = await quantityInput.inputValue();
            console.log(
              `Current value: "${currentValue}", setting to: "${valueToSet}"`
            );

            // Approach: Double-click cell, clear, type, and blur
            await quantityCell.dblclick();
            await page.waitForTimeout(300);

            await quantityInput.focus();
            await page.waitForTimeout(100);

            // Clear existing value
            await quantityInput.clear();
            await page.waitForTimeout(100);

            // Type the new value
            await quantityInput.type(valueToSet, { delay: 30 });
            await page.waitForTimeout(200);

            // Blur to trigger change
            await quantityInput.blur();
            await page.waitForTimeout(500);

            // Verify the value was set
            const finalValue = await quantityInput.inputValue();
            console.log(
              `Final value: "${finalValue}", expected: "${valueToSet}"`
            );

            if (finalValue !== valueToSet) {
              // Fallback: Try direct JavaScript setting
              console.log('Type() failed, trying direct JavaScript setting...');
              await quantityInput.evaluate(
                (el: HTMLInputElement, val: string) => {
                  el.focus();
                  el.value = val;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                },
                valueToSet
              );

              await quantityInput.blur();
              await page.waitForTimeout(500);

              const retryValue = await quantityInput.inputValue();
              console.log(`After retry, value: "${retryValue}"`);

              if (retryValue !== valueToSet) {
                throw new Error(
                  `Failed to set quantity. Expected: "${valueToSet}", Actual: "${retryValue}"`
                );
              }
            }

            console.log('Quantity successfully set!');
            await page.waitForTimeout(1000);
          }
        );

        await allure.step(
          'Step 12: Find the checkbox column and click',
          async () => {
            // Find the checkbox cell using data-testid pattern
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
            const checkboxCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_CHECKBOX_PATTERN
              )
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click on the checkbox cell
            await checkboxCell.click();
            await page.waitForTimeout(300);
          }
        );

        await allure.step(
          'Step 13: Check that the first row of the table contains the variable name',
          async () => {
            // Check that the first row of the table contains the variable name
            await stockReceipt.checkNameInLineFromFirstRow(
              detail.name,
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
            );
          }
        );

        await allure.step(
          'Step 14: Click on the add receipt button on the modal window',
          async () => {
            // Wait for the Добавить button to become enabled and click it
            const addButton = page.getByTestId(
              'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Button-Add'
            );

            await addButton.scrollIntoViewIfNeeded();
            // Wait for button to be enabled (may take time after quantity is entered)
            await expect(addButton).toBeEnabled({ timeout: 15000 });
            await addButton.click();
            await page.waitForTimeout(500);
          }
        );

        await allure.step('Step 15a: Check the modal window', async () => {
          // Click on the Создать button
          await stockReceipt.clickButton(
            'Создать',
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE
          );
        });

        await allure.step(
          'Step 15b: Check the number of parts in the warehouse after posting',
          async () => {
            // Check the number of parts in the warehouse after posting
            remainingStockAfter = await stock.checkingTheQuantityInStock(
              detail.name,
              TableSelection.detail
            );
          }
        );

        await allure.step(
          'Step 16: Compare the quantity in cells',
          async () => {
            // Compare the quantity in cells
            expect(Number(remainingStockAfter)).toBe(
              Number(remainingStockBefore) + Number(incomingQuantity)
            );

            // Output to the console
            console.log(
              `Количество ${detail.name} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
            );
          }
        );
      }
    }
  });

  test('Test Case 16 - Receiving Cbed And Check Stock', async ({
    // doc test case 11
    page,
  }) => {
    console.log('Test Case 16 - Receiving Cbed And Check Stock');
    test.setTimeout(900000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step(
          'Step 01: Receiving quantities from balances',
          async () => {
            console.log(cbed.name);
            // Check the number of entities in the warehouse before posting
            remainingStockBefore = await stock.checkingTheQuantityInStock(
              cbed.name,
              TableSelection.cbed
            );
          }
        );

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          console.log('Step 02: Open the warehouse page');
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          console.log('Step 03: Open the stock receipt page');
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          await stockReceipt.findTable(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 04: Click on the create receipt button',
          async () => {
            console.log('Step 04: Click on the create receipt button');
            // Click on the button
            await stockReceipt.clickButton(
              'Создать приход',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME
            );
          }
        );

        await allure.step(
          'Step 05: Select the selector in the modal window',
          async () => {
            console.log('Step 05: Select the selector in the modal window');
            // Select the selector in the modal window
            await stockReceipt.selectStockReceipt(StockReceipt.cbed);
            // Waiting for loading
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Wait for the table body to load
            await stockReceipt.waitingTableBody(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
            );
          }
        );

        await allure.step('Step 06: Search product', async () => {
          console.log('Step 06: Search product');
          // Using table search we look for the value of the variable
          await stockReceipt.searchTable(
            cbed.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
          );
        });

        await allure.step(
          'Step 07: Find the checkbox column and click',
          async () => {
            console.log('Step 07: Find the checkbox column and click');
            // Find the checkbox cell using data-testid pattern
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
            const checkboxCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_CHECKBOX_PATTERN
              )
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.outline = '2px solid red';
            });

            console.log('Checkbox cell highlighted. Clicking checkbox...');

            // Click the checkbox
            await checkboxCell.click();
            await page.waitForTimeout(500);
          }
        );
        await allure.step(
          'Step 07a: Find the Кол-во на приход column and click',
          async () => {
            console.log('Step 07a: Find the Кол-во на приход column and click');
            // Ensure the main modal is visible first
            const mainModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN
            );
            await mainModal.waitFor({ state: 'visible', timeout: 10000 });

            // Find the Кол-во на приход cell using data-testid pattern
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdParish
            const prihodQuantityCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN
              )
              .first();

            await prihodQuantityCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await prihodQuantityCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await prihodQuantityCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.outline = '2px solid red';
            });

            console.log(
              'prihodQuantityCell cell highlighted. Clicking link...'
            );

            // Click the cell to open the Completed sets modal
            await prihodQuantityCell.click();
            await page.waitForTimeout(500);
            // Wait for the Completed sets modal to appear
            const completedSetsModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST
            );
            await completedSetsModal.waitFor({
              state: 'visible',
              timeout: 10000,
            });
          }
        );
        await allure.step(
          'Step 08: Checking the main page headings',
          async () => {
            console.log('Step 08: Checking the main page headings');
            const titles = testData1.elements.ModalWindowCompletSets.titles.map(
              title => title.trim()
            );
            const h3Titles = await stockReceipt.getAllH4TitlesInModalByTestId(
              page,
              'ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList'
            );
            const normalizedH3Titles = h3Titles.map(title => title.trim());

            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            // Log for debugging
            console.log('Expected Titles:', titles);
            console.log('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content - handle dynamic order number and date in title
            for (let i = 0; i < titles.length; i++) {
              const expectedTitle = titles[i];
              const receivedTitle = normalizedH3Titles[i];

              expect(receivedTitle).toBe(expectedTitle);
            }
          }
        );

        await allure.step(
          'Step 09: Checking the main buttons on the page',
          async () => {
            console.log('Step 09: Checking the main buttons on the page');
            // Wait for the page to stabilize
            await page.waitForLoadState('networkidle');

            const buttons = testData1.elements.ModalWindowCompletSets.buttons;
            // Iterate over each button in the array
            for (const button of buttons) {
              // Extract the class, label, and state from the button object
              const buttonClass = button.class;
              const buttonDataTestId = button.datatestid;
              const buttonLabel = button.label;
              const expectedState = button.state === 'true' ? true : false;

              // Perform the validation for the button
              await allure.step(
                `Validate button with label: "${buttonLabel}"`,
                async () => {
                  // Check if the button is visible and enabled

                  const isButtonReady =
                    await stockReceipt.isButtonVisibleTestId(
                      page,
                      buttonDataTestId,
                      buttonLabel,
                      expectedState
                    );
                  await page.waitForTimeout(1000);
                  // Validate the button's visibility and state
                  expect(isButtonReady).toBeTruthy();
                  console.log(
                    `Is the "${buttonLabel}" button visible and enabled?`,
                    isButtonReady
                  );
                }
              );
            }
          }
        );

        await allure.step(
          'Step 10: Check the modal window Completed sets',
          async () => {
            console.log('Step 10: Check the modal window Completed sets');
            // Ensure the Completed sets modal is visible
            const completedSetsModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST
            );
            await completedSetsModal.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            // Check the modal window Completed sets
            await stockReceipt.completesSetsModalWindow();
            await stockReceipt.waitingTableBody(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST_TABLE
            );
          }
        );

        await allure.step(
          'Step 11: We get the cell number with a checkmark',
          async () => {
            // Ensure the Completed sets modal is still visible
            const completedSetsModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST
            );
            await completedSetsModal.waitFor({
              state: 'visible',
              timeout: 10000,
            });

            const headerRowCell = page
              .locator(
                'table[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table"] thead tr th input'
              )
              .first();

            await headerRowCell.waitFor({ state: 'visible', timeout: 10000 });
            await headerRowCell.scrollIntoViewIfNeeded();

            // Check if the input is already checked
            const isChecked = await headerRowCell.isChecked();
            if (!isChecked) {
              await headerRowCell.click();
            } else {
              console.log('Checkbox is already checked, skipping click');
            }
          }
        );

        await allure.step(
          'Step 12: Enter the quantity in the cells',
          async () => {
            console.log('Step 12: Enter the quantity in the cells');
            // Enter the value into the input cell

            const inputlocator =
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;

            await page
              .locator(inputlocator)
              .nth(0)
              .waitFor({ state: 'visible' });

            // Проверяем, что элемент не заблокирован
            const isDisabled = await page
              .locator(inputlocator)
              .nth(0)
              .getAttribute('disabled');
            if (isDisabled) {
              throw new Error('Элемент заблокирован для ввода.');
            }
            const quantityPerShipment = await page
              .locator(inputlocator)
              .nth(0)
              .getAttribute('value');
            console.log('Кол-во на отгрузку: ', quantityPerShipment);
            await page.locator(inputlocator).nth(0).fill('1');
            await page.locator(inputlocator).nth(0).press('Enter');
          }
        );

        await allure.step(
          'Step 13: Click on the choice button on the modal window',
          async () => {
            console.log(
              'Step 13: Click on the choice button on the modal window'
            );
            // Click on the button
            await stockReceipt.clickButton(
              'Сохранить',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE
            );
          }
        );

        await allure.step(
          'Step 14: Check that the first row of the table contains the variable name',
          async () => {
            console.log(
              'Step 14: Check that the first row of the table contains the variable name'
            );
            // Wait for the table body to load
            const tableSelectedItems =
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;
            await stockReceipt.waitingTableBody(tableSelectedItems);

            // Check that the first row of the table contains the variable name
            await stockReceipt.checkNameInLineFromFirstRow(
              cbed.name,
              tableSelectedItems
            );
          }
        );
        await allure.step(
          'Step 15a: Click on the Добавить button on the modal window',
          async () => {
            console.log(
              'Step 15: Click on the create receipt button on the modal window'
            );
            // Click on the button
            await stockReceipt.clickButton(
              'Добавить',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD
            );
          }
        );
        await allure.step(
          'Step 15: Click on the create receipt button on the modal window',
          async () => {
            console.log(
              'Step 15: Click on the create receipt button on the modal window'
            );
            // Click on the button
            await stockReceipt.clickButton(
              'Создать',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE
            );
            // Wait for modal to close and page to stabilize
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
            // Ensure the modal is closed before proceeding
            const modal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN
            );
            await modal
              .waitFor({ state: 'hidden', timeout: 10000 })
              .catch(() => {});
          }
        );

        await allure.step(
          'Step 16: Check the number of parts in the warehouse after posting',
          async () => {
            console.log(
              'Step 16: Check the number of parts in the warehouse after posting'
            );
            // Checking the remainder of the entity after capitalization
            remainingStockAfter = await stock.checkingTheQuantityInStock(
              cbed.name,
              TableSelection.cbed
            );
          }
        );

        await allure.step(
          'Step 17: Compare the quantity in cells',
          async () => {
            console.log('Step 17: Compare the quantity in cells');
            // Compare the quantity in cells
            expect(Number(remainingStockAfter)).toBe(
              Number(remainingStockBefore) + Number(incomingQuantity)
            );

            // Output to the console
            console.log(
              `Количество ${cbed.name} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
            );
          }
        );
        // await page.goto(ENV.BASE_URL);
        // await page.waitForTimeout(2000);
      }
    }
  });

  test('Test Case 17 - Complete Set Of Product', async ({ page }) => {
    // doc test case 12
    console.log('Test Case 17 - Complete Set Of Product');
    test.setTimeout(90000);
    const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
      page
    );
    const tableComplect = PartsDBSelectors.SCROLL_WRAPPER_SLOT;
    const tableMainTable =
      SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION;

    await allure.step(
      'Step 01-02: Open the warehouse page and completion product plan page',
      async () => {
        // Find and go to the page using the locator Complete set of Products on the plan
        const selector =
          SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_PRODUCT_PLAN;
        await completingProductsToPlan.navigateToPageAndWaitForTable(
          SELECTORS.MAINMENU.WAREHOUSE.URL,
          selector,
          tableMainTable
        );
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.EquipmentOfProductsOnThePlan.titles.map(
        title => title.trim()
      );
      const h3Titles = await completingProductsToPlan.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    // await allure.step( // buttons removed in new design
    //   'Step 04: Checking the main buttons on the page',
    //   async () => {
    //     // Wait for the page to stabilize
    //     await page.waitForLoadState('networkidle');

    //     const buttons = testData1.elements.EquipmentOfProductsOnThePlan.buttons;
    //     // Iterate over each button in the array
    //     for (const button of buttons) {
    //       // Extract the class, label, and state from the button object
    //       const buttonClass = button.class;
    //       const buttonLabel = button.label;

    //       // Perform the validation for the button
    //       await allure.step(
    //         `Validate button with label: "${buttonLabel}"`,
    //         async () => {
    //           // Check if the button is visible and enabled

    //           const isButtonReady =
    //             await completingProductsToPlan.isButtonVisible(
    //               page,
    //               buttonClass,
    //               buttonLabel
    //             );

    //           // Validate the button's visibility and state
    //           expect(isButtonReady).toBeTruthy();
    //           console.log(
    //             `Is the "${buttonLabel}" button visible and enabled?`,
    //             isButtonReady
    //           );
    //         }
    //       );
    //     }
    //   }
    // );

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await completingProductsToPlan.searchTable(
        nameProduct,
        tableMainTable,
        SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_SEARCH_INPUT
      );

      // Wait for the table body to load
      await completingProductsToPlan.waitingTableBody(tableMainTable);
    });

    await allure.step(
      'Step 06: Check the first line in the first row',
      async () => {
        // Check that the first row of the table contains the variable name
        await completingProductsToPlan.checkNameInLineFromFirstRow(
          nameProduct,
          tableMainTable
        );
      }
    );

    await allure.step(
      'Step 07: Checking the urgency date of an order',
      async () => {
        // Get the value using data-testid directly
        // Pattern: CompletIzd-Content-Table-Table-TableRow{number}-DateUrgency
        // const urgencyDateCell = page
        //   .locator(
        //     '[data-testid^="CompletIzd-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
        //   )
        //   .first();
        const urgencyDateCell = page
          .locator(
            SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DATE_URGENCY_PATTERN
          )
          .nth(1); //          ERP-2423

        await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
        await urgencyDateCell.scrollIntoViewIfNeeded();

        // Highlight the cell for visual confirmation
        await urgencyDateCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        });

        urgencyDateOnTable = await urgencyDateCell.textContent();
        if (urgencyDateOnTable) {
          urgencyDateOnTable = urgencyDateOnTable.trim();
        } else {
          throw new Error('Urgency date cell not found or empty');
        }

        console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
        console.log('Дата по срочности в переменной: ', urgencyDate);

        expect(urgencyDateOnTable).toBe(urgencyDate); //
      }
    );

    await allure.step(
      'Step 08: Find the column designation and click',
      async () => {
        // Get the designation cell using data-testid directly
        // Pattern: CompletIzd-Content-Table-Table-TableRow{number}-Designation
        const designationCell = page
          .locator(
            SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DESIGNATION_PATTERN
          )
          .first();

        await designationCell.waitFor({ state: 'visible', timeout: 10000 });
        await designationCell.scrollIntoViewIfNeeded();

        // Highlight the cell for visual confirmation
        await designationCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        });

        // Get the text content for verification
        const designationText = await designationCell.textContent();
        console.log(`Проверка текста ${designationText?.trim() || ''}`);

        // Double-click the designation cell
        await designationCell.dblclick();

        // Wait for loading
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step(
      'Step 09: Check the modal window for the delivery note and check the checkbox',
      async () => {
        // Check the modal window for the delivery note and check the checkbox
        await completingProductsToPlan.assemblyInvoiceModalWindow(
          TypeInvoice.product,
          true,
          '1'
        );

        // Wait for loading
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step(
      'Step 10: Click on the button to assemble into a set',
      async () => {
        // Click on the button
        await completingProductsToPlan.clickButton(
          'Скомплектовать',
          SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
        );

        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Wait for the table body to load
        await completingProductsToPlan.waitingTableBody(tableMainTable);
      }
    );
  });

  test('Test Case 18 - Receiving Product And Check Stock', async ({ page }) => {
    // doc test case 13
    console.log('Test Case 18 - Receiving Product And Check Stock');
    test.setTimeout(90000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);
    const tableStockRecieptModalWindow =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_MODAL_COMING_SCROLL;
    const tableComplectsSets =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_REMAINING_PRODUCTS;

    await allure.step(
      'Step 01: Receiving quantities from balances',
      async () => {
        // Check the number of entities in the warehouse before posting
        remainingStockBefore = await stock.checkingTheQuantityInStock(
          nameProduct,
          TableSelection.product
        );
      }
    );

    // Capitalization of the entity
    await allure.step('Step 02: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 03: Open the stock receipt page', async () => {
      // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
      const selector =
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
      await stockReceipt.findTable(selector);

      // Waiting for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step(
      'Step 04: Click on the create receipt button',
      async () => {
        // Click on the button
        await stockReceipt.clickButton(
          'Создать приход',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME
        );
      }
    );

    await allure.step(
      'Step 05: Select the selector in the modal window',
      async () => {
        // Select the selector in the modal window
        await stockReceipt.selectStockReceipt(StockReceipt.cbed);
        // Waiting for loading
        await page.waitForLoadState('networkidle');

        // Wait for the table body to load
        await stockReceipt.waitingTableBodyNoThead(
          //tableStockRecieptModalWindow
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
        );
      }
    );

    await allure.step('Step 06: Search product', async () => {
      // Using table search we look for the value of the variable
      await stockReceipt.searchTable(
        nameProduct,
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT
      );

      // Waiting for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await stockReceipt.waitingTableBodyNoThead(
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE
      );
    });

    await allure.step(
      'Step 07: Find the checkbox column and click',
      async () => {
        // Click the header checkbox using direct data-testid
        const headerCheckbox = page.getByTestId(
          'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-HeadRow-Checkbox-Wrapper-Checkbox'
        );

        // Wait for the checkbox to be visible
        await headerCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        await headerCheckbox.scrollIntoViewIfNeeded();

        // Highlight the checkbox for debugging
        await headerCheckbox.evaluate(el => {
          (el as HTMLElement).style.outline = '3px solid red';
        });
        await page.waitForTimeout(500);

        // Check if the checkbox is already checked
        const isChecked = await headerCheckbox.isChecked();
        if (!isChecked) {
          await headerCheckbox.click();
          console.log('Header checkbox clicked');
        } else {
          console.log('Header checkbox is already checked, skipping click');
        }
      }
    );
    await allure.step('Step 07a: Click the parish cell link', async () => {
      // Click the parish cell (data-testid ends with -TdParish) in the first row
      const parishCell = page
        .locator(
          '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdParish"]'
        )
        .first();

      await parishCell.waitFor({ state: 'visible', timeout: 10000 });
      await parishCell.scrollIntoViewIfNeeded();

      // Prefer inner link/button if present
      const inner = parishCell.locator('a, [role="link"], button');
      const hasInner = await inner
        .first()
        .isVisible()
        .catch(() => false);
      if (hasInner) {
        await inner.first().click();
      } else {
        await parishCell.click();
      }

      await page.waitForTimeout(300);
    });
    await allure.step(
      'Step 08: Check the modal window Completed sets',
      async () => {
        // Check the modal window Completed sets
        await stockReceipt.completesSetsModalWindow();
        await stockReceipt.waitingTableBody(
          'table[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table"]'
        );
      }
    );

    await allure.step(
      'Step 09: We get the cell number with a checkmark',
      async () => {
        // Click the first row checkbox using direct data-testid pattern
        const firstRowCheckbox = page
          .locator(
            '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row"][data-testid$="-Checkbox-Wrapper-Checkbox"]'
          )
          .first();

        // Wait for the checkbox to be visible
        await firstRowCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        await firstRowCheckbox.scrollIntoViewIfNeeded();

        // Highlight the checkbox for debugging
        await firstRowCheckbox.evaluate(el => {
          (el as HTMLElement).style.outline = '3px solid red';
        });
        await page.waitForTimeout(500);

        // Check if the checkbox is already checked
        const isChecked = await firstRowCheckbox.isChecked();
        if (!isChecked) {
          await firstRowCheckbox.click();
          console.log('First row checkbox clicked');
        } else {
          console.log('First row checkbox is already checked, skipping click');
        }
      }
    );

    await allure.step('Step 10: Enter the quantity in the cells', async () => {
      // Enter the value into the input cell
      const inputlocator =
        'input[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row"][data-testid$="-TdCount-Label-Input-Input"]';
      await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

      // Проверяем, что элемент не заблокирован
      const isDisabled = await page
        .locator(inputlocator)
        .nth(0)
        .getAttribute('disabled');
      if (isDisabled) {
        throw new Error('Элемент заблокирован для ввода.');
      }
      const quantityPerShipment = await page
        .locator(inputlocator)
        .nth(0)
        .getAttribute('value');
      console.log('Кол-во на отгрузку: ', quantityPerShipment);
      await page.locator(inputlocator).nth(0).fill('1');
      await page.locator(inputlocator).nth(0).press('Enter');
    });

    await allure.step(
      'Step 11: Click on the choice button on the modal window',
      async () => {
        console.log('Step 11: Click on the choice button on the modal window');
        // Click on the button
        await stockReceipt.clickButton(
          'Сохранить',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE
        );
      }
    );

    // await allure.step(
    //   'Step 12: Check that the first row of the table contains the variable name',
    //   async () => {
    //     // Wait for the table body to load
    //     const tableSelectedItems =
    //       '[data-testid="ModalComing-SelectedItems-ScladTable"]';
    //     await stockReceipt.waitingTableBody(tableSelectedItems);

    //     // Check that the first row of the table contains the variable name
    //     await stockReceipt.checkNameInLineFromFirstRow(
    //       nameProduct,
    //       tableSelectedItems
    //     );
    //   }
    // );
    await allure.step(
      'Step 14: Check that the first row of the table contains the variable name',
      async () => {
        console.log(
          'Step 14: Check that the first row of the table contains the variable name'
        );
        // Wait for the table body to load
        const tableSelectedItems =
          '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table"]';
        await stockReceipt.waitingTableBody(tableSelectedItems);

        // Check that the first row of the table contains the variable name
        await stockReceipt.checkNameInLineFromFirstRow(
          nameProduct,
          tableSelectedItems
        );
      }
    );
    await allure.step(
      'Step 12a: Click on the Добавить button on the modal window',
      async () => {
        console.log(
          'Step 15: Click on the create receipt button on the modal window'
        );
        // Click on the button
        await stockReceipt.clickButton(
          'Добавить',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD
        );
      }
    );
    await allure.step(
      'Step 15: Click on the create receipt button on the modal window',
      async () => {
        console.log(
          'Step 15: Click on the create receipt button on the modal window'
        );
        // Click on the button
        await stockReceipt.clickButton(
          'Создать',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE
        );
        // Wait for modal to close and page to stabilize
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        // Ensure the modal is closed before proceeding
        const modal = page.locator(
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN
        );
        await modal
          .waitFor({ state: 'hidden', timeout: 10000 })
          .catch(() => {});
      }
    );

    await allure.step(
      'Step 16: Check the number of parts in the warehouse after posting',
      async () => {
        console.log(
          'Step 16: Check the number of parts in the warehouse after posting'
        );
        // Checking the remainder of the entity after capitalization
        remainingStockAfter = await stock.checkingTheQuantityInStock(
          nameProduct,
          TableSelection.product
        );
      }
    );

    // await allure.step('Step 15: Compare the quantity in cells', async () => {
    //   // Compare the quantity in cells
    //   expect(Number(remainingStockAfter)).toBe(
    //     Number(remainingStockBefore) + Number(incomingQuantity)
    //   );

    //   // Output to the console
    //   console.log(
    //     `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
    //       `оприходовали в количестве: ${incomingQuantity}, ` +
    //       `и после оприходования: ${remainingStockAfter}.`
    //   );
    // });
    await allure.step('Step 18: Compare the quantity in cells', async () => {
      console.log('Step 18: Compare the quantity in cells');
      // Compare the quantity in cells
      expect(Number(remainingStockAfter)).toBe(
        Number(remainingStockBefore) + Number(incomingQuantity)
      );

      // Output to the console
      console.log(
        `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
          `оприходовали в количестве: ${incomingQuantity}, ` +
          `и после оприходования: ${remainingStockAfter}.`
      );
    });
  });

  test('Test Case 19 - Uploading Shipment Task', async ({ page }) => {
    // doc test case 14
    console.log('Test Case 19 - Uploading Shipment Task');
    test.setTimeout(90000);
    const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
      page
    );
    let numberColumn: number;

    await allure.step(
      'Step 01-02: Open the warehouse page and warehouse shipping task page',
      async () => {
        // Find and go to the page using the locator Склад: Задачи на отгрузку
        const selector = SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS;
        await warehouseTaskForShipment.navigateToPageAndWaitForTable(
          SELECTORS.MAINMENU.WAREHOUSE.URL,
          selector,
          tableMainUploading
        );
        await page.waitForTimeout(500);
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.WarehouseLoadingTasks.titles.map(
        title => title.trim()
      );
      const h3Titles = await warehouseTaskForShipment.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.WarehouseLoadingTasks.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled

              const isButtonReady =
                await warehouseTaskForShipment.isButtonVisible(
                  page,
                  buttonClass,
                  buttonLabel,
                  expectedState
                );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await warehouseTaskForShipment.searchAndWaitForTable(
        nameProduct,
        tableMainUploading,
        tableMainUploading,
        { useRedesign: true, timeoutBeforeWait: 1000 }
      );
    });

    await allure.step(
      'Step 06: Check that the first row of the table contains the variable name',
      async () => {
        // Check that the first row of the table contains the variable name
        await warehouseTaskForShipment.checkNameInLineFromFirstRow(
          nameProduct,
          tableMainUploading
        );
      }
    );

    await allure.step(
      'Step 07: Find the checkbox column and click',
      async () => {
        // Click the first row cell using direct data-testid pattern
        const firstRowCell = page
          .locator(SelectorsShipmentTasks.ROW_NUMBER_PATTERN)
          .first();

        // Wait for the cell to be visible
        await firstRowCell.waitFor({ state: 'visible', timeout: 10000 });
        await firstRowCell.scrollIntoViewIfNeeded();

        // Highlight the cell for debugging
        await firstRowCell.evaluate(el => {
          (el as HTMLElement).style.outline = '3px solid red';
        });
        await page.waitForTimeout(500);

        // Click the cell
        await firstRowCell.click();
        console.log('First row cell clicked');
      }
    );

    await allure.step('Step 08: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
      // Wait for the page to stabilize
      await page.waitForTimeout(1000);
    });

    await allure.step(
      'Step 09: Checking the modalwindow headings',
      async () => {
        const titles = testData1.elements.ModalWindowUploadingTask.titles.map(
          title => title.trim()
        );
        const h3Titles =
          await warehouseTaskForShipment.getAllH3TitlesInModalClassNew(
            page,
            '[data-testid^="IssueToPull-ShipmentDetails-ModalShComlit"][data-testid$="ModalContent"]'
          );
        const normalizedH3Titles = h3Titles.map(title => title.trim());

        // Log for debugging
        console.log('Expected Titles:', titles);
        console.log('Received Titles:', normalizedH3Titles);

        // Validate length
        expect(normalizedH3Titles.length).toBe(titles.length);

        // Validate content and order
        expect(normalizedH3Titles).toEqual(titles);
      }
    );

    await allure.step(
      'Step 10: Checking buttons on the modalwindow',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.ModalWindowUploadingTask.buttons;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled

              const isButtonReady =
                await warehouseTaskForShipment.isButtonVisible(
                  page,
                  buttonClass,
                  buttonLabel,
                  expectedState
                );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 11: Check the Shipping modal window', async () => {
      // Check the Shipping modal window
      await warehouseTaskForShipment.shipmentModalWindow();
    });

    await allure.step('Step 12: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton(
        'Отгрузить',
        SelectorsWarehouseTaskForShipment.BUTTON_SHIP
      );
    });
  });

  test('Test Case 20 - Checking the number of shipped entities', async ({
    // doc test case 15
    page,
  }) => {
    console.log('Test Case 20 - Checking the number of shipped entities');
    test.setTimeout(90000);
    const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
      page
    );
    let numberColumn: number;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await warehouseTaskForShipment.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the warehouse shipping task page',
      async () => {
        // Find and go to the page using the locator Склад: Задачи на отгрузку
        const selector = SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS;
        await warehouseTaskForShipment.findTable(selector);

        // Wait for loading
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Wait for the table body to load
        await warehouseTaskForShipment.waitingTableBody(tableMainUploading);
      }
    );

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable

      await warehouseTaskForShipment.searchAndWaitForTable(
        nameProduct,
        tableMainUploading,
        tableMainUploading,
        { useRedesign: true, timeoutBeforeWait: 1000 }
      );
    });

    await allure.step(
      'Step 04: Check that the first row of the table contains the variable name',
      async () => {
        // Check that the first row of the table contains the variable name
        await warehouseTaskForShipment.checkNameInLineFromFirstRow(
          nameProduct,
          tableMainUploading
        );
      }
    );

    await allure.step(
      'Step 05: Find the checkbox column and click',
      async () => {
        // console.log("numberColumn: ", numberColumn);
        await warehouseTaskForShipment.getValueOrClickFromFirstRow(
          tableMainUploading,
          2,
          Click.Yes,
          Click.No
        );
      }
    );

    await allure.step('Step 06: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
    });

    await allure.step(
      'Step 07: Checking the number of shipped entities',
      async () => {
        const tableBody = SelectorsWarehouseTaskForShipment.TABLE_SCROLL;
        await warehouseTaskForShipment.waitingTableBody(tableBody);

        // Find the shipped quantity cell using data-testid
        const shippedCell = page
          .locator(SelectorsWarehouseTaskForShipment.TABLE_BODY_SHIPPED)
          .first();

        await shippedCell.waitFor({ state: 'visible', timeout: 10000 });
        await shippedCell.scrollIntoViewIfNeeded();

        // Highlight the shipped quantity cell
        await shippedCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcyan';
          el.style.border = '2px solid blue';
        });

        // Get the shipped quantity value from the cell
        const shippedValue = await shippedCell.textContent();
        const valueInShipped = shippedValue?.trim() || '';

        console.log('Shipped quantity: ', valueInShipped);

        expect
          .soft(Number(valueInShipped))
          .toBe(
            Number(quantityProductLaunchOnProduction) - Number(incomingQuantity)
          );
      }
    );
  });

  test('Test Case 21 - Loading The Second Task', async ({ page }) => {
    // doc test case 16
    console.log('Test Case 21 - Loading The Second Task');
    test.setTimeout(90000);
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 02: Click on the Create order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton(
        'Создать заказ',
        LoadingTasksSelectors.buttonCreateOrder
      );
    });

    await allure.step('Step 03: Click on the Select button', async () => {
      // Click on the button
      await page
        .locator(LoadingTasksSelectors.buttonChoiceIzd, {
          hasText: 'Выбрать',
        })
        .nth(0)
        .click();

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 04: Search product on modal window', async () => {
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expect(modalWindow).toBeVisible();

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameProduct);

      expect(await searchTable.inputValue()).toBe(nameProduct);
      await searchTable.press('Enter');

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 05: Choice product in modal window', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0);

      await loadingTaskPage.waitForTimeout(1000);
    });

    await allure.step(
      'Step 06: Click on the Select button on modal window',
      async () => {
        // Click on the button
        await loadingTaskPage.clickButton(
          'Добавить',
          LoadingTasksSelectors.buttonChoiceIzd
        );
      }
    );

    await allure.step('Step 07: Checking the selected product', async () => {
      // Check that the selected product displays the expected product
      await loadingTaskPage.checkProduct(nameProduct);
      await loadingTaskPage.waitForTimeout(500);
    });

    await allure.step('Step 08: Selecting a buyer', async () => {
      await loadingTaskPage.clickButton(
        'Выбрать',
        LoadingTasksSelectors.buttonChoiceBuyer
      );

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 09: Check modal window Company', async () => {
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expect(modalWindow).toBeVisible();

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameBuyer);

      expect(await searchTable.inputValue()).toBe(nameBuyer);
      await searchTable.press('Enter');

      await page.waitForTimeout(500);

      await loadingTaskPage.clickFromFirstRowBug(
        '.table-yui-kit__border.table-yui-kit-with-scroll',
        0
      );
    });

    await allure.step(
      'Step 10: Click on the Select button on modal window',
      async () => {
        // Click on the button
        await loadingTaskPage.clickButton(
          'Добавить',
          LoadingTasksSelectors.buttonAddBuyerOnModalWindow
        );
      }
    );
    await allure.step(
      'Step 11: We set the date according to urgency',
      async () => {
        console.log('Step 11: We set the date according to urgency');
        await page.locator(LoadingTasksSelectors.calendarTrigger).click();
        await page.locator(LoadingTasksSelectors.calendarPopover).isVisible();

        // Scope to the calendar component
        const calendar = page.locator(LoadingTasksSelectors.calendarComponent);

        // Open the years popup by clicking the header year button
        const yearButton = calendar
          .locator('button[id^="open-years-popup"]')
          .first();
        await yearButton.waitFor({ state: 'visible' });
        await yearButton.click();

        // Scope to the open years popover
        const yearsPopover = page
          .locator('wa-popover[for^="open-years-popup"][open]')
          .first();
        await yearsPopover.waitFor({ state: 'visible' });

        // Select target year directly inside the open years popover
        const targetYear = 2025;
        // Some builds render part="year " (with a trailing space) — use starts-with selector
        const yearCell = yearsPopover
          .locator('[part^="year"]', { hasText: String(targetYear) })
          .first();
        await yearCell.waitFor({ state: 'visible', timeout: 10000 });
        await yearCell.click();

        // Verify selection reflects on the header year button
        const finalYearText = ((await yearButton.textContent()) || '').trim();
        expect(parseInt(finalYearText, 10)).toBe(targetYear);
        // Open months popup and select January
        const monthButton = calendar
          .locator('button[id^="open-months-popup"]')
          .first();
        await monthButton.waitFor({ state: 'visible' });
        await monthButton.click();

        const monthsPopover = page
          .locator('wa-popover[for^="open-months-popup"][open]')
          .first();
        await monthsPopover.waitFor({ state: 'visible' });
        // Click January (Month 1, index 1)
        const januaryCell = monthsPopover.locator('div[part^="month"]').nth(1);
        await januaryCell.waitFor({ state: 'visible' });
        await januaryCell.click({ force: true });
        // Wait for month button to show "Янв" to confirm selection
        await monthButton.waitFor({ state: 'visible' });
        await page.waitForTimeout(1000); // Give time for the selection to register

        // Pick the day 21 in January 2025 by aria-label
        await calendar
          .locator('button[role="gridcell"][aria-label="January 21st, 2025"]')
          .first()
          .click();
      }
    );

    await allure.step('Step 12: Click on the save order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton(
        'Сохранить',
        LoadingTasksSelectors.buttonSaveOrder
      );
    });

    await allure.step('Step 13: Checking the ordered quantity', async () => {
      await page.waitForTimeout(3000);
      const orderNumber = await loadingTaskPage.getOrderInfoFromLocator(
        '.add-order-component'
      );
      console.log('orderNumber: ', orderNumber);
    });
  });
  const descendantsDetailArray = [
    {
      name: '0Т4.21',
      designation: '-',
      quantity: 1,
    },
    {
      name: '0Т4.22',
      designation: '-',
      quantity: 1,
    },
  ];
  test('Test Case 22 - Marking Parts', async ({ page }) => {
    // doc test case 17
    console.log('Test Case 22 - Marking Parts');
    test.setTimeout(90000);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const tableMetalworkingWarehouse =
      '[data-testid="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table"]';
    const productionTable = ProductionPathSelectors.OPERATION_TABLE;
    let numberColumnQunatityMade: number;
    let firstOperation: string;
    const operationTable = 'OperationPathInfo-Table';
    const tableMain = '#tablebody';

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the metalworking warehouse page',
      async () => {
        // Find and go to the page using the locator Order a warehouse for Metalworking
        const selector =
          MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
        await metalworkingWarehouse.findTable(selector);
      }
    );

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      console.log(
        'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD: ' +
          JSON.stringify(descendantsDetailArray, null, 2)
      );
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        console.log('LOOOOOOOOOOOOOP');
        await allure.step('Step 03: Search product', async () => {
          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
          );

          await page.waitForTimeout(500);
          // Using table search we look for the value of the variable
          // await metalworkingWarehouse.searchTable(
          //     part.name,
          //     tableMetalworkingWarehouse
          // );
          const table = page.locator(tableMetalworkingWarehouse);
          const searchTable = table
            .locator(
              MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_SEARCH_INPUT_LOCATOR
            )
            .nth(0);

          // Clear the input field first
          await searchTable.clear();
          await searchTable.fill(part.name);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          expect(await searchTable.inputValue()).toBe(part.name);
          await searchTable.press('Enter');

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(
            tableMetalworkingWarehouse
          );
        });

        await allure.step(
          'Step 04: Check the checkbox in the first column',
          async () => {
            await page.waitForTimeout(500);
            // Check that the first row of the table contains the variable name
            await metalworkingWarehouse.checkNameInLineFromFirstRow(
              part.name,
              tableMetalworkingWarehouse
            );

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(
              tableMetalworkingWarehouse
            );
          }
        );

        await allure.step(
          'Step 05: Checking the urgency date of an order',
          async () => {
            // Get the value using data-testid directly
            // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-DateByUrgency
            const urgencyDateCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-DateByUrgency"]'
              )
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            urgencyDateOnTable = await urgencyDateCell.textContent();
            if (urgencyDateOnTable) {
              urgencyDateOnTable = urgencyDateOnTable.trim();
            }

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
            console.log('Дата по срочности в переменной: ', urgencyDateSecond);

            expect(urgencyDateOnTable).toBe(urgencyDateSecond);
          }
        );

        await allure.step(
          'Step 06: We check the number of those launched into production',
          async () => {
            // Get the value using data-testid directly
            // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-Ordered
            const orderedCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-Ordered"]'
              )
              .first();

            await orderedCell.waitFor({ state: 'visible', timeout: 10000 });
            await orderedCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await orderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            quantityProductLaunchOnProductionBefore =
              (await orderedCell.textContent()) || '0';
            quantityProductLaunchOnProductionBefore =
              quantityProductLaunchOnProductionBefore.trim();

            console.log(
              'The value in the cells is orders befor:',
              quantityProductLaunchOnProductionBefore
            );

            expect
              .soft(Number(quantityProductLaunchOnProductionBefore))
              .toBe(Number(quantityProductLaunchOnProduction) - 1);
          }
        );

        await allure.step(
          'Step 07: Find and click on the operation icon',
          async () => {
            // Get the operations cell using data-testid directly
            // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-Operations
            const operationsCell = page
              .locator(
                '[data-testid^="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row"][data-testid$="-Operations"]'
              )
              .first();

            await operationsCell.waitFor({ state: 'visible', timeout: 10000 });
            await operationsCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await operationsCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click the operations cell directly
            await operationsCell.click();
            console.log('Operation cell clicked');

            // Waiting for loading
            await page.waitForLoadState('networkidle');
          }
        );

        // await allure.step(
        //     "Step 08: Check the production path modal window ",
        //     async () => {
        //         // Check the production path modal window
        //         // await page.waitForTimeout(500)

        //         // Wait for the table body to load

        //         // await metalworkingWarehouse.waitingTableBody(
        //         //     productionTable
        //         // );
        //     }
        // );

        await allure.step(
          'Step 09: We find, get the value and click on the cell done pcs',
          async () => {
            await page.waitForTimeout(1000);
            // Get the done/made cell using data-testid directly
            // Pattern: OperationPathInfo-tbodysdelano-sh{number}
            const doneCell = page
              .locator(ProductionPathSelectors.OPERATION_ROW_DONE_PATTERN)
              .first();

            await doneCell.waitFor({ state: 'visible', timeout: 10000 });
            await doneCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await doneCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click on the Done cell
            await doneCell.click();
          }
        );

        await allure.step(
          'Step 10: Find and get the value from the operation cell',
          async () => {
            // Get the operation cell using data-testid directly
            const operationCell = page
              .locator(ProductionPathSelectors.OPERATION_ROW_FULL_NAME)
              .first();

            await operationCell.waitFor({ state: 'visible', timeout: 10000 });
            await operationCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await operationCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the operation value from the cell
            const operationValue = await operationCell.textContent();
            firstOperation = operationValue?.trim() || '';

            console.log(firstOperation);
            logger.info(firstOperation);
          }
        );

        await allure.step('Step 11: Click on the add mark button', async () => {
          // Click on the button
          await metalworkingWarehouse.clickButton(
            'Добавить отметку',
            MarkOfCompletionSelectors.BUTTON_ADD_MARK
          );

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 12: Checking the modal window and marking completion',
          async () => {
            // Check the progress check modal window
            await metalworkingWarehouse.completionMarkModalWindow(
              firstOperation,
              part.name,
              part.designation
            );
          }
        );

        // await allure.step(
        //   'Step 13: Click on the Save order button',
        //   async () => {
        //     // Click on the button
        //     await metalworkingWarehouse.clickButton(
        //       'Сохранить',
        //       '[data-testid="ModalMark-Button-Save"]'
        //     );
        //   }
        // );

        await allure.step(
          'Step 14: Closing a modal window by clicking on the logo',
          async () => {
            // Press Escape key to close the modal window
            await page.waitForTimeout(1000);
            await page.waitForLoadState('networkidle');
            await page.keyboard.press('Escape');

            // Wait for the table body to load
            await metalworkingWarehouse.waitingTableBody(
              tableMetalworkingWarehouse
            );
            await page.waitForTimeout(5000);
          }
        );
      }
    }
  });

  test('Test Case 23 - Checking new date by urgency', async ({ page }) => {
    // doc test case 18
    console.log('Test Case 23 - Checking new date by urgency');
    test.setTimeout(90000);
    // Проверка изделия на дату по срочности
    const shortageProduct = new CreateShortageProductPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
      await shortageProduct.findTable(selector);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(
        nameProduct,
        deficitTable,
        deficitTable,
        { useRedesign: true }
      );
    });

    await allure.step(
      'Step 04: Check the checkbox in the first column',
      async () => {
        // Check that the first row of the table contains the variable name
        await shortageProduct.checkNameInLineFromFirstRow(
          nameProduct,
          deficitTable
        );

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);
      }
    );

    await allure.step(
      'Step 05: Checking the urgency date of an order',
      async () => {
        // Find the urgency date cell using data-testid
        const urgencyDateCell = page
          .locator(SelectorsShortagePages.ROW_DATE_URGENCY)
          .first();

        await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
        await urgencyDateCell.scrollIntoViewIfNeeded();

        // Highlight the urgency date cell
        await urgencyDateCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightyellow';
          el.style.border = '2px solid orange';
        });

        // Get the urgency date value from the cell
        const urgencyDateValue = await urgencyDateCell.textContent();
        urgencyDateOnTable = urgencyDateValue?.trim() || '';

        console.log('Date by urgency in the table: ', urgencyDateOnTable);

        expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
      }
    );

    // Checking the board for urgency of assembly
    const shortageAssemblies = new CreatShortageAssembliesPage(page);

    await allure.step('Step 06: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 07: Open the shortage assemblies page',
      async () => {
        // Find and go to the page using the locator shortage assemblies
        const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
        await shortageAssemblies.findTable(selector);
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 08: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(deficitTableCbed);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            deficitTableCbed,
            deficitTableCbed,
            { useRedesign: true }
          );

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step(
          'Step 09: Check the checkbox in the first column',
          async () => {
            // Check that the first row of the table contains the variable name
            await shortageProduct.checkNameInLineFromFirstRow(
              cbed.name,
              deficitTableCbed
            );

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTableCbed);
          }
        );

        await allure.step(
          'Step 10: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_URGENCY_DATE)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDateSecond);
          }
        );
      }
    }

    // Проверка на дату по срочности деталей
    const shortageParts = new CreatShortagePartsPage(page);

    await allure.step('Step 11: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 12: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 13: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(
            part.name,
            deficitTableDetail,
            deficitTableDetail,
            { useRedesign: true, timeoutBeforeWait: 1000 }
          );
        });

        await allure.step(
          'Step 14: Check the checkbox in the first column',
          async () => {
            // Check that the first row of the table contains the variable name
            await shortageProduct.checkNameInLineFromFirstRow(
              part.name,
              deficitTableDetail
            );

            // Wait for the table body to load
            await shortageProduct.waitingTableBody(deficitTableDetail);
          }
        );

        await allure.step(
          'Step 15: Check that the first row of the table contains the variable name',
          async () => {
            // Find the checkbox using data-testid (starts with pattern)
            const checkboxCell = page
              .locator(SelectorsShortagePages.ROW_CHECKBOX_PATTERN)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageParts.waitingTableBody(deficitTableDetail);
          }
        );

        await allure.step(
          'Step 16: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid (starts with pattern)
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.ROW_DATE_URGENCY_PATTERN)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDateSecond);
          }
        );
      }
    }
  });

  test('Test Case 24 - Receiving Part And Check Stock', async ({ page }) => {
    // doc test case 19
    console.log('Test Case 24 - Receiving Part And Check Stock');
    test.setTimeout(90000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);
    const tableStockRecieptModalWindow =
      // '[data-testid="ModalComingTable-TableScroll"]';
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table"]';

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const detail of descendantsDetailArray) {
        //  Check the number of parts in the warehouse before posting
        await allure.step(
          'Step 01: Receiving quantities from balances',
          async () => {
            // Receiving quantities from balances
            remainingStockBefore = await stock.checkingTheQuantityInStock(
              detail.name,
              TableSelection.detail
            );
          }
        );

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          const selectorstockReceipt =
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
          await stockReceipt.findTable(selectorstockReceipt);
          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 04: Click on the create receipt button',
          async () => {
            // Click on the button
            await stockReceipt.clickButton(
              'Создать приход',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME
            );
          }
        );

        await allure.step(
          'Step 05: Select the selector in the modal window',
          async () => {
            // Select the selector in the modal window
            await stockReceipt.selectStockReceipt(StockReceipt.metalworking);
            // Waiting for loading
            await page.waitForLoadState('networkidle');

            // Wait for the table body to load
            await stockReceipt.waitingTableBodyNoThead(
              tableStockRecieptModalWindow
            );
          }
        );

        await allure.step('Step 06: Search product', async () => {
          // Using table search we look for the value of the variable
          await page.waitForTimeout(500);
          await stockReceipt.searchTable(
            detail.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT
          );
          // Waiting for loading
          await page.waitForTimeout(500);
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(
            tableStockRecieptModalWindow
          );
        });

        await allure.step(
          'Step 07: Enter the quantity in the cells',
          async () => {
            // Enter the quantity in the cells
            await stockReceipt.inputQuantityInCell(incomingQuantity);
          }
        );

        await allure.step(
          'Step 08: Find the checkbox column and click',
          async () => {
            // Click the header checkbox using direct data-testid
            const headerCheckbox = page.getByTestId(
              'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-HeadRow-Checkbox-Wrapper-Checkbox'
            );

            // Wait for the checkbox to be visible
            await headerCheckbox.waitFor({ state: 'visible', timeout: 10000 });
            await headerCheckbox.scrollIntoViewIfNeeded();

            // Highlight the checkbox for debugging
            await headerCheckbox.evaluate(el => {
              (el as HTMLElement).style.outline = '3px solid red';
            });
            await page.waitForTimeout(500);

            // Check if the checkbox is already checked
            const isChecked = await headerCheckbox.isChecked();
            if (!isChecked) {
              await headerCheckbox.click();
              console.log('Header checkbox clicked');
            } else {
              console.log('Header checkbox is already checked, skipping click');
            }
          }
        );

        // await allure.step(
        //   'Step 09: Check that the first row of the table contains the variable name',
        //   async () => {
        //     // Check that the first row of the table contains the variable name
        //     await stockReceipt.checkNameInLineFromFirstRow(
        //       detail.name,
        //       '[data-testid="ModalComing-SelectedItems-TableScroll"]'
        //     );
        //   }
        // );
        await allure.step(
          'Step 09: Check that the first row of the table contains the variable name',
          async () => {
            console.log(
              'Step 09: Check that the first row of the table contains the variable name'
            );
            // Wait for the table body to load
            const tableSelectedItems =
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;
            await stockReceipt.waitingTableBody(tableSelectedItems);

            // Check that the first row of the table contains the variable name
            await stockReceipt.checkNameInLineFromFirstRow(
              detail.name,
              tableSelectedItems
            );
          }
        );
        await allure.step(
          'Step 9a: Click on the Добавить button on the modal window',
          async () => {
            console.log(
              'Step 15: Click on the create receipt button on the modal window'
            );
            // Click on the button
            await stockReceipt.clickButton(
              'Добавить',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD
            );
          }
        );
        await allure.step(
          'Step 10: Click on the create receipt button on the modal window',
          async () => {
            // Wait for the Create button to become enabled (may take time after quantity is entered)
            const createButton = page.getByTestId(
              'ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Create'
            );
            await createButton.scrollIntoViewIfNeeded();
            await expect(createButton).toBeEnabled({ timeout: 15000 });

            // Click on the button
            await stockReceipt.clickButton(
              'Создать',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE
            );
          }
        );

        await allure.step(
          'Step 11: Check the number of parts in the warehouse after posting',
          async () => {
            // Check the number of parts in the warehouse after posting
            remainingStockAfter = await stock.checkingTheQuantityInStock(
              detail.name,
              TableSelection.detail
            );
          }
        );

        await allure.step(
          'Step 12: Compare the quantity in cells',
          async () => {
            // Compare the quantity in cells
            expect(Number(remainingStockAfter)).toBe(
              Number(remainingStockBefore) + Number(incomingQuantity)
            );

            // Output to the console
            console.log(
              `Количество ${detail.name} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
            );
          }
        );
      }
    }
  });

  test('Test Case 25 - Receiving Cbed And Check Stock', async ({ page }) => {
    // doc test case 20
    console.log('Test Case 25 - Receiving Cbed And Check Stock');
    test.setTimeout(900000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(
      page
    );
    const tableStockRecieptModalWindow =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_MODAL_COMING_SCROLL;
    const tableComplectsSets =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step(
          'Step 01: Receiving quantities from balances',
          async () => {
            // Check the number of entities in the warehouse before posting
            remainingStockBefore = await stock.checkingTheQuantityInStock(
              cbed.name,
              TableSelection.cbed
            );
          }
        );

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          const selectorstockReceipt =
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
          await stockReceipt.findTable(selectorstockReceipt);

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step(
          'Step 04: Click on the create receipt button',
          async () => {
            // Click on the button
            await stockReceipt.clickButton(
              'Создать приход',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_RECEIPT
            );
          }
        );

        await allure.step(
          'Step 05: Select the selector in the modal window',
          async () => {
            // Select the selector in the modal window
            await stockReceipt.selectStockReceipt(StockReceipt.cbed);
            // Waiting for loading
            await page.waitForLoadState('networkidle');

            // Wait for the table body to load
            await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
          }
        );

        await allure.step('Step 06: Search product', async () => {
          // Using table search we look for the value of the variable
          await stockReceipt.searchTable(
            cbed.name,
            tableComplectsSets,
            'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input'
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
        });

        await allure.step(
          'Step 06a: Check Кол-во на приход value and complete assembly kitting if needed',
          async () => {
            // Find the Кол-во на приход cell (TdParish) to check its value
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdParish
            const prihodQuantityCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN
              )
              .first();

            await prihodQuantityCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await prihodQuantityCell.scrollIntoViewIfNeeded();

            // Get the value from the cell
            const prihodValue = await prihodQuantityCell.textContent();
            const prihodQuantity = prihodValue?.trim() || '0';
            console.log(`Кол-во на приход value: ${prihodQuantity}`);

            // If the value is 0, we need to complete assembly kitting
            if (prihodQuantity === '0' || prihodQuantity === '') {
              console.log(
                'Кол-во на приход is 0, completing assembly kitting in new tab...'
              );

              // Create a new page/tab to perform assembly kitting without losing current context
              const newPage = await page.context().newPage();
              const newCompletingAssembliesToPlan =
                new CreateCompletingAssembliesToPlanPage(newPage);

              try {
                // Navigate to warehouse page in the new tab
                await newCompletingAssembliesToPlan.goto(
                  SELECTORS.MAINMENU.WAREHOUSE.URL
                );

                // Open the assembly kitting page
                const selector =
                  SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
                await newCompletingAssembliesToPlan.findTable(selector);
                await newPage.waitForLoadState('networkidle');

                // Search for the CBED
                await newCompletingAssembliesToPlan.searchTable(
                  cbed.name,
                  `table[data-testid="${CONST.TABLE_COMPLECT_TABLE}"]`,
                  CONST.COMPLEX_SBORKA_BY_PLAN
                );
                await newPage.waitForTimeout(1000);
                await newPage.waitForLoadState('networkidle');

                // Double-click the designation cell to open the waybill modal
                const designationCell = newPage
                  .locator(
                    SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN
                  )
                  .first();
                await designationCell.waitFor({
                  state: 'visible',
                  timeout: 10000,
                });
                await designationCell.scrollIntoViewIfNeeded();
                await designationCell.dblclick();
                await newPage.waitForLoadState('networkidle');
                await newPage.waitForTimeout(1500);

                // Wait for the modal to appear
                const waybillModal = newPage.locator(
                  SelectorsModalWindowConsignmentNote.MODAL_WINDOW
                );
                await waybillModal.waitFor({
                  state: 'visible',
                  timeout: 10000,
                });

                // Check the checkbox in the modal
                const checkboxCell = newPage
                  .locator(
                    SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN
                  )
                  .first();
                await checkboxCell.waitFor({
                  state: 'visible',
                  timeout: 10000,
                });
                await checkboxCell.scrollIntoViewIfNeeded();
                await checkboxCell.click();
                await newPage.waitForTimeout(500);
                await newPage.waitForLoadState('networkidle');

                // Verify the "Скомплектовать" button is enabled before clicking
                const completeButton = newPage.locator(
                  SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
                );
                await completeButton.waitFor({
                  state: 'visible',
                  timeout: 10000,
                });
                await expect(completeButton).toBeEnabled({ timeout: 5000 });
                console.log('Скомплектовать button is enabled, clicking...');

                // Click the "Скомплектовать" button
                await newCompletingAssembliesToPlan.clickButton(
                  'Скомплектовать',
                  SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
                );

                // Wait for modal to close using the proper check function
                await newCompletingAssembliesToPlan.checkCloseModalWindow(
                  SelectorsModalWindowConsignmentNote.MODAL_WINDOW
                );
                await newPage.waitForLoadState('networkidle');
                await newPage.waitForTimeout(2000);

                console.log(`Assembly kitting completed for ${cbed.name}`);
              } finally {
                // Close the new tab and return to the original page
                await newPage.close();
                console.log('New tab closed, returning to original page');
                // Wait for the server to process the kitting
                await page.waitForTimeout(3000);
              }

              // Wait for data to propagate - poll the quantity until it updates
              console.log(
                'Waiting for kitting to propagate and refresh search...'
              );
              let updatedPrihodQuantity = '0';
              const maxRetries = 100;
              let retryCount = 0;

              while (
                (updatedPrihodQuantity === '0' ||
                  updatedPrihodQuantity === '') &&
                retryCount < maxRetries
              ) {
                retryCount++;
                console.log(
                  `Waiting for quantity update, attempt ${retryCount}/${maxRetries}...`
                );

                // Wait with increasing delay on each retry
                await page.waitForTimeout(2000 + retryCount * 1000);

                // Close the modal by clicking Cancel to force fresh data load
                console.log('Closing modal to refresh data...');
                const cancelButton = page.locator(
                  SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CANCEL
                );
                if (await cancelButton.isVisible().catch(() => false)) {
                  await cancelButton.click();
                  await page.waitForLoadState('networkidle');
                  await page.waitForTimeout(1000);
                }

                // Click Сборка button in the small modal to reopen the main modal
                console.log('Clicking Сборка button in small modal...');
                await stockReceipt.selectStockReceipt(StockReceipt.cbed);
                await page.waitForLoadState('networkidle');
                await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

                // Re-search to refresh the table data
                await stockReceipt.searchTable(
                  cbed.name,
                  tableComplectsSets,
                  'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input'
                );
                await page.waitForLoadState('networkidle');
                await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

                // Check the updated quantity
                const updatedPrihodQuantityCell = page
                  .locator(
                    SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN
                  )
                  .first();
                await updatedPrihodQuantityCell.waitFor({
                  state: 'visible',
                  timeout: 10000,
                });
                const updatedPrihodValue =
                  await updatedPrihodQuantityCell.textContent();
                updatedPrihodQuantity = updatedPrihodValue?.trim() || '0';
                console.log(
                  `Кол-во на приход after kitting (attempt ${retryCount}): ${updatedPrihodQuantity}`
                );
              }

              if (
                updatedPrihodQuantity === '0' ||
                updatedPrihodQuantity === ''
              ) {
                throw new Error(
                  `Assembly kitting completed but Кол-во на приход is still 0 for ${cbed.name} after ${maxRetries} attempts. Please check manually.`
                );
              }

              // Wait a bit after successful update to ensure UI is stable
              await page.waitForTimeout(1000);
            } else {
              console.log(
                `Кол-во на приход is ${prihodQuantity}, no assembly kitting needed`
              );
            }
          }
        );

        await allure.step(
          'Step 06b: Click on Кол-во на приход cell to open Скомплектованные наборы modal',
          async () => {
            // Find the Кол-во на приход cell (TdParish) and click it to open the modal
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdParish
            const prihodQuantityCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN
              )
              .first();

            await prihodQuantityCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await prihodQuantityCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await prihodQuantityCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Click on the cell to open the Скомплектованные наборы modal
            await prihodQuantityCell.click();
            await page.waitForTimeout(1000);
            await page.waitForLoadState('networkidle');

            // Wait for the Скомплектованные наборы modal to appear
            const completedSetsModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST
            );
            await completedSetsModal.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            console.log('Скомплектованные наборы modal opened');
          }
        );

        await allure.step(
          'Step 06c: Check that the modal window Скомплектованные наборы is displayed and wait for input field',
          async () => {
            // Verify the modal is visible
            await stockReceipt.completesSetsModalWindow();
            await page.waitForTimeout(1000);

            // Wait directly for the input field to be available
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
            const inputlocator =
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;
            await page
              .locator(inputlocator)
              .first()
              .waitFor({ state: 'visible', timeout: 15000 });
            console.log('Кол-во на отгрузку input field is visible');
          }
        );

        await allure.step(
          'Step 06d: Enter quantity in Кол-во на отгрузку input field',
          async () => {
            // Find the Кол-во на отгрузку input field in the modal
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
            const inputlocator =
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;

            // Get the input field (it should already be visible from Step 06c)
            const quantityInput = page.locator(inputlocator).first();
            await quantityInput.scrollIntoViewIfNeeded();
            await quantityInput.scrollIntoViewIfNeeded();

            // Highlight the input field for visual confirmation
            await quantityInput.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '3px solid red';
              el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
            });
            await page.waitForTimeout(500); // Pause to see the highlight

            // Check that the element is not disabled
            const isDisabled = await quantityInput.getAttribute('disabled');
            if (isDisabled) {
              throw new Error('Элемент заблокирован для ввода.');
            }

            // Get the current value
            const quantityPerShipment = await quantityInput.getAttribute(
              'value'
            );
            console.log(
              'Кол-во на отгрузку current value: ',
              quantityPerShipment
            );

            // Enter the quantity (using incomingQuantity variable)
            await quantityInput.fill(incomingQuantity);
            await page.waitForTimeout(300);
            await quantityInput.press('Enter');
            await page.waitForTimeout(500);
            await page.waitForLoadState('networkidle');
            console.log(`Кол-во на отгрузку set to: ${incomingQuantity}`);
          }
        );

        await allure.step(
          'Step 06e: Click the save button in Скомплектованные наборы modal',
          async () => {
            // Click the Сохранить button (this is the save button in the modal)
            await stockReceipt.clickButton(
              'Сохранить',
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE
            );
            // Wait for modal to close and return to main table
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
            console.log('Сохранить button clicked, modal closed');
          }
        );

        await allure.step(
          'Step 06f: Check the checkbox in the first row',
          async () => {
            // Find the checkbox cell using data-testid pattern
            // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
            const checkboxCell = page
              .locator(
                SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_CHECKBOX_PATTERN
              )
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the cell for visual confirmation
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
              el.style.color = 'blue';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox has the disabled attribute and cannot be checked.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();

            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }
          }
        );

        await allure.step(
          'Step 06g: Click on the Добавить button to add item to selected items bottom table',
          async () => {
            // Wait for the Добавить button to become enabled and click it
            const addButton = page.getByTestId(
              'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Button-Add'
            );

            await addButton.scrollIntoViewIfNeeded();
            // Wait for button to be enabled
            await expect(addButton).toBeEnabled({ timeout: 15000 });
            await addButton.click();
            await page.waitForTimeout(500);
            await page.waitForLoadState('networkidle');
            console.log(
              'Добавить button clicked - item added to selected items'
            );
          }
        );

        await allure.step(
          'Step 07: Wait for table body and check that the first row contains the variable name',
          async () => {
            // Wait a bit for the UI to update after clicking Добавить
            await page.waitForTimeout(1000);
            await page.waitForLoadState('networkidle');

            // Try to find the selected items table
            const tableSelectedItems =
              '[data-testid="ModalComing-SelectedItems-ScladTable"]';
            const isTableVisible = await page
              .locator(tableSelectedItems)
              .isVisible()
              .catch(() => false);

            if (isTableVisible) {
              // Wait for table body to load
              await stockReceipt.waitingTableBody(tableSelectedItems);

              // Check that the first row of the table contains the variable name
              await stockReceipt.checkNameInLineFromFirstRow(
                cbed.name,
                tableSelectedItems
              );
              console.log('Item verified in selected items table');
            } else {
              console.log(
                'Selected items table not visible, proceeding to create receipt'
              );
            }
          }
        );

        await allure.step(
          'Step 08: Click on the Создать button to create the receipt',
          async () => {
            // Wait for the Создать button to be available
            const createButton = page.getByTestId(
              'ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Create'
            );
            await createButton.waitFor({ state: 'visible', timeout: 15000 });
            await createButton.scrollIntoViewIfNeeded();

            // Check that the button is enabled
            await expect(createButton).toBeEnabled({ timeout: 10000 });

            // Click on the button
            await createButton.click();

            // Wait for the receipt to be created
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            console.log('Создать button clicked - receipt created');
          }
        );

        await allure.step(
          'Step 09: Check the number of parts in the warehouse after posting',
          async () => {
            // Checking the remainder of the entity after capitalization
            remainingStockAfter = await stock.checkingTheQuantityInStock(
              cbed.name,
              TableSelection.cbed
            );
          }
        );

        await allure.step(
          'Step 10: Compare the quantity in cells',
          async () => {
            // Compare the quantity in cells
            expect(Number(remainingStockAfter)).toBe(
              Number(remainingStockBefore) + Number(incomingQuantity)
            );

            // Output to the console
            console.log(
              `Количество ${cbed.name} на складе до оприходования: ${remainingStockBefore}, ` +
                `оприходовали в количестве: ${incomingQuantity}, ` +
                `и после оприходования: ${remainingStockAfter}.`
            );
          }
        );

        // await allure.step(
        //   'Step 06c: Find and click on the operation cell to mark operations',
        //   async () => {
        //     // Get the operations cell using data-testid pattern
        //     // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-Operations
        //     const operationsCell = page
        //       .locator(
        //         '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-Operations"]'
        //       )
        //       .first();

        //     await operationsCell.waitFor({ state: 'visible', timeout: 10000 });
        //     await operationsCell.scrollIntoViewIfNeeded();

        //     // Highlight the cell for visual confirmation
        //     await operationsCell.evaluate((el: HTMLElement) => {
        //       el.style.backgroundColor = 'yellow';
        //       el.style.border = '2px solid red';
        //       el.style.color = 'blue';
        //     });

        //     // Click the operations cell to mark operations (required before quantity input becomes available)
        //     await operationsCell.click();
        //     console.log('Operation cell clicked to mark operations');

        //     // Waiting for loading
        //     await page.waitForLoadState('networkidle');
        //     await page.waitForTimeout(500);
        //   }
        // );

        // await allure.step(
        //   'Step 06d: Enter the quantity in the main table cells',
        //   async () => {
        //     // Enter the quantity in the cells (required before checkbox can be enabled)
        //     await stockReceipt.inputQuantityInCell(incomingQuantity);
        //   }
        // );

        // await allure.step(
        //   'Step 07: Find the checkbox column and click',
        //   async () => {
        //     // Find the checkbox cell using data-testid pattern
        //     // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
        //     const checkboxCell = page
        //       .locator(
        //         '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdCheckbox"]'
        //       )
        //       .first();

        //     await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        //     await checkboxCell.scrollIntoViewIfNeeded();

        //     // Highlight the cell for visual confirmation
        //     await checkboxCell.evaluate((el: HTMLElement) => {
        //       el.style.backgroundColor = 'yellow';
        //       el.style.border = '2px solid red';
        //       el.style.color = 'blue';
        //     });

        //     // Click on the checkbox cell
        //     await checkboxCell.click();
        //     await page.waitForTimeout(300);
        //   }
        // );
        ////////////////
        // await allure.step(
        //   'Step 08: Check the modal window Completed sets',
        //   async () => {
        //     // Check the modal window Completed sets
        //     await stockReceipt.completesSetsModalWindow();
        //     await stockReceipt.waitingTableBody(
        //       '[data-testid="ModalKitsList-HiddenContent"]'
        //     );
        //   }
        // );
        // await allure.step(
        //   'Step 08: Check the modal window Completed sets',
        //   async () => {
        //     // Check the modal window Completed sets
        //     await stockReceipt.completesSetsModalWindow();
        //     await stockReceipt.waitingTableBody(
        //       'table[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table"]'
        //     );
        //   }
        // );

        // await allure.step(
        //   'Step 09: We get the cell number with a checkmark',
        //   async () => {
        //     // Find the checkbox cell using data-testid pattern
        //     // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
        //     const checkboxCell = page
        //       .locator(
        //         '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdCheckbox"]'
        //       )
        //       .first();

        //     await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        //     await checkboxCell.scrollIntoViewIfNeeded();

        //     // Highlight the cell for visual confirmation
        //     await checkboxCell.evaluate((el: HTMLElement) => {
        //       el.style.backgroundColor = 'yellow';
        //       el.style.border = '2px solid red';
        //       el.style.color = 'blue';
        //     });

        //     // Find the actual checkbox input inside the cell
        //     const checkbox = checkboxCell.getByRole('checkbox').first();

        //     // Check if the checkbox is disabled
        //     const isDisabled = await checkbox.isDisabled();
        //     if (isDisabled) {
        //       throw new Error(
        //         'Cannot check the checkbox. Checkbox has the disabled attribute and cannot be checked.'
        //       );
        //     }

        //     // Check if the checkbox is already checked
        //     const isChecked = await checkbox.isChecked();

        //     if (!isChecked) {
        //       console.log('Checkbox is not checked, attempting to check it...');
        //       await checkbox.click();
        //       await page.waitForTimeout(300);

        //       // Verify the checkbox is now checked
        //       const isCheckedAfter = await checkbox.isChecked();
        //       if (!isCheckedAfter) {
        //         throw new Error(
        //           'Failed to check the checkbox. Checkbox remains unchecked after click.'
        //         );
        //       }
        //       console.log('Checkbox successfully checked');
        //     } else {
        //       console.log('Checkbox is already checked, skipping click');
        //     }
        //   }
        // );

        // await allure.step(
        //   'Step 10: Enter the quantity in the cells',
        //   async () => {
        //     // Enter the value into the input cell
        //     await page.waitForTimeout(500);
        //     const inputlocator =
        //       '[data-testid^="ModalKitsList-TableRow-QuantityInputField"]';

        //     await page
        //       .locator(inputlocator)
        //       .nth(0)
        //       .waitFor({ state: 'visible' });

        //     // Проверяем, что элемент не заблокирован
        //     const isDisabled = await page
        //       .locator(inputlocator)
        //       .nth(0)
        //       .getAttribute('disabled');
        //     if (isDisabled) {
        //       throw new Error('Элемент заблокирован для ввода.');
        //     }
        //     const quantityPerShipment = await page
        //       .locator(inputlocator)
        //       .nth(0)
        //       .getAttribute('value');
        //     console.log('Кол-во на отгрузку: ', quantityPerShipment);
        //     await page.locator(inputlocator).nth(0).fill('1');
        //     await page.locator(inputlocator).nth(0).press('Enter');
        //   }
        // );

        // await allure.step(
        //   'Step 11: Click on the choice button on the modal window',
        //   async () => {
        //     // Click on the button
        //     await stockReceipt.clickButton(
        //       ' Выбрать ',
        //       '[data-testid="ModalKitsList-SelectButton"]'
        //     );
        //   }
        // );

        // await allure.step(
        //   'Step 12: Check that the first row of the table contains the variable name',
        //   async () => {
        //     // Wait for the table body to load
        //     const tableSelectedItems =
        //       '[data-testid="ModalComing-SelectedItems-ScladTable"]';
        //     await stockReceipt.waitingTableBody(tableSelectedItems);

        //     // Check that the first row of the table contains the variable name
        //     await stockReceipt.checkNameInLineFromFirstRow(
        //       cbed.name,
        //       tableSelectedItems
        //     );
        //   }
        // );

        // await allure.step(
        //   'Step 13: Click on the create receipt button on the modal window',
        //   async () => {
        //     // Click on the button
        //     await stockReceipt.clickButton(
        //       ' Создать приход ',
        //       '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
        //     );
        //   }
        // );

        // await allure.step(
        //   'Step 14: Check the number of parts in the warehouse after posting',
        //   async () => {
        //     // Checking the remainder of the entity after capitalization
        //     remainingStockAfter = await stock.checkingTheQuantityInStock(
        //       cbed.name,
        //       TableSelection.cbed
        //     );
        //   }
        // );

        // await allure.step(
        //   'Step 15: Compare the quantity in cells',
        //   async () => {
        //     // Compare the quantity in cells
        //     expect(Number(remainingStockAfter)).toBe(
        //       Number(remainingStockBefore) + Number(incomingQuantity)
        //     );

        //     // Output to the console
        //     console.log(
        //       `Количество ${cbed.name} на складе до оприходования: ${remainingStockBefore}, ` +
        //         `оприходовали в количестве: ${incomingQuantity}, ` +
        //         `и после оприходования: ${remainingStockAfter}.`
        //     );
        //   }
        // );
      }
    }
  });

  test('Test Case 26 - Complete Set Of Product', async ({ page }) => {
    // doc test case 21
    console.log('Test Case 26 - Complete Set Of Product');
    test.setTimeout(90000);
    const completingProductsToPlan = new CreateCompletingProductsToPlanPage(
      page
    );
    const TableComplect = 'table[data-testid="CompletIzd-Content-Table-Table"]';

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completingProductsToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the completion product plan page',
      async () => {
        // Find and go to the page using the locator Complete set of Products on the plan
        const selector =
          SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_PRODUCT_PLAN;
        await completingProductsToPlan.findTable(selector);

        // Wait for the table body to load
        await completingProductsToPlan.waitingTableBody(TableComplect);
      }
    );

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await completingProductsToPlan.searchTable(
        nameProduct,
        TableComplect,
        SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_SEARCH_INPUT
      );

      // Wait for the table body to load
      await completingProductsToPlan.waitingTableBody(TableComplect);
    });

    await allure.step(
      'Step 04: Check the first line in the first row',
      async () => {
        // Check that the first row of the table contains the variable name
        await completingProductsToPlan.checkNameInLineFromFirstRow(
          nameProduct,
          TableComplect
        );
      }
    );

    await allure.step(
      'Step 05: Find the column designation and click',
      async () => {
        // Find the designation cell using modern data-testid pattern
        // Pattern: CompletIzd-Content-Table-Table-TableRow{id}-Designation
        const designationCell = page
          .locator(
            SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DESIGNATION_PATTERN
          )
          .first();

        await designationCell.waitFor({ state: 'visible', timeout: 10000 });
        await designationCell.scrollIntoViewIfNeeded();

        // Highlight the designation cell
        await designationCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightblue';
          el.style.border = '2px solid blue';
        });

        // Get the text content for verification
        const test = await designationCell.textContent();
        console.log(`Проверка текста ${test}`);

        // Double-click the designation cell to open the modal
        await designationCell.dblclick();

        // Wait for loading
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      }
    );

    await allure.step(
      'Step 06: Check the modal window for the delivery note and check the checkbox',
      async () => {
        // Check the modal window for the delivery note and check the checkbox
        await completingProductsToPlan.assemblyInvoiceModalWindow(
          TypeInvoice.product,
          true,
          '1'
        );

        // Wait for loading
        await page.waitForLoadState('networkidle');
      }
    );

    await allure.step(
      'Step 07: Click on the button to assemble into a set',
      async () => {
        // Click on the button
        await completingProductsToPlan.clickButton(
          'Скомплектовать',
          SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
        );

        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Wait for the table body to load
        await completingProductsToPlan.waitingTableBody(TableComplect);
      }
    );
  });

  test('Test Case 27 - Receiving Product And Check Stock', async ({ page }) => {
    // doc test case 22
    console.log('Test Case 27 - Receiving Product And Check Stock');
    test.setTimeout(90000);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );
    const stock = new CreateStockPage(page);
    const tableStockRecieptModalWindow =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_MODAL_COMING_SCROLL;
    const tableComplectsSets =
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;

    await allure.step(
      'Step 01: Receiving quantities from balances',
      async () => {
        // Check the number of entities in the warehouse before posting
        remainingStockBefore = await stock.checkingTheQuantityInStock(
          nameProduct,
          TableSelection.product
        );
      }
    );

    // Capitalization of the entity
    await allure.step('Step 02: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 03: Open the stock receipt page', async () => {
      // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
      const selector =
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
      await stockReceipt.findTable(selector);

      // Waiting for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step(
      'Step 04: Click on the create receipt button',
      async () => {
        // Click on the button
        await stockReceipt.clickButton(
          'Создать приход',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_RECEIPT
        );
      }
    );

    await allure.step(
      'Step 05: Select the selector in the modal window',
      async () => {
        // Select the selector in the modal window
        await stockReceipt.selectStockReceipt(StockReceipt.cbed);
        // Waiting for loading
        await page.waitForLoadState('networkidle');

        // Wait for the table body to load
        await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
      }
    );

    await allure.step('Step 06: Search product', async () => {
      // Using table search we look for the value of the variable
      await stockReceipt.searchTable(
        nameProduct,
        tableComplectsSets,
        'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input'
      );

      // Waiting for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
    });

    await allure.step(
      'Step 06a: Check Кол-во на приход value and complete product kitting if needed',
      async () => {
        // Check the value in the Кол-во на приход cell (TdParish)
        const parishCell = page
          .locator(
            '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdParish"]'
          )
          .first();

        await parishCell.waitFor({ state: 'visible', timeout: 10000 });
        await parishCell.scrollIntoViewIfNeeded();

        // Highlight the cell for visual confirmation
        await parishCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });

        // Check the value in the cell
        const parishValue = await parishCell.textContent();
        const parishQuantity = parishValue?.trim() || '0';
        console.log(`Кол-во на приход value: ${parishQuantity}`);

        // If the value is 0, we need to complete product kitting
        if (parishQuantity === '0' || parishQuantity === '') {
          console.log(
            'Кол-во на приход is 0, completing product kitting in new tab...'
          );

          // Create a new page/tab to perform product kitting without losing current context
          const newPage = await page.context().newPage();
          const newCompletingProductsToPlan =
            new CreateCompletingProductsToPlanPage(newPage);

          try {
            // Navigate to warehouse page in the new tab
            await newCompletingProductsToPlan.goto(
              SELECTORS.MAINMENU.WAREHOUSE.URL
            );

            // Open the product kitting page
            const selector =
              SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_PRODUCT_PLAN;
            await newCompletingProductsToPlan.findTable(selector);
            await newPage.waitForLoadState('networkidle');

            // Search for the product
            await newCompletingProductsToPlan.searchTable(
              nameProduct,
              'table[data-testid="CompletIzd-Content-Table-Table"]',
              SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_SEARCH_INPUT
            );
            await newPage.waitForTimeout(1000);
            await newPage.waitForLoadState('networkidle');

            // Double-click the designation cell to open the waybill modal
            const designationCell = newPage
              .locator(
                SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DESIGNATION_PATTERN
              )
              .first();
            await designationCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await designationCell.scrollIntoViewIfNeeded();
            // Highlight the designation cell
            await designationCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightblue';
              el.style.border = '2px solid blue';
            });
            await designationCell.dblclick();
            await newPage.waitForLoadState('networkidle');
            await newPage.waitForTimeout(1500);

            // Wait for the modal to appear (Накладная на комплектацию Изделия)
            const waybillModal = newPage.locator(
              SelectorsModalWindowConsignmentNote.MODAL_WINDOW_BASE
            );
            await waybillModal.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            console.log('Modal "Накладная на комплектацию Изделия" opened');

            // Check the checkbox in the modal
            const checkboxCell = newPage
              .locator(
                SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN
              )
              .first();
            await checkboxCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await checkboxCell.scrollIntoViewIfNeeded();
            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightgreen';
              el.style.border = '2px solid green';
            });
            await checkboxCell.click();
            await newPage.waitForTimeout(500);
            await newPage.waitForLoadState('networkidle');

            // Verify the "Скомплектовать" button is enabled before clicking
            const completeButton = newPage.locator(
              SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
            );
            await completeButton.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await expect(completeButton).toBeEnabled({ timeout: 5000 });
            console.log('Скомплектовать button is enabled, clicking...');

            // Highlight the button
            await completeButton.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'orange';
              el.style.border = '3px solid red';
              el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
            });
            await newPage.waitForTimeout(300);

            // Click the "Скомплектовать" button
            await newCompletingProductsToPlan.clickButton(
              'Скомплектовать',
              SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON
            );

            // Wait for modal to close
            await waybillModal
              .waitFor({ state: 'hidden', timeout: 10000 })
              .catch(() => {});
            await newPage.waitForLoadState('networkidle');
            await newPage.waitForTimeout(2000);

            console.log(`Product kitting completed for ${nameProduct}`);
          } finally {
            // Close the new tab and return to the original page
            await newPage.close();
            console.log('New tab closed, returning to original page');
            // Wait for the server to process the kitting
            await page.waitForTimeout(3000);
          }

          // Close the modal by clicking Cancel to force fresh data load
          console.log('Closing modal to refresh data...');
          const cancelButton = page.locator(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CANCEL
          );
          if (await cancelButton.isVisible().catch(() => false)) {
            // Highlight the cancel button
            await cancelButton.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcoral';
              el.style.border = '2px solid red';
            });
            await page.waitForTimeout(200);
            await cancelButton.click();
            await page.waitForLoadState('networkidle');
            // Wait for the modal to fully close
            const mainModal = page.locator(
              SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN
            );
            await mainModal
              .waitFor({ state: 'hidden', timeout: 10000 })
              .catch(() => {});
            await page.waitForTimeout(1000);
          }

          // Click the button in the small popup to reopen the modal
          console.log('Reopening modal...');
          // Wait for any loader to finish
          const loaderModal = page.locator(
            '[data-testid="ComingToSclad-ModalComing"][loader="true"]'
          );
          await loaderModal
            .waitFor({ state: 'hidden', timeout: 10000 })
            .catch(() => {});
          await page.waitForTimeout(500);
          await stockReceipt.clickButton(
            'Создать приход',
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_RECEIPT
          );
          await page.waitForTimeout(1000);
          await page.waitForLoadState('networkidle');

          // Reselect the operation
          await stockReceipt.selectStockReceipt(StockReceipt.cbed);
          await page.waitForLoadState('networkidle');
          await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

          // Re-search to refresh the table data
          await stockReceipt.searchTable(
            nameProduct,
            tableComplectsSets,
            'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input'
          );
          await page.waitForLoadState('networkidle');
          await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

          // Re-check the quantity after kitting
          const updatedParishCell = page
            .locator(
              '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdParish"]'
            )
            .first();
          await updatedParishCell.waitFor({
            state: 'visible',
            timeout: 10000,
          });
          // Highlight the updated parish cell
          await updatedParishCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightyellow';
            el.style.border = '2px solid orange';
          });
          const updatedParishValue = await updatedParishCell.textContent();
          const updatedParishQuantity = updatedParishValue?.trim() || '0';
          console.log(
            `Кол-во на приход after kitting: ${updatedParishQuantity}`
          );

          if (updatedParishQuantity === '0' || updatedParishQuantity === '') {
            throw new Error(
              `Product kitting completed but Кол-во на приход is still 0 for ${nameProduct}. Please check manually.`
            );
          }
        } else {
          console.log(
            `Кол-во на приход is ${parishQuantity}, no product kitting needed`
          );
        }
      }
    );

    await allure.step(
      'Step 07: Find the checkbox column and click',
      async () => {
        // Find and click the checkbox in the first row using modern data-testid
        const checkboxCell = page
          .locator(
            '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdCheckbox"]'
          )
          .first();
        await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        await checkboxCell.scrollIntoViewIfNeeded();
        // Highlight the checkbox cell
        await checkboxCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });
        const checkbox = checkboxCell.getByRole('checkbox').first();
        const isDisabled = await checkbox.isDisabled();
        if (isDisabled) {
          throw new Error(
            'Cannot check the checkbox. Checkbox is disabled. This should have been handled in Step 06a.'
          );
        }

        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }
        console.log('Checkbox clicked');
      }
    );

    await allure.step('Step 07a: Click the parish cell link', async () => {
      // Click the parish cell (TdParish) to open the Скомплектованные наборы modal
      // The value should already be > 0 after Step 06a handled kitting if needed
      const parishCell = page
        .locator(
          '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdParish"]'
        )
        .first();

      await parishCell.waitFor({ state: 'visible', timeout: 10000 });
      await parishCell.scrollIntoViewIfNeeded();

      // Highlight the parish cell
      await parishCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });

      // Verify the value is not 0 before clicking
      const parishValue = await parishCell.textContent();
      const parishQuantity = parishValue?.trim() || '0';
      console.log(`Кол-во на приход value: ${parishQuantity}`);

      if (parishQuantity === '0' || parishQuantity === '') {
        throw new Error(
          `Cannot proceed: Кол-во на приход is 0. Product kitting should have been handled in Step 06a.`
        );
      }

      // Click the cell to open the modal
      await parishCell.click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      console.log('Parish cell clicked, modal should be open');
    });

    await allure.step(
      'Step 08: Check the modal window Completed sets',
      async () => {
        // Verify the modal is visible
        await stockReceipt.completesSetsModalWindow();
        await page.waitForTimeout(1000);

        // Wait directly for the input field to be available
        // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
        const inputlocator =
          '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row"][data-testid$="-TdCount-Label-Input-Input"]';
        await page
          .locator(inputlocator)
          .first()
          .waitFor({ state: 'visible', timeout: 15000 });
        console.log('Кол-во на отгрузку input field is visible');
      }
    );

    await allure.step(
      'Step 09: Enter quantity in Кол-во на отгрузку input field',
      async () => {
        // Find the Кол-во на отгрузку input field in the modal
        // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
        const inputlocator =
          '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row"][data-testid$="-TdCount-Label-Input-Input"]';

        // Get the input field
        const quantityInput = page.locator(inputlocator).first();
        await quantityInput.scrollIntoViewIfNeeded();

        // Highlight the input field
        await quantityInput.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '3px solid red';
          el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
        });
        await page.waitForTimeout(500);

        // Check that the element is not disabled
        const isDisabled = await quantityInput.getAttribute('disabled');
        if (isDisabled) {
          throw new Error('Элемент заблокирован для ввода.');
        }

        // Get the current value
        const quantityPerShipment = await quantityInput.getAttribute('value');
        console.log('Кол-во на отгрузку current value: ', quantityPerShipment);

        // Enter the quantity (using incomingQuantity variable if available, otherwise use '1')
        const quantityToEnter = incomingQuantity || '1';
        await quantityInput.fill(quantityToEnter);
        await page.waitForTimeout(300);
        await quantityInput.press('Enter');
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        console.log(`Кол-во на отгрузку set to: ${quantityToEnter}`);
      }
    );

    await allure.step(
      'Step 10: Click the save button in Скомплектованные наборы modal',
      async () => {
        // Click the "Сохранить" button in the Скомплектованные наборы modal
        const saveButton = page.locator(
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE
        );
        await saveButton.waitFor({ state: 'visible', timeout: 10000 });
        // Highlight the save button
        await saveButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightgreen';
          el.style.border = '3px solid green';
          el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
        });
        await page.waitForTimeout(300);
        await stockReceipt.clickButton(
          'Сохранить',
          SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE
        );
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('Сохранить button clicked, modal closed');
      }
    );

    await allure.step(
      'Step 11: Check the checkbox in the first row and click Добавить',
      async () => {
        // After saving the modal, check the checkbox in the main table (if not already checked)
        const checkboxCell = page
          .locator(
            '[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdCheckbox"]'
          )
          .first();
        await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        await checkboxCell.scrollIntoViewIfNeeded();
        // Highlight the checkbox cell
        await checkboxCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });
        const checkbox = checkboxCell.getByRole('checkbox').first();
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }

        // Click the "Добавить" button to add item to selected items bottom table
        const addButton = page.getByTestId(
          'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Button-Add'
        );
        await addButton.scrollIntoViewIfNeeded();
        await expect(addButton).toBeEnabled({ timeout: 15000 });
        // Highlight the Add button
        await addButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightblue';
          el.style.border = '3px solid blue';
          el.style.boxShadow = '0 0 10px rgba(0, 0, 255, 0.8)';
        });
        await page.waitForTimeout(300);
        await addButton.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        console.log('Добавить button clicked - item added to selected items');
      }
    );

    await allure.step(
      'Step 12: Check that the first row of the table contains the variable name',
      async () => {
        // Optionally check if the selected items table is visible and verify the item name
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
        const tableSelectedItems =
          '[data-testid="ModalComing-SelectedItems-ScladTable"]';
        const isTableVisible = await page
          .locator(tableSelectedItems)
          .isVisible()
          .catch(() => false);

        if (isTableVisible) {
          await stockReceipt.waitingTableBody(tableSelectedItems);
          await stockReceipt.checkNameInLineFromFirstRow(
            nameProduct,
            tableSelectedItems
          );
          console.log('Item verified in selected items table');
        } else {
          console.log(
            'Selected items table not visible, proceeding to create receipt'
          );
        }
      }
    );

    await allure.step(
      'Step 13: Click on the Создать button to create the receipt',
      async () => {
        // Click the "Создать" button (not "Создать приход")
        const createButton = page.getByTestId(
          'ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Create'
        );
        await createButton.waitFor({ state: 'visible', timeout: 15000 });
        await createButton.scrollIntoViewIfNeeded();
        // Wait for any loader to finish
        const loaderModal = page.locator(
          '[data-testid="ComingToSclad-ModalComing"][loader="true"]'
        );
        await loaderModal
          .waitFor({ state: 'hidden', timeout: 10000 })
          .catch(() => {});
        await page.waitForTimeout(500);
        await expect(createButton).toBeEnabled({ timeout: 10000 });
        // Highlight the Create button
        await createButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightgreen';
          el.style.border = '3px solid green';
          el.style.boxShadow = '0 0 15px rgba(0, 255, 0, 1)';
        });
        await page.waitForTimeout(300);
        await createButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('Создать button clicked - receipt created');
      }
    );

    await allure.step(
      'Step 14: Check the number of parts in the warehouse after posting',
      async () => {
        // Checking the remainder of the entity after capitalization
        remainingStockAfter = await stock.checkingTheQuantityInStock(
          nameProduct,
          TableSelection.product
        );
      }
    );

    await allure.step('Step 15: Compare the quantity in cells', async () => {
      // Compare the quantity in cells
      expect(Number(remainingStockAfter)).toBe(
        Number(remainingStockBefore) + Number(incomingQuantity)
      );

      // Output to the console
      console.log(
        `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
          `оприходовали в количестве: ${incomingQuantity}, ` +
          `и после оприходования: ${remainingStockAfter}.`
      );
    });
  });

  test('Test Case 28 - Launch Into Production Product', async ({ page }) => {
    // doc test case 23
    console.log('Test Case 28 - Launch Into Production Product');
    test.setTimeout(90000);
    const shortageProduct = new CreateShortageProductPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
      await shortageProduct.findTable(selector);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(
        nameProduct,
        deficitTable,
        deficitTable,
        { useRedesign: true }
      );
    });

    await allure.step(
      'Step 04: Check the checkbox in the first column',
      async () => {
        await page.waitForTimeout(500);
        // Find the checkbox using data-testid
        const checkboxCell = page
          .locator(SelectorsShortagePages.ROW_CHECKBOX)
          .first();

        await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
        await checkboxCell.scrollIntoViewIfNeeded();

        // Highlight the checkbox cell
        await checkboxCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });

        // Find the actual checkbox input inside the cell
        const checkbox = checkboxCell.getByRole('checkbox').first();

        // Check if the checkbox is disabled
        const isDisabled = await checkbox.isDisabled();
        if (isDisabled) {
          throw new Error('Cannot check the checkbox. Checkbox is disabled.');
        }

        // Check if the checkbox is already checked
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          console.log('Checkbox is not checked, attempting to check it...');
          await checkbox.click();
          await page.waitForTimeout(300);

          // Verify the checkbox is now checked
          const isCheckedAfter = await checkbox.isChecked();
          if (!isCheckedAfter) {
            throw new Error(
              'Failed to check the checkbox. Checkbox remains unchecked after click.'
            );
          }
          console.log('Checkbox successfully checked');
        } else {
          console.log('Checkbox is already checked, skipping click');
        }

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);
      }
    );

    await allure.step(
      'Step 05: Checking the urgency date of an order',
      async () => {
        // Find the urgency date cell using data-testid
        const urgencyDateCell = page
          .locator(SelectorsShortagePages.ROW_DATE_URGENCY)
          .first();

        await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
        await urgencyDateCell.scrollIntoViewIfNeeded();

        // Highlight the urgency date cell
        await urgencyDateCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightyellow';
          el.style.border = '2px solid orange';
        });

        // Get the urgency date value from the cell
        const urgencyDateValue = await urgencyDateCell.textContent();
        urgencyDateOnTable = urgencyDateValue?.trim() || '';

        console.log('Date by urgency in the table: ', urgencyDateOnTable);

        expect.soft(urgencyDateOnTable).toBe(urgencyDate);
      }
    );

    await allure.step(
      'Step 06: We check the number of those launched into production',
      async () => {
        // Find the production ordered quantity cell using data-testid
        const productionOrderedCell = page
          .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED)
          .first();

        await productionOrderedCell.waitFor({
          state: 'visible',
          timeout: 10000,
        });
        await productionOrderedCell.scrollIntoViewIfNeeded();

        // Highlight the production ordered quantity cell
        await productionOrderedCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcyan';
          el.style.border = '2px solid blue';
        });

        // Get the production ordered quantity value from the cell
        const productionOrderedValue =
          await productionOrderedCell.textContent();
        quantityProductLaunchOnProductionBefore =
          productionOrderedValue?.trim() || '';

        console.log(
          'The value in the cells is put into production befor:',
          quantityProductLaunchOnProductionBefore
        );
      }
    );

    await allure.step(
      'Step 07: Click on the Launch on production button',
      async () => {
        // Click on the button
        await shortageProduct.clickButton(
          'Запустить в производство',
          buttonLaunchIntoProduction
        );
      }
    );

    await allure.step(
      'Step 08: Testing a modal window for production launch',
      async () => {
        // Check the modal window Launch into production
        await shortageProduct.checkModalWindowLaunchIntoProduction(
          modalWindowLaunchIntoProduction
        );

        // Check the date in the Launch into production modal window
        await shortageProduct.checkCurrentDate(
          '[data-testid="ModalStartProduction-OrderDateValue"]'
        );
      }
    );

    await allure.step('Step 09: Enter a value into a cell', async () => {
      // Check the value in the Own quantity field and enter the value
      const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
      await shortageProduct.checkOrderQuantity(
        locator,
        '2',
        quantityProductLaunchOnProduction
      );
    });

    await allure.step('Step 10: We save the order number', async () => {
      // Get the order number
      checkOrderNumber = await shortageProduct.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);
    });

    await allure.step('Step 11: Click on the In launch button', async () => {
      // Click on the button
      await shortageProduct.clickButton(
        'В производство',
        buttonLaunchIntoProductionModalWindow
      );
    });

    await allure.step(
      'Step 12: We check that the order number is displayed in the notification',
      async () => {
        // Check the order number in the success notification
        await shortageProduct.getMessage(checkOrderNumber);
      }
    );

    await allure.step(
      'Step 13: We check the number of those launched into production',
      async () => {
        // Find the production ordered quantity cell using data-testid
        const productionOrderedCell = page
          .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED)
          .first();

        await productionOrderedCell.waitFor({
          state: 'visible',
          timeout: 10000,
        });
        await productionOrderedCell.scrollIntoViewIfNeeded();

        // Highlight the production ordered quantity cell
        await productionOrderedCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcyan';
          el.style.border = '2px solid blue';
        });

        // Get the production ordered quantity value from the cell
        const productionOrderedValue =
          await productionOrderedCell.textContent();
        quantityProductLaunchOnProductionAfter =
          productionOrderedValue?.trim() || '';

        console.log(
          'The value in the cells is put into production after:',
          quantityProductLaunchOnProductionAfter
        );
        quantitySumLaunchOnProduction =
          Number(quantityProductLaunchOnProductionBefore) +
          Number(quantityProductLaunchOnProduction);
        expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
          Number(quantityProductLaunchOnProductionBefore) +
            Number(quantityProductLaunchOnProduction)
        );
      }
    );
  });

  test('Test Case 29 - Launch Into Production Cbed', async ({ page }) => {
    // doc test case 24
    console.log('Test Case 29 - Launch Into Production Cbed');
    test.setTimeout(90000);
    const shortageAssemblies = new CreatShortageAssembliesPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the shortage assemblies page',
      async () => {
        // Find and go to the page using the locator shortage assemblies
        const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
        await shortageAssemblies.findTable(selector);
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 03: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(deficitTableCbed);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            deficitTableCbed,
            deficitTableCbed,
            { useRedesign: true }
          );

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step(
          'Step 04: Check the checkbox in the first column',
          async () => {
            // Find the checkbox using data-testid
            const checkboxCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_SELECT)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageAssemblies.waitingTableBody(deficitTableCbed);
          }
        );

        await allure.step(
          'Step 05: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_URGENCY_DATE)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            urgencyDateOnTable = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateOnTable?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 06: We check the number of those launched into production',
          async () => {
            // Find the ordered quantity cell using data-testid
            const orderedCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED)
              .first();

            await orderedCell.waitFor({ state: 'visible', timeout: 10000 });
            await orderedCell.scrollIntoViewIfNeeded();

            // Highlight the ordered cell
            await orderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the ordered quantity value from the cell
            const orderedValue = await orderedCell.textContent();
            quantityProductLaunchOnProductionBefore =
              orderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production befor:',
              quantityProductLaunchOnProductionBefore
            );
          }
        );

        await allure.step(
          'Step 07: Click on the Launch on production button',
          async () => {
            // Find the button and verify it's enabled (should be enabled after checkbox is checked)
            const launchButton = page.locator(buttonLaunchIntoProductionCbed);
            await launchButton.waitFor({ state: 'visible', timeout: 10000 });
            await launchButton.scrollIntoViewIfNeeded();

            // Verify the button is enabled
            await expect(launchButton).toBeEnabled({ timeout: 10000 });

            // Highlight the button
            await launchButton.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightgreen';
              el.style.border = '3px solid green';
              el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
            });
            await page.waitForTimeout(300);

            // Click on the button
            await shortageAssemblies.clickButton(
              'Запустить в производство',
              buttonLaunchIntoProductionCbed
            );
          }
        );

        await allure.step(
          'Step 08: Testing a modal window for production launch',
          async () => {
            // Check the modal window Launch into production
            await shortageAssemblies.checkModalWindowLaunchIntoProduction(
              modalWindowLaunchIntoProductionCbed
            );

            // Check the date in the Launch into production modal window
            await shortageAssemblies.checkCurrentDate(
              '[data-testid="ModalStartProduction-OrderDateValue"]'
            );
          }
        );

        await allure.step('Step 09: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.ROW_PRODUCTION_INPUT;
          await shortageAssemblies.checkOrderQuantity(
            locator,
            '2',
            quantityProductLaunchOnProduction
          );
        });

        await allure.step('Step 10: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageAssemblies.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
          'Step 11: Click on the In launch button',
          async () => {
            // Click on the button
            await shortageAssemblies.clickButton(
              'В производство',
              buttonLaunchIntoProductionModalWindow
            );
          }
        );

        await allure.step(
          'Step 12: We check that the order number is displayed in the notification',
          async () => {
            // Check the order number in the success notification
            await shortageAssemblies.getMessage(checkOrderNumber);
          }
        );

        await allure.step('Step 13: Close success message', async () => {
          // Close the success notification
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          await shortageAssemblies.closeSuccessMessage();
        });

        await allure.step(
          'Step 14: We check the number of those launched into production',
          async () => {
            // Find the ordered quantity cell using data-testid
            const orderedCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED)
              .first();

            await orderedCell.waitFor({ state: 'visible', timeout: 10000 });
            await orderedCell.scrollIntoViewIfNeeded();

            // Highlight the ordered cell
            await orderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the ordered quantity value from the cell
            const orderedValue = await orderedCell.textContent();
            quantityProductLaunchOnProductionAfter = orderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production after:',
              quantityProductLaunchOnProductionAfter
            );

            expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
              Number(quantityProductLaunchOnProductionBefore) +
                Number(quantityProductLaunchOnProduction)
            );
          }
        );
      }
    }
  });

  test('Test Case 30 - Launch Into Production Parts', async ({ page }) => {
    // doc test case 25
    console.log('Test Case 30 - Launch Into Production Parts');
    test.setTimeout(90000);
    const shortageParts = new CreatShortagePartsPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 03: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(
            part.name,
            deficitTableDetail,
            deficitTableDetail,
            { useRedesign: true, timeoutBeforeWait: 1000 }
          );
        });

        await allure.step(
          'Step 04: Check that the first row of the table contains the variable name',
          async () => {
            // Find the checkbox using data-testid (starts with pattern)
            const checkboxCell = page
              .locator(SelectorsShortagePages.ROW_CHECKBOX_PATTERN)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageParts.waitingTableBody(deficitTableDetail);
          }
        );

        await allure.step(
          'Step 05: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid (starts with pattern)
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.ROW_DATE_URGENCY_PATTERN)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );

        await allure.step(
          'Step 06: We check the number of those launched into production',
          async () => {
            // Find the production ordered quantity cell using data-testid (starts with pattern)
            const productionOrderedCell = page
              .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN)
              .first();

            await productionOrderedCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await productionOrderedCell.scrollIntoViewIfNeeded();

            // Highlight the production ordered quantity cell
            await productionOrderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the production ordered quantity value from the cell
            const productionOrderedValue =
              await productionOrderedCell.textContent();
            quantityProductLaunchOnProductionBefore =
              productionOrderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production befor:',
              quantityProductLaunchOnProductionBefore
            );
          }
        );

        await allure.step(
          'Step 07: Click on the Launch on production button ',
          async () => {
            // Click on the button
            await shortageParts.clickButton(
              'Запустить в производство',
              buttonLaunchIntoProductionDetail
            );
          }
        );

        await allure.step(
          'Step 08: Testing a modal window for production launch',
          async () => {
            // Check the modal window Launch into production
            await shortageParts.checkModalWindowLaunchIntoProduction(
              modalWindowLaunchIntoProductionDetail
            );

            // Check the date in the Launch into production modal window
            await shortageParts.checkCurrentDate(
              '[data-testid="ModalStartProduction-OrderDateValue"]'
            );
          }
        );

        await allure.step('Step 09: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
          await shortageParts.checkOrderQuantity(
            locator,
            '2',
            quantityProductLaunchOnProduction
          );
        });

        await allure.step('Step 10: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageParts.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step(
          'Step 11: Click on the In launch button',
          async () => {
            // Click on the button
            await shortageParts.clickButton(
              'В производство',
              buttonLaunchIntoProductionModalWindow
            );
          }
        );

        await allure.step(
          'Step 12: We check that the order number is displayed in the notification',
          async () => {
            // Check the order number in the success notification
            await shortageParts.getMessage(checkOrderNumber);
          }
        );

        await allure.step('Step 13: Close success message', async () => {
          // Close the success notification
          await shortageParts.closeSuccessMessage();
        });

        await allure.step(
          'Step 14: We check the number of those launched into production',
          async () => {
            // Find the production ordered quantity cell using data-testid (starts with pattern)
            const productionOrderedCell = page
              .locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN)
              .first();

            await productionOrderedCell.waitFor({
              state: 'visible',
              timeout: 10000,
            });
            await productionOrderedCell.scrollIntoViewIfNeeded();

            // Highlight the production ordered quantity cell
            await productionOrderedCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightcyan';
              el.style.border = '2px solid blue';
            });

            // Get the production ordered quantity value from the cell
            const productionOrderedValue =
              await productionOrderedCell.textContent();
            quantityProductLaunchOnProductionAfter =
              productionOrderedValue?.trim() || '';

            console.log(
              'The value in the cells is put into production after:',
              quantityProductLaunchOnProductionAfter
            );

            expect(Number(quantityProductLaunchOnProductionAfter)).toBe(
              Number(quantityProductLaunchOnProductionBefore) +
                Number(quantityProductLaunchOnProduction)
            );
          }
        );
      }
    }
  });

  test('Test Case 31 - Uploading Second Shipment Task', async ({ page }) => {
    // doc test case 26
    console.log('Test Case 31 - Uploading Second Shipment Task');
    test.setTimeout(90000);
    const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(
      page
    );

    let numberColumn: number;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await warehouseTaskForShipment.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the warehouse shipping task page',
      async () => {
        // Find and go to the page using the locator Склад: Задачи на отгрузку
        const selector = SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS;
        await warehouseTaskForShipment.findTable(selector);

        // Wait for loading
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Wait for the table body to load
        await warehouseTaskForShipment.waitingTableBody(tableMainUploading);
      }
    );

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await warehouseTaskForShipment.searchAndWaitForTable(
        nameProduct,
        tableMainUploading,
        tableMainUploading,
        { useRedesign: true, timeoutBeforeWait: 1000 }
      );
    });

    await allure.step(
      'Step 04: Check that the first row of the table contains the variable name',
      async () => {
        // Check that the first row of the table contains the variable name
        await warehouseTaskForShipment.checkNameInLineFromFirstRow(
          orderNumber.orderNumber,
          tableMainUploading
        );
      }
    );

    await allure.step(
      'Step 05: Find the checkbox column and click',
      async () => {
        // Click the first row cell using direct data-testid pattern
        const firstRowCell = page
          .locator(SelectorsShipmentTasks.ROW_NUMBER_PATTERN)
          .first();

        // Wait for the cell to be visible
        await firstRowCell.waitFor({ state: 'visible', timeout: 10000 });
        await firstRowCell.scrollIntoViewIfNeeded();

        // Highlight the cell for debugging
        await firstRowCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
        });
        await page.waitForTimeout(500);

        // Click the cell
        await firstRowCell.click();
        console.log('First row cell clicked');
      }
    );

    await allure.step('Step 06: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
    });

    await allure.step('Step 07: Check the Shipping modal window', async () => {
      // Check the Shipping modal window
      await warehouseTaskForShipment.shipmentModalWindow();
    });

    await allure.step('Step 08: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton(
        'Отгрузить',
        SelectorsWarehouseTaskForShipment.BUTTON_SHIP
      );
    });
  });

  test('Test Case 32 - Checking new date by urgency', async ({ page }) => {
    // doc test case 27
    console.log('Test Case 32 - Checking new date by urgency');
    test.setTimeout(90000);
    // Проверка изделия на дату по срочности
    const shortageProduct = new CreateShortageProductPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
      await shortageProduct.findTable(selector);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(
        nameProduct,
        deficitTable,
        deficitTable,
        { useRedesign: true }
      );
    });

    await allure.step(
      'Step 04: Check the checkbox in the first column',
      async () => {
        // Check that the first row of the table contains the variable name
        await shortageProduct.checkNameInLineFromFirstRow(
          nameProduct,
          deficitTable
        );

        // Wait for the table body to load
        await shortageProduct.waitingTableBody(deficitTable);
      }
    );

    await allure.step(
      'Step 04: Checking the urgency date of an order',
      async () => {
        // Find the urgency date cell using data-testid in the first row
        const urgencyDateCell = page
          .locator(SelectorsShortagePages.ROW_DATE_URGENCY)
          .first();

        await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
        await urgencyDateCell.scrollIntoViewIfNeeded();

        // Highlight the urgency date cell
        await urgencyDateCell.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightyellow';
          el.style.border = '2px solid orange';
        });

        // Get the urgency date value from the cell
        const urgencyDateValue = await urgencyDateCell.textContent();
        urgencyDateOnTable = urgencyDateValue?.trim() || '';

        console.log('Date by urgency in the table: ', urgencyDateOnTable);

        expect.soft(urgencyDateOnTable).toBe(urgencyDate);
      }
    );

    // Checking the board for urgency of assembly
    const shortageAssemblies = new CreatShortageAssembliesPage(page);

    await allure.step('Step 05: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 06: Open the shortage assemblies page',
      async () => {
        // Find and go to the page using the locator shortage assemblies
        const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
        await shortageAssemblies.findTable(selector);
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 07: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(deficitTableCbed);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            deficitTableCbed,
            deficitTableCbed,
            { useRedesign: true }
          );

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step(
          'Step 08: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.CBED_TABLE_BODY_URGENCY_DATE)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );
      }
    }

    // Проверка на дату по срочности деталей
    const shortageParts = new CreatShortagePartsPage(page);

    await allure.step('Step 09: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 10: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 11: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(
            part.name,
            deficitTableDetail,
            deficitTableDetail,
            { useRedesign: true, timeoutBeforeWait: 1000 }
          );
        });

        await allure.step(
          'Step 12: Check that the first row of the table contains the variable name',
          async () => {
            // Find the checkbox using data-testid (starts with pattern)
            const checkboxCell = page
              .locator(SelectorsShortagePages.ROW_CHECKBOX_PATTERN)
              .first();

            await checkboxCell.waitFor({ state: 'visible', timeout: 10000 });
            await checkboxCell.scrollIntoViewIfNeeded();

            // Highlight the checkbox cell
            await checkboxCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'yellow';
              el.style.border = '2px solid red';
            });

            // Find the actual checkbox input inside the cell
            const checkbox = checkboxCell.getByRole('checkbox').first();

            // Check if the checkbox is disabled
            const isDisabled = await checkbox.isDisabled();
            if (isDisabled) {
              throw new Error(
                'Cannot check the checkbox. Checkbox is disabled.'
              );
            }

            // Check if the checkbox is already checked
            const isChecked = await checkbox.isChecked();
            if (!isChecked) {
              console.log('Checkbox is not checked, attempting to check it...');
              await checkbox.click();
              await page.waitForTimeout(300);

              // Verify the checkbox is now checked
              const isCheckedAfter = await checkbox.isChecked();
              if (!isCheckedAfter) {
                throw new Error(
                  'Failed to check the checkbox. Checkbox remains unchecked after click.'
                );
              }
              console.log('Checkbox successfully checked');
            } else {
              console.log('Checkbox is already checked, skipping click');
            }

            // Wait for the table body to load
            await shortageParts.waitingTableBody(deficitTableDetail);
          }
        );

        await allure.step(
          'Step 13: Checking the urgency date of an order',
          async () => {
            // Find the urgency date cell using data-testid (starts with pattern)
            const urgencyDateCell = page
              .locator(SelectorsShortagePages.ROW_DATE_URGENCY_PATTERN)
              .first();

            await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
            await urgencyDateCell.scrollIntoViewIfNeeded();

            // Highlight the urgency date cell
            await urgencyDateCell.evaluate((el: HTMLElement) => {
              el.style.backgroundColor = 'lightyellow';
              el.style.border = '2px solid orange';
            });

            // Get the urgency date value from the cell
            const urgencyDateValue = await urgencyDateCell.textContent();
            urgencyDateOnTable = urgencyDateValue?.trim() || '';

            console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

            expect(urgencyDateOnTable).toBe(urgencyDate);
          }
        );
      }
    }
  });

  test('Test Case 33 - Archive Metalworking Warehouse Task All', async ({
    // doc test case 28
    page,
  }) => {
    console.log('Test Case 33 - Archive Metalworking Warehouse Task All');
    test.setTimeout(90000);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const warehouseTable =
      'table[data-testid="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table"]';

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the metalworking warehouse page',
      async () => {
        const selector =
          MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
        await metalworkingWarehouse.findTable(selector);

        // Wait for loading
        await page.waitForLoadState('networkidle');
        await metalworkingWarehouse.waitingTableBody(warehouseTable);
      }
    );

    await allure.step('Step 03: Search product', async () => {
      await metalworkingWarehouse.searchTable(
        designation,
        warehouseTable,
        MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_SEARCH_INPUT
      );

      await metalworkingWarehouse.waitingTableBody(warehouseTable);
    });

    await allure.step('Step 04-06: Archive all matching items', async () => {
      // Loop through all search results and archive them
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100; // Safety limit to prevent infinite loops

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        console.log(`Archive iteration ${iterationCount}`);

        // Wait for table to be ready
        await metalworkingWarehouse.waitingTableBody(warehouseTable);
        await page.waitForTimeout(500);

        // Check if there are any rows in the table
        const rows = page.locator(`${warehouseTable} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount === 0) {
          console.log('No more items to archive');
          hasMoreItems = false;
          break;
        }

        // Check that the first row contains the variable name and check the checkbox
        await metalworkingWarehouse.checkboxMarkNameInLineFromFirstRow(
          designation,
          warehouseTable
        );

        // Click on the archive button
        await metalworkingWarehouse.clickOnTheTableHeaderCell(
          15,
          warehouseTable
        );

        // Highlight the archive button before clicking
        const archiveButton = page.locator(
          MetalWorkingWarhouseSelectors.BUTTON_ARCHIVE
        );
        await archiveButton.waitFor({ state: 'visible', timeout: 10000 });
        await archiveButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcoral';
          el.style.border = '2px solid red';
        });
        await page.waitForTimeout(200);

        await metalworkingWarehouse.clickButton(
          'Архив',
          MetalWorkingWarhouseSelectors.BUTTON_ARCHIVE
        );

        // Confirm the archive
        const confirmButton = page.locator(PartsDBSelectors.BUTTON_CONFIRM);
        await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
        await confirmButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightgreen';
          el.style.border = '2px solid green';
        });
        await page.waitForTimeout(200);

        await metalworkingWarehouse.clickButton(
          'Да',
          PartsDBSelectors.BUTTON_CONFIRM
        );

        // Wait for the modal to close and table to update
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check if there are still items left
        const remainingRows = page.locator(`${warehouseTable} tbody tr`);
        const remainingCount = await remainingRows.count();

        if (remainingCount === 0) {
          console.log('All items archived');
          hasMoreItems = false;
        } else {
          console.log(`Remaining items: ${remainingCount}`);
        }
      }

      if (iterationCount >= maxIterations) {
        console.warn(
          `Reached maximum iterations (${maxIterations}). Some items may not have been archived.`
        );
      }
    });
  });

  test('Test Case 34 - Archive Assembly Warehouse Task All', async ({
    // doc test case 29
    page,
  }) => {
    console.log('Test Case 34 - Archive Assembly Warehouse Task All');
    test.setTimeout(90000);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
    const warehouseTable = 'table[data-testid="AssemblySclad-ScrollTable"]';

    await allure.step(
      'Step 01-02: Open the warehouse page and assembly warehouse page',
      async () => {
        const selector = '[data-testid="Sclad-stockOrderAssembly"]';
        await assemblyWarehouse.navigateToPageAndWaitForTable(
          SELECTORS.MAINMENU.WAREHOUSE.URL,
          selector,
          warehouseTable
        );
      }
    );

    await allure.step('Step 03: Search product', async () => {
      await assemblyWarehouse.searchTable(
        designation,
        warehouseTable,
        '${props.dataTestid}-TableHead-Search-Dropdown-Input'
      );

      await assemblyWarehouse.waitingTableBody(warehouseTable);
    });

    await allure.step(
      'Step 04: Check that the first row of the table contains the variable name',
      async () => {
        await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
          designation,
          warehouseTable
        );
      }
    );

    await allure.step('Step 05: Click on the archive button', async () => {
      await assemblyWarehouse.clickOnTheTableHeaderCell(16, warehouseTable);

      await assemblyWarehouse.clickButton(
        'Архив',
        '[data-testid="AssemblySclad-Button-Archive"]'
      );
    });

    await allure.step('Step 06: Confirm the archive', async () => {
      await assemblyWarehouse.clickButton(
        'Да',
        '[data-testid="AssemblySclad-BanModal-Content-Buttons-Yes"]'
      );
    });
  });

  test('Test Case 35 - Moving Task For Shipment To The Archive', async ({
    // doc test case 30
    page,
  }) => {
    console.log('Test Case 35 - Moving Task For Shipment To The Archive');
    test.setTimeout(90000);
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const loadingTaskTable = '.shipments-content';
    let numberColumn: number;

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 02: Search product', async () => {
      // Using table search we look for the value of the variable
      const searchTable = page.locator('.search-yui-kit__input').nth(1);
      await searchTable.fill(nameProduct);

      expect(await searchTable.inputValue()).toBe(nameProduct);
      await searchTable.press('Enter');

      await page.waitForTimeout(1000);

      // Waiting for the table body
      await loadingTaskPage.waitingTableBody(loadingTaskTable);
    });

    await allure.step('Step 03-06: Archive all matching items', async () => {
      // Loop through all search results and archive them
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100; // Safety limit to prevent infinite loops

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        console.log(`Archive iteration ${iterationCount}`);

        // Wait for table to be ready
        await loadingTaskPage.waitingTableBody(loadingTaskTable);
        await page.waitForTimeout(500);

        // Check if there are any rows in the table
        const rows = page.locator(`${loadingTaskTable} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount === 0) {
          console.log('No more items to archive');
          hasMoreItems = false;
          break;
        }

        // Check that the first row contains the variable name
        await loadingTaskPage.checkNameInLineFromFirstRow(
          nameProduct,
          loadingTaskTable
        );

        // Find the checkbox column and click (column 2)
        await loadingTaskPage.getValueOrClickFromFirstRow(
          loadingTaskTable,
          2,
          Click.Yes,
          Click.No
        );

        // Click on the archive button
        const archiveButton = page.locator(LoadingTasksSelectors.buttonArchive);
        await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

        // Highlight the archive button before clicking
        await archiveButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightcoral';
          el.style.border = '2px solid red';
        });
        await page.waitForTimeout(200);

        await loadingTaskPage.clickButton(
          'Архив',
          LoadingTasksSelectors.buttonArchive
        );

        // Confirm the archive
        const confirmButton = page.locator(PartsDBSelectors.BUTTON_CONFIRM);
        await confirmButton.waitFor({ state: 'visible', timeout: 10000 });

        // Highlight the confirm button before clicking
        await confirmButton.evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'lightgreen';
          el.style.border = '2px solid green';
        });
        await page.waitForTimeout(200);

        await loadingTaskPage.clickButton(
          'Да',
          PartsDBSelectors.BUTTON_CONFIRM
        );

        // Wait for the modal to close and table to update
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check if there are still items left
        const remainingRows = page.locator(`${loadingTaskTable} tbody tr`);
        const remainingCount = await remainingRows.count();

        if (remainingCount === 0) {
          console.log('All items archived');
          hasMoreItems = false;
        } else {
          console.log(`Remaining items: ${remainingCount}`);
        }
      }

      if (iterationCount >= maxIterations) {
        console.warn(
          `Reached maximum iterations (${maxIterations}). Some items may not have been archived.`
        );
      }
    });
  });

  test('Test Case 36 - Cleaning up warehouse residues', async ({ page }) => {
    console.log('Test Case 36 - Cleaning up warehouse residues');
    test.setTimeout(90000);
    const revisionPage = new CreateRevisionPage(page);
    const tableMain =
      '[data-testid="Revision-TableRevisionPagination-Products-Table"]';
    const tableMainCbed =
      '[data-testid="Revision-TableRevisionPagination-Cbeds-Table"]';
    const tableMainDetal =
      '[data-testid="Revision-TableRevisionPagination-Detals-Table"]';
    let numberColumn: number;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step(
      'Step 02: Open the warehouse revisions page',
      async () => {
        // Find and go to the page using the locator Склад: Задачи на отгрузку
        const selector = '[data-testid="Sclad-revision-revision"]';
        await revisionPage.findTable(selector);

        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Wait for the table body to load
        await revisionPage.waitingTableBodyNoThead(tableMain);
      }
    );

    await allure.step('Step 03: Checking the main page headings', async () => {
      const titles = testData1.elements.RevisionPage.titles.map(title =>
        title.trim()
      );
      const h3Titles = await revisionPage.getAllH3TitlesInClass(
        page,
        'container'
      );
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');

      // Log for debugging
      console.log('Expected Titles:', titles);
      console.log('Received Titles:', normalizedH3Titles);

      // Validate length
      expect(normalizedH3Titles.length).toBe(titles.length);

      // Validate content and order
      expect(normalizedH3Titles).toEqual(titles);
    });

    await allure.step(
      'Step 04: Checking the main buttons on the page',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        const buttons = testData1.elements.RevisionPage.filters;
        // Iterate over each button in the array
        for (const button of buttons) {
          // Extract the class, label, and state from the button object
          const buttonClass = button.class;
          const buttonLabel = button.label;
          const expectedState = button.state === 'true' ? true : false;

          // Perform the validation for the button
          await allure.step(
            `Validate button with label: "${buttonLabel}"`,
            async () => {
              // Check if the button is visible and enabled

              const isButtonReady = await revisionPage.isButtonVisible(
                page,
                buttonClass,
                buttonLabel,
                expectedState
              );

              // Validate the button's visibility and state
              expect(isButtonReady).toBeTruthy();
              console.log(
                `Is the "${buttonLabel}" button visible and enabled?`,
                isButtonReady
              );
            }
          );
        }
      }
    );

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await revisionPage.searchTable(
        nameProduct,
        tableMain,
        'TableRevisionPagination-SearchInput-Dropdown-Input'
      );

      // Wait for the table body to load
      await revisionPage.waitingTableBodyNoThead(tableMain);
    });

    await allure.step(
      'Step 06: Checking if the first line contains a variable name',
      async () => {
        await revisionPage.checkNameInLineFromFirstRow(nameProduct, tableMain);
      }
    );

    await allure.step('Step 07: Changing warehouse balances', async () => {
      await revisionPage.changeWarehouseBalances('0');
    });

    await allure.step('Step 08: Confirm the archive', async () => {
      await revisionPage.clickButton(
        'Да',
        '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]'
      );
    });

    await allure.step('Step 08a: Refresh page and search again', async () => {
      // Wait for any modals to close
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Search again
      await revisionPage.searchTable(
        nameProduct,
        tableMain,
        'TableRevisionPagination-SearchInput-Dropdown-Input'
      );

      // Wait for the table body to load
      await revisionPage.waitingTableBodyNoThead(tableMain);
      await page.waitForTimeout(1000);
    });

    await allure.step(
      'Step 09: Checking that the balance is now 0',
      async () => {
        await page.waitForTimeout(1000);
        await revisionPage.checkWarehouseBalances('0');
      }
    );

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step(
          'Step 10: Open the warehouse shipping task page',
          async () => {
            await revisionPage.clickButton(
              'Сборки',
              '[data-testid="Revision-Switch-Item1"]'
            );
          }
        );

        await allure.step('Step 11: Search product', async () => {
          await revisionPage.waitForTimeout(500);
          // Using table search we look for the value of the variable
          await revisionPage.searchTable(
            cbed.name,
            tableMainCbed,
            'TableRevisionPagination-SearchInput-Dropdown-Input'
          );
          // Wait for the table body to load
          await revisionPage.waitingTableBodyNoThead(tableMainCbed);
        });

        await allure.step(
          'Step 12: Checking if the first line contains a variable name',
          async () => {
            await revisionPage.checkNameInLineFromFirstRow(
              cbed.name,
              tableMainCbed
            );
          }
        );

        await allure.step('Step 13: Changing warehouse balances', async () => {
          await revisionPage.changeWarehouseBalances('0');
        });

        await allure.step('Step 14: Confirm the archive', async () => {
          await revisionPage.clickButton(
            'Да',
            '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]'
          );
        });

        await allure.step(
          'Step 15: Checking that the balance is now 0',
          async () => {
            await page.waitForTimeout(500);
            await revisionPage.checkWarehouseBalances('0');
          }
        );
      }
    }

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой. Перебор невозможен.');
    } else {
      for (const detail of descendantsDetailArray) {
        await allure.step(
          'Step 16: Open the warehouse shipping task page',
          async () => {
            await revisionPage.clickButton(
              'Детали',
              '[data-testid="Revision-Switch-Item2"]'
            );
          }
        );

        await allure.step('Step 17: Search product', async () => {
          await revisionPage.waitForTimeout(500);
          // Using table search we look for the value of the variable
          await revisionPage.searchTable(
            detail.name,
            tableMainDetal,
            'TableRevisionPagination-SearchInput-Dropdown-Input'
          );
          // Wait for the table body to load
          await revisionPage.waitingTableBodyNoThead(tableMainDetal);
        });

        await allure.step(
          'Step 18: Checking if the first line contains a variable name',
          async () => {
            await revisionPage.checkNameInLineFromFirstRow(
              detail.name,
              tableMainDetal
            );
          }
        );

        await allure.step('Step 19: Changing warehouse balances', async () => {
          await revisionPage.changeWarehouseBalances('0');
        });

        await allure.step('Step 20: Confirm the archive', async () => {
          await revisionPage.clickButton(
            'Да',
            '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]'
          );
        });

        await allure.step(
          'Step 21: Checking that the balance is now 0',
          async () => {
            await page.waitForTimeout(500);
            await revisionPage.checkWarehouseBalances('0');
          }
        );
      }
    }
  });

  test('Test Case 37 - Delete Product after test', async ({ page }) => {
    console.log('Test Case 37 - Delete Product after test');
    test.setTimeout(90000);
    const partsDatabsePage = new CreatePartsDatabasePage(page);
    const searchProduct = page
      .locator(PartsDBSelectors.SEARCH_PRODUCT_ATTRIBUT)
      .first();
    const searchCbed = page
      .locator(PartsDBSelectors.SEARCH_CBED_ATTRIBUT)
      .nth(1);
    const searchDetail = page
      .locator(PartsDBSelectors.SEARCH_DETAIL_ATTRIBUT)
      .last();

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('networkidle');
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 02: Search Detail', async () => {
        await searchDetail.fill(detail.name);
        await searchDetail.press('Enter');
        expect(await searchDetail.inputValue()).toBe(detail.name);
      });

      await allure.step(
        'Step 03: Check table rows and process if found',
        async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          const rows = page.locator(
            `${PartsDBSelectors.DETAIL_TABLE_DIV} tbody tr`
          );
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
              await allure.step(
                `Processing row ${i + 1} for detail: ${detail.name}`,
                async () => {
                  await partsDatabsePage.getValueOrClickFromFirstRow(
                    PartsDBSelectors.DETAIL_TABLE,
                    i,
                    Click.Yes,
                    Click.No
                  );

                  await allure.step('Click on the Archive button', async () => {
                    await partsDatabsePage.clickButton(
                      'Архив',
                      PartsDBSelectors.BUTTON_ARCHIVE
                    );
                  });

                  await allure.step(
                    'Confirmation of transfer to archive',
                    async () => {
                      const confirmButton = page.locator(
                        PartsDBSelectors.BUTTON_CONFIRM,
                        { hasText: 'Да' }
                      );
                      await confirmButton.click();
                      await page.waitForTimeout(1000); // Wait for the row to be removed
                    }
                  );
                }
              );
            }
          }
        }
      );
    }

    for (const cbed of arrayCbed) {
      await allure.step('Step 04: Search Cbed', async () => {
        await searchCbed.fill(cbed.name);
        await searchCbed.press('Enter');
        expect(await searchCbed.inputValue()).toBe(cbed.name);
      });

      await allure.step(
        'Step 05: Check table rows and process if found',
        async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          const rows = page.locator(
            `${PartsDBSelectors.CBED_TABLE_DIV} tbody tr`
          );
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
              await allure.step(
                `Processing row ${i + 1} for cbed: ${cbed.name}`,
                async () => {
                  await partsDatabsePage.getValueOrClickFromFirstRow(
                    PartsDBSelectors.CBED_TABLE,
                    i,
                    Click.Yes,
                    Click.No
                  );

                  await allure.step('Click on the Archive button', async () => {
                    await partsDatabsePage.clickButton(
                      'Архив',
                      PartsDBSelectors.BUTTON_ARCHIVE
                    );
                  });

                  await allure.step(
                    'Confirmation of transfer to archive',
                    async () => {
                      const confirmButton = page.locator(
                        PartsDBSelectors.BUTTON_CONFIRM,
                        { hasText: 'Да' }
                      );
                      await confirmButton.click();
                      await page.waitForTimeout(1000); // Wait for the row to be removed
                    }
                  );
                }
              );
            }
          }
        }
      );
    }

    await allure.step('Step 06: Search Product', async () => {
      await searchProduct.fill(nameProductNew);
      await searchProduct.press('Enter');
      expect(await searchProduct.inputValue()).toBe(nameProductNew);
    });

    await allure.step(
      'Step 07: Check table rows and process if found',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

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
            await allure.step(
              `Processing row ${i + 1} for product: ${nameProductNew}`,
              async () => {
                // Click on the row to select it
                await row.click();

                await allure.step('Click on the Archive button', async () => {
                  await partsDatabsePage.clickButton(
                    'Архив',
                    PartsDBSelectors.BUTTON_ARCHIVE
                  );
                });

                await allure.step(
                  'Confirmation of transfer to archive',
                  async () => {
                    const confirmButton = page.locator(
                      PartsDBSelectors.BUTTON_CONFIRM,
                      { hasText: 'Да' }
                    );
                    await confirmButton.click();
                    await page.waitForTimeout(1000); // Wait for the row to be removed
                  }
                );
              }
            );
          }
        }
      }
    );
  });
};
