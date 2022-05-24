/* eslint-disable guard-for-in */
import { logger } from '@/util';

import { SharedState } from '../protocols/shared-state';
import { serverError } from './http-response';

type Dependencies = (keyof SharedState)[];

export function stateDependencies(dependencies: Dependencies) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      for (const key in dependencies) {
        const dependency = dependencies[key];
        const stateCondition = args[1][0]?.[dependency];

        if (!stateCondition) {
          const error = new Error(`MISSING_DEPENDENCY: ${dependency}`);
          logger.log(error);
          return serverError(error);
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
