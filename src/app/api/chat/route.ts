import OpenAI from "openai";
import { Document } from "@langchain/core/documents";

import { embeddings } from "@/src/lib/embeddings";
import { retrieveVectors } from "@/src/lib/retrieve";
import { ingestDocuments } from "./injest";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

    // EMBED QUERY
    const queryEmbedding = await embeddings([
      new Document({ pageContent: query }),
    ]);

    // RETRIEVE DOCUMENTS
    const results = await retrieveVectors(queryEmbedding, 5);
    const retrieved = results?.documents?.[0] || [];

    // BUILD CONTEXT
    const context =
      Array.isArray(retrieved) && retrieved.length > 0
        ? retrieved.join("\n\n---\n\n")
        : String(retrieved);

    // GENERATE RESPONSE
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Use the retrieved context to answer the question. If the answer is not present, say you don't know.",
        },
        ...history,
        {
          role: "user",
          content: `Question:\n${query}\n\nContext:\n${context}`,
        },
      ],
    });

    const answer = (completion as any)?.choices?.[0]?.message?.content ?? "";

    return Response.json({ answer, sources: retrieved });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}