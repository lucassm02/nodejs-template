import { knex as k } from 'knex';

import {
  dateToStringInterceptorPlugin,
  formattedSelectPlugin,
  noLockPlugin,
  sqLitePlus
} from './extensions';
import { turboPlugin } from './extensions/turbo-plugin';
import { turboInterceptorPlugin } from './extensions/turbo-interceptor';

export class CustomKnex {
  private static instance: CustomKnex;
  private knex!: typeof k;

  constructor() {
    this.knex = noLockPlugin(k);
    this.knex = dateToStringInterceptorPlugin(this.knex);
    this.knex = formattedSelectPlugin(this.knex);
    this.knex = sqLitePlus(this.knex);
    this.knex = turboPlugin(this.knex);
    this.knex = turboInterceptorPlugin(this.knex);
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
