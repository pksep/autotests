import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница:  Остатки материалов на складе
export class CreateMaterialStockPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
