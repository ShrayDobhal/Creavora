"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { safeRedirectPath } from "@/lib/safe-redirect";

function CreatorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"), "/studio/content");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "CREATOR" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col justify-between px-8 py-8 md:px-16 lg:px-24 bg-[#0c0c0e] text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Sparkles size={26} className="fill-brand-500 text-brand-500" />
            <span className="text-[22px] font-extrabold tracking-tight">Blindly</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10 transition"
          >
            <ArrowLeft size={14} /> User Login
          </Link>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-[420px]">
          <div className="flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 text-brand-400 w-fit text-[12px] font-semibold mb-4">
            <ShieldAlert size={14} /> Creator Portal
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight">Creator Login</h1>
          <p className="mt-2 text-[15px] text-muted-foreground text-neutral-400">
            Sign in to manage your creator profile and studio.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] font-semibold text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="creator-email" className="block text-[13px] font-semibold text-neutral-300 mb-1.5">Creator Email</label>
              <input
                id="creator-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[14px] outline-none placeholder:text-neutral-500 focus:border-brand-500 focus:bg-white/10 transition text-white"
              />
            </div>

            <div>
              <label htmlFor="creator-password" className="block text-[13px] font-semibold text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="creator-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-[14px] outline-none placeholder:text-neutral-500 focus:border-brand-500 focus:bg-white/10 transition text-white"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Access Creator Studio</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-neutral-400">
            Apply to become a creator?{" "}
            <Link href="/register?role=CREATOR" className="font-bold text-brand-400 hover:underline">
              Register Here
            </Link>
          </p>
        </div>

        {/* Bottom */}
        <p className="text-center text-[12px] text-neutral-500">
          Copyright {new Date().getFullYear()} Blindly
        </p>
      </div>

      {/* Right: Visual */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block border-l border-white/10 bg-[#060608]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="rounded-full bg-brand-500/10 p-4 border border-brand-500/20">
            <Sparkles size={36} className="text-brand-400" />
          </div>
          <h2 className="mt-6 text-[36px] font-extrabold tracking-tight leading-tight">
            Build your creator
            <br />
            presence.
          </h2>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-neutral-400">
            Keep your profile, content workspace, and community tools in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CreatorLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0e]">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    }>
      <CreatorLoginForm />
    </Suspense>
  );
}
