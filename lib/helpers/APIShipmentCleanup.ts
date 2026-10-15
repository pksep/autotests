import { APIRequestContext, expect } from '@playwright/test';
import type { ShipmentsAPI } from '../../pages/API/APIShipments';
import { expectNoServerError, successCodes } from './APIAssertions';
import { eventually } from './APITestUtils';

type ShCheckAPI = Pick<ShipmentsAPI, 'getShCompleteById' | 'rollbackShCheck'>;
type ShCheckResult = Awaited<ReturnType<ShCheckAPI['getShCompleteById']>>;

const isArchivedShCheck = (response: ShCheckResult) =>
  response.status === 405 || (successCodes.includes(response.status) && response.data?.ban === true);

export const rollbackShChecksAndWait = async (
  request: APIRequestContext,
  shipmentsAPI: ShCheckAPI,
  ids: number[],
  accessToken?: string,
  options: { attempts?: number; intervalMs?: number } = {},
): Promise<void> => {
  const uniqueIds = new Set(ids.filter((id) => Number.isInteger(id) && id > 0));
  for (const id of uniqueIds) {
    const before = await shipmentsAPI.getShCompleteById(request, id, accessToken);
    expectNoServerError(before);
    // GET /shcomplite/:id returns 405 for an archived completion.
    if (isArchivedShCheck(before)) continue;
    expect(successCodes, JSON.stringify(before.data)).toContain(before.status);

    const rollback = await shipmentsAPI.rollbackShCheck(request, id, accessToken);
    expectNoServerError(rollback);
    expect(successCodes, JSON.stringify(rollback.data)).toContain(rollback.status);

    const archived = await eventually(async () => {
      const response = await shipmentsAPI.getShCompleteById(request, id, accessToken);
      expectNoServerError(response);
      if (!isArchivedShCheck(response)) {
        expect(successCodes, JSON.stringify(response.data)).toContain(response.status);
      }
      return response;
    }, isArchivedShCheck, { attempts: options.attempts ?? 30, intervalMs: options.intervalMs ?? 1000 });
    if (!archived) {
      throw new Error(`CancelShComplit did not archive completion ${id}; related fixtures must remain active`);
    }
  }
};
