import { makeTableBuilder } from '../../schema';

const builder = makeTableBuilder({
  database: 'Example',
  tablePrefix: 'tb_',
});

export const EXAMPLE_DB = {
  EXAMPLE: {
    EXAMPLE: builder({
      table: '[example].[tb_example]',
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
