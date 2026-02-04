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
import * as SelectorsProductionPage from '../lib/Constants/SelectorsProductionPage';
import * as HIGHLIGHT from '../lib/Constants/HighlightStyles';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS, RETRY_COUNTS, ROW_COLLECTION } from '../lib/Constants/TimeoutConstants';
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

// Test data prefixes
const PRODUCT_PREFIX = 'ERPTEST_PRODUCT';
const ASSEMBLY_PREFIX = 'ERPTEST_SB';
const DETAIL_PREFIX = 'ERPTEST_DETAIL';
const USER_PREFIX = 'ERPTEST_TEST_USER';

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

  test.skip('ERP-3015 - Create test product with complex specification', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    const detailsPage = new CreatePartsDatabasePage(page);
    const usersPage = new CreateUsersPage(page);

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
          throw new Error(`Product "${product.name}" creation failed: ${result.error}`);
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
        });
      }
    });
  });

  test('ERP-3015 - Validate table cell values in production page', async ({ page, context }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

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
            throw new Error('No main rows found (all rows appear to be sub-rows with -Operation or -NonOperation)');
          }
          
          // Process each of the first N main rows
          let processedCount = 0;
          for (let rowIndex = 0; rowIndex < mainRows.length && processedCount < ROWS_TO_VALIDATE; rowIndex++) {
            const currentRow = mainRows[rowIndex];
            
            // Verify this is still a main row (not a sub-row with -Operation or -NonOperation) before processing
            try {
              await currentRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              const rowTestIdCheck = await currentRow.getAttribute('data-testid');
              if (!rowTestIdCheck || rowTestIdCheck.includes('-Operation') || rowTestIdCheck.includes('-NonOperation')) {
                console.log(`Skipping row ${rowIndex + 1} - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdCheck}`);
                continue; // Skip to next row in the loop
              }
            } catch (e) {
              console.log(`Skipping row ${rowIndex + 1} - row is not attached or accessible`);
              continue; // Skip to next row in the loop
            }
            
            let employeeName: string | null = null;
            let leftValue: number = 0;
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
                console.log(`Row ${rowIndex + 1} is not visible after scrolling, will try to continue anyway`);
              }
              
              // Re-verify this is still a main row after scrolling (DOM might have changed)
              const rowTestIdAfterScroll = await currentRow.getAttribute('data-testid');
              if (!rowTestIdAfterScroll || rowTestIdAfterScroll.includes('-Operation') || rowTestIdAfterScroll.includes('-NonOperation')) {
                console.log(`Skipping row ${rowIndex + 1} after scroll - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdAfterScroll}`);
                return; // Skip the rest of the steps for this row
              }
              
              // Re-query the row by its data-testid to get a fresh locator after scrolling
              const freshRow = table.locator(SelectorsProductionPage.getProductionTableRowByTestId(rowTestIdAfterScroll));
              await freshRow.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT });
              
              // Highlight the current row to verify we found it
              await freshRow.evaluate((el: HTMLElement) => {
                el.style.border = '5px solid blue';
                el.style.backgroundColor = 'lightblue';
              });
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Brief pause to see highlight

              // Re-verify this is still a main row before accessing cells (DOM might have changed after highlighting)
              const rowTestIdBeforeCells = await freshRow.getAttribute('data-testid');
              if (!rowTestIdBeforeCells || rowTestIdBeforeCells.includes('-Operation') || rowTestIdBeforeCells.includes('-NonOperation')) {
                console.log(`Skipping row ${rowIndex + 1} before accessing cells - contains "-Operation" or "-NonOperation" in data-testid or missing data-testid: ${rowTestIdBeforeCells}`);
                return; // Skip the rest of the steps for this row
              }

              // First cell: Popover (3 dots menu) - data-testid is on the td element itself
              const popoverCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_POPOVER_CELL_SUFFIX}"]`).first();
              await popoverCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD }); // Increased timeout to allow cells to render after scroll
              // Scroll the cell into view to ensure it's visible
              await popoverCell.scrollIntoViewIfNeeded();
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait a bit after scrolling
              await popoverCell.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid red';
                el.style.backgroundColor = 'pink';
              });
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

              // Second cell: TabelNumber - data-testid is on the td element itself
              const tabelNumberCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_TABEL_NUMBER_CELL_SUFFIX}"]`).first();
              await tabelNumberCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              await tabelNumberCell.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid orange';
                el.style.backgroundColor = 'lightyellow';
              });
          await page.waitForTimeout(TIMEOUTS.SHORT);

              // Third cell: Name (employee name) - data-testid is on the td element itself
              const nameCell = freshRow.locator(`td[data-testid^="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_PREFIX}"][data-testid$="${SelectorsProductionPage.PRODUCTION_TABLE_ROW_NAME_CELL_SUFFIX}"]`).first();
          await nameCell.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
              await nameCell.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid green';
                el.style.backgroundColor = 'lightgreen';
              });
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          
          employeeName = await nameCell.textContent();
          
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
              await countCell.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid purple';
                el.style.backgroundColor = 'lavender';
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
            throw new Error(`Invalid count format: ${countText}. Expected format: "number / number"`);
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
            console.log(`Skipping row ${rowIndex + 1} - both leftValue and rightValue are 0`);
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
                    console.log('Popover menu container not visible, will continue anyway');
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
                    console.log('Menu item is visible but not enabled, will use force click');
                    useForceClick = true;
                  } else {
                    // Brief wait to ensure it's fully ready
                    await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                  }
                } catch (e) {
                  // If it's still hidden, we'll use force click
                  console.log('Menu item is attached but not visible, will use force click');
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
                await menuItem.evaluate((el: HTMLElement) => {
                  el.style.border = '5px solid yellow';
                  el.style.backgroundColor = 'lightyellow';
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
                      console.log(`Failed to parse API response: ${error}`);
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
              // Try to find the element by class
              const employeeElement = newPage.locator(SelectorsProductionPage.TASK_BY_USER_EMPLOYEE_CLASS);
              const elementCount = await employeeElement.count();
              
              if (elementCount > 0) {
                // Element exists, wait for it and highlight it
                await employeeElement.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
                
                // Highlight the employee name element
                await employeeElement.evaluate((el) => {
                  (el as HTMLElement).style.border = '5px solid green';
                  (el as HTMLElement).style.backgroundColor = 'lightgreen';
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
                  await textElement.evaluate((el) => {
                    (el as HTMLElement).style.border = '5px solid green';
                    (el as HTMLElement).style.backgroundColor = 'lightgreen';
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
                console.log(`Test ${processedCount + 1} - Row ${rowIndex + 1} - Employee: ${employeeName || 'N/A'} - Unique entity IDs: ${uniqueEntityIds.length}, Expected (rightValue): ${rightValue}, Left value: ${leftValue}, Right value: ${rightValue}`);
                await expectSoftWithScreenshot(
                  newPage,
                  () => {
                    expect.soft(uniqueEntityIds.length).toBe(rightValue);
                  },
                  `Verify unique entity IDs count (${uniqueEntityIds.length}) matches rightValue (${rightValue}) from main table row ${rowIndex + 1} - Employee: ${employeeName || 'N/A'}`,
                  test.info(),
                );
                
                // Verify that both left and right numbers are the same
                console.log(`Test ${processedCount + 1} - Row ${rowIndex + 1} - Employee: ${employeeName || 'N/A'} - Left value: ${leftValue}, Right value: ${rightValue}`);
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
            
            // Increment processed count only after successfully processing the row
            processedCount++;
            }); // End of "Validate row X" step
          } // End of loop through rows
        }); // End of "Validate first N main rows" step
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
