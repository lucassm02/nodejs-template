import { OverrideAttributeValue } from '@/data/protocols/utils';
import { Controller } from '@/presentation/protocols';
import { ok, stateDependencies } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class GetPlanByIdController implements Controller {
  constructor(
    private readonly overrideAttributeValue: OverrideAttributeValue
  ) {}

  @stateDependencies(['getPlanByIdentifier'])
  async handle(
    httpRequest: Controller.HttpRequest,
    [{ getPlanByIdentifier }]: Controller.State
  ): Controller.Result {
    const {
      payload: { telecall, additionalData },
      ...any
    } = getPlanByIdentifier;

    const publicPayload = this.overrideAttributeValue({
      from: any,
      attribute: 'planId',
      copyFrom: 'externalId',
    });

    return ok(template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Plano listado'), {
      ...publicPayload,
      ...additionalData,
    });
  }
}
