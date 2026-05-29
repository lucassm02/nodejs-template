# Como Adicionar Uma Funcionalidade

Este fluxo serve para endpoints HTTP comuns.

## 1. Defina O Contrato

Crie ou atualize tipos em `domain`:

- modelo de entrada;
- modelo de saida;
- interface do usecase.

## 2. Crie A Validacao

Adicione schema Yup em `validation/usecases`.

Use nomes em snake_case quando a API publica trabalhar com snake_case. O adapter pode aceitar variacoes de case quando configurado no modo padrao.

## 3. Implemente O Usecase

Em `data/usecases`, implemente a regra orquestrando protocolos.

Nao importe infra diretamente se houver contrato em `data/protocols`.

## 4. Implemente Infra

Se precisar de banco, HTTP externo, cache ou MQ:

- crie protocolo em `data/protocols`;
- implemente em `infra`;
- injete pela factory.

## 5. Crie Controller Ou Middleware

Use controller quando a etapa responde ao cliente. Use middleware quando a etapa prepara `state` para etapas seguintes.

Retorne helpers de `presentation/utils/http-response.ts`.

## 6. Monte A Factory

Crie uma factory em `main/factories` que instancia dependencias concretas.

## 7. Registre A Rota

Em `main/routes/public` ou `main/routes/private`:

```ts
route.post(
  '/resource',
  requestValidationAdapter(schema),
  makeMiddleware(),
  makeController()
);
```

Use `flowManager` quando o endpoint precisa escolher entre fluxos alternativos.

## 8. Teste

Crie testes no nivel correto:

- unitario para usecase/controller/middleware;
- integracao para rota/adapters;
- e2e para comportamento externo.

## Checklist

- Tipos do contrato criados.
- Schema validando entrada publica.
- Factory sem dependencia faltante.
- Rota registrada no arquivo correto.
- `state` documentado quando usado.
- Testes cobrindo sucesso e erro.
- `yarn check:types` passando.
