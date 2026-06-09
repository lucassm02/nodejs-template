# HTTP

O servidor HTTP usa Fastify e e encapsulado por `WebServer`. A aplicacao registra rotas a partir de arquivos em `src/main/routes/public` e `src/main/routes/private`.

## Rotas

Use `webServer.router({ path, baseUrl })` para criar um roteador. A classe `Route` suporta:

- `get`
- `post`
- `put`
- `patch`
- `delete`
- `options`
- `use` para hooks globais do roteador

Exemplo:

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

- `flow-adapter`: executa middlewares/controllers em cadeia com `state`.
- `request-validation-adapter`: valida `body`, `params`, `query` e `headers`.
- `request-websocket-validation-adapter`: equivalente para websocket.
- `http-logger-adapter`: integra logging HTTP.
- `parallelize-adapter`: executa callbacks independentes em paralelo.

## Validacao De Request

`requestValidationAdapter(schema, options)` valida com Yup.

Padrao:

- `caseMode: 'insensitive'`
- `strategy: 'merge'`

Isso faz campos como `clientId`, `client_id`, `CLIENT_ID`, `ClientId` e `clientid` serem aceitos como equivalentes. Para exigir case exato:

```ts
requestValidationAdapter(schema, {
  caseMode: 'strict'
});
```

Para validar cada estrategia de case separadamente, sem expandir tudo no mesmo objeto:

```ts
requestValidationAdapter(schema, {
  caseMode: 'insensitive',
  strategy: 'strict'
});
```

## Body E Parsers

O servidor registra parsers para:

- `application/json`
- `application/x-www-form-urlencoded`

Body vazio em JSON vira `{}`.

## Respostas

Controllers retornam `HttpResponse` com `statusCode` e `body`. O servidor converte chaves de resposta para snake_case por padrao.

Use helpers em `presentation/utils/http-response.ts` para respostas comuns:

- `ok`
- `created`
- `noContent`
- `badRequest`
- `serverError`

## Logging HTTP

Middlewares em `src/main/middlewares` podem registrar request/response em Mongo e anexar IDs de transacao APM nos headers. Controle pelo `.env` com `LOGGER_*` e `APM_*`.
