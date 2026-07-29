"use client";

const BRANDS = [
  "Dropbox",
  "Slack",
  "Notion",
  "Figma",
  "Shopify",
  "Meta",
  "Linear",
  "Stripe",
];

export function LogoMarquee() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section className="border-y border-border/60 py-10">
      <p className="mb-6 text-center text-[11px] font-medium tracking-[0.18em] text-[color:var(--ink-faint)] uppercase">
        Trusted by innovative brands
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#05050f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#05050f] to-transparent" />
        <div className="landing-marquee flex w-max gap-12 whitespace-nowrap">
          {row.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="text-xl font-semibold tracking-tight text-white/25 sm:text-2xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
