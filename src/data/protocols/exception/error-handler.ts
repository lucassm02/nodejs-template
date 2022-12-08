import { Transaction } from '@/domain/models/transaction';
import { isPromise } from 'node:util/types';

export type ErrorHandlerProtocol = (
  error: Error,
  transactions?: (Transaction | null)[]
) => void;
