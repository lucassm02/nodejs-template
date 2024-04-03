import { UpdateEvent } from '@/domain/usecases';

export class UpdateEventStub implements UpdateEvent {
  update(): UpdateEvent.Result {
    return Promise.resolve({ id: 'any_id' });
  }
}
