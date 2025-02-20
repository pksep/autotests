import { test, expect } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec'; // Adjust the import path as necessary
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage'; 
import { ENV, SELECTORS } from '../config'; // Import the configuration
import logger from '../lib/logger';
import { allure } from 'allure-playwright';

export const runP003 = (isSingleTest: boolean, iterations: number) => {
    logger.info(`Starting test: Verify Assembly Warehouse Page Functionality`);
    test.beforeEach(async ({ page }) => {
        const assemplyWarehousePage = new CreateAssemblyWarehousePage(page);
      
        await allure.step('Step 1: Open the login page and login', async () => {
          // Perform the login using the performLogin function (imported from TC000.spec)
          await performLogin(page, '001', 'Перов Д.А.', '54321');
          await page.click('button.btn.blues');

        });
      
        await allure.step('Step 2: Navigate to Склад', async () => {
          // Navigate to the materials page

          await assemplyWarehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });
      
        await allure.step('Step 3: Find and click the Дефицит Продукции button', async () => {
          // Define the selector for the element
          const selector = '[data-testid="Sclad-deficitProduction-deficitProduction"]'; // Дефицит Продукции button on warehouse page
          await assemplyWarehousePage.findTable(selector);
          await page.waitForLoadState('networkidle');
        });
      });
    test('Test Case - Verify  Assembly Warehouse Page Column Count Check for RIGHT table', async ({ page }) => {
        const assemplyWarehousePage = new CreateAssemblyWarehousePage(page);

   
        // Capture the number of columns from the checkTableColumns method
        const urgencyColId = await assemplyWarehousePage.findColumn(page, 'tablebody', 'AssemblySclad-PrintTableHeader-UrgencyDateColumn');


        const plannedShipmentColId = await assemplyWarehousePage.findColumn(page, 'tablebody', 'AssemblySclad-PrintTableHeader-PlannedShipmentDateColumn');

        // Check if both columns are found
        if (urgencyColId !== false && plannedShipmentColId !== false) {
            const sortedCorrect = await assemplyWarehousePage.checkTableRowOrdering(page, 'tablebody', urgencyColId, plannedShipmentColId);
            
            // Assert the result
            expect(sortedCorrect.success).toBe(true);
            if (!sortedCorrect.success) {
                logger.info(`Error: ${sortedCorrect.message}`);
            }
        } else {
            const missingCol = urgencyColId === false ? 'Дата по срочности' : 'Дата план. отгрузки';
            throw new Error(`Column "${missingCol}" not found`);
        }
    });
}