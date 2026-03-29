
import { ROLES } from "@/constants";
import { groq } from "@/lib/groq";
import type { NextRequest } from "next/server";
import { MODEL, SYSTEM_PROMPT } from "./constants";

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: ROLES.SYSTEM, content: SYSTEM_PROMPT },
      ...(history ?? []),
      { role: ROLES.USER, content: prompt },
    ],
    max_tokens: 1024,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
