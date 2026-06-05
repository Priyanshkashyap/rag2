import { client } from "./groq";

export async function compare(
  query: string,
  context: any,
  history: any
) {
  try {

    // AGENT 1 -> factual/context agent
    const factualAgent = client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a factual RAG assistant. Answer ONLY using the provided context. Extract the most relevant information carefully.",
        },
        ...history,
        {
          role: "user",
          content: `Question:\n${query}\n\nContext:\n${context}`,
        },
      ],
    });

    // AGENT 2 -> reasoning/summarizer agent
    const reasoningAgent = client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a reasoning assistant. Explain the answer clearly, step-by-step, and make it easy to understand.",
        },
        ...history,
        {
          role: "user",
          content: `Question:\n${query}\n\nContext:\n${context}`,
        },
      ],
    });

    // RUN BOTH IN PARALLEL
    const [factualResponse, reasoningResponse] = await Promise.all([
      factualAgent,
      reasoningAgent,
    ]);

    // EXTRACT OUTPUTS
    const factualAnswer =
      (factualResponse as any)?.choices?.[0]?.message?.content ?? "";

    const reasoningAnswer =
      (reasoningResponse as any)?.choices?.[0]?.message?.content ?? "";

    // FINAL MERGED RESPONSE
    const finalAnswer = `
===== FACTUAL ANSWER =====
${factualAnswer}

===== REASONED EXPLANATION =====
${reasoningAnswer}
`;

    return Response.json({
      answer: finalAnswer,
    });

  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        error: err.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}