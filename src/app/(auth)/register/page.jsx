"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "CREATOR" ? "CREATOR" : "FAN";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "CREATOR") {
      setRole("CREATOR");
    } else {
      setRole("FAN");
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, handle, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          setError(data.details[0].message || "Registration failed");
        } else {
          setError(data.error || "Registration failed");
        }
        setLoading(false);
        return;
      }

      if (role === "CREATOR") {
        router.push("/studio/content");
      } else {
        router.push("/");
      }
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
            <span className="text-[22px] font-extrabold tracking-tight">Creavora</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink hover:bg-canvas transition"
          >
            Sign In <ArrowRight size={14} />
          </Link>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-[420px] my-auto">
          <h1 className="text-[32px] font-extrabold tracking-tight">Create Account 🚀</h1>
          <p className="mt-2 text-[15px] text-muted">Join the premium community of creators and fans.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-600">
                {error}
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1 border border-line">
              <button
                type="button"
                onClick={() => setRole("FAN")}
                className={`py-2 text-[13.5px] font-bold rounded-lg transition-all ${
                  role === "FAN"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                Join as Fan
              </button>
              <button
                type="button"
                onClick={() => setRole("CREATOR")}
                className={`py-2 text-[13.5px] font-bold rounded-lg transition-all ${
                  role === "CREATOR"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                Join as Creator
              </button>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink/80 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Singh"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-4 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink/80 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-4 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink/80 mb-1">Handle (Username)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[14px] font-semibold text-muted">@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="username"
                  className="h-11 w-full rounded-xl border border-line bg-canvas pl-8 pr-4 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink/80 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
                  className="h-11 w-full rounded-xl border border-line bg-canvas px-4 pr-12 text-[14px] outline-none placeholder:text-muted focus:border-brand-400 focus:bg-white transition"
                />
                <button
                  type="button"
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
                <>Create Account</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Bottom */}
        <p className="text-center text-[12px] text-muted">
          © {new Date().getFullYear()} Creavora. All rights reserved.
        </p>
      </div>

      {/* Right: Visual */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6b3fef] via-[#8b5cf6] to-[#e05fd6]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <Sparkles size={48} className="fill-white/30 text-white/60" />
          <h2 className="mt-6 text-[36px] font-extrabold tracking-tight leading-tight">
            Connect directly,
            <br />
            support authentically.
          </h2>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-white/70">
            A specialized direct-to-fan portal built for genuine creator-to-community relationships.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
