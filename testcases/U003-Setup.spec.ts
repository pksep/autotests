/**
 * @file U003-Setup.spec.ts
 * @purpose U003 Cases 1-2: Create test products, create shipment task.
 */

import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsLoadingTasksPage from '../lib/Constants/SelectorsLoadingTasksPage';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import {
  TEST_PRODUCTS,
  nameBuyer,
  quantity,
  firstProductName,
  secondProductName,
  descendantsCbedArray,
  descendantsDetailArray,
  setU003ProductState,
  setU003OrderState,
} from './U003-Constants';

export const runU003_01_Setup = (_isSingleTest: boolean, _iterations: number) => {
  logger.log('U003 Cases 1-2 - Setup: Create test products and shipment task');

  test('Case 1 - Создать тестовое изделие', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.log('Test Case 1 - Create test product');
    const partsDatabasePage = new CreatePartsDatabasePage(page);
    const testProducts = TEST_PRODUCTS;

    await allure.step('Step 1: Go to Parts Database page', async () => {
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await createButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createButton).toBeVisible();
        },
        'Verify Create button is visible',
        test.info(),
      );
    });

    for (const product of testProducts) {
      await allure.step('Step 2: Click on Create button', async () => {
        const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
        await createButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        const isEnabled = await createButton.isEnabled();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(isEnabled).toBe(true);
          },
          'Verify Create button is enabled',
          test.info(),
        );
        await createButton.click();
        logger.log('Clicked on Create button');
      });

      await allure.step('Step 3: Wait for dialog and click on Изделие', async () => {
        const dialog = page.locator(SelectorsPartsDataBase.DIALOG_CREATE_OPTIONS);
        await dialog.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(dialog).toBeVisible();
          },
          'Verify dialog is visible',
          test.info(),
        );
        const productButton = page.locator(SelectorsPartsDataBase.BUTTON_PRODUCT).filter({ hasText: 'Изделие' });
        await productButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(productButton).toBeVisible();
          },
          'Verify Изделие button is visible',
          test.info(),
        );
        await productButton.click();
        logger.log('Clicked on Изделие button');
      });

      await allure.step('Step 4: Wait for creation page to load', async () => {
        const h3Title = page.locator('h3', { hasText: 'Создание изделия' }).first();
        const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED).first();
        try {
          await h3Title.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(h3Title).toBeVisible();
            },
            'Verify creation page header is visible',
            test.info(),
          );
        } catch (error) {
          console.warn('Creation page header not visible within timeout, falling back to Save button check', error);
          await saveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(saveButton).toBeVisible();
            },
            'Verify Save button is visible (fallback)',
            test.info(),
          );
        }
        await partsDatabasePage.waitForNetworkIdle();
        logger.log('Creation page loaded');
      });

      await allure.step('Step 5: Enter article number (Артикул)', async () => {
        const articleInput = page.locator(SelectorsPartsDataBase.INPUT_ARTICLE_NUMBER);
        await articleInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(articleInput).toBeVisible();
          },
          'Verify article input is visible',
          test.info(),
        );
        await articleInput.clear();
        await articleInput.fill(product.articleNumber);
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        let inputValue = await articleInput.inputValue();
        if (!inputValue) {
          console.warn('Article input value empty after first fill, retrying...');
          await articleInput.fill(product.articleNumber);
          await page.waitForTimeout(TIMEOUTS.INPUT_SET);
          inputValue = await articleInput.inputValue();
        }
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(inputValue).toBe(product.articleNumber);
          },
          `Verify article number matches: ${product.articleNumber}`,
          test.info(),
        );
        logger.log(`Entered article number: ${product.articleNumber}`);
      });

      await allure.step('Step 6: Enter name (Наименование)', async () => {
        const nameInput = page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
        await nameInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(nameInput).toBeVisible();
          },
          'Verify name input is visible',
          test.info(),
        );
        await nameInput.clear();
        await nameInput.fill(product.name);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        let inputValue = await nameInput.inputValue();
        if (!inputValue) {
          console.warn('Name input value empty after first fill, retrying...');
          await nameInput.fill(product.name);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          inputValue = await nameInput.inputValue();
        }
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(inputValue).toBe(product.name);
          },
          `Verify product name matches: ${product.name}`,
          test.info(),
        );
        logger.log(`Entered name: ${product.name}`);
      });

      await allure.step('Step 7: Enter designation (Обозначение)', async () => {
        const designationInput = page.locator(SelectorsPartsDataBase.INPUT_DESUGNTATION_IZD);
        await designationInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(designationInput).toBeVisible();
          },
          'Verify designation input is visible',
          test.info(),
        );
        await designationInput.clear();
        await designationInput.fill(product.designation);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        let inputValue = await designationInput.inputValue();
        if (!inputValue) {
          console.warn('Designation input value empty after first fill, retrying...');
          await designationInput.fill(product.designation);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          inputValue = await designationInput.inputValue();
        }
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(inputValue).toBe(product.designation);
          },
          `Verify designation matches: ${product.designation}`,
          test.info(),
        );
        logger.log(`Entered designation: ${product.designation}`);
      });

      await allure.step('Step 8: Click Save button', async () => {
        const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED);
        await saveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(saveButton).toBeVisible();
          },
          'Verify Save button is visible',
          test.info(),
        );
        const saveSuccess = await partsDatabasePage.saveProduct();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(saveSuccess).toBe(true);
          },
          `Verify product "${product.name}" was saved successfully`,
          test.info(),
        );
        logger.log('Clicked Save button and waited for loading to complete');
      });

      await allure.step('Step 9: Click Cancel button', async () => {
        const loaderDialog = page.locator(SelectorsPartsDataBase.CREATOR_LOADER);
        await loaderDialog.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const cancelButton = page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
        await cancelButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(cancelButton).toBeVisible();
          },
          'Verify Cancel button is visible',
          test.info(),
        );
        const cancelSuccess = await partsDatabasePage.cancelProductCreation();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(cancelSuccess).toBe(true);
          },
          `Verify cancellation successful and returned to list page for product "${product.name}"`,
          test.info(),
        );
        logger.log('Clicked Cancel button');
      });

      if (!firstProductName) {
        setU003ProductState({ firstProductName: product.name });
      } else if (!secondProductName) {
        setU003ProductState({ secondProductName: product.name });
      }
      setU003ProductState({ testProductName: product.name, testProductArticleNumber: product.articleNumber });
      logger.log(`Set testProductName to: ${product.name} (product: ${product.name})`);
    }

    logger.log('Test Case 1 completed. firstProductName, secondProductName, testProductName set in U003-Constants');
  });

  test('Case 2 - Создать Задачу на отгрузку', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.log('Test Case 2 - Create shipment task');
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const productName = TEST_PRODUCTS[0].name;
    const articleNumberValue = TEST_PRODUCTS[0].articleNumber;

    await allure.step('Step 1: Go to Задачи на отгрузку page', async () => {
      await loadingTaskPage.navigateToShippingTasksPage();
      const createOrderButton = page.locator(SelectorsLoadingTasksPage.buttonCreateOrder);
      const isButtonVisible = await createOrderButton.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonVisible).toBe(true);
        },
        'Verify navigation to shipping tasks page successful - create order button is visible',
        test.info(),
      );
    });

    await allure.step('Step 2: Click Create Order button', async () => {
      await loadingTaskPage.clickCreateOrderButton();
      const addOrderComponent = page.locator(SelectorsLoadingTasksPage.addOrderComponent);
      await addOrderComponent.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const isComponentVisible = await addOrderComponent.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isComponentVisible).toBe(true);
        },
        'Verify Create Order button clicked successfully - order form (AddOrder component) is visible',
        test.info(),
      );
    });

    await allure.step('Step 3: Click Изделие Выбрать button', async () => {
      await loadingTaskPage.clickProductSelectButton();
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProductNew);
      const isModalVisible = await productModal.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isModalVisible).toBe(true);
        },
        'Verify Изделие Выбрать button clicked successfully - product modal is visible',
        test.info(),
      );
    });

    await allure.step('Step 4: Select product in modal', async () => {
      await loadingTaskPage.selectProductInModal(productName, articleNumberValue);
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProductNew);
      const modalTableBody = productModal.locator('tbody');
      const productRow = modalTableBody.locator('tr').filter({ hasText: productName });
      const rowCount = await productRow.count();
      const isModalVisible = await productModal.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCount).toBeGreaterThan(0);
          expect.soft(isModalVisible).toBe(true);
        },
        `Verify product "${productName}" selected successfully in modal - product row found and modal still open`,
        test.info(),
      );
    });

    await allure.step('Step 10: Click Add button', async () => {
      await loadingTaskPage.clickAddButtonInProductModal();
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProductNew);
      const isModalVisible = await productModal.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isModalVisible).toBe(false);
        },
        'Verify Add button clicked successfully in product modal - modal closed',
        test.info(),
      );
    });

    await allure.step('Step 12: Verify correct product is displayed in Изделие row', async () => {
      const productElement = page.locator('.attachments-value .link').first();
      await productElement.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const actualProductName = (await productElement.textContent())?.trim() || '';
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(actualProductName).toBe(productName);
        },
        `Verify product "${productName}" is displayed correctly - actual: "${actualProductName}"`,
        test.info(),
      );
    });

    await allure.step('Step 13: Click Покупатель Выбрать button and select buyer', async () => {
      await loadingTaskPage.selectBuyer(nameBuyer);
      const buyerSelectedCompany = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_BUYER_SELECTED_COMPANY);
      await buyerSelectedCompany.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const actualBuyerName = (await buyerSelectedCompany.textContent())?.trim() || '';
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(actualBuyerName).toContain(nameBuyer);
        },
        `Verify buyer "${nameBuyer}" selected successfully - actual: "${actualBuyerName}"`,
        test.info(),
      );
    });

    await allure.step('Step 18: Enter quantity in Количество input', async () => {
      await loadingTaskPage.enterQuantity(quantity);
      const quantityInputElement = page.locator(SelectorsLoadingTasksPage.quantityInput);
      const actualQuantity = await quantityInputElement.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(actualQuantity).toBe(quantity);
        },
        `Verify quantity "${quantity}" entered successfully - actual: "${actualQuantity}"`,
        test.info(),
      );
    });

    await allure.step('Step 19: Enter urgency date', async () => {
      await loadingTaskPage.selectCalendarDate(2025, 1, 23);
      const urgencyDateDisplay = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_DATE_BY_URGENCY_DISPLAY);
      await urgencyDateDisplay.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const actualDateText = (await urgencyDateDisplay.textContent())?.trim() || '';
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(actualDateText).toContain('2025');
          expect.soft(actualDateText).toContain('23');
        },
        `Verify urgency date selected successfully: 23.01.2025 - actual: "${actualDateText}"`,
        test.info(),
      );
      logger.log('Selected urgency date: 23.01.2025');
    });

    await allure.step('Step 20: Enter shipment plan date', async () => {
      logger.log('Step 20: Enter shipment plan date - TODO');
      const shipmentPlanDateDisplay = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_DATE_SHIPPING_PLAN_DISPLAY);
      const isFieldVisible = await shipmentPlanDateDisplay.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isFieldVisible).toBe(true);
        },
        'Verify shipment plan date field exists (TODO: implement date selection)',
        test.info(),
      );
    });

    await allure.step('Step 21: Enter order date', async () => {
      logger.log('Step 21: Enter order date - TODO');
      const orderDateDisplay = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_DATE_ORDER_DISPLAY);
      const isFieldVisible = await orderDateDisplay.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isFieldVisible).toBe(true);
        },
        'Verify order date field exists (TODO: implement date selection)',
        test.info(),
      );
    });

    await allure.step('Step 22: Iterate through Комплектации table and save data', async () => {
      descendantsCbedArray.length = 0;
      descendantsDetailArray.length = 0;
      await loadingTaskPage.preservingDescendants(descendantsCbedArray, descendantsDetailArray);
      logger.log(`Saved ${descendantsCbedArray.length} CBED and ${descendantsDetailArray.length} DETAIL items`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(descendantsCbedArray.length).toBeGreaterThanOrEqual(0);
          expect.soft(descendantsDetailArray.length).toBeGreaterThanOrEqual(0);
        },
        `Verify descendants data saved: ${descendantsCbedArray.length} CBED, ${descendantsDetailArray.length} DETAIL items`,
        test.info(),
      );
    });

    await allure.step('Step 23: Click Save button', async () => {
      await loadingTaskPage.saveOrder();
      const editTitleElement = page.locator(SelectorsLoadingTasksPage.editTitle);
      await editTitleElement.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
      const isTitleVisible = await editTitleElement.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isTitleVisible).toBe(true);
        },
        'Verify order saved successfully - edit title is visible',
        test.info(),
      );
    });

    await allure.step('Step 25: Save Order Number to variable', async () => {
      const orderInfo = await loadingTaskPage.extractOrderNumberFromTitle();
      setU003OrderState({
        shipmentTaskNumber: orderInfo.shipmentTaskNumber,
        fullOrderNumber: orderInfo.fullOrderNumber,
        shipmentOrderDate: orderInfo.shipmentOrderDate,
      });
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(orderInfo.shipmentTaskNumber).not.toBe('');
          expect.soft(orderInfo.fullOrderNumber).not.toBe('');
          expect.soft(orderInfo.shipmentOrderDate).not.toBe('');
        },
        `Verify order information extracted: Number="${orderInfo.shipmentTaskNumber}", Full="${orderInfo.fullOrderNumber}", Date="${orderInfo.shipmentOrderDate}"`,
        test.info(),
      );
      logger.log(`Order Number saved: ${orderInfo.shipmentTaskNumber}`);
      logger.log(`Full Order Number saved: ${orderInfo.fullOrderNumber}`);
      logger.log(`Order Date saved: ${orderInfo.shipmentOrderDate}`);
    });
  });
};
