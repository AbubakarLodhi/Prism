import { ApiError, GoogleGenAI, type Part } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenAI({ apiKey });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini returns 503 (model overloaded) and sometimes 429 (transient rate
 * limit) errors that clear up on their own within a few seconds. Retry those
 * with backoff instead of failing the whole request on the first hiccup.
 */
export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof ApiError && (error.status === 503 || error.status === 429);
      if (!retryable || attempt === attempts - 1) throw error;
      await delay(500 * 2 ** attempt);
    }
  }

  throw lastError;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatProjectContext {
  title?: string;
  brief?: string;
  tone?: string;
  script?: string;
  prompt?: string;
}

/** Streams a chat reply from Gemini, yielding text chunks as they arrive. */
export async function* streamChatViaGemini(
  history: ChatTurn[],
  project?: ChatProjectContext
): AsyncGenerator<string> {
  const ai = getGeminiClient();

  const contextLine = project
    ? `Current project context — title: "${project.title ?? "untitled"}", tone: ${
        project.tone ?? "unspecified"
      }. Brief: ${project.brief || "(none)"}. Script: ${
        project.script || "(none yet)"
      }. Video prompt: ${project.prompt || "(none yet)"}.`
    : "No project is currently open.";

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: turn.content }],
  }));

  const stream = await withGeminiRetry(() =>
    ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: `You are the creative co-pilot inside Prism, an AI studio for generating video, image, and prompt content. Help the user refine briefs, scripts, and video-generation prompts, and suggest concrete next steps they can take in the app. Be concise and practical.\n\n${contextLine}`,
        maxOutputTokens: 2048,
      },
    })
  );

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([a-zA-Z]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

/** Parses any data URL (image/video/audio) into a Gemini inlineData Part. */
export function dataUrlToPart(dataUrl: string): Part | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  return { inlineData: { mimeType: parsed.mimeType, data: parsed.data } };
}

const ALLOWED_VIDEO_DURATIONS = [4, 6, 8];

export async function generateVideoViaGemini(
  prompt: string,
  sourceImageDataUrl: string | undefined,
  durationSeconds: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  const ai = getGeminiClient();

  const duration = ALLOWED_VIDEO_DURATIONS.includes(durationSeconds) ? durationSeconds : 4;

  const image = sourceImageDataUrl ? parseDataUrl(sourceImageDataUrl) : null;
  if (sourceImageDataUrl && !image) {
    throw new Error("sourceImageUrl must be a base64 image data URL");
  }

  let operation = await withGeminiRetry(() =>
    ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      source: {
        prompt: prompt || "Subtle cinematic motion, gentle camera movement",
        ...(image ? { image: { imageBytes: image.data, mimeType: image.mimeType } } : {}),
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: "16:9",
        durationSeconds: duration,
      },
    })
  );

  const maxAttempts = 30;
  for (let attempt = 0; !operation.done && attempt < maxAttempts; attempt++) {
    await delay(10000);
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (!operation.done) {
    throw new Error("Video generation timed out");
  }
  if (operation.error) {
    throw new Error(String(operation.error.message ?? "Video generation failed"));
  }

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) {
    throw new Error("Gemini did not return a video");
  }

  if (video.videoBytes) {
    return `data:${video.mimeType ?? "video/mp4"};base64,${video.videoBytes}`;
  }

  if (video.uri) {
    const separator = video.uri.includes("?") ? "&" : "?";
    const res = await fetch(`${video.uri}${separator}key=${apiKey}`);
    if (!res.ok) {
      throw new Error(`Failed to download generated video (${res.status})`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const downloadedMimeType = res.headers.get("content-type") ?? video.mimeType ?? "video/mp4";
    return `data:${downloadedMimeType};base64,${buffer.toString("base64")}`;
  }

  throw new Error("Gemini did not return video data or a URI");
}

/** Wraps raw PCM audio (what Gemini TTS returns) in a WAV header so browsers can play it. */
function pcmToWav(pcmData: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmData.length, 40);

  return Buffer.concat([header, pcmData]);
}

export async function generateVoiceoverViaGemini(text: string): Promise<string> {
  const ai = getGeminiClient();

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    })
  );

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const audioPart = parts.find((part) => part.inlineData?.data);

  if (!audioPart?.inlineData?.data) {
    throw new Error("Gemini did not return audio data");
  }

  const mimeType = audioPart.inlineData.mimeType ?? "audio/L16;rate=24000";
  const rateMatch = mimeType.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;

  const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
  const wavBuffer = pcmToWav(pcmBuffer, sampleRate, 1, 16);

  return `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
}
