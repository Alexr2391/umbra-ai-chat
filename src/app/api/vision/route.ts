import { groq } from "@/lib/groq";
import type { NextRequest } from "next/server";

const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const EXTRACTION_PROMPT = `Analyze this image in detail. Extract and describe:
- All text visible in the image, reproduced verbatim
- Visual layout, structure, and design elements
- Colors, shapes, and spatial relationships
- Any charts, graphs, diagrams, tables, or data visualizations
- The likely purpose or context of the image

Be comprehensive and precise — this description will serve as the sole text reference for follow-up questions about this image.`;

export async function POST(req: NextRequest) {
  const { imageDataUrl } = await req.json();

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
}
