"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";

export default function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));

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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-lg">
          <Link href={`/project/${project.id}`}>
            <ArrowLeft className="size-3.5" />
            Back to workspace
          </Link>
        </Button>
        <h1 className="font-display text-3xl tracking-tight">{project.title}</h1>
        <p className="text-[14.5px] text-[color:var(--ink-soft)]">Final result</p>
      </div>

      {!project.videoResult && !project.voiceoverResult ? (
        <div className="surface-card border-dashed py-20 text-center text-sm text-[color:var(--ink-soft)]">
          No results yet. Generate a video and voiceover from the workspace.
        </div>
      ) : (
        <div className="space-y-6">
          {project.videoResult && (
            <section className="surface-card space-y-3 p-4">
              <video
                src={project.videoResult.url}
                controls
                autoPlay
                loop
                className="w-full rounded-xl bg-black object-contain"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-[color:var(--ink-soft)]">
                  {project.prompt}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 rounded-xl brand-gradient border-0 text-white hover:opacity-90"
                >
                  <a href={project.videoResult.url} download target="_blank" rel="noreferrer">
                    <Download className="size-3.5" />
                    Download video
                  </a>
                </Button>
              </div>
            </section>
          )}

          {project.voiceoverResult && (
            <section className="surface-card space-y-3 p-4">
              <p className="text-sm text-[color:var(--ink-soft)]">{project.script}</p>
              <audio src={project.voiceoverResult.url} controls className="w-full" />
              <div className="flex justify-end">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                >
                  <a href={project.voiceoverResult.url} download target="_blank" rel="noreferrer">
                    <Download className="size-3.5" />
                    Download voiceover
                  </a>
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
