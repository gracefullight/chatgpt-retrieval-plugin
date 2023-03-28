import { Document, DocumentMetadataFilter, Query, QueryResult } from './models';

export interface UpsertRequest {
  documents: Document[];
}

export interface UpsertResponse {
  ids: string[];
}

export interface QueryRequest {
  queries: Query[];
}

export interface QueryResponse {
  results: QueryResult[];
}

export interface DeleteRequest {
  ids?: string[];
  filter?: DocumentMetadataFilter;
  delete_all?: boolean;
}

export interface DeleteResponse {
  success: boolean;
}
