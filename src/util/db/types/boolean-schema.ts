import { TypeSchema } from './schema';

type DefaultBooleanValue = (() => boolean) | boolean;

export class BooleanSchema extends TypeSchema<'boolean', DefaultBooleanValue> {
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
