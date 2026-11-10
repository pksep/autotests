import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { API_CONST } from '../../lib/Constants/APIConstants';
import { ENV } from '../../config';
import { loginAfterCooldown } from '../../lib/helpers/APILogin';

const expectStatusIn = (response: { status: number }, allowed: number[], context = 'Auth request') => {
  expect(allowed.includes(response.status), `${context}: expected HTTP ${allowed.join('/')}, got ${response.status}`).toBe(true);
};
const expectUnauthorizedOrForbidden = (response: { status: number }) => expectStatusIn(response, [401, 403]);

const auth = new AuthAPI();
const checkedLogin = (...args: Parameters<AuthAPI['login']>) => loginAfterCooldown(() => auth.login(...args));

// Retry only an explicit rejection, after the server cooldown. Never retry an unknown result.
const loginWhenReady = async (request: APIRequestContext, headers: Record<string, string> = {}) => {
  const response = await checkedLogin(
    request, API_CONST.API_TEST_USERNAME, API_CONST.API_TEST_PASSWORD, API_CONST.API_TEST_TABEL, headers,
  );
  expectStatusIn(response, [201], 'Establish cookie session');
  return response;
};

const cookieValue = async (request: APIRequestContext, name: string) => {
  const { cookies } = await request.storageState();
  const host = new URL(ENV.API_BASE_URL).hostname;
  return cookies.find(cookie => cookie.name === name &&
    (host === cookie.domain.replace(/^\./, '') || host.endsWith(`.${cookie.domain.replace(/^\./, '')}`)))?.value;
};
const requireCookie = async (request: APIRequestContext, name: string): Promise<string> => {
  const value = await cookieValue(request, name);
  expect(Boolean(value), `Session must contain ${name} cookie`).toBe(true);
  return value!;
};
const expectSafeBody = (data: unknown) => {
  // Boolean assertions keep credentials out of failure output.
  expect(JSON.stringify(data)?.includes(API_CONST.API_TEST_PASSWORD), 'Response must not expose the password').toBe(false);
  const stack = [data];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    for (const [key, value] of Object.entries(current)) {
      expect(['password', 'hash', 'salt', 'refresh_token', 'refreshtoken'].includes(key.toLowerCase()),
        'Response must not expose password hashes or refresh credentials').toBe(false);
      if (value && typeof value === 'object') stack.push(value);
    }
  }
};
const expectSession = async (request: APIRequestContext) => {
  const response = await auth.getSession(request);
  expectStatusIn(response, [200], 'GET /api/auth/session authenticates the cookie jar');
  expect(response.data?.ok).toBe(true);
  expectSafeBody(response.data);
};

export const runAuthAPINew = () => {
  test.describe('Auth API: cookie-only сессии', () => {
    // One account has one login limit. Default mode continues after unrelated failures.
    test.describe.configure({ mode: 'default', timeout: 180000 });
    test.afterEach(async ({ request }) => { await auth.logout(request); });

    test.describe('Вход', () => {
      test.beforeEach(async ({ request }) => {
        // Successful login resets the failed-password counter before each negative scenario.
        await loginWhenReady(request);
      });

      test('Успешный вход устанавливает обе cookie и открывает сессию', async ({ request }) => {
        await requireCookie(request, 'access_token');
        await requireCookie(request, 'refresh_token');
        await expectSession(request);
      });
      test('Неверный пароль для существующего пользователя', async ({ request }) => {
        const response = await checkedLogin(request, API_CONST.API_TEST_USERNAME, 'invalid_password', API_CONST.API_TEST_TABEL);
        expectUnauthorizedOrForbidden(response);
        expectSafeBody(response.data);
      });
      test('Неверный табель для существующего пользователя', async ({ request }) => {
        expectUnauthorizedOrForbidden(await checkedLogin(request, API_CONST.API_TEST_USERNAME, API_CONST.API_TEST_PASSWORD, 'invalid_tabel'));
      });
      test('Ответы не раскрывают существование пользователя', async ({ request }) => {
        const existing = await checkedLogin(request, API_CONST.API_TEST_USERNAME, 'invalid_password', API_CONST.API_TEST_TABEL);
        // The account is resolved by personnel number, not by the displayed name.
        const unknown = await checkedLogin(request, 'invalid_user', 'invalid_password', 'invalid_tabel');
        expectUnauthorizedOrForbidden(existing);
        expectUnauthorizedOrForbidden(unknown);
        expect(existing.status).toBe(unknown.status);
        expectSafeBody(existing.data);
        expectSafeBody(unknown.data);
      });
      test('Неудачный вход с некорректными учетными данными', async ({ request }) => {
        expectUnauthorizedOrForbidden(await checkedLogin(request, 'invalid_user', 'invalid_password', 'invalid_tabel'));
      });
      test('Вход без указания учетных данных', async ({ request }) => {
        expectStatusIn(await checkedLogin(request, '', '', ''), [400]);
      });
      test('Вход с частично пустыми учетными данными', async ({ request }) => {
        for (const [user, password, tabel] of [
          ['', API_CONST.API_TEST_PASSWORD, API_CONST.API_TEST_TABEL],
          [API_CONST.API_TEST_USERNAME, '', API_CONST.API_TEST_TABEL],
          [API_CONST.API_TEST_USERNAME, API_CONST.API_TEST_PASSWORD, ''],
        ]) {
          const response = await checkedLogin(request, user, password, tabel);
          // Deployed ERP supports personnel-number/password login without a display name.
          expectStatusIn(response, user === '' ? [201, 400, 401] : [400, 401]);
          if (response.status === 201) {
            await requireCookie(request, 'access_token');
            await expectSession(request);
          }
          expectSafeBody(response.data);
        }
      });
      test('Cookie сессии имеют безопасные flags', async ({ request }) => {
        const cookies = (await request.storageState()).cookies;
        for (const name of ['access_token', 'refresh_token']) {
          const cookie = cookies.find(item => item.name === name);
          expect(Boolean(cookie), `${name} is required`).toBe(true);
          expect(cookie?.httpOnly, `${name} must be HttpOnly`).toBe(true);
          expect(['Strict', 'Lax', 'None'].includes(cookie!.sameSite), `${name} must have SameSite`).toBe(true);
          if (new URL(ENV.API_BASE_URL).protocol === 'https:') expect(cookie?.secure, `${name} must be Secure on HTTPS`).toBe(true);
        }
      });
      for (const [title, user] of [
        ['SQL-инъекция в учетных данных', "' OR '1'='1"],
        ['XSS-payload в учетных данных', '<script>alert("XSS")</script>'],
      ]) test(title, async ({ request }) => {
        expectUnauthorizedOrForbidden(await checkedLogin(request, user, 'password', 'invalid_tabel'));
      });
      test('Вход с разрешенного Origin', async ({ request }) => {
        const response = await loginWhenReady(request, { Origin: new URL(ENV.API_BASE_URL).origin });
        expectStatusIn(response, [201]);
        expectSafeBody(response.data);
        await expectSession(request);
      });
      test('Учетные данные с пробелами по краям обрабатываются без серверных ошибок', async ({ request }) => {
        const response = await checkedLogin(request, ` ${API_CONST.API_TEST_USERNAME} `,
          ` ${API_CONST.API_TEST_PASSWORD} `, ` ${API_CONST.API_TEST_TABEL} `);
        expectStatusIn(response, [201, 400, 401]);
        expectSafeBody(response.data);
      });
    });

    test.describe('Проверка cookie-сессии', () => {
      test('Валидная access cookie открывает сессию', async ({ request }) => {
        await loginWhenReady(request);
        await expectSession(request);
        await auth.logout(request);
      });
      for (const [title, value] of [
        ['Невалидная access cookie отклоняется', 'invalid_access_token'],
        ['Запрос без cookie отклоняется', ''],
        ['Cookie с просроченным неподписанным JWT отклоняется', 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjF9.invalid_signature'],
      ]) test(title, async ({ request }) => {
        expectUnauthorizedOrForbidden(await auth.getSession(request, value));
      });
      test('Поврежденная access cookie отклоняется даже при валидной cookie в контексте', async ({ request }) => {
        await loginWhenReady(request);
        const access = await requireCookie(request, 'access_token');
        expectUnauthorizedOrForbidden(await auth.getSession(request, `${access}tampered`));
        await auth.logout(request);
      });
      test('Bearer без cookie не авторизует ERP-сессию', async ({ request }) => {
        await loginWhenReady(request);
        const access = await requireCookie(request, 'access_token');
        const response = await request.get(ENV.API_BASE_URL + 'api/auth/session', {
          headers: { Cookie: '', Authorization: `Bearer ${access}` },
        });
        expect([401, 403].includes(response.status()), 'Bearer alone must not authenticate ERP').toBe(true);
        await auth.logout(request);
      });
    });

    test.describe('Обновление cookie', () => {
      test('Невалидная refresh cookie отклоняется', async ({ request }) => {
        expectUnauthorizedOrForbidden(await auth.refreshTokens(request, 'invalid_refresh_token'));
      });
      test('Refresh без cookie отклоняется', async ({ request }) => {
        expectUnauthorizedOrForbidden(await auth.refreshTokens(request, ''));
      });
      test('Refresh использует cookie jar и сохраняет рабочую сессию', async ({ request }) => {
        await loginWhenReady(request);
        await requireCookie(request, 'refresh_token');
        const refreshed = await auth.refreshTokens(request);
        expectStatusIn(refreshed, [201]);
        await requireCookie(request, 'access_token');
        await requireCookie(request, 'refresh_token');
        expectSafeBody(refreshed.data);
        await expectSession(request);
        await auth.logout(request);
      });
      test('Повтор старой refresh cookie обрабатывается в рамках grace period', async ({ request }) => {
        await loginWhenReady(request);
        const oldRefresh = await requireCookie(request, 'refresh_token');
        expectStatusIn(await auth.refreshTokens(request), [201]);
        const replay = await auth.refreshTokens(request, oldRefresh);
        expectStatusIn(replay, [201, 401, 403]);
        if (replay.status === 201) await expectSession(request);
        await auth.logout(request);
      });
    });

    test.describe('Выход', () => {
      test('Logout использует текущую сессию и очищает обе cookie', async ({ request }) => {
        await loginWhenReady(request);
        expectStatusIn(await auth.logout(request), [201]);
        expect(Boolean(await cookieValue(request, 'access_token')), 'Logout clears access cookie').toBe(false);
        expect(Boolean(await cookieValue(request, 'refresh_token')), 'Logout clears refresh cookie').toBe(false);
        expectUnauthorizedOrForbidden(await auth.getSession(request));
      });
      test('Выход без cookie отклоняется', async ({ request }) => {
        expectUnauthorizedOrForbidden(await auth.logout(request));
      });
      test('Повторный logout не принимает завершённую сессию', async ({ request }) => {
        await loginWhenReady(request);
        expectStatusIn(await auth.logout(request), [201]);
        expectUnauthorizedOrForbidden(await auth.logout(request));
      });
      test('Refresh cookie завершённой сессии отклоняется', async ({ request }) => {
        await loginWhenReady(request);
        const refresh = await requireCookie(request, 'refresh_token');
        expectStatusIn(await auth.logout(request), [201]);
        expectUnauthorizedOrForbidden(await auth.refreshTokens(request, refresh));
      });
    });

    test('Повтор неверного пароля ограничивается и не блокирует следующие наборы', async ({ request }) => {
      await loginWhenReady(request);
      try {
        const statuses: number[] = [];
        for (let attempt = 0; attempt < 3; attempt++) {
          const response = await auth.login(request, API_CONST.API_TEST_USERNAME, 'invalid_password', API_CONST.API_TEST_TABEL);
          statuses.push(response.status);
          expectSafeBody(response.data);
        }
        expect(statuses).toEqual([401, 401, 429]);
        const blocked = await auth.login(request, API_CONST.API_TEST_USERNAME, API_CONST.API_TEST_PASSWORD, API_CONST.API_TEST_TABEL);
        expectStatusIn(blocked, [429], 'Correct credentials remain blocked during cooldown');
        expectSafeBody(blocked.data);
      } finally {
        // Restore the account after the real cooldown even if an assertion fails.
        await loginWhenReady(request);
        await auth.logout(request);
      }
    });
  });
};
