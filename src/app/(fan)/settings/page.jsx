"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { ProfileEditor } from "@/components/consumer/ProfileEditor";
import { getProfile } from "@/services/consumer-api";

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function loadProfile() {
    setStatus("loading");
    setError("");
    try {
      setProfile(await getProfile());
      setStatus("success");
    } catch (loadError) {
      setError(loadError?.message || "Unable to load settings");
      setStatus("error");
    }
  }

  useEffect(() => {
    queueMicrotask(loadProfile);
  }, []);

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Unable to sign out");
      window.location.assign("/login");
    } catch (signOutError) {
      setError(signOutError?.message || "Unable to sign out");
      setSigningOut(false);
    }
  }

  if (status !== "success" || !profile) {
    return <main className="mx-auto min-w-0 w-full max-w-4xl overflow-x-hidden px-3 py-6 sm:px-6"><AsyncState status={status} error={error} onRetry={loadProfile} emptyTitle="Settings unavailable" emptyMessage="Try again in a moment" /></main>;
  }

  return (
    <main className="mx-auto min-w-0 w-full max-w-4xl overflow-x-hidden px-3 py-6 sm:px-6 lg:py-8">
      <header><h1 className="flex items-center gap-2 text-3xl font-black"><Settings className="text-brand-600" size={25} />Settings</h1><p className="mt-1 text-sm text-muted">Manage the details you share on Blindly</p></header>
      <div className="mt-6 grid gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="flex min-w-0 max-w-full gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 md:block md:space-y-1 md:overflow-visible" aria-label="Settings sections">
          <div className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-50 px-3 text-sm font-bold text-brand-700 md:flex md:w-full" aria-current="page"><UserRound size={16} />Profile</div>
          <button type="button" onClick={signOut} disabled={signingOut} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60 md:flex md:w-full"><LogOut size={16} />{signingOut ? "Signing out" : "Sign out"}</button>
        </nav>
        <section className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          <ProfileEditor profile={profile} onSaved={setProfile} />
          {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}
