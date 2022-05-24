import { consumerAdapter } from '@/main/adapters/consumer-adapter';

import { Options } from '../protocols';

export const exampleQueue: Options = {
  enabled: true,
  queue: 'example-queue',
  handler: consumerAdapter(),
};
