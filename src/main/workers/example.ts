import { WorkerManager } from '@/infra/worker';

import { makeExampleJob } from '../factories/jobs';

export default (manager: WorkerManager) => {
  manager.makeWorker({ name: 'example' }, makeExampleJob());
};
