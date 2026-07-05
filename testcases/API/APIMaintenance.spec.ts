import { test } from '@playwright/test';
import { AssembleAPI } from '../../pages/API/APIAssemble';
import { CBEDAPI } from '../../pages/API/APICBED';
import { DeficitsAPI } from '../../pages/API/APIDeficits';
import { DetailsAPI } from '../../pages/API/APIDetails';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { ProductsAPI } from '../../pages/API/APIProducts';
import { SettingsAPI } from '../../pages/API/APISettings';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { WarehouseAPI } from '../../pages/API/APIWarehouse';
import { captureApiResult, expectEndpointReached } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';
import logger from '../../lib/utils/logger';

const missingId = 999999999;

const assembleAPI = new AssembleAPI(null);
const cbedAPI = new CBEDAPI(null);
const deficitsAPI = new DeficitsAPI(null);
const detailsAPI = new DetailsAPI(null);
const productionTasksAPI = new ProductionTasksAPI(null);
const productsAPI = new ProductsAPI(null as any);
const settingsAPI = new SettingsAPI(null as any);
const shipmentsAPI = new ShipmentsAPI(null as any);
const warehouseAPI = new WarehouseAPI(null as any);

export const runMaintenanceAPINew = () => {
  logger.info('Starting Maintenance API suite');

  test.describe('Maintenance API: глобальные и потенциально тяжелые endpoint-ы', () => {
    test.describe.configure({ timeout: 120000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('[maintenance] пересчеты дефицитов и производственных связей достигают endpoint', async ({ request }) => {
      const responses = [
        await captureApiResult(() => deficitsAPI.updateAllDeficits(request, accessToken)),
        await captureApiResult(() => productionTasksAPI.updateAllTaskRelative(request, accessToken)),
      ];

      for (const response of responses) {
        expectEndpointReached(response);
      }
    });

    test('[maintenance] глобальные актуализации аватаров и отгрузок достигают endpoint', async ({ request }) => {
      const responses = [
        await captureApiResult(() => cbedAPI.actualAvatar(request, accessToken)),
        await captureApiResult(() => detailsAPI.updateDetailAvatar(request, accessToken)),
        await captureApiResult(() => productsAPI.actualAvatar(request, accessToken)),
        await captureApiResult(() => shipmentsAPI.actualAllShipments(request, accessToken)),
      ];

      for (const response of responses) {
        expectEndpointReached(response);
      }
    });

    test('[maintenance] складские и settings операции достигают endpoint', async ({ request }) => {
      const responses = [
        await captureApiResult(() => warehouseAPI.resetInSets(request, accessToken)),
        await captureApiResult(() => warehouseAPI.complitAssembly(request, missingId, 'product', accessToken)),
        await captureApiResult(() => settingsAPI.newDB(request, accessToken)),
        await captureApiResult(() => assembleAPI.banComplect(request, missingId, accessToken)),
        await captureApiResult(() => assembleAPI.updateResponsibleKit(request, missingId, missingId, accessToken)),
      ];

      for (const response of responses) {
        expectEndpointReached(response);
      }
    });
  });
};
