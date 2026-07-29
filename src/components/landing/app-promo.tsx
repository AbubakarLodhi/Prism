"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MessageSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppPromo() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[1.75rem] border border-border bg-card/40 p-8 lg:grid-cols-2 lg:p-12">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-primary uppercase">
            Anywhere you create
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Experience productive AI on web — mobile next
          </h2>
          <p className="mt-4 text-[color:var(--ink-soft)]">
            Run image, video, and prompt workflows in the Prism studio today.
            Mobile apps and the in-product chatbot are on the roadmap.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full brand-gradient border-0 text-white hover:opacity-90"
            >
              <Link href="/discover">
                <Smartphone className="size-4" />
                Open web app
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/#tools">
                <MessageSquare className="size-4" />
                Chatbot waitlist
              </Link>
            </Button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto flex w-full max-w-md justify-center gap-4"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-[42%] overflow-hidden rounded-[1.5rem] border border-border bg-[#090914] shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${
                i === 1 ? "mt-8" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/prism-phone${i}/400/800`}
                alt=""
                className="aspect-[9/16] w-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
