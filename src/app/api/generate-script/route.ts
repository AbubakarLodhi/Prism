import { NextResponse } from "next/server";
import type { Part } from "@google/genai";
import { dataUrlToPart, getGeminiClient, withGeminiRetry } from "@/lib/gemini-server";

interface RequestBody {
  brief: string;
  tone: string;
  brandSettings?: { brandName: string; toneOfVoice: string };
  references?: string[];
  referenceVideo?: string;
  referenceAudio?: string;
}

interface ScriptResult {
  script: string;
  prompt: string;
}

function extractResult(text: string): ScriptResult {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    const parsed = JSON.parse(candidate);
    if (typeof parsed.script === "string" && typeof parsed.prompt === "string") {
      return parsed;
    }
  } catch {
    // fall through to regex salvage below
  }

  const scriptMatch = candidate.match(/"script"\s*:\s*"([\s\S]*?)"\s*,\s*"prompt"/);
  const promptMatch = candidate.match(/"prompt"\s*:\s*"([\s\S]*?)"\s*}?\s*$/);

  if (scriptMatch && promptMatch) {
    return {
      script: scriptMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
      prompt: promptMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
    };
  }

  throw new Error("Model returned malformed JSON and no script could be recovered");
}

export async function POST(request: Request) {
  try {
    const { brief, tone, brandSettings, references, referenceVideo, referenceAudio } =
      (await request.json()) as RequestBody;

    const ai = getGeminiClient();

    const mediaParts: Part[] = [];
    if (referenceVideo) {
      const part = dataUrlToPart(referenceVideo);
      if (part) mediaParts.push(part);
    }
    for (const ref of (references ?? []).slice(0, 5)) {
      const part = dataUrlToPart(ref);
      if (part) mediaParts.push(part);
    }
    if (referenceAudio) {
      const part = dataUrlToPart(referenceAudio);
      if (part) mediaParts.push(part);
    }

    const brandLine = brandSettings
      ? `Brand: ${brandSettings.brandName}. Brand tone of voice: ${brandSettings.toneOfVoice}.`
      : "";

    const referenceInstruction = referenceVideo
      ? "A reference VIDEO is attached. Watch it closely — note its subject, pacing, camera movement, mood, and story beats. The script and prompt you write must be directly inspired by and consistent with what happens in that video."
      : references?.length
        ? "Reference image(s) are attached. Identify the exact subject/product shown and build the script and prompt around it."
        : "No reference media was attached; invent a subject consistent with the brief.";

    const textPrompt = `${brandLine}
Requested tone for this project: ${tone}.
Project brief: ${brief || "(no brief provided, infer from reference media)"}.

${referenceInstruction}

Write exactly two things:
1. "script": a short spoken-word narration/voiceover script (2-4 sentences) that could be read aloud over the video. Natural, conversational, on-brand.
2. "prompt": one detailed, production-ready video-generation prompt describing the subject, setting, camera movement, lighting, and mood for a single cohesive video clip — not a list of shots, just one rich paragraph.

Respond with ONLY a JSON object, no prose, no markdown fences, matching this shape:
{"script": string, "prompt": string}`;

    const response = await withGeminiRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [...mediaParts, { text: textPrompt }],
          },
        ],
        config: {
          systemInstruction:
            "You are a creative director writing a video concept from reference media. You always respond with strict, parseable JSON and nothing else.",
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
        },
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error("No text response from model");
    }

    const result = extractResult(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-script failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Script generation failed" },
      { status: 500 }
    );
  }
}
