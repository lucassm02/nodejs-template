import { Elasticsearch } from '@/infra/service';
import { generateUuid, getAPMTransactionIds } from '@/util';

export const datoraHttpLogger = () => {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const requestOptions = args[0];

      const EVENT_INDEX = 'datora-event';
      const HTTP_REQUEST_INDEX = 'datora-http-request';

      const URL_TO_WATCH = ['/Partner', '/hlr'];

      const methodResult = await originalMethod.apply(this, args);

      for (const item of URL_TO_WATCH) {
        if (!String(requestOptions.url).includes(item)) {
          return methodResult;
        }
      }

      const transactionIds = getAPMTransactionIds();

      if (transactionIds) {
        const elasticsearch = new Elasticsearch();

        const document: any = await elasticsearch.getById({
          id: transactionIds.transactionId,
          index: EVENT_INDEX,
        });

        if (!document) return methodResult;

        const request =
          typeof requestOptions.body === 'object'
            ? {
                body: requestOptions.body,
                rawBody: JSON.stringify(requestOptions.body),
              }
            : { rawBody: String(requestOptions.body) };

        const response =
          typeof methodResult.data === 'object'
            ? {
                body: methodResult.data,
                rawBody: JSON.stringify(requestOptions.body),
              }
            : { rawBody: String(methodResult.data) };

        await elasticsearch.create({
          index: HTTP_REQUEST_INDEX,
          data: {
            event: document.event,
            mvno: document.mvno,
            traceId: transactionIds.traceId,
            eventId: transactionIds.transactionId,
            request: {
              transactionId: generateUuid(),
              url: requestOptions.url,
              method: requestOptions.method,
              ...request,
              headers: requestOptions.headers,
            },
            response: {
              statusCode: methodResult.status,
              ...response,
              headers: methodResult.headers,
            },
            createdAt: new Date(),
          },
        });
      }

      return methodResult;
    };

    return descriptor;
  };
};
