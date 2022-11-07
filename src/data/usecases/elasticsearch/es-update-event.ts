import { GetAPMTransactionIds } from '@/data/protocols/apm';
import {
  GetDocumentByIdService,
  UpdateDocumentService,
} from '@/data/protocols/elasticsearch';
import { Merge } from '@/data/protocols/utils';
import { UpdateEvent } from '@/domain/usecases/event';

export class EsUpdateEvent implements UpdateEvent {
  constructor(
    private readonly updateDocumentService: UpdateDocumentService,
    private readonly getDocumentByIdService: GetDocumentByIdService,
    private readonly getAPMTransactionIds: GetAPMTransactionIds,
    private readonly merge: Merge
  ) {}

  async update(params: UpdateEvent.Params): UpdateEvent.Result {
    const ids = this.getAPMTransactionIds();

    if (!ids) throw new Error('UNABLE_TO_GET_APM_TRANSACTION_ID');

    const INDEX = 'datora-event';

    const document = await this.getDocumentByIdService.getById({
      index: INDEX,
      id: ids.transactionId,
    });

    const newDocument = this.merge(document, params);

    return this.updateDocumentService.update({
      id: ids.transactionId,
      index: INDEX,
      data: newDocument,
    });
  }
}
