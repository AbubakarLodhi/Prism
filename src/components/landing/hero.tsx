"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 sm:items-center sm:pb-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
        aria-hidden
      >
        <source
          src="/videos/12228260_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--background) 0%, rgba(5,5,15,0.55) 42%, rgba(5,5,15,0.72) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Prism
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-white/95 sm:text-3xl lg:text-4xl"
        >
          AI creative generation for image, video & prompts
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base"
        >
          Turn briefs into production-ready images and videos — with prompt
          tools and a co-pilot chat in one studio.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button
            asChild
            className="h-11 rounded-full brand-gradient border-0 px-6 text-white hover:opacity-90"
          >
            <Link href="/sign-up">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10"
          >
            <Link href="/discover">Open Studio</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
