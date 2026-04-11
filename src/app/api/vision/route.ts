import { groq } from "@/lib/groq";
import type { NextRequest } from "next/server";
import { VISION_MODEL, EXTRACTION_PROMPT } from "@/constants";

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl) {
      return new Response(JSON.stringify({ error: "Missing imageDataUrl" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const summary = response.choices[0]?.message?.content ?? "";
    return Response.json({ summary });
  } catch (err) {
    console.error("[vision] POST failed:", err);
    return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
