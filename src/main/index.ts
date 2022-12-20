import { CONSUMER, SCHEDULER, SERVER } from '@/util';

(async () => {
  if (CONSUMER.ENABLED) {
    await import('./consumer');
  }

  if (SERVER.ENABLED) {
    await import('./server');
  }

  if (SCHEDULER.ENABLED) {
    await import('./scheduler');
  }
})();
