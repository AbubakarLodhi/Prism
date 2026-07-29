"use client";

import { create } from "zustand";
import { streamChatReply } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/types";
import { useProjectStore } from "@/store/project-store";

function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ChatStore {
  messages: ChatMessage[];
  sending: boolean;
  sendMessage: (text: string, projectId?: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  sending: false,
  clearMessages: () => set({ messages: [] }),

  sendMessage: async (text, projectId) => {
    const trimmed = text.trim();
    if (!trimmed || get().sending) return;

    const project = projectId
      ? useProjectStore.getState().projects.find((p) => p.id === projectId)
      : undefined;

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantId = uid();
    const nextMessages = [...get().messages, userMessage];

    set({
      sending: true,
      messages: [
        ...nextMessages,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    try {
      await streamChatReply(
        nextMessages.map(({ role, content }) => ({ role, content })),
        project
          ? {
              title: project.title,
              brief: project.brief,
              tone: project.tone,
              script: project.script,
              prompt: project.prompt,
            }
          : undefined,
        (chunk) => {
          set({
            messages: get().messages.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            ),
          });
        }
      );
    } catch (error) {
      set({
        messages: get().messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  error instanceof Error
                    ? `Error: ${error.message}`
                    : "Something went wrong.",
              }
            : m
        ),
      });
    } finally {
      set({ sending: false });
    }
  },
}));
