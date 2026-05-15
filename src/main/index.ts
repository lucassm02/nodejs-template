import { bootstrap } from './bootstrap';

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
