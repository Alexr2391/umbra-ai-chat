
import { ROLES } from "@/constants";
import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { MODEL, SYSTEM_PROMPT } from "./constants";

async function buildSystemPrompt(email: string | null | undefined): Promise<string> {
  if (!email) return SYSTEM_PROMPT;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) return SYSTEM_PROMPT;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("personal_info, agent_tone, memos")
    .eq("user_id", user.id)
    .single();

  if (!prefs) return SYSTEM_PROMPT;

  const extras: string[] = [];
  if (prefs.personal_info) extras.push(`--- User Context ---\n${prefs.personal_info}`);
  if (prefs.agent_tone) extras.push(`--- Behavior Customization ---\n${prefs.agent_tone}`);
  const memos = prefs.memos as string[] | null;
  if (memos && memos.length > 0) {
    extras.push(`--- Remember about this user ---\n${memos.join("\n")}`);
  }

  return extras.length > 0 ? `${SYSTEM_PROMPT}\n\n${extras.join("\n\n")}` : SYSTEM_PROMPT;
}

export async function POST(req: NextRequest) {
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
