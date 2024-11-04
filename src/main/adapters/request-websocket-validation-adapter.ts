import { type CallbackSocketWithStateHook } from '@/infra/http/util/web-server/types';
import { YupSchema } from '@/presentation/protocols';
import { badRequest } from '@/presentation/utils/http-response';
import { convertCamelCaseKeysToSnakeCase } from '@/util';
import { formatYupError } from '@/util/formatters/yup-error-formatter';

export function requestWebsocketValidationAdapter(
  schema: YupSchema
): CallbackSocketWithStateHook {
  return async (_socket, req, next) => {
    const httpRequest = {
      ...req?.body,
      ...req?.params,
      ...req?.query,
      ...req?.headers
    };

    try {
      const httpRequestInSnakeCase =
        convertCamelCaseKeysToSnakeCase(httpRequest);

      await schema.validate(httpRequestInSnakeCase, {
        abortEarly: false
      });

      return next();
    } catch (error) {
      return badRequest(formatYupError(error));
    }
  };
}
