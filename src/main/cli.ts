import yargs from 'yargs';

const usage = `Usage: [COMMAND] [OPTIONS]`;

const cli = yargs.usage(usage);

cli.option('server', {
  alias: 's',
  describe: 'Enable Webserver',
  type: 'boolean',
  demandOption: false,
  requiresArg: false
});

cli.option('worker', {
  alias: 'w',
  describe: 'Enable worker',
  type: 'boolean',
  demandOption: false,
  requiresArg: false
});

cli.option('consumer', {
  alias: 'c',
  describe: 'Enable AMQP consumer',
  type: 'boolean',
  demandOption: false,
  requiresArg: false
});

cli.option('worker-dash', {
  alias: 'wd',
  describe: 'Enable worker dashboard',
  type: 'boolean',
  demandOption: false,
  requiresArg: false
});

export function getArgs() {
  const {
    server,
    worker,
    consumer,
    'worker-dash': dashboard
  } = <Record<string, unknown>>cli.argv;

  return { server, worker, consumer, dashboard };
}
