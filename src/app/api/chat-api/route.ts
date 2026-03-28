import type { NextRequest } from "next/server";

const MODEL = "llama-3.1-8b-instant";
const SYSTEM_PROMPT = "You are a helpful assistant.";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    console.error("Chat API error:", data.error?.message ?? data);
    return new Response(null, { status: res.status });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
