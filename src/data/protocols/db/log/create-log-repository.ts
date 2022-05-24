export interface CreateLogRepository {
  create(params: CreateLogRepository.Params): CreateLogRepository.Result;
}

export namespace CreateLogRepository {
  export type Params = {
    level: string;
    [key: string]: any;
  };

  export type Result = Promise<void>;
}
