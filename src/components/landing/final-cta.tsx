"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 overflow-hidden rounded-[1.5rem] px-8 py-12 text-center sm:flex-row sm:text-left"
        style={{
          background:
            "linear-gradient(115deg, #6d4aff 0%, #4f8cff 50%, #2dd4bf 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-white/20 blur-2xl"
        />
        <div className="relative">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start generating images, video & prompts today
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            Join Prism early — chatbot co-pilot is next on the roadmap.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="relative h-12 shrink-0 rounded-full bg-white px-7 text-[#05050f] hover:bg-white/90"
        >
          <Link href="/sign-up">
            Start free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
