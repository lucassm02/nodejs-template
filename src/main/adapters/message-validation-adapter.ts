import { Job } from '@/consumer/protocols';
import { YupSchema } from '@/presentation/protocols';
import { convertCamelCaseKeysToSnakeCase, logger } from '@/util';

export function messageValidationAdapter(
  schema: YupSchema
): (payload: Job.Payload, state: Job.State, next: Job.Next) => Job.Result {
  return async (payload: Job.Payload, state: Job.State, next: Job.Next) => {
    const httpRequest = {
      ...payload.body,
      ...payload.headers,
    };

    try {
      const httpRequestInSnakeCase =
        convertCamelCaseKeysToSnakeCase(httpRequest);

      await schema.validate(httpRequestInSnakeCase, {
        abortEarly: false,
      });

      return next();
    } catch (error) {
      logger.log(error);
    }
  };
}
