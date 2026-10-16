export type ProjectStatus = "draft" | "generating" | "complete";
export type AssetStatus = "idle" | "generating" | "done" | "error";
export type BrandTone = "Playful" | "Minimal" | "Luxury" | "Bold" | "Editorial";

export interface ReferenceImage {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface ReferenceVideo {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface ReferenceAudio {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  type: "video" | "audio" | "image";
  prompt: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  tone: BrandTone;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  references: ReferenceImage[];
  referenceVideo?: ReferenceVideo;
  referenceAudio?: ReferenceAudio;

  script: string;
  prompt: string;
  durationSeconds: number;

  videoResult?: GeneratedAsset;
  videoStatus: AssetStatus;
  videoError?: string;

  imageResult?: GeneratedAsset;
  imageStatus: AssetStatus;
  imageError?: string;

  voiceoverResult?: GeneratedAsset;
  voiceoverStatus: AssetStatus;
  voiceoverError?: string;
}

export interface BrandSettings {
  brandName: string;
  toneOfVoice: string;
  primaryColor: string;
  logoUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
