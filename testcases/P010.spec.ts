import { test, expect } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec'; //
import {
  CreateOrderedFromSuppliersPage,
  Supplier
} from '../pages/OrderedFromSuppliersPage';
// import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS } from '../config';

export const runP010 = (isSingleTest: boolean, iterations: number) => {
  console.log(`Starting test: Verify Order From Suppliers Page Functionality`);

  test('Test Case - Create Metalworking Work', async ({ page }) => {
    // Количество запускоемого в производство
    let qunatityOrder = '2';

    const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);

    await performLogin(page, '001', 'Перов Д.А.', '54321');
    await page.click('button.btn.blues');

    await orderedFromSuppliersPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

    const selector = '[data-testid="Sclad-orderingSuppliers"]';
    await orderedFromSuppliersPage.findTable(selector);

    await page.waitForLoadState('networkidle');

    await page.click('.btn-add');

    await orderedFromSuppliersPage.selectSupplier(Supplier.Детали);

    await orderedFromSuppliersPage.searchModalWindow('Адептус механикус');
    await page.waitForLoadState('networkidle');

    await orderedFromSuppliersPage.checkTheBox();

    await orderedFromSuppliersPage.enteringOrderQuantity(qunatityOrder);

    await orderedFromSuppliersPage.clickButton(
      'Заказать',
      '[data-testid="ModalAddOrder-ProductionTable-OrderButton"]'
    );
    await orderedFromSuppliersPage.checkOrderQuantity(qunatityOrder);

    await orderedFromSuppliersPage.clickButton(
      ' Заказать ',
      '[data-testid="ModalAddOrder-ProductionTable-OrderButton"]'
    );

    await orderedFromSuppliersPage.checkModalWindowLaunchIntoProduction();

    await orderedFromSuppliersPage.checkCurrentDate(
      '[data-testid="ModalStartProduction-OrderDateValue"]'
    );

    const checkOrderNumber = await orderedFromSuppliersPage.checkOrderNumber();
    console.log(`Полученный номер заказа: ${checkOrderNumber}`);

    await orderedFromSuppliersPage.clickButton(
      ' В производство ',
      '.btn-status'
    );

    await orderedFromSuppliersPage.getMessage(checkOrderNumber);

    await orderedFromSuppliersPage.clickButton(
      ' Отменить ',
      '[data-testid="ModalAddOrder-ProductionTable-CancelButton"]'
    );

    await orderedFromSuppliersPage.searchTable(
      'Адептус механикус',
      '[data-testid="OrderSuppliers-ScrollTable-TableContainer"]'
    );

    await orderedFromSuppliersPage.waitingTableBody(
      '[data-testid="OrderSuppliers-ScrollTable-TableContainer"]'
    );

    await orderedFromSuppliersPage.compareOrderNumbers(checkOrderNumber);
  });
};
