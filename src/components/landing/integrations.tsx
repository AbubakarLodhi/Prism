"use client";

import { motion } from "motion/react";
import {
  Box,
  MessageCircle,
  PenTool,
  ShoppingBag,
  Sparkles,
  Workflow,
} from "lucide-react";

const APPS = [
  { icon: Workflow, label: "Slack", style: "left-[8%] top-[18%]" },
  { icon: PenTool, label: "Figma", style: "right-[10%] top-[14%]" },
  { icon: ShoppingBag, label: "Shopify", style: "left-[4%] bottom-[22%]" },
  { icon: Box, label: "GitHub", style: "right-[6%] bottom-[20%]" },
  { icon: MessageCircle, label: "Chat", style: "left-[38%] top-[6%]" },
];

export function Integrations() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for seamless creative collaboration
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[color:var(--ink-soft)]">
          Connect Prism to the tools your team already uses — and route
          approvals through chat when the chatbot launches.
        </p>

        <div className="relative mx-auto mt-14 h-[320px] max-w-2xl sm:h-[380px]">
          <div
            aria-hidden
            className="landing-pulse absolute inset-[22%] rounded-full bg-primary/25 blur-3xl"
          />
          <svg
            className="absolute inset-0 size-full opacity-40"
            viewBox="0 0 400 400"
            fill="none"
            aria-hidden
          >
            <circle
              cx="200"
              cy="200"
              r="90"
              stroke="url(#prism-ring)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <circle
              cx="200"
              cy="200"
              r="140"
              stroke="url(#prism-ring)"
              strokeWidth="1"
              strokeDasharray="3 8"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="prism-ring" x1="0" y1="0" x2="400" y2="400">
                <stop stopColor="#7c5cff" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl brand-gradient glow-ring"
          >
            <Sparkles className="size-8 text-white" />
          </motion.div>

          {APPS.map((app, i) => {
            const Icon = app.icon;
            return (
              <motion.div
                key={app.label}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`absolute ${app.style} flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-[0_0_30px_rgba(124,92,255,0.15)]`}
                title={app.label}
              >
                <Icon className="size-6 text-violet-200" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
