import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';

// Страница: Заказ склада на сборку
export class CreateAssemblyWarehousePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
