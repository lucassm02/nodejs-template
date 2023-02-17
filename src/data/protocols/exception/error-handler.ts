import { DatabaseTransaction } from '@/domain/models';

export type ErrorHandlerProtocol = (
  error: Error,
  transactions?: (DatabaseTransaction | null)[]
) => void;
