# Workers

Workers usam Agenda e MongoDB. Eles sao carregados a partir de `src/main/workers` quando `WORKER_ENABLED=true`.

## Registro

```ts
export default (manager: WorkerManager) => {
  manager.makeWorker(
    { name: 'example', repeatInterval: '10 minutes' },
    makeExampleJob()
  );
};
```

`repeatInterval` e opcional. Sem ele, o worker fica definido mas nao agenda execucao recorrente automaticamente.

## Lista De Workers

`WORKER_LIST` controla carregamento:

- `*`: permite todos;
- `!*`: bloqueia todos;
- `name`: permite worker especifico;
- `!name`: bloqueia worker especifico.

Workers com `enabled: false` podem ser forçados pela allow list.

## Dashboard

Use:

- `WORKER_DASHBOARD_ENABLED=true`
- `WORKER_DASHBOARD_PORT`
- `WORKER_DASHBOARD_BASE_URI`

O dashboard ajuda a inspecionar jobs Agenda.

## Observabilidade

O executor de worker cria logs e transacoes APM usando decorators internos. Erros sao registrados pelo logger global.
