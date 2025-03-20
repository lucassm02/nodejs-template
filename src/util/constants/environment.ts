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
  PORT: process.env.SERVER_PORT || 3000,
  BASE_URI: process.env.SERVER_BASE_URI || '',
  SOCKET: {
    HANDSHAKE_PATH: process.env.SERVER_SOCKET_HANDSHAKE_PATH || ''
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
    PORT: process.env.WORKER_DASHBOARD_PORT || 8080,
    BASE_URI: process.env.WORKER_DASHBOARD_BASE_URI || '/dash'
  }
};

export const LOGGER = {
  ENABLED: stringToBoolean(process.env.LOGGER_ENABLED) || false,
  DB: {
    ENABLED: stringToBoolean(process.env.LOGGER_DB_ENABLED) || false
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
  CONFIG: process.env.DB_CONFIG || 'default',
  DIALECT: process.env.DB_DIALECT || 'mssql',
  HOST: process.env.DB_HOST || '',
  USERNAME: process.env.DB_USERNAME || '',
  PASSWORD: process.env.DB_PASSWORD || '',
  PORT: +(() => process.env.DB_PORT || 1433)()
};

export const RABBIT = {
  USER: process.env.RABBIT_USER || '',
  PASSWORD: process.env.RABBIT_PASSWORD || '',
  HOST: process.env.RABBIT_HOST || '',
  VIRTUAL_HOST: process.env.RABBIT_VIRTUAL_HOST || '',
  PORT: +(() => process.env.RABBIT_PORT || 5672)(),
  PREFETCH: +(() => process.env.RABBIT_PREFETCH || 10)()
};

export const MONGO = {
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
  ENABLED: stringToBoolean(process.env.MEMCACHED_ENABLED) || false,
  USER: process.env.MEMCACHED_USER || '',
  PASSWORD: process.env.MEMCACHED_PASSWORD || '',
  HOST: process.env.MEMCACHED_HOST || '',
  PORT: +(() => process.env.MEMCACHED_PORT || 11211)(),
  DEFAULT_TTL: process.env.MEMCACHED_DEFAULT_TTL || 60
};

export const APM = {
  ENABLED: stringToBoolean(process.env.APM_ENABLED) || false,
  SECRET_TOKEN: process.env.APM_SECRET_TOKEN || '',
  SERVER_URL: process.env.APM_SERVER_URL || '',
  ENVIRONMENT: process.env.APM_ENVIRONMENT || ''
};

export const ELASTICSEARCH = {
  ENABLED: stringToBoolean(process.env.ELASTICSEARCH_ENABLED) || false,
  USERNAME: process.env.ELASTICSEARCH_USERNAME || '',
  PASSWORD: process.env.ELASTICSEARCH_PASSWORD || '',
  SERVER_URL: process.env.ELASTICSEARCH_SERVER_URL || ''
};

export const REPROCESSING = {
  ENABLED: stringToBoolean(process.env.REPROCESSING_ENABLED) || false,
  MAX_TRIES: +(() => process.env.REPROCESSING_MAX_TRIES || 1)(),
  DELAYS: process.env.REPROCESSING_DELAYS?.split(',').map(Number) || [],
  MODE: process.env.REPROCESSING_MODE || 'STOPPED_MIDDLEWARE'
};
