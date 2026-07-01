import { test, expect } from '@playwright/test';
import { RolesAPI } from '../../pages/API/APIRoles';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';
import { clientErrorCodes, expectNoServerError, expectNotSuccessful, getRows, successCodes } from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiRow = Record<string, any>;

const rolesAPI = new RolesAPI(null as any);

const rolePayload = (name: string, description = 'Created by API autotest') => ({
  name,
  description,
});

const expectRoleShape = (role: ApiRow) => {
  expect(role).toBeTruthy();
  expect(typeof role.id, JSON.stringify(role)).toBe('number');
  expect(role.name, JSON.stringify(role)).toBeTruthy();
};

export const runRolesAPINew = () => {
  logger.info('Starting Roles API coverage suite');

  test.describe.serial('Roles API: жизненный цикл тестовой роли', () => {
    test.describe.configure({ timeout: 90000 });

    let accessToken: string | undefined;
    let roleId: number | undefined;
    let roleName = '';

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test.afterAll(async ({ request }) => {
      if (!roleId) return;
      const cleanup = await rolesAPI.deleteRole(request, String(roleId), 'api-roles', accessToken);
      expectNoServerError(cleanup);
    });

    test('создает роль, проверяет уникальность и читает ее по name/id', async ({ request }) => {
      roleName = `API Role ${uniqueApiSuffix('role')}`;

      const uniqueBefore = await rolesAPI.checkRoleNameUnique(request, { name: roleName }, accessToken);
      expectNoServerError(uniqueBefore);
      if (!clientErrorCodes.includes(uniqueBefore.status)) {
        expect(Number(uniqueBefore.data), JSON.stringify(uniqueBefore.data)).toBe(0);
      }

      const create = await rolesAPI.createRole(request, rolePayload(roleName), 'api-roles', accessToken);
      expectNoServerError(create);
      expect(successCodes, JSON.stringify(create.data)).toContain(create.status);
      expectRoleShape(create.data);
      roleId = Number(create.data.id);

      const uniqueAfter = await rolesAPI.checkRoleNameUnique(request, { name: roleName }, accessToken);
      expectNoServerError(uniqueAfter);
      if (!clientErrorCodes.includes(uniqueAfter.status)) {
        expect(Number(uniqueAfter.data), JSON.stringify(uniqueAfter.data)).toBe(roleId);
      }

      const byName = await rolesAPI.getRoleByName(request, roleName, accessToken);
      expectNoServerError(byName);
      if (!clientErrorCodes.includes(byName.status)) {
        expect(successCodes).toContain(byName.status);
        expect(byName.data.id, JSON.stringify(byName.data)).toBe(roleId);
      }

      const byId = await rolesAPI.getRoleById(request, String(roleId), accessToken);
      expectNoServerError(byId);
      if (!clientErrorCodes.includes(byId.status)) {
        expect(successCodes).toContain(byId.status);
        expect(byId.data.id, JSON.stringify(byId.data)).toBe(roleId);
      }
    });

    test('обновляет описание и имя тестовой роли', async ({ request }) => {
      expect(roleId).toBeTruthy();
      roleName = `${roleName} Updated`;

      const update = await rolesAPI.updateRole(
        request,
        { id: roleId, name: roleName, description: 'Updated by API autotest' },
        'api-roles',
        accessToken,
      );
      expectNoServerError(update);
      expect(successCodes, JSON.stringify(update.data)).toContain(update.status);
      expect(update.data.id, JSON.stringify(update.data)).toBe(roleId);
      expect(update.data.name, JSON.stringify(update.data)).toBe(roleName);
    });

    test('архивирует тестовую роль', async ({ request }) => {
      expect(roleId).toBeTruthy();

      const remove = await rolesAPI.deleteRole(request, String(roleId), 'api-roles', accessToken);
      expectNoServerError(remove);
      expect(successCodes, JSON.stringify(remove.data)).toContain(remove.status);
      if (remove.data && typeof remove.data === 'object') {
        expect(remove.data.ban, JSON.stringify(remove.data)).toBe(true);
      }
      roleId = undefined;
    });
  });

  test.describe('Roles API: чтение и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('возвращает список активных ролей', async ({ request }) => {
      const response = await rolesAPI.getAllRoles(request, accessToken);

      expectNoServerError(response);
      if (clientErrorCodes.includes(response.status)) return;

      expect(successCodes).toContain(response.status);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      const rows = getRows<ApiRow>(response.data);
      if (rows.length > 0) {
        expectRoleShape(rows[0]);
        expect(rows[0].ban, JSON.stringify(rows[0])).not.toBe(true);
      }
    });

    test('не раскрывает серверные ошибки для несуществующих ролей', async ({ request }) => {
      const byName = await rolesAPI.getRoleByName(request, 'api-role-no-match-999999999', accessToken);
      expectNoServerError(byName);

      const byId = await rolesAPI.getRoleById(request, '999999999', accessToken);
      expectNoServerError(byId);

      const remove = await rolesAPI.deleteRole(request, '999999999', 'api-roles', accessToken);
      expectNoServerError(remove);
    });

    test('отклоняет невалидные payload без 5xx', async ({ request }) => {
      for (const name of [
        '',
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
      ]) {
        const unique = await rolesAPI.checkRoleNameUnique(request, { name }, accessToken);
        expectNoServerError(unique);
      }

      const createInvalid = await rolesAPI.createRole(request, rolePayload('', ''), 'api-roles', accessToken);
      expectNotSuccessful(createInvalid);

      const updateInvalid = await rolesAPI.updateRole(
        request,
        { id: 999999999, name: 'API Missing Role', description: '' },
        'api-roles',
        accessToken,
      );
      expectNotSuccessful(updateInvalid);

      const accessInvalid = await rolesAPI.updateRoleAccess(
        request,
        { roleId: 999999999, accesses: null },
        'api-roles',
        accessToken,
      );
      expectNotSuccessful(accessInvalid);
    });
  });
};
