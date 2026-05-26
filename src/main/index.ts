import { elasticAPM } from '@/util/observability/apm/factory';

elasticAPM();

import('./bootstrap')
  .then(({ bootstrap }) => bootstrap())
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Bootstrap failed:', error);
    process.exit(1);
  });
