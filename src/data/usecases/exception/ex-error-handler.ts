import { ErrorHandlerProtocol } from '@/data/protocols/exception';
import { Transaction } from '@/domain/models/transaction';
import { ErrorHandler } from '@/domain/usecases';

export class ExErrorHandler implements ErrorHandler {
  constructor(private readonly handlers: ErrorHandlerProtocol[]) {}

  async handle(
    error: Error,
    transactions?: (Transaction | null)[]
  ): Promise<void> {
    const promises = this.handlers.map((handler) =>
      handler(error, transactions)
    );
    await Promise.all(promises);
  }
}
