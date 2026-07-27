"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "@/lib/actions/auth";
import { Landmark, Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Check URL for callback errors
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError === "invalid_link" && !error) {
      setError("That magic link is invalid or expired. Please request a new one.");
    }
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setSent(false);
    startTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">My CFO</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Income-First Engine
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          {sent ? (
            /* Success State */
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-white mb-1">
                Check your email
              </h2>
              <p className="text-sm text-neutral-400">
                We sent a magic link to your email.
                <br />
                Click it to sign in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            /* Login Form */
            <>
              <h2 className="text-lg font-semibold text-white mb-1">
                Sign in
              </h2>
              <p className="text-sm text-neutral-400 mb-5">
                Enter your email to receive a magic link.
              </p>

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-neutral-400 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Sending…" : "Send Magic Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Secured with Supabase Auth + Magic Links
        </p>
      </div>
    </div>
  );
}
