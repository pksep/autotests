export const runP011 = (isSingleTest: boolean, iterations: number) => {
  console.log(`Starting test: Verify Order From Suppliers Page Functionality`);

  test.skip('Test Case - Loading task', async ({ page }) => {
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

    await page.waitForLoadState('networkidle');

    await loadingTaskPage.clickButton(
      ' Создать заказ ',
      '[data-testid="IssueShipment-Button-CreateOrder"]'
    );

    await loadingTaskPage.clickButton(
      ' Выбрать ',
      '[data-testid="AddAddOrder-SelectProductButton"]'
    );

    await loadingTaskPage.waitingTableBody(
      '[data-testid="BasePaginationTable-Table-Component"]'
    );
    await page.waitForTimeout(1000);
    await loadingTaskPage.searchTable(
      nameProduct,
      '[data-testid="TableProduct-BasePaginationTable"]'
    );
    await page.waitForTimeout(1000);
    await loadingTaskPage.waitingTableBody(
      '[data-testid="BasePaginationTable-Table-Component"]'
    );

    await loadingTaskPage.choiceProductInModal(nameProduct);

    await page.waitForTimeout(2000);

    await loadingTaskPage.clickButton(
      ' Выбрать ',
      '[data-testid="ModalAllProducts-btn-Select"]'
    );

    await loadingTaskPage.checkProduct(nameProduct);

    await loadingTaskPage.choiceBuyer('5');

    await page.waitForLoadState('networkidle');

    await loadingTaskPage.preservingDescendants(
      descendantsCbedArray,
      descendantsDetailArray
    );

    await loadingTaskPage.clickButton(
      ' Сохранить Заказ ',
      '[data-testid="AddOrder-Button-SaveOrder"]'
    );
  });

  test.skip('Test Case - Launch Into Production Product', async ({ page }) => {
    const shortageProduct = new CreateShortageProductPage(page);
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector =
      '[data-testid="Sclad-deficitProduction-deficitProduction"]';
    await shortageProduct.findTable(selector);

    await page.waitForLoadState('networkidle');

    const deficitTable = '[data-testid="DeficitIzd-ScrollTable"]';
    await shortageProduct.waitingTableBody(deficitTable);

    await shortageProduct.searchTable(nameProduct, deficitTable);

    await shortageProduct.waitingTableBody(deficitTable);

    await shortageProduct.checkboxMarkNameInLineFromFirstRow(
      nameProduct,
      deficitTable
    );

    await shortageProduct.waitingTableBody(deficitTable);

    await shortageProduct.getValueOrClickFromFirstRow(deficitTable, 17);

    await shortageProduct.clickButton(
      ' Запустить в производство ',
      '[data-testid="DeficitIzd-StartButton"]'
    );

    await shortageProduct.checkModalWindowLaunchIntoProduction();

    await shortageProduct.checkCurrentDate(
      '[data-testid="ModalStartProduction-OrderDateValue"]'
    );

    await shortageProduct.checkOrderQuantity('1', '1');

    const checkOrderNumber = await shortageProduct.checkOrderNumber();
    console.log(`Полученный номер заказа: ${checkOrderNumber}`);

    await shortageProduct.clickButton(' В производство ', '.btn-status');

    await shortageProduct.getMessage(checkOrderNumber);
  });

  test.skip('Test Case - Launch Into Production Assemply', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const shortageAssemblies = new CreatShortageAssembliesPage(page);

    await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-deficitCbed-deficitCbed"]';
    await shortageAssemblies.findTable(selector);

    const deficitTable = '[data-testid="DeficitCbed-ScrollTable"]';
    await shortageAssemblies.waitingTableBody(deficitTable);

    for (const cbed of descendantsCbedArray) {
      await shortageAssemblies.searchTable(cbed.designation, deficitTable);

      await shortageAssemblies.waitingTableBody(deficitTable);

      await shortageAssemblies.checkboxMarkNameInLineFromFirstRow(
        cbed.designation,
        deficitTable
      );

      await shortageAssemblies.waitingTableBody(deficitTable);

      await shortageAssemblies.getValueOrClickFromFirstRow(deficitTable, 18);

      await shortageAssemblies.clickButton(
        ' Запустить в производство ',
        '[data-testid="DeficitCbed-StartButton"]'
      );

      await shortageAssemblies.checkModalWindowLaunchIntoProduction();

      await shortageAssemblies.checkCurrentDate(
        '[data-testid="ModalStartProduction-OrderDateValue"]'
      );

      await shortageAssemblies.checkOrderQuantity('1', '1');

      const checkOrderNumber = await shortageAssemblies.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);

      await shortageAssemblies.clickButton(' В производство ', '.btn-status');

      await shortageAssemblies.getMessage(checkOrderNumber);
      await shortageAssemblies.closeSuccessMessege();
    }
  });

  test.skip('Test Case - Launch Into Production Parts', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const shortageParts = new CreatShortagePartsPage(page);

    await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-deficitDetal-deficitDetal"]';
    await shortageParts.findTable(selector);

    const deficitTable = '.scroll-table';
    await shortageParts.waitingTableBody(deficitTable);

    for (const part of descendantsDetailArray) {
      await page.waitForLoadState('networkidle');
      await shortageParts.searchTable(part.designation, deficitTable);
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(1000);

      await shortageParts.waitingTableBody(deficitTable);

      await shortageParts.checkNameInLineFromFirstRowBUG(
        part.designation,
        deficitTable
      );

      await shortageParts.waitingTableBody(deficitTable);

      // await shortageParts.getValueOrClickFromFirstRow(deficitTable, 20);

      await shortageParts.clickButton(
        ' Запустить в производство ',
        '[data-testid="DeficitDetal-StartButton"]'
      );

      await shortageParts.checkModalWindowLaunchIntoProduction();

      await shortageParts.checkCurrentDate(
        '[data-testid="ModalStartProduction-OrderDateValue"]'
      );

      await shortageParts.checkOrderQuantity('1', '1');

      const checkOrderNumber = await shortageParts.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);

      await shortageParts.clickButton(' В производство ', '.btn-status');

      await shortageParts.getMessage(checkOrderNumber);
      await shortageParts.closeSuccessMessege();
    }
  });

  test.skip('Test Case - Marking parts', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-stockOrderMetalworking"]';
    await metalworkingWarehouse.findTable(selector);

    const tableMetalworkingWarehouse =
      '[data-testid="MetalloworkingSclad-ScrollTable"]';

    for (const part of descendantsDetailArray) {
      await metalworkingWarehouse.searchTable(
        part.designation,
        tableMetalworkingWarehouse
      );

      await page.waitForLoadState('networkidle');

      await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse);

      await metalworkingWarehouse.checkNameInLineFromFirstRow(
        part.designation,
        tableMetalworkingWarehouse
      );

      await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse);

      await metalworkingWarehouse.clickIconOperation(
        tableMetalworkingWarehouse,
        12,
        Click.Yes
      );

      await page.waitForLoadState('networkidle');

      await metalworkingWarehouse.productionPathDetailskModalWindow();

      const productionTable = '[data-testid="OperationPathInfo-table"]';
      await metalworkingWarehouse.waitingTableBody(productionTable);
      await metalworkingWarehouse.getValueOrClickFromFirstRow(
        productionTable,
        7,
        Click.Yes
      );

      const firstOperation =
        await metalworkingWarehouse.getValueOrClickFromFirstRow(
          productionTable,
          2
        );
      console.log(firstOperation);
      logger.info(firstOperation);

      await metalworkingWarehouse.clickButton(
        ' Добавить Отметку для выбранной операции ',
        '[data-testid="ModalOperationPathMetaloworking-add-mark-button"]'
      );

      // Ожидаем загрузки
      await page.waitForLoadState('networkidle');

      // Проверяем модальное окно отметки о выполнении
      await metalworkingWarehouse.completionMarkModalWindow(
        firstOperation,
        part.name,
        part.designation
      );

      await metalworkingWarehouse.clickButton(
        ' Сохранить Отметку ',
        '.btn-status'
      );

      await metalworkingWarehouse.productionPathDetailskModalWindow();
      await metalworkingWarehouse.waitingTableBody(productionTable);

      await page.mouse.dblclick(1, 1);

      await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse);
    }
  });

  test.skip('Test Case - Complete Set Of Assemblies', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    // Удалить после успеха
    // const cbedName = 'Распределитель пневматический (3-х позиционный)СБ';
    // const cbedDesignation = '110.02-00СБ';
    // const loadingTaskPage = new CreateLoadingTaskPage(page);
    // await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

    // await page.waitForLoadState('networkidle');

    // await loadingTaskPage.clickButton(
    //   ' Создать заказ ',
    //   '[data-testid="IssueShipment-Button-CreateOrder"]'
    // );

    // await loadingTaskPage.clickButton(
    //   ' Выбрать ',
    //   '[data-testid="AddAddOrder-SelectProductButton"]'
    // );

    // await loadingTaskPage.waitingTableBody(
    //   '[data-testid="BasePaginationTable-Table-Component"]'
    // );
    // await page.waitForTimeout(1000);
    // await loadingTaskPage.searchTable(
    //   nameProduct,
    //   '[data-testid="TableProduct-BasePaginationTable"]'
    // );
    // await page.waitForTimeout(1000);
    // await loadingTaskPage.waitingTableBody(
    //   '[data-testid="BasePaginationTable-Table-Component"]'
    // );

    // await loadingTaskPage.choiceProductInModal(nameProduct);

    // await page.waitForTimeout(2000);

    // await loadingTaskPage.clickButton(
    //   ' Выбрать ',
    //   '[data-testid="ModalAllProducts-btn-Select"]'
    // );

    // await loadingTaskPage.checkProduct(nameProduct);

    // await loadingTaskPage.choiceBuyer('5');

    // await page.waitForLoadState('networkidle');

    // await loadingTaskPage.preservingDescendants(
    //   descendantsCbedArray,
    //   descendantsDetailArray
    // );
    // Удалить после успеха

    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(
      page
    );

    await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-completionCbedPlan"]';
    await completingAssembliesToPlan.findTable(selector);

    const TableComplect = '[data-testid="TableComplect-TableComplect-Table"]';

    await page.waitForLoadState('networkidle');

    for (const cbed of descendantsCbedArray) {
      await completingAssembliesToPlan.waitingTableBody(TableComplect);
      await completingAssembliesToPlan.searchTable(
        cbed.designation,
        TableComplect
      );

      await page.waitForLoadState('networkidle');

      await completingAssembliesToPlan.waitingTableBody(TableComplect);

      const test = await completingAssembliesToPlan.getValueOrClickFromFirstRow(
        TableComplect,
        3
      );
      console.log(`Проверка текста ${test}`);
      await completingAssembliesToPlan.getValueOrClickFromFirstRow(
        TableComplect,
        3,
        Click.No,
        Click.Yes
      );

      await page.waitForLoadState('networkidle');

      await completingAssembliesToPlan.assemblyInvoiceModalWindow(
        TypeInvoice.Сборка,
        true
      );

      await completingAssembliesToPlan.clickButton(
        ' Скомплектовать в набор ',
        '[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]'
      );

      await page.waitForLoadState('networkidle');
    }
  });

  test.skip('Test Case - Warehouse Stock Before', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const stock = new CreateStockPage(page);

    // Проверяем количество детайлей на складе до оприходования
    await stock.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    const selector = '[data-testid="Sclad-residuals-residuals"]';
    await stock.findTable(selector);

    // Удалить после успеха
    const designationDetail = '119.01-04.01.02';

    const tablePartsWarehouseStock = '.scroll-table.detal';
    await stock.waitingTableBody(tablePartsWarehouseStock);

    await stock.searchTable(designationDetail, tablePartsWarehouseStock);
    await stock.waitingTableBody(tablePartsWarehouseStock);

    await stock.checkNameInLineFromFirstRow(
      designationDetail,
      tablePartsWarehouseStock
    );

    remainingStockBefore = await stock.getValueOrClickFromFirstRow(
      tablePartsWarehouseStock,
      3
    );

    console.log(
      `Количество ${designationDetail} на складе до оприходования  ${remainingStockBefore}`
    );
  });

  test.skip('Test Case - Receiving part', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    // Удалить после успеха
    const designationDetail = '119.01-04.01.02';
    // Удалить после успеха
    // const cbedName = 'Распределитель пневматический (3-х позиционный)СБ';
    // const cbedDesignation = '110.02-00СБ';
    // const loadingTaskPage = new CreateLoadingTaskPage(page);
    // await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);

    // await page.waitForLoadState('networkidle');

    // await loadingTaskPage.clickButton(
    //   ' Создать заказ ',
    //   '[data-testid="IssueShipment-Button-CreateOrder"]'
    // );

    // await loadingTaskPage.clickButton(
    //   ' Выбрать ',
    //   '[data-testid="AddAddOrder-SelectProductButton"]'
    // );

    // await loadingTaskPage.waitingTableBody(
    //   '[data-testid="BasePaginationTable-Table-Component"]'
    // );
    // await page.waitForTimeout(1000);
    // await loadingTaskPage.searchTable(
    //   nameProduct,
    //   '[data-testid="TableProduct-BasePaginationTable"]'
    // );
    // await page.waitForTimeout(1000);
    // await loadingTaskPage.waitingTableBody(
    //   '[data-testid="BasePaginationTable-Table-Component"]'
    // );

    // await loadingTaskPage.choiceProductInModal(nameProduct);

    // await page.waitForTimeout(2000);

    // await loadingTaskPage.clickButton(
    //   ' Выбрать ',
    //   '[data-testid="ModalAllProducts-btn-Select"]'
    // );

    // await loadingTaskPage.checkProduct(nameProduct);

    // await loadingTaskPage.choiceBuyer('5');

    // await page.waitForLoadState('networkidle');

    // await loadingTaskPage.preservingDescendants(
    //   descendantsCbedArray,
    //   descendantsDetailArray
    // );
    // Удалить после успеха

    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );

    await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector =
      '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
    await stockReceipt.findTable(selector);

    const tableStockReciept =
      '[data-testid="TableComplect-TableComplect-Table"]';

    await page.waitForLoadState('networkidle');

    await stockReceipt.clickButton(
      ' Создать Приход ',
      '[data-testid="ComingToSclad-Button-MakeComing"]'
    );

    await stockReceipt.selectStockReceipt(StockReceipt.Металлообработка);

    const tableStockRecieptModalWindow =
      '[data-testid="ModalComingTable-TableScroll"]';

    await page.waitForLoadState('networkidle');
    await stockReceipt.waitingTableBody(tableStockRecieptModalWindow);

    await stockReceipt.searchTable(
      designationDetail,
      tableStockRecieptModalWindow
    );

    await page.waitForLoadState('networkidle');

    await stockReceipt.waitingTableBody(tableStockRecieptModalWindow);

    await stockReceipt.inputQuantityInCell('1');

    await stockReceipt.getValueOrClickFromFirstRowNoThead(
      tableStockRecieptModalWindow,
      1,
      Click.Yes,
      Click.No
    );

    await stockReceipt.checkNameInLineFromFirstRow(
      designationDetail,
      '[data-testid="ModalComing-SelectedItems-TableScroll"]'
    );

    await stockReceipt.clickButton(
      ' Создать приход ',
      '[data-testid="ModalComing-DocumentAttachment-CreateIncomeButton"]'
    );
  });

  test.skip('Test Case - Warehouse Stock After', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const stock = new CreateStockPage(page);

    // Проверяем количество детайлей на складе до оприходования
    await stock.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    const selector = '[data-testid="Sclad-residuals-residuals"]';
    await stock.findTable(selector);

    // Удалить после успеха
    const designationDetail = '119.01-04.01.02';

    const tablePartsWarehouseStock = '.scroll-table.detal';
    await stock.waitingTableBody(tablePartsWarehouseStock);

    await stock.searchTable(designationDetail, tablePartsWarehouseStock);
    await stock.waitingTableBody(tablePartsWarehouseStock);

    await stock.checkNameInLineFromFirstRow(
      designationDetail,
      tablePartsWarehouseStock
    );

    remainingStockAfter = await stock.getValueOrClickFromFirstRow(
      tablePartsWarehouseStock,
      3
    );

    console.log(
      `Количество ${designationDetail} на складе до оприходования  ${remainingStockBefore} и после оприходования ${remainingStockAfter}`
    );
  });

  test('Test Case - Receiving cbed', async ({ page }) => {
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(
      page
    );

    const designationCbed = 'Гидравлическая станция (ГофроКомбинат)';
    await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector =
      '[data-testid="Sclad-receiptsWarehouseForSuppliersAndProduction"]';
    await stockReceipt.findTable(selector);

    const tableStockReciept =
      '[data-testid="TableComplect-TableComplect-Table"]';

    await page.waitForLoadState('networkidle');

    await stockReceipt.clickButton(
      ' Создать Приход ',
      '[data-testid="ComingToSclad-Button-MakeComing"]'
    );

    await stockReceipt.selectStockReceipt(StockReceipt.Сборка);

    const tableStockRecieptModalWindow =
      '[data-testid="ModalComingTable-TableScroll"]';

    await page.waitForLoadState('networkidle');
    await stockReceipt.waitingTableBody(tableStockRecieptModalWindow);

    await stockReceipt.searchTable(
      designationCbed,
      tableStockRecieptModalWindow
    );

    await page.waitForLoadState('networkidle');

    await stockReceipt.waitingTableBody(tableStockRecieptModalWindow);

    await stockReceipt.getValueOrClickFromFirstRowNoThead(
      tableStockRecieptModalWindow,
      1,
      Click.Yes,
      Click.No
    );

    const modalWindowCompleteSets = await stockReceipt.waitingTableBody(
      '[data-testid="ModalKitsList-Table"]'
    );

    await stockReceipt.checkNameInLineFromFirstRow(
      designationCbed,
      '[data-testid="ModalComing-SelectedItems-TableScroll"]'
    );
  });

  test.skip('Test Case - Archive warehouse task', async ({ page }) => {
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-stockOrderAssembly"]';
    await assemblyWarehouse.findTable(selector);

    await page.waitForLoadState('networkidle');

    const WarehouseTable = '[data-testid="AssemblySclad-Table"]';
    await assemblyWarehouse.waitingTableBody(WarehouseTable);

    await assemblyWarehouse.searchTable(nameProduct, WarehouseTable);

    await assemblyWarehouse.waitingTableBody(WarehouseTable);

    await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
      nameProduct,
      WarehouseTable
    );

    await assemblyWarehouse.getValueOrClickFromFirstRow(
      WarehouseTable,
      16,
      Click.Yes
    );

    await assemblyWarehouse.clickButton(
      ' Переместить в архив ',
      '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
    );

    await assemblyWarehouse.clickButton(
      ' Подтвердить ',
      '[data-testid="ModalPromptMini-Button-Confirm"]'
    );
  });

  test.skip('Test Case - Archive warehouse task all', async ({ page }) => {
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-stockOrderAssembly"]';
    await assemblyWarehouse.findTable(selector);

    await page.waitForLoadState('networkidle');

    const WarehouseTable = '[data-testid="AssemblySclad-Table"]';
    await assemblyWarehouse.waitingTableBody(WarehouseTable);

    await assemblyWarehouse.searchTable(designationProduct, WarehouseTable);

    await assemblyWarehouse.waitingTableBody(WarehouseTable);

    await assemblyWarehouse.checkboxMarkNameInLineFromFirstRow(
      designationProduct,
      WarehouseTable
    );

    await assemblyWarehouse.clickOnTheTableHeaderCell(16, WarehouseTable);

    await assemblyWarehouse.clickButton(
      ' Переместить в архив ',
      '[data-testid="AssemblySclad-PrintControls-ArchiveButton"]'
    );

    await assemblyWarehouse.clickButton(
      ' Подтвердить ',
      '[data-testid="ModalPromptMini-Button-Confirm"]'
    );
  });
};

let remainingStockBefore: string;
let remainingStockAfter: string;
const nameProduct = 'Император Человечества';
const designationProduct = '0Т3';
const descendantsCbedArray: ISpetificationData[] = [];
const descendantsDetailArray: ISpetificationData[] = [];

import { test, expect } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreatShortageAssembliesPage } from '../pages/ShortageAssembliesPage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import {
  CreateStockReceiptFromSupplierAndProductionPage,
  StockReceipt
} from '../pages/StockReceiptFromSupplierAndProductionPage';
import { CreateStockPage } from '../pages/StockPage';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { CreateShortageProductPage } from '../pages/ShortageProductPage';
import { ISpetificationData, Click, TypeInvoice } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import logger from '../lib/logger';
import { cli } from 'winston/lib/winston/config';
