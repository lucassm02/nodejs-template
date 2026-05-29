# Deployment

## Build

```bash
yarn build
yarn start:prod
```

The build outputs `dist/` using Babel with TypeScript support.

## Helm

The generator lives in `script/helm`.

Commands:

```bash
yarn helm:gen:production
yarn helm:gen:homologation
yarn helm:gen:development
```

You can also call it directly:

```bash
yarn helm:gen -e production --scan-routes
```

## Supported Environments

The generator knows:

- `production`
- `homologation`
- `staging`
- `development`

Each environment expects a `.env.<environment>` file.

## ConfigMap and Secret

The generator separates sensitive variables into a Secret. By default the following are treated as secrets:

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

Use `--secrets` to add other variables.

## Route Scanning

`--scan-routes` inspects the project's routes and includes paths in the Helm values. Routes such as `/health` and `/examples` are ignored by the generator.

## Sonar

```bash
yarn sonar
```

The command runs `sonar-scanner-cli` via Docker using `.env`.

## CI

Recommended pipeline:

```bash
yarn install --frozen-lockfile
yarn check:types
yarn test:ci
yarn build
```
