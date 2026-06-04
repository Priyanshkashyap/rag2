import OpenAI from "openai";
import { Document } from "@langchain/core/documents";

import { embeddings } from "@/src/lib/embeddings";
import { retrieveVectors } from "@/src/lib/retrieve";
import { ingestDocuments } from "./injest";
import { summarise } from "@/src/lib/summarise";
import { compare } from "@/src/lib/compare";
import { answer} from "@/src/lib/answer";

// Trigger ingestion once at module load (runs in background, non-blocking)
ingestDocuments()
  .then(() => {
    console.log("Ingestion finished");
  })
  .catch((err) => {
    console.error("Ingestion failed:", err);
  });

export async function POST(req: Request) {
  try {
    const { query, history = [] } = await req.json();

    if (!query) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }
    //no chunking needed as query is small only
    //embedding
    const queryEmbedding = await embeddings([
      new Document({ pageContent: query }),
    ]);

    // RETRIEVE DOCUMENTS
    const results = await retrieveVectors(queryEmbedding, 5);
    const retrieved = results?.documents?.[0] || [];// gets first list of k matching results of query from the chromadb 

    // BUILD CONTEXT
    const context =
      Array.isArray(retrieved) && retrieved.length > 0
        ? retrieved.join("\n\n---\n\n")
        : String(retrieved);
    const q = query.toLowerCase();

    if (
    q.includes("summarize")
  ) {
    return summarise(query,context,history);
  }

  if (
    q.includes("compare")
  ) {
    return compare(query,context,history);
  }

  else
  return answer(query,context,history);
}
  catch (err: any) {
    console.error(err);
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
   