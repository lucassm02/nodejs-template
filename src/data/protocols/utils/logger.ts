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
};

type LoggerType = 'offline' | 'default';

export interface Logger {
  log(params: LogParams, type?: LoggerType): void;
  log(error: Error, type?: LoggerType): void;
  log(params: LogParams | Error, type?: LoggerType): void;
}
