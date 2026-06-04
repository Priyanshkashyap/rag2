
import { client } from "./groq";
export async function compare( query:string,context:any,history:any) {
  try {
    
    // GENERATE RESPONSE
    const completion = await client.chat.completions.create({
      model:  "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "you need to do exactly what the questions says using the context.",
        },
        ...history,
        {
          role: "user",
          content: `Question:\n${query}\n\nContext:\n${context}`,
        },
      ],
    });

    const answer = (completion as any)?.choices?.[0]?.message?.content ?? "";
    
    return Response.json({ answer });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}