import { NextResponse } from "next/server";
import { generateVideoViaGemini } from "@/lib/gemini-server";

export async function POST(request: Request) {
  try {
    const { prompt, sourceImageUrl, durationSeconds } = (await request.json()) as {
      prompt: string;
      sourceImageUrl?: string;
      durationSeconds?: number;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const url = await generateVideoViaGemini(prompt, sourceImageUrl, durationSeconds ?? 4);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("generate-video failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video generation failed" },
      { status: 500 }
    );
  }
}
