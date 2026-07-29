"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  FileAudio,
  ImagePlus,
  Loader2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fileToDataUrl } from "@/lib/api-client";
import type { BrandTone, ReferenceImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";

const TONES: BrandTone[] = [
  "Playful",
  "Minimal",
  "Luxury",
  "Bold",
  "Editorial",
];

const DURATIONS = [4, 6, 8];

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);
  const generateProjectScript = useProjectStore((s) => s.generateProjectScript);

  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<BrandTone>("Minimal");
  const [duration, setDuration] = useState(6);
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/")
    );
    if (list.length === 0) return;

    const nextRefs: ReferenceImage[] = await Promise.all(
      list.map(async (file) => ({
        id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url: await fileToDataUrl(file),
        file,
      }))
    );

    setFiles((prev) => [...prev, ...list]);
    setReferences((prev) => [...prev, ...nextRefs]);
  }, []);

  const removeReference = (id: string) => {
    setReferences((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        setFiles((filesPrev) => filesPrev.filter((_, i) => i !== idx));
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const onSelectVideo = async (file?: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoPreviewUrl(await fileToDataUrl(file));
  };

  const onSelectAudio = (file?: File) => {
    if (!file) return;
    setAudioFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const canGenerate = brief.trim() || references.length > 0 || videoFile;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);

    const title =
      brief.trim().slice(0, 48) ||
      `Project ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    const id = createProject({
      title,
      brief: brief.trim(),
      tone,
      references: references.map(({ id: rid, name, url }) => ({
        id: rid,
        name,
        url,
      })),
      referenceVideo:
        videoFile && videoPreviewUrl
          ? { id: `refvid-${Date.now()}`, name: videoFile.name, url: videoPreviewUrl }
          : undefined,
    });

    useProjectStore.getState().setDuration(id, duration);

    try {
      await generateProjectScript(id, files, videoFile, audioFile, brief.trim(), tone);
      router.push(`/project/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Script generation failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-[12.5px] font-medium tracking-wide text-primary uppercase">
          Create
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">
          New project
        </h1>
        <p className="mt-1 text-[14.5px] text-[color:var(--ink-soft)]">
          Upload a reference video, images, or audio and describe what you
          want. We&apos;ll write a script and prompt for one cohesive video.
        </p>
      </div>

      <section className="surface-card space-y-4 p-5">
        <h2 className="text-sm font-semibold">Reference video</h2>
        <p className="text-xs text-[color:var(--ink-faint)]">
          The model watches this video and writes a script + prompt inspired
          by it.
        </p>
        {videoPreviewUrl ? (
          <div className="group relative overflow-hidden rounded-xl border border-border bg-black">
            <video
              src={videoPreviewUrl}
              controls
              className="aspect-video w-full object-contain"
            />
            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setVideoPreviewUrl(null);
              }}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove reference video"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => videoInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-[color:var(--surface-2)] px-6 py-10 text-center transition-colors hover:border-primary/40"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Video className="size-5" />
            </div>
            <p className="text-sm font-medium">Click to upload a reference video</p>
            <p className="text-xs text-[color:var(--ink-faint)]">MP4, MOV, WEBM</p>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                onSelectVideo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </section>

      <section className="surface-card space-y-4 p-5">
        <h2 className="text-sm font-semibold">Reference images</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-[color:var(--surface-2)] hover:border-primary/40"
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImagePlus className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag & drop images here, or click to browse
            </p>
            <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
              PNG, JPG, WEBP · multiple files supported
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {references.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {references.map((ref) => (
              <div
                key={ref.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-[color:var(--surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ref.url}
                  alt={ref.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReference(ref.id);
                  }}
                  className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-[color:var(--ink)]/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${ref.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card space-y-4 p-5">
        <h2 className="text-sm font-semibold">Reference audio</h2>
        <p className="text-xs text-[color:var(--ink-faint)]">
          Optional. Used as a style/mood reference for the voiceover.
        </p>
        {audioFile ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-[color:var(--surface-2)] p-3">
            <div className="flex items-center gap-2 text-sm">
              <FileAudio className="size-4 text-primary" />
              <span className="truncate">{audioFile.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setAudioFile(null)}
              className="text-[color:var(--ink-faint)] hover:text-foreground"
              aria-label="Remove reference audio"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-dashed"
            onClick={() => audioInputRef.current?.click()}
          >
            <FileAudio className="size-4" />
            Upload reference audio
          </Button>
        )}
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            onSelectAudio(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </section>

      <section className="surface-card space-y-5 p-5">
        <h2 className="text-sm font-semibold">Project brief</h2>
        <div className="space-y-2">
          <Label htmlFor="brief">What do you want to create?</Label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. product photoshoot for a skincare brand, clean minimal aesthetic"
            className="min-h-28 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand tone</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl"
                >
                  {tone}
                  <span className="text-[color:var(--ink-faint)]">Optional</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width)"
              >
                {TONES.map((t) => (
                  <DropdownMenuItem key={t} onClick={() => setTone(t)}>
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label>Video length</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl"
                >
                  {duration}s
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width)"
              >
                {DURATIONS.map((d) => (
                  <DropdownMenuItem key={d} onClick={() => setDuration(d)}>
                    {d} seconds
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <section className="surface-card space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
            <Loader2 className="size-4 animate-spin text-primary" />
            Watching references and writing your script…
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </section>
      ) : (
        <div className="flex justify-end">
          <Button
            className="rounded-xl brand-gradient border-0 text-white hover:opacity-90"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            Generate script
          </Button>
        </div>
      )}
    </div>
  );
}
