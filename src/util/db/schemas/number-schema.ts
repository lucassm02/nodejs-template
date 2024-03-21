import { TypeSchema } from './schema';

type DefaultNumberValue = (() => number) | number;

export class NumberSchema extends TypeSchema<'number', DefaultNumberValue> {
  constructor() {
    super({
      type: 'number'
    });
  }

  public default(args?: DefaultNumberValue) {
    this.setDefault(args);
    return this;
  }
}
