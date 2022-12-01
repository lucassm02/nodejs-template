import { GetAPMTransactionIds } from '@/data/protocols/apm';
import { CreateDocumentService } from '@/data/protocols/elasticsearch';
import { FormatDate } from '@/data/protocols/utils';
import { CreateEvent } from '@/domain/usecases/event';

export class EsCreateEvent implements CreateEvent {
  constructor(
    private readonly createDocumentService: CreateDocumentService,
    private readonly getAPMTransactionIds: GetAPMTransactionIds,
    private readonly formatDate: FormatDate
  ) {}

  async create(params: CreateEvent.Params): CreateEvent.Result {
    const ids = this.getAPMTransactionIds();

    const now = new Date();
    const nowToString = this.formatDate(now, 'yyyy-MM-dd HH:mm:ss');

    if (!ids) throw new Error('UNABLE_TO_GET_APM_TRANSACTION_ID');

    return this.createDocumentService.create({
      id: ids.transactionId,
      index: 'datora-event',
      data: { ...params, createdAt: nowToString, updatedAt: nowToString },
    });
  }
}
