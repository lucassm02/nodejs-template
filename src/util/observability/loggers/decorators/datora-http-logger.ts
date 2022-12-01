import { Elasticsearch } from '@/infra/service';
import {
  ELASTICSEARCH,
  formatDate,
  generateUuid,
  getAPMTransactionIds,
} from '@/util';

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

      const TEXT_TO_WATCH = ['PORTAONE', 'HLR', 'PARTNER/NP'];

      const methodResult = await originalMethod.apply(this, args);

      if (!ELASTICSEARCH.ENABLED) return methodResult;

      for (const [index, item] of TEXT_TO_WATCH.entries()) {
        if (String(requestOptions.url).toUpperCase().includes(item)) {
          break;
        }

        if (TEXT_TO_WATCH.length === index + 1) {
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

        const requestData = (() => {
          if (typeof requestOptions.body === 'object') {
            return {
              body: requestOptions.body,
              rawBody: JSON.stringify(requestOptions.body),
            };
          }

          if (requestOptions.body === undefined) return {};

          return { rawBody: String(requestOptions.body) };
        })();
        const responseData = (() => {
          if (typeof methodResult.body === 'object') {
            return {
              body: methodResult.body,
              rawBody: JSON.stringify(requestOptions.body),
            };
          }

          if (methodResult.body === undefined) return {};

          return { rawBody: String(methodResult.body) };
        })();

        await elasticsearch.create({
          index: HTTP_REQUEST_INDEX,
          data: {
            event: document.event,
            mvno: document.mvno,
            transactionId: transactionIds.transactionId,
            traceId: transactionIds.traceId,
            eventId: transactionIds.transactionId,
            request: {
              requestId: generateUuid(),
              url: requestOptions.url,
              method: requestOptions.method,
              ...requestData,
              headers: requestOptions.headers,
            },
            response: {
              statusCode: methodResult.statusCode,
              ...responseData,
              headers: methodResult.headers,
            },
            createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          },
        });
      }

      return methodResult;
    };

    return descriptor;
  };
};
