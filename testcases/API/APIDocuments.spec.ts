import { test, expect } from '@playwright/test';
import { DocumentsAPI } from '../../pages/API/APIDocuments';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, expectPaginationContract, getRows, serverErrorCodes, successCodes } from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const documentsAPI = new DocumentsAPI(null);
const equipmentAPI = new EquipmentAPI(null);

const documentsPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  filterOptions: {
    typeFile: null,
    category: null,
  },
  ...overrides,
});

const equipmentPayload = (
  suffix: string,
  typeId: number,
  subtypeId: number,
  overrides: Record<string, unknown> = {},
) => ({
  name: `API Documents Equipment ${suffix}`,
  deliveryTime: '0',
  invNymber: `API-DOC-EQ-${suffix}`,
  responsible: '0',
  description: `Created by Documents API autotest ${suffix}`,
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

const expectDocumentShape = (document: ApiRow) => {
  expect(document).toBeTruthy();
  expect(typeof document.id, JSON.stringify(document)).toBe('number');
  expect(document.name, JSON.stringify(document)).toBeTruthy();
};

const createTestDocument = async (
  request: any,
  name: string,
  accessToken?: string,
  overrides: Record<string, unknown> = {},
): Promise<ApiRow> => {
  const createResponse = await documentsAPI.createDocuments(
    request,
    [{ type: 'api-test', version: 1, description: 'Created by Documents API autotest', name, newVersion: false, ...overrides }],
    [{ name, mimeType: 'text/plain', buffer: Buffer.from(`documents-api-${name}`) }],
    accessToken,
  );
  expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
  expectNoServerError(createResponse);
  const document = getRows<ApiRow>(createResponse.data)[0];
  expectDocumentShape(document);
  return document;
};

const getEquipmentDocuments = async (request: any, equipmentId: number, accessToken?: string): Promise<ApiRow[]> => {
  const byId = await equipmentAPI.getEquipmentById(request, equipmentId, accessToken);
  expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
  expectNoServerError(byId);
  return getRows<ApiRow>(byId.data?.documents);
};

const findDocumentByName = async (
  request: any,
  name: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

export const runDocumentsAPINew = () => {
  logger.info('Starting Documents API coverage suite');

  test.describe.serial('Documents API: базовый жизненный цикл файла', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let documentId: number | undefined;
    let createdName = '';
    let updatedName = '';
    let documentType = '';
    let updatedType = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (documentId) {
        const archive = await documentsAPI.archiveDocument(request, documentId, false, accessToken);
        expectNoServerError(archive);
      }
    });

    test('создает документ через multipart и проверяет уникальность имени', async ({ request }) => {
      const suffix = uniqueApiSuffix('document');
      createdName = `API Document ${suffix}.txt`;
      updatedName = `API Document Updated ${suffix}.txt`;
      documentType = `api-test-${suffix}`;
      updatedType = `api-test-updated-${suffix}`;

      const uniqueBefore = await documentsAPI.checkNameExisting(request, { name: createdName }, accessToken);
      expect(uniqueBefore.status).toBe(201);
      expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);

      const createResponse = await documentsAPI.createDocuments(
        request,
        [{ type: documentType, version: 1, description: 'Created by API autotest', name: createdName, newVersion: false }],
        [{ name: createdName, mimeType: 'text/plain', buffer: Buffer.from(`documents-api-${suffix}`) }],
        accessToken,
      );
      expect(successCodes, JSON.stringify(createResponse.data)).toContain(createResponse.status);
      expectNoServerError(createResponse);

      const createdDocument = getRows<ApiRow>(createResponse.data)[0];
      expectDocumentShape(createdDocument);
      documentId = Number(createdDocument.id);
      createdName = String(createdDocument.name);
    });

    test('читает созданный документ по id и находит его в пагинации', async ({ request }) => {
      expect(documentId).toBeTruthy();

      const byIdLight = await documentsAPI.getFileById(request, documentId as number, true, accessToken);
      expect(successCodes, JSON.stringify(byIdLight.data)).toContain(byIdLight.status);
      expectNoServerError(byIdLight);
      expectDocumentShape(byIdLight.data);
      expect(byIdLight.data.name, JSON.stringify(byIdLight.data)).toBe(createdName);

      const byIdFull = await documentsAPI.getFileById(request, documentId as number, false, accessToken);
      expect(successCodes, JSON.stringify(byIdFull.data)).toContain(byIdFull.status);
      expectNoServerError(byIdFull);
      expectDocumentShape(byIdFull.data);

      const page = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto({ searchString: createdName }), accessToken);
      expect(page.status).toBe(201);
      expectPaginationContract(page.data);
      expect(getRows<ApiRow>(page.data).some((row) => row.id === documentId), JSON.stringify(page.data)).toBe(true);
    });

    test('обновляет метаданные документа и проверяет выдачу', async ({ request }) => {
      expect(documentId).toBeTruthy();

      const updateResponse = await documentsAPI.updateDocument(
        request,
        {
          id: documentId,
          name: updatedName,
          version: 2,
          type: updatedType,
          responsibleUserId: Number(API_CONST.API_TEST_USER_ID),
          description: 'Updated by API autotest',
          ava: false,
        },
        accessToken,
      );
      expect(successCodes, JSON.stringify(updateResponse.data)).toContain(updateResponse.status);
      expectNoServerError(updateResponse);
      expectDocumentShape(updateResponse.data);
      expect(updateResponse.data.name, JSON.stringify(updateResponse.data)).toBe(updatedName);
      expect(updateResponse.data.type, JSON.stringify(updateResponse.data)).toBe(updatedType);

      const found = await findDocumentByName(request, updatedName, accessToken);
      expect(found, `Document ${updatedName} was not found after update`).toBeTruthy();
      expect(found?.id).toBe(documentId);
    });

    test('возвращает список имен и presign URL без серверных ошибок', async ({ request }) => {
      const names = await documentsAPI.getDocumentNames(request, accessToken);
      expect(successCodes, JSON.stringify(names.data)).toContain(names.status);
      expectNoServerError(names);
      expect(Array.isArray(names.data), JSON.stringify(names.data)).toBe(true);
      expect(names.data.some((row: ApiRow) => row.name === updatedName), JSON.stringify(names.data)).toBe(true);

      const presign = await documentsAPI.presignPut(
        request,
        { originalName: updatedName, contentType: 'text/plain' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(presign.data)).toContain(presign.status);
      expectNoServerError(presign);
      expect(presign.data?.objectName, JSON.stringify(presign.data)).toContain('.txt');
      expect(presign.data?.putUrl, JSON.stringify(presign.data)).toBeTruthy();
      expect(presign.data?.publicUrl, JSON.stringify(presign.data)).toBeTruthy();
    });

    test('архивирует документ и проверяет архивную выдачу', async ({ request }) => {
      expect(documentId).toBeTruthy();
      const currentDocumentId = documentId as number;

      const archive = await documentsAPI.archiveDocument(request, currentDocumentId, false, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);

      const archived = await documentsAPI.getDocumentsByParams(
        request,
        documentsPaginationDto({
          searchString: updatedName,
          filterOptions: {
            typeFile: null,
            category: 'ban',
          },
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(archived.data)).toContain(archived.status);
      expectNoServerError(archived);
      expectPaginationContract(archived.data);
      expect(getRows<ApiRow>(archived.data).some((row) => row.id === currentDocumentId), JSON.stringify(archived.data)).toBe(true);

      const active = await documentsAPI.getDocumentsByParams(
        request,
        documentsPaginationDto({ searchString: updatedName }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(active.data)).toContain(active.status);
      expectNoServerError(active);
      expect(getRows<ApiRow>(active.data).some((row) => row.id === currentDocumentId), JSON.stringify(active.data)).toBe(false);

      documentId = undefined;
    });
  });

  test.describe.serial('Documents API: связи файлов с оборудованием и загрузочные сценарии', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let typeId: number | undefined;
    let subtypeId: number | undefined;
    let equipmentId: number | undefined;
    const documentIds: number[] = [];

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (equipmentId) {
        const archiveEquipment = await equipmentAPI.banEquipment(request, equipmentId, accessToken);
        expectNoServerError(archiveEquipment);
      }

      for (const documentId of documentIds) {
        const archiveDocument = await documentsAPI.archiveDocument(request, documentId, true, accessToken);
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

    test('создает оборудование для проверки связей документов', async ({ request }) => {
      const suffix = uniqueApiSuffix('doc-equipment');
      const typeResponse = await equipmentAPI.createEquipmentType(request, { name: `API Documents Equipment Type ${suffix}` }, accessToken);
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      typeId = Number(typeResponse.data.id);

      const subtypeResponse = await equipmentAPI.createEquipmentSubtype(
        request,
        { name: `API Documents Equipment Subtype ${suffix}`, parentId: typeId },
        accessToken,
      );
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      subtypeId = Number(subtypeResponse.data.id);

      const createEquipment = await equipmentAPI.createEquipment(
        request,
        equipmentPayload(suffix, typeId as number, subtypeId as number),
        accessToken,
      );
      expect(successCodes, JSON.stringify(createEquipment.data)).toContain(createEquipment.status);
      expectNoServerError(createEquipment);
      equipmentId = Number(createEquipment.data.id);
      expect(equipmentId, JSON.stringify(createEquipment.data)).toBeGreaterThan(0);
    });

    test('прикрепляет и открепляет один документ от оборудования', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      const document = await createTestDocument(request, `API Documents single ${uniqueApiSuffix('file')}.txt`, accessToken);
      const documentId = Number(document.id);
      documentIds.push(documentId);

      const attach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(attach.data)).toContain(attach.status);
      expectNoServerError(attach);
      expect(getRows<ApiRow>(attach.data).some((row) => row.id === documentId), JSON.stringify(attach.data)).toBe(true);

      let equipmentDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(equipmentDocuments.some((row) => row.id === documentId), JSON.stringify(equipmentDocuments)).toBe(true);

      const unpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(unpin.data)).toContain(unpin.status);
      expectNoServerError(unpin);

      equipmentDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(equipmentDocuments.some((row) => row.id === documentId), JSON.stringify(equipmentDocuments)).toBe(false);
    });

    test('массово прикрепляет и открепляет документы от оборудования', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      const suffix = uniqueApiSuffix('bulk-file');
      const documents = [
        await createTestDocument(request, `API Documents bulk A ${suffix}.txt`, accessToken),
        await createTestDocument(request, `API Documents bulk B ${suffix}.txt`, accessToken),
      ];
      const bulkDocumentIds = documents.map((document) => Number(document.id));
      documentIds.push(...bulkDocumentIds);

      const attach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: bulkDocumentIds, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(attach.data)).toContain(attach.status);
      expectNoServerError(attach);

      let equipmentDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      for (const documentId of bulkDocumentIds) {
        expect(equipmentDocuments.some((row) => row.id === documentId), JSON.stringify(equipmentDocuments)).toBe(true);
      }

      const unpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: bulkDocumentIds, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(unpin.data)).toContain(unpin.status);
      expectNoServerError(unpin);

      equipmentDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      for (const documentId of bulkDocumentIds) {
        expect(equipmentDocuments.some((row) => row.id === documentId), JSON.stringify(equipmentDocuments)).toBe(false);
      }
    });

    test('актуализирует avatar-флаг документа при привязке к оборудованию', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      const document = await createTestDocument(
        request,
        `API Documents avatar ${uniqueApiSuffix('file')}.txt`,
        accessToken,
        { ava: true },
      );
      const documentId = Number(document.id);
      documentIds.push(documentId);

      const attach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(attach.data)).toContain(attach.status);
      expectNoServerError(attach);

      const byId = await equipmentAPI.getEquipmentById(request, equipmentId as number, accessToken);
      expect(successCodes, JSON.stringify(byId.data)).toContain(byId.status);
      expectNoServerError(byId);
      expect(getRows<ApiRow>(byId.data?.documents).some((row) => row.id === documentId && row.ava === true), JSON.stringify(byId.data)).toBe(true);
      if ('ava_path' in byId.data && byId.data.ava_path) {
        expect(String(byId.data.ava_path), JSON.stringify(byId.data)).toContain(String(document.path).split('/').pop() || String(document.path));
      }

      const avatarEndpoint = await documentsAPI.getAvatarByEntity(request, 'equipment', equipmentId as number, accessToken);
      test.fail(
        serverErrorCodes.includes(avatarEndpoint.status),
        'Known Documents API route issue: /documents/avatar:typeEntity/:idEntity is shadowed by /documents/:id/:light.',
      );
      expectNoServerError(avatarEndpoint);
      if (!clientErrorCodes.includes(avatarEndpoint.status)) {
        expect(successCodes).toContain(avatarEndpoint.status);
        expect(avatarEndpoint.data?.idEntity, JSON.stringify(avatarEndpoint.data)).toBe(equipmentId);
        expect(avatarEndpoint.data?.typeEntity, JSON.stringify(avatarEndpoint.data)).toBe('equipment');
      }
    });

    test('архивирует прикрепленный документ с unpin=true и снимает связь с оборудованием', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      const document = await createTestDocument(request, `API Documents archive unpin ${uniqueApiSuffix('file')}.txt`, accessToken);
      const documentId = Number(document.id);
      documentIds.push(documentId);

      const attach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(attach.data)).toContain(attach.status);
      expectNoServerError(attach);

      const archive = await documentsAPI.archiveDocument(request, documentId, true, accessToken);
      expect(successCodes, JSON.stringify(archive.data)).toContain(archive.status);
      expectNoServerError(archive);
      expect(archive.data?.ban, JSON.stringify(archive.data)).toBe(true);

      const equipmentDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(equipmentDocuments.some((row) => row.id === documentId), JSON.stringify(equipmentDocuments)).toBe(false);

      const archived = await documentsAPI.getDocumentsByParams(
        request,
        documentsPaginationDto({
          searchString: String(document.name),
          filterOptions: {
            typeFile: null,
            category: 'ban',
          },
        }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(archived.data)).toContain(archived.status);
      expectNoServerError(archived);
      expect(getRows<ApiRow>(archived.data).some((row) => row.id === documentId), JSON.stringify(archived.data)).toBe(true);

      const active = await documentsAPI.getDocumentsByParams(
        request,
        documentsPaginationDto({ searchString: String(document.name) }),
        accessToken,
      );
      expect(successCodes, JSON.stringify(active.data)).toContain(active.status);
      expectNoServerError(active);
      expect(getRows<ApiRow>(active.data).some((row) => row.id === documentId), JSON.stringify(active.data)).toBe(false);

      documentIds.splice(documentIds.indexOf(documentId), 1);
    });

    test('возвращает CDN metadata для созданного документа', async ({ request }) => {
      const document = await createTestDocument(request, `API Documents cdn ${uniqueApiSuffix('file')}.txt`, accessToken);
      const documentId = Number(document.id);
      documentIds.push(documentId);
      const filename = String(document.path || '').split('/').pop() || '';
      expect(filename, JSON.stringify(document)).toBeTruthy();

      const cdn = await documentsAPI.getCdnFile(request, filename, accessToken);
      expect(successCodes, JSON.stringify(cdn.data)).toContain(cdn.status);
      expectNoServerError(cdn);
      expect(cdn.data?.url, JSON.stringify(cdn.data)).toBeTruthy();
      expect(cdn.data?.filename, JSON.stringify(cdn.data)).toBeTruthy();
    });

  });

  test.describe('Documents API: контракты чтения и defensive-сценарии', () => {
    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('пагинация документов поддерживает пустой поиск и граничные страницы', async ({ request }) => {
      const firstPage = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto(), accessToken);
      expect(firstPage.status).toBe(201);
      expectNoServerError(firstPage);
      expectPaginationContract(firstPage.data);

      const emptySearch = await documentsAPI.getDocumentsByParams(
        request,
        documentsPaginationDto({ searchString: `missing-${uniqueApiSuffix('doc')}` }),
        accessToken,
      );
      expect(emptySearch.status).toBe(201);
      expectNoServerError(emptySearch);
      expectPaginationContract(emptySearch.data);
      expect(getRows(emptySearch.data).length, JSON.stringify(emptySearch.data)).toBe(0);

      const farPage = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto({ page: 999999 }), accessToken);
      expect(farPage.status).toBe(201);
      expectNoServerError(farPage);
      expectPaginationContract(farPage.data);
    });

    test('защитные payload для поиска и проверки имени не приводят к 5xx', async ({ request }) => {
      for (const payload of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const page = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto({ searchString: payload }), accessToken);
        expectNoServerError(page);
        if (!clientErrorCodes.includes(page.status)) {
          expect(successCodes).toContain(page.status);
          expectPaginationContract(page.data);
        }

        const checkName = await documentsAPI.checkNameExisting(request, { name: payload }, accessToken);
        expectNoServerError(checkName);
        if (!clientErrorCodes.includes(checkName.status)) {
          expect(successCodes).toContain(checkName.status);
          expect(Number(checkName.data), JSON.stringify(checkName.data)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('несуществующие id и невалидные мутации обрабатываются без серверных ошибок', async ({ request }) => {
      const missingId = 999999999;

      const byMissingId = await documentsAPI.getFileById(request, missingId, true, accessToken);
      expectNoServerError(byMissingId);
      if (!clientErrorCodes.includes(byMissingId.status)) {
        expect(successCodes).toContain(byMissingId.status);
      }

      const invalidUpdate = await documentsAPI.updateDocument(
        request,
        { id: missingId, name: '', version: 'bad-version', type: '', responsibleUserId: 'bad-user', description: '', ava: false },
        accessToken,
      );
      expectNoServerError(invalidUpdate);
      expectNotSuccessful(invalidUpdate);

      const invalidAttach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: missingId, idDocument: missingId, typeEntity: 'detal' },
        accessToken,
      );
      expectNoServerError(invalidAttach);
      expectNotSuccessful(invalidAttach);

      const invalidUnpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: missingId, idDocument: missingId, typeEntity: 'detal' },
        accessToken,
      );
      expectNoServerError(invalidUnpin);
      expectNotSuccessful(invalidUnpin);
    });
  });
};
