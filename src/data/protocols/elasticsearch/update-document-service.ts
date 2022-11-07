export interface UpdateDocumentService {
  update(params: UpdateDocumentService.Params): UpdateDocumentService.Result;
}

export namespace UpdateDocumentService {
  export type Params = {
    id: string;
    index: string;
    data: Record<string, unknown>;
  };
  export type Result = Promise<{
    id: string;
  }>;
}
