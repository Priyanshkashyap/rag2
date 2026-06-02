import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";

export async function embeddings(
  docs: Document[]
): Promise<number[][]> {

  const emb = new OllamaEmbeddings({
    model: "nomic-embed-text",
  });

  // extract text from documents
  const texts = docs.map(
    (doc) => doc.pageContent
  );

  // create embeddings
  const vectors =
    await emb.embedDocuments(texts);

  console.log(vectors);

  return vectors;
}