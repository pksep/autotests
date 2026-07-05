import { test, expect } from '@playwright/test';
import { CompaniesAPI } from '../../pages/API/APICompanies';
import { DeliveriesAPI } from '../../pages/API/APIDeliveries';
import { DocumentsAPI } from '../../pages/API/APIDocuments';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectClientError, expectPaginationContract, getCount, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const companiesAPI = new CompaniesAPI(null);
const deliveriesAPI = new DeliveriesAPI(null);
const documentsAPI = new DocumentsAPI(null);
const materialsAPI = new MaterialsAPI(null as any);

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

const deliveryPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  searchString: '',
  dateRange: null,
  status: [],
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
  name: `API Delivery Material ${suffix}`,
  rootParentId,
  subtypeMaterialId,
  deliveryTime: 0,
  description: `Created for Deliveries API autotest ${suffix}`,
  attention: false,
  units_measurement: [{ unitTypeId: 1, convertRate: 1, isBase: true }],
  characteristics: materialCharacteristics(),
  companyIds: '[]',
  file_base: '[]',
  material_aliases: [{ alias: `API Delivery Material Alias ${suffix}`, default: true }],
  ...overrides,
});

const companyPayload = (suffix: string, materialIds: number[] = [], overrides: Record<string, unknown> = {}) => ({
  name: `API Delivery Provider Company ${suffix}`,
  inn: `79${Math.floor(100000000 + Math.random() * 899999999)}`,
  cpp: `79${Math.floor(1000000 + Math.random() * 8999999)}`,
  type: ['provider'],
  description: `Created for Deliveries API autotest ${suffix}`,
  attention: false,
  requisites: [],
  documentIds: [],
  contactIds: [],
  materialIds,
  equipmentIds: [],
  instrumentIds: [],
  inventaryIds: [],
  ...overrides,
});

const deliveryPayload = (
  suffix: string,
  companyId: number,
  materialId: number,
  unitMeasurementId: number,
  overrides: Record<string, unknown> = {},
) => ({
  companyId,
  numberCheck: `API-CHK-${suffix}`,
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
      description: `API delivery position ${suffix}`,
    },
  ],
  documentsIds: [],
  dateShipments: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  description: `Created by API autotest ${suffix}`,
  ...overrides,
});

const getMaterialUnitId = (material: ApiRow): number => {
  const units = Array.isArray(material.units_measurement) ? material.units_measurement : [];
  const unit = units.find((item: ApiRow) => Number(item.unitTypeId ?? item.id) > 0);
  return Number(unit?.unitTypeId ?? unit?.id);
};

export const runProviderDeliveriesAPINew = () => {
  logger.info('Starting Deliveries API coverage suite');

  test.describe.serial('Deliveries API: базовый жизненный цикл поставки материала', () => {
    test.describe.configure({ timeout: 150000 });

    let accessToken: string | undefined;
    let companyId: number | undefined;
    let deliveryId: number | undefined;
    let materialId: number | undefined;
    let materialTypeId: number | undefined;
    let materialSubtypeId: number | undefined;
    let unitMeasurementId: number | undefined;
    let documentId: number | undefined;
    let suffix = '';
    let companyName = '';
    let deliveryNumberOrder = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (deliveryId) {
        const archiveDelivery = await deliveriesAPI.banDelivery(request, deliveryId, accessToken);
        expectNoServerError(archiveDelivery);
      }
      if (companyId) {
        const archiveCompany = await companiesAPI.banCompany(request, companyId, accessToken);
        expectNoServerError(archiveCompany);
      }
      if (documentId) {
        const archiveDocument = await documentsAPI.archiveDocument(request, documentId, false, accessToken);
        expectNoServerError(archiveDocument);
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

    test('подготавливает материал и документ для поставки', async ({ request }) => {
      suffix = uniqueApiSuffix('provider-delivery');
      companyName = `API Delivery Provider Company ${suffix}`;

      const typeResponse = await materialsAPI.createTypeMaterial(
        request,
        { name: `API Delivery Type Material ${suffix}`, characteristics: typeCharacteristics(), instance_type: 1 },
        accessToken,
      );
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      materialTypeId = Number(typeResponse.data?.id);
      expect(materialTypeId, JSON.stringify(typeResponse.data)).toBeGreaterThan(0);

      const subtypeResponse = await materialsAPI.createSubtypeMaterial(
        request,
        {
          name: `API Delivery Subtype Material ${suffix}`,
          density: 8,
          id: null,
          instance_type: 1,
          parentMaterialIds: [materialTypeId],
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      materialSubtypeId = Number(subtypeResponse.data?.id);
      expect(materialSubtypeId, JSON.stringify(subtypeResponse.data)).toBeGreaterThan(0);

      const materialName = `API Delivery Material ${suffix}`;
      const createMaterial = await materialsAPI.createAndUpdateMaterial(
        request,
        materialPayload(suffix, materialTypeId as number, materialSubtypeId as number),
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
      materialId = Number(createMaterial.data?.id ?? material?.id);
      unitMeasurementId = getMaterialUnitId(material as ApiRow);
      expect(materialId, JSON.stringify(createMaterial.data)).toBeGreaterThan(0);
      expect(unitMeasurementId, JSON.stringify(material)).toBeGreaterThan(0);

      const documentResponse = await documentsAPI.createDocuments(
        request,
        [{ type: 'API provider delivery', version: 1, description: `Provider delivery API ${suffix}`, name: `provider-delivery-${suffix}.txt`, newVersion: false }],
        [{ name: `provider-delivery-${suffix}.txt`, mimeType: 'text/plain', buffer: Buffer.from(`provider-delivery-api-${suffix}`) }],
        accessToken,
      );
      expectNoServerError(documentResponse);
      expect(successCodes, JSON.stringify(documentResponse.data)).toContain(documentResponse.status);
      documentId = Number(getRows<ApiRow>(documentResponse.data)[0]?.id);
      expect(documentId, JSON.stringify(documentResponse.data)).toBeGreaterThan(0);
    });

    test('создает компанию-поставщика для поставки и связывает ее с материалом', async ({ request }) => {
      test.skip(!materialId || !unitMeasurementId, 'No active material with measurement unit is available for delivery creation.');
      expect(materialId).toBeGreaterThan(0);
      expect(unitMeasurementId).toBeGreaterThan(0);

      const createCompany = await companiesAPI.createCompany(request, companyPayload(suffix, [materialId as number]), accessToken);
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
    });

    test('создает поставку материала, читает ее и позиции', async ({ request }) => {
      test.skip(!companyId || !materialId || !unitMeasurementId, 'Provider company or material was not prepared.');

      const createDelivery = await deliveriesAPI.createDelivery(
        request,
        deliveryPayload(suffix, companyId as number, materialId as number, unitMeasurementId as number, { documentsIds: documentId ? [documentId] : [] }),
        accessToken,
      );
      expectNoServerError(createDelivery);
      expect(successCodes, JSON.stringify(createDelivery.data)).toContain(createDelivery.status);
      deliveryId = Number(createDelivery.data?.id);
      expect(deliveryId, JSON.stringify(createDelivery.data)).toBeGreaterThan(0);

      const byId = await deliveriesAPI.getDeliveryById(request, deliveryId, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(deliveryId);
        deliveryNumberOrder = String(byId.data?.number_order || '');
        const documents = getRows<ApiRow>(byId.data?.documents);
        if (documentId && documents.length) {
          expect(documents.some((document) => document.id === documentId), JSON.stringify(byId.data)).toBe(true);
        }
      }

      const positions = await deliveriesAPI.getDeliveryPositions(request, deliveryId, accessToken);
      expectNoServerError(positions);
      expect(successCodes, JSON.stringify(positions.data)).toContain(positions.status);
      expect(getRows<ApiRow>(positions.data?.delivery_positions).some((row) => row.entityId === materialId), JSON.stringify(positions.data)).toBe(true);
    });

    test('находит поставку в общей пагинации и списке по поставщику', async ({ request }) => {
      test.skip(!companyId || !deliveryId, 'Delivery was not created.');

      const pagination = await eventually(async () => {
        const response = await deliveriesAPI.getDeliveriesPagination(
          request,
          deliveryPaginationDto({ searchString: deliveryNumberOrder }),
          accessToken,
        );
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === deliveryId));

      expect(pagination, `Delivery ${deliveryId} was not found in pagination`).toBeTruthy();

      const orderedPage = await deliveriesAPI.getDeliveriesPagination(
        request,
        deliveryPaginationDto({ status: ['ordered'] }),
        accessToken,
      );
      expectNoServerError(orderedPage);
      if (!clientErrorCodes.includes(orderedPage.status)) {
        expect(successCodes).toContain(orderedPage.status);
        expect(getRows<ApiRow>(orderedPage.data).some((row) => row.id === deliveryId), JSON.stringify(orderedPage.data)).toBe(true);
      }

      const byCompany = await deliveriesAPI.getByCompany(request, companyId as number, { searchString: '', status: [] }, accessToken);
      expectNoServerError(byCompany);
      if (!clientErrorCodes.includes(byCompany.status)) {
        expect(successCodes).toContain(byCompany.status);
        expect(getRows<ApiRow>(byCompany.data).some((row) => row.id === deliveryId), JSON.stringify(byCompany.data)).toBe(true);
      }

      const byCompanyOrdered = await deliveriesAPI.getByCompany(request, companyId as number, { searchString: '', status: ['ordered'] }, accessToken);
      expectNoServerError(byCompanyOrdered);
      if (!clientErrorCodes.includes(byCompanyOrdered.status)) {
        expect(successCodes).toContain(byCompanyOrdered.status);
        expect(getRows<ApiRow>(byCompanyOrdered.data).some((row) => row.id === deliveryId), JSON.stringify(byCompanyOrdered.data)).toBe(true);
      }
    });

    test('архивирует поставку и компанию-поставщика', async ({ request }) => {
      expect(deliveryId).toBeTruthy();
      const currentDeliveryId = deliveryId as number;

      const archiveDelivery = await deliveriesAPI.banDelivery(request, currentDeliveryId, accessToken);
      expectNoServerError(archiveDelivery);
      expect(successCodes, JSON.stringify(archiveDelivery.data)).toContain(archiveDelivery.status);
      deliveryId = undefined;

      const archiveList = await deliveriesAPI.getDeliveriesPagination(
        request,
        deliveryPaginationDto({ searchString: deliveryNumberOrder, status: ['archive'] }),
        accessToken,
      );
      expectNoServerError(archiveList);
      if (!clientErrorCodes.includes(archiveList.status)) {
        expect(successCodes).toContain(archiveList.status);
        expect(getRows<ApiRow>(archiveList.data).some((row) => row.id === currentDeliveryId), JSON.stringify(archiveList.data)).toBe(true);
      }

      const archiveCompany = await companiesAPI.banCompany(request, companyId as number, accessToken);
      expectNoServerError(archiveCompany);
      if (!clientErrorCodes.includes(archiveCompany.status)) expect(successCodes).toContain(archiveCompany.status);
      companyId = undefined;
    });
  });

  test.describe('Deliveries API: чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает фронтовую пагинацию deliveries без серверных ошибок', async ({ request }) => {
      const list = await deliveriesAPI.getAllDeliveries(request, accessToken);
      expectNoServerError(list);

      const deliveriesPage = await deliveriesAPI.getDeliveriesPagination(request, deliveryPaginationDto(), accessToken);
      expectNoServerError(deliveriesPage);
      if (!clientErrorCodes.includes(deliveriesPage.status)) {
        expect(successCodes).toContain(deliveriesPage.status);
        expect(getCount(deliveriesPage.data), JSON.stringify(deliveriesPage.data)).toBeGreaterThanOrEqual(0);
        expectPaginationContract(deliveriesPage.data);
      }
    });

    test('защитные поисковые строки не приводят к 5xx', async ({ request }) => {
      for (const searchString of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const deliveriesPage = await deliveriesAPI.getDeliveriesPagination(request, deliveryPaginationDto({ searchString }), accessToken);
        expectNoServerError(deliveriesPage);
      }
    });

    test('невалидные мутации deliveries отклоняются без 5xx', async ({ request }) => {
      const invalidDelivery = await deliveriesAPI.createDelivery(
        request,
        {
          companyId: 999999999,
          numberCheck: '',
          nds: 20,
          count: 1,
          positions: [],
          documentsIds: [],
          dateShipments: 'not-a-date',
          description: '',
        },
        accessToken,
      );
      expectClientError(invalidDelivery);

      const noPositions = await deliveriesAPI.createDelivery(
        request,
        {
          companyId: 999999999,
          numberCheck: `API-INVALID-${uniqueApiSuffix('delivery')}`,
          nds: 20,
          count: 1,
          positions: [],
          documentsIds: [],
          dateShipments: new Date().toISOString(),
          description: '',
        },
        accessToken,
      );
      expectClientError(noPositions);

      const twoEntityIds = await deliveriesAPI.createDelivery(
        request,
        {
          companyId: 999999999,
          numberCheck: `API-INVALID-${uniqueApiSuffix('delivery')}`,
          nds: 20,
          count: 1,
          positions: [
            {
              entityType: 'material',
              materialId: 1,
              equipmentId: 1,
              unitMeasurementId: 1,
              plannedDeliveryDate: new Date().toISOString(),
              orderedQuantity: 1,
              totalAmount: 1,
              description: '',
            },
          ],
          documentsIds: [],
          dateShipments: new Date().toISOString(),
          description: '',
        },
        accessToken,
      );
      expectClientError(twoEntityIds);

      const badMultiplicity = await deliveriesAPI.createDelivery(
        request,
        {
          companyId: 999999999,
          numberCheck: `API-INVALID-${uniqueApiSuffix('delivery')}`,
          nds: 20,
          count: 1,
          positions: [
            {
              entityType: 'material',
              materialId: 1,
              unitMeasurementId: 999999999,
              plannedDeliveryDate: new Date().toISOString(),
              orderedQuantity: 1,
              totalAmount: 1,
              description: '',
            },
          ],
          documentsIds: [],
          dateShipments: new Date().toISOString(),
          description: '',
        },
        accessToken,
      );
      expectClientError(badMultiplicity);

      const byCompany = await deliveriesAPI.getByCompany(request, 999999999, { searchString: '', status: ['ordered'] }, accessToken);
      expectNoServerError(byCompany);
    });
  });
};
