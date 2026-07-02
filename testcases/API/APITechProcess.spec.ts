import { test, expect } from '@playwright/test';
import { CBEDAPI } from '../../pages/API/APICBED';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { OperationAPI } from '../../pages/API/APIOperation';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { TechProcessAPI } from '../../pages/API/APITechProcess';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const cbedAPI = new CBEDAPI(null);
const detailsAPI = new DetailsAPI(null);
const equipmentAPI = new EquipmentAPI(null);
const operationAPI = new OperationAPI(null);
const productsAPI = new ProductsAPI(null as any);
const techProcessAPI = new TechProcessAPI(null);
const testUserId = API_CONST.API_TEST_TABEL;

const queueData = (data: any): any => {
  return data?.data && typeof data.data === 'object' ? data.data : data;
};

const detailPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Tech Detail ${suffix}`,
  designation: `API-TECH-D-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `Created for Tech Process API autotest ${suffix}`,
  parametrs: {
    preTime: { ez: 'ч', znach: 0 },
    helperTime: { ez: 'ч', znach: 0 },
    mainTime: { ez: 'ч', znach: 0 },
  },
  attention: false,
  workpiece_characterization: { mass: 0, trash: 0 },
  materialList: [],
  mat_zag: null,
  mat_zag_zam: null,
  docs: null,
  fileBase: [],
  ...overrides,
});

const cbedPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  techProcessID: 'null',
  characteristic: [{ name: 'Масса сборки', ez: 'кг', znach: 0 }],
  name: `API Tech CBED ${suffix}`,
  designation: `API-TECH-CBED-${suffix}`,
  responsible: '0',
  description: `Created for Tech Process API autotest ${suffix}`,
  parametrs: [{ ez: 'ч', name: 'Норма времени на сборку', znach: 0 }],
  listDetal: [],
  listCbed: [],
  listPokDet: [],
  materialList: [],
  fileBase: '[]',
  attention: 'false',
  docs: null,
  discontinued: 'false',
  ...overrides,
});

const productPayload = (suffix: string, overrides: Record<string, unknown> = {}) => ({
  id: null,
  name: `API Tech Product ${suffix}`,
  articl: `API-TECH-ART-${suffix}`,
  responsible: '',
  description: `Created for Tech Process API autotest ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-TECH-PRODUCT-${suffix}`,
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

const entityPaginationDto = (designation: string, overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: designation,
  isSortedByAttention: false,
  isSortedByDate: true,
  isSortedByOwn: false,
  isSortedByOperations: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
  ...overrides,
});

const findDetailByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await detailsAPI.getPaginationDetails(
      request,
      entityPaginationDto(designation),
      testUserId,
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const findCbedByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await cbedAPI.getCBEDPagination(
      request,
      entityPaginationDto(designation),
      testUserId,
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const findProductByDesignation = async (
  request: any,
  designation: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await productsAPI.getAllProducts(request, entityPaginationDto(designation), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.designation === designation && row.ban !== true));

  return response ? getRows<ApiRow>(response.data).find((row) => row.designation === designation && row.ban !== true) : undefined;
};

const techProcessPayload = (
  entityId: number,
  description: string,
  overrides: Record<string, unknown> = {},
) => ({
  id: '',
  izd_type: 'detal',
  izd_id: entityId,
  description,
  operationList: '[]',
  docs: null,
  ...overrides,
});

const equipmentPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeId: null,
  subTypeId: null,
  typeOperationId: null,
  isFilteredByDate: false,
  isFilteredByOwn: false,
  isFilteredByAttention: false,
  ...overrides,
});

const expectTechProcessShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(Number(row.id), JSON.stringify(row)).toBeGreaterThan(0);
};

const operationPayload = (typeOperationId: number, techProcessId: number, suffix: string) => ({
  name: String(typeOperationId),
  preTime: '0',
  helperTime: '0',
  mainTime: '1',
  generalCountTime: '1',
  techProcessId: String(techProcessId),
  description: `API tech process operation ${suffix}`,
  docs: '[]',
  instrumentList: '[]',
  instrumentMerList: '[]',
  instrumentOsnList: '[]',
  eqList: '[]',
});

const typeOperationPayload = (
  name: string,
  workStartCalcType: string,
  overrides: Record<string, unknown> = {},
) => ({
  name,
  preTime: true,
  helperTime: true,
  mainTime: true,
  cpu: false,
  square: false,
  list: false,
  users: [],
  equipmentIds: [],
  metaloworking: true,
  assembly: false,
  sclad: false,
  preTimeMinute: 0,
  helperTimeMinute: 0,
  workStartCalcType,
  ...overrides,
});

const findOperation = (techProcess: ApiRow, operationId: number): ApiRow | undefined => {
  return getRows<ApiRow>(techProcess?.operations).find((operation) => operation.id === operationId);
};

const waitForOperationCalcType = async (
  request: any,
  techProcessId: number,
  operationId: number,
  expectedCalcType: string,
  accessToken?: string,
) => {
  return eventually(
    async () => techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken),
    (response) => {
      if (!successCodes.includes(response.status)) return false;
      return findOperation(response.data, operationId)?.workStartCalcType === expectedCalcType;
    },
    { attempts: 12, intervalMs: 750 },
  );
};

const hasActiveOperation = (techProcess: ApiRow, operationId: number): boolean => {
  return getRows<ApiRow>(techProcess?.operations).some((operation) => operation.id === operationId && operation.ban !== true);
};

export const runTechProcessAPINew = () => {
  logger.info('Starting Tech Process API coverage suite');

  test.describe.serial('Tech Process API: жизненный цикл техпроцесса детали', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let detailId: number | undefined;
    let cbedId: number | undefined;
    let cbedTechProcessId: number | undefined;
    let productId: number | undefined;
    let productTechProcessId: number | undefined;
    let techProcessId: number | undefined;
    const operationIds: number[] = [];
    const typeOperationIds: number[] = [];
    const suffix = uniqueApiSuffix('tech-process');

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      for (const operationId of operationIds) {
        const cleanupOperation = await operationAPI.banOperation(request, operationId, accessToken);
        expectNoServerError(cleanupOperation);
      }
      for (const typeOperationId of typeOperationIds) {
        const cleanupTypeOperation = await operationAPI.banTypeOperation(request, typeOperationId, accessToken);
        expectNoServerError(cleanupTypeOperation);
      }
      if (productId) {
        const cleanupProduct = await productsAPI.deleteProduct(request, productId, accessToken);
        expectNoServerError(cleanupProduct);
      }
      if (cbedId) {
        const cleanupCbed = await cbedAPI.banCBED(request, cbedId, testUserId, accessToken);
        expectNoServerError(cleanupCbed);
      }
      if (!detailId) return;
      const cleanup = await detailsAPI.deleteDetail(request, String(detailId), testUserId, accessToken);
      expectNoServerError(cleanup);
    });

    test('создает тестовую деталь как владельца техпроцесса', async ({ request }) => {
      const payload = detailPayload(suffix);
      const createDetail = await detailsAPI.createDetail(request, payload, testUserId, accessToken);
      expect(successCodes, JSON.stringify(createDetail.data)).toContain(createDetail.status);
      expectNoServerError(createDetail);

      const createdDetail = await findDetailByDesignation(request, String(payload.designation), accessToken);
      detailId = Number(queueData(createDetail.data)?.id ?? createdDetail?.id);
      expect(detailId, JSON.stringify(createDetail.data)).toBeGreaterThan(0);
    });

    test('создает техпроцесс для детали и читает его по id', async ({ request }) => {
      expect(detailId).toBeTruthy();

      const createTechProcess = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process ${suffix}`),
        accessToken,
      );
      expect(successCodes, JSON.stringify(createTechProcess.data)).toContain(createTechProcess.status);
      expectNoServerError(createTechProcess);

      techProcessId = Number(queueData(createTechProcess.data)?.id);
      expect(techProcessId, JSON.stringify(createTechProcess.data)).toBeGreaterThan(0);

      const byId = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expectTechProcessShape(byId.data);
      expect(Number(byId.data.id)).toBe(techProcessId);
    });

    test('обновляет описание техпроцесса без изменения списка операций', async ({ request }) => {
      expect(detailId).toBeTruthy();
      expect(techProcessId).toBeTruthy();

      const update = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process updated ${suffix}`, {
          id: techProcessId,
          operationList: '[]',
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);

      const byId = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(Number(byId.data.id), JSON.stringify(byId.data)).toBe(techProcessId);
        expect(String(byId.data.description ?? '')).toContain('updated');
      }
    });

    test('читает техпроцесс через endpoint детали', async ({ request }) => {
      expect(detailId).toBeTruthy();
      expect(techProcessId).toBeTruthy();

      const byDetail = await detailsAPI.getTechProcessByDetailId(request, String(detailId), accessToken);
      expectNoServerError(byDetail);
      if (!clientErrorCodes.includes(byDetail.status)) {
        expect(successCodes).toContain(byDetail.status);
        expect(Number(byDetail.data?.id), JSON.stringify(byDetail.data)).toBe(detailId);
        const relatedTechProcess = byDetail.data?.techProcesses || byDetail.data?.techProcess;
        if (relatedTechProcess) {
          expect(Number(relatedTechProcess.id), JSON.stringify(byDetail.data)).toBe(techProcessId);
        }
      }
    });

    test('создает техпроцессы для cbed и product владельцев', async ({ request }) => {
      const cbedData = cbedPayload(suffix);
      const createCbed = await cbedAPI.createCBED(request, cbedData, testUserId, accessToken);
      expect(successCodes, JSON.stringify(createCbed.data)).toContain(createCbed.status);
      expectNoServerError(createCbed);
      const createdCbed = await findCbedByDesignation(request, String(cbedData.designation), accessToken);
      cbedId = Number(queueData(createCbed.data)?.id ?? createdCbed?.id);
      expect(cbedId, JSON.stringify(createCbed.data)).toBeGreaterThan(0);

      const cbedTech = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(cbedId, `API cbed tech process ${suffix}`, { izd_type: 'cbed' }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(cbedTech.data)).toContain(cbedTech.status);
      expectNoServerError(cbedTech);
      cbedTechProcessId = Number(queueData(cbedTech.data)?.id);
      expect(cbedTechProcessId, JSON.stringify(cbedTech.data)).toBeGreaterThan(0);

      const readCbedTech = await techProcessAPI.getTechProcessById(request, String(cbedTechProcessId), accessToken);
      expect(successCodes, JSON.stringify(readCbedTech.data)).toContain(readCbedTech.status);
      expectNoServerError(readCbedTech);
      expect(Number(readCbedTech.data?.id), JSON.stringify(readCbedTech.data)).toBe(cbedTechProcessId);

      const productData = productPayload(suffix);
      const createProduct = await productsAPI.createProduct(request, productData, accessToken);
      expect(successCodes, JSON.stringify(createProduct.data)).toContain(createProduct.status);
      expectNoServerError(createProduct);
      const createdProduct = await findProductByDesignation(request, String(productData.designation), accessToken);
      productId = Number(queueData(createProduct.data)?.id ?? createdProduct?.id);
      expect(productId, JSON.stringify(createProduct.data)).toBeGreaterThan(0);

      const productTech = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(productId, `API product tech process ${suffix}`, { izd_type: 'product' }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(productTech.data)).toContain(productTech.status);
      expectNoServerError(productTech);
      productTechProcessId = Number(queueData(productTech.data)?.id);
      expect(productTechProcessId, JSON.stringify(productTech.data)).toBeGreaterThan(0);

      const readProductTech = await techProcessAPI.getTechProcessById(request, String(productTechProcessId), accessToken);
      expect(successCodes, JSON.stringify(readProductTech.data)).toContain(readProductTech.status);
      expectNoServerError(readProductTech);
      expect(Number(readProductTech.data?.id), JSON.stringify(readProductTech.data)).toBe(productTechProcessId);
    });

    test('создает операции техпроцесса, привязывает их через operationList и повторно upsert-ит тот же техпроцесс', async ({ request }) => {
      expect(detailId).toBeTruthy();
      expect(techProcessId).toBeTruthy();

      const typeOperations = await operationAPI.getTypeOperationStatic(request, 'metal', accessToken);
      expectNoServerError(typeOperations);
      const typeOperation = getRows<ApiRow>(typeOperations.data).find((row) => row.id);
      test.skip(!typeOperation, 'No metal type operation is available for Tech Process operation coverage.');
      const typeOperationId = Number(typeOperation?.id);
      expect(typeOperationId, JSON.stringify(typeOperations.data)).toBeGreaterThan(0);

      for (const index of [1, 2]) {
        const createOperation = await operationAPI.createOperation(
          request,
          operationPayload(typeOperationId, techProcessId as number, `${suffix}-${index}`),
          accessToken,
        );
        expect(successCodes, JSON.stringify(createOperation.data)).toContain(createOperation.status);
        expectNoServerError(createOperation);
        const operationId = Number(queueData(createOperation.data)?.id);
        expect(operationId, JSON.stringify(createOperation.data)).toBeGreaterThan(0);
        operationIds.push(operationId);
      }

      const attachOperations = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process operations ${suffix}`, {
          id: techProcessId,
          operationList: JSON.stringify(operationIds.map((id) => ({ id }))),
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(attachOperations.data)).toContain(attachOperations.status);
      expectNoServerError(attachOperations);

      const byId = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      const operations = getRows<ApiRow>(byId.data?.operations);
      for (const operationId of operationIds) {
        expect(operations.some((row) => row.id === operationId), JSON.stringify(byId.data)).toBe(true);
      }

      const repeatUpsert = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process idempotent ${suffix}`),
        accessToken,
      );
      expect(successCodes, JSON.stringify(repeatUpsert.data)).toContain(repeatUpsert.status);
      expectNoServerError(repeatUpsert);
      expect(Number(queueData(repeatUpsert.data)?.id), JSON.stringify(repeatUpsert.data)).toBe(techProcessId);

      const reorderOperations = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process reordered ${suffix}`, {
          id: techProcessId,
          operationList: JSON.stringify([...operationIds].reverse().map((id) => ({ id }))),
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(reorderOperations.data)).toContain(reorderOperations.status);
      expectNoServerError(reorderOperations);

      const reordered = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
      expectNoServerError(reordered);
      if (!clientErrorCodes.includes(reordered.status)) {
        const operations = getRows<ApiRow>(reordered.data?.operations);
        const operationIndexes = operationIds
          .map((id) => operations.find((row) => row.id === id))
          .filter((row): row is ApiRow => Boolean(row))
          .map((row) => Number(row.idx));
        if (operationIndexes.length === operationIds.length && operationIndexes.every(Number.isFinite)) {
          expect(new Set(operationIndexes).size, JSON.stringify(reordered.data)).toBe(operationIndexes.length);
        }
      }
    });

    test('сохраняет типы расчета начала работ и корректно меняет тип операции', async ({ request }) => {
      expect(detailId).toBeTruthy();
      expect(techProcessId).toBeTruthy();

      const typeDefinitions = [
        { key: 'auto', calcType: 'automatic' },
        { key: 'next', calcType: 'nextOperationWorkStart' },
        { key: 'prev', calcType: 'prevOperationReadinessDate' },
      ];

      const createdTypes: Record<string, number> = {};
      for (const definition of typeDefinitions) {
        const createType = await operationAPI.createTypeOperation(
          request,
          typeOperationPayload(`API ${definition.key} calc ${suffix}`, definition.calcType),
          accessToken,
        );
        expect(successCodes, JSON.stringify(createType.data)).toContain(createType.status);
        expectNoServerError(createType);
        const typeOperationId = Number(queueData(createType.data)?.id);
        expect(typeOperationId, JSON.stringify(createType.data)).toBeGreaterThan(0);
        createdTypes[definition.key] = typeOperationId;
        typeOperationIds.push(typeOperationId);
      }

      const createdOperations: Record<string, number> = {};
      for (const definition of typeDefinitions) {
        const createOperation = await operationAPI.createOperation(
          request,
          operationPayload(createdTypes[definition.key], techProcessId as number, `${suffix}-${definition.key}`),
          accessToken,
        );
        expect(successCodes, JSON.stringify(createOperation.data)).toContain(createOperation.status);
        expectNoServerError(createOperation);
        const operationId = Number(queueData(createOperation.data)?.id);
        expect(operationId, JSON.stringify(createOperation.data)).toBeGreaterThan(0);
        createdOperations[definition.key] = operationId;
        operationIds.push(operationId);
      }

      const techWithCalcTypes = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
      expect(successCodes, JSON.stringify(techWithCalcTypes.data)).toContain(techWithCalcTypes.status);
      expectNoServerError(techWithCalcTypes);
      for (const definition of typeDefinitions) {
        const operation = findOperation(techWithCalcTypes.data, createdOperations[definition.key]);
        expect(operation, JSON.stringify(techWithCalcTypes.data)).toBeTruthy();
        expect(operation?.workStartCalcType, JSON.stringify(operation)).toBe(definition.calcType);
      }

      const switchToNextType = await operationAPI.updateOperation(
        request,
        {
          ...operationPayload(createdTypes.next, techProcessId as number, `${suffix}-switch-next`),
          id: String(createdOperations.auto),
          description: 'Switched to nextOperationWorkStart type',
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(switchToNextType.data)).toContain(switchToNextType.status);
      expectNoServerError(switchToNextType);

      const afterSwitchToNext = await waitForOperationCalcType(
        request,
        techProcessId as number,
        createdOperations.auto,
        'nextOperationWorkStart',
        accessToken,
      );
      expect(afterSwitchToNext, JSON.stringify(switchToNextType.data)).toBeTruthy();

      const switchBackToAutomatic = await operationAPI.updateOperation(
        request,
        {
          ...operationPayload(createdTypes.auto, techProcessId as number, `${suffix}-switch-auto`),
          id: String(createdOperations.auto),
          description: 'Switched back to automatic type',
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(switchBackToAutomatic.data)).toContain(switchBackToAutomatic.status);
      expectNoServerError(switchBackToAutomatic);

      const afterSwitchBack = await waitForOperationCalcType(
        request,
        techProcessId as number,
        createdOperations.auto,
        'automatic',
        accessToken,
      );
      expect(afterSwitchBack, JSON.stringify(switchBackToAutomatic.data)).toBeTruthy();

      const updateTypeToPrev = await operationAPI.updateTypeOperation(
        request,
        typeOperationPayload(`API auto calc ${suffix}`, 'prevOperationReadinessDate', { id: createdTypes.auto }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateTypeToPrev.data)).toContain(updateTypeToPrev.status);
      expectNoServerError(updateTypeToPrev);

      const afterTypeUpdate = await waitForOperationCalcType(
        request,
        techProcessId as number,
        createdOperations.auto,
        'prevOperationReadinessDate',
        accessToken,
      );
      expect(afterTypeUpdate, JSON.stringify(updateTypeToPrev.data)).toBeTruthy();

      const updateTypeBackToAutomatic = await operationAPI.updateTypeOperation(
        request,
        typeOperationPayload(`API auto calc ${suffix}`, 'automatic', { id: createdTypes.auto }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateTypeBackToAutomatic.data)).toContain(updateTypeBackToAutomatic.status);
      expectNoServerError(updateTypeBackToAutomatic);

      const afterTypeRollback = await waitForOperationCalcType(
        request,
        techProcessId as number,
        createdOperations.auto,
        'automatic',
        accessToken,
      );
      expect(afterTypeRollback, JSON.stringify(updateTypeBackToAutomatic.data)).toBeTruthy();

      const operationsWithTimeFields = getRows<ApiRow>(afterTypeRollback!.data?.operations).filter((operation) =>
        Object.values(createdOperations).includes(operation.id),
      );
      for (const operation of operationsWithTimeFields) {
        expect(operation, JSON.stringify(operation)).toHaveProperty('workStartCalcType');
      }
    });

    test('обновляет операцию, привязывает ресурс-оборудование и архивирует операцию', async ({ request }) => {
      expect(techProcessId).toBeTruthy();
      expect(operationIds.length).toBeGreaterThan(0);

      const typeOperations = await operationAPI.getTypeOperationStatic(request, 'metal', accessToken);
      expectNoServerError(typeOperations);
      const typeOperationId = Number(getRows<ApiRow>(typeOperations.data).find((row) => row.id)?.id);
      expect(typeOperationId, JSON.stringify(typeOperations.data)).toBeGreaterThan(0);

      const equipments = await equipmentAPI.getEquipmentPagination(request, equipmentPaginationDto(), accessToken);
      expectNoServerError(equipments);
      const equipmentId = Number(getRows<ApiRow>(equipments.data).find((row) => row.id)?.id);

      const operationId = operationIds[0];
      const updateOperation = await operationAPI.updateOperation(
        request,
        {
          ...operationPayload(typeOperationId, techProcessId as number, `${suffix}-updated`),
          id: String(operationId),
          mainTime: '2',
          generalCountTime: '2',
          description: `API tech process operation updated ${suffix}`,
          eqList: Number.isFinite(equipmentId) && equipmentId > 0 ? JSON.stringify([equipmentId]) : '[]',
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateOperation.data)).toContain(updateOperation.status);
      expectNoServerError(updateOperation);

      const operationById = await operationAPI.getOperationById(request, operationId, accessToken);
      expect(successCodes, JSON.stringify(operationById.data)).toContain(operationById.status);
      expectNoServerError(operationById);
      expect(String(operationById.data?.description ?? '')).toContain('updated');
      if (Number.isFinite(equipmentId) && equipmentId > 0) {
        const operationText = JSON.stringify(operationById.data);
        expect(operationText).toContain(String(equipmentId));
      }

      const archiveOperation = await operationAPI.banOperation(request, operationId, accessToken);
      expectNoServerError(archiveOperation);
      if (!clientErrorCodes.includes(archiveOperation.status)) {
        expect(successCodes).toContain(archiveOperation.status);
      }

      const techAfterArchive = await eventually(async () => {
        const response = await techProcessAPI.getTechProcessById(request, String(techProcessId), accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => clientErrorCodes.includes(response.status) || !hasActiveOperation(response.data, operationId), {
        attempts: 12,
        intervalMs: 1000,
      });
      expect(techAfterArchive, `Operation ${operationId} is still active after archive`).toBeTruthy();
      if (techAfterArchive && !clientErrorCodes.includes(techAfterArchive.status)) {
        expect(hasActiveOperation(techAfterArchive.data, operationId), JSON.stringify(techAfterArchive.data)).toBe(false);
      }

      operationIds.splice(operationIds.indexOf(operationId), 1);
    });

    test('отклоняет некорректные operationList без 5xx', async ({ request }) => {
      expect(detailId).toBeTruthy();
      expect(techProcessId).toBeTruthy();

      const badJson = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process bad json ${suffix}`, {
          id: techProcessId,
          operationList: '[{bad-json',
        }),
        accessToken,
      );
      expectClientError(badJson);

      const nonexistent = await techProcessAPI.createOrUpdateTechProcess(
        request,
        techProcessPayload(detailId as number, `API tech process nonexistent op ${suffix}`, {
          id: techProcessId,
          operationList: JSON.stringify([{ id: 999999999 }]),
        }),
        accessToken,
      );
      expectNoServerError(nonexistent);
      if (!clientErrorCodes.includes(nonexistent.status)) {
        expect(successCodes).toContain(nonexistent.status);
        expect(getRows<ApiRow>(nonexistent.data?.operations).some((row) => row.id === 999999999), JSON.stringify(nonexistent.data)).toBe(false);
      }

      if (operationIds.length) {
        const duplicate = await techProcessAPI.createOrUpdateTechProcess(
          request,
          techProcessPayload(detailId as number, `API tech process duplicate op ${suffix}`, {
            id: techProcessId,
            operationList: JSON.stringify([{ id: operationIds[0] }, { id: operationIds[0] }]),
          }),
          accessToken,
        );
        expectNoServerError(duplicate);
      }
    });
  });

  test.describe('Tech Process API: defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('чтение несуществующего id не приводит к серверным ошибкам', async ({ request }) => {
      const response = await techProcessAPI.getTechProcessById(request, '999999999', accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).not.toContain(response.status);
    });

    test('невалидное создание и обновление отклоняются без 5xx', async ({ request }) => {
      const invalidCreate = await techProcessAPI.createOrUpdateTechProcess(
        request,
        {
          id: '',
          izd_type: 'detal',
          izd_id: 999999999,
          description: '',
          operationList: '[]',
          docs: null,
        },
        accessToken,
      );
      expectClientError(invalidCreate);

      const invalidUpdate = await techProcessAPI.createOrUpdateTechProcess(
        request,
        {
          id: 999999999,
          izd_type: 'detal',
          izd_id: 999999999,
          description: 'Invalid update',
          operationList: '[]',
          docs: null,
        },
        accessToken,
      );
      expectClientError(invalidUpdate);
    });

    test('мутация техпроцесса без авторизации не проходит успешно', async ({ request }) => {
      const response = await techProcessAPI.createOrUpdateTechProcess(request, {
        id: '',
        izd_type: 'detal',
        izd_id: 999999999,
        description: `No auth ${uniqueApiSuffix('tech-process')}`,
        operationList: '[]',
        docs: null,
      });
      expectClientError(response);
    });
  });
};
