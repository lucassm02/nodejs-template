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

export interface Logger {
  log(params: LogParams): void;
  log(error: Error): void;
  log(params: LogParams | Error): void;
}
