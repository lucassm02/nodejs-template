import { TroubleExample } from '@/domain/usecases';

export class ExampleTrouble implements TroubleExample {
  trouble({ current }: TroubleExample.Params): TroubleExample.Result {
    if (current === 1) throw new Error('Example Error');

    const troubleArray = ['ok', 'ok', 'trouble'];

    for (let index = 0; index < troubleArray.length; index += 1) {
      if (troubleArray[index] === 'trouble')
        throw {
          step: index,
          total: troubleArray.length,
          err: new Error('Example progress Error'),
        };
    }
  }
}
