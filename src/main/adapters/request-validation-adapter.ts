import { CallbackWithStateHook } from '@/infra/http/util/web-server/types';
import { YupSchema } from '@/presentation/protocols';
import { badRequest } from '@/presentation/utils/http-response';
import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase
} from '@/util';
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

      const validatedSchema = await schema.validate(httpRequestInSnakeCase, {
        abortEarly: false
      });

      if (!req.body) return next();

      const bodyKeys = Object.keys(convertCamelCaseKeysToSnakeCase(req.body));

      const filteredBodyData = Object.fromEntries(
        Object.entries(validatedSchema).filter(([key]) =>
          bodyKeys.includes(key)
        )
      );

      req.body = convertSnakeCaseKeysToCamelCase(filteredBodyData);

      return next();
    } catch (error) {
      const { body, statusCode } = badRequest(formatYupError(error));
      return res.status(statusCode).send(body);
    }
  };
}
