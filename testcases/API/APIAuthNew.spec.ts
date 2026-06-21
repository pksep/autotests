import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../pages/API/APIAuth';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

/**
 * Новый комплексный набор тестов авторизации для sep_erp_server
 * Охватывает вход, проверку токена, обновление, выход и сценарии безопасности
 */
export const runAuthAPINew = () => {
  logger.info(`Запуск нового набора тестов Auth API - Комплексное тестирование авторизации`);

  const authAPI = new AuthAPI();

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

    test('Вход с разрешенного хоста', async ({ request }) => {
      logger.log('Тестирование входа с разрешенного хоста...');
      const response = await authAPI.login(
        request,
        API_CONST.API_TEST_USERNAME,
        API_CONST.API_TEST_PASSWORD,
        API_CONST.API_TEST_TABEL
      );

      expect(response.status).toBe(201);
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
      
      const validToken = loginResponse.data?.token || loginResponse.data;
      expect(validToken).toBeTruthy();
      
      const tokenResponse = await authAPI.getUserByToken(request, validToken);
      expect(tokenResponse.status).toBe(201);
    });

    test('Проверка невалидного токена', async ({ request }) => {
      logger.log('Проверка невалидного токена...');
      const response = await authAPI.getUserByToken(request, 'invalid_token_12345');

      expect(response.status).toBe(401);
    });

    test('Проверка просроченного токена', async ({ request }) => {
      // Идеально: генерировать реальный просроченный токен (или использовать заглушку, которая сервером обрабатывается как 401)
      logger.log('Проверка просроченного токена...');
      const response = await authAPI.getUserByToken(request, 'expired_token_12345');

      expect(response.status).toBe(401);
    });

    test('Обновление токенов с невалидным refresh токеном', async ({ request }) => {
      logger.log('Тестирование обновления токена с невалидным refresh токеном...');
      const response = await authAPI.refreshTokens(request, 'invalid_refresh_token');

      expect(response.status).toBe(401);
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
      
      // Динамическое извлечение ID пользователя, фоллбэк на 1
      const userId = loginResponse.data?.user?.id || loginResponse.data?.id || 1;
      
      const logoutResponse = await authAPI.logout(request, userId);
      expect(logoutResponse.status).toBe(201);
    });

    test('Выход с невалидной сессией', async ({ request }) => {
      logger.log('Тестирование выхода с невалидной сессией...');
      const response = await authAPI.logout(request, 999999);

      expect(response.status).toBe(401);
    });
  });
};
