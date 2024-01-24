import { ErrorHandler } from '@/domain/usecases';

export const makeErrorHandlerStub = () => new ErrorHandlerStub();

export class ErrorHandlerStub implements ErrorHandler {
  async handle(): Promise<void> {}
}
