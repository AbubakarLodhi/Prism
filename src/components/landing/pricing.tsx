"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    monthly: 0,
    yearly: 0,
    desc: "Explore search & light generation",
    features: [
      "Creative search library",
      "20 image gens / mo",
      "Prompt generator",
      "1 brand kit",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    monthly: 49,
    yearly: 39,
    desc: "For growing creative teams",
    features: [
      "Unlimited prompt gen",
      "500 image + 50 video gens",
      "Shot list workspace",
      "Priority render queue",
      "Chatbot early access",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    monthly: 149,
    yearly: 119,
    desc: "Agencies & high volume",
    features: [
      "Everything in Pro",
      "Unlimited video queue",
      "Team seats & roles",
      "API access",
      "Dedicated chatbot workspace",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pricing plans for everyone
          </h2>
          <p className="mt-3 text-[color:var(--ink-soft)]">
            Start free. Scale when image & video volume grows.
          </p>
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition",
                !yearly ? "bg-primary text-white" : "text-[color:var(--ink-soft)]"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition",
                yearly ? "bg-primary text-white" : "text-[color:var(--ink-soft)]"
              )}
            >
              Yearly
              <span className="ml-1.5 text-[10px] text-cyan-300">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-[1.5rem] border p-6 sm:p-7",
                plan.highlighted
                  ? "border-primary/60 bg-primary/10 glow-ring"
                  : "border-border bg-card/60"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full brand-gradient px-3 py-0.5 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                {plan.desc}
              </p>
              <p className="mt-5">
                <span className="text-4xl font-semibold">
                  ${yearly ? plan.yearly : plan.monthly}
                </span>
                <span className="text-sm text-[color:var(--ink-faint)]">
                  /mo
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[color:var(--ink-soft)]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "mt-8 w-full rounded-full",
                  plan.highlighted
                    ? "brand-gradient border-0 text-white hover:opacity-90"
                    : "border-border bg-white/5 text-white hover:bg-white/10"
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href="/sign-up">{plan.cta}</Link>
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
