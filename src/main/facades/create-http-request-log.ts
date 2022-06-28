import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { LOGGER } from '@/util';

type Params = { url: string; request: object; response: object };

export const createHttpRequestLog = async (params: Params): Promise<void> => {
  if (!LOGGER.DATABASE.ENABLED) return;
  const inputAndOutputLogRepository = new InputAndOutputLogRepository();
  await inputAndOutputLogRepository.create({ type: 'HTTP', ...params });
};
