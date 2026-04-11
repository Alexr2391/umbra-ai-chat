import { ROLES, MODEL } from "@/constants";
import { groq } from "@/lib/groq";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/utils/ai/buildSystemPrompt";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();

    const session = await auth();
    const systemPrompt = await buildSystemPrompt(session?.user?.email);

    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: ROLES.SYSTEM, content: systemPrompt },
        ...(history ?? []),
        { role: ROLES.USER, content: prompt },
      ],
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[chat-api] Stream error:", err);
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat-api] POST failed:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
