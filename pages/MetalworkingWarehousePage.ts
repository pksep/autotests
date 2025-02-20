import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';

// Страница: Заказ склада на металлообработку
export class CreateMetalworkingWarehousePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
