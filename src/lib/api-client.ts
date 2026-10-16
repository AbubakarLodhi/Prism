import type { BrandSettings, ChatMessage } from "@/lib/types";

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error ?? `Request to ${url} failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

/**
 * API client — components should only import from this module for AI
 * operations. Real generation happens server-side in src/app/api/*.
 */
export async function generateScript(
  images: File[],
  referenceVideoFile: File | null,
  referenceAudioFile: File | null,
  brief: string,
  tone: string,
  brandSettings?: BrandSettings
): Promise<{ script: string; prompt: string }> {
  const [references, referenceVideo, referenceAudio] = await Promise.all([
    Promise.all(images.map(fileToDataUrl)),
    referenceVideoFile ? fileToDataUrl(referenceVideoFile) : Promise.resolve(undefined),
    referenceAudioFile ? fileToDataUrl(referenceAudioFile) : Promise.resolve(undefined),
  ]);

  return postJson<{ script: string; prompt: string }>("/api/generate-script", {
    brief,
    tone,
    brandSettings,
    references,
    referenceVideo,
    referenceAudio,
  });
}

export async function generateVideo(
  prompt: string,
  sourceImageUrl: string | undefined,
  durationSeconds: number
): Promise<{ url: string }> {
  return postJson<{ url: string }>("/api/generate-video", {
    prompt,
    sourceImageUrl,
    durationSeconds,
  });
}

export async function generateImage(
  prompt: string,
  sourceImageUrl?: string
): Promise<{ url: string }> {
  return postJson<{ url: string }>("/api/generate-image", { prompt, sourceImageUrl });
}

export async function generateVoiceover(text: string): Promise<{ url: string }> {
  return postJson<{ url: string }>("/api/generate-voiceover", { text });
}

interface ChatProjectContext {
  title?: string;
  brief?: string;
  tone?: string;
  script?: string;
  prompt?: string;
}

export type ChatAction = {
  action: "generate_video" | "generate_image";
  prompt: string;
};

/**
 * Streams a chat reply token-by-token, invoking onChunk as text arrives, or
 * onAction once if the model decided to trigger real video/image generation.
 * `history` should include the new user message as its last entry.
 */
export async function streamChatReply(
  history: Pick<ChatMessage, "role" | "content">[],
  project: ChatProjectContext | undefined,
  onChunk: (chunk: string) => void,
  onAction?: (action: ChatAction) => void
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, project }),
  });

  if (!res.ok || !res.body) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error ?? `Chat request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    let event: { type: "text"; text: string } | ChatAction & { type: "action" };
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }
    if (event.type === "text") onChunk(event.text);
    else if (event.type === "action") onAction?.(event);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      handleLine(buffer.slice(0, newlineIndex));
      buffer = buffer.slice(newlineIndex + 1);
    }
  }
  handleLine(buffer);
}
