import { NextResponse } from "next/server";
import { generateVoiceoverViaGemini } from "@/lib/gemini-server";

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const url = await generateVoiceoverViaGemini(text);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("generate-voiceover failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voiceover generation failed" },
      { status: 500 }
    );
  }
}
