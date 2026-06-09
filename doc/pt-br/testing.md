# Testes

O template usa Jest com suites separadas.

## Comandos

- `yarn test`: roda a suite geral.
- `yarn test:unit`: unitarios em watch.
- `yarn test:integration`: integracao em watch.
- `yarn test:e2e`: e2e em watch.
- `yarn test:coverage`: cobertura.
- `yarn test:ci`: comando para CI.

## Estrutura

```text
test/
  unit/
  integration/
  e2e/
  migrations/
  seed/
  util/
```

## Unitarios

Use para regra isolada:

- usecases;
- validators;
- utilitarios;
- adapters pequenos;
- repositories com dependencias mockadas.

## Integracao

Use para validar composicao entre camadas internas:

- endpoint com adapters;
- flow manager;
- hooks;
- parallelize;
- repositories com banco de teste.

## E2E

Use para comportamento externo da API, com servidor real e rotas carregadas.

## Utilitarios

`test/util` inclui mocks e stubs comuns, como logger, error handler e respostas HTTP.

## Migrations E Seeds

Use `test/migrations` e `test/seed` para preparar dados de testes quando houver dependencia de banco.

## Recomendacoes

- Teste controller/middleware sem Fastify quando possivel.
- Teste rota/adapters com integracao.
- Evite depender de ordem entre testes.
- Prefira fixtures pequenas e explicitas.
- Rode `yarn check:types` junto com a suite.
