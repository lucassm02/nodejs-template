import { WorkerManager } from './worker-manager';

// TODO: I think this function is not used
export function workerManager(getInstance = true) {
  if (getInstance) return WorkerManager.getInstance();
  return new WorkerManager();
}
