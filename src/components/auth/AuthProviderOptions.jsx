"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { safeRedirectPath } from "@/lib/safe-redirect";

export default function AuthProviderOptions({ role, redirect, dark = false, standalone = false, onProviderStatus }) {
  const [providers, setProviders] = useState({ google: false, passwordReset: false });
  const [loaded, setLoaded] = useState(false);
  const fallback = role === "CREATOR" ? "/studio/content" : "/";
  const safeRedirect = safeRedirectPath(redirect, fallback);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("provider status failed")))
      .then((data) => {
        if (!active) return;
        const nextProviders = { google: data.google === true, passwordReset: data.passwordReset === true };
        setProviders(nextProviders);
        onProviderStatus?.(nextProviders.google);
      })
      .catch(() => { if (active) onProviderStatus?.(false); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [onProviderStatus]);

  const buttonClass = `flex h-12 w-full items-center justify-center rounded-xl border text-[14px] font-bold transition ${dark ? "border-white/15 bg-white/5 text-white" : "border-line bg-white text-ink"}`;
  const googleHref = `/api/auth/google/start?role=${role}&redirect=${encodeURIComponent(safeRedirect)}`;

  return (
    <div className="mt-5 space-y-3">
      {!standalone ? <div className={`flex items-center gap-3 text-[12px] ${dark ? "text-neutral-500" : "text-muted"}`}>
        <span className={`h-px flex-1 ${dark ? "bg-white/10" : "bg-line"}`} />or<span className={`h-px flex-1 ${dark ? "bg-white/10" : "bg-line"}`} />
      </div> : null}
      {providers.google ? (
        <Link className={buttonClass} href={googleHref}>Continue with Google</Link>
      ) : (
        <button className={`${buttonClass} cursor-not-allowed opacity-55`} type="button" disabled>
          Continue with Google
        </button>
      )}
      <div className="text-center text-[12.5px]">
        {providers.passwordReset ? (
          <Link className="font-bold text-brand-500 hover:underline" href="/forgot-password">Forgot password</Link>
        ) : loaded ? (
          <span className={dark ? "text-neutral-500" : "text-muted"}>Password recovery is not configured yet</span>
        ) : (
          <span className={dark ? "text-neutral-500" : "text-muted"}>Checking sign-in options</span>
        )}
      </div>
    </div>
  );
}
