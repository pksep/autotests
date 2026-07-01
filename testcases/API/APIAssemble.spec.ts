import { test, expect } from '@playwright/test';
import { AssembleAPI } from '../../pages/API/APIAssemble';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const assembleAPI = new AssembleAPI(null);
const productsAPI = new ProductsAPI(null as any);

const byParents = (overrides: Record<string, unknown> = {}) => ({
  productIds: [],
  cbedIds: [],
  detalIds: [],
  ...overrides,
});

const byOrder = () => ({
  orderId: null,
  customer: null,
});

const assemblePaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isBan: false,
  responsibleUserId: null,
  byParents: byParents(),
  byOrder: byOrder(),
  type: 'all',
  notOrderedByProductionTask: false,
  sortReadines: 'any',
  onlyCanComplect: false,
  sort: [],
  ...overrides,
});

const assembleScladPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  responsibleUserId: null,
  byParents: byParents(),
  byOrder: byOrder(),
  type: 'all',
  isDiscontinued: false,
  sort: [],
  ...overrides,
});

const assembleOperationPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  operationId: null,
  searchString: '',
  status: 'all',
  byParents: byParents(),
  byOrder: byOrder(),
  sort: [],
  ...overrides,
});

const assembleComingDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  filters: 'all',
  parentData: {
    parentType: null,
    parentId: null,
  },
  ...overrides,
});

const assemblePlanDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  type: 'all',
  byParents: byParents(),
  byOrder: byOrder(),
  isShowDeactivate: false,
  sort: [],
  ...overrides,
});

const kitPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  type: 'all',
  isShowDeactivate: false,
  ...overrides,
});

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
  name: `API Assemble Parent Product ${suffix}`,
  articl: `API-ASS-PARENT-ART-${suffix}`,
  responsible: '',
  description: `Created by Assemble API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-ASSEMBLE-PARENT-${suffix}`,
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
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, productPaginationDto({ searchString: designation }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const createIsolatedParentProduct = async (
  request: any,
  accessToken?: string,
): Promise<{ id: number; type: 'product'; designation: string }> => {
  const payload = productPayload(uniqueApiSuffix('assemble-parent'));
  const designation = String(payload.designation);

  const create = await productsAPI.createProduct(request, payload, accessToken);
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const created = await findProductByDesignation(request, designation, accessToken);
  const id = Number(create.data?.data?.id ?? create.data?.id ?? created?.id);
  expect(id, JSON.stringify(create.data)).toBeGreaterThan(0);
  expect(created, `Product ${designation} was not found after create`).toBeTruthy();

  return { id, type: 'product', designation };
};

const createIsolatedAssemble = async (
  request: any,
  accessToken?: string,
): Promise<{ assembleId: number; productId: number; productDesignation: string }> => {
  const product = await createIsolatedParentProduct(request, accessToken);
  const numberOrder = `API-ASSEMBLE-${uniqueApiSuffix('assemble')}`;

  const create = await assembleAPI.createAssemble(
    request,
    {
      numberOrder,
      myKolvo: 1,
      description: `Created by Assemble API autotest ${numberOrder}`,
      cbedId: product.id,
      type: 'product',
      actionSendlerId: Number(API_CONST.API_TEST_TABEL),
    },
    API_CONST.API_TEST_TABEL,
    accessToken,
  );
  expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
  expectNoServerError(create);

  const found = await eventually(async () => {
    const response = await assembleAPI.getAllAssembleWithPagination(
      request,
      assemblePaginationDto({ searchString: numberOrder }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => Number(row.product_id ?? row.productId) === product.id));

  const assemble = found
    ? getRows<ApiRow>(found.data).find((row) => Number(row.product_id ?? row.productId) === product.id)
    : undefined;
  const assembleId = Number(create.data?.id ?? create.data?.data?.id ?? assemble?.id);
  expect(assembleId, JSON.stringify(create.data)).toBeGreaterThan(0);

  return { assembleId, productId: product.id, productDesignation: product.designation };
};

export const runAssembleAPINew = () => {
  logger.info('Starting Assemble API coverage suite');

  test.describe('Assemble API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstAssemble: ApiRow | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает основные страницы сборки без серверных ошибок', async ({ request }) => {
      const main = await assembleAPI.getAllAssembleWithPagination(request, assemblePaginationDto(), accessToken);
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
        expect(getCount(main.data), JSON.stringify(main.data)).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(getRows(main.data)), JSON.stringify(main.data)).toBe(true);
        firstAssemble = getRows(main.data).find((row) => row.id);
      }

      const sclad = await assembleAPI.getAllAssembleWithPaginationSclad(request, assembleScladPaginationDto(), accessToken);
      expectNoServerError(sclad);
      if (!clientErrorCodes.includes(sclad.status)) {
        expect(successCodes).toContain(sclad.status);
        expect(getCount(sclad.data), JSON.stringify(sclad.data)).toBeGreaterThanOrEqual(0);
      }

      const complects = await assembleAPI.getActualAssembleOrders(request, accessToken);
      expectNoServerError(complects);
      if (!clientErrorCodes.includes(complects.status)) {
        expect(successCodes).toContain(complects.status);
        expect(Array.isArray(getRows(complects.data)), JSON.stringify(complects.data)).toBe(true);
      }
    });

    test('возвращает приход, план, операции и наборы без серверных ошибок', async ({ request }) => {
      const coming = await assembleAPI.getAssembleComing(request, assembleComingDto(), accessToken);
      expectNoServerError(coming);

      const plan = await assembleAPI.getAllAssemblePlan(request, assemblePlanDto(), accessToken);
      expectNoServerError(plan);

      const operations = await assembleAPI.getOperationPagination(request, assembleOperationPaginationDto(), accessToken);
      expectNoServerError(operations);

      const kits = await assembleAPI.getComplectKitPagination(request, kitPaginationDto(), accessToken);
      expectNoServerError(kits);
    });

    test('пагинации сборки поддерживают граничные значения page/pageSize', async ({ request }) => {
      const main = await assembleAPI.getAllAssembleWithPagination(
        request,
        assemblePaginationDto({ page: 0, pageSize: 1 }),
        accessToken,
      );
      expectNoServerError(main);
      if (!clientErrorCodes.includes(main.status)) {
        expect(successCodes).toContain(main.status);
        expectPaginationContract(main.data, 1);
      }

      const kits = await assembleAPI.getComplectKitPagination(
        request,
        kitPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(kits);
      if (!clientErrorCodes.includes(kits.status)) {
        expect(successCodes).toContain(kits.status);
        expectPaginationContract(kits.data, 5);
      }
    });

    test('читает изолированную сборку по id и light endpoint', async ({ request }) => {
      const created = await createIsolatedAssemble(request, accessToken);
      const assembleId = created.assembleId;

      try {
        const byId = await assembleAPI.getById(request, assembleId, accessToken);
        expectNoServerError(byId);
        if (!clientErrorCodes.includes(byId.status)) {
          expect(successCodes).toContain(byId.status);
          expect(Number(byId.data?.id), JSON.stringify(byId.data)).toBe(assembleId);
        }

        const light = await assembleAPI.getByIdLight(request, assembleId, accessToken);
        expectNoServerError(light);
        if (!clientErrorCodes.includes(light.status)) {
          expect(successCodes).toContain(light.status);
          expect(Number(light.data?.id), JSON.stringify(light.data)).toBe(assembleId);
        }

        if (!clientErrorCodes.includes(byId.status) && !clientErrorCodes.includes(light.status)) {
          expect(Object.keys(byId.data || {}).length).toBeGreaterThanOrEqual(Object.keys(light.data || {}).length);
        }
      } finally {
        const archiveAssemble = await assembleAPI.deleteAssemble(request, assembleId, accessToken);
        expectNoServerError(archiveAssemble);

        const archiveProduct = await productsAPI.deleteProduct(request, created.productId, accessToken);
        expectNoServerError(archiveProduct);
      }
    });

    test('проверяет связи сборки с родительскими сущностями без серверных ошибок', async ({ request }) => {
      const parentEntity = await createIsolatedParentProduct(request, accessToken);

      try {
        const byParent = await assembleAPI.getAssembleByParent(request, parentEntity, accessToken);
        expectNoServerError(byParent);

        const byIzd = await assembleAPI.getByIzd(request, parentEntity.id, parentEntity.type, accessToken);
        expectNoServerError(byIzd);
      } finally {
        const archive = await productsAPI.deleteProduct(request, parentEntity.id, accessToken);
        expectNoServerError(archive);
      }
    });
  });

  test.describe('Assemble API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('поиск с защитными searchString payload не приводит к 5xx', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const response = await assembleAPI.getAllAssembleWithPagination(
          request,
          assemblePaginationDto({ searchString }),
          accessToken,
        );
        expectNoServerError(response);
      }
    });

    test('несуществующие id и невалидное создание не приводят к серверным ошибкам', async ({ request }) => {
      const byId = await assembleAPI.getById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const byParent = await assembleAPI.getAssembleByParent(
        request,
        { id: 999999999, type: 'product' },
        accessToken,
      );
      expectNoServerError(byParent);

      const deficit = await assembleAPI.getDeepDeficitObject(
        request,
        { id: 999999999, entityId: 999999999, assembleType: 'cbed' },
        accessToken,
      );
      expectNoServerError(deficit);

      const invalidCreate = await assembleAPI.createAssemble(
        request,
        { numberOrder: '', myKolvo: 0, description: '', izdId: null, type: 'cbed' },
        API_CONST.API_TEST_TABEL,
        accessToken,
      );
      expectNotSuccessful(invalidCreate);

      const noAuthCreate = await assembleAPI.createAssemble(
        request,
        { numberOrder: '', myKolvo: 0, description: '', izdId: null, type: 'cbed' },
        API_CONST.API_TEST_TABEL,
      );
      expectNotSuccessful(noAuthCreate);
    });
  });
};
