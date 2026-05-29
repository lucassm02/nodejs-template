# Flow Manager

`flowManager` lets you choose a factory/handler based on request data, state, or arguments.

## `when` Formats

### String

Executes when the path exists and is truthy:

```ts
flowManager({
  when: 'state.authentication',
  handler: makeAuthenticatedFlow
});
```

### Array

All paths must exist:

```ts
flowManager({
  when: ['body.id', 'state.user'],
  handler: makeFlow
});
```

### Object

Compares a path against an expected value:

```ts
flowManager({
  when: { 'body.payment_type': 'PIX' },
  handler: makePixFlow
});
```

### Function

Use when the condition requires a custom rule:

```ts
flowManager({
  when: (request) => request.body?.items?.length > 0,
  handler: makeCartFlow
});
```

## `strict`

By default, the flow manager performs simple type coercions. With `strict: true`, it compares with strict equality.

```ts
flowManager({
  when: { 'body.status': 1 },
  strict: true,
  handler: makeNumericStatusFlow
});
```

## Order

Options are evaluated in order. The first satisfied condition wins. Keep specific flows before generic ones.

## Recommended Use

Use `flowManager` when a route shares an endpoint but changes behavior based on type, status, channel, payment method, or the presence of data in state. Avoid using it for rules that belong in the usecase.
