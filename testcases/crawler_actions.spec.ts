import { test } from '@playwright/test';
import { ENV } from '../config/env';
import * as fs from 'fs';

test('Crawl Actions Page', async ({ page }) => {
  await page.goto(`${ENV.BASE_URL}actions`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const testIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'));
  });

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button, label')).map(el => {
      const type = el.tagName.toLowerCase();
      const testId = el.getAttribute('data-testid') || '';
      const text = el.textContent?.trim() || '';
      return `${type} - ${testId} - ${text}`;
    });
  });

  const uniqueTestIds = testIds.filter((v, i, a) => a.indexOf(v) === i).filter(Boolean);

  fs.writeFileSync(
    'crawler_results.json',
    JSON.stringify(
      {
        testIds: uniqueTestIds,
        inputs: inputs,
      },
      null,
      2,
    ),
  );
});
