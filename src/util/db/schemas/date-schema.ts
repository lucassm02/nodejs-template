import { TypeSchema } from './schema';

type DefaultDateValue = (() => Nullable<Date>) | Nullable<Date>;

export class DateSchema extends TypeSchema {
  constructor() {
    super({
      type: 'date'
    });
  }

  public default(args?: DefaultDateValue) {
    this.setDefault(args);
    return this;
  }
}
