import knexSetup from '@/infra/db/mssql/util/knex';
import { CONSUMER, WORKER, SERVER, logger } from '@/util';

import { eventHandler } from './util';

knexSetup();

async function main() {
  const promises = [];

  if (CONSUMER.ENABLED) promises.push(import('./consumer'));
  if (SERVER.ENABLED) promises.push(import('./server'));
  if (WORKER.ENABLED) promises.push(import('./worker'));
  if (WORKER.DASHBOARD.ENABLED) promises.push(import('./agendash'));

  if (promises.length === 0) {
    logger.log(
      {
        level: 'warn',
        message: 'No service enabled, exiting...'
      },
      'offline'
    );
    return;
  }

  await Promise.all(promises);

  eventHandler().on('exit', () => {
    setImmediate(() => {
      process.exit(0);
    });
  });
}

main();
