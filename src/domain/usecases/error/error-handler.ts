import { Transaction } from '@/domain/models/transaction';

export interface ErrorHandler {
  handle(error: Error, transactions?: (Transaction | null)[]): Promise<void>;
}
