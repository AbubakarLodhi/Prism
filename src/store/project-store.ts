"use client";

import { del as idbDel, get as idbGet, set as idbSet } from "idb-keyval";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { generateImage, generateScript, generateVideo, generateVoiceover } from "@/lib/api-client";
import type {
  AssetStatus,
  BrandSettings,
  BrandTone,
  GeneratedAsset,
  Project,
  ProjectStatus,
  ReferenceAudio,
  ReferenceImage,
  ReferenceVideo,
} from "@/lib/types";

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Reference media and generated assets are stored as base64 data URLs, which
// can easily exceed localStorage's ~5-10MB quota. IndexedDB has a much larger
// cap, so persist there instead.
const indexedDBStorage: StateStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => idbDel(name),
};

function now() {
  return new Date().toISOString();
}

const DEMO_PROJECT_IDS = new Set([
  "proj-aurora",
  "proj-nova",
  "proj-drift",
]);

const DEFAULT_SETTINGS: BrandSettings = {
  brandName: "Prism",
  toneOfVoice:
    "Warm, sharp, and conversion-minded. Sound like a confident brand marketer.",
  primaryColor: "#db2777",
  logoUrl: undefined,
};

interface ProjectStore {
  projects: Project[];
  brandSettings: BrandSettings;
  searchQuery: string;

  setSearchQuery: (query: string) => void;
  setBrandSettings: (settings: Partial<BrandSettings>) => void;

  getProject: (id: string) => Project | undefined;
  createProject: (input: {
    title: string;
    brief: string;
    tone: BrandTone;
    references: ReferenceImage[];
    referenceVideo?: ReferenceVideo;
    referenceAudio?: ReferenceAudio;
  }) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;

  addReferences: (projectId: string, refs: ReferenceImage[]) => void;
  removeReference: (projectId: string, refId: string) => void;
  setReferenceVideo: (projectId: string, video: ReferenceVideo | undefined) => void;
  setReferenceAudio: (projectId: string, audio: ReferenceAudio | undefined) => void;
  setDuration: (projectId: string, seconds: number) => void;
  updateScript: (projectId: string, patch: { script?: string; prompt?: string }) => void;

  generateProjectScript: (
    projectId: string,
    images: File[],
    referenceVideoFile: File | null,
    referenceAudioFile: File | null,
    brief: string,
    tone: string
  ) => Promise<void>;
  generateProjectVideo: (projectId: string) => Promise<void>;
  generateProjectImage: (projectId: string) => Promise<void>;
  generateProjectVoiceover: (projectId: string) => Promise<void>;
}

function touchProject(project: Project, patch: Partial<Project>): Project {
  return { ...project, ...patch, updatedAt: now() };
}

function computeStatus(videoStatus: AssetStatus): ProjectStatus {
  if (videoStatus === "done") return "complete";
  if (videoStatus === "generating") return "generating";
  return "draft";
}

/**
 * Projects persisted before the single-script model (v1, shot-list based)
 * won't have script/prompt/durationSeconds/videoStatus fields. Fill in safe
 * defaults instead of crashing on load.
 */
function migrateProject(raw: unknown): Project {
  const p = raw as Partial<Project> & Record<string, unknown>;
  return {
    id: p.id as string,
    title: (p.title as string) ?? "Untitled Project",
    brief: (p.brief as string) ?? "",
    tone: (p.tone as Project["tone"]) ?? "Minimal",
    status: (p.status as ProjectStatus) ?? "draft",
    createdAt: (p.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (p.updatedAt as string) ?? new Date().toISOString(),
    thumbnail: p.thumbnail as string | undefined,
    references: Array.isArray(p.references) ? p.references : [],
    referenceVideo: p.referenceVideo as Project["referenceVideo"],
    referenceAudio: p.referenceAudio as Project["referenceAudio"],
    script: typeof p.script === "string" ? p.script : "",
    prompt: typeof p.prompt === "string" ? p.prompt : "",
    durationSeconds: typeof p.durationSeconds === "number" ? p.durationSeconds : 6,
    videoResult: p.videoResult as Project["videoResult"],
    videoStatus: (p.videoStatus as AssetStatus) ?? "idle",
    videoError: p.videoError as string | undefined,
    imageResult: p.imageResult as Project["imageResult"],
    imageStatus: (p.imageStatus as AssetStatus) ?? "idle",
    imageError: p.imageError as string | undefined,
    voiceoverResult: p.voiceoverResult as Project["voiceoverResult"],
    voiceoverStatus: (p.voiceoverStatus as AssetStatus) ?? "idle",
    voiceoverError: p.voiceoverError as string | undefined,
  };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      brandSettings: DEFAULT_SETTINGS,
      searchQuery: "",

      setSearchQuery: (query) => set({ searchQuery: query }),

      setBrandSettings: (settings) =>
        set((state) => ({
          brandSettings: { ...state.brandSettings, ...settings },
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      createProject: ({ title, brief, tone, references, referenceVideo, referenceAudio }) => {
        const id = uid("proj");
        const project: Project = {
          id,
          title: title || "Untitled Project",
          brief,
          tone,
          status: "draft",
          createdAt: now(),
          updatedAt: now(),
          thumbnail: references[0]?.url,
          references,
          referenceVideo,
          referenceAudio,
          script: "",
          prompt: "",
          durationSeconds: 6,
          videoStatus: "idle",
          imageStatus: "idle",
          voiceoverStatus: "idle",
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return id;
      },

      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? touchProject(p, patch) : p
          ),
        })),

      addReferences: (projectId, refs) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? touchProject(p, {
                  references: [...p.references, ...refs],
                  thumbnail: p.thumbnail ?? refs[0]?.url,
                })
              : p
          ),
        })),

      removeReference: (projectId, refId) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const references = p.references.filter((r) => r.id !== refId);
            return touchProject(p, {
              references,
              thumbnail: references[0]?.url ?? p.thumbnail,
            });
          }),
        })),

      setReferenceVideo: (projectId, video) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? touchProject(p, { referenceVideo: video }) : p
          ),
        })),

      setReferenceAudio: (projectId, audio) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? touchProject(p, { referenceAudio: audio }) : p
          ),
        })),

      setDuration: (projectId, seconds) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? touchProject(p, { durationSeconds: seconds }) : p
          ),
        })),

      updateScript: (projectId, patch) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? touchProject(p, patch) : p
          ),
        })),

      generateProjectScript: async (
        projectId,
        images,
        referenceVideoFile,
        referenceAudioFile,
        brief,
        tone
      ) => {
        get().updateProject(projectId, { status: "generating" });
        const { script, prompt } = await generateScript(
          images,
          referenceVideoFile,
          referenceAudioFile,
          brief,
          tone,
          get().brandSettings
        );
        get().updateProject(projectId, { script, prompt, brief, status: "draft" });
      },

      generateProjectVideo: async (projectId) => {
        const project = get().getProject(projectId);
        if (!project) return;

        get().updateProject(projectId, {
          videoStatus: "generating",
          videoError: undefined,
          status: "generating",
        });

        try {
          // Text-only: Veo's image-to-video mode anchors heavily on a source
          // image and can largely ignore the text prompt, so we don't pass
          // the reference image here even if one is attached to the project.
          const { url } = await generateVideo(
            project.prompt,
            undefined,
            project.durationSeconds
          );

          const result: GeneratedAsset = {
            id: uid("asset"),
            url,
            type: "video",
            prompt: project.prompt,
            createdAt: now(),
          };

          get().updateProject(projectId, {
            videoResult: result,
            videoStatus: "done",
            status: computeStatus("done"),
            thumbnail: project.thumbnail ?? url,
          });
        } catch (err) {
          get().updateProject(projectId, {
            videoStatus: "error",
            videoError: err instanceof Error ? err.message : "Video generation failed",
            status: "draft",
          });
        }
      },

      generateProjectImage: async (projectId) => {
        const project = get().getProject(projectId);
        if (!project || !project.prompt.trim()) return;

        get().updateProject(projectId, {
          imageStatus: "generating",
          imageError: undefined,
        });

        try {
          const { url } = await generateImage(project.prompt);

          const result: GeneratedAsset = {
            id: uid("asset"),
            url,
            type: "image",
            prompt: project.prompt,
            createdAt: now(),
          };

          get().updateProject(projectId, {
            imageResult: result,
            imageStatus: "done",
            thumbnail: project.thumbnail ?? url,
          });
        } catch (err) {
          get().updateProject(projectId, {
            imageStatus: "error",
            imageError: err instanceof Error ? err.message : "Image generation failed",
          });
        }
      },

      generateProjectVoiceover: async (projectId) => {
        const project = get().getProject(projectId);
        if (!project || !project.script.trim()) return;

        get().updateProject(projectId, {
          voiceoverStatus: "generating",
          voiceoverError: undefined,
        });

        try {
          const { url } = await generateVoiceover(project.script);

          const result: GeneratedAsset = {
            id: uid("asset"),
            url,
            type: "audio",
            prompt: project.script,
            createdAt: now(),
          };

          get().updateProject(projectId, {
            voiceoverResult: result,
            voiceoverStatus: "done",
          });
        } catch (err) {
          get().updateProject(projectId, {
            voiceoverStatus: "error",
            voiceoverError:
              err instanceof Error ? err.message : "Voiceover generation failed",
          });
        }
      },
    }),
    {
      name: "prism-store",
      version: 3,
      storage: createJSONStorage(() => indexedDBStorage),
      migrate: (persistedState) => {
        const state = persistedState as {
          projects?: unknown[];
          brandSettings?: BrandSettings;
        };
        const projects = Array.isArray(state.projects)
          ? state.projects
              .map(migrateProject)
              .filter((p) => !DEMO_PROJECT_IDS.has(p.id))
          : [];
        return {
          ...state,
          projects,
        };
      },
      partialize: (state) => ({
        projects: state.projects.map((p) => ({
          ...p,
          // File objects can't be persisted
          references: p.references.map(({ id, name, url }) => ({ id, name, url })),
          referenceVideo: p.referenceVideo
            ? { id: p.referenceVideo.id, name: p.referenceVideo.name, url: p.referenceVideo.url }
            : undefined,
          referenceAudio: p.referenceAudio
            ? { id: p.referenceAudio.id, name: p.referenceAudio.name, url: p.referenceAudio.url }
            : undefined,
        })),
        brandSettings: state.brandSettings,
      }),
    }
  )
);
