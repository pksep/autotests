import { test, expect } from '@playwright/test';
import { AssembleAPI } from '../../pages/API/APIAssemble';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectApiContract,
  expectClientError,
  expectEndpointReached,
  expectNoServerError,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: any;
};

type ApiRow = Record<string, any>;
const lzString = require('../../../sep_erp_server/sep_erp_server/node_modules/lz-string') as {
  compressToBase64: (input: string) => string;
};

const assembleAPI = new AssembleAPI(null);
const productsAPI = new ProductsAPI(null as any);
const compressSpec = (value: unknown) => lzString.compressToBase64(JSON.stringify(value));

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
  offset: 0,
  currentPage: 0,
  status: 'collected',
  searchStr: '',
  sortKitCount: 'all',
  responsibleId: null,
  assemblyId: null,
  cbedsIds: [],
  productIds: [],
  isShowDeactivate: false,
  ...overrides,
});

const emptyCompressedSpec = () => compressSpec([]);

const invalidAssembleKitPayload = (overrides: Record<string, unknown> = {}) => ({
  kolvoCollected: 0,
  assembleId: 999999999,
  shipmentsIds: [],
  listCbed: emptyCompressedSpec(),
  listDetal: emptyCompressedSpec(),
  listPokDet: emptyCompressedSpec(),
  materialList: emptyCompressedSpec(),
  actionSendlerId: Number(API_CONST.API_TEST_TABEL),
  ...overrides,
});

const assembleKitPayload = (assembleId: number, overrides: Record<string, unknown> = {}) => ({
  kolvoCollected: 1,
  assembleId,
  shipmentsIds: [],
  listCbed: emptyCompressedSpec(),
  listDetal: emptyCompressedSpec(),
  listPokDet: emptyCompressedSpec(),
  materialList: emptyCompressedSpec(),
  actionSendlerId: Number(API_CONST.API_TEST_TABEL),
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

const findAnyAssemble = async (request: any, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await assembleAPI.getAllAssembleWithPagination(request, assemblePaginationDto({ page: 0, pageSize: 5 }), accessToken);
  expectNoServerError(response);
  return getRows<ApiRow>(response.data).find((row) => Number(row.id) > 0);
};

const expectRowsAndCount = (response: ApiResult, maxRows?: number) => {
  expectNoServerError(response);
  if (clientErrorCodes.includes(response.status)) return;

  expect(successCodes).toContain(response.status);
  expectPaginationContract(response.data, maxRows);
  const count = getCount(response.data);
  const rows = getRows<ApiRow>(response.data);
  expect(count, JSON.stringify(response.data)).toBeGreaterThanOrEqual(rows.length);
  if (maxRows !== undefined) expect(rows.length, JSON.stringify(response.data)).toBeLessThanOrEqual(maxRows);
};

const expectAssembleRowShape = (row: ApiRow, expectedId?: number) => {
  expect(row, JSON.stringify(row)).toBeTruthy();
  expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
  if (expectedId) expect(Number(row.id), JSON.stringify(row)).toBe(expectedId);
  expect(String(row.type_izd ?? row.typeIzd ?? row.type ?? ''), JSON.stringify(row)).toMatch(/product|cbed/);
  expect(Number(row.product_id ?? row.productId ?? row.cbed_id ?? row.cbedId ?? row.izd_id ?? row.izdId), JSON.stringify(row)).toBeGreaterThan(0);
};

const expectKitShape = (kit: ApiRow, expected: { kitId?: number; assembleId?: number } = {}) => {
  expect(kit, JSON.stringify(kit)).toBeTruthy();
  expect(Number(kit.id), JSON.stringify(kit)).toBeGreaterThan(0);
  if (expected.kitId) expect(Number(kit.id), JSON.stringify(kit)).toBe(expected.kitId);
  if (expected.assembleId) expect(Number(kit.assemble_id ?? kit.assembleId), JSON.stringify(kit)).toBe(expected.assembleId);
  expect(Number(kit.kolvo_collected ?? kit.kolvoCollected ?? kit.kolvo), JSON.stringify(kit)).toBeGreaterThanOrEqual(0);
  expect(String(kit.status ?? ''), JSON.stringify(kit)).toBeTruthy();
};

const findKitByAssembly = async (request: any, assembleId: number, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const byAssembly = await assembleAPI.getComplectKitByAssembly(request, assembleId, accessToken);
    expectNoServerError(byAssembly);
    return byAssembly;
  }, (byAssembly) => getRows<ApiRow>(byAssembly.data).some((kit) => Number(kit.id) > 0));

  return response ? getRows<ApiRow>(response.data).find((kit) => Number(kit.id) > 0) : undefined;
};

const createIsolatedAssembleKit = async (
  request: any,
  accessToken?: string,
): Promise<{ assembleId: number; productId: number; productDesignation: string; kitId: number }> => {
  const assemble = await createIsolatedAssemble(request, accessToken);

  const createKit = await assembleAPI.createAssembleKit(request, assembleKitPayload(assemble.assembleId), accessToken);
  expect(successCodes, JSON.stringify(createKit.data)).toContain(createKit.status);
  expectNoServerError(createKit);

  const kit = await findKitByAssembly(request, assemble.assembleId, accessToken);
  const kitId = Number(createKit.data?.id ?? createKit.data?.data?.id ?? kit?.id);
  expect(kitId, JSON.stringify(createKit.data)).toBeGreaterThan(0);
  expect(kit, `Complect kit for assemble ${assemble.assembleId} was not found after create`).toBeTruthy();

  return { ...assemble, kitId };
};

const getAssembleParent = (assemble: ApiRow): { id: number; type: string } => {
  const type = String(assemble.type_izd ?? assemble.typeIzd ?? assemble.type ?? (assemble.product_id || assemble.productId ? 'product' : 'cbed'));
  const id = Number(assemble.product_id ?? assemble.productId ?? assemble.cbed_id ?? assemble.cbedId ?? assemble.izd_id ?? assemble.izdId);

  return { id, type };
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
      expectApiContract(coming, { shape: 'pagination' });
      expectRowsAndCount(coming, 100);

      const plan = await assembleAPI.getAllAssemblePlan(request, assemblePlanDto(), accessToken);
      expectApiContract(plan, { shape: 'pagination' });
      expectRowsAndCount(plan);

      const operations = await assembleAPI.getOperationPagination(request, assembleOperationPaginationDto(), accessToken);
      expectApiContract(operations, { shape: 'pagination' });
      expectRowsAndCount(operations);

      const kits = await assembleAPI.getComplectKitPagination(request, kitPaginationDto(), accessToken);
      expectRowsAndCount(kits, 25);
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
        kitPaginationDto({ currentPage: 999999 }),
        accessToken,
      );
      expectNoServerError(kits);
      if (!clientErrorCodes.includes(kits.status)) {
        expect(successCodes).toContain(kits.status);
        expectPaginationContract(kits.data, 25);
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
          expectAssembleRowShape(byId.data, assembleId);
        }

        const light = await assembleAPI.getByIdLight(request, assembleId, accessToken);
        expectNoServerError(light);
        if (!clientErrorCodes.includes(light.status)) {
          expect(successCodes).toContain(light.status);
          expect(Number(light.data?.id), JSON.stringify(light.data)).toBe(assembleId);
          expectAssembleRowShape(light.data, assembleId);
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

    test('проверяет связи сборки с родительскими сущностями по реальной сборке', async ({ request }) => {
      const created = await createIsolatedAssemble(request, accessToken);
      const parentEntity = { id: created.productId, type: 'product' as const };

      try {
        const byParent = await assembleAPI.getAssembleByParent(request, parentEntity, accessToken);
        expectNoServerError(byParent);
        if (!clientErrorCodes.includes(byParent.status)) {
          expect(successCodes).toContain(byParent.status);
          expect(Array.isArray(getRows(byParent.data)) || Array.isArray(byParent.data), JSON.stringify(byParent.data)).toBe(true);
        }

        const byIzd = await assembleAPI.getByIzd(request, parentEntity.id, parentEntity.type, accessToken);
        expectNoServerError(byIzd);
        if (!clientErrorCodes.includes(byIzd.status) && byIzd.data) {
          expect(successCodes).toContain(byIzd.status);
          expectAssembleRowShape(byIzd.data, created.assembleId);
          expect(Number(byIzd.data.product_id ?? byIzd.data.productId ?? byIzd.data.cbed_id ?? byIzd.data.cbedId), JSON.stringify(byIzd.data)).toBe(parentEntity.id);
        }
      } finally {
        const archiveAssemble = await assembleAPI.deleteAssemble(request, created.assembleId, accessToken);
        expectNoServerError(archiveAssemble);

        const archiveProduct = await productsAPI.deleteProduct(request, created.productId, accessToken);
        expectNoServerError(archiveProduct);
      }
    });

    test('создает реальный комплект и читает его по id, сборке и pagination', async ({ request }) => {
      const fixture = await createIsolatedAssembleKit(request, accessToken);

      try {
        const byId = await assembleAPI.getComplectKitById(request, fixture.kitId, accessToken);
        expectNoServerError(byId);
        if (!clientErrorCodes.includes(byId.status)) {
          expect(successCodes).toContain(byId.status);
          expectKitShape(byId.data, { kitId: fixture.kitId, assembleId: fixture.assembleId });
        }

        const byAssembly = await assembleAPI.getComplectKitByAssembly(request, fixture.assembleId, accessToken);
        expectNoServerError(byAssembly);
        if (!clientErrorCodes.includes(byAssembly.status)) {
          expect(successCodes).toContain(byAssembly.status);
          const rows = getRows<ApiRow>(byAssembly.data);
          expect(rows.length, JSON.stringify(byAssembly.data)).toBeGreaterThanOrEqual(1);
          expectKitShape(rows.find((kit) => Number(kit.id) === fixture.kitId) as ApiRow, {
            kitId: fixture.kitId,
            assembleId: fixture.assembleId,
          });
        }

        const pagination = await assembleAPI.getComplectKitPagination(
          request,
          kitPaginationDto({ assemblyId: fixture.assembleId }),
          accessToken,
        );
        expectRowsAndCount(pagination, 25);
        if (!clientErrorCodes.includes(pagination.status)) {
          const assembleRow = getRows<ApiRow>(pagination.data).find((row) => Number(row.id) === fixture.assembleId);
          expect(assembleRow, JSON.stringify(pagination.data)).toBeTruthy();
          expectAssembleRowShape(assembleRow as ApiRow, fixture.assembleId);
          const kits = getRows<ApiRow>((assembleRow as ApiRow).assembly_kits ?? (assembleRow as ApiRow).assemblyKits);
          expect(kits.some((kit) => Number(kit.id) === fixture.kitId), JSON.stringify(assembleRow)).toBe(true);
        }
      } finally {
        const archiveAssemble = await assembleAPI.deleteAssemble(request, fixture.assembleId, accessToken);
        expectNoServerError(archiveAssemble);

        const archiveProduct = await productsAPI.deleteProduct(request, fixture.productId, accessToken);
        expectNoServerError(archiveProduct);
      }
    });

    test('обновляет реальный комплект и проверяет статус/количество, затем раскомплектовывает', async ({ request }) => {
      const fixture = await createIsolatedAssembleKit(request, accessToken);
      const description = `API assemble kit update ${uniqueApiSuffix('kit-update')}`;

      try {
        const update = await assembleAPI.updateAssemble(
          request,
          {
            idKit: fixture.kitId,
            description,
            receivingUserId: Number(API_CONST.API_TEST_TABEL),
            docs: '[]',
            addedQuantity: 1,
            actionSendlerId: Number(API_CONST.API_TEST_TABEL),
          },
          API_CONST.API_TEST_TABEL,
          accessToken,
        );
        expectNoServerError(update);
        if (!clientErrorCodes.includes(update.status)) {
          expect(successCodes).toContain(update.status);
          expectKitShape(update.data, { kitId: fixture.kitId, assembleId: fixture.assembleId });
          expect(String(update.data.description ?? ''), JSON.stringify(update.data)).toBe(description);
          expect(Number(update.data.kolvo_submitted ?? update.data.kolvoSubmitted), JSON.stringify(update.data)).toBeGreaterThanOrEqual(1);
        }

        const uncomplect = await assembleAPI.uncomplectKit(request, fixture.kitId, 1, accessToken);
        expectNoServerError(uncomplect);
        if (!clientErrorCodes.includes(uncomplect.status)) {
          expect(successCodes).toContain(uncomplect.status);
          expectKitShape(uncomplect.data, { kitId: fixture.kitId, assembleId: fixture.assembleId });
          expect(Number(uncomplect.data.kolvo_collected ?? uncomplect.data.kolvoCollected), JSON.stringify(uncomplect.data)).toBe(0);
          expect(uncomplect.data.ban, JSON.stringify(uncomplect.data)).toBe(true);
        }
      } finally {
        const archiveAssemble = await assembleAPI.deleteAssemble(request, fixture.assembleId, accessToken);
        expectNoServerError(archiveAssemble);

        const archiveProduct = await productsAPI.deleteProduct(request, fixture.productId, accessToken);
        expectNoServerError(archiveProduct);
      }
    });

    test('проверяет дополнительные read/count маршруты сборки без серверных ошибок', async ({ request }) => {
      const assemble = firstAssemble ?? await findAnyAssemble(request, accessToken);
      test.skip(!assemble, 'Нет доступной сборки для проверки дополнительных read/count маршрутов');

      const assembleId = Number(assemble?.id);
      const parent = getAssembleParent(assemble as ApiRow);
      test.skip(!Number.isFinite(parent.id) || parent.id <= 0, `Не найден parent id в сборке: ${JSON.stringify(assemble)}`);

      const byIzdLight = await assembleAPI.getByIzdLight(request, parent.id, parent.type, accessToken);
      expectNoServerError(byIzdLight);

      const waybill = await assembleAPI.getAssembleWaybill(request, assembleId, accessToken);
      expectNoServerError(waybill);

      const kitsByAssembly = await assembleAPI.getComplectKitByAssembly(request, assembleId, accessToken);
      expectNoServerError(kitsByAssembly);
      if (!clientErrorCodes.includes(kitsByAssembly.status)) {
        expect(successCodes).toContain(kitsByAssembly.status);
        expect(Array.isArray(getRows(kitsByAssembly.data)) || Array.isArray(kitsByAssembly.data), JSON.stringify(kitsByAssembly.data)).toBe(true);
      }

      const activeKits = await assembleAPI.getActiveKitsCountById(request, parent.id, parent.type, accessToken);
      expectNoServerError(activeKits);
      if (!clientErrorCodes.includes(activeKits.status)) {
        expect(successCodes).toContain(activeKits.status);
        expect(Number(activeKits.data), JSON.stringify(activeKits.data)).toBeGreaterThanOrEqual(0);
      }

      const valueByEntity = await assembleAPI.countValueByEntity(request, parent.id, parent.type, accessToken);
      expectNoServerError(valueByEntity);
      if (!clientErrorCodes.includes(valueByEntity.status)) {
        expect(successCodes).toContain(valueByEntity.status);
        expect(valueByEntity.data, JSON.stringify(valueByEntity.data)).toBeTruthy();
      }
    });

    test('возвращает счетчики и относительные связи наборов без серверных ошибок', async ({ request }) => {
      const disactiveAll = await assembleAPI.getDisactiveKitsCount(request, 'all', accessToken);
      expectNoServerError(disactiveAll);
      if (!clientErrorCodes.includes(disactiveAll.status)) {
        expect(successCodes).toContain(disactiveAll.status);
        expect(Number(disactiveAll.data), JSON.stringify(disactiveAll.data)).toBeGreaterThanOrEqual(0);
      }

      const relativeChild = await assembleAPI.getRelativeKitChild(request, 999999999, 'listCbed', accessToken);
      expectNoServerError(relativeChild);
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

      const byIzdLight = await assembleAPI.getByIzdLight(request, 999999999, 'product', accessToken);
      expectNoServerError(byIzdLight);

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
      expectClientError(invalidCreate);

      const noAuthCreate = await assembleAPI.createAssemble(
        request,
        { numberOrder: '', myKolvo: 0, description: '', izdId: null, type: 'cbed' },
        API_CONST.API_TEST_TABEL,
      );
      expectClientError(noAuthCreate);
    });

    test('несуществующие assemble kit endpoints не приводят к серверным ошибкам', async ({ request }) => {
      const missingKit = await assembleAPI.getComplectKitById(request, 999999999, accessToken);
      expectNoServerError(missingKit);

      const missingKitsByAssembly = await assembleAPI.getComplectKitByAssembly(request, 999999999, accessToken);
      expectNoServerError(missingKitsByAssembly);

      const banMissingComplect = await captureApiResult(() => assembleAPI.banComplect(request, 999999999, accessToken));
      expectEndpointReached(banMissingComplect);

      const updateMissingResponsible = await captureApiResult(() => assembleAPI.updateResponsibleKit(request, 999999999, 999999999, accessToken));
      expectEndpointReached(updateMissingResponsible);

      const invalidCreateKit = await assembleAPI.createAssembleKit(request, invalidAssembleKitPayload(), accessToken);
      expectNoServerError(invalidCreateKit);

      const invalidUpdateKit = await assembleAPI.updateAssemble(
        request,
        {
          idKit: 999999999,
          description: 'invalid kit update from API autotest',
          receivingUserId: Number(API_CONST.API_TEST_TABEL),
          docs: '[]',
          addedQuantity: 0,
          actionSendlerId: Number(API_CONST.API_TEST_TABEL),
        },
        API_CONST.API_TEST_TABEL,
        accessToken,
      );
      expectNoServerError(invalidUpdateKit);

      const uncomplectMissing = await assembleAPI.uncomplectKit(request, 999999999, 1, accessToken);
      expectNoServerError(uncomplectMissing);

      const invalidCount = await assembleAPI.countValueByEntity(request, 999999999, 'product', accessToken);
      expectNoServerError(invalidCount);
    });
  });
};
