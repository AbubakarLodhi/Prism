"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileAudio,
  Film,
  ImageIcon,
  Images,
  Loader2,
  Mic,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";

const DURATIONS = [4, 6, 8];

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const updateScript = useProjectStore((s) => s.updateScript);
  const setDuration = useProjectStore((s) => s.setDuration);
  const generateProjectVideo = useProjectStore((s) => s.generateProjectVideo);
  const generateProjectImage = useProjectStore((s) => s.generateProjectImage);
  const generateProjectVoiceover = useProjectStore((s) => s.generateProjectVoiceover);
  const [refsOpen, setRefsOpen] = useState(true);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-[color:var(--ink-soft)]">Project not found.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const videoGenerating = project.videoStatus === "generating";
  const imageGenerating = project.imageStatus === "generating";
  const voiceoverGenerating = project.voiceoverStatus === "generating";

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-[color:var(--surface)] transition-all lg:flex",
          refsOpen ? "w-60" : "w-12"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          {refsOpen && (
            <p className="text-xs font-medium text-[color:var(--ink-soft)]">
              References
            </p>
          )}
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setRefsOpen((v) => !v)}
            aria-label={refsOpen ? "Collapse references" : "Expand references"}
          >
            {refsOpen ? (
              <ChevronLeft className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        </div>
        {refsOpen && (
          <div className="flex-1 space-y-3 overflow-auto p-3">
            {project.referenceVideo && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--ink-faint)]">
                  <Film className="size-3" /> Video
                </p>
                <video
                  src={project.referenceVideo.url}
                  controls
                  className="aspect-video w-full rounded-xl border border-border bg-black object-contain"
                />
              </div>
            )}

            {project.referenceAudio && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--ink-faint)]">
                  <FileAudio className="size-3" /> Audio
                </p>
                <audio src={project.referenceAudio.url} controls className="w-full" />
              </div>
            )}

            {project.references.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-[color:var(--ink-faint)]">
                  Images
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {project.references.map((ref) => (
                    <div
                      key={ref.id}
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ref.url}
                        alt={ref.name}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!project.referenceVideo &&
              !project.referenceAudio &&
              project.references.length === 0 && (
                <p className="text-xs text-[color:var(--ink-faint)]">No references</p>
              )}
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-xl tracking-tight">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-0.5 text-xs text-[color:var(--ink-soft)]">
              {project.durationSeconds}s video
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href={`/project/${project.id}/gallery`}>
              <Images className="size-3.5" />
              Gallery
            </Link>
          </Button>
        </header>

        <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <section className="surface-card space-y-3 p-5">
              <Label htmlFor="script">Script</Label>
              <Textarea
                id="script"
                value={project.script}
                onChange={(e) => updateScript(project.id, { script: e.target.value })}
                placeholder="Voiceover script will appear here after generation…"
                className="min-h-24 rounded-xl"
              />
            </section>

            <section className="surface-card space-y-3 p-5">
              <Label htmlFor="prompt">Video prompt</Label>
              <Textarea
                id="prompt"
                value={project.prompt}
                onChange={(e) => updateScript(project.id, { prompt: e.target.value })}
                placeholder="Video generation prompt will appear here after generation…"
                className="min-h-28 rounded-xl"
              />
            </section>

            <section className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label>Video length</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-24 justify-between rounded-lg">
                        {project.durationSeconds}s
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {DURATIONS.map((d) => (
                        <DropdownMenuItem
                          key={d}
                          onClick={() => setDuration(project.id, d)}
                        >
                          {d} seconds
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  className="rounded-xl brand-gradient border-0 text-white hover:opacity-90"
                  disabled={videoGenerating || !project.prompt.trim()}
                  onClick={() => generateProjectVideo(project.id)}
                >
                  {videoGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating video… (can take a couple minutes)
                    </>
                  ) : project.videoResult ? (
                    <>
                      <RefreshCw className="size-3.5" />
                      Regenerate video
                    </>
                  ) : (
                    "Generate video"
                  )}
                </Button>
              </div>

              {project.videoStatus === "error" && project.videoError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{project.videoError}</p>
                </div>
              )}

              {(videoGenerating || project.videoResult) && (
                <div className="rounded-xl border border-border bg-[color:var(--surface-2)] p-3">
                  {videoGenerating && !project.videoResult ? (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-[color:var(--surface)]">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : project.videoResult ? (
                    <video
                      src={project.videoResult.url}
                      controls
                      className="aspect-video w-full rounded-lg bg-black object-contain"
                    />
                  ) : null}
                </div>
              )}
            </section>

            <section className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label className="mb-0">Image</Label>
                  <p className="text-xs text-[color:var(--ink-faint)]">
                    Free alternative via Gemini (nano-banana) — good for a quick still instead of a full video.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={imageGenerating || !project.prompt.trim()}
                  onClick={() => generateProjectImage(project.id)}
                >
                  {imageGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating…
                    </>
                  ) : project.imageResult ? (
                    <>
                      <RefreshCw className="size-3.5" />
                      Regenerate image
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-3.5" />
                      Generate image
                    </>
                  )}
                </Button>
              </div>

              {project.imageStatus === "error" && project.imageError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{project.imageError}</p>
                </div>
              )}

              {(imageGenerating || project.imageResult) && (
                <div className="rounded-xl border border-border bg-[color:var(--surface-2)] p-3">
                  {imageGenerating && !project.imageResult ? (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-[color:var(--surface)]">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : project.imageResult ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageResult.url}
                      alt={project.prompt}
                      className="aspect-video w-full rounded-lg bg-black object-contain"
                    />
                  ) : null}
                </div>
              )}
            </section>

            <section className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label className="mb-0">Voiceover</Label>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={voiceoverGenerating || !project.script.trim()}
                  onClick={() => generateProjectVoiceover(project.id)}
                >
                  {voiceoverGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating…
                    </>
                  ) : project.voiceoverResult ? (
                    <>
                      <RefreshCw className="size-3.5" />
                      Regenerate voiceover
                    </>
                  ) : (
                    <>
                      <Mic className="size-3.5" />
                      Generate voiceover
                    </>
                  )}
                </Button>
              </div>

              {project.voiceoverStatus === "error" && project.voiceoverError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{project.voiceoverError}</p>
                </div>
              )}

              {project.voiceoverResult && (
                <audio src={project.voiceoverResult.url} controls className="w-full" />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
