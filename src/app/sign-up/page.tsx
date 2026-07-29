import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-1/4 size-[28rem] rounded-full bg-primary/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 size-[22rem] rounded-full bg-cyan-500/15 blur-[100px]"
      />
      <div className="relative z-10 w-full">
        <SignUpForm googleClientId={googleClientId} />
      </div>
    </div>
  );
}
