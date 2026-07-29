"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Ava Chen",
    role: "Growth Lead",
    quote:
      "Prism cut our creative turnaround from days to hours. Prompt gen alone is worth it.",
    seed: "ava",
  },
  {
    name: "Marcus Lee",
    role: "Creative Director",
    quote:
      "We remake competitor ads into our brand voice without losing the winning hook.",
    seed: "marcus",
  },
  {
    name: "Sofia Ruiz",
    role: "Performance Marketer",
    quote:
      "Image + video in one workspace is huge. Can't wait for the chatbot co-pilot.",
    seed: "sofia",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center -space-x-2">
            {["u1", "u2", "u3", "u4", "u5"].map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s}
                src={`https://picsum.photos/seed/${s}/64/64`}
                alt=""
                className="size-9 rounded-full border-2 border-[#05050f] object-cover"
              />
            ))}
          </div>
          <p className="text-xs text-[color:var(--ink-faint)]">
            Loved by early creative teams
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            What teams say about Prism
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.blockquote
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card/60 p-6"
            >
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
                “{r.quote}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${r.seed}/80/80`}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-[color:var(--ink-faint)]">
                    {r.role}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
