# Mensageria

O template usa RabbitMQ para consumers e publicacao.

## Conexao

Configure:

- `RABBIT_ENABLED`
- `RABBIT_USER`
- `RABBIT_PASSWORD`
- `RABBIT_HOST`
- `RABBIT_PORT`
- `RABBIT_VIRTUAL_HOST`
- `RABBIT_DEFAULT_PREFETCH`

## Consumers

Consumers ficam em `src/main/consumers`. O bootstrap carrega os arquivos quando `CONSUMER_ENABLED=true`.

Exemplo:

```ts
export default (server: RabbitMqServer) => {
  server.makeConsumer('queue-name', makeJob());
};
```

## Publicacao

Use usecases em `src/data/usecases/mq` e factories em `src/main/factories/usecases`. O template oferece protocolos para publicar em queue e exchange.

## Reprocessing

O modulo de reprocessing permite salvar payloads com erro e republicar posteriormente. Configure tentativas e delays com `REPROCESSING_*`.

## Selecao De Consumers

`CONSUMER_LIST` permite carregar apenas parte dos consumers:

- `*`: permite todos;
- `!*`: bloqueia todos;
- `name`: permite um consumer especifico;
- `!name`: bloqueia um consumer especifico.
