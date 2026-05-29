# WebSocket

O template usa Socket.IO encapsulado por `WebSocketServer`. O servidor e configurado pelo `WebServer.socket()`.

## Variaveis

- `SERVER_SOCKET_HANDSHAKE_PATH`: path do handshake.
- `SERVER_SOCKET_CORS_ORIGIN`: origem permitida.

## Registro De Eventos

`Route.ws()` expõe eventos padrao:

- `open`
- `message`
- `close`
- `error`
- `ping`
- `upgrade`
- `on(event)`

Exemplo:

```ts
export default (route: Route) => {
  route.ws().on('greeting', makeGreetingWebsocketController());
};
```

## Controller WebSocket

Controllers de socket devem receber payload/evento, executar regra de negocio e retornar a resposta esperada pelo adapter de socket. Valide payloads com `requestWebsocketValidationAdapter`.

## Quando Usar

Use WebSocket para eventos em tempo real, notificacoes e canais bidirecionais. Para comandos idempotentes ou operacoes transacionais, prefira HTTP.
