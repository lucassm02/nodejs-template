import { WorkerManager } from '@/infra/worker';

import { makeExampleTask } from '../factories/tasks';

export default (manager: WorkerManager) => {
  manager.makeWorker(
    { name: 'example', cron: '*/1 * * * *' },
    makeExampleTask()
  );
};
