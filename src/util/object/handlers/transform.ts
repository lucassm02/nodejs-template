type Callback<Type> = (value: Type) => any;

class Pipeline<Type> {
  constructor(private data: Type) {}
  pipe(callback: Callback<Type>) {
    this.data = callback(this.data);
    return this;
  }
}

export const transform = <Param>(value: Param) => new Pipeline(value);
