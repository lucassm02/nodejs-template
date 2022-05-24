import { Job } from 'node-schedule';

export interface AddSchedule {
  add(cron: string, callback: Function): AddSchedule.Result;
}

export namespace AddSchedule {
  export type Result = Job;
}
