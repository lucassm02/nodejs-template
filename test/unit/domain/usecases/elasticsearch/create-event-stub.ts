import { CreateEvent } from '@/domain/usecases';

export class CreateEventStub implements CreateEvent {
  create(): CreateEvent.Result {
    return Promise.resolve({ id: 'any_id' });
  }
}
