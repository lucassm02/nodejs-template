type Maybe<T> = T | null | undefined;

export type PermittedTypes = 'string' | 'boolean' | 'number' | 'date';

export interface ITypeSchema<T extends PermittedTypes, D> {
  __type: T;
  __default: D | undefined;
}

type DefaultValue = (() => unknown) | unknown | null;

export abstract class TypeSchema<
  T extends PermittedTypes,
  D extends DefaultValue
> implements ITypeSchema<T, D>
{
  __default!: D | undefined;
  readonly __type!: T;

  constructor(args: { type: Maybe<T> }) {
    this.validate(args.type);
    this.__type = args.type!;
  }

  public setDefault(args?: D) {
    this.__default = args;
  }

  // TODO: I don't know why this method
  private validate(value: Maybe<unknown>) {
    if (!value)
      throw new Error('The type is undefined or null, not accepted in Schema');
  }
}
