import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';

// Страница: Комплектация сборок на план
export class CreateCompletingAssembliesToPlanPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
