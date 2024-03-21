import { TypeSchema } from './schema';

type DefaultStringValue = (() => string) | string;

export class StringSchema extends TypeSchema<'string', DefaultStringValue> {
  constructor() {
    super({
      type: 'string'
    });
  }

  public default(args?: DefaultStringValue) {
    this.setDefault(args);
    return this;
  }
}
