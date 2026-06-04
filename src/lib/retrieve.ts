import { ChromaClient } from "chromadb";

export async function retrieveVectors(
  queryEmbeddings: number[][],
  topK: number 
) {
  const client = new ChromaClient({
  path: "http://localhost:8000",
});

  const collection = await client.getOrCreateCollection({
    name: "pdf_collection",
    embeddingFunction: null,
  });

  const results = await collection.query({
    queryEmbeddings,
    nResults: topK,
  });//ek hi form of results hota hai chromadb object ka usi me return ayega
console.log(results);
  return results;
}