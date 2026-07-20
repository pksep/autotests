import { test, expect } from '@playwright/test';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { DeliveriesAPI } from '../../pages/API/APIDeliveries';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { WaybillAPI } from '../../pages/API/APIWaybill';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import {
  expectNonNegativeQuantities,
  expectRepeatOperationRejectedOrIdempotent,
  expectRowLinkedToEntity,
  readNumber,
} from '../../lib/helpers/APIDataInvariants';

type ApiRow = Record<string, any>;

const companiesAPI = new CompaniesAPI(null);
const deliveriesAPI = new DeliveriesAPI(null);
const materialsAPI = new MaterialsAPI(null as any);
const waybillAPI = new WaybillAPI(null);

const PROVIDER_TYPE = 'Поставщики';

const companyPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  isSortedByAttention: false,
  isSortedByDate: true,
  filterByTypes: [],
  isFilteredByInboundSupplier: false,
  isBan: false,
  filterByEntities: {
    materialIds: [],
    equipmentIds: [],
    instrumentIds: [],
    inventaryIds: [],
  },
  ...overrides,
});

const materialPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  instans: 1,
  searchString: '',
  typeMaterialId: null,
  subtypeMaterialId: null,
  filterByAttention: false,
  filterByTime: true,
  ...overrides,
});

const deliveryPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  searchString: '',
  dateRange: null,
  status: [],
  ...overrides,
});

const waybillPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeComing: null,
  ...overrides,
});

const typeCharacteristics = () => ({
  length: { edizmId: 6, znach: null, shortName: 'mm' },
  width: { edizmId: 6, znach: null, shortName: 'mm' },
  height: { edizmId: 6, znach: null, shortName: 'mm' },
  wallThickness: { edizmId: 6, znach: null, shortName: 'mm' },
  outsideDiameter: { edizmId: 6, znach: null, shortName: 'mm' },
  thickness: { edizmId: 6, znach: null, shortName: 'mm' },
  areaCrossSectional: { edizmId: 8, znach: null, shortName: 'm2' },
});

const materialCharacteristics = () => ({
  density: { used: true, znach: 8, edizmId: 9, shortName: 'kg/m3' },
  length: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  width: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  height: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  wallThickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  outsideDiameter: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  thickness: { used: false, znach: 0, edizmId: 6, shortName: 'mm' },
  areaCrossSectional: { used: false, znach: 0, edizmId: 8, shortName: 'm2' },
});

const materialPayload = (
  suffix: string,
  rootParentId: number,
  subtypeMaterialId: number,
  overrides: Record<string, unknown> = {},
) => ({
  id: undefined,
  name: `API Waybill Provider Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created for Waybill provider flow ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Waybill Provider Material Alias ${suffix}`, default: true }],
  ...overrides,
});

const companyPayload = (suffix: string, materialIds: number[]) => ({
  name: `API Waybill Provider Company ${suffix}`,
  inn: `78${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `78${Math.floor(1000000 + Math.random() * 8999999)}`,
  type: ['provider'],
  description: `Created for Waybill provider flow ${suffix}`,
  attention: false,
  requisites: [],
  documentIds: [],
  contactIds: [],
  materialIds,
  equipmentIds: [],
  instrumentIds: [],
  inventaryIds: [],
});

const deliveryPayload = (
  suffix: string,
  companyId: number,
  materialId: number,
  unitMeasurementId: number,
) => ({
  companyId,
  numberCheck: `API-WB-CHK-${suffix}`,
  nds: 20,
  count: 1,
  positions: [
    {
      entityType: 'material',
      materialId,
      unitMeasurementId,
      plannedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      orderedQuantity: 1,
      totalAmount: 100,
      description: `API waybill provider delivery position ${suffix}`,
    },
  ],
  documentsIds: [],
  dateShipments: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  description: `Created for Waybill provider flow ${suffix}`,
});

const waybillPayload = (
  suffix: string,
  companyId: number,
  materialId: number,
  unitMeasurementId: number,
  deliveryId: number,
  deliveryPositionId: number,
) => ({
  typeComing: PROVIDER_TYPE,
  description: `API waybill provider flow ${suffix}`,
  sclad: false,
  companyId,
  documentsIds: [],
  productList: [
    {
      entityType: 'material',
      workerType: PROVIDER_TYPE,
      materialId,
      companyId,
      deliveryId,
      deliveryPositionId,
      quantity: 1,
      ezId: unitMeasurementId,
      unitType: unitMeasurementId,
      sum: 100,
      description: `API waybill provider flow position ${suffix}`,
    },
  ],
});

const getMaterialUnitId = (material: ApiRow): number => {
  const units = Array.isArray(material.units_measurement) ? material.units_measurement : [];
  const unit = units.find((item: ApiRow) => Number(item.unitTypeId ?? item.id) > 0);
  return Number(unit?.unitTypeId ?? unit?.id);
};

const createIsolatedMaterial = async (
  request: any,
  suffix: string,
  accessToken?: string,
): Promise<{ material: ApiRow; typeId: number; subtypeId: number }> => {
  const typeResponse = await materialsAPI.createTypeMaterial(
    request,
    { name: `API Waybill Provider Type Material ${suffix}`, characteristics: typeCharacteristics(), instance_type: 1 },
    accessToken,
  );
  expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
  expectNoServerError(typeResponse);
  const typeId = Number(typeResponse.data?.id);
  expect(typeId, JSON.stringify(typeResponse.data)).toBeGreaterThan(0);

  const subtypeResponse = await materialsAPI.createSubtypeMaterial(
    request,
    {
      name: `API Waybill Provider Subtype Material ${suffix}`,
      density: 8,
      id: null,
      instance_type: 1,
      parentMaterialIds: [typeId],
    },
    accessToken,
  );
  expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
  expectNoServerError(subtypeResponse);
  const subtypeId = Number(subtypeResponse.data?.id);
  expect(subtypeId, JSON.stringify(subtypeResponse.data)).toBeGreaterThan(0);

  const materialName = `API Waybill Provider Material ${suffix}`;
  const createMaterial = await materialsAPI.createAndUpdateMaterial(
    request,
    materialPayload(suffix, typeId, subtypeId),
    accessToken,
  );
  expect(successCodes, JSON.stringify(createMaterial.data)).toContain(createMaterial.status);
  expectNoServerError(createMaterial);

  const materialSearch = await eventually(async () => {
    const response = await materialsAPI.getMaterialsPagination(
      request,
      materialPaginationDto({ searchString: materialName }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === materialName && row.ban !== true));

  const material = materialSearch
    ? getRows<ApiRow>(materialSearch.data).find((row) => row.name === materialName && row.ban !== true)
    : undefined;
  expect(material, `Material ${materialName} was not found after create`).toBeTruthy();

  const materialId = Number(createMaterial.data?.id ?? material?.id);
  expect(materialId, JSON.stringify(createMaterial.data)).toBeGreaterThan(0);
  return { material: { ...(material as ApiRow), id: materialId, name: materialName }, typeId, subtypeId };
};

const getDeliveryPosition = async (
  request: any,
  deliveryId: number,
  materialId: number,
  accessToken?: string,
) => {
  const positions = await deliveriesAPI.getDeliveryPositions(request, deliveryId, accessToken);
  expectNoServerError(positions);
  expect(successCodes, JSON.stringify(positions.data)).toContain(positions.status);

  return getRows<ApiRow>(positions.data?.delivery_positions).find((position) => {
    return Number(position.entityId) === materialId && position.type === 'material';
  });
};

const findWaybillForDelivery = async (
  request: any,
  materialName: string,
  deliveryId: number,
  deliveryNumberOrder: string,
  accessToken?: string,
) => {
  const response = await eventually(async () => {
    const page = await waybillAPI.getWaybillPagination(
      request,
      waybillPaginationDto({ searchString: materialName, typeComing: [PROVIDER_TYPE] }),
      accessToken,
    );
    expectNoServerError(page);
    return page;
  }, (page) => getRows<ApiRow>(page.data).some((row) => {
    const linkedDeliveryId = Number(row.deliveryLink?.deliveryId ?? row.deliveryLink?.delivery_id);
    return linkedDeliveryId === deliveryId || row.order_number === deliveryNumberOrder;
  }), { attempts: 12, intervalMs: 1000 });

  return response
    ? getRows<ApiRow>(response.data).find((row) => {
        const linkedDeliveryId = Number(row.deliveryLink?.deliveryId ?? row.deliveryLink?.delivery_id);
        return linkedDeliveryId === deliveryId || row.order_number === deliveryNumberOrder;
      })
    : undefined;
};

export const runWaybillProviderFlowAPI = () => {
  logger.info('Starting Waybill Provider Flow API suite');

  test.describe.serial('Waybill Provider Flow API: заказ поставщику и приход материала', () => {
    test.describe.configure({ timeout: 180000 });

    let accessToken: string | undefined;
    let suffix = '';
    let materialId: number | undefined;
    let materialName = '';
    let materialTypeId: number | undefined;
    let materialSubtypeId: number | undefined;
    let unitMeasurementId: number | undefined;
    let companyId: number | undefined;
    let deliveryId: number | undefined;
    let deliveryPositionId: number | undefined;
    let deliveryNumberOrder = '';
    let waybillId: number | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (waybillId) {
        const archiveWaybill = await waybillAPI.deleteWaybill(request, waybillId, accessToken);
        expectNoServerError(archiveWaybill);
      }
      if (deliveryId) {
        const archiveDelivery = await deliveriesAPI.banDelivery(request, deliveryId, accessToken);
        expectNoServerError(archiveDelivery);
      }
      if (companyId) {
        const archiveCompany = await companiesAPI.banCompany(request, companyId, accessToken);
        expectNoServerError(archiveCompany);
      }
      if (materialId) {
        const archiveMaterial = await materialsAPI.banMaterial(request, materialId, accessToken);
        expectNoServerError(archiveMaterial);
      }
      if (materialSubtypeId) {
        const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, materialSubtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }
      if (materialTypeId) {
        const archiveType = await materialsAPI.removeTypeMaterial(request, materialTypeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('подготавливает материал, компанию и заказ поставщику', async ({ request }) => {
      suffix = uniqueApiSuffix('waybill-provider');

      const materialFixture = await createIsolatedMaterial(request, suffix, accessToken);
      materialId = Number(materialFixture.material.id);
      materialName = String(materialFixture.material.name);
      materialTypeId = materialFixture.typeId;
      materialSubtypeId = materialFixture.subtypeId;
      unitMeasurementId = getMaterialUnitId(materialFixture.material);
      expect(materialId).toBeGreaterThan(0);
      expect(unitMeasurementId).toBeGreaterThan(0);

      const companyName = `API Waybill Provider Company ${suffix}`;
      const createCompany = await companiesAPI.createCompany(request, companyPayload(suffix, [materialId]), accessToken);
      expectNoServerError(createCompany);
      expect(successCodes, JSON.stringify(createCompany.data)).toContain(createCompany.status);
      companyId = Number(createCompany.data?.id);
      expect(companyId, JSON.stringify(createCompany.data)).toBeGreaterThan(0);

      const company = await eventually(async () => {
        const response = await companiesAPI.getCompaniesPagination(
          request,
          companyPaginationDto({ searchString: companyName, filterByTypes: ['provider'] }),
          accessToken,
        );
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === companyId));
      expect(company, `Provider company ${companyName} was not found after create`).toBeTruthy();

      const createDelivery = await deliveriesAPI.createDelivery(
        request,
        deliveryPayload(suffix, companyId as number, materialId, unitMeasurementId as number),
        accessToken,
      );
      expectNoServerError(createDelivery);
      expect(successCodes, JSON.stringify(createDelivery.data)).toContain(createDelivery.status);
      deliveryId = Number(createDelivery.data?.id);
      expect(deliveryId, JSON.stringify(createDelivery.data)).toBeGreaterThan(0);

      const deliveryById = await deliveriesAPI.getDeliveryById(request, deliveryId, accessToken);
      expectNoServerError(deliveryById);
      expect(successCodes, JSON.stringify(deliveryById.data)).toContain(deliveryById.status);
      deliveryNumberOrder = String(deliveryById.data?.number_order || '');
      expect(deliveryNumberOrder, JSON.stringify(deliveryById.data)).toBeTruthy();

      const position = await getDeliveryPosition(request, deliveryId, materialId, accessToken);
      expect(position, `Delivery position for material ${materialId} was not found`).toBeTruthy();
      expectRowLinkedToEntity(position as ApiRow, 'material', materialId);
      expectNonNegativeQuantities([position as ApiRow], ['orderedQuantity', 'ordered_quantity', 'quantity', 'count', 'totalAmount', 'total_amount']);
      deliveryPositionId = Number(position!.deliveryPositionId);
      expect(deliveryPositionId).toBeGreaterThan(0);
    });

    test('создает накладную прихода от поставщика и связывает ее с заказом', async ({ request }) => {
      test.skip(!companyId || !materialId || !unitMeasurementId || !deliveryId || !deliveryPositionId, 'Provider flow setup was not completed.');

      const createWaybill = await waybillAPI.createWaybill(
        request,
        waybillPayload(
          suffix,
          companyId as number,
          materialId as number,
          unitMeasurementId as number,
          deliveryId as number,
          deliveryPositionId as number,
        ),
        accessToken,
      );
      expectNoServerError(createWaybill);
      expect(successCodes, JSON.stringify(createWaybill.data)).toContain(createWaybill.status);

      const waybill = await findWaybillForDelivery(
        request,
        materialName,
        deliveryId as number,
        deliveryNumberOrder,
        accessToken,
      );
      expect(waybill, `Waybill for delivery ${deliveryId} was not found`).toBeTruthy();
      waybillId = Number(waybill!.id);
      expect(waybillId).toBeGreaterThan(0);
      expect(waybill!.type_сoming, JSON.stringify(waybill)).toBe(PROVIDER_TYPE);
      expect(waybill!.order_number, JSON.stringify(waybill)).toBe(deliveryNumberOrder);
      expectNonNegativeQuantities([waybill as ApiRow]);
      const linkedDeliveryId = readNumber(waybill as ApiRow, ['delivery_id', 'deliveryId']);
      const nestedLinkedDeliveryId = Number(waybill!.deliveryLink?.deliveryId ?? waybill!.deliveryLink?.delivery_id);
      expect(
        linkedDeliveryId === deliveryId || nestedLinkedDeliveryId === deliveryId,
        `Waybill ${waybillId} is not linked to delivery ${deliveryId}: ${JSON.stringify(waybill)}`,
      ).toBe(true);

      const materialAfterWaybill = await materialsAPI.getMaterialById(request, materialId as number, true, accessToken);
      expectNoServerError(materialAfterWaybill);
      expect(successCodes, JSON.stringify(materialAfterWaybill.data)).toContain(materialAfterWaybill.status);
      expect(Number(materialAfterWaybill.data?.id), JSON.stringify(materialAfterWaybill.data)).toBe(materialId);
      expect(materialAfterWaybill.data?.ban, JSON.stringify(materialAfterWaybill.data)).not.toBe(true);

      const deliveryAfterWaybill = await deliveriesAPI.getDeliveryById(request, deliveryId as number, accessToken);
      expectNoServerError(deliveryAfterWaybill);
      expect(successCodes, JSON.stringify(deliveryAfterWaybill.data)).toContain(deliveryAfterWaybill.status);
      expect(Number(deliveryAfterWaybill.data?.id), JSON.stringify(deliveryAfterWaybill.data)).toBe(deliveryId);

      const positionAfterWaybill = await getDeliveryPosition(request, deliveryId as number, materialId as number, accessToken);
      expect(positionAfterWaybill, `Delivery position ${deliveryPositionId} disappeared after waybill create`).toBeTruthy();
      expectRowLinkedToEntity(positionAfterWaybill as ApiRow, 'material', materialId as number);
    });

    test('читает, обновляет и архивирует созданную накладную', async ({ request }) => {
      test.skip(!waybillId, 'Waybill was not created.');

      const byId = await waybillAPI.getWaybillById(request, waybillId as number, accessToken);
      expectNoServerError(byId);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expect(byId.data?.id, JSON.stringify(byId.data)).toBe(waybillId);

      const updatedDescription = `API waybill provider flow updated ${suffix}`;
      const update = await waybillAPI.updateWaybill(
        request,
        { waybillId, description: updatedDescription, typeComing: PROVIDER_TYPE, documentsIds: [] },
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

      const updated = await waybillAPI.getWaybillById(request, waybillId as number, accessToken);
      expectNoServerError(updated);
      expect(successCodes, JSON.stringify(updated.data)).toContain(updated.status);
      expect(updated.data?.description, JSON.stringify(updated.data)).toBe(updatedDescription);

      const archive = await waybillAPI.deleteWaybill(request, waybillId as number, accessToken);
      expectNoServerError(archive);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      if (archive.data && typeof archive.data === 'object') {
        expect(archive.data.ban, JSON.stringify(archive.data)).toBe(true);
      }

      const archivedById = await waybillAPI.getWaybillById(request, waybillId as number, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status)) {
        expect(successCodes, JSON.stringify(archivedById.data)).toContain(archivedById.status);
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(waybillId);
        expect(archivedById.data?.ban ?? true, JSON.stringify(archivedById.data)).toBe(true);
      }

      const updateArchived = await waybillAPI.updateWaybill(
        request,
        { waybillId, description: `API waybill provider flow archived update ${suffix}`, typeComing: PROVIDER_TYPE, documentsIds: [] },
        accessToken,
      );
      expectNoServerError(updateArchived);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(updateArchived.data)).toContain(updateArchived.status);
      if (successCodes.includes(updateArchived.status)) {
        expect(Number(updateArchived.data?.id), JSON.stringify(updateArchived.data)).toBe(waybillId);
        expect(updateArchived.data?.ban ?? true, JSON.stringify(updateArchived.data)).toBe(true);
      }

      const secondArchive = await waybillAPI.deleteWaybill(request, waybillId as number, accessToken);
      expectNoServerError(secondArchive);
      expectRepeatOperationRejectedOrIdempotent(archive.status, secondArchive.status, successCodes, [400, 404, 409, 410, 422]);
      waybillId = undefined;
    });

    test('архивирует заказ поставщику и компанию', async ({ request }) => {
      expect(deliveryId).toBeTruthy();
      const archiveDelivery = await deliveriesAPI.banDelivery(request, deliveryId as number, accessToken);
      expectNoServerError(archiveDelivery);
      expect(successCodes, JSON.stringify(archiveDelivery.data)).toContain(archiveDelivery.status);

      const archivePage = await deliveriesAPI.getDeliveriesPagination(
        request,
        deliveryPaginationDto({ searchString: deliveryNumberOrder, status: ['archive'] }),
        accessToken,
      );
      expectNoServerError(archivePage);
      if (!clientErrorCodes.includes(archivePage.status)) {
        expect(successCodes).toContain(archivePage.status);
        expect(getRows<ApiRow>(archivePage.data).some((row) => row.id === deliveryId), JSON.stringify(archivePage.data)).toBe(true);
      }
      deliveryId = undefined;

      expect(companyId).toBeTruthy();
      const archiveCompany = await companiesAPI.banCompany(request, companyId as number, accessToken);
      expectNoServerError(archiveCompany);
      if (!clientErrorCodes.includes(archiveCompany.status)) {
        expect(successCodes).toContain(archiveCompany.status);
      }
      companyId = undefined;

      expect(materialId).toBeTruthy();
      const archiveMaterial = await materialsAPI.banMaterial(request, materialId as number, accessToken);
      expectNoServerError(archiveMaterial);
      if (!clientErrorCodes.includes(archiveMaterial.status)) {
        expect(successCodes).toContain(archiveMaterial.status);
      }
      materialId = undefined;

      if (materialSubtypeId) {
        const archiveSubtype = await materialsAPI.removeSubtypeMaterial(request, materialSubtypeId, accessToken);
        expectNoServerError(archiveSubtype);
        materialSubtypeId = undefined;
      }
      if (materialTypeId) {
        const archiveType = await materialsAPI.removeTypeMaterial(request, materialTypeId, accessToken);
        expectNoServerError(archiveType);
        materialTypeId = undefined;
      }
    });
  });
};
