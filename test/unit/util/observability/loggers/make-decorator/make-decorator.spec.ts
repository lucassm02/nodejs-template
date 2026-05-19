import { makeDecorator } from '@/util/observability/loggers/make-decorator/make-decorator';

type SutTypes = {
  logger: jest.Mock;
  decorate: ReturnType<typeof makeDecorator>;
};

const makeSut = (): SutTypes => {
  const logger = jest.fn();
  const decorate = makeDecorator(logger, {
    inputName: 'input',
    outputName: 'output'
  });
  return { logger, decorate };
};

describe('makeDecorator', () => {
  describe('async method', () => {
    it('should call the original async method and logger', async () => {
      const { logger, decorate } = makeSut();

      const descriptor: PropertyDescriptor = {
        value: async (_data: unknown) => 'result'
      };

      const decorated = decorate({
        options: { name: 'test-method', subType: 'handler' }
      });
      decorated({}, 'methodName', descriptor);

      const output = await descriptor.value('input-data');

      expect(output).toBe('result');
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test-method', subType: 'handler' })
      );
    });

    it('should map subType to type via getType', async () => {
      const { logger, decorate } = makeSut();
      const descriptor: PropertyDescriptor = { value: async () => 'done' };
      const decorated = decorate({
        options: { name: 'my-op', subType: 'http' }
      });
      decorated({}, 'method', descriptor);

      await descriptor.value();
      expect(logger).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'external', subType: 'http' })
      );
    });
  });

  describe('sync method', () => {
    it('should call the original sync method and logger', () => {
      const { logger, decorate } = makeSut();
      const descriptor: PropertyDescriptor = { value: () => 42 };
      const decorated = decorate({
        options: { name: 'sync-op', subType: 'function' }
      });
      decorated({}, 'method', descriptor);

      const result = descriptor.value();

      expect(result).toBe(42);
      expect(logger).toHaveBeenCalledTimes(1);
    });

    it('should handle sync method returning a Promise', async () => {
      const { logger, decorate } = makeSut();
      const descriptor: PropertyDescriptor = {
        value: () => Promise.resolve('async-like')
      };
      const decorated = decorate({ options: { name: 'op' } });
      decorated({}, 'method', descriptor);

      const result = await descriptor.value();
      await new Promise<void>((r) => {
        setImmediate(r);
      });

      expect(result).toBe('async-like');
      expect(logger).toHaveBeenCalledTimes(1);
    });
  });
});
