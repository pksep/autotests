import { expect, Page } from '@playwright/test';
import { Click, PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsWarehouseTaskForShipment from '../lib/Constants/SelectorsWarehouseTaskForShipment';

// Страница:  Склад: Задачи на отгрузку
export class CreateWarehouseTaskForShipmentPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async shipmentModalWindow() {
    // Use dialog as scope so header (h4 "Отгрузка") and content (h3 sections) are both inside
    const modalDialog = this.page.locator(SelectorsShipmentTasks.MODAL_SHIPMENT_DIALOG).first();
    const modalContent = this.page.locator(SelectorsShipmentTasks.MODAL_SHIPMENT_DETAILS);

    await expect(modalDialog).toBeVisible();
    await expect(modalContent).toBeVisible();

    await expect(modalDialog.locator('h3', { hasText: 'Отгрузка' })).toBeVisible();
    await expect(modalDialog.locator('h3', { hasText: 'Комплектация' })).toBeVisible();
    await expect(modalDialog.locator('h3', { hasText: ' Описание/Примечание ' })).toBeVisible();
    await expect(modalDialog.locator('h3', { hasText: 'Медиа файлы' })).toBeVisible();

    await this.clickButton(' Отменить ', SelectorsWarehouseTaskForShipment.BUTTON_CANCEL, Click.No);

    await expect(modalContent.locator('textarea')).toBeVisible();
  }
}
