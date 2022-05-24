import { OverrideAttributeValue } from '@/data/protocols/utils';
import { Controller } from '@/presentation/protocols';
import { ok, stateDependencies } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class GetPlansController implements Controller {
  constructor(
    private readonly overrideAttributeValue: OverrideAttributeValue
  ) {}

  @stateDependencies(['getPlansBySourceAndMvno'])
  async handle(
    httpRequest: Controller.HttpRequest,
    [{ getPlansBySourceAndMvno }]: Controller.State
  ): Controller.Result {
    const formattedPayload = getPlansBySourceAndMvno.map((plan) => {
      const {
        payload: { additionalData, telecall },
        ...any
      } = plan;

      const publicPayload = this.overrideAttributeValue({
        from: any,
        attribute: 'planId',
        copyFrom: 'externalId',
      });

      return { ...publicPayload, ...additionalData };
    });

    return ok(
      template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Planos listados'),
      formattedPayload
    );
  }
}
