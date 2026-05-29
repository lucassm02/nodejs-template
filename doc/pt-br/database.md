# Banco De Dados

O template suporta MSSQL via Knex e MongoDB via Mongoose.

## MSSQL/Knex

Use `DB_ENABLED=true` para validar conexao no bootstrap. Repositories MSSQL ficam em `src/infra/db/mssql`.

Padrao:

- contratos em `src/data/protocols/db`;
- implementacoes em `src/infra/db/mssql`;
- usecases em `src/data/usecases/db`;
- factories em `src/main/factories/usecases`.

## Mongo/Mongoose

Use `MONGO_ENABLED=true` para abrir conexao no bootstrap. Models e repositories Mongo ficam em `src/infra/db/mongodb`.

O template ja inclui models para:

- logs;
- input/output logs;
- reprocessing.

## Transacoes

Utilitarios de transacao ficam em `src/util/db` e protocolos em `src/data/protocols/util/transaction`. Use transacoes quando uma operacao precisar coordenar multiplos writes.

## Migrations E Seeds De Teste

Arquivos em `test/migrations` e `test/seed` existem para preparar banco em testes de integracao/e2e quando necessario.

## Boas Praticas

- Nao acesse banco diretamente no controller.
- Use repositories para isolamento.
- Deixe SQL/Knex em `infra`.
- Retorne modelos de dominio ou DTOs definidos no contrato.
- Desabilite `DB_ENABLED` e `MONGO_ENABLED` em ambientes locais sem dependencias.
