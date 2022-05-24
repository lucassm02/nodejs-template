import { taskAdapter } from '@/main/adapters/task-adapter';

import { Options } from '../protocols';

export const exampleTask: Options = {
  enabled: true,
  cron: '*/1 * * * *',
  handler: taskAdapter(),
};
