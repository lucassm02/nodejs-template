# How to Add a Feature

This flow applies to common HTTP endpoints.

## 1. Define the Contract

Create or update types in `domain`:

- input model;
- output model;
- usecase interface.

## 2. Create the Validation

Add a Yup schema in `validation/usecases`.

Use snake_case names when the public API works with snake_case. The adapter can accept case variations when configured in default mode.

## 3. Implement the Usecase

In `data/usecases`, implement the rule orchestrating protocols.

Do not import infra directly if a contract exists in `data/protocols`.

## 4. Implement Infrastructure

If you need a database, external HTTP, cache, or MQ:

- create a protocol in `data/protocols`;
- implement in `infra`;
- inject via the factory.

## 5. Create a Controller or Middleware

Use a controller when the step responds to the client. Use a middleware when the step prepares `state` for subsequent steps.

Return helpers from `presentation/utils/http-response.ts`.

## 6. Set Up the Factory

Create a factory in `main/factories` that instantiates concrete dependencies.

## 7. Register the Route

In `main/routes/public` or `main/routes/private`:

```ts
route.post(
  '/resource',
  requestValidationAdapter(schema),
  makeMiddleware(),
  makeController()
);
```

Use `flowManager` when the endpoint needs to choose between alternative flows.

## 8. Test

Create tests at the right level:

- unit for usecase/controller/middleware;
- integration for route/adapters;
- e2e for external behavior.

## Checklist

- Contract types created.
- Schema validating public input.
- Factory with no missing dependency.
- Route registered in the correct file.
- `state` documented when used.
- Tests covering success and error cases.
- `yarn check:types` passing.
