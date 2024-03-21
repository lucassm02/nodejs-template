import { TypeSchema } from './schema';

type DefaultDateValue = (() => Date) | Date;

export class DateSchema extends TypeSchema<'date', DefaultDateValue> {
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
