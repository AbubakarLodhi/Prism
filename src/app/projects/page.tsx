"use client";

import Link from "next/link";
import { FolderPlus, Search, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "@/lib/format";
import { useProjectStore } from "@/store/project-store";

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const searchQuery = useProjectStore((s) => s.searchQuery);
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery);

  const filtered = projects.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.brief.toLowerCase().includes(q) ||
      p.tone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12.5px] font-medium tracking-wide text-primary uppercase">
            Library
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">
            Your projects
          </h1>
          <p className="mt-1 text-[14.5px] text-[color:var(--ink-soft)]">
            Remakes and generated videos live here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/discover">
              <Sparkles className="size-4" />
              Studio
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/new">
              <FolderPlus className="size-4" />
              New project
            </Link>
          </Button>
        </div>
      </div>

      <div className="surface-card relative p-1.5">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[color:var(--ink-faint)]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects…"
          className="h-11 rounded-xl border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card py-16 text-center text-sm text-[color:var(--ink-soft)]">
          No projects yet. Open Studio and start from a brief.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <article className="surface-card group h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(42,15,28,0.08)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface)]">
                  {project.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-[color:var(--ink-faint)]">
                      No preview
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="truncate font-medium tracking-tight">
                    {project.title}
                  </h3>
                  <p className="truncate text-xs text-[color:var(--ink-soft)]">
                    {format.date(project.updatedAt)} · {project.tone}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
