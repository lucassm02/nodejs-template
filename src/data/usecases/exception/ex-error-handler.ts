import { ErrorHandlerProtocol } from '@/data/protocols/exception';
import { ErrorHandler } from '@/domain/usecases';

export class ExErrorHandler implements ErrorHandler {
  constructor(private readonly handlers: ErrorHandlerProtocol[]) {}

  async handle(error: Error): Promise<void> {
    const promises = this.handlers.map((handler) => handler(error));
    await Promise.all(promises);
  }
}
