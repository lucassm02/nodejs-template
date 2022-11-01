import { TroubleExample } from '@/domain/usecases';

export class ExampleTrouble implements TroubleExample {
  trouble({ current, step }: TroubleExample.Params): TroubleExample.Result {
    if (current === 1) throw new Error('Example Error');

    const troubleArray = [{ name: 'ok' }, { name: 'ok' }, { name: 'trouble' }];

    for (const [index, obj] of troubleArray.entries()) {
      if (step !== 0 && index !== step - 1) continue;

      if (obj.name === 'trouble')
        throw {
          step: index + 1,
          total: troubleArray.length,
          message: 'Error',
        };
    }
  }
}
