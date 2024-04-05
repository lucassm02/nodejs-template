import { ErrorHandlerProtocol } from '@/data/protocols/exception';
import { DatabaseTransaction } from '@/domain/models';
import { ErrorHandler } from '@/domain/usecases';

export class ExErrorHandler implements ErrorHandler {
  constructor(private readonly handlers: ErrorHandlerProtocol[]) {}

  async handle(
    error: Error,
    transactions?: (DatabaseTransaction | null)[]
  ): Promise<void> {
    const promises = this.handlers.map((handler) =>
      handler(error, transactions)
    );
    await Promise.all(promises);
  }
}
