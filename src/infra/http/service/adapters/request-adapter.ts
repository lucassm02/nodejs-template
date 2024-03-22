import { AxiosInstance, isCancel } from 'axios';
import http from 'http';
import https from 'https';

import {
  HttpClient,
  HttpRequest,
  HttpResponse
} from '@/data/protocols/http/adapters';
import { logger } from '@/util';
import { apmSpan } from '@/util/observability/apm';
import { datoraHttpLogger } from '@/util/observability/loggers/decorators';

const decorators = {
  options: { subType: 'http', name: 'Http Request' },
  params: {
    'request-body': 'body',
    'request-headers': 'headers',
    'request-url': 'url'
  },
  result: {
    'response-body': 'body',
    'response-status-code': 'statusCode',
    'response-headers': 'headers'
  }
};

const AgentOptions = {
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 120000,
  freeSocketTimeout: 60000
};

export class RequestAdapter implements HttpClient {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly httpAgent?: http.Agent,
    private readonly httpsAgent?: https.Agent,
    private readonly abortSignal?: AbortSignal
  ) {
    this.axios.defaults.signal = this.abortSignal;
    this.axios.defaults.httpAgent =
      this.httpAgent ?? new http.Agent(AgentOptions);
    this.axios.defaults.httpsAgent =
      this.httpsAgent ?? new https.Agent(AgentOptions);
    this.axios.interceptors.response.use(undefined, (error) => {
      logger.log(error);

      if (isCancel(error)) throw new Error('ABORTED_REQUEST');

      if (!error.response) {
        throw new Error('REQUEST_ERROR');
      }

      return error.response;
    });
  }

  @datoraHttpLogger()
  @apmSpan({
    options: decorators.options,
    params: decorators.params,
    result: decorators.result
  })
  async request(data: HttpRequest): Promise<HttpResponse> {
    const axiosResponse = await this.axios({
      data: data?.body,
      ...data
    });

    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data,
      headers: axiosResponse.headers
    };
  }
}
