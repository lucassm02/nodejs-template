import k from 'knex';
import { createRequire } from 'node:module';

import {
  dateToStringInterceptorPlugin,
  formattedSelectPlugin,
  noLockPlugin,
  sqLitePlusPlugin,
  turboPlugin
} from './extensions';

const require = createRequire(__filename);
const originalKnex = require('knex/lib/knex-builder/Knex') as typeof k;

type KnexFactory = typeof k;
type KnexModuleShape =
  | KnexFactory
  | {
      default?: KnexFactory;
      knex?: KnexFactory;
      'module.exports'?: KnexFactory;
    };

function resolveKnexFactory(knexModule: KnexModuleShape): KnexFactory {
  const candidate = knexModule as KnexFactory & {
    default?: KnexFactory;
    knex?: KnexFactory;
    'module.exports'?: KnexFactory;
  };

  if (candidate.QueryBuilder) return candidate;
  if (candidate.default?.QueryBuilder) return candidate.default;
  if (candidate.knex?.QueryBuilder) return candidate.knex;
  if (candidate['module.exports']?.QueryBuilder)
    return candidate['module.exports'];

  if (typeof candidate === 'function') {
    Object.assign(candidate, {
      Client: originalKnex.Client,
      KnexTimeoutError: originalKnex.KnexTimeoutError,
      QueryBuilder: originalKnex.QueryBuilder,
      SchemaBuilder: originalKnex.SchemaBuilder,
      ViewBuilder: originalKnex.ViewBuilder,
      ColumnBuilder: originalKnex.ColumnBuilder,
      TableBuilder: originalKnex.TableBuilder
    });

    if (candidate.QueryBuilder) return candidate;
  }

  throw new Error('Invalid Knex module: QueryBuilder extension API not found');
}

export class CustomKnex {
  private static instance: CustomKnex;
  private knex!: typeof k;

  constructor() {
    const knexFactory = resolveKnexFactory(k);

    this.knex = noLockPlugin(knexFactory);
    this.knex = dateToStringInterceptorPlugin(this.knex);
    this.knex = formattedSelectPlugin(this.knex);
    this.knex = sqLitePlusPlugin(this.knex);
    this.knex = turboPlugin(this.knex);
  }

  public static getInstance(): CustomKnex {
    if (!CustomKnex.instance) {
      CustomKnex.instance = new CustomKnex();
    }

    return CustomKnex.instance;
  }

  public getKnex() {
    return this.knex;
  }
}
