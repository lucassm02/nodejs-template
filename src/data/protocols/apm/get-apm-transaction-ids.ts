export type GetAPMTransactionIds = () => {
  traceId: string;
  transactionId: string;
} | null;
