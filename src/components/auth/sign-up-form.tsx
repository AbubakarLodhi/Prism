"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export function SignUpForm({ googleClientId }: { googleClientId: string }) {
  const router = useRouter();
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithGoogleProfile = useAuthStore((s) => s.signInWithGoogleProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = signUpWithEmail({ name, email, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/discover");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
        <LogoMark className="size-8" />
        <span className="text-xl font-semibold">Prism</span>
      </Link>

      <div className="surface-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">
          Start with Google, or sign up with email in under a minute.
        </p>

        <div className="mt-6">
          <GoogleSignInButton
            label="Sign up with Google"
            clientId={googleClientId}
            onSuccess={(profile) => {
              setError("");
              const result = signInWithGoogleProfile(profile);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.push("/discover");
            }}
            onError={setError}
          />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-[color:var(--ink-faint)]">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-11 rounded-xl"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl brand-gradient border-0 text-white hover:opacity-90"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--ink-soft)]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-violet-300 hover:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
