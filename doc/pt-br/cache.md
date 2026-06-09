# Cache

O template tem duas abordagens de cache:

- cache local em memoria com `node-cache`;
- cache externo com Memcached.

## Cache Local

Use para valores baratos, locais ao processo e que podem ser perdidos em restart. A implementacao fica em `src/infra/cache/node-cache.ts`.

## Memcached

Use `MEMCACHED_ENABLED=true` para conectar no bootstrap. Configure:

- `MEMCACHED_HOST`
- `MEMCACHED_PORT`
- `MEMCACHED_USER`
- `MEMCACHED_PASSWORD`
- `MEMCACHED_DEFAULT_TTL`

## Middlewares

O template inclui middlewares para:

- buscar valor em cache;
- salvar valor em cache.

Eles podem ser compostos antes/depois de controllers em uma rota.

## Quando Usar

- Use cache para dados externos caros, metadados e respostas estaveis.
- Nao use cache para dados transacionais sem estrategia clara de invalidacao.
- Defina TTL explicito sempre que possivel.
