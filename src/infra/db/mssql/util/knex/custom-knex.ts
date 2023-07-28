import { knex as k } from 'knex';

import { noLockPlugin } from './extensions';

export class CustomKnex {
  private static instance: CustomKnex;
  private knex!: typeof k;

  constructor() {
    this.knex = noLockPlugin(k);
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
