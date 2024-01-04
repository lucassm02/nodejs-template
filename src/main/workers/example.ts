import { WorkerManager } from '@/infra/worker';

import { makeExampleJob, makeSaveInCacheJob } from '../factories/jobs';

const tenMinutes = 60 * 10;

export default (manager: WorkerManager) => {
  manager.makeWorker(
    { name: 'example' },
    makeExampleJob(),
    makeSaveInCacheJob({
      key: 'example',
      value: 'validateToken',
      extractField: 'token',
      ttl: tenMinutes
    })
  );
};
