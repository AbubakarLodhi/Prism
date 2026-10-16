import { NextResponse } from "next/server";
import { generateImageViaGemini } from "@/lib/gemini-server";

export async function POST(request: Request) {
  try {
    const { prompt, sourceImageUrl } = (await request.json()) as {
      prompt: string;
      sourceImageUrl?: string;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const url = await generateImageViaGemini(prompt, sourceImageUrl);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("generate-image failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
