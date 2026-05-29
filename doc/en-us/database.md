# Database

The template supports MSSQL via Knex and MongoDB via Mongoose.

## MSSQL/Knex

Set `DB_ENABLED=true` to validate the connection on bootstrap. MSSQL repositories live in `src/infra/db/mssql`.

Standard layout:

- contracts in `src/data/protocols/db`;
- implementations in `src/infra/db/mssql`;
- usecases in `src/data/usecases/db`;
- factories in `src/main/factories/usecases`.

## Mongo/Mongoose

Set `MONGO_ENABLED=true` to open the connection on bootstrap. Mongo models and repositories live in `src/infra/db/mongodb`.

The template ships with models for:

- logs;
- input/output logs;
- reprocessing.

## Transactions

Transaction utilities live in `src/util/db` and protocols in `src/data/protocols/util/transaction`. Use transactions when an operation needs to coordinate multiple writes.

## Test Migrations and Seeds

Files in `test/migrations` and `test/seed` exist to prepare the database for integration/e2e tests when needed.

## Best Practices

- Do not access the database directly in a controller.
- Use repositories for isolation.
- Keep SQL/Knex in `infra`.
- Return domain models or DTOs defined in the contract.
- Disable `DB_ENABLED` and `MONGO_ENABLED` in local environments without those dependencies.
