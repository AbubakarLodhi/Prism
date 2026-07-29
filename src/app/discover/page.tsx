"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  Clapperboard,
  ImageIcon,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";
import type { BrandTone } from "@/lib/types";

const TOOLS = [
  {
    id: "image",
    title: "Image generation",
    body: "Studio-grade stills from a brief or reference.",
    icon: ImageIcon,
    href: "/new",
    accent: "from-violet-500/25 to-transparent",
  },
  {
    id: "video",
    title: "Video generation",
    body: "Scripts, prompts, and clips in one workflow.",
    icon: Clapperboard,
    href: "/new",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    id: "prompt",
    title: "Prompt studio",
    body: "Structured prompts with lighting, lens & tone.",
    icon: Wand2,
    href: "/new",
    accent: "from-fuchsia-500/20 to-transparent",
  },
] as const;

const STARTERS: { title: string; brief: string; tone: BrandTone }[] = [
  {
    title: "Luxury product reveal",
    brief:
      "Cinematic 6s product reveal for a premium skincare serum. Soft rim light, dark marble surface, slow push-in, editorial luxury mood.",
    tone: "Luxury",
  },
  {
    title: "UGC social ad",
    brief:
      "Founder-style UGC for Instagram Reels. Kitchen daylight, handheld feel, bold captions, clear offer in the last 2 seconds.",
    tone: "Playful",
  },
  {
    title: "Minimal brand film",
    brief:
      "Clean minimal brand film: white seamless backdrop, precise packing shots, restrained motion, calm voiceover energy.",
    tone: "Minimal",
  },
  {
    title: "Bold launch teaser",
    brief:
      "High-energy product launch teaser with punchy cuts, high contrast lighting, and a strong end-card logo lockup.",
    tone: "Bold",
  },
];

export default function DiscoverPage() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);
  const [prompt, setPrompt] = useState("");
  const [starting, setStarting] = useState(false);

  const startFromPrompt = async (
    brief: string,
    tone: BrandTone = "Minimal"
  ) => {
    const text = brief.trim();
    if (!text || starting) return;
    setStarting(true);
    try {
      const id = createProject({
        title: text.slice(0, 48) + (text.length > 48 ? "…" : ""),
        brief: text,
        tone,
        references: [],
      });
      router.push(`/project/${id}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="relative min-h-full">
      <section className="relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover opacity-45"
          aria-hidden
        >
          <source
            src="/videos/14165282_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,92,255,0.28), transparent 55%), linear-gradient(to bottom, rgba(5,5,15,0.5), var(--background))",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] font-semibold tracking-[0.18em] text-violet-200/90 uppercase"
          >
            Prism Studio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
          >
            Start with a brief. Ship the creative.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-xl text-[15px] text-white/65"
          >
            Image, video, and prompt generation in one workspace. Use the chat
            bubble anytime for the co-pilot.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/40 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            onSubmit={(e) => {
              e.preventDefault();
              startFromPrompt(prompt);
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the image or video you want to create…"
              className="w-full resize-none bg-transparent px-4 py-3 text-left text-[15px] text-white outline-none placeholder:text-white/35"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
              <p className="text-[11px] text-white/40">
                Opens a new project from your brief
              </p>
              <Button
                type="submit"
                disabled={starting || !prompt.trim()}
                className="rounded-full brand-gradient border-0 px-5 text-white hover:opacity-90"
              >
                {starting ? "Starting…" : "Generate"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 pb-16 sm:px-6 lg:px-8">
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">
              Creative tools
            </h2>
            <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
              Jump into generation from a blank project.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={tool.href}
                    className="relative block h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-5 text-left transition hover:border-primary/35 hover:bg-card"
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                        tool.accent
                      )}
                    />
                    <div className="relative">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                        <Icon className="size-5 text-violet-200" />
                      </span>
                      <h3 className="mt-4 text-[15px] font-semibold">
                        {tool.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--ink-soft)]">
                        {tool.body}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-violet-300">
                        Open
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">
              Professional starters
            </h2>
            <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
              Production-ready briefs — one click to a project.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {STARTERS.map((starter, i) => (
              <motion.button
                key={starter.title}
                type="button"
                disabled={starting}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => startFromPrompt(starter.brief, starter.tone)}
                className="group rounded-2xl border border-border bg-white/[0.02] p-5 text-left transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
                      {starter.tone}
                    </p>
                    <h3 className="mt-1.5 text-[15px] font-semibold">
                      {starter.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--ink-soft)]">
                      {starter.brief}
                    </p>
                  </div>
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-violet-200 transition group-hover:bg-primary group-hover:text-white">
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
