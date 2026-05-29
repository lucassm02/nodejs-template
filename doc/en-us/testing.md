# Testing

The template uses Jest with separate suites.

## Commands

- `yarn test`: runs the full suite.
- `yarn test:unit`: unit tests in watch mode.
- `yarn test:integration`: integration tests in watch mode.
- `yarn test:e2e`: e2e tests in watch mode.
- `yarn test:coverage`: generates coverage.
- `yarn test:ci`: command for CI.

## Structure

```text
test/
  unit/
  integration/
  e2e/
  migrations/
  seed/
  util/
```

## Unit Tests

Use for isolated rules:

- usecases;
- validators;
- utilities;
- small adapters;
- repositories with mocked dependencies.

## Integration Tests

Use to validate composition between internal layers:

- endpoint with adapters;
- flow manager;
- hooks;
- parallelize;
- repositories with a test database.

## E2E Tests

Use for external API behavior, with a real server and loaded routes.

## Utilities

`test/util` includes common mocks and stubs, such as logger, error handler, and HTTP responses.

## Migrations and Seeds

Use `test/migrations` and `test/seed` to prepare test data when there is a database dependency.

## Recommendations

- Test controller/middleware without Fastify when possible.
- Test route/adapters with integration tests.
- Avoid depending on test order.
- Prefer small, explicit fixtures.
- Run `yarn check:types` alongside the test suite.
