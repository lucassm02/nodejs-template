import { TypeSchema } from './schema';

type DefaultStringValue = (() => Nullable<string>) | Nullable<string>;

export class StringSchema extends TypeSchema {
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
