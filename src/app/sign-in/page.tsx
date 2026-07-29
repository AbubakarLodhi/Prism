import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/4 size-[28rem] rounded-full bg-primary/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[22rem] rounded-full bg-cyan-500/15 blur-[100px]"
      />
      <div className="relative z-10 w-full">
        <SignInForm googleClientId={googleClientId} />
      </div>
    </div>
  );
}
