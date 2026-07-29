"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoogleProfile } from "@/lib/google-auth";

export type AuthProvider = "email" | "google";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: string;
}

interface AuthStore {
  user: AuthUser | null;
  accounts: StoredAccount[];
  signInWithEmail: (
    email: string,
    password: string
  ) => { ok: true } | { ok: false; error: string };
  signUpWithEmail: (input: {
    name: string;
    email: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  signInWithGoogleProfile: (
    profile: GoogleProfile
  ) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [],

      signInWithEmail: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const account = get().accounts.find(
          (a) => a.email === normalized && a.provider === "email"
        );
        if (!account) {
          return { ok: false, error: "No account found with that email." };
        }
        if (account.password !== password) {
          return { ok: false, error: "Incorrect password." };
        }
        set({
          user: {
            id: account.id,
            name: account.name,
            email: account.email,
            avatarUrl: account.avatarUrl,
            provider: "email",
          },
        });
        return { ok: true };
      },

      signUpWithEmail: ({ name, email, password }) => {
        const normalized = email.trim().toLowerCase();
        if (!name.trim() || !normalized || password.length < 6) {
          return {
            ok: false,
            error: "Enter your name, email, and a password (6+ characters).",
          };
        }
        if (get().accounts.some((a) => a.email === normalized)) {
          return {
            ok: false,
            error: "An account with that email already exists. Sign in instead.",
          };
        }
        const account: StoredAccount = {
          id: uid("user"),
          name: name.trim(),
          email: normalized,
          password,
          provider: "email",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          accounts: [...state.accounts, account],
          user: {
            id: account.id,
            name: account.name,
            email: account.email,
            provider: "email",
          },
        }));
        return { ok: true };
      },

      signInWithGoogleProfile: (profile) => {
        const email = profile.email.trim().toLowerCase();
        const existing = get().accounts.find(
          (a) => a.email === email || a.id === `google-${profile.id}`
        );

        if (existing) {
          const updated: StoredAccount = {
            ...existing,
            id: existing.id.startsWith("google-")
              ? existing.id
              : `google-${profile.id}`,
            name: profile.name || existing.name,
            email,
            avatarUrl: profile.picture || existing.avatarUrl,
            provider: "google",
            password: "",
          };
          set((state) => ({
            accounts: state.accounts.map((a) =>
              a.id === existing.id ? updated : a
            ),
            user: {
              id: updated.id,
              name: updated.name,
              email: updated.email,
              avatarUrl: updated.avatarUrl,
              provider: "google",
            },
          }));
          return { ok: true };
        }

        const account: StoredAccount = {
          id: `google-${profile.id}`,
          name: profile.name,
          email,
          password: "",
          avatarUrl: profile.picture,
          provider: "google",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          accounts: [...state.accounts, account],
          user: {
            id: account.id,
            name: account.name,
            email: account.email,
            avatarUrl: account.avatarUrl,
            provider: "google",
          },
        }));
        return { ok: true };
      },

      signOut: () => set({ user: null }),
    }),
    {
      name: "prism-auth",
      partialize: (state) => ({
        user: state.user,
        accounts: state.accounts,
      }),
    }
  )
);
