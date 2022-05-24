import { AddSchedule } from '@/main/protocols';
import { scheduleJob } from 'node-schedule';

export class Scheduler implements AddSchedule {
  add(cron: string, callback: Function): AddSchedule.Result {
    return scheduleJob(cron, () => callback());
  }
}
