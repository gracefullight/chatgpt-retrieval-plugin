export enum Source {
  email = "email",
  file = "file",
  chat = "chat",
}

export interface DocumentMetadata {
  source?: Source;
  source_id?: string;
  url?: string;
  created_at?: string;
  author?: string;
}

export interface DocumentChunkMetadata extends DocumentMetadata {
  document_id?: string;
}

export interface DocumentChunk {
  id?: string;
  text: string;
  metadata: DocumentChunkMetadata;
  embedding?: number[];
}

export interface DocumentChunkWithScore extends DocumentChunk {
  score: number;
}

export interface Document {
  id?: string;
  text: string;
  metadata?: DocumentMetadata;
}

export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}

export interface DocumentMetadataFilter {
  document_id?: string;
  source?: Source;
  source_id?: string;
  author?: string;
  start_date?: string;
  end_date?: string;
}

export interface Query {
  query: string;
  filter?: DocumentMetadataFilter;
  top_k?: number;
}

export interface QueryWithEmbedding extends Query {
  embedding: number[];
}

export interface QueryResult {
  query: string;
  results: DocumentChunkWithScore[];
}
