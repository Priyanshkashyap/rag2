import { ChromaClient } from "chromadb";
import { Document } from "@langchain/core/documents";

export async function storeVectors(
  docs: Document[],
  vectors: number[][]
) {

  const client = new ChromaClient({
    host: "localhost",
    port: 8000,
  });

  const collection =
    await client.getOrCreateCollection({
      name: "pdf_collection",
      embeddingFunction: null,
    });

  await collection.add({ // format of chromadb object
    ids: docs.map(
      (_, index) => `doc_${index}`
    ),

    embeddings: vectors,

    documents: docs.map(
      (doc) => doc.pageContent
    ),
  });

  return collection;
}