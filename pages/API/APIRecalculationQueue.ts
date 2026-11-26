import type { APIRequestContext } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export type RecalculationJob = {
  id: string;
  isGlobal: boolean;
  finishedOn?: number;
  attempts?: number;
  returnValue?: unknown;
};

// Expose only the fields needed for verification. Other jobs may contain user data.
const summary = (job: any): RecalculationJob => ({
  id: String(job.id), isGlobal: job.data?.isGlobal === true,
  finishedOn: job.finishedOn, attempts: job.attempts, returnValue: job.returnValue,
});

export class RecalculationQueueAPI extends APIPageObject {
  private base = () => ENV.API_BASE_URL + 'api/queues/api/queues';

  async list(request: APIRequestContext, accessToken?: string) {
    const response = await this.apiRequest(request, 'GET',
      this.base() + '?activeQueue=ActualTaskRelative&status=latest&page=1&jobsPerPage=100', { accessToken });
    if (response.status !== 200) throw new Error(`Cannot read recalculation queue: HTTP ${response.status}`);
    const queue = response.data?.queues?.find((row: any) => row.name === 'ActualTaskRelative');
    if (!Array.isArray(queue?.jobs)) throw new Error('ActualTaskRelative jobs are missing from queue response');
    return queue.jobs.map(summary) as RecalculationJob[];
  }

  async job(request: APIRequestContext, id: string, accessToken?: string) {
    const response = await this.apiRequest(request, 'GET',
      this.base() + '/ActualTaskRelative/' + encodeURIComponent(id), { accessToken });
    if (response.status !== 200) throw new Error(`Cannot read recalculation job ${id}: HTTP ${response.status}`);
    if (String(response.data?.job?.id) !== id || typeof response.data?.status !== 'string') {
      throw new Error(`Invalid recalculation job response for ${id}`);
    }
    return { ...summary(response.data.job), state: response.data.status as string };
  }
}
