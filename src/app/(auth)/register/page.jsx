"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";

const HANDLE_PATTERN = /^[a-z0-9_]{3,30}$/;

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.3H3.1a10 10 0 0 0 0 9.4L6.5 14Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3.1 7.3l3.4 2.8A5.9 5.9 0 0 1 12 5.9Z" />
    </svg>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "CREATOR" ? "CREATOR" : "USER";
  const [role, setRole] = useState(initialRole);
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const normalized = handle.trim().replace(/^@+/, "").toLowerCase();
    if (!normalized || !HANDLE_PATTERN.test(normalized)) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/auth/handle-availability?handle=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not check this handle");
        setAvailability(data.available ? "available" : "unavailable");
        setMessage(data.available ? `@${data.handle} is available` : `@${data.handle} is already taken`);
      } catch (error) {
        if (error.name === "AbortError") return;
        setAvailability("error");
        setMessage(error.message || "Could not check this handle");
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [handle]);

  const normalizedHandle = handle.trim().replace(/^@+/, "").toLowerCase();
  const googleHref = useMemo(() => {
    const redirect = role === "CREATOR" ? "/studio/content" : "/";
    return `/api/auth/google/start?intent=register&role=${role}&handle=${encodeURIComponent(normalizedHandle)}&redirect=${encodeURIComponent(redirect)}`;
  }, [normalizedHandle, role]);
  const oauthError = searchParams.get("error");
  const pageError = oauthError === "handle_unavailable"
    ? "That handle was claimed before Google sign-in completed. Choose another one."
    : oauthError === "invalid_handle" ? "Choose a valid handle before continuing." : "";

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-between px-6 py-7 sm:px-10 md:px-16 lg:px-24">
        <div className="flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Sparkles size={26} className="fill-brand-500 text-brand-500" />
            <span className="text-[22px] font-extrabold tracking-tight">Blindly</span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-canvas">
            Sign In <ArrowRight size={14} />
          </Link>
        </div>

        <main className="mx-auto my-auto w-full max-w-[430px] py-10">
          <h1 className="text-[32px] font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-[15px] text-muted">Choose your account type and claim your Blindly handle</p>

          <div className="mt-8 space-y-5">
            {pageError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">{pageError}</p> : null}
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-canvas p-1" aria-label="Account type">
              {[["USER", "Join as User"], ["CREATOR", "Join as Creator"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setRole(value)} aria-pressed={role === value} className={`rounded-lg py-2.5 text-[13.5px] font-bold transition-all ${role === value ? "bg-white text-brand-700 shadow-sm" : "text-muted hover:text-ink"}`}>
                  {label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="register-handle" className="mb-1.5 block text-[13px] font-semibold text-ink/80">Choose your handle</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[14px] font-semibold text-muted">@</span>
                <input
                  id="register-handle"
                  value={handle}
                  onChange={(event) => {
                    const nextHandle = event.target.value.replace(/^@+/, "").toLowerCase();
                    setHandle(nextHandle);
                    if (!nextHandle) {
                      setAvailability("idle");
                      setMessage("");
                    } else if (!HANDLE_PATTERN.test(nextHandle)) {
                      setAvailability("invalid");
                      setMessage("Use 3–30 letters, numbers, or underscores");
                    } else {
                      setAvailability("checking");
                      setMessage("Checking availability");
                    }
                  }}
                  maxLength={30}
                  autoComplete="username"
                  spellCheck="false"
                  placeholder="your_handle"
                  className="h-12 w-full rounded-xl border border-line bg-canvas pl-8 pr-11 text-[14px] outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white"
                />
                {availability === "checking" ? <Loader2 aria-label="Checking handle" size={18} className="absolute right-4 animate-spin text-muted" /> : null}
                {availability === "available" ? <CheckCircle2 aria-label="Handle available" size={19} className="absolute right-4 text-emerald-600" /> : null}
                {["unavailable", "invalid", "error"].includes(availability) ? <XCircle aria-label="Handle unavailable" size={19} className="absolute right-4 text-rose-600" /> : null}
              </div>
              <p aria-live="polite" className={`mt-2 min-h-5 text-[12.5px] font-semibold ${availability === "available" ? "text-emerald-700" : ["unavailable", "invalid", "error"].includes(availability) ? "text-rose-700" : "text-muted"}`}>{message}</p>
            </div>

            {availability === "available" ? (
              <a href={googleHref} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white text-[14.5px] font-bold text-ink shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
                <GoogleMark /> Continue with Google
              </a>
            ) : (
              <div aria-disabled="true" className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-line bg-canvas text-[14.5px] font-bold text-muted opacity-70">
                <GoogleMark /> Continue with Google
              </div>
            )}
            <p className="text-center text-[12px] leading-relaxed text-muted">Google provides your verified name and email. Your selected handle and account type are saved after sign-in.</p>
          </div>
        </main>

        <p className="text-center text-[12px] text-muted">© {new Date().getFullYear()} Blindly. All rights reserved</p>
      </div>

      <aside className="relative hidden w-[45%] overflow-hidden lg:block" aria-label="About Blindly">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6b3fef] via-[#8b5cf6] to-[#e05fd6]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <Sparkles size={48} className="fill-white/30 text-white/60" />
          <h2 className="mt-6 text-[36px] font-extrabold leading-tight tracking-tight">Connect directly<br />support authentically</h2>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-white/75">A direct-to-fan platform built for genuine creator and community relationships</p>
        </div>
      </aside>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32} /></div>}><RegisterForm /></Suspense>;
}
