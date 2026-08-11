import 'dotenv/config';
import { stringToBoolean } from '../text';

const getConsumerArrayFromEnv = (env?: string) => {
  if (!env) return [];

  return String(env)
    .split(',')
    .map((item) => item.trim());
};

export const ENVIRONMENT = process.env.NODE_ENV || 'development';

export const SERVER = {
  ENABLED: process.env.SERVER_ENABLED === 'true',
  PORT: +(() => process.env.SERVER_PORT || 3000)(),
  BASE_URI: process.env.SERVER_BASE_URI || '',
  SOCKET: {
    HANDSHAKE_PATH: process.env.SERVER_SOCKET_HANDSHAKE_PATH || '',
    CORS_ORIGIN: process.env.SERVER_SOCKET_CORS_ORIGIN || '*'
  }
};

export const CONSUMER = {
  ENABLED: process.env.CONSUMER_ENABLED === 'true',
  LIST: getConsumerArrayFromEnv(process.env.CONSUMER_LIST)
};

export const WORKER = {
  ENABLED: process.env.WORKER_ENABLED === 'true',
  LIST: getConsumerArrayFromEnv(process.env.WORKER_LIST),
  DASHBOARD: {
    ENABLED: process.env.WORKER_DASHBOARD_ENABLED === 'true',
    PORT: +(() => process.env.WORKER_DASHBOARD_PORT || 8080)(),
    BASE_URI: process.env.WORKER_DASHBOARD_BASE_URI || '/dash'
  }
};

export const LOGGER = {
  ENABLED: stringToBoolean(process.env.LOGGER_ENABLED) || true,
  DB: {
    ENABLED: stringToBoolean(process.env.LOGGER_DB_ENABLED) || false,
    BULK_SIZE: +(() => process.env.LOGGER_DB_BULK_SIZE || 10)(),
    FLUSH_INTERVAL_MS: +(() =>
      process.env.LOGGER_DB_FLUSH_INTERVAL_MS || 100)(),
    MAX_QUEUE_SIZE: +(() => process.env.LOGGER_DB_MAX_QUEUE_SIZE || 10_000)()
  },
  CONSOLE: { LEVEL: process.env.LOGGER_CONSOLE_LEVEL || 'info' }
};

export const ENCRYPTION = {
  KEY: process.env.ENCRYPTION_KEY || '',
  IV: process.env.ENCRYPTION_IV || ''
};

export const API = {
  BASE_URL: process.env.API_BASE_URL || ''
};

export const DB = {
  ENABLED: process.env.DB_ENABLED
    ? stringToBoolean(process.env.DB_ENABLED)
    : true,
  DB_TEST_CONNECTION_QUERY: process.env.DB_TEST_CONNECTION_QUERY || 'SELECT 1',
  CONNECTION_TIMEOUT_MS: +(() =>
    process.env.DB_CONNECTION_TIMEOUT_MS || 60000)(),
  MAX_POOL: +(() => process.env.DB_MAX_POOL || 10)(),
  MIN_POOL: +(() => process.env.DB_MIN_POOL || 2)(),
  IDLE_TIMEOUT_IN_MILLISECONDS: +(() =>
    process.env.DB_IDLE_TIMEOUT_IN_MILLISECONDS || 30000)(),
  REPEAT_INTERVAL_IN_MS: +(() =>
    process.env.DB_REPEAT_INTERVAL_IN_MS || 1000)(),
  CREATE_RETRY_INTERVAL_IN_MS: +(() =>
    process.env.DB_CREATE_RETRY_INTERVAL_IN_MS || 200)(),
  CONFIG: process.env.DB_CONFIG || 'default',
  DIALECT: process.env.DB_DIALECT || 'mssql',
  HOST: process.env.DB_HOST || '',
  USERNAME: process.env.DB_USERNAME || '',
  PASSWORD: process.env.DB_PASSWORD || '',
  PORT: +(() => process.env.DB_PORT || 1433)()
};

export const RABBIT = {
  ENABLED: stringToBoolean(process.env.RABBIT_ENABLED) ?? false,
  USER: process.env.RABBIT_USER || '',
  PASSWORD: process.env.RABBIT_PASSWORD || '',
  HOST: process.env.RABBIT_HOST || '',
  VIRTUAL_HOST: process.env.RABBIT_VIRTUAL_HOST || '',
  PORT: +(() => process.env.RABBIT_PORT || 5672)(),
  // Without a prefetch the broker delivers the whole queue at once and the
  // process holds every message in heap, so the default must be bounded.
  DEFAULT_PREFETCH: (() => {
    const DEFAULT = 10;
    const value = Number(process.env.RABBIT_DEFAULT_PREFETCH);

    if (!Number.isInteger(value) || value <= 0) return DEFAULT;

    return value;
  })()
};

export const MONGO = {
  ENABLED: process.env.MONGO_ENABLED
    ? stringToBoolean(process.env.MONGO_ENABLED)
    : true,
  CONNECTION_TIMEOUT_MS: +(() =>
    process.env.MONGO_CONNECTION_TIMEOUT_MS || 60000)(),
  MAX_POOL_SIZE: +(() => process.env.MONGO_MAX_POOL_SIZE || 100)(),
  MIN_POOL_SIZE: +(() => process.env.MONGO_MIN_POOL_SIZE || 1)(),
  USER: process.env.MONGO_USER || '',
  PASSWORD: process.env.MONGO_PASSWORD || '',
  HOST: process.env.MONGO_HOST || '',
  PORT: +(() => process.env.MONGO_PORT || 27017)(),
  NAME: process.env.MONGO_NAME || '',
  AUTH_SOURCE: process.env.MONGO_AUTH_SOURCE || '',
  URL() {
    return `mongodb://${this?.USER}:${this.PASSWORD}@${this.HOST}:${this.PORT}`;
  }
};

export const MEMCACHED = {
  ENABLED: stringToBoolean(process.env.MEMCACHED_ENABLED) ?? false,
  USER: process.env.MEMCACHED_USER || '',
  PASSWORD: process.env.MEMCACHED_PASSWORD || '',
  HOST: process.env.MEMCACHED_HOST || '',
  PORT: +(() => process.env.MEMCACHED_PORT || 11211)(),
  DEFAULT_TTL: +(() => process.env.MEMCACHED_DEFAULT_TTL || 60)()
};

export const APM = {
  ENABLED: stringToBoolean(process.env.APM_ENABLED) ?? false,
  SECRET_TOKEN: process.env.APM_SECRET_TOKEN || '',
  SERVER_URL: process.env.APM_SERVER_URL || '',
  ENVIRONMENT: process.env.APM_ENVIRONMENT || '',
  // Capture a stack trace only for spans at least this long. Kibana's central
  // config exposes the same knob under `span_stack_trace_min_duration`.
  // `-1` disables span stack traces, `0` captures every span. The `10ms`
  // default matches the behaviour of the deprecated `captureSpanStackTraces`.
  SPAN_STACK_TRACE_MIN_DURATION: (() => {
    const DEFAULT = '10ms';
    const value = process.env.APM_SPAN_STACK_TRACE_MIN_DURATION?.trim();

    if (!value || !/^-?\d+(\.\d+)?(ms|s|m)?$/.test(value)) return DEFAULT;

    return value;
  })(),
  CAPTURE_BODY: (() => {
    const DEFAULT = 'all';
    const options = ['off', 'errors', 'transactions', 'all'] as const;
    const value = process.env.APM_CAPTURE_BODY;

    type CaptureBody = (typeof options)[number];

    return options.includes(<CaptureBody>value) ? <CaptureBody>value : DEFAULT;
  })()
};

export const ELASTICSEARCH = {
  ENABLED: stringToBoolean(process.env.ELASTICSEARCH_ENABLED) ?? false,
  USERNAME: process.env.ELASTICSEARCH_USERNAME || '',
  PASSWORD: process.env.ELASTICSEARCH_PASSWORD || '',
  SERVER_URL: process.env.ELASTICSEARCH_SERVER_URL || ''
};

export const REPROCESSING = {
  ENABLED: stringToBoolean(process.env.REPROCESSING_ENABLED) ?? false,
  MAX_TRIES: +(() => process.env.REPROCESSING_MAX_TRIES || 1)(),
  DELAYS:
    process.env.REPROCESSING_DELAYS?.split(',')
      .map(Number)
      .filter(Number.isFinite) || [],
  MODE: process.env.REPROCESSING_MODE || 'STOPPED_MIDDLEWARE'
};

if (DB.MIN_POOL > DB.MAX_POOL) {
  throw new Error(
    `Invalid DB pool config: DB_MIN_POOL (${DB.MIN_POOL}) cannot be greater than DB_MAX_POOL (${DB.MAX_POOL})`
  );
}

if (MONGO.MIN_POOL_SIZE > MONGO.MAX_POOL_SIZE) {
  throw new Error(
    `Invalid Mongo pool config: MONGO_MIN_POOL_SIZE (${MONGO.MIN_POOL_SIZE}) cannot be greater than MONGO_MAX_POOL_SIZE (${MONGO.MAX_POOL_SIZE})`
  );
}
