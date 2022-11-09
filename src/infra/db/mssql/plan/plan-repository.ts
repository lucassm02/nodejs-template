import {
  GetPlanByIdentifierRepository,
  GetPlanDetailsByPlanIdRepository,
  GetPlansByIdentifiersRepository,
  GetPlansBySourceAndMvnoRepository,
} from '@/data/protocols/db/plan';
import { convertSnakeCaseKeysToCamelCase, processValue } from '@/util/object';

import { sqlConnection } from '../utils/connection';
import { RECHARGE_DB } from '../utils/database';

const {
  PLAN: { PLAN, PLAN_DETAIL, DETAIL, TYPE, PLAN_SOURCE },
} = RECHARGE_DB;

export class PlanRepository
  implements
    GetPlansBySourceAndMvnoRepository,
    GetPlanByIdentifierRepository,
    GetPlanDetailsByPlanIdRepository,
    GetPlansByIdentifiersRepository
{
  async getDetailsByPlanId(
    planId: GetPlanDetailsByPlanIdRepository.Params
  ): GetPlanDetailsByPlanIdRepository.Result {
    return sqlConnection(PLAN.TABLE)
      .innerJoin(
        PLAN_DETAIL.TABLE,
        PLAN_DETAIL.COLUMNS.PLAN_ID,
        PLAN.COLUMNS.PLAN_ID
      )
      .innerJoin(
        DETAIL.TABLE,
        DETAIL.COLUMNS.DETAIL_ID,
        PLAN_DETAIL.COLUMNS.DETAIL_ID
      )
      .select(
        DETAIL.COLUMNS.TITLE,
        DETAIL.COLUMNS.DESCRIPTION,
        DETAIL.COLUMNS.IMAGE
      )
      .where(PLAN.COLUMNS.PLAN_ID, '=', planId);
  }

  async getByIdentifier(
    identifier: GetPlanByIdentifierRepository.Params
  ): GetPlanByIdentifierRepository.Result {
    const record = await sqlConnection(PLAN.TABLE)
      .innerJoin(TYPE.TABLE, TYPE.COLUMNS.TYPE_ID, PLAN.COLUMNS.TYPE_ID)
      .select({
        planId: PLAN.COLUMNS.PLAN_ID,
        externalId: PLAN.COLUMNS.EXTERNAL_ID,
        type: TYPE.COLUMNS.DESCRIPTION,
        name: PLAN.COLUMNS.NAME,
        label: PLAN.COLUMNS.LABEL,
        payload: PLAN.COLUMNS.PAYLOAD,
        audio: PLAN.COLUMNS.AUDIO,
        description: PLAN.COLUMNS.DESCRIPTION,
        value: PLAN.COLUMNS.VALUE,
        programmable: PLAN.COLUMNS.PROGRAMMABLE,
        durationTime: PLAN.COLUMNS.DURATION_TIME,
        createdAt: PLAN.COLUMNS.CREATED_AT,
      })
      .andWhere((queryBuilder) => {
        if (typeof identifier === 'string')
          return queryBuilder
            .where(PLAN.COLUMNS.EXTERNAL_ID, identifier)
            .orWhereRaw(`JSON_VALUE(??, '$.telecall.product_id') = ?`, [
              PLAN.COLUMNS.PAYLOAD,
              identifier,
            ]);

        return queryBuilder.where(PLAN.COLUMNS.PLAN_ID, identifier);
      })
      .whereNull(PLAN.COLUMNS.DELETED_AT)
      .first();

    const processedRecord = processValue(record, { payload: JSON.parse });

    return convertSnakeCaseKeysToCamelCase(processedRecord);
  }

  async getByIdentifiers(
    identifiers: GetPlansByIdentifiersRepository.Params
  ): GetPlansByIdentifiersRepository.Result {
    const records = await sqlConnection(PLAN.TABLE)
      .innerJoin(TYPE.TABLE, TYPE.COLUMNS.TYPE_ID, PLAN.COLUMNS.TYPE_ID)
      .select({
        planId: PLAN.COLUMNS.PLAN_ID,
        externalId: PLAN.COLUMNS.EXTERNAL_ID,
        type: TYPE.COLUMNS.DESCRIPTION,
        name: PLAN.COLUMNS.NAME,
        label: PLAN.COLUMNS.LABEL,
        payload: PLAN.COLUMNS.PAYLOAD,
        audio: PLAN.COLUMNS.AUDIO,
        description: PLAN.COLUMNS.DESCRIPTION,
        value: PLAN.COLUMNS.VALUE,
        programmable: PLAN.COLUMNS.PROGRAMMABLE,
        durationTime: PLAN.COLUMNS.DURATION_TIME,
        createdAt: PLAN.COLUMNS.CREATED_AT,
      })
      .andWhere((queryBuilder) => {
        if (typeof identifiers[0] === 'string')
          return queryBuilder
            .whereIn(PLAN.COLUMNS.EXTERNAL_ID, identifiers)
            .orWhereRaw(`(JSON_VALUE(??, '$.telecall.product_id')) IN (?)`, [
              PLAN.COLUMNS.PAYLOAD,
              identifiers,
            ]);

        return queryBuilder.whereIn(PLAN.COLUMNS.PLAN_ID, identifiers);
      })
      .whereNull(PLAN.COLUMNS.DELETED_AT);

    const processedRecord = records.map((record) =>
      processValue(record, { payload: JSON.parse })
    );

    return convertSnakeCaseKeysToCamelCase(processedRecord);
  }

  async getBySourceAndMvno(
    params: GetPlansBySourceAndMvnoRepository.Params
  ): GetPlansBySourceAndMvnoRepository.Result {
    const records = await sqlConnection(PLAN.TABLE)
      .select({
        planId: PLAN.COLUMNS.PLAN_ID,
        externalId: PLAN.COLUMNS.EXTERNAL_ID,
        type: TYPE.COLUMNS.DESCRIPTION,
        name: PLAN.COLUMNS.NAME,
        label: PLAN.COLUMNS.LABEL,
        payload: PLAN.COLUMNS.PAYLOAD,
        audio: PLAN.COLUMNS.AUDIO,
        description: PLAN.COLUMNS.DESCRIPTION,
        value: PLAN.COLUMNS.VALUE,
        programmable: PLAN.COLUMNS.PROGRAMMABLE,
        durationTime: PLAN.COLUMNS.DURATION_TIME,
        createdAt: PLAN.COLUMNS.CREATED_AT,
      })
      .innerJoin(
        PLAN_SOURCE.TABLE,
        PLAN_SOURCE.COLUMNS.PLAN_ID,
        PLAN.COLUMNS.PLAN_ID
      )
      .innerJoin(TYPE.TABLE, TYPE.COLUMNS.TYPE_ID, PLAN.COLUMNS.TYPE_ID)

      .where(PLAN_SOURCE.COLUMNS.SOURCE_ID, params.sourceId)
      .andWhere(PLAN.COLUMNS.MVNO_ID, params.mvnoId)
      .whereNull(PLAN.COLUMNS.DELETED_AT);

    const processedRecords = records.map((record) =>
      processValue(record, { payload: JSON.parse })
    );

    return convertSnakeCaseKeysToCamelCase(processedRecords);
  }
}
