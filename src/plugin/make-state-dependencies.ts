/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable guard-for-in */
import { logger } from '@/util';

type Options = {
  trowException: boolean;
  exceptionHandler?: (error: Error) => unknown;
};

export function makeStateDependencies<SharedState>({
  trowException,
  exceptionHandler
}: Options) {
  type Dependencies = (keyof SharedState)[];
  return function (dependencies: Dependencies) {
    return function (
      target: object,
      key: string,
      descriptor: PropertyDescriptor
    ) {
      const STATE_INDEX_IN_REQUEST = 1;
      const STATE_INDEX_IN_STATE = 0;

      const originalHandler = descriptor.value;
      const isAsync = originalHandler.constructor.name === 'AsyncFunction';

      function validate(...args: any[]) {
        for (const index in dependencies) {
          const DEPENDENCY_NAME = dependencies[index];

          const state =
            args[STATE_INDEX_IN_REQUEST][STATE_INDEX_IN_STATE]?.[
              DEPENDENCY_NAME
            ];

          if (state === undefined) {
            const error = new Error(
              `MISSING_DEPENDENCY: ${String(DEPENDENCY_NAME)} at ${
                target.constructor.name
              } method ${key}`
            );
            logger.log(error);

            if (trowException) throw error;
            if (exceptionHandler) return exceptionHandler(error);
          }
        }
      }

      if (isAsync) {
        descriptor.value = async function (...args: any[]) {
          validate(...args);
          return originalHandler.apply(this, args);
        };

        return descriptor;
      }

      descriptor.value = function (...args: any[]) {
        validate(...args);
        return originalHandler.apply(this, args);
      };

      return descriptor;
    };
  };
}
