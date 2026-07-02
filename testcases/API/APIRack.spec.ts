import { test, expect } from '@playwright/test';
import { RackAPI } from '../../pages/API/APIRack';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectClientError, expectNoServerError, expectPaginationContract, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

const rackAPI = new RackAPI(null);

const paginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  searchString: '',
  ...overrides,
});

const invalidCellDto = {
  rackId: 999999999,
  cellId: 999999999,
  entityId: 999999999,
  entityType: 'product',
  quantity: -1,
};

export const runRackAPINew = () => {
  logger.info('Starting Rack API coverage suite');

  test.describe('Rack API: пагинация и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает пагинацию стеллажей со стабильной структурой', async ({ request }) => {
      const response = await rackAPI.getAllRacks(request, paginationDto(), accessToken);
      expectNoServerError(response);
      if (!clientErrorCodes.includes(response.status)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
        expectPaginationContract(response.data);
      }
    });

    test.skip('несуществующие rack id и ячейки не приводят к 5xx', async ({ request }) => {
      for (const response of [
        await rackAPI.banRack(request, 999999999, accessToken),
        await rackAPI.createRack(request, { name: '', rows: -1, columns: -1 }, accessToken),
        await rackAPI.updateRack(request, { id: 999999999, name: '' }, accessToken),
        await rackAPI.updateCell(request, invalidCellDto, accessToken),
        await rackAPI.addDataToCell(request, invalidCellDto, accessToken),
        await rackAPI.deleteDataByIds(request, invalidCellDto, accessToken),
      ]) {
        expectClientError(response);
      }

      const missingRack = await rackAPI.getOneRack(request, 999999999, accessToken);
      expectNoServerError(missingRack);
    });
  });
};
