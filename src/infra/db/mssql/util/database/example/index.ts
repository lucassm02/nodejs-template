import { makeTable } from '../../query';

const builder = makeTable({
  database: 'RechargeTelecall',
  tablePrefix: 'tb_',
});

export const EXAMPLE_DB = {
  EXAMPLE: {
    EXAMPLE: builder({
      table: '[plan].[tb_plan]',
      columns: <const>[
        'example_id',
        'external_id',
        'value',
        'description',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
    }),
  },
};
