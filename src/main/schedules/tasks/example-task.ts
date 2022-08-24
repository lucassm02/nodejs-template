import { taskAdapter } from '@/main/adapters/task-adapter';
import { makeExampleTask } from '@/main/factories/tasks';

import { Options } from '../protocols';

export const exampleTask: Options = {
  enabled: true,
  cron: '*/1 * * * *',
  handler: taskAdapter(makeExampleTask()),
};
