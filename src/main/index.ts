import { CONSUMER, WORKER, SERVER } from '@/util';

(async () => {
  if (CONSUMER.ENABLED) {
    await import('./consumer');
  }

  if (SERVER.ENABLED) {
    await import('./server');
  }

  if (WORKER.ENABLED) {
    await import('./worker');
  }
})();
