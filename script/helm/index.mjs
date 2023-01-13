/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import yargs from 'yargs';

import { handler } from './handler.mjs';

const usage = `
Usage: yarn helm:gen [OPTIONS]              
`;

const cli = yargs.usage(usage);

cli.option('environment', {
  alias: 'e',
  describe: 'Set environment',
  type: 'string',
  demandOption: true,
  requiresArg: true,
});

cli.option('scan-routes', {
  describe: 'Enable route scanning',
  type: 'boolean',
});

const { environment, 'scan-routes': scanRoutes } = cli.argv;

await handler(environment, scanRoutes);
