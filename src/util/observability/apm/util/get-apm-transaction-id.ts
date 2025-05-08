import { elasticAPM } from '../factory';

export function getAPMTransactionIds() {
  const currentTransaction = elasticAPM().getAPM()?.currentTransaction;
  if (!currentTransaction) return null;
  const traceId = currentTransaction.ids['trace.id'];
  const transactionId = currentTransaction.ids['transaction.id'];
  return { traceId, transactionId };
}
