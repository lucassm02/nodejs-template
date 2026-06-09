# Utilitarios

## Validacao

`src/validation/usecases/base.ts` contem validadores Yup comuns:

- string nullable;
- number string;
- CPF/CNPJ;
- email;
- URL;
- UUID;
- campos de cartao;
- endereco.

## Data

Utilitarios de data ficam em `src/util/date` e protocolos em `src/data/protocols/util/date`.

Use para formatacao, soma/subtracao de dias, dias uteis e comparacoes.

## Texto

Utilitarios de texto ficam em `src/util/text`, incluindo conversoes booleanas e formatacao simples.

## Objeto

`src/util/object` contem helpers para:

- buscar valores aninhados;
- filtrar chaves;
- renomear chaves;
- merge;
- processamento de valores;
- conversao camel/snake case.

## UUID

Use helpers de UUID em `src/util/uuid` para gerar e validar identificadores quando aplicavel.

## Transacoes

`src/util/db` oferece helpers para compor commit/rollback em operacoes com mais de uma transacao.

## s-code

`yarn s-code` exporta ou importa conjuntos de arquivos em um formato textual unico.

Exemplos:

```bash
yarn s-code export ./src output.scode
yarn s-code import output.scode
```

## Codegen

`yarn gen` executa o pacote de codegen configurado no projeto. Use para scaffolding quando o time mantiver templates de geracao.
