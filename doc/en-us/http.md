# HTTP

The HTTP server uses Fastify and is encapsulated by `WebServer`. The application registers routes from files in `src/main/routes/public` and `src/main/routes/private`.

## Routes

Use `webServer.router({ path, baseUrl })` to create a router. The `Route` class supports:

- `get`
- `post`
- `put`
- `patch`
- `delete`
- `options`
- `use` for router-wide hooks

Example:

```ts
export default (route: Route) => {
  route.get(
    '/examples',
    requestValidationAdapter(exampleSchema),
    makeGetExampleController()
  );
};
```

## Adapters

- `flow-adapter`: runs middlewares/controllers in a chain with `state`.
- `request-validation-adapter`: validates `body`, `params`, `query`, and `headers`.
- `request-websocket-validation-adapter`: equivalent for WebSocket.
- `http-logger-adapter`: integrates HTTP logging.
- `parallelize-adapter`: runs independent callbacks in parallel.

## Request Validation

`requestValidationAdapter(schema, options)` validates with Yup.

Defaults:

- `caseMode: 'insensitive'`
- `strategy: 'merge'`

This makes fields like `clientId`, `client_id`, `CLIENT_ID`, `ClientId`, and `clientid` accepted as equivalent. To require exact case:

```ts
requestValidationAdapter(schema, {
  caseMode: 'strict'
});
```

To validate each case strategy separately without merging everything into the same object:

```ts
requestValidationAdapter(schema, {
  caseMode: 'insensitive',
  strategy: 'strict'
});
```

## Body and Parsers

The server registers parsers for:

- `application/json`
- `application/x-www-form-urlencoded`

An empty JSON body becomes `{}`.

## Responses

Controllers return `HttpResponse` with `statusCode` and `body`. The server converts response keys to snake_case by default.

Use helpers in `presentation/utils/http-response.ts` for common responses:

- `ok`
- `created`
- `noContent`
- `badRequest`
- `serverError`

## HTTP Logging

Middlewares in `src/main/middlewares` can log request/response to Mongo and attach APM transaction IDs to headers. Controlled via `.env` with `LOGGER_*` and `APM_*`.
