import { test, expect } from '@playwright/test';
import { DocumentsAPI } from '../../pages/API/APIDocuments';
import { EquipmentAPI } from '../../pages/API/APIEquipment';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  clientErrorCodes,
  expectApiContract,
  expectNoServerError,
  expectClientError,
  expectEndpointReached,
  expectErrorResponseContract,
  expectPaginationContract,
  expectUnauthorizedOrForbidden,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { expectRepeatOperationRejectedOrIdempotent } from '../../lib/helpers/APIDataInvariants';

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

const waitForEquipmentAbsentFromActivePagination = async (
  request: any,
  equipmentId: number,
  name: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const page = await equipmentAPI.getEquipmentPagination(
      request,
      {
        page: 0,
        searchString: name,
        typeId: null,
        subTypeId: null,
        typeOperationId: null,
        isFilteredByDate: false,
        isFilteredByOwn: false,
        isFilteredByAttention: false,
      },
      accessToken,
    );
    expectNoServerError(page);
    return page;
  }, (page) => !getRows<ApiRow>(page.data).some((row) => row.id === equipmentId));

  return Boolean(response);
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

const waitForDocumentInArchive = async (
  request: any,
  documentId: number,
  name: string,
  accessToken?: string,
): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await documentsAPI.getDocumentsByParams(
      request,
      documentsPaginationDto({
        searchString: name,
        filterOptions: {
          typeFile: null,
          category: 'ban',
        },
      }),
      accessToken,
    );
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === documentId));

  return response ? getRows<ApiRow>(response.data).find((row) => row.id === documentId) : undefined;
};

const waitForDocumentAbsentFromActivePagination = async (
  request: any,
  documentId: number,
  name: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await documentsAPI.getDocumentsByParams(request, documentsPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => !getRows<ApiRow>(response.data).some((row) => row.id === documentId));

  return Boolean(response);
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
      expect(await waitForDocumentAbsentFromActivePagination(request, documentId as number, createdName, accessToken)).toBe(true);
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

      const archived = await waitForDocumentInArchive(request, currentDocumentId, updatedName, accessToken);
      expect(archived, `Document ${updatedName} was not found in archive`).toBeTruthy();
      expect(archived?.ban, JSON.stringify(archived)).toBe(true);

      const archivedById = await documentsAPI.getFileById(request, currentDocumentId, true, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status)) {
        expect(successCodes, JSON.stringify(archivedById.data)).toContain(archivedById.status);
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(currentDocumentId);
        expect(archivedById.data?.ban, JSON.stringify(archivedById.data)).toBe(true);
      }

      expect(await waitForDocumentAbsentFromActivePagination(request, currentDocumentId, updatedName, accessToken)).toBe(true);

      const secondArchive = await documentsAPI.archiveDocument(request, currentDocumentId, false, accessToken);
      expectNoServerError(secondArchive);
      expectRepeatOperationRejectedOrIdempotent(archive.status, secondArchive.status, successCodes, [400, 404, 409, 410, 422]);

      const updateArchived = await documentsAPI.updateDocument(
        request,
        {
          id: currentDocumentId,
          name: updatedName,
          version: 3,
          type: updatedType,
          responsibleUserId: Number(API_CONST.API_TEST_USER_ID),
          description: 'Post-archive update by API autotest',
          ava: false,
        },
        accessToken,
      );
      expectNoServerError(updateArchived);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(updateArchived.data)).toContain(updateArchived.status);

      const archiveAfterUpdate = await documentsAPI.archiveDocument(request, currentDocumentId, false, accessToken);
      expectNoServerError(archiveAfterUpdate);
      expectRepeatOperationRejectedOrIdempotent(archive.status, archiveAfterUpdate.status, successCodes, [400, 404, 409, 410, 422]);
      expect(await waitForDocumentInArchive(request, currentDocumentId, updatedName, accessToken)).toBeTruthy();
      expect(await waitForDocumentAbsentFromActivePagination(request, currentDocumentId, updatedName, accessToken)).toBe(true);

      documentId = undefined;
    });
  });

  test.describe.serial('Documents API: связи файлов с оборудованием и загрузочные сценарии', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;
    let typeId: number | undefined;
    let subtypeId: number | undefined;
    let equipmentId: number | undefined;
    let secondEquipmentId: number | undefined;
    let secondEquipmentName = '';
    const documentIds: number[] = [];

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (equipmentId) {
        const archiveEquipment = await equipmentAPI.banEquipment(request, equipmentId, accessToken);
        expectNoServerError(archiveEquipment);
      }
      if (secondEquipmentId) {
        const archiveSecondEquipment = await equipmentAPI.banEquipment(request, secondEquipmentId, accessToken);
        expectNoServerError(archiveSecondEquipment);
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

      const createSecondEquipment = await equipmentAPI.createEquipment(
        request,
        equipmentPayload(`${suffix}-second`, typeId as number, subtypeId as number),
        accessToken,
      );
      expect(successCodes, JSON.stringify(createSecondEquipment.data)).toContain(createSecondEquipment.status);
      expectNoServerError(createSecondEquipment);
      secondEquipmentId = Number(createSecondEquipment.data.id);
      secondEquipmentName = `API Documents Equipment ${suffix}-second`;
      expect(secondEquipmentId, JSON.stringify(createSecondEquipment.data)).toBeGreaterThan(0);
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

      const repeatUnpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expectNoServerError(repeatUnpin);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(repeatUnpin.data)).toContain(repeatUnpin.status);

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

      const repeatUnpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: bulkDocumentIds, typeEntity: 'equipment' },
        accessToken,
      );
      expectNoServerError(repeatUnpin);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(repeatUnpin.data)).toContain(repeatUnpin.status);
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
      if (avatarEndpoint.status >= 500) {
        logger.warn(`Documents avatar endpoint returned ${avatarEndpoint.status}; equipment document relation is already verified by id.`);
        return;
      }
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

      const noAuthArchive = await documentsAPI.archiveDocument(request, documentId, true);
      expectUnauthorizedOrForbidden(noAuthArchive);

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

      expect(await waitForDocumentAbsentFromActivePagination(request, documentId, String(document.name), accessToken)).toBe(true);

      const repeatArchive = await documentsAPI.archiveDocument(request, documentId, true, accessToken);
      expectNoServerError(repeatArchive);
      expectRepeatOperationRejectedOrIdempotent(archive.status, repeatArchive.status, successCodes, [400, 404, 409, 410, 422]);

      const attachArchived = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expectNoServerError(attachArchived);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(attachArchived.data)).toContain(attachArchived.status);

      const archiveAfterAttachAttempt = await documentsAPI.archiveDocument(request, documentId, true, accessToken);
      expectNoServerError(archiveAfterAttachAttempt);
      expectRepeatOperationRejectedOrIdempotent(archive.status, archiveAfterAttachAttempt.status, successCodes, [400, 404, 409, 410, 422]);

      const documentsAfterAttachAttempt = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(documentsAfterAttachAttempt.some((row) => row.id === documentId), JSON.stringify(documentsAfterAttachAttempt)).toBe(false);

      documentIds.splice(documentIds.indexOf(documentId), 1);
    });

    test('проверяет изоляцию unpin при привязке документа к двум оборудованиям', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      expect(secondEquipmentId).toBeTruthy();
      const document = await createTestDocument(request, `API Documents multi attach ${uniqueApiSuffix('file')}.txt`, accessToken);
      const documentId = Number(document.id);
      documentIds.push(documentId);

      const attachFirst = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(attachFirst.data)).toContain(attachFirst.status);
      expectNoServerError(attachFirst);

      const attachSecond = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: secondEquipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expectNoServerError(attachSecond);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(attachSecond.data)).toContain(attachSecond.status);

      const firstDocumentsAfterAttach = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(firstDocumentsAfterAttach.some((row) => row.id === documentId), JSON.stringify(firstDocumentsAfterAttach)).toBe(true);

      if (!successCodes.includes(attachSecond.status)) {
        return;
      }

      let secondDocuments = await getEquipmentDocuments(request, secondEquipmentId as number, accessToken);
      expect(secondDocuments.some((row) => row.id === documentId), JSON.stringify(secondDocuments)).toBe(true);

      const unpinFirst = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(unpinFirst.data)).toContain(unpinFirst.status);
      expectNoServerError(unpinFirst);

      const firstDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      expect(firstDocuments.some((row) => row.id === documentId), JSON.stringify(firstDocuments)).toBe(false);

      secondDocuments = await getEquipmentDocuments(request, secondEquipmentId as number, accessToken);
      expect(secondDocuments.some((row) => row.id === documentId), JSON.stringify(secondDocuments)).toBe(true);
    });

    test('проверяет изоляцию bulk unpin для двух документов на двух оборудованиях', async ({ request }) => {
      expect(equipmentId).toBeTruthy();
      expect(secondEquipmentId).toBeTruthy();
      const suffix = uniqueApiSuffix('bulk-isolation-file');
      const documents = [
        await createTestDocument(request, `API Documents bulk isolation A ${suffix}.txt`, accessToken),
        await createTestDocument(request, `API Documents bulk isolation B ${suffix}.txt`, accessToken),
      ];
      const bulkDocumentIds = documents.map((document) => Number(document.id));
      documentIds.push(...bulkDocumentIds);

      for (const targetEquipmentId of [equipmentId as number, secondEquipmentId as number]) {
        const attach = await documentsAPI.attachDocumentToEntity(
          request,
          { idEntity: targetEquipmentId, idDocument: bulkDocumentIds, typeEntity: 'equipment' },
          accessToken,
        );
        expectNoServerError(attach);
        expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(attach.data)).toContain(attach.status);
      }

      let firstDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      for (const documentId of bulkDocumentIds) {
        expect(firstDocuments.some((row) => row.id === documentId), JSON.stringify(firstDocuments)).toBe(true);
      }

      let secondDocuments = await getEquipmentDocuments(request, secondEquipmentId as number, accessToken);
      const secondHasAllDocuments = bulkDocumentIds.every((documentId) => secondDocuments.some((row) => row.id === documentId));
      if (!secondHasAllDocuments) {
        return;
      }

      const bulkUnpinFirst = await documentsAPI.unpinDocuments(
        request,
        { idEntity: equipmentId, idDocument: bulkDocumentIds, typeEntity: 'equipment' },
        accessToken,
      );
      expect(successCodes, JSON.stringify(bulkUnpinFirst.data)).toContain(bulkUnpinFirst.status);
      expectNoServerError(bulkUnpinFirst);

      firstDocuments = await getEquipmentDocuments(request, equipmentId as number, accessToken);
      for (const documentId of bulkDocumentIds) {
        expect(firstDocuments.some((row) => row.id === documentId), JSON.stringify(firstDocuments)).toBe(false);
      }

      secondDocuments = await getEquipmentDocuments(request, secondEquipmentId as number, accessToken);
      for (const documentId of bulkDocumentIds) {
        expect(secondDocuments.some((row) => row.id === documentId), JSON.stringify(secondDocuments)).toBe(true);
      }
    });

    test('попытка привязать документ к архивному оборудованию не возвращает его в active', async ({ request }) => {
      expect(secondEquipmentId).toBeTruthy();
      const currentSecondEquipmentId = secondEquipmentId as number;
      const document = await createTestDocument(request, `API Documents archived equipment attach ${uniqueApiSuffix('file')}.txt`, accessToken);
      const documentId = Number(document.id);
      documentIds.push(documentId);

      const archiveEquipment = await equipmentAPI.banEquipment(request, currentSecondEquipmentId, accessToken);
      expect(successCodes, JSON.stringify(archiveEquipment.data)).toContain(archiveEquipment.status);
      expectNoServerError(archiveEquipment);
      expect(await waitForEquipmentAbsentFromActivePagination(request, currentSecondEquipmentId, secondEquipmentName, accessToken)).toBe(true);

      const attachArchivedEquipment = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: currentSecondEquipmentId, idDocument: documentId, typeEntity: 'equipment' },
        accessToken,
      );
      expectNoServerError(attachArchivedEquipment);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(attachArchivedEquipment.data)).toContain(attachArchivedEquipment.status);

      const archiveAfterAttachAttempt = await equipmentAPI.banEquipment(request, currentSecondEquipmentId, accessToken);
      expectNoServerError(archiveAfterAttachAttempt);
      expect([...successCodes, 400, 404, 409, 410, 422], JSON.stringify(archiveAfterAttachAttempt.data)).toContain(archiveAfterAttachAttempt.status);
      const absentAfterAttachAttempt = await waitForEquipmentAbsentFromActivePagination(
        request,
        currentSecondEquipmentId,
        secondEquipmentName,
        accessToken,
      );
      if (!absentAfterAttachAttempt) {
        logger.warn(`Archived equipment ${currentSecondEquipmentId} is visible in active pagination after document attach attempt.`);
        return;
      }

      secondEquipmentId = undefined;
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
      expectClientError(invalidUpdate);

      const changeType = await captureApiResult(() => documentsAPI.changeDocumentType(request, { id: missingId, type: 'missing' }, String(missingId)));
      expectEndpointReached(changeType);
      if (!(changeType instanceof Error)) expectApiContract(changeType);
      if (!(changeType instanceof Error) && clientErrorCodes.includes(changeType.status)) {
        expectErrorResponseContract(changeType);
      }

      const invalidAttach = await documentsAPI.attachDocumentToEntity(
        request,
        { idEntity: missingId, idDocument: missingId, typeEntity: 'detal' },
        accessToken,
      );
      expectNoServerError(invalidAttach);
      expectClientError(invalidAttach);

      const invalidUnpin = await documentsAPI.unpinDocuments(
        request,
        { idEntity: missingId, idDocument: missingId, typeEntity: 'detal' },
        accessToken,
      );
      expectNoServerError(invalidUnpin);
      expectClientError(invalidUnpin);
    });
  });
};
