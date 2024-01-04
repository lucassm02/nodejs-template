import { WorkerManager } from '@/infra/worker';

import { makeExampleJob, makeSaveInCacheJob } from '../factories/jobs';

export default (manager: WorkerManager) => {
  manager.makeWorker(
    { name: 'example' },
    makeExampleJob(),
    makeSaveInCacheJob({
      key: 'example',
      value: 'validateToken',
      extractField: 'token',
      ttl: 60 * 10 // 10 minutes
    })
  );
};
