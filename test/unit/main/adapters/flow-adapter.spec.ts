import makeFlow from '@/main/adapters/flow-adapter';

describe('#Flow Adapter', () => {
  it('should call next function only one time per flow iterations', async () => {
    const arr: number[] = [];
    const flow = makeFlow({});

    await flow(
      (_, next) => {
        arr.push(1);
        next();
        next();
        next();
      },
      (_, next) => {
        arr.push(2);
      },
      (_, next) => {
        arr.push(3);
      }
    )();

    expect(arr).toHaveLength(2);
  });
});
