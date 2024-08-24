import k from 'knex';

import { turboInterceptorPlugin } from './turbo-interceptor';
import { turboQueryBuilderExtension } from './turbo-query-builder-extension';
import { getCurrentDrive } from '../../utils';

const ALLOWED_DRIVERS = ['MSSQL'];

export function turboPlugin(knex: typeof k) {
  const proxy = new Proxy(knex, {
    apply(target, _, [config]: [k.Knex.Config]) {
      const turboIsEnabled = ALLOWED_DRIVERS.includes(getCurrentDrive(config));

      if (turboIsEnabled) {
        target = turboQueryBuilderExtension(target);
        target = turboInterceptorPlugin(target);
      }

      return target(config);
    }
  });

  return proxy;
}
