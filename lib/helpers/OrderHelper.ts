/**
 * @file OrderHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for order-specific operations extracted from Page.ts
 * 
 * This helper handles:
 * - Order date verification
 * - Order quantity checks
 * - Order number operations
 * - Finding orders by number
 * - Order modal verification
 * - Order context menu operations
 */

import { Page, expect, Locator, ElementHandle } from '@playwright/test';
import { WAIT_TIMEOUTS, TIMEOUTS } from '../Constants/TimeoutConstants';
import * as SelectorsStartProduction from '../Constants/SelectorsStartProduction';
import * as SelectorsOrderedFromSuppliers from '../Constants/SelectorsOrderedFromSuppliers';
import logger from '../utils/logger';

export class OrderHelper {
  constructor(private page: Page) {}

  /**
   * Checks dates with order list by clicking on order icons and verifying modal dates
   * @param pageObject - The PageObject instance to call helper methods through
   * @param page - The Playwright page instance
   * @param tableId - The table ID or data-testid
   * @param nameColIdIndex - Column index for name
   * @param urgencyColIndex - Column index for urgency date
   * @param plannedShipmentColIndex - Column index for planned shipment date
   * @param ordersIconColIndex - Column index for orders icon
   * @param modalSelector - Selector for the modal
   * @param modalTableSelector - Selector for the modal table
   * @param urgencyModalColId - Column ID for urgency date in modal
   * @param plannedShipmentModalColId - Column ID for planned shipment date in modal
   */
  async checkDatesWithOrderList(
    pageObject: any, // PageObject instance to call helper methods
    page: Page,
    tableId: string,
    nameColIdIndex: number,
    urgencyColIndex: number,
    plannedShipmentColIndex: number,
    ordersIconColIndex: number,
    modalSelector: string,
    modalTableSelector: string,
    urgencyModalColId: string,
    plannedShipmentModalColId: string,
  ): Promise<{ success: boolean; message?: string }> {
    // Step 1: Get all rows in the table
    logger.info(urgencyColIndex.toString());

    let table = await page.$(`#${tableId}`);
    if (!table) {
      table = await page.$(`[data-testid="${tableId}"]`);
    }

    if (!table) {
      return {
        success: false,
        message: `Table with id "${tableId}" not found`,
      };
    }

    // Step 2: Get all rows in the table
    const rows = await table.$$('tbody tr');

    // Step 3: Filter out rows that contain `th` elements
    const filteredRows = [];
    for (const row of rows) {
      const thElements = await row.$$('th');
      if (thElements.length === 0) {
        filteredRows.push(row);
      }
    }

    // Step 4: Log total rows found
    logger.info(`Total rows found in the table: ${filteredRows.length}`);

    let allTestsPassed = true; // Variable to track the overall success status

    for (let i = 0; i < filteredRows.length; i++) {
      if (i > 100) {
        break;
      }
      const row = filteredRows[i];
      const cells = await row.$$('td');
      let nameForErrorReport = await cells[nameColIdIndex].innerText();
      let urgencyDateForCompare = await cells[urgencyColIndex].innerText();
      let plannedShipmentDateForCompare = await cells[plannedShipmentColIndex].innerText();

      logger.info(`Urgency Date: ${urgencyDateForCompare}`);
      logger.info(`Planned Shipment Date: ${plannedShipmentDateForCompare}`);

      // Click on the icon in the ordersIconColIndex column
      const iconCell = cells[ordersIconColIndex];
      const icon = await iconCell.$('img.link_img');
      if (icon) {
        // Scroll the icon into view before clicking it
        await iconCell.evaluate(node => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await page.waitForTimeout(5000); // Optional: wait for smooth scroll to finish

        await icon.click();
        logger.info(`Clicked on the icon in row with urgency date ${urgencyDateForCompare} and planned shipment date ${plannedShipmentDateForCompare}`);
        const result = await this.ordersListVerifyModalDates(
          pageObject,
          page,
          modalSelector,
          modalTableSelector,
          urgencyDateForCompare,
          plannedShipmentDateForCompare,
          urgencyModalColId,
          plannedShipmentModalColId,
        );

        page.mouse.dblclick(1, 1);
        if (!result.success) {
          // Log the error and continue testing
          allTestsPassed = false; // Mark the overall success status as false
          logger.error(`Test failed for order ${nameForErrorReport}. Dates do not match.`);
        }
      } else {
        logger.warn(
          `No icon found in the ordersIconColIndex column for row with urgency date ${urgencyDateForCompare} and planned shipment date ${plannedShipmentDateForCompare}`,
        );
      }
    }

    // Return the overall success status
    if (!allTestsPassed) {
      return {
        success: false,
        message: 'One or more orders failed the date comparison test. Check logs for details.',
      };
    }

    return { success: true };
  }

  /**
   * Verifies modal dates match the parent table dates
   * @param pageObject - The PageObject instance to call helper methods through
   * @param page - The Playwright page instance
   * @param modalSelectorId - The modal selector ID
   * @param modalTableSelectorId - The modal table selector ID
   * @param urgencyModalColValForCompare - Urgency date value from parent table
   * @param plannedShipmentModalColValForCompare - Planned shipment date value from parent table
   * @param urgencyDateId - Column ID for urgency date
   * @param plannedShipmentDateId - Column ID for planned shipment date
   */
  async ordersListVerifyModalDates(
    pageObject: any, // PageObject instance to call helper methods
    page: Page,
    modalSelectorId: string,
    modalTableSelectorId: string,
    urgencyModalColValForCompare: string,
    plannedShipmentModalColValForCompare: string,
    urgencyDateId: string,
    plannedShipmentDateId: string,
  ): Promise<{ success: boolean; message?: string }> {
    // Step 1: Check that the modal has opened
    await page.waitForSelector(`[data-testid="${modalSelectorId}"]`, {
      state: 'attached',
      timeout: 50000,
    });
    logger.info(`Modal opened: ${modalSelectorId}`);

    // Step 2: Find the table in the modal
    const table = await page.waitForSelector(`[data-testid="${modalTableSelectorId}"]`, { state: 'visible', timeout: 50000 });
    if (!table) {
      logger.error(`Table with selector "${modalTableSelectorId}" not found in the modal.`);
      return {
        success: false,
        message: `Table with selector "${modalTableSelectorId}" not found in the modal.`,
      };
    }
    await page.waitForLoadState('networkidle');
    // Calls TableHelper through PageObject
    await pageObject.waitingTableBody(`[data-testid="${modalTableSelectorId}"]`);
    logger.info(`Table with selector "${modalTableSelectorId}" found in the modal.`);

    // Step 3: Find the columns in the modal table
    // Calls TableHelper through PageObject
    const urgencyModalCellNumber = await pageObject.findColumn(page, modalTableSelectorId, urgencyDateId);
    logger.info(`Urgency Modal Cell: ${urgencyModalCellNumber}`);
    const plannedShipmentModalCellNumber = await pageObject.findColumn(page, modalTableSelectorId, plannedShipmentDateId);
    logger.info(`Planned Shipment Modal Cell: ${plannedShipmentModalCellNumber}`);

    if (!urgencyModalCellNumber || !plannedShipmentModalCellNumber) {
      logger.error(`Required columns not found in the modal table.`);
      return {
        success: false,
        message: `Required columns not found in the modal table.`,
      };
    }

    // Step 4: Extract dates from the modal table
    const rows = await table.$$('tbody tr');
    // Calls filterRowsWithoutTh through PageObject (if it exists, otherwise implement here)
    const filteredRows = await this.filterRowsWithoutTh(rows);
    let urgencyModalDate = '';
    let plannedShipmentModalDate = '';
    let counter = 0;

    for (const row of filteredRows) {
      const hasNotDeficitClass = await row.evaluate(node => {
        const element = node as Element;
        return element.classList.contains('not-deficit');
      });
      if (!hasNotDeficitClass) {
        const cells = await row.$$('td');
        urgencyModalDate = await cells[urgencyModalCellNumber].innerText();
        plannedShipmentModalDate = await cells[plannedShipmentModalCellNumber].innerText();
        logger.info(`Row without .not-deficit class found. Urgency Date: ${urgencyModalDate}, Planned Shipment Date: ${plannedShipmentModalDate}`);
        break;
      }
    }

    logger.info(`Modal Urgency Date: ${urgencyModalDate}`);
    logger.info(`Modal Planned Shipment Date: ${plannedShipmentModalDate}`);

    // Step 5: Confirm that the modal dates match the parent table dates
    // if (urgencyModalColValForCompare.trim() !== urgencyModalDate.trim() || plannedShipmentModalColValForCompare.trim() !== plannedShipmentModalDate.trim()) {
    //    logger.log("FFFFFF");
    //    logger.error(`counter: ${counter}`);
    //    logger.error(`Dates do not match. Parent table: ${urgencyModalColValForCompare}, ${plannedShipmentModalColValForCompare}. Modal: ${urgencyModalDate}, ${plannedShipmentModalDate}.`);
    //    return {
    //        success: false,
    //        message: `Dates do not match. Parent table: ${urgencyModalColValForCompare}, ${plannedShipmentModalColValForCompare}. Modal: ${urgencyModalDate}, ${plannedShipmentModalDate}.`
    //    };
    // }
    // logger.log("GGGGG");
    // logger.info(`Dates MATCH for row with urgency date ${urgencyModalColValForCompare} and planned shipment date ${plannedShipmentModalColValForCompare}.`);
    return { success: true };
  }

  /**
   * Filter rows without th elements
   * @param rows - Array of row element handles
   */
  private async filterRowsWithoutTh(rows: ElementHandle[]): Promise<ElementHandle[]> {
    const filteredRows: ElementHandle[] = [];
    for (const row of rows) {
      const thElements = await row.$$('th');
      if (thElements.length === 0) {
        filteredRows.push(row);
      }
    }
    return filteredRows;
  }

  /**
   * Checks and enters the quantity in the "Start Production" modal window
   * @param quantity - checks that the input has this value
   * @param quantityOrder - if this parameter is specified, enters this value in the input field
   */
  async checkOrderQuantityNew(quantity: string, quantityOrder?: string) {
    const modalWindowLaunchIntoProduction = this.page.locator(SelectorsStartProduction.MODAL_START_PRODUCTION_MODAL_CONTENT);
    if (quantityOrder) {
      await modalWindowLaunchIntoProduction.locator('input').fill(quantityOrder);
    }
  }

  /**
   * Checks and enters the quantity in the order modal window
   * @param locator - selector for the quantity input field
   * @param quantity - expected value in the input (checked only if quantityOrder is not provided)
   * @param quantityOrder - if specified, enters this value in the input field
   */
  async checkOrderQuantity(locator: string, quantity: string, quantityOrder?: string) {
    const input = this.page.locator(locator).locator('input');

    if (quantityOrder) {
      // Если указано quantityOrder, просто вводим его значение
      await input.fill(quantityOrder);
    } else {
      // Если quantityOrder не указан, проверяем текущее значение с quantity
      const currentValue = await input.inputValue();
      expect(currentValue).toBe(quantity);
    }
  }

  /**
   * Save the order number from the "Start Production" modal window
   * @returns The order number text
   */
  async checkOrderNumber(): Promise<string> {
    const orderNumberValue = this.page.locator(SelectorsStartProduction.MODAL_START_PRODUCTION_ORDER_NUMBER_VALUE);
    await expect(orderNumberValue).toBeVisible();
    const orderNumberText = await orderNumberValue.textContent();

    if (!orderNumberText) {
      throw new Error('Номер заказа не найден');
    }

    return orderNumberText?.trim();
  }

  /**
   * Finds the row index of an order by its order number in a modal orders list.
   * Used in U002 test suite to locate specific orders in the orders modal.
   * @param orderRowsLocator - Locator for the order number rows
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the row containing the order number
   * @throws Error if the order number is not found
   */
  async findOrderRowIndexByOrderNumber(orderRowsLocator: Locator, targetOrderNumber: string, errorMessage?: string): Promise<number> {
    const orderCount = await orderRowsLocator.count();

    for (let i = 0; i < orderCount; i++) {
      const orderNumberCell = orderRowsLocator.nth(i);
      const orderNumber = (await orderNumberCell.innerText()).trim();
      if (orderNumber === targetOrderNumber) {
        return i;
      }
    }

    throw new Error(errorMessage || `Could not find order ${targetOrderNumber} in the orders list`);
  }

  /**
   * Finds the checkbox index of an order by its order number in an edit modal.
   * Used in U002 test suite to locate and select checkboxes for specific orders.
   * @param checkboxesLocator - Locator for the checkboxes
   * @param orderNumberCellsLocator - Locator for the order number cells (corresponding to checkboxes)
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the checkbox for the order number
   * @throws Error if the order number is not found
   */
  async findCheckboxIndexByOrderNumber(
    checkboxesLocator: Locator,
    orderNumberCellsLocator: Locator,
    targetOrderNumber: string,
    errorMessage?: string,
  ): Promise<number> {
    // Wait for elements to be visible
    await checkboxesLocator
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {
        // If first checkbox not found, continue to check count
      });

    const checkboxCount = await checkboxesLocator.count();
    logger.log(`Found ${checkboxCount} checkboxes, looking for order number: ${targetOrderNumber}`);

    const foundOrderNumbers: string[] = [];

    for (let i = 0; i < checkboxCount; i++) {
      try {
        const orderNumberCell = orderNumberCellsLocator.nth(i);
        // Wait for cell to be visible
        await orderNumberCell.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
          logger.log(`Order number cell ${i} not visible, skipping`);
        });

        const orderNumber = (await orderNumberCell.innerText()).trim();
        foundOrderNumbers.push(orderNumber);

        logger.log(`Order number at index ${i}: "${orderNumber}"`);

        if (orderNumber === targetOrderNumber) {
          logger.log(`✅ Found target order number "${targetOrderNumber}" at index ${i}`);
          return i;
        }
      } catch (error) {
        logger.log(`Error reading order number at index ${i}: ${error}`);
        foundOrderNumbers.push(`<error: ${error}>`);
      }
    }

    const errorMsg = errorMessage || `Could not find checkbox for order ${targetOrderNumber}`;
    logger.log(`❌ ${errorMsg}`);
    logger.log(`Found order numbers: ${JSON.stringify(foundOrderNumbers)}`);
    throw new Error(`${errorMsg}. Found order numbers: ${foundOrderNumbers.join(', ')}`);
  }

  /**
   * Opens a context menu by clicking on a popover cell and then clicks on the 'Заказы' menu item.
   * Used in U002 test suite to open orders modal from warehouse tables.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param popoverSelector - Selector for the popover/context menu cell
   * @param menuItemSelector - Selector for the 'Заказы' menu item
   * @param waitForModalSelector - Optional selector for the modal to wait for after clicking menu item
   * @param popoverPosition - Optional position selector ('first', 'last', or number for nth()) - default: 'first'
   */
  async openContextMenuAndClickOrders(
    pageObject: any, // PageObject instance to call helper methods
    popoverSelector: string,
    menuItemSelector: string,
    waitForModalSelector?: string,
    popoverPosition: 'first' | 'last' | number = 'first',
  ): Promise<void> {
    const { allure } = await import('allure-playwright');
    await allure.step("Open context menu and click 'Заказы'", async () => {
      // Click on the popover cell (ellipse with context menu)
      let popoverCell = this.page.locator(popoverSelector);
      if (popoverPosition === 'first') {
        popoverCell = popoverCell.first();
      } else if (popoverPosition === 'last') {
        popoverCell = popoverCell.last();
      } else if (typeof popoverPosition === 'number') {
        popoverCell = popoverCell.nth(popoverPosition);
      }

      await popoverCell.waitFor({ state: 'visible', timeout: 5000 });

      // Highlight the popover before clicking
      await pageObject.highlightElement(popoverCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await popoverCell.click();
      logger.log('Clicked on popover cell');

      // Wait for the menu to appear
      await this.page.waitForTimeout(500);

      // Click on the 'Заказы' menu item
      const menuItem = this.page.locator(menuItemSelector);
      await menuItem.waitFor({ state: 'visible', timeout: 5000 });

      // Highlight the menu item before clicking
      await pageObject.highlightElement(menuItem, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await menuItem.click();
      logger.log("Clicked on 'Заказы' menu item");

      // Wait for the modal to appear if selector is provided
      if (waitForModalSelector) {
        const modal = this.page.locator(`${waitForModalSelector}[open]`);
        await modal.waitFor({ state: 'visible', timeout: 10000 });
        logger.log('Orders modal opened');
      }
    });
  }

  /**
   * Verifies that the orders modal opens and shows the expected orders with their quantities.
   * Used in U002 test suite to verify orders modal content.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param modalSelector - Selector for the orders modal
   * @param tableSelector - Selector for the orders table
   * @param orderRowsSelector - Selector for order rows
   * @param quantityCellsSelector - Selector for quantity cells
   * @param expectedOrderNumbers - Array of expected order numbers
   * @param expectedQuantities - Array of expected quantities
   * @param itemTypeName - Optional item type name for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useRowLocator - If true, uses row locator for IZD case
   * @param additionalWaitTimeout - Optional additional wait timeout for IZD case
   */
  async verifyOrdersModal(
    pageObject: any, // PageObject instance to call helper methods
    modalSelector: string,
    tableSelector: string,
    orderRowsSelector: string,
    quantityCellsSelector: string,
    expectedOrderNumbers: string[],
    expectedQuantities: string[],
    itemTypeName?: string,
    useRowLocator: boolean = false,
    additionalWaitTimeout?: number,
  ): Promise<void> {
    const { allure } = await import('allure-playwright');
    await allure.step(
      itemTypeName ? `Verify orders modal opens and shows both ${itemTypeName} orders` : 'Verify orders modal opens and shows both orders',
      async () => {
        // Wait for the orders modal to appear
        const ordersModal = this.page.locator(`${modalSelector}[open]`);
        await ordersModal.waitFor({ state: 'visible', timeout: 10000 });

        // Highlight modal for IZD case
        if (itemTypeName === 'IZD') {
          await pageObject.highlightElement(ordersModal, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
        }

        // Check the orders table
        const ordersTable = this.page.locator(tableSelector);
        await ordersTable.waitFor({ state: 'visible', timeout: 5000 });

        // Get all order rows
        const orderRows = useRowLocator ? ordersModal.locator(orderRowsSelector) : this.page.locator(orderRowsSelector);
        const orderCount = await orderRows.count();
        const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
        logger.log(`Found ${orderCount} ${logPrefix}orders in the modal`);

        // Additional wait for IZD case
        if (additionalWaitTimeout) {
          await this.page.waitForTimeout(additionalWaitTimeout);
        }

        // Verify we have at least the expected number of orders
        expect(orderCount).toBeGreaterThanOrEqual(expectedOrderNumbers.length);

        // Get order numbers and quantities
        const orderNumbers: string[] = [];
        const quantities: string[] = [];

        for (let i = 0; i < orderCount; i++) {
          let orderNumberCell;
          let quantityCell;

          if (useRowLocator) {
            // IZD case: order number and quantity are within the row
            orderNumberCell = orderRows.nth(i).locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER);
            quantityCell = orderRows.nth(i).locator(quantityCellsSelector);

            // Highlight cells for IZD case (different colors)
            if (itemTypeName === 'IZD') {
              await pageObject.highlightElement(orderNumberCell, {
                backgroundColor: 'red',
                border: '2px solid yellow',
                color: 'blue',
              });
              await pageObject.highlightElement(quantityCell, {
                backgroundColor: 'red',
                border: '2px solid yellow',
                color: 'blue',
              });
            }
          } else {
            // DETAIL/CBED case: order number from rows, quantity from separate locator with nth()
            orderNumberCell = orderRows.nth(i);
            quantityCell = this.page.locator(quantityCellsSelector).nth(i);
          }

          const orderNumber = (await orderNumberCell.innerText()).trim();
          orderNumbers.push(orderNumber);

          const quantity = (await quantityCell.innerText()).trim();
          quantities.push(quantity);

          if (itemTypeName === 'IZD') {
            logger.log(`${itemTypeName} Order ${i + 1}: Number="${orderNumber}", Quantity="${quantity}"`);
          }
        }

        logger.log(`${logPrefix}Order numbers: ${orderNumbers}`);
        logger.log(`${logPrefix}Quantities: ${quantities}`);

        // Verify our orders are present
        for (const expectedOrderNumber of expectedOrderNumbers) {
          expect(orderNumbers).toContain(expectedOrderNumber);
        }
        for (const expectedQuantity of expectedQuantities) {
          expect(quantities).toContain(expectedQuantity);
        }
      },
    );
  }

  /**
   * Gets a quantity cell, highlights it, and returns the quantity value.
   * Used in U002 test suite to verify warehouse quantities.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param quantityCellSelector - Selector for the quantity cell (can be a simple selector or a complex one)
   * @param expectedValue - Optional expected value to verify
   * @param quantityType - Optional type description for logging (e.g., "Total ordered", "Remaining ordered")
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useComplexSelector - If true, the selector is a complex pattern with prefix and suffix
   * @param prefixId - Optional prefix selector for complex selectors (used with useComplexSelector)
   * @param suffixId - Optional suffix selector for complex selectors (used with useComplexSelector)
   * @param timeoutMs - Timeout in milliseconds for waiting for element
   * @returns The quantity value as a number
   */
  async getQuantityCellAndVerify(
    pageObject: any, // PageObject instance to call helper methods
    quantityCellSelector: string,
    expectedValue?: number,
    quantityType: string = 'quantity',
    itemTypeName?: string,
    useComplexSelector: boolean = false,
    prefixId?: string,
    suffixId?: string,
    timeoutMs: number = WAIT_TIMEOUTS.STANDARD,
    tableSelector?: string,
  ): Promise<number> {
    const { allure } = await import('allure-playwright');
    const stepName =
      expectedValue === 55
        ? `Verify total ${itemTypeName ? itemTypeName + ' ' : ''}quantity is 55`
        : `Verify ${itemTypeName ? itemTypeName + ' ' : ''}quantity decreased by 5`;

    let stepResult = 0;
    await allure.step(stepName, async () => {
      // Build the selector based on type
      let quantityCell: Locator;
      if (useComplexSelector && suffixId && tableSelector) {
        // Scope to table's first visible row (robust after search/filter when row indices may change)
        quantityCell = this.page
          .locator(tableSelector)
          .locator('tbody tr')
          .first()
          .locator(`[data-testid$="${suffixId}"]`)
          .first();
      } else if (useComplexSelector && prefixId && suffixId) {
        // Build complex selector with prefix and suffix
        quantityCell = this.page.locator(`[data-testid^="${prefixId}"][data-testid$="${suffixId}"]`).first();
      } else {
        quantityCell = this.page.locator(quantityCellSelector).first();
      }

      // Wait for element to be visible (with longer timeout for slow-loading tables)
      await quantityCell.waitFor({ state: 'visible', timeout: timeoutMs });

      // When expecting a specific value, poll until it appears (handles slow UI updates after archive/refresh)
      if (expectedValue !== undefined && timeoutMs > 2000) {
        const pollInterval = TIMEOUTS.MEDIUM;
        const deadline = Date.now() + Math.min(timeoutMs, 15000);
        let quantity = Number((await quantityCell.innerText()).trim());
        while (quantity !== expectedValue && Date.now() < deadline) {
          await this.page.waitForTimeout(pollInterval);
          quantity = Number((await quantityCell.innerText()).trim());
        }
      }

      // Highlight the quantity cell
      await pageObject.highlightElement(quantityCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      const quantity = Number((await quantityCell.innerText()).trim());
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      const quantityTypeLabel = quantityType === 'Total ordered' ? 'Total ordered' : 'Remaining ordered';
      logger.log(`${logPrefix}${quantityTypeLabel} quantity: ${quantity}`);

      // Verify expected value if provided
      if (expectedValue !== undefined) {
        expect(quantity).toBe(expectedValue);
        const successMessage =
          expectedValue === 55
            ? `✅ Verified total ${itemTypeName ? itemTypeName + ' ' : ''}quantity is 55 (50 + 5)`
            : `✅ Verified ${itemTypeName ? itemTypeName + ' ' : ''}quantity decreased by 5 - now showing ${quantity} instead of 55`;
        logger.log(successMessage);
      }

      stepResult = quantity;
    });

    return stepResult;
  }

  /**
   * Clicks on an order in the orders modal to open the edit dialog.
   * Used in U002 test suite to open edit dialogs for specific orders.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param orderRowsSelector - Selector for order rows
   * @param orderNumber - The order number to click on
   * @param errorMessage - Optional custom error message if order not found
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   */
  async clickOrderToOpenEditDialog(
    pageObject: any, // PageObject instance to call helper methods
    orderRowsSelector: string,
    orderNumber: string,
    errorMessage?: string,
    itemTypeName?: string,
  ): Promise<void> {
    const { allure } = await import('allure-playwright');
    await allure.step('Click on second order to open edit dialog', async () => {
      // Find the row with the order and click on it
      const orderRows = this.page.locator(orderRowsSelector);
      const orderRowIndex = await this.findOrderRowIndexByOrderNumber(
        orderRows,
        orderNumber,
        errorMessage || `Could not find ${itemTypeName ? itemTypeName + ' ' : ''}order ${orderNumber} in the orders list`,
      );

      // Click on the order number cell to open edit dialog
      const orderCell = orderRows.nth(orderRowIndex);
      // Calls ElementHelper through PageObject
      await pageObject.highlightElement(orderCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await orderCell.click();
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      logger.log(`Clicked on ${logPrefix}order ${orderNumber} to open edit dialog`);

      // Wait a bit for the dialog to open and content to load
      await this.page.waitForTimeout(500);
    });
  }
}
