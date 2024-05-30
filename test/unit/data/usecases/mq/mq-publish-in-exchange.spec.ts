import { MqPublishInExchange } from '@/data/usecases/mq';
import { PublishInExchangeServiceStub } from '@/test/unit/data/protocols';

type SutTypes = {
  sut: MqPublishInExchange;
  publishInExchangeServiceStub: PublishInExchangeServiceStub;
};

const makeSut = (): SutTypes => {
  const publishInExchangeServiceStub = new PublishInExchangeServiceStub();
  const sut = new MqPublishInExchange(publishInExchangeServiceStub);

  return { sut, publishInExchangeServiceStub };
};

describe('MqPublishInExchange UseCase', () => {
  it('Should call PublishInExchangeService once', async () => {
    const { sut, publishInExchangeServiceStub } = makeSut();

    const publishInExchangeSpy = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );

    sut.publish({
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      value: { id: 'id' }
    });

    const expected = ['any_exchange', { id: 'id' }, 'any_routing_key'];
    expect(publishInExchangeSpy).toHaveBeenCalledWith(...expected);
  });

  it('Should call PublishInExchangeService three times', async () => {
    const { sut, publishInExchangeServiceStub } = makeSut();

    const publishInExchangeSpy = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );

    sut.publish({
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      value: [{ id: 'id_1' }, { id: 'id_2' }]
    });

    const expected = ['any_exchange', { id: 'id_1' }, 'any_routing_key'];
    const expected2 = ['any_exchange', { id: 'id_2' }, 'any_routing_key'];
    expect(publishInExchangeSpy).toHaveBeenNthCalledWith(1, ...expected);
    expect(publishInExchangeSpy).toHaveBeenNthCalledWith(2, ...expected2);
  });

  it('Should not call PublishInExchangeService when values is a empty array', async () => {
    const { sut, publishInExchangeServiceStub } = makeSut();

    const publishInExchangeSpy = jest.spyOn(
      publishInExchangeServiceStub,
      'publishInExchange'
    );

    sut.publish({
      exchange: 'any_exchange',
      routingKey: 'any_routing_key',
      value: []
    });

    expect(publishInExchangeSpy).not.toHaveBeenCalled();
  });
});
