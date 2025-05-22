import { readdirSync } from 'fs';
import { resolve } from 'path';

import { Agenda } from '@hokify/agenda';
import { Job } from '@/job/protocols';
import { jobAdapter } from '@/main/adapters';
import {
  MONGO,
  WORKER,
  apmTransaction,
  elasticAPM,
  logger,
  workerLogger
} from '@/util';

import { WorkerOptions } from './types';

export class WorkerManager {
  private static instance: WorkerManager;
  private agenda!: Agenda;
  private collectionName = 'agenda';
  private workerLoaderOptions: {
    allowAll: boolean;
    denyAll: boolean;
    deny: string[];
    allow: string[];
  } = {
    allowAll: false,
    denyAll: false,
    deny: [],
    allow: []
  };

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

    this.extractWorkerOptions();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }

    return WorkerManager.instance;
  }

  public async start() {
    return this.agenda.start();
  }

  public async stop() {
    return this.agenda.stop();
  }

  public makeWorker(
    options: WorkerOptions,
    ...callbacks: (Job | Function)[]
  ): void;
  public async makeWorker(
    arg1: WorkerOptions,
    ...callbacks: (Job | Function)[]
  ): Promise<void> {
    const { repeatInterval, name } = arg1;

    const enabled = arg1?.enabled ?? true;

    const { allow, allowAll, deny, denyAll } = this.workerLoaderOptions;

    if (deny.includes(name)) return;

    if (denyAll && !allow.includes(name)) return;

    if (!enabled && !allowAll && !allow.includes(name)) return;

    const cronText = repeatInterval
      ? `, repeat interval: ${repeatInterval}`
      : '';

    logger.log({
      level: 'info',
      message: `New worker was registered, name: ${name}${cronText}`
    });

    this.agenda.define(name, async (job, done) => {
      const { data, repeatInterval } = job.attrs;
      await this.taskHandler(name, repeatInterval, data, () =>
        jobAdapter(...callbacks)(data)
      );
      done();
    });

    if (repeatInterval) {
      await this.agenda.every(repeatInterval, name, {});
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
    input: { repeat_interval: 1, data: 2 }
  })
  @apmTransaction({
    options: { nameByParameter: 0, type: 'worker' },
    params: { repeat_interval: 1, data: 2 }
  })
  private async taskHandler(
    _name: string,
    _repeatInterval: string | number | undefined,
    _data: unknown,
    callback: () => Promise<void>
  ): Promise<void> {
    await callback();
  }

  private extractWorkerOptions() {
    for (const item of WORKER.LIST) {
      if (item === '*') {
        this.workerLoaderOptions.allowAll = true;
        this.workerLoaderOptions.denyAll = false;
        continue;
      }
      if (item === '!*') {
        this.workerLoaderOptions.allowAll = false;
        this.workerLoaderOptions.denyAll = true;
        continue;
      }

      if (item[0] === '!') {
        this.workerLoaderOptions.deny.push(item.substring(1));
      } else {
        this.workerLoaderOptions.allow.push(item);
      }
    }
  }
}
