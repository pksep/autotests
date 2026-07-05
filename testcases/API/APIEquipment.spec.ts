import { test, expect } from '@playwright/test';
import { DocumentsAPI } from '../../pages/API/APIDocuments';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { OperationAPI } from '../../pages/API/APIOperation';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectNoServerError,
  expectClientError,
  expectErrorResponseContract,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const equipmentAPI = new EquipmentAPI(null);
const documentsAPI = new DocumentsAPI(null);
const operationAPI = new OperationAPI(null);

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

const equipmentPayload = (
  suffix: string,
  typeId: number,
  subtypeId: number,
  overrides: Record<string, unknown> = {},
) => ({
  name: `API Equipment ${suffix}`,
  deliveryTime: '0',
  invNymber: `API-EQ-${suffix}`,
  responsible: '0',
  description: `Created by API autotest ${suffix}`,
  docs: 'null',
  parentId: subtypeId,
  rootParentId: typeId,
  companyIds: '[]',
  instrumentIdList: '[]',
  attention: false,
  fileBase: '[]',
  typeOperationIds: '[]',
  ...overrides,
});

const expectEquipmentShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(typeof row.id, JSON.stringify(row)).toBe('number');
  expect(row.name, JSON.stringify(row)).toBeTruthy();
};

const findEquipmentByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await equipmentAPI.getEquipmentPagination(request, equipmentPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

export const runEquipmentAPINew = () => {
  logger.info('Starting Equipment API coverage suite');

  test.describe.serial('Equipment API', () => {
    test.describe('Equipment API: жизненный цикл оборудования', () => {
      test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let typeId: number | undefined;
    let subtypeId: number | undefined;
    let equipmentId: number | undefined;
    let typeOperationId: number | undefined;
    let documentId: number | undefined;
    let equipmentName = '';
    let updatedEquipmentName = '';
    let typeName = '';
    let subtypeName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (equipmentId) {
        const archive = await equipmentAPI.banEquipment(request, equipmentId, accessToken);
        expectNoServerError(archive);
      }
      if (documentId) {
        const archiveDocument = await documentsAPI.deleteDocument(request, documentId, API_CONST.API_TEST_TABEL, accessToken);
        expectNoServerError(archiveDocument);
      }
      if (subtypeId) {
        const archiveSubtype = await equipmentAPI.removeEquipmentSubtype(request, subtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }
      if (typeId) {
        const archiveType = await equipmentAPI.removeEquipmentType(request, typeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('создает тип и подтип оборудования', async ({ request }) => {
      const suffix = uniqueApiSuffix('equipment');
      typeName = `API Equipment Type ${suffix}`;
      subtypeName = `API Equipment Subtype ${suffix}`;

      const uniqueType = await equipmentAPI.checkNameUnique(request, { type: 'type', name: typeName }, accessToken);
      expectNoServerError(uniqueType);
      if (!clientErrorCodes.includes(uniqueType.status)) {
        expect(Number(uniqueType.data), JSON.stringify(uniqueType.data)).toBe(0);
      }

      const typeResponse = await equipmentAPI.createEquipmentType(request, { name: typeName }, accessToken);
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      expectEquipmentShape(typeResponse.data);
      typeId = Number(typeResponse.data.id);

      const subtypeResponse = await equipmentAPI.createEquipmentSubtype(
        request,
        { name: subtypeName, parentId: typeId },
        accessToken,
      );
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      expectEquipmentShape(subtypeResponse.data);
      subtypeId = Number(subtypeResponse.data.id);

      equipmentName = `API Equipment ${suffix}`;
      updatedEquipmentName = `API Equipment Updated ${suffix}`;
    });

    test('обновляет тип и подтип оборудования и проверяет уникальность имен', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      typeName = `${typeName} Updated`;
      subtypeName = `${subtypeName} Updated`;

      const updateType = await equipmentAPI.updateEquipmentType(request, { id: typeId, name: typeName }, accessToken);
      expect(successCodes, JSON.stringify(updateType.data)).toContain(updateType.status);
      expectNoServerError(updateType);
      expect(updateType.data?.name, JSON.stringify(updateType.data)).toBe(typeName);

      const updateSubtype = await equipmentAPI.updateEquipmentSubtype(request, { id: subtypeId, name: subtypeName }, accessToken);
      expect(successCodes, JSON.stringify(updateSubtype.data)).toContain(updateSubtype.status);
      expectNoServerError(updateSubtype);
      expect(updateSubtype.data?.name, JSON.stringify(updateSubtype.data)).toBe(subtypeName);

      const uniqueTypeAfterRename = await equipmentAPI.checkNameUnique(request, { type: 'type', name: typeName }, accessToken);
      expectNoServerError(uniqueTypeAfterRename);
      if (!clientErrorCodes.includes(uniqueTypeAfterRename.status)) {
        expect(Number(uniqueTypeAfterRename.data), JSON.stringify(uniqueTypeAfterRename.data)).toBe(typeId);
      }

      const uniqueSubtypeAfterRename = await equipmentAPI.checkNameUnique(request, { type: 'subtype', name: subtypeName }, accessToken);
      expectNoServerError(uniqueSubtypeAfterRename);
      if (!clientErrorCodes.includes(uniqueSubtypeAfterRename.status)) {
        expect(Number(uniqueSubtypeAfterRename.data), JSON.stringify(uniqueSubtypeAfterRename.data)).toBe(subtypeId);
      }

      const typeById = await equipmentAPI.getEquipmentTypeById(request, typeId as number, accessToken);
      expectNoServerError(typeById);
      if (!clientErrorCodes.includes(typeById.status)) {
        expect(successCodes).toContain(typeById.status);
        expect(typeById.data?.name, JSON.stringify(typeById.data)).toBe(typeName);
      }

      const subtypeById = await equipmentAPI.getEquipmentSubtypeById(request, subtypeId as number, accessToken);
      expectNoServerError(subtypeById);
      if (!clientErrorCodes.includes(subtypeById.status)) {
        expect(successCodes).toContain(subtypeById.status);
        expect(subtypeById.data?.name, JSON.stringify(subtypeById.data)).toBe(subtypeName);
      }
    });

    test('создает оборудование и находит его в пагинации', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      const duplicateBefore = await equipmentAPI.checkNameExisting(request, { name: equipmentName }, accessToken);
      expectNoServerError(duplicateBefore);
      if (!clientErrorCodes.includes(duplicateBefore.status)) {
        expect(Number(duplicateBefore.data), JSON.stringify(duplicateBefore.data)).toBe(0);
      }

      const create = await equipmentAPI.createEquipment(
        request,
        equipmentPayload(equipmentName.replace('API Equipment ', ''), typeId as number, subtypeId as number),
        accessToken,
      );
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);
      if (create.data?.id) equipmentId = Number(create.data.id);

      const created = await findEquipmentByName(request, equipmentName, accessToken);
      expect(created, `Equipment ${equipmentName} was not found after create`).toBeTruthy();
      equipmentId = equipmentId || Number(created?.id);
      expectEquipmentShape(created as ApiRow);
      expect(created?.ban).not.toBe(true);
    });

    test('читает и обновляет созданное оборудование', async ({ request }) => {
      expect(equipmentId).toBeTruthy();

      const byId = await equipmentAPI.getEquipmentById(request, equipmentId as number, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(equipmentId);
      }

      const update = await equipmentAPI.updateEquipment(
        request,
        {
          ...equipmentPayload(updatedEquipmentName.replace('API Equipment ', ''), typeId as number, subtypeId as number, {
            id: equipmentId,
            name: updatedEquipmentName,
            attention: true,
            description: 'Updated by API autotest',
          }),
        },
        accessToken,
      );
      expectNoServerError(update);
      if (clientErrorCodes.includes(update.status)) return;

      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      const updated = await findEquipmentByName(request, updatedEquipmentName, accessToken);
      expect(updated, `Equipment ${updatedEquipmentName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(equipmentId);
      equipmentName = updatedEquipmentName;
    });

    test('привязывает оборудование к типу операции и проверяет фильтры связей', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      const typeOperations = await operationAPI.getTypeOperationStatic(request, 'metal', accessToken);
      expectNoServerError(typeOperations);
      const typeOperation = getRows<ApiRow>(typeOperations.data).find((row) => row.id);
      test.skip(!typeOperation, 'No metal type operation is available for Equipment typeOperationIds coverage.');
      typeOperationId = Number(typeOperation?.id);
      expect(typeOperationId, JSON.stringify(typeOperations.data)).toBeGreaterThan(0);

      const update = await equipmentAPI.updateEquipment(
        request,
        equipmentPayload(equipmentName.replace('API Equipment ', ''), typeId as number, subtypeId as number, {
          id: equipmentId,
          name: equipmentName,
          attention: true,
          description: 'Linked to operation type by API autotest',
          typeOperationIds: JSON.stringify([typeOperationId]),
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expectNoServerError(update);

      const byTypeOperation = await equipmentAPI.getByTypeOperation(request, typeOperationId as number, accessToken);
      expectNoServerError(byTypeOperation);
      if (!clientErrorCodes.includes(byTypeOperation.status)) {
        expect(successCodes).toContain(byTypeOperation.status);
        expect(getRows<ApiRow>(byTypeOperation.data).some((row) => row.id === equipmentId), JSON.stringify(byTypeOperation.data)).toBe(true);
      }

      const byType = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ typeId, searchString: equipmentName }),
        accessToken,
      );
      expect(byType.status).toBe(201);
      expect(getRows<ApiRow>(byType.data).some((row) => row.id === equipmentId), JSON.stringify(byType.data)).toBe(true);

      const bySubtype = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ subTypeId: subtypeId, searchString: equipmentName }),
        accessToken,
      );
      expect(bySubtype.status).toBe(201);
      expect(getRows<ApiRow>(bySubtype.data).some((row) => row.id === equipmentId), JSON.stringify(bySubtype.data)).toBe(true);

      const byAttention = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ isFilteredByAttention: true, searchString: equipmentName }),
        accessToken,
      );
      expect(byAttention.status).toBe(201);
      expect(getRows<ApiRow>(byAttention.data).some((row) => row.id === equipmentId), JSON.stringify(byAttention.data)).toBe(true);

      const byOperationFilter = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ typeOperationId, searchString: equipmentName }),
        accessToken,
      );
      expect(byOperationFilter.status).toBe(201);
      expect(getRows<ApiRow>(byOperationFilter.data).some((row) => row.id === equipmentId), JSON.stringify(byOperationFilter.data)).toBe(true);
    });

    test('проверяет light/full выдачу, isFilteredByOwn и файл через fileBase', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      const fileName = `${equipmentName}.txt`;
      const createDocument = await documentsAPI.createDocuments(
        request,
        [{ type: 'API test', version: 1, description: 'Equipment API fileBase coverage', name: fileName, newVersion: false }],
        [{ name: fileName, mimeType: 'text/plain', buffer: Buffer.from(`equipment-api-${equipmentId}`) }],
        accessToken,
      );
      expect(successCodes, JSON.stringify(createDocument.data)).toContain(createDocument.status);
      expectNoServerError(createDocument);
      documentId = Number(getRows<ApiRow>(createDocument.data)[0]?.id);
      expect(documentId, JSON.stringify(createDocument.data)).toBeGreaterThan(0);

      const updateWithFile = await equipmentAPI.updateEquipment(
        request,
        equipmentPayload(equipmentName.replace('API Equipment ', ''), typeId as number, subtypeId as number, {
          id: equipmentId,
          name: equipmentName,
          responsible: API_CONST.API_TEST_USER_ID,
          attention: true,
          fileBase: JSON.stringify([documentId]),
          typeOperationIds: typeOperationId ? JSON.stringify([typeOperationId]) : '[]',
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateWithFile.data)).toContain(updateWithFile.status);
      expectNoServerError(updateWithFile);

      const byId = await equipmentAPI.getEquipmentById(request, equipmentId as number, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        const documents = getRows<ApiRow>(byId.data?.documents);
        expect(documents.some((doc) => doc.id === documentId), JSON.stringify(byId.data)).toBe(true);
      }

      const light = await equipmentAPI.getAllEquipment(request, true, accessToken);
      const full = await equipmentAPI.getAllEquipment(request, false, accessToken);
      expectNoServerError(light);
      expectNoServerError(full);
      if (!clientErrorCodes.includes(light.status) && !clientErrorCodes.includes(full.status)) {
        expect(successCodes).toContain(light.status);
        expect(successCodes).toContain(full.status);
        expect(Array.isArray(light.data), JSON.stringify(light.data)).toBe(true);
        expect(Array.isArray(full.data), JSON.stringify(full.data)).toBe(true);
        const fullRow = getRows<ApiRow>(full.data).find((row) => row.id === equipmentId);
        if (fullRow) {
          expect(fullRow.name, JSON.stringify(fullRow)).toBe(equipmentName);
        }
      }

      const own = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ isFilteredByOwn: true, searchString: equipmentName }),
        accessToken,
      );
      expectNoServerError(own);
      if (!clientErrorCodes.includes(own.status)) {
        expect(successCodes).toContain(own.status);
        const rows = getRows<ApiRow>(own.data);
        if (rows.length) {
          expect(rows.some((row) => row.id === equipmentId), JSON.stringify(own.data)).toBe(true);
        }
      }
    });

    test('архивирует оборудование и проверяет архивную выдачу', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      const currentEquipmentId = equipmentId as number;

      const archive = await equipmentAPI.banEquipment(request, currentEquipmentId, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);

      const archived = await eventually(async () => {
        const response = await equipmentAPI.getArchivedEquipment(request, { searchString: equipmentName }, accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === currentEquipmentId));

      expect(archived, `Equipment ${equipmentName} was not found in archive`).toBeTruthy();

      const active = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ searchString: equipmentName }),
        accessToken,
      );
      expectNoServerError(active);
      if (!clientErrorCodes.includes(active.status)) {
        expect(successCodes).toContain(active.status);
        expect(getRows<ApiRow>(active.data).some((row) => row.id === currentEquipmentId), JSON.stringify(active.data)).toBe(false);
      }
      equipmentId = undefined;
    });

    test('архивирует тип и подтип и проверяет отсутствие в активной пагинации', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();
      const currentTypeId = typeId as number;
      const currentSubtypeId = subtypeId as number;

      const archiveSubtype = await equipmentAPI.removeEquipmentSubtype(request, currentSubtypeId, accessToken);
      expectNoServerError(archiveSubtype);
      if (!clientErrorCodes.includes(archiveSubtype.status)) {
        expect(successCodes).toContain(archiveSubtype.status);
      }
      const archiveType = await equipmentAPI.removeEquipmentType(request, currentTypeId, accessToken);
      expectNoServerError(archiveType);
      if (!clientErrorCodes.includes(archiveType.status)) {
        expect(successCodes).toContain(archiveType.status);
      }

      const activeSubtypes = await equipmentAPI.getSubtypePagination(request, equipmentPaginationDto({ searchString: subtypeName }), accessToken);
      expectNoServerError(activeSubtypes);
      if (!clientErrorCodes.includes(activeSubtypes.status)) {
        expect(getRows<ApiRow>(activeSubtypes.data).some((row) => row.id === currentSubtypeId), JSON.stringify(activeSubtypes.data)).toBe(false);
      }

      const activeTypes = await equipmentAPI.getTypePagination(request, equipmentPaginationDto({ searchString: typeName }), accessToken);
      expectNoServerError(activeTypes);
      if (!clientErrorCodes.includes(activeTypes.status)) {
        expect(getRows<ApiRow>(activeTypes.data).some((row) => row.id === currentTypeId), JSON.stringify(activeTypes.data)).toBe(false);
      }

      const secondArchiveSubtype = await equipmentAPI.removeEquipmentSubtype(request, currentSubtypeId, accessToken);
      expectNoServerError(secondArchiveSubtype);
      const secondArchiveType = await equipmentAPI.removeEquipmentType(request, currentTypeId, accessToken);
      expectNoServerError(secondArchiveType);

      subtypeId = undefined;
      typeId = undefined;
    });
  });

    test.describe('Equipment API: контракты чтения и defensive-сценарии', () => {
      test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает справочники и основные пагинации без серверных ошибок', async ({ request }) => {
      const types = await equipmentAPI.getEquipmentTypes(request, accessToken);
      expectNoServerError(types);
      if (!clientErrorCodes.includes(types.status)) {
        expect(successCodes).toContain(types.status);
        expect(Array.isArray(types.data), JSON.stringify(types.data)).toBe(true);
      }

      const subtypes = await equipmentAPI.getEquipmentSubtypes(request, accessToken);
      expectNoServerError(subtypes);
      if (!clientErrorCodes.includes(subtypes.status)) {
        expect(successCodes).toContain(subtypes.status);
        expect(Array.isArray(subtypes.data), JSON.stringify(subtypes.data)).toBe(true);
      }

      const allLight = await equipmentAPI.getAllEquipment(request, true, accessToken);
      expectNoServerError(allLight);

      const typePagination = await equipmentAPI.getTypePagination(request, equipmentPaginationDto(), accessToken);
      expect(typePagination.status).toBe(201);
      expectPaginationContract(typePagination.data);

      const subtypePagination = await equipmentAPI.getSubtypePagination(request, equipmentPaginationDto(), accessToken);
      expect(subtypePagination.status).toBe(201);
      expectPaginationContract(subtypePagination.data);

      const equipmentPagination = await equipmentAPI.getEquipmentPagination(request, equipmentPaginationDto(), accessToken);
      expect(equipmentPagination.status).toBe(201);
      expect(getCount(equipmentPagination.data), JSON.stringify(equipmentPagination.data)).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(getRows(equipmentPagination.data)), JSON.stringify(equipmentPagination.data)).toBe(true);
    });

    test('пагинация оборудования поддерживает пустой результат и граничные страницы', async ({ request }) => {
      const empty = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ searchString: 'api-equipment-no-match-999999999' }),
        accessToken,
      );
      expect(empty.status).toBe(201);
      expect(getCount(empty.data), JSON.stringify(empty.data)).toBe(0);
      expect(getRows(empty.data)).toEqual([]);

      const firstPage = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ page: 0 }),
        accessToken,
      );
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data);

      const farPage = await equipmentAPI.getEquipmentPagination(
        request,
        equipmentPaginationDto({ page: 999999 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
    });

    test('защитные searchString и name payload не приводят к серверным ошибкам', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const searchString of cases) {
        const pagination = await equipmentAPI.getEquipmentPagination(
          request,
          equipmentPaginationDto({ searchString }),
          accessToken,
        );
        expectNoServerError(pagination);

        const unique = await equipmentAPI.checkNameUnique(request, { type: 'type', name: searchString }, accessToken);
        expectNoServerError(unique);
      }
    });

    test('несуществующие id и невалидные мутации обрабатываются без 5xx', async ({ request }) => {
      const byId = await equipmentAPI.getEquipmentById(request, 999999999, accessToken);
      expectNoServerError(byId);

      const byType = await equipmentAPI.getEquipmentTypeById(request, 999999999, accessToken);
      expectNoServerError(byType);

      const bySubtype = await equipmentAPI.getEquipmentSubtypeById(request, 999999999, accessToken);
      expectNoServerError(bySubtype);

      const removeFile = await equipmentAPI.removeFileEquipment(request, 999999999, accessToken);
      expectNoServerError(removeFile);
      if (clientErrorCodes.includes(removeFile.status)) expectErrorResponseContract(removeFile);

      const invalidCreate = await equipmentAPI.createEquipment(
        request,
        {
          name: '',
          deliveryTime: '0',
          invNymber: '',
          responsible: '0',
          description: '',
          docs: 'null',
          parentId: 999999999,
          rootParentId: 999999999,
          companyIds: '[]',
          instrumentIdList: '[]',
          attention: false,
          fileBase: '[]',
          typeOperationIds: '[]',
        },
        accessToken,
      );
      expectClientError(invalidCreate);
    });

    test('мутации оборудования без авторизации не проходят успешно', async ({ request }) => {
      const createType = await equipmentAPI.createEquipmentType(
        request,
        { name: `API Equipment NoAuth ${uniqueApiSuffix('equipment')}` },
      );
      expectClientError(createType);

      const archive = await equipmentAPI.banEquipment(request, 999999999);
      expectClientError(archive);
    });
    });
  });
};
