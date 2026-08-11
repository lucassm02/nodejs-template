import { readdirSync } from 'fs';
import { resolve } from 'path';
import type { Agenda as AgendaInstance, Job as AgendaJob } from 'agenda';

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
  private agenda: Promise<AgendaInstance> | null = null;
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

    this.extractWorkerOptions();
  }

  private async getAgenda(): Promise<AgendaInstance> {
    if (!this.agenda) {
      this.agenda = this.createAgenda();
    }

    return this.agenda;
  }

  private async createAgenda(): Promise<AgendaInstance> {
    const [{ Agenda }, { MongoBackend }] = await Promise.all([
      import('agenda'),
      import('@agendajs/mongo-backend')
    ]);
    const mongoUrl = `${MONGO.URL()}/${MONGO.NAME}?authSource=${
      MONGO.AUTH_SOURCE
    }`;

    const agenda = new Agenda({
      backend: new MongoBackend({
        address: mongoUrl,
        collection: this.collectionName
      })
    });

    agenda
      .on('fail', (error) => {
        const message = error instanceof Error ? error.message : String(error);
        logger.log({ level: 'error', message });
      })
      .on('ready', () => {
        logger.log({ level: 'info', message: 'Scheduler ready!' });
      })
      .on('start', () => {
        logger.log({ level: 'info', message: 'Scheduler started!' });
      })
      .on('error', (error) => {
        logger.log({ level: 'error', message: error.message });
      });

    return agenda;
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }

    return WorkerManager.instance;
  }

  public async start() {
    const agenda = await this.getAgenda();
    return agenda.start();
  }

  public async stop() {
    const agenda = await this.getAgenda();
    return agenda.stop();
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

    const agenda = await this.getAgenda();

    agenda.define(name, async (job: AgendaJob, done) => {
      const { data, repeatInterval } = job.attrs;
      const payload = (data ?? {}) as Record<string, unknown>;
      try {
        await this.taskHandler(name, repeatInterval, payload, () =>
          jobAdapter(...callbacks)(payload)
        );
      } finally {
        done();
      }
    });

    if (repeatInterval) {
      await agenda.every(repeatInterval, name, {});
    }
  }

  public async tasksDirectory(path: string): Promise<void> {
    const extensionsToSearch = ['.TS', '.JS'];
    const ignoreIfIncludes = ['.MAP.', '.SPEC.', '.TEST.'];

    const files = readdirSync(path);

    const validFilePaths = files
      .filter((fileName) => {
        const fileNameToUpperCase = fileName.toLocaleUpperCase();
        const hasAValidExtension = ignoreIfIncludes.map((text) =>
          fileNameToUpperCase.includes(text)
        );
        const haveAValidName = extensionsToSearch.map((ext) =>
          fileNameToUpperCase.endsWith(ext)
        );
        return (
          haveAValidName.some(Boolean) && !hasAValidExtension.some(Boolean)
        );
      })
      .map((fileName) => resolve(path, fileName));

    const results = await Promise.allSettled(
      validFilePaths.map((filePath) => import(filePath))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        logger.log(result.reason);
        logger.log({
          level: 'error',
          message: `Failed to load worker file ${validFilePaths[i]}. Verify that the file exists and is correctly formatted.`
        });
        continue;
      }
      const setup = result.value.default;
      if (typeof setup !== 'function') continue;
      setup(this);
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
