"use client";

import { LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AsyncState } from "@/components/consumer/AsyncState";
import { ProfileEditor } from "@/components/consumer/ProfileEditor";
import { getProfile, updateProfile } from "@/services/consumer-api";

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("profile");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [savingPrivacy, setSavingPrivacy] = useState(false);
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

  async function saveVisibility(event) {
    const profileVisibility = event.target.value;
    setSavingPrivacy(true);
    setError("");
    try {
      const saved = await updateProfile({ profileVisibility });
      setProfile(saved);
      window.dispatchEvent(new CustomEvent("user-update", { detail: saved }));
    } catch (saveError) {
      setError(saveError?.message || "Unable to save privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  }

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
    return <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6"><AsyncState status={status} error={error} onRetry={loadProfile} emptyTitle="Settings unavailable" emptyMessage="Try again in a moment" /></main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <header><h1 className="flex items-center gap-2 text-3xl font-black"><Settings className="text-brand-600" size={25} />Settings</h1><p className="mt-1 text-sm text-muted">Manage the details you share on Blindly</p></header>
      <div className="mt-6 grid gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 md:block md:space-y-1" aria-label="Settings sections">
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={UserRound}>Profile</TabButton>
          <TabButton active={tab === "privacy"} onClick={() => setTab("privacy")} icon={ShieldCheck}>Privacy</TabButton>
          <button type="button" onClick={signOut} disabled={signingOut} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60 md:flex md:w-full"><LogOut size={16} />{signingOut ? "Signing out" : "Sign out"}</button>
        </nav>
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
          {tab === "profile" ? <ProfileEditor profile={profile} onSaved={setProfile} /> : null}
          {tab === "privacy" ? <PrivacySettings profile={profile} saving={savingPrivacy} onChange={saveVisibility} /> : null}
          {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 md:flex md:w-full ${active ? "bg-brand-50 text-brand-700" : "hover:bg-canvas"}`}><Icon size={16} />{children}</button>;
}

function PrivacySettings({ profile, saving, onChange }) {
  return (
    <fieldset disabled={saving}>
      <legend className="text-lg font-extrabold">Profile visibility</legend>
      <p className="mt-1 text-sm text-muted">Choose who can see your public profile details</p>
      <div className="mt-5 space-y-3">
        {[{ value: "PUBLIC", title: "Public", description: "Anyone can view your profile" }, { value: "FOLLOWERS", title: "Followers", description: "Only people who follow you can view your profile" }].map((option) => (
          <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
            <input type="radio" name="settings-visibility" value={option.value} checked={profile.profileVisibility === option.value} onChange={onChange} className="mt-1" />
            <span><span className="block text-sm font-bold">{option.title}</span><span className="mt-1 block text-sm text-muted">{option.description}</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
