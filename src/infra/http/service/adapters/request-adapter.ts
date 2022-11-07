import {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from '@/data/protocols/http/adapters';
import { Elasticsearch } from '@/infra/service';
import { generateUuid, merge } from '@/util';
import { decorator } from '@/util/observability';
import { apmSpan, getAPMTransactionIds } from '@/util/observability/apm';
import Agent from 'agentkeepalive';
import { AxiosInstance } from 'axios';

const decorators = {
  options: { subType: 'http', name: 'Http Request' },
  params: {
    'request-body': 'body',
    'request-headers': 'headers',
    'request-url': 'url',
  },
  result: {
    'response-body': 'body',
    'response-status-code': 'statusCode',
    'response-headers': 'headers',
  },
};

const AgentOptions = {
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
};
export class RequestAdapter implements HttpClient {
  constructor(private readonly axios: AxiosInstance) {
    this.axios.defaults.httpAgent = new Agent(AgentOptions);
    this.axios.defaults.httpsAgent = new Agent.HttpsAgent(AgentOptions);
    this.axios.interceptors.response.use(undefined, (error) => error.response);
  }

  @decorator({
    options: decorators.options,
    input: decorators.params,
    output: decorators.result,
  })
  @apmSpan({
    options: decorators.options,
    params: decorators.params,
    result: decorators.result,
  })
  async request(data: HttpRequest): Promise<HttpResponse> {
    this.axios.interceptors.response.use(undefined, (error) => error.response);

    const axiosResponse = await this.axios({
      data: data?.body,
      ...data,
    });

    if (!axiosResponse) throw new Error('REQUEST_ERROR');

    sendToElasticSearch: {
      const transactionIds = getAPMTransactionIds();

      if (transactionIds) {
        const document = new Elasticsearch().getById({
          id: transactionIds.transactionId,
          index: 'datora-event',
        });

        if (!document) break sendToElasticSearch;

        const newDocument = merge(document, {
          httpRequests: [
            {
              transactionId: generateUuid(),
              request: {
                url: data.url,
                method: data.method,
                body: data.body,
                headers: data.headers,
              },
              response: {
                statusCode: axiosResponse.status,
                body: axiosResponse.data,
                headers: axiosResponse.headers,
              },
            },
          ],
        });

        new Elasticsearch().update({
          id: transactionIds.transactionId,
          index: 'datora-event',
          data: newDocument,
        });
      }
    }

    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data,
      headers: axiosResponse.headers,
    };
  }
}
