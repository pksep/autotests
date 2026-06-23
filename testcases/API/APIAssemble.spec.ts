import { test, expect } from '@playwright/test';
import { AssembleAPI } from '../../pages/API/APIAssemble';
import { CBEDAPI } from '../../pages/API/APICBED';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;

const assembleAPI = new AssembleAPI(null);
const cbedAPI = new CBEDAPI(null);
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

const cbedPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  listCbed: '[]',
  isSortedByAttention: false,
  isSortedByDate: false,
  isSortedByOperations: false,
  isSortedByOwn: false,
  isDiscontinued: false,
  idsToIgnore: [],
  enableIsDiscontinuedView: false,
  ...overrides,
});

const findParentEntity = async (
  request: any,
  accessToken?: string,
): Promise<{ id: number; type: 'product' | 'cbed' } | undefined> => {
  const products = await productsAPI.getAllProducts(request, productPaginationDto(), accessToken);
  expectNoServerError(products);
  const product = getRows(products.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  if (product) return { id: Number(product.id), type: 'product' };

  const cbeds = await cbedAPI.getCBEDPagination(request, cbedPaginationDto(), API_CONST.API_TEST_TABEL, accessToken);
  expectNoServerError(cbeds);
  const cbed = getRows(cbeds.data).find((row) => row.id && row.ban !== true && row.discontinued !== true);
  if (cbed) return { id: Number(cbed.id), type: 'cbed' };

  return undefined;
};

export const runAssembleAPINew = () => {
  logger.info('Starting Assemble API coverage suite');

  test.describe('Assemble API: контракты чтения и пагинации', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let firstAssemble: ApiRow | undefined;
    let parentEntity: { id: number; type: 'product' | 'cbed' } | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
      parentEntity = await findParentEntity(request, accessToken);
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

    test('читает сборку по id и light endpoint, если в базе есть активная сборка', async ({ request }) => {
      if (!firstAssemble) {
        const main = await assembleAPI.getAllAssembleWithPagination(request, assemblePaginationDto(), accessToken);
        expectNoServerError(main);
        firstAssemble = getRows(main.data).find((row) => row.id);
      }

      test.skip(!firstAssemble, 'No active assemble rows are available on this environment.');
      const assembleId = Number(firstAssemble!.id);

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
    });

    test('проверяет связи сборки с родительскими сущностями без серверных ошибок', async ({ request }) => {
      test.skip(!parentEntity, 'No active product or CBED is available for parent relation checks.');

      const byParent = await assembleAPI.getAssembleByParent(request, parentEntity, accessToken);
      expectNoServerError(byParent);

      const byIzd = await assembleAPI.getByIzd(request, parentEntity!.id, parentEntity!.type, accessToken);
      expectNoServerError(byIzd);
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
