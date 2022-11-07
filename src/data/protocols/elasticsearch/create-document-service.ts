export interface CreateDocumentService {
  create(params: CreateDocumentService.Params): CreateDocumentService.Result;
}

export namespace CreateDocumentService {
  export type Params = {
    id?: string;
    index: string;
    data: Record<string, unknown>;
  };
  export type Result = Promise<{
    id: string;
  }>;
}
