import { CallbackWithStateHook } from '@/infra/http/utils/http-server/types';
import { YupSchema } from '@/presentation/protocols';
import { badRequest } from '@/presentation/utils/http-response';
import { convertCamelCaseKeysToSnakeCase } from '@/util';
import { formatYupError } from '@/util/formatters/yup-error-formatter';

export function requestValidationAdapter(
  schema: YupSchema
): CallbackWithStateHook {
  return async (req, res, next) => {
    const httpRequest = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...req.headers
    };

    try {
      const httpRequestInSnakeCase =
        convertCamelCaseKeysToSnakeCase(httpRequest);

      await schema.validate(httpRequestInSnakeCase, {
        abortEarly: false
      });

      return next();
    } catch (error) {
      const { body, statusCode } = badRequest(formatYupError(error));
      return res.status(statusCode).send(body);
    }
  };
}
