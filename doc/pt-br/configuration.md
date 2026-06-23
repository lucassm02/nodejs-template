# Configuracao

A configuracao e carregada com `dotenv` e centralizada em `src/util/constants/environment.ts`. O padrao de nomes segue o objeto exportado: `LOGGER.DB.ENABLED` vira `LOGGER_DB_ENABLED`.

## SERVER

- `SERVER_ENABLED`: habilita o servidor HTTP.
- `SERVER_PORT`: porta HTTP.
- `SERVER_BASE_URI`: prefixo global, por exemplo `/api/v1`.
- `SERVER_SOCKET_HANDSHAKE_PATH`: path do handshake Socket.IO.
- `SERVER_SOCKET_CORS_ORIGIN`: origem permitida para Socket.IO.

## CONSUMER

- `CONSUMER_ENABLED`: habilita consumers RabbitMQ.
- `CONSUMER_LIST`: lista de consumers permitidos/bloqueados. Aceita `*`, `!*`, nomes especificos e nomes negados com `!`.

## WORKER

- `WORKER_ENABLED`: habilita workers Agenda.
- `WORKER_LIST`: lista de workers permitidos/bloqueados com a mesma semantica de `CONSUMER_LIST`.
- `WORKER_DASHBOARD_ENABLED`: habilita Agenda Dashboard.
- `WORKER_DASHBOARD_PORT`: porta do dashboard.
- `WORKER_DASHBOARD_BASE_URI`: base path do dashboard.

## LOGGER

- `LOGGER_ENABLED`: habilita logging.
- `LOGGER_CONSOLE_LEVEL`: nivel minimo no console.
- `LOGGER_DB_ENABLED`: habilita persistencia de logs no Mongo.
- `LOGGER_DB_BULK_SIZE`: quantidade maxima de logs por insert em lote.
- `LOGGER_DB_FLUSH_INTERVAL_MS`: intervalo maximo para descarregar o buffer de logs no Mongo.

## ENCRYPTION

- `ENCRYPTION_KEY`: chave usada pelo `SecretToken`.
- `ENCRYPTION_IV`: IV usado pelo `SecretToken`.

## API

- `API_BASE_URL`: base URL de servicos externos genericos.

Novos projetos podem adicionar subchaves seguindo o mesmo padrao, por exemplo `API_PAYMENT`, lidas em `environment.ts` como `API.PAYMENT`.

## DB

- `DB_ENABLED`: habilita conexao MSSQL.
- `DB_TEST_CONNECTION_QUERY`: query de health check.
- `DB_CONFIG`: nome da configuracao Knex.
- `DB_DIALECT`: dialect, normalmente `mssql`.
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`: credenciais.
- `DB_CONNECTION_TIMEOUT_MS`, `DB_MAX_POOL`, `DB_MIN_POOL`, `DB_IDLE_TIMEOUT_IN_MILLISECONDS`, `DB_REPEAT_INTERVAL_IN_MS`, `DB_CREATE_RETRY_INTERVAL_IN_MS`: ajustes de pool/conexao.

## MONGO

- `MONGO_ENABLED`: habilita Mongoose.
- `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_PORT`, `MONGO_NAME`, `MONGO_AUTH_SOURCE`: conexao.
- `MONGO_CONNECTION_TIMEOUT_MS`, `MONGO_MAX_POOL_SIZE`, `MONGO_MIN_POOL_SIZE`: ajustes de pool.

## RABBIT

- `RABBIT_ENABLED`: habilita conexao RabbitMQ.
- `RABBIT_USER`, `RABBIT_PASSWORD`, `RABBIT_HOST`, `RABBIT_PORT`: conexao.
- `RABBIT_VIRTUAL_HOST`: virtual host opcional.
- `RABBIT_DEFAULT_PREFETCH`: prefetch padrao.

## MEMCACHED

- `MEMCACHED_ENABLED`: habilita Memcached.
- `MEMCACHED_HOST`, `MEMCACHED_PORT`, `MEMCACHED_USER`, `MEMCACHED_PASSWORD`: conexao.
- `MEMCACHED_DEFAULT_TTL`: TTL padrao.

## ELASTICSEARCH

- `ELASTICSEARCH_ENABLED`: habilita envio de logs/documentos.
- `ELASTICSEARCH_SERVER_URL`: endpoint Elastic.
- `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`: credenciais.

## APM

- `APM_ENABLED`: habilita Elastic APM.
- `APM_SERVER_URL`: endpoint APM.
- `APM_SECRET_TOKEN`: token.
- `APM_ENVIRONMENT`: ambiente reportado.

## REPROCESSING

- `REPROCESSING_ENABLED`: habilita reprocessamento.
- `REPROCESSING_MAX_TRIES`: limite de tentativas.
- `REPROCESSING_DELAYS`: atrasos em milissegundos separados por virgula.
- `REPROCESSING_MODE`: modo de reprocessamento.

## SONAR

- `SONAR_TOKEN`: token usado pelo comando `yarn sonar`.

## Servicos Desabilitados Localmente

Para desenvolvimento local minimo, desabilite dependencias nao disponiveis:

```env
DB_ENABLED=false
MONGO_ENABLED=false
RABBIT_ENABLED=false
MEMCACHED_ENABLED=false
ELASTICSEARCH_ENABLED=false
APM_ENABLED=false
```
