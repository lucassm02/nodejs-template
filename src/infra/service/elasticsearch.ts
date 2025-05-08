import { Client } from '@elastic/elasticsearch';
import {
  CreateDocumentService,
  GetDocumentByIdService,
  UpdateDocumentService
} from '@/data/protocols/elasticsearch';
import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  ELASTICSEARCH
} from '@/util';

export class Elasticsearch
  implements
    CreateDocumentService,
    GetDocumentByIdService,
    UpdateDocumentService
{
  private client: Client;

  constructor() {
    this.client = new Client({
      node: ELASTICSEARCH.SERVER_URL,
      auth: {
        username: ELASTICSEARCH.USERNAME,
        password: ELASTICSEARCH.PASSWORD
      }
    });
  }
  async create(
    params: CreateDocumentService.Params
  ): CreateDocumentService.Result {
    const response = await this.client.index({
      index: params.index,
      id: params.id,
      document: convertCamelCaseKeysToSnakeCase(params.data)
    });

    return { id: response._id };
  }

  async update(
    params: UpdateDocumentService.Params
  ): UpdateDocumentService.Result {
    const response = await this.client.update({
      index: params.index,
      id: params.id,
      doc: convertCamelCaseKeysToSnakeCase(params.data)
    });

    return { id: response._id };
  }

  async getById(
    params: GetDocumentByIdService.Params
  ): GetDocumentByIdService.Result {
    try {
      const response = await this.client.get({
        index: params.index,
        id: params.id
      });

      return convertSnakeCaseKeysToCamelCase(response._source);
    } catch (_error) {
      return undefined;
    }
  }
}
