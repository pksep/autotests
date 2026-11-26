import type { RecalculationJob } from '../../pages/API/APIRecalculationQueue';

// Bull assigns increasing numeric ids. Compare ids, not clocks on two machines.
export function recalculationWatermark(jobs: RecalculationJob[]): bigint {
  return jobs.reduce((max, job) => {
    if (!/^\d+$/.test(job.id)) throw new Error('Recalculation queue requires numeric Bull job ids');
    const id = BigInt(job.id);
    return id > max ? id : max;
  }, BigInt(0));
}

export async function waitForNewGlobalRecalculation(options: {
  watermark: bigint;
  list: () => Promise<RecalculationJob[]>;
  read: (id: string) => Promise<RecalculationJob & { state: string }>;
  timeoutMs?: number;
  intervalMs?: number;
}) {
  const started = Date.now();
  const timeoutMs = options.timeoutMs ?? 60_000;
  let selected: RecalculationJob | undefined;
  let state = 'not-enqueued';
  while (Date.now() - started < timeoutMs) {
    if (!selected) {
      selected = (await options.list())
        .filter(job => job.isGlobal && recalculationWatermark([job]) > options.watermark)
        .sort((a, b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1)[0];
    }
    if (selected) {
      const job = await options.read(selected.id);
      state = job.state;
      if (state === 'failed') {
        throw new Error(`Global recalculation job ${job.id} failed after ${job.attempts} attempts`);
      }
      if (state === 'completed') {
        if (job.returnValue !== true || !job.finishedOn) {
          throw new Error(`Global recalculation job ${job.id} completed without a successful result`);
        }
        return { jobId: job.id, state, durationMs: Date.now() - started, attempts: job.attempts };
      }
    }
    await new Promise(resolve => setTimeout(resolve, options.intervalMs ?? 500));
  }
  throw new Error(`Global recalculation did not complete in ${timeoutMs} ms; job=${selected?.id ?? 'not-enqueued'}, state=${state}`);
}
