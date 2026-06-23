import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';
import { expectNoServerError } from '../../lib/helpers/APIAssertions';

type AuthResponseData = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: {
    id?: number;
  };
  id?: number;
  data?: AuthResponseData;
};

type AuthAPIResult = {
  status: number;
  data?: AuthResponseData | string;
  headers?: Record<string, string>;
  headersArray?: { name: string; value: string }[];
};

const extractAccessToken = (data: AuthResponseData | string | undefined): string | undefined => {
  if (!data) return undefined;
  if (typeof data === 'string') return data;

  return data.token || data.accessToken || data.access_token || extractAccessToken(data.data);
};

const extractUserId = (data: AuthResponseData | string | undefined): number | undefined => {
  if (!data || typeof data === 'string') return undefined;

  return data.user?.id || data.id || extractUserId(data.data);
};

const extractRefreshTokenFromBody = (data: AuthResponseData | string | undefined): string | undefined => {
  if (!data || typeof data === 'string') return undefined;

  return data.refreshToken || data.refresh_token || extractRefreshTokenFromBody(data.data);
};

const extractRefreshTokenFromCookie = (response: AuthAPIResult): string | undefined => {
  const setCookieHeaders = [
    ...(response.headersArray || [])
      .filter((header) => header.name.toLowerCase() === 'set-cookie')
      .map((header) => header.value),
    response.headers?.['set-cookie'],
  ].filter(Boolean) as string[];

  const refreshCookie = setCookieHeaders.find((cookie) => cookie.includes('refresh_token='));
  return refreshCookie?.match(/refresh_token=([^;]+)/)?.[1];
};

const getRefreshToken = (response: AuthAPIResult): string | undefined => {
  return extractRefreshTokenFromCookie(response) || extractRefreshTokenFromBody(response.data);
};

const getRefreshCookie = (response: AuthAPIResult): string | undefined => {
  return [
    ...(response.headersArray || [])
      .filter((header) => header.name.toLowerCase() === 'set-cookie')
      .map((header) => header.value),
    response.headers?.['set-cookie'],
  ]
    .filter(Boolean)
    .find((cookie) => cookie?.includes('refresh_token='));
};

const expectPasswordIsNotExposed = (data: unknown) => {
  expect(JSON.stringify(data)).not.toContain(API_CONST.API_TEST_PASSWORD);
};

const expectSensitiveFieldsAreNotExposed = (data: unknown) => {
  const sensitiveKeys = ['password', 'hash', 'salt'];
  const stack = [data];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    for (const [key, value] of Object.entries(current)) {
      expect(sensitiveKeys).not.toContain(key.toLowerCase());
      if (value && typeof value === 'object') {
        stack.push(value);
      }
    }
  }
};

const tamperToken = (token: string): string => {
  const parts = token.split('.');
  if (parts.length !== 3) return `${token}.tampered`;

  const payload = Buffer.from(JSON.stringify({ sub: '999999', tampered: true })).toString('base64url');
  return [parts[0], payload, parts[2]].join('.');
};

const expiredJwtLikeToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxIiwiZXhwIjoxLCJpYXQiOjB9',
  'invalid_signature',
].join('.');

/**
 * Новый комплексный набор тестов авторизации для sep_erp_server
 * Охватывает вход, проверку токена, обновление, выход и сценарии безопасности
 */
export const runAuthAPINew = () => {
  logger.info(`Запуск нового набора тестов Auth API - Комплексное тестирование авторизации`);

  const authAPI = new AuthAPI();

  test.describe.serial('Auth API: последовательные проверки общей учетной записи', () => {
  test.describe('Вход', () => {
    test.describe.configure({ timeout: 60000 });

    test('Успешный вход с корректными учетными данными', async ({ request }) => {
      logger.log('Проверка корректных учетных данных...');
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(extractAccessToken(response.data)).toBeTruthy();
      expectPasswordIsNotExposed(response.data);
      expectSensitiveFieldsAreNotExposed(response.data);
    });

    test('Неверный пароль для существующего пользователя', async ({ request }) => {
      logger.log('Проверка неверного пароля для существующего пользователя...');
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        'invalid_password',
        API_CONST.API_TEST_TABEL
      );

      expect(response.status).toBe(401);
      expectPasswordIsNotExposed(response.data);
    });

    test('Неверный табель для существующего пользователя', async ({ request }) => {
      logger.log('Проверка неверного табеля для существующего пользователя...');
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        'invalid_tabel'
      );

      expect(response.status).toBe(401);
      expectPasswordIsNotExposed(response.data);
    });

    test('Ответы не раскрывают существование пользователя', async ({ request }) => {
      logger.log('Проверка защиты от user enumeration...');
      const existingUserWrongPassword = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        'invalid_password',
        API_CONST.API_TEST_TABEL
      );
      const unknownUser = await authAPI.login(
        request,
        'invalid_user',
        'invalid_password',
        API_CONST.API_TEST_TABEL
      );

      expect(existingUserWrongPassword.status).toBe(unknownUser.status);
      expectPasswordIsNotExposed(existingUserWrongPassword.data);
      expectPasswordIsNotExposed(unknownUser.data);
    });

    test('Неудачный вход с некорректными учетными данными', async ({ request }) => {
      logger.log('Проверка некорректных учетных данных...');
      const response = await authAPI.login(
        request,
        'invalid_user',
        'invalid_password',
        'invalid_tabel'
      );

      expect(response.status).toBe(401);
    });

    test('Вход без указания учетных данных', async ({ request }) => {
      logger.log('Проверка отсутствующих учетных данных...');
      const response = await authAPI.login(request, '', '', '');

      expect(response.status).toBe(400);
    });

    test('Вход с частично пустыми учетными данными', async ({ request }) => {
      test.fail(true, 'Known issue: частично пустые учетные данные могут приниматься сервером.');
      logger.log('Проверка частично пустых учетных данных...');
      const cases = [
        { name: 'empty login', login: '', password: API_CONST.API_TEST_PASSWORD, tabel: API_CONST.API_TEST_TABEL },
        { name: 'empty password', login: API_CONST.API_TEST_USERNAME, password: '', tabel: API_CONST.API_TEST_TABEL },
        { name: 'empty tabel', login: API_CONST.API_TEST_USERNAME, password: API_CONST.API_TEST_PASSWORD, tabel: '' },
      ];

      for (const testCase of cases) {
        const response = await authAPI.login(request, testCase.login, testCase.password, testCase.tabel);
        expect([400, 401], testCase.name).toContain(response.status);
        expectPasswordIsNotExposed(response.data);
      }
    });

    test('Refresh cookie имеет безопасные flags', async ({ request }) => {
      test.fail(true, 'Known issue: refresh_token cookie выставляется без Secure flag.');
      logger.log('Проверка security flags refresh cookie...');
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(response.status).toBe(201);
      const refreshCookie = getRefreshCookie(response);
      test.skip(!refreshCookie, 'Login response не содержит refresh_token Set-Cookie.');

      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('Secure');
      expect(refreshCookie).toMatch(/SameSite=(Strict|Lax|None)/i);
    });

    test('SQL-инъекция в учетных данных', async ({ request }) => {
      logger.log('Тестирование защиты от SQL-инъекций...');
      const response = await authAPI.login(
        request,
        "' OR '1'='1",
        'password',
        '12345'
      );

      expect(response.status).toBe(401);
    });

    test('XSS-payload в учетных данных', async ({ request }) => {
      logger.log('Тестирование защиты от XSS...');
      const response = await authAPI.login(
        request,
        '<script>alert("XSS")</script>',
        'password',
        '12345'
      );

      expect(response.status).toBe(401);
    });

    test('Вход с разрешенного Origin', async ({ request }) => {
      logger.log('Тестирование входа с разрешенного хоста...');
      const allowedOrigin = new URL(ENV.BASE_URL || ENV.API_BASE_URL).origin;
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL,
        { Origin: allowedOrigin }
      );

      expect(response.status).toBe(201);
      expect(extractAccessToken(response.data)).toBeTruthy();
      expectPasswordIsNotExposed(response.data);
      expectSensitiveFieldsAreNotExposed(response.data);
    });

    test('Несколько неверных логинов подряд не раскрывают пользователя и не приводят к 5xx', async ({ request }) => {
      const attempts = [
        { login: API_CONST.API_TEST_USERNAME, password: 'invalid_password_1', tabel: API_CONST.API_TEST_TABEL },
        { login: API_CONST.API_TEST_USERNAME, password: 'invalid_password_2', tabel: API_CONST.API_TEST_TABEL },
        { login: 'invalid_user', password: 'invalid_password_3', tabel: 'invalid_tabel' },
      ];

      for (const attempt of attempts) {
        const response = await authAPI.login(request, attempt.login, attempt.password, attempt.tabel);
        expectNoServerError(response);
        expect(response.status).toBe(401);
        expectPasswordIsNotExposed(response.data);
      }
    });

    test('Учетные данные с пробелами по краям обрабатываются без серверных ошибок', async ({ request }) => {
      const response = await authAPI.login(
        request,
        ` ${API_CONST.API_TEST_USERNAME} `,
        ` ${API_CONST.API_TEST_PASSWORD} `,
        ` ${API_CONST.API_TEST_TABEL} `,
      );

      expectNoServerError(response);
      expect([201, 400, 401]).toContain(response.status);
      expectPasswordIsNotExposed(response.data);
    });
  });

  test.describe('Проверка токена', () => {
    test.describe.configure({ timeout: 60000 });

    test('Проверка валидного токена', async ({ request }) => {
      logger.log('Проверка валидного токена...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );
      
      expect(loginResponse.status).toBe(201);
      
      const validToken = extractAccessToken(loginResponse.data);
      expect(validToken).toBeTruthy();
      
      const tokenResponse = await authAPI.getUserByToken(request, validToken as string);
      expect(tokenResponse.status).toBe(201);
    });

    test('Проверка невалидного токена', async ({ request }) => {
      logger.log('Проверка невалидного токена...');
      const response = await authAPI.getUserByToken(request, 'invalid_token_12345');

      expect(response.status).toBe(401);
    });

    test('Проверка без токена', async ({ request }) => {
      logger.log('Проверка отказа без токена...');
      const response = await authAPI.getUserByToken(request, '');

      expect(response.status).toBe(401);
    });

    test('Проверка просроченного токена', async ({ request }) => {
      logger.log('Проверка просроченного токена...');
      const response = await authAPI.getUserByToken(request, expiredJwtLikeToken);

      expect(response.status).toBe(401);
    });

    test('Проверка токена с измененным payload', async ({ request }) => {
      logger.log('Проверка отказа для токена с измененным payload...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(loginResponse.status).toBe(201);

      const validToken = extractAccessToken(loginResponse.data);
      expect(validToken).toBeTruthy();

      const response = await authAPI.getUserByToken(request, tamperToken(validToken as string));
      expect(response.status).toBe(401);
    });

    test('Обновление токенов с невалидным refresh токеном', async ({ request }) => {
      logger.log('Тестирование обновления токена с невалидным refresh токеном...');
      const response = await authAPI.refreshTokens(request, 'invalid_refresh_token');

      expect(response.status).toBe(401);
    });

    test('Обновление токенов без refresh cookie запрещено', async ({ request }) => {
      logger.log('Проверка refresh без cookie...');
      const response = await authAPI.refreshTokens(request);

      expect(response.status).toBe(401);
    });

    test('Успешное обновление токена с валидным refresh token', async ({ request }) => {
      logger.log('Тестирование успешного обновления токена...');
      let refreshResponse: AuthAPIResult | undefined;

      for (let attempt = 0; attempt < 3; attempt++) {
        const loginResponse = await authAPI.login(
          request,
          API_CONST.API_TEST_USERNAME,
          API_CONST.API_TEST_PASSWORD,
          API_CONST.API_TEST_TABEL
        );

        expect(loginResponse.status).toBe(201);
        expect(extractAccessToken(loginResponse.data)).toBeTruthy();

        const refreshToken = getRefreshToken(loginResponse);
        test.skip(!refreshToken, 'Login response не содержит refresh_token в body или Set-Cookie.');

        refreshResponse = await authAPI.refreshTokens(request, refreshToken);
        if (refreshResponse.status === 201) break;
      }

      expect(refreshResponse).toBeTruthy();
      expect(refreshResponse!.status).toBe(201);

      const newAccessToken = extractAccessToken(refreshResponse!.data);
      expect(newAccessToken).toBeTruthy();
      const tokenCheck = await authAPI.getUserByToken(request, newAccessToken as string);
      expect(tokenCheck.status).toBe(201);
      expectPasswordIsNotExposed(refreshResponse!.data);
      expectSensitiveFieldsAreNotExposed(refreshResponse!.data);
    });

    test('Повторное использование старого refresh token запрещено', async ({ request }) => {
      test.fail(true, 'Known issue: старый refresh_token повторно принимается после refresh.');
      logger.log('Проверка запрета повторного использования refresh token...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(loginResponse.status).toBe(201);
      const oldRefreshToken = getRefreshToken(loginResponse);
      test.skip(!oldRefreshToken, 'Login response не содержит refresh_token в body или Set-Cookie.');

      const refreshResponse = await authAPI.refreshTokens(request);
      expect(refreshResponse.status).toBe(201);

      const reusedOldRefreshTokenResponse = await authAPI.refreshTokens(request, oldRefreshToken);
      expect(reusedOldRefreshTokenResponse.status).toBe(401);
    });
  });

  test.describe('Выход', () => {
    test.describe.configure({ timeout: 60000 });

    test('Успешный выход', async ({ request }) => {
      logger.log('Тестирование успешного выхода...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );
      
      expect(loginResponse.status).toBe(201);
      
      const userId = extractUserId(loginResponse.data);
      expect(userId).toBeTruthy();
      
      const logoutResponse = await authAPI.logout(request, userId as number);
      expect(logoutResponse.status).toBe(201);
    });

    test('Токен становится невалидным после выхода', async ({ request }) => {
      test.fail(true, 'Known issue: access token остается валидным после logout.');
      logger.log('Проверка инвалидирования токена после выхода...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(loginResponse.status).toBe(201);

      const accessToken = extractAccessToken(loginResponse.data);
      const userId = extractUserId(loginResponse.data);
      expect(accessToken).toBeTruthy();
      expect(userId).toBeTruthy();

      const logoutResponse = await authAPI.logout(request, userId as number);
      expect(logoutResponse.status).toBe(201);

      const tokenResponse = await authAPI.getUserByToken(request, accessToken as string);
      expect(tokenResponse.status).toBe(401);
    });

    test('Refresh token становится невалидным после выхода', async ({ request }) => {
      test.skip(
        ENV.TEST_SUITE === 'all_api_tests',
        'Requires exclusive shared auth user/session; covered by isolated auth_api suite.',
      );
      logger.log('Проверка инвалидирования refresh token после выхода...');
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(loginResponse.status).toBe(201);

      const refreshToken = getRefreshToken(loginResponse);
      const userId = extractUserId(loginResponse.data);
      test.skip(!refreshToken, 'Login response не содержит refresh_token в body или Set-Cookie.');
      expect(userId).toBeTruthy();

      const logoutResponse = await authAPI.logout(request, userId as number);
      expect(logoutResponse.status).toBe(201);

      const refreshResponse = await authAPI.refreshTokens(request, refreshToken);
      expect(refreshResponse.status).toBe(401);
    });

    test('Выход с невалидной сессией', async ({ request }) => {
      logger.log('Тестирование выхода с невалидной сессией...');
      const response = await authAPI.logout(request, 999999);

      expect(response.status).toBe(401);
    });

    test('Повторный logout той же сессии не приводит к 5xx', async ({ request }) => {
      const loginResponse = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(loginResponse.status).toBe(201);
      const userId = extractUserId(loginResponse.data);
      expect(userId).toBeTruthy();

      const firstLogout = await authAPI.logout(request, userId as number);
      expectNoServerError(firstLogout);
      expect([201, 401]).toContain(firstLogout.status);

      const secondLogout = await authAPI.logout(request, userId as number);
      expectNoServerError(secondLogout);
      expect([201, 401]).toContain(secondLogout.status);
    });
  });
  });
};
