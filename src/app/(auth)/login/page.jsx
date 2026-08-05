"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { safeRedirectPath } from "@/lib/safe-redirect";
import AuthProviderOptions from "@/components/auth/AuthProviderOptions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"), "/");

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
        body: JSON.stringify({ email, password, role: "USER" }),
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
      <div className="flex flex-1 flex-col justify-between px-8 py-8 md:px-16 lg:px-24">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Sparkles size={26} className="fill-brand-500 text-brand-500" />
            <span className="text-[22px] font-extrabold tracking-tight">Blindly</span>
          </Link>
          <Link
            href="/creator-login"
            className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[13px] font-bold text-brand-700 hover:bg-brand-100 transition"
          >
            Creator Login <ArrowRight size={14} />
          </Link>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-[420px]">
          <h1 className="text-[32px] font-extrabold tracking-tight">User Login</h1>
          <p className="mt-2 text-[15px] text-muted">
            Sign in to discover creators and return to your following feed.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="user-email" className="block text-[13px] font-semibold text-ink/80 mb-1.5">Email</label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label htmlFor="user-password" className="block text-[13px] font-semibold text-ink/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-line bg-canvas px-4 pr-12 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
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
                <>Sign In</>
              )}
            </button>
          </form>

          <AuthProviderOptions role="USER" redirect={redirect} />

          <p className="mt-6 text-center text-[13.5px] text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:underline">
              Join Blindly
            </Link>
          </p>
        </div>

        {/* Bottom */}
        <p className="text-center text-[12px] text-muted">
          Copyright {new Date().getFullYear()} Blindly
        </p>
      </div>

      {/* Right: Visual */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6b3fef] via-[#8b5cf6] to-[#e05fd6]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <Sparkles size={48} className="fill-white/30 text-white/60" />
          <h2 className="mt-6 text-[36px] font-extrabold tracking-tight leading-tight">
            Keep up with
            <br />
            work you value.
          </h2>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-white/70">
            Follow creators, save posts, and find new communities from one account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
