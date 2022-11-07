import { ErrorHandler as Handler } from '@/data/protocols/exception';

export class ErrorHandler {
  constructor(private readonly handlers: Handler[]) {}

  async handle(error: Error): Promise<void> {
    const promises = this.handlers.map((handler) => handler(error));
    await Promise.all(promises);
  }
}
