# Utilities

## Validation

`src/validation/usecases/base.ts` contains common Yup validators:

- nullable string;
- number string;
- CPF/CNPJ;
- email;
- URL;
- UUID;
- card fields;
- address.

## Date

Date utilities live in `src/util/date` and protocols in `src/data/protocols/util/date`.

Use for formatting, adding/subtracting days, business days, and comparisons.

## Text

Text utilities live in `src/util/text`, including boolean conversions and simple formatting.

## Object

`src/util/object` contains helpers for:

- fetching nested values;
- filtering keys;
- renaming keys;
- merging;
- value processing;
- camel/snake case conversion.

## UUID

Use UUID helpers in `src/util/uuid` to generate and validate identifiers when applicable.

## Transactions

`src/util/db` provides helpers for composing commit/rollback in operations with more than one transaction.

## s-code

`yarn s-code` exports or imports sets of files in a single text format.

Examples:

```bash
yarn s-code export ./src output.scode
yarn s-code import output.scode
```

## Codegen

`yarn gen` runs the codegen package configured in the project. Use for scaffolding when the team maintains generation templates.
