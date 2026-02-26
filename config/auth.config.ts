import { ENV } from './env';

/**
 * Login / auth configuration for UI and API tests.
 * Test credentials come from env (LOGIN_USERNAME, LOGIN_PASSWORD, LOGIN_TABEL). See .env.example.
 */

export const LOGIN_TEST_CONFIG = {
  LOGIN_ENDPOINT: `${ENV.API_BASE_URL}api/auth/login`,

  TEST_CREDENTIALS: {
    username: process.env.LOGIN_USERNAME ?? '',
    password: process.env.LOGIN_PASSWORD ?? '',
    tabel: process.env.LOGIN_TABEL ?? '',
  },

  ALTERNATIVE_CREDENTIALS: {
    email: 'test@example.com',
    user: 'testuser',
    login: 'testuser',
    employee_id: '12345',
    employee_number: '12345',
  },

  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  REQUEST_TEMPLATES: {
    standard: {
      username: 'testuser',
      password: 'testpass',
      tabel: '12345',
    },
    alternative1: {
      email: 'test@example.com',
      password: 'testpass',
      employee_id: '12345',
    },
    alternative2: {
      user: 'testuser',
      pass: 'testpass',
      employee_number: '12345',
    },
    alternative3: {
      login: 'testuser',
      pwd: 'testpass',
      tabel: '12345',
    },
  },
};
