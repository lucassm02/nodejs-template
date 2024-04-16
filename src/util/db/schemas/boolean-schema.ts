import { TypeSchema } from './schema';

type DefaultBooleanValue = (() => Nullable<boolean>) | Nullable<boolean>;

export class BooleanSchema extends TypeSchema {
  constructor() {
    super({
      type: 'boolean'
    });
  }

  public default(args?: DefaultBooleanValue) {
    this.setDefault(args);
    return this;
  }
}
