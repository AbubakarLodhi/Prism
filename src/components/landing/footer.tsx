import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/discover", label: "Studio" },
      { href: "/new", label: "Create" },
      { href: "/#tools", label: "AI Tools" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { href: "/#tools", label: "Image generation" },
      { href: "/#tools", label: "Video generation" },
      { href: "/#tools", label: "Prompt generation" },
      { href: "/#tools", label: "AI Chatbot (soon)" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/settings", label: "Brand kit" },
      { href: "/projects", label: "Projects" },
      { href: "/#testimonials", label: "Reviews" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 pt-14 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-semibold">Prism</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[color:var(--ink-soft)]">
            AI creative studio for image generation, video generation, and
            prompt generation — with chatbot orchestration coming soon.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[color:var(--ink-soft)] transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-border pt-6 text-xs text-[color:var(--ink-faint)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Prism. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
}
