import { APM } from '@/util/constants';
import agent from 'elastic-apm-node';
import path from 'path';
import 'reflect-metadata';

export type Agent = agent.Agent;

export class ElasticAPM {
  private apm: Agent | null = null;

  private static instance: ElasticAPM;

  constructor() {
    if (!APM.ENABLED) return;
    this.apm = this.start();
  }

  public static getInstance(): ElasticAPM {
    if (!ElasticAPM.instance) {
      ElasticAPM.instance = new ElasticAPM();
    }

    return ElasticAPM.instance;
  }

  private start() {
    const fileName = 'apm.ndjson';
    const filePath = path.resolve('log', fileName);

    return agent.start({
      secretToken: APM.SECRET_TOKEN,
      serverUrl: APM.SERVER_URL,
      environment: APM.ENVIRONMENT,
      active: true,
      captureBody: 'all',
      captureHeaders: true,
      captureErrorLogStackTraces: 'always',
      captureExceptions: true,
      asyncHooks: true,
      logLevel: 'off',
      payloadLogFile: filePath,
      logUncaughtExceptions: true,
      instrument: true,
      instrumentIncomingHTTPRequests: true,
      captureSpanStackTraces: true,
    });
  }

  public getAPM(): Agent | null {
    return this.apm;
  }
}
