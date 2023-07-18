import { Job } from '@/job/protocols';
import { YupSchema } from '@/presentation/protocols';
import {
  convertCamelCaseKeysToSnakeCase,
  formatYupError,
  logger,
} from '@/util';

export function messageValidationAdapter(
  schema: YupSchema
): (payload: Job.Payload, state: Job.State, next: Job.Next) => Job.Result {
  return async (payload: Job.Payload, _state: Job.State, next: Job.Next) => {
    try {
      const messageInSnakeCase = convertCamelCaseKeysToSnakeCase(payload);

      await schema.validate(messageInSnakeCase, {
        abortEarly: false,
      });

      return next();
    } catch (error) {
      logger.log({
        level: 'error',
        message: 'VALIDATION ERROR',
        erros: formatYupError(error),
      });
    }
  };
}
