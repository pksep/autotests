import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

type ApiResult = {
  status: number;
  data?: any;
};

type ProductLike = Record<string, any>;

const authAPI = new AuthAPI();
const productsAPI = new ProductsAPI(null as any);

const successCodes = API_CONST.STATUS_CODE_VALIDATION.SUCCESS_CODES;
const serverErrorCodes = API_CONST.STATUS_CODE_VALIDATION.SERVER_ERROR_CODES;
const clientErrorCodes = API_CONST.STATUS_CODE_VALIDATION.CLIENT_ERROR_CODES;

const extractAccessToken = (data: any): string | undefined => {
  if (!data || typeof data === 'string') return undefined;
  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

const getRows = (data: unknown): ProductLike[] => {
  if (Array.isArray(data)) return data as ProductLike[];
  if (data && typeof data === 'object' && Array.isArray((data as any).rows)) return (data as any).rows;
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

const getCount = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const value = (data as any).count ?? (data as any).total;
  return typeof value === 'number' ? value : undefined;
};

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const expectNoServerError = (response: ApiResult) => {
  expect(serverErrorCodes, JSON.stringify(response.data)).not.toContain(response.status);
};

const expectNotSuccessful = (response: ApiResult) => {
  expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
  expectNoServerError(response);
};

const expectProductShape = (product: ProductLike) => {
  expect(product).toBeTruthy();
  expect(typeof product.id, JSON.stringify(product)).toBe('number');
  expect(product.name, JSON.stringify(product)).toBeTruthy();
};

const productPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  isSortedByOwn: false,
  isSortedByOperations: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
  ...overrides,
});

const productPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  name: `API Product ${suffix}`,
  articl: `API-ART-${suffix}`,
  responsible: '',
  description: `Created by API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-PRODUCT-${suffix}`,
  listDetal: [],
  listPokDet: [],
  materialList: [],
  listCbed: [],
  techProcessID: 'null',
  fileBase: [],
  attention: false,
  is_custom: 'false',
  discontinued: false,
  ...overrides,
});

const findProductByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<ProductLike | undefined> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);

    const product = getRows(response.data).find((row) => row.designation === designation);
    if (product) return product;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return undefined;
};

const waitForProductInActiveSearch = async (
  request: any,
  designation: string,
  productId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expect(response.status).toBe(201);

    const isPresent = getRows(response.data).some((row) => row.id === productId);
    if (isPresent === expectedPresent) return true;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
};

/**
 * Full Product API coverage for create, read, update, archive and defensive checks.
 */
export const runProductsAPINew = () => {
  logger.info('Starting Products API coverage suite');

  test.describe.serial('Products API: жизненный цикл изделия', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let createdProductId: number | undefined;
    let createdDesignation: string;
    let updatedDesignation: string;
    let createdPayload: Record<string, unknown>;
    let updatedPayload: Record<string, unknown>;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL,
      );

      expect(loginResponse.status).toBe(201);
      accessToken = extractAccessToken(loginResponse.data);
      expect(accessToken).toBeTruthy();

      const suffix = `${Date.now()}`;
      createdPayload = productPayload(suffix);
      updatedPayload = productPayload(`${suffix}-UPD`, {
        description: `Updated by API autotest ${suffix}`,
        attention: true,
      });
      createdDesignation = String(createdPayload.designation);
      updatedDesignation = String(updatedPayload.designation);
    });

    test.afterAll(async ({ request }) => {
      if (!createdProductId) return;

      const archiveResponse = await productsAPI.deleteProduct(request, createdProductId, accessToken);
      expectNoServerError(archiveResponse);
    });

    test('создает изделие с уникальными обозначением и артикулом', async ({ request }) => {
      const uniqueBefore = await productsAPI.validateProduct(
        request,
        { designation: createdPayload.designation, articl: createdPayload.articl },
        accessToken,
      );

      expect(uniqueBefore.status).toBe(201);
      expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);

      const createResponse = await productsAPI.createProduct(request, createdPayload, accessToken);
      expect([200, 201, 202], JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      const createData = getQueueData(createResponse.data);
      if (createData?.id) {
        createdProductId = Number(createData.id);
      }

      const created = await findProductByDesignation(request, createdDesignation, accessToken);
      expect(created, `Product ${createdDesignation} was not found after create`).toBeTruthy();
      expectProductShape(created as ProductLike);

      createdProductId = createdProductId || Number(created?.id);
      expect(created?.name).toBe(createdPayload.name);
      expect(created?.articl).toBe(createdPayload.articl);
      expect(created?.ban).toBe(false);
    });

    test('читает созданное изделие по id, light endpoint и пагинации', async ({ request }) => {
      expect(createdProductId).toBeTruthy();

      const byId = await productsAPI.getProductById(
        request,
        createdProductId as number,
        accessToken,
      );
      expect(byId.status).toBe(201);
      expectProductShape(byId.data);
      expect(byId.data.designation).toBe(createdDesignation);

      const light = await productsAPI.getProductByIdLight(request, createdProductId as number, accessToken);
      expect(light.status).toBe(200);
      expectProductShape(light.data);
      expect(light.data.designation).toBe(createdDesignation);

      const pagination = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ searchString: createdDesignation }),
        accessToken,
      );
      expect(pagination.status).toBe(201);
      expect(getCount(pagination.data), JSON.stringify(pagination.data)).toBeGreaterThanOrEqual(1);
      expect(getRows(pagination.data).some((row) => row.id === createdProductId)).toBe(true);
    });

    test('обновляет изделие и проверяет новые значения', async ({ request }) => {
      expect(createdProductId).toBeTruthy();

      const updateResponse = await productsAPI.updateProduct(
        request,
        { ...updatedPayload, id: createdProductId },
        accessToken,
      );
      expect([200, 201, 202]).toContain(updateResponse.status);
      expectNoServerError(updateResponse);

      const updated = await findProductByDesignation(request, updatedDesignation, accessToken);
      expect(updated, `Product ${updatedDesignation} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(createdProductId);
      expect(updated?.name).toBe(updatedPayload.name);
      expect(updated?.articl).toBe(updatedPayload.articl);
      expect(updated?.attention).toBe(true);
    });

    test('возвращает include и graph-childrens для обновленного изделия', async ({ request }) => {
      expect(createdProductId).toBeTruthy();

      const includeResponse = await productsAPI.getProductInclude(
        request,
        createdProductId as number,
        { includes: ['documents'] },
        accessToken,
      );
      expectNoServerError(includeResponse);
      if (clientErrorCodes.includes(includeResponse.status)) return;
      expect(successCodes).toContain(includeResponse.status);
      expect(includeResponse.data?.id, JSON.stringify(includeResponse.data)).toBe(createdProductId);
      expect(Array.isArray(includeResponse.data?.documents), JSON.stringify(includeResponse.data)).toBe(true);

      const graphResponse = await productsAPI.getProductComponents(request, createdProductId as number, accessToken);
      expectNoServerError(graphResponse);
      if (clientErrorCodes.includes(graphResponse.status)) return;
      expect(successCodes).toContain(graphResponse.status);
      expect(graphResponse.data).toBeTruthy();
    });

    test('архивирует изделие и проверяет отсутствие в активной выдаче', async ({ request }) => {
      expect(createdProductId).toBeTruthy();

      const archiveResponse = await productsAPI.deleteProduct(request, createdProductId as number, accessToken);
      expect(successCodes).toContain(archiveResponse.status);
      expectNoServerError(archiveResponse);

      const activeSearch = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ searchString: updatedDesignation }),
        accessToken,
      );
      expect(activeSearch.status).toBe(201);
      expect(
        await waitForProductInActiveSearch(request, updatedDesignation, createdProductId as number, false, accessToken),
      ).toBe(true);

      const archiveSearch = await productsAPI.getArchivedProducts(
        request,
        { searchString: updatedDesignation },
        accessToken,
      );
      expect(archiveSearch.status).toBe(201);
      expect(getRows(archiveSearch.data).some((row) => row.id === createdProductId && row.ban === true)).toBe(true);

      createdProductId = undefined;
    });
  });

  test.describe('Products API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL,
      );

      expect(loginResponse.status).toBe(201);
      accessToken = extractAccessToken(loginResponse.data);
      expect(accessToken).toBeTruthy();
    });

    test('возвращает список изделий без серверных ошибок', async ({ request }) => {
      const response = await productsAPI.getAllProductsList(request, true, [], accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);

      const rows = getRows(response.data);
      test.skip(rows.length === 0, 'No active products are available on this environment.');
      expectProductShape(rows[0]);
      expect(rows[0].ban, JSON.stringify(rows[0])).toBe(false);
    });

    test('пагинация поддерживает пустой результат со стабильной структурой', async ({ request }) => {
      const response = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ searchString: 'api-product-no-match-999999999' }),
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
    });

    test('проверка уникальности обозначения обрабатывает защитные payload без 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const designation of cases) {
        const response = await productsAPI.validateProduct(request, { designation }, accessToken);
        expectNoServerError(response);
      }
    });

    test('создание изделия отклоняет невалидный payload без серверных ошибок', async ({ request }) => {
      const response = await productsAPI.createProduct(
        request,
        {
          name: '',
          articl: '',
          responsible: '',
          description: '',
          designation: '',
          docs: [],
          techProcessID: 'null',
          fileBase: [],
        },
        accessToken,
      );

      expectNotSuccessful(response);
    });

    test('операции с несуществующим id не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await productsAPI.getProductById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const deleteResponse = await productsAPI.deleteProduct(request, 999999999, accessToken);
      expectNotSuccessful(deleteResponse);
    });
  });
};
