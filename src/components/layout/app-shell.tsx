"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  FolderPlus,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { UserMenu } from "@/components/auth/user-menu";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/discover", label: "Studio", icon: Sparkles },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/new", label: "Create", icon: FolderPlus },
  { href: "/settings", label: "Brand kit", icon: Settings },
];

const MARKETING_ROUTES = new Set(["/", "/sign-in", "/sign-up"]);

function NavLinks({
  onNavigate,
  orientation = "horizontal",
}: {
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
}) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";

  return (
    <nav
      className={cn(
        vertical ? "flex flex-col gap-1" : "hidden items-center gap-1 md:flex"
      )}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-full text-[13.5px] font-medium transition-colors",
              vertical ? "px-3 py-2.5" : "px-3.5 py-2",
              active
                ? "bg-primary/15 text-white ring-1 ring-primary/30"
                : "text-[color:var(--ink-soft)] hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <div className="border-b border-border px-4 py-5">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setOpen(false)}
                >
                  <LogoMark />
                  <div>
                    <p className="text-[17px] leading-none font-semibold">Prism</p>
                    <p className="mt-1 text-[11px] text-[color:var(--ink-faint)]">
                      AI Creative Studio
                    </p>
                  </div>
                </Link>
              </div>
              <div className="px-3 py-4">
                <NavLinks
                  orientation="vertical"
                  onNavigate={() => setOpen(false)}
                />
              </div>
              <div className="mx-3 mt-2 rounded-2xl border border-border bg-card p-3">
                <div className="mb-1.5 flex items-center gap-2 text-primary">
                  <Sparkles className="size-3.5" />
                  <span className="text-xs font-semibold">
                    Image · Video · Prompt · Chat
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[color:var(--ink-soft)]">
                  Open Studio to generate — or tap the chat bubble for the
                  co-pilot.
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <span className="text-base font-semibold tracking-tight">Prism</span>
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
          <div className="pointer-events-auto">
            <NavLinks />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden rounded-full border-border sm:inline-flex"
          >
            <Link href="/new">New project</Link>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = MARKETING_ROUTES.has(pathname);

  if (isMarketing) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar />
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      <ChatPanel />
    </div>
  );
}
