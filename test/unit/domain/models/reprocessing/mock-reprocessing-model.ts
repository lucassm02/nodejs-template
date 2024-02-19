import { ReprocessingModel } from '@/domain/models';

export const mockReprocessingModel: ReprocessingModel = {
  reprocessingId: 'any_reprocessing_id',
  reprocessing: {
    middleware: 'any_middleware',
    tries: {},
    data: {
      payload: {
        body: {},
        headers: {},
        properties: {}
      }
    },
    state: {}
  },
  queue: 'any_queue',
  createdAt: new Date()
};
