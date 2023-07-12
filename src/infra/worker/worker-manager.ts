import { taskAdapter } from '@/main/adapters/task-adapter';
import { Task } from '@/schedule/protocols';
import { apmTransaction, logger } from '@/util';
import { readdirSync } from 'fs';
import { scheduleJob } from 'node-schedule';
import { resolve } from 'path';

import { WorkerOptions } from './types';

export class WorkerManager {
  private static instance: WorkerManager;

  constructor() {}

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }

    return WorkerManager.instance;
  }

  public makeWorker(
    options: WorkerOptions,
    ...callbacks: (Task | Function)[]
  ): void;
  public makeWorker(
    arg1: WorkerOptions,
    ...callbacks: (Task | Function)[]
  ): void {
    const { cron, name } = arg1;

    const enabled = arg1?.enabled ?? true;

    if (!enabled) return;

    logger.log({
      level: 'info',
      message: `New task was registered, name: ${name}, cron: ${cron}`,
    });

    this.taskHandler(name, cron, taskAdapter(...callbacks));
  }

  public async tasksDirectory(path: string): Promise<void> {
    const extensionsToSearch = ['.TS', '.JS'];
    const ignoreIfIncludes = ['.MAP.', '.SPEC.', '.TEST.'];

    const files = readdirSync(path);

    for await (const fileName of files) {
      const fileNameToUpperCase = fileName.toLocaleUpperCase();

      const hasAValidExtension = ignoreIfIncludes.map((text) =>
        fileNameToUpperCase.includes(text)
      );

      const haveAValidName = extensionsToSearch.map((ext) =>
        fileNameToUpperCase.endsWith(ext)
      );

      if (haveAValidName && hasAValidExtension) {
        const filePath = resolve(path, fileName);
        const setup = (await import(filePath)).default;

        if (typeof setup !== 'function') continue;

        setup(this);
      }
    }
  }

  @apmTransaction({
    options: { nameByParameter: 0, type: 'worker' },
    params: { cron: 1 },
  })
  private taskHandler(
    name: string,
    cron: string,
    callback: () => Promise<void>
  ) {
    scheduleJob(cron, callback);
  }
}
