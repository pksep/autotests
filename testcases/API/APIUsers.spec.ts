import { test, expect } from '@playwright/test';
import { UsersAPI } from '../../pages/API/APIUsers';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
import {
  clientErrorCodes,
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

  return { status: response.status(), data: responseData };
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

  return { status: response.status(), data: responseData };
};

/**
 * Broad non-destructive Users API coverage.
 * Mutating endpoints are probed with invalid data so the suite can run on dev
 * without creating, changing, or archiving real users.
 */
export const runUsersAPINew = () => {
  logger.info('Starting Users API coverage suite');
  let accessToken: string | undefined;

  test.beforeAll(async ({ request }) => {
    accessToken = await getAuthToken(request);
  });

  test.describe('Users API: контракты чтения', () => {
    test.describe.configure({ timeout: 60000 });

    test('возвращает минимальный список активных пользователей без чувствительных полей', async ({ request }) => {
      const response = await usersAPI.getAllUsersList(request, accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const rows = getRows(response.data);
      test.skip(rows.length === 0, 'No active users are available on this environment.');
      expectUserShape(rows[0]);
      expect(rows[0].ban, JSON.stringify(rows[0])).not.toBe(true);
    });

    test('возвращает облегченный список пользователей без ролей по умолчанию', async ({ request }) => {
      const response = await usersAPI.getAllUsers(request, true, false, accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const rows = getRows(response.data);
      test.skip(rows.length === 0, 'No active users are available on this environment.');
      expectUserShape(rows[0]);
    });

    test('возвращает список пользователей с ролями при includeRole=true', async ({ request }) => {
      const response = await usersAPI.getAllUsers(request, true, true, accessToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const rows = getRows(response.data);
      test.skip(rows.length === 0, 'No active users are available on this environment.');
      expectUserShape(rows[0]);
    });

    test('light/full контракты пользователей отличаются только ожидаемым расширением данных', async ({ request }) => {
      const lightResponse = await usersAPI.getAllUsers(request, true, false, accessToken);
      const fullResponse = await usersAPI.getAllUsers(request, false, true, accessToken);

      expect(lightResponse.status).toBe(200);
      expect(fullResponse.status).toBe(200);
      expectNoSensitiveFields(lightResponse.data);
      expectNoSensitiveFields(fullResponse.data);

      const lightRows = getRows(lightResponse.data);
      const fullRows = getRows(fullResponse.data);
      test.skip(lightRows.length === 0 || fullRows.length === 0, 'No users are available for light/full comparison.');
      expect(Object.keys(fullRows[0]).length).toBeGreaterThanOrEqual(Object.keys(lightRows[0]).length);
    });

    test('возвращает пагинированный список активных пользователей с count и rows', async ({ request }) => {
      const response = await postUsersPagination(request, userPaginationDto(), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

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
        expect(successCodes).toContain(farPage.status);
        expectPaginationContract(farPage.data, 5);
      }
      expectNoSensitiveFields(farPage.data);
    });

    test('возвращает существующего пользователя по id из списка или требует авторизацию', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);

      const firstUser = getRows(listResponse.data)[0];
      test.skip(!firstUser?.id, 'No active user id is available on this environment.');

      const response = await usersAPI.getUserById(request, String(firstUser.id), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expectUserShape(response.data as UserLike);
      expectNoSensitiveFields(response.data);
    });

    test('читает и валидирует настройки таблицы пользователя без серверных ошибок', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsersList(request, accessToken);
      expect(listResponse.status).toBe(200);
      const user = getRows(listResponse.data).find((row) => row.id);
      test.skip(!user, 'No active user id is available on this environment.');

      const config = await usersAPI.getTableConfigByUserId(request, Number(user!.id), accessToken);
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

      const tabel = getRows(listResponse.data).find((user) => user.tabel)?.tabel;
      if (!tabel) {
        test.skip(true, 'No user with tabel is available on this environment.');
        return;
      }

      const response = await postTabelUnique(request, { tabel: String(tabel) }, accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

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

    test('возвращает контракт списка архивных пользователей', async ({ request }) => {
      const response = await usersAPI.getArchivedUsers(request, archiveDto(), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expect(response.status).toBe(201);
      expect(Array.isArray(response.data), JSON.stringify(response.data)).toBe(true);
      expectNoSensitiveFields(response.data);

      const rows = getRows(response.data);
      if (rows.length > 0) {
        expectUserShape(rows[0]);
        expect(rows[0].ban, JSON.stringify(rows[0])).toBe(true);
      }
    });

    test('возвращает пользователей по id роли без чувствительных полей', async ({ request }) => {
      const listResponse = await usersAPI.getAllUsers(request, false, true, accessToken);
      expect(listResponse.status).toBe(200);

      const userWithRole = getRows(listResponse.data).find((user) => user.rolesId || user.role?.id || user.roles?.id);
      const roleId = userWithRole?.rolesId ?? userWithRole?.role?.id ?? userWithRole?.roles?.id;
      test.skip(!roleId, 'No role id is available from users list on this environment.');

      const response = await usersAPI.getUsersByRoleId(request, String(roleId), accessToken);

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
      const user = getRows(listResponse.data).find((row) => row.id);
      test.skip(!user, 'No active user id is available on this environment.');

      const response = await usersAPI.getUserById(request, String(user!.id), accessToken);

      if (response.status === 401) {
        expectNoSensitiveFields(response.data);
        return;
      }

      expectNoServerError(response);
      expectNoSensitiveFields(response.data);
    });
  });
};
