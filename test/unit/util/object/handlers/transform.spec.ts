import { transform } from '@/util';

describe('Pipeline', () => {
  it('Should transform data using a single pipe', () => {
    const result = transform(10)
      .pipe((value) => value * 2)
      .get();
    expect(result).toEqual(20);
  });

  it('Should chain multiple pipes', () => {
    const result = transform(5)
      .pipe((value) => value * 2)
      .pipe((value) => value + 3)
      .get();
    expect(result).toEqual(13);
  });

  it('Should handle complex transformations', () => {
    const result = transform('any')
      .pipe((value) => value.toUpperCase())
      .pipe((value) => value.split('').reverse().join(''))
      .get();
    expect(result).toEqual('YNA');
  });

  it('Should handle transformations on objects', () => {
    const result = transform({ x: 10, y: 20 })
      .pipe((value) => ({ x: value.x * 2, y: value.y * 3 }))
      .get();
    expect(result).toEqual({ x: 20, y: 60 });
  });

  it('Should return original data if no pipes are applied', () => {
    const result = transform('Original Data').get();
    expect(result).toEqual('Original Data');
  });
});
