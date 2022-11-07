export interface GetDocumentByIdService {
  getById(params: GetDocumentByIdService.Params): GetDocumentByIdService.Result;
}

export namespace GetDocumentByIdService {
  export type Params = { id: string; index: string };
  export type Result = Promise<unknown>;
}
