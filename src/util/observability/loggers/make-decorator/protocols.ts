interface TraceObject {
  [label: string]: string | number;
}

export type traceLabels = number[] | string[] | TraceObject;

type appSubtype =
  | 'inferred'
  | 'controller'
  | 'graphql'
  | 'mailer'
  | 'resource'
  | 'handler'
  | 'worker';
type dbSubtype =
  | 'cassandra'
  | 'cosmos-bd'
  | 'db2'
  | 'derby'
  | 'dynamodb'
  | 'elasticsearch'
  | 'graphql'
  | 'h2'
  | 'hsqldb'
  | 'ingres'
  | 'mariadb'
  | 'memcached'
  | 'mongodb'
  | 'mssql'
  | 'mysql'
  | 'oracle'
  | 'postgresql'
  | 'redis'
  | 'sqlite'
  | 'sqlite3'
  | 'sql-server'
  | 'unknown';
type externalSubtype = 'dubbo' | 'grpc' | 'http';
type jsonSubtype = 'parse' | 'generate';
type messagingSubtype =
  | 'azure-queue'
  | 'azure-service-bus'
  | 'jms'
  | 'kafka'
  | 'rabbitmq'
  | 'sns'
  | 'sqs';
type storageSubtype = 'azure-blob' | 'azure-file' | 'azure-table' | 's3';
type websocketSubtype = 'send';

type LiteralUnion<T extends U, U = string> = T | (U & Object);

export interface SpanOptions {
  name?: string;
  nameByParameter?: string | number;
  subType?: LiteralUnion<
    | appSubtype
    | dbSubtype
    | externalSubtype
    | jsonSubtype
    | messagingSubtype
    | storageSubtype
    | websocketSubtype
  >;
}

export interface TransactionOptions {
  name?: string;
  nameByParameter?: string | number;
  type?: LiteralUnion<
    | appSubtype
    | dbSubtype
    | externalSubtype
    | jsonSubtype
    | messagingSubtype
    | storageSubtype
    | websocketSubtype
  >;
}
