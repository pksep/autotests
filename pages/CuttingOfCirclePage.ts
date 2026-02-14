import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница:  Резка круга / профиля
export class CreateCuttingOfCirclePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
