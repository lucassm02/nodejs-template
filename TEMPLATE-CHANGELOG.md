# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2025-12-03

### Added

- Add timeouts and pool settings to the Mongoose connection.

## [2.4.0] - 2025-05-08

### Added

- Add the `CacheRequestAdapter` wrapper of cache functionalities inside request adapter structure and interfaces.

### Changed

- Update dependencies.
- Update Node.js version in Dockerfile.
- Add type corrections to the RabbitMQ server.

### Fixed

- Correct logic to enable offline logger.

## [2.3.0] - 2025-05-06

### Added

- New `normalize` and `normalizeOptions` utilities for payload normalization in the reprocessing module.  
- APM decorators for handlers, enabling instrumentation.  
- Functionality to extract RabbitMQ options from the `RABBIT_OPTIONS` environment variable.  

### Changed

- Renamed non-standard folder from `utils` to `util`.  
- Improved application startup and shutdown process.  
- Enhanced MemCached connection process and added connection timeout.  
- Updated the `.env.example` file.  
- Adjusted when Elastic is started.  
- Added protocol adaptation for new RabbitMQ implementations.  
- Improved handler processing logic to prevent subsequent handlers from executing prematurely.  
- Optimized APM decorators.  

### Fixed

- Added normalization before message validation in the reprocessing module.  
- Optimized `searchLabels` to prevent maximum call stack overflow.  

### Deprecated

- _No deprecations._  

### Removed

- _No removals._  

### Security

- _No security fixes.

## [2.2.0] - 2025-03-19

### Added

- Adds the `apm-transaction-id` header to the response when APM is active.
- Adds the `CONSUMER_LIST` and `WORKER_LIST` environment variables to override the hard coded worker and consumer settings.
- Introduces the `AtLeastOne` global type to enhance type utility.

### Fixed

- Prevents the context from being concatenated as undefined.
- Returns an empty array if no callbacks are provided in promises.
- Establishes a connection to memcached.

### Changed

- Improves the build process by simplifying the Dockerfile.

## [2.1.4] - 2024-12-10

## Added

- Add AtLeastOne global type.

## [2.1.3] - 2024-12-06

### Fixed

- Add connection to memcached.

## [2.1.2] - 2024-11-26

### Fixed

- Fixing the route loading management, add a mechanism to track loading state of WebServer class.

## [2.1.1] - 2024-11-19

### Fixed

- The display URL of Agendash was being shown incorrectly in the terminal, and this version fixes that URL.

## [2.1.0] - 2024-11-05

### Added

- Add CLI support.
- Add graceful shutdown for workers.

## [2.0.0] - 2024-11-04

### Added

- Add websocket support.
- Add graceful shutdown as default.
- Change internal http/https engine.

## Changed

- Remove support for server, worker and consumer commands and their derivatives.
- Remove the application file in /src/main, now import the server from web-server.ts.

## [1.1.0] - 2024-06-03

### Added

- Add virtual host connection on RabbitMq.
- Add reject message on RabbitMq server.

## [1.0.0] - 2024-04-17

### Added

- Directory structure matching Clean Architecture layers.
- Example snippets based on SOLID principles and project patterns, as Factory and Adapter.
- HTTP Server adapter equipped with uncoupling; input and output standardization; state sharing and utils resources.
- RabbitMq Server adapter equipped with uncoupling; input and output standardization; state sharing and utils resources.
- Scheduled tasks adapter equipped with uncoupling; management through database; input and output standardization; state    sharing and utils resources.
- HTTP Requests calls adapter.
- Cryptography adapter.
- Cache server integration adapter.
- Input validator adapter (available to endpoints, queues and scheduled tasks)
- Extension of Knex functionalities: noLock hint, adjustment to time zone conversions and custom select.
- Support for unit and integration tests.
- Support for running HTTP Server, message broker and scheduled tasks simultaneously.
- Native integration with APM and ElasticSearch database.
- Utils for database mapping with Knex schemas.
- Utils for ElasticSearch integration.
- Utils for date handling.
- Utils for object handling (conversion to snake_case, camelCase...).
- Utils for promise handling.
- Utils for numbers and strings handling and formatting.
- Utils for text standardization (applicable to Http responses messages, for example).
- Utils for aggregate and organize consts.
- Utils for responses standardization.
- Utils for queued messages reprocessing.
- Utils for managing shared state dependencies.
- Utils for logging (file, MongoDb and Elastic).
- Utils for dynamic injection of data on Middlewares (ExtractValues).
- Utils for dynamic management of application flow (FlowManager).
- Utils for coordinating middlewares flow, with middleware chain pattern (Flow).
- Utils for run N middlewares in concurrency (parallelizer).
