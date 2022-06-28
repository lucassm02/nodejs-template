import 'dotenv/config';
import { stringToBoolean } from '../text';

export const SERVER = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URI: process.env.BASE_URI || '',
};

export const LOGGER = {
  DATABASE: {
    ENABLED: stringToBoolean(process.env.ENABLE_DATABASE_LOGS) || false,
  },
  CONSOLE: { LEVEL: process.env.LOGGER_CONSOLE_LEVEL || 'info' },
};

export const ENCRYPTION = {
  KEY: process.env.ENCRYPTION_KEY || '',
  IV: process.env.ENCRYPTION_IV || '',
  PAYLOAD_KEY: process.env.PAYLOAD_ENCRYPTION_KEY || '',
  PAYLOAD_IV: process.env.PAYLOAD_ENCRYPTION_IV || '',
};

export const APIS = {
  AUTHENTICATOR: process.env.API_AUTHENTICATOR || '',
  CARD_MANAGEMENT: process.env.API_CARD_MANAGEMENT || '',
  TRANSACTION_MANAGEMENT: process.env.API_TRANSACTION_MANAGEMENT || '',
  TELECALL_TOKEN_MANAGEMENT: process.env.API_TELECALL_TOKEN_MANAGEMENT || '',
  TELECALL: process.env.API_TELECALL || '',
};

export const DATABASE = {
  DB_DIALECT: process.env.DB_DIALECT || 'mssql',
  DB_HOST: process.env.DB_HOST || '',
  DB_USERNAME: process.env.DB_USERNAME || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_PORT: process.env.DB_PORT || '',
};

export const RABBIT = {
  USER: process.env.RABBIT_USER || '',
  PASSWORD: process.env.RABBIT_PASSWORD || '',
  HOST: process.env.RABBIT_HOST || '',
  PORT: process.env.RABBIT_PORT || '',
};

export const MONGO = {
  USER: process.env.MONGO_DB_USER || '',
  PASSWORD: process.env.MONGO_DB_PASSWORD || '',
  HOST: process.env.MONGO_DB_HOST || '',
  PORT: process.env.MONGO_DB_PORT || '',
  NAME: process.env.MONGO_DB_NAME || '',
  AUTH_SOURCE: process.env.MONGO_DB_AUTH_SOURCE || '',
  URL() {
    return `mongodb://${this?.USER}:${this.PASSWORD}@${this.HOST}:${this.PORT}`;
  },
};

export const APM = {
  ENABLED: stringToBoolean(process.env.ENABLE_APM) || false,
  SECRET_TOKEN: process.env.APM_SECRET_TOKEN || '',
  SERVER_URL: process.env.APM_SERVER_URL || '',
  ENVIRONMENT: process.env.APM_ENVIRONMENT || '',
};

export const ELASTICSEARCH = {
  ENABLED: stringToBoolean(process.env.ENABLE_ELASTICSEARCH) || false,
  USERNAME: process.env.ELASTICSEARCH_USERNAME || '',
  PASSWORD: process.env.ELASTICSEARCH_PASSWORD || '',
  SERVER_URL: process.env.ELASTICSEARCH_SERVER_URL || '',
};
