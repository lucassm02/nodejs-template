import pkg from '@/../package.json';
import { createMongoLog } from '@/main/facades';
import { ELASTICSEARCH, LOGGER } from '@/util/constants';
import ecsFormat from '@elastic/ecs-winston-format';
import path from 'path';
import { Logger, createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';

import { elasticAPM, getAPMTransactionIds } from '../../apm';
import { defaultIndexTemplate } from './elasticsearch';
import { cli, standard } from './formats';
import { elasticSearchTransformer } from './transformer/elasticsearch-transformer';
import { GenericTransport } from './transports';

type LogParams = {
  level:
    | 'error'
    | 'warn'
    | 'info'
    | 'http'
    | 'verbose'
    | 'debug'
    | 'silly'
    | String;
  message: string;
  payload?: object;
  meta?: object;
  [key: string]: unknown;
};

type LoggerType = 'offline' | 'default';

const apm = elasticAPM().getAPM();

const { combine, timestamp, colorize } = format;

const defaultTimestampFormat = timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

export class CustomLogger {
  private static instance: CustomLogger;

  private defaultLogger!: Logger;
  private offlineLogger!: Logger;

  constructor() {
    const fileTransport = new DailyRotateFile({
      filename: 'logs',
      extension: '.log',
      datePattern: 'YYYY-MM-DD',
      dirname: path.resolve('log'),
      level: 'debug',
      format: combine(defaultTimestampFormat, standard),
    });

    const consoleTransport = new transports.Console({
      level: LOGGER.CONSOLE.LEVEL,
      format: combine(defaultTimestampFormat, cli, colorize({ all: true })),
    });

    this.defaultLogger = createLogger({
      transports: [fileTransport, consoleTransport],
    });

    this.offlineLogger = createLogger({
      transports: [fileTransport, consoleTransport],
    });

    const mongoDbTransport = new GenericTransport({
      level: 'verbose',
      format: combine(defaultTimestampFormat, standard),
      receiver: createMongoLog,
    });

    if (ELASTICSEARCH.ENABLED) {
      const elasticsearchTransport = new ElasticsearchTransport({
        apm,
        level: 'http',
        index: 'application-log',
        indexTemplate: defaultIndexTemplate,
        dataStream: true,
        useTransformer: true,
        transformer: elasticSearchTransformer,
        format: ecsFormat({
          apmIntegration: true,
          convertErr: true,
        }),
        clientOpts: {
          node: ELASTICSEARCH.SERVER_URL,
          auth: {
            username: ELASTICSEARCH.USERNAME,
            password: ELASTICSEARCH.PASSWORD,
          },
        },
      });

      this.defaultLogger.add(elasticsearchTransport);
    }

    if (LOGGER.DB.ENABLED) {
      this.defaultLogger.add(mongoDbTransport);
    }
  }

  public static getInstance(): CustomLogger {
    if (!CustomLogger.instance) {
      CustomLogger.instance = new CustomLogger();
    }

    return CustomLogger.instance;
  }

  public log(error: Error, type?: LoggerType): void;
  public log(params: LogParams, type?: LoggerType): void;
  public log(data: LogParams | Error, type: LoggerType = 'default'): void {
    const logger = type === 'offline' ? this.offlineLogger : this.defaultLogger;
    this.handler(data, logger);
  }

  private handler(params: LogParams | Error, logger: Logger) {
    if (!params) {
      this.offlineLogger.log({
        level: 'error',
        message: `Unable to handle with log action ${JSON.stringify(params)}`,
      });
      return;
    }

    const application = { name: pkg.name ?? 'nodejs-application' };

    const ids = getAPMTransactionIds();

    if (params instanceof Error) {
      if (apm) {
        apm.captureError(params);
      }

      logger.log({
        traceId: ids?.traceId,
        transactionId: ids?.transactionId,
        application,
        name: params.name,
        message: params.message,
        stack: params.stack,
        level: 'error',
      });

      return;
    }

    const { level, message, ...rest } = params;

    logger.log({
      traceId: ids?.traceId,
      transactionId: ids?.transactionId,
      application,
      message,
      level: <string>level ?? 'warn',
      ...rest,
    });
  }
}
