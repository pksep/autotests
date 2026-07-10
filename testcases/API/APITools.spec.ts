import { test, expect } from '@playwright/test';
import { ToolsAPI } from '../../pages/API/APITools';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectNoServerError,
  expectClientError,
  expectErrorResponseContract,
  expectPaginationContract,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { eventually, getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const toolsAPI = new ToolsAPI(null);

const TYPE = 'TYPE';
const SUBTYPE = 'SUBTYPE';
const TOOLS_INSTANCE = 1;

const toolsPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  typeId: null,
  subTypeId: null,
  instance_type: TOOLS_INSTANCE,
  isFilteredByDate: false,
  isFilteredByOwn: false,
  isFilteredByAttention: false,
  ...overrides,
});

const toolPayload = (
  suffix: string,
  typeId: number,
  subtypeId: number,
  overrides: Record<string, unknown> = {},
) => ({
  name: `API Tool ${suffix}`,
  deliveryTime: '0',
  mountUsed: '0',
  minRemaining: '0',
  description: `Created by API autotest ${suffix}`,
  responsibleUserId: 'null',
  parentId: subtypeId,
  rootParentId: typeId,
  docs: 'null',
  attention: false,
  companyIds: '[]',
  documentsBase: '[]',
  ...overrides,
});

const expectBaseShape = (row: ApiRow) => {
  expect(row).toBeTruthy();
  expect(typeof row.id, JSON.stringify(row)).toBe('number');
  expect(row.name, JSON.stringify(row)).toBeTruthy();
};

const findToolByName = async (request: any, name: string, accessToken?: string): Promise<ApiRow | undefined> => {
  const response = await eventually(async () => {
    const response = await toolsAPI.getToolPagination(request, toolsPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => getRows<ApiRow>(response.data).some((row) => row.name === name));

  return response ? getRows<ApiRow>(response.data).find((row) => row.name === name) : undefined;
};

const waitForToolAbsentFromActivePagination = async (
  request: any,
  toolId: number,
  name: string,
  accessToken?: string,
): Promise<boolean> => {
  const response = await eventually(async () => {
    const response = await toolsAPI.getToolPagination(request, toolsPaginationDto({ searchString: name }), accessToken);
    expectNoServerError(response);
    return response;
  }, (response) => !getRows<ApiRow>(response.data).some((row) => row.id === toolId));

  return Boolean(response);
};

export const runToolsAPINew = () => {
  logger.info('Starting Tools API coverage suite');

  test.describe.serial('Tools API: базовый жизненный цикл инструмента', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let typeId: number | undefined;
    let subtypeId: number | undefined;
    let toolId: number | undefined;
    let suffix = '';
    let typeName = '';
    let subtypeName = '';
    let toolName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (toolId) {
        const archiveTool = await toolsAPI.banTool(request, toolId, accessToken);
        expectNoServerError(archiveTool);
      }
      if (subtypeId) {
        const archiveSubtype = await toolsAPI.removeToolSubtype(request, subtypeId, accessToken);
        expectNoServerError(archiveSubtype);
      }
      if (typeId) {
        const archiveType = await toolsAPI.removeToolType(request, typeId, accessToken);
        expectNoServerError(archiveType);
      }
    });

    test('создает тип и подтип инструмента', async ({ request }) => {
      suffix = uniqueApiSuffix('tool');
      typeName = `API Tool Type ${suffix}`;
      subtypeName = `API Tool Subtype ${suffix}`;
      toolName = `API Tool ${suffix}`;

      const uniqueType = await toolsAPI.checkNameUnique(request, { type: TYPE, name: typeName }, accessToken);
      expectNoServerError(uniqueType);
      if (!clientErrorCodes.includes(uniqueType.status)) {
        expect(Number(uniqueType.data), JSON.stringify(uniqueType.data)).toBe(0);
      }

      const typeResponse = await toolsAPI.createToolType(request, { name: typeName, instanceType: TOOLS_INSTANCE }, accessToken);
      expect(successCodes, JSON.stringify(typeResponse.data)).toContain(typeResponse.status);
      expectNoServerError(typeResponse);
      expectBaseShape(typeResponse.data);
      typeId = Number(typeResponse.data.id);

      const subtypeResponse = await toolsAPI.createToolSubtype(request, { name: subtypeName, parentId: typeId }, accessToken);
      expect(successCodes, JSON.stringify(subtypeResponse.data)).toContain(subtypeResponse.status);
      expectNoServerError(subtypeResponse);
      expectBaseShape(subtypeResponse.data);
      subtypeId = Number(subtypeResponse.data.id);
    });

    test('обновляет тип и подтип инструмента и читает их по id', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      typeName = `${typeName} Updated`;
      subtypeName = `${subtypeName} Updated`;

      const updateType = await toolsAPI.updateToolType(request, { id: typeId, name: typeName, instance_type: TOOLS_INSTANCE }, accessToken);
      expectNoServerError(updateType);
      expect(successCodes, JSON.stringify(updateType.data)).toContain(updateType.status);
      expect(updateType.data?.name, JSON.stringify(updateType.data)).toBe(typeName);

      const updateSubtype = await toolsAPI.updateToolSubtype(request, { id: subtypeId, name: subtypeName }, accessToken);
      expectNoServerError(updateSubtype);
      expect(successCodes, JSON.stringify(updateSubtype.data)).toContain(updateSubtype.status);
      expect(updateSubtype.data?.name, JSON.stringify(updateSubtype.data)).toBe(subtypeName);

      const typeById = await toolsAPI.getToolTypeById(request, typeId as number, accessToken);
      expectNoServerError(typeById);
      if (!clientErrorCodes.includes(typeById.status)) {
        expect(successCodes).toContain(typeById.status);
        expect(typeById.data?.id, JSON.stringify(typeById.data)).toBe(typeId);
      }

      const subtypeById = await toolsAPI.getToolSubtypeById(request, subtypeId as number, accessToken);
      expectNoServerError(subtypeById);
      if (!clientErrorCodes.includes(subtypeById.status)) {
        expect(successCodes).toContain(subtypeById.status);
        expect(subtypeById.data?.id, JSON.stringify(subtypeById.data)).toBe(subtypeId);
      }
    });

    test('создает, читает и обновляет наименование инструмента', async ({ request }) => {
      expect(typeId).toBeTruthy();
      expect(subtypeId).toBeTruthy();

      const duplicateBefore = await toolsAPI.checkNameExisting(request, { name: toolName }, accessToken);
      expectNoServerError(duplicateBefore);

      const create = await toolsAPI.createTool(request, toolPayload(suffix, typeId as number, subtypeId as number), accessToken);
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectNoServerError(create);
      toolId = Number(create.data?.id);
      expect(toolId, JSON.stringify(create.data)).toBeGreaterThan(0);

      const byId = await toolsAPI.getOneTool(request, toolId, accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data?.id, JSON.stringify(byId.data)).toBe(toolId);
      }

      const updatedName = `${toolName} Updated`;
      const update = await toolsAPI.updateTool(
        request,
        toolPayload(suffix, typeId as number, subtypeId as number, {
          id: toolId,
          name: updatedName,
          attention: true,
          description: 'Updated by API autotest',
        }),
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);

      const updated = await findToolByName(request, updatedName, accessToken);
      expect(updated, `Tool ${updatedName} was not found after update`).toBeTruthy();
      expect(updated?.id).toBe(toolId);

      const persisted = await toolsAPI.getOneTool(request, toolId, accessToken);
      expectNoServerError(persisted);
      if (!clientErrorCodes.includes(persisted.status)) {
        expect(successCodes).toContain(persisted.status);
        expect(persisted.data?.id, JSON.stringify(persisted.data)).toBe(toolId);
        expect(persisted.data?.name, JSON.stringify(persisted.data)).toBe(updatedName);
        expect(persisted.data?.attention, JSON.stringify(persisted.data)).toBe(true);
        expect(persisted.data?.description, JSON.stringify(persisted.data)).toBe('Updated by API autotest');
      }
      toolName = updatedName;
    });

    test('архивирует наименование инструмента и служебные типы', async ({ request }) => {
      expect(toolId).toBeTruthy();
      const currentToolId = toolId as number;

      const archiveTool = await toolsAPI.banTool(request, currentToolId, accessToken);
      expectNoServerError(archiveTool);
      expect(successCodes, JSON.stringify(archiveTool.data)).toContain(archiveTool.status);
      if (archiveTool.data && typeof archiveTool.data === 'object') {
        expect(archiveTool.data.ban, JSON.stringify(archiveTool.data)).toBe(true);
      }

      const archived = await eventually(async () => {
        const response = await toolsAPI.getArchivedTools(request, { searchString: toolName }, accessToken);
        expectNoServerError(response);
        return response;
      }, (response) => getRows<ApiRow>(response.data).some((row) => row.id === currentToolId));
      expect(archived, `Tool ${toolName} was not found in archive`).toBeTruthy();

      const archivedById = await toolsAPI.getOneTool(request, currentToolId, accessToken);
      expectNoServerError(archivedById);
      if (!clientErrorCodes.includes(archivedById.status)) {
        expect(successCodes, JSON.stringify(archivedById.data)).toContain(archivedById.status);
        expect(Number(archivedById.data?.id), JSON.stringify(archivedById.data)).toBe(currentToolId);
        expect(archivedById.data?.ban, JSON.stringify(archivedById.data)).toBe(true);
      }

      expect(await waitForToolAbsentFromActivePagination(request, currentToolId, toolName, accessToken)).toBe(true);
      toolId = undefined;

      const archiveSubtype = await toolsAPI.removeToolSubtype(request, subtypeId as number, accessToken);
      expectNoServerError(archiveSubtype);
      subtypeId = undefined;

      const archiveType = await toolsAPI.removeToolType(request, typeId as number, accessToken);
      expectNoServerError(archiveType);
      typeId = undefined;
    });
  });

  test.describe('Tools API: базовое чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает справочники, пагинации и дефициты без серверных ошибок', async ({ request }) => {
      const types = await toolsAPI.getToolTypes(request, accessToken);
      expectNoServerError(types);
      if (!clientErrorCodes.includes(types.status)) {
        expect(successCodes).toContain(types.status);
        expect(Array.isArray(types.data), JSON.stringify(types.data)).toBe(true);
      }

      const subtypes = await toolsAPI.getToolSubtypes(request, accessToken);
      expectNoServerError(subtypes);
      if (!clientErrorCodes.includes(subtypes.status)) {
        expect(successCodes).toContain(subtypes.status);
        expect(Array.isArray(subtypes.data), JSON.stringify(subtypes.data)).toBe(true);
      }

      const tools = await toolsAPI.getAllTools(request, accessToken);
      expectNoServerError(tools);

      const typePagination = await toolsAPI.getTypePagination(request, toolsPaginationDto(), accessToken);
      expectNoServerError(typePagination);
      if (!clientErrorCodes.includes(typePagination.status)) expectPaginationContract(typePagination.data);

      const subtypePagination = await toolsAPI.getSubtypePagination(request, toolsPaginationDto(), accessToken);
      expectNoServerError(subtypePagination);
      if (!clientErrorCodes.includes(subtypePagination.status)) expectPaginationContract(subtypePagination.data);

      const toolPagination = await toolsAPI.getToolPagination(request, toolsPaginationDto(), accessToken);
      expectNoServerError(toolPagination);
      if (!clientErrorCodes.includes(toolPagination.status)) expectPaginationContract(toolPagination.data);

      const deficits = await toolsAPI.getDeficitTools(request, accessToken);
      expectNoServerError(deficits);
    });

    test('защитные payload и несуществующие id не приводят к 5xx', async ({ request }) => {
      for (const name of [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ]) {
        const unique = await toolsAPI.checkNameUnique(request, { type: TYPE, name }, accessToken);
        expectNoServerError(unique);

        const pagination = await toolsAPI.getToolPagination(request, toolsPaginationDto({ searchString: name }), accessToken);
        expectNoServerError(pagination);
      }

      const byTypeId = await toolsAPI.getToolTypeById(request, 999999999, accessToken);
      expectNoServerError(byTypeId);

      const removeFile = await toolsAPI.removeFileTool(request, 999999999, accessToken);
      expectNoServerError(removeFile);
      if (clientErrorCodes.includes(removeFile.status)) expectErrorResponseContract(removeFile);

      const invalidCreate = await toolsAPI.createTool(
        request,
        toolPayload('invalid', 1, 1, { name: '', parentId: 'null', rootParentId: 'null', companyIds: '[]' }),
        accessToken,
      );
      expectClientError(invalidCreate);
    });
  });
};
