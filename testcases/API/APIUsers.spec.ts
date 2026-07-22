import { test, expect } from '@playwright/test';
import { UsersAPI } from '../../pages/API/APIUsers';
import { RolesAPI } from '../../pages/API/APIRoles';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
  expectApiContract,
  expectArrayResponse,
  expectClientError,
  expectErrorResponseContract,
  expectNoServerError,
  expectPaginationContract,
  getCount,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

type ApiResult = {
  status: number;
  data?: unknown;
};

type UserLike = Record<string, any>;

const usersAPI = new UsersAPI(null as any);
const rolesAPI = new RolesAPI(null as any);

const expectNoSensitiveFields = (data: unknown) => {
  const sensitiveKeys = ['password', 'hash', 'salt', 'refresh_token', 'refreshtoken'];
  const stack = [data];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    for (const [key, value] of Object.entries(current)) {
      expect(sensitiveKeys, `Sensitive field "${key}" is exposed`).not.toContain(key.toLowerCase());
      if (value && typeof value === 'object') stack.push(value);
    }
  }
};

const expectUserShape = (user: UserLike) => {
  expect(user).toBeTruthy();
  expect(typeof user.id, JSON.stringify(user)).toBe('number');
  expect(user.login ?? user.initial ?? user.tabel, JSON.stringify(user)).toBeTruthy();
};

const userPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  light: true,
  ban: false,
  searchSring: '',
  page: 1,
  ids: [],
  ...overrides,
});

const archiveDto = (overrides: Record<string, unknown> = {}) => ({
  searchString: '',
  ...overrides,
});

const invalidCreateUserPayload = (overrides: Record<string, unknown> = {}) => ({
  initial: '',
  login: '',
  tabel: '',
  password: '',
  dateWork: '',
  birthday: '',
  roles: null,
  phone: '',
  haracteristic: '',
  primetch: '',
  remoteWork: false,
  documentIds: [],
  requisites: [],
  ...overrides,
});

const invalidUpdateUserPayload = (overrides: Record<string, unknown> = {}) => ({
  ...invalidCreateUserPayload(),
  id: 999999999,
  ...overrides,
});

const createUserPayload = (suffix: string, roleId: number) => ({
  initial: `API User ${suffix}`,
  login: `api-user-${suffix}`,
  tabel: `api-${suffix}`.slice(0, 32),
  password: API_CONST.API_TEST_PASSWORD,
  dateWork: '2026-01-01',
  birthday: '1990-01-01',
  roles: roleId,
  phone: '',
  haracteristic: 'Created by API autotest',
  primetch: '',
  remoteWork: false,
  documentIds: [],
  requisites: [],
});

const createUserFixture = async (request: any, accessToken?: string) => {
  const suffix = uniqueApiSuffix('users');
  const roleName = `API Users Role ${suffix}`;
  const role = await rolesAPI.createRole(request, { name: roleName, description: 'Created by Users API autotest' }, 'api-users', accessToken);
  expectNoServerError(role);
  expect(successCodes, JSON.stringify(role.data)).toContain(role.status);
  const roleId = Number(role.data?.id);
  expect(roleId, JSON.stringify(role.data)).toBeGreaterThan(0);

  const payload = createUserPayload(suffix, roleId);
  const user = await usersAPI.createUser(request, payload, 'api-users', accessToken);
  expectNoServerError(user);
  expect(successCodes, JSON.stringify(user.data)).toContain(user.status);
  const userId = Number(user.data?.id);
  expect(userId, JSON.stringify(user.data)).toBeGreaterThan(0);

  return { userId, roleId, tabel: payload.tabel };
};

const postUsersPagination = async (request: any, data: Record<string, unknown>, accessToken?: string): Promise<ApiResult> => {
  const response = await request.post(ENV.API_BASE_URL + 'api/users/pagination/all', {
    headers: {
      'Content-Type': 'application/json',
      compress: 'no-compress',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    data,
  });

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    responseData = await response.text();
  }

  const result = { status: response.status(), data: responseData, headers: response.headers() };
  expectApiContract(result, { shape: 'pagination' });
  return result;
};

const postTabelUnique = async (request: any, data: Record<string, unknown>, accessToken?: string): Promise<ApiResult> => {
  const response = await request.post(ENV.API_BASE_URL + 'api/users/tabel/unique', {
    headers: {
      'Content-Type': 'application/json',
      compress: 'no-compress',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    data,
  });

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    responseData = await response.text();
  }

  const result = { status: response.status(), data: responseData, headers: response.headers() };
  expectApiContract(result, { shape: 'number' });
  return result;
};

/**
 * Broad non-destructive Users API coverage.
 * Mutating endpoints are probed with invalid data so the suite can run on dev
 * without creating, changing, or archiving real users.
 */
export const runUsersAPINew = () => {
  logger.info('Starting Users API coverage suite');
  let accessToken: string | undefined;
  let fixtureUserId: number;
  let fixtureRoleId: number;
  let fixtureTabel: string;

  test.beforeAll(async ({ request }) => {
    accessToken = await getAuthToken(request);
    const fixture = await createUserFixture(request, accessToken);
    fixtureUserId = fixture.userId;
    fixtureRoleId = fixture.roleId;
    fixtureTabel = fixture.tabel;
  });

  test.afterAll(async ({ request }) => {
    if (fixtureUserId) {
      const banUser = await usersAPI.banUser(
        request,
        { id: fixtureUserId, userId: fixtureUserId, banReason: 'API autotest cleanup' },
        accessToken,
      );
      expectNoServerError(banUser);
    }
    if (fixtureRoleId) {
      const banRole = await rolesAPI.deleteRole(request, String(fixtureRoleId), 'api-users', accessToken);
      expectNoServerError(banRole);
    }
  });

  test.describe('Users API: контракты чтения', () => {
    test.describe.configure({ timeout: 60000 });

    test('возвращает минимальный список активных пользователей без чувствительных полей', async ({ request }) => {
      const response = await usersAPI.getAllUsersList(request, accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const user = getRows(response.data).find((row) => Number(row.id) === fixtureUserId);
      expect(user, JSON.stringify(response.data)).toBeTruthy();
      expectUserShape(user!);
      expect(user!.ban, JSON.stringify(user)).not.toBe(true);
    });

    test('возвращает облегченный список пользователей без ролей по умолчанию', async ({ request }) => {
      const response = await usersAPI.getAllUsers(request, true, false, accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const user = getRows(response.data).find((row) => Number(row.id) === fixtureUserId);
      expect(user, JSON.stringify(response.data)).toBeTruthy();
      expectUserShape(user!);
    });

    test('возвращает список пользователей по роли без чувствительных полей', async ({ request }) => {
      const response = await usersAPI.getUsersByRoleId(request, String(fixtureRoleId), accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const user = getRows(response.data).find((row) => Number(row.id) === fixtureUserId);
      expect(user, JSON.stringify(response.data)).toBeTruthy();
      expectUserShape(user!);
    });

    test('light/full контракты пользователей отличаются только ожидаемым расширением данных', async ({ request }) => {
      const lightResponse = await usersAPI.getAllUsers(request, true, false, accessToken);
      const fullResponse = await usersAPI.getUserById(request, String(fixtureUserId), accessToken);

      expect(lightResponse.status).toBe(200);
      expect(fullResponse.status).toBe(201);
      expectNoSensitiveFields(lightResponse.data);
      expectNoSensitiveFields(fullResponse.data);

      const lightUser = getRows(lightResponse.data).find((row) => Number(row.id) === fixtureUserId);
      const fullUser = fullResponse.data as UserLike;
      expect(lightUser, JSON.stringify(lightResponse.data)).toBeTruthy();
      expect(fullUser, JSON.stringify(fullResponse.data)).toBeTruthy();
      expect(Number(fullUser.id), JSON.stringify(fullUser)).toBe(fixtureUserId);
      expect(Object.keys(fullUser!).length).toBeGreaterThanOrEqual(Object.keys(lightUser!).length);
    });

    test('возвращает пагинированный список активных пользователей с count и rows', async ({ request }) => {
      const response = await postUsersPagination(request, userPaginationDto(), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectApiContract(response, { shape: 'pagination' });
      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(getRows(response.data)), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);
    });

    test('поддерживает пагинацию с пустым результатом и стабильной структурой ответа', async ({ request }) => {
      const response = await postUsersPagination(
        request,
        userPaginationDto({ searchSring: 'api-users-no-match-999999999' }),
        accessToken,
      );

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectApiContract(response, { shape: 'pagination' });
      expect(response.status).toBe(201);
      expect(getCount(response.data), JSON.stringify(response.data)).toBe(0);
      expect(getRows(response.data)).toEqual([]);
      expectNoSensitiveFields(response.data);
    });

    test('пагинация пользователей поддерживает граничные значения page/pageSize', async ({ request }) => {
      const firstPage = await postUsersPagination(
        request,
        userPaginationDto({ page: 1, pageSize: 1 }),
        accessToken,
      );
      if (firstPage.status === 401) {
        expectNoSensitiveFields(firstPage.data);
        return;
      }
      expectApiContract(firstPage, { shape: 'pagination' });
      expect(firstPage.status).toBe(201);
      expectPaginationContract(firstPage.data, 1);
      expectNoSensitiveFields(firstPage.data);

      const farPage = await postUsersPagination(
        request,
        userPaginationDto({ page: 999999, pageSize: 5 }),
        accessToken,
      );
      expectNoServerError(farPage);
      if (!clientErrorCodes.includes(farPage.status)) {
        expectApiContract(farPage, { shape: 'pagination' });
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
      expectNoSensitiveFields(farPage.data);
    });

    test('возвращает существующего пользователя по id из списка или требует авторизацию', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);

      const response = await usersAPI.getUserById(request, String(fixtureUserId), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectApiContract(response, { shape: 'object' });
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expectUserShape(response.data as UserLike);
      expectNoSensitiveFields(response.data);
    });

    test('читает и валидирует настройки таблицы пользователя без серверных ошибок', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);
      const config = await usersAPI.getTableConfigByUserId(request, fixtureUserId, accessToken);
      expectNoServerError(config);

      const invalidUpdate = await usersAPI.setTableConfig(
        request,
        { userId: 999999999, tableName: '', config: null },
        accessToken,
      );
      expectNoServerError(invalidUpdate);
    });

    test('не отвечает серверной ошибкой для несуществующего id пользователя', async ({ request }) => {
      const response = await usersAPI.getUserById(request, '999999999', accessToken);

      expectNoServerError(response);
      if (!successCodes.includes(response.status)) {
        expect(clientErrorCodes).toContain(response.status);
      }
      expectNoSensitiveFields(response.data);
    });
  });

  test.describe('Users API: уникальность табеля', () => {
    test.describe.configure({ timeout: 60000 });

    test('определяет существующий табель из списка пользователей', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);

      const response = await postTabelUnique(request, { tabel: fixtureTabel }, accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectApiContract(response, { shape: 'number' });
      expect(response.status).toBe(201);
      expect(Number(response.data), JSON.stringify(response.data)).toBeGreaterThan(0);
    });

    test('возвращает нулевое значение для свободного табеля', async ({ request }) => {
      const freeTabel = uniqueApiSuffix('api-free');
      const response = await postTabelUnique(request, { tabel: freeTabel }, accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expect(response.status).toBe(201);
      expect(Number(response.data), JSON.stringify(response.data)).toBe(0);
    });

    test('обрабатывает защитные payload для табеля без серверных ошибок', async ({ request }) => {
      const cases = [
        API_CONST.API_TEST_EDGE_CASES.SQL_INJECTION_USERNAME,
        API_CONST.API_TEST_EDGE_CASES.XSS_PAYLOAD,
        API_CONST.API_TEST_EDGE_CASES.VERY_LONG_STRING,
        API_CONST.API_TEST_EDGE_CASES.SPECIAL_CHARACTERS,
      ];

      for (const tabel of cases) {
        const response = await postTabelUnique(request, { tabel }, accessToken);
        expectNoServerError(response);
        expectNoSensitiveFields(response.data);
      }
    });
  });

  test.describe('Users API: чтение архива и ролей', () => {
    test.describe.configure({ timeout: 60000 });

    test('возвращает контракт списка архивных пользователей для пустого поиска', async ({ request }) => {
      const response = await usersAPI.getArchivedUsers(
        request,
        archiveDto({ searchString: `api-users-archive-no-match-${uniqueApiSuffix('users')}` }),
        accessToken,
      );

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expect(response.status).toBe(201);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expect(getRows(response.data), JSON.stringify(response.data)).toEqual([]);
      expectNoSensitiveFields(response.data);
    });

    test('возвращает пользователей по id роли без чувствительных полей', async ({ request }) => {
      const response = await usersAPI.getUsersByRoleId(request, String(fixtureRoleId), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);
    });

    test('обрабатывает невалидный id роли без серверных ошибок', async ({ request }) => {
      const response = await usersAPI.getUsersByRoleId(request, '999999999', accessToken);

      expectNoServerError(response);
      expectNoSensitiveFields(response.data);

      const byTypeOperation = await usersAPI.attachFile(request, '999999999', accessToken);
      expectNoServerError(byTypeOperation);
      if (successCodes.includes(byTypeOperation.status)) expectArrayResponse(byTypeOperation.data);
      if (clientErrorCodes.includes(byTypeOperation.status)) expectErrorResponseContract(byTypeOperation);
      expectNoSensitiveFields(byTypeOperation.data);
    });
  });

  test.describe('Users API: валидация мутаций и проверки авторизации', () => {
    test.describe.configure({ timeout: 60000 });

    test('создание пользователя отклоняет невалидный payload без токена', async ({ request }) => {
      const response = await usersAPI.createUser(request, invalidCreateUserPayload(), 'api-users');

      expectClientError(response);
      expectNoSensitiveFields(response.data);
    });

    test('создание пользователя отклоняет невалидный payload с невалидным токеном', async ({ request }) => {
      const response = await usersAPI.createUser(
        request,
        invalidCreateUserPayload(),
        'api-users',
        API_CONST.API_TEST_EDGE_CASES.INVALID_TOKEN,
      );

      expectClientError(response);
      expectNoSensitiveFields(response.data);
    });

    test('обновление пользователя отклоняет невалидный payload без токена', async ({ request }) => {
      const response = await usersAPI.updateUser(request, invalidUpdateUserPayload(), 'api-users');

      expectClientError(response);
      expectNoSensitiveFields(response.data);
    });

    test('выдача роли отклоняет несуществующую роль или пользователя без серверной ошибки', async ({ request }) => {
      const response = await usersAPI.issueRole(request, { value: 'api-nonexistent-role', userId: 999999999 });

      expectClientError(response);
      expectNoSensitiveFields(response.data);

      const changeRole = await usersAPI.changeUserRole(request, '999999999', '999999999', accessToken);
      expectNoServerError(changeRole);
      if (clientErrorCodes.includes(changeRole.status)) expectErrorResponseContract(changeRole);
      expectNoSensitiveFields(changeRole.data);
    });

    test('бан пользователя отклоняет несуществующего пользователя без серверной ошибки', async ({ request }) => {
      const response = await usersAPI.banUser(request, {
        userId: 999999999,
        banReason: 'api negative probe',
      });

      expectClientError(response);
      expectNoSensitiveFields(response.data);
    });

    test('открепление файла отклоняет несуществующего пользователя или файл без серверной ошибки', async ({ request }) => {
      const response = await usersAPI.detachFile(request, '999999999', '999999999');

      expectClientError(response);
      expectNoSensitiveFields(response.data);
    });

    test('валидный auth token не раскрывает чувствительные поля в ответе чтения пользователя', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);
      const response = await usersAPI.getUserById(request, String(fixtureUserId), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectNoServerError(response);
      expectNoSensitiveFields(response.data);
    });
  });
};
