import { MqPublishDataToReprocessing } from '@/data/usecases/mq';
import { PublishInQueueServiceStub } from '@/test/unit/data/mq/mocks';

type SutTypes = {
  sut: MqPublishDataToReprocessing;
  publishInQueueServiceStub: PublishInQueueServiceStub;
};

const makeSut = (): SutTypes => {
  const publishInQueueServiceStub = new PublishInQueueServiceStub();
  const sut = new MqPublishDataToReprocessing(publishInQueueServiceStub);

  return { sut, publishInQueueServiceStub };
};

describe('MqPublishDataToReprocessing UseCase', () => {
  it('Should call publishInQueue witch correct values', async () => {
    const { sut, publishInQueueServiceStub } = makeSut();

    const publishInQueue = jest.spyOn(
      publishInQueueServiceStub,
      'publishInQueue'
    );

    const params = [
      {
        reprocessingId: 'any_reprocessingId',
        reprocessing: {},
        queue: 'any_queue'
      }
    ];

    sut.publish(params);

    expect(publishInQueue).toHaveBeenCalledWith('any_queue', {
      reprocessing: {}
    });
  });
});
