/**
 * @file U002-UI.spec.ts
 * @purpose U002 UI validation (Cases 01–03): Ordered from suppliers, Metalworking Warehouse, Assembly Warehouse.
 */

import { test, expect } from '@playwright/test';
import { CreateOrderedFromSuppliersPage } from '../pages/OrderedFromSuppliersPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { extractIdFromSelector } from '../lib/utils/utilities';
import testData1 from '../testdata/U002-PC1.json';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsAssemblyWarehouse from '../lib/Constants/SelectorsAssemblyWarehouse';
import * as SelectorsMetalWorkingWarhouse from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export const runU002_02_UI = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 UI validation - Cases 01–03');

  test('Case 01 - Check all elements on page Ordered from suppliers', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    logger.info('Test Case 01 - Check all elements on page Ordered from suppliers');
    const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
    await allure.step('Step 1: Open the warehouse page', async () => {
      await orderedFromSuppliersPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 2: Open the shortage assemblies page', async () => {
      await orderedFromSuppliersPage.findTable(SelectorsOrderedFromSuppliers.ORDERED_SUPPLIERS_PAGE_TABLE);
      await orderedFromSuppliersPage.waitForNetworkIdle();
    });

    await allure.step('Step 3-4: Validate page headings and buttons', async () => {
      const mainTitle = testData1.elements.MainPage.titles[0];
      const buttons = testData1.elements.MainPage.buttons.map(button => {
        const knownButtonTestIdsByLabel: Record<string, string> = {
          'Создать заказ': extractIdFromSelector(SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON),
        };
        const mappedTestId = button.datatestid || knownButtonTestIdsByLabel[button.label];
        return { ...button, datatestid: mappedTestId || button.datatestid };
      });
      await expectSoftWithScreenshot(
        page,
        async () => {
          const heading = page.getByRole('heading', { level: 3, name: mainTitle });
          await expect.soft(heading.first()).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        `Verify main page heading "${mainTitle}" is visible`,
        test.info(),
      );
      await orderedFromSuppliersPage.validatePageHeadersAndButtons(page, [], buttons, SelectorsOrderedFromSuppliers.ORDERED_SUPPLIERS_PAGE_TABLE, { skipTitleValidation: true, skipNetworkIdle: true });
    });

    await allure.step('Step 05: Проверка свитчера', async () => {
      const switchers = testData1.elements.MainPage.switcher;
      for (const switcher of switchers) {
        const buttonClass = switcher.class;
        const buttonLabel = switcher.label;
        const dataTestId = switcher.datatestid;
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          try {
            const selector = dataTestId ? SelectorsOrderedFromSuppliers.getSelectorByTestId(dataTestId) : buttonClass;
            await orderedFromSuppliersPage.waitAndHighlight(page.locator(selector).first());
          } catch {}
          let isButtonReady = dataTestId
            ? await orderedFromSuppliersPage.isButtonVisibleTestId(page, dataTestId, buttonLabel)
            : await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);
          await expectSoftWithScreenshot(page, async () => { expect.soft(isButtonReady).toBeTruthy(); }, `Verify switcher "${buttonLabel}"`, test.info());
        });
      }
    });

    await allure.step('Step 06: Click on the Create Order button', async () => {
      const createOrderSelector = SelectorsOrderedFromSuppliers.ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON;
      try { await orderedFromSuppliersPage.waitAndHighlight(page.locator(createOrderSelector).first()); } catch {}
      await orderedFromSuppliersPage.clickButton(' Создать заказ ', createOrderSelector);
      try {
        await page.waitForSelector(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT, { state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      } catch {
        await page.waitForSelector(SelectorsOrderedFromSuppliers.SELECT_TYPE_OBJECT_OPERATION_PRODUCT, { state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      }
    });

    await allure.step('Step 07: Проверяем модальное окно на наличие всех кнопок с поставщиками', async () => {
      await orderedFromSuppliersPage.waitForNetworkIdle();
      const buttons = testData1.elements.ModalSelectSupplier.buttons;
      for (const button of buttons) {
        const buttonClass = button.class;
        const buttonLabel = button.label;
        const dataTestId = button.datatestid;
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          const modal = page.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT).first();
          await modal.waitFor({ state: 'visible' });
          if (dataTestId) await orderedFromSuppliersPage.waitAndHighlight(modal.locator(SelectorsOrderedFromSuppliers.getSelectorByTestId(dataTestId)).first());
          let isButtonReady = false;
          if (dataTestId) {
            const btn = page.locator(SelectorsOrderedFromSuppliers.getSelectorByTestId(dataTestId)).first();
            await btn.waitFor({ state: 'visible' });
            isButtonReady = !(await btn.getAttribute('disabled'));
          } else {
            isButtonReady = await orderedFromSuppliersPage.isButtonVisible(page, buttonClass, buttonLabel);
          }
          await expectSoftWithScreenshot(page, async () => { expect.soft(isButtonReady).toBeTruthy(); }, `Verify modal button "${buttonLabel}"`, test.info());
        });
      }
    });

    await allure.step('Step 08: Выбор поставщика "Детали"', async () => {
      const modal = page.locator(`${SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}[open]`);
      await modal.locator(SelectorsOrderedFromSuppliers.SELECT_TYPE_OBJECT_OPERATION_DETAILS).click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await orderedFromSuppliersPage.waitForNetworkIdle();
    });

    await allure.step('Step 09: Проверка модального окна Создание заказа поставщика', async () => {
      const titles = testData1.elements.ModalCreateOrderSupplier.titles.map((t: string) => t.trim());
      // Modal has main title in h3 ("Создание заказа на металлообработку №...") and section in h4 ("Описание/Примечание")
      // Pass bare testId: getAllH3AndH4TitlesInModalTestId expects testId value, not full selector
      const modalTestId = extractIdFromSelector(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_MODAL_TEST_ID);
      await orderedFromSuppliersPage.validateModalH3AndH4Titles(page, modalTestId, titles, {
        allowPartialMatch: true,
        testInfo: test.info(),
      });
    });

    await allure.step('Step 10: Проверяем кнопки в модальном окне Создание заказа поставщика', async () => {
      const buttons = testData1.elements.ModalCreateOrderSupplier.buttons;
      await orderedFromSuppliersPage.validatePageHeadersAndButtons(page, [], buttons, '', { skipTitleValidation: true });
    });

    await allure.step('Step 11: Выбираем первые две строки и сохраняем их данные', async () => {
      const tbody = page.locator(SelectorsOrderedFromSuppliers.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_TBODY).first();
      await tbody.waitFor({ state: 'visible' });
      const row0 = tbody.locator(SelectorsOrderedFromSuppliers.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW0).first();
      const row1 = tbody.locator(SelectorsOrderedFromSuppliers.ORDER_FROM_SUPPLIERS_MODAL_STOCK_ORDER_SUPPLY_TABLE1_ROW1).first();
      await row0.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await row1.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      const rows = [row0, row1];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        await orderedFromSuppliersPage.highlightElement(row);
        const tdCheckbox = row.locator(SelectorsOrderedFromSuppliers.TABLE_ROW_CHECKBOX_SUFFIX).first();
        await tdCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        await tdCheckbox.click();
        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        const checkbox = row.locator(SelectorsOrderedFromSuppliers.TABLE_ROW_CHECKBOX_WRAPPER_SUFFIX).first();
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(checkbox).toBeChecked();
          },
          'Verify row checkbox is checked after click',
          test.info(),
        );
      }
    });

    await allure.step("Step 12: Нажимаем кнопку 'Выбрать' и проверяем выбранные позиции", async () => {
      const chooseBtn = page.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON).first();
      await orderedFromSuppliersPage.waitAndHighlight(chooseBtn);
      const modalId = extractIdFromSelector(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_MODAL_TEST_ID);
      const enabled = await orderedFromSuppliersPage.isButtonVisibleTestId(page, extractIdFromSelector(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_DIALOG_BUTTON), 'Выбрать', true, modalId);
      await expectSoftWithScreenshot(page, async () => { expect.soft(enabled).toBeTruthy(); }, 'Verify "Выбрать" button is enabled', test.info());
      await chooseBtn.click();
      const bottomTable = page.locator(SelectorsOrderedFromSuppliers.MODAL_ADD_ORDER_PRODUCTION_BOTTOM_TABLE).first();
      await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    });
  });

  test('Case 02 - Check all elements on page MetalWorkingWarehouse', async ({ page }) => {
    logger.info('Test Case 02 - Check all elements on page MetalWorkingWarehouse');
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    await allure.step('Step 1: Open the warehouse page', async () => { await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL); });
    await allure.step('Step 2: Open the shortage product page', async () => {
      await page.locator(SelectorsMetalWorkingWarhouse.WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON).click();
      const table = page.locator(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE);
      await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, { minRows: 0 });
    });
    await allure.step('Step 3-4: Validate page headings and buttons', async () => {
      const mainTitle = testData1.elements.MetalworkingWarhouse.titles[0];
      const buttons = testData1.elements.MetalworkingWarhouse.buttons;
      await expectSoftWithScreenshot(page, async () => {
        const heading = page.getByRole('heading', { level: 3, name: mainTitle });
        await expect.soft(heading.first()).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      }, `Verify main page heading "${mainTitle}" is visible`, test.info());
      await metalworkingWarehouse.validatePageHeadersAndButtons(page, [], buttons, SelectorsMetalWorkingWarhouse.SELECTOR_METAL_WORKING_WARHOUSE, { skipTitleValidation: true, skipNetworkIdle: true });
    });
  });

  test('Case 03 - Check all elements on page Assembly Warehouse', async ({ page }) => {
    logger.info('Test Case 03 - Check all elements on page Assembly Warehouse');
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
    await allure.step('Step 1-2: Open the warehouse page and navigate to Assembly Warehouse', async () => {
      await assemblyWarehouse.navigateToPageAndWaitForTable(SELECTORS.MAINMENU.WAREHOUSE.URL, SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE);
    });
    await allure.step('Step 3-4: Validate page headings and buttons', async () => {
      const titles = testData1.elements.AssemblyWarehouse.titles;
      const buttons = testData1.elements.AssemblyWarehouse.buttons;
      await assemblyWarehouse.validatePageHeadersAndButtons(page, titles, buttons, SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON);
    });
  });
};
