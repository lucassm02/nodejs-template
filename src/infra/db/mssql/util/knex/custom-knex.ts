import { knex as k } from 'knex';

import {
  dateToStringInterceptorPlugin,
  formattedSelectPlugin,
  dateConverterToSqliteDriver,
  noLockPlugin,
  syntaxInTestEnvironmentInterceptor
} from './extensions';

export class CustomKnex {
  private static instance: CustomKnex;
  private knex!: typeof k;

  constructor() {
    this.knex = noLockPlugin(k);
    this.knex = dateToStringInterceptorPlugin(this.knex);
    this.knex = formattedSelectPlugin(this.knex);
    this.knex = dateConverterToSqliteDriver(this.knex);
    this.knex = syntaxInTestEnvironmentInterceptor(this.knex);
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
