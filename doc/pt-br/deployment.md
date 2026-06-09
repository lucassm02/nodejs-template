# Deploy

## Build

```bash
yarn build
yarn start:prod
```

O build gera `dist/` usando Babel com suporte a TypeScript.

## Helm

O gerador fica em `script/helm`.

Comandos:

```bash
yarn helm:gen:production
yarn helm:gen:homologation
yarn helm:gen:development
```

Tambem e possivel chamar diretamente:

```bash
yarn helm:gen -e production --scan-routes
```

## Environments Suportados

O gerador conhece:

- `production`
- `homologation`
- `staging`
- `development`

Cada ambiente espera um arquivo `.env.<environment>`.

## ConfigMap E Secret

O gerador separa variaveis sensiveis em Secret. Por padrao sao secretas:

- `ENCRYPTION_KEY`
- `ENCRYPTION_IV`
- `DB_USERNAME`
- `DB_PASSWORD`
- `RABBIT_USER`
- `RABBIT_PASSWORD`
- `MONGO_USER`
- `MONGO_PASSWORD`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`
- `APM_SECRET_TOKEN`

Use `--secrets` para adicionar outras variaveis.

## Scan De Rotas

`--scan-routes` inspeciona rotas do projeto e inclui paths no values Helm. Rotas como `/health` e `/examples` sao ignoradas pelo gerador.

## Sonar

```bash
yarn sonar
```

O comando executa `sonar-scanner-cli` via Docker usando `.env`.

## CI

Pipeline recomendado:

```bash
yarn install --frozen-lockfile
yarn check:types
yarn test:ci
yarn build
```
