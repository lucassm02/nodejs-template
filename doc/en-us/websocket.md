# WebSocket

The template uses Socket.IO encapsulated by `WebSocketServer`. The server is configured via `WebServer.socket()`.

## Variables

- `SERVER_SOCKET_HANDSHAKE_PATH`: handshake path.
- `SERVER_SOCKET_CORS_ORIGIN`: allowed origin.

## Event Registration

`Route.ws()` exposes standard events:

- `open`
- `message`
- `close`
- `error`
- `ping`
- `upgrade`
- `on(event)`

Example:

```ts
export default (route: Route) => {
  route.ws().on('greeting', makeGreetingWebsocketController());
};
```

## WebSocket Controller

Socket controllers should receive the payload/event, execute business logic, and return the response expected by the socket adapter. Validate payloads with `requestWebsocketValidationAdapter`.

## When to Use

Use WebSocket for real-time events, notifications, and bidirectional channels. For idempotent commands or transactional operations, prefer HTTP.
