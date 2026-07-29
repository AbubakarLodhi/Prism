"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircle, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChatThread } from "@/components/chat/chat-thread";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const pathname = usePathname();
  const projectId = pathname.match(/^\/project\/([^/]+)/)?.[1];
  const project = useProjectStore((s) =>
    projectId ? s.projects.find((p) => p.id === projectId) : undefined
  );
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button
          type="button"
          aria-label="Open creative co-pilot chat"
          className={cn(
            "fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full",
            "brand-gradient border-0 text-white shadow-[0_12px_40px_rgba(124,92,255,0.45)]",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          )}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -6, 0],
          }}
          transition={{
            scale: { type: "spring", stiffness: 260, damping: 18 },
            opacity: { duration: 0.35 },
            y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Pulse rings */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/50"
              animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              animate={{ scale: [1, 1.85], opacity: [0.4, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.7,
              }}
            />
          </span>

          <motion.span
            aria-hidden
            className="relative z-10"
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1.5,
            }}
          >
            <MessageCircle className="size-6" />
          </motion.span>
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Creative co-pilot
          </SheetTitle>
          {project && (
            <p className="text-xs text-[color:var(--ink-faint)]">
              Chatting about &ldquo;{project.title}&rdquo;
            </p>
          )}
        </SheetHeader>
        <ChatThread
          variant="panel"
          projectId={projectId}
          projectTitle={project?.title}
          className="min-h-0"
        />
      </SheetContent>
    </Sheet>
  );
}
