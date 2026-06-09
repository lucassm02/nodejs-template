# Messaging

The template uses RabbitMQ for consumers and publishing.

## Connection

Configure:

- `RABBIT_ENABLED`
- `RABBIT_USER`
- `RABBIT_PASSWORD`
- `RABBIT_HOST`
- `RABBIT_PORT`
- `RABBIT_VIRTUAL_HOST`
- `RABBIT_DEFAULT_PREFETCH`

## Consumers

Consumers live in `src/main/consumers`. The bootstrap loads the files when `CONSUMER_ENABLED=true`.

Example:

```ts
export default (server: RabbitMqServer) => {
  server.makeConsumer('queue-name', makeJob());
};
```

## Publishing

Use usecases in `src/data/usecases/mq` and factories in `src/main/factories/usecases`. The template provides protocols for publishing to a queue and an exchange.

## Reprocessing

The reprocessing module lets you save payloads that errored and republish them later. Configure attempts and delays with `REPROCESSING_*`.

## Consumer Selection

`CONSUMER_LIST` lets you load only a subset of consumers:

- `*`: allow all;
- `!*`: block all;
- `name`: allow a specific consumer;
- `!name`: block a specific consumer.
