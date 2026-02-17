import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

/* Дефицит Сборочных Едениц */

export class CreatShortageAssembliesPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
