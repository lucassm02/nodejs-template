import { getIn } from '@/util';

type Sources = Record<string, Record<string, unknown>>;

type Values = (string | Record<string, string>)[];

type Option = {
  values: Values;
  sources: Sources;
};

export class Controller {
  constructor(protected readonly valuesToExtract: Values = []) {}

  private extractValues({ sources, values }: Option) {
    const object: Record<string, unknown> = {};

    const setKeyValue = (keyName: string, target: string, path: string) => {
      if (target !== 'state' && target !== 'request') return;
      const targetValue = getIn(sources[target], path);
      if (object[keyName] !== undefined && !targetValue) return;
      object[keyName] = targetValue;
    };

    for (const value of values) {
      if (typeof value === 'string') {
        const [target, ...restOfChunks] = value.split('.');
        const targetKey = restOfChunks.at(-1);
        if (!targetKey) continue;
        const path = restOfChunks.join('.');
        setKeyValue(targetKey, target, path);
      }

      if (typeof value === 'object') {
        const entries = Object.entries(value).at(-1);
        if (!entries) continue;
        const [alias, valuePath] = entries;
        const [target, ...restOfChunks] = valuePath.split('.');
        const path = restOfChunks.join('.');
        setKeyValue(alias, target, path);
      }
    }

    return object;
  }

  protected extractValuesFromSources(sources: Sources) {
    return this.extractValues({ sources, values: this.valuesToExtract });
  }
}
