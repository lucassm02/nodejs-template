import 'dotenv/config';
import { stringToBoolean } from '../text';

export const SERVER = {
  PORT: process.env.SERVER_PORT || 3000,
  BASE_URI: process.env.SERVER_BASE_URI || '',
};

export const LOGGER = {
  DB: {
    ENABLED: stringToBoolean(process.env.LOGGER_DB_ENABLED) || false,
  },
  CONSOLE: { LEVEL: process.env.LOGGER_CONSOLE_LEVEL || 'info' },
};

export const ENCRYPTION = {
  KEY: process.env.ENCRYPTION_KEY || '',
  IV: process.env.ENCRYPTION_IV || '',
};

export const API = {
  AUTHENTICATOR: process.env.API_AUTHENTICATOR || '',
  CARD_MANAGEMENT: process.env.API_CARD_MANAGEMENT || '',
  TRANSACTION_MANAGEMENT: process.env.API_TRANSACTION_MANAGEMENT || '',
  TELECALL_TOKEN_MANAGEMENT: process.env.API_TELECALL_TOKEN_MANAGEMENT || '',
  TELECALL: process.env.API_TELECALL || '',
};

export const DB = {
  DIALECT: process.env.DB_DIALECT || 'mssql',
  HOST: process.env.DB_HOST || '',
  USERNAME: process.env.DB_USERNAME || '',
  PASSWORD: process.env.DB_PASSWORD || '',
  PORT: process.env.DB_PORT || 1433,
};

export const RABBIT = {
  USER: process.env.RABBIT_USER || '',
  PASSWORD: process.env.RABBIT_PASSWORD || '',
  HOST: process.env.RABBIT_HOST || '',
  PORT: process.env.RABBIT_PORT || 5672,
};

export const MONGO = {
  USER: process.env.MONGO_USER || '',
  PASSWORD: process.env.MONGO_PASSWORD || '',
  HOST: process.env.MONGO_HOST || '',
  PORT: process.env.MONGO_PORT || 27017,
  NAME: process.env.MONGO_NAME || '',
  AUTH_SOURCE: process.env.MONGO_AUTH_SOURCE || '',
  URL() {
    return `mongodb://${this?.USER}:${this.PASSWORD}@${this.HOST}:${this.PORT}`;
  },
};

export const APM = {
  ENABLED: stringToBoolean(process.env.APM_ENABLED) || false,
  SECRET_TOKEN: process.env.APM_SECRET_TOKEN || '',
  SERVER_URL: process.env.APM_SERVER_URL || '',
  ENVIRONMENT: process.env.APM_ENVIRONMENT || '',
};

export const ELASTICSEARCH = {
  ENABLED: stringToBoolean(process.env.ELASTICSEARCH_ENABLED) || false,
  USERNAME: process.env.ELASTICSEARCH_USERNAME || '',
  PASSWORD: process.env.ELASTICSEARCH_PASSWORD || '',
  SERVER_URL: process.env.ELASTICSEARCH_SERVER_URL || '',
};

export const REPROCESSING = {
  ENABLED: stringToBoolean(process.env.REPROCESSING_ENABLED) || false,
  MAX_TRIES: Number(process.env.REPROCESSING_MAX_TRIES) || 1,
  DELAYS: process.env.REPROCESSING_DELAYS?.split(',').map(Number) || [],
};
