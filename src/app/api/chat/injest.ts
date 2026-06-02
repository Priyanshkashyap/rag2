import fs from "fs";
import path from "path";

import { loadPdf } from "@/src/lib/loadPdf";
import { chunk } from "@/src/lib/chunk";
import { embeddings } from "@/src/lib/embeddings";
import { storeVectors } from "@/src/lib/vector";

export async function ingestDocuments() {
  try {
    // loadPdf returns an array of strings (one per PDF)
    const texts = await loadPdf();

    const allDocs = [] as any[]; // Document[] from chunk.ts

    for (const text of texts) {
      const docs = await chunk(text); // chunk expects a single string
      allDocs.push(...docs); //allDocs.push(...docs), which spreads the inner array into allDocs — producing a single Document[].
    }

    if (allDocs.length === 0) {
      console.warn("No documents found to ingest.");
      return null;
    }

    // create embeddings for all chunks/documents
    const vectors = await embeddings(allDocs as any);

    // store docs + vectors into chroma
    const collection = await storeVectors(allDocs as any, vectors);

    return collection;
  } catch (err) {
    console.error("Failed to ingest documents:", err);
    throw err;
  }
}