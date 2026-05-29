# Template Microservice

Base template for Node.js/TypeScript microservices with Fastify, Clean Architecture, Yup validation, MongoDB, MSSQL/Knex, RabbitMQ, Agenda workers, cache, observability, Helm, and separate test suites per layer.

The goal of this template is to deliver a ready-made structure for starting a new service while maintaining consistent patterns for routes, controllers, middlewares, usecases, infrastructure, factories, tests, and deployment.

> Documentation is available in **[English (en-us)](doc/en-us/)** and **[Português (pt-br)](doc/pt-br/)**.

## Features

- HTTP API with Fastify, directory-based routes, and configurable base URI.
- WebSocket with Socket.IO and dedicated validation.
- Flow manager for declarative flow selection.
- Request validation with Yup, case-insensitive mode by default, optional strict mode.
- MSSQL with Knex and MongoDB with Mongoose.
- RabbitMQ for consumers and publishing to queues/exchanges.
- Agenda workers with optional dashboard.
- Local cache with `node-cache` and external cache with Memcached.
- Logs with Winston, persistence to Mongo, ElasticSearch, and Elastic APM.
- Message/data reprocessing.
- Helm generator based on `.env` per environment.
- Jest with unit, integration, and e2e suites.

## Requirements

- Node.js compatible with the project.
- Yarn 1.x.
- Docker, if you use databases, RabbitMQ, Memcached, or Elastic locally.
- Access to external services configured in `.env`, when enabled.

## Quick Start

```bash
yarn install
cp .env.example .env
yarn check:types
yarn test --passWithNoTests
yarn start:dev
```

By default, set `SERVER_ENABLED=true` and `SERVER_PORT=3000`. Disable dependencies you are not using locally, such as `DB_ENABLED=false`, `MONGO_ENABLED=false`, `RABBIT_ENABLED=false`, `MEMCACHED_ENABLED=false`, `ELASTICSEARCH_ENABLED=false`, and `APM_ENABLED=false`.

## Commands

| Command | Description |
| --- | --- |
| `yarn start:dev` | Starts the service with `tsx --watch`. |
| `yarn start:debug` | Starts with inspector on port 9229. |
| `yarn start:debug:brk` | Starts with break at bootstrap. |
| `yarn build` | Generates `dist/` with Babel. |
| `yarn start:prod` | Runs `dist/main`. |
| `yarn check:types` | Runs TypeScript without emitting files. |
| `yarn lint` | Runs ESLint with fix on `src/**`. |
| `yarn test` | Runs the full Jest suite. |
| `yarn test:unit` | Runs unit tests in watch mode. |
| `yarn test:integration` | Runs integration tests in watch mode. |
| `yarn test:e2e` | Runs e2e tests in watch mode. |
| `yarn test:coverage` | Generates coverage. |
| `yarn helm:gen:*` | Generates Helm values/configs per environment. |
| `yarn sonar` | Runs sonar-scanner via Docker. |
| `yarn gen` | Runs configured codegen. |
| `yarn s-code` | Exports/imports file sets in s-code format. |

## Structure

```text
src/
  domain/        business contracts and models
  data/          concrete usecases and infrastructure protocols
  infra/         databases, HTTP clients, MQ, cache, worker, and servers
  presentation/  controllers, middlewares, and HTTP contracts
  main/          composition root, routes, factories, adapters, and bootstrap
  job/           worker/consumer job contracts and implementations
  validation/    Yup schemas and validators
  util/          constants, formatters, observability, and helpers
test/
  unit/
  integration/
  e2e/
script/
  helm/
  s-code/
```

## Documentation

- [Architecture](doc/en-us/architecture.md)
- [Configuration and environment variables](doc/en-us/configuration.md)
- [HTTP, routes, and validation](doc/en-us/http.md)
- [WebSocket](doc/en-us/websocket.md)
- [Flow manager](doc/en-us/flow-manager.md)
- [Database](doc/en-us/database.md)
- [Cache](doc/en-us/cache.md)
- [Messaging](doc/en-us/messaging.md)
- [Workers](doc/en-us/workers.md)
- [Observability](doc/en-us/observability.md)
- [Testing](doc/en-us/testing.md)
- [Deployment and Helm](doc/en-us/deployment.md)
- [Utilities](doc/en-us/utilities.md)
- [How to add a feature](doc/en-us/adding-a-feature.md)

## Key Patterns

- Prefer imports via the `@/` alias.
- Register dependencies in factories, not directly in routes.
- Controllers and middlewares should receive dependencies via constructor.
- Use `requestValidationAdapter` to validate input with Yup.
- Use `flowManager` when a route can choose between alternative flows.
- Use environment variables in the nested pattern: `LOGGER.DB.ENABLED` becomes `LOGGER_DB_ENABLED`.
- Keep tests at the right level: unit for isolated rules, integration for HTTP/adapter flows, and e2e for external behavior.

## Versioning

This template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
