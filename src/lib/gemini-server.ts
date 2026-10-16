import { ApiError, GoogleGenAI, Type, type Part, type Tool } from "@google/genai";

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

export type ChatStreamEvent =
  | { type: "text"; text: string }
  | { type: "action"; action: "generate_video" | "generate_image"; prompt: string };

const CHAT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "generate_video",
        description:
          "Generate a short AI video clip for the current project. Call this when the user explicitly asks to create, generate, or make a video — not when they're just brainstorming or asking questions.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            prompt: {
              type: Type.STRING,
              description:
                "One rich, detailed, production-ready video-generation prompt describing the subject, setting, camera movement, lighting, and mood as a single cohesive paragraph — written by you from the user's request and the project context, not a copy of the user's raw message.",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "generate_image",
        description:
          "Generate a still AI image for the current project. Call this when the user explicitly asks to create, generate, or make an image or picture — not when they're just brainstorming or asking questions.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            prompt: {
              type: Type.STRING,
              description:
                "One rich, detailed image-generation prompt describing the subject, setting, lighting, and style — written by you from the user's request and the project context, not a copy of the user's raw message.",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  },
];

/** Streams a chat reply from Gemini, yielding text chunks as they arrive, or a
 * single action event if the user asked it to actually generate a video/image. */
export async function* streamChatViaGemini(
  history: ChatTurn[],
  project?: ChatProjectContext
): AsyncGenerator<ChatStreamEvent> {
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
        systemInstruction: `You are the creative co-pilot inside Prism, an AI studio for generating video, image, and prompt content. Help the user refine briefs, scripts, and video-generation prompts, and suggest concrete next steps they can take in the app. Be concise and practical.\n\nYou can also trigger real generation yourself via the generate_video and generate_image tools. Use one of them whenever the user clearly asks you to generate/create/make a video or image, instead of just describing what you would do. Only call a tool when there's a project open.\n\n${contextLine}`,
        maxOutputTokens: 2048,
        tools: project ? CHAT_TOOLS : undefined,
      },
    })
  );

  for await (const chunk of stream) {
    const call = chunk.functionCalls?.[0];
    if (call && (call.name === "generate_video" || call.name === "generate_image")) {
      const prompt = typeof call.args?.prompt === "string" ? call.args.prompt.trim() : "";
      if (prompt) {
        yield { type: "action", action: call.name, prompt };
        return;
      }
    }
    if (chunk.text) yield { type: "text", text: chunk.text };
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

  return withEmptyMediaRetry(async () => {
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
      const reasons = operation.response?.raiMediaFilteredReasons;
      // Veo's RAI filtering isn't deterministic run-to-run for the same
      // prompt (the same request has succeeded and failed back to back in
      // testing), so these are worth retrying rather than failing outright.
      throw reasons?.length
        ? new EmptyMediaError(`Gemini blocked this video: ${reasons.join("; ")}`, true)
        : new EmptyMediaError(
            "Gemini did not return a video (no reason given — this happens intermittently with preview models)",
            true
          );
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
  }, 3);
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

/** Thrown when Gemini's response has no usable media part. `transient` is
 * true when there's no explicit block/finish reason — in practice this
 * happens intermittently with preview models and clears up on retry. */
class EmptyMediaError extends Error {
  constructor(message: string, public transient: boolean) {
    super(message);
  }
}

/** Finish reasons that mean the content genuinely violated a policy — not
 * worth retrying, since the same prompt will likely be blocked again. Every
 * other non-STOP reason (e.g. NO_IMAGE, OTHER) is a vague "something didn't
 * work" signal that has been observed to succeed on a plain retry. */
const HARD_BLOCK_FINISH_REASONS = new Set([
  "SAFETY",
  "RECITATION",
  "BLOCKLIST",
  "PROHIBITED_CONTENT",
  "SPII",
  "IMAGE_SAFETY",
  "IMAGE_PROHIBITED_CONTENT",
]);

/** Builds a useful error when Gemini returns a response with no usable media
 * part, by surfacing the actual block/finish reason instead of a generic
 * "did not return data" message. */
function describeEmptyGeminiResponse(response: {
  promptFeedback?: { blockReason?: string; blockReasonMessage?: string };
  candidates?: { finishReason?: string }[];
}): EmptyMediaError {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    return new EmptyMediaError(
      `Gemini blocked this request: ${blockReason}${
        response.promptFeedback?.blockReasonMessage ? ` — ${response.promptFeedback.blockReasonMessage}` : ""
      }`,
      false
    );
  }
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    return new EmptyMediaError(
      `Gemini stopped without returning media: ${finishReason}`,
      !HARD_BLOCK_FINISH_REASONS.has(finishReason)
    );
  }
  return new EmptyMediaError(
    "Gemini did not return media data (no reason given — this happens intermittently with preview models)",
    true
  );
}

/** Retries a generation attempt when it fails with a transient empty-media
 * result (no explicit block/finish reason). Does not retry explicit blocks
 * or real API errors — those are already handled by withGeminiRetry. */
async function withEmptyMediaRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof EmptyMediaError && error.transient;
      if (!retryable || attempt === attempts - 1) throw error;
    }
  }

  throw lastError;
}

/**
 * Image generation via Gemini's free-tier-friendly "nano-banana" model
 * (gemini-2.5-flash-image), as a free alternative to paid Imagen/Veo for
 * when a static image is enough.
 */
export async function generateImageViaGemini(
  prompt: string,
  sourceImageDataUrl?: string
): Promise<string> {
  const ai = getGeminiClient();

  const sourcePart = sourceImageDataUrl ? dataUrlToPart(sourceImageDataUrl) : null;
  const parts: Part[] = sourcePart ? [sourcePart, { text: prompt }] : [{ text: prompt }];

  return withEmptyMediaRetry(async () => {
    const response = await withGeminiRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["IMAGE"],
        },
      })
    );

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((part) => part.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      throw describeEmptyGeminiResponse(response);
    }

    const mimeType = imagePart.inlineData.mimeType ?? "image/png";
    return `data:${mimeType};base64,${imagePart.inlineData.data}`;
  });
}

export async function generateVoiceoverViaGemini(text: string): Promise<string> {
  const ai = getGeminiClient();

  return withEmptyMediaRetry(async () => {
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
      throw describeEmptyGeminiResponse(response);
    }

    const mimeType = audioPart.inlineData.mimeType ?? "audio/L16;rate=24000";
    const rateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;

    const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, sampleRate, 1, 16);

    return `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
  });
}
