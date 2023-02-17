import { DatabaseTransaction } from '@/domain/models';

export interface ErrorHandler {
  handle(
    error: Error,
    transactions?: (DatabaseTransaction | null)[]
  ): Promise<void>;
}
