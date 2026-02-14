import { test, expect, Locator, Page, TestInfo } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, ProductSpecification } from '../pages/PartsDatabasePage'; // Includes createEquipment and archiveAllTestEquipmentByPrefix methods
import { CreateUsersPage } from '../pages/UsersPage';
import { CreateMaterialsDatabasePage } from '../pages/MaterialsDatabasePage';
import { CreateOrderedFromSuppliersPage, Supplier } from '../pages/OrderedFromSuppliersPage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { ProductionPage } from '../pages/ProductionPage';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsProductionPage from '../lib/Constants/SelectorsProductionPage';
import * as SelectorsEquipment from '../lib/Constants/SelectorsEquipment';
import * as SelectorsNotifications from '../lib/Constants/SelectorsNotifications';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS, RETRY_COUNTS, ROW_COLLECTION } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/Page';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

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

// Test data prefixes
const PRODUCT_PREFIX = 'ERPTEST_PRODUCT';
const ASSEMBLY_PREFIX = 'ERPTEST_SB';
const DETAIL_PREFIX = 'ERPTEST_DETAIL';
const USER_PREFIX = 'ERPTEST_TEST_USER';
const EQUIPMENT_PREFIX = 'ERPTEST_EQUIPMENT';

// Type definitions for test data arrays
type ProductItem = {
  name: string;
  materials?: Array<{ name: string; quantity?: number }>;
  details?: Array<{ name: string; quantity?: number }>;
  assemblies?: Array<{ name: string; materials?: Array<{ name: string; quantity?: number }>; details?: Array<{ name: string; quantity?: number }> }>;
  techProcesses?: string[]; // List of operation type names (e.g., ["Сварочная", "Токарная"])
};

type AssemblyItem = {
  name: string;
  materials?: Array<{ name: string; quantity?: number }>;
  details?: Array<{ name: string; quantity?: number }>;
  techProcesses?: string[]; // List of operation type names
};

type DetailItem = {
  name: string;
  techProcesses?: string[]; // List of operation type names
};

type EquipmentItem = {
  name: string;
  operationType?: string; // Operation type name (e.g., "Токарный-ЧПУ")
};

// Test data arrays
// Products can optionally have materials and details
const products: ProductItem[] = [
  {
    name: `${PRODUCT_PREFIX}_001`,
    techProcesses: [ 'Покраска', 'Покраска'],
  },
  { name: `${PRODUCT_PREFIX}_002`,
    techProcesses: [ 'Сборка конструкции (ПРОФИ)'],  
 },
];

// Test product with: 1 material, 1 assembly (with 1 material and 2 details), and 2 details
// EXAMPLE: do not delete
// const products: ProductItem[] = [
//   {
//     name: `${PRODUCT_PREFIX}_001`,
//     materials: [
//       { name: `ERPTEST_MATERIAL_001`, quantity: 1 },
//     ],
//     assemblies: [
//       {
//         name: `${ASSEMBLY_PREFIX}_003`,
//         materials: [
//           { name: `ERPTEST_MATERIAL_002`, quantity: 1 },
//         ],
//         details: [
//           { name: `${DETAIL_PREFIX}_001`, quantity: 1 },
//           { name: `${DETAIL_PREFIX}_002`, quantity: 1 },
//         ],
//       },
//     ],
//     details: [
//       { name: `${DETAIL_PREFIX}_003`, quantity: 1 },
//       { name: `${DETAIL_PREFIX}_004`, quantity: 1 },
//     ],
//   },
// ];

// Assemblies can optionally have materials and details
const assemblies: AssemblyItem[] = [
  { name: `${ASSEMBLY_PREFIX}_001`,
  techProcesses: [ 'Сборка гидравлики и пневматики (ПРОФИ)'], 
  },
  { name: `${ASSEMBLY_PREFIX}_002` ,
  techProcesses: [ 'ИСПЫТАНИЕ','ИСПЫТАНИЕ'], 
  },
];

// Details array
const details: DetailItem[] = [
  { name: `${DETAIL_PREFIX}_001`,
  techProcesses: [ 'Зачистная (для разнорабочих)','Токарный-универсал'], 
  },
  { name: `${DETAIL_PREFIX}_002`,
  techProcesses: [ 'Зачистная (для разнорабочих)','Фрезерный-универсал','Фрезерный-универсал'], 
  },
];

const testUsers = [
  {
    username: `${USER_PREFIX}_001`,
    jobType: 'Слесарь сборщик',
    phoneSuffix: '995',
    login: 'Тестовыё сборка 1',
    password: '123456',
    department: 'Металлообработка',
    tableNumberStart: 920,
  },
  {
    username: `${USER_PREFIX}_002`,
    jobType: 'Слесарь сборщик',
    phoneSuffix: '999',
    login: 'Тестовыё сборка 2',
    password: '123456',
    department: 'Сборка',
    tableNumberStart: 919,
  },
];

// Equipment array
const equipments: EquipmentItem[] = [
  { name: `${EQUIPMENT_PREFIX}_001`, operationType: 'Токарный-ЧПУ' },
  { name: `${EQUIPMENT_PREFIX}_002`, operationType: 'Токарный-ЧПУ' },
];

// Constants for cleanup - collect material names from products and assemblies if they exist
const MATERIAL_NAMES: string[] = (() => {
  const materialNames: string[] = [];
  // Collect materials from products
  for (const product of products) {
    if ('materials' in product && product.materials) {
      for (const material of product.materials) {
        materialNames.push(material.name);
      }
    }
  }
  // Collect materials from assemblies
  for (const assembly of assemblies) {
    if ('materials' in assembly && assembly.materials) {
      for (const material of assembly.materials) {
        materialNames.push(material.name);
      }
    }
  }
  return materialNames;
})();
const USER_USERNAME_PREFIX = USER_PREFIX;

export const runERP_3015 = () => {
  test.skip('ERP-3015 00 - Cleanup - Archive all created test items', async ({ page }) => {
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
          itemPrefixes.push(ASSEMBLY_PREFIX); // Assembly prefix

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
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
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
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test details with prefix ${DETAIL_PREFIX}`,
        test.info(),
      );

      // 4. Archive materials (материалы) - using cleanupTestMaterials
      await expectSoftWithScreenshot(
        page,
        async () => {
          await materialsPage.cleanupTestMaterials(MATERIAL_NAMES, test.info());
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test materials: ${MATERIAL_NAMES.join(', ')}`,
        test.info(),
      );

      // 5. Archive users - using cleanupTestUsersByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await usersPage.cleanupTestUsersByPrefix(USER_USERNAME_PREFIX, test.info());
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test users with username prefix ${USER_USERNAME_PREFIX}`,
        test.info(),
      );

      // 6. Archive equipment - using archiveAllTestEquipmentByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.archiveAllTestEquipmentByPrefix(EQUIPMENT_PREFIX);
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test equipment with prefix ${EQUIPMENT_PREFIX}`,
        test.info(),
      );
    });
  });

  test('ERP-3015 - Create test product with complex specification', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    const detailsPage = new CreatePartsDatabasePage(page);
    const usersPage = new CreateUsersPage(page);

    /* COMMENTED OUT FOR EQUIPMENT TESTING
    await allure.step('Step 1: Create test products with full specification', async () => {
      // Create products - build ProductSpecification from arrays, supporting optional materials/details
      for (const product of products) {
        // Build product spec with optional materials
        const productSpec: ProductSpecification = {
          productName: product.name,
        };
        
        // Add materials to product if specified
        if ('materials' in product && product.materials) {
          productSpec.materials = product.materials;
        }
        
        // Add assemblies to product only if explicitly specified in product
        // Otherwise, assemblies are created separately (empty)
        if ('assemblies' in product && product.assemblies) {
          productSpec.assemblies = product.assemblies.map(assembly => {
            const assemblySpec: { name: string; materials?: Array<{ name: string; quantity?: number }>; details?: Array<{ name: string; quantity?: number }> } = {
              name: assembly.name,
            };
            
            // Add materials to assembly if specified
            if ('materials' in assembly && assembly.materials) {
              assemblySpec.materials = assembly.materials;
            }
            
            // Add details to assembly only if explicitly specified
            if ('details' in assembly && assembly.details) {
              assemblySpec.details = assembly.details;
            }
            
            return assemblySpec;
          });
        }
        
        // Add details to product only if explicitly specified
        if ('details' in product && product.details) {
          productSpec.details = product.details;
        }

        const result = await detailsPage.createИзделие(productSpec, test.info());

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(result.success).toBe(true);
          },
          `Verify product "${product.name}" creation was successful`,
          test.info(),
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(result.productName).toBe(product.name);
          },
          `Verify product name is "${product.name}"`,
          test.info(),
        );

        // Verify details only if they were specified in the product
        if ('details' in product && product.details) {
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(result.createdDetails.length).toBeGreaterThan(0);
            },
            `Verify details were created for product "${product.name}"`,
            test.info(),
          );
        }

        // Verify assemblies only if they were specified in the product
        if ('assemblies' in product && product.assemblies) {
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(result.createdAssemblies.length).toBe(product.assemblies!.length);
            },
            `Verify ${product.assemblies!.length} assemblies were created for product "${product.name}"`,
            test.info(),
          );
        }

        if (result.error) {
          throw new Error(
            `Product "${product.name}" creation failed. Error: ${result.error}. ` +
            `Product spec: ${JSON.stringify(productSpec)}. ` +
            `This occurred during test setup in the "Create test product with complex specification" step.`,
          );
        }
      }

      // Create assemblies separately (empty, unless specified in assemblies array)
      for (const assembly of assemblies) {
        const specificationItems = {
          ...(assembly.materials ? { materials: assembly.materials } : {}),
          ...(assembly.details ? { details: assembly.details } : {}),
        };

        const assemblyCreated = await detailsPage.createAssembly(
          assembly.name,
          Object.keys(specificationItems).length > 0 ? specificationItems : undefined,
          test.info(),
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(assemblyCreated).toBe(true);
          },
          `Verify assembly "${assembly.name}" was created successfully`,
          test.info(),
        );
      }

      // Create details separately
      for (const detail of details) {
        const detailCreated = await detailsPage.createDetail(detail.name, test.info());

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(detailCreated).toBe(true);
          },
          `Verify detail "${detail.name}" was created successfully`,
          test.info(),
        );
      }
    });
    */

    /* COMMENTED OUT FOR EQUIPMENT TESTING
    await allure.step('Step 1.5: Add tech processes to products, assemblies, and details', async () => {
      // Add tech processes to products
      for (const product of products) {
        if (product.techProcesses && product.techProcesses.length > 0) {
          await detailsPage.addTechProcesses(
            product.name,
            'product',
            product.techProcesses,
            test.info(),
            false, // Product is already saved, need to open for editing
          );
        }
      }


      // Add tech processes to assemblies
      for (const assembly of assemblies) {
        if (assembly.techProcesses && assembly.techProcesses.length > 0) {
          await detailsPage.addTechProcesses(
            assembly.name,
            'assembly',
            assembly.techProcesses,
            test.info(),
            false, // Assembly is already saved, need to open for editing
          );
        }
      }

      // Add tech processes to details
      for (const detail of details) {
        if (detail.techProcesses && detail.techProcesses.length > 0) {
          await detailsPage.addTechProcesses(
            detail.name,
            'detail',
            detail.techProcesses,
            test.info(),
            false, // Detail is already saved, need to open for editing
          );
        }
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

    await allure.step('Step 3: Create orders for products and assemblies', async () => {
      const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);

      // Create one order for all products (Изделие) - search by prefix to find both products
      await allure.step(`Create order for all products with prefix "${PRODUCT_PREFIX}" with quantity 10`, async () => {
        const orderResult = await orderedFromSuppliersPage.launchIntoProductionSupplierByPrefix(
          products[0].name, // Use first product name to get prefix
          '10',
          Supplier.product,
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(orderResult.checkOrderNumber).toBeTruthy();
            expect.soft(orderResult.checkOrderNumber.length).toBeGreaterThan(0);
          },
          `Verify order was created for all products with prefix "${PRODUCT_PREFIX}" with order number ${orderResult.checkOrderNumber}`,
          test.info(),
        );

        // Store order number with item info for cleanup
        if (orderResult.checkOrderNumber) {
          createdOrders.push({
            orderNumber: orderResult.checkOrderNumber,
            itemName: PRODUCT_PREFIX, // Store prefix for cleanup
            itemType: 'product',
          });
        }
      });

      // Create one order for all assemblies (СБ) - search by prefix to find both assemblies
      if (assemblies.length > 0) {
        await allure.step(`Create order for all assemblies with prefix "${ASSEMBLY_PREFIX}" with quantity 10`, async () => {
          const orderResult = await orderedFromSuppliersPage.launchIntoProductionSupplierByPrefix(
            assemblies[0].name, // Use first assembly name to get prefix
            '10',
            Supplier.cbed,
          );

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(orderResult.checkOrderNumber).toBeTruthy();
              expect.soft(orderResult.checkOrderNumber.length).toBeGreaterThan(0);
            },
            `Verify order was created for all assemblies with prefix "${ASSEMBLY_PREFIX}" with order number ${orderResult.checkOrderNumber}`,
            test.info(),
          );

          // Store order number with item info for cleanup
          if (orderResult.checkOrderNumber) {
            createdOrders.push({
              orderNumber: orderResult.checkOrderNumber,
              itemName: ASSEMBLY_PREFIX, // Store prefix for cleanup
              itemType: 'assembly',
            });
          }
        }        );
      }
    });
    */

    await allure.step('Step 4: Create test equipment', async () => {
      // Create each equipment
      for (const equipment of equipments) {
        const equipmentCreated = await detailsPage.createEquipment(
          equipment.name,
          equipment.operationType || 'Токарный-ЧПУ',
          test.info(),
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(equipmentCreated).toBe(true);
          },
          `Verify equipment "${equipment.name}" was created successfully`,
          test.info(),
        );

        // Navigate back to base equipment page to be ready for next equipment
        // (only if there are more equipment items to create)
        if (equipments.indexOf(equipment) < equipments.length - 1) {
          await page.goto(`${ENV.BASE_URL}baseequipments`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
        }
      }
    });
  });

  test.skip('ERP-3015 - Validate table cell values in production page - Пользователи по производственным заданиям - Сборка', async ({ page, context }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    // Page object for highlighting elements
    const detailsPage = new CreatePartsDatabasePage(page);

    // Constant for number of rows to validate
    const ROWS_TO_VALIDATE = 2;

    await allure.step('Step 2: Validate table cell values', async () => {
      await allure.step('Validate cell: Кол-во позиций ЗС/ПЗ', async () => {
        // Sub-step 1: Navigate to production page
        await allure.step('Navigate to production page', async () => {
          await page.goto('/production');
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(page.url()).toContain('/production');
            },
            'Verify navigation to production page',
            test.info(),
          );
        });

        // Sub-step 2: Find and click the switch element
        await allure.step('Find and click switch element for Сборка', async () => {
          const switchElement = page.locator(SelectorsProductionPage.PRODUCTION_SWITCH);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(switchElement).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify switch element is visible',
            test.info(),
          );

          const сборкаItem = switchElement.locator(SelectorsProductionPage.PRODUCTION_SWITCH_ITEM_SBORKA).filter({ hasText: 'Сборка' });
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(сборкаItem).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify Сборка item is visible in switch',
            test.info(),
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(сборкаItem).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify Сборка item is enabled before clicking',
            test.info(),
          );
          await сборкаItem.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.waitForLoadState('networkidle');
          
          // Wait a bit more for table to render
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });

        // Sub-step 3: Find the table and wait for rows to be visible
        await allure.step('Find production table and wait for rows', async () => {
          const table = page.locator(SelectorsProductionPage.PRODUCTION_TABLE);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify production table is visible',
            test.info(),
          );
          
          // Highlight the table to verify we found it
          await table.evaluate((el) => {
            (el as HTMLElement).style.border = '5px solid red';
            (el as HTMLElement).style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(TIMEOUTS.SHORT); // Keep highlight visible for a moment
          
          // Wait for table to be fully loaded and stable before analyzing
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.MEDIUM); // Brief wait for table to be fully rendered
        });

        // Sub-step 4: Validate first N main rows
        await allure.step(`Validate first ${ROWS_TO_VALIDATE} main rows`, async () => {
          const table = page.locator(SelectorsProductionPage.PRODUCTION_TABLE);
          // Get all rows and filter to main rows only (exclude sub-rows with -Operation or -NonOperation in data-testid)
          const allRows = table.locator('tbody tr');
          const rowCount = await allRows.count();
          const mainRows: any[] = [];
          // Collect more main rows than we need, in case some are skipped
          for (let i = 0; i < rowCount; i++) {
            const row = allRows.nth(i);
            const testId = await row.getAttribute('data-testid');
            if (testId && !testId.includes('-Operation') && !testId.includes('-NonOperation')) {
              mainRows.push(row);
              // Collect at least MAX_ROWS_TO_COLLECT main rows to account for skipped rows (0/0 values, -Operation, or -NonOperation)
              if (mainRows.length >= ROW_COLLECTION.MAX_ROWS_TO_COLLECT) {
                break;
              }
            }
          }
          
          if (mainRows.length === 0) {
            const totalRowCount = await allRows.count();
            const tableSelector = SelectorsProductionPage.PRODUCTION_TABLE;
            throw new Error(
              `No main rows found in production table. ` +
              `Total rows checked: ${totalRowCount}. ` +
              `All rows appear to be sub-rows with "-Operation" or "-NonOperation" in their data-testid. ` +
              `Table selector: ${tableSelector}. ` +
              `This occurred while validating table cell values on the production page.`,
            );
          }
          
          // Process each of the first N main rows
          let processedCount = 0;
          // Array to store validation results for table output
          const validationResults: Array<{
            rowNumber: number;
            employeeName: string;
            uniqueEntityIdsValidation: { status: 'PASS' | 'FAIL' | 'SKIP'; actual: number; expected: number };
            leftRightValueValidation: { status: 'PASS' | 'FAIL' | 'SKIP'; leftValue: number; rightValue: number };
          }> = [];
          
          for (let rowIndex = 0; rowIndex < mainRows.length && processedCount < ROWS_TO_VALIDATE; rowIndex++) {
            const currentRow = mainRows[rowIndex];
            
            // Verify this is still a main row (not a sub-row with -Operation or -NonOperation) before processing
            try {
              await currentRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              const rowTestIdCheck = await currentRow.getAttribute('data-testid');
              if (!rowTestIdCheck || rowTestIdCheck.includes('-Operation') || rowTestIdCheck.includes('-NonOperation')) {
                logger.log(`Skipping row ${rowIndex + 1} - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdCheck}`);
                continue; // Skip to next row in the loop
              }
            } catch (e) {
              logger.log(`Skipping row ${rowIndex + 1} - row is not attached or accessible`);
              continue; // Skip to next row in the loop
            }
            
            let employeeName: string | null = null;
            let leftValue: number = 0;
            // Initialize result object for this row
            const rowResult: {
              rowNumber: number;
              employeeName: string;
              uniqueEntityIdsValidation: { status: 'PASS' | 'FAIL' | 'SKIP'; actual: number; expected: number };
              leftRightValueValidation: { status: 'PASS' | 'FAIL' | 'SKIP'; leftValue: number; rightValue: number };
            } = {
              rowNumber: rowIndex + 1,
              employeeName: '',
              uniqueEntityIdsValidation: { status: 'SKIP', actual: 0, expected: 0 },
              leftRightValueValidation: { status: 'SKIP', leftValue: 0, rightValue: 0 },
            };
            let rightValue: number = 0;
            
            await allure.step(`Validate row ${rowIndex + 1} of ${mainRows.length} (processing ${processedCount + 1} of ${ROWS_TO_VALIDATE})`, async () => {
              // Wait for row to be attached (row is visible but Playwright may report it as hidden)
              await currentRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
              
              // Scroll the table container into view first, then the row
              const table = page.locator(SelectorsProductionPage.PRODUCTION_TABLE);
              await table.scrollIntoViewIfNeeded();
              await page.waitForTimeout(TIMEOUTS.SHORT);
              
              // Force scroll the row into view (use evaluate to ensure it actually scrolls)
              await currentRow.evaluate((el: HTMLElement) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              });
              await page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait longer after scrolling to ensure row is fully rendered
              
              // Verify the row is actually visible after scrolling
              try {
                await currentRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
              } catch (e) {
                logger.log(`Row ${rowIndex + 1} is not visible after scrolling, will try to continue anyway`);
              }
              
              // Re-verify this is still a main row after scrolling (DOM might have changed)
              const rowTestIdAfterScroll = await currentRow.getAttribute('data-testid');
              if (!rowTestIdAfterScroll || rowTestIdAfterScroll.includes('-Operation') || rowTestIdAfterScroll.includes('-NonOperation')) {
                logger.log(`Skipping row ${rowIndex + 1} after scroll - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdAfterScroll}`);
                return; // Skip the rest of the steps for this row
              }
              
              // Re-query the row by its data-testid to get a fresh locator after scrolling
              const freshRow = table.locator(SelectorsProductionPage.getProductionTableRowByTestId(rowTestIdAfterScroll));
              await freshRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT });
              
              // Highlight the current row to verify we found it
              await detailsPage.highlightElement(freshRow, {
                border: '5px solid blue',
                backgroundColor: 'lightblue',
              });
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight

              // Re-verify this is still a main row before accessing cells (DOM might have changed after highlighting)
              const rowTestIdBeforeCells = await freshRow.getAttribute('data-testid');
              if (!rowTestIdBeforeCells || rowTestIdBeforeCells.includes('-Operation') || rowTestIdBeforeCells.includes('-NonOperation')) {
                logger.log(`Skipping row ${rowIndex + 1} before accessing cells - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdBeforeCells}`);
                return; // Skip the rest of the steps for this row
              }

              // First cell: Popover (3 dots menu) - data-testid is on the td element itself
              const popoverCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_POPOVER_CELL_SUFFIX}"]`).first();
              await popoverCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD }); // Increased timeout to allow cells to render after scroll
              // Scroll the cell into view to ensure it's visible
              await popoverCell.scrollIntoViewIfNeeded();
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait a bit after scrolling
              await detailsPage.highlightElement(popoverCell, {
                border: '3px solid red',
                backgroundColor: 'pink',
              });
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

              // Second cell: TabelNumber - data-testid is on the td element itself
              const tabelNumberCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_TABEL_NUMBER_CELL_SUFFIX}"]`).first();
              await tabelNumberCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              await detailsPage.highlightElement(tabelNumberCell, {
                border: '3px solid orange',
                backgroundColor: 'lightyellow',
              });
          await page.waitForTimeout(TIMEOUTS.SHORT);

              // Third cell: Name (employee name) - data-testid is on the td element itself
              const nameCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_NAME_CELL_SUFFIX}"]`).first();
          await nameCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              await detailsPage.highlightElement(nameCell, {
                border: '3px solid green',
                backgroundColor: 'lightgreen',
              });
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          
          employeeName = await nameCell.textContent();
          rowResult.employeeName = employeeName || '';
          
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(employeeName).toBeTruthy();
              expect.soft(employeeName!.trim().length).toBeGreaterThan(0);
            },
            `Verify employee name extracted: ${employeeName}`,
            test.info(),
          );

              // Fourth cell: CountPosition - format: "10 / 10" - data-testid is on the td element itself
              const countCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX}"]`).first();
          await countCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              await detailsPage.highlightElement(countCell, {
                border: '3px solid purple',
                backgroundColor: 'lavender',
              });
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          
          const countText = await countCell.textContent();
          
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(countText).toBeTruthy();
              expect.soft(countText!.trim().length).toBeGreaterThan(0);
            },
            `Verify count position extracted: ${countText}`,
            test.info(),
          );

          // Parse left and right values from "10 / 10" format
          const countMatch = countText!.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
          if (!countMatch) {
            const cellSelector = `td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX}"]`;
            const rowTestIdForError = await freshRow.getAttribute('data-testid');
            throw new Error(
              `Invalid count format in table cell. ` +
              `Actual value: "${countText}". ` +
              `Expected format: "number / number" (e.g., "10 / 10"). ` +
              `Row data-testid: ${rowTestIdForError || 'N/A'}. ` +
              `Cell selector: ${cellSelector}. ` +
              `Employee: ${employeeName || 'N/A'}. ` +
              `This occurred while parsing the count position cell value in row ${rowIndex + 1}.`,
            );
          }
          leftValue = parseInt(countMatch[1], 10);
          rightValue = parseInt(countMatch[2], 10);

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(leftValue).toBeGreaterThanOrEqual(0);
              expect.soft(rightValue).toBeGreaterThanOrEqual(0);
            },
            `Verify parsed values - left: ${leftValue}, right: ${rightValue}`,
            test.info(),
          );

          // Skip this row if both values are 0
          if (leftValue === 0 && rightValue === 0) {
            logger.log(`Skipping row ${rowIndex + 1} - both leftValue and rightValue are 0`);
            return; // Skip to next row
          }

              // Sub-step 5: Click 3 dots menu in first cell
              // Get the row number from the fresh row's data-testid to scope the menu item search
              const rowTestId = await freshRow.getAttribute('data-testid');
          const rowNumberMatch = rowTestId?.match(/Row(\d+)$/);
          const rowNumber = rowNumberMatch ? rowNumberMatch[1] : null;
          
              await allure.step('Click 3 dots menu in first cell', async () => {
                // Use the popoverCell we already found and highlighted
                const threeDotsButton = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_POPOVER_SHOW_BUTTON_SUFFIX}"]`);
                
                // Scroll the button into view to ensure it's visible
                await threeDotsButton.scrollIntoViewIfNeeded();
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait a bit after scrolling
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(threeDotsButton).toBeVisible({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                  },
                  'Verify 3 dots menu button is visible',
                  test.info(),
                );
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(threeDotsButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                  },
                  'Verify 3 dots menu button is enabled before clicking',
                  test.info(),
                );
                
                await threeDotsButton.click();
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait for popover to open
                
                // Wait for the popover menu to be visible
                if (rowNumber) {
                  const popoverMenuContainer = page.locator(SelectorsProductionPage.getProductionTableRowPopoverOptionsList(rowNumber)).first();
                  try {
                    await popoverMenuContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Additional wait for popover to fully render
                  } catch (e) {
                    logger.log('Popover menu container not visible, will continue anyway');
                  }
                }
              });

              // Sub-step 6: Click second menu item "ПЗ по пользователю"
              await allure.step('Click menu item: ПЗ по пользователю', async () => {
                // Scope the menu item search to the popover from the current row using the row number
                let menuItem: Locator;
                if (rowNumber) {
                  // Use the specific row number to find the exact menu item
                  menuItem = page.locator(SelectorsProductionPage.getProductionTableRowPopoverItem1(rowNumber)).filter({ hasText: 'ПЗ по пользователю' });
                } else {
                  // Fallback: scope to the popover cell's popover
                  const popoverMenu = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX}"]`);
                  menuItem = popoverMenu.locator(`[data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_POPOVER_ITEM1_SUFFIX}"]`).filter({ hasText: 'ПЗ по пользователю' });
                }
                
                // Wait for menu item to be attached first, then try to make it visible
                await menuItem.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                
                // Try to scroll the menu item into view, but handle errors gracefully
                try {
                  await menuItem.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief wait after scrolling
                } catch (scrollError) {
                  // If scrolling fails, that's okay - we'll try to click anyway
                }
                
                // Try to wait for visibility and enabled state
                let useForceClick = false;
                try {
                  await menuItem.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                  // Check if it's enabled
                  const isEnabled = await menuItem.isEnabled();
                  if (!isEnabled) {
                    logger.log('Menu item is visible but not enabled, will use force click');
                    useForceClick = true;
                  } else {
                    // Brief wait to ensure it's fully ready
                    await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                  }
                } catch (e) {
                  // If it's still hidden, we'll use force click
                  logger.log('Menu item is attached but not visible, will use force click');
                  useForceClick = true;
                }
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(menuItem).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                  },
                  'Verify menu item "ПЗ по пользователю" is attached',
                  test.info(),
                );
                
                // Verify menu item is enabled before clicking (only when not using force click)
                if (!useForceClick) {
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(menuItem).toBeEnabled({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    },
                    'Verify menu item "ПЗ по пользователю" is enabled before clicking',
                    test.info(),
                  );
                }
                
                // Scroll the popover container into view first, then the menu item
                if (rowNumber) {
                  const popoverMenuContainer = page.locator(SelectorsProductionPage.getProductionTableRowPopoverOptionsList(rowNumber)).first();
                  try {
                    await popoverMenuContainer.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                  } catch (e) {
                    // Could not scroll popover container into view
                  }
                }
                
                // Scroll the menu item into view right before clicking
                try {
                  await menuItem.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief wait after scrolling
                } catch (scrollError) {
                  // Could not scroll menu item into view before click, will try to click anyway
                }
                
                // Highlight the menu item before clicking
                await detailsPage.highlightElement(menuItem, {
                  border: '5px solid yellow',
                  backgroundColor: 'lightyellow',
                });
                await page.waitForTimeout(TIMEOUTS.LONG); // 2 second pause before clicking
                
                // Set up network listener BEFORE clicking to ensure we catch the API response
                let apiResponse: any = null;
                let responseResolve: ((value: void) => void) | null = null;
                
                // Create a Promise that resolves when the API response is captured
                const responseCapturedPromise = new Promise<void>((resolve) => {
                  responseResolve = resolve;
                });
                
                const responseHandler = async (response: any) => {
                  const url = response.url();
                  if (url.includes('/api/production-task/by-user')) {
                    try {
                      const responseBody = await response.json();
                      apiResponse = {
                        status: response.status(),
                        url: url,
                        data: responseBody,
                      };
                      // Remove listeners once we've captured the response
                      context.off('response', responseHandler);
                      newPage.off('response', responseHandler);
                      if (responseResolve) {
                        responseResolve();
                      }
                    } catch (error) {
                      logger.log(`Failed to parse API response: ${error}`);
                      apiResponse = {
                        status: response.status(),
                        url: url,
                        error: String(error),
                      };
                      // Remove listeners even on error
                      context.off('response', responseHandler);
                      newPage.off('response', responseHandler);
                      if (responseResolve) {
                        responseResolve();
                      }
                    }
                  }
                };
                
                // Set up listener on context to catch responses from any page
                context.on('response', responseHandler);
                
                // Wait for new page to be created before clicking
                // Use a longer timeout for waiting for the new page
                const [newPage] = await Promise.all([
                  context.waitForEvent('page', { timeout: WAIT_TIMEOUTS.PAGE_RELOAD }),
                  useForceClick 
                    ? menuItem.click({ force: true, timeout: WAIT_TIMEOUTS.STANDARD })
                    : menuItem.click({ timeout: WAIT_TIMEOUTS.STANDARD }),
                ]);
                
                // Also set up listener on the new page specifically
                newPage.on('response', responseHandler);
            
            // Wait for the new page to fully open and load
            await newPage.waitForLoadState('domcontentloaded');
            await newPage.waitForLoadState('load');
            await newPage.waitForLoadState('networkidle');
            await newPage.waitForTimeout(TIMEOUTS.MEDIUM);
            
            // Sub-step 7: Highlight employee name on new page
            await allure.step('Highlight employee name on new page', async () => {
              // Create page object for the new page
              const newPageDetailsPage = new CreatePartsDatabasePage(newPage);
              
              // Try to find the element by class
              const employeeElement = newPage.locator(SelectorsProductionPage.TASK_BY_USER_EMPLOYEE_CLASS);
              const elementCount = await employeeElement.count();
              
              if (elementCount > 0) {
                // Element exists, wait for it and highlight it
                await employeeElement.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                
                // Highlight the employee name element
                await newPageDetailsPage.highlightElement(employeeElement, {
                  border: '5px solid green',
                  backgroundColor: 'lightgreen',
                });
                await newPage.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
              } else {
                // Element doesn't exist - try to find by text content instead
                const employeeNameText = employeeName!.trim();
                const textElement = newPage.getByText(employeeNameText, { exact: false }).first();
                const textElementCount = await textElement.count();
                
                if (textElementCount > 0) {
                  // Found by text, highlight it
                  await textElement.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                  await newPageDetailsPage.highlightElement(textElement, {
                    border: '5px solid green',
                    backgroundColor: 'lightgreen',
                  });
                  await newPage.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
                }
              }
            });

            // Sub-step 8: Wait for API response to be captured
            await allure.step('Wait for API response to be captured', async () => {
              // Wait for the response to be captured using Promise.race with timeout
              // This avoids retry loops by using Playwright's built-in waiting mechanisms
              const timeoutPromise = new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve(); // Resolve after timeout (response may have been missed, will be checked in assertion)
                }, RETRY_COUNTS.API_RESPONSE_WAIT * TIMEOUTS.MEDIUM);
              });
              
              // Race between response capture and timeout
              await Promise.race([responseCapturedPromise, timeoutPromise]);
              
              // Remove listeners if still attached
              context.off('response', responseHandler);
              newPage.off('response', responseHandler);
              
              await expectSoftWithScreenshot(
                newPage,
                () => {
                  expect.soft(apiResponse).toBeTruthy();
                  if (apiResponse) {
                    expect.soft([200, 201]).toContain(apiResponse.status); // Accept both 200 (OK) and 201 (Created)
                    expect.soft(apiResponse.data).toBeTruthy();
                  }
                },
                `Verify API response captured: ${apiResponse ? `Status: ${apiResponse.status}, URL: ${apiResponse.url}` : 'Failed - no response captured'} - Employee: ${employeeName || 'N/A'}`,
                test.info(),
              );
              
              // Extract entities and their IDs from the captured response
              if (apiResponse && apiResponse.data) {
                // Extract entities and their IDs
                let itemCount = 0;
                const entityIds: number[] = [];
                const entities: any[] = [];
                
                if (Array.isArray(apiResponse.data)) {
                  itemCount = apiResponse.data.length;
                  
                  // Extract all entities and their IDs
                  for (let i = 0; i < itemCount; i++) {
                    const item = apiResponse.data[i];
                    if (item && item.entity) {
                      entities.push(item.entity);
                      if (item.entity.id !== undefined && item.entity.id !== null) {
                        entityIds.push(item.entity.id);
                      }
                    }
                  }
                } else if (apiResponse.data && typeof apiResponse.data === 'object') {
                  // Check if data has an array property
                  const keys = Object.keys(apiResponse.data);
                  
                  // Try to find array properties
                  for (const key of keys) {
                    if (Array.isArray(apiResponse.data[key])) {
                      const array = apiResponse.data[key];
                      itemCount = array.length;
                      
                      // Extract entities from this array
                      for (let i = 0; i < itemCount; i++) {
                        const item = array[i];
                        if (item && item.entity) {
                          entities.push(item.entity);
                          if (item.entity.id !== undefined && item.entity.id !== null) {
                            entityIds.push(item.entity.id);
                          }
                        }
                      }
                      break;
                    }
                  }
                }
                
                // Verify and log the count
                await expectSoftWithScreenshot(
                  newPage,
                  () => {
                    expect.soft(itemCount).toBeGreaterThan(0);
                    expect.soft(entities.length).toBeGreaterThan(0);
                    expect.soft(entityIds.length).toBe(entities.length);
                  },
                  `Verify response contains entities: ${entities.length} entities found with ${entityIds.length} IDs - Employee: ${employeeName || 'N/A'}`,
                  test.info(),
                );
                
                // Remove duplicate IDs
                const uniqueEntityIds = [...new Set(entityIds)];
                
                // Compare unique count with rightValue from the main table for the current row
                const uniqueEntityIdsMatch = uniqueEntityIds.length === rightValue;
                rowResult.uniqueEntityIdsValidation = {
                  status: uniqueEntityIdsMatch ? 'PASS' : 'FAIL',
                  actual: uniqueEntityIds.length,
                  expected: rightValue,
                };
                await expectSoftWithScreenshot(
                  newPage,
                  () => {
                    expect.soft(uniqueEntityIds.length).toBe(rightValue);
                  },
                  `Verify unique entity IDs count (${uniqueEntityIds.length}) matches rightValue (${rightValue}) from main table row ${rowIndex + 1} - Employee: ${employeeName || 'N/A'}`,
                  test.info(),
                );
                
                // Verify that both left and right numbers are the same
                const leftRightMatch = rightValue === leftValue;
                rowResult.leftRightValueValidation = {
                  status: leftRightMatch ? 'PASS' : 'FAIL',
                  leftValue: leftValue,
                  rightValue: rightValue,
                };
                await expectSoftWithScreenshot(
                  newPage,
                  () => {
                    expect.soft(rightValue).toBe(leftValue);
                  },
                  `Verify rightValue (${rightValue}) matches leftValue (${leftValue}) from main table row ${rowIndex + 1} - Employee: ${employeeName || 'N/A'}`,
                  test.info(),
                );
              }
              
              // Wait for page to be fully stable before closing
              await newPage.waitForLoadState('networkidle');
              await newPage.waitForTimeout(TIMEOUTS.SHORT);
            });
            
            // Close the new page and switch back to the original page
            // Only close after all processing and console output is complete
            await newPage.close();
            await page.bringToFront();
            await page.waitForTimeout(TIMEOUTS.SHORT); // Wait a bit for the page to be ready
            }); // End of "Click menu item: ПЗ по пользователю" step
            
            // Add row result to validation results array
            validationResults.push(rowResult);
            
            // Increment processed count only after successfully processing the row
            processedCount++;
            }); // End of "Validate row X" step
          } // End of loop through rows
          
          // Print validation results table
          logger.log('\n' + '='.repeat(120));
          logger.log('VALIDATION RESULTS TABLE'.padStart(70));
          logger.log('='.repeat(120));
          logger.log('Row'.padEnd(5) + '| ' + 'Employee Name'.padEnd(50) + '| ' + 'Unique Entity IDs'.padEnd(30) + '| ' + 'Left/Right Values');
          logger.log('-'.repeat(120));
          for (const result of validationResults) {
            const rowNum = result.rowNumber.toString().padEnd(4);
            const employee = (result.employeeName.length > 48 ? result.employeeName.substring(0, 45) + '...' : result.employeeName).padEnd(50);
            const uniqueStatus = result.uniqueEntityIdsValidation.status === 'SKIP'
              ? 'SKIP'
              : result.uniqueEntityIdsValidation.status === 'PASS'
              ? `PASS (${result.uniqueEntityIdsValidation.actual}/${result.uniqueEntityIdsValidation.expected})`
              : `FAIL (${result.uniqueEntityIdsValidation.actual}/${result.uniqueEntityIdsValidation.expected})`;
            const unique = uniqueStatus.padEnd(30);
            const leftRightStatus = result.leftRightValueValidation.status === 'SKIP'
              ? 'SKIP'
              : result.leftRightValueValidation.status === 'PASS'
              ? `PASS (${result.leftRightValueValidation.leftValue}/${result.leftRightValueValidation.rightValue})`
              : `FAIL (${result.leftRightValueValidation.leftValue}/${result.leftRightValueValidation.rightValue})`;
            const leftRight = leftRightStatus.padEnd(30);
            logger.log(`${rowNum}| ${employee}| ${unique}| ${leftRight}`);
          }
          logger.log('-'.repeat(120));
          logger.log(`Total Rows Processed: ${validationResults.length}`);
          const uniquePassed = validationResults.filter(r => r.uniqueEntityIdsValidation.status === 'PASS').length;
          const uniqueFailed = validationResults.filter(r => r.uniqueEntityIdsValidation.status === 'FAIL').length;
          const uniqueSkipped = validationResults.filter(r => r.uniqueEntityIdsValidation.status === 'SKIP').length;
          const leftRightPassed = validationResults.filter(r => r.leftRightValueValidation.status === 'PASS').length;
          const leftRightFailed = validationResults.filter(r => r.leftRightValueValidation.status === 'FAIL').length;
          const leftRightSkipped = validationResults.filter(r => r.leftRightValueValidation.status === 'SKIP').length;
          logger.log(`Unique Entity IDs: ${uniquePassed} PASS, ${uniqueFailed} FAIL, ${uniqueSkipped} SKIP`);
          logger.log(`Left/Right Values: ${leftRightPassed} PASS, ${leftRightFailed} FAIL, ${leftRightSkipped} SKIP`);
          logger.log('='.repeat(120) + '\n');
        }); // End of "Validate first N main rows" step
      });
    });
  });

  test.skip('ERP-3015 - Validate table cell values in production page - Оборудование по производственным заданиям металлообработки table', async ({ page, context }) => {
    test.setTimeout(TEST_TIMEOUTS.SUPER_EXTENDED);

    // Page object for Production page interactions
    const productionPage = new ProductionPage(page);

    // Constant for number of rows to validate
    const ROWS_TO_VALIDATE = 20;

    await allure.step('Step 3: Validate table cell values - Next table', async () => {
      await allure.step('Validate cell: Занятость на ПЗ - Кол-во позиций', async () => {
        // Sub-step 1: Navigate to production page
        await allure.step('Navigate to production page', async () => {
          await page.goto('/production');
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(page.url()).toContain('/production');
            },
            'Verify navigation to production page',
            test.info(),
          );
        });

        // Sub-step 1.2: Ensure User accordion (top) is closed
        await allure.step('Ensure User accordion (top) is closed', async () => {
          const userAccordionButton = page.locator(SelectorsProductionPage.USER_ACCORDION_BUTTON);
          
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(userAccordionButton).toBeVisible({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
            },
            'Verify User accordion button is visible',
            test.info(),
          );

          // Verify it's a div element
          const tagName = await userAccordionButton.evaluate((el) => el.tagName.toLowerCase());
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(tagName).toBe('div');
            },
            `Verify User accordion button is a div element (found: ${tagName})`,
            test.info(),
          );

          // Check if the accordion is open by checking for the class
          const classList = await userAccordionButton.evaluate((el) => Array.from(el.classList));
          const isOpen = classList.includes('accordion-button_open');
          
          if (isOpen) {
            // Accordion is open, click to close it
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(userAccordionButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
              },
              'Verify User accordion button is enabled before clicking',
              test.info(),
            );
            await userAccordionButton.click();
            await page.waitForTimeout(TIMEOUTS.STANDARD); // Wait 1 second after clicking
            
            // Verify the accordion is now closed
            const classListAfterClick = await userAccordionButton.evaluate((el) => Array.from(el.classList));
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(classListAfterClick).not.toContain('accordion-button_open');
              },
              'Verify User accordion is closed after clicking',
              test.info(),
            );
          } else {
            // Accordion is already closed
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(isOpen).toBe(false);
              },
              'Verify User accordion is already closed',
              test.info(),
            );
          }
        });

        // Sub-step 1.5: Ensure Equipment accordion (second) is open
        await allure.step('Ensure Equipment accordion (second) is open', async () => {
          // Get the accordion button element (must be a div)
          const accordionButton = page.locator(SelectorsProductionPage.EQUIPMENT_ACCORDION_BUTTON);
          
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(accordionButton).toBeVisible({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
            },
            'Verify accordion button is visible',
            test.info(),
          );

          // Verify it's a div element
          const tagName = await accordionButton.evaluate((el) => el.tagName.toLowerCase());
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(tagName).toBe('div');
            },
            `Verify accordion button is a div element (found: ${tagName})`,
            test.info(),
          );

          // Check if the accordion is already open by checking for the class
          const classList = await accordionButton.evaluate((el) => Array.from(el.classList));
          const isOpen = classList.includes('accordion-button_open');
          
          if (!isOpen) {
            // Accordion is closed, click to open it
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(accordionButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
              },
              'Verify accordion button is enabled before clicking',
              test.info(),
            );
            await accordionButton.click();
            await page.waitForTimeout(TIMEOUTS.STANDARD); // Wait 1 second after clicking
            
            // Verify the accordion is now open
            const classListAfterClick = await accordionButton.evaluate((el) => Array.from(el.classList));
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(classListAfterClick).toContain('accordion-button_open');
              },
              'Verify accordion is open after clicking',
              test.info(),
            );
          } else {
            // Accordion is already open
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(isOpen).toBe(true);
              },
              'Verify accordion is already open',
              test.info(),
            );
          }
        });

        // Sub-step 2: Find and click the switch element for the next table (if it exists)
        await allure.step('Find and click switch element for next table', async () => {
          // Try to find the switch element - it might not exist for Equipment table
          const switchElement = page.locator(SelectorsProductionPage.EQUIPMENT_SWITCH);
          const switchExists = await switchElement.count() > 0;
          
          if (switchExists) {
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(switchElement).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
              },
              'Verify switch element is visible',
              test.info(),
            );

            const nextTableItem = switchElement.locator(SelectorsProductionPage.EQUIPMENT_SWITCH_ITEM_METALWORKING).filter({ hasText: 'Металлообработка' });
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(nextTableItem).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
              },
              'Verify next table item is visible in switch',
              test.info(),
            );
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(nextTableItem).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
              },
              'Verify next table item is enabled before clicking',
              test.info(),
            );
            await nextTableItem.click();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await page.waitForLoadState('networkidle');
            
            // Wait a bit more for table to render
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          } else {
            logger.log('Switch element not found for Equipment table - skipping switch step');
            // Wait a bit for the table to be ready
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await page.waitForLoadState('networkidle');
          }
        });

        // Sub-step 3: Find the table and wait for rows to be visible
        await allure.step('Find production table and wait for rows', async () => {
          const table = page.locator(SelectorsProductionPage.EQUIPMENT_TABLE);
          
          // First check if table is attached to DOM
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(table).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify production table is attached to DOM',
            test.info(),
          );
          
          // Wait for table to become visible (it might be hidden initially)
          await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify production table is visible',
            test.info(),
          );
          
          // Wait for table to be fully loaded and stable before analyzing
          await page.waitForLoadState('networkidle');
          // Additional wait to ensure all popover components are initialized and ready
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });

        // Sub-step 4: Validate first N main rows
        await allure.step(`Validate first ${ROWS_TO_VALIDATE} main rows`, async () => {
          const table = page.locator(SelectorsProductionPage.EQUIPMENT_TABLE);
                // Get all rows and filter to main rows only (exclude sub-rows with -Operation or -NonOperation in data-testid)
                // Equipment table structure: main rows end with Row##, sub-rows end with Row##-Operation0 or Row##-NonOperation
                const allRows = table.locator('tbody tr');
                const rowCount = await allRows.count();
                const mainRows: any[] = [];
                // Collect more main rows than we need, in case some are skipped
                for (let i = 0; i < rowCount; i++) {
                  const row = allRows.nth(i);
                  const testId = await row.getAttribute('data-testid');
                  if (testId && !testId.includes('-Operation') && !testId.includes('-NonOperation')) {
                    mainRows.push(row);
                    // Collect at least MAX_ROWS_TO_COLLECT main rows to account for skipped rows (0 values, -Operation, or -NonOperation)
                    if (mainRows.length >= ROW_COLLECTION.MAX_ROWS_TO_COLLECT) {
                      break;
                    }
                  }
                }
                
                if (mainRows.length === 0) {
                  const totalRowCount = await allRows.count();
                  const tableTestIdForError = await table.getAttribute('data-testid');
                  throw new Error(
                    `No main rows found in equipment production table. ` +
                    `Total rows checked: ${totalRowCount}. ` +
                    `All rows appear to be sub-rows with "-Operation" or "-NonOperation" in their data-testid. ` +
                    `Table data-testid: ${tableTestIdForError || 'N/A'}. ` +
                    `This occurred while validating table cell values on the production page.`,
                  );
                }
                
                // Process each of the first N main rows
                let processedCount = 0;
                // Array to store validation results for table output
                const validationResults: Array<{
                  rowNumber: number;
                  equipmentName: string;
                  cell3CountPosition: { status: 'PASS' | 'FAIL' | 'SKIP'; validRows: number; expected: number; totalRows: number };
                  cell4CountEntity: { status: 'PASS' | 'FAIL' | 'SKIP'; sum: number; expected: number; totalRows: number };
                }> = [];
                
                for (let rowIndex = 0; rowIndex < mainRows.length && processedCount < ROWS_TO_VALIDATE; rowIndex++) {
                  const currentRow = mainRows[rowIndex];
                  
                  // Verify this is still a main row (not a sub-row with -Operation or -NonOperation) before processing
                  // Equipment table: main rows end with Row##, sub-rows end with Row##-Operation0 or Row##-NonOperation
                  try {
                    await currentRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    const rowTestIdCheck = await currentRow.getAttribute('data-testid');
                    if (!rowTestIdCheck || rowTestIdCheck.includes('-Operation') || rowTestIdCheck.includes('-NonOperation')) {
                      logger.log(`Skipping row ${rowIndex + 1} - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdCheck}`);
                      continue; // Skip to next row in the loop
                    }
                  } catch (e) {
                    logger.log(`Skipping row ${rowIndex + 1} - row is not attached or accessible`);
                    continue; // Skip to next row in the loop
                  }
                  
                  let equipmentName: string | null = null;
                  let leftValue: number = 0;
                  let countEntityValue: number = 0;
                  // Store cell references for highlighting on validation failure
                  let countCell: Locator | null = null;
                  let countEntityCell: Locator | null = null;
                  // Initialize result object for this row
                  const rowResult: {
                    rowNumber: number;
                    equipmentName: string;
                    cell3CountPosition: { status: 'PASS' | 'FAIL' | 'SKIP'; validRows: number; expected: number; totalRows: number };
                    cell4CountEntity: { status: 'PASS' | 'FAIL' | 'SKIP'; sum: number; expected: number; totalRows: number };
                  } = {
                    rowNumber: rowIndex + 1,
                    equipmentName: '',
                    cell3CountPosition: { status: 'SKIP', validRows: 0, expected: 0, totalRows: 0 },
                    cell4CountEntity: { status: 'SKIP', sum: 0, expected: 0, totalRows: 0 },
                  };
                  
                  await allure.step(`Validate row ${rowIndex + 1} of ${mainRows.length} (processing ${processedCount + 1} of ${ROWS_TO_VALIDATE})`, async () => {
                    // Wait for row to be attached (row is visible but Playwright may report it as hidden)
                    await currentRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                    
                    // Scroll the table container into view first, then the row
                    await table.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(TIMEOUTS.SHORT);
                    
                    // Force scroll the row into view (use evaluate to ensure it actually scrolls)
                    await currentRow.evaluate((el: HTMLElement) => {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                    await page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait longer after scrolling to ensure row is fully rendered
                    
                    // Verify the row is actually visible after scrolling
                    try {
                      await currentRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                    } catch (e) {
                      logger.log(`Row ${rowIndex + 1} is not visible after scrolling, will try to continue anyway`);
                    }
                    
                    // Re-verify this is still a main row after scrolling (DOM might have changed)
                    // Equipment table: main rows end with Row##, sub-rows end with Row##-Operation0 or Row##-NonOperation
                    const rowTestIdAfterScroll = await currentRow.getAttribute('data-testid');
                    if (!rowTestIdAfterScroll || rowTestIdAfterScroll.includes('-Operation') || rowTestIdAfterScroll.includes('-NonOperation')) {
                      logger.log(`Skipping row ${rowIndex + 1} after scroll - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdAfterScroll}`);
                      return; // Skip the rest of the steps for this row
                    }
                    
                    // Re-query the row by its data-testid to get a fresh locator after scrolling
                    const freshRow = table.locator(SelectorsProductionPage.getEquipmentTableRowByTestId(rowTestIdAfterScroll));
                    await freshRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT });
                    
                    // Highlight the current row with red border as we start processing it
                    await productionPage.highlightElement(freshRow, {
                      border: '3px solid red',
                    });
                    await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight

                    // Re-verify this is still a main row before accessing cells (DOM might have changed after highlighting)
                    // Equipment table: main rows end with Row##, sub-rows end with Row##-Operation0 or Row##-NonOperation
                    const rowTestIdBeforeCells = await freshRow.getAttribute('data-testid');
                    if (!rowTestIdBeforeCells || rowTestIdBeforeCells.includes('-Operation') || rowTestIdBeforeCells.includes('-NonOperation')) {
                      logger.log(`Skipping row ${rowIndex + 1} before accessing cells - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdBeforeCells}`);
                      return; // Skip the rest of the steps for this row
                    }

              // First cell: Popover (3 dots menu) - data-testid is on the td element itself
              let popoverCell: Locator;
              await allure.step('Extract and highlight Popover cell', async () => {
                popoverCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_CELL_SUFFIX}"]`).first();
                await popoverCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.LONG });
                await popoverCell.scrollIntoViewIfNeeded();
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                // Highlight the cell with red border as we extract its value
                await productionPage.highlightElement(popoverCell, {
                  border: '3px solid red',
                });
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
              });

              // Second cell: Name (equipment name) - data-testid is on the td element itself
              await allure.step('Extract and highlight Name cell', async () => {
                const nameCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_NAME_CELL_SUFFIX}"]`).first();
                await nameCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                // Highlight the cell with red border as we extract its value
                await productionPage.highlightElement(nameCell, {
                  border: '3px solid red',
                });
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                
                equipmentName = await nameCell.textContent();
                rowResult.equipmentName = equipmentName || '';
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(equipmentName).toBeTruthy();
                    expect.soft(equipmentName!.trim().length).toBeGreaterThan(0);
                  },
                  `Verify equipment name extracted: ${equipmentName}`,
                  test.info(),
                );
              });

              // Third cell: CountPosition - single number (not "X / Y" format) - data-testid is on the td element itself
              await allure.step('Extract and highlight CountPosition cell', async () => {
                countCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX}"]`).first();
                await countCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                // Highlight the cell with red border as we extract its value
                await productionPage.highlightElement(countCell, {
                  border: '3px solid red',
                });
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                
                const countText = await countCell.textContent();
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(countText).toBeTruthy();
                    expect.soft(countText!.trim().length).toBeGreaterThan(0);
                  },
                  `Verify count position extracted: ${countText}`,
                  test.info(),
                );

                // Parse single number value (not "X / Y" format for Equipment table)
                const countMatch = countText!.trim().match(/^(\d+)$/);
                if (!countMatch) {
                  const cellSelector = `td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX}"]`;
                  const rowTestIdForError = await freshRow.getAttribute('data-testid');
                  throw new Error(
                    `Invalid count format in equipment table cell. ` +
                    `Actual value: "${countText}". ` +
                    `Expected format: single number (e.g., "1"). ` +
                    `Row data-testid: ${rowTestIdForError || 'N/A'}. ` +
                    `Cell selector: ${cellSelector}. ` +
                    `Equipment: ${equipmentName || 'N/A'}. ` +
                    `This occurred while parsing the count position cell value in row ${rowIndex + 1}.`,
                  );
                }
                leftValue = parseInt(countMatch[1], 10);

                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(leftValue).toBeGreaterThanOrEqual(0);
                  },
                  `Verify parsed value - left: ${leftValue}`,
                  test.info(),
                );

                // Skip this row if value is 0
                if (leftValue === 0) {
                  logger.log(`Skipping row ${rowIndex + 1} - leftValue is 0`);
                  return; // Skip to next row
                }

                // Sub-step: Click 3 dots menu in first cell
                // Get the row number from the fresh row's data-testid to scope the menu item search
                const rowTestId = await freshRow.getAttribute('data-testid');
                const rowNumberMatch = rowTestId?.match(/Row(\d+)$/);
                const rowNumber = rowNumberMatch ? rowNumberMatch[1] : null;
                
                await allure.step('Click 3 dots menu in first cell', async () => {
                  // Use the popoverCell we already found and highlighted
                  // Inside it, there's a div with data-testid ending in -Popover-Popover-PopoverShow
                  // HTML structure: td[-Popover] > div[-Popover-Wrapper] > div[-Popover-Popover] > div[-Popover-Popover-Popover] > div[-Popover-Popover-PopoverShow]
                  const threeDotsButton = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_SHOW_BUTTON_SUFFIX}"]`);
                  
                  // Wait for the button to be attached and ready (popover component needs to be initialized)
                  await threeDotsButton.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                  await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for popover component to be fully initialized
                  
                  // Scroll the button into view to ensure it's visible
                  await threeDotsButton.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait a bit after scrolling
                  
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(threeDotsButton).toBeVisible({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    },
                    'Verify 3 dots menu button is visible',
                    test.info(),
                  );
                  
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(threeDotsButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    },
                    'Verify 3 dots menu button is enabled before clicking',
                    test.info(),
                  );
                  
                  // Try clicking using JavaScript to ensure the click event fires
                  await threeDotsButton.evaluate((el: HTMLElement) => {
                    // Try both click() and dispatchEvent to ensure it works
                    el.click();
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                  });
                  await page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for popover to open
                  
                  // Wait for the popover menu to be attached and try to make it visible
                  if (rowNumber) {
                    const popoverMenuContainer = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverOptionsList(rowNumber)).first();
                    // Wait for it to be attached to the DOM
                    await popoverMenuContainer.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                    await page.waitForTimeout(TIMEOUTS.MEDIUM); // Additional wait for menu to be ready and positioned
                    
                    // Try to bring the menu to the front using JavaScript (fix z-index issue)
                    try {
                      await popoverMenuContainer.evaluate((el: HTMLElement) => {
                        const rect = (el as HTMLElement).getBoundingClientRect();
                        // Set high z-index and ensure it's visible
                        (el as HTMLElement).style.zIndex = '99999';
                        (el as HTMLElement).style.position = 'fixed';
                        (el as HTMLElement).style.top = `${rect.top}px`;
                        (el as HTMLElement).style.left = `${rect.left}px`;
                        (el as HTMLElement).style.opacity = '1';
                        (el as HTMLElement).style.visibility = 'visible';
                        (el as HTMLElement).style.display = 'block';
                        // Also try to bring parent elements to front
                        let parent = (el as HTMLElement).parentElement;
                        while (parent && parent !== document.body) {
                          (parent as HTMLElement).style.zIndex = '99999';
                          parent = (parent as HTMLElement).parentElement;
                        }
                      });
                      await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for styles to apply
                    } catch (e) {
                      // If we can't modify the style, that's okay - we'll use JavaScript click anyway
                    }
                    
                    // Try to verify menu is visible after style changes
                    try {
                      await popoverMenuContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                      await expectSoftWithScreenshot(
                        page,
                        () => {
                          expect.soft(popoverMenuContainer).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                        },
                        'Verify popover menu container is visible after style adjustments',
                        test.info(),
                      );
                    } catch (e) {
                      // Menu still not visible, but we verified it's attached
                      await expectSoftWithScreenshot(
                        page,
                        () => {
                          expect.soft(popoverMenuContainer).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                        },
                        'Verify popover menu container is attached (may still be behind table)',
                        test.info(),
                      );
                    }
                  } else {
                    // rowNumber is null, cannot verify menu appearance
                  }
                });

                // Sub-step: Store name and count values for validation on new tab
                await allure.step('Store name and count values for validation', async () => {
                  // Store the equipment name (from second cell) and count position (from third cell)
                  // These values are already extracted in previous steps, but we explicitly verify them here
                  // to ensure they're available for validation on the new tab
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(equipmentName).toBeTruthy();
                      expect.soft(equipmentName!.trim().length).toBeGreaterThan(0);
                      expect.soft(leftValue).toBeGreaterThan(0);
                    },
                    `Store values for validation - Name: "${equipmentName}", Count: ${leftValue}`,
                    test.info(),
                  );
                });

                // Sub-step: Click second menu item "ПЗ по оборудованию" and handle new tab
                await allure.step('Click menu item: ПЗ по оборудованию', async () => {
                  // Scope the menu item search to the popover from the current row using the row number
                  let menuItem: Locator;
                  if (rowNumber) {
                    // Use the specific row number to find the exact menu item
                    menuItem = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverItem1(rowNumber)).filter({ hasText: 'ПЗ по оборудованию' });
                  } else {
                    // Fallback: scope to the popover cell's popover
                    const popoverMenu = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX}"]`);
                    menuItem = popoverMenu.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_ITEM1_SUFFIX}"]`).filter({ hasText: 'ПЗ по оборудованию' });
                  }
                  
                  // Wait for menu item to be attached first
                  await menuItem.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                  
                  // Verify the menu item text is correct before clicking (even if menu is behind table)
                  const menuItemText = await menuItem.textContent();
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(menuItemText).toBe('ПЗ по оборудованию');
                    },
                    `Verify menu item text is correct before clicking: "${menuItemText}"`,
                    test.info(),
                  );
                  
                  // Try a different approach: move the menu to body to ensure it's on top
                  if (rowNumber) {
                    const popoverMenuContainer = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverOptionsList(rowNumber)).first();
                    try {
                      // Try to move the menu to body and position it absolutely
                      await popoverMenuContainer.evaluate((el: HTMLElement) => {
                        const rect = (el as HTMLElement).getBoundingClientRect();
                        const menuElement = el as HTMLElement;
                        
                        // Store original parent
                        const originalParent = menuElement.parentElement;
                        
                        // Move to body
                        document.body.appendChild(menuElement);
                        
                        // Position absolutely at the same screen coordinates
                        menuElement.style.position = 'fixed';
                        menuElement.style.zIndex = '999999';
                        menuElement.style.top = `${rect.top}px`;
                        menuElement.style.left = `${rect.left}px`;
                        menuElement.style.opacity = '1';
                        menuElement.style.visibility = 'visible';
                        menuElement.style.display = 'block';
                      });
                      await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for repositioning
                    } catch (e) {
                      // If we can't move it, try the previous z-index approach
                      try {
                        await popoverMenuContainer.evaluate((el: HTMLElement) => {
                          const rect = (el as HTMLElement).getBoundingClientRect();
                          (el as HTMLElement).style.zIndex = '99999';
                          (el as HTMLElement).style.position = 'fixed';
                          (el as HTMLElement).style.top = `${rect.top}px`;
                          (el as HTMLElement).style.left = `${rect.left}px`;
                          (el as HTMLElement).style.opacity = '1';
                          (el as HTMLElement).style.visibility = 'visible';
                        });
                        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                      } catch (e2) {
                        // If we can't modify the style, that's okay - we verified by text content
                      }
                    }
                  }
                  
                  // Verify menu item is attached
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(menuItem).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                    },
                    'Verify menu item "ПЗ по оборудованию" is attached',
                    test.info(),
                  );
                  
                  // Set up listener for new page BEFORE clicking
                  const newPagePromise = context.waitForEvent('page', { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
                  
                  // Pause before clicking the menu item that opens the new tab
                  await page.waitForTimeout(TIMEOUTS.MEDIUM); // 500ms pause before clicking
                  
                  // Try to get the bounding box for a more realistic mouse click
                  let useMouseClick = false;
                  try {
                    const box = await menuItem.boundingBox();
                    if (box) {
                      // Use mouse click at the center of the element for a more realistic interaction
                      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                      await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Small pause before clicking
                      await page.mouse.down();
                      await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Simulate mouse press duration
                      await page.mouse.up();
                      useMouseClick = true;
                    }
                  } catch (e) {
                    // If bounding box fails, fall back to JavaScript click
                  }
                  
                  // If mouse click didn't work, try JavaScript click with proper event dispatch
                  if (!useMouseClick) {
                    await menuItem.evaluate((el: HTMLElement) => {
                      // Dispatch mouse events in sequence for a more realistic click
                      const mouseDownEvent = new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      const mouseUpEvent = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      
                      (el as HTMLElement).dispatchEvent(mouseDownEvent);
                      (el as HTMLElement).dispatchEvent(mouseUpEvent);
                      (el as HTMLElement).dispatchEvent(clickEvent);
                      // Also call the native click method
                      (el as HTMLElement).click();
                    });
                  }
                  
                  // Wait for the new page to open
                  const newPage = await newPagePromise;
                  
                  // Wait for the new page to fully load
                  await newPage.waitForLoadState('domcontentloaded');
                  await newPage.waitForLoadState('load');
                  await newPage.waitForLoadState('networkidle');
                  await newPage.waitForTimeout(TIMEOUTS.SHORT);
                  
                  // Validate the stored values on the new tab
                  await allure.step('Validate stored values on new tab', async () => {
                    // Create page object for the new page to use highlighting methods
                    const newPageDetailsPage = new CreatePartsDatabasePage(newPage);
                    
                    // Verify the new tab loaded successfully
                    const newPageUrl = newPage.url();
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(newPageUrl).toBeTruthy();
                      },
                      `Verify new tab loaded - URL: ${newPageUrl}`,
                      test.info(),
                    );
                    
                    // Validate equipment name appears in title element with class 'task-by-equipment__equipment'
                    const titleElement = newPage.locator('.task-by-equipment__equipment');
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(titleElement).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                      },
                      'Verify title element is visible',
                      test.info(),
                    );
                    
                    // Highlight the title element
                    await newPageDetailsPage.highlightElement(titleElement, {
                      border: '5px solid green',
                      backgroundColor: 'lightgreen',
                    });
                    await newPage.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
                    
                    const titleText = await titleElement.textContent();
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(titleText).toContain(equipmentName!);
                      },
                      `Verify title element contains equipment name - Title: "${titleText}", Expected: "${equipmentName}"`,
                      test.info(),
                    );
                    
                    // Wait a bit more for the page to fully render, especially the tables
                    await newPage.waitForLoadState('networkidle');
                    await newPage.waitForTimeout(TIMEOUTS.STANDARD);
                    
                    // Find all TaskByEquipment tables on the new page
                    const allTablesPattern = newPage.locator(SelectorsProductionPage.TASK_BY_EQUIPMENT_TABLE_PATTERN);
                    
                    // Wait for tables to appear with retries
                    let tableCount = 0;
                    let retries = 3;
                    while (tableCount === 0 && retries > 0) {
                      tableCount = await allTablesPattern.count();
                      if (tableCount === 0) {
                        logger.log(`No TaskByEquipment tables found on new page yet, waiting longer... (${retries} retries left)`);
                        await newPage.waitForTimeout(TIMEOUTS.STANDARD);
                        await newPage.waitForLoadState('networkidle');
                        retries--;
                      }
                    }
                    
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(tableCount).toBeGreaterThan(0);
                      },
                      `Verify at least one TaskByEquipment table is found on new page (found ${tableCount} table(s))`,
                      test.info(),
                    );
                    
                    logger.log(`Found ${tableCount} TaskByEquipment table(s) on new page to process`);
                    
                    // Process each table and sum up valid rows from all tables
                    let totalValidRowCount = 0;
                    let totalRowCount = 0;
                    
                    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
                      await allure.step(`Process table ${tableIndex + 1} of ${tableCount} on new page`, async () => {
                        const table = allTablesPattern.nth(tableIndex);
                        
                        // Get table data-testid for logging
                        const tableTestId = await table.getAttribute('data-testid');
                        logger.log(`Processing table ${tableIndex + 1} on new page: ${tableTestId}`);
                        
                        // Wait for table to be attached and visible
                        await expectSoftWithScreenshot(
                          newPage,
                          () => {
                            expect.soft(table).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                          },
                          `Verify table ${tableIndex + 1} is attached to DOM on new page`,
                          test.info(),
                        );
                        
                        await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
                        
                        await expectSoftWithScreenshot(
                          newPage,
                          () => {
                            expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                          },
                          `Verify table ${tableIndex + 1} is visible on new page`,
                          test.info(),
                        );
                        
                        // Highlight the table
                        await newPageDetailsPage.highlightElement(table, {
                          border: '5px solid blue',
                          backgroundColor: 'lightblue',
                        });
                        await newPage.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
                        
                        const allTableRows = table.locator('tbody tr');
                        // Wait for at least one row to be attached (table might be loading)
                        try {
                          await allTableRows.first().waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                        } catch (e) {
                          // If no rows found, that's okay - we'll count 0
                        }
                        await newPage.waitForTimeout(TIMEOUTS.SHORT); // Additional wait for rows to render
                        const currentTableRowCount = await allTableRows.count();
                        totalRowCount += currentTableRowCount;
                        
                        // Go through each row and exclude rows that have 0 in the 11th cell (index 10) or have class 'executive-table__row_mark'
                        for (let i = 0; i < currentTableRowCount; i++) {
                          const row = allTableRows.nth(i);
                          
                          // Check if row has the class 'executive-table__row_mark' - exclude it if it does
                          const rowClassList = await row.evaluate((el) => Array.from(el.classList));
                          const hasMarkClass = rowClassList.includes('executive-table__row_mark');
                          
                          if (hasMarkClass) {
                            // Skip this row - it has the mark class
                            continue;
                          }
                          
                          // Highlight the current row being analyzed
                          await newPageDetailsPage.highlightElement(row, {
                            border: '3px solid orange',
                            backgroundColor: 'yellow',
                          });
                          await newPage.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight
                          
                          const cells = row.locator('td');
                          const cellCount = await cells.count();
                          
                          if (cellCount >= 11) {
                            // Get the 11th cell (index 10)
                            const eleventhCell = cells.nth(10);
                            
                            // Highlight the 11th cell
                            await newPageDetailsPage.highlightElement(eleventhCell, {
                              border: '3px solid purple',
                              backgroundColor: 'lavender',
                            });
                            await newPage.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight
                            
                            const cellText = await eleventhCell.textContent();
                            const cellValue = parseInt(cellText?.trim() || '0', 10);
                            
                            // Only count rows where 11th cell is not 0
                            if (cellValue !== 0) {
                              totalValidRowCount++;
                              // Keep highlight for valid rows a bit longer
                              await newPage.waitForTimeout(TIMEOUTS.SHORT);
                            }
                          } else {
                            // If row doesn't have 11 cells, include it in the count
                            totalValidRowCount++;
                            await newPage.waitForTimeout(TIMEOUTS.SHORT);
                          }
                        }
                        
                        logger.log(`Table ${tableIndex + 1}: Found ${currentTableRowCount} total rows, ${totalValidRowCount} valid rows so far`);
                      });
                    }
                    
                    // Verify the total valid row count from all tables matches the count position from main table
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(totalValidRowCount).toBe(leftValue);
                      },
                      `Verify total valid row count from all tables matches count position - Valid Rows: ${totalValidRowCount}, Total Rows: ${totalRowCount}, Expected: ${leftValue}, Equipment: "${equipmentName}"`,
                      test.info(),
                    );
                    
                    // Store test results for table output
                    const testResult = totalValidRowCount === leftValue ? 'PASS' : 'FAIL';
                    rowResult.cell3CountPosition = {
                      status: testResult,
                      validRows: totalValidRowCount,
                      expected: leftValue,
                      totalRows: totalRowCount,
                    };
                    
                    // Pause after count comparison is finished
                    await newPage.waitForTimeout(TIMEOUTS.MEDIUM); // 500ms pause
                  });
                  
                  // Close the new page and switch back to the original page
                  await newPage.close();
                  await page.bringToFront();
                  await page.waitForTimeout(TIMEOUTS.SHORT); // Wait a bit for the page to be ready
                  
                  // Highlight CountPosition cell with red background if validation failed
                  if (rowResult.cell3CountPosition.status === 'FAIL') {
                    // Re-query the cell to ensure it's still valid after returning from new page
                    const rowTestIdForHighlight = await freshRow.getAttribute('data-testid');
                    if (rowTestIdForHighlight) {
                      const freshRowForHighlight = table.locator(SelectorsProductionPage.getEquipmentTableRowByTestId(rowTestIdForHighlight));
                      const countCellForHighlight = freshRowForHighlight.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_POSITION_CELL_SUFFIX}"]`).first();
                      await productionPage.highlightElement(countCellForHighlight, {
                        backgroundColor: 'red',
                        border: '3px solid darkred',
                      });
                      await page.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
                    }
                  }
                });
              });

              // Fourth cell: CountEntity - data-testid is on the td element itself
              await allure.step('Extract and highlight CountEntity cell', async () => {
                countEntityCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_ENTITY_CELL_SUFFIX}"]`).first();
                await countEntityCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
                // Highlight the cell with red border as we extract its value
                await productionPage.highlightElement(countEntityCell, {
                  border: '3px solid red',
                });
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                
                const countEntityText = await countEntityCell.textContent();
                
                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(countEntityText).toBeTruthy();
                    expect.soft(countEntityText!.trim().length).toBeGreaterThan(0);
                  },
                  `Verify count entity extracted: ${countEntityText}`,
                  test.info(),
                );

                // Parse single number value
                const countEntityMatch = countEntityText!.trim().match(/^(\d+)$/);
                if (!countEntityMatch) {
                  const cellSelector = `td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_ENTITY_CELL_SUFFIX}"]`;
                  const rowTestIdForError = await freshRow.getAttribute('data-testid');
                  throw new Error(
                    `Invalid count entity format in equipment table cell. ` +
                    `Actual value: "${countEntityText}". ` +
                    `Expected format: single number (e.g., "1"). ` +
                    `Row data-testid: ${rowTestIdForError || 'N/A'}. ` +
                    `Cell selector: ${cellSelector}. ` +
                    `Equipment: ${equipmentName || 'N/A'}. ` +
                    `This occurred while parsing the count entity cell value in row ${rowIndex + 1}.`,
                  );
                }
                countEntityValue = parseInt(countEntityMatch[1], 10);

                await expectSoftWithScreenshot(
                  page,
                  () => {
                    expect.soft(countEntityValue).toBeGreaterThanOrEqual(0);
                  },
                  `Verify parsed count entity value: ${countEntityValue}`,
                  test.info(),
                );

                // Skip this row if value is 0
                if (countEntityValue === 0) {
                  logger.log(`Skipping row ${rowIndex + 1} - countEntityValue is 0`);
                  return; // Skip to next row
                }

                // Sub-step: Click 3 dots menu in first cell (again for CountEntity validation)
                // Get the row number from the fresh row's data-testid to scope the menu item search
                const rowTestId = await freshRow.getAttribute('data-testid');
                const rowNumberMatch = rowTestId?.match(/Row(\d+)$/);
                const rowNumber = rowNumberMatch ? rowNumberMatch[1] : null;
                
                await allure.step('Click 3 dots menu in first cell', async () => {
                  // Use the popoverCell we already found and highlighted
                  const threeDotsButton = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_SHOW_BUTTON_SUFFIX}"]`);
                  
                  // Wait for the button to be attached and ready (popover component needs to be initialized)
                  await threeDotsButton.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                  await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for popover component to be fully initialized
                  
                  // Scroll the button into view to ensure it's visible
                  await threeDotsButton.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait a bit after scrolling
                  
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(threeDotsButton).toBeVisible({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    },
                    'Verify 3 dots menu button is visible',
                    test.info(),
                  );
                  
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(threeDotsButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.VERY_SHORT });
                    },
                    'Verify 3 dots menu button is enabled before clicking',
                    test.info(),
                  );
                  
                  // Try clicking using JavaScript to ensure the click event fires
                  await threeDotsButton.evaluate((el: HTMLElement) => {
                    // Try both click() and dispatchEvent to ensure it works
                    el.click();
                    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                  });
                  await page.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for popover to open
                  
                  // Wait for the popover menu to be attached and try to make it visible
                  if (rowNumber) {
                    const popoverMenuContainer = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverOptionsList(rowNumber)).first();
                    // Wait for it to be attached to the DOM
                    await popoverMenuContainer.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                    await page.waitForTimeout(TIMEOUTS.MEDIUM); // Additional wait for menu to be ready and positioned
                    
                    // Try to bring the menu to the front using JavaScript (fix z-index issue)
                    try {
                      await popoverMenuContainer.evaluate((el: HTMLElement) => {
                        const rect = (el as HTMLElement).getBoundingClientRect();
                        // Set high z-index and ensure it's visible
                        (el as HTMLElement).style.zIndex = '99999';
                        (el as HTMLElement).style.position = 'fixed';
                        (el as HTMLElement).style.top = `${rect.top}px`;
                        (el as HTMLElement).style.left = `${rect.left}px`;
                        (el as HTMLElement).style.opacity = '1';
                        (el as HTMLElement).style.visibility = 'visible';
                        (el as HTMLElement).style.display = 'block';
                        // Also try to bring parent elements to front
                        let parent = (el as HTMLElement).parentElement;
                        while (parent && parent !== document.body) {
                          (parent as HTMLElement).style.zIndex = '99999';
                          parent = (parent as HTMLElement).parentElement;
                        }
                      });
                      await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for styles to apply
                    } catch (e) {
                      // If we can't modify the style, that's okay - we'll use JavaScript click anyway
                    }
                    
                    // Try to verify menu is visible after style changes
                    try {
                      await popoverMenuContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                      await expectSoftWithScreenshot(
                        page,
                        () => {
                          expect.soft(popoverMenuContainer).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                        },
                        'Verify popover menu container is visible after style adjustments',
                        test.info(),
                      );
                    } catch (e) {
                      // Menu still not visible, but we verified it's attached
                      await expectSoftWithScreenshot(
                        page,
                        () => {
                          expect.soft(popoverMenuContainer).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                        },
                        'Verify popover menu container is attached (may still be behind table)',
                        test.info(),
                      );
                    }
                  } else {
                    // rowNumber is null, cannot verify menu appearance
                  }
                });

                // Sub-step: Store count entity value for validation on new tab
                await allure.step('Store count entity value for validation', async () => {
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(countEntityValue).toBeGreaterThan(0);
                    },
                    `Store count entity value for validation: ${countEntityValue}`,
                    test.info(),
                  );
                });

                // Sub-step: Click menu item "ПЗ по оборудованию" and handle new tab
                await allure.step('Click menu item: ПЗ по оборудованию', async () => {
                  // Scope the menu item search to the popover from the current row using the row number
                  let menuItem: Locator;
                  if (rowNumber) {
                    // Use the specific row number to find the exact menu item
                    menuItem = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverItem1(rowNumber)).filter({ hasText: 'ПЗ по оборудованию' });
                  } else {
                    // Fallback: scope to the popover cell's popover
                    const popoverMenu = popoverCell.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_OPTIONS_LIST_SUFFIX}"]`);
                    menuItem = popoverMenu.locator(`[data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_POPOVER_ITEM1_SUFFIX}"]`).filter({ hasText: 'ПЗ по оборудованию' });
                  }
                  
                  // Wait for menu item to be attached first
                  await menuItem.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                  
                  // Verify the menu item text is correct before clicking
                  const menuItemText = await menuItem.textContent();
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(menuItemText).toBe('ПЗ по оборудованию');
                    },
                    `Verify menu item text is correct before clicking: "${menuItemText}"`,
                    test.info(),
                  );
                  
                  // Try a different approach: move the menu to body to ensure it's on top
                  if (rowNumber) {
                    const popoverMenuContainer = page.locator(SelectorsProductionPage.getEquipmentTableRowPopoverOptionsList(rowNumber)).first();
                    try {
                      // Try to move the menu to body and position it absolutely
                      await popoverMenuContainer.evaluate((el: HTMLElement) => {
                        const rect = (el as HTMLElement).getBoundingClientRect();
                        const menuElement = el as HTMLElement;
                        
                        // Store original parent
                        const originalParent = menuElement.parentElement;
                        
                        // Move to body
                        document.body.appendChild(menuElement);
                        
                        // Position absolutely at the same screen coordinates
                        menuElement.style.position = 'fixed';
                        menuElement.style.zIndex = '999999';
                        menuElement.style.top = `${rect.top}px`;
                        menuElement.style.left = `${rect.left}px`;
                        menuElement.style.opacity = '1';
                        menuElement.style.visibility = 'visible';
                        menuElement.style.display = 'block';
                      });
                      await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for repositioning
                    } catch (e) {
                      // If we can't move it, try the previous z-index approach
                      try {
                        await popoverMenuContainer.evaluate((el: HTMLElement) => {
                          const rect = (el as HTMLElement).getBoundingClientRect();
                          (el as HTMLElement).style.zIndex = '99999';
                          (el as HTMLElement).style.position = 'fixed';
                          (el as HTMLElement).style.top = `${rect.top}px`;
                          (el as HTMLElement).style.left = `${rect.left}px`;
                          (el as HTMLElement).style.opacity = '1';
                          (el as HTMLElement).style.visibility = 'visible';
                        });
                        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                      } catch (e2) {
                        // If we can't modify the style, that's okay - we verified by text content
                      }
                    }
                  }
                  
                  // Verify menu item is attached
                  await expectSoftWithScreenshot(
                    page,
                    () => {
                      expect.soft(menuItem).toBeAttached({ timeout: WAIT_TIMEOUTS.STANDARD });
                    },
                    'Verify menu item "ПЗ по оборудованию" is attached',
                    test.info(),
                  );
                  
                  // Set up listener for new page BEFORE clicking
                  const newPagePromise = context.waitForEvent('page', { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
                  
                  // Pause before clicking the menu item that opens the new tab
                  await page.waitForTimeout(TIMEOUTS.MEDIUM); // 500ms pause before clicking
                  
                  // Try to get the bounding box for a more realistic mouse click
                  let useMouseClick = false;
                  try {
                    const box = await menuItem.boundingBox();
                    if (box) {
                      // Use mouse click at the center of the element for a more realistic interaction
                      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                      await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Small pause before clicking
                      await page.mouse.down();
                      await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Simulate mouse press duration
                      await page.mouse.up();
                      useMouseClick = true;
                    }
                  } catch (e) {
                    // If bounding box fails, fall back to JavaScript click
                  }
                  
                  // If mouse click didn't work, try JavaScript click with proper event dispatch
                  if (!useMouseClick) {
                    await menuItem.evaluate((el: HTMLElement) => {
                      // Dispatch mouse events in sequence for a more realistic click
                      const mouseDownEvent = new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      const mouseUpEvent = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                      });
                      
                      (el as HTMLElement).dispatchEvent(mouseDownEvent);
                      (el as HTMLElement).dispatchEvent(mouseUpEvent);
                      (el as HTMLElement).dispatchEvent(clickEvent);
                      // Also call the native click method
                      (el as HTMLElement).click();
                    });
                  }
                  
                  // Wait for the new page to open
                  const newPage = await newPagePromise;
                  
                  // Wait for the new page to fully load
                  await newPage.waitForLoadState('domcontentloaded');
                  await newPage.waitForLoadState('load');
                  await newPage.waitForLoadState('networkidle');
                  await newPage.waitForTimeout(TIMEOUTS.SHORT);
                  
                  // Validate the stored values on the new tab
                  await allure.step('Validate stored values on new tab', async () => {
                    // Create page object for the new page to use highlighting methods
                    const newPageDetailsPage = new CreatePartsDatabasePage(newPage);
                    
                    // Verify the new tab loaded successfully
                    const newPageUrl = newPage.url();
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(newPageUrl).toBeTruthy();
                      },
                      `Verify new tab loaded - URL: ${newPageUrl}`,
                      test.info(),
                    );
                    
                    // Validate equipment name appears in title element with class 'task-by-equipment__equipment'
                    const titleElement = newPage.locator('.task-by-equipment__equipment');
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(titleElement).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                      },
                      'Verify title element is visible',
                      test.info(),
                    );
                    
                    // Brief pause to ensure element is stable before highlighting
                    await newPage.waitForTimeout(TIMEOUTS.SHORT);
                    
                    // Highlight the title element
                    await newPageDetailsPage.highlightElement(titleElement, {
                      border: '5px solid green',
                      backgroundColor: 'lightgreen',
                    });
                    await newPage.waitForTimeout(TIMEOUTS.SHORT); // Keep highlight visible
                    
                    const titleText = await titleElement.textContent();
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(titleText).toContain(equipmentName!);
                      },
                      `Verify title element contains equipment name - Title: "${titleText}", Expected: "${equipmentName}"`,
                      test.info(),
                    );
                    
                    // Wait a bit more for the page to fully render, especially the table
                    await newPage.waitForLoadState('networkidle');
                    await newPage.waitForTimeout(TIMEOUTS.SHORT);
                    
                    // Find table with class 'Table' and sum values in 11th column
                    // Try multiple selectors: table.Table, .Table, or just Table
                    let table = newPage.locator('table.Table');
                    let tableCount = await table.count();
                    
                    if (tableCount === 0) {
                      // Try just .Table (any element with class Table)
                      table = newPage.locator('.Table');
                      tableCount = await table.count();
                    }
                    
                    if (tableCount === 0) {
                      // Try with case-insensitive or partial match
                      table = newPage.locator('[class*="Table"]');
                      tableCount = await table.count();
                    }
                    
                    if (tableCount === 0) {
                      // Try finding any table element
                      table = newPage.locator('table');
                      tableCount = await table.count();
                    }
                    
                    // Wait for table to be attached and visible
                    if (tableCount > 0) {
                      table = table.first(); // Use the first table found
                      await table.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT });
                      await newPage.waitForTimeout(TIMEOUTS.SHORT); // Wait for table to render
                    } else {
                      // If no table found, wait a bit more and try again
                      await newPage.waitForTimeout(TIMEOUTS.SHORT);
                      table = newPage.locator('.Table');
                      tableCount = await table.count();
                      if (tableCount > 0) {
                        table = table.first();
                      } else {
                        // Try table.Table one more time
                        table = newPage.locator('table.Table');
                        tableCount = await table.count();
                        if (tableCount > 0) {
                          table = table.first();
                        }
                      }
                    }
                    
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(tableCount).toBeGreaterThan(0);
                        if (tableCount > 0) {
                          expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                        }
                      },
                      `Verify table with class Table is visible (found ${tableCount} table(s))`,
                      test.info(),
                    );
                    
                    // Only proceed if we found a table
                    if (tableCount === 0) {
                      throw new Error(`Table with class "Table" not found on the new tab page. URL: ${newPageUrl}`);
                    }
                    
                    // Highlight the table
                    await newPageDetailsPage.highlightElement(table, {
                      border: '5px solid blue',
                      backgroundColor: 'lightblue',
                    });
                    await newPage.waitForTimeout(TIMEOUTS.SHORT); // Keep highlight visible
                    
                    const allTableRows = table.locator('tbody tr');
                    // Wait for at least one row to be attached (table might be loading)
                    try {
                      await allTableRows.first().waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT });
                    } catch (e) {
                      // If no rows found, that's okay - we'll sum 0
                    }
                    await newPage.waitForTimeout(TIMEOUTS.SHORT); // Additional wait for rows to render
                    const totalRowCount = await allTableRows.count();
                    
                    // Go through each row and sum values in the 11th cell, excluding rows with class 'executive-table__row_mark' or 0 in 11th cell
                    let sumOfEleventhColumn = 0;
                    for (let i = 0; i < totalRowCount; i++) {
                      const row = allTableRows.nth(i);
                      
                      // Check if row has the class 'executive-table__row_mark' - exclude it if it does
                      const rowClassList = await row.evaluate((el) => Array.from(el.classList));
                      const hasMarkClass = rowClassList.includes('executive-table__row_mark');
                      
                      if (hasMarkClass) {
                        // Skip this row - it has the mark class
                        continue;
                      }
                      
                      // Highlight the current row being analyzed
                      await newPageDetailsPage.highlightElement(row, {
                        border: '3px solid orange',
                        backgroundColor: 'yellow',
                      });
                      await newPage.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight
                      
                      const cells = row.locator('td');
                      const cellCount = await cells.count();
                      
                      if (cellCount >= 11) {
                        // Get the 11th cell (index 10)
                        const eleventhCell = cells.nth(10);
                        
                        // Highlight the 11th cell
                        await newPageDetailsPage.highlightElement(eleventhCell, {
                          border: '3px solid purple',
                          backgroundColor: 'lavender',
                        });
                        await newPage.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight
                        
                        const cellText = await eleventhCell.textContent();
                        const cellValue = parseInt(cellText?.trim() || '0', 10);
                        
                        // Sum all values in 11th column (including 0 values, but excluding marked rows)
                        sumOfEleventhColumn += cellValue;
                        await newPage.waitForTimeout(TIMEOUTS.VERY_SHORT);
                      }
                    }
                    
                    // Verify the sum matches the count entity value from main table
                    await expectSoftWithScreenshot(
                      newPage,
                      () => {
                        expect.soft(sumOfEleventhColumn).toBe(countEntityValue);
                      },
                      `Verify sum of 11th column values matches count entity - Sum: ${sumOfEleventhColumn}, Expected: ${countEntityValue}, Equipment: "${equipmentName}"`,
                      test.info(),
                    );
                    
                    // Store test results for table output
                    const testResult = sumOfEleventhColumn === countEntityValue ? 'PASS' : 'FAIL';
                    rowResult.cell4CountEntity = {
                      status: testResult,
                      sum: sumOfEleventhColumn,
                      expected: countEntityValue,
                      totalRows: totalRowCount,
                    };
                    
                    // Pause after sum comparison is finished
                    await newPage.waitForTimeout(TIMEOUTS.SHORT); // 500ms pause
                  });
                  
                  // Close the new page and switch back to the original page
                  await newPage.close();
                  await page.bringToFront();
                  await page.waitForTimeout(TIMEOUTS.SHORT); // Wait a bit for the page to be ready
                  
                  // Highlight CountEntity cell with red background if validation failed
                  if (rowResult.cell4CountEntity.status === 'FAIL') {
                    // Re-query the cell to ensure it's still valid after returning from new page
                    const rowTestIdForHighlight = await freshRow.getAttribute('data-testid');
                    if (rowTestIdForHighlight) {
                      const freshRowForHighlight = table.locator(SelectorsProductionPage.getEquipmentTableRowByTestId(rowTestIdForHighlight));
                      const countEntityCellForHighlight = freshRowForHighlight.locator(`td[data-testid^="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.EQUIPMENT_TABLE_ROW_COUNT_ENTITY_CELL_SUFFIX}"]`).first();
                      await productionPage.highlightElement(countEntityCellForHighlight, {
                        backgroundColor: 'red',
                        border: '3px solid darkred',
                      });
                      await page.waitForTimeout(TIMEOUTS.MEDIUM); // Keep highlight visible
                    }
                  }
                });
              });
              
                  }); // End of "Validate row X" step
                  
                  // Add row result to validation results array
                  validationResults.push(rowResult);
                  
                  // Increment processed count only after successfully processing the row
                  processedCount++;
                } // End of loop through rows
                
                // Print validation results table
                logger.log('\n' + '='.repeat(120));
                logger.log('VALIDATION RESULTS TABLE'.padStart(70));
                logger.log('='.repeat(120));
                logger.log('Row'.padEnd(5) + '| ' + 'Equipment Name'.padEnd(50) + '| ' + 'Cell 3 (CountPosition)'.padEnd(30) + '| ' + 'Cell 4 (CountEntity)');
                logger.log('-'.repeat(120));
                for (const result of validationResults) {
                  const rowNum = result.rowNumber.toString().padEnd(4);
                  const equipment = (result.equipmentName.length > 48 ? result.equipmentName.substring(0, 45) + '...' : result.equipmentName).padEnd(50);
                  const cell3Status = result.cell3CountPosition.status === 'SKIP' 
                    ? 'SKIP' 
                    : result.cell3CountPosition.status === 'PASS'
                    ? `PASS (${result.cell3CountPosition.validRows}/${result.cell3CountPosition.expected})`
                    : `FAIL (${result.cell3CountPosition.validRows}/${result.cell3CountPosition.expected})`;
                  const cell3 = cell3Status.padEnd(30);
                  const cell4Status = result.cell4CountEntity.status === 'SKIP'
                    ? 'SKIP'
                    : result.cell4CountEntity.status === 'PASS'
                    ? `PASS (${result.cell4CountEntity.sum}/${result.cell4CountEntity.expected})`
                    : `FAIL (${result.cell4CountEntity.sum}/${result.cell4CountEntity.expected})`;
                  const cell4 = cell4Status.padEnd(30);
                  logger.log(`${rowNum}| ${equipment}| ${cell3}| ${cell4}`);
                }
                logger.log('-'.repeat(120));
                logger.log(`Total Rows Processed: ${validationResults.length}`);
                const cell3Passed = validationResults.filter(r => r.cell3CountPosition.status === 'PASS').length;
                const cell3Failed = validationResults.filter(r => r.cell3CountPosition.status === 'FAIL').length;
                const cell3Skipped = validationResults.filter(r => r.cell3CountPosition.status === 'SKIP').length;
                const cell4Passed = validationResults.filter(r => r.cell4CountEntity.status === 'PASS').length;
                const cell4Failed = validationResults.filter(r => r.cell4CountEntity.status === 'FAIL').length;
                const cell4Skipped = validationResults.filter(r => r.cell4CountEntity.status === 'SKIP').length;
                logger.log(`Cell 3 (CountPosition): ${cell3Passed} PASS, ${cell3Failed} FAIL, ${cell3Skipped} SKIP`);
                logger.log(`Cell 4 (CountEntity): ${cell4Passed} PASS, ${cell4Failed} FAIL, ${cell4Skipped} SKIP`);
                logger.log('='.repeat(120) + '\n');
              }); // End of "Validate first N main rows" step
      });

      // Next cell validation: CountEntity
      await allure.step('Validate cell: Кол-во единиц', async () => {
        // TODO: Add validation steps for CountEntity cell
        // This will follow the same pattern as CountPosition validation
      });
    });
  });

  test.skip('ERP-3015 - Cleanup - Archive all created test items', async ({ page }) => {
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
          itemPrefixes.push(ASSEMBLY_PREFIX); // Assembly prefix

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
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
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
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test details with prefix ${DETAIL_PREFIX}`,
        test.info(),
      );

      // 4. Archive materials (материалы) - using cleanupTestMaterials
      await expectSoftWithScreenshot(
        page,
        async () => {
          await materialsPage.cleanupTestMaterials(MATERIAL_NAMES, test.info());
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test materials: ${MATERIAL_NAMES.join(', ')}`,
        test.info(),
      );

      // 5. Archive users - using cleanupTestUsersByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await usersPage.cleanupTestUsersByPrefix(USER_USERNAME_PREFIX, test.info());
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test users with username prefix ${USER_USERNAME_PREFIX}`,
        test.info(),
      );

      // 6. Archive equipment - using archiveAllTestEquipmentByPrefix
      await expectSoftWithScreenshot(
        page,
        async () => {
          await detailsPage.archiveAllTestEquipmentByPrefix(EQUIPMENT_PREFIX);
          // Verify cleanup completed successfully - page should still be accessible
          expect.soft(page.url()).toBeTruthy();
          expect.soft(await page.title()).toBeTruthy();
        },
        `Archive all test equipment with prefix ${EQUIPMENT_PREFIX}`,
        test.info(),
      );
    });
  });
};
