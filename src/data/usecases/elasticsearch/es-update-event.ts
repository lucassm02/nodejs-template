import { GetAPMTransactionIds } from '@/data/protocols/apm';
import {
  GetDocumentByIdService,
  UpdateDocumentService
} from '@/data/protocols/elasticsearch';
import { FormatDate, Merge } from '@/data/protocols/util';
import { UpdateEvent } from '@/domain/usecases/event';

export class EsUpdateEvent implements UpdateEvent {
  constructor(
    private readonly updateDocumentService: UpdateDocumentService,
    private readonly getDocumentByIdService: GetDocumentByIdService,
    private readonly getAPMTransactionIds: GetAPMTransactionIds,
    private readonly merge: Merge,
    private readonly formatDate: FormatDate
  ) {}

  async update(params: UpdateEvent.Params): UpdateEvent.Result {
    const ids = this.getAPMTransactionIds();

    if (!ids) return;

    const INDEX = 'datora-event';

    const document = await this.getDocumentByIdService.getById({
      index: INDEX,
      id: ids.transactionId
    });

    const now = new Date();
    const nowToString = this.formatDate(now, 'yyyy-MM-dd HH:mm:ss');

    if (!document) {
      return;
    }

    const newDocument = this.merge(document, params, {
      updatedAt: nowToString
    });

    return this.updateDocumentService.update({
      id: ids.transactionId,
      index: INDEX,
      data: newDocument
    });
  }
}
