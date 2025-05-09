interface TraceObject {
  [label: string]: string | number;
}

export type TraceLabels = number[] | string[] | TraceObject;

type AppSubtype =
  | 'inferred'
  | 'controller'
  | 'graphql'
  | 'mailer'
  | 'resource'
  | 'handler'
  | 'worker'
  | 'task'
  | 'function';
type DbSubtype =
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
type ExternalSubtype = 'dubbo' | 'grpc' | 'http';
type JsonSubtype = 'parse' | 'generate';
type MessagingSubtype =
  | 'azure-queue'
  | 'azure-service-bus'
  | 'jms'
  | 'kafka'
  | 'rabbitmq'
  | 'sns'
  | 'sqs';
type StorageSubtype = 'azure-blob' | 'azure-file' | 'azure-table' | 's3';
type WebsocketSubtype = 'send';

type LiteralUnion<T extends U, U = string> = T | (U & object);

export interface SpanOptions {
  name?: string;
  nameByParameter?: string | number;
  subType?: LiteralUnion<
    | AppSubtype
    | DbSubtype
    | ExternalSubtype
    | JsonSubtype
    | MessagingSubtype
    | StorageSubtype
    | WebsocketSubtype
  >;
}

export interface TransactionOptions {
  name?: string;
  nameByParameter?: string | number;
  type?: LiteralUnion<
    | AppSubtype
    | DbSubtype
    | ExternalSubtype
    | JsonSubtype
    | MessagingSubtype
    | StorageSubtype
    | WebsocketSubtype
  >;
}
