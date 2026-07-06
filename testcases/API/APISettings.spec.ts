import { test, expect } from '@playwright/test';
import { SettingsAPI } from '../../pages/API/APISettings';
import logger from '../../lib/utils/logger';
import {
  captureApiResult,
  expectApiContract,
  expectArrayResponse,
  expectNoServerError,
  expectClientError,
  expectErrorResponseContract,
  expectEndpointReached,
  expectObjectResponse,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';

const settingsAPI = new SettingsAPI(null as any);

type SettingsRow = Record<string, any>;

const expectEdizmShape = (edizm: SettingsRow) => {
  expect(edizm).toBeTruthy();
  expect(typeof edizm.id, JSON.stringify(edizm)).toBe('number');
  expect(typeof edizm.name, JSON.stringify(edizm)).toBe('string');
  expect(typeof edizm.short_name, JSON.stringify(edizm)).toBe('string');
  if ('type_edizm' in edizm && edizm.type_edizm !== null) {
    expect(Array.isArray(edizm.type_edizm), JSON.stringify(edizm)).toBe(true);
  }
};

const expectTypeEdizmShape = (typeEdizm: SettingsRow) => {
  expect(typeEdizm).toBeTruthy();
  expect(typeof typeEdizm.id, JSON.stringify(typeEdizm)).toBe('number');
  expect(typeof typeEdizm.name, JSON.stringify(typeEdizm)).toBe('string');
  if ('edizm' in typeEdizm && typeEdizm.edizm !== null) {
    expect(Array.isArray(typeEdizm.edizm), JSON.stringify(typeEdizm)).toBe(true);
  }
};

const expectNormHoursShape = (normHours: SettingsRow) => {
  expectObjectResponse(normHours);
  expect(typeof normHours.id, JSON.stringify(normHours)).toBe('number');
  expect(typeof normHours.value, JSON.stringify(normHours)).toBe('number');
};

const expectInactionShape = (inaction: SettingsRow) => {
  expectObjectResponse(inaction);
  expect(typeof inaction.id, JSON.stringify(inaction)).toBe('number');
  expect(typeof inaction.inaction, JSON.stringify(inaction)).toBe('number');
};

export const runSettingsAPINew = () => {
  logger.info('Starting Settings API coverage suite');

  test.describe('Settings API: справочники и defensive-сценарии', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string | undefined;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('читает единицы измерения, типы, нормо-часы и бездействие с ожидаемым контрактом', async ({ request }) => {
      const edizm = await settingsAPI.getAllEdizm(request, accessToken);
      expect(edizm.status).toBe(200);
      expectArrayResponse(edizm.data);
      if (edizm.data[0]) expectEdizmShape(edizm.data[0]);

      const typeEdizm = await settingsAPI.getAllTypeEdizm(request, accessToken);
      expect(typeEdizm.status).toBe(200);
      expectArrayResponse(typeEdizm.data);
      if (typeEdizm.data[0]) expectTypeEdizmShape(typeEdizm.data[0]);

      const normHours = await settingsAPI.getNormHoursValue(request, accessToken);
      expect(normHours.status).toBe(200);
      expectNormHoursShape(normHours.data);

      const inaction = await settingsAPI.inactionGet(request, accessToken);
      expect(inaction.status).toBe(200);
      expectInactionShape(inaction.data);
    });

    test('читает список backup-файлов и безопасно проверяет отсутствующий dump', async ({ request }) => {
      const list = await settingsAPI.getAllDB(request, accessToken);
      expectApiContract(list, { shape: 'array' });

      const missingName = `api-missing-${uniqueApiSuffix('dump')}.dump`;
      const download = await settingsAPI.downloadDb(request, missingName, accessToken);
      expectApiContract(download);

      const drop = await settingsAPI.dropDumpDB(request, missingName, accessToken);
      expectApiContract(drop);

      const load = await settingsAPI.loadDumpDb(request, missingName, false, accessToken);
      expectApiContract(load);
    });

    test('обновляет inaction текущим значением с ожидаемым контрактом', async ({ request }) => {
      const current = await settingsAPI.inactionGet(request, accessToken);
      expect(current.status).toBe(200);
      expectInactionShape(current.data);

      const response = await settingsAPI.inactionChange(request, current.data.inaction, accessToken);
      expect(response.status).toBe(200);
      expectInactionShape(response.data);
      expect(response.data.inaction).toBe(current.data.inaction);
    });

    test('невалидные мутации справочников настроек возвращают error contract', async ({ request }) => {
      const responses = [
        await settingsAPI.createTypeEdizm(request, { name: 123 }, accessToken),
        await settingsAPI.createEdizm(request, { name: 123, short_name: false, typeEdizmId: 'bad' }, accessToken),
        await settingsAPI.updateEdizm(request, { id: 'bad', name: 123, short_name: false }, accessToken),
        await settingsAPI.updateNormHoursValue(request, { value: 'bad' }, accessToken),
      ];

      for (const response of responses) {
        expectClientError(response);
        expectErrorResponseContract(response);
      }
    });

    test('maintenance endpoint создания новой БД достигается явно', async ({ request }) => {
      const response = await captureApiResult(() => settingsAPI.newDB(request, accessToken));
      expectEndpointReached(response);
    });
  });
};
