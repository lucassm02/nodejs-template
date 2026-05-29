# Architecture

The template follows a pragmatic variation of Clean Architecture. The core rule is to keep business code independent of framework, database, messaging, and transport details.

## Layers

- `domain`: models and usecase contracts. Must not import `infra`, `main`, or an HTTP framework.
- `data`: usecase implementations and protocols for external dependencies.
- `infra`: concrete implementations of database, HTTP client, cache, MQ, worker, and servers.
- `presentation`: controllers, middlewares, HTTP contracts, and response helpers.
- `main`: composition root. Contains adapters, factories, routes, bootstrap, and dependency wiring.
- `validation`: Yup schemas and reusable validators.
- `util`: cross-cutting functions, constants, formatters, and observability.

## Standard HTTP Flow

```text
Route -> adapters -> middleware/controller -> usecase -> repository/service -> infra
```

Routes in `src/main/routes` must not build rules manually. They should compose adapters and factories:

- `requestValidationAdapter(schema)` validates input.
- Factories in `src/main/factories` assemble controllers, middlewares, and usecases.
- Middlewares enrich `state` or interrupt the flow.
- Controllers return `HttpResponse`.

## Factories

Factories are the standard point for instantiating dependencies. Use them to:

- connect usecases to repositories/services;
- avoid scattered `new` calls in routes;
- isolate infra details;
- ease unit testing of real classes.

## Shared State

Middlewares can write information to `state`, typed by `SharedState`. Subsequent controllers and middlewares can read this state. Use clear, stable names for state keys.

## Imports

Use the `@/` alias for internal imports. Avoid long relative paths between layers.

## Dependency Boundaries

- `domain` has no framework knowledge.
- `data` knows contracts, not concrete implementations.
- `infra` implements contracts.
- `presentation` knows the template's HTTP contracts.
- `main` can import everything to compose the application.
