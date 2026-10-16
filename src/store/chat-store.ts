"use client";

import { create } from "zustand";
import { streamChatReply, type ChatAction } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/types";
import { useProjectStore } from "@/store/project-store";

const ACTION_LABEL: Record<ChatAction["action"], string> = {
  generate_video: "video",
  generate_image: "image",
};

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

    const setAssistantContent = (content: string) => {
      set({
        messages: get().messages.map((m) =>
          m.id === assistantId ? { ...m, content } : m
        ),
      });
    };

    const appendAssistantContent = (chunk: string) => {
      set({
        messages: get().messages.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ),
      });
    };

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
        appendAssistantContent,
        projectId
          ? async ({ action, prompt }) => {
              const label = ACTION_LABEL[action];
              setAssistantContent(`Generating your ${label}: "${prompt}"\n\nThis can take a bit — check the ${label} card in the workspace below.`);

              const projectStore = useProjectStore.getState();
              projectStore.updateScript(projectId, { prompt });

              if (action === "generate_video") {
                await projectStore.generateProjectVideo(projectId);
              } else {
                await projectStore.generateProjectImage(projectId);
              }

              const updated = useProjectStore
                .getState()
                .projects.find((p) => p.id === projectId);
              const status = action === "generate_video" ? updated?.videoStatus : updated?.imageStatus;
              const error = action === "generate_video" ? updated?.videoError : updated?.imageError;

              if (status === "error") {
                setAssistantContent(`Couldn't generate the ${label}: ${error ?? "unknown error"}.`);
              } else {
                setAssistantContent(`Done — your ${label} is ready in the workspace below.`);
              }
            }
          : undefined
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
