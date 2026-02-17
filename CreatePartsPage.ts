import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';

// Страница: Создать деталь
export class CreatePartsPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
