import { Logger } from '@/data/protocols/util';

export class LoggerStub implements Logger {
  log(params: {
    level:
      | String
      | 'error'
      | 'warn'
      | 'info'
      | 'http'
      | 'verbose'
      | 'debug'
      | 'silly';
    message: string;
    payload?: object | undefined;
  }): void;
  log(error: Error): void;
  log(
    params:
      | Error
      | {
          level:
            | String
            | 'error'
            | 'warn'
            | 'info'
            | 'http'
            | 'verbose'
            | 'debug'
            | 'silly';
          message: string;
          payload?: object | undefined;
        }
  ): void;
  log(): void {}
}
