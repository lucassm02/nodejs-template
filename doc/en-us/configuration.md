# Configuration

Configuration is loaded with `dotenv` and centralized in `src/util/constants/environment.ts`. The naming convention follows the exported object: `LOGGER.DB.ENABLED` becomes `LOGGER_DB_ENABLED`.

## SERVER

- `SERVER_ENABLED`: enables the HTTP server.
- `SERVER_PORT`: HTTP port.
- `SERVER_BASE_URI`: global prefix, e.g. `/api/v1`.
- `SERVER_SOCKET_HANDSHAKE_PATH`: Socket.IO handshake path.
- `SERVER_SOCKET_CORS_ORIGIN`: allowed origin for Socket.IO.

## CONSUMER

- `CONSUMER_ENABLED`: enables RabbitMQ consumers.
- `CONSUMER_LIST`: list of allowed/blocked consumers. Accepts `*`, `!*`, specific names, and negated names with `!`.

## WORKER

- `WORKER_ENABLED`: enables Agenda workers.
- `WORKER_LIST`: list of allowed/blocked workers, same semantics as `CONSUMER_LIST`.
- `WORKER_DASHBOARD_ENABLED`: enables Agenda Dashboard.
- `WORKER_DASHBOARD_PORT`: dashboard port.
- `WORKER_DASHBOARD_BASE_URI`: dashboard base path.

## LOGGER

- `LOGGER_ENABLED`: enables logging.
- `LOGGER_CONSOLE_LEVEL`: minimum console log level.
- `LOGGER_DB_ENABLED`: enables log persistence to Mongo.
- `LOGGER_DB_BULK_SIZE`: maximum number of logs per bulk insert.
- `LOGGER_DB_FLUSH_INTERVAL_MS`: maximum interval before flushing buffered logs to Mongo.

## ENCRYPTION

- `ENCRYPTION_KEY`: key used by `SecretToken`.
- `ENCRYPTION_IV`: IV used by `SecretToken`.

## API

- `API_BASE_URL`: base URL for generic external services.

New projects can add sub-keys following the same pattern, e.g. `API_PAYMENT`, read in `environment.ts` as `API.PAYMENT`.

## DB

- `DB_ENABLED`: enables the MSSQL connection.
- `DB_TEST_CONNECTION_QUERY`: health check query.
- `DB_CONFIG`: Knex configuration name.
- `DB_DIALECT`: dialect, typically `mssql`.
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`: credentials.
- `DB_CONNECTION_TIMEOUT_MS`, `DB_MAX_POOL`, `DB_MIN_POOL`, `DB_IDLE_TIMEOUT_IN_MILLISECONDS`, `DB_REPEAT_INTERVAL_IN_MS`, `DB_CREATE_RETRY_INTERVAL_IN_MS`: pool/connection tuning.

## MONGO

- `MONGO_ENABLED`: enables Mongoose.
- `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_PORT`, `MONGO_NAME`, `MONGO_AUTH_SOURCE`: connection.
- `MONGO_CONNECTION_TIMEOUT_MS`, `MONGO_MAX_POOL_SIZE`, `MONGO_MIN_POOL_SIZE`: pool tuning.

## RABBIT

- `RABBIT_ENABLED`: enables the RabbitMQ connection.
- `RABBIT_USER`, `RABBIT_PASSWORD`, `RABBIT_HOST`, `RABBIT_PORT`: connection.
- `RABBIT_VIRTUAL_HOST`: optional virtual host.
- `RABBIT_DEFAULT_PREFETCH`: default prefetch.

## MEMCACHED

- `MEMCACHED_ENABLED`: enables Memcached.
- `MEMCACHED_HOST`, `MEMCACHED_PORT`, `MEMCACHED_USER`, `MEMCACHED_PASSWORD`: connection.
- `MEMCACHED_DEFAULT_TTL`: default TTL.

## ELASTICSEARCH

- `ELASTICSEARCH_ENABLED`: enables log/document shipping.
- `ELASTICSEARCH_SERVER_URL`: Elastic endpoint.
- `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`: credentials.

## APM

- `APM_ENABLED`: enables Elastic APM.
- `APM_SERVER_URL`: APM endpoint.
- `APM_SECRET_TOKEN`: token.
- `APM_ENVIRONMENT`: reported environment.

## REPROCESSING

- `REPROCESSING_ENABLED`: enables reprocessing.
- `REPROCESSING_MAX_TRIES`: attempt limit.
- `REPROCESSING_DELAYS`: delays in milliseconds, comma-separated.
- `REPROCESSING_MODE`: reprocessing mode.

## SONAR

- `SONAR_TOKEN`: token used by the `yarn sonar` command.

## Disabling Services Locally

For minimal local development, disable unavailable dependencies:

```env
DB_ENABLED=false
MONGO_ENABLED=false
RABBIT_ENABLED=false
MEMCACHED_ENABLED=false
ELASTICSEARCH_ENABLED=false
APM_ENABLED=false
```
