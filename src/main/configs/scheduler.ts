import * as consumers from '@/main/schedules';

import { AddSchedule } from '../protocols';

export const schedulerSetup = (server: AddSchedule) => {
  Object.values(consumers)
    .filter((task) => task.enabled)
    .forEach((task) => {
      server.add(task.cron, task.handler);
    });
};
