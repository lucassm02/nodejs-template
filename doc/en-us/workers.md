# Workers

Workers use Agenda and MongoDB. They are loaded from `src/main/workers` when `WORKER_ENABLED=true`.

## Registration

```ts
export default (manager: WorkerManager) => {
  manager.makeWorker(
    { name: 'example', repeatInterval: '10 minutes' },
    makeExampleJob()
  );
};
```

`repeatInterval` is optional. Without it, the worker is defined but does not automatically schedule recurring execution.

## Worker List

`WORKER_LIST` controls loading:

- `*`: allow all;
- `!*`: block all;
- `name`: allow a specific worker;
- `!name`: block a specific worker.

Workers with `enabled: false` can be forced by the allow list.

## Dashboard

Use:

- `WORKER_DASHBOARD_ENABLED=true`
- `WORKER_DASHBOARD_PORT`
- `WORKER_DASHBOARD_BASE_URI`

The dashboard helps inspect Agenda jobs.

## Observability

The worker executor creates logs and APM transactions using internal decorators. Errors are recorded by the global logger.
