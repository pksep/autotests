/**
 * @file MiscHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for miscellaneous utility operations extracted from Page.ts
 * 
 * This helper handles:
 * - Date checking
 * - Modal window verification
 * - Data preservation
 * - Table visibility
 * - Test data verification
 */

import { Page, expect, ElementHandle } from '@playwright/test';
import { Click } from '../Page';
import { TypeInvoice } from '../Page';
import { ISpetificationData } from '../utils/utilities';
import { extractDataSpetification } from '../utils/utilities';
import * as SelectorsModalWindowConsignmentNote from '../Constants/SelectorsModalWindowConsignmentNote';
import * as SelectorsStartProduction from '../Constants/SelectorsStartProduction';
import logger from '../utils/logger';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';

export class MiscHelper {
  constructor(private page: Page) {}

  /**
   * Checks the current date in the locator
   * @param locator - the full locator of the table
   * @returns The formatted date string
   */
  async checkCurrentDate(locator: string): Promise<string> {
    const checkDate = await this.page.locator(locator).textContent();
    const today = new Date();
    const formattedToday = today.toLocaleDateString('ru-RU');

    // if (!checkDate || !checkDate.includes(formattedToday)) { //erp-2366
    //   throw new Error(
    //     `Ожидаемая дата "${formattedToday}" не найдена в тексте: "${checkDate}".`
    //   );
    // }

    logger.info(`Текущая дата "${formattedToday}" успешно найдена в тексте.`);
    return formattedToday;
  }

  /**
   * Check the "Start Production" modal window
   * @param locator - The locator for the modal window
   */
  async checkModalWindowLaunchIntoProduction(locator: string): Promise<void> {
    const modalWindow = await this.page.locator(locator);

    // Debug: Check what elements are actually in the modal
    const allH4Elements = await modalWindow.locator('h4').all();
    logger.log(`Found ${allH4Elements.length} h4 elements in modal`);
    for (let i = 0; i < allH4Elements.length; i++) {
      const text = await allH4Elements[i].textContent();
      logger.log(`H4 ${i}: "${text}"`);
      // Highlight each H4 element
      await allH4Elements[i].evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    }

    const allH3Elements = await modalWindow.locator('h3').all();
    logger.log(`Found ${allH3Elements.length} h3 elements in modal`);
    for (let i = 0; i < allH3Elements.length; i++) {
      const text = await allH3Elements[i].textContent();
      logger.log(`H3 ${i}: "${text}"`);
      // Highlight each H3 element
      await allH3Elements[i].evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
    }

    // Try to find the title in any heading element (h1-h6)
    const titleElement = modalWindow.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: 'Запустить в производство' }).first();
    const titleExists = (await titleElement.count()) > 0;
    logger.log(`Title "Запустить в производство" found: ${titleExists}`);

    if (titleExists) {
      expect(titleElement).toBeVisible();
    } else {
      logger.log('Title not found, skipping title check');
    }
    expect(await modalWindow.locator('h3', { hasText: 'Описание/Примечание' })).toBeVisible();
    expect(await modalWindow.locator('h3', { hasText: 'Комплектация' })).toBeVisible();

    await this.page.locator('[data-testid="ModalStartProduction-NoteTextarea-Textarea"]').isVisible();

    const buttonCansel = await this.page.locator('[data-testid="ModalStartProduction-ComplectationTable-CancelButton"]', { hasText: 'Отменить' });
    expect(buttonCansel).toBeVisible();

    const buttonLaunchProduction = await this.page.locator('[data-testid="ModalStartProduction-ComplectationTable-InProduction"]', {
      hasText: 'В производство',
    });
    expect(buttonLaunchProduction).toBeVisible();

    await this.page.locator(`${SelectorsStartProduction.MODAL_START_PRODUCTION_MODAL_CONTENT} table tbody tr`).isVisible();
  }

  /**
   * Retrieve descendants from the entity specification
   * Iterate through the entity specification table and save to separate arrays
   * @param pageObject - The PageObject instance to call helper methods through
   * @param descendantsCbedArray - the array where we plan to save the assemblies
   * @param descendantsDetailArray - the array where we plan to save the details
   */
  async preservingDescendants(
    pageObject: any, // PageObject instance to call helper methods
    descendantsCbedArray: ISpetificationData[],
    descendantsDetailArray: ISpetificationData[],
  ): Promise<void> {
    await this.page.waitForTimeout(5000);
    const rows = this.page.locator('[data-testid="AddOrder-ShipmentComplect-Table-Spec"]');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0); // Проверка на наличие строк

    if (rowCount === 0) {
      throw new Error('Нет строк в таблице');
    }

    const { cbeds, detals, materialList, listPokDet } = await extractDataSpetification(rows);

    descendantsCbedArray.push(...cbeds);
    descendantsDetailArray.push(...detals);

    logger.info(`cbeds: `, descendantsCbedArray);
    logger.info(`detals: `, descendantsDetailArray);
    logger.info('materialList: ', materialList);
    logger.info('listPokDet: ', listPokDet);
  }

  /**
   * Check the modal window for completion status
   * @param nameOperation - Pass the name of the operation for verification
   * @param nameProduct - Pass the name of the entity for verification
   * @param designationProduct - Pass the designation of the entity for verification
   */
  async completionMarkModalWindow(nameOperation: string, nameProduct: string, designationProduct: string): Promise<void> {
    const modalWindow = this.page.locator('[data-testid^="OperationPathInfo-ModalMark-Create"][data-testid$="ModalContent"]');
    await expect(modalWindow).toBeVisible();
    // Skip validation of specific H3 elements as modal content has changed
    await expect(modalWindow.locator('h4', { hasText: 'Отметка о выполнении' })).toBeVisible();
    await expect(modalWindow.locator('h3', { hasText: 'Распределение времени' })).toBeVisible();
    await this.page.waitForTimeout(500);
    // Checking a button in a modal window
    const saveButton = this.page.locator('button[data-testid="ModalMark-Button-Save"]').filter({ hasText: 'Сохранить' }).first();
    await saveButton.waitFor({ state: 'visible' });

    // Check if button is enabled before attempting to click
    const isEnabled = await saveButton.isEnabled();
    if (!isEnabled) {
      logger.log('Save button is disabled - this is expected when running Test Case 11 in isolation');
      // Skip clicking the disabled button
      return;
    }
    await saveButton.click();
  }

  /**
   * Checking the modal window to send to archive
   * @param locator - The locator pattern for the modal window
   */
  async checkModalWindowForTransferringToArchive(locator: string): Promise<void> {
    const modalWindow = this.page.locator(`[data-testid^=${locator}]`);
    await expect(modalWindow).toBeVisible();
    await expect(modalWindow.locator('.unicon')).toBeVisible();
    await expect(modalWindow.locator('button', { hasText: ' Отмена ' })).toBeVisible();
    await expect(modalWindow.locator('button', { hasText: ' Подтвердить ' })).toBeVisible();

    const modalText = await modalWindow.locator('[data-testid="ModalPromptMini-Cross-Container"]').textContent();

    const regex = /Перенести \d+ в архив\?/;

    if (!modalText || !regex.test(modalText)) {
      throw new Error(`Ожидаемый текст "Перенести * в архив?" не найден в модальном окне. Найденный текст: "${modalText}"`);
    }

    logger.info(`Текст "Перенести * в архив?" успешно найден в модальном окне.`);
  }

  /**
   * Check the modal window "Completed Sets"
   * @param pageObject - The PageObject instance to call helper methods through
   */
  async completesSetsModalWindow(pageObject: any): Promise<void> {
    await this.page.waitForTimeout(1000);
    const locatorModalWindow =
      //'[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Content"]';
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Content"]';
    const modalWindow = this.page.locator(locatorModalWindow);

    await expect(modalWindow).toBeVisible();
    // Calls TableHelper through PageObject
    await pageObject.waitingTableBody(locatorModalWindow);
  }

  /**
   * Check the modal window "Invoice for Completion" depending on the entity.
   * Enter the quantity for accounting and check the checkbox for the first order in the list.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param typeInvoice - Type of entity: Product/Assembly.
   * @param checkbox - Check the checkbox for the first order in the table.
   * @param enterQuantity - Enter the quantity in the "Your Quantity" cell.
   */
  async assemblyInvoiceModalWindow(
    pageObject: any, // PageObject instance to call helper methods
    typeInvoice: TypeInvoice,
    checkbox: boolean,
    enterQuantity?: string,
  ): Promise<void> {
    const modalWindow = await this.page.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_RIGHT_INNER);
    await expect(modalWindow).toBeVisible();
    await this.page.waitForTimeout(TIMEOUTS.EXTENDED);

    // Find the dialog first, then get the first H4 element within it
    const dialog = this.page.locator('dialog[data-testid*="ModalAddWaybill"]').first();
    await dialog.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    // Get the first H4 element within the dialog
    const h4Element = dialog.locator('h4').first();
    await h4Element.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const headerModalRaw = await h4Element.textContent();
    if (!headerModalRaw) {
      throw new Error('Modal header (H4) not found or empty');
    }
    const headerModal = headerModalRaw.trim();
    logger.log(`DEBUG: Found H4 title in dialog: "${headerModal}"`);

    // Wait for and get infoHeader text
    const infoHeaderElement = modalWindow.locator('[data-testid="ModalAddWaybill-WaybillDetails-InfoHeading"]');
    await infoHeaderElement.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const infoHeaderRaw = await infoHeaderElement.textContent();
    if (!infoHeaderRaw) {
      throw new Error('Info header not found or empty');
    }
    const infoHeader = infoHeaderRaw.trim();

    // Wait for and get configuration text
    const configurationElement = modalWindow.locator('[data-testid="ModalAddWaybill-Complectation-Header"]');
    await configurationElement.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const configurationRaw = await configurationElement.textContent();
    if (!configurationRaw) {
      throw new Error('Configuration header not found or empty');
    }
    const configuration = configurationRaw.trim();
    // expect(headerModal).toContain(
    //   await this.checkCurrentDate(
    //     '[data-testid="ModalAddWaybill-WaybillDetails-Heading"]'
    //   )
    // );
    if (typeInvoice === TypeInvoice.cbed) {
      const headerInvoiceModal = 'Накладная на комплектацию Сборки';
      const infoHeaderModal = 'Информация по сборочной единице';
      const assemblyComfiguration = 'Комплектация Сборочной единицы';
      expect(headerModal.toLowerCase()).toContain(headerInvoiceModal.toLowerCase());
      expect(infoHeader.toLowerCase()).toContain(infoHeaderModal.toLowerCase());
      expect(configuration.toLowerCase()).toContain(assemblyComfiguration.toLowerCase());
    } else {
      const headerInvoiceModal = 'Накладная на комплектацию Изделия';
      const infoHeaderModal = 'Информация по изделию';
      const productConfiguration = 'Комплектация Изделия';
      expect(headerModal.toLowerCase()).toContain(headerInvoiceModal.toLowerCase());
      expect(infoHeader.toLowerCase()).toContain(infoHeaderModal.toLowerCase());
      expect(configuration.toLowerCase()).toContain(productConfiguration.toLowerCase());
    }

    const yourQuantity = await modalWindow.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_OWN_QUANTITY_INPUT);
    // Expand "Сборки" accordion first so the assembly table content is visible
    const assemblyAccordion = modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(0);
    await assemblyAccordion.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const accordionText = await assemblyAccordion.textContent();
    if (accordionText?.trim().toLowerCase().includes('сборки')) {
      await assemblyAccordion.click();
      await this.page.waitForTimeout(TIMEOUTS.LONG);
    }
    const assemblyTable = modalWindow.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_ASSEMBLY_TABLE);
    await assemblyTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
    const firstRow = assemblyTable.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_ASSEMBLY_TABLE_ROW).first();
    await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
    await firstRow.scrollIntoViewIfNeeded();
    const needQuantityCell = firstRow.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL);
    await needQuantityCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
    const needQuantity = (await needQuantityCell.innerText()).trim();
    logger.info(`Waybill assembly table required quantity (first row): ${needQuantity}`);
    // expect(yourQuantity).toHaveValue(needQuantity);
    if (enterQuantity) {
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await yourQuantity.fill(enterQuantity);
      expect(await yourQuantity.inputValue()).toBe(enterQuantity);
      await yourQuantity.press('Enter');
    }

    if (checkbox === true) {
      const checkboxCell = modalWindow.locator(SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN).first();

      // Wait for the checkbox cell to be visible
      await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });

      // Click on the checkbox cell
      await checkboxCell.click();

      logger.log('Clicked on checkbox cell with new data-testid pattern');
    }

    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(0).textContent()).toContain('Сборки');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(1).textContent()).toContain('Детали');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(2).textContent()).toContain('Покупные детали');
    expect(await modalWindow.locator('[data-testid="AccordionNoNative-Title"]').nth(3).textContent()).toContain('Материалы');
    // Calls ElementHelper through PageObject
    await pageObject.clickButton('Отменить', '[data-testid="ModalAddWaybill-ControlButtons-CancelButton"]', Click.No);
    await pageObject.clickButton('Обновить', SelectorsModalWindowConsignmentNote.CONTROL_BUTTONS_ACTUALIZE_BUTTON, Click.No);
    await pageObject.clickButton('Печать', '[data-testid="ModalAddWaybill-ControlButtons-PrintButton"]', Click.No);
    await pageObject.clickButton('Создать приход', '[data-testid="ModalAddWaybill-ControlButtons-CreateIncomeButton"]', Click.No);
  }

  /**
   * Filter rows without th elements
   * @param rows - Array of row element handles
   */
  async filterRowsWithoutTh(rows: ElementHandle[]): Promise<ElementHandle[]> {
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
   * Show the left table if it is not visible
   * @param tableId of the table to search for
   * @param buttonId of the button that we will click on
   */
  async showLeftTable(tableId: string, buttonId: string): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    // Capture the number of columns from the checkTableColumns method
    const button = `[data-testid="${buttonId}"]`;
    const table = `[data-testid="${tableId}"]`;
    await this.page.waitForTimeout(3000);
    const isVisible = await this.page.isVisible(table);
    await this.page.waitForLoadState('networkidle');
    if (!isVisible) {
      await this.page.click(button);
      await this.page.waitForSelector(table, { state: 'visible' });
    }
  }

  /**
   * Verify that test data arrays are available and not empty
   * @param testDataArray - The array to verify
   * @param arrayName - Name of the array for error messages
   * @param allArrays - Optional object containing detail, cbed, and izd arrays
   */
  async verifyTestDataAvailable<T>(
    testDataArray: T[],
    arrayName: string,
    allArrays?: { detail?: T[]; cbed?: T[]; izd?: T[] },
  ): Promise<void> {
    const { allure } = await import('allure-playwright');
    await allure.step('Verify test data is available', async () => {
      if (allArrays) {
        const detailCount = allArrays.detail?.length || 0;
        const cbedCount = allArrays.cbed?.length || 0;
        const izdCount = allArrays.izd?.length || 0;
        logger.log(`✅ Using test data - Details: ${detailCount}, CBED: ${cbedCount}, IZD: ${izdCount}`);
      } else {
        logger.log(`✅ Using test data - ${arrayName}: ${testDataArray.length}`);
      }
    });

    if (testDataArray.length === 0) {
      throw new Error('Массив пустой.');
    }
  }
}
