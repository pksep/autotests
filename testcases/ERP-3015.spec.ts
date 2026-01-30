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
    techProcesses: [ 'Покраска'],
  },
  { name: `${PRODUCT_PREFIX}_002` },
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
  { name: `${ASSEMBLY_PREFIX}_001` },
  { name: `${ASSEMBLY_PREFIX}_002` },
];

// Details array
const details: DetailItem[] = [
  { name: `${DETAIL_PREFIX}_001` },
  { name: `${DETAIL_PREFIX}_002` },
];

const testUsers = [
  {
    username: `${USER_PREFIX}_001`,
    jobType: 'Слесарь сборщик',
    phoneSuffix: '995',
    login: 'Тестовыё сборка 1',
    password: '123456',
    department: 'Сборка',
    tableNumberStart: 999,
  },
  {
    username: `${USER_PREFIX}_002`,
    jobType: 'Слесарь сборщик',
    phoneSuffix: '999',
    login: 'Тестовыё сборка 2',
    password: '123456',
    department: 'Сборка',
    tableNumberStart: 999,
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

  test('ERP-3015 - Create test product with complex specification', async ({ page }) => {
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
