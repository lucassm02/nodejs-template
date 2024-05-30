type Maybe<T> = T | null | undefined;

export type PermittedTypes = 'string' | 'boolean' | 'number' | 'date';

type DefaultValue = Function | (() => unknown) | unknown | null;

export abstract class TypeSchema {
  protected __default!: DefaultValue | undefined;
  protected readonly __type!: PermittedTypes;

  constructor(args: { type: Maybe<PermittedTypes> }) {
    this.validate(args.type);
    this.__type = args.type!;
  }

  get getType(): PermittedTypes {
    return this.__type;
  }

  get getDefault(): DefaultValue {
    return this.__default;
  }

  protected setDefault(args?: DefaultValue) {
    this.__default = args;
  }

  // TODO: I don't know why this method
  private validate(value: Maybe<unknown>) {
    if (!value)
      throw new Error('The type is undefined or null, not accepted in Schema');
  }
}
