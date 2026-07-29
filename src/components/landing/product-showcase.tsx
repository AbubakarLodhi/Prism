"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Gauge, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { icon: Users, value: "10k+", label: "Creators waiting" },
  { icon: Zap, value: "60s", label: "Idea → first asset" },
  { icon: Gauge, value: "3×", label: "Faster production" },
  { icon: Shield, value: "Brand", label: "Kit locked in" },
];

export function ProductShowcase() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div
            aria-hidden
            className="landing-pulse absolute inset-8 rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border glow-ring">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/prism-connect/800/900"
              alt="Prism creative workflow"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur">
              <p className="text-xs text-violet-200">Live remake</p>
              <p className="text-sm font-medium">
                Hero still + 15s video from one brief
              </p>
            </div>
          </div>
        </motion.div>

        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-primary uppercase">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Connect search, prompts, and generation
          </h2>
          <p className="mt-4 text-[color:var(--ink-soft)]">
            Prism bridges creative research and production. Find what works,
            generate the prompt, ship the image or video — and soon, run it all
            through an AI chatbot co-pilot.
          </p>
          <Button
            asChild
            className="mt-7 rounded-full brand-gradient border-0 text-white hover:opacity-90"
          >
            <Link href="/discover">
              Try Prism now
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card/50 p-5 text-center"
            >
              <Icon className="mx-auto size-5 text-primary" />
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
