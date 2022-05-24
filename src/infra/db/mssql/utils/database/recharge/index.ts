import { makeTable } from '../../query';

const makeRechargeTable = makeTable({
  database: 'RechargeTelecall',
  tablePrefix: 'tb_',
});

export const RECHARGE_DB = {
  PLAN: {
    PLAN: makeRechargeTable({
      table: '[plan].[tb_plan]',
      columns: <const>[
        'plan_id',
        'type_id',
        'value',
        'cost_value',
        'mvno_id',
        'programmable',
        'duration_time',
        'name',
        'description',
        'label',
        'audio',
        'payload',
        'external_id',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
    }),
    DETAIL: makeRechargeTable({
      table: '[plan].[tb_detail]',
      columns: <const>[
        'detail_id',
        'title',
        'description',
        'image',
        'created_at',
      ],
    }),
    PLAN_SOURCE: makeRechargeTable({
      table: '[plan].[tb_plan_source]',
      columns: <const>['plan_source_id', 'plan_id', 'source_id', 'created_at'],
    }),
    PLAN_DETAIL: makeRechargeTable({
      table: '[plan].[tb_plan_detail]',
      columns: <const>['plan_detail_id', 'plan_id', 'detail_id', 'created_at'],
    }),
    TYPE: makeRechargeTable({
      table: '[plan].[tb_type]',
      columns: <const>['type_id', 'name', 'description', 'created_at'],
    }),
  },
  RECHARGE: {
    RECHARGE: makeRechargeTable({
      table: '[recharge].[tb_recharge]',
      columns: <const>[
        'recharge_id',
        'account_id',
        'plan_id',
        'source_mvno_id',
        'status_id',
        'amount_paid',
        'msisdn',
        'payment_id',
        'transaction_id',
        'external_id',
        'created_at',
        'updated_at',
      ],
    }),
    STATUS: makeRechargeTable({
      table: '[recharge].[tb_status]',
      columns: <const>['status_id', 'name', 'description', 'created_at'],
    }),
  },
  RECURRENCE: {
    RECURRENCE: makeRechargeTable({
      table: '[recurrence].[tb_recurrence]',
      columns: <const>[
        'recurrence_id',
        'external_id',
        'payment_id',
        'account_id',
        'plan_id',
        'renewal_date',
        'recurrence_status_id',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
    }),
  },
  RECURRENCE_STATUS: makeRechargeTable({
    table: '[recurrence].[tb_recurrence_status]',
    columns: <const>[
      'recurrence_status_id',
      'description',
      'created_at',
      'updated_at',
    ],
  }),
};
