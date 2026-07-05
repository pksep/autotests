import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectClientError,
  expectEndpointReached,
  expectErrorResponseContract,
  expectArrayResponse,
  expectNoServerError,
  expectPaginationContract,
  expectSortedDescendingByKnownDate,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ProductLike = Record<string, any>;

const productsAPI = new ProductsAPI(null as any);

const getQueueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
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
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows(response.data).some((row) => row.designation === designation));

  return response ? getRows(response.data).find((row) => row.designation === designation) : undefined;
};

const waitForProductById = async (
  request: any,
  productId: number,
  predicate: (product: ProductLike) => boolean,
  accessToken?: string,
): Promise<ProductLike | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getProductById(request, productId, accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => response.status === 201 && response.data && predicate(response.data), { attempts: 12, intervalMs: 700 });

  return response?.data;
};

const waitForProductInActiveSearch = async (
  request: any,
  designation: string,
  productId: number,
  expectedPresent: boolean,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expect(response.status).toBe(201);
    return response;
  }, (response) => getRows(response.data).some((row) => row.id === productId) === expectedPresent);

  return Boolean(response);
};

const createIsolatedProduct = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ id: number; designation: string; payload: Record<string, unknown> }> => {
  const payload = productPayload(suffix);
  const designation = String(payload.designation);

  const createResponse = await productsAPI.createProduct(request, payload, accessToken);
  expect([200, 201, 202], JSON.stringify(createResponse.data)).toContain(createResponse.status);
  expectNoServerError(createResponse);

  const createData = getQueueData(createResponse.data);
  const created = await findProductByDesignation(request, designation, accessToken);
  const id = Number(createData?.id ?? created?.id);

  expect(id, JSON.stringify(createResponse.data)).toBeGreaterThan(0);
  expect(created, `Product ${designation} was not found after create`).toBeTruthy();
  expect(created?.ban, JSON.stringify(created)).toBe(false);

  return { id, designation, payload };
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
      accessToken = await getAuthToken(request);
      const suffix = uniqueApiSuffix('product');
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

      const tech = await productsAPI.getTechByProductId(request, createdProductId as number, accessToken);
      expectNoServerError(tech);
      if (!clientErrorCodes.includes(tech.status)) {
        expect(successCodes).toContain(tech.status);
        expect(Number(tech.data?.id), JSON.stringify(tech.data)).toBe(createdProductId);
      }

      const specifications = await productsAPI.getProductSpecifications(request, createdProductId as number, accessToken);
      expectNoServerError(specifications);
      if (successCodes.includes(specifications.status)) expectArrayResponse(specifications.data);

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

      const updated = await waitForProductById(
        request,
        createdProductId as number,
        (product) => product.designation === updatedDesignation,
        accessToken,
      );
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

      const secondArchiveResponse = await productsAPI.deleteProduct(request, createdProductId as number, accessToken);
      expectNoServerError(secondArchiveResponse);

      createdProductId = undefined;
    });
  });

  test.describe('Products API: контракты чтения и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает список изделий без серверных ошибок', async ({ request }) => {
      const product = await createIsolatedProduct(request, uniqueApiSuffix('product-list'), accessToken);

      try {
        const response = await productsAPI.getAllProductsList(request, true, [], accessToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
        expect(getRows<ProductLike>(response.data).some((row) => row.id === product.id), JSON.stringify(response.data)).toBe(true);
      } finally {
        const archive = await productsAPI.deleteProduct(request, product.id, accessToken);
        expectNoServerError(archive);
      }
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

    test('пагинация изделий поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);

      const farPage = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (clientErrorCodes.includes(farPage.status)) return;
      expect(successCodes).toContain(farPage.status);
      expectPaginationContract(farPage.data, 5);
    });

    test('сортировка изделий по дате возвращает стабильный контракт', async ({ request }) => {
      const response = await productsAPI.getAllProducts(
        request,
        productPaginationDto({ isSortedByDate: true, pageSize: 10 }),
        accessToken,
      );

      expect(response.status).toBe(201);
      expectPaginationContract(response.data, 10);
      expectSortedDescendingByKnownDate(getRows(response.data));
    });

    test('дефициты изделий возвращают стабильный контракт', async ({ request }) => {
      const response = await productsAPI.getProductDeficits(
        request,
        {
          productIds: [],
          statusWorking: 'Все',
          searchString: '',
          shipmentIds: [],
          page: 0,
          isDiscontinued: false,
          sort: [],
        },
        accessToken,
      );

      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes).toContain(response.status);
        expectPaginationContract(response.data);
      }
    });

    test('include изделия обрабатывает пустой и неизвестный include без 5xx', async ({ request }) => {
      const product = await createIsolatedProduct(request, uniqueApiSuffix('product-include'), accessToken);

      try {
        for (const includes of [[], ['unknownInclude']]) {
          const response = await productsAPI.getProductInclude(
            request,
            product.id,
            { includes },
            accessToken,
          );
          expectNoServerError(response);
        }
      } finally {
        const archive = await productsAPI.deleteProduct(request, product.id, accessToken);
        expectNoServerError(archive);
      }
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

    test('создание изделия с минимально невалидным payload не приводит к серверной ошибке', async ({ request }) => {
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

      expectNoServerError(response);
    });

    test('операции с несуществующим id не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await productsAPI.getProductById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const specifications = await productsAPI.getProductSpecifications(request, 999999999, accessToken);
      expectNoServerError(specifications);
      if (successCodes.includes(specifications.status)) expectArrayResponse(specifications.data);
      if (clientErrorCodes.includes(specifications.status)) expectErrorResponseContract(specifications);

      const operationInclude = await captureApiResult(() => productsAPI.searchProducts(request, { page: 0, pageSize: 1, searchString: '' }, accessToken));
      expectEndpointReached(operationInclude);

      const actualAvatar = await captureApiResult(() => productsAPI.actualAvatar(request, accessToken));
      expectEndpointReached(actualAvatar);

      const deleteResponse = await productsAPI.deleteProduct(request, 999999999, accessToken);
      expectClientError(deleteResponse);
    });

    test('мутации изделия без авторизации не проходят успешно', async ({ request }) => {
      const createResponse = await productsAPI.createProduct(
        request,
        productPayload(`NOAUTH-${uniqueApiSuffix('product')}`),
      );
      expectClientError(createResponse);

      const deleteResponse = await productsAPI.deleteProduct(request, 999999999);
      expectClientError(deleteResponse);
    });
  });
};
