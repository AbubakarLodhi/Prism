import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-7", className)}
    >
      <defs>
        <linearGradient id="prism-grad" x1="4" y1="2" x2="28" y2="30">
          <stop stopColor="#7c5cff" />
          <stop offset="0.55" stopColor="#4f8cff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L28 11.5 L22 28 H10 L4 11.5 Z"
        fill="url(#prism-grad)"
        opacity="0.95"
      />
      <path
        d="M16 8 L23 13 L19.5 24 H12.5 L9 13 Z"
        fill="#05050f"
        opacity="0.55"
      />
    </svg>
  );
}
