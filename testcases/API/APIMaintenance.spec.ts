import { test, expect } from '@playwright/test';
import { DeficitsAPI } from '../../pages/API/APIDeficits';
import { ProductionTasksAPI } from '../../pages/API/APIProductionTasks';
import { SettingsAPI } from '../../pages/API/APISettings';
import { ShipmentsAPI } from '../../pages/API/APIShipments';
import { WarehouseAPI } from '../../pages/API/APIWarehouse';
import { expectErrorResponseContract, expectUnauthorizedOrForbidden } from '../../lib/helpers/APIAssertions';
import { getAuthToken } from '../../lib/helpers/APITestUtils';

const deficitsAPI = new DeficitsAPI(null);
const productionTasksAPI = new ProductionTasksAPI(null);
const settingsAPI = new SettingsAPI(null as any);
const shipmentsAPI = new ShipmentsAPI(null as any);
const warehouseAPI = new WarehouseAPI(null as any);

export const runMaintenanceAPINew = () => {
  test.describe('Maintenance API: защита глобальных операций', () => {
    // No login in this group: the request context must have an empty cookie jar.
    test('запрещает пересчет дефицитов без авторизации', async ({ request }) => {
      const response = await deficitsAPI.updateAllDeficits(request);
      expectUnauthorizedOrForbidden(response);
      expectErrorResponseContract(response);
    });

    test('запрещает пересчет производственных связей без авторизации', async ({ request }) => {
      const response = await productionTasksAPI.updateAllTaskRelative(request);
      expectUnauthorizedOrForbidden(response);
      expectErrorResponseContract(response);
    });

    test('запрещает глобальную актуализацию отгрузок без авторизации', async ({ request }) => {
      const response = await shipmentsAPI.actualAllShipments(request);
      expectUnauthorizedOrForbidden(response);
      expectErrorResponseContract(response);
    });

    test.skip('[maintenance] глобальный сброс резервов требует отдельной одноразовой базы', async ({ request }) => {
      const accessToken = await getAuthToken(request);
      const response = await warehouseAPI.resetInSets(request, accessToken);
      expect(response.status).toBe(200);
      expect(response.data).toBe(true);
    });

    test('запрещает скачивание dump без авторизации', async ({ request }) => {
      const response = await settingsAPI.downloadDb(request, 'api-negative-missing-dump.sql');
      expectUnauthorizedOrForbidden(response);
      expectErrorResponseContract(response);
    });
  });
};
