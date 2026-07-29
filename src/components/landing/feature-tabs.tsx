"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ImageIcon,
  MessageSquare,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "image",
    label: "AI Image",
    icon: ImageIcon,
    title: "Generate studio-grade product images",
    points: [
      "Reference-led stills from competitor creatives",
      "Brand kit color & tone applied automatically",
      "Batch variants for ads, PDP, and social",
    ],
    image: "https://picsum.photos/seed/prism-feat-image/720/520",
  },
  {
    id: "video",
    label: "AI Video",
    icon: Video,
    title: "Turn briefs into scroll-stopping video",
    points: [
      "Shot lists from a single prompt or reference",
      "UGC, product reveal, and lifestyle formats",
      "Voiceover-ready scripts for each scene",
    ],
    image: "https://picsum.photos/seed/prism-feat-video/720/520",
  },
  {
    id: "prompt",
    label: "AI Prompt",
    icon: Sparkles,
    title: "Write prompts that actually convert",
    points: [
      "Structured prompt generation for image & video",
      "Tone, lens, lighting, and brand constraints",
      "One-click refine / regenerate loops",
    ],
    image: "https://picsum.photos/seed/prism-feat-prompt/720/520",
  },
  {
    id: "chat",
    label: "AI Chatbot",
    icon: MessageSquare,
    title: "Creative co-pilot chatbot — coming soon",
    points: [
      "Chat to brief, iterate, and approve assets",
      "Ask Prism to remake ads in your brand voice",
      "Connect search, generation, and reviews in one thread",
    ],
    image: "https://picsum.photos/seed/prism-feat-chat/720/520",
    soon: true,
  },
] as const;

export function FeatureTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("image");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="tools" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-primary uppercase">
            AI Tools
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Generate advanced creatives with Prism
          </h2>
          <p className="mt-3 text-[color:var(--ink-soft)]">
            Image generation, video generation, and prompt generation today —
            chatbot orchestration next.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                  active === t.id
                    ? "border-primary/50 bg-primary/20 text-white glow-ring"
                    : "border-border bg-white/5 text-[color:var(--ink-soft)] hover:text-white"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
                {"soon" in t && t.soon && (
                  <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] text-cyan-300">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid items-center gap-8 rounded-[1.5rem] border border-border bg-card/60 p-6 sm:p-8 lg:grid-cols-2"
          >
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {tab.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {tab.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm text-[color:var(--ink-soft)]"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Check className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-7 rounded-full brand-gradient border-0 text-white hover:opacity-90"
              >
                <Link href={tab.id === "chat" ? "/#features" : "/new"}>
                  {tab.id === "chat" ? "Join waitlist" : "Try it now"}
                </Link>
              </Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tab.image}
                alt=""
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
