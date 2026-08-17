import { test, expect } from '@playwright/test';
import { NotificationsAPI } from '../../pages/API/APINotifications';
import { MaterialsAPI } from '../../pages/API/APIMaterials';
import { RolesAPI } from '../../pages/API/APIRoles';
import {
  expectNoServerError,
  expectUnauthorizedOrForbidden,
  expectValidationError,
  getRows,
  successCodes,
} from '../../lib/helpers/APIAssertions';
import { getAuthToken, uniqueApiSuffix } from '../../lib/helpers/APITestUtils';
import { API_CONST } from '../../lib/Constants/APIConstants';
import logger from '../../lib/utils/logger';

const notificationsAPI = new NotificationsAPI(null);
const materialsAPI = new MaterialsAPI(null as any);
const rolesAPI = new RolesAPI(null as any);

type ApiRow = Record<string, any>;

const systemNotification = (overrides: Record<string, unknown> = {}) => ({
  uuid: uniqueApiSuffix('notification'),
  isSystem: true,
  event: 'info',
  entity: 'system',
  entityId: 0,
  title: API_CONST.API_TEST_NOTIFICATION_TITLE,
  message: API_CONST.API_TEST_NOTIFICATION_MESSAGE,
  changedFields: [],
  relations: {},
  ...overrides,
});

const materialPaginationDto = (overrides: Record<string, unknown> = {}) => ({
  page: 0,
  instans: 1,
  searchString: '',
  typeMaterialId: null,
  subtypeMaterialId: null,
  filterByAttention: false,
  filterByTime: true,
  ...overrides,
});

const enrichedRows = (data: unknown): ApiRow[] => {
  if (Array.isArray(data)) return data as ApiRow[];
  return getRows<ApiRow>(data);
};

const expectNotificationShape = (notification: ApiRow) => {
  expect(notification.uuid, JSON.stringify(notification)).toBeTruthy();
  expect(notification.event, JSON.stringify(notification)).toBeTruthy();
  if (notification.entity !== undefined && notification.entity !== null) {
    expect(String(notification.entity), JSON.stringify(notification)).toBeTruthy();
  }
  expect(typeof notification.title, JSON.stringify(notification)).toBe('string');
  expect(typeof notification.message, JSON.stringify(notification)).toBe('string');
  if (notification.entityId !== undefined && notification.entityId !== null) {
    expect(Number(notification.entityId), JSON.stringify(notification)).not.toBeNaN();
  }
};

const nonSystemNotification = (overrides: Record<string, unknown> = {}) => ({
  uuid: uniqueApiSuffix('notification-non-system'),
  isSystem: false,
  event: 'create',
  entity: 'material',
  entityId: 1,
  userId: Number(API_CONST.API_TEST_USER_ID),
  changedFields: [],
  relations: {},
  ...overrides,
});

export const runNotificationAPINew = () => {
  logger.info('Starting Notification API coverage suite');

  test.describe('Notification API: enrichment batch', () => {
    test.describe.configure({ timeout: 60000 });

    let accessToken: string;

    test.beforeAll(async ({ request }) => {
      accessToken = await getAuthToken(request);
    });

    test('обогащает системное уведомление', async ({ request }) => {
      const response = await notificationsAPI.sendBulkNotification(
        request,
        systemNotification(),
        API_CONST.API_TEST_USER_ID,
        accessToken,
      );

      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      const notification = enrichedRows(response.data)[0];
      expectNotificationShape(notification);
      expect(notification?.title, JSON.stringify(response.data)).toBe(API_CONST.API_TEST_NOTIFICATION_TITLE);
      expect(notification?.message, JSON.stringify(response.data)).toBe(API_CONST.API_TEST_NOTIFICATION_MESSAGE);
    });

    test('обогащает варианты системных событий', async ({ request }) => {
      const events = ['info', 'create', 'update', 'delete'];
      const payload = events.map((event) =>
        systemNotification({
          uuid: uniqueApiSuffix(`notification-${event}`),
          event,
          title: `System ${event}`,
          message: `System message ${event}`,
        }),
      );

      const response = await notificationsAPI.enrichBatchRaw(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);

      const rows = enrichedRows(response.data);
      expect(rows).toHaveLength(events.length);
      rows.forEach((row, index) => {
        expectNotificationShape(row);
        expect(row.event).toBe(events[index]);
        expect(row.title).toBe(`System ${events[index]}`);
        expect(row.message).toBe(`System message ${events[index]}`);
      });
    });

    test('обогащает batch из нескольких уведомлений', async ({ request }) => {
      const firstUuid = uniqueApiSuffix('notification-a');
      const secondUuid = uniqueApiSuffix('notification-b');
      const response = await notificationsAPI.sendBulkNotification(
        request,
        [
          systemNotification({ uuid: firstUuid }),
          systemNotification({
            uuid: secondUuid,
            title: API_CONST.API_TEST_NOTIFICATION_TITLE_UPDATED,
            message: API_CONST.API_TEST_NOTIFICATION_MESSAGE_UPDATED,
          }),
        ],
        API_CONST.API_TEST_USER_ID,
        accessToken,
      );

      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      const rows = enrichedRows(response.data);
      expect(rows).toHaveLength(2);
      expect(rows.map((row) => row.uuid)).toEqual([firstUuid, secondUuid]);
      rows.forEach(expectNotificationShape);
    });

    test('сохраняет порядок и индивидуальные поля mixed batch после enrichment', async ({ request }) => {
      const systemUuid = uniqueApiSuffix('notification-mixed-system');
      const createUuid = uniqueApiSuffix('notification-mixed-create');
      const updateUuid = uniqueApiSuffix('notification-mixed-update');
      const payload = [
        systemNotification({
          uuid: systemUuid,
          event: 'info',
          title: 'Mixed system title',
          message: 'Mixed system message',
        }),
        nonSystemNotification({
          uuid: createUuid,
          event: 'create',
          entity: 'material',
          entityId: 1,
          changedFields: [],
        }),
        nonSystemNotification({
          uuid: updateUuid,
          event: 'update',
          entity: 'material',
          entityId: 1,
          changedFields: [{ fieldName: 'name', oldValue: 'До', newValue: 'После' }],
        }),
      ];

      const response = await notificationsAPI.enrichBatchRaw(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);

      const rows = enrichedRows(response.data);
      expect(rows).toHaveLength(payload.length);
      expect(rows.map((row) => row.uuid)).toEqual([systemUuid, createUuid, updateUuid]);
      expect(rows.map((row) => row.event)).toEqual(['info', 'create', 'update']);
      rows.forEach(expectNotificationShape);
      expect(rows[0].title, JSON.stringify(rows[0])).toBe('Mixed system title');
      expect(rows[0].message, JSON.stringify(rows[0])).toBe('Mixed system message');
      expect(rows[1].message, JSON.stringify(rows[1])).toMatch(/[А-Яа-яA-Za-z]/);
      expect(rows[2].changes, JSON.stringify(rows[2])).toBeDefined();
    });

    test('обогащает non-system create/update с changedFields и русским сообщением', async ({ request }) => {
      const create = nonSystemNotification({
        uuid: uniqueApiSuffix('notification-create-material'),
        event: 'create',
        entity: 'material',
        entityId: 1,
      });
      const update = nonSystemNotification({
        uuid: uniqueApiSuffix('notification-update-material'),
        event: 'update',
        entity: 'material',
        entityId: 1,
        changedFields: [
          {
            fieldName: 'name',
            oldValue: 'Старое имя',
            newValue: 'Новое имя',
          },
        ],
      });

      const response = await notificationsAPI.enrichBatchRaw(request, [create, update], API_CONST.API_TEST_USER_ID, accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);

      const rows = enrichedRows(response.data);
      expect(rows).toHaveLength(2);
      rows.forEach((row) => {
        expectNotificationShape(row);
        expect(row.isSystem).toBe(false);
        expect(row.title || row.message, JSON.stringify(row)).toMatch(/[А-Яа-яA-Za-z]/);
      });
    });

    test('обогащает relations, user/material/role references если справочники доступны', async ({ request }) => {
      const materials = await materialsAPI.getMaterialsPagination(request, materialPaginationDto({ pageSize: 1 }), accessToken);
      expectNoServerError(materials);
      const material = getRows<ApiRow>(materials.data).find((row) => row.id);

      const roles = await rolesAPI.getAllRoles(request, accessToken);
      expectNoServerError(roles);
      const role = getRows<ApiRow>(roles.data).find((row) => row.id);

      const payload = nonSystemNotification({
        uuid: uniqueApiSuffix('notification-relations'),
        event: 'update',
        entity: 'material',
        entityId: material?.id ?? 1,
        userId: Number(API_CONST.API_TEST_USER_ID),
        changedFields: [
          { fieldName: 'responsible', oldValue: null, newValue: Number(API_CONST.API_TEST_USER_ID) },
          ...(role ? [{ fieldName: 'rolesId', oldValue: null, newValue: Number(role.id) }] : []),
        ],
        relations: {
          ...(material ? { detal_materials: [{ id: Number(material.id), quantity: 1 }] } : {}),
          addedFiles: [{ id: 999999999, name: 'missing-test-file.pdf' }],
          removedFiles: [],
        },
      });

      const response = await notificationsAPI.enrichBatchRaw(request, [payload], API_CONST.API_TEST_USER_ID, accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);

      const notification = enrichedRows(response.data)[0];
      expectNotificationShape(notification);
      expect(notification.userInfo || notification.user || notification.userId, JSON.stringify(notification)).toBeTruthy();
      expect(notification.message, JSON.stringify(notification)).toBeTruthy();
    });

    test('минимальные payload и unknown entity/event используют fallback без 5xx', async ({ request }) => {
      const payload = [
        { uuid: uniqueApiSuffix('notification-min-system'), isSystem: true, event: 'info', title: '', message: '' },
        nonSystemNotification({
          uuid: uniqueApiSuffix('notification-unknown'),
          entity: 'unknown_entity',
          event: 'unknown_event',
          entityId: 999999999,
        }),
        nonSystemNotification({
          uuid: uniqueApiSuffix('notification-no-relations'),
          event: 'info',
          message: 'Свободное сообщение',
          relations: undefined,
          changedFields: undefined,
        }),
      ];

      const response = await notificationsAPI.enrichBatchRaw(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
      expectNoServerError(response);
      expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      enrichedRows(response.data).forEach(expectNotificationShape);
    });

    test('минимальный невалидный объект не приводит к 5xx', async ({ request }) => {
      const response = await notificationsAPI.enrichBatchRaw(
        request,
        [{ uuid: uniqueApiSuffix('notification-invalid'), isSystem: false, event: 'update' }],
        API_CONST.API_TEST_USER_ID,
        accessToken,
      );

      expectValidationError(response);
    });

    test('invalid payload формы не приводят к 5xx', async ({ request }) => {
      for (const payload of [null, 'bad-payload', { uuid: 'object-not-array' }, [null], [{ event: 'info' }]]) {
        const response = await notificationsAPI.enrichBatchRaw(request, payload, API_CONST.API_TEST_USER_ID, accessToken);
        expectValidationError(response);
      }
    });

    test('авторизация: валидный JWT проходит, без JWT не проходит успешно', async ({ request }) => {
      const valid = await notificationsAPI.enrichBatchRaw(
        request,
        [systemNotification({ uuid: uniqueApiSuffix('notification-auth-valid') })],
        API_CONST.API_TEST_USER_ID,
        accessToken,
      );
      expectNoServerError(valid);
      expect(successCodes, JSON.stringify(valid.data)).toContain(valid.status);

      const noAuth = await notificationsAPI.enrichBatchRaw(
        request,
        [systemNotification({ uuid: uniqueApiSuffix('notification-auth-no-token') })],
        API_CONST.API_TEST_USER_ID,
      );
      expectUnauthorizedOrForbidden(noAuth);

      const invalidAuth = await notificationsAPI.enrichBatchRaw(
        request,
        [systemNotification({ uuid: uniqueApiSuffix('notification-auth-invalid') })],
        API_CONST.API_TEST_USER_ID,
        'invalid-token',
      );
      expectUnauthorizedOrForbidden(invalidAuth);
    });
  });
};
