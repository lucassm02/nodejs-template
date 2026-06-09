# Observabilidade

O template centraliza logs, APM e ElasticSearch em `src/util/observability`.

## Logger

Winston e usado como logger principal. Configure:

- `LOGGER_ENABLED`
- `LOGGER_CONSOLE_LEVEL`
- `LOGGER_DB_ENABLED`

Quando `LOGGER_DB_ENABLED=true`, logs podem ser persistidos em Mongo.

## Logs HTTP

Middlewares em `src/main/middlewares` registram request/response, IDs de transacao e dados uteis para rastreio.

## ElasticSearch

Configure:

- `ELASTICSEARCH_ENABLED`
- `ELASTICSEARCH_SERVER_URL`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`

Use os protocolos de ElasticSearch para criar, buscar e atualizar documentos.

## Elastic APM

Configure:

- `APM_ENABLED`
- `APM_SERVER_URL`
- `APM_SECRET_TOKEN`
- `APM_ENVIRONMENT`

O template inclui helpers/decorators para spans, transacoes e labels. APM e inicializado no bootstrap e em pontos isolados que podem executar fora do processo HTTP.

## Graceful Shutdown

Em `production`, o bootstrap tenta fechar servidor HTTP, worker, RabbitMQ, Mongo e Memcached antes de encerrar. Em outros ambientes, o encerramento e mais direto para facilitar desenvolvimento.
