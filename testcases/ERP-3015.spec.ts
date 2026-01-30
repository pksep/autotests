import { test, expect, Locator, Page, TestInfo } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, ProductSpecification } from '../pages/PartsDatabasePage';
import { CreateUsersPage } from '../pages/UsersPage';
import { CreateStockPage } from '../pages/StockPage';
import { CreateMaterialsDatabasePage } from '../pages/MaterialsDatabasePage';
import { CreateOrderedFromSuppliersPage, Supplier } from '../pages/OrderedFromSuppliersPage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { SELECTORS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsModalWaybill from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsAssemblyWarehouse from '../lib/Constants/SelectorsAssemblyWarehouse';
import * as HIGHLIGHT from '../lib/Constants/HighlightStyles';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/Page';

// Global variables for sharing data between steps
let orderNumber: string | null = null;
let orderedQuantity: number = 0;
let targetRow: any = null;
let specificationQuantity: number = 0;
let waybillCollections: number = 0;
let currentBuildQuantity: number = 0;
let createdOrders: Array<{ orderNumber: string; itemName: string; itemType: 'product' | 'assembly' }> = []; // Store orders with their items for cleanup

// Get today's date in DD.MM.YYYY format
const today = new Date().toLocaleDateString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

// Test data for ERP-3015 - Product Specification
const productSpec: ProductSpecification = {
  productName: 'ERPTEST_PRODUCT_001',
  materials: [
    { name: 'ERPTEST_MATERIAL_001', quantity: 1 },
  ],
  assemblies: [
    {
      name: 'ERPTEST_SB_001',
      materials: [{ name: 'ERPTEST_MATERIAL_002', quantity: 1 }],
      details: [{ name: 'ERPTEST_DETAIL_001', quantity: 1 }],
    },
    {
      name: 'ERPTEST_SB_002',
      materials: [{ name: 'ERPTEST_MATERIAL_003', quantity: 1 }],
      details: [{ name: 'ERPTEST_DETAIL_002', quantity: 1 }],
    },
  ],
  details: [
    { name: 'ERPTEST_DETAIL_003', quantity: 1 },
    { name: 'ERPTEST_DETAIL_004', quantity: 1 },
  ],
};

// Test data for ERP-3015 - User Accounts (array to support multiple users)
const testUsers = [
  {
    username: 'ERPTEST_TEST_USER_001',
    jobType: 'Слесарь сборщик',
    phoneSuffix: '995',
    login: 'Тестовыё сборка 1',
    password: '123456',
    department: 'Сборка',
    tableNumberStart: 999,
  },
  {
    username: 'ERPTEST_TEST_USER_002',
    jobType: 'Слесарь сборщик',
    phoneSuffix: '999',
    login: 'Тестовыё сборка 2',
    password: '123456',
    department: 'Сборка',
    tableNumberStart: 999,
  },
  // Add more user objects here as needed
];

// Extract prefixes and names from test data for cleanup
const PRODUCT_PREFIX = productSpec.productName.replace(/_\d+$/, '');
const ASSEMBLY_PREFIX = productSpec.assemblies?.[0]?.name.replace(/_\d+$/, '') || 'ERPTEST_SB';
const DETAIL_PREFIX = productSpec.details?.[0]?.name.replace(/_\d+$/, '') || 'ERPTEST_DETAIL';
const MATERIAL_NAMES = [
  ...(productSpec.materials?.map(m => m.name) || []),
  ...(productSpec.assemblies?.flatMap(a => a.materials?.map(m => m.name) || []) || []),
];
// Extract username prefix for user search (search by username, e.g., "ERPTEST_TEST_USER_001" -> "ERPTEST_TEST_USER")
// Remove trailing underscore and number to get common prefix
const USER_USERNAME_PREFIX = testUsers[0]?.username.replace(/_\d+$/, '') || 'ERPTEST_TEST_USER';

export const runERP_3015 = () => {
  test('ERP-3015 00 - Cleanup - Archive all created test items', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    const detailsPage = new CreatePartsDatabasePage(page);
    const usersPage = new CreateUsersPage(page);
    const materialsPage = new CreateMaterialsDatabasePage(page);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await allure.step('Cleanup - Archive all created test items', async () => {
      // Cleanup in reverse order: Orders -> Product -> Assemblies -> Details -> Materials
      // Use prefix-based search to find and delete all items with the prefix (e.g., "ERPTEST_PRODUCT" finds all _001, _002, etc.)
      
      // 0. Archive all orders for test items (search by prefix instead of relying on stored array)
      await expectSoftWithScreenshot(
        page,
        async () => {
          // Collect all item prefixes to check for orders
          const itemPrefixes: string[] = [];
          itemPrefixes.push(PRODUCT_PREFIX); // Product prefix
          if (productSpec.assemblies && productSpec.assemblies.length > 0) {
            for (const assembly of productSpec.assemblies) {
              const assemblyPrefix = assembly.name.replace(/_\d+$/, '');
              if (!itemPrefixes.includes(assemblyPrefix)) {
                itemPrefixes.push(assemblyPrefix);
              }
            }
          }

          const totalArchivedOrders = await assemblyWarehouse.archiveOrdersByItemPrefixes(itemPrefixes);
          expect.soft(totalArchivedOrders).toBeGreaterThanOrEqual(0); // Cleanup completed
        },
        `Archive all orders for test items with prefixes: ${PRODUCT_PREFIX}, ${ASSEMBLY_PREFIX}`,
        test.info(),
      );
      
      // 1. Archive all products with prefix (изделие)
      await expectSoftWithScreenshot(
        page,
        async () => {
          const archivedCount = await detailsPage.archiveAllTestProductsByPrefix(PRODUCT_PREFIX, { maxIterations: 10 });
          expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
        },
        `Archive all test products with prefix ${PRODUCT_PREFIX}`,
        test.info(),
      );

      // 2. Archive all assemblies with prefix (СБ) - using cleanupTestItemsByPrefix
      // Scope the search input to the assembly table to avoid matching other tables
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.cleanupTestItemsByPrefix(
            'ASSEMBLY',
            ASSEMBLY_PREFIX,
            `${SelectorsPartsDataBase.CBED_TABLE} ${SelectorsPartsDataBase.SEARCH_CBED_ATTRIBUT}`,
            SelectorsPartsDataBase.CBED_TABLE,
          );
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test assemblies with prefix ${ASSEMBLY_PREFIX}`,
        test.info(),
      );

      // 3. Archive all details with prefix (детали) - using cleanupTestItemsByPrefix
      // Scope the search input to the detail table to avoid matching other tables
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.cleanupTestItemsByPrefix(
            'DETAIL',
            DETAIL_PREFIX,
            `${SelectorsPartsDataBase.DETAIL_TABLE} ${SelectorsPartsDataBase.SEARCH_DETAIL_ATTRIBUT}`,
            SelectorsPartsDataBase.DETAIL_TABLE,
          );
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test details with prefix ${DETAIL_PREFIX}`,
        test.info(),
      );

      // 4. Archive materials (материалы) - using cleanupTestMaterials
      await expectSoftWithScreenshot(
        page,
        async () => {
          await materialsPage.cleanupTestMaterials(MATERIAL_NAMES, test.info());
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test materials: ${MATERIAL_NAMES.join(', ')}`,
        test.info(),
      );

      // 5. Archive users - using cleanupTestUsersByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await usersPage.cleanupTestUsersByPrefix(USER_USERNAME_PREFIX, test.info());
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test users with username prefix ${USER_USERNAME_PREFIX}`,
        test.info(),
      );
    });
  });

  test('ERP-3015 - Create test product with complex specification', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    const detailsPage = new CreatePartsDatabasePage(page);
    const usersPage = new CreateUsersPage(page);

    await allure.step('Step 1: Create test product with full specification', async () => {
      const result = await detailsPage.createИзделие(productSpec, test.info());

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(result.success).toBe(true);
        },
        'Verify product creation was successful',
        test.info(),
      );

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(result.productName).toBe(productSpec.productName);
        },
        `Verify product name is "${productSpec.productName}"`,
        test.info(),
      );

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(result.createdDetails.length).toBeGreaterThan(0);
        },
        'Verify details were created',
        test.info(),
      );

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(result.createdAssemblies.length).toBe(productSpec.assemblies?.length || 0);
        },
        `Verify ${productSpec.assemblies?.length || 0} assemblies were created`,
        test.info(),
      );

      if (result.error) {
        throw new Error(`Product creation failed: ${result.error}`);
      }
    });

    await allure.step('Step 2: Create test users', async () => {
      for (const testUser of testUsers) {
        await allure.step(`Create test user "${testUser.username}"`, async () => {
          const createUserResult = await usersPage.createTestUser(testUser, test.info());

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(createUserResult.success).toBe(true);
            },
            `Verify test user "${testUser.username}" was created (tableNumber=${createUserResult.usedTableNumber ?? 'n/a'})`,
            test.info(),
          );
        });
      }
    });

    await allure.step('Step 3: Create orders for product and assemblies', async () => {
      const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);

      // Create order for the product (Изделие)
      await allure.step(`Create order for product "${productSpec.productName}" with quantity 10`, async () => {
        const orderResult = await orderedFromSuppliersPage.launchIntoProductionSupplierByPrefix(
          productSpec.productName,
          '10',
          Supplier.product,
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(orderResult.checkOrderNumber).toBeTruthy();
            expect.soft(orderResult.checkOrderNumber.length).toBeGreaterThan(0);
          },
          `Verify order was created for product "${productSpec.productName}" with order number ${orderResult.checkOrderNumber}`,
          test.info(),
        );

        // Store order number with item info for cleanup
        if (orderResult.checkOrderNumber) {
          createdOrders.push({
            orderNumber: orderResult.checkOrderNumber,
            itemName: productSpec.productName,
            itemType: 'product',
          });
        }
      });

      // Create orders for each assembly (СБ)
      if (productSpec.assemblies && productSpec.assemblies.length > 0) {
        for (const assembly of productSpec.assemblies) {
          await allure.step(`Create order for assembly "${assembly.name}" with quantity 10`, async () => {
            const orderResult = await orderedFromSuppliersPage.launchIntoProductionSupplierByPrefix(
              assembly.name,
              '10',
              Supplier.cbed,
            );

            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(orderResult.checkOrderNumber).toBeTruthy();
                expect.soft(orderResult.checkOrderNumber.length).toBeGreaterThan(0);
              },
              `Verify order was created for assembly "${assembly.name}" with order number ${orderResult.checkOrderNumber}`,
              test.info(),
            );

            // Store order number with item info for cleanup
            if (orderResult.checkOrderNumber) {
              createdOrders.push({
                orderNumber: orderResult.checkOrderNumber,
                itemName: assembly.name,
                itemType: 'assembly',
              });
            }
          });
        }
      }
    });
  });

  test('ERP-3015 - Cleanup - Archive all created test items', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    const detailsPage = new CreatePartsDatabasePage(page);
    const usersPage = new CreateUsersPage(page);
    const materialsPage = new CreateMaterialsDatabasePage(page);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await allure.step('Cleanup - Archive all created test items', async () => {
      // Cleanup in reverse order: Orders -> Product -> Assemblies -> Details -> Materials
      // Use prefix-based search to find and delete all items with the prefix (e.g., "ERPTEST_PRODUCT" finds all _001, _002, etc.)
      
      // 0. Archive all orders for test items (search by prefix instead of relying on stored array)
      await expectSoftWithScreenshot(
        page,
        async () => {
          // Collect all item prefixes to check for orders
          const itemPrefixes: string[] = [];
          itemPrefixes.push(PRODUCT_PREFIX); // Product prefix
          if (productSpec.assemblies && productSpec.assemblies.length > 0) {
            for (const assembly of productSpec.assemblies) {
              const assemblyPrefix = assembly.name.replace(/_\d+$/, '');
              if (!itemPrefixes.includes(assemblyPrefix)) {
                itemPrefixes.push(assemblyPrefix);
              }
            }
          }

          const totalArchivedOrders = await assemblyWarehouse.archiveOrdersByItemPrefixes(itemPrefixes);
          expect.soft(totalArchivedOrders).toBeGreaterThanOrEqual(0); // Cleanup completed
        },
        `Archive all orders for test items with prefixes: ${PRODUCT_PREFIX}, ${ASSEMBLY_PREFIX}`,
        test.info(),
      );
      
      // 1. Archive all products with prefix (изделие)
      await expectSoftWithScreenshot(
        page,
        async () => {
          const archivedCount = await detailsPage.archiveAllTestProductsByPrefix(PRODUCT_PREFIX, { maxIterations: 10 });
          expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
        },
        `Archive all test products with prefix ${PRODUCT_PREFIX}`,
        test.info(),
      );

      // 2. Archive all assemblies with prefix (СБ) - using cleanupTestItemsByPrefix
      // Scope the search input to the assembly table to avoid matching other tables
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.cleanupTestItemsByPrefix(
            'ASSEMBLY',
            ASSEMBLY_PREFIX,
            `${SelectorsPartsDataBase.CBED_TABLE} ${SelectorsPartsDataBase.SEARCH_CBED_ATTRIBUT}`,
            SelectorsPartsDataBase.CBED_TABLE,
          );
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test assemblies with prefix ${ASSEMBLY_PREFIX}`,
        test.info(),
      );

      // 3. Archive all details with prefix (детали) - using cleanupTestItemsByPrefix
      // Scope the search input to the detail table to avoid matching other tables
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.cleanupTestItemsByPrefix(
            'DETAIL',
            DETAIL_PREFIX,
            `${SelectorsPartsDataBase.DETAIL_TABLE} ${SelectorsPartsDataBase.SEARCH_DETAIL_ATTRIBUT}`,
            SelectorsPartsDataBase.DETAIL_TABLE,
          );
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test details with prefix ${DETAIL_PREFIX}`,
        test.info(),
      );

      // 4. Archive materials (материалы) - using cleanupTestMaterials
      await expectSoftWithScreenshot(
        page,
        async () => {
          await materialsPage.cleanupTestMaterials(MATERIAL_NAMES, test.info());
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test materials: ${MATERIAL_NAMES.join(', ')}`,
        test.info(),
      );

      // 5. Archive users - using cleanupTestUsersByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await usersPage.cleanupTestUsersByPrefix(USER_USERNAME_PREFIX, test.info());
          expect.soft(true).toBe(true); // Cleanup completed
        },
        `Archive all test users with username prefix ${USER_USERNAME_PREFIX}`,
        test.info(),
      );
    });
  });
};
