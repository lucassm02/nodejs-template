import { TypeSchema } from './schema';

type DefaultNumberValue = (() => Nullable<number>) | Nullable<number>;

export class NumberSchema extends TypeSchema {
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
