import { Job } from '@/consumer/protocols';
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
    const httpRequest = {
      ...payload.body,
      ...payload.headers,
    };

    try {
      const messageInSnakeCase = convertCamelCaseKeysToSnakeCase(httpRequest);

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
