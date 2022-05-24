import {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from '@/data/protocols/http/adapters';
import { decorator } from '@/util/observability';
import { apmSpan } from '@/util/observability/apm';
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

export class RequestAdapter implements HttpClient {
  constructor(private readonly axios: AxiosInstance) {}

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

    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data,
      headers: axiosResponse.headers,
    };
  }
}
