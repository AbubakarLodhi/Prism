"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

export function ChatThread({
  variant,
  projectTitle,
  projectId,
  className,
}: {
  variant: "page" | "panel";
  projectTitle?: string;
  projectId?: string;
  className?: string;
}) {
  const messages = useChatStore((s) => s.messages);
  const sending = useChatStore((s) => s.sending);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPage = variant === "page";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await sendMessage(text, projectId);
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        isPage && "w-full",
        className
      )}
    >
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-auto",
          isPage ? "px-4 py-8" : "space-y-3 px-4"
        )}
      >
        <div className={cn(isPage && "mx-auto w-full max-w-2xl")}>
          {messages.length === 0 ? (
            <div
              className={cn(
                isPage
                  ? "flex min-h-[52vh] flex-col items-center justify-center text-center"
                  : ""
              )}
            >
              {isPage && (
                <>
                  <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <h2 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    What are we creating?
                  </h2>
                </>
              )}
              <p
                className={cn(
                  "text-sm text-[color:var(--ink-soft)]",
                  isPage && "max-w-md text-[15px] leading-relaxed"
                )}
              >
                Ask for help refining your brief, script, or video prompt
                {projectTitle ? ` for "${projectTitle}"` : ""}.
              </p>
              {isPage && (
                <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {[
                    "Remake a Meta ad in our brand voice",
                    "Write a 15s UGC video prompt",
                    "Tighten this product brief",
                    "Suggest 3 image prompt variants",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={sending}
                      onClick={() => sendMessage(suggestion, projectId)}
                      className="rounded-2xl border border-border bg-white/[0.03] px-3.5 py-3 text-left text-[13px] text-[color:var(--ink-soft)] transition hover:border-primary/40 hover:bg-primary/10 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={cn(isPage ? "space-y-6" : "space-y-3")}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    isPage
                      ? cn(
                          "text-[15px] leading-relaxed whitespace-pre-wrap",
                          m.role === "user"
                            ? "ml-auto max-w-[85%] rounded-3xl bg-primary/20 px-4 py-3 text-white"
                            : "max-w-none text-[color:var(--ink)]"
                        )
                      : cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                          m.role === "user"
                            ? "ml-auto bg-primary/15 text-white"
                            : "bg-[color:var(--surface-2)] text-[color:var(--ink)]"
                        )
                  )}
                >
                  {isPage && m.role === "assistant" && m.content && (
                    <p className="mb-1.5 text-xs font-medium text-primary">
                      Prism
                    </p>
                  )}
                  {m.content || (
                    <Loader2 className="size-3.5 animate-spin text-[color:var(--ink-faint)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0",
          isPage
            ? "border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl"
            : "flex items-end gap-2 border-t border-border p-3"
        )}
      >
        <div
          className={cn(
            isPage
              ? "mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[1.75rem] border border-border bg-white/[0.04] p-2"
              : "contents"
          )}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={isPage ? "Message Prism…" : "Ask the co-pilot…"}
            className={cn(
              "min-h-10 resize-none rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0",
              isPage && "max-h-40 min-h-[44px] px-3 py-3 text-[15px]"
            )}
            disabled={sending}
            rows={isPage ? 1 : undefined}
          />
          <Button
            size="icon"
            className={cn(
              "shrink-0 rounded-xl brand-gradient border-0 text-white hover:opacity-90",
              isPage && "size-10 rounded-full"
            )}
            disabled={sending || !input.trim()}
            onClick={onSend}
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
