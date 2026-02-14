// LoginPage.ts
import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page'; // Adjust the path as necessary
import logger from '../lib/utils/logger';

// Страница: Авторизации
export class LoginPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
  // Implement the inherited abstract method 'open' as a no-op
  async open(): Promise<void> {
    // No operation or you can put a console.log for debugging
    // console.log("Open method not used.");
  }
}
