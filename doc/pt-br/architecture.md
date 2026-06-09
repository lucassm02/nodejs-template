# Arquitetura

O template segue uma variacao pragmatica de Clean Architecture. A regra central e manter codigo de negocio independente de detalhes de framework, banco, mensageria e transporte.

## Camadas

- `domain`: modelos e contratos de usecase. Nao deve importar `infra`, `main` ou framework HTTP.
- `data`: implementacoes de usecases e protocolos para dependencias externas.
- `infra`: implementacoes concretas de banco, HTTP client, cache, MQ, worker e servidores.
- `presentation`: controllers, middlewares, contratos HTTP e helpers de resposta.
- `main`: composition root. Contem adapters, factories, rotas, bootstrap e ligacao das dependencias.
- `validation`: schemas Yup e validadores reutilizaveis.
- `util`: funcoes transversais, constantes, formatadores e observabilidade.

## Fluxo Padrao HTTP

```text
Route -> adapters -> middleware/controller -> usecase -> repository/service -> infra
```

Rotas em `src/main/routes` nao devem construir regras manualmente. Elas devem compor adapters e factories:

- `requestValidationAdapter(schema)` valida entrada.
- factories em `src/main/factories` montam controllers, middlewares e usecases.
- middlewares enriquecem `state` ou interrompem o fluxo.
- controllers retornam `HttpResponse`.

## Factories

Factories sao o ponto padrao para instanciar dependencias. Use-as para:

- conectar usecases a repositories/services;
- evitar `new` espalhado em rotas;
- isolar detalhes de infra;
- facilitar teste unitario das classes reais.

## Estado Compartilhado

Middlewares podem gravar informacoes em `state`, tipado por `SharedState`. Controllers e middlewares seguintes podem ler esse estado. Use nomes claros e estaveis para chaves de estado.

## Imports

Use o alias `@/` para imports internos. Evite caminhos relativos longos entre camadas.

## Limites De Dependencia

- `domain` nao conhece framework.
- `data` conhece contratos, nao implementacoes concretas.
- `infra` implementa contratos.
- `presentation` conhece contratos HTTP do template.
- `main` pode importar tudo para compor a aplicacao.
