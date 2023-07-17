import { Job } from '@/job/protocols';
import { consumerAdapter } from '@/main/adapters';
import {
  MONGO,
  apmTransaction,
  elasticAPM,
  logger,
  workerLogger,
} from '@/util';
import { Agenda } from '@hokify/agenda';
import { readdirSync } from 'fs';
import { resolve } from 'path';

import { WorkerOptions } from './types';

export class WorkerManager {
  private static instance: WorkerManager;
  private agenda!: Agenda;
  private collectionName = 'agenda';

  constructor() {
    elasticAPM();

    this.agenda = new Agenda();

    const mongoUrl = `${MONGO.URL()}/${MONGO.NAME}?authSource=${
      MONGO.AUTH_SOURCE
    }`;

    this.agenda
      .on('fail', (error) => {
        logger.log({ level: 'error', message: error.message });
      })
      .on('ready', () => {
        logger.log({ level: 'info', message: 'Scheduler ready!' });
      })
      .on('start', () => {
        logger.log({ level: 'info', message: 'Scheduler started!' });
      })
      .on('error', (error) => {
        logger.log({ level: 'info', message: error.message });
      });

    this.agenda.database(mongoUrl, this.collectionName);
    this.agenda.start();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }

    return WorkerManager.instance;
  }

  public makeWorker(
    options: WorkerOptions,
    ...callbacks: (Job | Function)[]
  ): void;
  public async makeWorker(
    arg1: WorkerOptions,
    ...callbacks: (Job | Function)[]
  ): Promise<void> {
    const { cron, name } = arg1;

    const enabled = arg1?.enabled ?? true;

    if (!enabled) return;

    logger.log({
      level: 'info',
      message: `New task was registered, name: ${name}, cron: ${cron}`,
    });

    this.agenda.define(name, async (job, done) => {
      const { data, repeatInterval } = job.attrs;
      await this.taskHandler(name, repeatInterval, () =>
        consumerAdapter(...callbacks)(data)
      );
      done();
    });

    if (cron) {
      await this.agenda.every(cron, name, {});
    }
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

  @workerLogger({
    options: { nameByParameter: 0, subType: 'task' },
    input: { cron: 1 },
  })
  @apmTransaction({
    options: { nameByParameter: 0, type: 'worker' },
    params: { cron: 1 },
  })
  private async taskHandler(
    _name: string,
    _cron: string | number | undefined,
    callback: () => Promise<void>
  ): Promise<void> {
    await callback();
  }
}
