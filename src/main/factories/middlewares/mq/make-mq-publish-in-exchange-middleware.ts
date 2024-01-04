import { MqPublishInExchangeMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler, makeMqPublishInExchange } from '../../usecases';

type FactoryParams = {
  routingKey: string;
  exchange: string;
  context: 'PUBLISH_EXAMPLE';
};

export const makeMqPublishInExchangeMiddleware = ({
  context,
  exchange,
  routingKey
}: FactoryParams) => {
  const extractValuesSchema = {
    PUBLISH_EXAMPLE: ['state.publishExample']
  };
  const extractValue = extractValuesSchema[context];
  return new MqPublishInExchangeMiddleware(
    {
      exchange,
      routingKey
    },
    makeMqPublishInExchange(),
    makeErrorHandler(),
    logger,
    extractValue
  );
};
