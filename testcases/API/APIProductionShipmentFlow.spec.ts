import { test, expect, APIRequestContext } from '@playwright/test';
import { ENV } from '../../config';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { expectNoServerError, getRows, serverErrorCodes, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { expectRepeatOperationRejectedOrIdempotent } from '../../lib/helpers/APIDataInvariants';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { CBEDAPI } from '../../pages/API/APICBED';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { StockOrderAPI } from '../../pages/API/APIStockOrder';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { CompaniesAPI } from '../../pages/API/APICompanies';

type ApiRow = Record<string, any>;
type ApiResult = { status: number; data: any };
const lzString = require('lz-string') as {
  compressToBase64: (input: string) => string;
};

const productsAPI = new ProductsAPI(null as any);
const cbedAPI = new CBEDAPI(null);
const detailsAPI = new DetailsAPI(null);
const shipmentsAPI = new ShipmentsAPI(null as any);
const stockOrderAPI = new StockOrderAPI(null);
const productionTasksAPI = new ProductionTasksAPI(null);
const companiesAPI = new CompaniesAPI(null);
const testUserId = API_CONST.API_TEST_TABEL;
const API_TIMEOUT_MS = 60000;
const shipmentManagerId = Number(API_CONST.API_CREATOR_USER_ID_66);

const jsonHeaders = (token?: string, extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  compress: 'no-compress',
  ...extra,
  ...(token ? { Cookie: `access_token=${token}; refresh_token=${token}` } : {}),
});

const multipartHeaders = (token?: string, extra: Record<string, string> = {}) => ({
  compress: 'no-compress',
  ...extra,
  ...(token ? { Cookie: `access_token=${token}; refresh_token=${token}` } : {}),
});

const parseBody = async (response: any) => {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return text ? { raw: text } : {};
  }
};

const queueData = (data: any) => (data?.data && typeof data.data === 'object' ? data.data : data);
const hasNoServerError = (result: ApiResult) => !serverErrorCodes.includes(result.status);
const multipartData = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]),
  );
const multipartBodyWithEmptyFields = (data: Record<string, unknown>) => {
  const boundary = `----WebKitFormBoundary${uniqueApiSuffix('shcheck').replace(/[^a-zA-Z0-9]/g, '')}`;
  const body = Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) =>
      [
        `--${boundary}`,
        `Content-Disposition: form-data; name="${key}"`,
        '',
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      ].join('\r\n'),
    )
    .concat(`--${boundary}--`)
    .join('\r\n');

  return {
    body: Buffer.from(`${body}\r\n`, 'utf8'),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
};
const compressSpec = (value: unknown) => lzString.compressToBase64(JSON.stringify(value));
const dateToTimestampFormat = (date: string | Date, isStartDay = true) => {
  const value = date instanceof Date ? date.toISOString() : String(date);
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const formattedDate = value.split('.').reverse().join('-');
    return `${formattedDate} ${isStartDay ? '12' : '01'}:00:00.000+03`;
  }
  const parsedDate = new Date(value);
  if (!isStartDay) parsedDate.setHours(6, 0, 0, 0);
  return parsedDate.toISOString().replace('T', ' ').replace('Z', '+03');
};
const dateRu = (date = new Date()) =>
  [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join('.');

const specItem = (entity: ApiRow) => ({
  id: Number(entity.id),
  name: entity.name,
  designation: entity.designation,
  discontinued: false,
  quantity: 1,
  measureId: 1,
});

const productPayload = (suffix: string, cbed: ApiRow, detail: ApiRow) => ({
  id: null,
  name: `API Flow Product ${suffix}`,
  articl: `API-FLOW-P-${suffix}`,
  responsible: '',
  description: `API flow product ${suffix}`,
  parametrs: [{ ez: 'шт', name: 'Норма времени на изделие', znach: 0 }],
  characteristic: [
    { ez: 'шт', name: 'Рекомендуемый остаток', znach: 0 },
    { ez: 'шт', name: 'Минимальный остаток', znach: 0 },
  ],
  designation: `API-FLOW-P-${suffix}`,
  listDetal: [specItem(detail)],
  listCbed: [specItem(cbed)],
  listPokDet: [],
  materialList: [],
  techProcessID: 'null',
  fileBase: [],
  attention: false,
  is_custom: 'false',
  discontinued: false,
});

const cbedPayload = (suffix: string) => ({
  id: null,
  techProcessID: 'null',
  characteristic: [{ name: 'Масса сборки', ez: 'кг', znach: 0 }],
  name: `API Flow CBED ${suffix}`,
  designation: `API-FLOW-C-${suffix}`,
  responsible: '0',
  description: `API flow cbed ${suffix}`,
  parametrs: [{ ez: 'ч', name: 'Норма времени на сборку', znach: 0 }],
  listDetal: [],
  listCbed: [],
  listPokDet: [],
  materialList: [],
  fileBase: '[]',
  attention: 'false',
  docs: null,
  discontinued: 'false',
});

const detailPayload = (suffix: string, techProcessId?: number) => ({
  id: null,
  techProcessID: techProcessId ?? null,
  characteristic: [{ name: 'Масса детали', ez: 'кг', znach: 0 }],
  name: `API Flow Detail ${suffix}`,
  designation: `API-FLOW-D-${suffix}`,
  discontinued: false,
  responsible: '0',
  description: `API flow detail ${suffix}`,
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
});

const paginationDto = (searchString = '') => ({
  page: 0,
  searchString,
  isSortedByAttention: false,
  isSortedByDate: true,
  isSortedByOwn: false,
  isSortedByOperations: false,
  isDiscontinued: false,
  enableIsDiscontinuedView: false,
});

const remainsDto = (searchString: string, parentType: string | null = null, parentId: number | null = null) => ({
  page: 0,
  searchString,
  relativeData: { parentType, parentId },
});

const deficitDto = (searchString: string, idsKey: string, id?: number) => ({
  page: 0,
  statusWorking: 'Все',
  [idsKey]: id ? [id] : [],
  searchString,
});

const productionPlanDto = (
  workingType: 'metall' | 'ass',
  searchStr = '',
  overrides: Record<string, unknown> = {},
) => ({
  byParents: { productIds: [], cbedIds: [], detalIds: [] },
  byOrder: { customer: 'buyer', orderId: [] },
  onlyDeficit: false,
  page: 0,
  workingType,
  childrenByProductionTaskIds: [],
  searchStr,
  range: { start: null, end: null },
  sortReadiness: 'any',
  typeOperationIds: [],
  assembleIds: [],
  excludeIds: [],
  deficitFilteringType: 'all',
  ...overrides,
});

const getFirstMatchingRow = async (
  loader: () => Promise<ApiResult>,
  matcher: (row: ApiRow) => boolean,
) => {
  const response = await eventually(
    async () => {
      const res = await loader();
      return res;
    },
    (res) => hasNoServerError(res) && getRows<ApiRow>(res.data).some(matcher),
    { attempts: 15, intervalMs: 800 },
  );

  return response ? getRows<ApiRow>(response.data).find(matcher) : undefined;
};

const findNumber = (value: unknown, keys: string[]): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object' || seen.has(item)) continue;
    seen.add(item);
    for (const [key, child] of Object.entries(item as ApiRow)) {
      if (keys.includes(key) && Number.isFinite(Number(child)) && Number(child) > 0) return Number(child);
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return undefined;
};

const findNumbers = (value: unknown, keys: string[]): number[] => {
  const result: number[] = [];
  const stack = [value];
  const seen = new Set<unknown>();
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object' || seen.has(item)) continue;
    seen.add(item);
    for (const [key, child] of Object.entries(item as ApiRow)) {
      const numberValue = Number(child);
      if (keys.includes(key) && Number.isFinite(numberValue) && numberValue > 0) {
        result.push(numberValue);
      }
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return Array.from(new Set(result));
};

const findValidEquipmentId = async (
  request: APIRequestContext,
  typeOperationId: number,
  token?: string,
) => {
  const candidates = new Set<number>();
  const equipmentByType = await apiGet(request, `api/equipment/by-type-operation/${typeOperationId}`, token);
  expectNoServerError(equipmentByType);
  findNumbers(equipmentByType.data, ['id', 'equipment_id', 'equipmentId']).forEach((id) => candidates.add(id));

  const workloadByType = await productionTasksAPI.getProductionTaskByAllEquipments(request, typeOperationId, token);
  expectNoServerError(workloadByType);
  findNumbers(workloadByType.data, ['equipment_id', 'equipmentId']).forEach((id) => candidates.add(id));

  const allEquipment = await apiGet(request, 'api/equipment/eq/all/true', token);
  expectNoServerError(allEquipment);
  findNumbers(allEquipment.data, ['id']).forEach((id) => candidates.add(id));

  for (const candidateId of candidates) {
    const equipment = await apiGet(request, `api/equipment/eq/${candidateId}`, token);
    if (
      successCodes.includes(equipment.status) &&
      Number(equipment.data?.id) === candidateId &&
      equipment.data?.ban !== true
    ) {
      return candidateId;
    }
  }

  throw new Error(`Не найдено валидное оборудование для операции ${typeOperationId}. Кандидаты: ${JSON.stringify(Array.from(candidates))}`);
};

const findOperationIdForTask = (value: unknown): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object' || seen.has(item)) continue;
    seen.add(item);

    const row = item as ApiRow;
    if (
      Number.isFinite(Number(row.id)) &&
      (
        Number.isFinite(Number(row.tOperationId)) ||
        Number.isFinite(Number(row.type_operation_id)) ||
        Number.isFinite(Number(row.typeOperationId))
      )
    ) {
      return Number(row.id);
    }

    for (const child of Object.values(row)) {
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return undefined;
};

const findOperationIdByName = (value: unknown, patterns: RegExp[]): number | undefined => {
  const stack = [value];
  const seen = new Set<unknown>();
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object' || seen.has(item)) continue;
    seen.add(item);

    const row = item as ApiRow;
    const operationName = [
      row.full_name,
      row.fullName,
      row.name,
      row.typeOperation?.name,
      row.type_operation?.name,
      row.operation?.full_name,
      row.operation?.name,
    ]
      .filter(Boolean)
      .join(' ');

    const isOperationLike = Boolean(
      row.full_name ||
        row.fullName ||
        row.tech_process_id ||
        row.techProcessId ||
        row.tOperationId ||
        row.type_operation_id ||
        row.typeOperationId ||
        row.operation?.id,
    );

    if (isOperationLike && Number.isFinite(Number(row.id)) && patterns.some((pattern) => pattern.test(operationName))) {
      return Number(row.id);
    }

    for (const child of Object.values(row)) {
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return undefined;
};

const planAssembleId = (row: ApiRow | undefined): number | undefined => {
  const id = Number(row?.id);
  return Number.isFinite(id) && id > 0 ? id : undefined;
};

const expectStock = async (
  request: APIRequestContext,
  type: 'product' | 'cbed' | 'detal',
  id: number,
  name: string,
  quantity: number,
  inKit: number,
  token?: string,
) => {
  const api =
    type === 'product'
      ? (dto: any) => request.post(ENV.API_BASE_URL + 'api/product/sclad/remains', { headers: jsonHeaders(token), data: dto })
      : type === 'cbed'
        ? (dto: any) => request.post(ENV.API_BASE_URL + 'api/cbed/sclad/remains', { headers: jsonHeaders(token), data: dto })
        : (dto: any) => request.post(ENV.API_BASE_URL + 'api/detal/sclad/remains', { headers: jsonHeaders(token), data: dto });

  const response = await eventually(
    async () => {
      const res = await api(remainsDto(name));
      const data = await parseBody(res);
      const result = { status: res.status(), data };
      return result;
    },
    (result) => {
      if (!hasNoServerError(result)) return false;
      const row = getRows<ApiRow>(result.data).find((item) => Number(item.id) === id);
      return (
        Boolean(row) &&
        Number(row?.quantity ?? 0) === quantity &&
        Number(row?.in_kit ?? row?.inKit ?? 0) === inKit
      );
    },
    { attempts: 20, intervalMs: 1500 },
  );
  const row = response ? getRows<ApiRow>(response.data).find((item) => Number(item.id) === id) : undefined;
  expect(row, JSON.stringify(response?.data)).toBeTruthy();
  expect(Number(row?.quantity ?? 0), JSON.stringify(row)).toBe(quantity);
  expect(Number(row?.in_kit ?? row?.inKit ?? 0), JSON.stringify(row)).toBe(inKit);
};

const expectStockOrder = async (
  request: APIRequestContext,
  type: 'product' | 'cbed' | 'detal',
  id: number,
  token?: string,
) => {
  const orderType = type === 'detal' ? 'metall' : 'ass';
  const entityKey = `${type}_id`;
  const response = await eventually(
    async () => {
      const res = await stockOrderAPI.getByObject(request, id, type, token);
      return res;
    },
    (res) =>
      hasNoServerError(res) &&
      getRows<ApiRow>(res.data).some((row) => {
        const entityId = Number(row[entityKey] ?? row[`${type}Id`]);
        const actualOrderType = String(row.stock_order?.type ?? row.stockOrder?.type ?? '').toLowerCase();
        return Number(row.id) > 0 && entityId === id && actualOrderType === orderType;
      }),
    { attempts: 15, intervalMs: 800 },
  );

  const order = response
    ? getRows<ApiRow>(response.data).find((row) => {
        const entityId = Number(row[entityKey] ?? row[`${type}Id`]);
        const actualOrderType = String(row.stock_order?.type ?? row.stockOrder?.type ?? '').toLowerCase();
        return Number(row.id) > 0 && entityId === id && actualOrderType === orderType;
      })
    : undefined;
  expect(order, `Не найдена позиция заказа склада ${type}:${id}. Ответ: ${JSON.stringify(response?.data)}`).toBeTruthy();

  const items = await stockOrderAPI.getItemsByEntity(request, type, id, token);
  expectNoServerError(items);
  expect(
    getRows<ApiRow>(items.data).some((row) => {
      const entityId = Number(row[entityKey] ?? row[`${type}Id`] ?? row.object_id ?? row.objectId);
      return Number(row.id) > 0 && (!Number.isFinite(entityId) || entityId === id);
    }),
    `Не найдена позиция заказа склада ${type}:${id}. Ответ: ${JSON.stringify(items.data)}`,
  ).toBe(true);
};

const expectOperationMark = async (
  request: APIRequestContext,
  operationId: number,
  assembleId: number,
  token?: string,
) => {
  const response = await eventually(
    async () => {
      const res = await apiGet(request, `api/marks/marks/byoperation/${operationId}`, token);
      return res;
    },
    (res) =>
      hasNoServerError(res) &&
      getRows<ApiRow>(res.data).some(
        (row) =>
          Number(row.oper_id ?? row.operId) === operationId &&
          Number(row.assemble_id ?? row.assembleId) === assembleId &&
          Number(row.kol ?? 0) >= 1 &&
          row.ban !== true,
      ),
    { attempts: 15, intervalMs: 1000 },
  );

  expect(
    response && getRows<ApiRow>(response.data).some(
      (row) =>
        Number(row.oper_id ?? row.operId) === operationId &&
        Number(row.assemble_id ?? row.assembleId) === assembleId &&
        Number(row.kol ?? 0) >= 1 &&
        row.ban !== true,
    ),
    `Не найдена отметка по операции ${operationId} и assemble ${assembleId}. Ответ: ${JSON.stringify(response?.data)}`,
  ).toBe(true);
};

const expectComplectKitId = async (
  request: APIRequestContext,
  operationId: number,
  assembleId: number,
  token?: string,
) => {
  const response = await eventually(
    async () => {
      const res = await apiGet(request, `api/marks/marks/byoperation/${operationId}`, token);
      return res;
    },
    (res) =>
      hasNoServerError(res) &&
      getRows<ApiRow>(res.data).some(
        (row) =>
          Number(row.oper_id ?? row.operId) === operationId &&
          Number(row.assemble_id ?? row.assembleId) === assembleId &&
          Number(row.assemble_kit_id ?? row.assembleKitId) > 0 &&
          Number(row.kol ?? 0) >= 1 &&
          row.ban !== true,
      ),
    { attempts: 15, intervalMs: 1000 },
  );

  const mark = response
    ? getRows<ApiRow>(response.data).find(
        (row) =>
          Number(row.oper_id ?? row.operId) === operationId &&
          Number(row.assemble_id ?? row.assembleId) === assembleId &&
          Number(row.assemble_kit_id ?? row.assembleKitId) > 0 &&
          Number(row.kol ?? 0) >= 1 &&
          row.ban !== true,
      )
    : undefined;
  const kitId = Number(mark?.assemble_kit_id ?? mark?.assembleKitId);
  expect(kitId, `Не найден id набора по операции ${operationId} и assemble ${assembleId}. Ответ: ${JSON.stringify(response?.data)}`).toBeGreaterThan(0);

  return kitId;
};

const apiPost = async (
  request: APIRequestContext,
  path: string,
  data: any,
  token?: string,
  multipart = false,
  extraHeaders: Record<string, string> = {},
): Promise<ApiResult> => {
  const res = await request.post(
    ENV.API_BASE_URL + path,
    multipart
      ? { headers: multipartHeaders(token, extraHeaders), multipart: multipartData(data), timeout: API_TIMEOUT_MS }
      : { headers: jsonHeaders(token, extraHeaders), data, timeout: API_TIMEOUT_MS },
  );
  return { status: res.status(), data: await parseBody(res) };
};

const apiGet = async (
  request: APIRequestContext,
  path: string,
  token?: string,
  extraHeaders: Record<string, string> = {},
): Promise<ApiResult> => {
  const res = await request.get(ENV.API_BASE_URL + path, { headers: jsonHeaders(token, extraHeaders), timeout: API_TIMEOUT_MS });
  return { status: res.status(), data: await parseBody(res) };
};

const apiPut = async (
  request: APIRequestContext,
  path: string,
  data: any = undefined,
  token?: string,
  extraHeaders: Record<string, string> = {},
): Promise<ApiResult> => {
  const res = await request.put(ENV.API_BASE_URL + path, {
    headers: jsonHeaders(token, extraHeaders),
    ...(data === undefined ? {} : { data }),
    timeout: API_TIMEOUT_MS,
  });
  return { status: res.status(), data: await parseBody(res) };
};

const createShipmentWithFallbacks = async (
  request: APIRequestContext,
  buyerId: number,
  productId: number,
  suffix: string,
  productName: string,
  token?: string,
) => {
  const baseData = {
    dateOrder: new Date().toISOString(),
    dateShipments: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    kol: 1,
    bron: false,
    base: '',
    buyer: buyerId,
    description: `API flow shipment ${suffix}`,
    managerId: shipmentManagerId,
    documentsData: '[]',
  };

  const variants = [
    {
      label: 'product-non-custom',
      data: {
        ...baseData,
        isCustomProduct: false,
        nameCustomProduct: '',
        product: { id: productId, name: productName },
      },
    },
    {
      label: 'product-non-custom-with-designation',
      data: {
        ...baseData,
        isCustomProduct: false,
        nameCustomProduct: '',
        product: { id: productId, name: productName, designation: `API-FLOW-P-${suffix}` },
      },
    },
    {
      label: 'product-custom',
      data: {
        ...baseData,
        isCustomProduct: true,
        nameCustomProduct: productName,
        product: { id: productId, name: productName },
      },
    },
    {
      label: 'product-custom-no-manager',
      data: {
        ...baseData,
        isCustomProduct: true,
        nameCustomProduct: productName,
        managerId: undefined,
        product: { id: productId, name: productName },
      },
    },
  ];

  const attempts: Array<{ label: string; status: number; data: any }> = [];
  for (const variant of variants) {
    for (const mode of ['json'] as const) {
      const response = await apiPost(
        request,
        'api/shipments',
        variant.data,
        token,
        false,
      );
      attempts.push({ label: `${variant.label}-${mode}`, status: response.status, data: response.data });
      if (successCodes.includes(response.status) && Number(queueData(response.data)?.id) > 0) {
        const shipmentId = Number(queueData(response.data)?.id);
        const hydrated = await eventually(
          async () => {
            const shipment = await shipmentsAPI.getShipmentById(request, shipmentId, token);
            return shipment;
          },
          (shipment) =>
            hasNoServerError(shipment) &&
            Number(shipment.data?.id) === shipmentId &&
            Number(shipment.data?.productId ?? shipment.data?.product_id) === productId &&
            Number(shipment.data?.kol ?? 0) === 1,
          { attempts: 12, intervalMs: 1000 },
        );

        return { response: hydrated || response, attempts };
      }
    }
  }

  return { response: attempts[attempts.length - 1], attempts };
};

const findShCheckByNumber = async (
  request: APIRequestContext,
  numberOrder: string,
  token?: string,
) => {
  try {
    const response = await shipmentsAPI.getShCheckPagination(
      request,
      {
        page: 0,
        searchString: numberOrder,
        dateRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      token,
    );
    if (!hasNoServerError(response)) return undefined;

    return getRows<ApiRow>(response.data).find(
      (row) => row.number_order === numberOrder || row.numberOrder === numberOrder,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ECONNRESET') || message.includes('Connection timeout') || message.includes('socket hang up')) {
      return undefined;
    }
    throw error;
  }
};

const waitForShCheckByNumber = async (
  request: APIRequestContext,
  numberOrder: string,
  token?: string,
) =>
  eventually(
    () => findShCheckByNumber(request, numberOrder, token),
    (row) => Boolean(row),
    { attempts: 12, intervalMs: 2000 },
  );

const createShCheckWithFallback = async (
  request: APIRequestContext,
  data: ApiRow,
  token?: string,
) => {
  const numberOrder = String(data.numberOrder);
  let lastResponse: ApiResult | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    const jsonResponse = await apiPost(request, 'api/shipments/shcheck', data, token);
    lastResponse = jsonResponse;
    if (successCodes.includes(jsonResponse.status)) return jsonResponse;

    const existingAfterJson = await findShCheckByNumber(request, numberOrder, token);
    if (existingAfterJson) return { status: 200, data: existingAfterJson };

    const jsonMessage = String(jsonResponse.data?.message ?? jsonResponse.data?.raw ?? '');
    if (!jsonMessage.includes('timed out')) return jsonResponse;

    const multipart = multipartBodyWithEmptyFields(data);
    const res = await request.post(ENV.API_BASE_URL + 'api/shipments/shcheck', {
      headers: multipartHeaders(token, { 'Content-Type': multipart.contentType }),
      data: multipart.body,
      timeout: API_TIMEOUT_MS,
    });
    const response = { status: res.status(), data: await parseBody(res) };
    lastResponse = response;
    if (successCodes.includes(response.status)) return response;

    const existing = await findShCheckByNumber(request, numberOrder, token);
    if (existing) return { status: 200, data: existing };

    const message = String(response.data?.message ?? response.data?.raw ?? '');
    if (!message.includes('timed out')) return response;

    const delayed = await eventually(
      () => findShCheckByNumber(request, numberOrder, token),
      (row) => Boolean(row),
      { attempts: 3, intervalMs: 1000 },
    );
    if (delayed) return { status: 200, data: delayed };

    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }

  const delayed = await waitForShCheckByNumber(request, numberOrder, token);
  if (delayed) return { status: 200, data: delayed };

  return lastResponse!;
};

const getStableAuthToken = async (request: APIRequestContext): Promise<string> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await getAuthToken(request);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const waitForDeficit = async (
  loader: () => Promise<ApiResult>,
  matcher: (row: ApiRow) => boolean,
) => {
  const response = await eventually(
    async () => {
      const res = await loader();
      return res;
    },
    (res) => hasNoServerError(res) && getRows<ApiRow>(res.data).some(matcher),
    { attempts: 20, intervalMs: 1500 },
  );

  return response ? getRows<ApiRow>(response.data).find(matcher) : undefined;
};

const readDeficitRow = async (
  loader: () => Promise<ApiResult>,
  matcher: (row: ApiRow) => boolean,
) => {
  const response = await loader();
  expectNoServerError(response);
  return getRows<ApiRow>(response.data).find(matcher);
};

const readDeficitValues = (row: ApiRow) => ({
  deficit: Number(
    row.deficit ??
      row.deficit_count ??
      row.deficitCount ??
      row.shortage ??
      row.shortage_count ??
      row.shortageCount ??
      0,
  ),
  shipmentsDeficit: Number(row.shipments_deficit ?? row.shipmentsDeficit ?? 0),
});

const expectNoDeficitRow = async (
  loader: () => Promise<ApiResult>,
  matcher: (row: ApiRow) => boolean,
  message: string,
) => {
  let lastRow: ApiRow | undefined;
  const response = await eventually(
    async () => {
      const response = await loader();
      if (hasNoServerError(response)) {
        lastRow = getRows<ApiRow>(response.data).find(matcher);
      }
      return response;
    },
    (response) => {
      if (!hasNoServerError(response)) return false;
      if (!lastRow) return true;
      const { deficit, shipmentsDeficit } = readDeficitValues(lastRow);
      return deficit === 0 && shipmentsDeficit === 0;
    },
    { attempts: 30, intervalMs: 2000 },
  );

  expect(response, `${message}: пересчет дефицитов Bull не завершился. Last row: ${JSON.stringify(lastRow)}`).toBeTruthy();
  const row = lastRow;
  if (!row) return;

  const { deficit, shipmentsDeficit } = readDeficitValues(row);
  expect(deficit, `${message}: ${JSON.stringify(row)}`).toBe(0);
  expect(shipmentsDeficit, `${message}: ${JSON.stringify(row)}`).toBe(0);
};

const waitForProductState = async (
  request: APIRequestContext,
  productId: number,
  token?: string,
) => {
  const response = await eventually(
    async () => {
      const res = await productsAPI.getProductById(request, productId, token);
      return res;
    },
    (response) => {
      if (!hasNoServerError(response)) return false;
      const row = queueData(response.data);
      return (
        Boolean(row) &&
        Number(row.id) === productId &&
        Number(row.actual_shipment_id ?? 0) > 0 &&
        Number(row.shipments_kolvo ?? 0) > 0 &&
        Number(row.deficit ?? 0) < 0
      );
    },
    { attempts: 40, intervalMs: 3000 },
  );

  return response ? queueData(response.data) : null;
};

const ignoreCleanupError = async (action: () => Promise<unknown>) => {
  try {
    await action();
  } catch {
    // Cleanup is best effort: keep the primary test failure visible.
  }
};

export const runProductionShipmentFlowAPI = () => {
  test.describe.serial('API Flow: производство, комплектация, приход и отгрузка', () => {
    test.describe.configure({ timeout: 240000 });

    let accessToken: string;
    let productId: number;
    let cbedId: number;
    let detailId: number;
    let techProcessId: number;
    let operationId: number;
    let shipmentId: number;
    let shCheckId: number;
    let repeatedShCheckId: number;
    let metaloworkingId: number;
    let assembleCbedId: number;
    let assembleProductId: number;
    let cbedKitId: number;
    let buyerId: number;
    let createdEntitiesCleanedUp = false;
    const suffix = uniqueApiSuffix('prod-flow');
    const names = {
      product: `API Flow Product ${suffix}`,
      cbed: `API Flow CBED ${suffix}`,
      detail: `API Flow Detail ${suffix}`,
    };

    test.beforeAll(async ({ request }) => {
      accessToken = await getStableAuthToken(request);
      const companies = await companiesAPI.getCompaniesPagination(
        request,
        { page: 0, searchString: '', isArchive: false, attributes: [], filterByTypes: ['buyer'] },
        accessToken,
      );
      expectNoServerError(companies);
      buyerId = Number(getRows<ApiRow>(companies.data).find((row) => row.id && row.ban !== true)?.id);
      expect(buyerId, JSON.stringify(companies.data)).toBeGreaterThan(0);
      const buyer = await companiesAPI.getCompanyById(request, buyerId, accessToken);
      expectNoServerError(buyer);
      expect(Number(buyer.data?.id), JSON.stringify(buyer.data)).toBe(buyerId);
    });

    const cleanupCreatedEntities = async (request: APIRequestContext) => {
      if (repeatedShCheckId) await ignoreCleanupError(() => shipmentsAPI.rollbackShCheck(request, repeatedShCheckId, accessToken));
      if (shCheckId) await ignoreCleanupError(() => shipmentsAPI.rollbackShCheck(request, shCheckId, accessToken));
      if (shipmentId) await ignoreCleanupError(() => shipmentsAPI.deleteShipment(request, shipmentId, accessToken));
      if (productId) await ignoreCleanupError(() => productsAPI.deleteProduct(request, productId, accessToken));
      if (cbedId) await ignoreCleanupError(() => cbedAPI.banCBED(request, cbedId, testUserId, accessToken));
      if (detailId) await ignoreCleanupError(() => detailsAPI.deleteDetail(request, String(detailId), testUserId, accessToken));
      createdEntitiesCleanedUp = true;
    };

    test.afterAll(async ({ request }) => {
      if (!createdEntitiesCleanedUp) await cleanupCreatedEntities(request);
    });

    test('сквозной API-сценарий: от создания изделия до отгрузки', async ({ request }) => {
      let detail: ApiRow | undefined;
      let cbedForSpec: ApiRow;
      let detailForSpec: ApiRow;
      let typeOperation: ApiRow | undefined;
      let assemblyEmployeeId: number;

      await test.step('Создать деталь и техпроцесс металлообработки', async () => {
        const detailCreate = await apiPost(
          request,
          'api/detal',
          multipartData(detailPayload(suffix)),
          accessToken,
          false,
          { accept: '*/*', 'user-id': testUserId },
        );
        expect(successCodes, JSON.stringify(detailCreate.data)).toContain(detailCreate.status);
        detailId = Number(queueData(detailCreate.data)?.id);

        detail = await getFirstMatchingRow(
          () => detailsAPI.getPaginationDetails(request, paginationDto(names.detail), testUserId, accessToken),
          (row) => row.designation === `API-FLOW-D-${suffix}`,
        );
        detailId = detailId || Number(detail?.id);
        expect(detailId).toBeGreaterThan(0);

        const typeOperations = await apiGet(request, 'api/operation/typeoperation/static/metal', accessToken);
        expectNoServerError(typeOperations);
        typeOperation = getRows<ApiRow>(typeOperations.data).find((item) => item.id);
        expect(typeOperation, JSON.stringify(typeOperations.data)).toBeTruthy();

        const techCreate = await apiPost(
          request,
          'api/tech-process/',
          { id: '', izd_type: 'detal', izd_id: detailId, description: `API flow TP ${suffix}`, operationList: '[]', docs: null },
          accessToken,
          true,
        );
        expect(successCodes, JSON.stringify(techCreate.data)).toContain(techCreate.status);
        techProcessId = Number(queueData(techCreate.data)?.id);
        expect(techProcessId).toBeGreaterThan(0);

        const opCreate = await apiPost(
          request,
          'api/operation/operation',
          {
            name: String(typeOperation!.id),
            preTime: '0',
            helperTime: '0',
            mainTime: '1',
            generalCountTime: '1',
            techProcessId: String(techProcessId),
            description: `API flow operation ${suffix}`,
            docs: '[]',
            instrumentList: '[]',
            instrumentMerList: '[]',
            instrumentOsnList: '[]',
            eqList: '[]',
          },
          accessToken,
          true,
        );
        expect(successCodes, JSON.stringify(opCreate.data)).toContain(opCreate.status);
        operationId = Number(queueData(opCreate.data)?.id);
        expect(operationId).toBeGreaterThan(0);

        const techUpdate = await apiPost(
          request,
          'api/tech-process/',
          {
            id: techProcessId,
            izd_type: 'detal',
            izd_id: detailId,
            description: `API flow TP ${suffix}`,
            operationList: JSON.stringify([{ id: operationId }]),
            docs: null,
          },
          accessToken,
          true,
        );
        expect(successCodes, JSON.stringify(techUpdate.data)).toContain(techUpdate.status);
      });

      await test.step('Создать сборочную единицу и изделие со спецификацией', async () => {
        const cbedCreate = await apiPost(
          request,
          'api/cbed/',
          multipartData(cbedPayload(suffix)),
          accessToken,
          false,
          { 'user-id': testUserId },
        );
        expect(successCodes, JSON.stringify(cbedCreate.data)).toContain(cbedCreate.status);
        cbedId = Number(queueData(cbedCreate.data)?.id);
        const cbed = await getFirstMatchingRow(
          () => cbedAPI.getCBEDPagination(request, paginationDto(names.cbed), testUserId, accessToken),
          (row) => row.designation === `API-FLOW-C-${suffix}`,
        );
        cbedId = cbedId || Number(cbed?.id);
        expect(cbedId).toBeGreaterThan(0);
        cbedForSpec = cbed || { id: cbedId, name: names.cbed, designation: `API-FLOW-C-${suffix}` };
        detailForSpec = detail || { id: detailId, name: names.detail, designation: `API-FLOW-D-${suffix}` };

        const productCreate = await apiPost(
          request,
          'api/product/',
          multipartData(productPayload(suffix, cbedForSpec, detailForSpec)),
          accessToken,
        );
        expect(successCodes, JSON.stringify(productCreate.data)).toContain(productCreate.status);
        productId = Number(queueData(productCreate.data)?.id);
        const product = await getFirstMatchingRow(
          () => productsAPI.getAllProducts(request, paginationDto(names.product), accessToken),
          (row) => row.designation === `API-FLOW-P-${suffix}`,
        );
        productId = productId || Number(product?.id);
        expect(product, `Product ${names.product} was not found after create`).toBeTruthy();
        expect(productId).toBeGreaterThan(0);
      });

      await test.step('Проверить, что остатков и дефицитов перед отгрузкой нет', async () => {
        await expectStock(request, 'product', productId, names.product, 0, 0, accessToken);
        await expectStock(request, 'cbed', cbedId, names.cbed, 0, 0, accessToken);
        await expectStock(request, 'detal', detailId, names.detail, 0, 0, accessToken);
        await expectNoDeficitRow(
          () => apiPost(request, 'api/product/deficits', deficitDto(names.product, 'productIds', productId), accessToken),
          (row) => Number(row.id) === productId,
          'У изделия не должно быть дефицита до создания отгрузки',
        );
        await expectNoDeficitRow(
          () => cbedAPI.getCBEDDeficits(request, deficitDto(names.cbed, 'cbedIds', cbedId), accessToken),
          (row) => Number(row.id) === cbedId,
          'У сборочной единицы не должно быть дефицита до запуска в производство',
        );
        await expectNoDeficitRow(
          () => detailsAPI.getDetailDeficits(request, deficitDto(names.detail, 'detalIds', detailId), accessToken),
          (row) => Number(row.id) === detailId,
          'У детали не должно быть дефицита до запуска в производство',
        );
      });

      await test.step('Создать заказ на отгрузку, проверить дефицит изделия и заказ склада', async () => {
        const shipmentCreate = await createShipmentWithFallbacks(request, buyerId, productId, suffix, names.product, accessToken);
        expect(
          successCodes,
          JSON.stringify(
            shipmentCreate.attempts.map((item) => ({
              label: item.label,
              status: item.status,
              data: item.data,
            })),
          ),
        ).toContain(shipmentCreate.response.status);
        shipmentId = Number(queueData(shipmentCreate.response.data)?.id);
        expect(shipmentId).toBeGreaterThan(0);

        const persistedShipment = await eventually(
          async () => {
            const response = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
            return response;
          },
          (response) =>
            hasNoServerError(response) &&
            Number(response.data?.id) === shipmentId &&
            Number(response.data?.productId ?? response.data?.product_id) === productId &&
            Number(response.data?.kol) === 1,
          { attempts: 15, intervalMs: 1000 },
        );
        expect(persistedShipment?.data, `Отгрузка ${shipmentId} не перечиталась после create`).toBeTruthy();
        expect(String(persistedShipment?.data?.status ?? ''), JSON.stringify(persistedShipment?.data)).toBe('Заказано');

        const shipmentList = await shipmentsAPI.getAllShipments(
          request,
          {
            offset: 0,
            status: ['Все'],
            dateRange: { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T23:59:59.999Z' },
            companyId: null,
            searchStr: names.product,
            attributes: ['id', 'productId', 'kol', 'status'],
            sort: [],
          },
          accessToken,
        );
        expectNoServerError(shipmentList);
        expect(successCodes, JSON.stringify(shipmentList.data)).toContain(shipmentList.status);
        expect(getRows<ApiRow>(shipmentList.data).some((row) => Number(row.id) === shipmentId), JSON.stringify(shipmentList.data)).toBe(true);

        const actualShipments = await apiPut(request, 'api/shipments/actual', undefined, accessToken);
        expectNoServerError(actualShipments);
        expect(successCodes, JSON.stringify(actualShipments.data)).toContain(actualShipments.status);

        const productStateAfterShipment = await waitForProductState(request, productId, accessToken);
        expect(productStateAfterShipment, `Изделие ${productId} не получило actual shipment state`).toBeTruthy();
        expect(Number(productStateAfterShipment?.actual_shipment_id ?? 0), JSON.stringify(productStateAfterShipment)).toBeGreaterThan(0);
        expect(Number(productStateAfterShipment?.shipments_kolvo ?? 0), JSON.stringify(productStateAfterShipment)).toBeGreaterThan(0);

        const productDeficit = await waitForDeficit(
          () => apiPost(request, 'api/product/deficits', deficitDto(names.product, 'productIds', productId), accessToken),
          (row) => Number(row.id) === productId,
        );
        expect(
          productDeficit,
          `Нет дефицита изделия после задачи на отгрузку. Состояние: ${JSON.stringify(productStateAfterShipment)}`,
        ).toBeTruthy();
        expect(Number(productDeficit?.deficit ?? -1), JSON.stringify(productDeficit)).toBeLessThan(0);

        const productOrder = await stockOrderAPI.create(
          request,
          {
            workersData: {
              date_order: new Date().toISOString(),
              number_order: `API-FLOW-P-${suffix}`,
              description: `API flow product production ${suffix}`,
              type: 'product',
            },
            workersComplect: [{ my_kolvo: 1, shipments_kolvo: 0, object_id: productId }],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(productOrder.data)).toContain(productOrder.status);
        await expectStockOrder(request, 'product', productId, accessToken);
      });

      await test.step('Проверить дефициты сборочной единицы и детали и создать заказы склада', async () => {
        const cbedDeficit = await waitForDeficit(
          () => cbedAPI.getCBEDDeficits(request, deficitDto(names.cbed, 'cbedIds', cbedId), accessToken),
          (row) => Number(row.id) === cbedId,
        );
        const detailDeficit = await waitForDeficit(
          () => detailsAPI.getDetailDeficits(request, deficitDto(names.detail, 'detalIds', detailId), accessToken),
          (row) => Number(row.id) === detailId,
        );
        expect(cbedDeficit, 'Нет дефицита СЕ после запуска изделия').toBeTruthy();
        expect(detailDeficit, 'Нет дефицита детали после запуска изделия').toBeTruthy();
        expect(Number(cbedDeficit?.deficit ?? -1), JSON.stringify(cbedDeficit)).toBeLessThan(0);
        expect(Number(detailDeficit?.deficit ?? -1), JSON.stringify(detailDeficit)).toBeLessThan(0);

        const cbedOrder = await stockOrderAPI.create(
          request,
          {
            workersData: { date_order: new Date().toISOString(), number_order: `API-FLOW-C-${suffix}`, description: '', type: 'cbed' },
            workersComplect: [{ my_kolvo: 1, shipments_kolvo: 0, object_id: cbedId }],
          },
          accessToken,
        );
        const detailOrder = await stockOrderAPI.create(
          request,
          {
            workersData: { date_order: new Date().toISOString(), number_order: `API-FLOW-D-${suffix}`, description: '', type: 'detal' },
            workersComplect: [{ my_kolvo: 1, shipments_kolvo: 0, object_id: detailId }],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(cbedOrder.data)).toContain(cbedOrder.status);
        expect(successCodes, JSON.stringify(detailOrder.data)).toContain(detailOrder.status);
        await expectStockOrder(request, 'cbed', cbedId, accessToken);
        await expectStockOrder(request, 'detal', detailId, accessToken);
      });

      await test.step('Изготовить деталь и проверить: на складе 1, в наборах 0', async () => {
        const metalPlan = await getFirstMatchingRow(
          () => productionTasksAPI.getPlanForProductionTask(request, productionPlanDto('metall', names.detail), accessToken),
          (row) => Number(row.detal_id ?? row.detalId ?? row.id) === detailId || row.name === names.detail,
        );
        metaloworkingId = Number(metalPlan?.id);
        expect(metaloworkingId).toBeGreaterThan(0);

        const selectedEquipmentId = await findValidEquipmentId(request, Number(typeOperation!.id), accessToken);
        expect(selectedEquipmentId).toBeGreaterThan(0);

        const metalTask = await productionTasksAPI.createProductionTask(
          request,
          {
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            typeWork: 'metall',
            details_filters: {},
            description: `API flow metal task ${suffix}`,
            productionOperationPos: [
              {
                id: metaloworkingId,
                idx: 0,
                quantity: 1,
                operationPositions: [{ operationId, employeeId: Number(API_CONST.API_TEST_USER_ID_72), equipmentId: selectedEquipmentId }],
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(metalTask.data)).toContain(metalTask.status);

        const markMetal = await apiPost(
          request,
          'api/marks/mark',
          {
            oper_id: operationId,
            user_id: Number(API_CONST.API_TEST_USER_ID_72),
            kol: 1,
            brak: false,
            description: `API flow metal mark ${suffix}`,
            date_build: new Date().toISOString(),
            metaloworking_id: metaloworkingId,
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(markMetal.data)).toContain(markMetal.status);

        const detailComing = await apiPost(
          request,
          'api/waybill/create',
          {
            typeComing: 'Металлообработка',
            description: `API flow detail incoming ${suffix}`,
            sclad: true,
            documentsIds: [],
            productList: [
              {
                entityType: 'detal',
                workerType: 'Металлообработка',
                detalId: detailId,
                metalloworkingId: metaloworkingId,
                quantity: 1,
                ezId: 1,
                unitType: 1,
                sum: 0,
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(detailComing.data)).toContain(detailComing.status);
        await expectStock(request, 'detal', detailId, names.detail, 1, 0, accessToken);
      });

      await test.step('Собрать сборочную единицу и проверить: СЕ на складе 1, деталь на складе 1, в наборах 0', async () => {
        const cbedAssPlan = await getFirstMatchingRow(
          () => productionTasksAPI.getPlanForProductionTask(request, productionPlanDto('ass', names.cbed), accessToken),
          (row) => Number(row.cbed_id ?? row.cbedId ?? row.id) === cbedId || row.name === names.cbed,
        );
        assembleCbedId = planAssembleId(cbedAssPlan) || cbedId;
        const cbedTech = await cbedAPI.getTechByCBEDId(request, cbedId, accessToken);
        expectNoServerError(cbedTech);
        const cbedAssOperationId =
          findOperationIdByName(cbedAssPlan, [/Комплектац/i]) ||
          findOperationIdByName(cbedTech.data, [/Комплектац/i]) ||
          findOperationIdForTask(cbedAssPlan) ||
          findOperationIdForTask(cbedTech.data);
        assemblyEmployeeId = Number(API_CONST.API_TEST_USER_ID_72);
        expect(cbedAssPlan, `Не найдена плановая сборка для СЕ ${cbedId}`).toBeTruthy();
        expect(assembleCbedId, JSON.stringify(cbedAssPlan)).toBeGreaterThan(0);
        expect(cbedAssOperationId, `Не найдена операция сборки для СЕ: ${JSON.stringify(cbedAssPlan)}`).toBeGreaterThan(0);
        const cbedAssemblyOperationId = Number(cbedAssOperationId);

        const assTask = await productionTasksAPI.createProductionTask(
          request,
          {
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            typeWork: 'ass',
            details_filters: {},
            description: `API flow assembly task ${suffix}`,
            productionOperationPos: [
              {
                id: assembleCbedId,
                idx: 0,
                quantity: 1,
                operationPositions: [{ operationId: cbedAssemblyOperationId, employeeId: assemblyEmployeeId, equipmentId: null }],
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(assTask.data)).toContain(assTask.status);
        const assTaskId = Number(queueData(assTask.data)?.id);
        expect(assTaskId, JSON.stringify(assTask.data)).toBeGreaterThan(0);

        const cbedKit = await apiPost(
          request,
          'api/assemble/complectkit/create',
          {
            kolvoCollected: 1,
            assembleId: assembleCbedId,
            shipmentsIds: [],
            listCbed: compressSpec([]),
            listDetal: compressSpec([]),
            listPokDet: compressSpec([]),
            materialList: compressSpec([]),
            actionSendlerId: Number(testUserId),
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(cbedKit.data)).toContain(cbedKit.status);
        cbedKitId = await expectComplectKitId(request, cbedAssemblyOperationId, assembleCbedId, accessToken);

        const cbedComing = await apiPost(
          request,
          'api/waybill/create',
          {
            typeComing: 'Сборка',
            description: `API flow cbed incoming ${suffix}`,
            sclad: true,
            documentsIds: [],
            productList: [
              {
                entityType: 'cbed',
                workerType: 'Сборка',
                cbedId,
                assembleId: assembleCbedId,
                quantity: 1,
                ezId: 1,
                unitType: 1,
                sum: 0,
                kitsSelected: cbedKitId ? [{ id: cbedKitId, count_to_received: 1 }] : [],
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(cbedComing.data)).toContain(cbedComing.status);
        await expectStock(request, 'cbed', cbedId, names.cbed, 1, 0, accessToken);
        await expectStock(request, 'detal', detailId, names.detail, 1, 0, accessToken);
      });

      await test.step('Скомплектовать изделие и проверить: деталь и СЕ на складе 1, в наборах 1', async () => {
        const productAssPlan = await getFirstMatchingRow(
          () => productionTasksAPI.getPlanForProductionTask(request, productionPlanDto('ass', names.product), accessToken),
          (row) => Number(row.product_id ?? row.productId ?? row.id) === productId || row.name === names.product,
        );
        assembleProductId = planAssembleId(productAssPlan) || productId;
        const productTech = await apiGet(request, `api/product/tech_by_id_product/${productId}`, accessToken);
        expectNoServerError(productTech);
        const productComplectOperationId =
          findOperationIdByName(productAssPlan, [/Комплектац/i]) ||
          findOperationIdByName(productTech.data, [/Комплектац/i]);
        const productPackagingOperationId =
          findOperationIdByName(productAssPlan, [/Упаков/i]) ||
          findOperationIdByName(productTech.data, [/Упаков/i]);
        expect(productAssPlan, `Не найдена плановая сборка для изделия ${productId}`).toBeTruthy();
        expect(assembleProductId, JSON.stringify(productAssPlan)).toBeGreaterThan(0);
        expect(productComplectOperationId, `Не найдена операция комплектации изделия: ${JSON.stringify(productTech.data)}`).toBeGreaterThan(0);
        expect(productPackagingOperationId, `Не найдена операция упаковки изделия: ${JSON.stringify(productTech.data)}`).toBeGreaterThan(0);
        const productAssemblyComplectOperationId = Number(productComplectOperationId);
        const productAssemblyPackagingOperationId = Number(productPackagingOperationId);

        const productAssTask = await productionTasksAPI.createProductionTask(
          request,
          {
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            typeWork: 'ass',
            details_filters: {},
            description: `API flow product assembly task ${suffix}`,
            productionOperationPos: [
              {
                id: assembleProductId,
                idx: 1,
                quantity: 1,
                operationPositions: [
                  { operationId: productAssemblyComplectOperationId, employeeId: assemblyEmployeeId, equipmentId: null },
                  { operationId: productAssemblyPackagingOperationId, employeeId: assemblyEmployeeId, equipmentId: null },
                ],
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(productAssTask.data)).toContain(productAssTask.status);

        const productKit = await apiPost(
          request,
          'api/assemble/complectkit/create',
          {
            kolvoCollected: 1,
            assembleId: assembleProductId,
            shipmentsIds: [],
            listCbed: compressSpec([specItem(cbedForSpec)]),
            listDetal: compressSpec([specItem(detailForSpec)]),
            listPokDet: compressSpec([]),
            materialList: compressSpec([]),
            actionSendlerId: Number(testUserId),
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(productKit.data)).toContain(productKit.status);
        const productKitId = await expectComplectKitId(
          request,
          productAssemblyComplectOperationId,
          assembleProductId,
          accessToken,
        );

        await expectStock(request, 'product', productId, names.product, 0, 0, accessToken);
        await expectStock(request, 'cbed', cbedId, names.cbed, 1, 1, accessToken);
        await expectStock(request, 'detal', detailId, names.detail, 1, 1, accessToken);

        const markPackaging = await apiPost(
          request,
          'api/marks/mark',
          {
            oper_id: productAssemblyPackagingOperationId,
            user_id: Number(API_CONST.API_TEST_USER_ID_72),
            kol: 1,
            brak: false,
            description: `API flow package mark ${suffix}`,
            date_build: new Date().toISOString(),
            assemble_id: assembleProductId,
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(markPackaging.data)).toContain(markPackaging.status);
        await expectOperationMark(request, productAssemblyPackagingOperationId, assembleProductId, accessToken);

        const productComing = await apiPost(
          request,
          'api/waybill/create',
          {
            typeComing: 'Сборка',
            description: `API flow product incoming ${suffix}`,
            sclad: true,
            documentsIds: [],
            productList: [
              {
                entityType: 'product',
                workerType: 'Сборка',
                productId,
                assembleId: assembleProductId,
                quantity: 1,
                ezId: 1,
                unitType: 1,
                sum: 0,
                kitsSelected: productKitId ? [{ id: productKitId, count_to_received: 1 }] : [],
              },
            ],
          },
          accessToken,
        );
        expect(successCodes, JSON.stringify(productComing.data)).toContain(productComing.status);
        await expectStock(request, 'product', productId, names.product, 1, 0, accessToken);
        await expectStock(request, 'cbed', cbedId, names.cbed, 0, 0, accessToken);
        await expectStock(request, 'detal', detailId, names.detail, 0, 0, accessToken);
      });

      await test.step('Оприходовать и отгрузить изделие, проверить финальные остатки и наборы', async () => {
        const shipmentForShCheck = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
        expectNoServerError(shipmentForShCheck);
        expect(Number(shipmentForShCheck.data?.productId), JSON.stringify(shipmentForShCheck.data)).toBe(productId);
        expect(Number(shipmentForShCheck.data?.kol), JSON.stringify(shipmentForShCheck.data)).toBe(1);

        const shCheckPayload = {
          dateOrder: shipmentForShCheck.data.date_order,
          numberOrder: shipmentForShCheck.data.number_order,
          dateShipments: dateToTimestampFormat(shipmentForShCheck.data.date_shipments),
          fabricNumber:
            shipmentForShCheck.data.fabric_number ||
            shipmentForShCheck.data.product?.designation ||
            `API-FLOW-P-${suffix}`,
          description: `API flow shcheck ${suffix}`,
          nameCheck: `API flow shcheck ${shipmentId}`,
          responsibleUserId: String(API_CONST.API_TEST_USER_ID_72),
          createrUserId: String(API_CONST.API_CREATOR_USER_ID_66),
          dateCreate: new Date().toISOString(),
          dateShipmentsFakt: dateToTimestampFormat(new Date()),
          docs: JSON.stringify([]),
          childrens: JSON.stringify([{ id: shipmentId, shipped: 1, builderId: null, controllerId: null }]),
          companyId: String(shipmentForShCheck.data.company_id || shipmentForShCheck.data.buyer_id || buyerId),
        };
        const shCheck = await createShCheckWithFallback(request, shCheckPayload, accessToken);
        expect(
          successCodes,
          JSON.stringify({ response: shCheck.data, payload: shCheckPayload }),
        ).toContain(shCheck.status);
        shCheckId = Number(queueData(shCheck.data)?.id);
        expect(shCheckId, JSON.stringify(shCheck.data)).toBeGreaterThan(0);

        const shippedShipment = await eventually(
          async () => {
            const response = await shipmentsAPI.getShipmentById(request, shipmentId, accessToken);
            return response;
          },
          (response) =>
            hasNoServerError(response) &&
            Number(response.data?.shipped ?? 0) >= 1 &&
            String(response.data?.status ?? '') === 'Отгружено',
          { attempts: 15, intervalMs: 1000 },
        );
        expect(shippedShipment?.data, `Отгрузка ${shipmentId} не перешла в shipped-состояние`).toBeTruthy();
        expect(Number(shippedShipment?.data?.shipped ?? 0), JSON.stringify(shippedShipment?.data)).toBe(1);
        expect(String(shippedShipment?.data?.status ?? ''), JSON.stringify(shippedShipment?.data)).toBe('Отгружено');

        await expectStock(request, 'product', productId, names.product, 0, 0, accessToken);
        await expectStock(request, 'cbed', cbedId, names.cbed, 0, 0, accessToken);
        await expectStock(request, 'detal', detailId, names.detail, 0, 0, accessToken);
        await expectNoDeficitRow(
          () => apiPost(request, 'api/product/deficits', deficitDto(names.product, 'productIds', productId), accessToken),
          (row) => Number(row.id) === productId,
          'У изделия не должно остаться дефицита после отгрузки',
        );
        await expectNoDeficitRow(
          () => cbedAPI.getCBEDDeficits(request, deficitDto(names.cbed, 'cbedIds', cbedId), accessToken),
          (row) => Number(row.id) === cbedId,
          'У сборочной единицы не должно остаться дефицита после отгрузки',
        );
        await expectNoDeficitRow(
          () => detailsAPI.getDetailDeficits(request, deficitDto(names.detail, 'detalIds', detailId), accessToken),
          (row) => Number(row.id) === detailId,
          'У детали не должно остаться дефицита после отгрузки',
        );

        const secondShCheck = await createShCheckWithFallback(request, shCheckPayload, accessToken);
        expectNoServerError(secondShCheck);
        repeatedShCheckId = Number(queueData(secondShCheck.data)?.id) || 0;
        expectRepeatOperationRejectedOrIdempotent(shCheck.status, secondShCheck.status, successCodes, [400, 404, 409, 410, 422]);
        await cleanupCreatedEntities(request);
      });
    });
  });
};
