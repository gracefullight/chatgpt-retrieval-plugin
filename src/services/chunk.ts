// TODO: class to object interface.
import { get_encoding } from "@dqbd/tiktoken";
import { v4 as uuidv4 } from "uuid";

import { Document, DocumentChunk, DocumentChunkMetadata } from "../models/models";
import { getEmbeddings } from "./openai";

// Global variables
const tokenizer = get_encoding("cl100k_base");

// Constants
const CHUNK_SIZE = 200;
const MIN_CHUNK_SIZE_CHARS = 350;
const MIN_CHUNK_LENGTH_TO_EMBED = 5;
const EMBEDDINGS_BATCH_SIZE = 128;
const MAX_NUM_CHUNKS = 10000;

export function getTextChunks(text: string, chunkTokenSize?: number): string[] {
  if (!text || text.trim() === "") {
    return [];
  }
  const tokens = tokenizer.encode(text, []);
  const chunks: string[] = [];
  const chunkSize = chunkTokenSize || CHUNK_SIZE;
  let numChunks = 0;

  while (tokens.length > 0 && numChunks < MAX_NUM_CHUNKS) {
    const chunk = tokens.slice(0, chunkSize);
    let chunkText = tokenizer.decode(chunk);

    if (!chunkText || chunkText.trim() === "") {
      tokens.splice(0, chunk.length);
      continue;
    }

    const lastPunctuation = Math.max(
      chunkText.lastIndexOf("."),
      chunkText.lastIndexOf("?"),
      chunkText.lastIndexOf("!"),
      chunkText.lastIndexOf("\n")
    );

    if (lastPunctuation !== -1 && lastPunctuation > MIN_CHUNK_SIZE_CHARS) {
      chunkText = chunkText.slice(0, lastPunctuation + 1);
    }

    const chunkTextToAppend = chunkText.replace("\n", " ").trim();

    if (chunkTextToAppend.length > MIN_CHUNK_LENGTH_TO_EMBED) {
      chunks.push(chunkTextToAppend);
    }

    tokens.splice(0, tokenizer.encode(chunkText, []).length);
    numChunks++;
  }

  if (tokens.length > 0) {
    const remainingText = tokenizer.decode(tokens).replace("\n", " ").trim();
    if (remainingText.length > MIN_CHUNK_LENGTH_TO_EMBED) {
      chunks.push(remainingText);
    }
  }

  return chunks;
}

export function createDocumentChunks(
  doc: Document,
  chunkTokenSize?: number
): [DocumentChunk[], string] {
  if (!doc.text || doc.text.trim() === "") {
    return [[], doc.id || uuidv4()];
  }
  const docId = doc.id || uuidv4();
  const textChunks = getTextChunks(doc.text, chunkTokenSize);
  const metadata = doc.metadata
    ? new DocumentChunkMetadata({ ...doc.metadata })
    : new DocumentChunkMetadata();

  metadata.documentId = docId;
  const docChunks: DocumentChunk[] = [];

  textChunks.forEach((textChunk, i) => {
    const chunkId = `${docId}_${i}`;
    const docChunk = new DocumentChunk(chunkId, textChunk, metadata);
    docChunks.push(docChunk);
  });

  return [docChunks, docId];
}

export async function getDocumentChunks(
  documents: Document[],
  chunkTokenSize?: number
): Record<string, DocumentChunk[]> {
  const chunks: Record<string, DocumentChunk[]> = {};
  const allChunks: DocumentChunk[] = [];
  documents.forEach((doc) => {
    const [docChunks, docId] = createDocumentChunks(doc, chunkTokenSize);
    allChunks.push(...docChunks);
    chunks[docId] = docChunks;
  });

  if (allChunks.length === 0) {
    return {};
  }

  const embeddings: number[][] = [];

  for (let i = 0; i < allChunks.length; i += EMBEDDINGS_BATCH_SIZE) {
    const batchTexts = allChunks
      .slice(i, i + EMBEDDINGS_BATCH_SIZE)
      .map((chunk) => chunk.text);

    const batchEmbeddings = await getEmbeddings(batchTexts);
    embeddings.push(...batchEmbeddings);
  }

  allChunks.forEach((chunk, i) => {
    chunk.embedding = embeddings[i];
  });

  return chunks;
}
