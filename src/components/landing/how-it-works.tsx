"use client";

import { motion } from "motion/react";
import {
  Clapperboard,
  Layers,
  MessageSquare,
  Palette,
  Compass,
  Wand2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "Image generation",
    body: "Create on-brand stills from prompts or competitor references in seconds.",
  },
  {
    icon: Clapperboard,
    title: "Video generation",
    body: "Build shot lists and video assets for UGC, product, and lifestyle formats.",
  },
  {
    icon: Layers,
    title: "Prompt generation",
    body: "Structured prompts with lighting, lens, tone, and brand constraints baked in.",
  },
  {
    icon: Compass,
    title: "Inspiration library",
    body: "Start from a brief or starter template, then generate image and video assets.",
  },
  {
    icon: Palette,
    title: "Brand kit",
    body: "Lock colors, voice, and logo so every remake stays consistent.",
  },
  {
    icon: MessageSquare,
    title: "AI chatbot",
    body: "Coming soon — brief, iterate, and approve creatives through chat.",
  },
];

export function BenefitsGrid() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Create smarter, not harder with AI
          </h2>
          <p className="mt-3 text-[color:var(--ink-soft)]">
            Everything your team needs to go from inspiration to finished assets.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-card/70 p-6 transition hover:border-primary/40 hover:shadow-[0_0_40px_rgba(124,92,255,0.12)]"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                  {f.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
