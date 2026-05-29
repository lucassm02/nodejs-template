# Flow Manager

`flowManager` permite escolher uma factory/handler com base em dados da request, state ou argumentos.

## Formatos De `when`

### String

Executa quando o caminho existe e e truthy:

```ts
flowManager({
  when: 'state.authentication',
  handler: makeAuthenticatedFlow
});
```

### Array

Todos os caminhos precisam existir:

```ts
flowManager({
  when: ['body.id', 'state.user'],
  handler: makeFlow
});
```

### Objeto

Compara caminho e valor esperado:

```ts
flowManager({
  when: { 'body.payment_type': 'PIX' },
  handler: makePixFlow
});
```

### Funcao

Use quando a condicao precisar de regra customizada:

```ts
flowManager({
  when: (request) => request.body?.items?.length > 0,
  handler: makeCartFlow
});
```

## `strict`

Por padrao, o flow manager faz coercoes simples de tipo. Com `strict: true`, compara com igualdade estrita.

```ts
flowManager({
  when: { 'body.status': 1 },
  strict: true,
  handler: makeNumericStatusFlow
});
```

## Ordem

As opcoes sao avaliadas em ordem. A primeira condicao satisfeita vence. Mantenha fluxos especificos antes de fluxos genericos.

## Uso Recomendado

Use `flowManager` quando uma rota compartilha endpoint mas muda comportamento por tipo, status, canal, forma de pagamento ou existencia de dados no state. Evite usar para regras que pertencem ao usecase.
