# Observability

The template centralizes logs, APM, and ElasticSearch in `src/util/observability`.

## Logger

Winston is used as the primary logger. Configure:

- `LOGGER_ENABLED`
- `LOGGER_CONSOLE_LEVEL`
- `LOGGER_DB_ENABLED`

When `LOGGER_DB_ENABLED=true`, logs can be persisted to Mongo.

## HTTP Logs

Middlewares in `src/main/middlewares` record request/response, transaction IDs, and data useful for tracing.

## ElasticSearch

Configure:

- `ELASTICSEARCH_ENABLED`
- `ELASTICSEARCH_SERVER_URL`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`

Use the ElasticSearch protocols to create, search, and update documents.

## Elastic APM

Configure:

- `APM_ENABLED`
- `APM_SERVER_URL`
- `APM_SECRET_TOKEN`
- `APM_ENVIRONMENT`

The template includes helpers/decorators for spans, transactions, and labels. APM is initialized at bootstrap and at isolated points that may run outside the HTTP process.

## Graceful Shutdown

In `production`, the bootstrap attempts to close the HTTP server, worker, RabbitMQ, Mongo, and Memcached before exiting. In other environments, shutdown is more direct to ease development.
