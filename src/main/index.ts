import knexSetup from '@/infra/db/mssql/util/knex';
import { CONSUMER, WORKER, SERVER } from '@/util';

knexSetup();

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

  if (WORKER.DASHBOARD.ENABLED) {
    await import('./agendash');
  }
})();
