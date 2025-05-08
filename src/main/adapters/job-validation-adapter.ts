import { Job } from '@/job/protocols';
import { normalizeReprocessingPayload } from '@/job/util';
import { YupSchema } from '@/presentation/protocols';
import {
  convertCamelCaseKeysToSnakeCase,
  formatYupError,
  logger
} from '@/util';

export function messageValidationAdapter(
  schema: YupSchema
): (payload: Job.Payload, state: Job.State, next: Job.Next) => Job.Result {
  return async (payload: Job.Payload, state: Job.State, next: Job.Next) => {
    try {
      normalizeReprocessingPayload(payload, state);

      const messageInSnakeCase = convertCamelCaseKeysToSnakeCase(payload);

      await schema.validate(messageInSnakeCase, {
        abortEarly: false
      });

      return next();
    } catch (error) {
      logger.log({
        level: 'error',
        message: 'VALIDATION ERROR',
        erros: formatYupError(error)
      });
    }
  };
}
