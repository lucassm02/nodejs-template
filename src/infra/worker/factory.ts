import { WorkerManager } from './worker-manager';

export function workerManager(getInstance = true) {
  if (getInstance) return WorkerManager.getInstance();
  return new WorkerManager();
}
