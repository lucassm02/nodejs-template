import { CustomKnex } from './custom-knex';

export const makeCustomKnex = () => CustomKnex.getInstance().getKnex();
