import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';

type Params = { url: string; request: object; response: object };

export const createHttpRequestLog = async (params: Params): Promise<void> => {
  const inputAndOutputLogRepository = new InputAndOutputLogRepository();
  await inputAndOutputLogRepository.create({ type: 'HTTP', ...params });
};
